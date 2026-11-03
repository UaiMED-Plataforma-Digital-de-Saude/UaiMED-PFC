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

  const resultados = await Promise.allSettled([
    client.emails.send(emailPaciente),
    client.emails.send(emailMedico),
  ]);

  resultados.forEach((resultado, index) => {
    const destino = index === 0 ? paciente.email : medico.email;
    if (resultado.status === "rejected") {
      logger.error(`[email] Falha ao enviar confirmação para ${destino}`, resultado.reason);
    } else {
      logger.success(`[email] Confirmação enviada para ${destino}`);
    }
  });
}

export default { enviarEmailConfirmacaoAgendamento };
