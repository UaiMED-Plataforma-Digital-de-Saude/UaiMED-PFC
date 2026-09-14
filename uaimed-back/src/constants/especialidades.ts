export const ESPECIALIDADES_MEDICAS = [
  'Cardiologia',
  'Clínica Geral',
  'Dermatologia',
  'Endocrinologia',
  'Gastroenterologia',
  'Geriatria',
  'Ginecologia',
  'Neurologia',
  'Nutrição',
  'Oftalmologia',
  'Oncologia',
  'Ortopedia',
  'Otorrinolaringologia',
  'Pediatria',
  'Pneumologia',
  'Psicologia',
  'Psiquiatria',
  'Reumatologia',
  'Urologia',
] as const;

export type EspecialidadeMedica = typeof ESPECIALIDADES_MEDICAS[number];

export function especialidadeMedicaValida(value: string): value is EspecialidadeMedica {
  return (ESPECIALIDADES_MEDICAS as readonly string[]).includes(value);
}
