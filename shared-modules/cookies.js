import { dayMapping } from "./config.js";

const COOKIE_NAME = "noSeminarDay";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

// Days that actually contain a seminar lesson in schedule.json
// Pondělí (1), Úterý (2), Čtvrtek (4)
const SEMINAR_DAY_INDICES = [1, 2, 4];

// Default: Pondělí is the missing seminar (2/3 seminars → 1 missing).
// Matches the old hardcoded `Seminář #1` exclusion.
const DEFAULT_NO_SEMINAR_DAY = 1;


/* ---------- COOKIE HELPERS ---------- */

export function getNoSeminarDay() {
    const match = document.cookie.match(
        new RegExp("(?:^|; )" + COOKIE_NAME + "=([^;]*)")
    );

    if (!match) return DEFAULT_NO_SEMINAR_DAY;

    const value = Number(decodeURIComponent(match[1]));

    return SEMINAR_DAY_INDICES.includes(value)
        ? value
        : DEFAULT_NO_SEMINAR_DAY;
}


export function setNoSeminarDay(dayIndex) {
    document.cookie =
        `${COOKIE_NAME}=${dayIndex}; ` +
        `max-age=${COOKIE_MAX_AGE}; path=/`;
}


// A given weekday still has its seminar unless it's the single excluded day.
export function hasSeminar(dayIndex) {
    return dayIndex !== getNoSeminarDay();
}


/* ---------- FILTERING ---------- */

// Removes seminar lessons from one day if it's the selected "no seminar" day.
export function filterScheduleForDay(lessons, dayIndex) {
    if (!lessons) return lessons;
    if (hasSeminar(dayIndex)) return lessons;

    return lessons.filter(lesson => !lesson.subject.startsWith("Seminář"));
}


// Applies filterScheduleForDay to every day in the schedule object.
export function filterFullSchedule(fullSchedule) {
    const result = {};

    const nameToIndex = {};
    for (const [key, name] of Object.entries(dayMapping)) {
        nameToIndex[name] = Number(key);
    }

    for (const dayName in fullSchedule) {
        const idx = nameToIndex[dayName];
        result[dayName] = idx !== undefined
            ? filterScheduleForDay(fullSchedule[dayName], idx)
            : fullSchedule[dayName];
    }

    return result;
}


/* ---------- BUTTON UI ---------- */

export function setupSeminarFilterButton() {
    const tryInject = () => {
        const footer = document.getElementById("footer");
        if (!footer || !footer.children.length) return;
        if (footer.querySelector(".seminar-filter")) return;

        injectButton(footer);
    };

    document.addEventListener("footerLoaded", tryInject);
    tryInject(); // in case footer was already loaded
}


function injectButton(footer) {
    footer.style.position = "relative";
    footer.classList.add("has-seminar-filter");

    const wrapper = document.createElement("div");
    wrapper.className = "seminar-filter";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "seminar-filter-toggle";
    button.textContent = "Kdy nemáš seminář ▾";

    const dropdown = document.createElement("div");
    dropdown.className = "seminar-filter-dropdown";
    dropdown.style.display = "none";

    const current = getNoSeminarDay();
    let reloadTimer = null;

    for (const idx of SEMINAR_DAY_INDICES) {
        const label = document.createElement("label");
        label.className = "seminar-filter-option";

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "noSeminarDay";
        radio.value = idx;
        radio.checked = current === idx;

        radio.addEventListener("change", () => {
            setNoSeminarDay(idx);

            // Debounced reload so the change applies everywhere at once.
            clearTimeout(reloadTimer);
            reloadTimer = setTimeout(() => location.reload(), 500);
        });

        const text = document.createElement("span");
        text.textContent = dayMapping[idx];

        label.appendChild(radio);
        label.appendChild(text);
        dropdown.appendChild(label);
    }

    button.addEventListener("click", (event) => {
        event.stopPropagation();
        dropdown.style.display =
            dropdown.style.display === "none" ? "flex" : "none";
    });

    document.addEventListener("click", (event) => {
        if (!wrapper.contains(event.target)) {
            dropdown.style.display = "none";
        }
    });

    wrapper.appendChild(button);
    wrapper.appendChild(dropdown);
    footer.appendChild(wrapper);
}