# 🏗️ Arquitetura da Aplicação

## Visão Geral

Task Manager é uma **aplicação monolítica bem-estruturada** que separa claramente as responsabilidades entre:

- **Frontend**: Apresentação, estado local, validação UX
- **Backend**: Lógica de negócio, validação rigorosa, autorização
- **Database**: Persistência segura
- **Cache**: Performance

---

## 📊 Diagrama de Alto Nível

```
┌─────────────────────────────────────────┐
│         Browser do Usuário              │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   React SPA (Vite)              │   │
│  │  ├─ Pages (Router)              │   │
│  │  ├─ Components (Presentational) │   │
│  │  ├─ Zustand Store (Estado)      │   │
│  │  └─ API Services (Axios)        │   │
│  └─────────────────────────────────┘   │
│                 ↕ HTTPS               │
└─────────────────────────────────────────┘
            JWT Token + CORS
            ↓↑
┌─────────────────────────────────────────┐
│        Express.js Backend (Node)        │
├─────────────────────────────────────────┤
│                                         │
│  7 Express Middlewares (Ordered)        │
│  ├─ 1. CORS                             │
│  ├─ 2. Helmet (Security Headers)        │
│  ├─ 3. Compression (Gzip)               │
│  ├─ 4. Morgan (Logging)                 │
│  ├─ 5. Rate Limiter (100/15min)         │
│  ├─ 6. Auth Middleware (JWT verify)     │
│  └─ 7. RBAC Middleware (Role check)     │
│                                         │
│  Route Handlers (Controllers)            │
│  ├─ Auth Controller                     │
│  ├─ Tasks Controller                    │
│  ├─ Projects Controller                 │
│  └─ Dashboard Controller                │
│                                         │
│  Business Logic (Services)               │
│  ├─ Auth Service (Login, Register)      │
│  ├─ Tasks Service (CRUD + Validação)    │
│  ├─ Projects Service (Times/Papéis)     │
│  ├─ Cache Service (Redis wrapper)       │
│  └─ Audit Service (Logging)             │
│                                         │
│  Data Access (Repositories)              │
│  ├─ Users Repository                    │
│  ├─ Tasks Repository                    │
│  ├─ Projects Repository                 │
│  └─ Audit Logs Repository               │
│                                         │
└─────────────────────────────────────────┘
        SQL          ↕        Cache
        ↓↑                    ↓↑
   ┌─────────┐          ┌──────────┐
   │  MySQL  │          │  Redis   │
   │ 8.0     │          │  7.0     │
   └─────────┘          └──────────┘
```

---

## 🔄 Fluxo de Requisição Completo

```
USUÁRIO                    FRONTEND                 BACKEND              DATABASE
  │                           │                        │                    │
  │─ Click Botão ─→          │                        │                    │
  │              [Form/Input]  │                        │                    │
  │                           │─ HTTP POST ─→          │                    │
  │                           │  + JWT Token  1. CORS  │                    │
  │                           │              2. Helmet │                    │
  │                           │              3. Gzip   │                    │
  │                           │              4. Morgan │                    │
  │                           │              5. Rate   │                    │
  │                           │                Limit   │                    │
  │                           │              6. Auth   │                    │
  │                           │              7. RBAC   │                    │
  │                           │                        ├─ Controller ──→   │
  │                           │                        │  (Request)         │
  │                           │                        ├─ Validate  ──→   │
  │                           │                        │  (Zod Input)       │
  │                           │                        ├─ Service   ──→   │
  │                           │                        │  (Logic)           │
  │                           │                        ├─ Data-Level  ──→ │
  │                           │                        │  (Authorization)   │
  │                           │                        ├─ Repository   ──→ Query
  │                           │                        │  (SQL)             │
  │                           │                        │              ←─ Result
  │                           │                        ├─ Audit Log   ──→ INSERT
  │                           │                        │  (Action)          │
  │                           │                        ├─ Cache Inv   ──→ DELETE
  │                           │                        │  (Redis)           │
  │                           │                        ├─ Map DTO    ──→ (Safe)
  │                           │         ← 200 JSON ────│                    │
  │                           ├─ Response ────→       │                    │
  │                           │  Interceptor           │                    │
  │                           ├─ Validate             │                    │
  │                           │  Response              │                    │
  │                           ├─ Update Store         │                    │
  │                           │  (Zustand)             │                    │
  │                           ├─ Re-render            │                    │
  │                           ├─ Show UI              │                    │
  │← Toast Success ───────────│                        │                    │
```

---

## 🔐 Camadas de Segurança em Detalhes

### Camada 1: Autenticação

```typescript
// Middleware: Verifica JWT token

authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      // Tentar refresh automático
      return handleRefreshToken(req, res);
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

### Camada 2: Autorização (RBAC)

```typescript
// Middleware: Verifica papel do usuário

authorizationMiddleware(requiredRoles) {
  return async (req, res, next) => {
    const projectId = req.params.projectId;
    const userId = req.user.id;
    
    const member = await projectMembersRepo.findOne({
      project_id: projectId,
      user_id: userId
    });
    
    if (!member) return res.status(404).json({ error: 'Not found' });
    if (!requiredRoles.includes(member.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    req.projectMember = member;
    next();
  };
}

// Usage:
app.post('/projects/:projectId/tasks',
  authMiddleware,
  authorizationMiddleware(['ADMIN', 'EDITOR']), // Apenas ADMIN e EDITOR
  createTaskController
);
```

### Camada 3: Validação de Input

```typescript
// Schema Zod: Valida estrutura dos dados

const createTaskSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  assigned_to_id: z.number().optional(),
  due_date: z.string().datetime().optional()
});

// Middleware: Valida request
const validateRequest = (schema) => (req, res, next) => {
  const validation = schema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.flatten() });
  }
  req.validatedData = validation.data;
  next();
};

// Usage:
app.post('/tasks', validateRequest(createTaskSchema), createTaskController);
```

### Camada 4: Data-Level Authorization

```typescript
// Service: Verifica se usuário pode acessar recurso

async getTaskById(taskId: number, userId: number) {
  const task = await tasksRepo.findById(taskId);
  if (!task) throw new NotFoundError(); // 404, não 403
  
  // Verificar se usuário é membro do projeto
  const isMember = await projectMembersRepo.isMember(
    task.project_id,
    userId
  );
  
  if (!isMember) throw new NotFoundError(); // 404, não 403
  
  // Retornar DTO (NUNCA retornar entidade bruta)
  return new TaskDTO(task);
}
```

### Camada 5: Auditoria & Logging

```typescript
// Middleware: Log todas as ações

auditMiddleware(req, res, next) {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Registrar after response
    if (req.user) {
      auditService.log({
        user_id: req.user.id,
        action: req.method, // POST, PUT, DELETE
        resource_type: req.path.split('/')[1], // 'tasks', 'projects'
        resource_id: req.params.id,
        status: res.statusCode,
        ip_address: req.ip,
        timestamp: new Date()
      });
    }
    res.send = originalSend;
    return originalSend.call(this, data);
  };
  
  next();
}
```

---

## 📊 Fluxo de Dados (Redux-like)

### Frontend State Management (Zustand)

```
┌─────────────────────────────────┐
│    Component (TasksPage)        │
├─────────────────────────────────┤
│  useEffect(() => {              │
│    taskStore.fetchTasks()       │
│  })                             │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│    taskStore (Zustand)          │
│  - tasks: []                    │
│  - loading: bool                │
│  - fetchTasks()                 │
│  - createTask()                 │
│  - updateTask()                 │
│  - deleteTask()                 │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│    taskService.getAll()         │
│    API call via Axios           │
└─────────────────────────────────┘
              ↓ HTTP
        Backend API
```

---

## ⚡ Performance & Cache

### Cache TTL Strategy

```
GET /api/tasks?project_id=1
  ↓
Check Redis: tasks:project:1
  ↓ (miss)
Query Database
  ↓
Cache in Redis (TTL: 5 minutes)
  ↓
Return Response

GET /api/tasks?project_id=1 (2nd call, within 5 min)
  ↓
Check Redis ✓ HIT! (< 10ms)
  ↓
Return from Cache
```

### Cache Invalidation

```
POST /api/tasks (CREATE)
  ↓
Service:
  ├─ Insert task in DB
  ├─ delete('tasks:project:1')
  ├─ delete('projects:1')
  ├─ delete('stats:user:123')
  └─ Return DTO

Result: Cache fresh imediatamente após mudança
```

---

## 🗄️ Modelo de Dados

```sql
-- Hierarquia:
Users
 ├─ Projects (owned_by)
 │  ├─ ProjectMembers (RBAC: Admin/Editor/Viewer)
 │  └─ Tasks
 │     ├─ assigned_to → Users
 │     └─ created_by → Users
 │
 └─ AuditLogs (todas as ações)
```

---

## 🔄 Relacionamentos

```
users (1) ──→ (N) projects                  [owner_id]
users (1) ──→ (N) project_members          [user_id]
projects (1) ──→ (N) project_members       [project_id]
projects (1) ──→ (N) tasks                 [project_id]
users (1) ──→ (N) tasks                    [assigned_to_id] (optional)
users (1) ──→ (N) tasks                    [created_by_id]
users (1) ──→ (N) audit_logs               [user_id]
```

---

## 🚀 Estratégia de Deployment

```
┌─────────────────┐
│  Git Repository │
│  (branch: main) │
└────────┬────────┘
         │
         ↓ (Push event)
┌─────────────────────────────┐
│   GitHub Actions CI/CD       │
│  1. npm install              │
│  2. npm run lint             │
│  3. npm run test             │
│  4. npm run build            │
│  5. docker build             │
│  6. docker push (registry)   │
└────────┬────────────────────┘
         │
         ↓ (Docker image)
┌─────────────────────────────┐
│  Production Server           │
│  (Docker container)          │
│  - Node.js API               │
│  - MySQL database            │
│  - Redis cache               │
│  - Nginx reverse proxy       │
└─────────────────────────────┘
```

---

## 📈 Escalabilidade Future

Se precisar escalar para 100k+ usuários:

```
┌────────────────────────────────────┐
│  Load Balancer (Nginx/ALB)         │
├────────────────────────────────────┤
  │         │         │
  ↓         ↓         ↓
┌────┐   ┌────┐   ┌────┐
│ Container 1  │   │ Container 2  │   │ Container 3  │
│ API + App    │   │ API + App    │   │ API + App    │
└────────┬────┘   └────────┬────┘   └────────┬────┘
         │                 │                 │
         └─────────┬───────┴─────────┬───────┘
                   ↓
         ┌────────────────────┐
         │  MySQL Replication │
         │  (Master - Slave)  │
         └────────────────────┘
                   │
         ┌─────────┴─────────┐
         ↓                   ↓
      Primary            Replica (read-only)
      (write)            (read)
      
Plus:
├─ Redis Cluster (multiple nodes)
├─ Elasticsearch (audit logs)
├─ Monitoring (Datadog, New Relic)
└─ CDN (Cloudflare, CloudFront)
```

---

## 🎯 Próximos Passos

1. Leia [DESIGN_DECISIONS.md](./DESIGN_DECISIONS.md) para entender escolhas
2. Siga [SETUP.md](./SETUP.md) para configurar ambiente
3. Estude code em `backend/src/` e `frontend/src/`
4. Execute `npm run test` para validar

---

**Última Atualização**: 2026-04-08  
**Status**: ✅ Design Locked
