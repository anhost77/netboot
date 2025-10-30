-- Migrer les paris de type 'couple' vers 'couple_gagnant'
UPDATE "bets" SET "bet_type" = 'couple_gagnant' WHERE "bet_type" = 'couple';
