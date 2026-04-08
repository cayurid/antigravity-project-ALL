import express from 'express';
import { TagRepository } from './TagRepository.js';
import { TaskRepository } from '../tasks/TaskRepository.js';

export class TagController {
    /**
     * GET /api/tags
     * Listar todas as tags do usuário
     */
    static async list(req: express.Request, res: express.Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'User not authenticated' });
                return;
            }

            const tags = await TagRepository.findByUser(userId);

            res.status(200).json({
                success: true,
                data: tags,
                count: tags.length,
            });
        } catch (error) {
            console.error('Error listing tags:', error);
            res.status(500).json({
                success: false,
                message: 'Error listing tags',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
            });
        }
    }

    /**
     * POST /api/tags
     * Criar nova tag
     */
    static async create(req: express.Request, res: express.Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'User not authenticated' });
                return;
            }

            const { name, color } = req.body;

            if (!name || typeof name !== 'string' || name.trim().length === 0) {
                res.status(400).json({ success: false, message: 'Tag name is required' });
                return;
            }

            const tag = await TagRepository.create({
                name: name.trim(),
                color: color || '#95a5a6',
            });

            if (!tag) {
                res.status(400).json({ success: false, message: 'Tag already exists' });
                return;
            }

            res.status(201).json({
                success: true,
                message: 'Tag created successfully',
                data: tag,
            });
        } catch (error) {
            console.error('Error creating tag:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating tag',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
            });
        }
    }

    /**
     * GET /api/tags/:id
     * Obter tag por ID
     */
    static async getById(req: express.Request, res: express.Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'User not authenticated' });
                return;
            }

            const { id } = req.params;
            const tag = await TagRepository.findById(id);

            if (!tag) {
                res.status(404).json({ success: false, message: 'Tag not found' });
                return;
            }

            const usage = await TagRepository.countUsage(id);

            res.status(200).json({
                success: true,
                data: { ...tag, usage },
            });
        } catch (error) {
            console.error('Error getting tag:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting tag',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
            });
        }
    }

    /**
     * PUT /api/tags/:id
     * Atualizar tag
     */
    static async update(req: express.Request, res: express.Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'User not authenticated' });
                return;
            }

            const { id } = req.params;
            const { name, color } = req.body;

            const tag = await TagRepository.findById(id);
            if (!tag) {
                res.status(404).json({ success: false, message: 'Tag not found' });
                return;
            }

            const updates: any = {};
            if (name) updates.name = name.trim();
            if (color) updates.color = color;

            const success = await TagRepository.update(id, updates);
            if (!success) {
                res.status(400).json({ success: false, message: 'Error updating tag' });
                return;
            }

            const updated = await TagRepository.findById(id);
            res.status(200).json({
                success: true,
                message: 'Tag updated successfully',
                data: updated,
            });
        } catch (error) {
            console.error('Error updating tag:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating tag',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
            });
        }
    }

    /**
     * DELETE /api/tags/:id
     * Deletar tag
     */
    static async delete(req: express.Request, res: express.Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'User not authenticated' });
                return;
            }

            const { id } = req.params;
            const tag = await TagRepository.findById(id);

            if (!tag) {
                res.status(404).json({ success: false, message: 'Tag not found' });
                return;
            }

            const success = await TagRepository.hardDelete(id);
            if (!success) {
                res.status(500).json({ success: false, message: 'Error deleting tag' });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Tag deleted successfully',
            });
        } catch (error) {
            console.error('Error deleting tag:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting tag',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
            });
        }
    }

    /**
     * POST /api/tags/:id/tasks/:taskId
     * Adicionar tag a task
     */
    static async addToTask(req: express.Request, res: express.Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'User not authenticated' });
                return;
            }

            const { id: tagId, taskId } = req.params;

            // Verificar se task pertence ao usuário
            const task = await TaskRepository.findById(taskId);
            if (!task || task.userId !== userId) {
                res.status(403).json({ success: false, message: 'Access denied' });
                return;
            }

            const tag = await TagRepository.findById(tagId);
            if (!tag) {
                res.status(404).json({ success: false, message: 'Tag not found' });
                return;
            }

            const success = await TagRepository.addTagToTask(taskId, tagId);
            if (!success) {
                res.status(400).json({ success: false, message: 'Error adding tag to task' });
                return;
            }

            const updated = await TaskRepository.findById(taskId);
            res.status(200).json({
                success: true,
                message: 'Tag added to task',
                data: updated,
            });
        } catch (error) {
            console.error('Error adding tag to task:', error);
            res.status(500).json({
                success: false,
                message: 'Error adding tag to task',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
            });
        }
    }

    /**
     * DELETE /api/tags/:id/tasks/:taskId
     * Remover tag de task
     */
    static async removeFromTask(req: express.Request, res: express.Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'User not authenticated' });
                return;
            }

            const { id: tagId, taskId } = req.params;

            // Verificar se task pertence ao usuário
            const task = await TaskRepository.findById(taskId);
            if (!task || task.userId !== userId) {
                res.status(403).json({ success: false, message: 'Access denied' });
                return;
            }

            const success = await TagRepository.removeTagFromTask(taskId, tagId);
            if (!success) {
                res.status(400).json({ success: false, message: 'Error removing tag from task' });
                return;
            }

            const updated = await TaskRepository.findById(taskId);
            res.status(200).json({
                success: true,
                message: 'Tag removed from task',
                data: updated,
            });
        } catch (error) {
            console.error('Error removing tag from task:', error);
            res.status(500).json({
                success: false,
                message: 'Error removing tag from task',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
            });
        }
    }

    /**
     * GET /api/tags/:id/tasks
     * Obter tasks com uma tag
     */
    static async getTasksByTag(req: express.Request, res: express.Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'User not authenticated' });
                return;
            }

            const { id } = req.params;
            const tag = await TagRepository.findById(id);

            if (!tag) {
                res.status(404).json({ success: false, message: 'Tag not found' });
                return;
            }

            const tasks = await TagRepository.getTasksByTag(id);
            // Filtrar apenas tasks do usuário
            const userTasks = tasks.filter(t => t.userId === userId);

            res.status(200).json({
                success: true,
                data: userTasks,
                count: userTasks.length,
            });
        } catch (error) {
            console.error('Error getting tasks by tag:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting tasks by tag',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
            });
        }
    }
}
