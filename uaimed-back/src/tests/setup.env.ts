/**
 * Setup executado ANTES de todos os testes pelo Vitest.
 * Carrega as variáveis de ambiente do .env.test,
 * sobrescrevendo quaisquer valores já definidos no processo.
 */
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env.test"),
  override: true, // garante que .env.test prevalece sobre qualquer .env já carregado
});

