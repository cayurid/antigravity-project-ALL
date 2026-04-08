# 📁 Estrutura de Pastas - Explicado

## 🎯 Visão Geral

```
antigravity-project-ALL/          ← Raiz do projeto
├── docs/                         ← 📚 Documentação (você está aqui!)
│   ├── README.md                 # Índice de docs
│   ├── QUICK_START.md            # TL;DR 5 min
│   ├── SETUP.md                  # Setup detalhado
│   ├── ARCHITECTURE.md           # Diagrama + fluxos
│   ├── DESIGN_DECISIONS.md       # 15 decisões
│   ├── FOLDER_STRUCTURE.md       # Este arquivo
│   └── ...
│
├── backend/                      ← 🔌 Express API
│   ├── src/
│   │   ├── config/               # Configurações
│   │   ├── core/                 # Utilitários
│   │   ├── middlewares/          # Express middlewares
│   │   ├── features/             # Domínios (auth, tasks, etc)
│   │   ├── database/             # Migrations, seeds
│   │   ├── cache/                # Redis wrapper
│   │   ├── audit/                # Auditoria
│   │   ├── types/                # TypeScript interfaces
│   │   ├── app.ts                # Express setup
│   │   └── server.ts             # Entry point
│   │
│   ├── tests/                    # 🧪 Testes
│   │   ├── unit/                 # Unit tests
│   │   ├── integration/          # Integration tests
│   │   └── e2e/                  # E2E tests
│   │
│   ├── docker/
│   │   └── Dockerfile            # Docker image backend
│   │
│   ├── .env.example              # Exemplo de env vars
│   ├── .env.test                 # Env test
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   └── README.md
│
├── frontend/                     ← ⚛️  React + Vite
│   ├── src/
│   │   ├── config/               # API config, OAuth URLs
│   │   │   └── api.config.ts     # Axios instance
│   │   │
│   │   ├── core/                 # Core utilities
│   │   │   ├── hooks/            # Custom React hooks
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useApi.ts
│   │   │   ├── utils/            # Helpers
│   │   │   │   ├── validators.ts
│   │   │   │   ├── formatters.ts
│   │   │   │   └── storage.ts
│   │   │   └── types/            # TypeScript types
│   │   │       ├── user.types.ts
│   │   │       ├── task.types.ts
│   │   │       └── api.types.ts
│   │   │
│   │   ├── services/             # API calls
│   │   │   ├── auth.service.ts
│   │   │   ├── tasks.service.ts
│   │   │   ├── projects.service.ts
│   │   │   └── dashboard.service.ts
│   │   │
│   │   ├── store/                # Zustand state
│   │   │   ├── authStore.ts
│   │   │   ├── taskStore.ts
│   │   │   └── uiStore.ts
│   │   │
│   │   ├── pages/                # Page components (routing)
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── TasksPage.tsx
│   │   │   ├── ProjectsPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   │
│   │   ├── components/           # Reusable components
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── SignupForm.tsx
│   │   │   │   └── OAuthButtons.tsx
│   │   │   │
│   │   │   ├── tasks/
│   │   │   │   ├── TaskTable.tsx
│   │   │   │   ├── TaskForm.tsx
│   │   │   │   └── TaskFilters.tsx
│   │   │   │
│   │   │   ├── projects/
│   │   │   │   ├── ProjectList.tsx
│   │   │   │   ├── ProjectForm.tsx
│   │   │   │   └── WorkspaceSelector.tsx
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── StatsCard.tsx
│   │   │   │   └── TasksChart.tsx
│   │   │   │
│   │   │   ├── common/           # Shared components
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Loading.tsx
│   │   │   │   └── Modal.tsx
│   │   │   │
│   │   │   └── layout/
│   │   │       ├── MainLayout.tsx
│   │   │       └── AuthLayout.tsx
│   │   │
│   │   ├── guards/               # Route guards
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── RoleRoute.tsx
│   │   │
│   │   ├── styles/               # Global styles
│   │   │   ├── globals.css
│   │   │   ├── variables.css
│   │   │   └── utilities.css
│   │   │
│   │   ├── App.tsx               # Router setup
│   │   └── main.tsx              # Entry point
│   │
│   ├── tests/                    # 🧪 Testes
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   │
│   ├── public/                   # Static assets
│   │   ├── favicon.ico
│   │   └── images/
│   │
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── README.md
│
├── docker-compose.yml            # Local development stack
├── .gitignore
├── README.md                      # Root readme
└── LICENSE
```

---

## 📂 Backend - Estrutura Detalhada

### `src/config/`

**Responsabilidade**: Centralizar todas as configurações

```
config/
├── database.ts      # Connection string, ORM setup
├── jwt.ts           # JWT_SECRET, expiry times
├── oauth.ts         # Google, GitHub IDs e secrets
├── env.ts           # Validação de env vars (Zod)
└── logger.ts        # Logger setup (Winston/Pino)
```

**Por quê**: Fácil encontrar e trocar configurações

---

### `src/core/`

**Responsabilidade**: Utilitários reutilizáveis

```
core/
├── errors/
│   ├── AppError.ts       # Base error class
│   ├── ValidationError.ts
│   ├── AuthError.ts
│   └── NotFoundError.ts
├── constants.ts          # Enums, constantes
├── logger.ts             # Logger instance
└── validators.ts         # Zod schemas reutilizáveis
```

**Por quê**: Não duplicar código, validações centralizadas

---

### `src/middlewares/`

**Responsabilidade**: Express middlewares (order importa!)

```
middlewares/
├── auth.middleware.ts              # JWT verify + refresh
├── authorization.middleware.ts     # RBAC check
├── errorHandler.middleware.ts      # Captura todos os erros
├── requestValidator.middleware.ts  # Zod validation
├── rateLimiter.middleware.ts       # 100 req/15min
└── corsHandler.middleware.ts       # CORS setup
```

**Ordem de aplicação** (CRÍTICA):

```typescript
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(rateLimiter);
app.use(auth);
app.use(authorization);
// Rotas aqui
app.use(errorHandler); // Último!
```

**Por quê**: Security-first, middleware ordering previne bugs

---

### `src/features/`

**Responsabilidade**: Domínios de negócio (auth, tasks, projects, etc)

```
features/
├── auth/
│   ├── auth.controller.ts   # HTTP handlers
│   ├── auth.service.ts      # Business logic
│   ├── auth.repository.ts   # Database queries
│   ├── auth.routes.ts       # Route definitions
│   ├── auth.dto.ts          # Response DTOs
│   └── auth.types.ts        # TypeScript types
│
├── tasks/
│   ├── tasks.controller.ts
│   ├── tasks.service.ts
│   ├── tasks.repository.ts
│   ├── tasks.routes.ts
│   ├── tasks.dto.ts
│   └── tasks.types.ts
│
├── projects/
│   ├── projects.controller.ts
│   ├── projects.service.ts
│   ├── projects.repository.ts
│   ├── projects.routes.ts
│   ├── projects.dto.ts
│   └── projects.types.ts
│
├── teams/
│   ├── ... (similar ao projects)
│
└── dashboard/
    ├── dashboard.controller.ts
    ├── dashboard.service.ts
    └── dashboard.routes.ts
```

**Pattern (Controllers → Services → Repositories)**:

```typescript
// controller.ts
async createTask(req, res) {
  const task = await taskService.createTask(req.validatedData, req.user);
  res.json(new TaskDTO(task));
}

// service.ts
async createTask(data, user) {
  validate(data);
  authorize(user);
  return await taskRepository.create(data);
}

// repository.ts
async create(data) {
  return await Task.create(data);
}
```

**Por quê**: Separação clara de responsabilidades, fácil testar

---

### `src/database/`

**Responsabilidade**: Migrações, seeds, queries otimizadas

```
database/
├── migrations/
│   ├── 001_create_users_table.sql
│   ├── 002_create_projects_table.sql
│   ├── 003_create_task_table.sql
│   └── 004_create_audit_logs_table.sql
│
├── seeds/
│   ├── seed_users.ts    # Dados de teste
│   └── seed_projects.ts
│
└── queries/
    ├── optimized_tasks_query.sql  # Queries complexas
    └── audit_log_query.sql
```

**Por quê**: Versionamento de schema, reproducibilidade

---

### `src/cache/`

**Responsabilidade**: Redis wrapper abstrato

```
cache/
└── cache.service.ts
    ├── get(key)
    ├── set(key, value, ttl)
    └── delete(key)
```

**Por quê**: Fácil trocar Redis por outra coisa depois

---

### `src/audit/`

**Responsabilidade**: Sistema de auditoria

```
audit/
├── audit.service.ts      # Log actions
├── audit.repository.ts   # Query logs
└── audit.middleware.ts   # Captura automática
```

**Por quê**: Compliance, rastreabilidade

---

## 📂 Frontend - Estrutura Detalhada

### `src/config/`

```
config/
├── api.config.ts        # Axios instance + interceptors
└── constants.ts         # API_URL, OAUTH_URLs
```

---

### `src/core/hooks/`

**Custom React Hooks**

```
hooks/
├── useAuth.ts           # Get/set auth state + token
├── useApi.ts            # Wrapper para chamadas HTTP
├── usePagination.ts     # Pagination logic
└── useLocalStorage.ts   # LocalStorage helper
```

**Por quê**: Lógica reutilizável, composable

---

### `src/services/`

**API calls abstratos**

```
services/
├── auth.service.ts      # login(), signup(), logout()
├── tasks.service.ts     # getTasks(), createTask(), etc
├── projects.service.ts
└── dashboard.service.ts
```

**Pattern**:

```typescript
// service.ts
async createTask(projectId: number, data: CreateTaskDTO) {
  return await api.post(`/projects/${projectId}/tasks`, data);
}

// component.tsx
const task = await taskService.createTask(projectId, formData);
taskStore.addTask(task);
```

---

### `src/store/`

**Zustand state management**

```
store/
├── authStore.ts         # { user, isAuthenticated, login(), logout() }
├── taskStore.ts         # { tasks, createTask(), updateTask(), etc }
├── projectStore.ts
└── uiStore.ts           # { modals, notifications, loading }
```

**Pattern**:

```typescript
// authStore.ts
export const authStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false })
}));

// component.tsx
const { user, logout } = authStore();
```

---

### `src/pages/`

**Page-level components**

```
pages/
├── LoginPage.tsx        # /login route
├── DashboardPage.tsx    # / route
├── TasksPage.tsx        # /projects/:id/tasks
├── ProjectsPage.tsx     # /projects
└── NotFoundPage.tsx     # 404
```

**Each page**:

- Mounted → fetch data
- Render components
- Handle navigation

---

### `src/components/`

**Reusable UI components**

```
components/
├── auth/                # Auth-specific
├── tasks/               # Task-specific
├── projects/            # Project-specific
├── dashboard/           # Dashboard-specific
├── common/              # Shared (Button, Input, Modal, etc)
└── layout/              # Layout (Header, Sidebar, etc)
```

**Pattern**:

```typescript
// Button.tsx
export interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
  disabled = false
}) => {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};
```

---

### `src/guards/`

**Route protection**

```
guards/
├── ProtectedRoute.tsx   # Requer autenticação
└── RoleRoute.tsx        # Requer papel específico
```

**Usage**:

```tsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/" element={<ProtectedRoute element={<DashboardPage />} />} />
  <Route path="/admin" element={<RoleRoute roles={['ADMIN']} element={<AdminPage />} />} />
</Routes>
```

---

## 🧪 Estructura de Testes

### Backend

```
tests/
├── unit/
│   ├── services/**/*.spec.ts      # Service logic
│   └── utils/**/*.spec.ts         # Helpers
│
├── integration/
│   ├── auth.test.ts               # Auth endpoints
│   ├── tasks.test.ts              # Tasks CRUD
│   └── projects.test.ts           # Projects CRUD
│
└── e2e/
    └── flows.spec.ts              # Critical flows
```

---

### Frontend

```
tests/
├── unit/
│   ├── components/**/*.spec.tsx
│   ├── hooks/**/*.spec.ts
│   └── utils/**/*.spec.ts
│
├── integration/
│   ├── auth-flow.test.tsx
│   └── task-creation.test.tsx
│
└── e2e/
    └── user-journey.spec.ts
```

---

## 📋 Convenções

### Naming

- **Files**: `kebab-case` (e.g., `user-service.ts`)
- **Folders**: `kebab-case` (e.g., `src/common/`)
- **Classes**: `PascalCase` (e.g., `UserService`)
- **Functions**: `camelCase` (e.g., `getUserById()`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_ITEMS = 20`)

### File Size

- Max 300 lines por arquivo
- Se passar: quebrar em múltiplos arquivos

### Imports

- Group imports: `external` → `internal` → `relative`

```typescript
import express from 'express';
import { UserService } from '../services';
import { validateUser } from './validators';
```

---

## ✨ Um Arquivo Nunca Deveria Conter

- ❌ 2 exports principais (1 class/function por arquivo)
- ❌ Mix de lógica e HTML (separation of concerns)
- ❌ Hardcoded strings (use constants)
- ❌ `console.log()` (use logger)

---

**Última Atualização**: 2026-04-08  
**Status**: ✅ Complete
