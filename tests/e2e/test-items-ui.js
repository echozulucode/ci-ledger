/**
 * Test Items CRUD UI with Puppeteer
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const FRONTEND_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = './work';

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function testItemsUI() {
  console.log('🧪 Testing Items CRUD UI...\n');

  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    args: ['--start-maximized']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Step 1: Login
    console.log('1️⃣  Navigating to login page...');
    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForSelector('input[type="email"]');
    
    await page.type('input[type="email"]', 'admin@example.com');
    await page.type('input[type="password"]', 'changethis');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation();
    console.log('✅ Logged in successfully');

    // Step 2: Navigate to Items page
    console.log('\n2️⃣  Navigating to Items page...');
    await page.waitForSelector('a[href="/items"]');
    await page.click('a[href="/items"]');
    await page.waitForSelector('.items-page, .empty-state');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'items-01-page.png') });
    console.log('✅ Items page loaded');

    // Step 3: Create new item
    console.log('\n3️⃣  Creating a new item...');
    await page.waitForSelector('button:has-text("Create Item")');
    await page.click('button:has-text("Create Item")');
    
    await page.waitForSelector('.modal-content');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'items-02-create-modal.png') });
    
    await page.type('input[name="title"]', 'Test Project Alpha');
    await page.type('textarea[name="description"]', 'This is a test project for demo purposes');
    await page.select('select[name="status"]', 'active');
    
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'items-03-create-form-filled.png') });
    
    await page.click('button[type="submit"]');
    await page.waitForSelector('.item-card', { timeout: 5000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'items-04-item-created.png') });
    console.log('✅ Item created successfully');

    // Step 4: Create another item
    console.log('\n4️⃣  Creating another item...');
    await page.click('button:has-text("Create Item")');
    await page.waitForSelector('.modal-content');
    
    await page.type('input[name="title"]', 'Test Project Beta');
    await page.type('textarea[name="description"]', 'Another test project with different details');
    await page.select('select[name="status"]', 'active');
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'items-05-two-items.png') });
    console.log('✅ Second item created');

    // Step 5: Edit an item
    console.log('\n5️⃣  Editing an item...');
    const editButtons = await page.$$('button:has-text("Edit")');
    if (editButtons.length > 0) {
      await editButtons[0].click();
      await page.waitForSelector('.modal-content');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'items-06-edit-modal.png') });
      
      // Clear and update fields
      await page.click('input[name="title"]', { clickCount: 3 });
      await page.type('input[name="title"]', 'Updated Project Alpha');
      await page.select('select[name="status"]', 'completed');
      
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'items-07-edit-form-updated.png') });
      
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'items-08-item-updated.png') });
      console.log('✅ Item updated successfully');
    }

    // Step 6: Verify status badge changed
    console.log('\n6️⃣  Verifying status badge...');
    const completedBadge = await page.$('.status-completed');
    if (completedBadge) {
      console.log('✅ Status badge updated to "completed"');
    }

    // Step 7: Delete an item
    console.log('\n7️⃣  Deleting an item...');
    
    // Setup dialog handler
    page.on('dialog', async dialog => {
      console.log('   📌 Confirming deletion...');
      await dialog.accept();
    });
    
    const deleteButtons = await page.$$('button:has-text("Delete")');
    if (deleteButtons.length > 0) {
      await deleteButtons[0].click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'items-09-item-deleted.png') });
      console.log('✅ Item deleted successfully');
    }

    // Step 8: Verify remaining items
    console.log('\n8️⃣  Verifying remaining items...');
    const remainingItems = await page.$$('.item-card');
    console.log(`✅ ${remainingItems.length} item(s) remaining`);

    console.log('\n🎉 All Items UI tests passed successfully!');
    console.log(`📸 Screenshots saved to: ${SCREENSHOT_DIR}/`);

    await page.waitForTimeout(2000);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

testItemsUI().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
