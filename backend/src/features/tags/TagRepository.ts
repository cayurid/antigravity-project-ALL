import { AppDataSource } from '../../entities/AppDataSource.js';
import { Tag } from '../../entities/Tag.js';
import { Task } from '../../entities/Task.js';

export class TagRepository {
    /**
     * Listar tags do usuário
     */
    static async findByUser(userId: string): Promise<Tag[]> {
        try {
            const tagRepository = AppDataSource.getRepository(Tag);
            const taskRepository = AppDataSource.getRepository(Task);

            // Obter IDs de tasks do usuário
            const userTasks = await taskRepository.find({
                where: { userId },
                relations: ['tags'],
            });

            // Coletar tags únicas
            const tagsSet = new Set<string>();
            const tagsMap = new Map<string, Tag>();

            userTasks.forEach(task => {
                if (task.tags) {
                    task.tags.forEach(tag => {
                        if (!tagsSet.has(tag.id)) {
                            tagsSet.add(tag.id);
                            tagsMap.set(tag.id, tag);
                        }
                    });
                }
            });

            return Array.from(tagsMap.values());
        } catch (error) {
            console.error('Error finding tags by user:', error);
            return [];
        }
    }

    /**
     * Buscar tag por ID
     */
    static async findById(id: string): Promise<Tag | null> {
        try {
            const tagRepository = AppDataSource.getRepository(Tag);
            return await tagRepository.findOne({
                where: { id },
                relations: ['tasks'],
            });
        } catch (error) {
            console.error('Error finding tag by ID:', error);
            return null;
        }
    }

    /**
     * Buscar tag por nome
     */
    static async findByName(name: string): Promise<Tag | null> {
        try {
            const tagRepository = AppDataSource.getRepository(Tag);
            return await tagRepository.findOne({
                where: { name: name.toLowerCase() },
            });
        } catch (error) {
            console.error('Error finding tag by name:', error);
            return null;
        }
    }

    /**
     * Criar nova tag
     */
    static async create(tagData: Partial<Tag>): Promise<Tag | null> {
        try {
            const tagRepository = AppDataSource.getRepository(Tag);

            // Verificar se tag já existe
            const existing = await this.findByName(tagData.name || '');
            if (existing) {
                return existing;
            }

            const tag = tagRepository.create({
                name: tagData.name?.toLowerCase() || '',
                color: tagData.color || '#95a5a6',
            });

            await tagRepository.save(tag);
            return tag;
        } catch (error) {
            console.error('Error creating tag:', error);
            return null;
        }
    }

    /**
     * Atualizar tag
     */
    static async update(id: string, updates: Partial<Tag>): Promise<boolean> {
        try {
            const tagRepository = AppDataSource.getRepository(Tag);

            const updateData: any = {};
            if (updates.name) updateData.name = updates.name.toLowerCase();
            if (updates.color) updateData.color = updates.color;

            await tagRepository.update({ id }, updateData);
            return true;
        } catch (error) {
            console.error('Error updating tag:', error);
            return false;
        }
    }

    /**
     * Deletar tag
     */
    static async delete(id: string): Promise<boolean> {
        try {
            const tagRepository = AppDataSource.getRepository(Tag);
            const tag = await this.findById(id);

            if (!tag) {
                return false;
            }

            await tagRepository.delete({ id });
            return true;
        } catch (error) {
            console.error('Error deleting tag:', error);
            return false;
        }
    }

    /**
     * Deletar tag e remover de todas as tasks
     */
    static async hardDelete(id: string): Promise<boolean> {
        try {
            const tagRepository = AppDataSource.getRepository(Tag);
            const tag = await this.findById(id);

            if (!tag) {
                return false;
            }

            // Remover tag de todas as tasks
            if (tag.tasks && tag.tasks.length > 0) {
                const taskRepository = AppDataSource.getRepository(Task);
                for (const task of tag.tasks) {
                    task.tags = task.tags?.filter(t => t.id !== id) || [];
                    await taskRepository.save(task);
                }
            }

            await tagRepository.delete({ id });
            return true;
        } catch (error) {
            console.error('Error hard deleting tag:', error);
            return false;
        }
    }

    /**
     * Adicionar tag a uma task
     */
    static async addTagToTask(taskId: string, tagId: string): Promise<boolean> {
        try {
            const taskRepository = AppDataSource.getRepository(Task);
            const task = await taskRepository.findOne({
                where: { id: taskId },
                relations: ['tags'],
            });

            if (!task) {
                return false;
            }

            const tag = await this.findById(tagId);
            if (!tag) {
                return false;
            }

            // Verificar se tag já está na task
            if (task.tags?.some(t => t.id === tagId)) {
                return true;
            }

            if (!task.tags) {
                task.tags = [];
            }
            task.tags.push(tag);
            await taskRepository.save(task);
            return true;
        } catch (error) {
            console.error('Error adding tag to task:', error);
            return false;
        }
    }

    /**
     * Remover tag de uma task
     */
    static async removeTagFromTask(taskId: string, tagId: string): Promise<boolean> {
        try {
            const taskRepository = AppDataSource.getRepository(Task);
            const task = await taskRepository.findOne({
                where: { id: taskId },
                relations: ['tags'],
            });

            if (!task || !task.tags) {
                return false;
            }

            task.tags = task.tags.filter(t => t.id !== tagId);
            await taskRepository.save(task);
            return true;
        } catch (error) {
            console.error('Error removing tag from task:', error);
            return false;
        }
    }

    /**
     * Obter tags de uma task
     */
    static async getTaskTags(taskId: string): Promise<Tag[]> {
        try {
            const taskRepository = AppDataSource.getRepository(Task);
            const task = await taskRepository.findOne({
                where: { id: taskId },
                relations: ['tags'],
            });

            return task?.tags || [];
        } catch (error) {
            console.error('Error getting task tags:', error);
            return [];
        }
    }

    /**
     * Obter tasks com uma tag
     */
    static async getTasksByTag(tagId: string): Promise<Task[]> {
        try {
            const tagRepository = AppDataSource.getRepository(Tag);
            const tag = await tagRepository.findOne({
                where: { id: tagId },
                relations: ['tasks'],
            });

            return tag?.tasks || [];
        } catch (error) {
            console.error('Error getting tasks by tag:', error);
            return [];
        }
    }

    /**
     * Contar quantas vezes uma tag é usada
     */
    static async countUsage(tagId: string): Promise<number> {
        try {
            const tagRepository = AppDataSource.getRepository(Tag);
            const tag = await tagRepository.findOne({
                where: { id: tagId },
                relations: ['tasks'],
            });

            return tag?.tasks?.length || 0;
        } catch (error) {
            console.error('Error counting tag usage:', error);
            return 0;
        }
    }
}
