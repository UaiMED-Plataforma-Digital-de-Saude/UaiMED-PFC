# 📘 Documentação Completa do Projeto UaiMED

**Versão**: 1.8.0  
**Data**: 30 de Outubro de 2026  
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
| RF03.4 | Cancelamento/reagendamento pelo paciente | Alta | 🔴 Bug — frontend chama `PATCH /agendamentos/:id/cancelar`, endpoint inexistente no backend |
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
| RF04.7 | Status de pagamento visível no agendamento | Alta | ⚠️ Pendente (KANBAN) |

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
| RF13.2 | Painel administrativo (perfil, artigos, destaques) | Alta | ✅ Implementado |

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
- **RNF02.3**: Proteção LGPD ✅ (consentimento obrigatório no cadastro, log de auditoria de acesso a dados de pacientes, relatório de pacientes anonimizado)
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
- **RNF05.2**: Cobertura de testes ≥ 139 casos automatizados (20 arquivos) ✅
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

Telas: `AdminHomeScreen`, `AdminArtigosScreen`, `AdminDestaquesScreen`, `AdminPerfilScreen`. Permite gerenciar destaques da Home e artigos de saúde publicados (acesso restrito por papel/e-mail de administrador).

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
- ✅ **139 casos de teste automatizados** (20 arquivos) cobrindo os endpoints principais
- ✅ Logging revisado — Prisma não loga mais SQL com dados de usuário; app não loga payloads fora de ambiente de desenvolvimento
- ✅ Proteção LGPD — consentimento obrigatório no cadastro, log de auditoria (`GET /admin/logs-auditoria`) de acesso a dados de pacientes, relatório de pacientes anonimizado (`GET /admin/relatorios/pacientes`)
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
- ✅ Telas de administração: `AdminHomeScreen`, `AdminArtigosScreen`, `AdminDestaquesScreen`, `AdminPerfilScreen`
- ✅ Artigos de saúde: `ArtigosListaScreen`, `ArtigoDetalhesScreen`, `ArtigoCadastroScreen` (admin)
- ✅ Chat: `ConversasListaScreen`, `ConversaDetalhesScreen`
- ✅ Geolocalização: `LocationModal` + `expo-location` em `MedicoDetalhesScreen`
- ✅ Sistema de avaliações com nota + comentário
- ✅ Carousel de profissionais em destaque na Home
- ✅ Filtro de localização (estado/município) na Home e na busca

#### ⚠️ Em Desenvolvimento

- 🔴 **Bug conhecido**: cancelamento de consulta — `MinhasConsultasScreen` chama `PATCH /agendamentos/:id/cancelar`, que não existe no backend (só há `GET`/`POST /agendamentos` e `GET /agendamentos/sugestoes-horario`); botão "Cancelar" falha em runtime
- ⚠️ Notificações push remotas (requer development build — bloqueado pelo Expo Go SDK 53+)
- ⚠️ E-mail real de recuperação de senha (backend Nodemailer)
- ⚠️ E-mail de confirmação de agendamento e pagamento
- ⚠️ Status de pagamento visível na lista de agendamentos
- ⚠️ `ResultadosScreen` com busca real na API
- ⚠️ `HistoricoAvaliacoesScreen` com dados reais
- ⚠️ Relatórios exportáveis de uso geral (já existe um caso específico: relatório de pacientes anonimizado, ver RNF02.3)

#### ❌ Não Implementado (Fase 1)

- ❌ Telemedicina
- ❌ Prontuário eletrônico
- ❌ Integração com sistemas externos
- ❌ Chat em tempo real (WebSocket/push) — hoje o chat funciona via REST, sem atualização instantânea

### 8.2 Métricas de Qualidade

#### Cobertura de Testes
- **Total de casos**: **139 testes automatizados** (20 arquivos) — todos passando ✅
- **Suítes de integração (backend)** — principais adições desde Abr/2026:
  - `clinicas.test.ts` — 17 casos
  - `artigos.test.ts` — 11 casos
  - `destaques.test.ts` — 9 casos
  - `conversas.test.ts` — 4 casos
  - `users.test.ts` — 4 casos
  - `conta-bancaria.test.ts` — 3 casos
  - `professionals.test.ts` — 3 casos
  - (mantidas as suítes de auth, agendamentos, avaliações e pagamentos já documentadas em v1.6.0)
- **Suítes unitárias**: `auth.schema.unit`, `hash.unit`, `jwt.unit` — 37 casos
- **Frontend**: Testes manuais (fluxo completo verificado); sem suíte automatizada própria
- **Documento de testes**: [`uaimed-back/documents/TESTES.md`](./uaimed-back/documents/TESTES.md)

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
- ✅ LGPD: consentimento obrigatório no cadastro, log de auditoria de acesso a dados de pacientes, relatório de pacientes anonimizado

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
- **Anonimização**: CPF/telefone/e-mail mascarados no relatório de pacientes (`GET /admin/relatorios/pacientes`)
- **Consentimento**: Aceite obrigatório da Política de Privacidade no cadastro (`consentimentoLgpd`), com versão e data gravadas no `Usuario`
- **Auditoria**: Log de acessos de médico/clínica a dados de outros usuários (model `LogAuditoria`), consultável em `GET /admin/logs-auditoria`

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

- Backend: API REST completa com autenticação JWT + refresh token, validação Zod em todos os endpoints, rate limiting contra brute-force, **32+ testes automatizados (100% passando)** e CI executando a cada push/PR.
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
- ✅ **32 testes automatizados** cobrindo os endpoints críticos — todos passando
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

