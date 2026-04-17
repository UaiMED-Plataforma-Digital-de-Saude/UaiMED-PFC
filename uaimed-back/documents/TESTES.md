# 🧪 Estratégia e Documentação de Testes — UaiMED Backend

**Versão**: 1.1.0  
**Data**: 17 de Abril de 2026  
**Framework**: Vitest 1.4 + Supertest 6.3  
**Banco de Teste**: PostgreSQL (`uaimed_test`) — isolado do banco de desenvolvimento

---

## 📑 Índice

1. [Estratégia de Testes](#1-estratégia-de-testes)
2. [Pirâmide de Testes](#2-pirâmide-de-testes)
3. [Testes de Integração (API)](#3-testes-de-integração-api)
4. [Testes Unitários](#4-testes-unitários)
5. [Testes E2E / de Sistema](#5-testes-e2e--de-sistema)
6. [Configuração e Execução](#6-configuração-e-execução)
7. [Cobertura Atual](#7-cobertura-atual)
8. [Boas Práticas Adotadas](#8-boas-práticas-adotadas)

---

## 1. Estratégia de Testes

O UaiMED adota uma estratégia de testes em camadas, priorizando **testes de integração** da API como base de confiança, complementados por **testes unitários** de lógica de negócio e verificação E2E do fluxo completo.

### Princípios

- **Isolamento**: cada suíte cria e limpa seus próprios dados por ID
- **Repetibilidade**: UUIDs únicos garantem que testes paralelos não colidam
- **Confiabilidade**: banco de teste isolado (`uaimed_test`) com schema migrado automaticamente via `globalSetup`
- **Velocidade**: 66 casos (unitários + integração) rodam em menos de 4 segundos no total

---

## 2. Pirâmide de Testes

```
        ┌─────────────────────────────────────┐
        │         E2E / de Sistema            │  ← Menor quantidade, maior cobertura de fluxo
        │   (fluxo completo manual hoje;      │
        │    automação Detox/Playwright futuro)│
        └──────────────────┬──────────────────┘
                           │
        ┌──────────────────▼──────────────────┐
        │      Integração (API)               │  ← Principal camada automatizada (32 casos)
        │      Vitest + Supertest             │    Testa controllers, services e banco real
        └──────────────────┬──────────────────┘
                           │
        ┌──────────────────▼──────────────────┐
        │          Unitários                  │  ← Lógica isolada: utils, schemas, helpers
        │       Vitest (sem DB)               │    (candidatos documentados na seção 4)
        └─────────────────────────────────────┘
```

---

## 3. Testes de Integração (API)

Os testes de integração são a **camada principal** de validação automatizada. Eles:
- Sobem o servidor Express real via `supertest`
- Conectam ao banco PostgreSQL de teste (`uaimed_test`)
- Criam dados reais, testam endpoints reais e limpam tudo no `afterAll`

### 3.1 `health.test.ts`
**Localização**: `src/__tests__/health.test.ts`

| # | Caso de Teste | Endpoint | Resultado Esperado |
|---|---------------|----------|--------------------|
| 1 | Health check retorna status OK | `GET /api/health` | 200 `{ status: 'OK' }` |

---

### 3.2 `auth_signup_signin.test.ts`
**Localização**: `src/__tests__/auth_signup_signin.test.ts`

| # | Caso de Teste | Endpoint | Resultado Esperado |
|---|---------------|----------|--------------------|
| 1 | Cria usuário com dados válidos | `POST /api/usuarios` | 201 `{ user, token }` |
| 2 | Rejeita e-mail duplicado | `POST /api/usuarios` | 409 Conflict |
| 3 | Faz login com credenciais corretas | `POST /api/sessions` | 200 `{ user, token }` |
| 4 | Rejeita login com senha errada | `POST /api/sessions` | 401 Unauthorized |
| 5 | Rejeita login de usuário inexistente | `POST /api/sessions` | 401 Unauthorized |

---

### 3.3 `auth_notifications.test.ts`
**Localização**: `src/__tests__/auth_notifications.test.ts`

| # | Caso de Teste | Endpoint | Resultado Esperado |
|---|---------------|----------|--------------------|
| 1 | Altera senha com senha atual válida | `POST /api/auth/change-password` | 200 `{ message }` |
| 2 | Salva preferências de notificação | `POST /api/users/me/notifications` | 200 `{ data: { email, push } }` |

---

### 3.4 `contatos.test.ts`
**Localização**: `src/__tests__/contatos.test.ts`

| # | Caso de Teste | Endpoint | Resultado Esperado |
|---|---------------|----------|--------------------|
| 1 | Cria contato e lista corretamente | `POST /api/contatos` + `GET /api/contatos` | 201 + 200 lista não vazia |

---

### 3.5 `medicos_agendamentos.test.ts`
**Localização**: `src/__tests__/medicos_agendamentos.test.ts`

| # | Caso de Teste | Endpoint | Resultado Esperado |
|---|---------------|----------|--------------------|
| 1 | Lista médicos e inclui profissional criado | `GET /api/medicos` | 200 array com o profissional |
| 2 | Retorna agendamentos do usuário autenticado | `GET /api/agendamentos` | 200 array com status `confirmado` |

---

### 3.6 `agendamentos_criar.test.ts`
**Localização**: `src/__tests__/agendamentos_criar.test.ts`

| # | Caso de Teste | Endpoint | Resultado Esperado |
|---|---------------|----------|--------------------|
| 1 | Cria agendamento com dados válidos | `POST /api/agendamentos` | 201 `{ id, profissionalId }` |
| 2 | Rejeita sem autenticação | `POST /api/agendamentos` | 401 Unauthorized |
| 3 | Rejeita sem `medicoId` | `POST /api/agendamentos` | 400 Bad Request |
| 4 | Retorna sugestões de horário para um médico | `GET /api/agendamentos/sugestoes-horario?medicoId=` | 200 array de horários |
| 5 | Rejeita sugestões sem `medicoId` | `GET /api/agendamentos/sugestoes-horario` | 400 Bad Request |

---

### 3.7 `avaliacoes.test.ts`
**Localização**: `src/__tests__/avaliacoes.test.ts`

| # | Caso de Teste | Endpoint | Resultado Esperado |
|---|---------------|----------|--------------------|
| 1 | Cria avaliação com nota 5 | `POST /api/avaliacoes` | 201 `{ id, nota: 5 }` |
| 2 | Rejeita nota inválida (0) | `POST /api/avaliacoes` | 400 Bad Request |
| 3 | Rejeita nota inválida (6) | `POST /api/avaliacoes` | 400 Bad Request |
| 4 | Retorna média calculada das avaliações | `GET /api/avaliacoes/medico/:id/media` | 200 `{ notaMedia, totalAvaliacoes }` |
| 5 | Retorna notaMedia 0 para profissional sem avaliações | `GET /api/avaliacoes/medico/:id/media` | 200 `{ notaMedia: 0 }` |
| 6 | Rejeita criação sem autenticação | `POST /api/avaliacoes` | 401 Unauthorized |

---

### 3.8 `pagamentos.test.ts`
**Localização**: `src/__tests__/pagamentos.test.ts`

| # | Caso de Teste | Endpoint | Resultado Esperado |
|---|---------------|----------|--------------------|
| 1 | Processa pagamento com dados válidos | `POST /api/pagamentos` | 201 `{ status: 'concluido', valorFinal: 200 }` |
| 2 | Processa pagamento com cupom (10% off) | `POST /api/pagamentos` | 201 `{ valorFinal: 90 }` |
| 3 | Lista pagamentos do usuário | `GET /api/pagamentos` | 200 array não vazio |
| 4 | Rejeita sem campos obrigatórios | `POST /api/pagamentos` | 400 Bad Request |
| 5 | Rejeita listagem sem autenticação | `GET /api/pagamentos` | 401 Unauthorized |
| 6 | Valida cupom válido | `POST /api/cupons/validar` | 200 `{ valido: true }` |
| 7 | Rejeita cupom inexistente | `POST /api/cupons/validar` | 400 `{ valido: false }` |
| 8 | Rejeita validação sem código | `POST /api/cupons/validar` | 400 Bad Request |

---

### 3.9 `admin.test.ts`
**Localização**: `src/tests/admin.test.ts`

| # | Caso de Teste | Endpoint | Resultado Esperado |
|---|---------------|----------|--------------------|
| 1 | Retorna summary para usuário clínica | `GET /api/admin/summary` | 200 `{ totalUsuarios, topProfissionais, ... }` |

---

### 3.10 `professional.test.ts`
**Localização**: `src/tests/professional.test.ts`

| # | Caso de Teste | Endpoint | Resultado Esperado |
|---|---------------|----------|--------------------|
| 1 | Retorna summary para médico autenticado | `GET /api/professionals/me/summary` | 200 `{ totalToday, nextAppointments, revenueThisMonth }` |

---

## 4. Testes Unitários

Os testes unitários validam lógica isolada **sem necessidade de banco de dados**. São rápidos, focados e não dependem do Docker ou do PostgreSQL.

### 4.1 `jwt.unit.test.ts`
**Localização**: `src/__tests__/unit/jwt.unit.test.ts`

| # | Caso de Teste | Resultado Esperado |
|---|---------------|--------------------|
| 1 | Gera token como string não vazia | `typeof token === 'string'` e `length > 0` |
| 2 | Token tem 3 partes separadas por ponto (formato JWT) | `token.split('.').length === 3` |
| 3 | Verifica token válido e retorna payload correto | `{ id, email, tipo }` idênticos ao original |
| 4 | Retorna `null` para token completamente inválido | `null` |
| 5 | Retorna `null` para string vazia | `null` |
| 6 | Retorna `null` para token adulterado (assinatura falsa) | `null` |
| 7 | Dois tokens de payloads diferentes são diferentes | `token1 !== token2` |
| 8 | Preserva campo `tipo` no payload decodificado | `decoded.tipo === 'medico'` |

---

### 4.2 `hash.unit.test.ts`
**Localização**: `src/__tests__/unit/hash.unit.test.ts`

| # | Caso de Teste | Resultado Esperado |
|---|---------------|--------------------|
| 1 | Hash é diferente da senha original | `hash !== senha` |
| 2 | Hash é uma string não vazia | `typeof hash === 'string'` e `length > 0` |
| 3 | Hash começa com prefixo bcrypt válido (`$2a$` ou `$2b$`) | `startsWith('$2a$') \|\| startsWith('$2b$')` |
| 4 | Dois hashes da mesma senha são diferentes (salt aleatório) | `hash1 !== hash2` |
| 5 | `comparePassword` retorna `true` para senha correta | `true` |
| 6 | `comparePassword` retorna `false` para senha errada | `false` |
| 7 | `comparePassword` retorna `false` para string vazia | `false` |
| 8 | `comparePassword` retorna `false` para hash inválido | `false` |

> **Nota**: o prefixo `$2a$` é gerado pelo `bcryptjs` neste ambiente. Ambos `$2a$` e `$2b$` são equivalentes em segurança — diferem apenas na versão interna do algoritmo.

---

### 4.3 `auth.schema.unit.test.ts`
**Localização**: `src/__tests__/unit/auth.schema.unit.test.ts`

| # | Grupo | Caso de Teste | Resultado Esperado |
|---|-------|---------------|--------------------|
| 1 | `signinSchema` | Aceita email e password válidos | `success: true` |
| 2 | `signinSchema` | Rejeita email inválido | `success: false` |
| 3 | `signinSchema` | Rejeita password com menos de 6 chars | `success: false` |
| 4 | `signinSchema` | Rejeita sem email | `success: false` |
| 5 | `signinSchema` | Rejeita sem password | `success: false` |
| 6 | `signupSchema` | Aceita dados válidos de paciente | `success: true` |
| 7 | `signupSchema` | Aceita sem campo tipo (default implícito) | `success: true` |
| 8 | `signupSchema` | Aceita tipo médico com campos opcionais | `success: true` |
| 9 | `signupSchema` | Rejeita tipo inválido (`admin`) | `success: false` |
| 10 | `signupSchema` | Rejeita nome com menos de 2 chars | `success: false` |
| 11 | `signupSchema` | Rejeita email inválido | `success: false` |
| 12 | `signupSchema` | Rejeita CPF com menos de 11 chars | `success: false` |
| 13 | `signupSchema` | Rejeita telefone com menos de 8 chars | `success: false` |
| 14 | `signupSchema` | Rejeita senha com menos de 6 chars | `success: false` |
| 15 | `signupSchemaValidated` | Rejeita médico sem especialidade e CRM | `success: false` |
| 16 | `signupSchemaValidated` | Rejeita médico com especialidade mas sem CRM | `success: false` |
| 17 | `signupSchemaValidated` | Aceita médico com especialidade e CRM | `success: true` |
| 18 | `signupSchemaValidated` | Aceita paciente sem especialidade e CRM | `success: true` |

---

## 5. Testes E2E / de Sistema

Os testes E2E validam o **fluxo completo** do ponto de vista do usuário final, passando por frontend e backend integrados.

### Fluxo Principal — Agendamento Completo

```
[1]  Cadastro / Login
       ↓
[2]  Busca de profissional por especialidade
       ↓
[3]  Visualização do calendário de disponibilidade
       ↓
[4]  Seleção de data e horário
       ↓
[5]  POST /api/agendamentos → criação confirmada
       ↓
[6]  Tela de Confirmação (resumo do agendamento)
       ↓
[7]  Seleção de método de pagamento (PIX / Cartão / Boleto)
       ↓
[8]  POST /api/pagamentos → pagamento processado
       ↓
[9]  Tela de Avaliação do profissional
       ↓
[10] POST /api/avaliacoes → avaliação registrada
       ↓
[11] Retorno à tela inicial (HomeScreen)
```

### Fluxo Secundário — Recuperação de Senha

```
[1]  Tela de Login → "Esqueci a senha"
       ↓
[2]  RecuperarSenhaScreen → informa e-mail
       ↓
[3]  EmailEnviadoScreen → confirmação visual
       ↓
[4]  Botão "Voltar ao login"
```

### Status Atual de E2E

| Fluxo | Método | Status |
|-------|--------|--------|
| Agendamento completo (ponta a ponta) | Teste manual | ✅ Verificado |
| Recuperação de senha | Teste manual | ✅ UI verificada |
| Dashboard de clínica | Teste manual | ✅ Verificado |
| Dashboard de médico | Teste manual | ✅ Verificado |
| Minhas Consultas / Meus Pagamentos | Teste manual | ✅ Verificado |
| E2E automatizado (Detox / Playwright) | Automático | ⚠️ Planejado (pós-PFC) |

---

## 6. Configuração e Execução

### Pré-requisitos

```bash
# Banco de dados deve estar rodando via Docker
docker-compose up -d

# O banco uaimed_test é criado automaticamente pelo globalSetup.ts
# O arquivo .env.test define DATABASE_URL apontando para uaimed_test
```

### Comandos

```bash
# Rodar todos os testes (modo CI — sem watch)
npm test

# Rodar em modo watch (desenvolvimento interativo)
npm run test:watch

# Rodar uma suíte específica
npx vitest run src/__tests__/pagamentos.test.ts

# Rodar com cobertura (futuro)
npx vitest run --coverage
```

### Configuração (`vitest.config.ts`)

```typescript
{
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/tests/setup.env.ts'],    // carrega .env.test antes dos módulos
    globalSetup: ['./src/tests/globalSetup.ts'], // aplica prisma db push no banco de teste
    include: ['src/**/*.test.ts'],               // somente .test.ts (exclui .spec.ts duplicatas)
    testTimeout: 30000,
    hookTimeout: 30000,
  }
}
```

---

## 7. Cobertura Atual

### Resumo por Suíte

#### Testes de Integração (API)

| Suíte | Casos | Tipo | Status |
|-------|-------|------|--------|
| `health.test.ts` | 1 | Integração | ✅ Passando |
| `auth_signup_signin.test.ts` | 5 | Integração | ✅ Passando |
| `auth_notifications.test.ts` | 2 | Integração | ✅ Passando |
| `contatos.test.ts` | 1 | Integração | ✅ Passando |
| `medicos_agendamentos.test.ts` | 2 | Integração | ✅ Passando |
| `agendamentos_criar.test.ts` | 5 | Integração | ✅ Passando |
| `avaliacoes.test.ts` | 6 | Integração | ✅ Passando |
| `pagamentos.test.ts` | 8 | Integração | ✅ Passando |
| `admin.test.ts` | 1 | Integração | ✅ Passando |
| `professional.test.ts` | 1 | Integração | ✅ Passando |
| **Subtotal** | **32** | | **✅ 32/32** |

#### Testes Unitários

| Suíte | Casos | Tipo | Status |
|-------|-------|------|--------|
| `unit/jwt.unit.test.ts` | 8 | Unitário | ✅ Passando |
| `unit/hash.unit.test.ts` | 8 | Unitário | ✅ Passando |
| `unit/auth.schema.unit.test.ts` | 18 | Unitário | ✅ Passando |
| **Subtotal** | **34** | | **✅ 34/34** |

#### Total Geral

| Tipo | Casos | Status |
|------|-------|--------|
| Integração (API) | 32 | ✅ |
| Unitários | 34 | ✅ |
| E2E automatizado | 0 | ⚠️ Planejado |
| **Total** | **66** | **✅ 66/66** |

### Endpoints Cobertos

| Endpoint | Método | Coberto |
|----------|--------|---------|
| `/api/health` | GET | ✅ |
| `/api/usuarios` | POST | ✅ |
| `/api/sessions` | POST | ✅ |
| `/api/auth/change-password` | POST | ✅ |
| `/api/users/me/notifications` | POST | ✅ |
| `/api/contatos` | POST + GET | ✅ |
| `/api/medicos` | GET | ✅ |
| `/api/agendamentos` | GET + POST | ✅ |
| `/api/agendamentos/sugestoes-horario` | GET | ✅ |
| `/api/avaliacoes` | POST | ✅ |
| `/api/avaliacoes/medico/:id/media` | GET | ✅ |
| `/api/pagamentos` | GET + POST | ✅ |
| `/api/cupons/validar` | POST | ✅ |
| `/api/admin/summary` | GET | ✅ |
| `/api/professionals/me/summary` | GET | ✅ |

---

## 8. Boas Práticas Adotadas

### Isolamento via UUID Único

```typescript
// ✅ Cada teste usa UUID único — testes paralelos nunca colidem
const unique = uuidv4();
user = await prisma.usuario.create({
  data: { email: `test-${unique}@example.com`, cpf: `cp${unique.slice(0,9)}`, ... }
});
```

### Limpeza por ID (não por padrão de texto)

```typescript
// ✅ Deleta apenas os dados criados por esta suíte
afterAll(async () => {
  if (user?.id) await prisma.pagamento.deleteMany({ where: { usuarioId: user.id } }).catch(() => {});
  if (user?.id) await prisma.agendamento.deleteMany({ where: { usuarioId: user.id } }).catch(() => {});
  if (user?.id) await prisma.usuario.deleteMany({ where: { id: user.id } }).catch(() => {});
  await prisma.$disconnect();
});

// ❌ Evitado — afeta dados de outras suítes rodando em paralelo
// prisma.usuario.deleteMany({ where: { email: { contains: 'test' } } })
```

### Bancos Separados por Ambiente

```
uaimed_dev  → banco de desenvolvimento  (npm run dev)
uaimed_test → banco de testes           (npm test)
```

### Ordem de Limpeza (respeita FK constraints)

```typescript
// Ordem obrigatória para não violar integridade referencial:
await prisma.pagamento.deleteMany(...)    // 1º — depende de agendamento
await prisma.avaliacao.deleteMany(...)    // 2º — depende de usuário/profissional
await prisma.agendamento.deleteMany(...)  // 3º — depende de usuário/profissional
await prisma.contato.deleteMany(...)      // 4º — depende de usuário
await prisma.profissional.deleteMany(...) // 5º — depende de usuário
await prisma.usuario.deleteMany(...)      // 6º — entidade raiz (último)
```

### Timeouts Adequados para CI

```typescript
testTimeout: 30000,  // 30s por teste (operações de banco podem ser lentas em CI)
hookTimeout: 30000,  // 30s para beforeAll/afterAll
```

---

**Documento criado em**: 17 de Abril de 2026  
**Autor**: Equipe de Desenvolvimento UaiMED  
**Referência**: [`vitest.config.ts`](../vitest.config.ts) · [`src/__tests__/`](../src/__tests__/) · [`DOCUMENTACAO_PROJETO_UAIMED.md`](../../DOCUMENTACAO_PROJETO_UAIMED.md)

