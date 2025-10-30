# 📋 GUIDE COMPLET DES TYPES DE PARIS HIPPIQUES PMU

## 🎯 Vue d'ensemble

Ce document liste **TOUS** les types de paris hippiques disponibles au PMU avec leurs règles, calculs de gains et implémentation technique.

---

## 1️⃣ PARIS SIMPLES (1 cheval)

### 🏆 SIMPLE GAGNANT
- **Règle** : Trouver le cheval vainqueur de la course
- **Mise de base** : 1.50€ ou 2.00€
- **Gain** : Mise × Cote du cheval gagnant
- **Exemple** : Cheval 7 gagne à 3.30€ → Gain = 2€ × 3.30 = 6.60€
- **Code PMU** : `SIMPLE_GAGNANT`

### 🥉 SIMPLE PLACÉ
- **Règle** : Trouver un cheval dans les 3 premiers (ou 2 premiers si moins de 8 partants)
- **Mise de base** : 1.50€ ou 2.00€
- **Gain** : Mise × Cote placé (généralement plus faible que gagnant)
- **Exemple** : Cheval 7 arrive 2ème à 1.90€ → Gain = 2€ × 1.90 = 3.80€
- **Code PMU** : `SIMPLE_PLACE`

### 🎲 GAGNANT-PLACÉ (E-SIMPLE)
- **Règle** : Combinaison automatique Gagnant + Placé sur le même cheval
- **Mise de base** : 3.00€ (1.50€ gagnant + 1.50€ placé)
- **Gain** : Somme des deux paris si gagnant, sinon uniquement le placé
- **Code PMU** : `E_SIMPLE` ou `GAGNANT_PLACE`

---

## 2️⃣ PARIS COUPLÉS (2 chevaux)

### 🥇🥈 COUPLÉ GAGNANT
- **Règle** : Trouver les 2 premiers chevaux, ordre indifférent
- **Mise de base** : 2.00€
- **Gain** : Mise × Rapport couplé gagnant
- **Exemple** : 7-5 arrivent 1er et 2ème → Rapport 10.70€ → Gain = 2€ × 10.70 = 21.40€
- **Code PMU** : `COUPLE_GAGNANT`

### 🎯 COUPLÉ PLACÉ
- **Règle** : Trouver 2 chevaux parmi les 3 premiers (ou 2 premiers si moins de 8 partants)
- **Mise de base** : 2.00€
- **Gain** : Mise × Rapport couplé placé (3 combinaisons gagnantes possibles)
- **Exemple** : 7-5 dans les 3 premiers → Rapport 4.80€ → Gain = 2€ × 4.80 = 9.60€
- **Code PMU** : `COUPLE_PLACE`

### 📍 COUPLÉ ORDRE
- **Règle** : Trouver les 2 premiers chevaux dans l'ordre exact
- **Mise de base** : 2.00€
- **Gain** : Mise × Rapport couplé ordre (plus élevé que gagnant)
- **Code PMU** : `COUPLE_ORDRE`

---

## 3️⃣ PARIS TRIO (3 chevaux)

### 🥇🥈🥉 TRIO
- **Règle** : Trouver les 3 premiers chevaux, ordre indifférent
- **Mise de base** : 2.00€
- **Gain** : Mise × Rapport trio
- **Exemple** : 7-5-12 dans les 3 premiers → Rapport variable selon combinaison
- **Code PMU** : `TRIO`

### 📍 TRIO ORDRE
- **Règle** : Trouver les 3 premiers chevaux dans l'ordre exact
- **Mise de base** : 2.00€
- **Gain** : Mise × Rapport trio ordre (beaucoup plus élevé)
- **Code PMU** : `TRIO_ORDRE`

---

## 4️⃣ TIERCÉ

### 🎰 TIERCÉ
- **Règle** : Trouver les 3 premiers chevaux
- **Mise de base** : 1.00€
- **Gains** :
  - **Ordre** : Les 3 chevaux dans l'ordre exact (rapport le plus élevé)
  - **Désordre** : Les 3 chevaux mais pas dans l'ordre (rapport moyen)
- **Code PMU** : `TIERCE` (avec variantes `TIERCE_ORDRE` et `TIERCE_DESORDRE`)

---

## 5️⃣ QUARTÉ+

### 🎯 QUARTÉ+
- **Règle** : Trouver les 4 premiers chevaux
- **Mise de base** : 1.50€
- **Gains** :
  - **Ordre** : Les 4 chevaux dans l'ordre exact
  - **Désordre** : Les 4 chevaux mais pas dans l'ordre
  - **Bonus 3** : 3 des 4 chevaux dans les 4 premiers (lot de consolation)
- **Code PMU** : `QUARTE_PLUS`

---

## 6️⃣ QUINTÉ+

### 🏆 QUINTÉ+ (Le pari phare du PMU)
- **Règle** : Trouver les 5 premiers chevaux
- **Mise de base** : 2.00€
- **Gains** :
  - **Ordre** : Les 5 chevaux dans l'ordre exact (jackpot)
  - **Désordre** : Les 5 chevaux mais pas dans l'ordre
  - **Bonus 4sur5** : 4 des 5 chevaux dans les 5 premiers (5 combinaisons possibles)
  - **Bonus 3** : 3 des 5 chevaux dans les 5 premiers
- **Code PMU** : `QUINTE_PLUS`

---

## 7️⃣ MULTI

### 🎲 MINI MULTI
- **Règle** : Choisir 4 chevaux minimum, ils doivent tous arriver dans les 4 premiers
- **Mise de base** : 3.00€
- **Chevaux sélectionnés** : 4, 5, 6 ou 7 chevaux
- **Gains variables selon** :
  - **Multi en 4** : 4 chevaux choisis, tous dans les 4 premiers
  - **Multi en 5** : 5 chevaux choisis, tous dans les 4 premiers
  - **Multi en 6** : 6 chevaux choisis, tous dans les 4 premiers
  - **Multi en 7** : 7 chevaux choisis, tous dans les 4 premiers
- **Exemple** : 7-5-12-13 tous dans les 4 premiers → Multi en 4 = 31.50€
- **Code PMU** : `MULTI` ou `MINI_MULTI`

---

## 8️⃣ 2SUR4

### 🎯 DEUX SUR QUATRE
- **Règle** : Choisir 2 chevaux qui doivent être parmi les 4 premiers, ordre indifférent
- **Mise de base** : 3.00€
- **Gain** : Mise × Rapport 2sur4 (généralement faible car facile à gagner)
- **Exemple** : 7-5 dans les 4 premiers → Rapport 1.70€ → Gain = 3€ × 1.70 = 5.10€
- **Particularité** : 6 combinaisons gagnantes possibles avec 4 chevaux arrivés
- **Code PMU** : `DEUX_SUR_QUATRE`

---

## 9️⃣ PICK 5

### 🎰 PICK 5
- **Règle** : Trouver les 5 premiers chevaux d'une course, ordre indifférent
- **Mise de base** : 2.00€
- **Gain** : Mise × Rapport Pick 5 (très variable)
- **Particularité** : Similaire au Quinté+ désordre mais avec des rapports différents
- **Code PMU** : `PICK5`

---

## 🔟 REPORT+ (Spécial)

### 📊 REPORT+
- **Règle** : Pari sur plusieurs courses consécutives (généralement 7 courses)
- **Objectif** : Trouver le gagnant de chaque course
- **Mise de base** : Variable
- **Gain** : Jackpot progressif si toutes les courses sont trouvées
- **Code PMU** : `REPORT_PLUS`

---

## 🎲 AUTRES PARIS SPÉCIAUX

### 🌟 JACKPOT
- **Règle** : Pari à cagnotte progressive sur plusieurs jours
- **Code PMU** : `JACKPOT`

### 🎯 SPOT
- **Règle** : Trouver le cheval qui arrivera à une position précise (ex: 3ème)
- **Code PMU** : `SPOT`

---

## 📊 TABLEAU RÉCAPITULATIF

| Type de pari | Chevaux | Ordre | Mise base | Difficulté | Code PMU |
|-------------|---------|-------|-----------|------------|----------|
| Simple Gagnant | 1 | Non | 1.50-2€ | ⭐ | SIMPLE_GAGNANT |
| Simple Placé | 1 | Non | 1.50-2€ | ⭐ | SIMPLE_PLACE |
| Couplé Gagnant | 2 | Non | 2€ | ⭐⭐ | COUPLE_GAGNANT |
| Couplé Placé | 2 | Non | 2€ | ⭐⭐ | COUPLE_PLACE |
| Couplé Ordre | 2 | Oui | 2€ | ⭐⭐⭐ | COUPLE_ORDRE |
| Trio | 3 | Non | 2€ | ⭐⭐⭐ | TRIO |
| Trio Ordre | 3 | Oui | 2€ | ⭐⭐⭐⭐ | TRIO_ORDRE |
| Tiercé | 3 | Oui/Non | 1€ | ⭐⭐⭐ | TIERCE |
| 2sur4 | 2/4 | Non | 3€ | ⭐⭐ | DEUX_SUR_QUATRE |
| Multi | 4-7 | Non | 3€ | ⭐⭐⭐ | MINI_MULTI |
| Quarté+ | 4 | Oui/Non | 1.50€ | ⭐⭐⭐⭐ | QUARTE_PLUS |
| Quinté+ | 5 | Oui/Non | 2€ | ⭐⭐⭐⭐⭐ | QUINTE_PLUS |
| Pick 5 | 5 | Non | 2€ | ⭐⭐⭐⭐ | PICK5 |

---

## 🔧 IMPLÉMENTATION TECHNIQUE

### Structure de données recommandée

```typescript
interface BetType {
  code: string;              // Code PMU (ex: "SIMPLE_GAGNANT")
  name: string;              // Nom affiché (ex: "Simple Gagnant")
  minHorses: number;         // Nombre minimum de chevaux
  maxHorses: number;         // Nombre maximum de chevaux
  baseStake: number;         // Mise de base en euros
  requiresOrder: boolean;    // Si l'ordre compte
  hasBonus: boolean;         // Si des bonus existent
  difficulty: number;        // Niveau de difficulté (1-5)
  description: string;       // Description des règles
}
```

### Calcul des gains

```typescript
function calculateWinnings(
  betType: string,
  stake: number,
  odds: number,
  isOrder: boolean = false
): number {
  // Gain de base
  let winnings = stake * odds;
  
  // Ajustements selon le type de pari
  switch(betType) {
    case 'QUINTE_PLUS':
      // Bonus possibles : ordre, désordre, bonus 4, bonus 3
      break;
    case 'QUARTE_PLUS':
      // Bonus possibles : ordre, désordre, bonus 3
      break;
    // ... autres cas
  }
  
  return winnings;
}
```

---

## ✅ RECOMMANDATIONS POUR VOTRE APPLICATION

### 1. **Base de données**
Ajoutez une table `bet_types` avec tous les types de paris :

```sql
CREATE TABLE bet_types (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  min_horses INT NOT NULL,
  max_horses INT NOT NULL,
  base_stake DECIMAL(10,2) NOT NULL,
  requires_order BOOLEAN DEFAULT FALSE,
  has_bonus BOOLEAN DEFAULT FALSE,
  difficulty INT DEFAULT 1,
  description TEXT,
  active BOOLEAN DEFAULT TRUE
);
```

### 2. **Interface utilisateur**
- Dropdown avec tous les types de paris
- Aide contextuelle expliquant les règles
- Calculateur de gains estimés
- Validation du nombre de chevaux selon le type

### 3. **Récupération des rapports PMU**
L'API PMU retourne les rapports avec les codes suivants :
- `SIMPLE_GAGNANT`
- `SIMPLE_PLACE`
- `COUPLE_GAGNANT`
- `COUPLE_PLACE`
- `DEUX_SUR_QUATRE`
- `TRIO`
- `TIERCE`
- `QUARTE_PLUS`
- `QUINTE_PLUS`
- `MINI_MULTI` ou `MULTI`
- `PICK5`

### 4. **Gestion des combinaisons**
Pour les paris complexes (Multi, 2sur4), il peut y avoir plusieurs combinaisons gagnantes.
Exemple : 2sur4 avec 4 chevaux arrivés = 6 combinaisons possibles (C(4,2) = 6)

---

## 📝 NOTES IMPORTANTES

1. **Chevaux non-partants** : Si un cheval ne part pas, le pari peut être remboursé ou recalculé selon les règles PMU
2. **Rapports pour 1€** : Les rapports PMU sont donnés "pour 1€" (dividendePourUnEuro)
3. **Mise de base** : Attention, certains paris ont une mise de base différente (1€, 1.50€, 2€, 3€)
4. **Flexi** : Option PMU permettant de réduire la mise en acceptant un gain proportionnel

---

**Date de création** : 29 octobre 2025
**Source** : PMU.fr, Equidia.fr, Kelbet.com
