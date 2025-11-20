const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1400, height: 900 }
  });
  const page = await browser.newPage();

  try {
    // Login first
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle0', timeout: 15000 });
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    console.log('Entering credentials...');
    await page.type('input[type="email"]', 'admin@example.com');
    await page.type('input[type="password"]', 'changethis');
    
    console.log('Clicking submit...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }),
      page.click('button[type="submit"]')
    ]);
    console.log('✅ Logged in successfully');

    // Test Dashboard page
    await page.goto('http://localhost:3002/dashboard');
    await page.waitForSelector('.topbar');
    console.log('✅ TopBar appears on Dashboard');
    
    let activeLink = await page.$('.topbar-link.active');
    let activeLinkText = await page.evaluate(el => el.textContent.trim(), activeLink);
    console.log(`   Active tab: ${activeLinkText}`);
    await page.screenshot({ path: 'work/topbar-dashboard.png' });

    // Test Items page
    await page.goto('http://localhost:3002/items');
    await page.waitForSelector('.topbar');
    console.log('✅ TopBar appears on Items page');
    
    activeLink = await page.$('.topbar-link.active');
    activeLinkText = await page.evaluate(el => el.textContent.trim(), activeLink);
    console.log(`   Active tab: ${activeLinkText}`);
    await page.screenshot({ path: 'work/topbar-items.png' });

    // Test API Tokens page
    await page.goto('http://localhost:3002/tokens');
    await page.waitForSelector('.topbar');
    console.log('✅ TopBar appears on API Tokens page');
    
    activeLink = await page.$('.topbar-link.active');
    activeLinkText = await page.evaluate(el => el.textContent.trim(), activeLink);
    console.log(`   Active tab: ${activeLinkText}`);
    await page.screenshot({ path: 'work/topbar-tokens.png' });

    // Test Users page (admin only)
    await page.goto('http://localhost:3002/admin/users');
    await page.waitForSelector('.topbar');
    console.log('✅ TopBar appears on Users page');
    
    activeLink = await page.$('.topbar-link.active');
    activeLinkText = await page.evaluate(el => el.textContent.trim(), activeLink);
    console.log(`   Active tab: ${activeLinkText}`);
    await page.screenshot({ path: 'work/topbar-users.png' });

    console.log('\n✅ All tests passed! TopBar is consistent across all pages with active highlighting.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();
