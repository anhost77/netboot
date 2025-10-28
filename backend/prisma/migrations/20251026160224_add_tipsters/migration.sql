-- AlterTable
ALTER TABLE "bets" ADD COLUMN     "tipster_id" TEXT;

-- CreateTable
CREATE TABLE "tipsters" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "social_media" JSONB,
    "color" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipsters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tipsters_user_id_idx" ON "tipsters"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tipsters_user_id_name_key" ON "tipsters"("user_id", "name");

-- CreateIndex
CREATE INDEX "bets_tipster_id_idx" ON "bets"("tipster_id");

-- AddForeignKey
ALTER TABLE "tipsters" ADD CONSTRAINT "tipsters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bets" ADD CONSTRAINT "bets_tipster_id_fkey" FOREIGN KEY ("tipster_id") REFERENCES "tipsters"("id") ON DELETE SET NULL ON UPDATE CASCADE;
