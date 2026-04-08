import { AppDataSource } from '../../entities/AppDataSource.js';
import { Task } from '../../entities/Task.js';
import { ILike, Between } from 'typeorm';

export interface SearchFilters {
    query?: string;
    status?: string;
    priority?: string;
    projectId?: string;
    tagIds?: string[];
    startDate?: Date;
    endDate?: Date;
    completed?: boolean;
    overdue?: boolean;
    sort?: 'date' | 'title' | 'priority' | 'dueDate';
    sortOrder?: 'ASC' | 'DESC';
    skip?: number;
    take?: number;
}

export class SearchRepository {
    /**
     * Busca avançada de tasks
     */
    static async search(userId: string, filters: SearchFilters): Promise<{ tasks: Task[]; total: number }> {
        try {
            const taskRepository = AppDataSource.getRepository(Task);
            let query = taskRepository.createQueryBuilder('task')
                .where('task.userId = :userId', { userId })
                .leftJoinAndSelect('task.tags', 'tags')
                .leftJoinAndSelect('task.project', 'project');

            // Busca por texto
            if (filters.query && filters.query.trim()) {
                const searchTerm = `%${filters.query}%`;
                query = query.andWhere(
                    '(task.title ILIKE :query OR task.description ILIKE :query)',
                    { query: searchTerm }
                );
            }

            // Filtrar por status
            if (filters.status) {
                query = query.andWhere('task.status = :status', { status: filters.status });
            }

            // Filtrar por prioridade
            if (filters.priority) {
                query = query.andWhere('task.priority = :priority', { priority: filters.priority });
            }

            // Filtrar por projeto
            if (filters.projectId) {
                query = query.andWhere('task.projectId = :projectId', { projectId: filters.projectId });
            }

            // Filtrar por data
            if (filters.startDate || filters.endDate) {
                if (filters.startDate && filters.endDate) {
                    query = query.andWhere('task.createdAt BETWEEN :startDate AND :endDate', {
                        startDate: filters.startDate,
                        endDate: filters.endDate,
                    });
                } else if (filters.startDate) {
                    query = query.andWhere('task.createdAt >= :startDate', { startDate: filters.startDate });
                } else if (filters.endDate) {
                    query = query.andWhere('task.createdAt <= :endDate', { endDate: filters.endDate });
                }
            }

            // Filtrar por dueDate
            if (filters.completed !== undefined) {
                if (filters.completed) {
                    query = query.andWhere('task.status = :done', { done: 'done' });
                } else {
                    query = query.andWhere('task.status != :done', { done: 'done' });
                }
            }

            // Filtrar por atrasadas
            if (filters.overdue) {
                const now = new Date();
                query = query.andWhere('task.dueDate < :now AND task.status != :done AND task.status != :cancelled', {
                    now,
                    done: 'done',
                    cancelled: 'cancelled',
                });
            }

            // Ordenação
            const sortField = filters.sort === 'date' ? 'task.createdAt' :
                filters.sort === 'title' ? 'task.title' :
                    filters.sort === 'priority' ? 'task.priority' :
                        filters.sort === 'dueDate' ? 'task.dueDate' :
                            'task.createdAt';

            const sortOrder = filters.sortOrder || 'DESC';
            query = query.orderBy(sortField, sortOrder);

            // Paginação
            const skip = filters.skip || 0;
            const take = filters.take || 10;

            const [tasks, total] = await query.skip(skip).take(take).getManyAndCount();

            return { tasks, total };
        } catch (error) {
            console.error('Error searching tasks:', error);
            return { tasks: [], total: 0 };
        }
    }

    /**
     * Busca rápida (apenas por texto)
     */
    static async quickSearch(userId: string, query: string, limit: number = 5): Promise<Task[]> {
        try {
            if (!query || query.trim().length === 0) {
                return [];
            }

            const taskRepository = AppDataSource.getRepository(Task);
            const searchTerm = `%${query}%`;

            return await taskRepository
                .createQueryBuilder('task')
                .where('task.userId = :userId', { userId })
                .andWhere(
                    '(task.title ILIKE :query OR task.description ILIKE :query)',
                    { query: searchTerm }
                )
                .leftJoinAndSelect('task.tags', 'tags')
                .leftJoinAndSelect('task.project', 'project')
                .orderBy('task.title', 'ASC')
                .take(limit)
                .getMany();
        } catch (error) {
            console.error('Error quick searching tasks:', error);
            return [];
        }
    }

    /**
     * Busca global (tasks, projects, tags)
     */
    static async globalSearch(userId: string, query: string, limit: number = 5) {
        try {
            if (!query || query.trim().length === 0) {
                return { tasks: [], projects: [], tags: [] };
            }

            const taskRepository = AppDataSource.getRepository(Task);
            const projectRepository = AppDataSource.getRepository(Task).manager.getRepository('Project');
            const tagRepository = AppDataSource.getRepository(Task).manager.getRepository('Tag');

            const searchTerm = `%${query}%`;

            // Buscar tasks
            const tasks = await taskRepository
                .createQueryBuilder('task')
                .where('task.userId = :userId', { userId })
                .andWhere(
                    '(task.title ILIKE :query OR task.description ILIKE :query)',
                    { query: searchTerm }
                )
                .leftJoinAndSelect('task.tags', 'tags')
                .orderBy('task.title', 'ASC')
                .take(limit)
                .getMany();

            return { tasks, projects: [], tags: [] };
        } catch (error) {
            console.error('Error global searching:', error);
            return { tasks: [], projects: [], tags: [] };
        }
    }

    /**
     * Buscar sugestões de palavras
     */
    static async getSuggestions(userId: string, prefix: string, limit: number = 5): Promise<string[]> {
        try {
            const taskRepository = AppDataSource.getRepository(Task);

            const result = await taskRepository
                .createQueryBuilder('task')
                .select('DISTINCT task.title', 'title')
                .where('task.userId = :userId', { userId })
                .andWhere('task.title ILIKE :prefix', { prefix: `${prefix}%` })
                .orderBy('task.title', 'ASC')
                .take(limit)
                .getRawMany();

            return result.map((r: any) => r.title);
        } catch (error) {
            console.error('Error getting suggestions:', error);
            return [];
        }
    }

    /**
     * Busca salva
     */
    static async getTasksByMultipleCriteria(userId: string, criteria: {
        statuses?: string[];
        priorities?: string[];
        projectIds?: string[];
        tagIds?: string[];
    }): Promise<Task[]> {
        try {
            const taskRepository = AppDataSource.getRepository(Task);
            let query = taskRepository
                .createQueryBuilder('task')
                .where('task.userId = :userId', { userId })
                .leftJoinAndSelect('task.tags', 'tags')
                .leftJoinAndSelect('task.project', 'project');

            if (criteria.statuses && criteria.statuses.length > 0) {
                query = query.andWhere('task.status IN (:statuses)', { statuses: criteria.statuses });
            }

            if (criteria.priorities && criteria.priorities.length > 0) {
                query = query.andWhere('task.priority IN (:priorities)', { priorities: criteria.priorities });
            }

            if (criteria.projectIds && criteria.projectIds.length > 0) {
                query = query.andWhere('task.projectId IN (:projectIds)', { projectIds: criteria.projectIds });
            }

            return await query.orderBy('task.createdAt', 'DESC').getMany();
        } catch (error) {
            console.error('Error getting tasks by multiple criteria:', error);
            return [];
        }
    }
}
