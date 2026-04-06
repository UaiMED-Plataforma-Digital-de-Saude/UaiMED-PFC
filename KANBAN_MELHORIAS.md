# 🗂️ UaiMED — Kanban de Melhorias & TODOs

**Versão**: 1.6.0  
**Data**: 6 de Abril de 2026  
**Metodologia**: Ágil — Kanban contínuo por sprint  
**Responsável**: Time UaiMED-PFC

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

## 🟢 CONCLUÍDO — Sprint Atual (01/04/2026 → 06/04/2026)

> Itens finalizados nesta sessão de desenvolvimento.

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

## 🔵 A FAZER — Próxima Sprint

> Itens refinados e prontos para desenvolvimento.

---

### 🎯 [FEATURE] `MedicoDetalhesScreen` — exibir dados reais do profissional
- **Área**: Frontend + Backend
- **Prioridade**: 🟠 Alto
- **Esforço**: 5
- **Descrição**: A tela exibe apenas `ID: {medicoId}` como placeholder. Deve buscar e exibir nome, especialidade, CRM, endereço, avaliação média, próximos horários disponíveis e foto.
- **Critério de aceite**:
  - [ ] `GET /medicos/:id` retorna dados completos do profissional
  - [ ] Tela exibe foto (avatar), nome, especialidade e avaliação média em estrelas
  - [ ] Botão "Escolher Horário" passa `amount` (valor da consulta) para o próximo step

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

### ✅ [FEATURE] Filtro de Localização Regional (Estado + Município) na busca
- **Área**: Frontend + Backend
- **Prioridade**: 🟠 Alto
- **Esforço**: 3
- **Descrição**: O usuário não conseguia filtrar profissionais por localização geográfica.
- **Resolução**:
  - **Backend**: `MedicosController.listar()` e `recomendados()` agora filtram por `?estado=MG&cidade=Uberlândia` (case-insensitive, `contains`)
  - **Componente**: Criado `LocationModal.tsx` reutilizável — bottom sheet com lista dos 27 estados brasileiros + busca + campo de município
  - **SearchScreen**: Barra de localização abaixo do campo de busca; ao confirmar, `estado` e `cidade` são incluídos nos params de `Resultados`
  - **ResultadosScreen**: Lê `cidade` e `estado` dos params, passa para a API e exibe badge de localização ativa + estado vazio amigável
  - **HomeScreen**: Badge `📍 Cidade, UF` no topo do header (persistido via AsyncStorage); ao confirmar, filtra o `FeaturedProfessionalsCarousel`
  - **FeaturedProfessionalsCarousel**: Agora aceita props opcionais `estado` e `cidade` que são passadas para `GET /medicos/recomendados`
  - **types.ts**: `cidade?: string` e `estado?: string` adicionados a `AgendamentoStackParamList.Resultados`

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
- **Descrição**: Tela usa dados simulados hardcoded. Deve chamar `GET /avaliacoes/minhas` para listar avaliações do paciente autenticado.
- **Critério de aceite**:
  - [ ] Lista real de avaliações do usuário logado
  - [ ] Exibe nome do médico, data, nota e comentário
  - [ ] Estado vazio com mensagem amigável

---

### 🎯 [ENDPOINT] `GET /medicos/:id` — detalhes completos do profissional
- **Área**: Backend
- **Prioridade**: 🟠 Alto
- **Esforço**: 2
- **Descrição**: Endpoint retorna dados básicos mas não inclui `notaMedia`, próximos horários livres e valor da consulta.
- **Critério de aceite**:
  - [ ] Retorna `notaMedia` calculada das avaliações
  - [ ] Retorna próximos 3 horários disponíveis
  - [ ] Retorna valor da consulta (campo a ser adicionado ao modelo `Profissional`)

---

### 🎯 [ENDPOINT] `GET /avaliacoes/minhas` — avaliações do paciente logado
- **Área**: Backend
- **Prioridade**: 🟡 Médio
- **Esforço**: 2
- **Descrição**: Não existe endpoint para listar avaliações feitas pelo paciente autenticado.
- **Critério de aceite**:
  - [ ] Protegido por `authMiddleware`
  - [ ] Retorna avaliações do `usuarioId` do token com dados do profissional incluídos

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

### 📌 [FEATURE] Campo `valor` no modelo `Profissional`
- **Área**: Backend + Banco
- **Prioridade**: 🟠 Alto
- **Esforço**: 3
- **Descrição**: O schema Prisma não possui campo `valor` (preço da consulta) no modelo `Profissional`. O `amount` no fluxo de pagamento está sendo passado como `0` ou hardcoded.
- **Critério de aceite**:
  - [ ] Migration adicionando `valorConsulta Float?` ao modelo `Profissional`
  - [ ] Seed atualizado com valores realistas por especialidade
  - [ ] `GET /medicos/:id` retorna `valorConsulta`

---

### 📌 [FEATURE] Cancelamento de agendamento pelo paciente
- **Área**: Frontend + Backend
- **Prioridade**: 🟡 Médio
- **Esforço**: 5
- **Descrição**: Paciente não consegue cancelar um agendamento pelo app. Deve haver botão "Cancelar" em agendamentos futuros com status `agendado` ou `confirmado`.
- **Critério de aceite**:
  - [ ] `PATCH /agendamentos/:id/cancelar` protegido — só o dono do agendamento pode cancelar
  - [ ] Regra: cancelamento só permitido com mais de 24h de antecedência
  - [ ] Card exibe botão "Cancelar" somente em agendamentos futuros canceláveis

---

### 📌 [FEATURE] Painel do Médico (`MedicoAgendaScreen`) completo
- **Área**: Frontend + Backend
- **Prioridade**: 🟡 Médio
- **Esforço**: 5
- **Descrição**: `MedicoAgendaScreen` consome `GET /professionals/me/summary` que retorna KPIs. Mas os KPIs `totalToday`, `ratingAvg` e `revenueThisMonth` precisam ser calculados corretamente no backend.
- **Critério de aceite**:
  - [ ] `GET /professionals/me/summary` retorna os 3 KPIs corretos
  - [ ] Lista de próximos agendamentos com nome do paciente e horário
  - [ ] Médico consegue marcar agendamento como `concluido`

---

### 📌 [FEATURE] Sistema de cupons — painel admin para criar/gerenciar cupons
- **Área**: Frontend (Admin) + Backend
- **Prioridade**: 🟢 Baixo
- **Esforço**: 5
- **Descrição**: Backend tem modelo `Cupom` e controller de validação, mas não existe tela admin para criar, listar e desativar cupons.

---

### 📌 [IMPROVEMENT] Testes automatizados — cobertura dos novos endpoints
- **Área**: Backend
- **Prioridade**: 🟠 Alto
- **Esforço**: 5
- **Descrição**: `POST /agendamentos` criado nesta sprint não possui teste automatizado. Testes de `auth_notifications`, `contatos` e `medicos_agendamentos` existem mas podem estar desatualizados.
- **Critério de aceite**:
  - [ ] Teste para `POST /agendamentos` (criação, conflito de horário, profissional inexistente)
  - [ ] Teste para `POST /pagamentos` (fluxo completo com cupom)
  - [ ] Cobertura mínima de 80% nas rotas críticas

---

### 📌 [IMPROVEMENT] Validação com Zod nos novos endpoints
- **Área**: Backend
- **Prioridade**: 🟡 Médio
- **Esforço**: 3
- **Descrição**: `POST /agendamentos` e `POST /pagamentos` fazem validação manual de campos. Devem usar schemas Zod como os demais endpoints.

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

### 📌 [SECURITY] Refresh token e expiração de sessão
- **Área**: Backend + Frontend
- **Prioridade**: 🟠 Alto
- **Esforço**: 8
- **Descrição**: O sistema usa JWT mas não implementa refresh token. Quando o token expira, o usuário recebe 401 e é deslogado sem aviso prévio claro.
- **Critério de aceite**:
  - [ ] Endpoint `POST /sessions/refresh` para renovar o token
  - [ ] Interceptor no `uaiMedApi` tenta refresh automático antes de deslogar

---

### 📌 [SECURITY] Rate limiting nos endpoints de autenticação
- **Área**: Backend
- **Prioridade**: 🟠 Alto
- **Esforço**: 2
- **Descrição**: Endpoints `POST /sessions` e `POST /usuarios` não possuem rate limiting, ficando vulneráveis a brute force.
- **Critério de aceite**:
  - [ ] Máximo 10 tentativas por IP por minuto em `/sessions`
  - [ ] Usando `express-rate-limit`

---

### 📌 [DEVOPS] CI/CD — pipeline de testes automáticos no push
- **Área**: DevOps
- **Prioridade**: 🟡 Médio
- **Esforço**: 3
- **Descrição**: `.github/workflows` existe mas pode estar desatualizado após as mudanças de estrutura.
- **Critério de aceite**:
  - [ ] Workflow roda `npm test` no backend a cada PR
  - [ ] Falha de teste bloqueia merge

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
| 🟢 Concluído (esta sessão) | 10 itens |
| 🔵 A Fazer (próxima sprint) | 11 itens |
| 🗃️ Backlog | 12 itens |
| ⏸️ Bloqueado | 2 itens |
| **Total** | **35 itens** |

---

## 🏃 Cadência Ágil Sugerida

```
Sprint 1 (atual) ──────────────────── CONCLUÍDA
Sprint 2 (próxima, ~1 semana)
  Foco: MedicoDetalhesScreen + ResultadosScreen + AgendamentosScreen dados reais

Sprint 3 (~1 semana)
  Foco: Testes automatizados + Validação Zod + Rate limiting

Sprint 4 (~1 semana)
  Foco: Development Build + Notificações + Refresh Token

Sprint 5 (entrega PFC)
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

---

*Documento gerado e mantido pelo time UaiMED-PFC. Atualizar a cada sprint.*

