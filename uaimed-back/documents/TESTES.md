# 🧪 Estratégia e Documentação de Testes — UaiMED Backend

**Versão**: 1.0.0  
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

O UaiMED adota uma estratégia de testes em camadas, priorizando **testes de integração** da API como base de confiança, complementados por testes unitários de lógica de negócio e verificação E2E do fluxo completo.

### Princípios

- **Isolamento**: cada suíte cria e limpa seus próprios dados por ID
- **Repetibilidade**: UUIDs únicos garantem que testes paralelos não colidam
- **Confiabilidade**: banco de teste isolado (`uaimed_test`) com schema migrado automaticamente via `globalSetup`
- **Velocidade**: 32 casos de integração rodam em menos de 3 segundos no total

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

Os testes unitários validam lógica isolada **sem necessidade de banco de dados**. São rápidos, focados e usam mocks do Prisma.

### Candidatos Recomendados para Próxima Sprint

| Módulo | O que testar | Prioridade |
|--------|-------------|------------|
| `utils/jwt.ts` | `generateToken` e `verifyToken` com payloads válidos e inválidos | Alta |
| `utils/hash.ts` | `hashPassword` e `comparePassword` | Alta |
| `schemas/auth.schema.ts` | Validação Zod: campos obrigatórios, formatos, enum `tipo` | Média |
| `services/auth.service.ts` | Lógica de cadastro e login com Prisma mockado | Média |
| `controllers/pagamentos.controller.ts` | Cálculo de desconto de cupom e plano de saúde | Alta |
| `controllers/avaliacoes.controller.ts` | Validação nota 1–5, cálculo de média | Média |

### Exemplo de Estrutura (futuro)

```typescript
// src/__tests__/unit/jwt.unit.test.ts
import { describe, it, expect } from 'vitest';
import { generateToken, verifyToken } from '../../utils/jwt';

describe('JWT utils', () => {
  it('gera token válido com payload correto', () => {
    const payload = { id: 'uuid-123', email: 'test@test.com', tipo: 'paciente' };
    const token = generateToken(payload);
    expect(token).toBeTruthy();
    const decoded = verifyToken(token);
    expect(decoded).toMatchObject({ id: 'uuid-123' });
  });

  it('retorna null para token inválido', () => {
    const result = verifyToken('token-invalido');
    expect(result).toBeNull();
  });
});
```

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
| **Total** | **32** | | **✅ 32/32** |

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

