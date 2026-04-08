export const MYSQL_HOST = process.env.DB_HOST || 'localhost';
export const MYSQL_PORT = parseInt(process.env.DB_PORT || '3308', 10);
export const MYSQL_USERNAME = process.env.DB_USER || 'task_user';
export const MYSQL_PASSWORD = process.env.DB_PASSWORD || 'task_password';
export const MYSQL_DATABASE = process.env.DB_NAME || 'task_manager';

export const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
export const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';

export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-min-32-chars-change-prod!';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-key-min-32-chars-change-prod!';
export const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m';
export const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

export const API_URL = process.env.API_URL || 'http://localhost:3000';
export const FRONTEND_URL = process.env.CORS_ORIGIN || 'http://localhost:5173';
