export async function getData(file) {
    const isProduction =
        window.location.hostname === "drhavran.github.io";

    const url = isProduction
        ? `https://drhavran.github.io/Suffering-Counter/data/${file}`
        : `../data/${file}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    return await response.json();
}


export async function getTests() {
    const url =
        "https://docs.google.com/document/d/1sElbGbpXAX1VjE1Yi-iSkn152asdpYRcN-USUzKJn9M/export?format=html";

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch tests: ${response.status}`);
    }

    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    return Array.from(doc.querySelectorAll("span"))
        .map(element => {
            const parts = element.textContent
                .split(";")
                .map(part => part.trim());

            if (parts.length < 3) {
                return null;
            }

            const date = parts[0];

            if (!/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(date)) {
                return null;
            }

            return {
                date,
                subject: parts[1],
                description: parts[2]
            };
        })
        .filter(test => test !== null);
}