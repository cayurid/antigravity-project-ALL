# 🗺️ MAPA DE RISCOS - VISUALIZAÇÃO

## Arquitetura com Riscos Identificados

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Frontend)                        │
│  React + TypeScript (Vite)                                      │
│  ┌────────────────────────────────────────┐                    │
│  │ LoginPage                              │                    │
│  │ ├─ Email input ✅                      │                    │
│  │ ├─ Password input ✅                   │                    │
│  │ └─ Auth Context (Zustand) 🔴          │ ← Onde guardar    │
│  │                                        │   refresh token?  │
│  └────────────────────────────────────────┘                    │
│         │                                                       │
│         │ HTTP POST                                             │
│         │ {email, password}                                     │
│         ▼                                                       │
└─────────────────────────────────────────────────────────────────┘
           │
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CORS LAYER                                   │
│  CORS: origin: process.env.CORS_ORIGIN || 'http://localhost'  │
│  ⚠️ RISCO #6: Validação insuficiente em produção              │
│                                                                 │
│  ❌ Muito aberto   │  ✅ Localhost OK   │  ⚠️ Produção?      │
└─────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXPRESS APP                                  │
│                                                                 │
│  ┌──────────────────────────────────────────────┐              │
│  │ POST /api/auth/login                         │              │
│  │ 🔴 RISCO #3: SEM Rate Limiting              │              │
│  │ ├─ Recebe: {email, password}                │              │
│  │ ├─ Busca usuário no BD                      │              │
│  │ └─ Compara senha com bcrypt ✅              │              │
│  └──────────────────────────────────────────────┘              │
│              │                                                  │
│              │                                                  │
│              ▼                                                  │
│  ┌──────────────────────────────────────────────┐              │
│  │ AuthService.generateTokenPair()             │              │
│  │ 🔴 RISCO #1: JWT_SECRET hardcoded         │              │
│  │ 🔴 RISCO #5: Mesmo secret para refresh     │              │
│  │                                              │              │
│  │ Access Token (15m)                          │              │
│  │ ├─ Secret: \"dev-secret-change-prod\"        │              │
│  │ ├─ Payload: {id, email, role}              │              │
│  │ └─ Sign: HS256                              │              │
│  │                                              │              │
│  │ Refresh Token (7d) 🔴                       │              │
│  │ ├─ Secret: MESMO ACCESS TOKEN SECRET       │              │
│  │ ├─ Payload: {id, email, role}              │              │
│  │ └─ Sign: HS256                              │              │
│  └──────────────────────────────────────────────┘              │
│                                                                 │
│  ┌──────────────────────────────────────────────┐              │
│  │ Response da API                             │              │
│  │ 🔴 RISCO #4: Refresh token em JSON        │              │
│  │                                              │              │
│  │ {                                           │              │
│  │   \"accessToken\": \"eyJhbG...\",            │  ✅ OK       │
│  │   \"refreshToken\": \"eyJhbG...\" 🔴       │  localStorage │
│  │ }                                           │  (XSS risk)  │
│  └──────────────────────────────────────────────┘              │
│                                                                 │
│  🔴 RISCO #2: MySQL Password Hardcoded                        │
│  └─ DATABASE                                                   │
│     ├─ Host: mysql (docker)                                   │
│     ├─ User: CayuriTask_user ✅                               │
│     ├─ Password: Cayuri_Task_password 🔴 EXPOSTO             │
│     ├─ Database: task_manager ✅                              │
│     └─ Connection: ✅ TypeORM com parameterização            │
│                                                                 │
│  ┌──────────────────────────────────────────────┐              │
│  │ REDIS Cache (Session Store)                 │              │
│  │ ├─ Host: redis                              │              │
│  │ ├─ Port: 6379                               │              │
│  │ ├─ Password: (não definida)                 │              │
│  │ └─ Rate Limit Store: 🔴 NÃO IMPLEMENTADO   │              │
│  └──────────────────────────────────────────────┘              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
           │
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                DOCKER COMPOSE                                   │
│                                                                 │
│  🔴 RISCO #2 AGRAVADO:                                         │
│  environment:                                                   │
│    MYSQL_ROOT_PASSWORD: root                                   │
│    MYSQL_PASSWORD: Cayuri_Task_password   ← COMMITADO!        │
│    JWT_SECRET: dev-secret-key...          ← COMMITADO!        │
│                                                                 │
│  ✅ Volumes persistentes                                       │
│  ⚠️ Modo desenvolvimento (npm run dev)                         │
│  ❌ Sem arquivo .prod                                          │
│  ❌ Sem .env file support                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Fluxo de Autenticação com Riscos

```
1. USUÁRIO FAZ LOGIN
   ├─ Email: user@example.com
   └─ Senha: MyPassword123

2. FRONTEND ENVIA
   POST /api/auth/login
   🔴 SEM RATE LIMIT ← RISCO #3
   Body: {email, password}

3. SERVIDOR PROCESSA
   ├─ 🔴 JWT_SECRET = \"dev-secret...\" ← RISCO #1
   ├─ 🔴 MYSQL_PASSWORD = \"Cayuri...\" ← RISCO #2
   │
   ├─ Busca usuário (TypeORM ✅)
   ├─ Verifica senha (bcrypt ✅)
   │
   ├─ Gera Access Token
   │  └─ Secret: dev-secret
   │
   ├─ Gera Refresh Token
   │  └─ Secret: MESMA dev-secret 🔴 RISCO #5
   │
   └─ Retorna (JSON Response)
      {
        "accessToken": \"...\",
        \"refreshToken\": \"...\" 🔴 RISCO #4
      }

4. FRONTEND ARMAZENA
   ├─ Access Token: localStorage/sessionStorage 🔴 XSS Risk
   ├─ Refresh Token: localStorage 🔴 DUPLO RISCO
   └─ Se houver XSS: TUDO ROUBADO

5. PRÓXIMA REQUISIÇÃO
   GET /api/dashboard
   Header: Authorization: Bearer {accessToken}
   🔴 SEM RATE LIMIT ← RISCO #3

6. TOKEN EXPIRA (15min)
   ├─ Frontend detecta 401
   ├─ Envia refresh request
   │  🔴 SEM RATE LIMIT ← RISCO #3
   ├─ Se refresh_token for roubado:
   │  └─ Atacante consegue sempre novo token
   └─ Nunca precisa da senha de novo!
```

---

## Mapa de Dados Sensíveis

```
┌──────────────────────┬──────────────┬──────────────┬─────────┐
│ Dado                 │ Localização  │ Proteção     │ Risco   │
├──────────────────────┼──────────────┼──────────────┼─────────┤
│ JWT_SECRET           │ Code ✅      │ Hardcoded 🔴 │ CRÍTICO │
│ JWT_REFRESH_SECRET   │ Code ✅      │ Hardcoded 🔴 │ CRÍTICO │
│ MYSQL_PASSWORD       │ Compose 🔴   │ Exposto 🔴   │ CRÍTICO │
│ REDIS_PASSWORD       │ Env 🔴       │ Não set 🟡   │ ALTO    │
│ Access Token         │ localStorage │ XSS vuln 🔴  │ ALTO    │
│ Refresh Token        │ localStorage │ XSS 2x vuln  │ CRÍTICO │
│ User Password Hash   │ Database 🔴  │ Bcrypt ✅    │ OK      │
│ User Email           │ Database 🔴  │ Nenhuma 🔴   │ MÉDIO   │
│ User ID              │ Database 🔴  │ Nenhuma 🔴   │ MÉDIO   │
│ Session Data         │ Redis 🟡     │ Rate limit 🔴│ CRÍTICO │
└──────────────────────┴──────────────┴──────────────┴─────────┘

Legenda:
✅ = Seguro
🔴 = Crítico
🟡 = Médio
🟠 = Alto
```

---

## Camadas de Segurança

```
┌─────────────────────────────────────────────┐
│  CAMADA 1: HTTPS/TLS (Transport)            │
│  ❌ NÃO IMPLEMENTADO - RISCO #9             │
│  └─ Usar: Let's Encrypt + Nginx reverse proxy
├─────────────────────────────────────────────┤
│  CAMADA 2: Rate Limiting (DoS Protection)   │
│  ❌ NÃO IMPLEMENTADO - RISCO #3             │
│  └─ Usar: express-rate-limit + Redis
├─────────────────────────────────────────────┤
│  CAMADA 3: CORS (Origin Control)            │
│  ⚠️ PARCIAL - RISCO #6                      │
│  └─ OK dev, melhorar produção
├─────────────────────────────────────────────┤
│  CAMADA 4: Autenticação (JWT)               │
│  🔴 CRÍTICO - RISCO #1 e #5                │
│  ├─ Secret hardcoded
│  └─ Mesmo secret para tudo
├─────────────────────────────────────────────┤
│  CAMADA 5: Autorização (RBAC)               │
│  ✅ IMPLEMENTADO - middleware OK            │
├─────────────────────────────────────────────┤
│  CAMADA 6: Input Validation (Injection)     │
│  ⚠️ PARCIAL - RISCO #8                      │
│  └─ OK SQL (QueryBuilder), melhorar Zod
├─────────────────────────────────────────────┤
│  CAMADA 7: Output Encoding (XSS)            │
│  🔴 CRÍTICO - RISCO #4                      │
│  └─ Refresh token em localStorage
├─────────────────────────────────────────────┤
│  CAMADA 8: Session Management               │
│  ⚠️ PARCIAL - RISCO #4                      │
│  └─ httpOnly cookie não implementado
├─────────────────────────────────────────────┤
│  CAMADA 9: Data Protection (At Rest)        │
│  🔴 CRÍTICO - RISCO #2                      │
│  └─ Senha MySQL exposta
└─────────────────────────────────────────────┘
```

---

## Timeline de Segurança

```
SE NÃO CORRIGIR HOJE:

DIA 1:
└─ Deploy com vulnerabilidades

SEMANA 1:
├─ GitHub indexed by crawler
├─ Secrets discovered by bot
└─ Brute force attack starts

SEMANA 2:
├─ JWT forged by attacker
├─ Database accessed
└─ User data stolen

SEMANA 3:
├─ LGPD violation notice
├─ Media exposure
└─ Project cancelled

SE CORRIGIR HOJE (RECOMENDADO):

HOJE:
├─ 15min: Fix JWT_SECRET
├─ 10min: Fix MySQL password
├─ 30min: Implement rate limiting
├─ 20min: httpOnly cookie
└─ 5min: Different secrets

AMANHÃ:
├─ Testes
├─ Validação
└─ Staging deploy

DIA 3:
├─ Security audit
└─ Production ready

DIA 4:
└─ Deploy seguro em produção ✅
```

---

## Árvore de Decisão

```
VOCÊ QUER FAZER DEPLOY?

├─ SIM, HOJE
│  ├─ Sem corrigir? 🔴 ALTO RISCO
│  │  └─ Data theft, LGPD fine, project cancel
│  │
│  └─ Depois corrigir? 🟠 MÉDIO RISCO
│     ├─ 80 min para fixes críticas
│     └─ Depois 1 semana para testes
│
└─ NÃO, MAIS TARDE
   ├─ Esta semana? ✅ TEMPO SUFICIENTE
   ├─ Próxima semana? ✅ OK
   └─ Próximo mês? ❌ Risco de ser esquecido
```

---

## Checklist de Monitoramento

Depois de corrigir, monitorar:

```
✓ Falhas de autenticação (401 errors)
✓ Rate limit hits (429 errors)
✓ Database connection errors
✓ Invalid tokens (forjados?)
✓ CORS rejections
✓ Password reset attempts
✓ Unusual API usage patterns
✓ Failed login attempts > 10/hour
✓ Token refresh frequency
✓ Response times > 1s
```

---

**Visualização criada**: 2026-04-08  
**Escopo**: Arquitetura de segurança completa  
**Recomendação**: Imprimir este diagrama e fixar na parede!
