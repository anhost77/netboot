-- CreateTable
CREATE TABLE "unique_horses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER,
    "sex" TEXT,
    "breed" TEXT,
    "breeder" TEXT,
    "owner" TEXT,
    "current_trainer" TEXT,
    "current_jockey" TEXT,
    "total_earnings" INTEGER,
    "career_starts" INTEGER NOT NULL DEFAULT 0,
    "career_wins" INTEGER NOT NULL DEFAULT 0,
    "career_places" INTEGER NOT NULL DEFAULT 0,
    "recent_form" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_race_date" TIMESTAMP(3),

    CONSTRAINT "unique_horses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_horses_name_key" ON "unique_horses"("name");
