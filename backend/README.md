# Task Manager - Backend API

Express.js API for Task Manager application.

## Setup

```bash
npm install
npm run dev
```

## Structure

- `src/` - Source code
  - `config/` - Configuration files
  - `core/` - Core utilities (errors, constants)
  - `middlewares/` - Express middlewares
  - `features/` - Domain logic (auth, tasks, projects)
  - `database/` - Migrations and seeds
  - `cache/` - Redis wrapper
  - `audit/` - Audit logging
- `tests/` - Test files

## Development

```bash
npm run dev          # Run in watch mode
npm run lint         # Lint code
npm run format       # Format code
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run db:migrate   # Run migrations
```

## Testing

See [docs/TESTING.md](../docs/TESTING.md) for detailed testing guide.

## Deployment

See [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) for deployment instructions.
