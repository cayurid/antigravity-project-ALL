import dotenv from 'dotenv';
import app from './app.js';
import { AppDataSource } from './entities/AppDataSource.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

async function startServer() {
    try {
        // Initialize database connection
        if (!AppDataSource.isInitialized) {
            console.log('🔗 Connecting to database...');
            await AppDataSource.initialize();
            console.log('✅ Database connected!');
        }

        // Start server
        const server = app.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════╗
║   Task Manager API - Server Started   ║
╚════════════════════════════════════════╝

Environment: ${ENV}
Port: ${PORT}
URL: http://localhost:${PORT}
API: http://localhost:${PORT}/api

Status: 🚀 READY

Endpoints:
  ✓ POST   /api/auth/register
  ✓ POST   /api/auth/login
  ✓ POST   /api/auth/refresh
  ✓ GET    /api/auth/me       (requires auth)
  ✓ POST   /api/auth/logout   (requires auth)
  ✓ GET    /health
  ✓ GET    /api

Note: Database connection ENABLED ✅

════════════════════════════════════════
`);
        });

        // Graceful shutdown
        process.on('SIGTERM', async () => {
            console.log('SIGTERM received, shutting down...');
            server.close(async () => {
                if (AppDataSource.isInitialized) {
                    await AppDataSource.destroy();
                }
                process.exit(0);
            });
        });

        process.on('SIGINT', async () => {
            console.log('SIGINT received, shutting down...');
            server.close(async () => {
                if (AppDataSource.isInitialized) {
                    await AppDataSource.destroy();
                }
                process.exit(0);
            });
        });
    } catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
}

startServer();
