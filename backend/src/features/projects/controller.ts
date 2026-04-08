import express from 'express';
import { ProjectRepository } from './ProjectRepository';
import type { Project } from '../../entities/Project';

export class ProjectController {
    /**
     * GET /api/projects
     * Listar projects do usuário
     */
    static async list(req: express.Request, res: express.Response): Promise<void> {
        try {
            const ownerId = (req as any).user?.id;
            if (!ownerId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            const { status } = req.query;
            const filters: any = {};
            if (status) filters.status = status as string;

            const projects = await ProjectRepository.findByOwner(ownerId, filters);

            res.status(200).json({
                success: true,
                message: 'Projects retrieved',
                data: projects,
                count: projects.length,
            });
        } catch (error) {
            console.error('List projects error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }

    /**
     * POST /api/projects
     * Criar novo project
     */
    static async create(req: express.Request, res: express.Response): Promise<void> {
        try {
            const ownerId = (req as any).user?.id;
            if (!ownerId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            const { name, description, color, icon } = req.body;

            if (!name || name.trim().length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: ['Name is required'],
                });
                return;
            }

            const projectData: Partial<Project> = {
                name: name.trim(),
                description: description?.trim() || null,
                color: color || '#3498db',
                icon: icon || null,
                ownerId,
                status: 'active',
            };

            const project = await ProjectRepository.create(projectData);
            if (!project) {
                res.status(500).json({
                    success: false,
                    message: 'Failed to create project',
                });
                return;
            }

            res.status(201).json({
                success: true,
                message: 'Project created successfully',
                data: project,
            });
        } catch (error) {
            console.error('Create project error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }

    /**
     * GET /api/projects/:id
     * Obter detalhes do project
     */
    static async getById(req: express.Request, res: express.Response): Promise<void> {
        try {
            const ownerId = (req as any).user?.id;
            if (!ownerId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            const { id } = req.params;
            const project = await ProjectRepository.findById(id);

            if (!project) {
                res.status(404).json({
                    success: false,
                    message: 'Project not found',
                });
                return;
            }

            // Verificar se project pertence ao usuário
            if (project.ownerId !== ownerId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Project retrieved',
                data: project,
            });
        } catch (error) {
            console.error('Get project error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }

    /**
     * PUT /api/projects/:id
     * Atualizar project
     */
    static async update(req: express.Request, res: express.Response): Promise<void> {
        try {
            const ownerId = (req as any).user?.id;
            if (!ownerId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            const { id } = req.params;
            const { name, description, color, icon } = req.body;

            const existingProject = await ProjectRepository.findById(id);
            if (!existingProject) {
                res.status(404).json({
                    success: false,
                    message: 'Project not found',
                });
                return;
            }

            if (existingProject.ownerId !== ownerId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
                return;
            }

            const updates: Partial<Project> = {};
            if (name !== undefined) updates.name = name;
            if (description !== undefined) updates.description = description;
            if (color !== undefined) updates.color = color;
            if (icon !== undefined) updates.icon = icon;

            await ProjectRepository.update(id, updates);
            const updatedProject = await ProjectRepository.findById(id);

            res.status(200).json({
                success: true,
                message: 'Project updated successfully',
                data: updatedProject,
            });
        } catch (error) {
            console.error('Update project error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }

    /**
     * DELETE /api/projects/:id
     * Deletar project (soft delete - arquivar)
     */
    static async delete(req: express.Request, res: express.Response): Promise<void> {
        try {
            const ownerId = (req as any).user?.id;
            if (!ownerId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            const { id } = req.params;
            const project = await ProjectRepository.findById(id);

            if (!project) {
                res.status(404).json({
                    success: false,
                    message: 'Project not found',
                });
                return;
            }

            if (project.ownerId !== ownerId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
                return;
            }

            const deleted = await ProjectRepository.archive(id);
            if (!deleted) {
                res.status(500).json({
                    success: false,
                    message: 'Failed to delete project',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Project archived successfully',
            });
        } catch (error) {
            console.error('Delete project error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }
}
