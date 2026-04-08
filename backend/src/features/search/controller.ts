import express from 'express';
import { SearchRepository, SearchFilters } from './SearchRepository.js';

export class SearchController {
    /**
     * GET /api/search
     * Busca avançada de tasks
     */
    static async search(req: express.Request, res: express.Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'User not authenticated' });
                return;
            }

            const filters: SearchFilters = {
                query: (req.query.query as string) || undefined,
                status: (req.query.status as string) || undefined,
                priority: (req.query.priority as string) || undefined,
                projectId: (req.query.projectId as string) || undefined,
                tagIds: req.query.tagIds ? (req.query.tagIds as string).split(',') : undefined,
                sort: (req.query.sort as 'date' | 'title' | 'priority' | 'dueDate') || 'date',
                sortOrder: (req.query.sortOrder as 'ASC' | 'DESC') || 'DESC',
                skip: parseInt((req.query.skip as string) || '0', 10),
                take: parseInt((req.query.take as string) || '10', 10),
            };

            // Filtros de data
            if (req.query.startDate) {
                filters.startDate = new Date(req.query.startDate as string);
            }
            if (req.query.endDate) {
                filters.endDate = new Date(req.query.endDate as string);
            }

            // Filtros booleanos
            if (req.query.completed !== undefined) {
                filters.completed = req.query.completed === 'true';
            }
            if (req.query.overdue !== undefined) {
                filters.overdue = req.query.overdue === 'true';
            }

            const { tasks, total } = await SearchRepository.search(userId, filters);

            res.status(200).json({
                success: true,
                data: tasks,
                pagination: {
                    total,
                    skip: filters.skip,
                    take: filters.take,
                    pages: Math.ceil(total / (filters.take || 10)),
                },
            });
        } catch (error) {
            console.error('Error searching:', error);
            res.status(500).json({
                success: false,
                message: 'Error searching tasks',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
            });
        }
    }

    /**
     * GET /api/search/quick
     * Busca rápida por texto
     */
    static async quickSearch(req: express.Request, res: express.Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'User not authenticated' });
                return;
            }

            const query = (req.query.q as string) || '';
            const limit = parseInt((req.query.limit as string) || '5', 10);

            const tasks = await SearchRepository.quickSearch(userId, query, limit);

            res.status(200).json({
                success: true,
                data: tasks,
                count: tasks.length,
            });
        } catch (error) {
            console.error('Error quick searching:', error);
            res.status(500).json({
                success: false,
                message: 'Error performing quick search',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
            });
        }
    }

    /**
     * GET /api/search/global
     * Busca global multipla
     */
    static async globalSearch(req: express.Request, res: express.Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'User not authenticated' });
                return;
            }

            const query = (req.query.q as string) || '';
            const limit = parseInt((req.query.limit as string) || '5', 10);

            const result = await SearchRepository.globalSearch(userId, query, limit);

            res.status(200).json({
                success: true,
                data: result,
                count: {
                    tasks: result.tasks.length,
                    projects: result.projects.length,
                    tags: result.tags.length,
                },
            });
        } catch (error) {
            console.error('Error global searching:', error);
            res.status(500).json({
                success: false,
                message: 'Error performing global search',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
            });
        }
    }

    /**
     * GET /api/search/suggestions
     * Obter sugestões de palavras
     */
    static async getSuggestions(req: express.Request, res: express.Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'User not authenticated' });
                return;
            }

            const prefix = (req.query.prefix as string) || '';
            const limit = parseInt((req.query.limit as string) || '5', 10);

            if (prefix.length < 2) {
                res.status(200).json({
                    success: true,
                    data: [],
                    message: 'Prefix must be at least 2 characters',
                });
                return;
            }

            const suggestions = await SearchRepository.getSuggestions(userId, prefix, limit);

            res.status(200).json({
                success: true,
                data: suggestions,
                count: suggestions.length,
            });
        } catch (error) {
            console.error('Error getting suggestions:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting suggestions',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
            });
        }
    }

    /**
     * GET /api/search/criteria
     * Busca por múltiplos critérios
     */
    static async searchByCriteria(req: express.Request, res: express.Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'User not authenticated' });
                return;
            }

            const criteria = {
                statuses: req.query.statuses ? (req.query.statuses as string).split(',') : undefined,
                priorities: req.query.priorities ? (req.query.priorities as string).split(',') : undefined,
                projectIds: req.query.projectIds ? (req.query.projectIds as string).split(',') : undefined,
                tagIds: req.query.tagIds ? (req.query.tagIds as string).split(',') : undefined,
            };

            const tasks = await SearchRepository.getTasksByMultipleCriteria(userId, criteria);

            res.status(200).json({
                success: true,
                data: tasks,
                count: tasks.length,
            });
        } catch (error) {
            console.error('Error searching by criteria:', error);
            res.status(500).json({
                success: false,
                message: 'Error searching by criteria',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
            });
        }
    }
}
