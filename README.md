# Relatório Técnico Executivo — UaiMED

## Visão Geral

O UaiMED é uma plataforma digital de saúde composta por backend (Node.js/TypeScript, Express, Prisma, PostgreSQL) e frontend mobile (React Native, TypeScript, Expo), integrando pacientes, profissionais e clínicas para agendamento, pagamentos e comunicação.

---

## Arquitetura

- **Backend:** API RESTful, autenticação JWT, banco PostgreSQL, ORM Prisma, testes automáticos (Vitest), ambiente local via Docker Compose.
- **Frontend:** App React Native, navegação robusta, integração com backend, dashboards, pagamentos e avaliações.
- **CI:** GitHub Actions executa testes e checagem de TypeScript do backend a cada push/PR.

---

## Status Atual

- Backend e frontend funcionais e integrados, com os fluxos principais implementados
- Testes automatizados no backend (Vitest); frontend ainda sem suíte de testes própria
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
git clone https://github.com/UaiMED-Plataforma-Digital-de-Saude/UaiMED-PFC.git uaimed
cd uaimed
```

2. **Backend**

```bash
cd uaimed-back
npm ci
docker-compose up -d    # inicia Postgres
npm run dev             # servidor em localhost:3333
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
- Documentos de setup, dashboards e testes em `documents/`

---

## Licença

Este projeto é proprietário — todos os direitos reservados. Consulte o arquivo [LICENSE](./LICENSE) para detalhes. Uso, cópia ou distribuição sem autorização da equipe UaiMED não são permitidos.

---

> Relatório técnico atualizado em 13/10/2026 — Equipe UaiMED
