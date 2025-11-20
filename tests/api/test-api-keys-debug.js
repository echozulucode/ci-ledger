const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable request interception to see headers
  await page.setRequestInterception(true);
  
  const requests = [];
  const responses = [];
  
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers()
      });
      console.log('REQUEST:', request.method(), request.url());
      console.log('Headers:', JSON.stringify(request.headers().authorization || 'None'));
    }
    request.continue();
  });
  
  page.on('response', async resp => {
    if (resp.url().includes('/api/')) {
      const status = resp.status();
      console.log('RESPONSE:', resp.url(), 'Status:', status);
      try {
        const body = await resp.text();
        console.log('Body:', body.substring(0, 300));
      } catch (e) {
        console.log('Could not read body');
      }
    }
  });
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  // Login
  await page.goto('http://localhost:3000');
  await page.screenshot({ path: 'work/debug-1-login-page.png' });
  
  await page.waitForSelector('input[type=text]', { timeout: 5000 });
  await page.type('input[type=text]', 'admin');
  await page.type('input[type=password]', 'admin123');
  await page.click('button[type=submit]');
  
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'work/debug-2-logged-in.png' });
  
  // Check localStorage for token
  const token = await page.evaluate(() => localStorage.getItem('token'));
  console.log('\n=== TOKEN IN LOCALSTORAGE ===');
  console.log(token ? `Token present: ${token.substring(0, 50)}...` : 'NO TOKEN FOUND');
  
  // Go to tokens page
  await page.goto('http://localhost:3000/tokens');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'work/debug-3-tokens-page.png' });
  
  console.log('\n=== WAITING 5 SECONDS FOR API CALLS ===\n');
  await page.waitForTimeout(5000);
  
  console.log('\n=== TEST COMPLETE ===');
  console.log('Check screenshots in work/ folder');
  console.log('Total API requests logged:', requests.length);
  
  await browser.close();
})();
