async function loadHeader() {
    const header = document.getElementById("header");
    if (!header) return;

    const basePath = window.location.hostname === "drhavran.github.io"
        ? "/Suffering-Counter"
        : "";

    const isProduction = window.location.hostname === "drhavran.github.io";
    const file = isProduction
        ? basePath + "/components/header.html"
        : basePath + "/components/headerDebug.html";

    const response = await fetch(file);
    header.innerHTML = await response.text();
}

loadHeader();