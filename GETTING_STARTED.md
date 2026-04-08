# 🚀 Getting Started

## 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies (new terminal)
cd frontend
npm install
```

## 2. Environment Setup

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env if needed (defaults work with Docker Compose)
```

### Frontend

Create `frontend/.env.local`:

```
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-id
REACT_APP_GITHUB_CLIENT_ID=your-github-id
```

## 3. Start Services

### Option A: Docker Compose (Recommended)

```bash
# From root directory
docker-compose up -d

# Verify services
docker-compose ps
# Should show: mysql, redis, api (running)
```

### Option B: Manual Setup

Requires MySQL 8.0+ and Redis 7.0+ installed locally.

## 4. Initialize Database

```bash
cd backend
npm run db:migrate
npm run db:seed
```

## 5. Start Development

### Backend (Terminal 1)

```bash
cd backend
npm run dev
# Runs on http://localhost:3000
# Health check: http://localhost:3000/health
```

### Frontend (Terminal 2)

```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

## ✅ Verification

| Service | URL | Status |
|---------|-----|--------|
| Frontend | <http://localhost:5173> | 🟢 Should see "Task Manager" loading |
| Backend API | <http://localhost:3000/api> | 🟢 Should return API info |
| Health Check | <http://localhost:3000/health> | 🟢 Should return {"status":"ok"} |
| MySQL | localhost:3306 | 🟢 Running in Docker |
| Redis | localhost:6379 | 🟢 Running in Docker |

## 📋 Common Commands

### Backend

```bash
npm run dev           # Start dev server
npm run build         # Compile TypeScript
npm run test          # Run tests
npm run lint          # Check code quality
npm run format        # Format code with Prettier
npm run db:migrate    # Run database migrations
npm run db:seed       # Populate test data
npm run db:reset      # Reset database
```

### Frontend

```bash
npm run dev           # Start dev server
npm run build         # Build for production
npm run test          # Run tests
npm run lint          # Check code quality
npm run preview       # Preview production build
npm run type-check    # TypeScript type checking
```

### Docker

```bash
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs api           # View API logs
docker-compose exec mysql mysql   # Access MySQL CLI
docker-compose exec redis redis-cli # Access Redis CLI
```

## 🐛 Troubleshooting

### Port Already In Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Kill process on port 3306 (MySQL)
lsof -ti:3306 | xargs kill -9
```

### Database Connection Error

```bash
# Check MySQL is running
docker-compose ps mysql

# Check Redis is running
docker-compose ps redis

# View service logs
docker-compose logs mysql
docker-compose logs redis
```

### Node Modules Issues

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentation

- **Architecture**: See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Security**: See [docs/SECURITY.md](docs/SECURITY.md)
- **Database**: See [docs/DATABASE.md](docs/DATABASE.md)
- **Testing**: See [docs/TESTING.md](docs/TESTING.md)
- **Design Decisions**: See [docs/DESIGN_DECISIONS.md](docs/DESIGN_DECISIONS.md)

## 🎯 Next Steps

1. ✅ Services started
2. ⏳ Implement authentication (login/signup)
3. ⏳ Build task CRUD endpoints
4. ⏳ Create dashboard UI
5. ⏳ Add tests
6. ⏳ Deploy to production

See [STATUS.md](STATUS.md) for detailed progress tracking.
