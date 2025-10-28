-- Script de diagnostic pour vérifier les profits des paris

-- 1. Vérifier les paris avec statut won/lost mais sans profit
SELECT 
    id,
    date,
    platform,
    stake,
    payout,
    profit,
    status,
    CASE 
        WHEN status = 'won' AND payout IS NOT NULL THEN payout - stake
        WHEN status = 'lost' THEN -stake
        ELSE NULL
    END as calculated_profit
FROM bets
WHERE status IN ('won', 'lost')
ORDER BY date DESC
LIMIT 20;

-- 2. Comparer profit enregistré vs profit calculé
SELECT 
    COUNT(*) as total_bets,
    COUNT(CASE WHEN profit IS NULL THEN 1 END) as bets_without_profit,
    COUNT(CASE WHEN profit IS NOT NULL THEN 1 END) as bets_with_profit,
    SUM(CASE WHEN profit IS NOT NULL THEN profit ELSE 0 END) as sum_recorded_profit,
    SUM(CASE 
        WHEN status = 'won' AND payout IS NOT NULL THEN payout - stake
        WHEN status = 'lost' THEN -stake
        ELSE 0
    END) as sum_calculated_profit
FROM bets
WHERE status IN ('won', 'lost');

-- 3. Vérifier les transactions de bankroll
SELECT 
    bt.date,
    bt.type,
    bt.amount,
    bt.description,
    bt.balance_after,
    p.name as platform_name
FROM bankroll_transactions bt
JOIN platforms p ON bt.platform_id = p.id
ORDER BY bt.date DESC
LIMIT 20;
