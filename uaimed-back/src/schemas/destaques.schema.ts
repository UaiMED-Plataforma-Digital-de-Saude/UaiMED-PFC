import { z } from 'zod';

const ids = z.array(z.string().uuid()).refine(values => new Set(values).size === values.length, {
  message: 'A seleção não pode conter IDs duplicados',
});

export const destaquesSchema = z.object({
  profissionalIds: ids,
  clinicaIds: ids,
}).strict();

export type DestaquesInput = z.infer<typeof destaquesSchema>;
