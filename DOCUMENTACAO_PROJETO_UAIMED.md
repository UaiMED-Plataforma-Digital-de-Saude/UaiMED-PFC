# 📘 Documentação Completa do Projeto UaiMED

**Versão**: 1.21.0  
**Data**: 04 de Novembro de 2026  
**Classificação**: Documentação Técnica de Engenharia de Software  
**Status**: Projeto em Desenvolvimento Avançado — Seção de Avaliação do Projeto (percurso, decisões técnicas, desafios, resultados e perspectivas) revisada com base no histórico real do Git (135 commits, 63 PRs, Fev–Out/2026)

---

## 📑 Índice Executivo

1. [Apresentação do Projeto](#1-apresentação-do-projeto)
2. [Apresentação de Requisitos](#2-apresentação-de-requisitos)
3. [Levantamento de Requisitos](#3-levantamento-de-requisitos)
4. [Histórias de Usuários](#4-histórias-de-usuários)
5. [Critérios de Aceitação](#5-critérios-de-aceitação)
6. [Arquitetura e Pipeline](#6-arquitetura-e-pipeline)
7. [Dashboards e Analytics](#7-dashboards-e-analytics)
8. [Relatório Técnico](#8-relatório-técnico)
9. [Plano de Evolução](#9-plano-de-evolução)
10. [Engenharia de Dados](#10-engenharia-de-dados)
11. [Aspectos Analíticos](#11-aspectos-analíticos)
12. [Aspectos Comunicacionais](#12-aspectos-comunicacionais)
13. [Avaliação do Projeto e Conclusão](#13-avaliação-do-projeto-e-conclusão)
14. [Changelog](#14-changelog)

---

## 1. Apresentação do Projeto

### 1.1 Visão Geral

**UaiMED** é uma plataforma digital de saúde desenvolvida para conectar pacientes, profissionais de saúde e clínicas, facilitando o agendamento de consultas médicas, gerenciamento de pagamentos e comunicação entre os atores do ecossistema de saúde.

### 1.2 Missão

Democratizar o acesso à saúde através de tecnologia, tornando o agendamento de consultas médicas mais simples, rápido e acessível.

### 1.3 Objetivos Estratégicos

1. **Simplificar** o processo de agendamento de consultas
2. **Centralizar** informações de profissionais de saúde
3. **Facilitar** o gerenciamento financeiro
4. **Proporcionar** ferramentas analíticas para tomada de decisão
5. **Garantir** segurança e privacidade dos dados

### 1.4 Público-Alvo

- **Pacientes**: Pessoas que precisam agendar consultas médicas
- **Profissionais de Saúde**: Médicos que desejam gerenciar sua agenda
- **Clínicas**: Estabelecimentos que precisam monitorar operações

---

## 2. Apresentação de Requisitos

### 2.1 Contexto do Negócio

O setor de saúde brasileiro enfrenta desafios de acesso e organização. O UaiMED surge para:
- Reduzir tempo de espera para agendamentos
- Aumentar visibilidade de profissionais
- Melhorar experiência do paciente
- Otimizar gestão de clínicas

### 2.2 Problemas Identificados

1. **Dificuldade de Agendamento**: Processo burocrático e demorado
2. **Falta de Visibilidade**: Profissionais com baixa exposição
3. **Gestão Ineficiente**: Clínicas sem ferramentas de análise
4. **Comunicação Fragmentada**: Falta de canal direto paciente-profissional

### 2.3 Solução Proposta

Plataforma mobile-first que:
- Conecta pacientes e profissionais
- Facilita agendamento online
- Centraliza pagamentos
- Fornece analytics para decisões

### 2.4 Escopo do Projeto

#### Incluído (Fase 1):
- ✅ Autenticação e autorização
- ✅ Cadastro de usuários (paciente, médico, clínica)
- ✅ Sistema de agendamento com calendário
- ✅ Sistema de pagamentos (PIX, cartão, boleto)
- ✅ Sistema de avaliações
- ✅ Dashboards analíticos
- ✅ Comunicação básica
- ✅ Recuperação de senha (UI + fluxo de e-mail)
- ✅ Tela de Ajuda/Suporte

#### Excluído (Fase 1):
- ❌ Telemedicina/videoconferência
- ❌ Prontuário eletrônico completo
- ❌ Integração com sistemas hospitalares
- ❌ Notificações push avançadas (bloqueadas pelo Expo Go SDK 53+)

---

## 3. Levantamento de Requisitos

### 3.1 Requisitos Funcionais

#### RF01 - Autenticação e Autorização
| ID | Requisito | Prioridade | Status |
|----|-----------|------------|--------|
| RF01.1 | Cadastro de usuários | Alta | ✅ Implementado |
| RF01.2 | Validação CPF/Email único | Alta | ✅ Implementado |
| RF01.3 | Autenticação JWT | Alta | ✅ Implementado |
| RF01.4 | Diferenciação de permissões | Alta | ✅ Implementado |
| RF01.5 | Recuperação de senha (UI) | Média | ✅ Implementado |
| RF01.6 | Seleção de tipo de usuário no cadastro | Média | ✅ Implementado |

#### RF02 - Gerenciamento de Perfis
| ID | Requisito | Prioridade | Status |
|----|-----------|------------|--------|
| RF02.1 | Cadastro de pacientes | Alta | ✅ Implementado |
| RF02.2 | Cadastro de médicos (CRM) | Alta | ✅ Implementado |
| RF02.3 | Gerenciamento de clínicas | Alta | ✅ Implementado |
| RF02.4 | Atualização de perfis | Média | ✅ Implementado |

#### RF03 - Agendamento de Consultas
| ID | Requisito | Prioridade | Status |
|----|-----------|------------|--------|
| RF03.1 | Busca de profissionais | Alta | ✅ Implementado |
| RF03.2 | Exibição de disponibilidade | Alta | ✅ Implementado |
| RF03.3 | Criação de agendamento | Alta | ✅ Implementado |
| RF03.4 | Cancelamento/reagendamento pelo paciente | Alta | ✅ Implementado (`PATCH /agendamentos/:id/cancelar` e `/remarcar`, v1.13.0 do Kanban) |
| RF03.5 | Visualização de agenda | Alta | ✅ Implementado |
| RF03.6 | Fluxo completo Busca→Confirmação→Pagamento→Avaliação | Alta | ✅ Implementado (v1.3.0) |

#### RF04 - Sistema de Pagamentos
| ID | Requisito | Prioridade | Status |
|----|-----------|------------|--------|
| RF04.1 | Pagamento via PIX | Alta | ✅ Implementado |
| RF04.2 | Pagamento via cartão | Alta | ✅ Implementado |
| RF04.3 | Pagamento via Boleto Bancário | Alta | ✅ Implementado |
| RF04.4 | Aplicação de cupons | Alta | ✅ Implementado |
| RF04.5 | Cobertura de plano de saúde | Alta | ✅ Implementado |
| RF04.6 | Meus Pagamentos (lista dedicada) | Alta | ✅ Implementado |
| RF04.7 | Status de pagamento visível no agendamento | Alta | ✅ Implementado (badge + "Pagar agora" em `MinhasConsultasScreen`, v1.14.0 do Kanban) |

#### RF05 - Sistema de Avaliações
| ID | Requisito | Prioridade | Status |
|----|-----------|------------|--------|
| RF05.1 | Avaliar profissionais | Alta | ✅ Implementado |
| RF05.2 | Cálculo de média | Alta | ✅ Implementado |
| RF05.3 | Histórico de avaliações | Média | ⚠️ Parcial (dados simulados) |
| RF05.4 | Comentários | Média | ✅ Implementado |
| RF05.5 | Avaliação pós-consulta via agenda | Alta | ⚠️ Pendente (KANBAN) |

#### RF06 - Comunicação
| ID | Requisito | Prioridade | Status |
|----|-----------|------------|--------|
| RF06.1 | Enviar mensagens (contatos) | Média | ✅ Implementado |
| RF06.2 | Visualizar mensagens | Média | ✅ Implementado |
| RF06.3 | Status de leitura | Baixa | ✅ Implementado |
| RF06.4 | Chat/Conversas (iniciar, retomar, histórico) | Média | ✅ Implementado |

#### RF07 - Dashboards e Analytics
| ID | Requisito | Prioridade | Status |
|----|-----------|------------|--------|
| RF07.1 | Dashboard de clínica | Alta | ✅ Implementado |
| RF07.2 | Dashboard de médico | Alta | ✅ Implementado |
| RF07.3 | Relatórios por período | Média | ⚠️ Parcial |
| RF07.4 | Gráficos e visualizações | Média | ⚠️ Parcial |
| RF07.5 | Central de contatos do médico (dashboard) | Média | ✅ Implementado |
| RF07.6 | Gestão de preço e disponibilidade (médico) | Alta | ✅ Implementado |

#### RF10 - Clínicas (Operação Avançada)
| ID | Requisito | Prioridade | Status |
|----|-----------|------------|--------|
| RF10.1 | Listagem e recomendação de clínicas | Média | ✅ Implementado |
| RF10.2 | Perfil de clínica (`/clinicas/me`) | Alta | ✅ Implementado |
| RF10.3 | Vínculo/desvínculo de médico com clínica | Alta | ✅ Implementado |
| RF10.4 | Solicitações de vínculo | Média | ✅ Implementado |

#### RF11 - Artigos de Saúde
| ID | Requisito | Prioridade | Status |
|----|-----------|------------|--------|
| RF11.1 | Listagem e leitura pública de artigos | Média | ✅ Implementado |
| RF11.2 | Cadastro/edição de artigos (admin) | Média | ✅ Implementado |

#### RF12 - Geolocalização
| ID | Requisito | Prioridade | Status |
|----|-----------|------------|--------|
| RF12.1 | Endereço do profissional geocodificado | Alta | ✅ Implementado |
| RF12.2 | Busca de profissionais por proximidade | Alta | ✅ Implementado |

#### RF13 - Administração
| ID | Requisito | Prioridade | Status |
|----|-----------|------------|--------|
| RF13.1 | Gestão de destaques da Home | Média | ✅ Implementado |
| RF13.2 | Painel administrativo (perfil, artigos, destaques, cupons) | Alta | ✅ Implementado |

#### RF08 - Notificações e Confirmações
| ID | Requisito | Prioridade | Status |
|----|-----------|------------|--------|
| RF08.1 | Notificação local pós-agendamento | Alta | ⚠️ Parcial (infra pronta, push remoto bloqueado Expo Go) |
| RF08.2 | E-mail de confirmação de horário | Alta | ⚠️ Pendente (KANBAN) |
| RF08.3 | E-mail de comprovante de pagamento | Alta | ⚠️ Pendente (KANBAN) |
| RF08.4 | Lembrete 1h antes da consulta | Média | ⚠️ Pendente |

#### RF09 - Suporte e Ajuda
| ID | Requisito | Prioridade | Status |
|----|-----------|------------|--------|
| RF09.1 | Tela de Ajuda (FAQ e suporte) | Baixa | ✅ Implementado |
| RF09.2 | Recuperação de senha por e-mail | Média | ✅ Implementado (UI) |
| RF09.3 | Tela de confirmação de e-mail enviado | Média | ✅ Implementado |

### 3.2 Requisitos Não Funcionais

#### RNF01 - Performance
- **RNF01.1**: API responde em < 500ms (p95) ✅
- **RNF01.2**: App carrega em < 3s ✅
- **RNF01.3**: Suporta 1000 usuários concorrentes ⚠️

#### RNF02 - Segurança
- **RNF02.1**: Senhas criptografadas (bcrypt) ✅
- **RNF02.2**: JWT com expiração (7 dias) ✅
- **RNF02.3**: Proteção LGPD ✅ (consentimento + reconsentimento de contas antigas, auditoria de acesso a dados de pacientes e de 9 operações críticas de escrita, relatório de pacientes anonimizado, exportação/exclusão dos próprios dados, retenção do log de auditoria)
- **RNF02.4**: Validação de entrada (Zod) ✅ (cobertura ampla via `validateBody` em praticamente todas as rotas de escrita)
- **RNF02.5**: Refresh automático de token ✅ (`POST /api/sessions/refresh` implementado e funcional desde Set/2026)
- **RNF02.6**: Rate limiting contra brute-force em login/cadastro ✅ (`express-rate-limit`, 10 tentativas/IP/min)

#### RNF03 - Disponibilidade
- **RNF03.1**: Uptime 99.5% ⚠️
- **RNF03.2**: Backup diário ⚠️
- **RNF03.3**: Resiliente a falhas ⚠️

#### RNF04 - Usabilidade
- **RNF04.1**: Interface intuitiva ✅
- **RNF04.2**: Funciona offline (básico) ⚠️
- **RNF04.3**: Múltiplos idiomas ❌

#### RNF05 - Manutenibilidade
- **RNF05.1**: Padrões TypeScript ✅
- **RNF05.2**: Cobertura de testes ≥ 303 casos automatizados (35 arquivos); cobertura de código medida em 03/11/2026 — 87.55% statements excluindo infraestrutura não testável, antes dos 9 casos de `cupons.test.ts` adicionados em 04/11 (percentual não remedido após, ver `uaimed-back/documents/TESTES.md`) ✅
- **RNF05.3**: Documentação completa ✅

---

## 4. Histórias de Usuários

### 4.1 Épico: Autenticação

#### US01 - Cadastro de Paciente
**Como** um paciente  
**Eu quero** me cadastrar na plataforma  
**Para que** eu possa agendar consultas médicas

**Prioridade**: Alta  
**Estimativa**: 3 pontos  
**Status**: ✅ Concluído

**Critérios de Aceitação:**
- [x] Devo informar nome, CPF, email, telefone e senha
- [x] CPF e email devem ser únicos
- [x] Devo receber confirmação de cadastro
- [x] Devo poder fazer login após cadastro

#### US02 - Cadastro de Médico
**Como** um médico  
**Eu quero** me cadastrar como profissional  
**Para que** eu possa receber agendamentos

**Prioridade**: Alta  
**Estimativa**: 5 pontos  
**Status**: ✅ Concluído

**Critérios de Aceitação:**
- [x] Devo informar dados pessoais + CRM, especialidade e localização
- [x] CRM deve ser único e validado
- [x] Devo poder atualizar minha disponibilidade
- [x] Devo visualizar minha agenda

#### US03 - Login
**Como** um usuário  
**Eu quero** fazer login na plataforma  
**Para que** eu possa acessar minhas funcionalidades

**Prioridade**: Alta  
**Estimativa**: 2 pontos  
**Status**: ✅ Concluído

### 4.2 Épico: Agendamento

#### US04 - Buscar Profissionais
**Como** um paciente  
**Eu quero** buscar profissionais por especialidade  
**Para que** eu encontre o médico adequado

**Prioridade**: Alta  
**Estimativa**: 5 pontos  
**Status**: ✅ Concluído

#### US05 - Agendar Consulta
**Como** um paciente  
**Eu quero** agendar uma consulta  
**Para que** eu possa ser atendido

**Prioridade**: Alta  
**Estimativa**: 8 pontos  
**Status**: ✅ Concluído

#### US06 - Visualizar Agenda
**Como** um médico  
**Eu quero** visualizar minha agenda  
**Para que** eu saiba quais pacientes tenho

**Prioridade**: Alta  
**Estimativa**: 3 pontos  
**Status**: ✅ Concluído

### 4.3 Épico: Pagamentos

#### US07 - Processar Pagamento
**Como** um paciente  
**Eu quero** pagar pela consulta  
**Para que** eu confirme meu agendamento

**Prioridade**: Alta  
**Estimativa**: 8 pontos  
**Status**: ✅ Concluído

#### US08 - Usar Plano de Saúde
**Como** um paciente  
**Eu quero** usar meu plano de saúde  
**Para que** eu pague menos pela consulta

**Prioridade**: Média  
**Estimativa**: 5 pontos  
**Status**: ✅ Concluído

### 4.4 Épico: Avaliações

#### US09 - Avaliar Profissional
**Como** um paciente  
**Eu quero** avaliar um profissional após consulta  
**Para que** outros pacientes conheçam a qualidade

**Prioridade**: Média  
**Estimativa**: 3 pontos  
**Status**: ✅ Concluído

### 4.5 Épico: Dashboards

#### US10 - Dashboard de Clínica
**Como** um administrador de clínica  
**Eu quero** visualizar métricas da clínica  
**Para que** eu possa tomar decisões estratégicas

**Prioridade**: Alta  
**Estimativa**: 8 pontos  
**Status**: ✅ Concluído

#### US11 - Dashboard de Médico
**Como** um médico  
**Eu quero** visualizar minhas métricas  
**Para que** eu possa acompanhar minha performance

**Prioridade**: Alta  
**Estimativa**: 5 pontos  
**Status**: ✅ Concluído

### 4.6 Épico: Suporte

#### US12 - Recuperação de Senha
**Como** um usuário que esqueceu sua senha  
**Eu quero** recuperá-la por e-mail  
**Para que** eu possa voltar a acessar a plataforma

**Prioridade**: Média  
**Estimativa**: 3 pontos  
**Status**: ✅ Concluído (UI completa)

**Critérios de Aceitação:**
- [x] Devo informar meu e-mail cadastrado
- [x] Devo receber feedback visual de "e-mail enviado"
- [x] A tela deve permitir retornar ao login

#### US13 - Central de Ajuda
**Como** um usuário com dúvidas  
**Eu quero** acessar uma central de ajuda  
**Para que** eu resolva problemas sem precisar de suporte humano

**Prioridade**: Baixa  
**Estimativa**: 2 pontos  
**Status**: ✅ Concluído

---

## 5. Critérios de Aceitação

### 5.1 Autenticação

#### CA01.1 - Cadastro de Usuário
- ✅ Sistema valida CPF único
- ✅ Sistema valida email único
- ✅ Senha tem mínimo de 6 caracteres
- ✅ Senha é criptografada (bcrypt)
- ✅ Retorna token JWT após cadastro
- ✅ Retorna dados do usuário (sem senha)
- ✅ Retorna HTTP 409 para e-mail duplicado

#### CA01.2 - Login
- ✅ Valida email e senha
- ✅ Retorna erro 401 para credenciais inválidas
- ✅ Retorna token JWT válido
- ✅ Token expira em 7 dias
- ✅ Retorna dados do usuário

### 5.2 Agendamento

#### CA02.1 - Buscar Profissionais
- ✅ Retorna lista de profissionais
- ✅ Filtra por especialidade (opcional)
- ✅ Inclui avaliação média
- ✅ Ordena por relevância/avaliação

#### CA02.2 - Criar Agendamento
- ✅ Valida data/hora disponível
- ✅ Impede agendamento em horário ocupado
- ✅ Cria registro no banco
- ✅ Retorna agendamento criado
- ✅ Status inicial: "agendado"

### 5.3 Pagamento

#### CA03.1 - Processar Pagamento
- ✅ Calcula valor com desconto de cupom
- ✅ Calcula valor com cobertura de plano
- ✅ Valida cupom (ativo, não expirado)
- ✅ Cria registro de pagamento
- ✅ Atualiza status do agendamento
- ✅ Retorna comprovante

### 5.4 Dashboard

#### CA04.1 - Dashboard Clínica
- ✅ Retorna métricas agregadas
- ✅ Inclui contagens (usuários, agendamentos)
- ✅ Inclui top 10 profissionais
- ✅ Inclui agendamentos por dia (últimos 7 dias)
- ✅ Responde em menos de 2 segundos

---

## 6. Arquitetura e Pipeline

### 6.1 Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│              CAMADA DE APRESENTAÇÃO                        │
│  React Native (Expo) - Mobile App                          │
│  - Screens, Navigation, Context API                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP/REST (Axios)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              CAMADA DE APLICAÇÃO                            │
│  Express.js + TypeScript - REST API                         │
│  - Routes, Controllers, Services, Middleware                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Prisma ORM
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              CAMADA DE DADOS                                │
│  PostgreSQL 17 (Docker)                                     │
│  - Dados transacionais normalizados                         │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Stack Tecnológica

#### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18
- **Linguagem**: TypeScript 5.3
- **ORM**: Prisma 5.7
- **Banco**: PostgreSQL 17
- **Autenticação**: JWT (jsonwebtoken 9.0)
- **Validação**: Zod 3.22
- **Testes**: Vitest 1.4 + Supertest 6.3
- **Containerização**: Docker + Docker Compose

#### Frontend
- **Framework**: React Native 0.81
- **Plataforma**: Expo 54
- **Linguagem**: TypeScript 5.9
- **Navegação**: React Navigation 7
- **HTTP**: Axios 1.13
- **Storage**: AsyncStorage 2.2

### 6.3 Telas do Aplicativo

#### Auth Stack
| Tela | Arquivo | Descrição |
|------|---------|-----------|
| Login | `LoginScreen.tsx` | Login com e-mail e senha, logo do projeto |
| Cadastro | `CadastroScreen.tsx` | Formulário de cadastro de usuário |
| Tipo de Usuário | `TipoSelecaoScreen.tsx` | Seleção de tipo (paciente/médico/clínica) |
| Recuperar Senha | `RecuperarSenhaScreen.tsx` | Solicitar link de recuperação por e-mail |
| E-mail Enviado | `EmailEnviadoScreen.tsx` | Confirmação visual pós-envio de recuperação |

#### Main Stack / Tabs
| Tela | Arquivo | Descrição |
|------|---------|-----------|
| Home | `HomeScreen.tsx` | Dashboard com carrossel de profissionais e filtro de localização |
| Agendamento/Busca | `AgendamentosScreen.tsx` | Busca de profissionais por especialidade |
| Perfil | `PerfilScreen.tsx` | Dados do usuário, registros, pagamentos e consultas |
| Agenda do Médico | `MedicoAgendaScreen.tsx` | Dashboard KPIs para médicos |
| Ajuda | `HelpScreen.tsx` | Central de ajuda, FAQ e contato de suporte |

#### Agendamento Stack
| Tela | Arquivo | Descrição |
|------|---------|-----------|
| Seleção de Horário | `SelecaoHorarioScreen.tsx` | Calendário + lista de horários disponíveis |
| Confirmação | `ConfirmacaoScreen.tsx` | Resumo do agendamento antes do pagamento |
| Pagamento | `PagamentoScreen.tsx` | PIX, cartão, boleto, cupom e plano de saúde |
| Avaliação | `AvaliacaoScreen.tsx` | Avaliação do profissional pós-consulta |
| Minhas Consultas | `MinhasConsultasScreen.tsx` | Lista de agendamentos do paciente |
| Meus Pagamentos | `MeusPagamentosScreen.tsx` | Histórico de pagamentos |

### 6.4 Pipeline de Desenvolvimento

```
┌─────────────┐
│  Git Flow   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│  DESENVOLVIMENTO LOCAL                          │
│  1. Feature Development                         │
│  2. Unit Tests (Vitest)                         │
│  3. Integration Tests                            │
│  4. Commit & Push                                │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  CI/CD (GitHub Actions)                         │
│  1. Lint & Type Check                            │
│  2. Build                                        │
│  3. Automated Tests                              │
│  4. Deploy (Futuro)                              │
└─────────────────────────────────────────────────┘
```

### 6.5 Estrutura de Dados

#### Modelo Relacional

```
Usuario (1) ──── (1) Profissional
   │                    │
   │ (N)                │ (N)
   │                    │
   ▼                    ▼
Agendamento (1) ──── (1) Pagamento
   │
   │ (N)
   ▼
Avaliacao

Contato (N) ──── (1) Usuario
Contato (N) ──── (1) Profissional
```

#### Entidades Principais

1. **Usuario**: Pacientes, médicos e clínicas
2. **Profissional**: Dados específicos de médicos
3. **Agendamento**: Consultas agendadas
4. **Pagamento**: Transações financeiras
5. **Avaliacao**: Feedback de pacientes
6. **Contato**: Mensagens entre usuários
7. **Cupom**: Descontos e promoções

---

## 7. Dashboards e Analytics

### 7.1 Dashboard de Clínica

#### Endpoint
```
GET /api/admin/summary
Authorization: Bearer {token}
Role: clinica
```

#### Métricas Disponíveis

**KPIs:**
- Total de usuários
- Total de pacientes
- Total de médicos
- Agendamentos hoje

**Agregações:**
- Agendamentos por status
- Top 10 profissionais
- Agendamentos por dia (últimos 7 dias)

#### Estrutura de Dados
```json
{
  "totalUsuarios": 1024,
  "totalPacientes": 850,
  "totalMedicos": 174,
  "totalAgendamentosHoje": 45,
  "agendamentosPorStatus": [
    { "status": "agendado", "_count": { "_all": 120 } }
  ],
  "topProfissionais": [
    {
      "id": "uuid",
      "nome": "Dr. Carlos Silva",
      "especialidade": "Cardiologia",
      "total": 45
    }
  ],
  "appointmentsByDay": [
    { "day": "2026-04-17", "count": 12 }
  ]
}
```

### 7.2 Dashboard de Médico

#### Endpoint
```
GET /api/professionals/me/summary
Authorization: Bearer {token}
Role: medico
```

#### Estrutura de Dados
```json
{
  "totalToday": 8,
  "nextAppointments": [
    {
      "id": "uuid",
      "dataHora": "2026-04-18T14:00:00Z",
      "pacienteNome": "João Silva",
      "status": "confirmado"
    }
  ],
  "ratingAvg": 4.6,
  "revenueThisMonth": 12500.00,
  "pendingContacts": 3
}
```

**Endpoints complementares (adicionados a partir de Set/Out 2026):**
| Endpoint | Descrição |
|---|---|
| `GET /professionals/me/agendamentos` | Agenda detalhada do médico |
| `GET /professionals/me/avaliacoes` | Avaliações recebidas |
| `GET/PUT /professionals/me/preco` | Preço da consulta |
| `GET/PUT /professionals/me/disponibilidade` | Horários de disponibilidade |
| `PUT /professionals/me/endereco` | Endereço (re-geocodificado automaticamente) |

Essas rotas sustentam as telas `MedicoDashboardScreen`, `MedicoContatosScreen` e `MedicoDisponibilidadeScreen`, entregues em Set–Out/2026.

### 7.3 Painel de Administração

**Endpoint**
```
GET/PUT /api/admin/destaques
GET /api/admin/summary   (Role: clinica)
```

Telas: `AdminHomeScreen`, `AdminArtigosScreen`, `AdminDestaquesScreen`, `AdminCuponsScreen`, `AdminPerfilScreen`. Permite gerenciar destaques da Home, artigos de saúde publicados e cupons de desconto (acesso restrito por papel/e-mail de administrador).

### 7.4 Pipeline de Analytics

```
┌─────────────────────────────────────────────────┐
│  COLETA DE DADOS                                │
│  - Eventos de agendamento                       │
│  - Transações de pagamento                      │
│  - Interações de usuário                        │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  PROCESSAMENTO                                  │
│  - Agregações em tempo real (Prisma)            │
│  - Cálculo de métricas                          │
│  - Agrupamentos por período                     │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  ARMAZENAMENTO                                  │
│  - PostgreSQL (dados transacionais)             │
│  - Cache (futuro: Redis)                        │
└─────────────────────────────────────────────────┘
```

---

## 8. Relatório Técnico

### 8.1 Status Atual do Projeto

#### ✅ Implementado

**Backend:**
- ✅ Arquitetura REST API completa (14 módulos de rotas: auth, usuários, médicos, profissionais, clínicas, agendamentos, pagamentos, avaliações, contatos, conversas, especialidades, artigos, admin, conta-bancária)
- ✅ Autenticação JWT funcional + **refresh token** (`POST /api/sessions/refresh`)
- ✅ CRUD completo de todas as entidades
- ✅ Validação com Zod (cobertura ampla via `validateBody`)
- ✅ Middleware de autenticação e autorização
- ✅ **Rate limiting** contra brute-force em login/cadastro (`express-rate-limit`)
- ✅ Sistema de pagamentos completo (PIX, cartão, boleto)
- ✅ Sistema de avaliações
- ✅ Dashboards (clínica e médico) + painel de administração
- ✅ Clínicas: vínculo/desvínculo de médicos, recomendações, solicitações
- ✅ Artigos de saúde (leitura pública + CRUD administrativo)
- ✅ Geolocalização (geocodificação de endereço, busca por proximidade)
- ✅ Chat/Conversas entre usuários (REST, sem WebSocket/tempo real)
- ✅ **303 casos de teste automatizados** (35 arquivos) cobrindo os endpoints principais
- ✅ Confirmação de agendamento por e-mail (Resend) e lembrete local 1h antes da consulta
- ✅ Comprovante de pagamento por e-mail e tela de sucesso dedicada (`PagamentoSucessoScreen`)
- ✅ Filtro de busca por convênio/plano de saúde aceito, com autogestão pelo médico
- ✅ Logging revisado — Prisma não loga mais SQL com dados de usuário; app não loga payloads fora de ambiente de desenvolvimento
- ✅ Proteção LGPD — consentimento (+ reconsentimento de contas antigas), auditoria de acesso a dados de pacientes e de operações críticas (`GET /admin/logs-auditoria`), relatório de pacientes anonimizado (`GET /admin/relatorios/pacientes`), exportar/excluir meus dados (`GET`/`DELETE /users/me`), retenção do log de auditoria
- ✅ Docker Compose para desenvolvimento
- ✅ CI/CD com GitHub Actions

**Frontend:**
- ✅ Aplicativo React Native funcional
- ✅ Navegação completa por stack e tabs
- ✅ Autenticação integrada (JWT + AsyncStorage)
- ✅ **Fluxo de agendamento completo**: Busca → Calendário → Horário → Confirmação → Pagamento → Avaliação
- ✅ **Recuperação de senha**: `RecuperarSenhaScreen` + `EmailEnviadoScreen`
- ✅ **Tela de Ajuda**: `HelpScreen` disponível no menu
- ✅ **Seleção de tipo de usuário**: `TipoSelecaoScreen` no fluxo de cadastro
- ✅ Telas `MinhasConsultasScreen` e `MeusPagamentosScreen` com dados reais
- ✅ Logo real do projeto na `LoginScreen`
- ✅ Dashboard de clínica e painel do médico com KPIs, central de contatos, preço e disponibilidade (`MedicoDashboardScreen`, `MedicoContatosScreen`, `MedicoDisponibilidadeScreen`)
- ✅ Telas de clínica: `ClinicaHomeScreen`, `ClinicaMedicosScreen`, `ClinicaPerfilScreen`
- ✅ Telas de administração: `AdminHomeScreen`, `AdminArtigosScreen`, `AdminDestaquesScreen`, `AdminCuponsScreen`, `AdminPerfilScreen`
- ✅ Artigos de saúde: `ArtigosListaScreen`, `ArtigoDetalhesScreen`, `ArtigoCadastroScreen` (admin)
- ✅ Chat: `ConversasListaScreen`, `ConversaDetalhesScreen`
- ✅ Geolocalização: `LocationModal` + `expo-location` em `MedicoDetalhesScreen`
- ✅ Sistema de avaliações com nota + comentário
- ✅ Carousel de profissionais em destaque na Home
- ✅ Filtro de localização (estado/município) na Home e na busca
- ✅ **Cancelamento e remarcação de consulta**: `PATCH /agendamentos/:id/cancelar` e `/remarcar`, com regra de 24h de antecedência validada também no backend; remarcar atualiza a consulta existente em vez de duplicá-la (v1.13.0 do Kanban)
- ✅ **Status de pagamento visível na lista de consultas**: `GET /agendamentos` retorna `pagamento`/`valor`/`pixKey`; `MinhasConsultasScreen` exibe badge Pago/Não pago e botão "Pagar agora" (v1.14.0 do Kanban)
- ✅ **Botão "Avaliar" em consultas concluídas**: `Avaliacao` vinculada a um `agendamentoId` específico; `MinhasConsultasScreen` exibe o botão só quando aplicável (v1.15.0 do Kanban)
- ✅ **`ResultadosScreen` com busca real na API**: já consumia `GET /medicos` com filtros reais; adicionada nota média, preço da consulta e `amount` na navegação, mais paginação (`skip`/`take`) e agregação de avaliação no backend (v1.16.0 do Kanban)
- ✅ **`SearchScreen` com filtros funcionais**: já buscava por nome/especialidade/cidade; adicionado filtro de faixa de preço (chips + `precoMin`/`precoMax` em `GET /medicos`) e, posteriormente, filtro de convênio aceito — ver abaixo (v1.17.0 do Kanban)
- ✅ **`HistoricoAvaliacoesScreen` com dados reais**: modelo `Avaliacao` expandido com o detalhamento completo (4 notas por critério, voltaria, recomenda, sugestões) que o formulário de avaliação já coletava mas nunca persistia — corrigido na raiz, não só na tela de histórico. Atalho "Minhas Avaliações" adicionado em `PerfilScreen` (v1.18.0 do Kanban)
- ✅ **Confirmação de horário por e-mail (Resend) e lembrete local 1h antes**: `email.service.ts` novo no backend; `App.tsx` corrigido para solicitar permissão de notificação também no Expo Go (v1.22.0 do Kanban)
- ✅ **Comprovante de pagamento por e-mail e tela de sucesso dedicada**: substitui o modal antigo; expõe separadamente o desconto de cupom e o desconto de plano de saúde, achado real durante a verificação end-to-end (v1.23.0 do Kanban)
- ✅ **Filtro de busca por convênio/plano de saúde aceito**: catálogo fixo de convênios, campo `Profissional.convenios: String[]`, médico autogerencia via `PUT /professionals/me/convenios`, `GET /medicos` aceita `?convenio=` (v1.24.0 do Kanban)
- ✅ **`HomeScreen` com "Próxima consulta" real**: `NextAppointmentCard` existia como componente mas nunca era importado pela tela — conectado a `GET /agendamentos`, exibindo a consulta futura mais próxima do paciente logado (sem seção quando não há nenhuma). Carrossel de profissionais em destaque já consumia dado real (`GET /medicos/recomendados`), confirmado na revisão (v1.25.0 do Kanban)
- ✅ **Limpeza de código morto e saúde de tipos do frontend**: `AgendamentosScreen.tsx` (protótipo nunca conectado a nenhum navigator) e o residual de `useAvaliacoes.ts`/`CardAvaliacao.tsx`/`types/avaliacao.ts` removidos. A remoção do primeiro revelou que seu erro de sintaxe abortava `tsc --noEmit` antes de checar o resto do projeto, escondendo 7 erros de tipo reais em telas de produção — todos corrigidos (`npx tsc --noEmit` limpo pela primeira vez no frontend). Novo job `typecheck-frontend` no CI (`ci.yml`) impede que isso volte a passar despercebido (v1.26.0–v1.28.0 do Kanban)
- ✅ **Painel admin de cupons de desconto**: `AdminCuponsScreen.tsx` novo, com lista (status Ativo/Inativo/Expirado, contagem de usos) e modal de criação; CRUD restrito à conta `admin@uaimed.com` (`GET`/`POST /admin/cupons`, `PUT /admin/cupons/:id`), com desativação em vez de exclusão física para preservar a rastreabilidade de cupons já usados em pagamentos concluídos (v1.31.0 do Kanban)

#### ⚠️ Em Desenvolvimento

- ⚠️ Notificações push remotas (requer development build — bloqueado pelo Expo Go SDK 53+)
- ⚠️ E-mail real de recuperação de senha (backend Nodemailer)
- ⚠️ E-mail de confirmação de agendamento e pagamento
- ⚠️ Relatórios exportáveis de uso geral (já existe um caso específico: relatório de pacientes anonimizado, ver RNF02.3)

#### ❌ Não Implementado (Fase 1)

- ❌ Telemedicina
- ❌ Prontuário eletrônico
- ❌ Integração com sistemas externos
- ❌ Chat em tempo real (WebSocket/push) — hoje o chat funciona via REST, sem atualização instantânea

### 8.2 Métricas de Qualidade

#### Cobertura de Testes
- **Total de casos**: **303 testes automatizados** (35 arquivos) — todos passando ✅
- **Cobertura de código**: medida formalmente pela primeira vez em 03/11/2026 — 87.55% statements / 91.07% funções, excluindo infraestrutura não testável por desenho (seed, scripts, bootstrap) — ver `TESTES.md` seção 7
- **Adições mais recentes**: `convenios.test.ts` (2 casos), `professionals_convenios.test.ts` (9 casos, filtro de convênio), `unit/email.unit.test.ts` ampliado (3→9 casos, comprovante de pagamento)
- **Suítes unitárias**: `auth.schema.unit`, `hash.unit`, `jwt.unit`, `geocoding.unit`, `email.unit` — 108 casos
- **Frontend**: Testes manuais (fluxo completo verificado) + `cadastroValidation.test.cjs`/`avaliacoesPerfil.test.cjs` (Node `--test`); sem suíte automatizada própria para as telas
- **Detalhamento completo, suíte por suíte**: [`uaimed-back/documents/TESTES.md`](./uaimed-back/documents/TESTES.md) (fonte da verdade — mantido atualizado a cada sessão; os números aqui podem ficar defasados entre atualizações)

#### Performance
- **API Response Time**: < 500ms (média)
- **Database Queries**: Otimizadas (N+1 eliminado em `sugerirHorarios`)
- **Mobile App Load**: < 3 segundos

#### Segurança
- ✅ Senhas criptografadas (bcrypt)
- ✅ JWT com expiração + refresh token
- ✅ Rate limiting contra brute-force (login/cadastro)
- ✅ Validação de entrada (Zod) — cobertura ampla
- ✅ CORS configurado
- ✅ Logging sem dados sensíveis (SQL/payload) fora de desenvolvimento
- ✅ LGPD: consentimento + reconsentimento, log de auditoria de acesso a dados de pacientes e de operações críticas, relatório de pacientes anonimizado, direitos do titular (exportar/excluir), retenção do log

### 8.3 Histórico de Correções (v1.0 → v1.6)

| Data | Arquivo | Correção |
|------|---------|----------|
| Abr/2026 | `auth.controller.ts` | Retorna HTTP 409 para e-mail duplicado (antes retornava 400 genérico) |
| Abr/2026 | `auth_signup_signin.test.ts` | Campo de login corrigido para `password` (schema usa `password`, não `senha`) |
| Abr/2026 | `agendamentos_criar.test.ts` | Campo corrigido para `medicoId` (controller usa `medicoId`, não `profissionalId`) |
| Abr/2026 | `useContatos.ts` | Mapeamento `medicoId` → `profissionalId` no payload enviado ao backend |
| Abr/2026 | `AuthContext.tsx` | **Bug crítico:** removida chamada a `setToken()` indefinida (causava crash) |
| Abr/2026 | `avaliacoes.routes.ts` | **Bug crítico:** adicionado `authMiddleware` em `POST /avaliacoes` |
| Abr/2026 | `agendamentos.controller.ts` | **Performance:** eliminado N+1 queries em `sugerirHorarios` |
| Abr/2026 | `auth.service.ts` | **Confiabilidade:** signup de médico usa transação Prisma |
| Abr/2026 | `middleware/validate.ts` | Tipo alterado de `AnyZodObject` para `ZodTypeAny` — suporta `.refine()` |
| Abr/2026 | `vitest.config.ts` | Adicionado `globalSetup` — banco de teste pronto automaticamente |
| Abr/2026 | Todos os testes | Limpeza refatorada para deletar por ID específico (evita conflitos paralelos) |

### 8.4 Dependências Críticas

#### Backend
- `express`: Framework web
- `@prisma/client`: ORM
- `jsonwebtoken`: Autenticação
- `zod`: Validação
- `bcryptjs`: Criptografia
- `express-rate-limit`: Rate limiting contra brute-force
- `vitest` + `supertest`: Testes automatizados

#### Frontend
- `react-native`: Framework mobile
- `expo`: Plataforma
- `axios`: HTTP client
- `@react-navigation/native`: Navegação
- `@react-native-async-storage/async-storage`: Persistência de token

---

## 9. Plano de Evolução

### 9.1 Fase 2 - Analytics Avançado (Q1 2026)

#### 9.1.1 Painel de Categorias

**Objetivo**: Agrupar e analisar dados por categorias de especialidades médicas

**Funcionalidades:**
- Dashboard por especialidade
- Comparativo de performance entre especialidades
- Análise de demanda por categoria
- Previsão de demanda por especialidade

**Métricas:**
- Agendamentos por especialidade
- Receita por especialidade
- Tempo médio de espera por categoria
- Taxa de ocupação por especialidade

**Endpoint Proposto:**
```
GET /api/admin/analytics/categories?from=YYYY-MM-DD&to=YYYY-MM-DD
```

**Estrutura de Resposta:**
```json
{
  "categories": [
    {
      "especialidade": "Cardiologia",
      "totalAgendamentos": 450,
      "receita": 67500.00,
      "mediaAvaliacao": 4.7,
      "taxaOcupacao": 85.5,
      "crescimento": 12.5,
      "profissionaisAtivos": 8
    }
  ]
}
```

#### 9.1.2 Localização por Região

**Objetivo**: Analisar dados geográficos e otimizar cobertura

**Funcionalidades:**
- Mapa de calor de agendamentos por região
- Análise de demanda por cidade/estado
- Identificação de áreas com baixa cobertura
- Sugestões de expansão geográfica

**Métricas:**
- Agendamentos por cidade
- Agendamentos por estado
- Profissionais por região
- Taxa de crescimento por região

**Endpoint Proposto:**
```
GET /api/admin/analytics/location?granularity=city|state
```

**Estrutura de Resposta:**
```json
{
  "byCity": [
    {
      "cidade": "São Paulo",
      "estado": "SP",
      "agendamentos": 1200,
      "profissionais": 45,
      "receita": 180000.00,
      "crescimento": 15.3
    }
  ],
  "byState": [
    { "estado": "SP", "agendamentos": 3500, "receita": 525000.00 }
  ],
  "heatmap": [
    { "lat": -23.5505, "lng": -46.6333, "intensity": 0.85 }
  ]
}
```

### 9.2 Fase 3 - Inteligência de Negócio (Q2 2026)

#### 9.2.1 Previsão de Demanda
- Machine Learning para prever picos
- Recomendações de horários
- Otimização de disponibilidade

#### 9.2.2 Análise de Churn
- Identificação de pacientes inativos
- Campanhas de retenção
- Análise de cancelamentos

#### 9.2.3 Otimização de Preços
- Análise de elasticidade
- Precificação dinâmica
- Análise competitiva

### 9.3 Fase 4 - Integrações (Q3 2026)

#### 9.3.1 Integração com Sistemas de Saúde
- HL7/FHIR para prontuários
- Integração com laboratórios
- Integração com farmácias

#### 9.3.2 Pagamentos Avançados
- Gateways de pagamento (Stripe/PagSeguro)
- Assinaturas recorrentes
- Planos de saúde digitais

### 9.4 Fase 5 - Mobile Avançado (Q4 2026)

#### 9.4.1 Notificações Inteligentes
- Push notifications personalizadas (development build)
- Lembretes de consulta
- Notificações de resultados

#### 9.4.2 Geolocalização
- ✅ Busca por proximidade — **implementada em Ago/2026** (geocodificação de endereço + `expo-location`), antecipada em relação a este roadmap
- Navegação até clínica (pendente)
- Check-in geográfico (pendente)

---

## 10. Engenharia de Dados

### 10.1 Arquitetura de Dados

```
┌─────────────────────────────────────┐
│  CAMADA DE APLICAÇÃO (OLTP)         │
│  - Dados transacionais              │
│  - Normalização completa            │
│  - Integridade referencial          │
└──────────────────┬──────────────────┘
                   │ ETL Process (Futuro)
                   ▼
┌─────────────────────────────────────┐
│  CAMADA DE ANALYTICS (OLAP) — FUTURO│
│  - Dados agregados                  │
│  - Desnormalização                  │
│  - Otimizado para leitura           │
└─────────────────────────────────────┘
```

### 10.2 Pipeline ETL

#### 10.2.1 Extract (Extração)

**Fontes:**
- PostgreSQL (dados transacionais)
- Logs de aplicação
- Métricas de sistema

**Frequência:**
- Tempo real (agendamentos, pagamentos)
- Diária (agregações)
- Semanal (relatórios)

#### 10.2.2 Transform (Transformação)

**Operações:**
- Limpeza de dados
- Validação
- Enriquecimento
- Agregação
- Normalização/Desnormalização

#### 10.2.3 Load (Carga)

**Destinos:**
- Tabelas de analytics (futuro)
- Cache (Redis - futuro)
- Data Warehouse (futuro)

### 10.3 Qualidade de Dados

#### 10.3.1 Validação
- **Schema Validation**: Zod schemas
- **Business Rules**: Validação em services
- **Data Integrity**: Constraints do banco

#### 10.3.2 Limpeza
- **Deduplicação**: Constraints únicos (email, CPF, CRM)
- **Normalização**: Formatação consistente
- **Enriquecimento**: Dados derivados

### 10.4 Governança de Dados

#### 10.4.1 Privacidade (LGPD)
- **Anonimização**: CPF/telefone/e-mail mascarados no relatório de pacientes (`GET /admin/relatorios/pacientes`); `DELETE /users/me` anonimiza a própria conta em vez de excluir fisicamente (preserva histórico de terceiros — agendamentos/pagamentos têm `onDelete: Cascade`)
- **Consentimento**: Aceite obrigatório no cadastro (`consentimentoLgpd`, versão e data gravadas no `Usuario`) + reconsentimento pós-login para contas anteriores ao fluxo (`precisaConsentimentoLgpd` no login, `POST /users/me/consentimento-lgpd`)
- **Auditoria**: Log de acessos de médico/clínica a dados de outros usuários + 9 operações críticas de escrita (agendar, pagar, enviar mensagem, vínculo clínica-médico, trocar senha, dados bancários, consentimento, exportar/excluir dados) — model `LogAuditoria`, consultável em `GET /admin/logs-auditoria`
- **Direitos do titular**: `GET /users/me/dados` exporta os dados pessoais; `DELETE /users/me` anonimiza a conta (arts. 17-22 da LGPD)
- **Retenção**: `AuditoriaService.purgarAntigos()` expurga `LogAuditoria` com mais de 6 meses (`npm run logs:purgar`) — o próprio log de auditoria guarda dado pessoal e não pode ficar retido indefinidamente

Detalhes de implementação: [`uaimed-back/documents/API.md`](./uaimed-back/documents/API.md#lgpd--consentimento-auditoria-e-anonimização).

#### 10.4.2 Backup e Recuperação
- **Backup Diário**: Automatizado
- **Point-in-Time Recovery**: PostgreSQL WAL
- **Disaster Recovery**: Plano documentado

---

## 11. Aspectos Analíticos

### 11.1 Métricas de Negócio

#### 11.1.1 KPIs Principais

**Para Clínicas:**
- Total de usuários ativos
- Taxa de conversão (visitas → agendamentos)
- Receita total e por período
- Taxa de ocupação de profissionais
- Tempo médio de resposta
- Taxa de cancelamento

**Para Médicos:**
- Número de agendamentos
- Receita mensal/anual
- Média de avaliações
- Taxa de ocupação da agenda
- Tempo médio de consulta

**Para Pacientes:**
- Facilidade de agendamento
- Tempo de espera
- Satisfação com atendimento

#### 11.1.2 Métricas Técnicas

- **Uptime**: 99.5%+
- **Response Time**: < 500ms (p95)
- **Error Rate**: < 0.1%
- **Throughput**: 1000 req/s
- **Database Performance**: Query time < 100ms
- **Test Coverage**: 32 casos automatizados

### 11.2 Análise Preditiva (Futuro)

#### 11.2.1 Previsão de Demanda
- Modelos de séries temporais
- Análise sazonal
- Previsão de picos

#### 11.2.2 Recomendação
- Recomendação de profissionais
- Sugestão de horários
- Personalização

### 11.3 Relatórios

#### 11.3.1 Relatórios Operacionais
- Agendamentos do dia/semana/mês
- Receita por período
- Performance de profissionais

#### 11.3.2 Relatórios Estratégicos
- Crescimento de usuários
- Análise de mercado
- ROI de campanhas

---

## 12. Aspectos Comunicacionais

### 12.1 Comunicação Usuário-Sistema

#### 12.1.1 Feedback Visual
- Loading states em todas as telas
- Mensagens de sucesso/erro
- Confirmações de ações
- Modais de confirmação (em vez de Alert nativo)

#### 12.1.2 Notificações
- Confirmação de agendamento
- Lembretes de consulta
- Atualizações de status

### 12.2 Comunicação Entre Usuários

#### 12.2.1 Sistema de Mensagens
- Paciente → Profissional
- Status de leitura
- Histórico de conversas

#### 12.2.2 Avaliações e Feedback
- Sistema de estrelas
- Comentários
- Respostas de profissionais

### 12.3 Comunicação Técnica

#### 12.3.1 Logs e Monitoramento
- Logs estruturados com `logger` customizado
- Error tracking nos controllers
- Performance monitoring

#### 12.3.2 Documentação
- API Documentation: `uaimed-back/documents/API.md`
- Estratégia de Testes: `uaimed-back/documents/TESTES.md`
- Guias técnicos e changelogs

---

## 13. Avaliação do Projeto e Conclusão

### 13.1 Percurso Realizado

**Fase de planejamento (pré-repositório, a partir de Nov/2025):** levantamento de requisitos, definição da arquitetura (Node.js/Express/Prisma/PostgreSQL + React Native/Expo) e elaboração da documentação inicial do TCC, antes da criação do repositório Git.

**Fase 1 — Fundamentação (Fev/2026):** criação do repositório, configuração de CI com GitHub Actions e Postgres de teste. O time começou com o frontend como submódulo Git separado e, já na primeira semana, decidiu migrar para um monorepo simples (commits "Inline uaimed-front as regular directory"), eliminando o overhead de sincronizar submódulos entre os desenvolvedores do time.

**Fase 2 — Núcleo funcional (Mar–Abr/2026):** autenticação, fluxo de agendamento ponta-a-ponta (busca → calendário → confirmação → pagamento → avaliação), pagamento via boleto bancário, tela de perfil, suíte de 32 testes automatizados (Vitest) e automação de vínculo entre Pull Request e Issue (PRs #4 a #18).

**Fase 3 — Expansão de funcionalidades (Mai–Jun/2026):** cadastro e configuração de clínicas, redesign das telas de login e agendamento, fluxo de reagendamento/cancelamento de consultas, edição de perfil com foto, criação de artigos de saúde e chat entre usuários (PRs #20 a #40).

**Fase 4 — Maturidade e segurança (Ago–Set/2026):** geolocalização para busca de profissionais, cadastro completo de clínicas, refresh token com renovação automática, rate limiting contra brute-force nos endpoints de autenticação e validação Zod reforçada em todos os endpoints, após dois bugs de validação identificados em produção (PRs #43 a #61).

**Fase 5 — Dashboards e administração (Out/2026):** central de contatos e painel de preço/disponibilidade do médico, redesign da Home do médico, tela de administração e correção de logging para evitar vazamento de payload sensível (PRs #62 e #63).

Ao todo, o percurso soma **135 commits e 63 pull requests** revisados e mesclados entre fevereiro e outubro de 2026, conduzidos por uma equipe de três integrantes: Gustavo (full stack e infraestrutura), Igor (telas de clínicas, profissionais, artigos e administração) e Karllos Eduardo (levantamento de requisitos e documentação do projeto).

### 13.2 Principais Decisões Técnicas

| Decisão | Motivação |
|---|---|
| Monorepo (em vez de submódulos Git) | Reduzir fricção de sincronização entre os desenvolvedores trabalhando em paralelo no front e no back |
| Prisma + PostgreSQL | Migrations versionadas e tipagem gerada automaticamente, reduzindo erros de schema |
| Validação com Zod em toda a API | Padronizar validação de entrada; reforçada em Set/2026 após bugs em endpoints que só validavam manualmente |
| JWT com refresh token | Evitar reautenticação forçada a cada 7 dias sem abrir mão da expiração do token original |
| Rate limiting nos endpoints de autenticação | Mitigação proativa de brute-force, aplicada seletivamente (`skipSuccessfulRequest`) para não penalizar logins legítimos |
| Expo managed workflow | Velocidade de desenvolvimento mobile multiplataforma — trade-off aceito: push notifications remotas ficam bloqueadas sob Expo Go SDK 53+ |
| Vitest + Supertest para testes de integração | Integração nativa com TypeScript e execução rápida, viabilizando os 32+ casos de teste do backend |

### 13.3 Desafios Enfrentados

- **Integração frontend ↔ backend:** o ponto de maior fricção foi a comunicação entre o app Expo e a API local — divergências de endereço/host entre emulador e dispositivo físico geraram múltiplos incidentes de "Network Error", resolvidos padronizando a configuração de `BASE_URL` por ambiente.
- **Divergência de contratos de dados:** nomes de campos distintos entre front e back (ex.: `medicoId` vs. `profissionalId`, `password` vs. `senha`) causaram falhas silenciosas; corrigidos no alinhamento de contratos da revisão v1.2.0 e reforçados com testes de regressão.
- **Bugs críticos de estabilidade:** uma chamada a um método inexistente no `AuthContext` (`setToken`) travava o app; o endpoint de avaliações ficou temporariamente sem middleware de autenticação. Ambos identificados via revisão de código e testes, antes de afetar usuários reais.
- **Performance:** a consulta de sugestão de horários sofria do problema clássico de N+1 queries, resolvido com uma única consulta otimizada.
- **Validação e segurança reativas:** dois bugs de validação em pagamentos e agendamentos só foram percebidos em setembro/2026, motivando o reforço de Zod em todos os endpoints e a criação de testes específicos para os cenários que haviam falhado.
- **Restrição de plataforma:** o Expo Go (SDK 53+) bloqueia notificações push remotas, forçando a entrega de apenas notificações locais nesta fase e o adiamento do recurso completo para um development build.
- **Colaboração entre múltiplos integrantes em paralelo:** a automação de CI evoluiu em várias iterações (`branch-check`, `auto-link-pr`, `auto-pr`) para reduzir conflitos de integração e manter rastreabilidade entre PR e issue.

### 13.4 Resultados Alcançados

- Backend: API REST completa com autenticação JWT + refresh token, validação Zod em todos os endpoints, rate limiting contra brute-force, **303 testes automatizados (100% passando, ~87% de cobertura de código)** e CI executando a cada push/PR (backend e frontend, desde 03/11).
- Frontend: fluxo ponta-a-ponta de agendamento, telas de clínicas, profissionais, artigos de saúde, chat, geolocalização, recuperação de senha, central de ajuda e, mais recentemente, dashboard do médico (contatos, preço/disponibilidade) e tela de administração.
- **63 pull requests** mesclados ao longo de ~8 meses de desenvolvimento ativo (Fev–Out/2026).
- Postura de segurança evoluiu de forma incremental: de um MVP funcional (Abril) para um backend com rate limiting, refresh token e validação completa (Setembro–Outubro).

### 13.5 Perspectivas Futuras

- Algumas entregas que constavam como roadmap na Seção 9 (ex.: dashboards de médico, administração) já saíram do "futuro" e entraram em "realizado" em Outubro/2026 — recomenda-se uma atualização pontual da Seção 9 na próxima revisão deste documento.
- Notificações push remotas via development build (bloqueadas atualmente pelo Expo Go).
- Analytics avançado por especialidade e localização (detalhado na Seção 9).
- Expansão da tela de administração e dos dashboards de clínica com métricas mais profundas.
- Evolução do logging para um formato estruturado e com níveis, dando continuidade à correção de Outubro/2026 que reduziu a verbosidade e eliminou vazamento de payload sensível.

### 13.6 Status Atual e Métricas de Sucesso

O projeto UaiMED está em **fase de desenvolvimento avançada**, com:
- ✅ Backend completo e funcional
- ✅ Frontend mobile implementado e integrado
- ✅ **303 testes automatizados** cobrindo os endpoints críticos — todos passando, ~87% de cobertura de código
- ✅ **Fluxo de agendamento ponta-a-ponta**: busca → calendário → horário → confirmação → pagamento → avaliação
- ✅ CI/CD com GitHub Actions configurado
- ✅ Banco de dados migrado e populado com dados reais

**Métricas de sucesso definidas para a fase de produto (pós-TCC):**
- **Adoção**: 1000+ usuários ativos
- **Engajamento**: 70%+ taxa de retorno
- **Satisfação**: 4.5+ estrelas
- **Performance**: 99.5%+ uptime

---

**Documento gerado em**: 12 de Novembro de 2025  
**Última atualização**: 13 de Outubro de 2026  
**Versão**: 1.7.0  
**Autor**: Equipe de Desenvolvimento UaiMED  
**Classificação**: Documentação Técnica Profissional  
**Kanban de melhorias**: ver [`KANBAN_MELHORIAS.md`](./KANBAN_MELHORIAS.md)  
**Documento de Testes**: ver [`uaimed-back/documents/TESTES.md`](./uaimed-back/documents/TESTES.md)

---

## 14. Changelog

### v1.16.0 — 03 de Novembro de 2026

#### 🟢 Implementado

**Cobertura de código medida formalmente pela primeira vez, e os pontos fracos reais fechados:**
- Instalado `@vitest/coverage-v8` (nenhum provider de cobertura existia até então). Resultado inicial: 71.4% statements / 82.07% funções em todos os arquivos (84.51%/86.14% excluindo infraestrutura não testável por desenho — seed, scripts, bootstrap do servidor)
- Identificados 3 arquivos com cobertura genuinamente baixa (não ruído de infraestrutura): `especialidades.controller.ts` (endpoint sem nenhum teste), `conta-bancaria.controller.ts` (método `obter()` nunca testado) e `geocoding.service.ts` (função nunca chamada em nenhum teste, por depender de uma API externa real — resolvido mockando `fetch`). Todos levados a 100% statements / ≥81% branch
- **Achado colateral**: a guarda `if (!query.trim()) return null` em `geocoding.service.ts` era código morto (a query sempre incluía o literal `"Brasil"`, nunca podia ficar vazia) — removida
- **Achado adicional, investigando o fluxo de pagamento**: `PagamentosController.processar()` aceita `insuranceProvider`/`insuranceCoveragePercent` no corpo da requisição, mas nenhum caller real os envia — parâmetros mortos; mesmo que fossem enviados, não seriam persistidos (sem campo correspondente no model `Pagamento`). Registrado como gap no Backlog do Kanban

**Confirmação de horário por notificação/e-mail** (fecha o último item 🔴 Crítico pendente no Kanban):
- Backend: `email.service.ts` novo, integrado via Resend — envia e-mail HTML com logo ao paciente ("Consulta confirmada!") e ao médico ("Nova consulta agendada") na criação do agendamento, sem nunca bloquear a resposta da API se o envio falhar ou a chave não estiver configurada
- Frontend: `utils/notificacoesConsulta.ts` novo — agenda notificação local 1h antes da consulta (criar/remarcar) e cancela ao cancelar
- **Bug real corrigido no processo**: `App.tsx` pulava a solicitação de permissão de notificação inteira quando rodando no Expo Go, mas notificações *locais* (diferente de push remota) funcionam normalmente nele — sem a correção, o lembrete de 1h nunca apareceria em quem testa via Expo Go
- Decisão de provedor (Resend) tomada em conjunto com o usuário antes de implementar, por não exigir configuração de SMTP

**Verificação:** 9 novos casos de teste ao longo da sessão; suíte de backend 256 → 275 casos (29 → 32 arquivos). Verificado end-to-end no app rodando via driver headless contra o backend real com a chave do Resend de verdade: agendamento criado, e-mails efetivamente enviados ao paciente e ao médico (confirmado nos logs do container), zero erros de console.

Ver `KANBAN_MELHORIAS.md` v1.19.0 → v1.22.0 e `uaimed-back/documents/TESTES.md` v1.11.0 para o detalhamento completo.

---

### v1.17.0 — 03 de Novembro de 2026

#### 🟢 Implementado

**Confirmação de pagamento — comprovante por e-mail e tela de sucesso dedicada:**
- Backend: `enviarEmailComprovantePagamento()` novo em `email.service.ts` — e-mail HTML com valor cobrado, desconto(s), valor pago, método e ID do pagamento, sem nunca bloquear o pagamento já processado se o envio falhar
- Frontend: nova tela `PagamentoSucessoScreen.tsx` substitui o modal antigo, com botão "Compartilhar Comprovante" (API `Share` nativa)
- **Correção de escopo**: o critério "status do pagamento atualizado no card de agendamento" já estava satisfeito desde 01/11 (`MinhasConsultasScreen.tsx`); optado por tela formatada em vez de PDF (ambas válidas no critério original)
- **Achado real #1**: rodar `npm test` localmente com uma `RESEND_API_KEY` real no `.env` disparava e-mails de verdade durante os testes — `.env.test` não define a variável, e o carregamento em cascata de `env.ts` preenchia a partir do `.env` real. Corrigido com trava explícita por `NODE_ENV === 'test'`, com teste de regressão
- **Achado real #2**, na própria verificação end-to-end: pagando com "Plano de saúde" ativo, o comprovante mostrava valor cobrado e valor pago sem explicar a diferença — só o desconto de cupom era exposto, nunca o desconto do plano. Corrigido expondo `descontoPlano` separado na API, e-mail e tela

**Verificação:** 6 novos casos de teste (`unit/email.unit.test.ts`, 3 → 9); suíte de backend 275 → 281 casos (mesmos 32 arquivos). Verificado end-to-end no app rodando (Metro precisou reiniciar com `--clear` para pegar os edits do front): pagamento com plano de saúde ativo exibiu o desconto corretamente e o e-mail foi enviado de verdade.

Ver `KANBAN_MELHORIAS.md` v1.23.0 e `uaimed-back/documents/TESTES.md` v1.12.0 para o detalhamento completo.

---

### v1.18.0 — 03 de Novembro de 2026

#### 🟢 Implementado

**Filtro de busca por convênio/plano de saúde aceito:**
- Resolvidas as 3 decisões de design que estavam em aberto no Backlog: catálogo fixo de convênios (`src/constants/convenios.ts`, mesmo padrão de `especialidades.ts`, em vez de texto livre); campo `Profissional.convenios: String[]` — array nativo do Postgres, em vez de uma relação N:N; médico autogerencia via `GET`/`PUT /professionals/me/convenios`, mesmo padrão já usado para preço/disponibilidade
- Backend: `GET /convenios` (catálogo público), filtro `?convenio=` em `GET /medicos`, `convenios` incluído nas respostas de listagem e detalhe
- Frontend: `ConvenioDropdown.tsx` novo em `SearchScreen`; nova tela `MedicoConveniosScreen.tsx` (checklist multi-seleção) com atalho em `PerfilScreen`; convênios exibidos no card de resultado e na tela de detalhes do médico
- Migração de banco + seed populado com convênios realistas, para o filtro já nascer demonstrável
- **Verificação adicional do estado da feature de avaliações** (sem pedido de implementação — já completa, sem pendências): corrigiu um registro anterior deste documento/Kanban — `useAvaliacoes.ts` não é 100% código morto, a parte de `notaMedia` é usada de verdade por `PerfilScreen`; só partes específicas do hook (mock nunca finalizado) e `CardAvaliacao.tsx` são mortas, movidas para item de limpeza no Backlog

**Verificação:** 17 novos casos de teste; suíte de backend 281 → 294 casos (32 → 34 arquivos). Verificado end-to-end no app rodando: filtro por "Unimed" retornou os médicos certos; médico alternou e salvou convênios com persistência confirmada.

Ver `KANBAN_MELHORIAS.md` v1.24.0 e `uaimed-back/documents/TESTES.md` v1.13.0 para o detalhamento completo.

---

### v1.19.0 — 03 de Novembro de 2026

#### 🟢 Implementado

**`HomeScreen` — "Próxima consulta" com dado real (último item em "A Fazer" do Kanban, agora zerada):**
- Correção de escopo: metade do card já estava resolvida sem registro — `FeaturedProfessionalsCarousel` já consumia `GET /medicos/recomendados` (dado real, curado por admin via flag `Profissional.destaque`), não dado simulado
- O gap genuíno era só `NextAppointmentCard`: o componente existia pronto mas nunca era importado pela `HomeScreen` — código morto, nunca conectado
- `HomeScreen.tsx` passa a buscar `GET /agendamentos` ao focar a tela, filtrar a consulta futura mais próxima (`agendado`/`confirmado`) do paciente logado e renderizar o card; sem seção quando não há consulta futura

**Verificação:** verificado end-to-end no app rodando (driver headless `run-uaimed-front`): paciente com consulta futura confirmada exibe o card com médico/especialidade/data/hora corretos; paciente sem consulta futura não exibe a seção; zero erros de console nos dois cenários.

Ver `KANBAN_MELHORIAS.md` v1.25.0 para o detalhamento completo.

---

### v1.20.0 — 03 de Novembro de 2026

#### 🟢 Implementado

**Limpeza de código morto e correção da saúde de tipos do frontend:**
- `AgendamentosScreen.tsx` deletado — protótipo com dados simulados hardcoded, nunca importado por nenhum navigator (a aba real usa `AgendamentoStack` → `MinhasConsultasScreen`). Resolve, ao mesmo tempo, os 2 itens de Backlog que miravam essa tela (descartados, não implementados, por mirarem um arquivo morto)
- `useAvaliacoes.ts` reescrito mantendo só a parte real (`carregarMediaAvaliacoes`/`notaMedia`/`totalAvaliacoes`, consumida por `PerfilScreen`); `CardAvaliacao.tsx` e `types/avaliacao.ts` removidos por completo (sem uso restante)

**Achado real**: o erro de sintaxe JSX do `AgendamentosScreen.tsx` estava abortando `npx tsc --noEmit` antes de checar o resto do projeto — o typecheck "passava" escondendo **7 erros de tipo reais** em telas de produção (`LocalizacaoMedicoCard`, `AgendamentoStack`, `MainTabNavigation`, `ClinicaPerfilScreen`, `HistoricoAvaliacoesScreen`, `MedicoDetalhesScreen`, `MedicoDashboardScreen`). Nenhum era bug de runtime (Metro/Babel não valida tipos) — todos eram lacunas ou desatualizações de tipagem, triados e corrigidos um a um: resolução de módulos por plataforma (`moduleSuffixes` no `tsconfig.json`), API de back button do React Navigation 7, optional chaining em `navigation.navigate`, tipo de array perdido antes de um `.filter()`, `SafeAreaView` importado de `react-native` em vez de `react-native-safe-area-context` (mesma classe de bug já corrigida em outras telas), campo `convenios` faltando na interface local `MedicoPerfil`, e prop obrigatória faltando num gráfico de barras. `npx tsc --noEmit` limpo (exit 0) pela primeira vez no frontend.

**Fechamento do buraco**: novo job `typecheck-frontend` em `.github/workflows/ci.yml`, paralelo ao typecheck do backend — garante que um erro de sintaxe como esse não volte a passar despercebido.

**Verificação:** verificado end-to-end no app rodando contra o backend real (driver headless `run-uaimed-front`): fluxo completo de agendamento (Busca → Resultados → Detalhes → Horários → Minhas Consultas) intacto após a remoção do arquivo morto; telas com mudança de comportamento real renderizando corretamente. Suíte manual `tests/` (69/69) e testes do backend (294/294) sem regressão.

Ver `KANBAN_MELHORIAS.md` v1.26.0–v1.28.0 para o detalhamento completo.

---

### v1.21.0 — 04 de Novembro de 2026

#### 🟢 Implementado

**Parâmetro morto `insuranceProvider` removido de `PagamentosController`** (Kanban v1.29.0): desestruturado mas nunca referenciado, sem campo correspondente no model `Pagamento`. `insuranceCoveragePercent` mantido — diferente do outro, é funcional (sobrescreve o desconto padrão de 15% quando enviado) e testado, só não é exercitado pelo front atual.

**Teste flaky de `professional.test.ts` corrigido** (Kanban v1.30.0): achado durante a verificação do item acima, não relacionado a ele (confirmado via `git stash`). O seed do teste criava o agendamento em "agora + 1h"; rodando perto da meia-noite local, isso cruzava pro dia seguinte, caindo fora da janela de "últimos 7 dias" do dashboard semanal do médico. Corrigido ancorando a data em "hoje ao meio-dia" em vez de relativa ao momento de execução.

**Sistema de cupons — painel admin** (Kanban v1.31.0, maior item do Backlog, esforço 5): o backend já validava cupons no checkout (`PagamentosController.validarCupom`), mas não existia nenhum CRUD nem tela para criá-los — eram inseridos só via seed/banco direto. Implementado `cupons.controller.ts` + `cupom.schema.ts` + `cupons.routes.ts` (CRUD restrito à conta `admin@uaimed.com`, desativação em vez de exclusão física) e `AdminCuponsScreen.tsx` (lista com status visual, modal de criação, nova aba no painel admin). 9 novos casos de teste.

**Verificação:** suíte de testes 294 → 303 casos (34 → 35 arquivos), 100% passando. Verificado end-to-end no app rodando contra o backend real: fluxo completo de cupons (criar, listar, desativar, reativar) testado como a conta `admin@uaimed.com`, zero erros de console.

Ver `KANBAN_MELHORIAS.md` v1.29.0–v1.31.0 para o detalhamento completo.

---

### v1.15.0 — 01 de Novembro de 2026

#### 🟢 Implementado

**`HistoricoAvaliacoesScreen` — consumir API real (revisão achou um problema mais fundo que o card descrevia):**
- A tela realmente usava 100% dado simulado, mas contra um shape de avaliação (`types/avaliacao.ts`) que **nunca existiu no backend**: 4 notas por critério (atendimento/pontualidade/clínica/comunicação), voltaria/recomenda e sugestões de melhoria
- `AvaliacaoScreen.tsx` (a tela de envio) já coletava tudo isso no formulário, mas `handleSubmit` só enviava a média das 4 notas + comentário — o resto era descartado silenciosamente. O modelo `Avaliacao` só tinha `nota`+`comentario`
- **Ou seja**: toda avaliação enviada no app perdia a maior parte do feedback do paciente, não só a tela de histórico estava desatualizada
- **Decisão do usuário**: resolver na raiz em vez de só simplificar a tela de histórico pra mostrar o pouco que já era salvo
- Migração expandindo `Avaliacao` com os campos de detalhamento (`notaAtendimento`, `notaPontualidade`, `notaClinica`, `notaComunicacao`, `voltariaClinica`, `recomendaMedico`, `melhorias`) — todos opcionais/nulos para avaliações antigas
- `POST /avaliacoes` valida e persiste o detalhamento; `GET /avaliacoes/minhas` passa a retorná-lo; `AvaliacaoScreen.handleSubmit` envia tudo, não só a média
- `HistoricoAvaliacoesScreen` reescrita consumindo dado real, com degradação graciosa: avaliações sem detalhamento (antigas) mostram só nota+comentário, sem seção vazia
- **Achado adicional**: a tela não tinha nenhum ponto de entrada na navegação (estava no stack mas nada chamava `navigate`); adicionado atalho "Minhas Avaliações" em `PerfilScreen`

**Verificação:** 5 novos casos de teste; suíte de backend 253 → 256 casos (mesmos 29 arquivos). Verificado end-to-end no app rodando: avaliação com detalhamento completo e avaliação antiga simples, lado a lado na mesma lista, cada uma renderizando corretamente.

Ver `KANBAN_MELHORIAS.md` v1.18.0 para o detalhamento completo.

---

### v1.14.0 — 01 de Novembro de 2026

#### 🟢 Implementado

**`SearchScreen` — filtro de faixa de preço (card mais uma vez desatualizado):**
- A descrição dizia que `SearchScreen` não tinha integração real com a API — também não era verdade: já buscava por nome/especialidade, já tinha filtro de cidade/estado e já navegava para `Resultados` com parâmetros reais
- Único filtro genuinamente ausente do critério de aceite: faixa de preço — implementado agora (`precoMin`/`precoMax` em `GET /medicos`, chips de faixa em `SearchScreen`)
- **"Plano de saúde aceito" não implementado**: não existe esse conceito no modelo `Profissional` — o único campo relacionado é um desconto genérico de 15% que o paciente ativa no pagamento, sem relação com convênios específicos por médico. Implementar de verdade exigiria um modelo de dados novo (catálogo de convênios, relação N:N, fluxo de cadastro pelo médico). Movido para item próprio no Backlog em vez de construir um filtro decorativo sem dado real

**Verificação:** 1 novo caso de teste; suíte de backend 252 → 253 casos (mesmos 29 arquivos). Verificado end-to-end no app rodando: filtro "Acima de R$300" corretamente zera os resultados no dataset atual.

Ver `KANBAN_MELHORIAS.md` v1.17.0 para o detalhamento completo.

---

### v1.13.0 — 01 de Novembro de 2026

#### 🟢 Implementado

**`ResultadosScreen` — busca real de médicos (correção de escopo antes de implementar):**
- A descrição do card estava desatualizada: `ResultadosScreen.tsx` **já** consumia `GET /medicos` com filtros reais (`query`/`especialidade`/`cidade`/`estado`), sem dados simulados. O gap real era menor: card sem nota média/preço, navegação para `DetalhesMedico` sem `amount`, e backend sem paginação/agregação de avaliação
- `GET /medicos` passa a aceitar `skip`/`take` (teto 100) e retorna `notaMedia`/`totalAvaliacoes` por profissional via `avaliacao.groupBy` (uma única query agregada, sem N+1)
- **Contrato preservado**: a resposta continua um array — não foi envelopada em `{ data, total }` para não quebrar os 2 consumidores existentes (`ResultadosScreen` e os testes de `destaques`/`medicos_agendamentos`); o total de resultados vai no header `X-Total-Count`
- Frontend: card exibe nota média (ou "Sem avaliações") e preço da consulta; navegação para `DetalhesMedico` agora inclui `amount`
- **Decisão consciente de não implementar**: UI de "carregar mais"/paginação visual — com ~10-14 profissionais cadastrados hoje, não há necessidade real, e construir isso exigiria decisões de design não pedidas explicitamente

**Verificação:** 3 novos casos de teste (`medicos_listar.test.ts`); suíte de backend 249 → 252 casos (28 → 29 arquivos). Verificado end-to-end no app rodando: nota média e preço aparecem corretamente no card, navegação para `DetalhesMedico` funciona sem erros.

Ver `KANBAN_MELHORIAS.md` v1.16.0 para o detalhamento completo.

---

### v1.12.0 — 01 de Novembro de 2026

#### 🟢 Implementado

**Botão "Avaliar" em consultas concluídas (mais uma correção de escopo — mesmo card mirando `AgendamentosScreen.tsx` morta dos dois itens anteriores):**
- Implementado em `MinhasConsultasScreen.tsx`
- **Gap de schema encontrado na revisão, antes de implementar**: `Avaliacao` não tinha nenhuma relação com `Agendamento` (só `usuarioId` + `profissionalId`), o que tornava "agendamentos já avaliados não exibem o botão" impossível de cumprir por consulta específica — só dava para saber se o paciente já avaliou aquele médico alguma vez, não qual consulta. `AvaliacaoScreen.tsx` já recebia `agendamentoId` por parâmetro de navegação (vindo de `PagamentoScreen`) mas descartava o valor sem enviá-lo à API, sinal de que o vínculo foi planejado e nunca finalizado
- Migração adicionando `agendamentoId String? @unique` em `Avaliacao` (+ relação reversa em `Agendamento`)
- `POST /api/avaliacoes` passa a aceitar `agendamentoId` opcional, validando dono (`403`), profissional correspondente (`400`), status `concluido` (`422`) e ausência de avaliação prévia para aquele agendamento (`409`)
- `GET /api/agendamentos` retorna `avaliado: boolean`; `MinhasConsultasScreen` exibe o botão "Avaliar" só quando aplicável

**Verificação:** 7 novos casos de teste (`avaliacoes_agendamento.test.ts`); suíte de backend 242 → 249 casos (27 → 28 arquivos). Verificado end-to-end no app rodando: avaliação criada via API vinculada ao `agendamentoId` correto, botão "Avaliar" desaparece da lista após recarregar.

Ver `KANBAN_MELHORIAS.md` v1.15.0 para o detalhamento completo.

---

### v1.11.0 — 01 de Novembro de 2026

#### 🟢 Implementado

**Status de pagamento visível no agendamento (com correção de escopo antes de implementar):**
- O card do Kanban mirava `AgendamentosScreen.tsx`, que é código morto — não é importado por nenhum navigator (a aba real usa `AgendamentoStack` → `MinhasConsultasScreen`) e tem um erro de sintaxe JSX real (`<View ...> />` sem fechar). Implementado em `MinhasConsultasScreen.tsx`, a tela que o app de fato usa
- `GET /api/agendamentos` passa a incluir `pagamento: { status, valorFinal, metodo } | null`, `valor` (preço da consulta) e `pixKey`
- Badge "Pago"/"Não pago" por consulta e botão "Pagar agora" (quando não pago e não cancelado), navegando para `Pagamento` com os mesmos parâmetros que `ConfirmacaoScreen` já usa — sem cobrar de novo quem já pagou
- Badge reduzido a 2 estados em vez dos 3 do card original: o fluxo real de pagamento nunca produz o status `"pendente"` do schema (`processar()` sempre gravava `"concluido"` diretamente)

**Bug colateral encontrado na verificação manual:**
- O script de seed usa valores de status de pagamento (`"aprovado"`/`"pendente"`) distintos do que o fluxo real produz (`"concluido"`). Pagar uma consulta cujo agendamento já tinha uma linha `Pagamento` de demonstração colidia com a constraint única `agendamentoId` e derrubava `POST /pagamentos` com 500 — reproduzido e corrigido trocando `create` por `upsert`, com guarda de `409` para não sobrescrever um pagamento já `concluido`

**Verificação:** 4 novos casos de teste (`agendamentos_listar_pagamento.test.ts` + 2 em `pagamentos.test.ts`); suíte de backend 238 → 242 casos (26 → 27 arquivos). Fluxo completo verificado no app rodando via driver headless `run-uaimed-front`: pagamento via Pix atualiza o badge sem duplicar registro no banco, e o caso de borda do pagamento `"pendente"` pré-existente também foi testado manualmente.

Ver `KANBAN_MELHORIAS.md` v1.14.0 para o detalhamento completo.

---

### v1.10.0 — 01 de Novembro de 2026

#### 🟢 Implementado

**Backend — Cancelamento de consulta (correção do bug crítico aberto desde 13/10):**
- `PATCH /api/agendamentos/:id/cancelar` — valida dono do agendamento (`403`), status já `cancelado`/`realizado` (`409`) e antecedência mínima de 24h também no servidor (`422` — antes a regra só existia no cliente). Atualiza `status` para `cancelado` e audita (`CANCELAR_AGENDAMENTO`)
- 6 novos casos de teste (`agendamentos_cancelar.test.ts`)

**Backend — Remarcação de consulta (bug crítico encontrado durante a correção acima, não documentado antes):**
- O botão "Remarcar" criava uma consulta nova e independente (`POST /agendamentos`) sem cancelar nem referenciar a original — o paciente ficava com duas consultas marcadas e era cobrado de novo pela mesma consulta
- `PATCH /api/agendamentos/:id/remarcar` atualiza a `dataHora` do mesmo registro (mesmo `id`, `status` preservado, pagamento já feito continua válido), com as mesmas validações do cancelamento mais conflito de horário do profissional. Audita (`REMARCAR_AGENDAMENTO`, com data anterior/nova)
- 8 novos casos de teste (`agendamentos_remarcar.test.ts`)

**Frontend:**
- `remarcarAgendamentoId` passa a trafegar por `SelecaoHorario`/`SelecaoHorariosDia`; ao confirmar um novo horário vindo do botão "Remarcar", a tela chama o endpoint de remarcação em vez de criar um agendamento novo, e não leva mais para a tela de pagamento

**Verificação:**
- Suíte de backend: 238 casos (26 arquivos), todos passando — reconciliada com a contagem real via `npm test` (ver `uaimed-back/documents/TESTES.md`)
- Fluxo de remarcação verificado ponta a ponta no app rodando de verdade (driver headless `run-uaimed-front`): lista de consultas manteve o mesmo número de itens após remarcar, mesmo `id` no banco, log de auditoria com data anterior/nova

Ver `KANBAN_MELHORIAS.md` v1.13.0 e `uaimed-back/documents/TESTES.md` v1.4.0 para o detalhamento completo.

---

### v1.9.0 — 30 de Outubro de 2026

#### 🟢 Implementado

**Backend — Auditoria de operações críticas:**
- `AuditoriaService.registrarAcesso` passa a cobrir 9 operações de escrita além de leitura de dados de paciente: criar agendamento, processar pagamento, enviar mensagem (nos dois sentidos), aceitar/recusar vínculo clínica-médico, trocar senha, atualizar dados bancários, registrar consentimento, exportar e excluir os próprios dados
- 7 novos casos de teste cobrindo cada operação (via asserções adicionadas aos specs já existentes de cada endpoint)

**Backend — Reconsentimento LGPD:**
- `POST /api/sessions` retorna `user.precisaConsentimentoLgpd` (não bloqueia o login); novo `POST /api/users/me/consentimento-lgpd` registra o aceite pós-login. Motivado por achado real: 40/40 usuários já existentes no banco de dev não tinham consentimento registrado (o fluxo de cadastro só cobre contas novas)

**Backend — Direitos do titular (arts. 17-22 LGPD):**
- `GET /api/users/me/dados` — exporta os dados pessoais do usuário autenticado (nunca inclui senha)
- `DELETE /api/users/me` — anonimiza a conta (nome, e-mail, CPF/CNPJ, telefone, endereço, dados bancários mascarados/zerados; senha trocada por hash aleatório; `ativo: false`). Não exclui fisicamente: agendamentos/pagamentos/avaliações são registros legítimos de terceiros com `onDelete: Cascade`

**Backend — Retenção do log de auditoria:**
- `AuditoriaService.purgarAntigos()` + script `npm run logs:purgar` (sem agendador de jobs no backend — pensado para cron externo)

**Backend — `GET /avaliacoes/minhas`:**
- Endpoint que faltava para o paciente autenticado listar as próprias avaliações (desbloqueia `HistoricoAvaliacoesScreen`, que segue pendente no front)

**Frontend:**
- `LgpdConsentGateScreen` — bloqueia o app pós-login para contas que precisam reconsentir, reaproveitando o texto da política (extraído para `constants/lgpdPolicy.ts`, compartilhado com `CadastroScreen`)
- `PerfilScreen` — novo card "Privacidade e Dados (LGPD)" com "Exportar meus dados" (modal com o JSON) e "Excluir minha conta" (confirmação + anonimização)
- Corrigido bug real encontrado durante a verificação: telas renderizadas fora do `NavigationContainer` (como o novo gate) quebravam com `<SafeAreaView>` de `react-native-safe-area-context` por falta de `<SafeAreaProvider>` — o app inteiro nunca teve um, e funcionava só porque o React Navigation injeta um por baixo dos panos para telas dentro do Navigator

---

### v1.8.0 — 30 de Outubro de 2026

#### 🟢 Implementado

**Backend — Proteção LGPD:**
- Model `LogAuditoria` (sem FK — sobrevive à exclusão do ator/paciente) e `consentimentoLgpd`/`consentimentoLgpdVersao`/`consentimentoLgpdEm` no `Usuario` (migração `20261030152835_add_lgpd_consent_and_audit_log`)
- `POST /api/usuarios` passa a exigir `consentimentoLgpd: true`
- Log de auditoria gravado em `professional.controller`, `contatos.controller` e `conversas.controller` sempre que um médico/clínica acessa dados de outro usuário; consultável via `GET /admin/logs-auditoria`
- `GET /admin/relatorios/pacientes` — relatório CSV de pacientes com CPF/telefone/e-mail anonimizados (`src/utils/anonimizacao.ts`); exportação também auditada
- 6 novos casos de teste (`auditoria.test.ts`, `relatorios.test.ts` + ajustes em specs de signup existentes) — suíte completa do backend em 145/145

**Frontend:**
- `CadastroScreen.tsx` — checkbox obrigatório de aceite da Política de Privacidade (LGPD) com modal exibindo o texto completo; bloqueia o cadastro sem o aceite

**Documentação:**
- `uaimed-back/documents/API.md` — nova seção "LGPD — consentimento, auditoria e anonimização"
- `KANBAN_MELHORIAS.md` — item "[SECURITY] Proteção LGPD" movido do Backlog para Concluído

---

### v1.7.0 — 13 de Outubro de 2026

#### 🟢 Implementado

**Documentação:**
- `DOCUMENTACAO_PROJETO_UAIMED.md` — Seção 13 reescrita como "Avaliação do Projeto e Conclusão", com subseções dedicadas a Percurso Realizado, Principais Decisões Técnicas, Desafios Enfrentados, Resultados Alcançados e Perspectivas Futuras, com base no histórico real do Git (135 commits, 63 pull requests, Fev–Out/2026). Equipe corrigida para 3 integrantes (Gustavo, Igor e Karllos Eduardo)
- Seções 3 (Requisitos), 7 (Dashboards) e 8 (Relatório Técnico) atualizadas para refletir o estado real do código em Out/2026: clínicas, artigos de saúde, geolocalização, chat/conversas, administração, refresh token, rate limiting, validação Zod ampliada, logging sem dados sensíveis e 139 testes automatizados (antes 32)
- RF03.4 corrigido: cancelamento de consulta havia sido marcado como implementado com base em mensagem de commit, sem verificar a rota; confirmado por inspeção de código que `PATCH /agendamentos/:id/cancelar` não existe no backend — reclassificado como bug conhecido
- Corrigido placeholder de licença no `README.md` e criado `LICENSE` (projeto proprietário — todos os direitos reservados)

---

### v1.6.0 — 17 de Abril de 2026

#### 🟢 Implementado

**Testes Automatizados — Backend (32 casos, todos passando):**
- `auth_signup_signin.test.ts` — 5 novos casos: signup válido, e-mail duplicado (409), login correto, senha errada, usuário inexistente
- `avaliacoes.test.ts` — 6 novos casos: criar avaliação, notas inválidas (0 e 6), média calculada, zero avaliações, sem autenticação
- `pagamentos.test.ts` — 8 novos casos: processar, cupom 10%, listar, campos faltando, cupom válido/inválido, sem autenticação
- `agendamentos_criar.test.ts` — 5 novos casos: criar com dados válidos, sem autenticação, sem `medicoId`, sugestões de horário, sem parâmetro

**Backend — Correção:**
- `auth.controller.ts` — retorna HTTP 409 quando e-mail já está cadastrado (detecta `"Email já cadastrado"` do service e código Prisma `P2002`)

**Documentação:**
- `DOCUMENTACAO_PROJETO_UAIMED.md` — atualizado para v1.6.0: tabela de telas, RF09 (Suporte), US12/US13, cobertura de testes, histórico de correções
- `uaimed-back/documents/TESTES.md` — **novo documento** com pirâmide de testes, tabela de cobertura por endpoint, boas práticas e candidatos unitários

**Frontend — Novas Telas (implementadas pelo time):**
- `RecuperarSenhaScreen.tsx` — tela de recuperação de senha por e-mail
- `EmailEnviadoScreen.tsx` — confirmação visual após envio do e-mail de recuperação
- `TipoSelecaoScreen.tsx` — seleção do tipo de usuário no fluxo de cadastro
- `HelpScreen.tsx` — central de ajuda com FAQ e suporte

---

### v1.5.0 — 10 de Abril de 2026

#### 🟢 Implementado

**Correção de Bug Crítico — `MinhasConsultasScreen`:**
- Interface `Consulta` corrigida para espelhar o retorno real do `GET /agendamentos`
- Filtro de abas "Próximas" / "Anteriores" agora funciona corretamente
- Consultas agendadas passam a aparecer imediatamente após o agendamento

**Método de Pagamento — Boleto:**
- `PagamentoScreen.tsx` — opção "Dinheiro" substituída por "Boleto Bancário"
- `usePayments.ts` — tipo `PaymentMethod` atualizado: `'pix' | 'card' | 'boleto'`

**UX — HomeScreen:**
- "Minhas Consultas" navega para `MinhasConsultasScreen`
- "Meus Pagamentos" navega para `MeusPagamentosScreen`
- Menu dropdown com: Meu Perfil · Minhas Consultas · Meus Pagamentos · Sair

**Correções de Estabilidade:**
- `AuthContext.tsx` — `useCallback` e `useMemo` eliminam re-renders excessivos
- `MainTabNavigation.tsx` — resolve "Maximum update depth exceeded"

---

### v1.4.0 — 6 de Abril de 2026

#### 🟢 Implementado

**CI/CD — GitHub Actions:**
- `ci.yml`, `branch-check.yml`, `auto-link-pr.yml`, `auto-pr.yml`
- `.github/PULL_REQUEST_TEMPLATE.md`

**Frontend — HomeScreen:**
- Filtro de localização reposicionado entre título e carrossel

**Backend — Correção TypeScript:**
- `middleware/validate.ts` — tipo alterado de `AnyZodObject` para `ZodTypeAny`

---

### v1.3.0 — 1 de Abril de 2026

#### 🟢 Implementado

**Backend:**
- `POST /agendamentos` — novo endpoint com validação e verificação de conflito de horário

**Frontend:**
- Fluxo de agendamento completo conectado ponta-a-ponta
- Logo real na `LoginScreen`
- `SafeAreaView` migrado para `react-native-safe-area-context`

---

### v1.2.0 — 1 de Abril de 2026
- Revisão completa — 4 bugs críticos e 12 melhorias
- Data contracts alinhados entre frontend e backend

### v1.1.0 — Março de 2026
- Dashboards de clínica e médico
- Sistema de avaliações
- Comunicação entre paciente e profissional

### v1.0.0 — Novembro de 2025
- Documento inicial criado
- Arquitetura definida
- Requisitos levantados

