import fetch from 'node-fetch';

const API = 'http://localhost:3000';
let token = '';
let projectId = '';
let taskId = '';

async function test(name, method, url, body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            ...(body && { body: JSON.stringify(body) })
        };

        const resp = await fetch(`${API}${url}`, options);
        const data = await resp.json();

        console.log(`✓ ${name}`);
        console.log(`  Status: ${resp.status}`);
        console.log(`  Response:`, JSON.stringify(data, null, 2));
        return { status: resp.status, data };
    } catch (err) {
        console.log(`✗ ${name}`);
        console.log(`  Error: ${err.message}`);
        return { status: 0, data: null };
    }
}

async function main() {
    console.log('=== Task Manager API - CRUD Tests ===\n');

    // Test 1: Health
    console.log('TEST 1: Health Check');
    await test('GET /health', 'GET', '/health');

    // Test 2: Register
    console.log('\nTEST 2: Register User');
    const regResp = await test('POST /api/auth/register', 'POST', '/api/auth/register', {
        email: `test${Date.now()}@example.com`,
        password: 'Pass123!@#',
        name: 'Test User'
    });
    token = regResp.data?.token;

    // Test 3: Create Project
    console.log('\nTEST 3: Create Project');
    const projResp = await test('POST /api/projects', 'POST', '/api/projects', {
        name: 'My First Project',
        description: 'Testing CRUD',
        color: '#3498db'
    });
    projectId = projResp.data?.data?.id;

    // Test 4: List Projects
    console.log('\nTEST 4: List Projects');
    await test('GET /api/projects', 'GET', '/api/projects');

    // Test 5: Create Task
    console.log('\nTEST 5: Create Task');
    const taskResp = await test('POST /api/tasks', 'POST', '/api/tasks', {
        title: 'Buy groceries',
        description: 'Milk, eggs, bread',
        priority: 'high',
        projectId,
        dueDate: '2026-04-15T10:00:00Z'
    });
    taskId = taskResp.data?.data?.id;

    // Test 6: Get Task Detail
    console.log('\nTEST 6: Get Task Detail');
    await test(`GET /api/tasks/${taskId}`, 'GET', `/api/tasks/${taskId}`);

    // Test 7: List Tasks
    console.log('\nTEST 7: List Tasks');
    await test('GET /api/tasks', 'GET', '/api/tasks');

    // Test 8: Update Task
    console.log('\nTEST 8: Update Task');
    await test(`PUT /api/tasks/${taskId}`, 'PUT', `/api/tasks/${taskId}`, {
        title: 'Buy groceries and cook dinner',
        priority: 'medium'
    });

    // Test 9: Update Task Status
    console.log('\nTEST 9: Update Task Status');
    await test(`PATCH /api/tasks/${taskId}/status`, 'PATCH', `/api/tasks/${taskId}/status`, {
        status: 'done'
    });

    // Test 10: Delete Task
    console.log('\nTEST 10: Delete Task');
    await test(`DELETE /api/tasks/${taskId}`, 'DELETE', `/api/tasks/${taskId}`);

    console.log('\n=== All Tests Complete ===');
}

main();
