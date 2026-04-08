import express from 'express';
import { TaskRepository } from './TaskRepository';
import { UserRepository } from '../auth/UserRepository';
import type { Task } from '../../entities/Task';

export class TaskController {
    /**
     * GET /api/tasks
     * Listar tasks do usuário com filtros opcionais
     */
    static async list(req: express.Request, res: express.Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            // Extrair filtros da query
            const { status, priority, projectId } = req.query;
            const filters: any = {};
            if (status) filters.status = status as string;
            if (priority) filters.priority = priority as string;
            if (projectId) filters.projectId = projectId as string;

            const tasks = await TaskRepository.findByUser(userId, filters);

            res.status(200).json({
                success: true,
                message: 'Tasks retrieved',
                data: tasks,
                count: tasks.length,
            });
        } catch (error) {
            console.error('List tasks error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * POST /api/tasks
     * Criar nova task
     */
    static async create(req: express.Request, res: express.Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            const { title, description, priority, dueDate, projectId } = req.body;

            // Validar dados obrigatórios
            if (!title || title.trim().length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: ['Title is required and cannot be empty'],
                });
                return;
            }

            // Se tiver projectId, validar que projeto pertence ao usuário
            if (projectId) {
                // TODO: Verificar se projeto pertence ao usuário
            }

            const taskData: Partial<Task> = {
                title: title.trim(),
                description: description?.trim() || null,
                priority: priority || 'medium',
                dueDate: dueDate ? new Date(dueDate) : undefined,
                userId,
                projectId: projectId || null,
                status: 'todo',
                order: 0,
            };

            const task = await TaskRepository.create(taskData);
            if (!task) {
                res.status(500).json({
                    success: false,
                    message: 'Failed to create task',
                });
                return;
            }

            res.status(201).json({
                success: true,
                message: 'Task created successfully',
                data: task,
            });
        } catch (error) {
            console.error('Create task error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * GET /api/tasks/:id
     * Obter detalhes de uma task
     */
    static async getById(req: express.Request, res: express.Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            const { id } = req.params;
            const task = await TaskRepository.findById(id);

            if (!task) {
                res.status(404).json({
                    success: false,
                    message: 'Task not found',
                });
                return;
            }

            // Verificar se task pertence ao usuário
            if (task.userId !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Task retrieved',
                data: task,
            });
        } catch (error) {
            console.error('Get task error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }

    /**
     * PUT /api/tasks/:id
     * Atualizar task
     */
    static async update(req: express.Request, res: express.Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            const { id } = req.params;
            const { title, description, status, priority, dueDate } = req.body;

            // Buscar task existente
            const existingTask = await TaskRepository.findById(id);
            if (!existingTask) {
                res.status(404).json({
                    success: false,
                    message: 'Task not found',
                });
                return;
            }

            // Verificar se task pertence ao usuário
            if (existingTask.userId !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
                return;
            }

            // Preparar dados para atualização
            const updates: Partial<Task> = {};
            if (title !== undefined) updates.title = title;
            if (description !== undefined) updates.description = description;
            if (priority !== undefined) updates.priority = priority;
            if (dueDate !== undefined) updates.dueDate = dueDate ? new Date(dueDate) : undefined;

            // Se status foi alterado
            if (status !== undefined) {
                await TaskRepository.updateStatus(id, status);
            } else {
                await TaskRepository.update(id, updates);
            }

            // Buscar task atualizada
            const updatedTask = await TaskRepository.findById(id);

            res.status(200).json({
                success: true,
                message: 'Task updated successfully',
                data: updatedTask,
            });
        } catch (error) {
            console.error('Update task error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }

    /**
     * DELETE /api/tasks/:id
     * Deletar task (soft delete - marcar como cancelled)
     */
    static async delete(req: express.Request, res: express.Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            const { id } = req.params;
            const task = await TaskRepository.findById(id);

            if (!task) {
                res.status(404).json({
                    success: false,
                    message: 'Task not found',
                });
                return;
            }

            // Verificar permissão
            if (task.userId !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
                return;
            }

            // Soft delete
            const deleted = await TaskRepository.softDelete(id);
            if (!deleted) {
                res.status(500).json({
                    success: false,
                    message: 'Failed to delete task',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Task deleted successfully',
            });
        } catch (error) {
            console.error('Delete task error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }

    /**
     * PATCH /api/tasks/:id/status
     * Atualizar apenas o status
     */
    static async updateStatus(req: express.Request, res: express.Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            const { id } = req.params;
            const { status } = req.body;

            if (!['todo', 'in_progress', 'done', 'cancelled'].includes(status)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid status',
                    error: 'Status must be one of: todo, in_progress, done, cancelled',
                });
                return;
            }

            const task = await TaskRepository.findById(id);
            if (!task) {
                res.status(404).json({
                    success: false,
                    message: 'Task not found',
                });
                return;
            }

            if (task.userId !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
                return;
            }

            const updated = await TaskRepository.updateStatus(id, status);
            if (!updated) {
                res.status(500).json({
                    success: false,
                    message: 'Failed to update task status',
                });
                return;
            }

            const updatedTask = await TaskRepository.findById(id);
            res.status(200).json({
                success: true,
                message: 'Task status updated successfully',
                data: updatedTask,
            });
        } catch (error) {
            console.error('Update task status error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }
}
