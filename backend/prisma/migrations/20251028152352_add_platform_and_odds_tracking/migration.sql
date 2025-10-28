-- AlterTable
ALTER TABLE "bets" ADD COLUMN     "final_odds" DECIMAL(10,2),
ADD COLUMN     "final_odds_source" TEXT,
ADD COLUMN     "odds_source" TEXT,
ADD COLUMN     "odds_updated_at" TIMESTAMP(3),
ADD COLUMN     "platform_id" TEXT,
ADD COLUMN     "requires_manual_update" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "use_original_odds" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "platforms" ADD COLUMN     "auto_update_results" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "platform_type" TEXT NOT NULL DEFAULT 'OTHER';

-- CreateIndex
CREATE INDEX "platforms_platform_type_idx" ON "platforms"("platform_type");

-- AddForeignKey
ALTER TABLE "bets" ADD CONSTRAINT "bets_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
