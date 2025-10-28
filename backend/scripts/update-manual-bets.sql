-- Script pour mettre à jour les paris existants qui nécessitent une mise à jour manuelle
-- À exécuter une seule fois après le déploiement de la nouvelle fonctionnalité

-- 1. Mettre à jour les paris en attente sur des plateformes non-PMU
UPDATE bets
SET requires_manual_update = true
WHERE status = 'pending'
  AND platform_id IN (
    SELECT id FROM platforms WHERE platform_type != 'PMU'
  );

-- 2. Vérifier le résultat
SELECT 
  b.id,
  b.date,
  b.platform,
  p.platform_type,
  b.status,
  b.requires_manual_update
FROM bets b
LEFT JOIN platforms p ON b.platform_id = p.id
WHERE b.status = 'pending'
ORDER BY b.date DESC
LIMIT 20;

-- 3. Statistiques
SELECT 
  p.platform_type,
  COUNT(*) as total_pending_bets,
  SUM(CASE WHEN b.requires_manual_update THEN 1 ELSE 0 END) as manual_update_required
FROM bets b
LEFT JOIN platforms p ON b.platform_id = p.id
WHERE b.status = 'pending'
GROUP BY p.platform_type;
