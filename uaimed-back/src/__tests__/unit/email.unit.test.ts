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

  it('nunca envia quando NODE_ENV é "test", mesmo com RESEND_API_KEY configurada (regressão: vazamento de e-mail real durante `npm test`)', async () => {
    const sendMock = vi.fn().mockResolvedValue({ data: { id: 'email-id' } });
    vi.doMock('resend', () => ({ Resend: vi.fn().mockImplementation(() => ({ emails: { send: sendMock } })) }));
    vi.doMock('../../config/env', () => ({ default: { RESEND_API_KEY: 're_chave_real_simulada', NODE_ENV: 'test' } }));

    const { enviarEmailConfirmacaoAgendamento } = await import('../../services/email.service');
    await enviarEmailConfirmacaoAgendamento(dados);

    expect(sendMock).not.toHaveBeenCalled();
  });
});

describe('email.service — enviarEmailComprovantePagamento', () => {
  const dados = {
    paciente: { nome: 'Paciente Teste', email: 'paciente@example.com' },
    pagamentoId: 'pag-123',
    valor: 200,
    desconto: 30,
    descontoPlano: 0,
    valorFinal: 170,
    metodo: 'pix',
    medico: { nome: 'Dra. Teste', especialidade: 'Cardiologia' },
    dataHora: new Date('2026-12-01T14:00:00'),
  };

  afterEach(() => {
    vi.doUnmock('resend');
    vi.doUnmock('../../config/env');
    vi.resetModules();
  });

  it('não envia nada e não lança quando RESEND_API_KEY não está configurada', async () => {
    vi.doMock('../../config/env', () => ({ default: { RESEND_API_KEY: undefined } }));
    const { enviarEmailComprovantePagamento } = await import('../../services/email.service');

    await expect(enviarEmailComprovantePagamento(dados)).resolves.toBeUndefined();
  });

  it('envia e-mail ao paciente com valor, desconto, método e ID do pagamento', async () => {
    const sendMock = vi.fn().mockResolvedValue({ data: { id: 'email-id' } });
    vi.doMock('resend', () => ({ Resend: vi.fn().mockImplementation(() => ({ emails: { send: sendMock } })) }));
    vi.doMock('../../config/env', () => ({ default: { RESEND_API_KEY: 're_fake_key' } }));

    const { enviarEmailComprovantePagamento } = await import('../../services/email.service');
    await enviarEmailComprovantePagamento(dados);

    expect(sendMock).toHaveBeenCalledTimes(1);
    const payload = sendMock.mock.calls[0][0];

    expect(payload.to).toBe('paciente@example.com');
    expect(payload.html).toContain('Dra. Teste');
    expect(payload.html).toContain('Pix');
    expect(payload.html).toContain('pag-123');
    expect(payload.html).toContain('R$ 200,00');
    expect(payload.html).toContain('R$ 30,00');
    expect(payload.html).toContain('R$ 170,00');
  });

  it('omite a linha de desconto de cupom quando desconto é zero', async () => {
    const sendMock = vi.fn().mockResolvedValue({ data: { id: 'email-id' } });
    vi.doMock('resend', () => ({ Resend: vi.fn().mockImplementation(() => ({ emails: { send: sendMock } })) }));
    vi.doMock('../../config/env', () => ({ default: { RESEND_API_KEY: 're_fake_key' } }));

    const { enviarEmailComprovantePagamento } = await import('../../services/email.service');
    await enviarEmailComprovantePagamento({ ...dados, desconto: 0 });

    const payload = sendMock.mock.calls[0][0];
    expect(payload.html).not.toContain('Desconto de cupom');
  });

  it('inclui a linha de desconto de plano de saúde quando descontoPlano > 0 (regressão: valor cobrado x valor pago sem explicação)', async () => {
    const sendMock = vi.fn().mockResolvedValue({ data: { id: 'email-id' } });
    vi.doMock('resend', () => ({ Resend: vi.fn().mockImplementation(() => ({ emails: { send: sendMock } })) }));
    vi.doMock('../../config/env', () => ({ default: { RESEND_API_KEY: 're_fake_key' } }));

    const { enviarEmailComprovantePagamento } = await import('../../services/email.service');
    await enviarEmailComprovantePagamento({ ...dados, desconto: 0, descontoPlano: 22.5, valorFinal: 127.5 });

    const payload = sendMock.mock.calls[0][0];
    expect(payload.html).toContain('Desconto de plano de saúde');
    expect(payload.html).toContain('22,50'); // formatarMoeda usa NBSP entre "R$" e o valor
    expect(payload.html).not.toContain('Desconto de cupom');
  });

  it('não lança mesmo se o envio falhar', async () => {
    const sendMock = vi.fn().mockRejectedValue(new Error('falha de rede simulada'));
    vi.doMock('resend', () => ({ Resend: vi.fn().mockImplementation(() => ({ emails: { send: sendMock } })) }));
    vi.doMock('../../config/env', () => ({ default: { RESEND_API_KEY: 're_fake_key' } }));

    const { enviarEmailComprovantePagamento } = await import('../../services/email.service');

    await expect(enviarEmailComprovantePagamento(dados)).resolves.toBeUndefined();
  });
});
