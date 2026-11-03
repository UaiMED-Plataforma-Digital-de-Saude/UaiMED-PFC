export const CONVENIOS_ACEITOS = [
  'Unimed',
  'Bradesco Saúde',
  'SulAmérica Saúde',
  'Amil',
  'Hapvida',
  'NotreDame Intermédica',
  'Porto Seguro Saúde',
  'Golden Cross',
  'Particular',
] as const;

export type ConvenioAceito = typeof CONVENIOS_ACEITOS[number];

export function convenioValido(value: string): value is ConvenioAceito {
  return (CONVENIOS_ACEITOS as readonly string[]).includes(value);
}
