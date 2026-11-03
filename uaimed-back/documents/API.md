# API Overview

Base URL: http://localhost:3333/api

Endpoints (scaffold):

- POST /api/usuarios -> Signup
- POST /api/sessions -> Signin
- POST /api/contatos -> Create contact (auth)
- GET /api/contatos -> List contacts (auth)
- POST /api/cupons/validar -> Validate coupon
- POST /api/agendamentos -> Create appointment (auth)
- GET /api/agendamentos -> List own appointments (auth)
- PATCH /api/agendamentos/:id/cancelar -> Cancel own appointment (auth)
- PATCH /api/agendamentos/:id/remarcar -> Reschedule own appointment (auth)
- POST /api/pagamentos -> Process payment (auth)
- POST /api/avaliacoes -> Create review
- GET /api/avaliacoes/medico/:id/media -> Get average rating

Use o header `Authorization: Bearer <token>` para rotas que exigem autenticação.

## Validação do cadastro de usuários

`POST /api/usuarios` valida os campos antes de consultar ou criar uma conta. Valores inválidos retornam `400` com `details[].path` e `details[].message`, apresentados junto ao campo correspondente no aplicativo.

| Campo | Regra |
| --- | --- |
| Nome / razão social | Obrigatório, de 2 a 120 caracteres após remover espaços nas extremidades. |
| E-mail | Obrigatório, formato de e-mail e até 254 caracteres. |
| CPF | Obrigatório para paciente/médico; exatamente 11 dígitos, com ou sem máscara padrão. |
| CNPJ | Obrigatório para clínica; exatamente 14 dígitos, com ou sem máscara padrão. |
| Telefone | Obrigatório, DDD sem zero e 10 ou 11 dígitos. Aceita número puro ou máscara `(31) 99999-9999`; armazena somente números. |
| Senha | Pelo menos 6 caracteres, não pode conter apenas espaços, até 72 bytes UTF-8 para evitar truncamento pelo bcrypt. Não é aparada ou normalizada. |
| Especialidade / CRM | Obrigatórios para médico. Especialidade deve estar no catálogo; CRM com 3 a 20 caracteres, letras/números/hífen/barra e pelo menos um número. |
| Endereço / cidade | Opcionais; quando informados, de 5 a 200 / de 2 a 100 caracteres. |
| UF / CEP | Opcionais; UF brasileira válida e CEP com 8 dígitos, com ou sem máscara padrão. |
| Consentimento LGPD | Deve ser `true`. |

CPF/CNPJ são validados quanto ao formato e comprimento, sem consulta cadastral ou validação de dígitos verificadores. Os campos opcionais de endereço continuam opcionais para médicos e clínicas. A confirmação da senha é validada no aplicativo e não é enviada à API.

O formulário limita a digitação/colagem dos campos e filtra caracteres não numéricos em telefone, CPF, CNPJ e CEP. A API também aplica limites para impedir o envio de valores excessivos por clientes externos.

## Agendamentos — cancelamento e remarcação

- `PATCH /api/agendamentos/:id/cancelar`: cancela uma consulta do próprio usuário autenticado. Retorna `403` se o agendamento for de outro usuário, `409` se já estiver `cancelado`/`realizado`/`concluido`, e `422` se faltarem menos de 24h para o horário marcado (a mesma regra que a tela já aplica no cliente, aqui também reforçada no servidor). Em caso de sucesso, `status` passa para `cancelado` e é gravado log de auditoria `CANCELAR_AGENDAMENTO`.
- `PATCH /api/agendamentos/:id/remarcar`: altera a `dataHora` de uma consulta do próprio usuário **sem criar um novo registro** (mesmo `id`, `status` preservado, pagamento já efetuado continua associado à mesma consulta). Corpo: `{ "dataHora": "<ISO 8601>" }`. Mesmas validações de dono/status/antecedência de 24h do cancelamento, calculadas a partir do horário **atual** da consulta, mais `409` se o novo horário já estiver ocupado por outro agendamento do mesmo profissional e `422` se o novo horário não estiver no futuro. Log de auditoria `REMARCAR_AGENDAMENTO` com `detalhes: { dataAnterior, dataNova }`.
- No app, **Minhas Consultas → Remarcar** reaproveita o fluxo de seleção de data/horário (`SelecaoHorario`/`SelecaoHorariosDia`) passando o `agendamentoId` original; ao confirmar, a tela chama `remarcar` em vez de criar um agendamento novo, então não há cobrança duplicada nem tela de pagamento repetida.
- `GET /api/agendamentos` também retorna `valor` (preço da consulta do profissional), `pixKey` e `pagamento: { status, valorFinal, metodo } | null` (`null` quando não há nenhum pagamento registrado para o agendamento). No app, **Minhas Consultas** exibe um badge "Pago"/"Não pago" ao lado do status e, quando não pago, um botão "Pagar agora" que navega para `Pagamento` com esses dados.
- `POST /api/pagamentos` usa `upsert` (chave única `agendamentoId`) em vez de `create`: se o agendamento já tiver um `Pagamento` com status diferente de `concluido` (ex.: `pendente`), o registro é atualizado para `concluido` em vez de falhar na constraint única. Se já existir um pagamento `concluido` para o agendamento, retorna `409` em vez de processar de novo.
- `GET /api/agendamentos` também retorna `avaliado: boolean` (se já existe uma `Avaliacao` vinculada àquele agendamento específico — não apenas ao profissional). No app, **Minhas Consultas** exibe um botão "Avaliar" em consultas `concluido` sem avaliação.
- `POST /api/avaliacoes` aceita `agendamentoId` opcional. Quando informado: `404` se o agendamento não existir, `403` se não pertencer ao usuário autenticado, `400` se `profissionalId` não corresponder ao profissional do agendamento, `422` se o agendamento não estiver `concluido`, `409` se esse agendamento já tiver sido avaliado (constraint única `agendamentoId` em `Avaliacao`). Sem `agendamentoId`, o comportamento antigo é preservado (avaliação solta, vinculada só ao profissional).
- `POST /api/avaliacoes` também aceita um detalhamento opcional: `notaAtendimento`, `notaPontualidade`, `notaClinica`, `notaComunicacao` (inteiros 1-5), `voltariaClinica`/`recomendaMedico` (`"sim"`/`"nao"`/`"talvez"`) e `melhorias` (texto livre). `nota` continua sendo a nota geral (hoje a média das 4, calculada no app) usada em todo o resto do sistema (perfil do médico, badges etc.); o detalhamento é só para o histórico do próprio paciente. Avaliações sem detalhamento (antigas, ou enviadas sem o formulário completo) retornam esses campos como `null` — `GET /avaliacoes/minhas` também os inclui.

## Busca de profissionais

- `GET /api/medicos` aceita `query` (nome), `especialidade`, `cidade`, `estado`, `precoMin`/`precoMax` (faixa de `precoConsulta`), e paginação via `skip`/`take` (`take` máx. 100, padrão 50). Cada item retorna também `notaMedia`/`totalAvaliacoes` (agregados via `avaliacao.groupBy`, sem N+1) e `precoConsulta`. A resposta continua um array — o total de resultados (ignorando `skip`/`take`) vai no header `X-Total-Count`, para preservar o contrato existente dos consumidores atuais.
- Não há filtro por "plano de saúde aceito": o modelo `Profissional` não tem nenhum campo de convênio — ver `KANBAN_MELHORIAS.md` (Backlog) para o que falta ser desenhado.

## Perfil profissional — CRM e avaliações

- `PUT /api/users/me` aceita `crm` para contas médicas autenticadas. O valor é aparado e convertido para maiúsculas, usa a mesma validação do cadastro (3 a 20 caracteres, pelo menos um número, letras/números/hífen/barra) e só altera o profissional associado ao usuário autenticado. CRM de outro profissional retorna `409`, inclusive quando muda apenas a capitalização. Atualização do nome/telefone e do CRM ocorre em uma transação; falhas não deixam esses dados parcialmente salvos. A resposta inclui `user.profissional: { id, crm }` quando o CRM foi informado, sem dados bancários. Pacientes/clínicas não podem enviar `crm` (`403`); conta médica sem perfil profissional recebe `404`.
- No app, **Perfil → Editar → CRM → Salvar Alterações** permite atualizar apenas o CRM; não é necessário alterar endereço ou preço da consulta junto.
- O cabeçalho do perfil médico consulta `GET /api/avaliacoes/medico/:id/media` sempre que a tela recebe foco. Exibe média e `totalAvaliacoes`, mostra **Sem avaliações** quando o total é zero e oferece nova tentativa se a consulta falhar. Tocar na média abre a tela de avaliações recebidas (`GET /api/professionals/me/avaliacoes`). Respostas atrasadas de outra tela/conta são ignoradas.

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

### Auditoria de operações críticas

Além de acesso a dados de paciente, `AuditoriaService.registrarAcesso` também é
chamado nas seguintes operações de escrita (atendendo aos requisitos "permitir
auditoria de operações realizadas" e "auditoria de acessos e operações
críticas"):

| Ação | Onde | `acao` no log |
|---|---|---|
| Criar agendamento | `POST /api/agendamentos` | `CRIAR_AGENDAMENTO` |
| Cancelar agendamento | `PATCH /api/agendamentos/:id/cancelar` | `CANCELAR_AGENDAMENTO` |
| Remarcar agendamento | `PATCH /api/agendamentos/:id/remarcar` | `REMARCAR_AGENDAMENTO` |
| Processar pagamento | `POST /api/pagamentos` | `PROCESSAR_PAGAMENTO` |
| Enviar mensagem (ambos os sentidos) | `POST /api/conversas/:id/mensagens` | `ENVIAR_MENSAGEM` |
| Aceitar/recusar vínculo clínica-médico | `PATCH /api/clinicas/solicitacoes/:clinicaId` | `ACEITAR_VINCULO_CLINICA` / `RECUSAR_VINCULO_CLINICA` |
| Trocar senha | `POST /api/auth/change-password` | `TROCAR_SENHA` |
| Atualizar dados bancários | `PUT /api/conta-bancaria` | `ATUALIZAR_DADOS_BANCARIOS` |
| Registrar consentimento LGPD | `POST /api/users/me/consentimento-lgpd` | `REGISTRAR_CONSENTIMENTO_LGPD` |
| Exportar meus dados | `GET /api/users/me/dados` | `EXPORTAR_MEUS_DADOS` |
| Excluir conta | `DELETE /api/users/me` | `EXCLUIR_CONTA` |

Isso ainda não é cobertura de 100% das operações do sistema — é o conjunto
definido como "crítico" para o escopo do PFC (dados de saúde, financeiros e de
segurança de conta). Ver `KANBAN_MELHORIAS.md` para o que ficou de fora.

### Reconsentimento (contas anteriores ao fluxo de consentimento)

- `POST /api/sessions` (login): a resposta inclui `user.precisaConsentimentoLgpd`
  (`true` quando `consentimentoLgpd` é `false` ou a versão aceita é antiga). O
  login **não é bloqueado** por isso — o frontend que decide o que fazer com a
  flag (ver app, seção de reconsentimento).
- `POST /api/users/me/consentimento-lgpd` (auth): registra o aceite da versão
  vigente da política para o usuário autenticado.

### Direitos do titular (arts. 17-22 da LGPD)

- `GET /api/users/me/dados` (auth): exporta os dados pessoais do usuário
  autenticado (dados do `Usuario`, do `Profissional` quando aplicável, e um
  resumo de atividade — contagem de agendamentos/pagamentos/avaliações/
  contatos/mensagens/conversas). Nunca inclui a senha.
- `DELETE /api/users/me` (auth): **anonimiza** a conta (não exclui fisicamente
  — agendamentos, pagamentos e avaliações ligados ao usuário são registros
  legítimos de terceiros, com `onDelete: Cascade` no schema; apagar
  fisicamente apagaria esse histórico junto). Nome, e-mail, CPF/CNPJ,
  telefone, endereço e dados bancários são mascarados/zerados, a senha é
  trocada por um hash aleatório (login fica impossível) e a conta marcada
  `ativo: false`.

### Retenção do log de auditoria

`LogAuditoria` guarda dado pessoal (`pacienteNome`) e não pode ficar retido
indefinidamente. `AuditoriaService.purgarAntigos(retencaoEmMeses = 6)` remove
registros mais antigos que a retenção configurada. Não há agendador de jobs no
backend — rodar via `npm run logs:purgar` (lê `LOGS_AUDITORIA_RETENCAO_MESES`,
padrão 6 meses), chamado por um cron externo (crontab do host, scheduled task
do Docker/CI etc).
