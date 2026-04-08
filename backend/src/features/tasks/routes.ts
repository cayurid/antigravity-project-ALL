import { Router, Request, Response } from 'express';
import { authMiddleware, requireAuth } from '../../middlewares/auth';
import { TaskController } from './controller';

const router = Router();

/**
 * Tasks Routes
 * All routes require authentication
 */

// GET /api/tasks - List tasks with filters
router.get('/', authMiddleware, requireAuth, TaskController.list);

// POST /api/tasks - Create new task
router.post('/', authMiddleware, requireAuth, TaskController.create);

// GET /api/tasks/:id - Get task details
router.get('/:id', authMiddleware, requireAuth, TaskController.getById);

// PUT /api/tasks/:id - Update task
router.put('/:id', authMiddleware, requireAuth, TaskController.update);

// PATCH /api/tasks/:id/status - Update task status only
router.patch('/:id/status', authMiddleware, requireAuth, TaskController.updateStatus);

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', authMiddleware, requireAuth, TaskController.delete);

export default router;
