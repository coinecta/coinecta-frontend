-- AlterTable
ALTER TABLE "contribution_round" ADD COLUMN     "recipient_address" TEXT,
ADD COLUMN     "restricted_countries" JSONB;
