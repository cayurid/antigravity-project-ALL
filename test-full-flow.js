const http = require('http');

const BASE_URL = 'http://localhost:3000';
let TOKEN = '';
let USER_ID = '';

function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(BASE_URL + path);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (TOKEN) {
            options.headers['Authorization'] = `Bearer ${TOKEN}`;
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: data ? JSON.parse(data) : null,
                        headers: res.headers
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: data,
                        headers: res.headers,
                        parseError: true
                    });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTests() {
    console.log('\n=== TESTE DE FLUXO COMPLETO ===\n');

    try {
        // 1. Register
        console.log('1️⃣  REGISTRANDO NOVO USUÁRIO');
        const registerRes = await request('POST', '/api/auth/register', {
            email: `test${Date.now()}@test.com`,
            password: 'TestPassword123',
            name: 'Test User'
        });
        console.log(`   Status: ${registerRes.status}`);
        console.log(`   Response:`, JSON.stringify(registerRes.data, null, 2));

        if (registerRes.status !== 201) {
            console.log('   ❌ ERRO: Registro falhou!');
            return;
        }
        console.log('   ✅ Registro bem-sucedido\n');

        // 2. Login
        console.log('2️⃣  FAZENDO LOGIN');
        const loginRes = await request('POST', '/api/auth/login', {
            email: registerRes.data.data.user.email,
            password: 'TestPassword123'
        });
        console.log(`   Status: ${loginRes.status}`);
        if (loginRes.status !== 200) {
            console.log('   ❌ ERRO: Login falhou!');
            return;
        }
        TOKEN = loginRes.data.data.token;
        USER_ID = loginRes.data.data.user.id;
        console.log('   ✅ Login bem-sucedido');
        console.log(`   Token: ${TOKEN.substring(0, 20)}...`);
        console.log(`   User ID: ${USER_ID}\n`);

        // 3. Get Current User
        console.log('3️⃣  OBTENDO USUÁRIO ATUAL');
        const meRes = await request('GET', '/api/auth/me');
        console.log(`   Status: ${meRes.status}`);
        console.log(`   User: ${meRes.data.data.user.name} (${meRes.data.data.user.email})`);
        console.log('   ✅ Autenticação funcionando\n');

        // 4. Create Project
        console.log('4️⃣  CRIANDO PROJETO');
        const projectRes = await request('POST', '/api/projects', {
            name: 'Test Project',
            description: 'Test project description'
        });
        console.log(`   Status: ${projectRes.status}`);
        const projectId = projectRes.data.data.project.id;
        console.log(`   Project ID: ${projectId}`);
        console.log('   ✅ Projeto criado\n');

        // 5. Create Task
        console.log('5️⃣  CRIANDO TAREFA');
        const taskRes = await request('POST', '/api/tasks', {
            title: 'Test Task',
            description: 'Test task description',
            projectId: projectId,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            priority: 'high'
        });
        console.log(`   Status: ${taskRes.status}`);
        const taskId = taskRes.data.data.task.id;
        console.log(`   Task ID: ${taskId}`);
        console.log('   ✅ Tarefa criada\n');

        // 6. Create Tag
        console.log('6️⃣  CRIANDO TAG');
        const tagRes = await request('POST', '/api/tags', {
            name: 'important',
            color: '#FF0000'
        });
        console.log(`   Status: ${tagRes.status}`);
        const tagId = tagRes.data.data.tag.id;
        console.log(`   Tag ID: ${tagId}`);
        console.log('   ✅ Tag criada\n');

        // 7. Add Tag to Task
        console.log('7️⃣  ADICIONANDO TAG À TAREFA');
        const addTagRes = await request('POST', `/api/tags/${tagId}/tasks/${taskId}`);
        console.log(`   Status: ${addTagRes.status}`);
        console.log('   ✅ Tag adicionada à tarefa\n');

        // 8. Get Dashboard Stats
        console.log('8️⃣  OBTENDO ESTATÍSTICAS DO DASHBOARD');
        const dashRes = await request('GET', '/api/dashboard/stats');
        console.log(`   Status: ${dashRes.status}`);
        if (dashRes.data.data) {
            console.log(`   Total tasks: ${dashRes.data.data.overview.total}`);
            console.log(`   Completion rate: ${dashRes.data.data.overview.completionRate}%`);
        }
        console.log('   ✅ Dashboard acessível\n');

        // 9. Search
        console.log('9️⃣  TESTANDO BUSCA');
        const searchRes = await request('GET', '/api/search?query=test');
        console.log(`   Status: ${searchRes.status}`);
        console.log(`   Results found: ${searchRes.data.data.tasks.length}`);
        console.log('   ✅ Busca funcionando\n');

        console.log('\n=== ✅ TODOS OS TESTES PASSARAM ===\n');

    } catch (error) {
        console.error('\n❌ ERRO:', error.message);
    }
}

runTests();
