const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 720 }
  });
  
  const page = await browser.newPage();
  
  console.log('📱 Testing Frontend UI...\n');
  
  try {
    // Navigate to frontend
    console.log('1. Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 10000 });
    console.log('✅ Page loaded\n');
    
    // Take screenshot
    await page.screenshot({ path: 'frontend-initial.png', fullPage: true });
    console.log('📸 Screenshot saved: frontend-initial.png\n');
    
    // Get page title
    const title = await page.title();
    console.log(`📄 Page Title: ${title}\n`);
    
    // Check for login form elements
    console.log('2. Checking for login elements...');
    
    const emailInput = await page.$('input[type="email"], input#email');
    const passwordInput = await page.$('input[type="password"], input#password');
    const loginButton = await page.$('button[type="submit"]');
    
    console.log(`   Email input: ${emailInput ? '✅ Found' : '❌ Not found'}`);
    console.log(`   Password input: ${passwordInput ? '✅ Found' : '❌ Not found'}`);
    console.log(`   Login button: ${loginButton ? '✅ Found' : '❌ Not found'}\n`);
    
    // Get page content
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    
    // Check what's actually rendered
    console.log('3. Checking rendered content...');
    const hasLoginText = bodyHTML.includes('Login') || bodyHTML.includes('login');
    const hasRegisterText = bodyHTML.includes('Register') || bodyHTML.includes('register');
    const hasAuthContainer = bodyHTML.includes('auth-container');
    const hasError = bodyHTML.includes('error') || bodyHTML.includes('Error');
    
    console.log(`   Contains "Login": ${hasLoginText ? '✅ Yes' : '❌ No'}`);
    console.log(`   Contains "Register": ${hasRegisterText ? '✅ Yes' : '❌ No'}`);
    console.log(`   Has auth-container: ${hasAuthContainer ? '✅ Yes' : '❌ No'}`);
    console.log(`   Has errors: ${hasError ? '⚠️ Yes' : '✅ No'}\n`);
    
    // Check console for errors
    const consoleMessages = [];
    page.on('console', msg => consoleMessages.push(`${msg.type()}: ${msg.text()}`));
    
    // Wait a bit for any console messages
    await page.waitForTimeout(2000);
    
    if (consoleMessages.length > 0) {
      console.log('4. Browser console messages:');
      consoleMessages.forEach(msg => console.log(`   ${msg}`));
      console.log('');
    }
    
    // Get a snippet of the body text
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('5. Page text content (first 500 chars):');
    console.log('   ' + bodyText.substring(0, 500).replace(/\n/g, '\n   '));
    console.log('\n');
    
    // Check React root
    const reactRoot = await page.$('#root');
    if (reactRoot) {
      const rootHTML = await page.evaluate(el => el.innerHTML, reactRoot);
      console.log('6. React #root content (first 300 chars):');
      console.log('   ' + rootHTML.substring(0, 300).replace(/\n/g, '\n   '));
      console.log('\n');
    }
    
    console.log('✅ UI Test Complete!');
    console.log('🖼️  Check frontend-initial.png to see what rendered\n');
    
    // Keep browser open for 5 seconds so user can see
    console.log('Browser will close in 5 seconds...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    await page.screenshot({ path: 'frontend-error.png', fullPage: true });
    console.log('📸 Error screenshot saved: frontend-error.png');
  } finally {
    await browser.close();
  }
})();
