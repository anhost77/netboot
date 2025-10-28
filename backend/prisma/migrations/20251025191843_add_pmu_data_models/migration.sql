-- AlterTable
ALTER TABLE "bets" ADD COLUMN     "pmu_race_id" TEXT;

-- CreateTable
CREATE TABLE "pmu_hippodromes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pmu_hippodromes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pmu_races" (
    "id" TEXT NOT NULL,
    "hippodrome_code" TEXT NOT NULL,
    "reunion_number" INTEGER NOT NULL,
    "race_number" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "name" TEXT,
    "start_time" BIGINT,
    "discipline" TEXT,
    "distance" INTEGER,
    "prize" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pmu_races_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pmu_horses" (
    "id" TEXT NOT NULL,
    "race_id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "arrival_order" INTEGER,
    "recent_form" TEXT,
    "blinkers" BOOLEAN NOT NULL DEFAULT false,
    "unshod" BOOLEAN NOT NULL DEFAULT false,
    "first_time" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pmu_horses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pmu_hippodromes_code_key" ON "pmu_hippodromes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "pmu_races_hippodrome_code_date_reunion_number_race_number_key" ON "pmu_races"("hippodrome_code", "date", "reunion_number", "race_number");

-- CreateIndex
CREATE UNIQUE INDEX "pmu_horses_race_id_number_key" ON "pmu_horses"("race_id", "number");

-- CreateIndex
CREATE INDEX "bets_pmu_race_id_idx" ON "bets"("pmu_race_id");

-- AddForeignKey
ALTER TABLE "pmu_races" ADD CONSTRAINT "pmu_races_hippodrome_code_fkey" FOREIGN KEY ("hippodrome_code") REFERENCES "pmu_hippodromes"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pmu_horses" ADD CONSTRAINT "pmu_horses_race_id_fkey" FOREIGN KEY ("race_id") REFERENCES "pmu_races"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bets" ADD CONSTRAINT "bets_pmu_race_id_fkey" FOREIGN KEY ("pmu_race_id") REFERENCES "pmu_races"("id") ON DELETE SET NULL ON UPDATE CASCADE;
