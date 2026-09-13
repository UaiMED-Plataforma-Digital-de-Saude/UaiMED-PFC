-- Clínicas utilizam CNPJ; CPF permanece obrigatório apenas pela regra de negócio
-- para pacientes e médicos.
ALTER TABLE "usuarios" ALTER COLUMN "cpf" DROP NOT NULL;
ALTER TABLE "usuarios" ADD COLUMN "cnpj" TEXT;
ALTER TABLE "usuarios" ADD COLUMN "endereco" TEXT;
ALTER TABLE "usuarios" ADD COLUMN "cep" TEXT;

CREATE UNIQUE INDEX "usuarios_cnpj_key" ON "usuarios"("cnpj");

-- Relação muitos-para-muitos: um médico pode atuar em várias clínicas e uma
-- clínica pode possuir vários médicos vinculados.
CREATE TABLE "clinicas_profissionais" (
    "clinicaId" TEXT NOT NULL,
    "profissionalId" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinicas_profissionais_pkey" PRIMARY KEY ("clinicaId", "profissionalId")
);

CREATE INDEX "clinicas_profissionais_profissionalId_idx"
ON "clinicas_profissionais"("profissionalId");

ALTER TABLE "clinicas_profissionais"
ADD CONSTRAINT "clinicas_profissionais_clinicaId_fkey"
FOREIGN KEY ("clinicaId") REFERENCES "usuarios"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "clinicas_profissionais"
ADD CONSTRAINT "clinicas_profissionais_profissionalId_fkey"
FOREIGN KEY ("profissionalId") REFERENCES "profissionais"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
