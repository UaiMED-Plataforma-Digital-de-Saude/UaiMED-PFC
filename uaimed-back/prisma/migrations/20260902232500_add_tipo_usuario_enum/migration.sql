-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('paciente', 'medico', 'clinica', 'admin');

-- AlterTable: convert "tipo" from text to the "TipoUsuario" enum without data loss
ALTER TABLE "usuarios" ALTER COLUMN "tipo" DROP DEFAULT;
ALTER TABLE "usuarios" ALTER COLUMN "tipo" TYPE "TipoUsuario" USING ("tipo"::"TipoUsuario");
ALTER TABLE "usuarios" ALTER COLUMN "tipo" SET DEFAULT 'paciente';
