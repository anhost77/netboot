-- AlterTable
ALTER TABLE "platforms" ADD COLUMN     "mode" TEXT NOT NULL DEFAULT 'real';

-- CreateIndex
CREATE INDEX "platforms_user_id_mode_idx" ON "platforms"("user_id", "mode");
