-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "consentimentoLgpd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "consentimentoLgpdEm" TIMESTAMP(3),
ADD COLUMN     "consentimentoLgpdVersao" TEXT;

-- CreateTable
CREATE TABLE "logs_auditoria" (
    "id" TEXT NOT NULL,
    "atorId" TEXT,
    "atorNome" TEXT,
    "atorTipo" TEXT,
    "acao" TEXT NOT NULL,
    "recurso" TEXT NOT NULL,
    "recursoId" TEXT,
    "pacienteId" TEXT,
    "pacienteNome" TEXT,
    "detalhes" JSONB,
    "ip" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "logs_auditoria_pacienteId_idx" ON "logs_auditoria"("pacienteId");

-- CreateIndex
CREATE INDEX "logs_auditoria_atorId_idx" ON "logs_auditoria"("atorId");

-- CreateIndex
CREATE INDEX "logs_auditoria_criado_em_idx" ON "logs_auditoria"("criado_em");
