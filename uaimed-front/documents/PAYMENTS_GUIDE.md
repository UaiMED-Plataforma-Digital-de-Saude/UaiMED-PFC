UaiMED — Guia de Pagamentos

Resumo rápido

Este guia descreve como o front-end gerencia pagamentos na aplicação UaiMED. Implementamos:

- Tela de pagamento (`PagamentoScreen`) com seleção de método
- Hook `usePayments` para encapsular lógica de processamento e validação de cupons
- Métodos: Pix, Cartão de crédito/débito, Boleto Bancário
- Descontos: plano de saúde (15%), cupom promocional (ex.: UAIMED10 = 10%)
- Cálculo automático do valor final no cliente
- Processamento simulado ou real (via API)

Como funciona (front-end)

1. A tela `PagamentoScreen` aceita um `amount` opcional (ex.: valor do agendamento).
2. O usuário escolhe a forma de pagamento (Pix, Cartão, Boleto Bancário).
3. Se escolher cartão, insere os dados básicos (não são armazenados aqui).
4. Pode aplicar desconto de convênio (toggle) e inserir cupom promocional.
5. Clica "Aplicar" para validar o cupom (usa hook `validarCupom`).
6. O valor final é recalculado automaticamente (usa `calcularValorFinal`).
7. Clica "Pagar" → hook encapsula envio → alert de sucesso/erro → voltar se sucesso.

Integração com API e Hooks

Arquivo do hook: `src/hooks/usePayments.ts`

Funções principais:

```typescript
const {
  processarPagamento, // Envia pagamento (mock ou real)
  validarCupom, // Valida código promocional
  calcularValorFinal, // Calcula valor com descontos
  loading,
  error,
} = usePayments();

// Exemplos de uso:
const novaMedia = await validarCupom("UAIMED10"); // Retorna desconto em %
const totalComDesconto = calcularValorFinal(100, true, 10); // R$ 76.50
const resultado = await processarPagamento({
  method: "card",
  amount: 76.5,
  cardNumber: "...", // Nunca envie isso para backend real sem PCI-DSS!
  cardName: "...",
  expiry: "...",
  cvv: "...",
  usingPlan: true,
  promoCode: "UAIMED10",
});
```

Endpoints esperados (backend)

### 1. Processar pagamento

```
POST /pagamentos
Headers:
  - Authorization: Bearer {token}

Body:
{
  "method": "card",
  "amount": 76.50,
  "cardNumber": "4111111111111111",  // Prefira tokenização!
  "cardName": "João Silva",
  "expiry": "12/25",
  "cvv": "123",
  "usingPlan": true,
  "promoCode": "UAIMED10"
}

Response (sucesso):
{
  "id": "pay-20251111-001",
  "status": "sucesso",
  "amount": 76.50,
  "method": "card",
  "dataCriacao": "2025-11-11T10:30:00Z",
  "receiptUrl": "https://api.uaimed.com/recibos/pay-20251111-001.pdf"
}
```

### 2. Validar cupom

```
POST /cupons/validar
Headers:
  - Authorization: Bearer {token}

Body:
{
  "codigo": "UAIMED10"
}

Response (válido):
{
  "codigo": "UAIMED10",
  "desconto": 10,  // em %
  "valido": true,
  "dataExpiracao": "2025-12-31"
}

Response (inválido):
{
  "valido": false,
  "mensagem": "Cupom expirado ou não existe."
}
```

Descontos e regras

- **Plano de saúde**: Desconto fixo (padrão 15%). Aplicado quando `usingPlan: true`.
- **Cupom promocional**: Validado no backend. Exemplos simulados:
  - `UAIMED10` → 10% off
  - `PRIMEIRACOMPRA` → 20% off
  - Cupons podem ser por data, limite de uso, etc. (configurar no backend).
- **Cálculo final**: `valor_final = baseAmount × (1 - planDiscount) × (1 - promoDiscount)`

Segurança e boas práticas

- **Nunca** envie dados de cartão direto para seu backend sem cumprir PCI-DSS.
- **Prefira tokenização**: Use SDKs de gateways (Stripe, Pagar.me) para gerar tokens e envie apenas o token ao backend.
- **Pix**: Gere a cobrança no backend (retorne BRCode/QR), apresente ao usuário e confirme recebimento via webhook.
- **Boleto Bancário**: Gere o boleto no backend (ou via gateway) e confirme a liquidação via webhook, como no Pix.

Integração com gateway real (recomendações)

1. **Stripe**:

   - Use `@stripe/react-native-stripe-sdk` para tokenização.
   - Genere token no app, envie para backend com pagamento.
   - Backend confirma com Stripe API.

2. **Pagar.me** (local):

   - Similar a Stripe; suporta Pix, Cartão, Boleto.
   - Use SDK deles para gerar transação.

3. **Gerencianet**:
   - Boa opção para Pix + Cartão no Brasil.
   - Integração via webhook para confirmação de Pix.

Fluxo no código

- `src/screens/Agendamento/PagamentoScreen.tsx` — UI + seleção de método
- `src/hooks/usePayments.ts` — lógica de validação, cálculo e envio
- `src/navigation/types.ts` — tipagem da rota `Pagamento`
- `src/navigation/AgendamentoStack.tsx` — registro da tela

Próximos passos sugeridos

- Integrar SDK de gateway (ex.: Stripe) para tokenização de cartões.
- Implementar fluxo de Pix com QR code (backend cria cobrança, app exibe QR, webhook confirma).
- Persistir histórico de pagamentos no perfil (tela de "Meus pagamentos").
- Gerar e armazenar recibos/comprovantes.
- Adicionar suporte a parcelamento (para cartão).
- Implementar reconciliação com webhooks.

Testes simulados

- A tela e o hook funcionam em simulação (sem gateway real).
- Para integrar, basta substituir o delay simulado em `usePayments.ts` por chamadas reais:
  ```typescript
  const response = await uaiMedApi.post<PaymentResponse>("/pagamentos", dados);
  ```
