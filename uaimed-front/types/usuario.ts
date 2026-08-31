/**
 * Papéis de usuário compartilhados por autenticação, cadastro e navegação.
 * Os valores correspondem exatamente ao enum TipoUsuario do Prisma/backend.
 */
export enum TipoUsuario {
  PACIENTE = 'paciente',
  MEDICO = 'medico',
  CLINICA = 'clinica',
  ADMIN = 'admin',
}

export type TipoCadastro =
  | TipoUsuario.PACIENTE
  | TipoUsuario.MEDICO
  | TipoUsuario.CLINICA;
