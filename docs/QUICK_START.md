# 🚀 Quick Start - 5 Minutos

## ⚡ Para os Apressadinhos

### Opção 1: Docker Compose (Recomendado - 2 minutos)

```bash
# Clone ou acesse o projeto
cd antigravity-project-ALL

# Start tudo em um comando
docker-compose up -d

# Pronto! Aguarde ~30s
```

**URLs**:

- 🌐 Frontend: <http://localhost:5173>
- 🔌 API: <http://localhost:3000>
- 📊 MySQL: localhost:3306
- 📮 Redis: localhost:6379

---

### Opção 2: Local (Node instalado)

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev
# ✅ Listening on port 3000

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
# ✅ http://localhost:5173
```

---

## 🔑 Primeiras Ações

### 1. Testar Backend

```bash
curl -X GET http://localhost:3000/health

# Expected response:
{"status":"ok","timestamp":"2026-04-08T..."}
```

### 2. Testar Frontend

Abra <http://localhost:5173> no browser

### 3. Fazer Login (Depois vai ter dados de teste)

```
Email: test@example.com
Password: Test123!
```

---

## 📚 Depois

- Leia [SETUP.md](./SETUP.md) para entender configurações
- Leia [ARCHITECTURE.md](./ARCHITECTURE.md) para entender fluxos
- Comece a codar em `backend/src/` ou `frontend/src/`

---

## ⚠️ Problemas?

```bash
# Docker não quer rodar?
docker-compose down -v
docker-compose up -d --build

# Node não instala dependências?
rm -rf backend/node_modules frontend/node_modules
npm install --legacy-peer-deps

# Port já em uso?
sudo lsof -i :3000      # Qual processo está usando?
kill -9 <PID>           # Matar processo
```

→ Veja [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) para mais problemas

---

**Tempo total**: ~5 minutos ✅  
**Próximo passo**: Leia [ARCHITECTURE.md](./ARCHITECTURE.md)
