# UaiMED — Frontend (Mobile)

Aplicativo mobile do UaiMED, construído em React Native (Expo), responsável pelas experiências de paciente, médico, clínica e administração da plataforma. Consome a API REST do [`uaimed-back`](../uaimed-back).

## Stack

- **React Native** 0.81 + **Expo** 54
- **TypeScript** 5.9
- **React Navigation** 7 (stacks + bottom tabs)
- **Axios** para comunicação com a API
- **expo-secure-store** para persistência de JWT + refresh token (Keychain/Keystore nativo; cai para AsyncStorage só no target web, que não tem Keychain/Keystore); **AsyncStorage** para o restante do cache local (perfil, tema, idioma)
- `expo-location` para geolocalização, `expo-image-picker` para upload de avatar/artigos

## Estrutura de Pastas

```
uaimed-front/
├── App.tsx              # Ponto de entrada
├── api/                 # Cliente HTTP (uaiMedApi) e eventos de autenticação
├── config/              # Configuração de ambiente (URL da API por plataforma)
├── context/             # AuthContext
├── hooks/                # useAuth, usePayments, useContatos, useAvaliacoes, useModal
├── navigation/           # Stacks e bottom tabs (Auth, Main, Agendamento, Admin, Conversas)
├── screens/
│   ├── Auth/             # Login, Cadastro, Recuperação de senha, Tipo de usuário
│   ├── Main/              # Home, Agendamentos, Perfil, Ajuda, Artigos, painel do médico e da clínica
│   ├── Agendamento/       # Busca, resultados, horários, confirmação, pagamento, avaliação
│   ├── Admin/             # Home, perfil, artigos e destaques administrativos
│   └── Conversas/         # Lista de conversas e chat
├── components/           # Componentes reutilizáveis
├── styles/               # Design system (cores, tipografia, espaçamento)
├── types/ e utils/
└── documents/             # Documentação de features específicas (ver Índice)
```

## Telas

O app tem **43 telas** distribuídas em 5 stacks:

| Stack | Telas | Exemplos |
|---|---|---|
| Auth | 6 | Login, Cadastro, Recuperação de senha, Confirmar código, Consentimento LGPD, Seleção de tipo de usuário |
| Main | 14 | Home, Perfil, Ajuda, Artigos, Dashboard/Contatos/Disponibilidade/Convênios do médico, Home/Médicos da clínica |
| Agendamento | 14 | Busca, Resultados, Detalhes do médico, Seleção de horário, Confirmação, Pagamento, Avaliação, Minhas Consultas/Pagamentos, Contato com profissional |
| Admin | 7 | Home, Perfil, Artigos, Cadastro de artigo, Destaques, Cupons, Dashboard da clínica |
| Conversas | 2 | Lista de conversas, Detalhes da conversa |

## Como rodar localmente

Pré-requisito: o backend (`uaimed-back`) precisa estar rodando — ver [`../uaimed-back/documents/SETUP.md`](../uaimed-back/documents/SETUP.md).

```bash
npm install
npm start          # inicia o Metro/Expo (equivalente a: npx expo start)
```

No terminal do Expo, escolha a plataforma: `a` (Android), `i` (iOS) ou `w` (Web).

Scripts alternativos: `npm run android` / `npm run dev` (via `start.sh`, carrega `.env.local` se existir e configura `ANDROID_HOME`/`JAVA_HOME`).

### URL da API por ambiente

A URL do backend é resolvida automaticamente por plataforma em [`config/index.ts`](./config/index.ts):

| Ambiente | URL |
|---|---|
| Web (`development`) | `http://localhost:3333/api` |
| Emulador Android | `http://10.0.2.2:3333/api` |
| Simulador iOS | `http://localhost:3333/api` |
| Dispositivo físico | IP da máquina host na rede local (configurar manualmente) |

## Documentação Relacionada

- [`BACKEND_SETUP_COMPLETO.md`](./BACKEND_SETUP_COMPLETO.md) — como rodar o backend para desenvolver o frontend, exemplos de cURL para testar a API manualmente
- [`IMAGES_GUIDE.md`](./IMAGES_GUIDE.md) — onde e como adicionar imagens
- [`documents/CONTACT_GUIDE.md`](./documents/CONTACT_GUIDE.md), [`documents/PAYMENTS_GUIDE.md`](./documents/PAYMENTS_GUIDE.md), [`documents/SISTEMA_AVALIACAO.md`](./documents/SISTEMA_AVALIACAO.md) — guias de features específicas
- [`documents/INDICE_DOCUMENTACAO.md`](./documents/INDICE_DOCUMENTACAO.md) — índice completo da documentação do frontend

## Licença

Projeto proprietário — todos os direitos reservados. Consulte [`../LICENSE`](../LICENSE).
