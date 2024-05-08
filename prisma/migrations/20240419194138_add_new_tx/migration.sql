/*
  Warnings:

  - Added the required column `txId` to the `new_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "new_transactions" ADD COLUMN     "txId" TEXT NOT NULL;
