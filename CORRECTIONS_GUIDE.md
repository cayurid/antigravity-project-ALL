# 🔧 GUIA DE CORREÇÃO PASSO-A-PASSO

## CORREÇÃO #1: JWT_SECRET e JWT_REFRESH_SECRET

### Passo 1.1: Atualizar `backend/src/config/env.ts`

```typescript
import dotenv from 'dotenv';

dotenv.config();

// Validação em runtime
const validateEnv = () => {
    const errors: string[] = [];

    if (process.env.NODE_ENV === 'production') {
        if (!process.env.JWT_SECRET) {
            errors.push('JWT_SECRET é OBRIGATÓRIO em produção');
        }
        if (!process.env.JWT_REFRESH_SECRET) {
            errors.push('JWT_REFRESH_SECRET é OBRIGATÓRIO em produção');
        }
        if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
            errors.push('JWT_SECRET deve ter mínimo 32 caracteres');
        }
    }

    if (errors.length > 0) {
        console.error('❌ Erros de configuração:');
        errors.forEach(err => console.error(`   - ${err}`));
        if (process.env.NODE_ENV === 'production') process.exit(1);
    }
};

validateEnv();

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
        password: process.env.DB_PASSWORD || 'root', // ← Mudar em produção!
        name: process.env.DB_NAME || 'task_manager',
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
    },
    jwt: {
        secret: process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-secret-change-in-production' : undefined),
        expiresIn: process.env.JWT_EXPIRY || '15m',
        refreshSecret: process.env.JWT_REFRESH_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-refresh-secret' : undefined),
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
```

### Passo 1.2: Criar `.env.example`

```env
# Environment
NODE_ENV=development

# Application
PORT=3000
API_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=task_manager

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT (MUITO IMPORTANTE: Gerar valores aleatórios para produção!)
# Gerar com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-secret-key-min-32-chars-change-in-production-12345
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars-change-in-production123
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Security
BCRYPT_ROUNDS=10

# OAuth (opcional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

---

## CORREÇÃO #2: Rate Limiting

### Passo 2.1: Criar `backend/src/middlewares/rateLimit.ts`

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

// Redis client para persistência
const redisClient = createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
});

redisClient.on('error', (err) => {
    console.warn('⚠️ Redis não disponível para rate limiting, usando memória', err);
});

/**
 * Rate limiter para login (5 tentativas em 15 min)
 */
export const loginLimiter = rateLimit({
    store: new RedisStore({
        client: redisClient,
        prefix: 'rate-limit:login:',
    }),
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 tentativas
    message: {
        error: 'Muitas tentativas de login. Tente novamente após 15 minutos.',
        code: 'RATE_LIMITED',
    },
    standardHeaders: true, // Return rate limit info no `RateLimit-*` headers
    legacyHeaders: false, // Desabilitar `X-RateLimit-*` headers
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Muitas tentativas. Tente mais tarde.',
            retryAfter: req.rateLimit?.resetTime,
        });
    },
});

/**
 * Rate limiter para registro (3 por hora)
 */
export const registerLimiter = rateLimit({
    store: new RedisStore({
        client: redisClient,
        prefix: 'rate-limit:register:',
    }),
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // máximo 3 registros
    message: {
        error: 'Muitos registros. Tente novamente após 1 hora.',
        code: 'RATE_LIMITED',
    },
    skipSuccessfulRequests: true, // Não contar registros bem-sucedidos
    skipFailedRequests: true,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Muitos registros. Tente mais tarde.',
            retryAfter: req.rateLimit?.resetTime,
        });
    },
});

/**
 * Rate limiter geral para API (100 requisições em 15 min)
 */
export const apiLimiter = rateLimit({
    store: new RedisStore({
        client: redisClient,
        prefix: 'rate-limit:api:',
    }),
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
            retryAfter: req.rateLimit?.resetTime,
        });
    },
});

/**
 * Rate limiter refresh token (10 por hora)
 */
export const refreshLimiter = rateLimit({
    store: new RedisStore({
        client: redisClient,
        prefix: 'rate-limit:refresh:',
    }),
    windowMs: 60 * 60 * 1000,
    max: 10,
    skipSuccessfulRequests: true,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Muitas tentativas de refresh. Tente mais tarde.',
        });
    },
});

export default {
    loginLimiter,
    registerLimiter,
    apiLimiter,
    refreshLimiter,
};
```

### Passo 2.2: Instalar rate-limit-redis

```bash
cd backend
npm install rate-limit-redis redis
```

### Passo 2.3: Usar em `backend/src/features/auth/routes.ts`

```typescript
import { Router } from 'express';
import { AuthController } from './controller';
import { authMiddleware, requireAuth } from '../../middlewares/auth';
import { loginLimiter, registerLimiter, refreshLimiter } from '../../middlewares/rateLimit';

const router = Router();

// Proteger endpoints críticos com rate limiting
router.post('/register', registerLimiter, AuthController.register);
router.post('/login', loginLimiter, AuthController.login);
router.post('/refresh', refreshLimiter, AuthController.refresh);

router.get('/me', authMiddleware, requireAuth, AuthController.getMe);
router.post('/logout', authMiddleware, requireAuth, AuthController.logout);

export default router;
```

---

## CORREÇÃO #3: Refresh Token em httpOnly Cookie

### Passo 3.1: Atualizar `backend/src/features/auth/AuthService.ts`

```typescript
// Adicionar método para gerar token com secret diferente
static verifyRefreshToken(token: string): JWTPayload | null {
    try {
        const decoded = jwt.verify(
            token, 
            process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret'
        );
        return decoded as JWTPayload;
    } catch (error) {
        return null;
    }
}
```

### Passo 3.2: Atualizar `backend/src/features/auth/controller.ts`

```typescript
import express from 'express';
import { AuthService } from './AuthService';
import { UserRepository } from './UserRepository';
import type { RegisterDTO, LoginDTO, AuthResponseDTO } from './dtos';

export class AuthController {
    /**
     * POST /api/auth/register
     */
    static async register(req: express.Request, res: express.Response): Promise<void> {
        try {
            const { email, password, confirmPassword, name } = req.body as RegisterDTO;

            // Validações...
            const validation = AuthService.validateRegisterData({ 
                email, 
                password, 
                confirmPassword, 
                name 
            });
            if (!validation.valid) {
                res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: validation.errors,
                });
                return;
            }

            // ... resto do código ...

            // Gerar tokens
            const tokens = AuthService.generateTokenPair(user.id, user.email, user.role);

            // ✅ NOVO: Enviar refresh token em httpOnly cookie
            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true, // Não acessível via JavaScript
                secure: process.env.NODE_ENV === 'production', // HTTPS only
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
                path: '/api/auth/refresh', // Apenas para refresh endpoint
            });

            // ✅ Enviar resposta SEM refresh token
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    accessToken: tokens.accessToken, // ← Apenas access token no JSON
                },
            });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }

    /**
     * POST /api/auth/login
     */
    static async login(req: express.Request, res: express.Response): Promise<void> {
        try {
            const { email, password } = req.body as LoginDTO;

            // ... validação ...

            // ... comparar senha ...

            const tokens = AuthService.generateTokenPair(user.id, user.email, user.role);

            // ✅ Refresh token em httpOnly cookie
            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/api/auth/refresh',
            });

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    accessToken: tokens.accessToken,
                },
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }

    /**
     * POST /api/auth/refresh - Usar cookie automático
     */
    static async refresh(req: express.Request, res: express.Response): Promise<void> {
        try {
            // ✅ Obter refresh token do cookie
            const refreshToken = req.cookies?.refreshToken;

            if (!refreshToken) {
                res.status(401).json({
                    success: false,
                    error: 'Refresh token não encontrado',
                    code: 'NO_REFRESH_TOKEN',
                });
                return;
            }

            // Verificar refresh token
            const decoded = AuthService.verifyRefreshToken(refreshToken);
            if (!decoded) {
                res.status(401).json({
                    success: false,
                    error: 'Refresh token inválido',
                    code: 'INVALID_REFRESH_TOKEN',
                });
                return;
            }

            // Gerar novo access token
            const accessToken = AuthService.generateAccessToken({
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
            });

            res.json({
                success: true,
                data: {
                    accessToken,
                },
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                error: 'Falha ao renovar token',
            });
        }
    }

    /**
     * POST /api/auth/logout
     */
    static async logout(req: express.Request, res: express.Response): Promise<void> {
        // ✅ Limpar refresh token cookie
        res.clearCookie('refreshToken', { path: '/api/auth/refresh' });

        res.json({
            success: true,
            message: 'Logout successful',
        });
    }
}
```

### Passo 3.3: Instalar cookie-parser

```bash
npm install cookie-parser @types/cookie-parser
```

### Passo 3.4: Usar em `backend/src/app.ts`

```typescript
import express from 'express';
import cookieParser from 'cookie-parser';
// ... outros imports ...

const app = express();

// ✅ Adicionar cookie parser
app.use(cookieParser());

// ... resto do código ...
```

---

## CORREÇÃO #4: Usar Diferentes Secrets JWT

Já feito na Correção #1 ✅

No `.env.example`:

```env
JWT_SECRET=first-secret-32-chars-unique-123456
JWT_REFRESH_SECRET=second-secret-32-chars-unique-654321
```

---

## CORREÇÃO #5: Credenciais MySQL

### Passo 5.1: Atualizar `docker-compose.yml`

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: task-manager-mysql
    ports:
      - "3308:3306"
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-root}
      MYSQL_DATABASE: ${DB_NAME:-task_manager}
      MYSQL_USER: ${DB_USER:-task_user}
      MYSQL_PASSWORD: ${DB_PASSWORD:-task_password}
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - task-manager-network

  redis:
    image: redis:7.0-alpine
    container_name: task-manager-redis
    ports:
      - "6379:6379"
    command: redis-server ${REDIS_PASSWORD:+--requirepass $REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - task-manager-network

  api:
    build:
      context: ./backend
      dockerfile: ../docker/Dockerfile.backend
    container_name: task-manager-api
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      PORT: 3000
      DB_HOST: mysql
      DB_PORT: 3306
      DB_USER: ${DB_USER:-task_user}
      DB_PASSWORD: ${DB_PASSWORD:-task_password}
      DB_NAME: ${DB_NAME:-task_manager}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD:-}
      JWT_SECRET: ${JWT_SECRET:?Error: JWT_SECRET not set}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET:?Error: JWT_REFRESH_SECRET not set}
      CORS_ORIGIN: ${CORS_ORIGIN:-http://localhost:5173}
      LOG_LEVEL: ${LOG_LEVEL:-info}
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - task-manager-network

volumes:
  mysql_data:
  redis_data:

networks:
  task-manager-network:
    driver: bridge
```

---

## ✅ VALIDAR CORREÇÕES

Depois de aplicar:

1. **Verificar arquivo `.env.example` existe**

   ```bash
   cat backend/.env.example
   ```

2. **Testar build**

   ```bash
   cd backend
   npm install
   npm run build
   ```

3. **Testar com docker-compose**

   ```bash
   docker-compose up -d --build
   docker-compose logs -f api
   ```

4. **Testar endpoints**

   ```bash
   # Login (test rate limiting)
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"wrong"}'
   ```

---

## 🎯 TEMPO ESTIMADO

- Correção #1 (JWT): 15min
- Correção #2 (Rate Limit): 30min
- Correção #3 (httpOnly Cookie): 20min
- Correção #4 (Secrets diferentes): 5min
- Correção #5 (MySQL): 10min
- **Total: 80min (~1.5h)**

---

**Próximoagora: Aplicar essas correções! 🚀**
