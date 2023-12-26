-- AlterTable
ALTER TABLE "project_tokenomics" ADD COLUMN       "policy_id" TEXT NOT NULL;
ALTER TABLE "project_tokenomics_items" ADD COLUMN "wallet_address" TEXT NULL;