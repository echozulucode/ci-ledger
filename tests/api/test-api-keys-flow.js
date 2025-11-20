const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false, 
    slowMo: 100,
    devtools: true
  });
  
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      console.log(`BROWSER ${type.toUpperCase()}:`, msg.text());
    }
  });
  
  // Track API calls
  const apiCalls = [];
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/api/')) {
      const status = response.status();
      const call = {
        url,
        status,
        method: response.request().method()
      };
      
      if (status >= 400) {
        try {
          call.body = await response.json();
        } catch (e) {
          call.body = await response.text();
        }
      }
      
      apiCalls.push(call);
      console.log(`${call.method} ${url} - ${status}`);
      if (status >= 400) {
        console.log('  Error:', JSON.stringify(call.body));
      }
    }
  });

  try {
    console.log('\n=== TEST: API Keys with JWT Authentication ===\n');
    
    console.log('Step 1: Navigate to app');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'work/apikeys-01-home.png' });
    
    console.log('Step 2: Login');
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    await page.type('input[type="email"]', 'admin@example.com');
    await page.type('input[type="password"]', 'changethis');
    await page.screenshot({ path: 'work/apikeys-02-filled.png' });
    
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);
    
    console.log('Step 3: Check localStorage token');
    const token = await page.evaluate(() => localStorage.getItem('token'));
    if (token) {
      console.log(`✓ Token stored: ${token.substring(0, 40)}...`);
    } else {
      console.log('✗ No token found in localStorage!');
    }
    await page.screenshot({ path: 'work/apikeys-03-dashboard.png' });
    
    console.log('Step 4: Navigate to API Keys page');
    await page.goto('http://localhost:3000/api-keys', { waitUntil: 'networkidle2', timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'work/apikeys-04-tokens-page.png' });
    
    // Check if we got 401 or loaded successfully
    const hasError = await page.$('.error');
    if (hasError) {
      const errorText = await page.evaluate(el => el.textContent, hasError);
      console.log('✗ Error on page:', errorText);
    } else {
      console.log('✓ Page loaded successfully');
    }
    
    console.log('\n=== API Calls Summary ===');
    apiCalls.forEach(call => {
      console.log(`${call.status >= 400 ? '✗' : '✓'} ${call.method} ${call.url} - ${call.status}`);
    });
    
    console.log('\n=== Keeping browser open for manual inspection ===');
    console.log('Press Ctrl+C when done');
    
    // Keep browser open
    await new Promise(() => {});
    
  } catch (error) {
    console.error('\n!!! ERROR:', error.message);
    await page.screenshot({ path: 'work/apikeys-error.png' });
    await browser.close();
  }
})();
