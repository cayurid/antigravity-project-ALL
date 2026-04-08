# 🚀 GETTING STARTED - Comece em 5 Passos

## Pré-requisitos

✅ Docker + Docker Compose instalados  
✅ Git instalado  
✅ Navegador moderno (Chrome, Firefox, Safari)

---

## Passo 1: Clonar o Repositório

```bash
git clone https://github.com/cayurid/antigravity-project-ALL.git
cd antigravity-project-ALL
```

---

## Passo 2: Copiar .env

```bash
# Backend
cp backend/.env.example backend/.env

# Você pode deixar os defaults para desenvolvimento
```

---

## Passo 3: Rodar Docker Compose

```bash
docker-compose up -d
```

Espere 30 segundos para os containers iniciarem.

✅ **Verificar se rodou**:

```bash
docker ps
```

Deve mostrar 3 containers:

- `task-manager-api` (port 3000)
- `task-manager-mysql` (port 3308)
- `task-manager-redis` (port 6379)

---

## Passo 4: Acessar a Aplicação

### Frontend

Abra no navegador: **<http://localhost:5174>**

Você verá a página de **Login**

### Criar Conta

1. Clique em "Sign up"
2. Preencha nome, email, senha
3. Clique em "Sign Up"

### Fazer Login

1. Use o email/senha que criou
2. Você será redirecionado ao **Dashboard**

---

## Passo 5: Testar Endpoints (Optional)

### Registrar Usuário

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"Password123",
    "name":"Test User"
  }'
```

### Fazer Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"Password123"
  }'
```

Copie o `accessToken` do response.

### Criar uma Task

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <COLE_O_TOKEN_AQUI>" \
  -d '{
    "title":"Minha tarefa",
    "description":"Descrição",
    "priority":"high",
    "dueDate":"2026-04-15"
  }'
```

---

## ✅ Checklist Sucesso

- [ ] Docker rodando (`docker ps` mostra 3 containers)
- [ ] Frontend carrega em localhost:5174
- [ ] Conseguiu criar conta
- [ ] Conseguiu fazer login
- [ ] Dashboard carrega com stats
- [ ] Conseguiu criar uma tarefa

---

## 🆘 Troubleshooting

### Docker não inicia

```bash
# Ver logs de erro
docker-compose logs

# Ou de um serviço específico
docker-compose logs task-manager-api
```

### Porta em uso

```bash
# Matar processo na porta 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :3000
kill -9 <PID>
```

### Não consigo fazer login

```bash
# Verificar se banco tem dados
docker exec -it task-manager-mysql mysql -u root -proot -e "SELECT * FROM task_manager.users;"

# Limpar tudo e recomeçar
docker-compose down -v  # Remove volumes
docker-compose up -d    # Recria
```

### Frontend carrega branco

```bash
# Terminal, no folder frontend:
cd frontend
npm run dev
```

---

## 📚 Próximos Passos

1. **Entender arquitetura** → Leia [ARCHITECTURE.md](./ARCHITECTURE.md)
2. **Ver endpoints** → Veja a [seção API](#api-endpoints-principais)
3. **Deploy** → Leia [DEPLOYMENT.md](./docs/DEPLOYMENT.md)

---

## 🔥 Comandos Úteis

```bash
# Ver logs tempo real
docker-compose logs -f task-manager-api

# Parar tudo
docker-compose down

# Limpar volumes (reset banco)
docker-compose down -v

# Rebuild (após mudanças)
docker-compose up --build -d

# Acessar banco
docker exec -it task-manager-mysql mysql -u root -p

# Ver Docker images
docker images
```

---

## 📡 API Endpoints Principais

| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/auth/register` | ❌ | Criar conta |
| POST | `/api/auth/login` | ❌ | Fazer login |
| GET | `/api/auth/me` | ✅ | Dados do usuário |
| GET | `/api/tasks` | ✅ | Listar tarefas |
| POST | `/api/tasks` | ✅ | Criar tarefa |
| GET | `/api/dashboard/overview` | ✅ | Stats dashboard |
| POST | `/api/tags` | ✅ | Criar tag |

---

## 🎯 Stack Técnico

- **Frontend**: React 18 + TypeScript + Vite + Tailwind
- **Backend**: Express + TypeScript + TypeORM
- **Database**: MySQL 8.0
- **Cache**: Redis 7.0
- **Auth**: JWT (access + refresh tokens)

---

## 📞 Suporte

Veja mais documentação em [docs/README.md](./README.md)

---

**Pronto?** ✅ Vá para [QUICK_START.md](./QUICK_START.md) ou comece a explorar! 🚀
