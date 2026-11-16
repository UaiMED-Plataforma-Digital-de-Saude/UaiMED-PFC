# Backend — Setup e Documentação

Este documento explica como configurar e rodar o backend `uaimed-back` localmente, como funciona a arquitetura, e os endpoints principais.

Requisitos

- Node.js >= 18
- npm ou pnpm
- Docker & Docker Compose (recomendado: Postgres container)

Instalação e execução local

1. Abra o terminal na pasta `uaimed-back`.
2. Copie `.env.example` para `.env` e ajuste `DATABASE_URL` para apontar ao seu Postgres local. Exemplo de `.env`:

```
DATABASE_URL="postgresql://docker:docker@localhost:5432/uaimed"
JWT_SECRET=uma_chave_secreta
PORT=3333
```

3. Inicie Postgres (recomendado via docker compose na raiz):

```powershell
# a partir da raiz do workspace
cd uaimed-back
docker compose up -d
```

4. Instale dependências e gere cliente Prisma:

```powershell
npm install
npx prisma migrate deploy
```

5. Rode em modo dev:

```powershell
npm run dev
# ou
npm run start:dev
```

Principais scripts (package.json)

- `dev` / `start:dev`: start da aplicação com ts-node-dev/tsup
- `build`: build de produção
- `test:ci`: sincroniza o schema no banco de teste (`db push`, sem gerar migration — é um banco descartável) e roda a suíte

Prisma

- Schema: `prisma/schema.prisma` (provider: postgresql)
- O projeto usa migrations versionadas (`prisma/migrations/`), não `db push`, para o banco de dev/produção
- Comandos úteis:
  - `npx prisma migrate deploy` (aplica as migrations existentes — uso normal ao clonar o repo)
  - `npx prisma migrate dev --name <nome>` (ao criar uma nova migration)
  - `npx prisma db push` (só para sincronizar o banco de teste descartável, usado pelo script `test:ci`)
  - `npx prisma studio` (abrir Prisma Studio)

Estrutura relevante

- `src/app.ts` — cria e exporta o Express app (usado por testes)
- `src/server.ts` — inicia o servidor
- `src/routes/` — rotas organizadas por domínio (`auth`, `agendamentos`, `pagamentos`, `admin`, etc.)
- `src/controllers/` — lógica de cada rota
- `src/services/` — regras de negócio e helpers
- `src/middleware/` — `authMiddleware`, `role`
- `src/schemas/` — validações Zod
- `src/config/database.ts` — cliente Prisma exportado

Autenticação

- JWT gerado com `generateToken({ id, email, tipo })`
- Middleware `authMiddleware` verifica e anexa `req.user`
- `requireRole` protege rotas por `tipo` (ex.: `medico`, `clinica`)

Endpoints principais (resumo)

- POST `/api/usuarios` — Cadastro (recebe `tipo`. Se `medico`, aceita dados profissionais `crm`, `especialidade`, etc.)
- POST `/api/sessions` — Login (email + senha) retorna token
- GET `/api/agendamentos` — Lista agendamentos do usuário autenticado
- POST `/api/agendamentos` — Criar agendamento
- POST `/api/pagamentos` — Criar pagamento (aceita `usingPlan`, `insuranceCoveragePercent`, `cupom`)
- GET `/api/admin/summary` — Métricas para clínicas (protegido por role)
- GET `/api/professionals/me/summary` — Métricas para profissional autenticado
- POST `/api/contatos` / GET `/api/contatos` — Mensagens de paciente para profissional

Logs e observabilidade

- `src/utils/logger.ts` — utilitário simples para logs em testes e dev

Boas práticas para desenvolvimento

- Use `unique` markers em testes (timestamp) para evitar colisões
- Não execute testes que apaguem tabelas globais; preferir limpeza por prefixo/email
- Em CI, crie um banco Postgres temporário (GitHub Actions services)

Problemas comuns e soluções

- Erro Prisma `P1012` ao forçar sqlite: garanta que `provider` no `schema.prisma` seja `postgresql` se usar postgres
- Erro `P2002` duplicate key: use dados únicos em testes
