import { Router } from 'express';
import { AuthController } from './controller';
import { authMiddleware, requireAuth } from '../../middlewares/auth';
import { loginLimiter, registerLimiter, refreshLimiter } from '../../middlewares/rateLimit';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registra novo usuário
 * @access  Public
 */
router.post('/register', registerLimiter, AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuário
 * @access  Public
 */
router.post('/login', loginLimiter, AuthController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Renova token expirado
 * @access  Public
 */
router.post('/refresh', refreshLimiter, AuthController.refresh);

/**
 * @route   GET /api/auth/me
 * @desc    Retorna dados do usuário autenticado
 * @access  Private
 */
router.get('/me', authMiddleware, requireAuth, AuthController.getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout do usuário
 * @access  Private
 */
router.post('/logout', authMiddleware, requireAuth, AuthController.logout);

export default router;
