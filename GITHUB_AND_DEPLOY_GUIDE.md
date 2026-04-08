# 📦 PREPARAÇÃO PARA GITHUB & DEPLOY

## ✅ Pré-Requisitos Cumpridos

- [x] Todos os arquivos .env em .gitignore
- [x] .env.example com instruções
- [x] Vulnerabilidades críticas corrigidas
- [x] Docker configurado para produção
- [x] Rate limiting implementado
- [x] Documentação completa

---

## 🚀 PASSO 1: Commit para GitHub

### 1.1 Preparar Git

```bash
cd "c:\Users\Clovis\Desktop\Programas Cayuri faculdade\atividades\antigravity-project-ALL"

# Verificar status
git status

# Adicionar arquivos
git add .

# Verificar que .env NÃO aparece
git status
```

### 1.2 Fazer Commit

```bash
git commit -m "fix: Critical security vulnerabilities - JWT secrets, rate limiting, credentials

- Separate JWT_SECRET and JWT_REFRESH_SECRET to prevent token forgery
- Implement rate limiting for auth endpoints (brute force protection)
- Move all credentials to .env (not committed)
- Add .env.example with safe defaults
- Update docker-compose.yml to use env variables
- Fix verifyRefreshToken to use correct secret"
```

### 1.3 Push para Repo

```bash
git push origin main
```

---

## 🌐 PASSO 2: Deploy Options

### Option A: Vercel (Frontend + Backend)

**Vantagens:**

- Gratuito
- Deploy automático com GitHub
- SSL automático
- Escalabilidade fácil

**Passos:**

1. Criar conta em vercel.com
2. Importar repo GitHub
3. Configurar variáveis de ambiente
4. Deploy automático

```bash
# Arquivo vercel.json na raiz
{
  "builds": [
    {
      "src": "backend/package.json",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/src/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/dist/$1"
    }
  ]
}
```

### Option B: Heroku (Backend + Database)

**Vantagens:**

- Simples de usar
- Database integrado
- GitHub integrado

**Passos:**

1. `npm install -g heroku`
2. `heroku login`
3. `heroku create app-name`
4. Configurar variáveis:

   ```bash
   heroku config:set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   heroku config:set JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   ```

5. Push: `git push heroku main`

### Option C: DigitalOcean (Full Control)

**Vantagens:**

- Controle total
- Mais barato
- Escalável

**Passos:**

1. Criar droplet Ubuntu
2. Instalar Docker
3. Clonar repo
4. Rodar `docker-compose up -d`

---

## 🔑 PASSO 3: Configurar Variáveis em Produção

### Em Vercel

```
Settings → Environment Variables

JWT_SECRET=<gerar-novo>
JWT_REFRESH_SECRET=<gerar-novo>
DB_PASSWORD=<strong-password>
NODE_ENV=production
CORS_ORIGIN=<seu-dominio.com>
```

### Em Heroku

```bash
heroku config:set JWT_SECRET=<valor>
heroku config:set JWT_REFRESH_SECRET=<valor>
heroku config:set DB_PASSWORD=<valor>
```

### Em DigitalOcean

```bash
# Criar .env na droplet
ssh root@<ip>
cd /app
nano .env  # Cole as variáveis

# Rodar containers
docker-compose up -d
```

---

## 📋 PASSO 4: Verificações de Segurança

```bash
# 1. Verificar que .env não está no git
git log --all --pretty=format: --name-only | sort -u | grep -i "\.env"
# Resultado esperado: SEM MATCHES

# 2. Verificar JWT em produção
curl -X POST https://seu-dominio/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'

# 3. Verificar rate limiting (fazer >5 sem esperar)
for i in {1..10}; do curl -X POST https://seu-dominio/api/auth/login; done
# Esperado: Primeiros 5 = 401, resto = 429

# 4. Verificar HTTPS
curl -I https://seu-dominio
# Esperado: HTTP/2 200
```

---

## 🐳 PASSO 5: Docker Registry (Opcional - para produção)

Se quiser hospedar imagens Docker:

### Docker Hub

```bash
# Login
docker login

# Tag
docker tag task-manager-api seu-username/task-manager-api:latest

# Push
docker push seu-username/task-manager-api:latest

# Pull em produção
docker pull seu-username/task-manager-api:latest
```

---

## 📊 PASSO 6: Monitoramento & Logs

### Em Vercel

- Logs automáticos em vercel.com/dashboard
- Email em caso de erro

### Em Heroku

```bash
heroku logs --tail
heroku logs --app app-name
```

### DigitalOcean

```bash
docker logs task-manager-api
docker logs task-manager-mysql
```

---

## 🔍 PASSO 7: Backup de Database

```bash
# Local
docker exec task-manager-mysql mysqldump -u root -p task_manager > backup.sql

# Restaurar
docker exec -i task-manager-mysql mysql -u root -p task_manager < backup.sql

# Cloud (recomendado em produção)
# Use gerenciador do provedor (Vercel, Heroku, etc.)
```

---

## ✈️ PASSO 8: Custom Domain (Opcional)

### Vercel

Settings → Domains → Adicionar domínio

### Heroku

```bash
heroku domains:add seu-dominio.com
# Configure DNS CNAME em registrador
```

### DigitalOcean

- Configure DNS no provedor
- Configure SSL com LetsEncrypt (automático no nginx/caddy)

---

## 📱 PASSO 9: Mobile App (Futuro)

Com o backend pronto, pode criar:

- React Native app
- Flutter app
- Usar mesma API

---

## 🎯 RESUMO FINAL

| Etapa | Status | Tempo |
|-------|--------|-------|
| Segurança | ✅ | 0 min |
| Git Commit | ⏳ | 5 min |
| GitHub Push | ⏳ | 2 min |
| Deploy Choice | ⏳ | 10 min |
| Env Config | ⏳ | 10 min |
| Deploy | ⏳ | 30 min |
| Testes | ⏳ | 15 min |

**Total**: ~1 hora da segurança para produção ✅

---

**Próximo Passo**: Executar os comandos acima! 🚀
