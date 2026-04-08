# Task Manager - Full Stack Application

Complete task management system with authentication, RBAC, and real-time updates.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git

### Local Development

```bash
# 1. Clone and install
git clone <repo-url>
cd antigravity-project-ALL

# 2. Start services with Docker Compose
docker-compose up -d

# 3. Backend setup
cd backend
npm install
npm run db:migrate
npm run db:seed

# 4. Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

Access:

- **Frontend**: <http://localhost:5173>
- **API**: <http://localhost:3000>
- **API Docs**: <http://localhost:3000/api/docs>

## 📁 Project Structure

```
.
├── backend/                 # Express API
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── core/           # Core utilities
│   │   ├── middlewares/    # Express middlewares
│   │   ├── features/       # Domain logic
│   │   ├── database/       # Schema & Migrations
│   │   ├── cache/          # Redis
│   │   └── audit/          # Audit logging
│   ├── tests/              # Unit, Integration, E2E tests
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # React + Vite app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Route pages
│   │   ├── services/       # API calls
│   │   ├── store/          # Zustand stores
│   │   ├── guards/         # Route guards
│   │   └── styles/         # Tailwind CSS
│   ├── tests/              # Unit, Integration, E2E tests
│   ├── package.json
│   └── vite.config.ts
├── docs/                    # Documentation
├── docker/                  # Docker configuration
├── docker-compose.yml       # Services (MySQL, Redis)
└── README.md
```

## 📚 Documentation

See [docs/](docs/) for detailed documentation:

- [QUICK_START.md](docs/QUICK_START.md) - 5-minute setup guide
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System design & diagrams
- [DESIGN_DECISIONS.md](docs/DESIGN_DECISIONS.md) - Decisions with trade-offs
- [SECURITY.md](docs/SECURITY.md) - Security layers & checklist
- [DATABASE.md](docs/DATABASE.md) - Schema & migrations
- [TESTING.md](docs/TESTING.md) - Testing strategy
- [FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) - Detailed folder layout

## ⚙️ Tech Stack

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL 8.0
- **Cache**: Redis 7.0
- **Auth**: JWT + OAuth 2.0
- **Validation**: Zod
- **Testing**: Jest

### Frontend

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Testing**: Vitest + Playwright

## 🔒 Security

5-layer security architecture:

1. **Authentication** - JWT + OAuth 2.0
2. **Authorization** - RBAC (Admin, Editor, Viewer)
3. **Input Validation** - Zod schemas
4. **Data-Level Security** - Service-level checks
5. **Audit Logging** - All mutations logged

See [docs/SECURITY.md](docs/SECURITY.md) for details.

## 🧪 Testing

```bash
# Backend
cd backend
npm run test                # All tests
npm run test:unit          # Unit only
npm run test:integration   # Integration only
npm run test:e2e           # End-to-end

# Frontend
cd frontend
npm run test               # All tests
npm run test:e2e          # Playwright E2E
```

Target coverage: 80% lines, 70% branches.

## 📊 Development Commands

**Backend:**

```bash
npm run dev           # Watch mode
npm run lint          # ESLint
npm run format        # Prettier
npm run build         # TypeScript compile
npm run db:migrate    # Run migrations
npm run db:seed       # Seed test data
```

**Frontend:**

```bash
npm run dev           # Dev server
npm run build         # Production build
npm run preview       # Preview build
npm run lint          # ESLint
npm run type-check    # TypeScript check
```

## 🌐 API Endpoints

**Authentication**

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/refresh` - Refresh JWT token

**Tasks**

- `GET /api/tasks` - List tasks (with filtering)
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

**Projects**

- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `PATCH /api/projects/:id` - Update project

**Dashboard**

- `GET /api/dashboard/stats` - Summary statistics
- `GET /api/dashboard/charts` - Chart data

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full API spec.

## 🚢 Deployment

See [docs/](docs/) for deployment guides.

## 📝 License

MIT

## 👥 Authors

- Clovis - Lead Developer

---

**Last Updated**: 2024
**Version**: 1.0.0-beta
