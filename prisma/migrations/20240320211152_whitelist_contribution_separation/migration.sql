-- DropForeignKey
ALTER TABLE "contribution_round" DROP CONSTRAINT "contribution_round_whitelist_slug_fkey";

-- AlterTable
ALTER TABLE "contribution_round" ALTER COLUMN "whitelist_slug" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "contribution_round" ADD CONSTRAINT "contribution_round_whitelist_slug_fkey" FOREIGN KEY ("whitelist_slug") REFERENCES "whitelists"("slug") ON DELETE SET NULL ON UPDATE CASCADE;
