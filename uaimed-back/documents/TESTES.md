# 🧪 Estratégia e Documentação de Testes — UaiMED Backend

**Versão**: 1.3.0  
**Data**: 30 de Outubro de 2026  
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
- **Velocidade**: 155 casos (unitários + integração), em 23 arquivos, rodam em menos de 8 segundos no total (`Duration 7.75s` na última execução)

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
        │      Integração (API)               │  ← Principal camada automatizada (116 casos, 20 arquivos)
        │      Vitest + Supertest             │    Testa controllers, services e banco real
        └──────────────────┬──────────────────┘
                           │
        ┌──────────────────▼──────────────────┐
        │          Unitários                  │  ← Lógica isolada: utils, schemas (39 casos, 3 arquivos)
        │       Vitest (sem DB)               │
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
| 3 | Rejeita cadastro sem aceitar a Política de Privacidade (LGPD) | `POST /api/usuarios` | 400 Bad Request |
| 4 | Faz login com credenciais corretas (`precisaConsentimentoLgpd: false`) | `POST /api/sessions` | 200 `{ user, token }` |
| 5 | Rejeita login com senha errada | `POST /api/sessions` | 401 Unauthorized |
| 6 | Rejeita login de usuário inexistente | `POST /api/sessions` | 401 Unauthorized |
| 7 | Login de usuário sem `consentimentoLgpd` retorna `precisaConsentimentoLgpd: true` e ainda libera o token | `POST /api/sessions` | 200, login não bloqueado |
| 8 | `POST /users/me/consentimento-lgpd` registra o aceite e audita a operação | `POST /api/users/me/consentimento-lgpd` | 200, `LogAuditoria` criado |

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
| 2 | Permite ao médico destinatário marcar o contato como lido | `PATCH /api/contatos/:id` | 200 `{ lido: true }` |
| 3 | Rejeita marcação de lido por quem não é o destinatário | `PATCH /api/contatos/:id` | 403 Forbidden |

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
| 6 | Rejeita agendamento com `dataHora` inválida | `POST /api/agendamentos` | 400 Bad Request |
| 7 | Não sugere horários em dias marcados como indisponíveis pelo médico | `GET /api/agendamentos/sugestoes-horario` | 200 array sem os horários bloqueados |

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
| 7 | Lista as avaliações feitas pelo paciente autenticado | `GET /api/avaliacoes/minhas` | 200 array com dados do profissional |
| 8 | Rejeita listagem de avaliações próprias sem autenticação | `GET /api/avaliacoes/minhas` | 401 Unauthorized |

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
| 5 | Rejeita pagamento com valor negativo | `POST /api/pagamentos` | 400 Bad Request |
| 6 | Rejeita `insuranceCoveragePercent` fora de 0–100 | `POST /api/pagamentos` | 400 Bad Request |
| 7 | Rejeita listagem sem autenticação | `GET /api/pagamentos` | 401 Unauthorized |
| 8 | Valida cupom válido | `POST /api/cupons/validar` | 200 `{ valido: true }` |
| 9 | Rejeita cupom inexistente | `POST /api/cupons/validar` | 400 `{ valido: false }` |
| 10 | Rejeita validação sem código | `POST /api/cupons/validar` | 400 Bad Request |

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
| 2 | Retorna séries semanal e mensal incluindo o agendamento seed | `GET /api/professionals/me/summary` | 200 inclui `weeklySeries`/`monthlySeries` |
| 3 | Atualiza o preço da consulta do médico autenticado | `PUT /api/professionals/me/preco` | 200 preço atualizado |
| 4 | Rejeita preço não positivo | `PUT /api/professionals/me/preco` | 400 Bad Request |
| 5 | Retorna template padrão de disponibilidade quando o médico nunca configurou | `GET /api/professionals/me/disponibilidade` | 200 template default |
| 6 | Substitui a disponibilidade semanal e reflete no GET seguinte | `PUT` + `GET /api/professionals/me/disponibilidade` | 200 disponibilidade atualizada |
| 7 | Rejeita payload de disponibilidade com menos de 7 dias ou intervalo inválido | `PUT /api/professionals/me/disponibilidade` | 400 Bad Request |
| 8 | Rejeita endpoints de preço/disponibilidade para usuários que não são médico | `PUT /api/professionals/me/preco` ou `/disponibilidade` | 403 Forbidden |

---

### 3.11 `professionals.test.ts`
**Localização**: `src/__tests__/professionals.test.ts`

| # | Caso de Teste | Endpoint | Resultado Esperado |
|---|---------------|----------|--------------------|
| 1 | Rejeita atualização sem endereço, cidade ou estado | `PUT /professionals/me/endereco` | 400 Bad Request |
| 2 | Rejeita atualização sem autenticação | `PUT /professionals/me/endereco` | 401 Unauthorized |
| 3 | Rejeita atualização para usuário que não é médico | `PUT /professionals/me/endereco` | 403 Forbidden |

---

### 3.12 `clinicas.test.ts`
**Localização**: `src/__tests__/clinicas.test.ts`

| # | Caso de Teste | Endpoint | Resultado Esperado |
|---|---------------|----------|--------------------|
| 1 | Cria uma clínica com cidade e estado | `POST /api/usuarios` | 201 clínica criada |
| 2 | Rejeita cadastro de clínica com e-mail duplicado | `POST /api/usuarios` | 409 Conflict |
| 3 | Envia uma solicitação sem vincular o médico imediatamente | `POST /api/clinicas/.../solicitar` | 200/201 solicitação pendente |
| 4 | Pesquisa médico somente pelo CPF ou CRM completo | `GET /api/clinicas/.../buscar-medico` | 200 resultado exato |
| 5 | Permite que o médico aceite a solicitação pelo perfil | `POST /api/clinicas/.../aceitar` | 200 vínculo criado |
| 6 | Desvincula o médico da clínica | `DELETE /api/clinicas/.../medicos/:id` | 200 vínculo removido |
| 7 | Retorna lista de clínicas ativas | `GET /api/clinicas` | 200 array de clínicas ativas |
| 8 | Não retorna clínicas inativas | `GET /api/clinicas` | 200 array sem inativas |
| 9 | Não retorna usuários que não são clínicas | `GET /api/clinicas` | 200 array filtrado por tipo |
| 10 | Retorna clínicas sem filtro | `GET /api/clinicas/recomendadas` | 200 array completo |
| 11 | Filtra clínicas por estado | `GET /api/clinicas/recomendadas?estado=` | 200 array filtrado |
| 12 | Filtra clínicas por cidade | `GET /api/clinicas/recomendadas?cidade=` | 200 array filtrado |
| 13 | Filtra clínicas por cidade e estado combinados | `GET /api/clinicas/recomendadas` | 200 array filtrado |
| 14 | Retorna array vazio para filtro sem resultados | `GET /api/clinicas/recomendadas` | 200 `[]` |
| 15 | Não retorna clínicas inativas nas recomendadas | `GET /api/clinicas/recomendadas` | 200 array sem inativas |
| 16 | Retorna campo `localizacao` formatado corretamente | `GET /api/clinicas/recomendadas` | 200 `localizacao: "Cidade/UF"` |
| 17 | Retorna apenas clínicas selecionadas para destaque | `GET /api/clinicas/recomendadas` | 200 array filtrado por destaque |

---

### 3.13 `artigos.test.ts`
**Localização**: `src/__tests__/artigos.test.ts`

| # | Caso de Teste | Endpoint | Resultado Esperado |
|---|---------------|----------|--------------------|
| 1 | Permite ao admin cadastrar artigo e define a autoria pela sessão | `POST /api/artigos` | 201 artigo criado |
| 2 | Permite ao admin editar artigos existentes de outros autores | `PUT /api/artigos/:id` | 200 artigo atualizado |
| 3 | Permite ao admin acessar o painel de artigos | `GET /api/artigos/admin` | 200 lista administrativa |
| 4 | Bloqueia escrita e painel para conta do tipo paciente | `POST`/`GET /api/artigos/admin` | 403 Forbidden |
| 5 | Bloqueia escrita e painel para conta do tipo médico | `POST`/`GET /api/artigos/admin` | 403 Forbidden |
| 6 | Bloqueia escrita e painel para conta do tipo clínica | `POST`/`GET /api/artigos/admin` | 403 Forbidden |
| 7 | Bloqueia escrita e painel para conta do tipo admin não autorizada | `POST`/`GET /api/artigos/admin` | 403 Forbidden |
| 8 | Confere o usuário no banco mesmo quando o token declara o e-mail do admin | `POST /api/artigos` | 403 Forbidden (token adulterado) |
| 9 | Bloqueia uma conta administrativa inativa mesmo com token válido | `POST /api/artigos` | 403 Forbidden |
| 10 | Bloqueia tokens de contas que não existem mais | `POST /api/artigos` | 401/403 |
| 11 | Mantém listagem e detalhes disponíveis sem autenticação | `GET /api/artigos` | 200 acesso público |
| 12 | Mantém leitura para usuários comuns autenticados | `GET /api/artigos/:id` | 200 OK |
| 13 | Rejeita criação e edição com campos obrigatórios vazios | `POST`/`PUT /api/artigos` | 400 Bad Request |
| 14 | Rejeita banner em formato inválido | `POST /api/artigos` | 400 Bad Request |
| 15 | Rejeita escrita e acesso ao painel sem autenticação | `POST`/`GET /api/artigos/admin` | 401 Unauthorized |
| 16 | Reserva `admin@uaimed.com` contra cadastro público | `POST /api/usuarios` | 409/403 |
| 17 | Reserva `ADMIN@UAIMED.COM` contra cadastro público (case-insensitive) | `POST /api/usuarios` | 409/403 |

---

### 3.14 `conversas.test.ts`
**Localização**: `src/__tests__/conversas.test.ts`

| # | Caso de Teste | Endpoint | Resultado Esperado |
|---|---------------|----------|--------------------|
| 1 | Permite ao paciente iniciar uma conversa com o médico | `POST /api/conversas` | 201 conversa criada |
| 2 | Entrega a mensagem do paciente ao médico e marca como lida ao abrir | `POST` + `GET /api/conversas/:id/mensagens` | 200/201 |
| 3 | Permite ao médico responder e entrega a resposta ao paciente | `POST /api/conversas/:id/mensagens` | 201 mensagem entregue |
| 4 | Registra em auditoria cada mensagem enviada, nos dois sentidos | `POST /api/conversas/:id/mensagens` | `LogAuditoria` (`ENVIAR_MENSAGEM`) por envio |
| 5 | Não permite que o médico crie uma conversa como se fosse paciente | `POST /api/conversas` | 403 Forbidden |

---

### 3.15 `destaques.test.ts`
**Localização**: `src/__tests__/destaques.test.ts`

| # | Caso de Teste | Endpoint | Resultado Esperado |
|---|---------------|----------|--------------------|
| 1 | Lista opções ativas sem incluir a conta administrativa ou a clínica inativa | `GET /api/admin/destaques` | 200 lista filtrada |
| 2 | Novos cadastros não aparecem automaticamente em destaque | `GET /api/admin/destaques` | 200 sem o novo cadastro |
| 3 | Salva a seleção e a home retorna somente os escolhidos | `PUT /api/admin/destaques` | 200 + Home reflete a seleção |
| 4 | Mantém o filtro de localização mesmo para os selecionados | `GET /api/clinicas/recomendadas` | 200 respeita filtro |
| 5 | Não altera a seleção quando há IDs inexistentes, inativos ou de outro tipo | `PUT /api/admin/destaques` | 400/200 ignora IDs inválidos |
| 6 | Valida o corpo e impede IDs duplicados | `PUT /api/admin/destaques` | 400 Bad Request |
| 7 | Não exibe um profissional selecionado que ficou inativo | `GET /api/admin/destaques` | 200 oculta inativo |
| 8 | Retira todos os destaques ao salvar arrays vazios, sem voltar à seleção automática | `PUT /api/admin/destaques` | 200 lista vazia |
| 9 | Rejeita acesso sem autenticação e de outras contas, inclusive outro admin | `GET`/`PUT /api/admin/destaques` | 401/403 |

---

### 3.16 `conta-bancaria.test.ts`
**Localização**: `src/__tests__/conta-bancaria.test.ts`

| # | Caso de Teste | Endpoint | Resultado Esperado |
|---|---------------|----------|--------------------|
| 1 | Atualiza dados bancários com dados válidos | `PUT /api/usuarios/me/conta-bancaria` | 200 dados atualizados |
| 2 | Rejeita `tipoConta` inválido | `PUT /api/usuarios/me/conta-bancaria` | 400 Bad Request |
| 3 | Rejeita atualização sem autenticação | `PUT /api/usuarios/me/conta-bancaria` | 401 Unauthorized |

---

### 3.17 `users.test.ts`
**Localização**: `src/__tests__/users.test.ts`

| # | Caso de Teste | Endpoint | Resultado Esperado |
|---|---------------|----------|--------------------|
| 1 | Atualiza nome e telefone com dados válidos | `PUT /api/users/me` | 200 perfil atualizado |
| 2 | Rejeita atualização sem autenticação | `PUT /api/users/me` | 401 Unauthorized |
| 3 | Atualiza avatar com base64 válido | `PUT /api/users/me/avatar` | 200 avatar atualizado |
| 4 | Rejeita avatar em formato inválido | `PUT /api/users/me/avatar` | 400 Bad Request |

---

### 3.18 `auditoria.test.ts`
**Localização**: `src/tests/auditoria.test.ts`

| # | Caso de Teste | Endpoint | Resultado Esperado |
|---|---------------|----------|--------------------|
| 1 | Registra um log de auditoria quando o médico lista os agendamentos dos pacientes | `GET /api/professionals/me/agendamentos` | `LogAuditoria` (`LISTAR_AGENDAMENTOS_PACIENTES`) criado |
| 2 | `purgarAntigos` remove só os logs mais velhos que a retenção configurada | `AuditoriaService.purgarAntigos(6)` (chamada direta) | log antigo removido, log recente preservado |

---

### 3.19 `relatorios.test.ts`
**Localização**: `src/tests/relatorios.test.ts`

| # | Caso de Teste | Endpoint | Resultado Esperado |
|---|---------------|----------|--------------------|
| 1 | Exporta o CSV com nome em claro mas CPF/telefone mascarados, e audita a exportação | `GET /api/admin/relatorios/pacientes` | 200 CSV anonimizado + `LogAuditoria` (`EXPORTAR_RELATORIO_PACIENTES`) |
| 2 | Nega acesso ao relatório para usuários que não são clínica | `GET /api/admin/relatorios/pacientes` | 403 Forbidden |

---

### 3.20 `users_lgpd.test.ts`
**Localização**: `src/__tests__/users_lgpd.test.ts`

| # | Caso de Teste | Endpoint | Resultado Esperado |
|---|---------------|----------|--------------------|
| 1 | Exporta os dados pessoais e audita a exportação | `GET /api/users/me/dados` | 200 `{ dadosPessoais, resumoAtividade }`, sem senha |
| 2 | Rejeita exportação sem autenticação | `GET /api/users/me/dados` | 401 Unauthorized |
| 3 | Anonimiza a conta, impede login futuro e audita a operação | `DELETE /api/users/me` | 200, dados mascarados, login seguinte 401 |
| 4 | Rejeita exclusão sem autenticação | `DELETE /api/users/me` | 401 Unauthorized |

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
| 15 | `signupSchema` | Rejeita cadastro sem aceitar a Política de Privacidade (LGPD) | `success: false` |
| 16 | `signupSchema` | Rejeita cadastro quando o campo `consentimentoLgpd` está ausente | `success: false` |
| 17 | `signupSchemaValidated` | Rejeita médico sem especialidade e CRM | `success: false` |
| 18 | `signupSchemaValidated` | Rejeita médico com especialidade mas sem CRM | `success: false` |
| 19 | `signupSchemaValidated` | Aceita médico com especialidade e CRM | `success: true` |
| 20 | `signupSchemaValidated` | Aceita paciente sem especialidade e CRM | `success: true` |
| 21 | `signupSchemaValidated` | Rejeita especialidade digitada fora do catálogo oficial | `success: false` |
| 22 | `signupSchemaValidated` | Aceita clínica com CNPJ e sem CPF | `success: true` |
| 23 | `signupSchemaValidated` | Rejeita clínica sem CNPJ | `success: false` |

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
| `auth_signup_signin.test.ts` | 8 | Integração | ✅ Passando |
| `auth_notifications.test.ts` | 2 | Integração | ✅ Passando |
| `contatos.test.ts` | 3 | Integração | ✅ Passando |
| `medicos_agendamentos.test.ts` | 2 | Integração | ✅ Passando |
| `agendamentos_criar.test.ts` | 7 | Integração | ✅ Passando |
| `avaliacoes.test.ts` | 8 | Integração | ✅ Passando |
| `pagamentos.test.ts` | 10 | Integração | ✅ Passando |
| `admin.test.ts` | 1 | Integração | ✅ Passando |
| `professional.test.ts` | 8 | Integração | ✅ Passando |
| `professionals.test.ts` | 3 | Integração | ✅ Passando |
| `clinicas.test.ts` | 17 | Integração | ✅ Passando |
| `artigos.test.ts` | 17 | Integração | ✅ Passando |
| `conversas.test.ts` | 5 | Integração | ✅ Passando |
| `destaques.test.ts` | 9 | Integração | ✅ Passando |
| `conta-bancaria.test.ts` | 3 | Integração | ✅ Passando |
| `users.test.ts` | 4 | Integração | ✅ Passando |
| `auditoria.test.ts` | 2 | Integração | ✅ Passando |
| `relatorios.test.ts` | 2 | Integração | ✅ Passando |
| `users_lgpd.test.ts` | 4 | Integração | ✅ Passando |
| **Subtotal** | **116** | | **✅ 116/116** |

#### Testes Unitários

| Suíte | Casos | Tipo | Status |
|-------|-------|------|--------|
| `unit/jwt.unit.test.ts` | 8 | Unitário | ✅ Passando |
| `unit/hash.unit.test.ts` | 8 | Unitário | ✅ Passando |
| `unit/auth.schema.unit.test.ts` | 23 | Unitário | ✅ Passando |
| **Subtotal** | **39** | | **✅ 39/39** |

#### Total Geral

| Tipo | Casos | Status |
|------|-------|--------|
| Integração (API) | 116 | ✅ |
| Unitários | 39 | ✅ |
| E2E automatizado | 0 | ⚠️ Planejado |
| **Total** | **155** | **✅ 155/155** (executado em 30/10/2026, `Duration 7.75s`) |

### Endpoints Cobertos

| Endpoint | Método | Coberto |
|----------|--------|---------|
| `/api/health` | GET | ✅ |
| `/api/usuarios` | POST | ✅ |
| `/api/sessions` | POST | ✅ |
| `/api/auth/change-password` | POST | ✅ |
| `/api/users/me` | PUT | ✅ |
| `/api/users/me/avatar` | PUT | ✅ |
| `/api/users/me/notifications` | POST | ✅ |
| `/api/usuarios/me/conta-bancaria` | PUT | ✅ |
| `/api/contatos` | POST + GET | ✅ |
| `/api/contatos/:id` | PATCH | ✅ |
| `/api/conversas` | POST | ✅ |
| `/api/conversas/:id/mensagens` | POST + GET | ✅ |
| `/api/medicos` | GET | ✅ |
| `/api/agendamentos` | GET + POST | ✅ |
| `/api/agendamentos/sugestoes-horario` | GET | ✅ |
| `/api/avaliacoes` | POST | ✅ |
| `/api/avaliacoes/medico/:id/media` | GET | ✅ |
| `/api/pagamentos` | GET + POST | ✅ |
| `/api/cupons/validar` | POST | ✅ |
| `/api/admin/summary` | GET | ✅ |
| `/api/admin/destaques` | GET + PUT | ✅ |
| `/api/artigos` | GET + POST + PUT | ✅ |
| `/api/artigos/admin` | GET | ✅ |
| `/api/clinicas` | GET | ✅ |
| `/api/clinicas/recomendadas` | GET | ✅ |
| `/api/clinicas/.../solicitar`, `.../aceitar`, `.../buscar-medico` | POST + GET | ✅ |
| `/api/professionals/me/summary` | GET | ✅ |
| `/api/professionals/me/endereco` | PUT | ✅ |
| `/api/professionals/me/preco` | GET + PUT | ✅ |
| `/api/professionals/me/disponibilidade` | GET + PUT | ✅ |
| `/api/avaliacoes/minhas` | GET | ✅ |
| `/api/users/me/consentimento-lgpd` | POST | ✅ |
| `/api/users/me/dados` | GET | ✅ |
| `/api/users/me` | DELETE | ✅ |
| `/api/admin/relatorios/pacientes` | GET | ✅ |
| `/api/admin/logs-auditoria` | GET | ⚠️ Sem teste dedicado (coberto indiretamente — ver `auditoria.test.ts`) |

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
**Última atualização**: 30 de Outubro de 2026 (139 → 155 casos, 20 → 23 arquivos — testes de LGPD/auditoria: consentimento, reconsentimento, auditoria de operações críticas, relatório anonimizado, direitos do titular e retenção do log)  
**Autor**: Equipe de Desenvolvimento UaiMED  
**Referência**: [`vitest.config.ts`](../vitest.config.ts) · [`src/__tests__/`](../src/__tests__/) · [`DOCUMENTACAO_PROJETO_UAIMED.md`](../../DOCUMENTACAO_PROJETO_UAIMED.md)

