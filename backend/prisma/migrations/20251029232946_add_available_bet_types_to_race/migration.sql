-- AlterTable
ALTER TABLE "pmu_races" ADD COLUMN     "available_bet_types" TEXT[] DEFAULT ARRAY[]::TEXT[];
