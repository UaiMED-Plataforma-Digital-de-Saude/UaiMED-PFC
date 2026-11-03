import fs from "fs";
import path from "path";
import { Resend } from "resend";
import ENV from "../config/env";
import logger from "../utils/logger";

const LOGO_PATH = path.join(__dirname, "../assets/logo-email.png");
const LOGO_BASE64 = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH).toString("base64") : null;

const REMETENTE = "UaiMED <onboarding@resend.dev>";

let resendClient: Resend | null = null;
function getClient(): Resend | null {
  // Trava explícita por ambiente: .env.test não define RESEND_API_KEY, mas o
  // carregamento em cascata de env.ts (dotenv sem override) preenche a partir
  // do .env real se a variável não estiver setada — sem essa trava, rodar os
  // testes localmente com uma chave real configurada dispara e-mails de verdade.
  if (ENV.NODE_ENV === "test") return null;
  if (!ENV.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(ENV.RESEND_API_KEY);
  return resendClient;
}

function formatarDataHora(dataHora: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dataHora);
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const METODO_LABEL: Record<string, string> = {
  pix: "Pix",
  card: "Cartão de crédito",
  boleto: "Boleto bancário",
};

async function enviarUm(client: Resend, payload: { from: string; to: string; subject: string; html: string }, destino: string): Promise<void> {
  try {
    await client.emails.send(payload);
    logger.success(`[email] Enviado para ${destino}`);
  } catch (err) {
    logger.error(`[email] Falha ao enviar para ${destino}`, err);
  }
}

function templateBase(titulo: string, corpo: string): string {
  const logoImg = LOGO_BASE64
    ? `<img src="data:image/png;base64,${LOGO_BASE64}" alt="UaiMED" width="64" height="64" style="display:block;margin:0 auto 16px;border-radius:12px;" />`
    : "";
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background:#f4f6f5;">
      <div style="background:#ffffff; border-radius:12px; padding:32px; box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        ${logoImg}
        <h2 style="color:#1B5E20; text-align:center; margin:0 0 8px;">${titulo}</h2>
        ${corpo}
        <p style="color:#9e9e9e; font-size:12px; text-align:center; margin-top:32px;">
          UaiMED — plataforma de agendamento de consultas médicas.
        </p>
      </div>
    </div>
  `;
}

interface DadosConfirmacao {
  paciente: { nome: string; email: string };
  medico: { nome: string; email: string; especialidade: string };
  dataHora: Date;
}

/**
 * Envia e-mails de confirmação de agendamento ao paciente e ao médico.
 * Nunca lança: sem RESEND_API_KEY configurada (ex.: ambiente de teste), apenas
 * loga e retorna — e-mail é um efeito colateral da criação do agendamento,
 * não deve bloquear ou falhar a resposta da API por conta dele.
 */
export async function enviarEmailConfirmacaoAgendamento({ paciente, medico, dataHora }: DadosConfirmacao): Promise<void> {
  const client = getClient();
  if (!client) {
    logger.info(`[email] RESEND_API_KEY não configurada — pulando envio de confirmação (agendamento ${paciente.email} / ${medico.email})`);
    return;
  }

  const dataFormatada = formatarDataHora(dataHora);

  const emailPaciente = {
    from: REMETENTE,
    to: paciente.email,
    subject: "Consulta confirmada — UaiMED",
    html: templateBase(
      "Consulta confirmada!",
      `
        <p style="color:#333; font-size:15px;">Olá, ${paciente.nome}!</p>
        <p style="color:#333; font-size:15px;">Sua consulta foi agendada com sucesso:</p>
        <ul style="color:#333; font-size:15px; padding-left:20px;">
          <li><strong>Médico(a):</strong> ${medico.nome}</li>
          <li><strong>Especialidade:</strong> ${medico.especialidade}</li>
          <li><strong>Data e hora:</strong> ${dataFormatada}</li>
        </ul>
        <p style="color:#333; font-size:15px;">Você pode acompanhar, remarcar ou cancelar essa consulta na aba "Minhas Consultas" do app.</p>
      `
    ),
  };

  const emailMedico = {
    from: REMETENTE,
    to: medico.email,
    subject: "Nova consulta agendada — UaiMED",
    html: templateBase(
      "Nova consulta agendada",
      `
        <p style="color:#333; font-size:15px;">Olá, ${medico.nome}!</p>
        <p style="color:#333; font-size:15px;">Um paciente agendou uma consulta com você:</p>
        <ul style="color:#333; font-size:15px; padding-left:20px;">
          <li><strong>Paciente:</strong> ${paciente.nome}</li>
          <li><strong>Data e hora:</strong> ${dataFormatada}</li>
        </ul>
      `
    ),
  };

  await Promise.all([
    enviarUm(client, emailPaciente, paciente.email),
    enviarUm(client, emailMedico, medico.email),
  ]);
}

interface DadosComprovante {
  paciente: { nome: string; email: string };
  pagamentoId: string;
  valor: number;
  desconto: number;
  descontoPlano: number;
  valorFinal: number;
  metodo: string;
  medico: { nome: string; especialidade: string };
  dataHora: Date;
}

/**
 * Envia e-mail de comprovante ao paciente após um pagamento processado.
 * Mesma política de resiliência de enviarEmailConfirmacaoAgendamento: nunca lança.
 */
export async function enviarEmailComprovantePagamento({ paciente, pagamentoId, valor, desconto, descontoPlano, valorFinal, metodo, medico, dataHora }: DadosComprovante): Promise<void> {
  const client = getClient();
  if (!client) {
    logger.info(`[email] RESEND_API_KEY não configurada — pulando envio de comprovante (pagamento ${pagamentoId})`);
    return;
  }

  const email = {
    from: REMETENTE,
    to: paciente.email,
    subject: "Comprovante de pagamento — UaiMED",
    html: templateBase(
      "Pagamento confirmado!",
      `
        <p style="color:#333; font-size:15px;">Olá, ${paciente.nome}!</p>
        <p style="color:#333; font-size:15px;">Recebemos o pagamento da sua consulta com ${medico.nome} (${medico.especialidade}), em ${formatarDataHora(dataHora)}:</p>
        <ul style="color:#333; font-size:15px; padding-left:20px;">
          <li><strong>Valor cobrado:</strong> ${formatarMoeda(valor)}</li>
          ${desconto > 0 ? `<li><strong>Desconto de cupom:</strong> ${formatarMoeda(desconto)}</li>` : ""}
          ${descontoPlano > 0 ? `<li><strong>Desconto de plano de saúde:</strong> ${formatarMoeda(descontoPlano)}</li>` : ""}
          <li><strong>Valor pago:</strong> ${formatarMoeda(valorFinal)}</li>
          <li><strong>Método:</strong> ${METODO_LABEL[metodo] ?? metodo}</li>
          <li><strong>ID do pagamento:</strong> ${pagamentoId}</li>
        </ul>
        <p style="color:#333; font-size:15px;">Guarde este e-mail como comprovante. Você também pode consultar seus pagamentos a qualquer momento na aba "Meus Pagamentos" do app.</p>
      `
    ),
  };

  await enviarUm(client, email, paciente.email);
}

export default { enviarEmailConfirmacaoAgendamento, enviarEmailComprovantePagamento };
