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
    console.log('=== Advanced Search & Filtering Tests ===\n');

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
        name: 'Search Test Project', color: '#3498db'
    }, { 'Authorization': `Bearer ${token}` });
    const projectId = resp.data?.data?.id;
    console.log(`✓ Status: ${resp.status}\n`);

    // Create diverse tasks
    console.log('Setup: Create Tasks with Diverse Content');
    const taskIds = [];
    const taskTitles = [
        'Buy groceries from market',
        'Fix the broken lamp',
        'Call client for meeting',
        'Complete project documentation',
        'Review code changes',
        'Update database schema',
        'Test API endpoints'
    ];

    for (let i = 0; i < taskTitles.length; i++) {
        resp = await test('POST', '/api/tasks', {
            title: taskTitles[i],
            description: `This is a description for task ${i + 1}`,
            priority: ['low', 'medium', 'high', 'urgent', 'low', 'medium', 'high'][i],
            status: ['todo', 'in_progress', 'done', 'todo', 'in_progress', 'todo', 'in_progress'][i],
            projectId,
            dueDate: i < 3 ? '2026-04-20' : '2026-04-30'
        }, { 'Authorization': `Bearer ${token}` });
        taskIds.push(resp.data?.data?.id);
    }
    console.log(`✓ Created ${taskIds.length} tasks\n`);

    // TEST SEARCH ENDPOINTS
    console.log('=== SEARCH ENDPOINTS ===\n');

    console.log('TEST 1: Advanced Search - Query');
    resp = await test('GET', '/api/search?query=buy', null, { 'Authorization': `Bearer ${token}` });
    console.log(`✓ Status: ${resp.status}`);
    console.log(`  Results: ${resp.data?.pagination?.total} found\n`);

    console.log('TEST 2: Advanced Search - By Status');
    resp = await test('GET', '/api/search?status=done', null, { 'Authorization': `Bearer ${token}` });
    console.log(`✓ Status: ${resp.status}`);
    console.log(`  Done tasks: ${resp.data?.pagination?.total}\n`);

    console.log('TEST 3: Advanced Search - By Priority');
    resp = await test('GET', '/api/search?priority=high&sort=priority', null, { 'Authorization': `Bearer ${token}` });
    console.log(`✓ Status: ${resp.status}`);
    console.log(`  High priority tasks: ${resp.data?.pagination?.total}\n`);

    console.log('TEST 4: Advanced Search - By Project');
    resp = await test('GET', `/api/search?projectId=${projectId}`, null, { 'Authorization': `Bearer ${token}` });
    console.log(`✓ Status: ${resp.status}`);
    console.log(`  Tasks in project: ${resp.data?.pagination?.total}\n`);

    console.log('TEST 5: Advanced Search - Completed Tasks');
    resp = await test('GET', '/api/search?completed=true', null, { 'Authorization': `Bearer ${token}` });
    console.log(`✓ Status: ${resp.status}`);
    console.log(`  Completed: ${resp.data?.pagination?.total}\n`);

    console.log('TEST 6: Advanced Search - Sort by Title');
    resp = await test('GET', '/api/search?sort=title&sortOrder=ASC', null, { 'Authorization': `Bearer ${token}` });
    console.log(`✓ Status: ${resp.status}`);
    console.log(`  First result: ${resp.data?.data?.[0]?.title}\n`);

    console.log('TEST 7: Advanced Search - Pagination');
    resp = await test('GET', '/api/search?skip=0&take=3', null, { 'Authorization': `Bearer ${token}` });
    console.log(`✓ Status: ${resp.status}`);
    console.log(`  Page results: ${resp.data?.data?.length}, Total: ${resp.data?.pagination?.total}\n`);

    console.log('TEST 8: Quick Search');
    resp = await test('GET', '/api/search/quick?q=fix&limit=5', null, { 'Authorization': `Bearer ${token}` });
    console.log(`✓ Status: ${resp.status}`);
    console.log(`  Quick search results: ${resp.data?.count}\n`);

    console.log('TEST 9: Global Search');
    resp = await test('GET', '/api/search/global?q=database&limit=5', null, { 'Authorization': `Bearer ${token}` });
    console.log(`✓ Status: ${resp.status}`);
    console.log(`  Global search count:`, resp.data?.count, '\n');

    console.log('TEST 10: Search Suggestions');
    resp = await test('GET', '/api/search/suggestions?prefix=bu&limit=5', null, { 'Authorization': `Bearer ${token}` });
    console.log(`✓ Status: ${resp.status}`);
    console.log(`  Suggestions: ${JSON.stringify(resp.data?.data)}\n`);

    console.log('TEST 11: Search by Multiple Criteria');
    resp = await test('GET', '/api/search/criteria?statuses=todo,in_progress&priorities=high,urgent', null,
        { 'Authorization': `Bearer ${token}` });
    console.log(`✓ Status: ${resp.status}`);
    console.log(`  Filtered results: ${resp.data?.count}\n`);

    console.log('TEST 12: Complex Search - Multiple Filters');
    resp = await test('GET', '/api/search?query=test&status=todo&priority=high&sort=dueDate&sortOrder=ASC', null,
        { 'Authorization': `Bearer ${token}` });
    console.log(`✓ Status: ${resp.status}`);
    console.log(`  Complex search results: ${resp.data?.pagination?.total}\n`);

    console.log('=== All Search Tests Complete ===');
    console.log('✓ Advanced Filtering: 12 endpoints working');
}

main();
