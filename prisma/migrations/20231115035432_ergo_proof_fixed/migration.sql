/*
  Warnings:

  - You are about to drop the column `createdAt` on the `ErgoProof` table. All the data in the column will be lost.
  - You are about to drop the column `defaultAddress` on the `ErgoProof` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ErgoProof` table. All the data in the column will be lost.
  - You are about to drop the column `verificationId` on the `ErgoProof` table. All the data in the column will be lost.
  - You are about to drop the column `walletType` on the `ErgoProof` table. All the data in the column will be lost.
  - You are about to drop the column `whitelistSignupId` on the `ErgoProof` table. All the data in the column will be lost.
  - You are about to drop the column `ergoProofId` on the `whitelist_signups` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[verification_id]` on the table `ErgoProof` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `ErgoProof` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `ErgoProof` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verification_id` to the `ErgoProof` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ErgoProof" DROP CONSTRAINT "ErgoProof_whitelistSignupId_fkey";

-- DropIndex
DROP INDEX "ErgoProof_verificationId_key";

-- DropIndex
DROP INDEX "ErgoProof_whitelistSignupId_key";

-- AlterTable
ALTER TABLE "ErgoProof" DROP COLUMN "createdAt",
DROP COLUMN "defaultAddress",
DROP COLUMN "updatedAt",
DROP COLUMN "verificationId",
DROP COLUMN "walletType",
DROP COLUMN "whitelistSignupId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "default_address" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD COLUMN     "verification_id" TEXT NOT NULL,
ADD COLUMN     "wallet_type" TEXT;

-- AlterTable
ALTER TABLE "whitelist_signups" DROP COLUMN "ergoProofId";

-- CreateIndex
CREATE UNIQUE INDEX "ErgoProof_verification_id_key" ON "ErgoProof"("verification_id");

-- AddForeignKey
ALTER TABLE "ErgoProof" ADD CONSTRAINT "ErgoProof_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
