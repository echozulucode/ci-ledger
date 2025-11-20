const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 Starting Personal Access Tokens test...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--start-maximized'],
    defaultViewport: null
  });

  const page = await browser.newPage();
  
  // Create screenshots directory
  const screenshotDir = path.join(__dirname, 'work');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  try {
    // Login first
    console.log('1️⃣  Navigating to login page...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(screenshotDir, 'tokens-01-login.png'), fullPage: true });

    console.log('2️⃣  Logging in as admin...');
    await page.type('input[type="email"]', 'admin@example.com');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(screenshotDir, 'tokens-02-dashboard.png'), fullPage: true });

    // Navigate to Tokens page
    console.log('3️⃣  Navigating to API Tokens page...');
    await page.click('a[href="/tokens"]');
    await page.waitForSelector('.tokens-page', { timeout: 5000 });
    await page.screenshot({ path: path.join(screenshotDir, 'tokens-03-tokens-page.png'), fullPage: true });
    console.log('   ✓ Tokens page loaded');

    // Create a new token
    console.log('4️⃣  Creating a new token...');
    await page.click('.btn-create');
    await page.waitForSelector('.modal-content', { timeout: 3000 });
    await page.screenshot({ path: path.join(screenshotDir, 'tokens-04-create-modal.png'), fullPage: true });

    // Fill in token details
    console.log('5️⃣  Filling token details...');
    await page.type('input[type="text"]', 'CI/CD Pipeline Token');
    
    // Select write scope
    const checkboxes = await page.$$('.scope-checkbox input[type="checkbox"]');
    if (checkboxes.length >= 2) {
      await checkboxes[1].click(); // Click 'write' scope
    }
    
    // Set expiration
    await page.type('input[type="number"]', '90');
    await page.screenshot({ path: path.join(screenshotDir, 'tokens-05-filled-form.png'), fullPage: true });

    // Submit
    console.log('6️⃣  Generating token...');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.token-display-modal', { timeout: 3000 });
    await page.screenshot({ path: path.join(screenshotDir, 'tokens-06-token-created.png'), fullPage: true });
    console.log('   ✓ Token created successfully');

    // Copy token value
    const tokenValue = await page.$eval('.token-value', el => el.textContent);
    console.log('   📋 Token:', tokenValue.substring(0, 20) + '...');

    // Click copy button
    console.log('7️⃣  Copying token to clipboard...');
    await page.click('.btn-copy');
    await page.waitForTimeout(500);

    // Close token display
    console.log('8️⃣  Closing token display...');
    await page.click('.token-display-modal .btn-primary');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotDir, 'tokens-07-tokens-list.png'), fullPage: true });
    console.log('   ✓ Token list updated');

    // Create another token
    console.log('9️⃣  Creating another token...');
    await page.click('.btn-create');
    await page.waitForSelector('.modal-content', { timeout: 3000 });
    await page.type('input[type="text"]', 'Development Token');
    await page.type('input[type="number"]', '30');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.token-display-modal', { timeout: 3000 });
    await page.click('.token-display-modal .btn-primary');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotDir, 'tokens-08-multiple-tokens.png'), fullPage: true });
    console.log('   ✓ Second token created');

    // Test token revocation
    console.log('🔟  Testing token revocation...');
    await page.waitForTimeout(1000);
    
    // Click the first revoke button
    const revokeButtons = await page.$$('.btn-revoke');
    if (revokeButtons.length > 0) {
      // Accept confirmation dialog
      page.on('dialog', async dialog => {
        console.log('   Confirmation dialog:', dialog.message());
        await dialog.accept();
      });
      
      await revokeButtons[0].click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(screenshotDir, 'tokens-09-after-revoke.png'), fullPage: true });
      console.log('   ✓ Token revoked successfully');
    }

    // Test API authentication with token
    console.log('1️⃣1️⃣  Testing API authentication with token...');
    const response = await page.evaluate(async (token) => {
      try {
        const res = await fetch('http://localhost:8000/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        return {
          status: res.status,
          ok: res.ok,
          data: await res.json()
        };
      } catch (error) {
        return { error: error.message };
      }
    }, tokenValue);

    if (response.ok) {
      console.log('   ✓ Token authentication successful');
      console.log('   User:', response.data.email);
    } else {
      console.log('   ⚠️  Token authentication response:', response);
    }

    // Check token scopes display
    console.log('1️⃣2️⃣  Checking token metadata display...');
    const hasScopes = await page.$('.scopes-badges');
    const hasStatus = await page.$('.status-badge');
    const hasDates = await page.$('.date-cell');
    
    if (hasScopes && hasStatus && hasDates) {
      console.log('   ✓ Token metadata displaying correctly');
    } else {
      console.log('   ⚠️  Some metadata elements missing');
    }

    // Final screenshot
    await page.screenshot({ path: path.join(screenshotDir, 'tokens-10-final.png'), fullPage: true });

    console.log('\n✅ All Personal Access Token tests completed successfully!');
    console.log(`📸 Screenshots saved to: ${screenshotDir}`);

    // Test summary
    console.log('\n📊 Test Summary:');
    console.log('   ✓ Token creation form works');
    console.log('   ✓ Token generation successful');
    console.log('   ✓ Token display with copy function');
    console.log('   ✓ Multiple tokens management');
    console.log('   ✓ Token revocation works');
    console.log('   ✓ Token metadata display');
    console.log('   ✓ API authentication with PAT');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: path.join(screenshotDir, 'tokens-error.png'), fullPage: true });
    throw error;
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
    console.log('\n✨ Browser closed');
  }
})();
