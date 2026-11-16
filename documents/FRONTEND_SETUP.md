# Frontend — Setup e Documentação (Expo + React Native)

Requisitos

- Node.js >= 18
- npm ou yarn
- Expo CLI (opcional)

Instalação

1. Abra o terminal na pasta `uaimed-front`.
2. Instale dependências:

```bash
cd uaimed-front
npm install
# ou
# yarn
```

3. Configure `app.json` e variáveis se necessário. O arquivo `api/uaiMedApi.ts` já aponta para o backend (ex.: `http://10.0.2.2:3333/api` para emulador Android). Ajuste a `baseURL` se necessário.

Rodando a aplicação

- Com Expo:

```bash
npm run start
# ou
expo start
```

- Para testar no emulador Android local, use o IP especial `10.0.2.2` apontando para o backend em `3333`.

Importante: integração com backend

- O cadastro de profissionais agora é disparado a partir de `CadastroScreen`. O fluxo de seleção de tipo (`TipoSelecaoScreen`) passa `tipoUsuario` para `Cadastro` para pré-selecionar e esconder o seletor de tipo quando for profissional.
- `uaiMedApi` (Axios) possui interceptors para anexar `Authorization: Bearer <token>` quando o usuário está logado.

Arquitetura UI

- `screens/` contém pastas de domínio: `Auth`, `Agendamento`, `Main`, `Admin`.
- `navigation/` contém stacks e tabs. `MainTabNavigation` monta tabs diferentes dependendo do `tipo` do usuário.

Recomendações

- Teste integração com backend local (docker compose up -d no backend)
- Habilite logs de requisições Axios para debug quando necessário
