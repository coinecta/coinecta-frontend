/*
  Warnings:

  - You are about to drop the `CardanoPrice` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `contribution_id` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "contribution_id" INTEGER NOT NULL,
ADD COLUMN     "tx_id" TEXT,
ALTER COLUMN "description" DROP NOT NULL;

-- DropTable
DROP TABLE "CardanoPrice";

-- CreateTable
CREATE TABLE "contribution_round" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sale_type" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "token_ticker" TEXT NOT NULL,
    "token_target" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "deposited" DECIMAL(65,30) NOT NULL,
    "project_name" TEXT NOT NULL,
    "project_slug" TEXT NOT NULL,

    CONSTRAINT "contribution_round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cardano_price" (
    "id" SERIAL NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cardano_price_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_contribution_id_fkey" FOREIGN KEY ("contribution_id") REFERENCES "contribution_round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contribution_round" ADD CONSTRAINT "contribution_round_project_slug_fkey" FOREIGN KEY ("project_slug") REFERENCES "projects"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
