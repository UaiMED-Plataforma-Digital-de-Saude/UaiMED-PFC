-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "refreshTokenHash" TEXT,
ADD COLUMN     "refreshTokenExpiresAt" TIMESTAMP(3);
