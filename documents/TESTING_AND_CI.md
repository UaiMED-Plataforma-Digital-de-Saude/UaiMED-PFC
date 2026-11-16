# Testes e CI — UaiMED

Este documento descreve como rodar os testes localmente, boas práticas para os testes e como configurar CI com Postgres.

Estratégia de testes

- Testes unitários: vitest para utils e serviços isolados.
- Testes de integração: vitest + supertest para endpoints Express (usando `src/app.ts`).
- Banco de testes: recomendamos usar um Postgres dedicado (container) em vez de sqlite, porque o schema Prisma está configurado com `provider = "postgresql"`.

Como rodar localmente

1. Inicie Postgres (docker-compose) a partir da raiz do projeto:

```powershell
cd uaimed-back
docker compose up -d
```

2. Sincronize Prisma e rode testes:

```powershell
npx prisma migrate deploy
npm run test
# ou para o modo CI (sem interface):
npm run test:ci
```

(`npm run test:ci` já cuida de sincronizar o banco de teste descartável com `db push` internamente — não precisa rodar à parte; `migrate deploy` acima é só para o banco de dev local, já que o projeto usa migrations versionadas.)

Boas práticas para testes que já aplicamos

- Use dados únicos em testes (timestamp + random) para evitar colisões no banco.
- Evite `DELETE FROM table` global em `afterAll`. Em vez disso, remova somente registros criados pelo teste (por e-mail/prefixo ou id retornado).
- Rode testes em paralelo se e somente se os testes forem isolados (ou configure `--threads=1` para execução sequencial em CI se usa um DB compartilhado).

Configuração de CI (GitHub Actions) — exemplo básico

Criar workflow `.github/workflows/ci.yml` com um job que usa serviço Postgres:

```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: docker
          POSTGRES_PASSWORD: docker
          POSTGRES_DB: uaimed
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U docker -d uaimed"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
      - name: Install dependencies
        run: |
          cd uaimed-back
          npm ci
      - name: Wait for Postgres
        run: sleep 10
      - name: Set DATABASE_URL
        run: echo "DATABASE_URL=postgresql://docker:docker@localhost:5432/uaimed" >> uaimed-back/.env
      - name: Prisma migrate
        run: |
          cd uaimed-back
          npx prisma migrate deploy
      - name: Run tests
        run: |
          cd uaimed-back
          npm run test:ci
```

Notas:

- Ajuste versões e timeouts conforme necessário.
- Em ambientes de CI, prefira criar banco novo por job para evitar interferência entre runs.

Problemas comuns e soluções

- `EPERM` ao renomear `query_engine-windows.dll.node` no Windows: certifique-se de que não há processos bloqueando `node_modules` (IDE/antivírus) e execute `npm ci` novamente.
