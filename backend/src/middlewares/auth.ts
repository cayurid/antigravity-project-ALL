import express from 'express';
import { AuthService } from '../features/auth/AuthService';
import type { JWTPayload } from '../features/auth/dtos';

declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
            token?: string;
        }
    }
}

/**
 * Middleware que valida JWT token do header Authorization
 */
export const authMiddleware = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                error: 'Token não fornecido',
                code: 'NO_TOKEN',
            });
            return;
        }

        const token = authHeader.substring(7); // Remove 'Bearer '
        const decoded = AuthService.verifyToken(token);

        if (!decoded) {
            res.status(401).json({
                error: 'Token inválido ou expirado',
                code: 'INVALID_TOKEN',
            });
            return;
        }

        // Anexar usuário ao request
        req.user = decoded;
        req.token = token;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({
            error: 'Falha na autenticação',
            code: 'AUTH_ERROR',
        });
    }
};

/**
 * Middleware que requer token de autenticação
 * Use como: router.get('/protected', requireAuth, controller)
 */
export const requireAuth = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
): void => {
    if (!req.user) {
        res.status(401).json({
            error: 'Autenticação necessária',
            code: 'AUTH_REQUIRED',
        });
        return;
    }
    next();
};

/**
 * Middleware que requer role específico
 */
export const requireRole = (roles: string[]) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                error: 'Autenticação necessária',
                code: 'AUTH_REQUIRED',
            });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                error: 'Acesso negado',
                code: 'FORBIDDEN',
            });
            return;
        }

        next();
    };
};
