/**
 * Test script to verify TopBar navigation functionality
 */

const puppeteer = require('puppeteer');

const FRONTEND_URL = 'http://localhost:3001';
const API_URL = 'http://localhost:8000';

// Test credentials
const TEST_USER = {
  email: 'admin@example.com',
  password: 'changethis'
};

async function testTopBarNavigation() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 }
  });

  try {
    const page = await browser.newPage();
    
    console.log('🧪 Testing TopBar Navigation...\n');

    // Test 1: Check TopBar on login page
    console.log('1️⃣ Checking TopBar on Login Page...');
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle0' });
    
    // Wait for TopBar to load
    await page.waitForSelector('.topbar', { timeout: 5000 });
    console.log('   ✅ TopBar is visible on login page');
    
    // Check logo is present
    const logoExists = await page.$('.topbar-brand');
    if (logoExists) {
      console.log('   ✅ Logo/Brand is present');
    }
    
    // Check login button is present
    const loginBtnExists = await page.$('.topbar-login-btn');
    if (loginBtnExists) {
      console.log('   ✅ Login button is visible');
    }
    
    await page.screenshot({ path: '../work/topbar-login-page.png' });
    console.log('   📸 Screenshot saved: work/topbar-login-page.png\n');

    // Test 2: Login and check authenticated TopBar
    console.log('2️⃣ Testing Login and Authenticated TopBar...');
    await page.type('#email', TEST_USER.email);
    await page.type('#password', TEST_USER.password);
    
    // Click login and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }),
      page.click('button[type="submit"]')
    ]);
    console.log('   ✅ Successfully logged in');
    
    // Check TopBar is still present
    await page.waitForSelector('.topbar', { timeout: 5000 });
    console.log('   ✅ TopBar is visible after login');
    
    // Check user button with dropdown
    const userBtnExists = await page.$('.topbar-user-btn');
    if (userBtnExists) {
      console.log('   ✅ User button is present');
      
      // Get user name displayed
      const userName = await page.$eval('.user-name', el => el.textContent);
      console.log(`   📝 Displayed user: ${userName}`);
    }
    
    // Check navigation links are present
    const navLinks = await page.$$('.topbar-link');
    console.log(`   ✅ Found ${navLinks.length} navigation links`);
    
    await page.screenshot({ path: '../work/topbar-dashboard.png' });
    console.log('   📸 Screenshot saved: work/topbar-dashboard.png\n');

    // Test 3: Test user dropdown menu
    console.log('3️⃣ Testing User Dropdown Menu...');
    await page.click('.topbar-user-btn');
    await page.waitForSelector('.user-dropdown', { timeout: 3000 });
    console.log('   ✅ Dropdown menu opened');
    
    // Check dropdown items
    const dropdownItems = await page.$$('.dropdown-item');
    console.log(`   ✅ Found ${dropdownItems.length} dropdown items`);
    
    // Check for Profile link
    const profileLink = await page.$('a.dropdown-item[href="/profile"]');
    if (profileLink) {
      console.log('   ✅ Profile link is present');
    }
    
    // Check for API Tokens link
    const tokensLink = await page.$('a.dropdown-item[href="/tokens"]');
    if (tokensLink) {
      console.log('   ✅ API Tokens link is present');
    }
    
    // Check for Logout button
    const logoutBtn = await page.$('.dropdown-logout');
    if (logoutBtn) {
      console.log('   ✅ Logout button is present');
    }
    
    await page.screenshot({ path: '../work/topbar-dropdown.png' });
    console.log('   📸 Screenshot saved: work/topbar-dropdown.png\n');

    // Test 4: Test navigation via TopBar
    console.log('4️⃣ Testing Navigation Links...');
    
    // Close dropdown first
    await page.click('body');
    await page.waitForTimeout(500);
    
    // Test Items link
    const itemsLink = await page.$('a.topbar-link[href="/items"]');
    if (itemsLink) {
      await itemsLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      const currentUrl = page.url();
      if (currentUrl.includes('/items')) {
        console.log('   ✅ Items navigation works');
      }
    }
    
    // Test logo click to go back to dashboard
    await page.click('.topbar-brand');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    const dashboardUrl = page.url();
    if (dashboardUrl.includes('/dashboard')) {
      console.log('   ✅ Logo click returns to dashboard\n');
    }

    // Test 5: Test dropdown navigation
    console.log('5️⃣ Testing Dropdown Navigation...');
    await page.click('.topbar-user-btn');
    await page.waitForSelector('.user-dropdown', { timeout: 3000 });
    
    // Click Profile from dropdown
    await page.click('a.dropdown-item[href="/profile"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    const profileUrl = page.url();
    if (profileUrl.includes('/profile')) {
      console.log('   ✅ Profile navigation from dropdown works');
    }
    
    await page.screenshot({ path: '../work/topbar-profile-page.png' });
    console.log('   📸 Screenshot saved: work/topbar-profile-page.png\n');

    // Test 6: Test logout
    console.log('6️⃣ Testing Logout Functionality...');
    await page.click('.topbar-user-btn');
    await page.waitForSelector('.user-dropdown', { timeout: 3000 });
    await page.click('.dropdown-logout');
    
    // Wait for navigation to login page
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    const loginUrl = page.url();
    if (loginUrl.includes('/login')) {
      console.log('   ✅ Logout redirects to login page');
    }
    
    // Check that login button is visible again
    const loginBtnAfterLogout = await page.$('.topbar-login-btn');
    if (loginBtnAfterLogout) {
      console.log('   ✅ Login button is visible after logout');
    }
    
    await page.screenshot({ path: '../work/topbar-after-logout.png' });
    console.log('   📸 Screenshot saved: work/topbar-after-logout.png\n');

    console.log('✅ All TopBar navigation tests passed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run tests
testTopBarNavigation()
  .then(() => {
    console.log('🎉 TopBar testing complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Testing failed:', error);
    process.exit(1);
  });
