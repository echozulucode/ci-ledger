const axios = require('axios');

const API_BASE = 'http://127.0.0.1:8000/api';

async function testPATAPI() {
  console.log('🧪 Testing Personal Access Token API\n');
  
  try {
    // Step 1: Login to get JWT token
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, 
      new URLSearchParams({
        username: 'admin@example.com',
        password: 'changethis'
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    
    const jwtToken = loginResponse.data.access_token;
    console.log('   ✅ Logged in with JWT\n');
    
    const headers = {
      'Authorization': `Bearer ${jwtToken}`
    };
    
    // Step 2: Create a PAT
    console.log('2. Creating a Personal Access Token...');
    const createResponse = await axios.post(
      `${API_BASE}/users/me/tokens`,
      {
        name: 'Test API Token',
        scopes: 'read,write',
        expires_in_days: 30
      },
      { headers }
    );
    
    const pat = createResponse.data;
    console.log(`   ✅ Created PAT: ${pat.name}`);
    console.log(`   Token: ${pat.token}`);
    console.log(`   Scopes: ${pat.scopes}`);
    console.log(`   Expires: ${pat.expires_at || 'Never'}\n`);
    
    // Step 3: List all PATs
    console.log('3. Listing all Personal Access Tokens...');
    const listResponse = await axios.get(
      `${API_BASE}/users/me/tokens`,
      { headers }
    );
    
    console.log(`   ✅ Found ${listResponse.data.length} token(s):`);
    listResponse.data.forEach(token => {
      console.log(`      - ${token.name} (ID: ${token.id})`);
      console.log(`        Scopes: ${token.scopes}`);
      console.log(`        Active: ${token.is_active}`);
      console.log(`        Created: ${token.created_at}`);
    });
    console.log('');
    
    // Step 4: Test using PAT to authenticate
    console.log('4. Testing PAT authentication...');
    const patHeaders = {
      'Authorization': `Bearer ${pat.token}`
    };
    
    const meResponse = await axios.get(
      `${API_BASE}/users/me`,
      { headers: patHeaders }
    );
    
    console.log(`   ✅ Authenticated with PAT as: ${meResponse.data.email}`);
    console.log(`   User: ${meResponse.data.full_name}\n`);
    
    // Step 5: Test PAT on another endpoint
    console.log('5. Fetching users list with PAT...');
    const usersResponse = await axios.get(
      `${API_BASE}/users/`,
      { headers: patHeaders }
    );
    
    console.log(`   ✅ Retrieved ${usersResponse.data.length} user(s) using PAT\n`);
    
    // Step 6: Deactivate the token
    console.log('6. Deactivating the token...');
    const deactivateResponse = await axios.patch(
      `${API_BASE}/users/me/tokens/${pat.id}/deactivate`,
      {},
      { headers }
    );
    
    console.log(`   ✅ Token deactivated: ${deactivateResponse.data.name}`);
    console.log(`   Active: ${deactivateResponse.data.is_active}\n`);
    
    // Step 7: Try using deactivated PAT (should fail)
    console.log('7. Testing deactivated PAT (should fail)...');
    try {
      await axios.get(`${API_BASE}/users/me`, { headers: patHeaders });
      console.log('   ❌ ERROR: Deactivated PAT should not work!\n');
    } catch (error) {
      console.log(`   ✅ Correctly rejected: ${error.response?.status} ${error.response?.statusText}\n`);
    }
    
    // Step 8: Create another PAT without expiry
    console.log('8. Creating a PAT without expiration...');
    const create2Response = await axios.post(
      `${API_BASE}/users/me/tokens`,
      {
        name: 'Long-lived Token',
        scopes: 'read',
        expires_in_days: null
      },
      { headers }
    );
    
    console.log(`   ✅ Created: ${create2Response.data.name}`);
    console.log(`   Expires: ${create2Response.data.expires_at || 'Never'}\n`);
    
    // Step 9: Revoke (delete) token
    console.log('9. Revoking (deleting) token...');
    await axios.delete(
      `${API_BASE}/users/me/tokens/${create2Response.data.id}`,
      { headers }
    );
    console.log('   ✅ Token deleted\n');
    
    // Final: List tokens again
    console.log('10. Final token list...');
    const finalListResponse = await axios.get(
      `${API_BASE}/users/me/tokens`,
      { headers }
    );
    
    console.log(`   ✅ Remaining tokens: ${finalListResponse.data.length}`);
    finalListResponse.data.forEach(token => {
      console.log(`      - ${token.name} (Active: ${token.is_active})`);
    });
    
    console.log('\n✅ All PAT tests passed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data?.detail) {
      console.error('   Detail:', error.response.data.detail);
    }
    process.exit(1);
  }
}

testPATAPI();
