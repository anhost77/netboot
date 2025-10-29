/*
  Warnings:

  - A unique constraint covering the columns `[user_id,name,mode]` on the table `tipsters` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "tipsters_user_id_name_key";

-- AlterTable
ALTER TABLE "bankroll_transactions" ADD COLUMN     "mode" TEXT NOT NULL DEFAULT 'real';

-- AlterTable
ALTER TABLE "bets" ADD COLUMN     "mode" TEXT NOT NULL DEFAULT 'real';

-- AlterTable
ALTER TABLE "tipsters" ADD COLUMN     "mode" TEXT NOT NULL DEFAULT 'real';

-- CreateIndex
CREATE INDEX "bankroll_transactions_user_id_mode_idx" ON "bankroll_transactions"("user_id", "mode");

-- CreateIndex
CREATE INDEX "bets_user_id_mode_idx" ON "bets"("user_id", "mode");

-- CreateIndex
CREATE INDEX "tipsters_user_id_mode_idx" ON "tipsters"("user_id", "mode");

-- CreateIndex
CREATE UNIQUE INDEX "tipsters_user_id_name_mode_key" ON "tipsters"("user_id", "name", "mode");
