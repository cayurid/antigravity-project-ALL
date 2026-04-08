import { AppDataSource } from '../../entities/AppDataSource';
import { Task } from '../../entities/Task';
import { DeleteResult, UpdateResult } from 'typeorm';

export class TaskRepository {
    /**
     * Listar tasks com filtros
     */
    static async findByUser(userId: string, filters?: {
        status?: string;
        priority?: string;
        projectId?: string;
    }): Promise<Task[]> {
        try {
            const taskRepository = AppDataSource.getRepository(Task);
            let query = taskRepository.createQueryBuilder('task')
                .where('task.userId = :userId', { userId })
                .leftJoinAndSelect('task.tags', 'tags');

            if (filters?.status) {
                query = query.andWhere('task.status = :status', { status: filters.status });
            }
            if (filters?.priority) {
                query = query.andWhere('task.priority = :priority', { priority: filters.priority });
            }
            if (filters?.projectId) {
                query = query.andWhere('task.projectId = :projectId', { projectId: filters.projectId });
            }

            return await query.orderBy('task.order', 'ASC').addOrderBy('task.createdAt', 'DESC').getMany();
        } catch (error) {
            console.error('Error finding tasks by user:', error);
            return [];
        }
    }

    /**
     * Buscar task por ID
     */
    static async findById(id: string): Promise<Task | null> {
        try {
            const taskRepository = AppDataSource.getRepository(Task);
            return await taskRepository.findOne({
                where: { id },
                relations: ['tags', 'user', 'project']
            });
        } catch (error) {
            console.error('Error finding task by ID:', error);
            return null;
        }
    }

    /**
     * Criar nova task
     */
    static async create(taskData: Partial<Task>): Promise<Task | null> {
        try {
            const taskRepository = AppDataSource.getRepository(Task);
            const task = taskRepository.create(taskData);
            return await taskRepository.save(task);
        } catch (error) {
            console.error('Error creating task:', error);
            return null;
        }
    }

    /**
     * Atualizar task
     */
    static async update(id: string, updates: Partial<Task>): Promise<boolean> {
        try {
            const taskRepository = AppDataSource.getRepository(Task);
            const result: UpdateResult = await taskRepository.update({ id }, updates);
            return result.affected ? (result.affected > 0) : false;
        } catch (error) {
            console.error('Error updating task:', error);
            return false;
        }
    }

    /**
     * Soft delete (marcar como deletado)
     */
    static async softDelete(id: string): Promise<boolean> {
        try {
            const taskRepository = AppDataSource.getRepository(Task);
            await taskRepository.update({ id }, { status: 'cancelled' });
            return true;
        } catch (error) {
            console.error('Error deleting task:', error);
            return false;
        }
    }

    /**
     * Deletar fisicamente task
     */
    static async hardDelete(id: string): Promise<boolean> {
        try {
            const taskRepository = AppDataSource.getRepository(Task);
            const result: DeleteResult = await taskRepository.delete({ id });
            return result.affected ? (result.affected > 0) : false;
        } catch (error) {
            console.error('Error hard deleting task:', error);
            return false;
        }
    }

    /**
     * Contar tasks do usuário
     */
    static async countByUser(userId: string): Promise<number> {
        try {
            const taskRepository = AppDataSource.getRepository(Task);
            return await taskRepository.count({
                where: { userId }
            });
        } catch (error) {
            console.error('Error counting tasks:', error);
            return 0;
        }
    }

    /**
     * Listar tasks por projeto
     */
    static async findByProject(projectId: string): Promise<Task[]> {
        try {
            const taskRepository = AppDataSource.getRepository(Task);
            return await taskRepository.find({
                where: { projectId },
                relations: ['tags', 'user'],
                order: { order: 'ASC', createdAt: 'DESC' }
            });
        } catch (error) {
            console.error('Error finding tasks by project:', error);
            return [];
        }
    }

    /**
     * Atualizar status
     */
    static async updateStatus(id: string, status: 'todo' | 'in_progress' | 'done' | 'cancelled'): Promise<boolean> {
        try {
            const taskRepository = AppDataSource.getRepository(Task);
            const updates: any = { status };

            // Se marcar como done, registrar completedAt
            if (status === 'done') {
                updates.completedAt = new Date();
            } else {
                updates.completedAt = null;
            }

            await taskRepository.update({ id }, updates);
            return true;
        } catch (error) {
            console.error('Error updating task status:', error);
            return false;
        }
    }
}
