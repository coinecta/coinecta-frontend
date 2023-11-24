-- CreateEnum
CREATE TYPE "ProofStatus" AS ENUM ('INITIATED', 'PENDING', 'SIGNED', 'VERIFIED', 'EXPIRED');

-- AlterTable
ALTER TABLE "whitelist_signups" ALTER COLUMN "amount_requested" DROP NOT NULL;

-- AlterTable
ALTER TABLE "whitelists" ADD COLUMN     "ergo_proofs" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ErgoProof" (
    "id" SERIAL NOT NULL,
    "addresses" TEXT[],
    "verification_id" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "status" "ProofStatus" NOT NULL,
    "wallet_type" TEXT,
    "default_address" TEXT,
    "signed_message" TEXT,
    "proof" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "ErgoProof_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ErgoProof_verification_id_key" ON "ErgoProof"("verification_id");

-- AddForeignKey
ALTER TABLE "ErgoProof" ADD CONSTRAINT "ErgoProof_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
