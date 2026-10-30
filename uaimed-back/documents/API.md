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

## LGPD — consentimento, auditoria e anonimização

- `POST /api/usuarios`: exige `consentimentoLgpd: true` no corpo (rejeita com 400 se ausente/`false`). O aceite é gravado no usuário com versão da política (`consentimentoLgpdVersao`) e data (`consentimentoLgpdEm`).
- `GET /api/admin/logs-auditoria` (role `clinica`): lista, paginado (`skip`/`take`, `take` máx. 200), a trilha de acesso aos dados dos pacientes atendidos pela clínica — quem acessou, quando, qual ação e qual paciente. Gravada automaticamente sempre que um médico/clínica lista agendamentos, contatos ou mensagens de outro usuário (nunca quando o próprio paciente acessa os próprios dados).
- `GET /api/admin/relatorios/pacientes` (role `clinica`): exporta CSV (`Content-Type: text/csv`) com os pacientes atendidos pela clínica. Nome e métricas (total de consultas, última consulta) em claro; CPF, telefone e e-mail são mascarados (`src/utils/anonimizacao.ts`). A própria exportação também gera um registro de auditoria.

Implementação: model `LogAuditoria` (sem FK — sobrevive à exclusão do ator/paciente), serviço `src/services/auditoria.service.ts`, utilitário de mascaramento `src/utils/anonimizacao.ts`.
