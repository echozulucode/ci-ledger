const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1600, height: 900 }
  });
  
  const page = await browser.newPage();
  
  console.log('🔍 Final Admin Users Page Check...\n');
  
  try {
    // Login
    console.log('1. Logging in...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await page.type('input[type="email"]', 'admin@example.com');
    await page.type('input[type="password"]', 'changethis');
    await page.click('button[type="submit"]');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Navigate to admin users
    console.log('2. Opening Admin Users page...');
    await page.goto('http://localhost:3000/admin/users', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Take screenshot
    await page.screenshot({ path: 'work/final-check.png', fullPage: true });
    console.log('   📷 Screenshot: work/final-check.png\n');
    
    // Check for error banner
    const errorBanner = await page.$('.error-banner');
    const errorText = errorBanner ? await page.evaluate(el => el.textContent.trim(), errorBanner) : null;
    
    // Check for loading state
    const loadingState = await page.$('.loading-state');
    const isLoading = loadingState !== null;
    
    // Check for users table
    const usersTable = await page.$('.users-table');
    const hasTable = usersTable !== null;
    
    // Count user rows
    const userRows = await page.$$('.users-table tbody tr');
    const userCount = userRows.length;
    
    // Check for create button
    const buttons = await page.$$('button');
    let hasCreateButton = false;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Create User')) {
        hasCreateButton = true;
        break;
      }
    }
    
    // Check localStorage
    const accessToken = await page.evaluate(() => localStorage.getItem('access_token'));
    const userDataStr = await page.evaluate(() => localStorage.getItem('user'));
    const userData = userDataStr ? JSON.parse(userDataStr) : null;
    
    // Print results
    console.log('📊 Results:');
    console.log(`   ${errorText ? '❌' : '✅'} Error Banner: ${errorText || 'None'}`);
    console.log(`   ${isLoading ? '⏳' : '✅'} Loading: ${isLoading ? 'Yes' : 'No'}`);
    console.log(`   ${hasTable ? '✅' : '❌'} Users Table: ${hasTable ? 'Found' : 'Not found'}`);
    console.log(`   ${userCount > 0 ? '✅' : '❌'} User Rows: ${userCount}`);
    console.log(`   ${hasCreateButton ? '✅' : '❌'} Create Button: ${hasCreateButton ? 'Found' : 'Not found'}`);
    console.log(`   ${accessToken ? '✅' : '❌'} Access Token: ${accessToken ? 'Present' : 'Missing'}`);
    console.log(`   ${userData ? '✅' : '❌'} User Data: ${userData ? userData.email + ' (Admin: ' + userData.is_admin + ')' : 'Missing'}`);
    
    // Get page HTML for inspection
    const pageHTML = await page.content();
    
    // Check what's actually in the error banner
    if (errorText) {
      console.log(`\n🔍 Error Banner Content:`);
      console.log(`   "${errorText}"`);
    }
    
    // Check if there's content in the users table
    if (userCount > 0) {
      console.log(`\n👥 User Table Content:`);
      for (let i = 0; i < Math.min(userCount, 5); i++) {
        const row = userRows[i];
        const cells = await row.$$('td');
        const cellTexts = [];
        for (const cell of cells) {
          const text = await page.evaluate(el => el.textContent.trim(), cell);
          cellTexts.push(text);
        }
        console.log(`   Row ${i + 1}: ${cellTexts.join(' | ')}`);
      }
    }
    
    console.log('\n✅ Check complete!');
    console.log('\nBrowser will stay open for 15 seconds...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'work/final-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
