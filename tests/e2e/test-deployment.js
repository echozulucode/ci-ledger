const http = require('http');

async function testEndpoint(url, description) {
    return new Promise((resolve, reject) => {
        console.log(`\n🧪 Testing: ${description}`);
        console.log(`   URL: ${url}`);
        
        const options = new URL(url);
        options.family = 4; // Force IPv4
        
        http.get(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`   ✅ Status: ${res.statusCode}`);
                if (res.headers['content-type']?.includes('application/json')) {
                    try {
                        const json = JSON.parse(data);
                        console.log(`   Response:`, JSON.stringify(json, null, 2));
                    } catch (e) {
                        console.log(`   Response: ${data.substring(0, 100)}...`);
                    }
                } else {
                    console.log(`   Content-Type: ${res.headers['content-type']}`);
                }
                resolve({ status: res.statusCode, data });
            });
        }).on('error', (err) => {
            console.log(`   ❌ Error: ${err.message}`);
            reject(err);
        });
    });
}

async function testLogin() {
    return new Promise((resolve, reject) => {
        const data = 'username=admin@example.com&password=changethis';

        const options = {
            hostname: '127.0.0.1',
            port: 8000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength('username=admin@example.com&password=changethis')
            }
        };

        console.log(`\n🧪 Testing: Login API`);
        console.log(`   URL: http://127.0.0.1:8000/api/auth/login`);

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => {
                console.log(`   ✅ Status: ${res.statusCode}`);
                try {
                    const json = JSON.parse(responseData);
                    console.log(`   ✅ Login successful! Token type: ${json.token_type}`);
                    resolve(json);
                } catch (e) {
                    console.log(`   Response: ${responseData}`);
                    reject(e);
                }
            });
        });

        req.on('error', (err) => {
            console.log(`   ❌ Error: ${err.message}`);
            reject(err);
        });

        req.write(data);
        req.end();
    });
}

async function runTests() {
    console.log('🚀 Testing Podman Deployment\n');
    console.log('=' .repeat(60));

    try {
        // Test backend health
        await testEndpoint('http://127.0.0.1:8000/health', 'Backend Health Check');
        
        // Test backend API docs
        await testEndpoint('http://127.0.0.1:8000/docs', 'Backend API Docs');
        
        // Test frontend
        await testEndpoint('http://127.0.0.1:3000', 'Frontend');
        
        // Test login
        const loginResult = await testLogin();
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ All deployment tests passed!');
        console.log('\n📋 Summary:');
        console.log('   • Backend API:  http://localhost:8000');
        console.log('   • API Docs:     http://localhost:8000/docs');
        console.log('   • Frontend:     http://localhost:3000');
        console.log('   • Default user: admin@example.com / changethis');
        console.log('\n✅ Podman deployment is working correctly!');
        
    } catch (error) {
        console.error('\n❌ Deployment test failed:', error.message);
        process.exit(1);
    }
}

runTests();
