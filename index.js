import { dayMapping } from "./shared-modules/config.js";
import { getData } from "./shared-modules/api.js";

const [dates, schedule] = await Promise.all([
    getData("dates.json"),
    getData("schedule.json")
]);

const schoolEvents = dates.schoolEvents;
const daysOff = dates.daysOff;
const publicHolidays = dates.publicHolidays;

initialize();

function initialize() {
    updatePage();
    setInterval(updatePage, 1000);
}


/* ---------- PAGE UPDATE ---------- */

function updatePage() {
    const now = new Date();

    updateCountdowns(now);
    updateSchoolSummary(now);
    updateSubjectHours(now);
}


/* ---------- COUNTDOWNS ---------- */

function updateCountdowns(now) {
    const startOfYear = new Date(dates.startOfYear);
    const endOfYear = new Date(dates.endOfYear);

    const startOfSchool = new Date(dates.startOfSchool);
    const endOfSchool = new Date(dates.endOfSchool);

    document.getElementById("year-countdown").textContent =
        formatTimeRemaining(endOfYear - now);

    document.getElementById("school-countdown").textContent =
        formatTimeRemaining(endOfSchool - now);

    document.getElementById("year-progress").textContent =
        `${calculateProgress(startOfYear, endOfYear, now)}%`;

    document.getElementById("school-progress").textContent =
        `${calculateProgress(startOfSchool, endOfSchool, now)}%`;
}

function formatTimeRemaining(milliseconds) {
    const days = Math.floor(
        milliseconds / (1000 * 60 * 60 * 24)
    );

    const hours = Math.floor(
        (milliseconds / (1000 * 60 * 60)) % 24
    );

    const minutes = Math.floor(
        (milliseconds / (1000 * 60)) % 60
    );

    const seconds = Math.floor(
        (milliseconds / 1000) % 60
    );

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function calculateProgress(start, end, now) {
    const total = end - start;
    const elapsed = now - start;

    const progress = (elapsed / total) * 100;

    return Math.min(
        100,
        Math.max(0, progress)
    ).toFixed(2);
}


/* ---------- SCHOOL SUMMARY ---------- */

function updateSchoolSummary(now) {
    const endOfYear = new Date(dates.endOfYear);

    const schoolDays = getSchoolDays(
        now,
        endOfYear,
        isSpecialDay
    );

    const totalDays = getSchoolDays(
        now,
        endOfYear,
        isTotal
    );

    document.getElementById("school-days").innerHTML =
        `<b>${schoolDays.length}</b> days in school left`;

    document.getElementById("total-days").innerHTML =
        `<b>${totalDays.length}</b> total days left`;
}


/* ---------- SUBJECT HOURS ---------- */

function updateSubjectHours(now) {
    const endOfYear = new Date(dates.endOfYear);

    const schoolDays = getSchoolDays(
        now,
        endOfYear,
        isSpecialDay
    );

    const subjectContainer =
        document.getElementById("subject-hours");

    subjectContainer.innerHTML = "";

    const subjects = getSubjects();

    let totalHours = 0;

    for (const subject of subjects) {
        const hours = countSubjectLessons(
            subject,
            schoolDays
        );

        totalHours += hours;

        const subjectBox = createSubjectBox(
            subject,
            hours
        );

        subjectContainer.appendChild(subjectBox);
    }

    document.getElementById("school-hours").innerHTML =
        `<b>${totalHours}</b> school hours left`;
}


/* ---------- SUBJECTS ---------- */

function getSubjects() {
    const subjects = new Set();

    for (const day in schedule) {
        for (const lesson of schedule[day]) {
            subjects.add(lesson.subject);
        }
    }

    return [...subjects];
}


/* ---------- LESSON COUNTING ---------- */

function countSubjectLessons(subject, schoolDays) {
    let total = 0;

    for (const date of schoolDays) {
        const dayName = dayMapping[date.getDay()];
        const lessons = schedule[dayName] ?? [];

        for (const lesson of lessons) {
            if (lesson.subject === subject) {
                total++;
            }
        }
    }

    return total;
}


/* ---------- SUBJECT BOX ---------- */

function createSubjectBox(subject, hours) {
    const box = document.createElement("div");
    box.className = "subject-card";

    const name = document.createElement("span");
    name.className = "subject-name";
    name.textContent = subject;

    const hourText = document.createElement("span");
    hourText.className = "subject-hours";
    hourText.textContent = `${hours} hodin`;

    box.appendChild(name);
    box.appendChild(hourText);

    return box;
}


/* ---------- SCHOOL DAYS ---------- */

function getSchoolDays(start, end, excludePredicate) {
    const days = [];
    const date = new Date(start);

    while (date < end) {
        const day = date.getDay();

        const isWeekend =
            day === 0 || day === 6;

        if (
            !isWeekend &&
            !excludePredicate(date)
        ) {
            days.push(new Date(date));
        }

        date.setDate(date.getDate() + 1);
    }

    return days;
}


/* ---------- DATE RANGES ---------- */

function isDateInRanges(date, ranges) {
    const localDate =
        date.toLocaleDateString("en-CA");

    return ranges.some(
        ([start, end]) =>
            localDate >= start &&
            localDate <= end
    );
}

function isPublicHoliday(date) {
    const localDate =
        date.toLocaleDateString("en-CA");

    return publicHolidays.some(
        holiday => holiday.date === localDate
    );
}

function isSpecialDay(date) {
    return (
        isDateInRanges(date, schoolEvents) ||
        isDateInRanges(date, daysOff) ||
        isPublicHoliday(date)
    );
}

function isTotal(date) {
    return (
        isDateInRanges(date, daysOff) ||
        isPublicHoliday(date)
    );
}