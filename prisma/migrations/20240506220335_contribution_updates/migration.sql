/*
  Warnings:

  - The `restricted_countries` column on the `contribution_round` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "contribution_round" DROP COLUMN "restricted_countries",
ADD COLUMN     "restricted_countries" TEXT[];
