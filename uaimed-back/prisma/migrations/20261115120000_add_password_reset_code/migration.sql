-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "resetCodeHash" TEXT,
ADD COLUMN     "resetCodeExpiresAt" TIMESTAMP(3),
ADD COLUMN     "resetCodeAttempts" INTEGER NOT NULL DEFAULT 0;
