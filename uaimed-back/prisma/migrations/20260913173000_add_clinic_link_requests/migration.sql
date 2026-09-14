CREATE TYPE "StatusVinculoClinica" AS ENUM ('pendente', 'aceito', 'recusado');

ALTER TABLE "clinicas_profissionais"
ADD COLUMN "status" "StatusVinculoClinica" NOT NULL DEFAULT 'aceito',
ADD COLUMN "atualizado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "respondido_em" TIMESTAMP(3);

ALTER TABLE "clinicas_profissionais"
ALTER COLUMN "status" SET DEFAULT 'pendente';

CREATE INDEX "clinicas_profissionais_profissionalId_status_idx"
ON "clinicas_profissionais"("profissionalId", "status");
