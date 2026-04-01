import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Carrega .env.test antes de qualquer módulo de teste
    setupFiles: ['./src/tests/setup.env.ts'],
    // Aplica o schema Prisma no banco de teste antes de qualquer suíte
    globalSetup: ['./src/tests/globalSetup.ts'],
    // Somente arquivos .test.ts — os .spec.ts são duplicatas que causam interferência em paralelo
    include: ['src/**/*.test.ts'],
    // Tempo máximo para cada teste (ms)
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
