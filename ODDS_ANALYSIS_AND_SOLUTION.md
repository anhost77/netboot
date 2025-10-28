# 🎯 Analyse du Problème des Cotes et Solution

## 📊 Problème Identifié

**Situation actuelle :**
- Les utilisateurs peuvent parier sur différentes plateformes (PMU, Betclic, Unibet, etc.)
- Chaque plateforme a ses propres cotes qui peuvent varier
- Le système automatique récupère uniquement les cotes PMU officielles
- **Risque** : Si un utilisateur parie sur Betclic avec une cote de 5.0, mais que le PMU affiche 3.5, le calcul du gain sera faux

## 🔍 Endroits où les Cotes sont Gérées

### 1. **Création du Pari** (`/backend/src/bets/bets.service.ts`)
- L'utilisateur saisit manuellement la cote lors de la création du pari
- La cote est stockée dans `bet.odds`
- **Problème** : Cette cote peut être différente de la cote PMU officielle

### 2. **Mise à Jour Automatique** (`/backend/src/pmu/pmu-auto-update.service.ts`)
- Cron job toutes les 10 minutes (ligne 27)
- Fonction `updateBetStatus()` (ligne 70)
- **ÉCRASE la cote saisie** par la cote PMU (lignes 119-132)
```typescript
if (isWon) {
  const pmuOdds = await this.pmuDataService.getOddsForBet(...);
  if (pmuOdds) {
    odds = pmuOdds;  // ❌ ÉCRASE la cote originale !
    payout = bet.stake * pmuOdds;
  }
}
```

### 3. **Récupération des Cotes PMU** (`/backend/src/pmu/pmu-data.service.ts`)
- Fonction `getOddsForBet()` (ligne 261)
- Récupère les rapports PMU officiels
- Cherche la combinaison gagnante dans les rapports

### 4. **Stockage en Base de Données**
- Table `Bet` :
  - `odds` : Cote du pari (peut être modifiée)
  - `payout` : Gain calculé
  - `profit` : Profit/perte
  - `platform` : Plateforme de pari (PMU, Betclic, etc.)

## ⚠️ Problèmes Critiques

### Problème 1 : Écrasement des Cotes
```
Scénario :
1. User parie 10€ sur Betclic à cote 5.0 → gain attendu : 50€
2. Cron job vérifie le résultat
3. PMU affiche cote 3.5
4. Système ÉCRASE 5.0 par 3.5 → gain calculé : 35€
5. User perd 15€ de gain légitime ❌
```

### Problème 2 : Pas de Traçabilité
- Impossible de savoir quelle était la cote originale après écrasement
- Pas d'historique des modifications de cotes
- Pas de distinction entre cote saisie et cote PMU

### Problème 3 : Incohérence Multi-Plateformes
- Les paris non-PMU sont traités avec des cotes PMU
- Les plateformes tierces ont des cotes différentes
- Pas de validation de la source de la cote

## ✅ Solution Proposée

### Solution 1 : Ajouter des Champs de Traçabilité (RECOMMANDÉ)

**Modifier le schéma Prisma :**
```prisma
model Bet {
  // ... champs existants
  odds                  Decimal?        @db.Decimal(10, 2)  // Cote ORIGINALE saisie par l'user
  oddsSource            String?         @map("odds_source")  // "PMU", "Betclic", "Unibet", "manual"
  finalOdds             Decimal?        @db.Decimal(10, 2) @map("final_odds")  // Cote FINALE utilisée pour le calcul
  finalOddsSource       String?         @map("final_odds_source")  // Source de la cote finale
  oddsUpdatedAt         DateTime?       @map("odds_updated_at")  // Date de mise à jour des cotes
  useOriginalOdds       Boolean         @default(false) @map("use_original_odds")  // Flag pour forcer l'utilisation de la cote originale
}
```

**Logique de mise à jour :**
```typescript
// Dans pmu-auto-update.service.ts
private async updateBetStatus(bet: any) {
  // ... code existant ...
  
  let finalOdds = bet.odds;  // Par défaut, utiliser la cote originale
  let finalOddsSource = bet.oddsSource || 'manual';
  
  if (isWon) {
    // Récupérer la cote PMU
    const pmuOdds = await this.pmuDataService.getOddsForBet(...);
    
    // RÈGLE DE DÉCISION :
    if (bet.platform === 'PMU' || bet.platform === null) {
      // Si pari PMU, utiliser la cote PMU officielle
      if (pmuOdds) {
        finalOdds = pmuOdds;
        finalOddsSource = 'PMU_official';
      }
    } else if (bet.useOriginalOdds === true) {
      // Si l'utilisateur a forcé l'utilisation de sa cote
      finalOdds = bet.odds;
      finalOddsSource = bet.oddsSource || 'manual';
    } else {
      // Sinon, comparer et prendre la plus favorable pour l'utilisateur
      if (pmuOdds && pmuOdds > bet.odds) {
        finalOdds = pmuOdds;
        finalOddsSource = 'PMU_official_better';
      } else {
        finalOdds = bet.odds;
        finalOddsSource = bet.oddsSource || 'manual_better';
      }
    }
    
    payout = bet.stake * finalOdds;
  }
  
  // Mise à jour avec traçabilité
  await this.prisma.bet.update({
    where: { id: bet.id },
    data: {
      status: newStatus,
      finalOdds: finalOdds,
      finalOddsSource: finalOddsSource,
      oddsUpdatedAt: new Date(),
      payout: payout || null,
      profit: profit !== null ? profit : null,
    },
  });
}
```

### Solution 2 : Historique des Cotes (OPTIONNEL)

**Créer une table d'audit :**
```prisma
model BetOddsHistory {
  id          String   @id @default(uuid())
  betId       String   @map("bet_id")
  odds        Decimal  @db.Decimal(10, 2)
  source      String   // "PMU", "Betclic", "manual", etc.
  reason      String   // "initial", "auto_update", "manual_correction"
  createdAt   DateTime @default(now()) @map("created_at")
  
  bet         Bet      @relation(fields: [betId], references: [id], onDelete: Cascade)
  
  @@index([betId])
  @@map("bet_odds_history")
}
```

### Solution 3 : Configuration par Plateforme

**Ajouter une table de configuration :**
```prisma
model BettingPlatform {
  id                String   @id @default(uuid())
  code              String   @unique  // "PMU", "BETCLIC", "UNIBET"
  name              String
  useOfficialOdds   Boolean  @default(false)  // Utiliser les cotes officielles PMU ?
  trustUserOdds     Boolean  @default(true)   // Faire confiance aux cotes saisies ?
  oddsVerification  String   @default("none") // "none", "compare", "strict"
  active            Boolean  @default(true)
  
  @@map("betting_platforms")
}
```

## 🎯 Plan d'Action Recommandé

### Phase 1 : Migration Immédiate (Urgent)
1. ✅ Ajouter les champs `finalOdds`, `finalOddsSource`, `oddsSource`, `useOriginalOdds`
2. ✅ Créer une migration Prisma
3. ✅ Modifier `pmu-auto-update.service.ts` pour NE PLUS ÉCRASER `odds`
4. ✅ Utiliser `finalOdds` pour les calculs de payout

### Phase 2 : Amélioration (Court terme)
1. ✅ Ajouter un sélecteur de plateforme dans le formulaire de création de pari
2. ✅ Implémenter la logique de comparaison des cotes
3. ✅ Ajouter des logs détaillés sur les décisions de cotes
4. ✅ Créer un endpoint admin pour corriger manuellement les cotes

### Phase 3 : Audit (Moyen terme)
1. ✅ Créer la table `BetOddsHistory`
2. ✅ Logger tous les changements de cotes
3. ✅ Dashboard admin pour voir les écarts de cotes
4. ✅ Alertes si écart > 20% entre cote user et cote PMU

### Phase 4 : Multi-Plateformes (Long terme)
1. ✅ Intégrer les APIs des autres bookmakers (Betclic, Unibet, etc.)
2. ✅ Récupérer automatiquement les cotes de chaque plateforme
3. ✅ Comparateur de cotes en temps réel
4. ✅ Suggestions de meilleures cotes

## 🚨 Actions Immédiates

### 1. Arrêter l'écrasement des cotes
```bash
# Désactiver temporairement le cron job
# Dans pmu-auto-update.service.ts, commenter la ligne 27
# @Cron(CronExpression.EVERY_10_MINUTES, {
```

### 2. Audit des paris existants
```sql
-- Identifier les paris avec écart de cotes suspect
SELECT 
  id, 
  platform, 
  odds, 
  payout, 
  stake,
  (payout / stake) as calculated_odds,
  ABS(odds - (payout / stake)) as odds_difference
FROM bets
WHERE status = 'won'
  AND odds IS NOT NULL
  AND payout IS NOT NULL
  AND ABS(odds - (payout / stake)) > 0.5
ORDER BY odds_difference DESC;
```

### 3. Communication aux utilisateurs
- Informer les utilisateurs du problème détecté
- Proposer une révision des gains des 30 derniers jours
- Rembourser les écarts si nécessaire

## 📝 Exemple de Migration

```typescript
// prisma/migrations/XXX_add_odds_tracking/migration.sql
-- Add new columns for odds tracking
ALTER TABLE "bets" ADD COLUMN "odds_source" TEXT;
ALTER TABLE "bets" ADD COLUMN "final_odds" DECIMAL(10,2);
ALTER TABLE "bets" ADD COLUMN "final_odds_source" TEXT;
ALTER TABLE "bets" ADD COLUMN "odds_updated_at" TIMESTAMP;
ALTER TABLE "bets" ADD COLUMN "use_original_odds" BOOLEAN DEFAULT false;

-- Migrate existing data
UPDATE "bets" 
SET 
  "final_odds" = "odds",
  "final_odds_source" = CASE 
    WHEN "platform" = 'PMU' THEN 'PMU_official'
    ELSE 'manual'
  END,
  "odds_source" = COALESCE("platform", 'manual')
WHERE "odds" IS NOT NULL;
```

## 🎓 Bonnes Pratiques

1. **Toujours préserver la cote originale** - C'est un contrat avec l'utilisateur
2. **Tracer toutes les modifications** - Audit trail complet
3. **Privilégier la cote la plus favorable** - En cas de doute, favoriser l'utilisateur
4. **Valider les sources** - Vérifier que la plateforme existe et est active
5. **Alerter sur les écarts** - Si écart > 20%, notifier un admin
6. **Documenter les décisions** - Logger pourquoi telle cote a été choisie

## 📊 Métriques à Suivre

- Nombre de paris avec écart de cotes > 10%
- Montant total des écarts de gains
- Taux de paris multi-plateformes
- Fiabilité des cotes PMU vs autres plateformes
- Temps de mise à jour des résultats

---

**Priorité : CRITIQUE** 🔴
**Impact : HAUT** - Affecte directement les gains des utilisateurs
**Effort : MOYEN** - Nécessite migration DB + modifications code
**Délai recommandé : 48h** pour la phase 1
