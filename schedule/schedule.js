import { dayMapping } from "../shared-modules/config.js";
import { getData } from "../shared-modules/api.js";

const [dates, schedule] = await Promise.all([
    getData("dates.json"),
    getData("schedule.json")
]);

const schoolEvents = dates.schoolEvents;
const daysOff = dates.daysOff;
const publicHolidays = dates.publicHolidays;

initialize();

function initialize() {
    renderSchedule();
    scheduleMidnightRefresh();
}


/* ---------- MAIN RENDER ---------- */

function renderSchedule() {
    const container = document.getElementById("schedule");
    container.innerHTML = "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const week = getCurrentWeek(today);

    for (const date of week) {
        container.appendChild(createDayCard(date, today));
    }
}


/* ---------- WEEK ---------- */

function getCurrentWeek(reference) {
    const day = reference.getDay();

    // Sunday (0) → back to previous Monday; otherwise back to this Monday
    const offset = day === 0 ? -6 : 1 - day;

    const monday = new Date(reference);
    monday.setDate(reference.getDate() + offset);

    const days = [];

    for (let i = 0; i < 5; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        days.push(d);
    }

    return days;
}


/* ---------- DAY CARD ---------- */

function createDayCard(date, today) {
    const card = document.createElement("div");
    card.className = "day-card";

    if (date.getTime() === today.getTime()) {
        card.classList.add("today");
    }

    const dayName = dayMapping[date.getDay()];

    const title = document.createElement("h2");
    title.className = "day-name";
    title.textContent = dayName;

    const dateLabel = document.createElement("div");
    dateLabel.className = "day-date";
    dateLabel.textContent = formatDate(date);

    card.appendChild(title);
    card.appendChild(dateLabel);

    const special = getSpecialDay(date);

    if (special) {
        card.classList.add("special");

        const box = document.createElement("div");
        box.className = "special-name";
        box.textContent = special;

        card.appendChild(box);

        return card;
    }

    const lessons = schedule[dayName] ?? [];

    const list = document.createElement("div");
    list.className = "lessons";

    for (const lesson of lessons) {
        list.appendChild(createLessonBlock(lesson));
    }

    card.appendChild(list);

    return card;
}


/* ---------- LESSON BLOCK ---------- */

function createLessonBlock(lesson) {
    const block = document.createElement("div");
    block.className = "subject-block";
    block.dataset.subject = lesson.subject;

    const time = document.createElement("span");
    time.className = "lesson-time";
    time.textContent = `${lesson.start} – ${lesson.end}`;

    const subject = document.createElement("span");
    subject.className = "lesson-subject";
    subject.textContent = lesson.subject;

    block.appendChild(time);
    block.appendChild(subject);

    return block;
}


/* ---------- SPECIAL DAYS ---------- */

function getSpecialDay(date) {
    const local = date.toLocaleDateString("en-CA");

    for (const event of schoolEvents) {
        if (local >= event.start && local <= event.end) {
            return event.name;
        }
    }

    for (const day of daysOff) {
        if (local >= day.start && local <= day.end) {
            return day.name;
        }
    }

    for (const holiday of publicHolidays) {
        if (holiday.date === local) {
            return holiday.name;
        }
    }

    return null;
}


/* ---------- FORMATTING ---------- */

function formatDate(date) {
    return date.toLocaleDateString("cs-CZ", {
        day: "numeric",
        month: "numeric",
        year: "numeric"
    });
}


/* ---------- MIDNIGHT REFRESH ---------- */

function scheduleMidnightRefresh() {
    const now = new Date();

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 1, 0);

    setTimeout(() => {
        renderSchedule();
        scheduleMidnightRefresh();
    }, tomorrow - now);
}