// 1. Tipagem para a Pilha de Autenticação
export type AuthStackParamList = {
  Login: undefined;
  TipoSelecao: undefined;
  Cadastro: { tipoUsuario?: 'paciente' | 'medico' | 'clinica' };
  RecuperarSenha: undefined;
  EmailEnviado: { email: string };
};

// 2. Tipagem para as Abas Principais (Main Tabs)
import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Agendamentos: NavigatorScreenParams<AgendamentoStackParamList> | undefined;
  MedicoAgenda?: undefined;
  ClinicDashboard?: undefined;
  Perfil: undefined;
};

// 3. Tipagem para a Pilha de Agendamento (Search)
export type AgendamentoStackParamList = {
  Busca: undefined;
  Resultados?: {
    especialidade?: string;
    query?: string;
  };
  DetalhesMedico?: { medicoId: string };
  SelecaoHorario?: { medicoId: string };
  Confirmacao?: { horario?: string; medicoId?: string; agendamentoId?: string };
  Avaliacao?: { agendamentoId: string; medicoId: string };
  HistoricoAvaliacoes?: undefined;
  Pagamento?: { amount?: number; agendamentoId?: string };
  ContatoProfissional?: { medicoId: string };
};

// 4. Tipagem para a Pilha Principal que une tudo
export type RootStackParamList = {
  Auth: AuthStackParamList;
  Main: MainTabParamList;
};

