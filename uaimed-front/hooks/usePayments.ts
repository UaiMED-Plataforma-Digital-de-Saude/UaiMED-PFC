import { useState } from 'react';
import uaiMedApi from '../api/uaiMedApi';

/**
 * Métodos de pagamento suportados
 */
export type PaymentMethod = 'pix' | 'card' | 'boleto';

/**
 * Interface para dados de pagamento
 */
export interface PaymentData {
  method: PaymentMethod;
  amount: number;
  cardNumber?: string;
  cardName?: string;
  expiry?: string;
  cvv?: string;
  usingPlan?: boolean;
  promoCode?: string;
  agendamentoId?: string;
}

/**
 * Interface de resposta de pagamento
 */
export interface PaymentResponse {
  id: string;
  status: 'sucesso' | 'pendente' | 'falha';
  amount: number;
  method: PaymentMethod;
  dataCriacao: string;
  receiptUrl?: string;
}

/**
 * Hook para gerenciar pagamentos
 */
export const usePayments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Valida dados de cupom promocional contra o backend
   * Retorna o desconto em % se válido
   */
  const validarCupom = async (codigoPromo: string): Promise<number> => {
    try {
      const res = await uaiMedApi.post('/cupons/validar', { codigo: codigoPromo });
      // backend returns desconto field
      return res.data?.desconto ?? 0;
    } catch (err) {
      console.error('Erro ao validar cupom:', err);
      return 0;
    }
  };

  /**
   * Processa pagamento
   * Em produção, integrar com gateway (Stripe, Pagar.me, etc.)
   */
  const processarPagamento = async (dados: PaymentData): Promise<PaymentResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      // Validações básicas
      if (dados.method === 'card' && (!dados.cardNumber || !dados.cardName || !dados.expiry || !dados.cvv)) {
        throw new Error('Dados do cartão incompletos.');
      }

      // Simula envio ao backend/gateway
      const response = await uaiMedApi.post('/pagamentos', {
        agendamentoId: (dados as any).agendamentoId,
        valor: dados.amount,
        metodo: dados.method,
        cupom: dados.promoCode,
        usingPlan: dados.usingPlan ?? false,
      });

      // backend returns created payment info
      return {
        id: response.data.id,
        status: response.data.status === 'concluido' ? 'sucesso' : response.data.status,
        amount: response.data.valorFinal ?? response.data.valor,
        method: dados.method,
        dataCriacao: response.data.dataProcessamento || new Date().toISOString(),
        receiptUrl: response.data.receiptUrl,
      } as PaymentResponse;
    } catch (err: any) {
      const message = err.message || err.response?.data?.message || 'Erro ao processar pagamento.';
      setError(message);
      console.error('Erro em usePayments.processarPagamento:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calcula o valor final após descontos
   */
  const calcularValorFinal = (baseAmount: number, planDiscount: boolean = false, promoDiscount: number = 0): number => {
    let total = baseAmount;

    // Desconto de plano (15%)
    if (planDiscount) {
      total *= 0.85;
    }

    // Desconto de cupom
    if (promoDiscount > 0) {
      total *= (1 - promoDiscount / 100);
    }

    return +total.toFixed(2);
  };

  return {
    loading,
    error,
    processarPagamento,
    validarCupom,
    calcularValorFinal,
  };
};
