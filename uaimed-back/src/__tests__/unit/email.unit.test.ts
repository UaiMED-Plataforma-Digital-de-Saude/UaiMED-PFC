import { describe, it, expect, vi, afterEach } from 'vitest';

describe('email.service — enviarEmailConfirmacaoAgendamento', () => {
  const dados = {
    paciente: { nome: 'Paciente Teste', email: 'paciente@example.com' },
    medico: { nome: 'Dra. Teste', email: 'medico@example.com', especialidade: 'Cardiologia' },
    dataHora: new Date('2026-12-01T14:00:00'),
  };

  afterEach(() => {
    vi.doUnmock('resend');
    vi.doUnmock('../../config/env');
    vi.resetModules();
  });

  it('não envia nada e não lança quando RESEND_API_KEY não está configurada', async () => {
    vi.doMock('../../config/env', () => ({ default: { RESEND_API_KEY: undefined } }));
    const { enviarEmailConfirmacaoAgendamento } = await import('../../services/email.service');

    await expect(enviarEmailConfirmacaoAgendamento(dados)).resolves.toBeUndefined();
  });

  it('envia e-mail ao paciente e ao médico com os dados corretos quando a chave está configurada', async () => {
    const sendMock = vi.fn().mockResolvedValue({ data: { id: 'email-id' } });
    vi.doMock('resend', () => ({ Resend: vi.fn().mockImplementation(() => ({ emails: { send: sendMock } })) }));
    vi.doMock('../../config/env', () => ({ default: { RESEND_API_KEY: 're_fake_key' } }));

    const { enviarEmailConfirmacaoAgendamento } = await import('../../services/email.service');
    await enviarEmailConfirmacaoAgendamento(dados);

    expect(sendMock).toHaveBeenCalledTimes(2);
    const [paraPaciente, paraMedico] = sendMock.mock.calls.map((chamada) => chamada[0]);

    expect(paraPaciente.to).toBe('paciente@example.com');
    expect(paraPaciente.from).toContain('onboarding@resend.dev');
    expect(paraPaciente.html).toContain('Dra. Teste');
    expect(paraPaciente.html).toContain('Cardiologia');

    expect(paraMedico.to).toBe('medico@example.com');
    expect(paraMedico.html).toContain('Paciente Teste');
  });

  it('não lança mesmo se o envio falhar (nem paciente nem médico)', async () => {
    const sendMock = vi.fn().mockRejectedValue(new Error('falha de rede simulada'));
    vi.doMock('resend', () => ({ Resend: vi.fn().mockImplementation(() => ({ emails: { send: sendMock } })) }));
    vi.doMock('../../config/env', () => ({ default: { RESEND_API_KEY: 're_fake_key' } }));

    const { enviarEmailConfirmacaoAgendamento } = await import('../../services/email.service');

    await expect(enviarEmailConfirmacaoAgendamento(dados)).resolves.toBeUndefined();
    expect(sendMock).toHaveBeenCalledTimes(2);
  });
});
