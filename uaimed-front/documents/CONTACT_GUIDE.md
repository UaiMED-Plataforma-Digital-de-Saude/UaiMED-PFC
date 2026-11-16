UaiMED — Guia de Contatos

Resumo rápido

Este guia descreve como o front-end gerencia mensagens de contato entre pacientes e profissionais/clínicas na aplicação UaiMED. Implementamos um sistema leve de contato com:

- Formulário simples (assunto + mensagem)
- Validação de campos obrigatórios
- Envio real via API (`POST /contatos`)
- Encapsulamento em hook `useContatos` para facilitar integração

Como funciona (front-end)

1. A tela `ContatoProfissionalScreen` é acessível via navegação com parâmetro `{ medicoId: string }`.
2. O usuário preenche assunto e mensagem (ambos obrigatórios).
3. O hook `useContatos` encapsula a chamada `enviarContato(dados)`, que mapeia `medicoId` (nome usado no front) para `profissionalId` (nome esperado pelo backend) antes de enviar.
4. A mensagem é enviada à API real e um alert de confirmação é exibido.
5. Após sucesso, a tela volta à anterior.

Integração com API

Arquivo do hook: `hooks/useContatos.ts`

Função principal:

```typescript
const { enviarContato, loading, error } = useContatos();
await enviarContato({
  medicoId: "med-001",
  assunto: "Dúvida",
  mensagem: "...",
});
```

Endpoint esperado (backend)

```
POST /contatos
Headers:
  - Authorization: Bearer {token}

Body:
{
  "profissionalId": "med-001",
  "assunto": "Dúvida sobre preparo",
  "mensagem": "Qual é o preparo recomendado?"
}

Response (sucesso):
{
  "id": "contato-123",
  "usuarioId": "user-456",
  "profissionalId": "med-001",
  "assunto": "Dúvida sobre preparo",
  "mensagem": "Qual é o preparo recomendado?",
  "status": "nao_lido",
  "criado_em": "2026-11-11T10:30:00Z"
}
```

Casos de uso

1. Paciente clica em "Contato" no carrossel de profissionais em destaque.
2. Abre-se `ContatoProfissionalScreen` com o `medicoId` pré-preenchido.
3. Paciente digita assunto e mensagem.
4. Paciente clica "Enviar Mensagem".
5. Hook valida, envia (via `uaiMedApi.post('/contatos', dados)`).
6. Sucesso → alert + navegação de volta.
7. Erro → alert com mensagem de erro; user pode tentar novamente.

Fluxo no código

- `screens/Agendamento/ContatoProfissionalScreen.tsx` — UI + validação
- `hooks/useContatos.ts` — lógica de envio encapsulada (mapeia `medicoId` → `profissionalId`)
- `components/FeaturedProfessionalsCarousel.tsx` — botão "Contato" que navega com `medicoId`

Próximos passos sugeridos

- Implementar notificações/push para o profissional quando mensagem chegar.
- Adicionar histórico de contatos no perfil do paciente.
- Implementar "respostas" (chat bidirecional simples).
- Adicionar suporte a anexos (imagens, documentos).
- Persistir mensagens em banco de dados no backend.

Integração real

- A tela e o hook já estão integrados com a API real (`POST /contatos`), sem simulação.
- Cobertura de teste: `uaimed-back/src/__tests__/contatos.test.ts` (backend).
