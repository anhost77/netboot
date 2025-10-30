# 🏇 Système de Pronostics Intelligent - Architecture Complète

## 📊 Vue d'ensemble

Le système de pronostics combine **3 sources de données** pour générer des analyses précises :

1. **Historique des performances** (`PmuHistoryCollectorService`)
2. **Données météo en temps réel** (`WeatherService` + `WeatherCacheService`)
3. **Analyse algorithmique** (`PmuPronosticAnalyzerService`)

---

## 🗄️ Architecture des Données

### 1. Modèle `PmuHorse` (Données actuelles)
```prisma
model PmuHorse {
  // Identité
  number, name, age, sex
  
  // Performance
  recentForm (musique: "1p2p3p")
  odds (cote)
  
  // Équipe
  jockey, trainer
  
  // Statistiques carrière
  totalEarnings, careerStarts, careerWins, careerPlaces
  
  // Conditions
  weight, rope, blinkers, unshod
  
  // Relation
  performances[] -> PmuHorsePerformance
}
```

### 2. Modèle `PmuHorsePerformance` (Historique)
```prisma
model PmuHorsePerformance {
  // Identité course
  date, hippodrome, raceName
  
  // Conditions
  discipline, distance, prize
  nbParticipants
  
  // Résultat
  arrivalPosition, status
  
  // Équipe
  jockey, trainer
  
  // Performance
  reductionKilometrique, distanceParcourue, winnerTime
  
  // Données brutes (contient météo/terrain si disponible)
  rawData: Json
}
```

### 3. Modèle `PmuRace` (Course)
```prisma
model PmuRace {
  // Conditions actuelles
  trackCondition (BON, SOUPLE, LOURD...)
  weather (ENSOLEILLE, PLUIE, NUAGEUX...)
  penetrometer
  
  // Relation
  horses[] -> PmuHorse
  aiContent -> RaceAiContent
}
```

---

## 🔄 Flux de Collecte des Données

### Étape 1: Collection Historique
```bash
# Commande CLI
npm run collect-pmu-history -- --year=2024

# Ce qui est collecté:
✅ Toutes les courses de l'année
✅ Tous les chevaux participants
✅ Performances détaillées (jockey, trainer, position)
✅ Conditions de course (terrain, distance)
✅ Données brutes complètes (rawData)
```

**Résultat**: Base de données remplie avec l'historique complet

### Étape 2: Collection Météo Quotidienne
```typescript
// Automatique ou manuel
await weatherService.collectTodayWeather();

// Ce qui est collecté:
✅ Météo actuelle pour chaque hippodrome
✅ Température, humidité, vent, précipitations
✅ Stockage en cache (3h) + BDD
✅ Limite: 1000 appels/jour respectée
```

**Résultat**: Chaque course a sa météo actuelle

---

## 🧮 Système de Scoring

### Calcul du Score Total (0-100)

```typescript
totalScore = (
  performanceScore    * 0.30 +  // Musique récente
  jockeyScore         * 0.20 +  // Stats jockey (30 jours)
  trainerScore        * 0.15 +  // Stats entraîneur (30 jours)
  oddsScore           * 0.15 +  // Rapport valeur/cote
  distanceScore       * 0.10 +  // Performances à distance similaire
  weatherConditions   * 0.10    // Impact météo sur performances
)
```

### 1. Performance Score (30%)
**Source**: `horse.recentForm` + `horse.performances[]`

```typescript
// Analyse de la musique: "1p2p3p"
positions = [1, 2, 3]

// Scoring pondéré (courses récentes = plus important)
for (position, index) {
  weight = 1 - (index * 0.15)
  if (position === 1) score += 100 * weight
  if (position === 2) score += 80 * weight
  if (position === 3) score += 60 * weight
  if (position <= 5) score += 40 * weight
  else score += 20 * weight
}
```

**Utilisation historique**:
- Récupère les 10 dernières performances
- Analyse la régularité
- Détecte les tendances (forme montante/descendante)

### 2. Jockey Score (20%)
**Source**: `PmuHorsePerformance` (30 derniers jours)

```typescript
// Requête BDD
performances = await prisma.pmuHorsePerformance.findMany({
  where: {
    jockey: jockeyName,
    date: { gte: thirtyDaysAgo },
    arrivalPosition: { not: null }
  }
})

// Calcul
wins = performances.filter(p => p.arrivalPosition === 1)
places = performances.filter(p => p.arrivalPosition <= 3)

winRate = (wins / total) * 100
placeRate = (places / total) * 100

score = (winRate * 0.7) + (placeRate * 0.3)
```

**Pourquoi 30 jours ?**
- Forme récente plus pertinente
- Évite les données obsolètes
- Capture les tendances actuelles

### 3. Trainer Score (15%)
**Source**: `PmuHorsePerformance` (30 derniers jours)

```typescript
// Même logique que jockey
// Mais pondération différente: 60% victoires, 40% places
score = (winRate * 0.6) + (placeRate * 0.4)
```

### 4. Odds Score (15%)
**Source**: `horse.odds` + `performanceScore`

```typescript
// Détecte les bonnes affaires
if (odds < 2 && performanceScore > 70) return 90  // Favori confirmé
if (odds 2-5 && performanceScore > 60) return 85  // Excellent rapport
if (odds > 10 && performanceScore > 50) return 70 // Outsider intéressant
if (odds > 20) return 30                          // Trop risqué
```

### 5. Distance Score (10%)
**Source**: `horse.performances[]` filtrées par distance

```typescript
// Récupère performances à distance similaire (±200m)
similarDistancePerfs = performances.filter(p => 
  Math.abs(p.distance - raceDistance) <= 200
)

// Calcul moyenne positions
avgPosition = sum(positions) / count

// Conversion en score
score = max(0, 100 - (avgPosition - 1) * 10)
```

**Utilisation historique**:
- Identifie les spécialistes de distance
- Détecte les chevaux polyvalents
- Évite les mauvais choix (cheval de sprint sur longue distance)

### 6. Weather/Conditions Score (10%)
**Source**: `WeatherService` + `horse.performances[]` + `rawData`

```typescript
// 1. Récupérer météo actuelle (avec cache)
currentWeather = await weatherService.getCurrentWeather(hippodrome)

// 2. Filtrer performances historiques avec météo similaire
similarWeatherPerfs = performances.filter(p => {
  const perfWeather = p.rawData?.meteo || p.race?.weather
  return perfWeather === currentWeather.condition
})

// 3. Calculer performance moyenne sous ces conditions
avgPosition = sum(similarWeatherPerfs.positions) / count
score = max(0, 100 - (avgPosition - 1) * 10)
```

**Exemples concrets**:
- Cheval qui adore le terrain lourd → Score élevé si pluie
- Cheval qui déteste le vent → Score baissé si vent fort
- Spécialiste du bon terrain → Score élevé si sec

---

## 🎯 Utilisation de l'Historique

### Scénario 1: Analyse d'un Cheval
```typescript
// Données disponibles
const horse = {
  name: "ECLAIR DU MATIN",
  recentForm: "1p2p1p3p",
  jockey: "P. Levesque",
  trainer: "J. Dubois",
  performances: [
    // 10 dernières courses avec:
    { date, hippodrome, distance, arrivalPosition, jockey, trainer, rawData }
  ]
}

// Analyses possibles
1. Régularité: 3 victoires sur 4 dernières = EXCELLENT
2. Jockey: P. Levesque a 25% de victoires sur 30 jours = BON
3. Distance: 5 courses à 2400m, moyenne position 2.2 = EXCELLENT
4. Météo: 2 victoires sur 3 courses sous la pluie = ADORE LE LOURD
5. Hippodrome: 2 victoires à Vincennes = CONNAIT LA PISTE
```

### Scénario 2: Comparaison de Chevaux
```typescript
// Course du jour: Vincennes, 2400m, terrain lourd, pluie

Cheval A:
- Musique: "1p1p2p" (régulier)
- Distance: 80% de victoires à 2400m
- Météo: 0% de victoires sous la pluie ❌
→ Score final: 65/100

Cheval B:
- Musique: "3p1p4p" (irrégulier)
- Distance: 50% de places à 2400m
- Météo: 75% de victoires sous la pluie ✅
→ Score final: 78/100

Recommandation: Cheval B (spécialiste du lourd)
```

### Scénario 3: Optimisation des Pourcentages
```typescript
// Après 6 mois de données historiques
// Analyse de corrélation:

correlations = {
  musique: 0.45,        // Forte corrélation
  jockey: 0.32,         // Moyenne
  trainer: 0.28,        // Moyenne
  cotes: 0.25,          // Faible
  distance: 0.38,       // Bonne
  meteo: 0.42           // Forte!
}

// Ajustement automatique des poids:
nouveauxPoids = {
  performance: 0.28,    // -2%
  jockey: 0.18,         // -2%
  trainer: 0.13,        // -2%
  odds: 0.13,           // -2%
  distance: 0.12,       // +2%
  weather: 0.16         // +6% (impact sous-estimé!)
}
```

---

## 🚀 Workflow Complet

### 1. Préparation (Une fois)
```bash
# Collecter l'historique
cd backend
npm run collect-pmu-history -- --year=2024

# Résultat: ~10,000 courses, ~100,000 performances
```

### 2. Quotidien (Automatique)
```typescript
// Matin: Sync programme du jour
await pmuDailySyncService.syncDailyProgram()

// Midi: Collecte météo
await weatherService.collectTodayWeather()
// → 10-15 appels API (cache 3h)

// Après-midi: Génération pronostics
for (race of todayRaces) {
  analysis = await pronosticAnalyzer.analyzeRace(race.id)
  // → Utilise historique + météo + algorithme
}
```

### 3. Utilisateur Demande un Pronostic
```typescript
// Frontend: GET /api/pmu/race/{id}/analyze

// Backend:
1. Charge course + chevaux + performances (BDD)
2. Récupère météo (cache ou API si nécessaire)
3. Calcule scores pour chaque cheval
4. Génère recommandations
5. Affiche tableau complet

// Résultat en <100ms (grâce au cache)
```

---

## 📈 Améliorations Futures

### 1. Machine Learning
```typescript
// Entraîner un modèle sur l'historique
model = trainModel({
  features: [musique, jockey, trainer, distance, meteo, ...],
  target: arrivalPosition,
  data: last2YearsPerformances
})

// Prédiction
predictedPosition = model.predict(horseFeatures)
```

### 2. Analyse Avancée
- Détection de patterns (cheval qui aime les fins de réunion)
- Analyse de la concurrence (qui sont les adversaires?)
- Historique des confrontations directes
- Impact du numéro de corde

### 3. Optimisation Continue
- A/B testing des poids
- Feedback loop (résultats réels vs prédictions)
- Ajustement automatique des algorithmes

---

## 🎓 Résumé

**Le système utilise l'historique pour**:
1. ✅ Évaluer la régularité des chevaux
2. ✅ Calculer les stats des jockeys/entraîneurs
3. ✅ Identifier les spécialistes (distance, terrain, météo)
4. ✅ Détecter les tendances et patterns
5. ✅ Optimiser les poids de scoring

**La météo est intégrée pour**:
1. ✅ Prédire l'état de la piste
2. ✅ Identifier les chevaux qui aiment/détestent certaines conditions
3. ✅ Ajuster les scores en temps réel
4. ✅ Éviter les mauvais paris (cheval qui déteste la pluie un jour de pluie)

**Résultat**: Pronostics basés sur des **données réelles** et **analyses statistiques**, pas du hasard ! 🎯
