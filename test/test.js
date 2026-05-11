fetch('https://docs.google.com/document/d/1sElbGbpXAX1VjE1Yi-iSkn152asdpYRcN-USUzKJn9M/export?format=html')
  .then(res => res.text())
  .catch(() => {
    return `<html><head><meta content="text/html; charset=UTF-8" http-equiv="content-type"><style type="text/css">ol{margin:0;padding:0}table td,table th{padding:0}.c1{color:#000000;font-weight:400;text-decoration:none;vertical-align:baseline;font-size:26pt;font-family:"Arial";font-style:normal}.c3{color:#000000;font-weight:400;text-decoration:none;vertical-align:baseline;font-size:11pt;font-family:"Arial";font-style:normal}.c0{padding-top:0pt;padding-bottom:0pt;line-height:1.15;orphans:2;widows:2;text-align:left}.c2{padding-top:0pt;padding-bottom:0pt;line-height:1.15;text-align:left}.c4{background-color:#ffffff;max-width:396.9pt;padding:99.2pt 99.2pt 99.2pt 99.2pt}.title{padding-top:0pt;color:#000000;font-size:26pt;padding-bottom:3pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}.subtitle{padding-top:0pt;color:#666666;font-size:15pt;padding-bottom:16pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}li{color:#000000;font-size:11pt;font-family:"Arial"}p{margin:0;color:#000000;font-size:11pt;font-family:"Arial"}h1{padding-top:20pt;color:#000000;font-size:20pt;padding-bottom:6pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}h2{padding-top:18pt;color:#000000;font-size:16pt;padding-bottom:6pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}h3{padding-top:16pt;color:#434343;font-size:14pt;padding-bottom:4pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}h4{padding-top:14pt;color:#666666;font-size:12pt;padding-bottom:4pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}h5{padding-top:12pt;color:#666666;font-size:11pt;padding-bottom:4pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}h6{padding-top:12pt;color:#666666;font-size:11pt;padding-bottom:4pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;font-style:italic;orphans:2;widows:2;text-align:left}</style></head><body class="c4 doc-content"><p class="c2 title" id="h.leuoxnw6ngtt"><span class="c1">Test</span></p><p class="c0"><span class="c3">13.5.2026 - Matika - geometrick&aacute; posloupnost, sou&#269;et aritmetick&eacute; posloupnosti, sinov&aacute; a kosinov&aacute; v&#283;ta, sinus a cos definovan&yacute; pomoc&iacute; jednotkov&eacute; kru&#382;nice a transformace graf&#367; sin a cos;</span></p><p class="c0"><span class="c3">15.5.2026 - Programov&aacute;n&iacute; - Spring boot;</span></p></body></html>`
  })
  .then(html => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const elements = doc.querySelectorAll('.c0');
    const container = document.getElementById('mainDiv');

    elements.forEach(element => {
        const text = element.textContent
        const parts = text.split(';').map(p => p.trim());
        const date = parts[0]

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