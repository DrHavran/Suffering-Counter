async function loadHeader() {
    const header = document.getElementById("header");

    if (!header) return;

    const isProduction =
        window.location.hostname === "drhavran.github.io";

    const file = isProduction
        ? "../components/header.html"
        : "../components/headerDebug.html";

    const response = await fetch(file);
    header.innerHTML = await response.text();
}

loadHeader();