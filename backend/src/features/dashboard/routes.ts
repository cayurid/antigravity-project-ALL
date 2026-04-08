import { Router } from 'express';
import { DashboardController } from './controller.js';
import { authMiddleware, requireAuth } from '../../middlewares/auth.js';

const router = Router();

/**
 * @route   GET /api/dashboard/overview
 * @desc    Obter resumo geral do dashboard
 * @access  Private
 */
router.get('/overview', authMiddleware, requireAuth, DashboardController.getOverview);

/**
 * @route   GET /api/dashboard/stats
 * @desc    Obter estatísticas completas (priority/status matrix, weekly distribution)
 * @access  Private
 */
router.get('/stats', authMiddleware, requireAuth, DashboardController.getStats);

/**
 * @route   GET /api/dashboard/recent
 * @desc    Obter tarefas recentes
 * @access  Private
 * @query   limit - número de tarefas (padrão: 5)
 */
router.get('/recent', authMiddleware, requireAuth, DashboardController.getRecent);

/**
 * @route   GET /api/dashboard/upcoming
 * @desc    Obter tarefas próximas (com dueDate)
 * @access  Private
 * @query   limit - número de tarefas (padrão: 5)
 */
router.get('/upcoming', authMiddleware, requireAuth, DashboardController.getUpcoming);

/**
 * @route   GET /api/dashboard/overdue
 * @desc    Obter tarefas atrasadas
 * @access  Private
 */
router.get('/overdue', authMiddleware, requireAuth, DashboardController.getOverdue);

/**
 * @route   GET /api/dashboard/projects
 * @desc    Obter estatísticas por projeto
 * @access  Private
 */
router.get('/projects', authMiddleware, requireAuth, DashboardController.getProjectStats);

export default router;
