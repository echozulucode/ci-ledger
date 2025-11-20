const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1400, height: 900 },
    args: ['--disable-web-security']
  });
  const page = await browser.newPage();

  try {
    console.log('Testing TopBar with authentication...\n');

    // Login
    console.log('1. Logging in...');
    await page.goto('http://localhost:3002/login', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    
    await page.type('input[type="email"]', 'admin@example.com');
    await page.type('input[type="password"]', 'changethis');
    await page.click('button[type="submit"]');
    
    // Wait for redirect (either to dashboard or by checking for topbar)
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('   ✅ Login submitted');

    // Test Dashboard
    console.log('\n2. Testing Dashboard page...');
    await page.goto('http://localhost:3002/dashboard');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let topbarVisible = await page.$('.topbar') !== null;
    console.log(`   TopBar visible: ${topbarVisible}`);
    
    let activeLinks = await page.$$eval('.topbar-link.active', els => 
      els.map(el => el.textContent.trim())
    );
    console.log(`   Active tab: ${activeLinks.length > 0 ? activeLinks[0] : 'None'}`);
    await page.screenshot({ path: 'work/topbar-auth-dashboard.png' });

    // Test Items
    console.log('\n3. Testing Items page...');
    await page.goto('http://localhost:3002/items');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    topbarVisible = await page.$('.topbar') !== null;
    console.log(`   TopBar visible: ${topbarVisible}`);
    
    activeLinks = await page.$$eval('.topbar-link.active', els => 
      els.map(el => el.textContent.trim())
    );
    console.log(`   Active tab: ${activeLinks.length > 0 ? activeLinks[0] : 'None'}`);
    await page.screenshot({ path: 'work/topbar-auth-items.png' });

    // Test Tokens
    console.log('\n4. Testing API Tokens page...');
    await page.goto('http://localhost:3002/tokens');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    topbarVisible = await page.$('.topbar') !== null;
    console.log(`   TopBar visible: ${topbarVisible}`);
    
    activeLinks = await page.$$eval('.topbar-link.active', els => 
      els.map(el => el.textContent.trim())
    );
    console.log(`   Active tab: ${activeLinks.length > 0 ? activeLinks[0] : 'None'}`);
    await page.screenshot({ path: 'work/topbar-auth-tokens.png' });

    // Test Users
    console.log('\n5. Testing Users page...');
    await page.goto('http://localhost:3002/admin/users');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    topbarVisible = await page.$('.topbar') !== null;
    console.log(`   TopBar visible: ${topbarVisible}`);
    
    activeLinks = await page.$$eval('.topbar-link.active', els => 
      els.map(el => el.textContent.trim())
    );
    console.log(`   Active tab: ${activeLinks.length > 0 ? activeLinks[0] : 'None'}`);
    await page.screenshot({ path: 'work/topbar-auth-users.png' });

    console.log('\n✅ Test complete! Check screenshots in work/ directory.');
    console.log('   Browser will stay open for 5 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 5000));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'work/topbar-auth-error.png' });
  } finally {
    await browser.close();
  }
})();
