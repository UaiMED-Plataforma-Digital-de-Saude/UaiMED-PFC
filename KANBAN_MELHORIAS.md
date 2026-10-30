# 🗂️ UaiMED — Kanban de Melhorias & TODOs

**Versão**: 1.12.0  
**Data**: 30 de Outubro de 2026  
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

## 🔴 BUG CONHECIDO — Encontrado em 13/10/2026

---

### 🔴 [BUG] Cancelamento de consulta — endpoint inexistente no backend
**Área**: Frontend + Backend | **Prioridade**: 🔴 Crítico | **Esforço**: 2

**Descrição**: `MinhasConsultasScreen.tsx` chama `PATCH /agendamentos/:id/cancelar` ao tocar em "Cancelar", mas `agendamentos.routes.ts` só define `GET /agendamentos/sugestoes-horario`, `POST /agendamentos` e `GET /agendamentos`. Não existe rota de cancelamento nem método `cancelar()` no `AgendamentosController`. O botão "Cancelar" falha em runtime (a tela já tem toda a lógica de UI — confirmação, regra de 24h de antecedência — só falta o endpoint).

**Critério de aceite**:
- [ ] `PATCH /agendamentos/:id/cancelar` implementado, protegido por `authMiddleware`, validando que o usuário é o dono do agendamento
- [ ] Atualiza `status` do agendamento para `cancelado`
- [ ] Teste de integração cobrindo sucesso, 403 (não é o dono) e 404 (agendamento inexistente)

---

## 🔵 A FAZER — Próxima Sprint

> Itens refinados e prontos para desenvolvimento.

---

### 🎯 [FEATURE] Confirmação de horário por notificação/e-mail
- **Área**: Backend + Frontend
- **Prioridade**: 🔴 Crítico
- **Esforço**: 5
- **Descrição**: Após criar um agendamento (`POST /agendamentos`), o paciente e o médico não recebem nenhuma confirmação formal — nem push notification, nem e-mail. O app apenas redireciona para `ConfirmacaoScreen` localmente.
- **Critério de aceite**:
  - [ ] Backend dispara e-mail de confirmação para o paciente com data, hora e nome do médico
  - [ ] Backend dispara e-mail ou push para o médico com os dados do novo paciente
  - [ ] Template de e-mail HTML com logo do UaiMED
  - [ ] Integração com serviço de e-mail (ex: Nodemailer + Gmail SMTP ou Resend)
  - [ ] Notificação push local agendada para 1h antes da consulta

---

### 🎯 [FEATURE] Confirmação de pagamento — comprovante e e-mail
- **Área**: Backend + Frontend
- **Prioridade**: 🟠 Alto
- **Esforço**: 5
- **Descrição**: Após processar o pagamento (`POST /pagamentos`), o paciente não recebe comprovante. A tela de sucesso exibe apenas um `Alert.alert` com ID e valor, sem persistência ou e-mail.
- **Critério de aceite**:
  - [ ] Backend envia e-mail de comprovante com: valor cobrado, desconto aplicado, método, ID do pagamento e dados da consulta
  - [ ] Tela `PagamentoScreen` exibe tela de sucesso dedicada (não apenas Alert) com resumo e botão de compartilhar comprovante
  - [ ] Comprovante gerado como PDF ou tela formatada (`receiptUrl`)
  - [ ] Status do pagamento atualizado no card de agendamento em `AgendamentosScreen`

---

### 🎯 [FEATURE] Status de pagamento visível no agendamento
- **Área**: Frontend + Backend
- **Prioridade**: 🟠 Alto
- **Esforço**: 3
- **Descrição**: `AgendamentosScreen` mostra status do agendamento (`confirmado`, `cancelado`, `realizado`) mas não exibe se o pagamento foi efetuado. Paciente não sabe se a consulta está paga ou pendente.
- **Critério de aceite**:
  - [ ] `GET /agendamentos` inclui `pagamento: { status, valorFinal, metodo }` no retorno
  - [ ] Card do agendamento exibe badge de pagamento: `✅ Pago`, `⏳ Pendente` ou `❌ Não pago`
  - [ ] Consultas não pagas exibem botão "Pagar agora" → navega para `Pagamento`

---

### 🎯 [FEATURE] `AgendamentosScreen` — botão "Avaliar" em consultas concluídas
- **Área**: Frontend
- **Prioridade**: 🟠 Alto
- **Esforço**: 3
- **Descrição**: Lista de agendamentos anteriores não possui botão de avaliação. Paciente só pode avaliar logo após agendar (fluxo direto), não consegue avaliar depois.
- **Critério de aceite**:
  - [ ] Card de agendamento com status `concluido` exibe botão "Avaliar"
  - [ ] Navega para `Avaliacao` com `agendamentoId` e `medicoId`
  - [ ] Agendamentos já avaliados não exibem o botão

---

### 🎯 [FEATURE] `ResultadosScreen` — exibir lista real de médicos da API
- **Área**: Frontend + Backend
- **Prioridade**: 🟠 Alto
- **Esforço**: 5
- **Descrição**: Tela de resultados de busca não consome a API real. Deve chamar `GET /medicos` com filtros de especialidade e nome.
- **Critério de aceite**:
  - [ ] `GET /medicos?especialidade=xxx&nome=yyy` com paginação
  - [ ] Card do médico exibe nome, especialidade, avaliação média e valor da consulta
  - [ ] Navegar para `DetalhesMedico` passando `medicoId` e `amount`

---

### 🎯 [FEATURE] `SearchScreen` — busca real com filtros funcionais
- **Área**: Frontend
- **Prioridade**: 🟡 Médio
- **Esforço**: 3
- **Descrição**: `SearchScreen` é a entrada do fluxo de agendamento mas não possui integração real com a API.
- **Critério de aceite**:
  - [ ] Campo de busca por especialidade ou nome do médico
  - [ ] Filtros: cidade, plano de saúde aceito, faixa de preço
  - [ ] Ao pesquisar, navega para `Resultados` com os parâmetros

---

### 🎯 [FEATURE] `HistoricoAvaliacoesScreen` — consumir API real
- **Área**: Frontend
- **Prioridade**: 🟡 Médio
- **Esforço**: 3
- **Descrição**: Tela usa dados simulados hardcoded. Deve chamar `GET /avaliacoes/minhas` para listar avaliações do paciente autenticado. **O endpoint já existe** (ver Concluído — 30/10/2026) — falta só o consumo no front.
- **Critério de aceite**:
  - [ ] Lista real de avaliações do usuário logado
  - [ ] Exibe nome do médico, data, nota e comentário
  - [ ] Estado vazio com mensagem amigável

---

### 🎯 [IMPROVEMENT] `HomeScreen` — consumir dados reais (próxima consulta, médicos em destaque)
- **Área**: Frontend
- **Prioridade**: 🟡 Médio
- **Esforço**: 3
- **Descrição**: A `HomeScreen` exibe `NextAppointmentCard` e `FeaturedProfessionalsCarousel` mas com dados simulados.
- **Critério de aceite**:
  - [ ] `NextAppointmentCard` busca próximo agendamento real do paciente
  - [ ] Carrossel busca profissionais com maior nota média via `GET /medicos?destaque=true`

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

### 📌 [FEATURE] Sistema de cupons — painel admin para criar/gerenciar cupons
- **Área**: Frontend (Admin) + Backend
- **Prioridade**: 🟢 Baixo
- **Esforço**: 5
- **Descrição**: Backend tem modelo `Cupom` e controller de validação, mas não existe tela admin para criar, listar e desativar cupons.

---

### 📌 [IMPROVEMENT] Testes automatizados — cobertura residual
- **Área**: Backend
- **Prioridade**: 🟡 Médio
- **Esforço**: 2
- **Descrição**: `POST /agendamentos` e `POST /pagamentos` já têm teste (7 e 10 casos, respectivamente — ver `TESTES.md`). O que falta: cobertura mínima de 80% ainda não foi medida formalmente (sem `--coverage` configurado).
- **Critério de aceite**:
  - [ ] Rodar `npx vitest run --coverage` e registrar o número real

---

### 📌 [IMPROVEMENT] `ContatoProfissionalScreen` — marginTop no topo
- **Área**: Frontend
- **Prioridade**: 🟢 Baixo
- **Esforço**: 1
- **Descrição**: Conteúdo colado no topo da tela sem `SafeAreaView` ou `marginTop` adequado.
- **Critério de aceite**:
  - [ ] Padding/margin adequado para não colidir com a status bar do dispositivo

---

### 📌 [IMPROVEMENT] `AgendamentosScreen` — floatingButton funcional
- **Área**: Frontend
- **Prioridade**: 🟡 Médio
- **Esforço**: 1
- **Descrição**: Botão flutuante "+" chama `console.log` em vez de navegar para o fluxo de busca.
- **Critério de aceite**:
  - [ ] `navigation.navigate('Agendamentos', { screen: 'Busca' })` ao pressionar o botão

---

### 📌 [IMPROVEMENT] `AgendamentosScreen` — dados reais da API
- **Área**: Frontend
- **Prioridade**: 🟠 Alto
- **Esforço**: 3
- **Descrição**: `AgendamentosScreen` tenta `GET /agendamentos` mas em caso de falha cai em dados simulados hardcoded. A exibição também não mostra o status corretamente (tipo `realizado` não existe no banco — é `concluido`).
- **Critério de aceite**:
  - [ ] Sem fallback para dados simulados em produção
  - [ ] Status mapeado corretamente: `agendado`, `confirmado`, `concluido`, `cancelado`

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
| 🔴 Bug Conhecido | 1 item |
| 🔵 A Fazer (próxima sprint) | 8 itens |
| 🗃️ Backlog | 6 itens |
| ⏸️ Bloqueado | 2 itens |
| **Total** | **55 itens** |

---

## 🏃 Cadência Ágil Sugerida

```
Sprints Fev–Out/2026 ──────────────── CONCLUÍDAS (ver seções Concluído acima)

Sprint atual (próxima, ~1 semana)
  Foco: 🔴 corrigir bug de cancelamento (endpoint ausente) — prioridade máxima,
        é uma regressão em funcionalidade que a tela já expõe ao usuário

Sprint seguinte (~1 semana)
  Foco: ResultadosScreen + SearchScreen busca real, HistoricoAvaliacoesScreen
        (consumir GET /avaliacoes/minhas, já pronto no backend), Status de
        pagamento visível

Sprint seguinte (~1 semana)
  Foco: E-mail de confirmação de agendamento/pagamento

Sprint entrega PFC
  Foco: Polimento visual, documentação final, apresentação
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

---

*Documento gerado e mantido pelo time UaiMED-PFC. Atualizar a cada sprint.*
