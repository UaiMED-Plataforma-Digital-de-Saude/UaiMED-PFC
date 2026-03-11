e gerenciarem sua conta.

> listados.
> que o projeto evolui.

# Relatório Técnico Executivo — UaiMED

## Visão Geral

O UaiMED é uma plataforma digital de saúde composta por backend (Node.js/TypeScript, Express, Prisma, PostgreSQL) e frontend mobile (React Native, TypeScript, Expo), integrando pacientes, profissionais e clínicas para agendamento, pagamentos e comunicação.

---

## Arquitetura

- **Backend:** API RESTful, autenticação JWT, banco PostgreSQL, ORM Prisma, testes automáticos (Vitest), deploy via Docker Compose.
- **Frontend:** App React Native, navegação robusta, integração total com backend, dashboards, pagamentos e avaliações.
- **CI/CD:** Pipeline GitHub Actions, testes automatizados, deploy orientado a containers.

---

## Status Atual

- Backend e frontend completos e integrados
- Testes automatizados confiáveis (Vitest)
- Cobertura de requisitos essenciais: autenticação, agendamento, pagamentos, dashboards, avaliações
- Documentação técnica detalhada (`DOCUMENTACAO_PROJETO_UAIMED.md`)

---

## Integrações e Métricas

- Integração frontend-backend validada
- Banco de dados seed e migrações automatizadas
- Dashboards para clínica e profissionais
- KPIs monitorados: usuários, agendamentos, receita, avaliações
- Segurança: senhas criptografadas, JWT, validação Zod, CORS

---

## Roadmap e Próximos Passos

- Analytics avançado (painéis por categoria, localização, previsão de demanda)
- Notificações push e geolocalização
- Relatórios exportáveis e integrações externas (HL7/FHIR, laboratórios, farmácias)
- Mobile avançado: notificações inteligentes, busca por proximidade

---

## Como rodar localmente

1. Clone o repositório e entre na pasta:

```bash
git clone <url> uaimed
cd uaimed
```

2. **Backend**

```bash
cd uaimed-back
npm ci
docker-compose up -d    # inicia Postgres
npm run dev             # servidor em localhost:3000
```

3. **Frontend**

```bash
cd ../uaimed-front
npm ci
npm start               # inicia Metro/Expo
```

4. Ajuste `DATABASE_URL`/`BASE_URL` nos `.env` conforme necessário.

---

## Documentação Detalhada

- [Documentação Técnica Completa](./DOCUMENTACAO_PROJETO_UAIMED.md)
- [Verificação de Integração e Testes](./VERIFICATION_WHAT_WAS_DONE.md)
- Documentos de setup, troubleshooting e arquitetura em `documents/`

---

## Licença

Coloque aqui a licença escolhida (ex: MIT).

---

> Relatório técnico atualizado em 11/03/2026 — Equipe UaiMED
