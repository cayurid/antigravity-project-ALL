import { AppDataSource } from '../../entities/AppDataSource';
import { Task } from '../../entities/Task';
import { Project } from '../../entities/Project';

export class DashboardRepository {
    /**
     * Obter estatísticas gerais do usuário
     */
    static async getOverviewStats(userId: string) {
        try {
            const taskRepository = AppDataSource.getRepository(Task);

            const total = await taskRepository.count({ where: { userId } });
            const done = await taskRepository.count({
                where: { userId, status: 'done' }
            });
            const inProgress = await taskRepository.count({
                where: { userId, status: 'in_progress' }
            });
            const todo = await taskRepository.count({
                where: { userId, status: 'todo' }
            });
            const cancelled = await taskRepository.count({
                where: { userId, status: 'cancelled' }
            });

            return {
                total,
                done,
                inProgress,
                todo,
                cancelled,
                completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
            };
        } catch (error) {
            console.error('Error getting overview stats:', error);
            return null;
        }
    }

    /**
     * Obter tarefas por status
     */
    static async getTasksByStatus(userId: string) {
        try {
            const taskRepository = AppDataSource.getRepository(Task);

            const result = await taskRepository
                .createQueryBuilder('task')
                .select('task.status', 'status')
                .addSelect('COUNT(*)', 'count')
                .where('task.userId = :userId', { userId })
                .groupBy('task.status')
                .getRawMany();

            return result.map((r: any) => ({
                status: r.status,
                count: parseInt(r.count, 10),
            }));
        } catch (error) {
            console.error('Error getting tasks by status:', error);
            return [];
        }
    }

    /**
     * Obter tarefas por prioridade
     */
    static async getTasksByPriority(userId: string) {
        try {
            const taskRepository = AppDataSource.getRepository(Task);

            const result = await taskRepository
                .createQueryBuilder('task')
                .select('task.priority', 'priority')
                .addSelect('COUNT(*)', 'count')
                .where('task.userId = :userId', { userId })
                .andWhere('task.status != :cancelled', { cancelled: 'cancelled' })
                .groupBy('task.priority')
                .getRawMany();

            return result.map((r: any) => ({
                priority: r.priority,
                count: parseInt(r.count, 10),
            }));
        } catch (error) {
            console.error('Error getting tasks by priority:', error);
            return [];
        }
    }

    /**
     * Obter tarefas recentes
     */
    static async getRecentTasks(userId: string, limit: number = 5) {
        try {
            const taskRepository = AppDataSource.getRepository(Task);

            return await taskRepository
                .createQueryBuilder('task')
                .where('task.userId = :userId', { userId })
                .orderBy('task.createdAt', 'DESC')
                .take(limit)
                .leftJoinAndSelect('task.project', 'project')
                .getMany();
        } catch (error) {
            console.error('Error getting recent tasks:', error);
            return [];
        }
    }

    /**
     * Obter tarefas próximas (com dueDate)
     */
    static async getUpcomingTasks(userId: string, limit: number = 5) {
        try {
            const taskRepository = AppDataSource.getRepository(Task);
            const now = new Date();

            return await taskRepository
                .createQueryBuilder('task')
                .where('task.userId = :userId', { userId })
                .andWhere('task.dueDate IS NOT NULL')
                .andWhere('task.dueDate > :now', { now })
                .andWhere('task.status != :cancelled AND task.status != :done', {
                    cancelled: 'cancelled',
                    done: 'done'
                })
                .orderBy('task.dueDate', 'ASC')
                .take(limit)
                .leftJoinAndSelect('task.project', 'project')
                .getMany();
        } catch (error) {
            console.error('Error getting upcoming tasks:', error);
            return [];
        }
    }

    /**
     * Obter estatísticas por projeto
     */
    static async getProjectsStats(userId: string) {
        try {
            const projectRepository = AppDataSource.getRepository(Project);

            const projects = await projectRepository
                .createQueryBuilder('project')
                .leftJoinAndSelect('project.tasks', 'tasks')
                .where('project.ownerId = :userId', { userId })
                .getMany();

            return projects.map(project => ({
                id: project.id,
                name: project.name,
                totalTasks: project.tasks?.length || 0,
                completedTasks: project.tasks?.filter(t => t.status === 'done').length || 0,
                inProgressTasks: project.tasks?.filter(t => t.status === 'in_progress').length || 0,
                completionRate: project.tasks && project.tasks.length > 0
                    ? Math.round((project.tasks.filter(t => t.status === 'done').length / project.tasks.length) * 100)
                    : 0,
            }));
        } catch (error) {
            console.error('Error getting projects stats:', error);
            return [];
        }
    }

    /**
     * Obter tarefas por prioridade e status (matrix)
     */
    static async getPriorityStatusMatrix(userId: string) {
        try {
            const taskRepository = AppDataSource.getRepository(Task);

            const result = await taskRepository
                .createQueryBuilder('task')
                .select('task.priority', 'priority')
                .addSelect('task.status', 'status')
                .addSelect('COUNT(*)', 'count')
                .where('task.userId = :userId', { userId })
                .groupBy('task.priority')
                .addGroupBy('task.status')
                .getRawMany();

            return result.map((r: any) => ({
                priority: r.priority,
                status: r.status,
                count: parseInt(r.count, 10),
            }));
        } catch (error) {
            console.error('Error getting priority status matrix:', error);
            return [];
        }
    }

    /**
     * Obter distribuição semanal (últimas 7 dias)
     */
    static async getWeeklyDistribution(userId: string) {
        try {
            const taskRepository = AppDataSource.getRepository(Task);
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

            const result = await taskRepository
                .createQueryBuilder('task')
                .select("DATE(task.createdAt)", 'date')
                .addSelect('COUNT(*)', 'count')
                .where('task.userId = :userId', { userId })
                .andWhere('task.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
                .groupBy("DATE(task.createdAt)")
                .orderBy("DATE(task.createdAt)", 'ASC')
                .getRawMany();

            return result.map((r: any) => ({
                date: r.date,
                count: parseInt(r.count, 10),
            }));
        } catch (error) {
            console.error('Error getting weekly distribution:', error);
            return [];
        }
    }

    /**
     * Obter tarefas atrasadas
     */
    static async getOverdueTasks(userId: string) {
        try {
            const taskRepository = AppDataSource.getRepository(Task);
            const now = new Date();

            return await taskRepository
                .createQueryBuilder('task')
                .where('task.userId = :userId', { userId })
                .andWhere('task.dueDate IS NOT NULL')
                .andWhere('task.dueDate < :now', { now })
                .andWhere('task.status != :cancelled AND task.status != :done', {
                    cancelled: 'cancelled',
                    done: 'done',
                })
                .orderBy('task.dueDate', 'ASC')
                .leftJoinAndSelect('task.project', 'project')
                .getMany();
        } catch (error) {
            console.error('Error getting overdue tasks:', error);
            return [];
        }
    }
}
