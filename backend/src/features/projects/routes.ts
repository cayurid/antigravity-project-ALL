import { Router } from 'express';
import { authMiddleware, requireAuth } from '../../middlewares/auth';
import { ProjectController } from './controller';

const router = Router();

/**
 * Projects Routes
 * All routes require authentication
 */

// GET /api/projects - List projects
router.get('/', authMiddleware, requireAuth, ProjectController.list);

// POST /api/projects - Create new project
router.post('/', authMiddleware, requireAuth, ProjectController.create);

// GET /api/projects/:id - Get project details
router.get('/:id', authMiddleware, requireAuth, ProjectController.getById);

// PUT /api/projects/:id - Update project
router.put('/:id', authMiddleware, requireAuth, ProjectController.update);

// DELETE /api/projects/:id - Archive project
router.delete('/:id', authMiddleware, requireAuth, ProjectController.delete);

export default router;
