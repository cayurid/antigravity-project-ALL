import express from 'express';
import { DashboardRepository } from './DashboardRepository.js';

export class DashboardController {
    /**
     * GET /api/dashboard/overview
     * Obter resumo geral do dashboard
     */
    static async getOverview(req: express.Request, res: express.Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'User not authenticated' });
                return;
            }

            const overview = await DashboardRepository.getOverviewStats(userId);
            const byStatus = await DashboardRepository.getTasksByStatus(userId);
            const byPriority = await DashboardRepository.getTasksByPriority(userId);
            const projects = await DashboardRepository.getProjectsStats(userId);

            res.status(200).json({
                success: true,
                data: {
                    overview,
                    byStatus,
                    byPriority,
                    projects,
                },
            });
        } catch (error) {
            console.error('Error in getOverview:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching dashboard overview',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
            });
        }
    }

    /**
     * GET /api/dashboard/stats
     * Obter estatísticas completas
     */
    static async getStats(req: express.Request, res: express.Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'User not authenticated' });
                return;
            }

            const overview = await DashboardRepository.getOverviewStats(userId);
            const priorityStatusMatrix = await DashboardRepository.getPriorityStatusMatrix(userId);
            const weeklyDistribution = await DashboardRepository.getWeeklyDistribution(userId);

            res.status(200).json({
                success: true,
                data: {
                    overview,
                    priorityStatusMatrix,
                    weeklyDistribution,
                },
            });
        } catch (error) {
            console.error('Error in getStats:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching dashboard stats',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
            });
        }
    }

    /**
     * GET /api/dashboard/recent
     * Obter tarefas recentes
     */
    static async getRecent(req: express.Request, res: express.Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'User not authenticated' });
                return;
            }

            const limit = parseInt((req.query.limit as string) || '5', 10);
            const tasks = await DashboardRepository.getRecentTasks(userId, limit);

            res.status(200).json({
                success: true,
                data: tasks,
                count: tasks.length,
            });
        } catch (error) {
            console.error('Error in getRecent:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching recent tasks',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
            });
        }
    }

    /**
     * GET /api/dashboard/upcoming
     * Obter tarefas próximas
     */
    static async getUpcoming(req: express.Request, res: express.Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'User not authenticated' });
                return;
            }

            const limit = parseInt((req.query.limit as string) || '5', 10);
            const tasks = await DashboardRepository.getUpcomingTasks(userId, limit);

            res.status(200).json({
                success: true,
                data: tasks,
                count: tasks.length,
            });
        } catch (error) {
            console.error('Error in getUpcoming:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching upcoming tasks',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
            });
        }
    }

    /**
     * GET /api/dashboard/overdue
     * Obter tarefas atrasadas
     */
    static async getOverdue(req: express.Request, res: express.Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'User not authenticated' });
                return;
            }

            const tasks = await DashboardRepository.getOverdueTasks(userId);

            res.status(200).json({
                success: true,
                data: tasks,
                count: tasks.length,
            });
        } catch (error) {
            console.error('Error in getOverdue:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching overdue tasks',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
            });
        }
    }

    /**
     * GET /api/dashboard/projects
     * Obter estatísticas por projeto
     */
    static async getProjectStats(req: express.Request, res: express.Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'User not authenticated' });
                return;
            }

            const projects = await DashboardRepository.getProjectsStats(userId);

            res.status(200).json({
                success: true,
                data: projects,
                count: projects.length,
            });
        } catch (error) {
            console.error('Error in getProjectStats:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching project stats',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
            });
        }
    }
}
