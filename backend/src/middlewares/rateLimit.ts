import rateLimit from 'express-rate-limit';

/**
 * Rate limiter para login (5 tentativas em 15 min)
 */
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 tentativas
    message: {
        error: 'Muitas tentativas de login. Tente novamente após 15 minutos.',
        code: 'RATE_LIMITED',
    },
    standardHeaders: true, // Retornar info de rate limit no header
    legacyHeaders: false, // Desabilitar `X-RateLimit-*` headers
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Muitas tentativas. Tente mais tarde.',
        });
    },
    skip: (req) => process.env.NODE_ENV !== 'production', // Desabilitar em dev
});

/**
 * Rate limiter para registro (3 por hora)
 */
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // máximo 3 registros
    message: {
        error: 'Muitos registros. Tente novamente após 1 hora.',
        code: 'RATE_LIMITED',
    },
    skipSuccessfulRequests: true, // Não contar registros bem-sucedidos
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Muitos registros. Tente mais tarde.',
        });
    },
    skip: (req) => process.env.NODE_ENV !== 'production',
});

/**
 * Rate limiter geral para API (100 requisições em 15 min)
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Muitas requisições. Tente novamente mais tarde.',
        code: 'RATE_LIMITED',
    },
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Limite de requisições excedido.',
        });
    },
});

/**
 * Rate limiter refresh token (10 por hora)
 */
export const refreshLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    skipSuccessfulRequests: true,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Muitas tentativas de refresh. Tente mais tarde.',
        });
    },
    skip: (req) => process.env.NODE_ENV !== 'production',
});

export default {
    loginLimiter,
    registerLimiter,
    apiLimiter,
    refreshLimiter,
};
