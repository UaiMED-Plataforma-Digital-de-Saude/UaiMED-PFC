-- CreateTable
CREATE TABLE "artigos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "resumo" TEXT,
    "categoria" TEXT NOT NULL,
    "corpo" TEXT NOT NULL,
    "banner" TEXT,
    "autorId" TEXT NOT NULL,
    "publicado" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artigos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "artigos" ADD CONSTRAINT "artigos_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
