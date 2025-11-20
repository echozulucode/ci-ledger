const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1600, height: 900 }
  });
  
  const page = await browser.newPage();
  
  // Capture all console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text()
    });
  });
  
  // Capture network requests
  const failedRequests = [];
  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      failure: request.failure().errorText
    });
  });
  
  page.on('response', response => {
    if (!response.ok() && response.url().includes('/api/')) {
      failedRequests.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });
  
  console.log('🔍 Checking Admin Users Page Console...\n');
  
  try {
    // Navigate and login
    console.log('1. Login...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await page.type('input[type="email"]', 'admin@example.com');
    await page.type('input[type="password"]', 'changethis');
    await page.click('button[type="submit"]');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Go to admin users
    console.log('2. Navigate to /admin/users...');
    await page.goto('http://localhost:3000/admin/users', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Take screenshot
    await page.screenshot({ path: 'work/console-check.png', fullPage: true });
    
    // Check for error banner
    const errorBanner = await page.$('.error-banner');
    if (errorBanner) {
      const errorText = await page.evaluate(el => el.textContent, errorBanner);
      console.log(`\n❌ Error Banner: ${errorText}`);
    }
    
    // Print console messages
    console.log('\n📋 Console Messages:');
    consoleMessages.forEach(msg => {
      const icon = msg.type === 'error' ? '❌' : msg.type === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`${icon} [${msg.type}] ${msg.text}`);
    });
    
    // Print failed requests
    if (failedRequests.length > 0) {
      console.log('\n🚫 Failed Requests:');
      failedRequests.forEach(req => {
        console.log(`   ${req.url}`);
        console.log(`   Status: ${req.status || req.failure}`);
      });
    }
    
    // Check local storage for token
    const token = await page.evaluate(() => localStorage.getItem('token'));
    console.log(`\n🔐 Token in localStorage: ${token ? 'Yes (length: ' + token.length + ')' : 'No'}`);
    
    // Check users table
    const userCount = await page.$$eval('.users-table tbody tr', rows => rows.length);
    console.log(`\n👥 Users in table: ${userCount}`);
    
    console.log('\nKeeping browser open for 10 seconds...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
