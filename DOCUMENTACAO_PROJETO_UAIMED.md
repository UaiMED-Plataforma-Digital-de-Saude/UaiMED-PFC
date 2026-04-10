# 📘 Documentação Completa do Projeto UaiMED

**Versão**: 1.5.0  
**Data**: 10 de Abril de 2026  
**Classificação**: Documentação Técnica de Engenharia de Software  
**Status**: Projeto em Desenvolvimento Avançado — UX aprimorada, bug fixes de navegação e fluxo de registros do usuário

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
13. [Conclusão](#13-conclusão)
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
- ✅ Sistema de agendamento
- ✅ Sistema de pagamentos
- ✅ Sistema de avaliações
- ✅ Dashboards analíticos
- ✅ Comunicação básica

#### Excluído (Fase 1):
- ❌ Telemedicina/videoconferência
- ❌ Prontuário eletrônico completo
- ❌ Integração com sistemas hospitalares
- ❌ Notificações push avançadas

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
| RF01.5 | Recuperação de senha | Média | ✅ Implementado (UI + API) |

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
| RF03.4 | Cancelamento | Alta | ⚠️ Parcial (backend OK, frontend pendente) |
| RF03.5 | Visualização de agenda | Alta | ✅ Implementado |
| RF03.6 | Fluxo completo Busca→Confirmação→Pagamento→Avaliação | Alta | ✅ Implementado (v1.3.0) |

#### RF04 - Sistema de Pagamentos
| ID | Requisito | Prioridade | Status |
|----|-----------|------------|--------|
| RF04.1 | Pagamento via PIX | Alta | ✅ Implementado |
| RF04.2 | Pagamento via cartão | Alta | ✅ Implementado |
| RF04.3 | Aplicação de cupons | Alta | ✅ Implementado |
| RF04.4 | Cobertura de plano de saúde | Alta | ✅ Implementado |
| RF04.5 | Comprovantes | Média | ⚠️ Parcial (Alert pós-pagamento; tela dedicada pendente) |
| RF04.6 | Status de pagamento visível no agendamento | Alta | ⚠️ Pendente (KANBAN) |

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
| RF06.1 | Enviar mensagens | Média | ✅ Implementado |
| RF06.2 | Visualizar mensagens | Média | ✅ Implementado |
| RF06.3 | Status de leitura | Baixa | ✅ Implementado |

#### RF07 - Dashboards e Analytics
| ID | Requisito | Prioridade | Status |
|----|-----------|------------|--------|
| RF07.1 | Dashboard de clínica | Alta | ✅ Implementado |
| RF07.2 | Dashboard de médico | Alta | ✅ Implementado |
| RF07.3 | Relatórios por período | Média | ⚠️ Parcial |
| RF07.4 | Gráficos e visualizações | Média | ⚠️ Parcial |

#### RF08 - Notificações e Confirmações
| ID | Requisito | Prioridade | Status |
|----|-----------|------------|--------|
| RF08.1 | Notificação local pós-agendamento | Alta | ⚠️ Parcial (infra pronta, push remoto bloqueado Expo Go) |
| RF08.2 | E-mail de confirmação de horário | Alta | ⚠️ Pendente (KANBAN) |
| RF08.3 | E-mail de comprovante de pagamento | Alta | ⚠️ Pendente (KANBAN) |
| RF08.4 | Lembrete 1h antes da consulta | Média | ⚠️ Pendente |


### 3.2 Requisitos Não Funcionais

#### RNF01 - Performance
- **RNF01.1**: API responde em < 500ms (p95) ✅
- **RNF01.2**: App carrega em < 3s ✅
- **RNF01.3**: Suporta 1000 usuários concorrentes ⚠️

#### RNF02 - Segurança
- **RNF02.1**: Senhas criptografadas (bcrypt) ✅
- **RNF02.2**: JWT com expiração (7 dias) ✅
- **RNF02.3**: Proteção LGPD ⚠️
- **RNF02.4**: Validação de entrada (Zod) ✅
- **RNF02.5**: Refresh automático de token ⚠️ (interceptor no axios; endpoint refresh pendente)

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
- **RNF05.2**: Cobertura de testes 80% ⚠️
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

### 6.3 Pipeline de Desenvolvimento

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

### 6.4 Estrutura de Dados

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
    { "day": "2025-11-06", "count": 12 }
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

#### Métricas Disponíveis

**KPIs:**
- Agendamentos hoje
- Receita do mês
- Média de avaliações
- Contatos pendentes

**Dados:**
- Próximos agendamentos (10)
- Agendamentos por dia

#### Estrutura de Dados
```json
{
  "totalToday": 8,
  "nextAppointments": [
    {
      "id": "uuid",
      "dataHora": "2025-11-12T14:00:00Z",
      "pacienteNome": "João Silva",
      "status": "confirmado"
    }
  ],
  "ratingAvg": 4.6,
  "revenueThisMonth": 12500.00,
  "pendingContacts": 3
}
```

### 7.3 Pipeline de Analytics

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
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  VISUALIZAÇÃO                                   │
│  - Dashboards React Native                      │
│  - Gráficos e KPIs                              │
└─────────────────────────────────────────────────┘
```

---

## 8. Relatório Técnico

### 8.1 Status Atual do Projeto

#### ✅ Implementado

**Backend:**
- ✅ Arquitetura REST API completa
- ✅ Autenticação JWT funcional
- ✅ CRUD completo de todas as entidades
- ✅ Validação com Zod
- ✅ Middleware de autenticação e autorização
- ✅ Sistema de pagamentos completo
- ✅ Sistema de avaliações
- ✅ Dashboards (clínica e médico)
- ✅ Testes unitários e de integração
- ✅ Docker Compose para desenvolvimento

**Frontend:**
- ✅ Aplicativo React Native funcional
- ✅ Navegação completa por stack e tabs
- ✅ Autenticação integrada (JWT + AsyncStorage)
- ✅ **Fluxo de agendamento completo**: DetalhesMedico → SelecaoHorario → Confirmacao → Pagamento → Avaliacao → Busca (v1.3.0)
- ✅ `POST /agendamentos` criado com verificação de conflito de horário (v1.3.0)
- ✅ Telas de pagamento (PIX, cartão, cupom, plano de saúde) integradas ao fluxo
- ✅ `ConfirmacaoScreen` redesenhada com card de detalhes e botão "Ir para Pagamento"
- ✅ `AvaliacaoScreen` navega para início após enviar avaliação (v1.3.0)
- ✅ **Logo real do projeto** na `LoginScreen` — `icon.png` via `<Image>` (v1.3.0)
- ✅ `SafeAreaView` migrado para `react-native-safe-area-context` em todas as telas
- ✅ Dashboard de clínica e painel do médico (`MedicoAgendaScreen`) com KPIs
- ✅ Sistema de avaliações com 4 dimensões de nota + média calculada
- ✅ Comunicação frontend-backend (data contracts alinhados)
- ✅ Recuperação de senha (UI completa + integração API)
- ✅ Contato com profissional funcionando
- ✅ Carousel de profissionais em destaque

#### ⚠️ Em Desenvolvimento

- ⚠️ Notificações push remotas (requer development build — bloqueado pelo Expo Go SDK 53+)
- ⚠️ E-mail de confirmação de agendamento e pagamento
- ⚠️ Tela dedicada de comprovante de pagamento
- ⚠️ Status de pagamento visível na lista de agendamentos
- ⚠️ `MedicoDetalhesScreen` com dados reais (atualmente placeholder)
- ⚠️ `ResultadosScreen` com busca real na API
- ⚠️ `HistoricoAvaliacoesScreen` com dados reais
- ⚠️ Cancelamento de agendamento pelo paciente (frontend)
- ⚠️ Geolocalização avançada
- ⚠️ Relatórios exportáveis

#### ❌ Não Implementado (Fase 1)

- ❌ Telemedicina
- ❌ Prontuário eletrônico
- ❌ Integração com sistemas externos
- ❌ Chat em tempo real

### 8.2 Métricas de Qualidade

#### Cobertura de Testes
- **Backend**: 6 suítes de testes passando (health, auth/notifications, contatos, medicos/agendamentos, admin, professional)
- **Novos endpoints v1.3.0**: `POST /agendamentos` — testes a adicionar na próxima sprint (ver KANBAN_MELHORIAS.md)
- **Frontend**: Testes manuais (fluxo completo verificado — DetalhesMedico até Avaliacao)
- **Integração**: Testes de API implementados, validados e estáveis

#### Performance
- **API Response Time**: < 500ms (média)
- **Database Queries**: Otimizadas (N+1 eliminado em `sugerirHorarios`)
- **Mobile App Load**: < 3 segundos

#### Segurança
- ✅ Senhas criptografadas (bcrypt)
- ✅ JWT com expiração
- ✅ Validação de entrada (Zod)
- ✅ CORS configurado

### 8.3 Histórico de Correções (v1.0 → v1.2)

| Data | Arquivo | Correção |
|------|---------|----------|
| Abr/2026 | `useContatos.ts` | Mapeamento `medicoId` → `profissionalId` no payload enviado ao backend |
| Abr/2026 | `FeaturedProfessionalsCarousel.tsx` | Suporte a campo `avatar` além de `imagem`; imports reorganizados; tipo `NavProp` não utilizado removido |
| Abr/2026 | `useContatos.ts` | Interface `ContatoResponse` alinhada com campos reais do backend (`profissionalId`, `criado_em`) |
| Abr/2026 | `vitest.config.ts` | Criação do arquivo de configuração correto para `globals: true` |
| Abr/2026 | Banco de dados | Migrations aplicadas e seed executado com dados reais em todas as 7 tabelas |
| Abr/2026 | `AuthContext.tsx` | **Bug crítico:** removida chamada a `setToken()` indefinida na restauração de sessão (causava crash ao reabrir o app) |
| Abr/2026 | `avaliacoes.routes.ts` | **Bug crítico:** adicionado `authMiddleware` em `POST /avaliacoes` (sem ele, `req.user` era sempre `undefined` → 401 em toda avaliação) |
| Abr/2026 | `AvaliacaoScreen.tsx` | **Bug crítico:** `handleSubmit` integrado com API real (`POST /avaliacoes`) — antes apenas simulava um delay sem enviar dados |
| Abr/2026 | `PerfilScreen.tsx` | **Bug crítico:** corrigido ID passado para `useAvaliacoes` — agora usa `user.profissional.id` (ID do profissional) em vez de `user.id` (ID do usuário) |
| Abr/2026 | `agendamentos.controller.ts` | **Performance:** eliminado N+1 queries em `sugerirHorarios` — antes executava até 126 queries individuais; agora 1 única query com filtro em memória |
| Abr/2026 | `auth.service.ts` | **Confiabilidade:** signup de médico agora usa transação Prisma — garante atomicidade entre criação de `Usuario` e `Profissional` |
| Abr/2026 | `agendamentos.routes.ts` | Import de `authMiddleware` movido para o topo do arquivo (antes ficava após declaração de variável) |
| Abr/2026 | `admin.controller.ts` | Substituído `console.error` pelo `logger` estruturado |
| Abr/2026 | `users.routes.ts` | Substituídos `console.log`/`console.error` pelo `logger` estruturado |
| Abr/2026 | `admin.test.ts` | CPF hardcoded `'00000000000'` substituído por UUID dinâmico — evita conflito de unique constraint entre execuções de teste |
| Abr/2026 | `vitest.config.ts` | Removido `src/**/*.spec.ts` do include — `admin.spec.ts` e `professional.spec.ts` eram duplicatas que rodavam em paralelo e destruíam dados uns dos outros no `afterAll` |
| Abr/2026 | Todos os testes | Limpeza (`afterAll`) refatorada para deletar por ID específico em vez de padrões amplos (`contains: 'text'`) que atingiam dados de outros testes rodando em paralelo |
| Abr/2026 | `src/tests/globalSetup.ts` | Novo arquivo: aplica automaticamente o schema Prisma no banco de teste (`uaimed_test`) antes de qualquer suíte — resolve o erro `table 'public.usuarios' does not exist` |
| Abr/2026 | `vitest.config.ts` | Adicionado `globalSetup` apontando para `globalSetup.ts` — garante banco de teste pronto sem precisar rodar `test:setup` manualmente |
| Abr/2026 | `package.json` | `test` agora usa `--run` (modo CI); `test:watch` para desenvolvimento interativo |

### 8.4 Dependências Críticas

#### Backend
- `express`: Framework web
- `@prisma/client`: ORM
- `jsonwebtoken`: Autenticação
- `zod`: Validação
- `bcryptjs`: Criptografia

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
    {
      "estado": "SP",
      "agendamentos": 3500,
      "receita": 525000.00
    }
  ],
  "heatmap": [
    {
      "lat": -23.5505,
      "lng": -46.6333,
      "intensity": 0.85
    }
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
- Gateways de pagamento
- Assinaturas recorrentes
- Planos de saúde digitais

### 9.4 Fase 5 - Mobile Avançado (Q4 2026)

#### 9.4.1 Notificações Inteligentes
- Push notifications personalizadas
- Lembretes de consulta
- Notificações de resultados

#### 9.4.2 Geolocalização
- Busca por proximidade
- Navegação até clínica
- Check-in geográfico

---

## 10. Engenharia de Dados

### 10.1 Arquitetura de Dados

#### 10.1.1 Camadas de Dados

```
┌─────────────────────────────────────────────────┐
│  CAMADA DE APLICAÇÃO (OLTP)                     │
│  - Dados transacionais                           │
│  - Normalização completa                         │
│  - Integridade referencial                       │
│  - Otimizado para escrita                        │
└──────────────────┬──────────────────────────────┘
                   │
                   │ ETL Process (Futuro)
                   ▼
┌─────────────────────────────────────────────────┐
│  CAMADA DE ANALYTICS (OLAP) - FUTURO            │
│  - Dados agregados                               │
│  - Desnormalização                               │
│  - Otimizado para leitura                       │
│  - Histórico preservado                          │
└─────────────────────────────────────────────────┘
```

#### 10.1.2 Modelo de Dados Analítico (Futuro)

**Tabelas de Fato:**
- `fato_agendamentos` (data, profissional, paciente, valor)
- `fato_pagamentos` (data, agendamento, método, valor)
- `fato_avaliacoes` (data, profissional, nota)

**Tabelas de Dimensão:**
- `dim_tempo` (data, dia, semana, mês, ano)
- `dim_profissional` (id, nome, especialidade, cidade, estado)
- `dim_paciente` (id, nome, cidade, estado)
- `dim_localizacao` (cidade, estado, região, coordenadas)

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
- **Deduplicação**: Constraints únicos
- **Normalização**: Formatação consistente
- **Enriquecimento**: Dados derivados

### 10.4 Governança de Dados

#### 10.4.1 Privacidade (LGPD)
- **Anonimização**: Dados sensíveis protegidos
- **Consentimento**: Controle de uso
- **Auditoria**: Log de acessos

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
- Loading states
- Mensagens de sucesso/erro
- Confirmações de ações

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
- Logs estruturados
- Error tracking
- Performance monitoring

#### 12.3.2 Documentação
- API Documentation
- Code comments
- Technical guides

---

## 13. Conclusão

### 13.1 Status Atual

O projeto UaiMED está em **fase de desenvolvimento avançada**, com:
- ✅ Backend completo e funcional com novo endpoint `POST /agendamentos`
- ✅ Frontend mobile implementado e integrado
- ✅ **Fluxo de agendamento ponta-a-ponta funcionando**: busca → seleção → criação → confirmação → pagamento → avaliação → início
- ✅ **Identidade visual aplicada**: logo real na `LoginScreen` (`icon.png`)
- ✅ Bugs críticos corrigidos: `SafeAreaView` deprecado, comentários `//` em JSX, `notaMedia.toFixed()`, `setNotificationHandler` fora de componente
- ✅ Integração frontend-backend operacional e verificada
- ✅ Data contracts alinhados (field names, tipos, mapeamentos)
- ✅ Dashboards básicos funcionando (clínica e médico)
- ✅ 6 suítes de testes de backend cobrindo endpoints principais
- ✅ Banco de dados migrado e populado com dados reais
- ✅ Documentação completa e atualizada (v1.3)
- ✅ Kanban de melhorias criado (`KANBAN_MELHORIAS.md`) com 34 itens rastreados

### 13.2 Próximos Passos

1. **Curto Prazo** (Sprint 2 — ~1 semana):
   - `MedicoDetalhesScreen` com dados reais da API
   - `ResultadosScreen` consumindo `GET /medicos` com filtros
   - `AgendamentosScreen` — dados reais + botão "Avaliar" em consultas concluídas
   - Status de pagamento visível no card de agendamento

2. **Médio Prazo** (Sprint 3-4 — ~2 semanas):
   - E-mail de confirmação de agendamento e pagamento (Nodemailer)
   - Tela dedicada de comprovante pós-pagamento
   - Cancelamento de agendamento pelo paciente
   - Development build (`npx expo run:android`) para push remoto
   - Rate limiting em endpoints de autenticação

3. **Longo Prazo** (Sprint 5 — entrega PFC):
   - Polimento visual completo
   - Testes automatizados para novos endpoints
   - Documentação final e apresentação
   - Machine Learning para recomendação de profissionais (pós-PFC)

### 13.3 Métricas de Sucesso

- **Adoção**: 1000+ usuários ativos
- **Engajamento**: 70%+ taxa de retorno
- **Satisfação**: 4.5+ estrelas
- **Performance**: 99.5%+ uptime

---

**Documento gerado em**: 12 de Novembro de 2025  
**Última atualização**: 6 de Abril de 2026  
**Versão**: 1.4.0  
**Autor**: Equipe de Desenvolvimento UaiMED  
**Classificação**: Documentação Técnica Profissional  
**Kanban de melhorias**: ver [`KANBAN_MELHORIAS.md`](./KANBAN_MELHORIAS.md)

---

## 14. Changelog

### v1.4.0 — 6 de Abril de 2026

#### 🟢 Implementado

**CI/CD — GitHub Actions:**
- `ci.yml` — Pipeline de integração contínua com dois jobs: `typecheck` (TypeScript sem erros) e `backend-tests` (Vitest + PostgreSQL isolado)
- `branch-check.yml` — Valida padrão de nome de branch (`feat/descricao`, `fix/descricao`, etc.) em toda PR aberta
- `auto-link-pr.yml` — Verifica se PR menciona issue; comenta lembrete automático caso não mencione
- `auto-pr.yml` — Ao dar push na branch `develop`, cria/atualiza PR automática para `main` com log de commits e referências de issues extraídas automaticamente
- `.github/PULL_REQUEST_TEMPLATE.md` — Template padrão de PR com seções: Descrição, Issue relacionada (`Fixes #N`), Tipo de mudança, Checklist, DeskCheck e Notas para revisor

**Frontend — HomeScreen:**
- Filtro de localização reposicionado: saiu do cabeçalho e foi posicionado entre o título "Profissionais em destaque" e o carrossel
- Estilo do filtro padronizado com o `locationBar` do `SearchScreen` de agendamento (mesmo visual, mesma UX)
- Título "Profissionais em destaque" movido do componente `FeaturedProfessionalsCarousel` para `HomeScreen` para permitir inserção do filtro entre título e carrossel
- Espaçamentos compactados: `paddingTop`, `marginVertical` de seções e carrossel reduzidos para layout mais próximo e fluido

**Backend — Correção TypeScript:**
- `middleware/validate.ts` — tipo alterado de `AnyZodObject` para `ZodTypeAny`, permitindo que schemas com `.refine()` (`ZodEffects`) sejam passados sem erro de compilação

---

### v1.5.0 — 10 de Abril de 2026

#### 🟢 Implementado

**Correção de Bug Crítico — `MinhasConsultasScreen`:**
- Interface `Consulta` corrigida para espelhar o retorno real do `GET /agendamentos`: campo `data` (e não `dataHora`), e campos `medico`/`especialidade` no nível raiz (e não aninhados em `profissional.usuario.nome`)
- Filtro de abas "Próximas" / "Anteriores" agora funciona corretamente com o campo `c.data`
- Consultas agendadas passam a aparecer imediatamente na tela "Minhas Consultas" após o agendamento

**Método de Pagamento — Boleto:**
- `PagamentoScreen.tsx` — opção "Dinheiro" (`cash`) substituída por "Boleto Bancário" (`boleto`) com ícone `document-text-outline`
- `usePayments.ts` — tipo `PaymentMethod` atualizado: `'pix' | 'card' | 'boleto'`
- `MeusPagamentosScreen.tsx` — `METODO_LABEL` inclui `boleto: 'Boleto Bancário'` (mantém `cash` como legado)

**UX — HomeScreen:**
- Atalho "Nova Consulta" removido dos shortcuts
- "Minhas Consultas" agora navega para `MinhasConsultasScreen` (lista dedicada de consultas)
- "Meus Pagamentos" navega para `MeusPagamentosScreen`
- Ícone de menu hambúrguer estático (sem animação de rotação)
- Menu dropdown expandido com: Meu Perfil · Minhas Consultas · Meus Pagamentos · (divisor) · Sair

**UX — PerfilScreen:**
- Seção "Minha Saúde" renomeada para "Meus Registros"
- "Minhas Consultas" e "Meus Pagamentos" navegam para telas dedicadas

**Nova Tela `MinhasConsultasScreen`:**
- Lista consultas agendadas do usuário via `GET /agendamentos`
- Abas: Próximas (futuras, não canceladas) e Anteriores (passadas/canceladas/concluídas)
- Card por consulta: nome do profissional, especialidade, data, horário, badge de status colorido
- Pull-to-refresh integrado

**Nova Tela `MeusPagamentosScreen`:**
- Lista pagamentos do usuário via `GET /pagamentos`
- Card de resumo verde com total investido em saúde
- Detalhes: profissional, data da consulta, método, status e valor final com desconto

**Backend:**
- `GET /pagamentos` — novo endpoint para listar pagamentos do usuário autenticado com join de agendamento/profissional (`pagamentos.controller.ts`, `pagamentos.routes.ts`)

**Navegação:**
- `AgendamentoStackParamList` — rotas `MinhasConsultas` e `MeusPagamentos` adicionadas
- `AgendamentoStack.tsx` — ambas as novas telas registradas no stack
- `MainTabNavigation.tsx` — `unmountOnBlur: true` na tab Agendamentos: ao tocar na aba, o stack sempre reinicia na `SearchScreen` (Busca), impedindo que navegação via atalhos deixe MinhasConsultas como tela padrão da tab

**Correções de Estabilidade:**
- `AuthContext.tsx` — `signIn` e `signOut` agora usam `useCallback([], [])` e `value` usa `useMemo` → elimina re-renders excessivos em todos os consumers de `useAuth()`
- `MainTabNavigation.tsx` — `<Tab.Screen>` sempre declarados estaticamente, ocultados via `tabBarItemStyle: { display: 'none' }` → resolve "Maximum update depth exceeded"
- `MedicoAgendaScreen.tsx` — `useEffect([user?.id])` em vez de `useEffect([user])` → dependência estável
- `App.tsx` — `expo-notifications` protegido com detecção de Expo Go (`Constants.appOwnership`): push notifications não solicitadas em Expo Go (SDK 53+); canal Android e handler local preservados

---

### v1.3.0 — 1 de Abril de 2026

#### 🟢 Implementado

**Backend:**
- `POST /agendamentos` — novo endpoint para criação de agendamento com validação de profissional e verificação de conflito de horário (arquivo: `agendamentos.controller.ts`, `agendamentos.routes.ts`)

**Frontend:**
- **Fluxo de agendamento completo conectado** — `DetalhesMedico → SelecaoHorario → Confirmacao → Pagamento → Avaliacao → Busca`
- `SelecaoHorarioScreen` — chama `POST /agendamentos` ao selecionar horário, passa `agendamentoId` real para `Confirmacao`
- `ConfirmacaoScreen` — redesenhada com card de detalhes (data/hora, número do agendamento, valor) e botão "Ir para Pagamento"
- `PagamentoScreen` — recebe `medicoId` dos params; após pagamento oferece "Avaliar Consulta" → navega para `AvaliacaoScreen`
- `AvaliacaoScreen` — após enviar avaliação, navega para `Busca` (início) em vez de `goBack()` que retornava para `Pagamento`
- **Logo real na LoginScreen** — substituído ícone genérico `Ionicons "medical"` por `<Image source={require('../../assets/icon.png')} />` com `borderRadius: 22`
- `SafeAreaView` migrado para `react-native-safe-area-context` em `LoginScreen`, `PagamentoScreen` e `AvaliacaoScreen`
- `navigation/types.ts` — parâmetros `amount` e `medicoId` propagados por todo o `AgendamentoStack`

**Bugs Corrigidos:**
- `App.tsx` — `setNotificationHandler` movido para `useEffect`; props inválidas `shouldShowBanner/shouldShowList` removidas; `alert()` trocado por `Alert.alert()`
- `PerfilScreen.tsx` — comentários `//` dentro de expressões JSX removidos (causavam `ERROR Text strings must be rendered within a <Text>`)
- `PerfilScreen.tsx` — `notaMedia.toFixed()` protegido com `Number()`; guarda trocada de `notaMedia ?` para `notaMedia !== null`
- `useAvaliacoes.ts` — `Number(res.data?.notaMedia ?? 0)` garante tipo numérico mesmo se API retornar string

**Documentação:**
- `KANBAN_MELHORIAS.md` criado — Kanban Ágil com 34 itens rastreados (concluídos, a fazer, backlog, bloqueado)

---

### v1.2.0 — 1 de Abril de 2026
- Revisão completa do projeto — 4 bugs críticos e 12 melhorias aplicadas (backend, frontend e infraestrutura de testes)
- Data contracts alinhados entre frontend e backend
- Integração frontend-backend verificada ponta-a-ponta

### v1.1.0 — Março de 2026
- Implementação inicial dos dashboards de clínica e médico
- Sistema de avaliações com média por profissional
- Comunicação (contatos) entre paciente e profissional

### v1.0.0 — Novembro de 2025
- Documento inicial criado
- Arquitetura definida
- Requisitos levantados
