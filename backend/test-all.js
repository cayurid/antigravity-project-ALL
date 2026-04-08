import http from 'http';

function test(method, path, data = null, headers = {}) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
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
    console.log('=== Task Manager CRUD Tests ===\n');

    // Health
    console.log('✓ Health Check');
    let resp = await test('GET', '/health');
    console.log(`  Status: ${resp.status}\n`);

    // Register
    console.log('✓ Register User');
    const email = `user${Date.now()}@test.com`;
    resp = await test('POST', '/api/auth/register', {
        email, password: 'Pass123!@#', name: 'Test User'
    });
    console.log(`  Status: ${resp.status}`);
    console.log(`  Response:`, resp.data);
    const token = resp.data?.data?.accessToken || resp.data?.token;

    if (!token) {
        console.log('\n❌ No token received! Register response:', JSON.stringify(resp.data, null, 2));
        return;
    }

    console.log(`  Token: ${token.substring(0, 20)}...\n`);

    // Create Project
    console.log('✓ Create Project');
    resp = await test('POST', '/api/projects', {
        name: 'My Project', description: 'Test', color: '#3498db'
    }, { 'Authorization': `Bearer ${token}` });
    console.log(`  Status: ${resp.status}`);
    const projectId = resp.data?.data?.id;
    console.log(`  Project ID: ${projectId}\n`);

    // Create Task
    console.log('✓ Create Task');
    resp = await test('POST', '/api/tasks', {
        title: 'Buy milk',
        priority: 'high',
        projectId,
        dueDate: '2026-04-15'
    }, { 'Authorization': `Bearer ${token}` });
    console.log(`  Status: ${resp.status}`);
    const taskId = resp.data?.data?.id;
    console.log(`  Task ID: ${taskId}\n`);

    // List Tasks
    console.log('✓ List Tasks');
    resp = await test('GET', '/api/tasks', null, { 'Authorization': `Bearer ${token}` });
    console.log(`  Status: ${resp.status}`);
    console.log(`  Count: ${resp.data?.count}\n`);

    // Get Task
    console.log('✓ Get Task Detail');
    resp = await test('GET', `/api/tasks/${taskId}`, null, { 'Authorization': `Bearer ${token}` });
    console.log(`  Status: ${resp.status}`);
    console.log(`  Title: ${resp.data?.data?.title}\n`);

    // Update Task
    console.log('✓ Update Task');
    resp = await test('PUT', `/api/tasks/${taskId}`, {
        title: 'Buy milk and bread'
    }, { 'Authorization': `Bearer ${token}` });
    console.log(`  Status: ${resp.status}`);
    console.log(`  New title: ${resp.data?.data?.title}\n`);

    // Update Status
    console.log('✓ Update Task Status');
    resp = await test('PATCH', `/api/tasks/${taskId}/status`, {
        status: 'done'
    }, { 'Authorization': `Bearer ${token}` });
    console.log(`  Status: ${resp.status}`);
    console.log(`  Task status: ${resp.data?.data?.status}`);
    console.log(`  Completed at: ${resp.data?.data?.completedAt}\n`);

    // List Projects
    console.log('✓ List Projects');
    resp = await test('GET', '/api/projects', null, { 'Authorization': `Bearer ${token}` });
    console.log(`  Status: ${resp.status}`);
    console.log(`  Count: ${resp.data?.count}\n`);

    // Delete Task
    console.log('✓ Delete Task');
    resp = await test('DELETE', `/api/tasks/${taskId}`, null, { 'Authorization': `Bearer ${token}` });
    console.log(`  Status: ${resp.status}\n`);

    console.log('=== All Tests Complete ===');
}

main();
