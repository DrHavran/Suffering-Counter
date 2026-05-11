fetch('https://docs.google.com/document/d/1sElbGbpXAX1VjE1Yi-iSkn152asdpYRcN-USUzKJn9M/export?format=html')
  .then(res => res.text())
  .then(html => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const elements = doc.querySelectorAll('.c0');
    const container = document.getElementById('mainDiv');
    container.innerHTML = '';

    elements.forEach(element => {
        const text = element.textContent
        const parts = text.split(';').map(p => p.trim());
        if (parts.length < 3) return;
        const date = parts[0]
        if (!/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(date)) return;

        if (!isExpired(date)) {
            const mainDiv = document.createElement('div');
            mainDiv.className = 'test-item';
            
            const timeDiv = document.createElement('div');
            timeDiv.className = 'test-date';
            timeDiv.textContent = date;
            
            const titleDiv = document.createElement('div');
            titleDiv.className = 'test-subject';
            titleDiv.textContent = parts[1];
            
            const descDiv = document.createElement('div');
            descDiv.className = 'test-description';
            descDiv.textContent = parts[2];
            
            mainDiv.appendChild(timeDiv);
            mainDiv.appendChild(titleDiv);
            mainDiv.appendChild(descDiv);
            container.appendChild(mainDiv);
        }
    });
});

function parseCzechDate(dateStr) {
    const [day, month, year] = dateStr.split('.');
    return new Date(year, month - 1, day);
}

function isExpired(dateStr) {
    const date = parseCzechDate(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
}