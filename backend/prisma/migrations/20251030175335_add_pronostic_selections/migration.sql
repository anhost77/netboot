-- AlterTable
ALTER TABLE "race_ai_content" ADD COLUMN     "bet_type" TEXT,
ADD COLUMN     "selections" JSONB,
ADD COLUMN     "stake" TEXT;
