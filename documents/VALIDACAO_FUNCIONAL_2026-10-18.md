# Validação funcional geral — UaiMED

Data: 18/10/2026. Referência do código: `1878735c`.

## Resultado

O sistema possui fluxos implementados e integrados, mas ainda apresenta lacunas importantes no ciclo de consulta, pagamentos, recuperação de acesso e avaliações. A aprovação da suíte atual não assegura a conclusão desses fluxos: todos os **139 testes em 20 arquivos passaram**, enquanto os cenários adicionais reproduziram falhas de negócio que não estão cobertas por eles.

Foram registrados **20 achados**, com prioridade funcional, sem realizar uma auditoria de vulnerabilidades. Não foram aplicadas correções no código do produto. Foram adicionados este relatório, os resultados dos cenários e um script de diagnóstico reproduzível.

## Método e limites

- Revisão de telas, navegação, contratos HTTP, controllers, schemas, modelos de banco, testes e configuração de CI.
- Backend: `tsc --noEmit` aprovado; `npm test` aprovado, 139/139 testes, 20/20 arquivos, aproximadamente 33 segundos.
- Frontend: `tsc --noEmit` falhou por JSX incompleto em uma tela antiga. Uma segunda análise com a API do TypeScript, excluindo apenas esse arquivo da lista de entrada, encontrou outros 13 diagnósticos. Essa análise não alterou o projeto.
- A exportação web com Expo/Metro foi aprovada: 1.114 módulos empacotados. Isso confirma o empacotamento dos módulos alcançáveis na versão web, mas não substitui a checagem de tipos nem a execução em dispositivo.
- Executados 15 cenários adicionais contra a aplicação Express real, via Supertest e Prisma, exclusivamente no banco local `uaimed_test`. O diagnóstico criou fixtures próprias e as removeu ao terminar.
- O build do backend encontrou uma restrição do sandbox no esbuild. A execução fora do sandbox não foi autorizada; portanto, o build não foi validado. Isso não foi classificado como defeito do produto.
- Não houve validação visual em dispositivo Android/iOS, entrega de e-mails ou transação financeira externa. Os itens de interface abaixo são conclusões por inspeção do código, explicitamente identificadas.
- O diagnóstico registra comportamentos observados; o código de saída zero significa execução concluída, não aprovação funcional dos cenários.

Resultados brutos: [VALIDACAO_FUNCIONAL_2026-10-18_RESULTADOS.json](./VALIDACAO_FUNCIONAL_2026-10-18_RESULTADOS.json).

Script: [validacao-funcional.cjs](../uaimed-back/scripts/validacao-funcional.cjs). Para reproduzir, na pasta `uaimed-back`, com o banco de testes disponível e o schema preparado pela suíte: `node scripts/validacao-funcional.cjs`.

## Achados por prioridade

### F01 — Alta — Múltiplas reservas para o mesmo horário

**Reproduzido.** O envio de oito requisições simultâneas para o mesmo profissional e instante criou oito agendamentos, todos com HTTP 201. A verificação de conflito ocorre antes da criação, em operações separadas, e o modelo não possui restrição que impeça essa corrida.

**Impacto:** o profissional pode receber vários pacientes no mesmo horário mesmo usando a interface normalmente, quando pessoas diferentes reservam simultaneamente.

**Evidência:** `uaimed-back/src/controllers/agendamentos.controller.ts:47` e `:56`; modelo `Agendamento` em `prisma/schema.prisma`. Cenário `reserva_concorrente`.

**Aceite:** sob concorrência, apenas uma reserva pode ser confirmada; as demais devem retornar conflito, com proteção transacional no banco.

### F02 — Alta — Criação aceita passado, fora do expediente e sobreposição

**Reproduzido.** A API aceitou data em 2020, horário às 03h e outra consulta iniciada 15 minutos após uma reserva de 30 minutos. O schema valida apenas se a data pode ser interpretada. O conflito compara instantes exatamente iguais, sem considerar duração nem a disponibilidade configurada.

**Impacto:** a disponibilidade mostrada na seleção não é uma regra garantida no momento de reservar. Além disso, o gerador usa `inicio < fim`, permitindo um último slot que termina depois do expediente quando o intervalo não é múltiplo de 30 minutos, por exemplo, 16h–17h15.

**Evidência:** `src/schemas/agendamento.schema.ts:5`; `src/controllers/agendamentos.controller.ts:47`, `:175` e `:190`. Cenários `data_passada`, `fora_expediente` e `sobreposicao_30_minutos`.

**Aceite:** validar futuro, dia ativo, intervalo completo da consulta e conflitos por intervalo no backend.

### F03 — Alta — Cancelamento indisponível

**Reproduzido.** O botão chama `PATCH /agendamentos/:id/cancelar`, que retorna HTTP 404 com `Rota não encontrada`, inclusive para agendamento existente. Não há rota nem controller de cancelamento.

**Impacto:** o paciente não consegue liberar um horário pela funcionalidade oferecida no aplicativo.

**Evidência:** `uaimed-front/screens/Agendamento/MinhasConsultasScreen.tsx:110`; `uaimed-back/src/routes/agendamentos.routes.ts`. Cenário `cancelamento`.

**Aceite:** cancelar a reserva, aplicar a regra de antecedência também no servidor e definir o tratamento de pagamentos associados.

### F04 — Alta — Remarcar cria uma reserva adicional

**Confirmado por inspeção do fluxo.** `handleRemarcar` navega para a seleção de horário passando o médico, mas não o agendamento original. Ao selecionar o novo horário, a tela executa um novo `POST /agendamentos`. Não há atualização nem cancelamento da reserva anterior.

**Impacto:** permanecem dois horários ocupados e a nova reserva conduz novamente ao pagamento. Os dados de pagamento da reserva original não são reaproveitados.

**Evidência:** `MinhasConsultasScreen.tsx:129` e `:146`; `SelecaoHorariosDiaScreen.tsx:78`.

**Aceite:** identificar a reserva original e transferi-la de maneira atômica, preservando o vínculo com o pagamento e liberando o horário anterior.

### F05 — Alta — Recuperação de senha não funciona

**Reproduzido na API e confirmado na tela.** A tela chama `POST /password-recovery`, mas a API retorna `Rota não encontrada`. A interface interpreta o 404 como e-mail não cadastrado. O botão de reenvio da tela seguinte apenas faz `console.log`, e não existe fluxo de redefinição por token.

**Impacto:** uma pessoa que esquece a senha não consegue recuperar sua conta e recebe uma explicação incorreta.

**Evidência:** `screens/Auth/RecuperarSenhaScreen.tsx:52`; `screens/Auth/EmailEnviadoScreen.tsx:34`; rotas de autenticação do backend. Cenário `recuperacao_senha`.

**Aceite:** concluir solicitação, entrega de instruções, redefinição e reenvio, com mensagens compatíveis com os erros reais.

### F06 — Limitação de escopo — Pagamentos são demonstrativos

**Confirmado por código e resposta da API.** Qualquer método informado é registrado como `concluido` sem confirmação de gateway. O Pix usa CRC fixo `ABCD`, o boleto é simulado e os dados do cartão não são enviados a um processador. O fluxo permite ao usuário declarar o pagamento concluído.

**Impacto:** o registro de pagamento e as receitas exibidas nos painéis não representam liquidação financeira real. Também não há comprovante persistido retornado pela API.

**Evidência:** `uaimed-back/src/controllers/pagamentos.controller.ts:79`; `uaimed-front/screens/Agendamento/PagamentoScreen.tsx:44`; `hooks/usePayments.ts:73`.

**Tratamento:** o Kanban já declara o gateway fora do escopo do PFC. Para uma demonstração, explicitar a simulação de forma consistente. Para operação real, concluir cobrança, confirmação, pendência, falha, conciliação e comprovante antes de contabilizar receita.

### F07 — Alta — Não existe caminho completo para retomar pagamento

**Confirmado por inspeção e contrato reproduzido.** A consulta é criada antes de pagar. Se o paciente volta ao início ou sai da tela, `GET /agendamentos` não retorna pagamento nem preço reservado, e `MinhasConsultas` não oferece “Pagar agora”. O fluxo normal de reserva exige escolher outro horário porque o anterior já está ocupado.

**Impacto:** uma consulta pode permanecer reservada e sem pagamento, sem recuperação clara pelo aplicativo. Não há expiração automática de reserva pendente.

**Evidência:** `src/controllers/agendamentos.controller.ts:98` e `:102`; `screens/Agendamento/ConfirmacaoScreen.tsx`; `screens/Agendamento/MinhasConsultasScreen.tsx`. Cenário `retomar_pagamento`.

**Aceite:** persistir as condições da reserva e permitir retomar o pagamento do mesmo agendamento, exibindo sua situação e a eventual expiração.

### F08 — Alta — Ciclo de status da consulta não está concluído

**Reproduzido e confirmado por inspeção.** Após pagar, o pagamento ficou `concluido`, mas a consulta continuou `agendado`. As telas utilizam `confirmado`, `concluido` e `cancelado`, porém não há endpoints de gestão do status da consulta pelo profissional. A agenda do médico apenas lista os dados. A confirmação visual já anuncia “Agendamento Confirmado”.

**Impacto:** não há operação completa para registrar realização ou ausência; o histórico depende da passagem do tempo, sem refletir o atendimento efetivo. Recursos que dependem de consulta concluída ficam sem origem funcional.

**Evidência:** `src/controllers/agendamentos.controller.ts:62`; `src/controllers/pagamentos.controller.ts:79`; `src/routes/professionals.routes.ts`; `screens/Main/MedicoAgendaScreen.tsx`. Cenário `pagamento_e_consulta`.

**Aceite:** definir os estados e transições de negócio e disponibilizar as operações necessárias ao profissional e ao paciente.

### F09 — Alta — Valor com descontos diverge entre tela e backend

**Reproduzido com o cálculo extraído do fonte real do frontend.** Para R$ 100, plano de 15% e cupom de 10%, a tela calcula **R$ 76,50** e o backend registra **R$ 75,00**. O frontend aplica descontos sucessivos; o backend soma os percentuais sobre o valor bruto.

**Impacto:** o valor apresentado no instrumento de pagamento difere do valor persistido. Há ainda cenário de valor final negativo quando plano e cupom somam mais de 100%, pois não existe validação final nesse controller.

**Evidência:** `hooks/usePayments.ts:103`; `src/controllers/pagamentos.controller.ts:63`, `:73` e `:77`. Cenário `desconto_divergente`.

**Aceite:** usar a mesma regra de precificação e arredondamento, com cotação autoritativa no servidor e valor final válido.

### F10 — Alta — Pagamento aceita cupom que a validação rejeita

**Reproduzido.** Um cupom com limite de um uso e um uso já consumido foi rejeitado em `/cupons/validar` com HTTP 400, mas aceito em `/pagamentos` com HTTP 201 e desconto aplicado.

**Impacto:** a regra comercial do cupom muda entre a prévia e a conclusão. Cupom inválido ou expirado também pode ser ignorado silenciosamente no pagamento em vez de produzir uma decisão explícita ao paciente.

**Evidência:** `src/controllers/pagamentos.controller.ts:12` versus `:62`. Cenário `cupom_esgotado`.

**Aceite:** centralizar validação e consumo do cupom, incluindo limite e concorrência, junto à operação financeira.

### F11 — Alta — Repetir pagamento retorna erro e consome cupom

**Reproduzido.** Repetir o pagamento do mesmo agendamento retornou HTTP 500 por restrição única; mesmo com a falha, os usos do cupom aumentaram de dois para três. O consumo acontece antes da criação do pagamento e fora de transação.

**Impacto:** uma repetição após perda de conexão pode mostrar falha para um pagamento já registrado e ainda consumir usos adicionais de cupom.

**Evidência:** `src/controllers/pagamentos.controller.ts:64` e `:79`. Cenário `repetir_pagamento`.

**Aceite:** tornar a repetição idempotente ou retornar conflito de domínio, sem alterar cupom em tentativa rejeitada.

### F12 — Média — Disponibilidade padrão contraditória

**Reproduzido.** Para um médico sem configuração, a área profissional mostra domingo inativo, mas a seleção do paciente recebe 18 horários no mesmo domingo. Um controller usa segunda a sexta; o outro usa todos os dias.

**Impacto:** o paciente agenda em dias que o médico vê como indisponíveis até que ele salve sua configuração explicitamente.

**Evidência:** `src/controllers/professional.controller.ts:233`; `src/controllers/agendamentos.controller.ts:21`. Cenário `domingo_sem_configuracao`.

**Aceite:** compartilhar o mesmo padrão e persistir ou resolver a configuração de maneira uniforme.

### F13 — Média — Notificações prometidas sem persistência nem envio

**Reproduzido e confirmado por inspeção.** `/users/me/notifications` retorna HTTP 200 e “Preferências salvas”, mas apenas registra um log. O modelo não contém as preferências e a tela reinicia os switches como `true`. A confirmação promete aviso antes da consulta; `App.tsx` configura handler e permissões, mas não agenda lembrete nem registra token para envio remoto.

**Impacto:** o usuário acredita que salvou escolhas e que receberá um lembrete que não foi programado.

**Evidência:** `src/routes/users.routes.ts:78`; `screens/Main/PerfilScreen.tsx:95`; `screens/Agendamento/ConfirmacaoScreen.tsx:66`; `App.tsx`. Cenário `preferencias_notificacao`.

**Aceite:** persistir e reler preferências, implementar os lembretes prometidos e refletir falta de permissão na interface.

### F14 — Média — Avaliação não depende de consulta realizada e pode se repetir

**Reproduzido.** Foram aceitas seis avaliações do mesmo paciente para o mesmo médico sem qualquer consulta com status `concluido`. A tela oferece avaliar imediatamente após pagar; a criação da avaliação não usa `agendamentoId` e o modelo não a vincula à consulta.

**Impacto:** a avaliação não comprova um atendimento e pode alterar a reputação várias vezes para a mesma experiência. Por outro lado, a lista de consultas anteriores não oferece um fluxo completo para avaliar depois.

**Evidência:** `src/controllers/avaliacoes.controller.ts:7`; modelo `Avaliacao`; `PagamentoScreen.tsx:449`; `AvaliacaoScreen.tsx:37`. Cenário `avaliacoes_antes_consulta_e_repetidas`.

**Aceite:** vincular avaliação à consulta realizada, controlar duplicidade e oferecer acesso a partir do histórico real.

### F15 — Média — Formulário de avaliação descarta respostas

**Confirmado por inspeção.** A tela solicita quatro notas, intenção de voltar, recomendação e melhorias, mas envia apenas uma média arredondada e o comentário. Os demais campos não existem no modelo de avaliação.

**Impacto:** respostas coletadas do paciente são perdidas, embora o formulário sugira seu registro. As estatísticas detalhadas previstas nos tipos e no hook não podem ser calculadas com os dados persistidos.

**Evidência:** `screens/Agendamento/AvaliacaoScreen.tsx:106`, `:129` e `:133`; `prisma/schema.prisma`; `hooks/useAvaliacoes.ts:110`.

**Aceite:** persistir todas as respostas usadas pelo produto ou simplificar o formulário para o contrato efetivamente suportado.

### F16 — Média — Histórico de avaliações é simulado e sua nova avaliação fica sem médico

**Confirmado por inspeção.** `HistoricoAvaliacoesScreen` carrega uma lista fixa com atraso artificial. Não há endpoint de avaliações feitas pelo paciente. O botão “+” navega para `Avaliacao` sem profissional, e essa tela impede o envio por falta de ID.

**Impacto:** o histórico não representa a conta autenticada e uma das ações termina em um formulário que não pode ser concluído.

**Evidência:** `screens/Agendamento/HistoricoAvaliacoesScreen.tsx:34`, `:40`, `:95` e `:268`; `AvaliacaoScreen.tsx:122`; `src/routes/avaliacoes.routes.ts`.

**Aceite:** histórico da pessoa autenticada e nova avaliação iniciada a partir de uma consulta elegível.

### F17 — Média — Notas públicas inconsistentes ou fixas

**Reproduzido para médicos; confirmado por inspeção para clínicas.** Com seis avaliações (uma nota 1 e cinco notas 5), o perfil retornou **5,0**, enquanto o endpoint de média retornou **4,3**. O perfil calcula a média somente das cinco avaliações recentes, mas informa o total global. As clínicas retornam `nota: 5.0` de forma fixa.

**Impacto:** a mesma reputação aparece com valores diferentes e uma clínica recebe nota máxima sem avaliações que sustentem o número.

**Evidência:** `src/controllers/medicos.controller.ts:91` e `:98`; `src/controllers/clinicas.controller.ts:76` e `:145`. Cenário `medias_divergentes`.

**Aceite:** calcular média global de modo consistente e usar estado sem avaliação quando não há dados.

### F18 — Média — Solicitação de atendente não é enviada

**Confirmado por inspeção.** A ajuda afirma que um atendente entrará em contato, mas a ação apenas muda estado local e exibe uma resposta fixa. Não cria chamado nem notifica uma equipe. O WhatsApp aponta para `5500000000000`.

**Impacto:** o usuário pode aguardar atendimento que não foi solicitado a nenhum serviço.

**Evidência:** `screens/Main/HelpScreen.tsx:102`, `:278` e `:381`.

**Aceite:** registrar a solicitação e dar protocolo/retorno real, ou apresentar somente canais válidos de contato sem prometer atendimento automático.

### F19 — Alta para manutenção — Frontend não passa na verificação TypeScript

**Reproduzido.** `tsc --noEmit` falha no JSX incompleto de `screens/Main/AgendamentosScreen.tsx:113`–`:180`. Esse arquivo não está importado na navegação atual; portanto, o erro não prova que o aplicativo inteiro deixe de abrir. Ainda assim, impede a verificação global.

Excluindo apenas esse arquivo da entrada do compilador, surgiram 13 diagnósticos adicionais: resolução de `MapaLocalizacao`, opção `headerBackTitleVisible`, tipagem da navegação, filtro de campos da clínica, `SafeAreaView` do histórico e propriedade obrigatória de gráfico. Parte pode ser ajuste de tipos/configuração, sem correspondência obrigatória com falha em runtime.

**Impacto:** não existe uma base de compilação de tipos limpa para validar novas alterações. O CI atual só verifica tipos e testes do backend.

**Evidência:** `uaimed-front/tsconfig.json`; arquivos informados pelo compilador; `.github/workflows/ci.yml`.

**Aceite:** retirar ou concluir a tela antiga, resolver os diagnósticos e incluir validação do frontend no CI.

### F20 — Média — Falha de carregamento aparece como ausência de dados

**Confirmado por inspeção.** Em `MinhasConsultas`, uma falha de rede limpa a lista; em `Resultados`, erro de busca também vira lista vazia. Carrosséis usam o mesmo padrão. Algumas telas não distinguem “sem registros” de “não foi possível consultar”.

**Impacto:** o paciente pode concluir que perdeu consultas ou que não existem profissionais disponíveis durante uma indisponibilidade temporária. As listas de consultas e pagamentos também devem ser verificadas ao voltar do fluxo de criação, pois usam carregamento na montagem e podem manter dados antigos até atualização manual.

**Evidência:** `MinhasConsultasScreen.tsx:62`–`:75`; `ResultadosScreen.tsx:62`–`:68`; `FeaturedClinicsCarousel.tsx:47`–`:54`.

**Aceite:** manter estados distintos de erro, vazio e carregamento; permitir tentar novamente e atualizar os dados ao retornar aos fluxos relevantes.

## Ordem recomendada de correção

1. **Integridade da agenda:** F01–F04 e F12. Garantir reserva única, intervalos válidos, cancelamento e remarcação completos.
2. **Ciclo da consulta e pagamento:** F07–F11. Retomar pagamento, preservar valor contratado, unificar descontos, tratar repetições e implementar transições de status.
3. **Recuperação de conta e comunicação:** F05, F13 e F18. Remover ações que aparentam sucesso sem produzir efeito.
4. **Avaliações reais:** F14–F17. Relacionar consulta, persistir respostas, concluir histórico e uniformizar médias.
5. **Validação contínua e estados de tela:** F19–F20. Incluir os cenários acima na suíte e adicionar checagem do frontend ao CI.
6. **Definir escopo financeiro:** F06. Manter simulação explícita no PFC ou concluir integração antes de operar pagamentos reais.

## Documentação que precisa ser reconciliada

O Kanban é útil como histórico, mas contém itens pendentes já implementados: `ResultadosScreen` consome `/medicos`, os destaques da Home consomem APIs reais, e o chat tem atualização periódica de três segundos. Esses recursos não foram classificados como simulados nesta revisão. O bug de cancelamento e a ausência de gateway, por outro lado, permanecem atuais.

O resumo do README, que descreve os fluxos essenciais como funcionais, deve informar os limites acima. Os 139 testes são uma base positiva, mas vários verificam apenas HTTP e formato da resposta: por exemplo, o teste de notificações aprova uma resposta de sucesso sem verificar persistência.
