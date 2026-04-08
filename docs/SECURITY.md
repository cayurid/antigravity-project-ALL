# 🔐 Segurança - 5 Camadas

Task Manager implementa **5 camadas de segurança sobrepostas**. Cada camada é independente; uma não deve depender de outra funcionar.

---

## 🛡️ Camada 1: Autenticação (JWT)

**O que faz**: Verifica se usuário existe e token é válido

### JWT Structure

```typescript
// Token formato: header.payload.signature

const payload = {
  id: 123,
  email: 'user@example.com',
  role: 'EDITOR',
  iat: Date.now(),
  exp: Date.now() + 15 * 60 * 1000 // 15 min
};

const token = jwt.sign(payload, process.env.JWT_SECRET, {
  algorithm: 'HS256',
  issuer: 'task-manager',
  audience: 'task-manager-app'
});
```

### Middleware

```typescript
export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token missing' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      // Tentar refresh
      return handleRefreshToken(req, res);
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Exposição a Risco

- Token em **memória** (não localStorage) → protegido de XSS
- Refresh token em **httpOnly cookie** → protegido de JavaScript
- HTTPS obrigatório → protegido de MITM

---

## 🎭 Camada 2: Autorização (RBAC)

**O que faz**: Verifica se usuário tem papel necessário para ação

### Papéis

```typescript
enum UserRole {
  ADMIN = 'ADMIN',       // Controle total
  EDITOR = 'EDITOR',     // Criar/editar
  VIEWER = 'VIEWER'      // Somente leitura
}
```

### Middleware

```typescript
export const requireRole = (...roles: UserRole[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

// Usage
app.delete('/projects/:id', 
  authMiddleware,
  requireRole('ADMIN'),  // Apenas ADMIN pode deletar projeto
  deleteProjectController
);
```

### Access Matrix

```
         | Tasks | Projects | Members |
---------|-------|----------|---------|
ADMIN    | CUD   | CUD      | CR      |
EDITOR   | C     | -        | -       |
VIEWER   | R     | R        | R       |

C = Create, R = Read, U = Update, D = Delete
```

---

## ✔️ Camada 3: Validação de Input

**O que faz**: Rejeita dados malformados ou maliciosos

### Schema Validation (Zod)

```typescript
const createTaskSchema = z.object({
  title: z.string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(255, 'Título não pode exceder 255 caracteres')
    .trim(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  due_date: z.string().datetime().optional(),
  assigned_to_id: z.number().positive().optional()
});

// Middleware
export const validateRequest = (schema: ZodSchema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten()
      });
    }
    req.validatedData = result.data;
    next();
  };
};

// Usage
app.post('/tasks',
  authMiddleware,
  validateRequest(createTaskSchema),
  createTaskController
);
```

### Sanitization

```typescript
// Automaticamente sanitizado pelo Zod:
// - Trim whitespace
// - Reject tipo errado
// - Reject extra fields

// Exemplo:
const data = { title: '  Test  ', extra_field: 'ignored' };
const validated = createTaskSchema.parse(data);
// Result: { title: 'Test' } (sem extra_field)
```

---

## 🔍 Camada 4: Data-Level Authorization

**O que faz**: Verifica se usuário pode acessar esse recurso específico

### Pattern

```typescript
export const getTaskById = async (taskId: number, userId: number) => {
  // 1. Buscar task
  const task = await taskRepo.findById(taskId);
  if (!task) throw new NotFoundError(); // 404, não 403!
  
  // 2. Verificar se usuário é membro do projeto
  const isMember = await projectMembersRepo.isMember(
    task.project_id,
    userId
  );
  if (!isMember) throw new NotFoundError(); // 404, não 403!
  
  // 3. Mapear para DTO (NUNCA retornar entidade bruta)
  return new TaskDTO(task);
};

// Controller
app.get('/tasks/:id', authMiddleware, async (req, res) => {
  const task = await getTaskById(parseInt(req.params.id), req.user.id);
  res.json(task);
});
```

### Por quê 404 instead 403?

```
❌ Aplicação retorna 403 (Forbidden)
   → Atacante sabe que recurso existe
   → Pode fazer força bruta descobrir IDs válidos

✅ Aplicação retorna 404 (Not Found)
   → Atacante não sabe se recurso existe
   → Força bruta inútil
```

---

## 📝 Camada 5: Auditoria & Logging

**O que faz**: Registra quem fez o quê e quando

### Audit Log Structure

```sql
CREATE TABLE audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  action VARCHAR(50),      -- CREATE, UPDATE, DELETE, READ
  resource_type VARCHAR(50), -- Task, Project, User
  resource_id BIGINT,
  old_values JSON,         -- Valores antes da mudança
  new_values JSON,         -- Valores depois da mudança
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Middleware

```typescript
export const auditMiddleware = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    if (req.user && res.statusCode >= 200 && res.statusCode < 300) {
      auditService.log({
        user_id: req.user.id,
        action: req.method,
        resource_type: getResourceType(req.path),
        resource_id: req.params.id,
        old_values: req.oldValues,
        new_values: JSON.parse(data),
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
        timestamp: new Date()
      });
    }
    
    res.send = originalSend;
    return originalSend.call(this, data);
  };
  next();
};
```

---

## 🔐 Proteções Específicas

### XSS (Cross-Site Scripting)

```
❌ Vulnerável
  User enters: <script>alert('XSS')</script>
  Backend retorna: "<script>alert('XSS')</script>"
  Browser executa JavaScript

✅ Proteção: Input Sanitization
  Zod valida tipos (rejeita HTML tags)
  Helmet headers (Content-Security-Policy)
  Frontend: React escapa automaticamente
```

### SQL Injection

```
❌ Vulnerável
  Query: "SELECT * FROM users WHERE email = '" + email + "'"
  Input: ' OR '1'='1
  Resultado: Toda tabela retornada

✅ Proteção: Prepared Statements (ORM)
  Query: "SELECT * FROM users WHERE email = ?"
  Parameters: [email]
  ORM cuida do escaping
```

### CSRF (Cross-Site Request Forgery)

```
❌ Vulnerável
  Atacante cria: <img src="https://app.com/delete-account" />
  Vítima acessa página, pedido é feito automaticamente

✅ Proteção: SameSite Cookies
  Cookie configurado com SameSite=Strict
  Cookies não enviados em cross-site requests
```

### Insecure Direct Object Reference (IDOR)

```
❌ Vulnerável
  GET /api/projects/1
  Atacante tenta: GET /api/projects/2 (outro usuário)
  Sistema retorna dados

✅ Proteção: Data-Level Authorization
  Service valida: esse usuário é membro do projeto?
  Retorna 404 se não
```

---

## 🛠️ Segurança em Produção

### Checklist Pré-Deploy

```
Authentication
  ✅ JWT_SECRET is strong (32+ chars random)
  ✅ JWT_SECRET rotated regularly
  ✅ OAuth credentials stored in env (não em codigo)
  ✅ Refresh token expiry: 7 dias
  ✅ Access token expiry: 15 minutos

Authorization
  ✅ RBAC implementado corretamente
  ✅ Data-level checks em toda repository layer
  ✅ Rejeitar 404 (não 403) para recursos não acessíveis

Validation
  ✅ Zod schemas em todos endpoints
  ✅ Input sanitization automática
  ✅ File uploads validados (size, type)

Infrastructure
  ✅ HTTPS obrigatório
  ✅ CORS configurado (API_URL específica)
  ✅ Rate limiting ativo (100 req/15min)
  ✅ Helmet headers enabled
  ✅ No console.log de dados sensíveis
  ✅ Logs armazenados secamente

Database
  ✅ Senhas com bcryptjs salt=10
  ✅ Sem dados em plaintext
  ✅ Backups diários encriptados
  ✅ Audit logs retidos 1 ano

Monitoring
  ✅ Alertas de failed logins
  ✅ Alertas de 100+ errors/min
  ✅ Logs centralizados (ELK, Datadog)
  ✅ Uptime monitoring (99.5%)
```

---

## 🚨 Resposta a Incidentes

### Se token for comprometido

1. Revogar refresh token (blacklist)
2. User precisará fazer login novamente
3. Investigar logs de auditoria
4. Resetar JWT_SECRET se necessário

### Se banco for comprometido

1. Passwords estão bcrypted (seguro)
2. Audit logs revelam o quê foi acessado
3. Soft deletes permitem investigação
4. Notificar usuários afetados

### Se código malicioso for inserido

1. Audit logs mostram quem e quando
2. Git history permite revert
3. Data-level checks previnem acesso indevido

---

## 📚 Recursos

- [OWASP Top 10](https://owasp.org/Top10/)
- [JWT best practices](https://tools.ietf.org/html/rfc8725)
- [Zod validation](https://zod.dev/)
- [Node.js security best practices](https://nodejs.org/en/docs/guides/security/)

---

**Última Atualização**: 2026-04-08  
**Status**: ✅ Complete
