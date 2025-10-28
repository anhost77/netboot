# 🧪 Guide de Test du Système PMU

## 📋 Vérifications à effectuer

### 1. **Vérifier que le cron est actif**

#### Au démarrage du backend
Regardez les logs, vous devriez voir :
```
[Nest] LOG [SchedulerOrchestrator] Cron job 'check-pending-bets' registered
```

#### Toutes les 10 minutes
Vous devriez voir dans les logs :
```
[Nest] LOG [PmuAutoUpdateService] 🔄 Starting automatic bet status update...
[Nest] LOG [PmuAutoUpdateService] Found X pending bets to check
[Nest] LOG [PmuAutoUpdateService] ✅ Automatic bet status update completed
```

### 2. **Tester manuellement le cron**

#### Via Swagger (http://localhost:3001/api/docs)

Endpoint : `GET /api/pmu/admin/check-pending-bets`

Cela déclenchera immédiatement la vérification des paris en attente.

#### Via curl
```bash
curl -X GET "http://localhost:3001/api/pmu/admin/check-pending-bets" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. **Tester avec un pari réel**

#### Étape 1 : Créer un pari PMU
1. Allez sur `/dashboard/bets`
2. Créez un pari avec le type "PMU"
3. Remplissez les informations (hippodrome, course, chevaux)
4. Le pari est créé avec statut `pending`

#### Étape 2 : Attendre que la course soit passée
- Le système attend 15 minutes après la date de la course
- Puis vérifie toutes les 10 minutes

#### Étape 3 : Vérifier les logs
```
[Nest] LOG [PmuAutoUpdateService] Updating odds for race 9559e328-e2cc-4f09-9a11-52c364ae78d6 from reports
[Nest] DEBUG [PmuService] Fetching race reports for 25102025 R2C2
[Nest] LOG [PmuDataService] ✅ Updated odds for horse 4: 12.1€ (Simple Gagnant)
[Nest] LOG [PmuDataService] ✅ Updated odds for horse 3: 1.3€ (Simple Placé)
[Nest] LOG [PmuAutoUpdateService] ✅ Retrieved odds from PMU for bet abc123: 12.10€ → payout: 60.50€
[Nest] LOG [PmuAutoUpdateService] ✅ Updated bet abc123: won (profit: 55.50€)
[Nest] LOG [PmuAutoUpdateService] 📧 Notification sent to user xyz789 for bet abc123
```

#### Étape 4 : Vérifier le résultat
1. Rafraîchissez la page des paris
2. Le statut devrait être `won` ou `lost`
3. La cote devrait être remplie automatiquement
4. Le payout et profit devraient être calculés
5. Vous devriez avoir reçu un email et une notification push

### 4. **Vérifier les cotes dans la modale**

1. Cliquez sur l'icône 🏆 d'un pari PMU
2. Vérifiez que les cotes s'affichent :
   - Dans le podium (sous les noms)
   - Dans la liste des chevaux (badge vert)
3. Allez dans l'onglet "💰 Rapports détaillés"
4. Vérifiez que tous les types de paris sont affichés avec leurs cotes

### 5. **Tester la mise à jour manuelle des cotes**

#### Via Swagger
Endpoint : `GET /api/pmu/data/races/{raceId}/update-odds`

Exemple :
```
GET /api/pmu/data/races/9559e328-e2cc-4f09-9a11-52c364ae78d6/update-odds
```

Cela va :
1. Récupérer les rapports PMU
2. Mettre à jour les cotes de tous les chevaux
3. Sauvegarder tous les rapports en base

### 6. **Vérifier la base de données**

#### Vérifier les rapports sauvegardés
```sql
SELECT * FROM pmu_reports WHERE race_id = 'RACE_ID';
```

#### Vérifier les cotes des chevaux
```sql
SELECT number, name, odds, arrival_order 
FROM pmu_horses 
WHERE race_id = 'RACE_ID'
ORDER BY number;
```

#### Vérifier les paris mis à jour
```sql
SELECT id, status, odds, payout, profit, updated_at
FROM bets
WHERE pmu_race_id IS NOT NULL
ORDER BY updated_at DESC
LIMIT 10;
```

## 🐛 Dépannage

### Le cron ne s'exécute pas

**Vérifiez :**
- Le module `ScheduleModule` est bien importé dans `AppModule`
- Le service `PmuAutoUpdateService` est bien dans les providers de `PmuModule`
- Pas d'erreur au démarrage dans les logs

### Les paris ne sont pas mis à jour

**Vérifiez :**
1. Le pari a bien un `pmuRaceId` (lié à une course PMU)
2. La course est passée depuis au moins 15 minutes
3. Les résultats sont disponibles sur l'API PMU
4. Les logs montrent les tentatives de mise à jour

**Forcer la vérification :**
```bash
curl -X GET "http://localhost:3001/api/pmu/admin/check-pending-bets" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Les cotes ne sont pas récupérées

**Vérifiez :**
1. Les rapports PMU sont disponibles (course terminée)
2. Le type de pari est supporté
3. La combinaison de chevaux correspond aux rapports

**Tester l'API PMU directement :**
```bash
curl "https://online.turfinfo.api.pmu.fr/rest/client/2/programme/25102025/R2/C2/rapports-definitifs"
```

## ✅ Checklist de validation

- [ ] Le cron est enregistré au démarrage
- [ ] Le cron s'exécute toutes les 10 minutes
- [ ] Les paris en attente sont détectés
- [ ] Les résultats PMU sont récupérés
- [ ] Les cotes sont extraites correctement
- [ ] Le payout est calculé automatiquement
- [ ] Le statut est mis à jour (won/lost)
- [ ] Les notifications sont envoyées
- [ ] Les cotes s'affichent dans la modale
- [ ] L'onglet rapports fonctionne
- [ ] Le mode plein écran fonctionne

## 📊 Exemple de test complet

```bash
# 1. Créer un pari de test (via l'interface)
# 2. Attendre 15 minutes après la course
# 3. Déclencher manuellement
curl -X GET "http://localhost:3001/api/pmu/admin/check-pending-bets" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Vérifier les logs
tail -f backend.log | grep PmuAutoUpdateService

# 5. Vérifier en base
psql -d bettracker_dev -c "SELECT id, status, odds, payout, profit FROM bets WHERE pmu_race_id IS NOT NULL ORDER BY updated_at DESC LIMIT 5;"
```

## 🎯 Résultat attendu

Après l'exécution du cron sur un pari PMU terminé :
- ✅ Statut : `won` ou `lost`
- ✅ Odds : Rempli avec la cote PMU (ex: 12.10)
- ✅ Payout : Calculé (ex: 60.50€ pour 5€ à 12.10)
- ✅ Profit : Calculé (ex: 55.50€)
- ✅ Email envoyé
- ✅ Notification push envoyée
