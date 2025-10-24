-- CreateEnum pour les types de paris hippiques
CREATE TYPE "HorseBetType" AS ENUM ('gagnant', 'place', 'gagnant_place', 'couple', 'couple_ordre', 'trio', 'trio_ordre', 'quarte', 'quarte_ordre', 'quinte', 'quinte_ordre', 'multi', 'pick5', 'autre');

-- AlterTable pour modifier bet_type de text à enum
ALTER TABLE "bets"
  ALTER COLUMN "bet_type" DROP DEFAULT,
  ALTER COLUMN "bet_type" TYPE "HorseBetType" USING (
    CASE
      WHEN "bet_type" IS NULL THEN NULL
      WHEN "bet_type" = 'gagnant' THEN 'gagnant'::"HorseBetType"
      WHEN "bet_type" = 'place' THEN 'place'::"HorseBetType"
      WHEN "bet_type" = 'gagnant_place' THEN 'gagnant_place'::"HorseBetType"
      WHEN "bet_type" = 'couple' THEN 'couple'::"HorseBetType"
      WHEN "bet_type" = 'couple_ordre' THEN 'couple_ordre'::"HorseBetType"
      WHEN "bet_type" = 'trio' THEN 'trio'::"HorseBetType"
      WHEN "bet_type" = 'trio_ordre' THEN 'trio_ordre'::"HorseBetType"
      WHEN "bet_type" = 'quarte' THEN 'quarte'::"HorseBetType"
      WHEN "bet_type" = 'quarte_ordre' THEN 'quarte_ordre'::"HorseBetType"
      WHEN "bet_type" = 'quinte' THEN 'quinte'::"HorseBetType"
      WHEN "bet_type" = 'quinte_ordre' THEN 'quinte_ordre'::"HorseBetType"
      WHEN "bet_type" = 'multi' THEN 'multi'::"HorseBetType"
      WHEN "bet_type" = 'pick5' THEN 'pick5'::"HorseBetType"
      ELSE 'autre'::"HorseBetType"
    END
  );

-- Ajouter la nouvelle colonne winning_horse
ALTER TABLE "bets" ADD COLUMN "winning_horse" TEXT;
