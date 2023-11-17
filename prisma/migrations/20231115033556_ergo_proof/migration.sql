/*
  Warnings:

  - Added the required column `ergoProofId` to the `whitelist_signups` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProofStatus" AS ENUM ('PENDING', 'SIGNED', 'VERIFIED', 'EXPIRED');

-- AlterTable
ALTER TABLE "whitelist_signups" ADD COLUMN     "ergoProofId" INTEGER NOT NULL,
ALTER COLUMN "amount_requested" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ErgoProof" (
    "id" SERIAL NOT NULL,
    "addresses" TEXT[],
    "verificationId" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "status" "ProofStatus" NOT NULL,
    "walletType" TEXT,
    "defaultAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "whitelistSignupId" TEXT,

    CONSTRAINT "ErgoProof_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ErgoProof_verificationId_key" ON "ErgoProof"("verificationId");

-- CreateIndex
CREATE UNIQUE INDEX "ErgoProof_whitelistSignupId_key" ON "ErgoProof"("whitelistSignupId");

-- AddForeignKey
ALTER TABLE "ErgoProof" ADD CONSTRAINT "ErgoProof_whitelistSignupId_fkey" FOREIGN KEY ("whitelistSignupId") REFERENCES "whitelist_signups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
