const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // Using deviceScaleFactor 1 so the output is exactly 1024x500
  await page.setViewport({ width: 1024, height: 500, deviceScaleFactor: 1 });
  
  const svg = fs.readFileSync('assets/images/logo.svg', 'utf8');
  
  const html = `
    <html>
      <body style="margin:0; background:#ffffff; display:flex; justify-content:center; align-items:center; height: 100vh;">
        <div style="transform: scale(2.0);">
          ${svg}
        </div>
      </body>
    </html>
  `;
  
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  
  await page.screenshot({ path: 'assets/images/feature-graphic-white.png' });
  await browser.close();
  console.log('Screenshot saved!');
})();
