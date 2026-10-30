# UaiMED — Visão Geral do Projeto

Este documento descreve o projeto UaiMED — uma aplicação móvel (Expo / React Native) com um backend em Node.js + TypeScript usando Express e Prisma (PostgreSQL). O objetivo final é um produto funcional para agendamento médico, com dashboards para clínicas e profissionais, suporte a pagamentos (com plano de saúde e cupons), autenticação JWT, e um conjunto de testes de integração.

Principais componentes

- Frontend: React Native (Expo) + TypeScript

  - Navegação com React Navigation
  - Telas para Auth, Agendamento, Pagamentos, Perfil, Dashboards (placeholders)
  - Axios para comunicação com o backend (`uaiMedApi`)

- Backend: Node.js + TypeScript + Express

  - ORM: Prisma (PostgreSQL)
  - Validação: Zod
  - Autenticação: JWT + middleware de roles
  - Segurança: bcrypt para hashing de senhas
  - LGPD: consentimento obrigatório no cadastro, log de auditoria de acesso a dados de pacientes e anonimização em relatórios/exports (veja `uaimed-back/documents/API.md`)
  - Testes: Vitest + Supertest

- Infra local: Docker Compose com Postgres (recomendado para testes locais e CI)

Objetivos de documentação

- Explicar como configurar e rodar projeto (front e back)
- Registrar decisões arquiteturais e contratos de API
- Detalhar o esquema de banco (modelos principais)
- Documentar endpoints importantes (auth, agendamentos, pagamentos, dashboards)
- Fornecer guia de testes e CI

Referências rápidas

- Backend direto: `uaimed-back/`
- Frontend: `uaimed-front/`
- Documentos adicionais: veja esta pasta `documents/` para guias e o relatório final.
