-- AlterTable
ALTER TABLE "profissionais" ADD COLUMN     "convenios" TEXT[] DEFAULT ARRAY[]::TEXT[];
