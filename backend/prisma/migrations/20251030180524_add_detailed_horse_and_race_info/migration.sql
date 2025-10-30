-- AlterTable
ALTER TABLE "pmu_horses" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "career_places" INTEGER,
ADD COLUMN     "career_starts" INTEGER,
ADD COLUMN     "career_wins" INTEGER,
ADD COLUMN     "jockey" TEXT,
ADD COLUMN     "rope" INTEGER,
ADD COLUMN     "sex" TEXT,
ADD COLUMN     "total_earnings" INTEGER,
ADD COLUMN     "trainer" TEXT,
ADD COLUMN     "weight" INTEGER;

-- AlterTable
ALTER TABLE "pmu_races" ADD COLUMN     "penetrometer" TEXT,
ADD COLUMN     "track_condition" TEXT,
ADD COLUMN     "weather" TEXT;
