# 🗂️ UaiMED — Kanban de Melhorias & TODOs

**Versão**: 1.28.0  
**Data**: 03 de Novembro de 2026  
**Metodologia**: Ágil — Kanban contínuo por sprint  
**Responsável**: Time UaiMED-PFC

> Este documento ficou sem atualização entre 10/Abr/2026 (v1.8.0) e 13/Out/2026. A seção "CONCLUÍDO — Mai–Out/2026" consolida, de forma verificada no código real (não apenas em mensagens de commit), o que foi entregue nesse intervalo.

---

## 📋 Sobre Este Documento

Este documento segue o estilo **Kanban** para rastreamento de melhorias, débitos técnicos e itens pendentes identificados durante o desenvolvimento do UaiMED. Cada card pertence a uma coluna do quadro e possui **prioridade**, **esforço estimado** e **área** (Frontend / Backend / DevOps / Ambos).

### Colunas do Quadro

| Coluna | Significado |
|---|---|
| 🗃️ **Backlog** | Identificado, aguardando refinamento ou sprint |
| 🔵 **A Fazer** | Refinado, priorizado, pronto para iniciar |
| 🟡 **Em Progresso** | Sendo desenvolvido na sprint atual |
| 🟢 **Concluído** | Entregue e testado nesta sessão |
| ⏸️ **Bloqueado** | Impedido por dependência externa |

### Escala de Prioridade

`🔴 Crítico` · `🟠 Alto` · `🟡 Médio` · `🟢 Baixo`

### Escala de Esforço (Story Points)

`1` Trivial · `2` Pequeno · `3` Médio · `5` Grande · `8` Muito Grande

---

## 🟢 CONCLUÍDO — Sprints Anteriores (01/04/2026 → 10/04/2026)

> Itens finalizados nesta sessão de desenvolvimento (histórico, v1.8.0).

---

### ✅ [BUG FIX] `MinhasConsultasScreen` — Consultas agendadas não apareciam na listagem

**Área**: Frontend | **Prioridade**: 🔴 Crítico | **Esforço**: 2

**Causa**: Interface `Consulta` usava `dataHora` e `profissional.usuario.nome`, mas o backend (`GET /agendamentos`) retorna `data` e campos planos `medico`/`especialidade`.  
**Fix**: Interface e campos de filtragem/renderização corrigidos para espelhar o contrato real da API.

---

### ✅ [FEATURE] `PagamentoScreen` — Substituição de "Dinheiro" por "Boleto Bancário"

**Área**: Frontend | **Prioridade**: 🟡 Médio | **Esforço**: 1

- Método `cash` substituído por `boleto` em `PagamentoScreen.tsx`, `usePayments.ts` e `MeusPagamentosScreen.tsx`
- Ícone `document-text-outline` reflete o contexto de boleto bancário

---

### ✅ [FEATURE] Telas dedicadas `MinhasConsultasScreen` e `MeusPagamentosScreen`

**Área**: Frontend + Backend | **Prioridade**: 🟠 Alto | **Esforço**: 5

- `MinhasConsultasScreen`: lista consultas com abas "Próximas" e "Anteriores", badges de status, pull-to-refresh
- `MeusPagamentosScreen`: lista pagamentos com card de total investido, método, desconto e status
- Backend: `GET /pagamentos` adicionado com join de agendamento/profissional
- Navegação: rotas `MinhasConsultas` e `MeusPagamentos` adicionadas ao `AgendamentoStackParamList`

---

### ✅ [UX] `HomeScreen` — Atalhos e menu reestruturados

**Área**: Frontend | **Prioridade**: 🟡 Médio | **Esforço**: 2

- Ícone de menu estático (sem animação de rotação)
- Menu dropdown: Meu Perfil · Minhas Consultas · Meus Pagamentos · Sair
- Atalhos: Minhas Consultas · Meus Pagamentos · Ajuda (3 itens, sem "Nova Consulta" redundante)

---

### ✅ [UX] `PerfilScreen` — Seção "Meus Registros" com atalhos de navegação

**Área**: Frontend | **Prioridade**: 🟢 Baixo | **Esforço**: 1

- Seção "Minha Saúde" renomeada para "Meus Registros"
- Atalhos "Minhas Consultas" e "Meus Pagamentos" navegam para telas dedicadas

---

### ✅ [BUG FIX] `MainTabNavigation` — Tab "Agendamentos" não retornava ao `SearchScreen`

**Área**: Frontend | **Prioridade**: 🔴 Crítico | **Esforço**: 1

- Ajustado o comportamento da tab Agendamentos para retornar à `SearchScreen` ao tocar na aba
- Ao tocar na aba, o stack reinicia na `SearchScreen` independente de navegação anterior via atalhos

---

### ✅ [BUG FIX] `Maximum update depth exceeded` — Loop infinito de re-renders

**Área**: Frontend | **Prioridade**: 🔴 Crítico | **Esforço**: 3

- `AuthContext.tsx`: `signIn`/`signOut` com `useCallback`, `value` com `useMemo`
- `MainTabNavigation.tsx`: `<Tab.Screen>` estáticos com ocultação via `tabBarItemStyle`
- `MedicoAgendaScreen.tsx`: dependência `[user?.id]` em vez de `[user]`

---

### ✅ [BUG FIX] `expo-notifications` — Erro no Expo Go (SDK 53+)

**Área**: Frontend | **Prioridade**: 🟠 Alto | **Esforço**: 1

- `App.tsx` detecta Expo Go via `Constants.appOwnership`; `requestPermissionsAsync` só chamado em dev/production build

---

### ✅ [IMPROVEMENT] `SelecaoHorarioScreen` — Calendário mensal com seleção de data e grade de horários
- **Área**: Frontend + Backend
- **Prioridade**: 🟠 Alto
- **Esforço**: 3
- **Descrição**: Tela de seleção de horários exibia apenas uma `FlatList` plana com até 10 slots misturados de vários dias, sem contexto de data. Usuário não conseguia visualizar a disponibilidade por dia.
- **Resolução**:
  - **Frontend**: `SelecaoHorarioScreen` reescrita com calendário mensal customizado (sem dependência externa):
    - Navegação de mês com botões `‹` `›`
    - Grid de 7 colunas (Dom → Sáb) com dias do mês
    - Datas passadas e além de 30 dias exibidas com opacidade reduzida (não selecionáveis)
    - Hoje destacado com borda verde (`#4CAF50`)
    - Dia selecionado preenchido em verde
    - Legenda: Selecionado / Hoje / Indisponível
    - Ao tocar em uma data, busca os horários daquele dia via API e exibe em grade flexível de botões (`08:00` → `16:30`, intervalos de 30 min)
    - Estado vazio com ícone e instrução amigável
    - Card de prompt inicial orientando o usuário antes de qualquer seleção
  - **Backend**: `AgendamentosController.sugerirHorarios()` atualizado para aceitar parâmetro opcional `?data=YYYY-MM-DD`:
    - Quando `data` é fornecido: retorna **todos os slots livres do dia** (sem limite de 10)
    - Data parseada em **tempo local** (`new Date(year, month-1, day, ...)`) para evitar bug de fuso UTC
    - Sem `data`: comportamento original preservado (próximos 7 dias, até 10 slots)

---

### ✅ [BUG] Variável de ambiente `DATABASE_URL` não carregada no `npm run dev`
- **Área**: Backend
- **Prioridade**: 🔴 Crítico
- **Esforço**: 1
- **Descrição**: `ZodError` ao iniciar o servidor por ausência do `.env`. Arquivo `.env` não existia ou estava mal configurado.
- **Resolução**: Criado/validado `.env` com `DATABASE_URL` correta; separado `.env.test` para ambiente de testes.

---

### ✅ [BUG] `setNotificationHandler` fora do componente React em `App.tsx`
- **Área**: Frontend
- **Prioridade**: 🔴 Crítico
- **Esforço**: 1
- **Descrição**: `Notifications.setNotificationHandler({...})` era chamado no nível do módulo (fora do componente), disparando log de erro imediatamente no Android ao carregar o bundle.
- **Resolução**: Movido para dentro do `useEffect`. Props inválidas `shouldShowBanner` e `shouldShowList` removidas. `alert()` do browser substituído por `Alert.alert()` do React Native.

---

### ✅ [BUG] `expo-notifications` gerando erro no Expo Go (Android SDK 53+)
- **Área**: Frontend
- **Prioridade**: 🟠 Alto
- **Esforço**: 2
- **Descrição**: Push remoto removido do Expo Go a partir do SDK 53. App usava Expo SDK 54, gerando `ERROR expo-notifications: Android Push notifications removed`.
- **Resolução**: Bugs de código corrigidos. Warning residual é limitação do Expo Go — solução definitiva é `npx expo run:android` (development build).

---

### ✅ [BUG] `notaMedia.toFixed()` lançando `TypeError` em `PerfilScreen`
- **Área**: Frontend
- **Prioridade**: 🔴 Crítico
- **Esforço**: 2
- **Descrição**: API podia retornar `notaMedia` como string `"4.5"`. Chamar `.toFixed()` sobre string lança `TypeError: notaMedia.toFixed is not a function`. Também: `notaMedia === 0` era falsy, exibindo "Sem avaliações" incorretamente.
- **Resolução**: `Number(notaMedia).toFixed(1)` no `PerfilScreen`. `Number(res.data?.notaMedia ?? 0)` no `useAvaliacoes.ts`. Guarda trocada de `notaMedia ?` para `notaMedia !== null`.

---

### ✅ [BUG] Comentários `//` dentro de JSX causando `Text strings must be rendered within a <Text>`
- **Área**: Frontend
- **Prioridade**: 🔴 Crítico
- **Esforço**: 1
- **Descrição**: Comentários de linha `//` dentro de expressões JSX `( )` eram tratados como strings pelo Metro bundler do React Native, causando erro na `PerfilScreen` linhas 98 e 225.
- **Resolução**: Comentários `//` removidos de dentro dos blocos JSX.

---

### ✅ [BUG] `SafeAreaView` importado de `react-native` (deprecado)
- **Área**: Frontend
- **Prioridade**: 🟠 Alto
- **Esforço**: 1
- **Descrição**: `PagamentoScreen` e `AvaliacaoScreen` importavam `SafeAreaView` de `react-native`, gerando `WARN SafeAreaView has been deprecated`.
- **Resolução**: Import migrado para `react-native-safe-area-context` em ambas as telas.

---

### ✅ [FEATURE] Fluxo de agendamento completo conectado
- **Área**: Frontend + Backend
- **Prioridade**: 🔴 Crítico
- **Esforço**: 5
- **Descrição**: `PagamentoScreen` registrada no stack mas nunca navegada. Fluxo correto não existia no app.
- **Resolução**: Implementado fluxo completo:
  ```
  DetalhesMedico → SelecaoHorario → Confirmacao → Pagamento → Avaliacao → Busca
  ```
  - `SelecaoHorarioScreen`: agora chama `POST /agendamentos` ao selecionar horário, recebe `agendamentoId` real.
  - `ConfirmacaoScreen`: reescrita com card de detalhes e botão "Ir para Pagamento".
  - `PagamentoScreen`: lê `medicoId` dos params; após pagamento navega para `Avaliacao`.
  - `AvaliacaoScreen`: após enviar avaliação, navega para `Busca` (início) em vez de `goBack()`.
  - `types.ts`: parâmetros `amount` e `medicoId` propagados por todo o stack.

---

### ✅ [FEATURE] `POST /agendamentos` criado no backend
- **Área**: Backend
- **Prioridade**: 🔴 Crítico
- **Esforço**: 3
- **Descrição**: Rota `POST /agendamentos` não existia. Frontend recebia 404 ao tentar criar agendamento.
- **Resolução**: Método `criar()` adicionado ao `AgendamentosController` com validação de profissional, verificação de conflito de horário e criação no banco. Rota registrada com `authMiddleware`.

---

### ✅ [BUG] `AvaliacaoScreen` — após avaliar, voltava para `PagamentoScreen`
- **Área**: Frontend
- **Prioridade**: 🟠 Alto
- **Esforço**: 1
- **Descrição**: `navigation.goBack()` na `AvaliacaoScreen` retornava para `PagamentoScreen`, que já não faz sentido após o fluxo completo.
- **Resolução**: Substituído por `navigation.navigate('Busca')`.

---

### ✅ [IMPROVEMENT] Logo real na tela de Login
- **Área**: Frontend
- **Prioridade**: 🟡 Médio
- **Esforço**: 1
- **Descrição**: `LoginScreen` exibia um ícone `Ionicons "medical"` genérico como placeholder de logo. Sem identidade visual real do projeto.
- **Resolução**: Substituído por `<Image source={require('../../assets/icon.png')} />` com `borderRadius` e dimensões definidas. `SafeAreaView` também migrado para `react-native-safe-area-context`.

---

## 🟢 CONCLUÍDO — Mai–Out/2026 (consolidado)

> Entregas de ~6 meses de desenvolvimento, verificadas por inspeção direta do código (rotas, schema, telas e suíte de testes) em 13/Out/2026 — não apenas por mensagem de commit.

---

### ✅ [FEATURE] Clínicas — vínculo com médicos, recomendações, solicitações
**Área**: Frontend + Backend | **Esforço**: 8 — `clinicas.routes.ts`, telas `ClinicaHomeScreen`/`ClinicaMedicosScreen`/`ClinicaPerfilScreen`, 17 casos de teste (`clinicas.test.ts`).

---

### ✅ [FEATURE] Artigos de saúde — leitura pública + CRUD administrativo
**Área**: Frontend + Backend | **Esforço**: 5 — `artigos.routes.ts` (restrito a `admin@uaimed.com`), telas `ArtigosListaScreen`/`ArtigoDetalhesScreen`/`ArtigoCadastroScreen`, 17 casos de teste (`artigos.test.ts`).

---

### ✅ [FEATURE] Chat/Conversas entre paciente e médico
**Área**: Frontend + Backend | **Esforço**: 5 — `conversas.routes.ts`, telas `ConversasListaScreen`/`ConversaDetalhesScreen`. REST, sem WebSocket (não é "tempo real").

---

### ✅ [FEATURE] Geolocalização — endereço geocodificado e busca por proximidade
**Área**: Frontend + Backend | **Esforço**: 5 — `geocoding.service.ts`, `expo-location` em `MedicoDetalhesScreen`. Antecipa item que estava no roadmap da Fase 5.

---

### ✅ [FEATURE] Tela de Administração + destaques da Home
**Área**: Frontend + Backend | **Esforço**: 5 — `admin.routes.ts` (`/admin/destaques`), telas `AdminHomeScreen`/`AdminArtigosScreen`/`AdminDestaquesScreen`/`AdminPerfilScreen`, 9 casos de teste (`destaques.test.ts`).

---

### ✅ [FEATURE] Painel do médico completo — contatos, preço, disponibilidade
**Área**: Frontend + Backend | **Esforço**: 5 — endpoints `professionals/me/{preco,disponibilidade,agenda,avaliacoes}`, telas `MedicoDashboardScreen`/`MedicoContatosScreen`/`MedicoDisponibilidadeScreen`. Resolve o item "Painel do Médico completo" que estava no Backlog.

---

### ✅ [FEATURE] `GET /medicos/:id` — detalhes completos do profissional
**Área**: Backend | **Esforço**: 2 — confirmado por leitura do controller: retorna `notaMedia`, `precoConsulta`, avaliações recentes, contagens. Resolve o item do Backlog com o mesmo nome.

---

### ✅ [FEATURE] Campo `precoConsulta` no modelo `Profissional`
**Área**: Backend + Banco | **Esforço**: 3 — `precoConsulta Float @default(150.00)` no schema real. Resolve o item do Backlog "Campo valor no modelo Profissional".

---

### ✅ [SECURITY] Refresh token
**Área**: Backend + Frontend | **Esforço**: 8 — `POST /api/sessions/refresh` implementado e funcional. Resolve o item de Backlog "Refresh token e expiração de sessão".

---

### ✅ [SECURITY] Rate limiting contra brute-force
**Área**: Backend | **Esforço**: 2 — `express-rate-limit`, 10 tentativas/IP/min em `/sessions` e `/usuarios` (`skipSuccessfulRequests` no login). Resolve o item de Backlog com o mesmo nome.

---

### ✅ [IMPROVEMENT] Validação Zod ampliada
**Área**: Backend | **Esforço**: 3 — cobertura via `validateBody` ampliada para praticamente todas as rotas de escrita, incluindo `/agendamentos` e `/pagamentos`. Resolve o item de Backlog "Validação com Zod nos novos endpoints".

---

### ✅ [IMPROVEMENT] Testes automatizados — cobertura ampliada
**Área**: Backend | **Esforço**: 5 — suíte cresceu de 32 para **139 casos em 20 arquivos** (ver [`uaimed-back/documents/TESTES.md`](./uaimed-back/documents/TESTES.md)), incluindo `agendamentos_criar.test.ts` e `pagamentos.test.ts`. Resolve a maior parte do item de Backlog com o mesmo nome — na época (13/10) ainda faltava teste para `GET /avaliacoes/minhas`, porque o endpoint não existia; implementado e testado em 30/10 (ver Concluído — 30/10/2026).

---

### ✅ [FIX] Logging — remoção de dados sensíveis
**Área**: Backend + Frontend | **Esforço**: 2 — Prisma parou de logar SQL com dados de usuário (`query`/`info`); app não loga payloads de rede fora de ambiente de desenvolvimento. Item novo, não estava neste kanban antes.

---

## 🟢 CONCLUÍDO — 30/10/2026

---

### ✅ [SECURITY] Proteção LGPD
**Área**: Backend + Frontend | **Esforço**: 8 — resolve o item de Backlog com o mesmo nome.

- [x] Política de consentimento no cadastro — `consentimentoLgpd` obrigatório (`true`) em `POST /api/usuarios`; versão e data do aceite gravadas no `Usuario`; checkbox + modal com o texto da política em `CadastroScreen.tsx`
- [x] Log de auditoria de acesso a dados de pacientes — model `LogAuditoria` (sem FK, sobrevive à exclusão do ator/paciente); gravado em `professional.controller`, `contatos.controller` e `conversas.controller` sempre que um médico/clínica acessa dados de outro usuário; consultável via `GET /admin/logs-auditoria`
- [x] Anonimização em exports/relatórios — `GET /admin/relatorios/pacientes` exporta CSV com CPF/telefone/e-mail mascarados (`src/utils/anonimizacao.ts`); a própria exportação também é auditada

Detalhes em [`uaimed-back/documents/API.md`](./uaimed-back/documents/API.md#lgpd--consentimento-auditoria-e-anonimização). Suíte do backend em 145/145 testes (6 novos casos cobrindo consentimento, auditoria e anonimização).

---

### ✅ [SECURITY] Auditoria de operações críticas
**Área**: Backend | **Esforço**: 5 — fecha os requisitos *"permitir auditoria de operações realizadas"* e *"o sistema deve permitir auditoria de acessos e operações críticas"*, e resolve o item de Backlog com o mesmo nome. Lista de operações definida junto com o time (ver histórico de alterações).

- [x] Toda mensagem enviada (`POST /conversas/:id/mensagens`) gera um registro em `LogAuditoria` (`acao: 'ENVIAR_MENSAGEM'`), nos dois sentidos — fecha também o requisito específico *"Mensagens trocadas entre usuários devem permanecer registradas para auditoria"* (confirmado por inspeção: não existe rota de exclusão de conversa/mensagem, então já ficam retidas por padrão)
- [x] Criar agendamento (`POST /agendamentos` → `CRIAR_AGENDAMENTO`)
- [x] Processar pagamento (`POST /pagamentos` → `PROCESSAR_PAGAMENTO`)
- [x] Aceitar/recusar vínculo clínica-médico (`PATCH /clinicas/solicitacoes/:clinicaId` → `ACEITAR_VINCULO_CLINICA`/`RECUSAR_VINCULO_CLINICA`) — crítico porque esse vínculo é a base do escopo usado pela própria auditoria/relatório LGPD
- [x] Trocar senha (`POST /auth/change-password` → `TROCAR_SENHA`) e atualizar dados bancários (`PUT /conta-bancaria` → `ATUALIZAR_DADOS_BANCARIOS`)

7 novos casos de teste (um por operação, como asserções adicionadas aos specs de cada endpoint). Detalhes: [`uaimed-back/documents/API.md`](./uaimed-back/documents/API.md#auditoria-de-operações-críticas).

**Ainda não é 100% das operações do sistema** — é o conjunto definido como crítico para o escopo do PFC (saúde, financeiro, segurança de conta). Outras escritas (ex.: atualizar perfil, avaliações, artigos) seguem sem auditoria; decisão consciente de escopo, não esquecimento.

---

### ✅ [ENDPOINT] `GET /avaliacoes/minhas` — avaliações do paciente logado
**Área**: Backend | **Esforço**: 2 — protegido por `authMiddleware`, retorna avaliações do `usuarioId` do token com dados do profissional (`especialidade`, `nome`, `avatar`) incluídos. Resolve o item de "A Fazer" com o mesmo nome; desbloqueia `HistoricoAvaliacoesScreen` (segue pendente no front).

---

### ✅ [SECURITY] Reconsentimento LGPD para usuários existentes
**Área**: Backend + Frontend | **Esforço**: 3 — resolve o item de Backlog com o mesmo nome. Achado real ao implementar: **40/40 usuários do banco de dev** (incluindo as contas seed) estavam com `consentimentoLgpd = false`, porque o fluxo anterior só cobria cadastro novo.

- [x] `POST /api/sessions` retorna `user.precisaConsentimentoLgpd` sem bloquear o login
- [x] `POST /api/users/me/consentimento-lgpd` registra o aceite pós-login (audita a própria operação)
- [x] `LgpdConsentGateScreen` no front — bloqueia a navegação para o app até o aceite, reaproveitando o texto da política (extraído para `constants/lgpdPolicy.ts`, compartilhado com `CadastroScreen`)

Verificado via driver headless (`run-uaimed-front`): login com conta sem consentimento → tela de bloqueio → aceitar → libera o app.

---

### ✅ [SECURITY] Direitos do titular — exportar/excluir meus dados
**Área**: Backend + Frontend | **Esforço**: 5 — resolve o item de Backlog com o mesmo nome (arts. 17-22 da LGPD).

- [x] `GET /users/me/dados` — exporta os dados pessoais do usuário autenticado (nunca inclui senha)
- [x] `DELETE /users/me` — **anonimiza** a conta em vez de excluir fisicamente (agendamentos/pagamentos/avaliações são registros legítimos de terceiros com `onDelete: Cascade` — apagar fisicamente apagaria esse histórico junto); senha trocada por hash aleatório, conta marcada `ativo: false`, login passa a falhar
- [x] Tela de Perfil com as duas opções: "Exportar meus dados" (modal com o JSON) e "Excluir minha conta" (confirmação + anonimização)

---

### ✅ [SECURITY] Política de retenção para o log de auditoria
**Área**: Backend | **Esforço**: 2 — resolve o item de Backlog com o mesmo nome. `AuditoriaService.purgarAntigos(retencaoEmMeses = 6)` + script `npm run logs:purgar` (sem agendador de jobs no backend — chamado por cron externo).

---

## 🟢 CONCLUÍDO — 01/11/2026

---

### ✅ [BUG FIX] Cancelamento de consulta — endpoint inexistente no backend
**Área**: Frontend + Backend | **Prioridade**: 🔴 Crítico | **Esforço**: 2

**Descrição original (encontrado em 13/10/2026)**: `MinhasConsultasScreen.tsx` chama `PATCH /agendamentos/:id/cancelar` ao tocar em "Cancelar", mas `agendamentos.routes.ts` só definia `GET /agendamentos/sugestoes-horario`, `POST /agendamentos` e `GET /agendamentos`. Não existia rota de cancelamento nem método `cancelar()` no `AgendamentosController`. O botão "Cancelar" falhava em runtime (a tela já tinha toda a lógica de UI — confirmação, regra de 24h de antecedência — só faltava o endpoint).

**Resolução**: Implementado `PATCH /agendamentos/:id/cancelar` (protegido por `authMiddleware`), validando dono do agendamento (`403` se for de outro usuário), status já `cancelado`/`realizado` (`409`) e antecedência mínima de 24h também no backend (`422` — antes a regra só existia no cliente e podia ser contornada chamando a API direto). Atualiza `status` para `cancelado` e grava log de auditoria `CANCELAR_AGENDAMENTO`.

**Critério de aceite**:
- [x] `PATCH /agendamentos/:id/cancelar` implementado, protegido por `authMiddleware`, validando que o usuário é o dono do agendamento
- [x] Atualiza `status` do agendamento para `cancelado`
- [x] Teste de integração cobrindo sucesso, 403 (não é o dono) e 404 (agendamento inexistente) — `agendamentos_cancelar.test.ts`, 6 casos

---

### ✅ [BUG FIX] Remarcação de consulta — criava agendamento duplicado em vez de atualizar o original
**Área**: Frontend + Backend | **Prioridade**: 🔴 Crítico | **Esforço**: 3

**Descrição**: Encontrado ao investigar o bug de cancelamento acima. O botão "Remarcar" em `MinhasConsultasScreen.tsx` navegava direto para o fluxo normal de agendamento (`SelecaoHorario` → `SelecaoHorariosDia` → `POST /agendamentos`), sem nenhuma referência ao agendamento original. Resultado: o paciente ficava com **duas consultas** marcadas (a antiga continuava `confirmado`, ocupando o horário) e era levado de novo para a tela de pagamento — cobrança duplicada pela mesma consulta.

**Resolução**: Novo endpoint `PATCH /agendamentos/:id/remarcar` (schema Zod próprio, `remarcarAgendamentoSchema`), validando dono, status, antecedência mínima de 24h a partir do horário **atual** da consulta, novo horário no futuro e conflito de agenda do profissional. Atualiza `dataHora` no mesmo registro (mesmo `id`, mesmo `status`, sem tocar no pagamento já feito) e grava log de auditoria `REMARCAR_AGENDAMENTO` com `dataAnterior`/`dataNova`. No app, `remarcarAgendamentoId` passa a trafegar por `SelecaoHorario`/`SelecaoHorariosDia`; ao confirmar, a tela chama o endpoint de remarcação em vez de criar um agendamento novo e mostra "Consulta remarcada" sem reabrir a tela de pagamento.

**Critério de aceite**:
- [x] `PATCH /agendamentos/:id/remarcar` implementado, protegido por `authMiddleware`, validando dono/status/antecedência/conflito
- [x] Atualiza `dataHora` do agendamento existente (não cria um novo registro)
- [x] Frontend não leva mais para a tela de pagamento ao remarcar
- [x] Teste de integração — `agendamentos_remarcar.test.ts`, 8 casos
- [x] Verificado end-to-end no app rodando (driver headless `run-uaimed-front`): lista continua com o mesmo número de consultas após remarcar, mesmo `id` no banco

---

### ✅ [FEATURE] Status de pagamento visível no agendamento
**Área**: Frontend + Backend | **Prioridade**: 🟠 Alto | **Esforço**: 3

**Descrição original**: o card descrevia a feature para `AgendamentosScreen`, mostrando status (`confirmado`/`cancelado`/`realizado`) mas não se a consulta foi paga.

**Correção de escopo (revisão antes de implementar)**: `AgendamentosScreen.tsx` é código morto — não é importado por nenhum navigator (a aba real usa `AgendamentoStack` → `MinhasConsultasScreen`) e tem um erro de sintaxe JSX real (`<View ...> />` sem fechar). A implementação foi feita em `MinhasConsultasScreen.tsx`, que é a tela que o paciente de fato usa. Também revisado o critério de aceite: `Pagamento.status` tem default `"pendente"` no schema, mas `processar()` sempre criava o registro já `"concluido"` — não existe de fato um terceiro estado "pendente" produzido pelo fluxo real de pagamento, então o badge ficou com 2 estados (`✅ Pago` / `❌ Não pago`) em vez de 3.

**Resolução**:
- `GET /agendamentos` (`listar()`) agora inclui `pagamento: { status, valorFinal, metodo } | null`, `valor` (`profissional.precoConsulta`) e `pixKey`
- `MinhasConsultasScreen.tsx`: badge de pagamento ao lado do status; botão "Pagar agora" (quando não pago e não cancelado) navega para `Pagamento` com os mesmos params que `ConfirmacaoScreen` já usa
- **Bug colateral encontrado e corrigido durante a verificação manual**: o seed usa valores de status `"aprovado"`/`"pendente"` para `Pagamento` (distintos de `"concluido"`, usado pelo fluxo real). Pagar uma consulta cujo agendamento já tinha uma linha `Pagamento` com status `"pendente"` (dado de demonstração) colidia com a constraint única `agendamentoId` e derrubava `POST /pagamentos` com 500. Corrigido trocando `create` por `upsert` em `PagamentosController.processar()`, com guarda explícita (`409`) para não sobrescrever um pagamento já `"concluido"`
- 2 novos casos de teste de integração (`agendamentos_listar_pagamento.test.ts`) + 2 em `pagamentos.test.ts` (completa pagamento pendente via upsert; rejeita novo pagamento sobre um já concluído)

**Critério de aceite**:
- [x] `GET /agendamentos` inclui `pagamento: { status, valorFinal, metodo }` no retorno
- [x] Card do agendamento exibe badge de pagamento (`✅ Pago` / `❌ Não pago` — ver nota de escopo acima sobre o terceiro estado)
- [x] Consultas não pagas exibem botão "Pagar agora" → navega para `Pagamento`
- [x] Verificado end-to-end no app rodando: pagamento via Pix atualiza o badge sem duplicar registro; caso de borda do pagamento `"pendente"` pré-existente também verificado

---

### ✅ [FEATURE] Botão "Avaliar" em consultas concluídas
**Área**: Frontend + Backend | **Prioridade**: 🟠 Alto | **Esforço**: 3

**Descrição original**: card mirava `AgendamentosScreen` (mesmo arquivo morto dos dois itens corrigidos anteriormente); implementado em `MinhasConsultasScreen.tsx`.

**Gap de schema encontrado na revisão (antes de implementar)**: o modelo `Avaliacao` não tinha nenhuma relação com `Agendamento` — só `usuarioId` + `profissionalId`. Isso tornava o critério de aceite "agendamentos já avaliados não exibem o botão" literalmente impossível de cumprir por consulta específica (só daria pra saber "esse paciente já avaliou esse médico alguma vez", não "essa consulta already foi avaliada"). `AvaliacaoScreen.tsx` já recebia `agendamentoId` por parâmetro de navegação (vindo de `PagamentoScreen` após pagar) mas descartava o valor sem nunca enviá-lo à API — sinal de que o campo foi planejado e nunca finalizado.

**Resolução**: migração adicionando `agendamentoId String? @unique` em `Avaliacao` (+ relação reversa `avaliacao Avaliacao?` em `Agendamento`). `POST /avaliacoes` passa a aceitar `agendamentoId` opcional, validando dono (`403`), profissional correspondente (`400`), status `concluido` (`422`) e ausência de avaliação prévia para aquele agendamento (`409`). `GET /agendamentos` retorna `avaliado: boolean`. `MinhasConsultasScreen.tsx` exibe botão "Avaliar" em consultas `concluido` sem avaliação, navegando para `Avaliacao` com `agendamentoId`/`medicoId`.

**Critério de aceite**:
- [x] Card de agendamento com status `concluido` exibe botão "Avaliar"
- [x] Navega para `Avaliacao` com `agendamentoId` e `medicoId`
- [x] Agendamentos já avaliados não exibem o botão (agora por consulta específica, não por médico)
- [x] 7 novos casos de teste (`avaliacoes_agendamento.test.ts`)
- [x] Verificado end-to-end: avaliação criada via API vinculada ao `agendamentoId` certo; botão "Avaliar" some da lista após recarregar

---

### ✅ [FEATURE] `ResultadosScreen` — exibir lista real de médicos da API
**Área**: Frontend + Backend | **Prioridade**: 🟠 Alto | **Esforço**: 5

**Descrição original**: dizia que `ResultadosScreen` não consumia a API real.

**Correção de escopo (revisão antes de implementar)**: a descrição estava desatualizada — `ResultadosScreen.tsx` **já** chamava `GET /medicos` com os filtros reais (`query`/`especialidade`/`cidade`/`estado`), sem dados simulados. O que realmente faltava, comparado ao critério de aceite, era bem menor: o card não exibia avaliação média nem valor da consulta (apesar de `precoConsulta` já vir na resposta da API), a navegação para `DetalhesMedico` não passava `amount`, e `GET /medicos` não tinha paginação nem média de avaliação agregada.

**Resolução**:
- Backend: `GET /medicos` passa a aceitar `skip`/`take` (teto 100) e retorna `notaMedia`/`totalAvaliacoes` por profissional via uma única query agregada (`avaliacao.groupBy`, evita N+1). **Contrato preservado**: a resposta continua um array (não foi envelopada em `{ data, total }`) para não quebrar os 2 consumidores existentes (`ResultadosScreen` e os testes `destaques.test.ts`/`medicos_agendamentos.test.ts`) — o total vai no header `X-Total-Count`
- Frontend: card de `ResultadosScreen` exibe nota média (ou "Sem avaliações") e preço; navegação para `DetalhesMedico` agora inclui `amount`
- **Não implementado**: UI de "carregar mais"/paginação visual no front — com ~10-14 profissionais cadastrados hoje, não há necessidade real, e construir isso exigiria decisões de design (scroll infinito vs. botão vs. páginas) não pedidas explicitamente; o backend já suporta `skip`/`take` para quando for necessário

**Critério de aceite**:
- [x] `GET /medicos?especialidade=xxx&nome=yyy` com paginação (`skip`/`take`, total no header)
- [x] Card do médico exibe nome, especialidade, avaliação média e valor da consulta
- [x] Navegar para `DetalhesMedico` passando `medicoId` e `amount`
- [x] 3 novos casos de teste (`medicos_listar.test.ts`)
- [x] Verificado end-to-end no app rodando: nota média e preço aparecem no card, `DetalhesMedico` carrega corretamente

---

### ✅ [FEATURE] `SearchScreen` — busca real com filtros funcionais
**Área**: Frontend + Backend | **Prioridade**: 🟡 Médio | **Esforço**: 3

**Descrição original**: dizia que `SearchScreen` não tinha integração real com a API.

**Correção de escopo (revisão antes de implementar)**: também desatualizada — `SearchScreen.tsx` já buscava por nome (`query`) e especialidade (dropdown), já tinha filtro de cidade/estado (`LocationModal`) e já navegava para `Resultados` com os parâmetros reais. O único filtro do critério de aceite genuinamente ausente era faixa de preço — implementado agora. **"Plano de saúde aceito" não foi implementado**: não existe nenhum campo relacionado a convênios/planos de saúde no modelo `Profissional` (o único conceito próximo no sistema é o desconto genérico de 15% que o paciente escolhe ativar no pagamento, não uma lista de convênios aceitos por médico) — implementar esse filtro de verdade exige desenhar um modelo de dados novo, não só adicionar um dropdown; movido para o Backlog como item próprio em vez de construir um filtro sem dado real por trás.

**Resolução**: `GET /medicos` aceita `precoMin`/`precoMax`. `SearchScreen` ganhou chips de faixa de preço ("Até R$150", "R$150 a 300", "Acima de R$300"), incluídos em `buildParams()` (usado tanto pela busca quanto pelos chips de especialidade rápida). `ResultadosScreen` repassa os novos parâmetros para a API.

**Critério de aceite**:
- [x] Campo de busca por especialidade ou nome do médico
- [x] Filtro de cidade
- [x] Filtro de faixa de preço
- [ ] Filtro de plano de saúde aceito — **movido para o Backlog**, requer modelo de dados novo
- [x] Ao pesquisar, navega para `Resultados` com os parâmetros
- [x] 1 novo caso de teste (`medicos_listar.test.ts`, filtro de preço)
- [x] Verificado end-to-end no app rodando: filtro "Acima de R$300" corretamente retorna zero resultados no dataset atual

---

### ✅ [FEATURE] `HistoricoAvaliacoesScreen` — consumir API real
**Área**: Frontend + Backend | **Prioridade**: 🟡 Médio | **Esforço**: 3 (revisado para **5** — o gap real era maior que "trocar mock por fetch")

**Descrição original**: dizia que só faltava consumir `GET /avaliacoes/minhas`, que já existia.

**Achado na revisão (antes de implementar) — causa raiz, não só sintoma**: `HistoricoAvaliacoesScreen.tsx` de fato usava 100% dado simulado, mas contra um shape (`types/avaliacao.ts`) que **nunca existiu no backend**: 4 notas por critério (atendimento/pontualidade/clínica/comunicação), voltaria/recomenda e sugestões de melhoria. `AvaliacaoScreen.tsx` — a tela onde o paciente *envia* a avaliação — já coletava tudo isso no formulário, mas `handleSubmit` calculava só a média das 4 notas e mandava apenas `nota` + `comentario` pro backend; o resto era descartado silenciosamente. O modelo `Avaliacao` no Prisma só tinha `nota: Int` + `comentario: String?`. Ou seja: **toda avaliação enviada no app perdia a maior parte do feedback do paciente**, não só a tela de histórico estava com mock.

**Decisão (opção escolhida pelo usuário)**: resolver na raiz — expandir o modelo de dados — em vez de só simplificar a tela de histórico pra mostrar o pouco que já era salvo.

**Resolução**:
- Migração adicionando `notaAtendimento`, `notaPontualidade`, `notaClinica`, `notaComunicacao` (Int opcionais), `voltariaClinica`, `recomendaMedico` (String opcionais, `sim`/`nao`/`talvez`) e `melhorias` (String opcional) em `Avaliacao` — todos nulos para avaliações antigas/seed, que só tinham nota+comentário
- `POST /avaliacoes` valida e persiste os novos campos; `GET /avaliacoes/minhas` passa a retorná-los
- `AvaliacaoScreen.handleSubmit` agora envia o detalhamento completo, não só a média
- `HistoricoAvaliacoesScreen` reescrita com interface local (sem tocar em `types/avaliacao.ts`/`useAvaliacoes.ts`/`CardAvaliacao.tsx`, confirmados código morto — não importados em lugar nenhum) consumindo `GET /avaliacoes/minhas` de verdade; grade de notas por critério e respostas de voltaria/recomenda só aparecem quando o detalhamento existe (avaliações antigas sem detalhe mostram só nota + comentário, sem seção vazia)
- **Achado adicional**: a tela não tinha nenhum ponto de entrada na navegação (estava no stack mas nada chamava `navigate('HistoricoAvaliacoes')`, e o FAB antigo da própria tela navegava pra `Avaliacao` sem nenhum parâmetro, o que sempre falhava). Adicionado atalho "Minhas Avaliações" em `PerfilScreen` → "Meus Registros"

**Critério de aceite**:
- [x] Lista real de avaliações do usuário logado
- [x] Exibe nome do médico, data, nota e comentário
- [x] Estado vazio com mensagem amigável
- [x] Detalhamento completo (4 notas, voltaria, recomenda, sugestões) persistido e exibido, com degradação graciosa para avaliações antigas sem detalhe
- [x] Ponto de entrada na navegação (não existia antes)
- [x] 5 novos casos de teste (3 em `avaliacoes.test.ts` para o detalhamento + ajustes)
- [x] Verificado end-to-end no app rodando: avaliação com detalhamento completo e avaliação antiga (só nota+comentário) lado a lado na mesma lista, renderizando corretamente cada uma

---

## 🟢 CONCLUÍDO — 03/11/2026

---

### ✅ [IMPROVEMENT] `HomeScreen` — consumir dados reais (próxima consulta, médicos em destaque)
**Área**: Frontend | **Prioridade**: 🟡 Médio | **Esforço**: 3

**Descrição original**: a `HomeScreen` exibia `NextAppointmentCard` e `FeaturedProfessionalsCarousel` mas com dados simulados.

**Correção de escopo (revisão antes de implementar)**: metade do card já estava resolvida e não documentada — `FeaturedProfessionalsCarousel.tsx` já consumia `GET /medicos/recomendados` (dado real, curado via flag `Profissional.destaque` administrada em `AdminDestaquesScreen`), não dado simulado. O gap genuíno era só o `NextAppointmentCard`: o componente existia pronto (`components/NextAppointmentCard.tsx`) mas **não era importado em lugar nenhum da `HomeScreen`** — código morto, nunca chegou a ser conectado.

**Resolução**: `HomeScreen.tsx` busca `GET /agendamentos` (mesmo endpoint de `MinhasConsultasScreen`) ao focar a tela, filtra consultas com status `agendado`/`confirmado` e `data` no futuro, ordena pela mais próxima e renderiza `NextAppointmentCard` com o resultado — só para usuários `paciente`. Sem consulta futura, a seção "Próxima consulta" simplesmente não aparece (sem placeholder vazio). Toque no card navega para `MinhasConsultas`.

**Critério de aceite**:
- [x] `NextAppointmentCard` busca próximo agendamento real do paciente
- [x] Carrossel de profissionais em destaque — já usava dado real (`GET /medicos/recomendados`), confirmado na revisão
- [x] Verificado end-to-end no app rodando (driver headless `run-uaimed-front`): paciente com consulta futura confirmada exibe o card com médico/especialidade/data/hora corretos; paciente sem consulta futura não exibe a seção; zero erros de console nos dois cenários

---

### ✅ [IMPROVEMENT] Remoção de `AgendamentosScreen.tsx` (código morto)
**Área**: Frontend | **Prioridade**: 🟢 Baixo | **Esforço**: 1

**Descrição**: `AgendamentosScreen.tsx` não era importado por nenhum navigator (a aba real usa `AgendamentoStack` → `MinhasConsultasScreen`, já registrado neste Kanban desde 01/11/2026) e tinha um erro de sintaxe JSX real (`<View ...> />` sem fechar). Os dois itens de Backlog que miravam esse arquivo ("floatingButton funcional" e "dados reais da API") foram descartados em vez de implementados — consertar uma tela morta não tem valor.

**Resolução**: arquivo deletado (`git rm`). Zero referências restantes no projeto (confirmado por busca textual antes da remoção).

**Achado real na verificação**: o erro de sintaxe desse arquivo estava **abortando `tsc --noEmit` cedo**, escondendo 7 erros de tipo reais em arquivos usados em produção. Registrado como novo item de Backlog ("Corrigir os 7 erros de TypeScript expostos pela remoção de `AgendamentosScreen.tsx`") — não corrigidos agora, fora do escopo desta limpeza.

**Critério de aceite**:
- [x] Arquivo removido
- [x] Nenhuma referência órfã (`grep` confirma)

---

### ✅ [IMPROVEMENT] Código morto residual em `useAvaliacoes.ts`/`CardAvaliacao.tsx`/`types/avaliacao.ts`
**Área**: Frontend | **Prioridade**: 🟢 Baixo | **Esforço**: 1

**Descrição original**: `useAvaliacoes.ts` tinha `loadAvaliacoes` (com `// TODO: Integrar com API real`, sempre retornava array vazio), `calcularEstatisticas`, `avaliacoesMedico` e `criarAvaliacao` sem nenhuma tela chamando; `CardAvaliacao.tsx` sem nenhum import em lugar nenhum; partes de `types/avaliacao.ts` usadas só por esse código morto.

**Resolução**: `useAvaliacoes.ts` reescrito mantendo só a parte real — `carregarMediaAvaliacoes`/`notaMedia`/`totalAvaliacoes`/`loading`/`error` e o `useFocusEffect` que a aciona (é o que `PerfilScreen.tsx` de fato consome). `CardAvaliacao.tsx` removido. `types/avaliacao.ts` removido por completo — depois de tirar o código morto do hook, nenhum arquivo do projeto importava mais nada dele (`Avaliacao`, `EstatisticasAvaliacao`, `RespostaAvaliacao`, `ItemAvaliacao` — todos sem uso real).

**Critério de aceite**:
- [x] Remover `loadAvaliacoes`/`calcularEstatisticas`/`avaliacoesMedico`/`criarAvaliacao` de `useAvaliacoes.ts`, mantendo só a parte real (`carregarMediaAvaliacoes`)
- [x] Remover `CardAvaliacao.tsx`
- [x] Revisar `types/avaliacao.ts` — nada sobrou em uso, arquivo removido por completo
- [x] `npx tsc --noEmit` sem novos erros nos arquivos tocados; suíte manual `tests/avaliacoesPerfil.test.cjs` (6 casos, exercita exatamente a parte mantida do hook) — 69/69 testes do diretório `tests/` passando

---

### ✅ [IMPROVEMENT] Corrigir os 7 erros de TypeScript expostos pela remoção de `AgendamentosScreen.tsx`
**Área**: Frontend | **Prioridade**: 🟡 Médio | **Esforço**: 3

**Descrição original**: ver item "Remoção de `AgendamentosScreen.tsx`" acima — o erro de sintaxe desse arquivo morto abortava `tsc --noEmit` cedo, escondendo 7 erros reais em arquivos de produção.

**Triagem e resolução, um a um** (nenhum era bug de runtime visível — o app sempre rodou certo via Metro/Babel, que não valida tipos; mas todos eram lacunas reais de tipagem):
1. `components/LocalizacaoMedicoCard.tsx` — módulo `./MapaLocalizacao` "não encontrado": falso positivo do `tsc`, que não resolve a convenção de arquivos por plataforma (`MapaLocalizacao.native.tsx`/`MapaLocalizacao.web.tsx`) por padrão. Corrigido com `"moduleSuffixes": [".native", ".ios", ".android", ".web", ""]` no `tsconfig.json` (opção oficial do TS 4.7+ para esse cenário) — conserta a resolução para qualquer import platform-specific do projeto, não só esse arquivo.
2. `navigation/AgendamentoStack.tsx` — `headerBackTitleVisible: false` é API do React Navigation 5/6; o projeto está na v7, onde foi substituída por `headerBackButtonDisplayMode`. Trocado para `headerBackButtonDisplayMode: 'minimal'` (equivalente: esconde o texto, mantém só a seta).
3. `navigation/MainTabNavigation.tsx` — `navigation` possivelmente `undefined` dentro dos callbacks `screenOptions`/`options` do Tab Navigator (quirk de tipagem do React Navigation v7, `navigation` sempre está definido em runtime nesse contexto). Corrigido com optional chaining (`navigation?.navigate(...)`) nos 8 call-sites flagados — comportamento idêntico em runtime, apenas satisfaz o strict mode.
4. `screens/Agendamento/ClinicaPerfilScreen.tsx` — array de `InfoField` perdia o tipo contextual por causa do `.filter()` encadeado direto na declaração (`icon` era inferido como `string` solto, não a união literal esperada). Corrigido extraindo o array para uma variável intermediária com tipo explícito (`(InfoField | null)[]`) antes do `.filter()`.
5. `screens/Agendamento/HistoricoAvaliacoesScreen.tsx` — `SafeAreaView` importado de `react-native` (não suporta a prop `edges`), mesma classe de bug já corrigida em outras telas no Kanban (v1.8.0, `PagamentoScreen`/`AvaliacaoScreen`). Trocado o import para `react-native-safe-area-context`.
6. `screens/Agendamento/MedicoDetalhesScreen.tsx` — `convenios` não existia na interface local `MedicoPerfil`, mas `GET /medicos/:id` já retorna o campo (confirmado no controller) e a tela já o usava (`perfil.convenios`) desde o filtro de convênios (v1.24.0). Tipagem desatualizada, não bug — campo `convenios: string[]` adicionado à interface.
7. `screens/Main/MedicoDashboardScreen.tsx` — `BarChart` exige `yAxisSuffix` (o `LineChart` logo acima no mesmo arquivo já tinha `yAxisSuffix=""`, só o `BarChart` ficou sem). Adicionado `yAxisSuffix=""`.

**Verificação**: `npx tsc --noEmit` limpo (exit code 0, zero erros) pela primeira vez no frontend. Suíte manual `tests/` 69/69. Verificado end-to-end no app rodando contra o backend real: `HistoricoAvaliacoesScreen` (troca de `SafeAreaView`) renderiza normal; header do `AgendamentoStack` (back button) renderiza normal em `MedicoDetalhesScreen`, que também exibe "Convênios: Unimed, Bradesco Saúde, Particular" corretamente; `MedicoDashboardScreen` exibe o gráfico de barras "Receita nos últimos 6 meses" corretamente. Os 7 avisos de console vistos no dashboard (`onStartShouldSetResponder` etc.) são do `react-native-chart-kit` renderizando SVG/gestos no target web — confirmado pré-existentes (idênticos com e sem a correção do `yAxisSuffix`, testado revertendo o arquivo isoladamente), não uma regressão.

**Critério de aceite**:
- [x] Triar os 7 erros: tipagem desatualizada (não quebra em runtime) vs. bug real — nenhum era bug de runtime; todos eram lacunas/desatualizações de tipagem
- [x] Corrigir cada um; `npx tsc --noEmit` termina sem erros em `uaimed-front`
- [x] Adicionar o typecheck do frontend ao CI — feito em item próprio logo abaixo ("Adicionar typecheck do frontend ao CI")

---

### ✅ [DEVOPS] Adicionar typecheck do frontend ao CI
**Área**: DevOps | **Prioridade**: 🟡 Médio | **Esforço**: 1

**Descrição original**: `ci.yml` só rodava `tsc --noEmit` do backend. O frontend nunca teve typecheck automatizado — foi assim que `AgendamentosScreen.tsx` conseguiu existir com um erro de sintaxe sem ninguém notar, e como os 7 erros de tipo reais ficaram escondidos atrás dele por tempo indeterminado (ver itens acima).

**Resolução**: novo job `typecheck-frontend` em `.github/workflows/ci.yml`, paralelo ao `typecheck` do backend (não depende dele — roda mais rápido, sem precisar do Prisma Client). Mesma estrutura do job do backend: `actions/setup-node@v4` (Node 22, cache npm), `npm ci` em `uaimed-front`, `npx tsc --noEmit`.

**Critério de aceite**:
- [x] Novo job no `ci.yml` rodando `npx tsc --noEmit` em `uaimed-front` a cada push/PR
- [x] YAML validado (`python3 -c "import yaml; yaml.safe_load(...)"`) e comando do job confirmado passando localmente (`npx tsc --noEmit` → exit 0)

---

### ✅ [IMPROVEMENT] Testes automatizados — cobertura residual
**Área**: Backend | **Prioridade**: 🟡 Médio | **Esforço**: 2

**Descrição original**: cobertura mínima de 80% ainda não tinha sido medida formalmente (sem `--coverage` configurado).

**Resolução**: instalado `@vitest/coverage-v8@1.6.1` (provider inexistente até então) e executado `npx vitest run --coverage` com o banco de teste real. Resultado: **71.4% statements / 63.26% branch / 82.07% funções / 71.4% lines** em todos os arquivos; **84.51% statements / 86.14% funções** excluindo os 5 arquivos de infraestrutura não testável por desenho (`server.ts`, `src/prisma/seed.ts`, script de purga de logs, `globalSetup.ts` de teste, script de validação manual) — todos 0% por não serem código de negócio exercitado por teste, não por lacuna. `src/routes`, `src/schemas`, `src/middleware` e `src/utils` já estavam acima de 80% mesmo sem a exclusão. Número registrado em [`uaimed-back/documents/TESTES.md`](./uaimed-back/documents/TESTES.md#cobertura-de-código-vitest-run---coverage-provider-v8).

**Achado**: 3 arquivos com cobertura genuinamente baixa, não por ruído de infraestrutura: `geocoding.service.ts` (30.5%), `conta-bancaria.controller.ts` (54.2% statements / 11.1% branch) e `especialidades.controller.ts` (57.1%) — nenhum teste exercita essas funções hoje. Movido para item novo no Backlog em vez de escrever os testes agora, já que o pedido desta sprint era medir, não elevar a cobertura.

**Critério de aceite**:
- [x] Rodar `npx vitest run --coverage` e registrar o número real

---

### ✅ [IMPROVEMENT] Cobertura de testes — fechar os 3 arquivos genuinamente fracos
**Área**: Backend | **Prioridade**: 🟢 Baixo | **Esforço**: 2

**Descrição original**: `geocoding.service.ts` (30.5%), `conta-bancaria.controller.ts` (54.2% statements / 11.1% branch) e `especialidades.controller.ts` (57.1%) não tinham nenhum teste exercitando seu código de verdade (item levantado no card anterior).

**Resolução**:
- `especialidades.controller.ts` → **100% / 100%** — `especialidades.test.ts` (2 casos), endpoint `GET /api/especialidades` não tinha teste nenhum
- `conta-bancaria.controller.ts` → **93.75% / 81.8% branch** — `conta-bancaria.test.ts` ampliado de 3 para 11 casos: `obter()` como médico (dados do `Profissional`), como clínica e como paciente (dados do `Usuario`), `403` de usuário inválido em `atualizar()`, `404` de usuário inexistente em ambos os métodos, e `PUT` como médico (nunca testado antes)
- `geocoding.service.ts` → **100% / 83.33% branch** — `unit/geocoding.unit.test.ts` (6 casos), mockando `fetch` global (`vi.stubGlobal`) para cobrir sucesso, resposta não-ok, sem resultados, coordenadas inválidas e exceção de rede sem depender da API real do Nominatim (OpenStreetMap)

**Achados durante a escrita dos testes**:
- Os blocos `catch`/500 de `conta-bancaria.controller.ts` continuam sem teste — exigiriam mockar o Prisma para forçar erro, padrão que o projeto não usa em nenhum outro controller (não corrigido, só documentado)
- Em `geocoding.service.ts`, a guarda `if (!query.trim()) return null;` era **código morto**: a query sempre inclui o literal `"Brasil"` antes do `filter(Boolean)`, então nunca podia ficar vazia. **Removida em 03/11/2026** — a função passou de 83.33% para 90.9% branch (100% statements/funções, mantidos). O branch restante (90.9%, não 100%) é um artefato de instrumentação do V8 para o bloco `finally` (conclusão abrupta da função), não uma lacuna de teste real.

Suíte: 256 → 272 casos, 29 → 31 arquivos. Cobertura total: 71.4% → 73.36% statements / 82.07% → 85.84% funções (86.83%/90.1% excluindo infraestrutura não testável). Detalhes em [`uaimed-back/documents/TESTES.md`](./uaimed-back/documents/TESTES.md#cobertura-de-código-vitest-run---coverage-provider-v8).

**Critério de aceite**:
- [x] Testes cobrindo os ramos de erro/sucesso não exercitados em `conta-bancaria.controller.ts`
- [x] Testes cobrindo `especialidades.controller.ts`
- [x] Testes cobrindo `geocoding.service.ts` (mock do serviço externo de geocodificação)

---

### ✅ [FEATURE] Confirmação de horário por notificação/e-mail
**Área**: Backend + Frontend | **Prioridade**: 🔴 Crítico | **Esforço**: 5

**Descrição original**: após criar um agendamento (`POST /agendamentos`), o paciente e o médico não recebiam nenhuma confirmação formal — nem push notification, nem e-mail. O app apenas redirecionava para `ConfirmacaoScreen` localmente.

**Decisão de provedor** (com o usuário, antes de codar): Resend, por não exigir configuração de SMTP. Chave gerada pelo usuário em resend.com e adicionada ao `.env` local (`RESEND_API_KEY`); remetente usa o sandbox `onboarding@resend.dev`, que não exige verificação de domínio.

**Resolução**:
- **Backend**: `src/services/email.service.ts` novo — monta um template HTML (com o logo do UaiMED embutido em base64, copiado para `src/assets/logo-email.png`) e envia, via Resend, um e-mail ao paciente ("Consulta confirmada!", com nome do médico/especialidade/data) e outro ao médico ("Nova consulta agendada", com nome e data do paciente). Integrado em `AgendamentosController.criar()` logo após a criação do agendamento (incluindo `usuario: { nome, email }` na consulta do `profissional`, que antes não vinha). **Nunca bloqueia a criação do agendamento**: sem `RESEND_API_KEY` configurada (ex.: ambiente de teste), apenas loga e pula; se o envio falhar, loga o erro e segue — a resposta `201` do `POST /agendamentos` não depende do e-mail.
- **Frontend**: `utils/notificacoesConsulta.ts` novo — `agendarLembreteConsulta()` agenda uma notificação local (`expo-notifications`) para 1h antes da consulta, com `identifier` estável (`consulta-${agendamentoId}`) para permitir cancelar/reagendar; não agenda nada se a consulta já estiver a menos de 1h de distância. Conectado em `SelecaoHorariosDiaScreen.tsx` (ao criar e ao remarcar) e `cancelarLembreteConsulta()` em `MinhasConsultasScreen.tsx` (ao cancelar).
- **Bug real encontrado e corrigido no processo**: `App.tsx` pulava `requestPermissionsAsync()` inteiramente quando rodando no Expo Go, pensando (pelo comentário no próprio código) que a permissão só servia para push remota — mas notificações *locais* (que funcionam normalmente no Expo Go, diferente de push remota) também dependem dessa mesma permissão. Sem a correção, o lembrete de 1h nunca apareceria para quem testa via Expo Go. Permissão agora é sempre solicitada; só o aviso informativo sobre push remota desabilitada continua condicionado a `isExpoGo`.
- 3 novos casos de teste (`unit/email.unit.test.ts`), mockando o módulo `resend`: envio bem-sucedido com dados corretos para os dois destinatários, skip gracioso sem `RESEND_API_KEY`, resiliência a falha de envio (não lança nem bloqueia).

**Verificado end-to-end no app rodando** (driver headless, `uaimed-front/.claude/skills/run-uaimed-front`, contra o backend real via `docker compose up -d` com a chave real do Resend no `.env`): login como paciente (`joao@example.com`) → busca por especialidade → seleção de médico → seleção de data/horário → confirmação → agendamento criado (`POST /agendamentos` retornou 201) → tela `ConfirmacaoScreen` exibida corretamente. **E-mails realmente enviados**, confirmado nos logs do container: `[email] Confirmação enviada para joao@example.com` e `[email] Confirmação enviada para carlos.mendes@uaimed.com`. Zero erros de console durante todo o fluxo.

**Critério de aceite**:
- [x] Backend dispara e-mail de confirmação para o paciente com data, hora e nome do médico
- [x] Backend dispara e-mail para o médico com os dados do novo paciente (optou-se por e-mail em vez de push para o médico — push remota depende de development build, item já listado como Bloqueado neste Kanban)
- [x] Template de e-mail HTML com logo do UaiMED
- [x] Integração com serviço de e-mail (Resend)
- [x] Notificação push local agendada para 1h antes da consulta

---

### ✅ [FEATURE] Confirmação de pagamento — comprovante e e-mail
**Área**: Backend + Frontend | **Prioridade**: 🟠 Alto | **Esforço**: 5

**Descrição original**: após processar o pagamento (`POST /pagamentos`), o paciente não recebia comprovante — a tela de sucesso exibia só um modal com ID e valor, sem persistência ou e-mail.

**Correção de escopo (revisão antes de implementar)**: o 4º critério de aceite ("status do pagamento atualizado no card de agendamento em `AgendamentosScreen`") já estava satisfeito — `AgendamentosScreen.tsx` é código morto; a feature real já foi entregue em `MinhasConsultasScreen.tsx` no card "Status de pagamento visível" (01/11/2026). Também optado por **tela formatada** em vez de PDF para o comprovante (ambas as opções eram válidas no critério de aceite original) — gerar PDF exigiria uma dependência nova (`expo-print` ou similar) sem necessidade real, já que o comprovante por e-mail cobre o caso de guardar/imprimir.

**Resolução**:
- Backend: `enviarEmailComprovantePagamento()` novo em `email.service.ts`, integrado em `PagamentosController.processar()` — e-mail HTML com valor cobrado, desconto(s), valor pago, método e ID do pagamento, dados da consulta (médico/especialidade/data). Mesma política de resiliência das outras integrações: nunca bloqueia o pagamento já processado se o envio falhar.
- Frontend: nova tela `PagamentoSucessoScreen.tsx` (registrada no `AgendamentoStack`, sem botão de voltar — não faz sentido retornar ao formulário de pagamento) substitui o modal antigo. Botão "Compartilhar Comprovante" usa a API nativa `Share` (já usada em outro ponto do mesmo arquivo para a chave Pix), sem dependência nova.
- `usePayments.ts` ampliado para repassar `valorBruto`, `desconto` e `descontoPlano` da resposta do backend (antes descartados, só repassava o valor final).

**Achado real #1 (vazamento de e-mail durante `npm test`)**: ao rodar a suíte localmente com uma `RESEND_API_KEY` real no `.env`, pagamentos e agendamentos criados em teste disparavam e-mails de verdade. Causa: `.env.test` não define `RESEND_API_KEY`; o carregamento em cascata de `env.ts` (dotenv sem `override`) preenche a partir do `.env` real quando a variável está ausente. **Corrigido** com trava explícita `if (ENV.NODE_ENV === "test") return null;` em `getClient()` (`email.service.ts`), com teste de regressão dedicado — garante que nenhum teste envia e-mail real, independente de qual `.env` estiver presente na máquina.

**Achado real #2 (na própria verificação end-to-end)**: pagando com "Plano de saúde" ativo (desconto de 15%), o comprovante mostrava "Valor cobrado R$150,00 → Valor pago R$127,50" sem explicar a diferença — o desconto do plano nunca era exposto na resposta da API nem no e-mail, só o desconto de cupom (que ficava zerado nesse caso). Mesma causa raiz do achado já registrado no card "Filtro de busca por plano de saúde aceito" (Backlog): `planDiscount` é calculado mas não persistido nem retornado. **Corrigido** (sem mudança de schema — cálculo já existia em memória no `processar()`): resposta da API, e-mail e tela agora expõem `descontoPlano` separado do `desconto` de cupom, com linhas distintas ("Desconto de cupom" / "Desconto de plano de saúde"). O gap de persistência (auditoria financeira histórica) continua documentado no Backlog, sem mudança.

6 novos casos de teste em `unit/email.unit.test.ts` (3 → 9): sucesso do comprovante, omissão da linha de cupom quando zero, exibição da linha de plano de saúde, resiliência a falha de envio, e o teste de regressão do vazamento.

**Verificado end-to-end no app rodando** (driver headless, backend real via `docker compose up -d`, chave real do Resend): agendamento criado → pagamento via Pix com "Plano de saúde" ativado → tela de comprovante exibindo "Desconto de plano de saúde: - R$ 22,50" corretamente (R$150,00 → R$127,50) → e-mail real enviado, confirmado nos logs do container. Zero erros de console. **Gotcha encontrado e resolvido no processo**: o Metro (bundler web) não pegou os primeiros edits do frontend nessa sessão — precisou reiniciar com `expo start --web --clear` (comportamento já documentado na skill `run-uaimed-front`).

**Critério de aceite**:
- [x] Backend envia e-mail de comprovante com: valor cobrado, desconto aplicado, método, ID do pagamento e dados da consulta
- [x] Tela `PagamentoScreen` exibe tela de sucesso dedicada (não apenas Alert) com resumo e botão de compartilhar comprovante
- [x] Comprovante gerado como tela formatada (optou-se por essa alternativa a PDF, ambas válidas no critério original)
- [x] Status do pagamento atualizado no card de agendamento — já satisfeito por `MinhasConsultasScreen.tsx` (card "Status de pagamento visível", 01/11/2026)

---

### ✅ [FEATURE] Filtro de busca por plano de saúde aceito (convênio)
**Área**: Backend + Frontend | **Prioridade**: 🟡 Médio | **Esforço**: 5

**Descrição original**: o modelo `Profissional` não tinha nenhum campo relacionado a convênios/planos de saúde aceitos. O único conceito próximo era o desconto genérico de 15% do toggle "Plano de saúde" em `PagamentoScreen`, sem relação com convênios específicos por médico.

**Decisões de design** (estavam em aberto no card, resolvidas antes de implementar):
- **Catálogo fixo** de 9 convênios (`src/constants/convenios.ts`, mesmo padrão de `especialidades.ts`) em vez de texto livre — evita inconsistência de grafia quebrando o filtro exato (ex.: "unimed" vs "Unimed" vs "UNIMED").
- **`Profissional.convenios: String[]`** (array nativo do Postgres via Prisma) em vez de relação N:N com uma entidade `Convenio` — mais simples, migração de uma linha, suficiente pro caso de uso (não há necessidade de metadados por convênio além do nome).
- **Médico se autogerencia**, mesmo padrão já estabelecido para `precoConsulta`/disponibilidade (`GET`/`PUT /professionals/me/convenios`) — não fica restrito a admin.

**Resolução**:
- Backend: `GET /convenios` (catálogo público, mesmo padrão de `GET /especialidades`); `GET`/`PUT /professionals/me/convenios` (médico vê/edita os seus, com dedupe e validação contra o catálogo); `GET /medicos` aceita `?convenio=` (filtro exato via `has` no array); `convenios` incluído na resposta de `listar()` e `detalhe()`.
- Frontend: `ConvenioDropdown.tsx` novo (clone de `EspecialidadeDropdown.tsx`); filtro adicionado em `SearchScreen.tsx`; nova tela `MedicoConveniosScreen.tsx` (checklist multi-seleção) com atalho em `PerfilScreen` ao lado de "Horários de Atendimento"; convênios exibidos no card de `ResultadosScreen` e na tela `MedicoDetalhesScreen` (paciente vê quais convênios o médico aceita, não só filtra por eles).
- Migração `20261103213141_add_convenios_to_profissional`; seed populado com convênios realistas nos médicos fixos e aleatórios (0-3) nos médicos extras via Faker, para o filtro já nascer demonstrável.
- 17 novos casos de teste: `convenios.test.ts` (2), `professionals_convenios.test.ts` (9, cobrindo autenticação/papel/substituição/lista vazia/dedupe/convênio inválido), `medicos_listar.test.ts` ampliado (+2, filtro e campo na resposta).

**Verificado end-to-end no app rodando**: paciente filtrou por "Unimed" em `SearchScreen` e `Resultados` retornou exatamente os 5 médicos com esse convênio no seed, cada card exibindo a lista de convênios aceitos; médico (`carlos.mendes@uaimed.com`) abriu "Convênios Aceitos" em Perfil, viu os 3 convênios do seed já marcados, alternou um convênio e salvou — persistência confirmada no log do backend (`Convênios atualizados: profissional ...`) e recarregando a tela. Zero erros de console.

**Critério de aceite**:
- [x] Modelo de dados para convênios aceitos por profissional
- [x] Médico consegue selecionar/editar seus convênios no perfil
- [x] `GET /medicos` aceita filtro por convênio
- [x] `SearchScreen` exibe o filtro

---

## 🔵 A FAZER — Próxima Sprint

> Nenhum item no momento — ver Backlog para itens de baixa prioridade.

---

## 🗃️ BACKLOG — Identificado / Aguardando Refinamento

> Itens levantados mas sem priorização final para sprint.

---

### 📌 [FEATURE] Notificações push reais (Development Build)
- **Área**: Frontend + DevOps
- **Prioridade**: 🟠 Alto
- **Esforço**: 8
- **Descrição**: `expo-notifications` não suporta push remoto no Expo Go SDK 53+. Para push funcionar é necessário gerar um **development build** com `npx expo run:android`. Requer configuração do Expo Push Service ou Firebase Cloud Messaging (FCM).
- **Dependência**: Geração do APK/build de desenvolvimento

---

### 📌 [FIX] Parâmetros mortos `insuranceProvider`/`insuranceCoveragePercent` em `PagamentosController`
- **Área**: Backend
- **Prioridade**: 🟢 Baixo
- **Esforço**: 2
- **Descrição**: Achado em 03/11/2026 investigando o fluxo de pagamento do toggle "Plano de saúde" (desconto fixo de 15%, sem relação com o filtro de convênios implementado — ver Concluído 03/11/2026). `PagamentosController.processar()` (`uaimed-back/src/controllers/pagamentos.controller.ts`) desestrutura `insuranceProvider` e `insuranceCoveragePercent` do corpo da requisição, mas **nenhum caller real envia esses campos** — `PagamentoScreen.tsx` só envia `usingPlan: boolean`. São parâmetros mortos, provavelmente de uma versão mais detalhada do fluxo de "plano de saúde" (distinto de convênio) que nunca foi finalizada no front. `insuranceCoveragePercent` ainda é lido e usado se enviado (define o % de desconto em vez do padrão de 15%), mas `insuranceProvider` não seria persistido de qualquer forma — o model `Pagamento` não tem campo para isso.
- **Critério de aceite** (a refinar):
  - [ ] Remover `insuranceProvider` do controller (dead param), ou implementar de fato o envio pelo front se fizer sentido guardar qual seguradora cobriu o desconto

---

### 📌 [FEATURE] Sistema de cupons — painel admin para criar/gerenciar cupons
- **Área**: Frontend (Admin) + Backend
- **Prioridade**: 🟢 Baixo
- **Esforço**: 5
- **Descrição**: Backend tem modelo `Cupom` e controller de validação, mas não existe tela admin para criar, listar e desativar cupons.

---

### 📌 [IMPROVEMENT] `ContatoProfissionalScreen` — marginTop no topo
- **Área**: Frontend
- **Prioridade**: 🟢 Baixo
- **Esforço**: 1
- **Descrição**: Conteúdo colado no topo da tela sem `SafeAreaView` ou `marginTop` adequado.
- **Critério de aceite**:
  - [ ] Padding/margin adequado para não colidir com a status bar do dispositivo

---

---

## ⏸️ BLOQUEADO

> Itens que não podem avançar por dependência externa.

---

### 🚧 [FEATURE] Push Notifications remotas no Android
- **Área**: Frontend
- **Prioridade**: 🟠 Alto
- **Bloqueio**: Requer **development build** (`npx expo run:android`) — não funciona no Expo Go SDK 53+
- **Ação necessária**: Configurar ambiente para gerar APK de desenvolvimento

---

### 🚧 [FEATURE] Integração com gateway de pagamento real (Stripe / Pagar.me)
- **Área**: Backend
- **Prioridade**: 🟡 Médio
- **Bloqueio**: Requer conta e chaves de API do gateway; fora do escopo do PFC
- **Ação necessária**: Decisão do time sobre gateway escolhido e configuração das credenciais

---

## 📊 Resumo do Quadro

| Coluna | Quantidade |
|---|---|
| 🟢 Concluído — Sprints Anteriores (até 10/04/2026) | 19 itens |
| 🟢 Concluído — Mai–Out/2026 (consolidado) | 13 itens |
| 🟢 Concluído — 30/10/2026 | 6 itens |
| 🟢 Concluído — 01/11/2026 | 7 itens |
| 🟢 Concluído — 03/11/2026 | 10 itens |
| 🔴 Bug Conhecido | 0 itens |
| 🔵 A Fazer (próxima sprint) | 0 itens |
| 🗃️ Backlog | 4 itens |
| ⏸️ Bloqueado | 2 itens |
| **Total** | **61 itens** |

---

## 🏃 Cadência Ágil Sugerida

```
Sprints Fev–Nov/2026 ──────────────── CONCLUÍDAS (ver seções Concluído acima)

"A Fazer" zerada em 03/11/2026 — todo o escopo funcional planejado para o
PFC está implementado e testado.

Sprint entrega PFC (atual)
  Foco: documentação final e apresentação/defesa. Itens de Backlog restantes
  são polimento/débito técnico de baixa prioridade, não bloqueantes.
```

---

## 🔄 Histórico de Alterações

| Data | Versão | Alteração |
|---|---|---|
| 01/04/2026 | 1.3.0 | Documento criado — sprint de correções e fluxo de agendamento completo |
| 01/04/2026 | 1.4.0 | Logo real na LoginScreen; cards de confirmação de horário, pagamento e status adicionados |
| 06/04/2026 | 1.5.0 | Feature de Filtro de Localização Regional adicionada ao "A Fazer" com critérios de aceite detalhados |
| 06/04/2026 | 1.6.0 | Feature implementada e movida para Concluído — LocationModal, SearchScreen, ResultadosScreen, HomeScreen, FeaturedProfessionalsCarousel e backend atualizados |
| 09/04/2026 | 1.7.0 | SelecaoHorarioScreen reescrita com calendário mensal + grade de horários; backend suporta filtro por `?data=YYYY-MM-DD` |
| 10/04/2026 | 1.8.0 | Telas MinhasConsultas e MeusPagamentos; bug fix campo `data` vs `dataHora`; Boleto bancário; UX HomeScreen e PerfilScreen; fix Maximum update depth; fix expo-notifications Expo Go |
| 13/10/2026 | 1.9.0 | Consolidação de ~6 meses sem atualização (Mai–Out/2026): 13 entregas movidas para Concluído (clínicas, artigos, chat, geolocalização, admin, refresh token, rate limiting, Zod, testes, logging), todas verificadas por inspeção de código. Removidos 7 itens resolvidos do Backlog/A Fazer. **Encontrado e documentado 1 bug crítico**: cancelamento de consulta chama endpoint inexistente no backend (`PATCH /agendamentos/:id/cancelar`). Adicionado item de Proteção LGPD ao Backlog. |
| 30/10/2026 | 1.10.0 | Item "[SECURITY] Proteção LGPD" movido do Backlog para Concluído: consentimento obrigatório no cadastro, log de auditoria de acesso a dados de pacientes (`GET /admin/logs-auditoria`) e relatório de pacientes anonimizado (`GET /admin/relatorios/pacientes`). Removido também do Foco da sprint "E-mail de confirmação... / Proteção LGPD". |
| 30/10/2026 | 1.11.0 | Auditoria também passa a cobrir envio de mensagens (`ENVIAR_MENSAGEM`, nos dois sentidos), fechando o requisito "mensagens trocadas devem permanecer registradas para auditoria". `GET /avaliacoes/minhas` implementado e testado, movido de "A Fazer" para Concluído. **Gaps levantados e documentados como novos itens de Backlog** (não implementados ainda): auditoria não cobre operações críticas de escrita (agendar, pagar, trocar senha, vínculo clínica-médico); 40/40 usuários existentes no banco não têm consentimento LGPD registrado (fluxo só cobre cadastro novo); política de privacidade promete direito de acesso/eliminação de dados sem endpoint correspondente; log de auditoria não tem política de retenção própria. |
| 30/10/2026 | 1.12.0 | Fechados os 4 gaps levantados na v1.11.0: auditoria estendida para 9 operações críticas de escrita (agendar, pagar, vínculo clínica-médico, trocar senha, dados bancários, consentimento, exportar/excluir dados); reconsentimento pós-login para as 40 contas existentes sem consentimento (`precisaConsentimentoLgpd` + `LgpdConsentGateScreen`); direitos do titular via `GET`/`DELETE /users/me` (exportar dados, excluir conta por anonimização) + tela de Perfil; expurgo de retenção do log de auditoria (`npm run logs:purgar`). Verificado com o driver headless `run-uaimed-front` — achado e corrigido no processo um bug real: telas fora do `NavigationContainer` (como o novo gate) quebravam por falta de `<SafeAreaProvider>` no app (nunca existiu; funcionava só dentro do Navigator, que injeta um). |
| 01/11/2026 | 1.13.0 | Corrigido o bug crítico de cancelamento documentado desde 13/10 (`PATCH /agendamentos/:id/cancelar` implementado, com validação de dono/status/antecedência de 24h no backend e não só no app). **Encontrado e corrigido no mesmo processo um segundo bug crítico, não documentado anteriormente**: "Remarcar" criava uma consulta nova sem cancelar a original, duplicando o agendamento e cobrando pagamento de novo — resolvido com `PATCH /agendamentos/:id/remarcar`, que atualiza a `dataHora` do mesmo registro. Ambos cobertos por teste de integração (14 casos novos) e verificados end-to-end no app rodando via driver headless `run-uaimed-front`. Coluna "Bug Conhecido" zerada. **Aproveitado para reconciliar `TESTES.md`**, que estava com a contagem desatualizada desde revisões anteriores (não só pelos 14 casos novos): suíte real auditada via `npm test` em 238/238 (26 arquivos), não os 155/169 citados em versões anteriores deste documento e do `DOCUMENTACAO_PROJETO_UAIMED.md`. |
| 01/11/2026 | 1.14.0 | Implementado "Status de pagamento visível no agendamento", com correção de escopo antes de codar: o card original mirava `AgendamentosScreen.tsx`, que é código morto (não usado por nenhum navigator, com um erro de sintaxe JSX real) — a feature foi implementada em `MinhasConsultasScreen.tsx`, a tela que o app de fato usa. Badge reduzido a 2 estados (Pago/Não pago) em vez dos 3 do card original, porque o fluxo real de pagamento nunca produz o status `"pendente"` do schema. **Bug colateral encontrado na verificação manual**: o seed usa status de pagamento (`"aprovado"`/`"pendente"`) que colidiam com a constraint única `agendamentoId` ao tentar pagar — `POST /pagamentos` derrubava com 500. Corrigido com `upsert` + guarda de `409` para pagamento já concluído. 4 novos casos de teste. |
| 01/11/2026 | 1.15.0 | Implementado botão "Avaliar" em consultas concluídas (mais uma vez corrigindo o card para `MinhasConsultasScreen.tsx`, não `AgendamentosScreen.tsx`). **Gap de schema encontrado na revisão**: `Avaliacao` não tinha relação com `Agendamento`, tornando "agendamentos já avaliados não exibem o botão" impossível de cumprir por consulta específica — só dava pra saber se o paciente já avaliou aquele médico alguma vez. `AvaliacaoScreen.tsx` já recebia `agendamentoId` por navegação mas descartava o valor, sinal de que o campo foi planejado e nunca finalizado. Resolvido com migração `agendamentoId String? @unique` em `Avaliacao`; `POST /avaliacoes` valida dono/profissional/status/duplicidade; `GET /agendamentos` retorna `avaliado: boolean`. 7 novos casos de teste, verificado end-to-end (avaliação some da lista após ser enviada). |
| 01/11/2026 | 1.16.0 | Implementado "ResultadosScreen — exibir lista real de médicos da API", com correção de escopo: a descrição do card estava desatualizada, `ResultadosScreen.tsx` já consumia `GET /medicos` com filtros reais, sem dados simulados. O gap real era menor — faltava nota média/preço no card, `amount` na navegação para `DetalhesMedico`, e paginação/agregação de avaliação no backend. `GET /medicos` passa a aceitar `skip`/`take` e retorna `notaMedia`/`totalAvaliacoes` via `groupBy` (sem N+1), mantendo o contrato de resposta como array (total vai no header `X-Total-Count`, para não quebrar os 2 consumidores existentes). Decisão consciente de não construir UI de "carregar mais" agora — dataset tem ~10-14 profissionais, sem necessidade real hoje. 3 novos casos de teste, verificado end-to-end no app rodando. |
| 01/11/2026 | 1.17.0 | Implementado "SearchScreen — busca real com filtros funcionais", mais uma vez com card desatualizado: a tela já buscava por nome/especialidade/cidade e já navegava para `Resultados` com parâmetros reais. Único gap genuíno era faixa de preço, agora implementado (`precoMin`/`precoMax` em `GET /medicos`, chips de faixa em `SearchScreen`). **Filtro de "plano de saúde aceito" não implementado**: não existe esse conceito no modelo `Profissional` hoje (só um desconto genérico de 15% escolhido pelo paciente no pagamento, sem relação com convênios específicos) — implementar de verdade exige desenhar um modelo de dados novo; movido para item próprio no Backlog em vez de construir um filtro decorativo sem dado real por trás. 1 novo caso de teste, verificado end-to-end. |
| 01/11/2026 | 1.18.0 | Implementado "HistoricoAvaliacoesScreen — consumir API real". Revisão antes de codar achou um problema bem mais fundo que "trocar mock por fetch": a tela foi construída contra um shape de avaliação (4 notas por critério, voltaria, recomenda, sugestões) que **nunca existiu no backend** — `AvaliacaoScreen` já coletava tudo isso no formulário mas `handleSubmit` só enviava a média das notas + comentário, descartando o resto silenciosamente; o modelo `Avaliacao` só tinha `nota`+`comentario`. Ou seja, toda avaliação enviada no app perdia a maior parte do feedback, não só a tela de histórico estava desatualizada. **Decisão do usuário: resolver na raiz.** Migração expandindo `Avaliacao` com os campos de detalhamento (opcionais, nulos para avaliações antigas); `POST /avaliacoes` e `AvaliacaoScreen.handleSubmit` passam a persistir tudo; `HistoricoAvaliacoesScreen` reescrita consumindo dado real, com degradação graciosa pra avaliações antigas sem detalhe. Achado adicional: a tela não tinha ponto de entrada nenhum na navegação — adicionado atalho em `PerfilScreen`. 5 novos casos de teste, verificado end-to-end (avaliação nova com detalhamento completo e avaliação antiga simples, lado a lado, cada uma renderizando certo). |
| 03/11/2026 | 1.19.0 | Medida formalmente a cobertura de código pela primeira vez (`@vitest/coverage-v8` instalado — não havia provider configurado). Resultado: 71.4% statements/lines, 63.26% branch, 82.07% funções em todos os arquivos; 84.51% statements / 86.14% funções excluindo 5 arquivos de infraestrutura não testável por desenho (bootstrap do servidor, seed, script de purga de logs, setup global de teste, script de validação manual). Já supera a meta informal de 80%. **3 arquivos com lacuna real** (não ruído de infraestrutura) movidos para item próprio no Backlog: `geocoding.service.ts` (30.5%), `conta-bancaria.controller.ts` (54.2% statements/11.1% branch), `especialidades.controller.ts` (57.1%). Número completo registrado em `TESTES.md` v1.9.0. |
| 03/11/2026 | 1.20.0 | Fechados os 3 arquivos de cobertura fraca levantados na v1.19.0. `especialidades.controller.ts` → 100%/100% (endpoint não tinha teste nenhum); `conta-bancaria.controller.ts` → 93.75%/81.8% branch (`obter()` nunca tinha sido testado; cobertos médico/clínica/paciente, `403`, `404` e `PUT` como médico); `geocoding.service.ts` → 100%/83.33% branch (mock de `fetch` global via `vi.stubGlobal`, cobrindo sucesso/erro HTTP/sem resultados/coordenadas inválidas/exceção de rede, sem bater na API real do Nominatim). **Achado**: a guarda de query vazia em `geocoding.service.ts` é código morto (a query sempre inclui o literal `"Brasil"`, nunca fica vazia) — documentado, não corrigido. Suíte: 256 → 272 casos, 29 → 31 arquivos; cobertura total 71.4% → 73.36% statements / 82.07% → 85.84% funções. Detalhes em `TESTES.md` v1.10.0. |
| 03/11/2026 | 1.21.0 | Removida a guarda de código morto em `geocoding.service.ts` (levantada na v1.20.0) — branch do arquivo 83.33% → 90.9% (o restante é artefato de instrumentação do `finally`, não lacuna real). **Novo achado**, investigando o fluxo de pagamento com "Plano de saúde": `PagamentosController.processar()` aceita `insuranceProvider`/`insuranceCoveragePercent` no corpo da requisição, mas nenhum caller real (o front só envia `usingPlan: boolean`) os envia — parâmetros mortos no backend. Mesmo que fossem enviados, `insuranceProvider` não seria persistido (sem campo correspondente no model `Pagamento`), e o desconto do plano de saúde é somado em `valorFinal` sem ficar auditável separado do desconto de cupom. Registrado como achado adicional no card "Filtro de busca por plano de saúde aceito" (Backlog), com 2 critérios de aceite novos. |
| 03/11/2026 | 1.22.0 | Implementado "Confirmação de horário por notificação/e-mail" (único item 🔴 Crítico restante em "A Fazer"). Backend: `email.service.ts` novo, integrado via Resend (chave gerada pelo usuário, decisão tomada em conjunto antes de codar) — envia e-mail HTML com logo ao paciente e ao médico na criação do agendamento, sem nunca bloquear a resposta da API se o envio falhar ou a chave não estiver configurada. Frontend: `utils/notificacoesConsulta.ts` novo — agenda notificação local 1h antes da consulta (criar/remarcar) e cancela ao cancelar. **Bug real corrigido no processo**: `App.tsx` pulava a solicitação de permissão de notificação inteira no Expo Go, mas notificações *locais* (diferente de push remota) funcionam normalmente nele — sem a correção, o lembrete de 1h nunca apareceria em quem testa via Expo Go. 3 novos casos de teste (`unit/email.unit.test.ts`). Verificado end-to-end no app rodando via driver headless contra o backend real com a chave do Resend de verdade: agendamento criado, e-mails efetivamente enviados (confirmado nos logs do container), zero erros de console. Suíte: 272 → 275 casos, 31 → 32 arquivos. Detalhes em `TESTES.md` v1.11.0. |
| 03/11/2026 | 1.23.0 | Implementado "Confirmação de pagamento — comprovante e e-mail" (último item em "A Fazer"). Correção de escopo: o critério "status do pagamento no card de agendamento" já estava satisfeito desde 01/11 (`MinhasConsultasScreen.tsx`); optado por tela formatada em vez de PDF (ambas válidas no critério original, PDF exigiria dependência nova sem necessidade real). Backend: `enviarEmailComprovantePagamento()` em `email.service.ts`. Frontend: nova tela `PagamentoSucessoScreen.tsx` com botão de compartilhar (API `Share` nativa, já usada em outro ponto do mesmo arquivo). **2 achados reais**: (1) rodar `npm test` localmente com uma `RESEND_API_KEY` real no `.env` disparava e-mails de verdade durante os testes — `.env.test` não define a variável, e o carregamento em cascata de `env.ts` preenchia a partir do `.env` real; corrigido com trava explícita por `NODE_ENV === 'test'`, com teste de regressão; (2) na própria verificação end-to-end, o desconto de "plano de saúde" não aparecia no comprovante (só o de cupom), deixando valor cobrado/pago sem explicação — corrigido expondo `descontoPlano` separado na API, e-mail e tela. 6 novos casos de teste (`unit/email.unit.test.ts`, 3 → 9). Verificado end-to-end no app rodando (achado adicional: Metro precisou reiniciar com `--clear` para pegar os edits do front, gotcha já documentado na skill `run-uaimed-front`): pagamento com plano de saúde ativo exibiu o desconto corretamente e o e-mail foi enviado de verdade. Suíte: 275 → 281 casos, mesmos 32 arquivos. Detalhes em `TESTES.md` v1.12.0. |
| 03/11/2026 | 1.24.0 | Implementado "Filtro de busca por plano de saúde aceito" (convênio), resolvendo as 3 decisões de design que estavam em aberto: catálogo fixo (`src/constants/convenios.ts`), campo `Profissional.convenios: String[]` (array nativo, sem N:N) e autogestão pelo médico (`GET`/`PUT /professionals/me/convenios`, mesmo padrão de preço/disponibilidade). `GET /medicos?convenio=` filtra; `SearchScreen` ganhou `ConvenioDropdown`; nova tela `MedicoConveniosScreen` (checklist) com atalho em Perfil; convênios exibidos no card de resultado e na tela de detalhes do médico. Migração + seed com convênios realistas. Verificação do estado da feature de avaliações (sem pedido de implementação, já completa) corrigiu um registro anterior deste Kanban: `useAvaliacoes.ts` não é 100% código morto — a parte de `notaMedia` é usada de verdade por `PerfilScreen`; só `loadAvaliacoes`/`calcularEstatisticas`/`avaliacoesMedico`/`criarAvaliacao` são mortos, movidos para item de limpeza no Backlog. 17 novos casos de teste. Verificado end-to-end no app rodando: filtro por "Unimed" retornou os médicos certos; médico alternou e salvou convênios com persistência confirmada. Suíte: 281 → 294 casos, 32 → 34 arquivos. Detalhes em `TESTES.md` v1.13.0. |
| 03/11/2026 | 1.25.0 | Implementado "HomeScreen — consumir dados reais" (último item em "A Fazer", agora zerada). Correção de escopo: metade do card já estava resolvida sem registro — `FeaturedProfessionalsCarousel` já consumia `GET /medicos/recomendados` (dado real, curado por admin via flag `destaque`), não simulado. O gap genuíno era só `NextAppointmentCard`: componente pronto, mas nunca importado pela `HomeScreen` — código morto nunca conectado. Resolvido buscando `GET /agendamentos` ao focar a Home, filtrando a consulta futura mais próxima (`agendado`/`confirmado`) do paciente logado. Verificado end-to-end no app rodando: card aparece com dados corretos para paciente com consulta futura, seção some por completo sem uma. **Quadro sem itens pendentes em "A Fazer"** — restam apenas Backlog (baixa prioridade) e Bloqueado (fora do escopo do PFC). |
| 03/11/2026 | 1.26.0 | Limpeza de 2 itens de Backlog. (1) `AgendamentosScreen.tsx` deletado — código morto confirmado (sem import em nenhum navigator, erro de sintaxe JSX); os 2 itens de Backlog que miravam essa tela foram descartados em vez de implementados. **Achado real**: o erro de sintaxe estava abortando `tsc --noEmit` cedo, escondendo 7 erros de tipo reais em arquivos usados em produção (`LocalizacaoMedicoCard`, `AgendamentoStack`, `MainTabNavigation`, `ClinicaPerfilScreen`, `HistoricoAvaliacoesScreen`, `MedicoDetalhesScreen`, `MedicoDashboardScreen`) — registrado como novo item de Backlog, não corrigido agora. (2) Código morto residual de `useAvaliacoes.ts`/`CardAvaliacao.tsx`/`types/avaliacao.ts` removido: hook mantém só a parte real (`carregarMediaAvaliacoes`/`notaMedia`/`totalAvaliacoes`, consumida por `PerfilScreen`); `CardAvaliacao.tsx` e `types/avaliacao.ts` deletados por completo (sem uso restante após a limpeza do hook). Validado com `tsc --noEmit` (sem novos erros nos arquivos tocados) e suíte manual `tests/` (69/69). Backlog: 7 → 5 itens. |
| 03/11/2026 | 1.27.0 | Corrigidos os 7 erros de TypeScript levantados na v1.26.0. Nenhum era bug de runtime (o Metro/Babel do Expo não valida tipos, então o app sempre rodou certo) — todos eram lacunas ou desatualizações de tipagem: `tsconfig.json` ganhou `moduleSuffixes` (resolve `.native`/`.web` como o Metro já fazia, mas o `tsc` não); `headerBackTitleVisible` (API do React Navigation 5/6) trocado por `headerBackButtonDisplayMode: 'minimal'` (projeto está na v7); 8 call-sites de `navigation.navigate(...)` em `MainTabNavigation.tsx` protegidos com optional chaining (quirk de tipagem do RN v7, sempre definido em runtime); array de `InfoField` em `ClinicaPerfilScreen` recebeu tipo explícito antes do `.filter()` (perdia o tipo contextual); `SafeAreaView` de `HistoricoAvaliacoesScreen` trocado de `react-native` para `react-native-safe-area-context` (mesma classe de bug já corrigida em outras telas na v1.8.0); campo `convenios: string[]` adicionado à interface `MedicoPerfil` (o backend já retornava, a tela já usava, só a interface local estava desatualizada); `yAxisSuffix=""` adicionado ao `BarChart` de `MedicoDashboardScreen` (o `LineChart` do mesmo arquivo já tinha). `npx tsc --noEmit` limpo (exit 0) pela primeira vez no frontend. Verificado end-to-end no app rodando: as 3 telas com mudança de comportamento real (`HistoricoAvaliacoesScreen`, header do `AgendamentoStack`, `MedicoDashboardScreen`) renderizam corretamente; os 7 avisos de console do gráfico de barras são do `react-native-chart-kit` no target web, confirmados pré-existentes (testado revertendo o arquivo isoladamente). Novo item de Backlog aberto: adicionar typecheck do frontend ao CI (hoje só roda no backend — foi assim que isso ficou escondido). Backlog: 5 → 5 itens (1 fechado, 1 novo aberto). |
| 03/11/2026 | 1.28.0 | Implementado "Adicionar typecheck do frontend ao CI" (último achado da v1.26.0/v1.27.0). Novo job `typecheck-frontend` em `.github/workflows/ci.yml`, paralelo ao job de typecheck do backend (não depende dele): `npm ci` + `npx tsc --noEmit` em `uaimed-front`, mesma estrutura do job já existente. Fecha o buraco que permitiu o `AgendamentosScreen.tsx` morto (com erro de sintaxe) e os 7 erros de tipo reais ficarem escondidos sem detecção automatizada. YAML validado e comando confirmado passando localmente. **Contagem total do quadro corrigida nesta versão**: a linha "Total" estava desatualizada (60) desde edições anteriores; recontada item a item via grep — 61 itens reais (55 Concluído + 0 A Fazer + 4 Backlog + 2 Bloqueado). Backlog: 5 → 4 itens. |

---

*Documento gerado e mantido pelo time UaiMED-PFC. Atualizar a cada sprint.*
