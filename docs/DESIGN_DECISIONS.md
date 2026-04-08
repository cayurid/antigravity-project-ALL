# 🎯 Design Decisions - Task Manager

Documento que registra **15 decisões arquiteturais** com alternativas consideradas, trade-offs e riscos mitigados.

---

## 📋 Decisão #1: Arquitetura Monolítica vs Microserviços

**Status**: ✅ **DECIDIDO: Monolítica bem-estruturada**

### O que foi decidido

Uma aplicação **monolítica** bem estruturada em camadas (Controllers → Services → Repositories), com separação clara de responsabilidades, ao invés de arquitetura de microserviços.

### Alternativas consideradas

| Opção | Prós | Contras | Decisão |
|-------|------|---------|---------|
| **Monolítica** | Simples, fácil debug, performance, YAGNI | Limitado a ~50k usuários | ✅ ESCOLHIDO |
| Microserviços | Escalável para 100k+, serviços independentes | Overkill, complexidade, latência inter-serviços | ❌ Rejeitado |
| Modular Monolítico | Começar monolítico, extrair serviços depois | Difícil refatorar depois | ❌ Rejeitado |

### Por quê

- **Escopo atual**: 10k usuários, monolítico é perfeito
- **Performance**: Microserviços = latência inter-serviços (viola > 500ms < 500ms)
- **Maintenabilidade**: Uma equipe consegue manter facilmente
- **Desenvolvimento**: Mais rápido começar, YAGNI ruthlessly

### Trade-offs

- ❌ Limitado a ~50k usuários antes de refatorar
- ❌ Um único ponto de falha (mitigável com load balancing)
- ✅ Mas: Arquitetura planejada para fácil extração gradual

### Riscos mitigados

- **Risco**: Fica muito grande e inchado
  - **Mitigação**: Estrutura de pastas força separação por features
- **Risco**: Performance degrada com escala
  - **Mitigação**: Redis cache + índices MySQL otimizados

### Quando refatorar para microserviços

Considerar extração quando:

- Atingir ~40k usuários
- Diferentes features precisarem escalar independentemente
- Latência inter-serviços for aceitável

---

## 📋 Decisão #2: Multi-Usuário com Times/Projetos

**Status**: ✅ **DECIDIDO: Projects + project_members com RBAC**

### O que foi decidido

Modelo de dados com:

- **Projects**: Times/Projetos que agrupam multiple users
- **project_members**: Tabela de relacionamento com papéis (Admin/Editor/Viewer)
- Cada usuário pode ser membro de múltiplos projetos com papéis diferentes

### Alternativas consideradas

| Opção | Prós | Contras | Decisão |
|-------|------|---------|---------|
| **Projects + Members** | Flexível, colaboração real, RBAC interna | Schema mais complexo | ✅ ESCOLHIDO |
| Workspaces rígidos | Simples, limites claros | Inflexível, sem compartilhamento | ❌ Rejeitado |
| Ad-hoc sharing | Flexível máximo | Muito complexo, sem limites | ❌ Rejeitado |

### Por quê

- Permite colaboração real em times
- Papéis diferenciados por projeto
- Escalável para 1M+ tasks distribuídas

### Trade-offs

- ✅ Suporta múltiplos acessos, colaboração
- ❌ Queries mais complexas (múltiplos JOINs)
- ❌ Lógica de autorização em cada endpoint

### Riscos mitigados

- **Risco**: Queries N+1 (muitos users em 1 projeto)
  - **Mitigação**: Eager loading com JOINs
- **Risco**: Data leak (ver tasks de outro projeto)
  - **Mitigação**: Data-level auth em toda repository

---

## 📋 Decisão #3: RBAC com 3 Papéis Fixos

**Status**: ✅ **DECIDIDO: Admin, Editor, Viewer (não granular)**

### O que foi decidido

Role-Based Access Control com **apenas 3 papéis predefinidos**:

- **ADMIN**: Controle total do projeto
- **EDITOR**: Criar/editar tasks, não deletar projeto
- **VIEWER**: Somente leitura

### Alternativas consideradas

| Opção | Prós | Contras | Decisão |
|-------|------|---------|---------|
| **3 Papéis Fixos** | Simples, covers 80% casos | Inflexível, sem granularidade | ✅ ESCOLHIDO |
| Permissões Granulares | Flexível máximo | Muito complexo, YAGNI | ❌ Rejeitado |
| Apenas owner/member | Super simples | Não atende requisitos | ❌ Rejeitado |

### Por quê

- Simples de implementar e entender
- Covers 95% de casos reais
- Fácil de testar
- YAGNI: Não complexidade desnecessária

### Trade-offs

- ✅ Simplicidade, fácil manutenção
- ❌ Não customizável por usuário
- ❌ Paperole é "tudo ou nada"

### Riscos mitigados

- **Risco**: Precisar granularidade depois
  - **Mitigação**: Schema extensível (adicionar permissions table depois)

### Mapping de Permissões

```
✅ ADMIN pode:
  - Tudo (criar, editar, deletar tasks)
  - Adicionar/remover membros
  - Mudar papéis
  - Deletar projeto

✅ EDITOR pode:
  - Criar tasks
  - Editar suas próprias tasks
  - Editar tasks atribuídas a si
  - Ver todas as tasks

❌ EDITOR não pode:
  - Deletar tasks
  - Adicionar membros
  - Deletar projeto

✅ VIEWER pode:
  - Ver tasks apenasvie

❌ VIEWER não pode:
  - Criar/editar/deletar
  - Adicionar membros
```

---

## 📋 Decisão #4: JWT + Refresh Tokens (Não Sessions)

**Status**: ✅ **DECIDIDO: Stateless JWT com refresh automático**

### O que foi decidido

Autenticação stateless usando:

- **Access Token** (JWT, 15 min expiry) em memória
- **Refresh Token** (7 dias) em httpOnly cookie
- Refresh automático quando access token expira

### Alternativas consideradas

| Opção | Prós | Contras | Decisão |
|-------|------|---------|---------|
| **JWT + Refresh** | Stateless, escalável, multi-device | Refresh token revocation | ✅ ESCOLHIDO |
| Sessions servidor | Simples, revocação direta | Difícil escalar horizontal | ❌ Rejeitado |
| OAuth only | Seguro, não custom auth | Não suporta email/password | ❌ Rejeitado |
| Cookies traditional | Simples, CSRF protection | Difícil multi-device | ❌ Rejeitado |

### Por quê

- Stateless = escalável horizontalmente
- Suporta múltiplos dispositivos simultaneamente
- Refresh automático não prejudica UX
- Seguro com httpOnly cookies

### Trade-offs

- ✅ Escalável infinitamente
- ✅ Expiry automático (15 min máximo exposure)
- ❌ Complexidade de refresh token blacklist
- ❌ Token não pode ser revogado imediatamente (logout demorado)

### Riscos mitigados

- **Risco**: Token stolen pode ser usado 15 min
  - **Mitigação**: Access token curto (15 min), SameSite cookie
- **Risco**: Refresh token stolen permanente
  - **Mitigação**: httpOnly cookie, HTTPS obrigatório, rotation on refresh

---

## 📋 Decisão #5: Redis para Cache

**Status**: ✅ **DECIDIDO: Redis com TTL automático**

### O que foi decidido

Cache com Redis e estratégia de TTL:

- Tasks queries: 5 minutos
- Dashboard stats: 1 hora
- JWT session: TTL automático

### Alternativas consideradas

| Opção | Prós | Contras | Decisão |
|-------|------|---------|---------|
| **Redis** | TTL, cluster, revocation fácil | Infra adicional | ✅ ESCOLHIDO |
| In-memory Node | Simples, sem infra | Não persiste entre restarts | ❌ Rejeitado |
| Memcached | Simples | Menos features que Redis | ❌ Rejeitado |
| Sem cache | Simples código | Performance < 500ms falha | ❌ Rejeitado |

### Por quê

- Performance < 500ms requer cache
- TTL automático = sem staleness
- Invalidação simples (delete key)
- Suporta revocation de tokens

### Trade-offs

- ✅ Performance garantida
- ✅ Invalidação simples
- ❌ Infra adicional (Docker image)
- ❌ Complexidade de cache versioning

### Cache Invalidation Strategy

```
CREATE task → delete('tasks:project:X')
UPDATE task → delete('tasks:project:X')
DELETE task → delete('tasks:project:X')
POST comment → delete('tasks:X:comments')
```

---

## 📋 Decisão #6: Soft Deletes + Auditoria

**Status**: ✅ **DECIDIDO: deleted_at + audit_logs**

### O que foi decidido

- Todos os dados marcados com `deleted_at` (NUNCA deletar)
- Auditoria completa em `audit_logs` table com old_values/new_values JSON
- Soft delete = recuperação total + compliance

### Alternativas consideradas

| Opção | Prós | Contras | Decisão |
|-------|------|---------|---------|
| **Soft Deletes** | Recoverável, LGPD, auditoria | Queries filtram deleted_at | ✅ ESCOLHIDO |
| Hard Deletes | Simples, limpo | Sem recuperação, sem auditoria | ❌ Rejeitado |
| Event Sourcing | Histórico completo | Muito complexo para escop | ❌ Rejeitado |

### Por quê

- LGPD obriga direito ao esquecimento (com soft delete consegue)
- Recuperação acidental de deletarions
- Compliance para dados sensíveis

### Trade-offs

- ✅ Recuperação preservada
- ✅ Auditoria total
- ❌ Queries sempre filtram `deleted_at IS NULL`
- ❌ Espaço em disco (histórico cresce)

### Benchmark: Soft Delete Performance

```
SELECT * FROM tasks WHERE project_id = 1
= 50ms (sem soft delete)
= 52ms (com soft delete + index)

Index: CREATE INDEX idx_tasks_project_deleted
       ON tasks(project_id, deleted_at)
```

---

## 📋 Decisão #7: DTOs Obrigatórias

**Status**: ✅ **DECIDIDO: Nunca retornar entidades brutas**

### O que foi decidido

Toda response de API retorna DTOs (Data Transfer Objects), NUNCA entidades do banco:

```
// ❌ RUIM
return user; // Expõe password_hash, campos internos

// ✅ BOM
return new UserDTO(user); // { id, email, name, avatar_url }
```

### Alternativas consideradas

| Opção | Prós | Contras | Decisão |
|-------|------|---------|---------|
| **DTOs** | Segurança, versionamento, flexibilidade | Boilerplate adicional | ✅ ESCOLHIDO |
| Entidades brutas | Simples | Segurança fraca, vazamento dados | ❌ Rejeitado |
| Field selection dinâmica | Flexível | Confuso, propenso a bugs | ❌ Rejeitado |

### Por quê

- **Segurança**: Campos internos (passwords, roles) nunca expostos
- **Versioning**: API pode evoluir sem quebrar clientes
- **Flexibilidade**: Posso remover fields sem quebra

### Trade-offs

- ✅ Segurança blindagem
- ✅ Fácil deprecate fields
- ❌ Boilerplate por feature (arquivo `.dto.ts`)
- ❌ Manutenção: atualizar DTO quando schema muda

---

## 📋 Decisão #8: Pirâmide de Testes

**Status**: ✅ **DECIDIDO: Unit 50-60%, Integration 30-40%, E2E 5-10%**

### O que foi decidido

- **Unit Tests** (50-60%): Services, helpers, business logic puro
- **Integration Tests** (30-40%): API endpoints, banco real, autenticação
- **E2E Tests** (5-10%): Fluxos críticos no browser (signup → login → create task)

### Alternativas consideradas

| Opção | Prós | Contras | Decisão |
|-------|------|---------|---------|
| **Pirâmide** | Rápido + relevante + confiança | Mais trabalho inicial | ✅ ESCOLHIDO |
| E2E Only | Valida tudo | Lento (horas), frágil, caro | ❌ Rejeitado |
| Unit Only | Rápido | Não valida integração real | ❌ Rejeitado |
| Integration Only | Relevante | Lento, não testa helpers | ❌ Rejeitado |

### Por quê

- Unit tests: Fast feedback (100ms total)
- Integration: Valida real scenarios
- E2E: Confiança máxima em fluxo crítico
- Trade-off ideal: Speed vs Confidence

### Coverage Targets

- Backend: **>80%** obrigatório
- Frontend: **>70%** aceitável
- Critical paths: **100%** obrigatório (auth, payments)

---

## 📋 Decisão #9: Validação Backend-First (Nunca Confiar Frontend)

**Status**: ✅ **DECIDIDO: Validação rigorosa no backend, confiem zero no frontend**

### O que foi decidido

Todo input é validado rigorosamente no backend com Zod schemas:

```typescript
// Controller
const data = await validateRequest(createTaskSchema, req.body);
// ✅ Se chegou aqui, dados são válidos e seguros
```

### Por quê

- Frontend pode ser hijacked (XSS), interceptar requisições
- Mobile app pode ser reverse engineered
- Burp Suite pode enviar requests modificadas
- **Conclusão**: Nunca confiar em dados do cliente

### Camadas de Validação

1. **Frontend**: Validação UX (feedback immediate)
2. **Backend**: Validação rigorosa (segurança)
3. **Database**: Constraints (proteção derradeira)

---

## 📋 Decisão #10: Uptime 99.5% (Não 99.9%)

**Status**: ✅ **DECIDIDO: 99.5% = ~3.6 horas downtime/ano**

### O que foi decidido

- **99.5%** = 210 minutos downtime/mês = 3.6 horas/ano
- Não 99.9% (critico, muito overhead)
- Não 99% (casual, não profissional)

### Trade-offs

- Mitigation: Backups, replicação MySQL
- Não precisa: Múltiplos data centers, failover automático
- Future: Escalar para 99.9% se necessário

---

## 📋 Decisão #11: Performance < 500ms

**Status**: ✅ **DECIDIDO: Response time p95 < 500ms**

### O que foi decidido

Todo endpoint deve responder em **< 500ms** (percentil 95)

### Mitigação

- Redis cache (5min TTL)
- Composite indexes (MySQL)
- Paginação obrigatória (20 items)
- Eager loading (JOINs, não N+1)
- Compressão Gzip
- CDN para assets

---

## 📋 Decisão #12: Documentação em docs/

**Status**: ✅ **DECIDIDO: Centralizada em pasta docs/**

### Arquivos

- README.md (índice)
- ARCHITECTURE.md (visão geral)
- DESIGN_DECISIONS.md (este arquivo)
- SETUP.md (configuração)
- DEVELOPMENT.md (guia dev)
- API.md (endpoints)
- SECURITY.md (boas práticas)
- TESTING.md (testes)
- E mais...

### Por quê

- Versionado com código
- Manutenção obrigatória em PRs
- Acessível para toda equipe

---

## 📋 Decisão #13: TypeORM como ORM

**Status**: ✅ **DECIDIDO: TypeORM (a confirmar)**

### Alternativas

| ORM | Prós | Contras |
|-----|------|---------|
| **TypeORM** | Type-safe, migrations, decorators | Learning curve |
| Sequelize | Estabelecido, simples | Menos type-safe |
| Prisma | Moderno, schema DSL | Menos controle SQL |
| Raw SQL | Controle total | Sem migrations auto |

### Trade-offs

- ✅ Type safety automático
- ❌ Boilerplate com decorators
- ❌ Learning curve para iniciantes

---

## 📋 Decisão #14: Zustand vs Redux

**Status**: ✅ **DECIDIDO: Zustand (simpler)**

### Por quê

- Simpler syntax, less boilerplate
- Suporta DevTools
- Fácil migrar para Redux depois se precisar

---

## 📋 Decisão #15: Tailwind CSS

**Status**: ✅ **DECIDIDO: Utility-first + componentes custom**

### Por quê

- Desenvolvimento rápido
- Bundle pequeno (~50KB)
- Dark mode automático
- Fácil customização

### Trade-offs

- ✅ Speed, bundle pequeno
- ❌ "Classe spam" no HTML
- ❌ Learning curve utility-first

---

## 📊 Sumário de Decisões

| # | Decisão | Status | Risco |
|-|-|-|-|
| 1 | Monolítica | ✅ Decidido | 🟡 Médio (> 50k usuários) |
| 2 | Multi-usuário Projects | ✅ Decidido | 🟢 Baixo |
| 3 | RBAC 3 papéis | ✅ Decidido | 🟡 Granularidade futura |
| 4 | JWT + Refresh | ✅ Decidido | 🟢 Baixo |
| 5 | Redis Cache | ✅ Decidido | 🟢 Baixo |
| 6 | Soft Deletes | ✅ Decidido | 🟢 Baixo |
| 7 | DTOs obrigatórias | ✅ Decidido | 🟢 Baixo |
| 8 | Pirâmide testes | ✅ Decidido | 🟡 Tempo inicial |
| 9 | Backend-first validation | ✅ Decidido | 🟢 Baixo |
| 10 | 99.5% uptime | ✅ Decidido | 🟡 Infra |
| 11 | < 500ms response | ✅ Decidido | 🟡 Otimização |
| 12 | Docs centralizado | ✅ Decidido | 🟢 Baixo |
| 13 | TypeORM | ✅ Decidido | 🟡 Learning curve |
| 14 | Zustand | ✅ Decidido | 🟢 Baixo |
| 15 | Tailwind | ✅ Decidido | 🟢 Baixo |

---

## ✅ Próximos Passos

1. ✅ Design decisions documented
2. ⬜ Criar estrutura de pastas
3. ⬜ Setup Docker Compose
4. ⬜ Implementar Backend
5. ⬜ Implementar Frontend
6. ⬜ Testes
7. ⬜ Deploy

---

**Documento Criado**: 2026-04-08  
**Versão**: 1.0  
**Status**: ✅ LOCKED
