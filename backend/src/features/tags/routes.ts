import { Router } from 'express';
import { TagController } from './controller.js';
import { authMiddleware, requireAuth } from '../../middlewares/auth.js';

const router = Router();

/**
 * @route   GET /api/tags
 * @desc    Listar todas as tags do usuário
 * @access  Private
 */
router.get('/', authMiddleware, requireAuth, TagController.list);

/**
 * @route   POST /api/tags
 * @desc    Criar nova tag
 * @access  Private
 * @body    { name: string, color?: string }
 */
router.post('/', authMiddleware, requireAuth, TagController.create);

/**
 * @route   GET /api/tags/:id
 * @desc    Obter tag por ID
 * @access  Private
 */
router.get('/:id', authMiddleware, requireAuth, TagController.getById);

/**
 * @route   PUT /api/tags/:id
 * @desc    Atualizar tag
 * @access  Private
 * @body    { name?: string, color?: string }
 */
router.put('/:id', authMiddleware, requireAuth, TagController.update);

/**
 * @route   DELETE /api/tags/:id
 * @desc    Deletar tag
 * @access  Private
 */
router.delete('/:id', authMiddleware, requireAuth, TagController.delete);

/**
 * @route   GET /api/tags/:id/tasks
 * @desc    Obter tasks com uma tag
 * @access  Private
 */
router.get('/:id/tasks', authMiddleware, requireAuth, TagController.getTasksByTag);

/**
 * @route   POST /api/tags/:id/tasks/:taskId
 * @desc    Adicionar tag a task
 * @access  Private
 */
router.post('/:id/tasks/:taskId', authMiddleware, requireAuth, TagController.addToTask);

/**
 * @route   DELETE /api/tags/:id/tasks/:taskId
 * @desc    Remover tag de task
 * @access  Private
 */
router.delete('/:id/tasks/:taskId', authMiddleware, requireAuth, TagController.removeFromTask);

export default router;
