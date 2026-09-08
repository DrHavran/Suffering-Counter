import { getData } from "../shared-modules/api.js";
import { dayMapping, subjectMapping, subjectBeMapping } from "../shared-modules/config.js";


const [dates, fullSchedule] = await Promise.all([
    getData("dates.json"),
    getData("schedule.json")
]);


// ---------- DATE ----------

const currentTime = new Date();


// ---------- DAY ----------

const dayIndex = currentTime.getDay();
const dayName = dayMapping[dayIndex];
const schedule = fullSchedule[dayName];

document.getElementById("today").textContent =
    "Dneska je " + dayName.toLowerCase();


// ---------- ELEMENTS ----------

const diagram =
    document.getElementById("diagram");

const currentClassElement =
    document.getElementById("currentClass");

const timerElement =
    document.getElementById("timer");

const schoolEndTimer =
    document.getElementById("school-end-timer");

const dayPercentage =
    document.getElementById("day-percentage");


// ---------- SCHOOL DAY CHECK ----------

function isSchoolDay(date) {
    const dateStr = date.toLocaleDateString("en-CA");

    // Outside school year?
    if (dateStr < dates.startOfYear || dateStr > dates.endOfYear) return false;

    // Weekend?
    const day = date.getDay();
    if (day === 0 || day === 6) return false;

    // Days off (range check)
    for (const off of dates.daysOff) {
        if (dateStr >= off.start && dateStr <= off.end) return false;
    }

    // School events (range check)
    for (const off of dates.schoolEvents) {
        if (dateStr >= off.start && dateStr <= off.end) return false;
    }

    // Public holidays (exact match)
    for (const holiday of dates.publicHolidays) {
        if (dateStr === holiday.date) return false;
    }

    return true;
}

const schoolDay = isSchoolDay(currentTime);


// ---------- NOT A SCHOOL DAY ----------

if (!schoolDay) {

    currentClassElement.textContent = "Mimo školu";

    timerElement.textContent = "";

    diagram.style.display = "none";

    schoolEndTimer.style.display = "none";

    dayPercentage.style.display = "none";

    // Hide the moving indicator if it exists
    const indicator = document.getElementById("timeIndicator");
    if (indicator) indicator.style.display = "none";

} else {

    // ---------- CREATE SCHEDULE ----------

    diagram.style.gridTemplateColumns =
        `repeat(${schedule.length}, minmax(0, 1fr))`;


    for (const lesson of schedule) {

        const section =
            document.createElement("div");

        section.className =
            "subject-block";

        section.dataset.subject =
            lesson.subject;

        section.dataset.start =
            lesson.start;

        section.dataset.end =
            lesson.end;

        section.textContent =
            subjectMapping[lesson.subject];

        diagram.appendChild(section);
    }


    // ---------- UPDATE ----------

    function update() {

        const currentClass =
            getActiveClass(
                schedule,
                currentTime
            );


        if (!currentClass) {

            currentClassElement.textContent =
                "Mimo školu";

            timerElement.textContent = "";

            document.getElementById("timeIndicator")
                .style.display = "none";

        } else {

            const verb = subjectBeMapping[currentClass.subject] | "Je";
            currentClassElement.textContent = verb + " " + currentClass.subject.toLowerCase();


            updateTimer(
                currentClass,
                currentTime
            );


            updateProgressBar(
                currentClass,
                currentTime
            );
        }


        updateSchoolEndTimer(
            schedule,
            currentTime
        );


        updateDayPercentage(
            schedule,
            currentTime
        );
    }


    // ---------- FIND CURRENT CLASS ----------

    function getActiveClass(schedule, now) {

        const currentMinutes =
            now.getHours() * 60 +
            now.getMinutes();


        let lastEnd = null;


        for (const lesson of schedule) {

            const start =
                toMinutes(lesson.start);

            const end =
                toMinutes(lesson.end);


            // Before this lesson = break
            if (currentMinutes < start) {

                if (lastEnd !== null) {

                    return {
                        subject: "Přestávka",
                        start: lastEnd,
                        end: lesson.start
                    };
                }

                return null;
            }


            // Currently inside this lesson
            if (
                currentMinutes >= start &&
                currentMinutes < end
            ) {
                return lesson;
            }


            lastEnd = lesson.end;
        }


        return null;
    }


    // ---------- CURRENT LESSON TIMER ----------

    function updateTimer(currentClass, now) {

        const [hours, minutes] =
            currentClass.end
                .split(":")
                .map(Number);


        const end =
            new Date(now);


        end.setHours(
            hours,
            minutes,
            0,
            0
        );


        const remaining =
            end.getTime() -
            now.getTime();


        timerElement.textContent =
            formatLessonTime(remaining);
    }


    // ---------- SCHOOL END TIMER ----------

    function updateSchoolEndTimer(
        schedule,
        now
    ) {

        const lastLesson =
            schedule[schedule.length - 1];


        const [hours, minutes] =
            lastLesson.end
                .split(":")
                .map(Number);


        const schoolEnd =
            new Date(now);


        schoolEnd.setHours(
            hours,
            minutes,
            0,
            0
        );


        const remaining =
            schoolEnd.getTime() -
            now.getTime();


        if (remaining <= 0) {

            schoolEndTimer.textContent =
                "Škola skončila";

            return;
        }


        schoolEndTimer.textContent =
            "Do konce školy: " +
            formatSchoolTime(remaining);
    }


    // ---------- DAY PERCENTAGE ----------

    function updateDayPercentage(
        schedule,
        now
    ) {

        const firstLesson =
            schedule[0];

        const lastLesson =
            schedule[schedule.length - 1];


        const start =
            toMinutes(firstLesson.start);

        const end =
            toMinutes(lastLesson.end);


        const current =
            now.getHours() * 60 +
            now.getMinutes() +
            now.getSeconds() / 60;


        const total =
            end - start;


        const elapsed =
            Math.min(
                Math.max(
                    current - start,
                    0
                ),
                total
            );


        const percentage =
            (elapsed / total) * 100;


        dayPercentage.textContent =
            `${percentage.toFixed(2)} %`;
    }


    // ---------- PROGRESS LINE ----------

    function updateProgressBar(
        currentClass,
        now
    ) {

        const indicator =
            document.getElementById(
                "timeIndicator"
            );


        const blocks =
            document.querySelectorAll(
                ".subject-block"
            );


        let targetBlock = null;


        // ---------- BREAK ----------

        if (
            currentClass.subject ===
            "Přestávka"
        ) {

            for (const block of blocks) {

                if (
                    block.dataset.start ===
                    currentClass.end
                ) {

                    targetBlock = block;

                    break;
                }
            }


            if (!targetBlock) {

                indicator.style.display =
                    "none";

                return;
            }


            indicator.style.display =
                "block";


            const diagramRect =
                diagram.getBoundingClientRect();


            const blockRect =
                targetBlock.getBoundingClientRect();


            const left =
                blockRect.left -
                diagramRect.left;


            indicator.style.left =
                `${left}px`;


            return;
        }


        // ---------- LESSON ----------

        for (const block of blocks) {

            if (
                block.dataset.subject ===
                    currentClass.subject &&

                block.dataset.start ===
                    currentClass.start &&

                block.dataset.end ===
                    currentClass.end
            ) {

                targetBlock = block;

                break;
            }
        }


        if (!targetBlock) {

            indicator.style.display =
                "none";

            return;
        }


        indicator.style.display =
            "block";


        const diagramRect =
            diagram.getBoundingClientRect();


        const blockRect =
            targetBlock.getBoundingClientRect();


        const start =
            toMinutes(currentClass.start);

        const end =
            toMinutes(currentClass.end);


        const current =
            now.getHours() * 60 +
            now.getMinutes() +
            now.getSeconds() / 60;


        const total =
            end -
            start;


        const elapsed =
            Math.min(
                Math.max(
                    current - start,
                    0
                ),
                total
            );


        const percent =
            elapsed /
            total;


        const left =
            blockRect.left -
            diagramRect.left +
            blockRect.width *
            percent;


        indicator.style.left =
            `${left}px`;
    }


    // ---------- TIME HELPERS ----------

    function toMinutes(time) {

        const [hours, minutes] =
            time.split(":").map(Number);

        return hours * 60 + minutes;
    }


    // ---------- LESSON TIME FORMAT ----------

    function formatLessonTime(ms) {

        if (ms <= 0) {
            return "0m 0s";
        }


        const minutes =
            Math.floor(
                ms / 60000
            );


        const seconds =
            Math.floor(
                (ms % 60000) / 1000
            );


        return `${minutes}m ${seconds}s`;
    }


    // ---------- SCHOOL TIME FORMAT ----------

    function formatSchoolTime(ms) {

        if (ms <= 0) {
            return "0h 0m 0s";
        }


        const hours =
            Math.floor(
                ms / 3600000
            );


        const minutes =
            Math.floor(
                (ms % 3600000) / 60000
            );


        const seconds =
            Math.floor(
                (ms % 60000) / 1000
            );


        return `${hours}h ${minutes}m ${seconds}s`;
    }


    // ---------- START ----------

    update();


    // Update every second using the real current time.

    setInterval(() => {

        const currentTime = new Date();

        updateWithCurrentTime(currentTime);

    }, 1000);


    function updateWithCurrentTime(now) {

        const currentClass =
            getActiveClass(
                schedule,
                now
            );


        if (!currentClass) {

            currentClassElement.textContent =
                "Mimo školu";

            timerElement.textContent = "";

            document.getElementById("timeIndicator")
                .style.display = "none";

        } else {

            const verb = subjectBeMapping[currentClass.subject] | "Je";
            currentClassElement.textContent = verb + " " + currentClass.subject.toLowerCase();


            updateTimer(
                currentClass,
                now
            );


            updateProgressBar(
                currentClass,
                now
            );
        }


        updateSchoolEndTimer(
            schedule,
            now
        );


        updateDayPercentage(
            schedule,
            now
        );
    }
}