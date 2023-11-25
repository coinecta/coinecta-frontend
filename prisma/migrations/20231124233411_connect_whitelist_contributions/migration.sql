/*
  Warnings:

  - A unique constraint covering the columns `[whitelist_slug]` on the table `contribution_round` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `whitelist_slug` to the `contribution_round` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contribution_round" ADD COLUMN     "whitelist_slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "contribution_round_whitelist_slug_key" ON "contribution_round"("whitelist_slug");

-- AddForeignKey
ALTER TABLE "contribution_round" ADD CONSTRAINT "contribution_round_whitelist_slug_fkey" FOREIGN KEY ("whitelist_slug") REFERENCES "whitelists"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
