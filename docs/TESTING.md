# 🧪 Testing - Estratégia & Guia

Documentação completa sobre testing: estratégia, como rodar, e exemplos.

---

## 📚 Tipos de Testes

### Pirâmide de Testes (Distribution Ideal)

```
                    /E2E\
                   /─────\         5-10%
                  /       \        Cypress/Playwright
                 /         \       Fluxos críticos
                ▲─────────────▲
               / Integration  \   30-40%
              /─────────────────\ Jest + Supertest
             / API & Database   \ Autenticação, CRUD
            ▲─────────────────────▲
           /                       \
          /   Unit Tests            \  50-60%
         /  Services, Helpers        \  Jest
        /     Business Logic          \ Fast feedback
       ▼─────────────────────────────────▼

Total Coverage:
├─ Backend: >80% (obrigatório)
├─ Frontend: >70% (aceitável)
└─ Critical paths: 100% (auth, payments)
```

---

## 🏃 Unit Tests (50-60%)

**Foco**: Testar lógica pura em isolamento (mocked dependencies)

### Backend Unit Test Example

```typescript
// src/features/tasks/tasks.service.spec.ts

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { ValidationError } from '../../core/errors';

describe('TasksService', () => {
  let service: TasksService;
  let repository: jest.Mocked<TasksRepository>;

  beforeEach(() => {
    // Mock do repository
    repository = {
      findById: jest.fn(),
      findByProject: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as any;

    service = new TasksService(repository);
  });

  describe('createTask', () => {
    it('should create task with valid data', async () => {
      // Arrange
      const taskData = {
        project_id: 1,
        title: 'Test Task',
        priority: 'HIGH',
        status: 'TODO'
      };
      const userId = 123;

      repository.create.mockResolvedValue({
        id: 1,
        ...taskData,
        created_by_id: userId
      });

      // Act
      const result = await service.createTask(taskData, userId);

      // Assert
      expect(result).toHaveProperty('id');
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          created_by_id: userId
        })
      );
    });

    it('should reject if title is too short', async () => {
      // Arrange
      const taskData = {
        project_id: 1,
        title: 'ab', // <3 chars
        priority: 'HIGH'
      };

      // Act & Assert
      await expect(
        service.createTask(taskData, 123)
      ).rejects.toThrow('Title must be at least 3 characters');
    });

    it('should reject invalid priority', async () => {
      const taskData = {
        project_id: 1,
        title: 'Valid Task',
        priority: 'SUPER_URGENT' // Invalid
      };

      await expect(
        service.createTask(taskData, 123)
      ).rejects.toThrow('Invalid priority');
    });
  });

  describe('updateTask', () => {
    it('should update task only if owner', async () => {
      const taskId = 1;
      const userId = 123;
      const existingTask = {
        id: taskId,
        created_by_id: 999 // Different user
      };

      repository.findById.mockResolvedValue(existingTask);

      await expect(
        service.updateTask(taskId, { status: 'DONE' }, userId)
      ).rejects.toThrow('Unauthorized');

      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should update if owner', async () => {
      const taskId = 1;
      const userId = 123;
      const existingTask = {
        id: taskId,
        created_by_id: userId
      };

      repository.findById.mockResolvedValue(existingTask);
      repository.update.mockResolvedValue({
        ...existingTask,
        status: 'DONE'
      });

      const result = await service.updateTask(
        taskId,
        { status: 'DONE' },
        userId
      );

      expect(result.status).toBe('DONE');
      expect(repository.update).toHaveBeenCalled();
    });
  });

  describe('deleteTask', () => {
    it('should soft delete task', async () => {
      const taskId = 1;
      repository.delete.mockResolvedValue({ id: taskId });

      await service.deleteTask(taskId);

      expect(repository.delete).toHaveBeenCalledWith(taskId);
    });
  });
});
```

### Frontend Unit Test Example

```typescript
// src/components/common/Button.spec.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('should render with label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button label="Click" onClick={handleClick} />);

    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button label="Click" onClick={() => {}} disabled={true} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should apply variant class', () => {
    render(
      <Button label="Click" onClick={() => {}} variant="secondary" />
    );
    expect(screen.getByRole('button')).toHaveClass('btn-secondary');
  });
});
```

---

## 🔗 Integration Tests (30-40%)

**Foco**: Testar API endpoints com banco de dados real

### Backend Integration Test Example

```typescript
// tests/integration/tasks.api.test.ts

import request from 'supertest';
import { createTestApp } from '../test-utils';
import { setupTestDB, teardownTestDB } from '../test-db';

describe('Tasks API', () => {
  let app;
  let testUserId: number;
  let testProjectId: number;
  let authToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    await setupTestDB();

    // Create test user
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test123!',
        name: 'Test User'
      });

    testUserId = userRes.body.user.id;
    authToken = userRes.body.token;

    // Create test project
    const projectRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Test Project' });

    testProjectId = projectRes.body.id;
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe('POST /api/tasks', () => {
    it('should create task with auth', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          project_id: testProjectId,
          title: 'Integration Test Task',
          priority: 'HIGH',
          status: 'TODO'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Integration Test Task');
    });

    it('should reject without auth token', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          project_id: testProjectId,
          title: 'Task'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Token missing');
    });

    it('should reject invalid data', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          project_id: testProjectId,
          title: 'ab', // Too short
          priority: 'INVALID'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Validation');
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // Create sample tasks
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          project_id: testProjectId,
          title: 'Task 1',
          status: 'TODO'
        });

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          project_id: testProjectId,
          title: 'Task 2',
          status: 'IN_PROGRESS'
        });
    });

    it('should get all tasks for project', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProjectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProjectId}/tasks?status=TODO`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].status).toBe('TODO');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let taskId: number;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          project_id: testProjectId,
          title: 'Task to Update'
        });

      taskId = res.body.id;
    });

    it('should update task', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'DONE' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('DONE');
    });

    it('should reject update without ownership', async () => {
      // Create different user
      const otherUserRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'other@example.com',
          password: 'Test123!',
          name: 'Other User'
        });

      const otherToken = otherUserRes.body.token;

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ status: 'DONE' });

      expect(response.status).toBe(404); // Not 403!
    });
  });
});
```

---

## 🎬 E2E Tests (5-10%)

**Foco**: Testar fluxos completos no browser

### Frontend E2E Test Example (Cypress)

```typescript
// tests/e2e/signup-login-create-task.spec.ts

describe('User Journey: Signup → Login → Create Task', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should complete full flow', () => {
    // Step 1: Signup
    cy.contains('Sign Up').click();
    cy.get('[data-testid=signup-email]').type('newuser@example.com');
    cy.get('[data-testid=signup-password]').type('Test123!');
    cy.get('[data-testid=signup-confirm-password]').type('Test123!');
    cy.get('[data-testid=signup-submit]').click();

    // Verify redirect to login
    cy.url().should('include', '/login');
    cy.contains('Check your email to verify').should('be.visible');

    // Step 2: Skip verification (test mode) or verify
    // (In real world, verify email link)

    // Step 3: Login
    cy.get('[data-testid=login-email]').type('newuser@example.com');
    cy.get('[data-testid=login-password]').type('Test123!');
    cy.get('[data-testid=login-submit]').click();

    // Verify redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome').should('be.visible');

    // Step 4: Create Project
    cy.get('[data-testid=create-project-btn]').click();
    cy.get('[data-testid=project-name]').type('My First Project');
    cy.get('[data-testid=project-submit]').click();

    // Verify project created
    cy.contains('My First Project').should('be.visible');

    // Step 5: Create Task
    cy.get('[data-testid=create-task-btn]').click();
    cy.get('[data-testid=task-title]').type('First Task');
    cy.get('[data-testid=task-priority]').select('HIGH');
    cy.get('[data-testid=task-submit]').click();

    // Verify task created in list
    cy.get('[data-testid=task-list]').should('contain', 'First Task');
    cy.get('[data-testid=task-list]').should('contain', 'HIGH');

    // Step 6: Update Task Status
    cy.get('[data-testid=task-item-First Task]').click();
    cy.get('[data-testid=task-status]').select('IN_PROGRESS');
    cy.get('[data-testid=task-save]').click();

    // Verify status updated
    cy.get('[data-testid=task-item-First Task]').should(
      'contain',
      'IN_PROGRESS'
    );

    // Step 7: Logout
    cy.get('[data-testid=user-menu]').click();
    cy.get('[data-testid=logout-btn]').click();

    // Verify redirect to login
    cy.url().should('include', '/login');
  });

  it('should handle errors gracefully', () => {
    // Test invalid credentials
    cy.get('[data-testid=login-email]').type('wrong@example.com');
    cy.get('[data-testid=login-password]').type('WrongPassword123!');
    cy.get('[data-testid=login-submit]').click();

    // Error should be displayed
    cy.contains('Invalid credentials').should('be.visible');
    cy.url().should('include', '/login');
  });
});
```

---

## 🚀 Rodando Testes

### Backend

```bash
# Todos os testes
npm run test

# Watch mode (rerun on file change)
npm run test:watch

# Coverage report
npm run test:coverage

# Unit testes apenas
npm run test:unit

# Integration apenas
npm run test:integration

# Teste específico
npm run test -- tasks.service.spec.ts

# Verbose output
npm run test -- --verbose
```

### Frontend

```bash
# Todos os testes
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E tests (Cypress)
npm run test:e2e

# E2E headless
npm run test:e2e:headless
```

---

## 📊 Coverage Reports

```bash
# Generate coverage
npm run test:coverage

# Output:
# ======= Coverage summary =======
# Statements: 82.5% (660/800)
# Branches: 76.3% (412/540)
# Functions: 85.2% (280/330)
# Lines: 83.1% (664/800)

# View HTML report
open coverage/index.html
```

---

## ✅ Checklist Pré-Deploy

- [ ] Backend coverage > 80%
- [ ] Frontend coverage > 70%
- [ ] Todos unit tests passando
- [ ] Todos integration tests passando
- [ ] E2E críticos passando
- [ ] No console.logs (removidas)
- [ ] No hardcoded credentials
- [ ] No skipped tests (`it.skip`, `describe.skip`)

---

**Última Atualização**: 2026-04-08  
**Status**: ✅ Complete
