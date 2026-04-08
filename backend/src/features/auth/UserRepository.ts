import { AppDataSource } from '../../entities/AppDataSource';
import { User } from '../../entities/User';

export class UserRepository {
    /**
     * Busca usuário por email
     */
    static async findByEmail(email: string): Promise<User | null> {
        try {
            const userRepository = AppDataSource.getRepository(User);
            return await userRepository.findOne({
                where: { email }
            });
        } catch (error) {
            console.error('Error finding user by email:', error);
            return null;
        }
    }

    /**
     * Busca usuário por ID
     */
    static async findById(id: string): Promise<User | null> {
        try {
            const userRepository = AppDataSource.getRepository(User);
            return await userRepository.findOne({
                where: { id }
            });
        } catch (error) {
            console.error('Error finding user by ID:', error);
            return null;
        }
    }

    /**
     * Cria novo usuário
     */
    static async create(userData: Partial<User>): Promise<User | null> {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const user = userRepository.create(userData);
            return await userRepository.save(user);
        } catch (error) {
            console.error('Error creating user:', error);
            return null;
        }
    }

    /**
     * Atualiza último login
     */
    static async updateLastLogin(id: string): Promise<boolean> {
        try {
            const userRepository = AppDataSource.getRepository(User);
            await userRepository.update(
                { id },
                { lastLogin: new Date() }
            );
            return true;
        } catch (error) {
            console.error('Error updating last login:', error);
            return false;
        }
    }

    /**
     * Verifica email existente
     */
    static async emailExists(email: string): Promise<boolean> {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const count = await userRepository.count({
                where: { email }
            });
            return count > 0;
        } catch (error) {
            console.error('Error checking email existence:', error);
            return false;
        }
    }
}
