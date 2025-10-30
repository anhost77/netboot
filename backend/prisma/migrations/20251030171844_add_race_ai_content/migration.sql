-- CreateTable
CREATE TABLE "race_ai_content" (
    "id" TEXT NOT NULL,
    "race_id" TEXT NOT NULL,
    "pronostic_text" TEXT,
    "pronostic_model" TEXT,
    "pronostic_tokens" INTEGER,
    "report_text" TEXT,
    "report_model" TEXT,
    "report_tokens" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "race_ai_content_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "race_ai_content_race_id_key" ON "race_ai_content"("race_id");

-- AddForeignKey
ALTER TABLE "race_ai_content" ADD CONSTRAINT "race_ai_content_race_id_fkey" FOREIGN KEY ("race_id") REFERENCES "pmu_races"("id") ON DELETE CASCADE ON UPDATE CASCADE;
