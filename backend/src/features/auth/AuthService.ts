import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { JWT_SECRET, JWT_REFRESH_SECRET, JWT_EXPIRY, JWT_REFRESH_EXPIRY } from '../../config/database';
import type { RegisterDTO, LoginDTO, JWTPayload, TokenPair } from './dtos';

export class AuthService {
    /**
     * Hash de senha com bcryptjs
     */
    static async hashPassword(password: string): Promise<string> {
        const salt = await bcryptjs.genSalt(10);
        return await bcryptjs.hash(password, salt);
    }

    /**
     * Compara senha com hash
     */
    static async comparePassword(password: string, hash: string): Promise<boolean> {
        return await bcryptjs.compare(password, hash);
    }

    /**
     * Gera JWT access token
     */
    static generateAccessToken(payload: JWTPayload): string {
        return jwt.sign(payload, JWT_SECRET as string, {
            expiresIn: JWT_EXPIRY || '15m',
        } as any);
    }

    /**
     * Gera JWT refresh token (duração maior)
     */
    static generateRefreshToken(payload: JWTPayload): string {
        return jwt.sign(payload, JWT_REFRESH_SECRET as string, {
            expiresIn: JWT_REFRESH_EXPIRY || '7d',
        } as any);
    }

    /**
     * Verifica e decodifica JWT
     */
    static verifyToken(token: string): JWTPayload | null {
        try {
            const decoded = jwt.verify(token, JWT_SECRET as string);
            return decoded as JWTPayload;
        } catch (error) {
            console.error('Token verification failed:', error);
            return null;
        }
    }

    /**
     * Verifica e decodifica Refresh Token (com secret diferente)
     */
    static verifyRefreshToken(token: string): JWTPayload | null {
        try {
            const decoded = jwt.verify(token, JWT_REFRESH_SECRET as string);
            return decoded as JWTPayload;
        } catch (error) {
            console.error('Refresh token verification failed:', error);
            return null;
        }
    }

    /**
     * Gera par de tokens (access + refresh)
     */
    static generateTokenPair(userId: string, email: string, role: string): TokenPair {
        const payload: JWTPayload = {
            id: userId,
            email,
            role,
        };

        return {
            accessToken: this.generateAccessToken(payload),
            refreshToken: this.generateRefreshToken(payload),
        };
    }

    /**
     * Valida dados de registro
     */
    static validateRegisterData(data: RegisterDTO): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
            errors.push('Email inválido');
        }

        // Password validation
        if (!data.password || data.password.length < 6) {
            errors.push('Senha deve ter no mínimo 6 caracteres');
        }

        if (data.confirmPassword && data.password !== data.confirmPassword) {
            errors.push('Senhas não conferem');
        }

        // Name validation
        if (!data.name || data.name.trim().length < 3) {
            errors.push('Nome deve ter no mínimo 3 caracteres');
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }

    /**
     * Valida dados de login
     */
    static validateLoginData(data: LoginDTO): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
            errors.push('Email inválido');
        }

        if (!data.password || data.password.length < 6) {
            errors.push('Senha inválida');
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }
}
