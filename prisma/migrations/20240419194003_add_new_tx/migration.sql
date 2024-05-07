-- CreateTable
CREATE TABLE "new_transactions" (
    "id" TEXT NOT NULL,
    "on_chain_tx_data" JSONB,

    CONSTRAINT "new_transactions_pkey" PRIMARY KEY ("id")
);
