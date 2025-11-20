/**
 * Test script for Items CRUD API
 */

const API_BASE = 'http://localhost:8000';

// Test credentials
const testUser = {
  email: 'admin@example.com',
  password: 'admin123'
};

async function testItemsAPI() {
  console.log('🧪 Testing Items CRUD API...\n');

  // Step 1: Login
  console.log('1️⃣ Logging in...');
  const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      username: testUser.email,
      password: testUser.password
    })
  });

  if (!loginResponse.ok) {
    console.error('❌ Login failed:', await loginResponse.text());
    return;
  }

  const { access_token } = await loginResponse.json();
  console.log('✅ Logged in successfully\n');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  };

  // Step 2: Create an item
  console.log('2️⃣ Creating an item...');
  const createResponse = await fetch(`${API_BASE}/api/items`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: 'Test Item',
      description: 'This is a test item for demonstration',
      status: 'active'
    })
  });

  if (!createResponse.ok) {
    console.error('❌ Create failed:', await createResponse.text());
    return;
  }

  const createdItem = await createResponse.json();
  console.log('✅ Item created:', createdItem);
  const itemId = createdItem.id;
  console.log('');

  // Step 3: List items
  console.log('3️⃣ Listing items...');
  const listResponse = await fetch(`${API_BASE}/api/items`, {
    method: 'GET',
    headers
  });

  if (!listResponse.ok) {
    console.error('❌ List failed:', await listResponse.text());
    return;
  }

  const items = await listResponse.json();
  console.log(`✅ Found ${items.length} items`);
  console.log('');

  // Step 4: Get specific item
  console.log('4️⃣ Getting item by ID...');
  const getResponse = await fetch(`${API_BASE}/api/items/${itemId}`, {
    method: 'GET',
    headers
  });

  if (!getResponse.ok) {
    console.error('❌ Get failed:', await getResponse.text());
    return;
  }

  const item = await getResponse.json();
  console.log('✅ Item retrieved:', item);
  console.log('');

  // Step 5: Update item
  console.log('5️⃣ Updating item...');
  const updateResponse = await fetch(`${API_BASE}/api/items/${itemId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      title: 'Updated Test Item',
      description: 'This item has been updated',
      status: 'completed'
    })
  });

  if (!updateResponse.ok) {
    console.error('❌ Update failed:', await updateResponse.text());
    return;
  }

  const updatedItem = await updateResponse.json();
  console.log('✅ Item updated:', updatedItem);
  console.log('');

  // Step 6: Delete item
  console.log('6️⃣ Deleting item...');
  const deleteResponse = await fetch(`${API_BASE}/api/items/${itemId}`, {
    method: 'DELETE',
    headers
  });

  if (!deleteResponse.ok) {
    console.error('❌ Delete failed:', await deleteResponse.text());
    return;
  }

  console.log('✅ Item deleted successfully');
  console.log('');

  // Step 7: Verify deletion
  console.log('7️⃣ Verifying deletion...');
  const verifyResponse = await fetch(`${API_BASE}/api/items/${itemId}`, {
    method: 'GET',
    headers
  });

  if (verifyResponse.status === 404) {
    console.log('✅ Item confirmed deleted');
  } else {
    console.error('❌ Item still exists after deletion');
  }

  console.log('\n✅ All tests passed! Items CRUD API is working correctly.');
}

testItemsAPI().catch(err => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});
