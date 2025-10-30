/*
  Warnings:

  - The values [couple] on the enum `HorseBetType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "HorseBetType_new" AS ENUM ('gagnant', 'place', 'gagnant_place', 'couple_gagnant', 'couple_place', 'couple_ordre', 'trio', 'trio_ordre', 'trio_bonus', 'tierce', 'tierce_ordre', 'quarte', 'quarte_ordre', 'quarte_bonus', 'quinte', 'quinte_ordre', 'deux_sur_quatre', 'super4', 'multi', 'mini_multi', 'pick5', 'autre');
ALTER TABLE "bets" ALTER COLUMN "bet_type" TYPE "HorseBetType_new" USING ("bet_type"::text::"HorseBetType_new");
ALTER TYPE "HorseBetType" RENAME TO "HorseBetType_old";
ALTER TYPE "HorseBetType_new" RENAME TO "HorseBetType";
DROP TYPE "HorseBetType_old";
COMMIT;
