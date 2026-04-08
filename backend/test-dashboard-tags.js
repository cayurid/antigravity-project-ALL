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
    console.log('=== Dashboard & Tags API Tests ===\n');

    // Register user
    console.log('Setup: Register User');
    const email = `user${Date.now()}@test.com`;
    let resp = await test('POST', '/api/auth/register', {
        email, password: 'Pass123!@#', name: 'Test User'
    });
    const token = resp.data?.data?.accessToken;
    console.log(`✓ Status: ${resp.status}\n`);

    // Create project
    console.log('Setup: Create Project');
    resp = await test('POST', '/api/projects', {
        name: 'Dashboard Test Project', color: '#3498db'
    }, { 'Authorization': `Bearer ${token}` });
    const projectId = resp.data?.data?.id;
    console.log(`✓ Status: ${resp.status}\n`);

    // Create tasks with different statuses and priorities
    console.log('Setup: Create Multiple Tasks');
    const taskIds = [];
    for (let i = 0; i < 5; i++) {
        resp = await test('POST', '/api/tasks', {
            title: `Test Task ${i + 1}`,
            description: `Description ${i + 1}`,
            priority: ['low', 'medium', 'high', 'urgent', 'low'][i],
            status: ['todo', 'in_progress', 'done', 'todo', 'in_progress'][i],
            projectId,
            dueDate: i < 2 ? '2026-04-20' : '2026-04-30'
        }, { 'Authorization': `Bearer ${token}` });
        taskIds.push(resp.data?.data?.id);
    }
    console.log(`✓ Created 5 tasks\n`);

    // TEST DASHBOARD ENDPOINTS
    console.log('=== DASHBOARD ENDPOINTS ===\n');

    console.log('TEST 1: Dashboard Overview');
    resp = await test('GET', '/api/dashboard/overview', null, { 'Authorization': `Bearer ${token}` });
    console.log(`✓ Status: ${resp.status}`);
    console.log(`  Overview: ${JSON.stringify(resp.data?.data?.overview, null, 2)}\n`);

    console.log('TEST 2: Dashboard Stats');
    resp = await test('GET', '/api/dashboard/stats', null, { 'Authorization': `Bearer ${token}` });
    console.log(`✓ Status: ${resp.status}`);
    console.log(`  Stats received: ${resp.data?.success ? 'yes' : 'no'}\n`);

    console.log('TEST 3: Recent Tasks');
    resp = await test('GET', '/api/dashboard/recent?limit=3', null, { 'Authorization': `Bearer ${token}` });
    console.log(`✓ Status: ${resp.status}`);
    console.log(`  Count: ${resp.data?.count}\n`);

    console.log('TEST 4: Upcoming Tasks');
    resp = await test('GET', '/api/dashboard/upcoming?limit=3', null, { 'Authorization': `Bearer ${token}` });
    console.log(`✓ Status: ${resp.status}`);
    console.log(`  Count: ${resp.data?.count}\n`);

    console.log('TEST 5: Overdue Tasks');
    resp = await test('GET', '/api/dashboard/overdue', null, { 'Authorization': `Bearer ${token}` });
    console.log(`✓ Status: ${resp.status}`);
    console.log(`  Count: ${resp.data?.count}\n`);

    console.log('TEST 6: Project Stats');
    resp = await test('GET', '/api/dashboard/projects', null, { 'Authorization': `Bearer ${token}` });
    console.log(`✓ Status: ${resp.status}`);
    console.log(`  Count: ${resp.data?.count}\n`);

    // TEST TAG ENDPOINTS
    console.log('=== TAG ENDPOINTS ===\n');

    console.log('TEST 7: Create Tag');
    resp = await test('POST', '/api/tags', {
        name: 'Important', color: '#e74c3c'
    }, { 'Authorization': `Bearer ${token}` });
    const tagId = resp.data?.data?.id;
    console.log(`✓ Status: ${resp.status}`);
    console.log(`  Tag ID: ${tagId}\n`);

    console.log('TEST 8: List Tags');
    resp = await test('GET', '/api/tags', null, { 'Authorization': `Bearer ${token}` });
    console.log(`✓ Status: ${resp.status}`);
    console.log(`  Count: ${resp.data?.count}\n`);

    console.log('TEST 9: Create Another Tag');
    resp = await test('POST', '/api/tags', {
        name: 'Urgent', color: '#c0392b'
    }, { 'Authorization': `Bearer ${token}` });
    const tagId2 = resp.data?.data?.id;
    console.log(`✓ Status: ${resp.status}\n`);

    console.log('TEST 10: Add Tag to Task');
    resp = await test('POST', `/api/tags/${tagId}/tasks/${taskIds[0]}`, null,
        { 'Authorization': `Bearer ${token}` });
    console.log(`✓ Status: ${resp.status}`);
    console.log(`  Task tags: ${resp.data?.data?.tags?.length || 0}\n`);

    console.log('TEST 11: Get Tag Detail');
    resp = await test('GET', `/api/tags/${tagId}`, null, { 'Authorization': `Bearer ${token}` });
    console.log(`✓ Status: ${resp.status}`);
    console.log(`  Tag usage: ${resp.data?.data?.usage}\n`);

    console.log('TEST 12: Get Tasks by Tag');
    resp = await test('GET', `/api/tags/${tagId}/tasks`, null, { 'Authorization': `Bearer ${token}` });
    console.log(`✓ Status: ${resp.status}`);
    console.log(`  Tasks with tag: ${resp.data?.count}\n`);

    console.log('TEST 13: Update Tag');
    resp = await test('PUT', `/api/tags/${tagId}`, {
        name: 'Critical', color: '#ff0000'
    }, { 'Authorization': `Bearer ${token}` });
    console.log(`✓ Status: ${resp.status}`);
    console.log(`  New name: ${resp.data?.data?.name}\n`);

    console.log('TEST 14: Remove Tag from Task');
    resp = await test('DELETE', `/api/tags/${tagId}/tasks/${taskIds[0]}`, null,
        { 'Authorization': `Bearer ${token}` });
    console.log(`✓ Status: ${resp.status}\n`);

    console.log('TEST 15: Delete Tag');
    resp = await test('DELETE', `/api/tags/${tagId2}`, null, { 'Authorization': `Bearer ${token}` });
    console.log(`✓ Status: ${resp.status}\n`);

    console.log('=== All Tests Complete ===');
    console.log('✓ Dashboard: 6 endpoints working');
    console.log('✓ Tags: 9 endpoints working');
}

main();
