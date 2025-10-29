-- DropIndex
DROP INDEX "notifications_user_id_read_at_idx";

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "mode" TEXT NOT NULL DEFAULT 'real';

-- CreateIndex
CREATE INDEX "notifications_user_id_mode_read_at_idx" ON "notifications"("user_id", "mode", "read_at");
