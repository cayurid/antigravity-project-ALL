import express from 'express';
import { AuthService } from './AuthService';
import { UserRepository } from './UserRepository';
import type { RegisterDTO, LoginDTO, AuthResponseDTO } from './dtos';

export class AuthController {
    /**
     * POST /api/auth/register
     * Registra novo usuário
     */
    static async register(req: express.Request, res: express.Response): Promise<void> {
        try {
            const { email, password, confirmPassword, name } = req.body as RegisterDTO;

            // Validar dados
            const validation = AuthService.validateRegisterData({ email, password, confirmPassword, name });
            if (!validation.valid) {
                res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: validation.errors,
                } as AuthResponseDTO);
                return;
            }

            // Verificar se email já existe
            const emailExists = await UserRepository.emailExists(email);
            if (emailExists) {
                res.status(409).json({
                    success: false,
                    message: 'Email already registered',
                    error: 'This email is already in use',
                } as AuthResponseDTO);
                return;
            }

            // Hash de senha
            const hashedPassword = await AuthService.hashPassword(password);

            // Criar usuário
            const user = await UserRepository.create({
                email,
                password: hashedPassword,
                name,
                role: 'user',
                emailVerified: false,
                isActive: true,
            });

            if (!user) {
                res.status(500).json({
                    success: false,
                    message: 'Failed to create user',
                    error: 'Database error',
                } as AuthResponseDTO);
                return;
            }

            // Gerar tokens
            const tokens = AuthService.generateTokenPair(user.id, user.email, user.role);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    ...tokens,
                },
            });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error',
            } as AuthResponseDTO);
        }
    }

    /**
     * POST /api/auth/login
     * Faz login do usuário
     */
    static async login(req: express.Request, res: express.Response): Promise<void> {
        try {
            const { email, password } = req.body as LoginDTO;

            // Validar dados
            const validation = AuthService.validateLoginData({ email, password });
            if (!validation.valid) {
                res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: validation.errors,
                } as AuthResponseDTO);
                return;
            }

            // Buscar usuário
            const user = await UserRepository.findByEmail(email);
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid credentials',
                    error: 'Email or password incorrect',
                } as AuthResponseDTO);
                return;
            }

            // Verificar senha
            const passwordMatch = await AuthService.comparePassword(password, user.password);
            if (!passwordMatch) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid credentials',
                    error: 'Email or password incorrect',
                } as AuthResponseDTO);
                return;
            }

            // Atualizar último login
            await UserRepository.updateLastLogin(user.id);

            // Gerar tokens
            const tokens = AuthService.generateTokenPair(user.id, user.email, user.role);

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    ...tokens,
                },
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error',
            } as AuthResponseDTO);
        }
    }

    /**
     * POST /api/auth/refresh
     * Renova access token usando refresh token
     */
    static async refresh(req: express.Request, res: express.Response): Promise<void> {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(400).json({
                    success: false,
                    message: 'Refresh token required',
                } as AuthResponseDTO);
                return;
            }

            // Verificar refresh token com secret correto
            const payload = AuthService.verifyRefreshToken(refreshToken);
            if (!payload) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid refresh token',
                } as AuthResponseDTO);
                return;
            }

            // Buscar usuário para pegar role atualizado
            const user = await UserRepository.findById(payload.id);
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'User not found',
                } as AuthResponseDTO);
                return;
            }

            // Gerar novo par de tokens
            const tokens = AuthService.generateTokenPair(user.id, user.email, user.role);

            res.status(200).json({
                success: true,
                message: 'Token refreshed',
                data: tokens,
            });
        } catch (error) {
            console.error('Refresh error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            } as AuthResponseDTO);
        }
    }

    /**
     * GET /api/auth/me
     * Retorna dados do usuário autenticado
     */
    static async getMe(req: express.Request, res: express.Response): Promise<void> {
        try {
            // req.user é definido pelo middleware de autenticação
            const userId = (req as any).user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            const user = await UserRepository.findById(userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'User retrieved',
                data: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    emailVerified: user.emailVerified,
                    avatar: user.avatar,
                    language: user.language,
                    theme: user.theme,
                    lastLogin: user.lastLogin,
                    createdAt: user.createdAt,
                },
            });
        } catch (error) {
            console.error('GetMe error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            } as AuthResponseDTO);
        }
    }

    /**
     * POST /api/auth/logout
     * Realiza logout (apenas limpa tokens no cliente)
     */
    static async logout(req: express.Request, res: express.Response): Promise<void> {
        res.status(200).json({
            success: true,
            message: 'Logout successful',
        });
    }
}
