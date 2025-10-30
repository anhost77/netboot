# 🔧 PLAN D'IMPLÉMENTATION - Support Complet des Paris Hippiques

## 📊 État Actuel vs Cible

### ✅ Types de paris actuellement supportés
```typescript
enum HorseBetType {
  gagnant        // ✅ Simple gagnant
  place          // ✅ Simple placé
  gagnant_place  // ✅ Couplé gagnant-placé
  couple         // ✅ Couplé
  couple_ordre   // ✅ Couplé ordre
  trio           // ✅ Trio
  trio_ordre     // ✅ Trio ordre
  tierce         // ✅ Tiercé
  tierce_ordre   // ✅ Tiercé ordre
  quarte         // ✅ Quarté
  quarte_ordre   // ✅ Quarté ordre
  quinte         // ✅ Quinté
  quinte_ordre   // ✅ Quinté ordre
  multi          // ✅ Multi
  pick5          // ✅ Pick 5
  autre          // ✅ Autre
}
```

### ❌ Types de paris MANQUANTS

```typescript
// À AJOUTER :
couple_gagnant   // Couplé Gagnant (différent de "couple")
couple_place     // Couplé Placé
deux_sur_quatre  // 2sur4
mini_multi       // Mini Multi (variante du Multi)
report_plus      // Report+
jackpot          // Jackpot
spot             // Spot
```

---

## 🎯 PHASE 1 : Mise à jour du schéma Prisma

### 1.1 Modifier l'enum `HorseBetType`

```prisma
enum HorseBetType {
  // Paris simples
  gagnant              // Simple gagnant
  place                // Simple placé
  gagnant_place        // E-Simple (Gagnant + Placé)
  
  // Paris couplés
  couple_gagnant       // Couplé Gagnant (2 premiers, ordre indifférent)
  couple_place         // Couplé Placé (2 parmi les 3 premiers)
  couple_ordre         // Couplé Ordre (2 premiers dans l'ordre)
  
  // Paris trio
  trio                 // Trio (3 premiers, ordre indifférent)
  trio_ordre           // Trio Ordre (3 premiers dans l'ordre)
  
  // Tiercé
  tierce               // Tiercé (3 premiers)
  tierce_ordre         // Tiercé Ordre
  tierce_desordre      // Tiercé Désordre
  
  // Quarté+
  quarte_plus          // Quarté+ (4 premiers)
  quarte_ordre         // Quarté+ Ordre
  quarte_desordre      // Quarté+ Désordre
  quarte_bonus         // Quarté+ Bonus (3 sur 4)
  
  // Quinté+
  quinte_plus          // Quinté+ (5 premiers)
  quinte_ordre         // Quinté+ Ordre
  quinte_desordre      // Quinté+ Désordre
  quinte_bonus_4       // Quinté+ Bonus 4sur5
  quinte_bonus_3       // Quinté+ Bonus 3
  
  // Multi
  multi                // Multi (4 à 7 chevaux dans les 4 premiers)
  mini_multi           // Mini Multi (alias)
  multi_en_4           // Multi en 4
  multi_en_5           // Multi en 5
  multi_en_6           // Multi en 6
  multi_en_7           // Multi en 7
  
  // Autres paris
  deux_sur_quatre      // 2sur4 (2 chevaux parmi les 4 premiers)
  pick5                // Pick 5 (5 premiers, ordre indifférent)
  report_plus          // Report+ (multi-courses)
  jackpot              // Jackpot
  spot                 // Spot (position précise)
  
  // Divers
  autre                // Autre type de pari
}
```

### 1.2 Créer une table de référence `BetType`

```prisma
model BetType {
  id              String   @id @default(uuid())
  code            String   @unique // Code PMU (ex: "SIMPLE_GAGNANT")
  name            String   // Nom affiché
  category        String   // "simple", "couple", "trio", "multiple"
  minHorses       Int      @map("min_horses") // Nombre min de chevaux
  maxHorses       Int      @map("max_horses") // Nombre max de chevaux
  baseStake       Decimal  @map("base_stake") @db.Decimal(10, 2) // Mise de base
  requiresOrder   Boolean  @default(false) @map("requires_order") // Si l'ordre compte
  hasBonus        Boolean  @default(false) @map("has_bonus") // Si des bonus existent
  difficulty      Int      @default(1) // Niveau 1-5
  description     String?  @db.Text // Description des règles
  active          Boolean  @default(true) // Si le pari est actif
  pmuCode         String?  @map("pmu_code") // Code utilisé par l'API PMU
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  
  @@map("bet_types")
}
```

---

## 🎯 PHASE 2 : Seed de la base de données

### 2.1 Créer un fichier seed pour les types de paris

```typescript
// backend/prisma/seeds/bet-types.seed.ts

export const betTypesData = [
  // PARIS SIMPLES
  {
    code: 'SIMPLE_GAGNANT',
    name: 'Simple Gagnant',
    category: 'simple',
    minHorses: 1,
    maxHorses: 1,
    baseStake: 1.50,
    requiresOrder: false,
    hasBonus: false,
    difficulty: 1,
    description: 'Trouver le cheval vainqueur de la course',
    pmuCode: 'SIMPLE_GAGNANT'
  },
  {
    code: 'SIMPLE_PLACE',
    name: 'Simple Placé',
    category: 'simple',
    minHorses: 1,
    maxHorses: 1,
    baseStake: 1.50,
    requiresOrder: false,
    hasBonus: false,
    difficulty: 1,
    description: 'Trouver un cheval dans les 3 premiers (ou 2 si moins de 8 partants)',
    pmuCode: 'SIMPLE_PLACE'
  },
  
  // PARIS COUPLÉS
  {
    code: 'COUPLE_GAGNANT',
    name: 'Couplé Gagnant',
    category: 'couple',
    minHorses: 2,
    maxHorses: 2,
    baseStake: 2.00,
    requiresOrder: false,
    hasBonus: false,
    difficulty: 2,
    description: 'Trouver les 2 premiers chevaux, ordre indifférent',
    pmuCode: 'COUPLE_GAGNANT'
  },
  {
    code: 'COUPLE_PLACE',
    name: 'Couplé Placé',
    category: 'couple',
    minHorses: 2,
    maxHorses: 2,
    baseStake: 2.00,
    requiresOrder: false,
    hasBonus: false,
    difficulty: 2,
    description: 'Trouver 2 chevaux parmi les 3 premiers',
    pmuCode: 'COUPLE_PLACE'
  },
  {
    code: 'COUPLE_ORDRE',
    name: 'Couplé Ordre',
    category: 'couple',
    minHorses: 2,
    maxHorses: 2,
    baseStake: 2.00,
    requiresOrder: true,
    hasBonus: false,
    difficulty: 3,
    description: 'Trouver les 2 premiers chevaux dans l\'ordre exact',
    pmuCode: 'COUPLE_ORDRE'
  },
  
  // TRIO
  {
    code: 'TRIO',
    name: 'Trio',
    category: 'trio',
    minHorses: 3,
    maxHorses: 3,
    baseStake: 2.00,
    requiresOrder: false,
    hasBonus: false,
    difficulty: 3,
    description: 'Trouver les 3 premiers chevaux, ordre indifférent',
    pmuCode: 'TRIO'
  },
  {
    code: 'TRIO_ORDRE',
    name: 'Trio Ordre',
    category: 'trio',
    minHorses: 3,
    maxHorses: 3,
    baseStake: 2.00,
    requiresOrder: true,
    hasBonus: false,
    difficulty: 4,
    description: 'Trouver les 3 premiers chevaux dans l\'ordre exact',
    pmuCode: 'TRIO_ORDRE'
  },
  
  // TIERCÉ
  {
    code: 'TIERCE',
    name: 'Tiercé',
    category: 'tierce',
    minHorses: 3,
    maxHorses: 3,
    baseStake: 1.00,
    requiresOrder: false,
    hasBonus: true,
    difficulty: 3,
    description: 'Trouver les 3 premiers chevaux (ordre ou désordre)',
    pmuCode: 'TIERCE'
  },
  
  // QUARTÉ+
  {
    code: 'QUARTE_PLUS',
    name: 'Quarté+',
    category: 'quarte',
    minHorses: 4,
    maxHorses: 4,
    baseStake: 1.50,
    requiresOrder: false,
    hasBonus: true,
    difficulty: 4,
    description: 'Trouver les 4 premiers chevaux (ordre, désordre ou bonus 3)',
    pmuCode: 'QUARTE_PLUS'
  },
  
  // QUINTÉ+
  {
    code: 'QUINTE_PLUS',
    name: 'Quinté+',
    category: 'quinte',
    minHorses: 5,
    maxHorses: 5,
    baseStake: 2.00,
    requiresOrder: false,
    hasBonus: true,
    difficulty: 5,
    description: 'Trouver les 5 premiers chevaux (ordre, désordre, bonus 4 ou bonus 3)',
    pmuCode: 'QUINTE_PLUS'
  },
  
  // 2SUR4
  {
    code: 'DEUX_SUR_QUATRE',
    name: '2sur4',
    category: 'multiple',
    minHorses: 2,
    maxHorses: 2,
    baseStake: 3.00,
    requiresOrder: false,
    hasBonus: false,
    difficulty: 2,
    description: 'Trouver 2 chevaux parmi les 4 premiers, ordre indifférent',
    pmuCode: 'DEUX_SUR_QUATRE'
  },
  
  // MULTI
  {
    code: 'MINI_MULTI',
    name: 'Mini Multi',
    category: 'multiple',
    minHorses: 4,
    maxHorses: 7,
    baseStake: 3.00,
    requiresOrder: false,
    hasBonus: true,
    difficulty: 3,
    description: 'Choisir 4 à 7 chevaux qui doivent tous arriver dans les 4 premiers',
    pmuCode: 'MULTI'
  },
  
  // PICK 5
  {
    code: 'PICK5',
    name: 'Pick 5',
    category: 'multiple',
    minHorses: 5,
    maxHorses: 5,
    baseStake: 2.00,
    requiresOrder: false,
    hasBonus: false,
    difficulty: 4,
    description: 'Trouver les 5 premiers chevaux, ordre indifférent',
    pmuCode: 'PICK5'
  }
];
```

---

## 🎯 PHASE 3 : Mise à jour du service PMU

### 3.1 Mapper les codes PMU aux types de paris

```typescript
// backend/src/pmu/pmu-data.service.ts

private mapPmuBetTypeToAppBetType(pmuBetType: string): string {
  const mapping: Record<string, string> = {
    'SIMPLE_GAGNANT': 'gagnant',
    'SIMPLE_PLACE': 'place',
    'COUPLE_GAGNANT': 'couple_gagnant',
    'COUPLE_PLACE': 'couple_place',
    'COUPLE_ORDRE': 'couple_ordre',
    'TRIO': 'trio',
    'TRIO_ORDRE': 'trio_ordre',
    'TIERCE': 'tierce',
    'QUARTE_PLUS': 'quarte_plus',
    'QUINTE_PLUS': 'quinte_plus',
    'DEUX_SUR_QUATRE': 'deux_sur_quatre',
    'MULTI': 'multi',
    'MINI_MULTI': 'mini_multi',
    'PICK5': 'pick5',
  };
  
  return mapping[pmuBetType] || 'autre';
}
```

### 3.2 Améliorer `getOddsForBet` pour tous les types

```typescript
async getOddsForBet(
  raceId: string,
  betType: string,
  horsesSelected: string,
): Promise<number | null> {
  // ... code existant ...
  
  // Mapping complet des types de paris
  let targetBetType = '';
  switch (betType?.toLowerCase()) {
    case 'gagnant':
    case 'simple_gagnant':
      targetBetType = 'SIMPLE_GAGNANT';
      break;
    case 'place':
    case 'simple_place':
      targetBetType = 'SIMPLE_PLACE';
      break;
    case 'couple_gagnant':
      targetBetType = 'COUPLE_GAGNANT';
      break;
    case 'couple_place':
      targetBetType = 'COUPLE_PLACE';
      break;
    case 'couple_ordre':
      targetBetType = 'COUPLE_ORDRE';
      break;
    case 'trio':
      targetBetType = 'TRIO';
      break;
    case 'trio_ordre':
      targetBetType = 'TRIO_ORDRE';
      break;
    case 'tierce':
      targetBetType = 'TIERCE';
      break;
    case 'quarte':
    case 'quarte_plus':
      targetBetType = 'QUARTE_PLUS';
      break;
    case 'quinte':
    case 'quinte_plus':
      targetBetType = 'QUINTE_PLUS';
      break;
    case 'deux_sur_quatre':
    case '2sur4':
      targetBetType = 'DEUX_SUR_QUATRE';
      break;
    case 'multi':
    case 'mini_multi':
      targetBetType = 'MULTI';
      break;
    case 'pick5':
      targetBetType = 'PICK5';
      break;
    default:
      this.logger.warn(`Unknown bet type: ${betType}`);
      return null;
  }
  
  // ... reste du code ...
}
```

---

## 🎯 PHASE 4 : Frontend - Formulaire de pari

### 4.1 Dropdown avec tous les types

```typescript
// frontend/components/bets/bet-form.tsx

const BET_TYPES = [
  { value: 'gagnant', label: 'Simple Gagnant', minHorses: 1, maxHorses: 1 },
  { value: 'place', label: 'Simple Placé', minHorses: 1, maxHorses: 1 },
  { value: 'couple_gagnant', label: 'Couplé Gagnant', minHorses: 2, maxHorses: 2 },
  { value: 'couple_place', label: 'Couplé Placé', minHorses: 2, maxHorses: 2 },
  { value: 'couple_ordre', label: 'Couplé Ordre', minHorses: 2, maxHorses: 2 },
  { value: 'trio', label: 'Trio', minHorses: 3, maxHorses: 3 },
  { value: 'trio_ordre', label: 'Trio Ordre', minHorses: 3, maxHorses: 3 },
  { value: 'tierce', label: 'Tiercé', minHorses: 3, maxHorses: 3 },
  { value: 'deux_sur_quatre', label: '2sur4', minHorses: 2, maxHorses: 2 },
  { value: 'multi', label: 'Multi', minHorses: 4, maxHorses: 7 },
  { value: 'quarte_plus', label: 'Quarté+', minHorses: 4, maxHorses: 4 },
  { value: 'quinte_plus', label: 'Quinté+', minHorses: 5, maxHorses: 5 },
  { value: 'pick5', label: 'Pick 5', minHorses: 5, maxHorses: 5 },
];
```

### 4.2 Validation dynamique

```typescript
const selectedBetType = BET_TYPES.find(bt => bt.value === formData.betType);
const horsesCount = formData.horsesSelected?.split(',').length || 0;

if (selectedBetType && horsesCount < selectedBetType.minHorses) {
  errors.push(`Ce type de pari nécessite au minimum ${selectedBetType.minHorses} cheval(x)`);
}
```

---

## 🎯 PHASE 5 : Migration

### 5.1 Créer la migration

```bash
npx prisma migrate dev --name add_all_bet_types
```

### 5.2 Exécuter le seed

```bash
npx prisma db seed
```

---

## ✅ CHECKLIST D'IMPLÉMENTATION

- [ ] Mettre à jour l'enum `HorseBetType` dans `schema.prisma`
- [ ] Créer la table `BetType` (optionnel mais recommandé)
- [ ] Créer le fichier seed avec tous les types de paris
- [ ] Mettre à jour `pmu-data.service.ts` avec le mapping complet
- [ ] Mettre à jour le formulaire frontend avec tous les types
- [ ] Ajouter la validation dynamique selon le type de pari
- [ ] Mettre à jour les labels d'affichage dans `getBetTypeLabel()`
- [ ] Tester chaque type de pari avec des données réelles PMU
- [ ] Documenter les règles de chaque type pour les utilisateurs
- [ ] Ajouter des tooltips explicatifs dans l'interface

---

## 📊 PRIORITÉS

### 🔴 Priorité HAUTE (à faire immédiatement)
1. **Couplé Gagnant** et **Couplé Placé** (très utilisés)
2. **2sur4** (facile à gagner, populaire)
3. **Mini Multi** (variante du Multi)

### 🟡 Priorité MOYENNE
4. Trio Ordre
5. Tiercé (avec variantes ordre/désordre)
6. Quarté+ (avec bonus)

### 🟢 Priorité BASSE
7. Pick 5
8. Report+
9. Jackpot
10. Spot

---

**Estimation du temps de développement** : 2-3 jours
**Impact utilisateur** : ⭐⭐⭐⭐⭐ (Critique - beaucoup d'utilisateurs concernés)
