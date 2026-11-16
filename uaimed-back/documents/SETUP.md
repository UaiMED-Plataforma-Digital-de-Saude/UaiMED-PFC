# Setup Rápido

1. Copie `.env.example` para `.env` e ajuste se desejar.
2. Suba o Postgres (Docker):

```powershell
docker-compose up -d
```

3. Instale dependências:

```powershell
npm install
```

4. Gere Prisma Client e rode migrações:

```powershell
npx prisma generate
npx prisma migrate deploy
npm run db:seed
```

5. Rodar em modo dev:

```powershell
npm run dev
```
