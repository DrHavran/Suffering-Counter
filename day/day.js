fetch('https://raw.githubusercontent.com/DrHavran/Suffering-Counter/refs/heads/Day-Progression/schedule.json')
  .then(res => res.json())
  .then(data => {
    const dayIndex = new Date().getDay();
    const dayName = data.dayMapping[dayIndex];
    const schedule = data[dayName];
    document.getElementById("today").innerHTML = "Dneska je " + dayName

    const diagramDiv = document.getElementById("diagram")
    for(const subject of schedule){
      const section = document.createElement("div")
      section.id = subject.subject
      diagramDiv.appendChild(section)
    }

    const currentClass = getActiveClass(schedule)
    document.getElementById("currentClass").innerHTML = "Je " + currentClass.subject

    setInterval(() => {
      checkTimers(currentClass);
      updateProgressBar(currentClass);
  }, 1000);
  });

function checkTimers(currentClass) {
  const nowMs = Date.now();
  const endMs = new Date().setHours(...currentClass.end.split(':').map(Number), 0);
  const time = formatTimeRemaining(endMs - nowMs);

  document.getElementById("timer").innerHTML = time
}

function getActiveClass(schedule) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    var lastEnd;

    for (const currentClass of schedule) {
        const classStart = toMinutes(currentClass.start);
        const classEnd = toMinutes(currentClass.end);

        if(currentMinutes < classStart) {
            return {
              subject: "Přestávka",
              start: lastEnd,
              end: classStart
            }
        }

        lastEnd = classEnd

        if (currentMinutes >= classStart && currentMinutes < classEnd) {
          return currentClass
        }
    }
    return null;
}

function toMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}
function formatTimeRemaining(ms) {
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const seconds = Math.floor((ms / 1000) % 60);
  return `${minutes}m ${seconds}s`;
}
function updateProgressBar(currentClass) {
  const indicator = document.getElementById("timeIndicator");

  const targetDiv = document.getElementById(currentClass.subject);
  if (!targetDiv) return;

  const diagramRect = document.getElementById("diagram").getBoundingClientRect();
  const targetRect = targetDiv.getBoundingClientRect();
  const blockLeft = targetRect.left - diagramRect.left;
  const blockWidth = targetRect.width;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const start = toMinutes(currentClass.start);
  const end = toMinutes(currentClass.end);
  const total = end - start;
  if (total <= 0) return;

  let elapsed = Math.min(Math.max(currentMinutes - start, 0), total);
  const percent = (elapsed / total) * 100;

  const leftOffset = blockLeft + (percent / 100) * blockWidth;
  indicator.style.left = `${leftOffset}px`;
}