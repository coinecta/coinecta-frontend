-- AlterTable
ALTER TABLE "contribution_round" ADD COLUMN     "recipient_address" TEXT,
ADD COLUMN     "restricted_countries" TEXT[];

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "on_chain_tx_data" JSONB;

-- CreateTable
CREATE TABLE "new_transactions" (
    "id" TEXT NOT NULL,
    "txId" TEXT NOT NULL,
    "on_chain_tx_data" JSONB,

    CONSTRAINT "new_transactions_pkey" PRIMARY KEY ("id")
);
