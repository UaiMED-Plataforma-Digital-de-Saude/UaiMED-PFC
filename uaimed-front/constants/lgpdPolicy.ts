// Texto compartilhado entre o modal de cadastro (CadastroScreen) e a tela de
// reconsentimento pós-login (LgpdConsentGateScreen) — mantém os dois lugares
// sincronizados com uma única fonte de verdade.
export const LGPD_POLICY_VERSION = '1.0';

export const LGPD_POLICY_TEXT = `A UaiMED coleta e trata seus dados pessoais (nome, CPF/CNPJ, e-mail, telefone e, quando aplicável, dados relacionados aos seus agendamentos e consultas) com as seguintes finalidades: viabilizar o seu cadastro, o agendamento de consultas, a comunicação entre pacientes e profissionais de saúde, e a geração de relatórios de gestão para clínicas parceiras.

O tratamento desses dados tem como base o seu consentimento (art. 7º, I, da Lei nº 13.709/2018 — LGPD) e, quando aplicável, o cumprimento de obrigações legais e regulatórias.

Seus dados de saúde e de contato só são acessados por profissionais e clínicas diretamente vinculados ao seu atendimento. Todo acesso de um profissional ou clínica aos seus dados é registrado em um log de auditoria interno.

Relatórios e exportações de dados agregados, usados para gestão das clínicas, são anonimizados: CPF, telefone e e-mail são mascarados, exibindo apenas os últimos dígitos necessários para conferência.

Você pode, a qualquer momento, solicitar a confirmação da existência de tratamento, acesso, correção, anonimização, portabilidade ou eliminação dos seus dados, conforme os arts. 17 a 22 da LGPD. A tela de Perfil já tem opções para exportar ou excluir seus dados diretamente pelo app.

Ao marcar a opção de aceite, você declara estar de acordo com esta política (versão ${LGPD_POLICY_VERSION}).`;
