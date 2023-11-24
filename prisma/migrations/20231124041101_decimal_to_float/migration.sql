/*
  Warnings:

  - You are about to alter the column `price` on the `contribution_round` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `deposited` on the `contribution_round` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "contribution_round" ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "deposited" SET DATA TYPE DOUBLE PRECISION;
