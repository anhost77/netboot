-- CreateTable
CREATE TABLE "pmu_horse_performances" (
    "id" TEXT NOT NULL,
    "horse_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hippodrome" TEXT NOT NULL,
    "race_name" TEXT,
    "discipline" TEXT,
    "distance" INTEGER,
    "prize" INTEGER,
    "nb_participants" INTEGER,
    "arrival_position" INTEGER,
    "status" TEXT,
    "jockey" TEXT,
    "reduction_kilometrique" INTEGER,
    "distance_parcourue" INTEGER,
    "winner_time" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pmu_horse_performances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pmu_horse_performances_horse_id_idx" ON "pmu_horse_performances"("horse_id");

-- CreateIndex
CREATE INDEX "pmu_horse_performances_date_idx" ON "pmu_horse_performances"("date");

-- CreateIndex
CREATE UNIQUE INDEX "pmu_horse_performances_horse_id_date_hippodrome_key" ON "pmu_horse_performances"("horse_id", "date", "hippodrome");

-- AddForeignKey
ALTER TABLE "pmu_horse_performances" ADD CONSTRAINT "pmu_horse_performances_horse_id_fkey" FOREIGN KEY ("horse_id") REFERENCES "pmu_horses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
