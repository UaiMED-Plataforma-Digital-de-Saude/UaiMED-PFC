/**
 * globalSetup do Vitest — executado UMA VEZ antes de todos os testes.
 * Aplica o schema Prisma no banco de teste (uaimed_test).
 * Usa `db push` que é idempotente: só cria o que falta, sem apagar dados existentes.
 */
import { execSync } from 'child_process';

const DATABASE_URL = 'postgresql://docker:docker@localhost:5432/uaimed_test';

export async function setup() {
  console.log('\n🔧 [globalSetup] Aplicando schema Prisma no banco de teste...');
  try {
    execSync('npx prisma db push --skip-generate --accept-data-loss', {
      env: {
        ...process.env,
        DATABASE_URL,
        NODE_ENV: 'test',
      },
      // process.cwd() aponta para uaimed-back (onde vitest.config.ts está)
      cwd: process.cwd(),
      stdio: 'pipe',
    });
    console.log('✅ [globalSetup] Banco de teste pronto.\n');
  } catch (err: any) {
    const output = err?.stdout?.toString() || err?.stderr?.toString() || err?.message || String(err);
    console.error('❌ [globalSetup] Falha ao aplicar schema no banco de teste:');
    console.error(output);
    process.exit(1);
  }
}
