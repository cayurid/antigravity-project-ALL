import dotenv from 'dotenv';

dotenv.config();

export const config = {
    app: {
        name: 'Task Manager API',
        version: '1.0.0',
        env: process.env.NODE_ENV || 'development',
        port: parseInt(process.env.PORT || '3000'),
        apiUrl: process.env.API_URL || 'http://localhost:3000',
    },
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        name: process.env.DB_NAME || 'task_manager',
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
        expiresIn: process.env.JWT_EXPIRY || '15m',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
    },
    oauth: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID || '',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
        },
    },
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
    },
    security: {
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10'),
    },
};

export default config;
