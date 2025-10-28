-- Script pour recalculer et corriger les profits des paris

-- Mettre à jour les profits pour les paris gagnés
UPDATE bets
SET profit = payout - stake
WHERE status = 'won' 
  AND payout IS NOT NULL
  AND (profit IS NULL OR profit != payout - stake);

-- Mettre à jour les profits pour les paris perdus
UPDATE bets
SET profit = -stake
WHERE status = 'lost'
  AND (profit IS NULL OR profit != -stake);

-- Vérification après correction
SELECT 
    status,
    COUNT(*) as count,
    SUM(stake) as total_stake,
    SUM(payout) as total_payout,
    SUM(profit) as total_profit
FROM bets
WHERE status IN ('won', 'lost')
GROUP BY status;
