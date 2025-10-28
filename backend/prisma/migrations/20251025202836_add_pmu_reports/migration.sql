-- CreateTable
CREATE TABLE "pmu_reports" (
    "id" TEXT NOT NULL,
    "race_id" TEXT NOT NULL,
    "bet_type" TEXT NOT NULL,
    "bet_family" TEXT NOT NULL,
    "base_stake" INTEGER NOT NULL,
    "refunded" BOOLEAN NOT NULL DEFAULT false,
    "reports" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pmu_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pmu_reports_race_id_bet_type_key" ON "pmu_reports"("race_id", "bet_type");

-- AddForeignKey
ALTER TABLE "pmu_reports" ADD CONSTRAINT "pmu_reports_race_id_fkey" FOREIGN KEY ("race_id") REFERENCES "pmu_races"("id") ON DELETE CASCADE ON UPDATE CASCADE;
