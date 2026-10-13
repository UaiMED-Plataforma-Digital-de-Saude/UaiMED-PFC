# Backend UaiMED — Setup e Testes Manuais

> **Nota sobre esta revisão**: a versão anterior deste arquivo (11/Nov/2025, 1864 linhas) era um tutorial especulativo de "como construir o backend do zero", escrito **antes de o backend (`uaimed-back`) existir**. Ele incluía um schema Prisma e código de serviços/controllers inventados que divergiram da implementação real — por exemplo, o schema documentado tinha apenas 4 modelos (`Usuario`, `Agendamento`, `Avaliacao`, `Contato`, `Pagamento`), enquanto o schema real em `uaimed-back/prisma/schema.prisma` tem **12 modelos** (inclui `Profissional`, `HorarioAtendimento`, `ClinicaProfissional`, `Cupom`, `Conversa`, `Artigo`, `Mensagem`, ausentes do documento antigo). Manter aquele conteúdo seria enganoso, então foi substituído por este guia enxuto, que aponta para a documentação real do backend e mantém apenas o que foi verificado contra o código atual.

## Onde está a documentação oficial do backend

O backend é um projeto próprio em [`../uaimed-back`](../uaimed-back), com sua própria documentação:

- [`uaimed-back/documents/SETUP.md`](../uaimed-back/documents/SETUP.md) — setup passo a passo (fonte da verdade)
- [`uaimed-back/documents/API.md`](../uaimed-back/documents/API.md) — visão geral da API
- [`uaimed-back/documents/TESTES.md`](../uaimed-back/documents/TESTES.md) — estratégia de testes e cobertura

## Pré-requisitos

- **Node.js** 18+
- **Docker** (para o PostgreSQL local via `docker-compose`)

## Rodando o backend para desenvolvimento do frontend

```bash
cd ../uaimed-back
cp .env.example .env
docker-compose up -d        # sobe o Postgres
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev                 # servidor em http://localhost:3333
```

O frontend espera a API em `http://localhost:3333/api` (web/iOS) ou `http://10.0.2.2:3333/api` (emulador Android) — ver tabela completa em [`../README.md`](../README.md#url-da-api-por-ambiente).

## Testando a API manualmente (cURL)

Exemplos verificados contra os schemas reais (`uaimed-back/src/schemas/`). Atenção: o endpoint de cadastro usa o campo `senha`, mas o de login usa `password` — é uma inconsistência real do backend, não um erro deste guia.

### 1. Cadastrar usuário

```bash
curl -X POST http://localhost:3333/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Silva",
    "email": "maria@example.com",
    "cpf": "11122233344",
    "telefone": "11999991111",
    "senha": "senha123",
    "tipo": "paciente"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3333/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@example.com",
    "password": "senha123"
  }'
```

Guarde o `token` e o `refreshToken` retornados.

### 3. Enviar contato (autenticado)

```bash
curl -X POST http://localhost:3333/api/contatos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "profissionalId": "id-do-profissional",
    "assunto": "Dúvida sobre consulta",
    "mensagem": "Olá, gostaria de agendar uma consulta"
  }'
```

### 4. Validar cupom

```bash
curl -X POST http://localhost:3333/api/cupons/validar \
  -H "Content-Type: application/json" \
  -d '{ "codigo": "UAIMED10" }'
```

### 5. Média de avaliações de um profissional

```bash
curl http://localhost:3333/api/avaliacoes/medico/id-do-profissional/media
```

---

**Última atualização**: 13 de Outubro de 2026
