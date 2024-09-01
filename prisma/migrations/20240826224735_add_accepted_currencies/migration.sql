-- CreateTable
CREATE TABLE "accepted_currencies" (
    "id" TEXT NOT NULL,
    "receive_address" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "blockchain" TEXT NOT NULL,
    "contributionRoundId" INTEGER NOT NULL,

    CONSTRAINT "accepted_currencies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "accepted_currencies" ADD CONSTRAINT "accepted_currencies_contributionRoundId_fkey" FOREIGN KEY ("contributionRoundId") REFERENCES "contribution_round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
