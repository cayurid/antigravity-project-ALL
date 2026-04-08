import { AppDataSource } from '../../entities/AppDataSource';
import { Project } from '../../entities/Project';
import { DeleteResult, UpdateResult } from 'typeorm';

export class ProjectRepository {
    /**
     * Listar projects do usuário
     */
    static async findByOwner(ownerId: string, filters?: {
        status?: string;
    }): Promise<Project[]> {
        try {
            const projectRepository = AppDataSource.getRepository(Project);
            let query = projectRepository.createQueryBuilder('project')
                .where('project.ownerId = :ownerId', { ownerId })
                .leftJoinAndSelect('project.tasks', 'tasks');

            if (filters?.status) {
                query = query.andWhere('project.status = :status', { status: filters.status });
            }

            return await query.orderBy('project.createdAt', 'DESC').getMany();
        } catch (error) {
            console.error('Error finding projects by owner:', error);
            return [];
        }
    }

    /**
     * Buscar project por ID
     */
    static async findById(id: string): Promise<Project | null> {
        try {
            const projectRepository = AppDataSource.getRepository(Project);
            return await projectRepository.findOne({
                where: { id },
                relations: ['tasks', 'owner']
            });
        } catch (error) {
            console.error('Error finding project by ID:', error);
            return null;
        }
    }

    /**
     * Criar novo project
     */
    static async create(projectData: Partial<Project>): Promise<Project | null> {
        try {
            const projectRepository = AppDataSource.getRepository(Project);
            const project = projectRepository.create(projectData);
            return await projectRepository.save(project);
        } catch (error) {
            console.error('Error creating project:', error);
            return null;
        }
    }

    /**
     * Atualizar project
     */
    static async update(id: string, updates: Partial<Project>): Promise<boolean> {
        try {
            const projectRepository = AppDataSource.getRepository(Project);
            const result: UpdateResult = await projectRepository.update({ id }, updates);
            return result.affected ? (result.affected > 0) : false;
        } catch (error) {
            console.error('Error updating project:', error);
            return false;
        }
    }

    /**
     * Soft delete (arquivar)
     */
    static async archive(id: string): Promise<boolean> {
        try {
            const projectRepository = AppDataSource.getRepository(Project);
            await projectRepository.update({ id }, {
                status: 'archived',
                archivedAt: new Date()
            });
            return true;
        } catch (error) {
            console.error('Error archiving project:', error);
            return false;
        }
    }

    /**
     * Deletar fisicamente project
     */
    static async hardDelete(id: string): Promise<boolean> {
        try {
            const projectRepository = AppDataSource.getRepository(Project);
            const result: DeleteResult = await projectRepository.delete({ id });
            return result.affected ? (result.affected > 0) : false;
        } catch (error) {
            console.error('Error hard deleting project:', error);
            return false;
        }
    }

    /**
     * Contar projects do usuário
     */
    static async countByOwner(ownerId: string): Promise<number> {
        try {
            const projectRepository = AppDataSource.getRepository(Project);
            return await projectRepository.count({
                where: { ownerId }
            });
        } catch (error) {
            console.error('Error counting projects:', error);
            return 0;
        }
    }

    /**
     * Atualizar status
     */
    static async updateStatus(id: string, status: 'active' | 'archived' | 'deleted'): Promise<boolean> {
        try {
            const projectRepository = AppDataSource.getRepository(Project);
            const updates: any = { status };

            if (status === 'archived') {
                updates.archivedAt = new Date();
            }

            await projectRepository.update({ id }, updates);
            return true;
        } catch (error) {
            console.error('Error updating project status:', error);
            return false;
        }
    }
}
