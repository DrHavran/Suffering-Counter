async function loadFooter() {
    const footer = document.getElementById("footer");

    if (!footer) return;

    const response = await fetch("../components/footer.html");
    footer.innerHTML = await response.text();
}

loadFooter();