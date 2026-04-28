const targetDate = new Date("2026-06-27T00:00:00").getTime();

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
    ["2026-04-06", "2026-04-06"], //velikonoce
    ["2026-05-01", "2026-05-01"], //svátek
    ["2026-05-08", "2026-05-08"], //svátek
    ["2026-05-05", "2026-05-05"], //čistička
    ["2026-05-18", "2026-05-22"], //kozárky
    ["2026-06-08", "2026-06-12"], //praxe
    ["2026-06-15", "2026-06-19"]  //praxe
];

updateTimers();
setInterval(updateTimers, 1000);

let seminarOnTuesday = true
function switchDays(){
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

function updateTimers() {
    const now = new Date();
    const diff = targetDate - now;

    const days = Math.floor(diff / (1000*60*60*24));
    const hours = Math.floor((diff / (1000*60*60)) % 24);
    const minutes = Math.floor((diff / (1000*60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    document.getElementById("timer").textContent =
        `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const workingDays = countWorkingDays(now, new Date(targetDate));
    document.getElementById("school").innerHTML =
        `<b>${workingDays.length}</b> school days left`;

    let totalHours = 0
    for (const subject in weeklySchedule) {
        let total = 0;
        for (const day of workingDays) {
            const dayName = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][day.getDay()];
            if (weeklySchedule[subject][dayName]) {
                total += weeklySchedule[subject][dayName];
            }
        }
        totalHours += total
        document.getElementById(subject).innerHTML = `${total} hodin`;
    }
    document.getElementById("hours").innerHTML = `<b>${totalHours}</b> school hours left`;
}

function isSpecialDay(date) {
    const iso = date.toISOString().split("T")[0];
    return specialPeriods.some(([start, end]) => iso >= start && iso <= end);
}

function countWorkingDays(start, end) {
    const days = [];
    let d = new Date(start);
    while (d < end) {
        const day = d.getDay();
        if (day !== 0 && day !== 6 && !isSpecialDay(d)) {
            days.push(new Date(d));
        }
        d.setDate(d.getDate() + 1);
    }
    return days;
}