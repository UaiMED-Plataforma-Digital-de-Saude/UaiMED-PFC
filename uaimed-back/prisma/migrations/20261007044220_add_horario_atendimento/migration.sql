-- CreateTable
CREATE TABLE "horarios_atendimento" (
    "id" TEXT NOT NULL,
    "profissionalId" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "horaInicio" TEXT NOT NULL,
    "horaFim" TEXT NOT NULL,

    CONSTRAINT "horarios_atendimento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "horarios_atendimento_profissionalId_diaSemana_key" ON "horarios_atendimento"("profissionalId", "diaSemana");

-- AddForeignKey
ALTER TABLE "horarios_atendimento" ADD CONSTRAINT "horarios_atendimento_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "profissionais"("id") ON DELETE CASCADE ON UPDATE CASCADE;
