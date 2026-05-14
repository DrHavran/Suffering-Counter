const endOfYearDate = new Date("2026-06-27T00:00:00").getTime();
const endOfSchoolDate = new Date("2028-07-01T00:00:00").getTime();

const weeklySchedule = {
    Angličtina: { wednesday: 2, thursday: 2 },
    Čeština: { thursday: 1, friday: 1 },
    Fyzika: { thursday: 1, friday: 1 },
    Hardware: { wednesday: 2 },
    Seminář: { tuesday: 2 },
    Matika: { wednesday: 2, thursday: 2 },
    Manažerské: { monday: 1 },
    Sítě: { tuesday: 2 },
    OPS: { tuesday: 2 },
    Občanka: { thursday: 1 },
    Praktické: { monday: 2 },
    Programování: { friday: 2 },
    Tělocvik: { tuesday: 2 },
    Weby: { monday: 2 },
    Video: { monday: 3 }
};

const specialPeriods = [
    ["2026-05-18", "2026-05-22"], // kozárky
    ["2026-06-08", "2026-06-12"], // praxe
    ["2026-06-15", "2026-06-19"], // praxe
    ["2026-06-22", "2026-06-26"], // last week
];

const daysNotInSchool = [];

updateTimers();
setInterval(updateTimers, 1000);

let seminarOnTuesday = true;

function switchDays() {
    if (seminarOnTuesday) {
        delete weeklySchedule["Seminář"].tuesday;
        weeklySchedule["Seminář"].friday = 2;
        document.getElementById("current").textContent = "Currently: Pátek";
    } else {
        delete weeklySchedule["Seminář"].friday;
        weeklySchedule["Seminář"].tuesday = 2;
        document.getElementById("current").textContent = "Currently: Úterý";
    }
    seminarOnTuesday = !seminarOnTuesday;
    updateTimers();
}

function formatTimeRemaining(ms) {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const seconds = Math.floor((ms / 1000) % 60);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function countDays(start, end, excludePredicate) {
    const days = [];
    let d = new Date(start);
    while (d < end) {
        const day = d.getDay();
        if (day !== 0 && day !== 6 && !excludePredicate(d)) {
            days.push(new Date(d));
        }
        d.setDate(d.getDate() + 1);
    }
    return days;
}

function updateTimers() {
    const now = new Date();

    // time till end of the year
    document.getElementById("timer").textContent = formatTimeRemaining(endOfYearDate - now);

    // time till čtvrťák
    document.getElementById("timerLong").textContent = formatTimeRemaining(endOfSchoolDate - now);

    const daysInSchool = countDays(now, new Date(endOfYearDate), isSpecialDay);
    document.getElementById("daysInSchool").innerHTML = `<b>${daysInSchool.length}</b> days in school left`;

    const totalDays = countDays(now, new Date(endOfYearDate), isTotal);
    document.getElementById("totalDays").innerHTML = `<b>${totalDays.length}</b> total days left`;

    let totalHours = 0;
    for (const subject in weeklySchedule) {
        let total = 0;
        for (const day of daysInSchool) {
            const dayName = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][day.getDay()];
            if (weeklySchedule[subject][dayName]) {
                total += weeklySchedule[subject][dayName];
            }
        }
        totalHours += total;
        document.getElementById(subject).innerHTML = `${total} hodin`;
    }
    document.getElementById("hours").innerHTML = `<b>${totalHours}</b> school hours left`;
}

function isDateInRanges(date, ranges) {
    const iso = date.toISOString().split("T")[0];
    return ranges.some(([start, end]) => iso >= start && iso <= end);
}

function isSpecialDay(date) {
    return isDateInRanges(date, specialPeriods) || isDateInRanges(date, daysNotInSchool);
}

function isTotal(date) {
    return isDateInRanges(date, daysNotInSchool);
}