# 📚 Collection de l'historique PMU

Ce document explique comment collecter et stocker l'historique des performances PMU sur plusieurs années.

## 🎯 Objectif

Collecter les données historiques des courses PMU pour enrichir les statistiques et permettre :
- Analyse des performances passées de chaque cheval
- Calcul des taux de victoire/podium sur l'historique
- Identification des hippodromes favorables
- Analyse des performances par distance
- Suivi de la forme récente (5 dernières courses)

## 📊 Données collectées

Pour chaque course, on récupère :
- **Informations de la course** : date, hippodrome, nom du prix, discipline, distance, dotation, nombre de partants
- **Performance du cheval** : position d'arrivée, statut (PLACE/NON_PLACE/DISQUALIFIE), jockey, temps
- **Historique** : Les 5 dernières courses de chaque cheval participant

## 🚀 Utilisation

### Collecter les données d'une année complète

```bash
cd backend
npm run collect-pmu-history -- --year=2024
```

### Collecter une plage de dates spécifique

```bash
npm run collect-pmu-history -- --start=2023-01-01 --end=2023-12-31
```

### Collecter les N derniers jours

```bash
npm run collect-pmu-history -- --days=365
```

### Collecter par défaut (30 derniers jours)

```bash
npm run collect-pmu-history
```

## ⚙️ Fonctionnement

1. **Récupération du programme** : Pour chaque date, récupère la liste des réunions et courses
2. **Collecte des performances** : Pour chaque course, appelle l'API `/performances-detaillees`
3. **Stockage en base** :
   - Crée/met à jour l'hippodrome
   - Crée/met à jour la course
   - Crée/met à jour chaque cheval
   - Stocke l'historique des 5 dernières courses dans `pmu_horse_performances`

4. **Délai entre requêtes** : 500ms pour éviter de surcharger l'API PMU

## 📈 Estimation du temps

- **1 jour** : ~5-10 minutes (environ 80-100 courses)
- **1 mois** : ~2-5 heures
- **1 an** : ~24-60 heures (peut être lancé en arrière-plan)

## 💾 Structure de la base de données

### Table `pmu_horse_performances`

```sql
CREATE TABLE pmu_horse_performances (
  id                      UUID PRIMARY KEY,
  horse_id                UUID REFERENCES pmu_horses(id),
  date                    TIMESTAMP,
  hippodrome              VARCHAR,
  race_name               VARCHAR,
  discipline              VARCHAR,
  distance                INTEGER,
  prize                   INTEGER,
  nb_participants         INTEGER,
  arrival_position        INTEGER,  -- Position d'arrivée (1, 2, 3, etc.)
  status                  VARCHAR,  -- PLACE, NON_PLACE, DISQUALIFIE
  jockey                  VARCHAR,
  reduction_kilometrique  INTEGER,  -- Temps en ms
  distance_parcourue      INTEGER,
  winner_time             INTEGER,  -- Temps du vainqueur en ms
  created_at              TIMESTAMP,
  updated_at              TIMESTAMP,
  
  UNIQUE(horse_id, date, hippodrome)
);
```

## 🎯 Utilisation des données

Une fois collectées, ces données permettent de :

### 1. Afficher la forme récente d'un cheval
```typescript
const recentPerformances = await prisma.pmuHorsePerformance.findMany({
  where: { horseId },
  orderBy: { date: 'desc' },
  take: 5
});
```

### 2. Calculer le taux de victoire
```typescript
const totalRaces = performances.length;
const wins = performances.filter(p => p.arrivalPosition === 1).length;
const winRate = (wins / totalRaces) * 100;
```

### 3. Identifier les hippodromes favorables
```typescript
const performancesByHippodrome = await prisma.pmuHorsePerformance.groupBy({
  by: ['hippodrome'],
  where: { horseId },
  _count: true,
  _avg: { arrivalPosition: true }
});
```

### 4. Analyser les performances par distance
```typescript
const performancesByDistance = await prisma.pmuHorsePerformance.groupBy({
  by: ['distance'],
  where: { horseId },
  _avg: { arrivalPosition: true }
});
```

## ⚠️ Limitations

- L'API PMU limite à 5 courses passées par cheval
- Certaines courses anciennes peuvent ne pas avoir de données disponibles
- Les courses très récentes peuvent ne pas encore avoir les résultats

## 🔄 Mise à jour continue

Pour maintenir les données à jour, vous pouvez :

1. **Lancer la collecte quotidiennement** via un cron job
2. **Utiliser le service auto-update** existant qui met à jour les courses du jour
3. **Collecter périodiquement** les derniers 7 jours pour combler les manques

## 📝 Logs

Le service affiche des logs détaillés :
- `🚀 Starting PMU historical data collection...` : Début de la collecte
- `Processing date: YYYY-MM-DD` : Date en cours de traitement
- `Successfully collected performances for R1C1` : Course collectée avec succès
- `✅ Collection completed: X/Y races collected` : Résumé final

## 🐛 Gestion des erreurs

- Les erreurs de course individuelle n'arrêtent pas la collecte globale
- Un résumé final indique le nombre de courses réussies/échouées
- Les logs détaillent chaque erreur rencontrée

## 💡 Conseils

1. **Commencez petit** : Testez avec quelques jours avant de lancer une année complète
2. **Lancez en arrière-plan** : Utilisez `nohup` ou `screen` pour les longues collectes
3. **Surveillez l'espace disque** : Une année complète peut représenter plusieurs Go de données
4. **Vérifiez les logs** : Consultez régulièrement pour détecter les problèmes

## 🎉 Prochaines étapes

Une fois les données collectées, vous pourrez :
- Afficher la forme récente dans la modal de sélection des chevaux
- Ajouter des indicateurs de confiance basés sur l'historique
- Créer des graphiques de progression
- Recommander les meilleurs chevaux basés sur les statistiques historiques
