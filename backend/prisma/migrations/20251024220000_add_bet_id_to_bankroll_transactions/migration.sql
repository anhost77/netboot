-- AlterTable
ALTER TABLE "bankroll_transactions" ADD COLUMN "bet_id" TEXT;

-- CreateIndex
CREATE INDEX "bankroll_transactions_bet_id_idx" ON "bankroll_transactions"("bet_id");

-- AddForeignKey
ALTER TABLE "bankroll_transactions" ADD CONSTRAINT "bankroll_transactions_bet_id_fkey" FOREIGN KEY ("bet_id") REFERENCES "bets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
