const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1600, height: 900 }
  });
  
  const page = await browser.newPage();
  
  console.log('🧪 Testing Admin Users Page...\n');
  
  try {
    // Navigate to frontend
    console.log('1. Navigating to login page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('✅ Page loaded\n');
    
    // Login
    console.log('2. Logging in as admin...');
    await page.type('input[type="email"]', 'admin@example.com');
    await page.type('input[type="password"]', 'changethis');
    await page.screenshot({ path: 'work/test-1-login-filled.png', fullPage: true });
    
    await page.click('button[type="submit"]');
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ Login submitted\n');
    
    await page.screenshot({ path: 'work/test-2-after-login.png', fullPage: true });
    
    // Check current URL
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    
    // Check if we're on dashboard
    const pageTitle = await page.evaluate(() => document.querySelector('h1')?.textContent);
    console.log(`   Page title: ${pageTitle}\n`);
    
    // Navigate to admin users page
    console.log('3. Navigating to Admin Users page...');
    
    // Try to find the Users link
    const usersLink = await page.$('a[href="/admin/users"]');
    if (usersLink) {
      console.log('   ✅ Found Users link in sidebar');
      await usersLink.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.log('   ⚠️  Users link not found, navigating directly...');
      await page.goto('http://localhost:3000/admin/users', { waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    await page.screenshot({ path: 'work/test-3-admin-users-page.png', fullPage: true });
    console.log('   📷 Screenshot: work/test-3-admin-users-page.png\n');
    
    // Check what's on the page
    console.log('4. Analyzing Admin Users page...');
    
    const pageContent = await page.content();
    
    // Check for key elements
    const checks = {
      'Search box': pageContent.includes('search-box') || pageContent.includes('Search users'),
      'Users table': pageContent.includes('users-table'),
      'Create User button': pageContent.includes('Create User') || pageContent.includes('➕'),
      'Refresh button': pageContent.includes('Refresh') || pageContent.includes('🔄'),
      'Error banner': pageContent.includes('error-banner'),
      'Loading state': pageContent.includes('loading') || pageContent.includes('Loading'),
    };
    
    Object.entries(checks).forEach(([name, found]) => {
      console.log(`   ${found ? '✅' : '❌'} ${name}`);
    });
    console.log('');
    
    // Get any error messages
    const errorText = await page.evaluate(() => {
      const errorEl = document.querySelector('.error-banner');
      return errorEl ? errorEl.textContent : null;
    });
    
    if (errorText) {
      console.log(`   ⚠️  Error on page: ${errorText}\n`);
    }
    
    // Check for users in table
    const userRows = await page.$$('.users-table tbody tr');
    console.log(`   Found ${userRows.length} user rows in table\n`);
    
    // Get console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (consoleErrors.length > 0) {
      console.log('   ⚠️  Console Errors:');
      consoleErrors.forEach(err => console.log(`      ${err}`));
      console.log('');
    }
    
    // Try clicking Create User button
    console.log('5. Testing Create User button...');
    const createBtn = await page.$('button:contains("Create User")');
    if (!createBtn) {
      // Try alternate selector
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('Create User')) {
          console.log('   ✅ Found Create User button');
          await btn.click();
          await new Promise(resolve => setTimeout(resolve, 1000));
          await page.screenshot({ path: 'work/test-4-create-modal.png', fullPage: true });
          console.log('   📷 Screenshot: work/test-4-create-modal.png');
          
          // Check if modal opened
          const modal = await page.$('.modal-overlay');
          console.log(`   Modal opened: ${modal ? '✅ Yes' : '❌ No'}`);
          break;
        }
      }
    }
    
    console.log('\n✅ Test complete! Check screenshots in work/ folder\n');
    
    // Keep browser open
    console.log('Browser will stay open for 30 seconds for inspection...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    console.error(error.stack);
    await page.screenshot({ path: 'work/test-error.png', fullPage: true });
    console.log('📷 Error screenshot saved: work/test-error.png');
  } finally {
    await browser.close();
  }
})();
