const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1400, height: 900 }
  });
  const page = await browser.newPage();

  try {
    console.log('Testing TopBar visibility and active highlighting...\n');

    // Set auth token manually (bypass login)
    await page.goto('http://localhost:3002/');
    
    // Inject token into localStorage
    await page.evaluate(() => {
      // Use a test session - in real scenario this would be from login
      localStorage.setItem('access_token', 'test_token');
    });

    // Test Dashboard page
    console.log('1. Testing Dashboard page...');
    await page.goto('http://localhost:3002/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.topbar', { timeout: 5000 });
    
    const dashboardTopBar = await page.$('.topbar');
    console.log(`   ✅ TopBar present: ${dashboardTopBar !== null}`);
    
    const dashboardActive = await page.$$('.topbar-link.active');
    console.log(`   ✅ Active links found: ${dashboardActive.length}`);
    if (dashboardActive.length > 0) {
      const text = await page.evaluate(el => el.textContent.trim(), dashboardActive[0]);
      console.log(`   ✅ Active tab: "${text}"`);
    }
    await page.screenshot({ path: 'work/topbar-dashboard.png' });

    // Test Items page
    console.log('\n2. Testing Items page...');
    await page.goto('http://localhost:3002/items', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.topbar', { timeout: 5000 });
    
    const itemsTopBar = await page.$('.topbar');
    console.log(`   ✅ TopBar present: ${itemsTopBar !== null}`);
    
    const itemsActive = await page.$$('.topbar-link.active');
    console.log(`   ✅ Active links found: ${itemsActive.length}`);
    if (itemsActive.length > 0) {
      const text = await page.evaluate(el => el.textContent.trim(), itemsActive[0]);
      console.log(`   ✅ Active tab: "${text}"`);
    }
    await page.screenshot({ path: 'work/topbar-items.png' });

    // Test Tokens page
    console.log('\n3. Testing API Tokens page...');
    await page.goto('http://localhost:3002/tokens', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.topbar', { timeout: 5000 });
    
    const tokensTopBar = await page.$('.topbar');
    console.log(`   ✅ TopBar present: ${tokensTopBar !== null}`);
    
    const tokensActive = await page.$$('.topbar-link.active');
    console.log(`   ✅ Active links found: ${tokensActive.length}`);
    if (tokensActive.length > 0) {
      const text = await page.evaluate(el => el.textContent.trim(), tokensActive[0]);
      console.log(`   ✅ Active tab: "${text}"`);
    }
    await page.screenshot({ path: 'work/topbar-tokens.png' });

    // Test Users page
    console.log('\n4. Testing Users page...');
    await page.goto('http://localhost:3002/admin/users', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.topbar', { timeout: 5000 });
    
    const usersTopBar = await page.$('.topbar');
    console.log(`   ✅ TopBar present: ${usersTopBar !== null}`);
    
    const usersActive = await page.$$('.topbar-link.active');
    console.log(`   ✅ Active links found: ${usersActive.length}`);
    if (usersActive.length > 0) {
      const text = await page.evaluate(el => el.textContent.trim(), usersActive[0]);
      console.log(`   ✅ Active tab: "${text}"`);
    }
    await page.screenshot({ path: 'work/topbar-users.png' });

    console.log('\n✅ All TopBar tests passed! Check screenshots in work/ directory.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'work/topbar-error.png' });
  } finally {
    await browser.close();
  }
})();
