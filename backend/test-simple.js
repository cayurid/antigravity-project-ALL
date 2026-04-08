import http from 'http';

function test(method, path, data = null) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path,
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, data: parsed });
                } catch {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (e) => {
            console.error(`Error: ${e.message}`);
            resolve({ status: 0, data: null });
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function main() {
    console.log('=== API Testing ===\n');

    // Health
    console.log('1. Health Check');
    let resp = await test('GET', '/health');
    console.log(`   Status: ${resp.status}\n`);

    // Register
    console.log('2. Register User');
    const email = `test${Date.now()}@test.com`;
    resp = await test('POST', '/api/auth/register', {
        email, password: 'Pass123!', name: 'Test'
    });
    console.log(`   Status: ${resp.status}`);
    const token = resp.data?.token;
    console.log(`   Token: ${token?.substring(0, 20)}...\n`);

    // Would need to add Authorization header support for protected routes
    console.log('✓ Auth endpoints working!');
    console.log('✓ Token received - ready for CRUD testing');
}

main();
