export type StatusVinculoClinica = 'pendente' | 'aceito' | 'recusado';

export interface MedicoClinica {
  id: string;
  usuarioId: string;
  nome: string;
  email: string;
  telefone: string;
  avatar: string | null;
  especialidade: string;
  crm: string;
  cidade: string;
  estado: string;
  totalAgendamentos: number;
  totalAvaliacoes: number;
  vinculado?: boolean;
  statusVinculo?: StatusVinculoClinica | null;
}

export interface SolicitacaoVinculoClinica {
  clinicaId: string;
  nome: string;
  cnpj: string | null;
  avatar: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  solicitadoEm: string;
  status: StatusVinculoClinica;
}

export interface MinhaClinicaResponse {
  clinica: {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    cnpj: string | null;
    avatar: string | null;
    endereco: string | null;
    cidade: string | null;
    estado: string | null;
    cep: string | null;
  };
  resumo: {
    totalMedicos: number;
    agendamentosHoje: number;
    totalAgendamentos: number;
  };
  medicos: MedicoClinica[];
}
