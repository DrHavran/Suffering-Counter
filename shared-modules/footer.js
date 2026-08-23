async function loadFooter() {
    const footer = document.getElementById("footer");
    if (!footer) return;

    const basePath = window.location.hostname === "drhavran.github.io"
        ? "/Suffering-Counter"
        : "";

    const response = await fetch(basePath + "/components/footer.html");
    footer.innerHTML = await response.text();
}

loadFooter();