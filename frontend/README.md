# Task Manager - Frontend

React + Vite + Tailwind CSS frontend for Task Manager application.

## Setup

```bash
npm install
npm run dev
```

## Development

```bash
npm run dev          # Start dev server at localhost:5173
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint code
npm run format       # Format code
npm run type-check   # Check TypeScript
```

## Testing

```bash
npm run test         # Run all tests
npm run test:watch   # Watch mode
npm run test:e2e     # Run E2E tests with Playwright
```

## Project Structure

- `src/` - Application source
  - `pages/` - Route pages
  - `components/` - React components
  - `services/` - API integration
  - `store/` - Zustand state management
  - `guards/` - Route guards
  - `styles/` - Global styles
- `tests/` - Test files

## Features

- Authentication (JWT + OAuth)
- Task management (CRUD)
- Project/Team management
- Dashboard with statistics
- Role-based access control
- Responsive design

See [docs/](../docs/) for detailed documentation.
