import { getTests } from "../shared-modules/api.js";

const tests = await getTests();

const validTests = tests.filter(test => !isExpired(test.date));

const container = document.getElementById("tests");
const info = document.getElementById("info");

if (validTests.length === 0) {
    info.textContent = "No tests!";
} else {
    info.remove();

    for (const test of validTests) {
        const testItem = document.createElement("div");
        testItem.className = "test-item";

        const date = document.createElement("div");
        date.className = "test-date";
        date.textContent = test.date;

        const subject = document.createElement("div");
        subject.className = "test-subject";
        subject.textContent = test.subject;

        const description = document.createElement("div");
        description.className = "test-description";
        description.textContent = test.description;

        testItem.appendChild(date);
        testItem.appendChild(subject);
        testItem.appendChild(description);

        container.appendChild(testItem);
    }
}


function parseCzechDate(dateStr) {
    const [day, month, year] = dateStr.split(".");

    return new Date(year, month - 1, day);
}


function isExpired(dateStr) {
    const date = parseCzechDate(dateStr);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return date < today;
}