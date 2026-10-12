# API Overview

Base URL: http://localhost:3333/api

Endpoints (scaffold):

- POST /api/usuarios -> Signup
- POST /api/sessions -> Signin
- POST /api/contatos -> Create contact (auth)
- GET /api/contatos -> List contacts (auth)
- POST /api/cupons/validar -> Validate coupon
- POST /api/pagamentos -> Process payment (auth)
- POST /api/avaliacoes -> Create review
- GET /api/avaliacoes/medico/:id/media -> Get average rating

Use o header `Authorization: Bearer <token>` para rotas que exigem autenticação.

## Destaques da home

- `GET /api/admin/destaques`: lista os profissionais e clínicas ativos e indica os selecionados (`destaque`).
- `PUT /api/admin/destaques`: substitui a seleção de destaques de forma atômica. Corpo: `{ "profissionalIds": ["uuid"], "clinicaIds": ["uuid"] }`. Arrays vazios removem os destaques.
- As duas rotas administrativas exigem a conta ativa `admin@uaimed.com`. A própria conta administrativa não pode ser escolhida como clínica.
- `GET /api/medicos/recomendados` e `GET /api/clinicas/recomendadas` retornam somente os selecionados e ativos, em ordem de nome, mantendo os filtros de cidade e estado. Não há preenchimento automático quando a seleção está vazia.

No app, a seleção fica em **Administração → Destaques**. Novos cadastros começam fora dos destaques.
