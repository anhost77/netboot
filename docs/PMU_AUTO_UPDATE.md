# 🤖 Système de Mise à Jour Automatique des Paris PMU

## 📋 Vue d'ensemble

Le système de mise à jour automatique permet de :
- ✅ Vérifier automatiquement les résultats des courses PMU
- ✅ Mettre à jour le statut des paris (gagné/perdu) automatiquement
- ✅ Calculer les profits/pertes
- ✅ Envoyer des notifications aux utilisateurs
- ✅ Fonctionner en arrière-plan 24/7

## ⚙️ Configuration

### Cron Jobs Configurés

#### Vérification des paris en attente
- **Fréquence** : Toutes les 10 minutes
- **Fonction** : `checkPendingBets()`
- **Description** : Vérifie tous les paris en attente liés à une course PMU et met à jour leur statut

**Note** : Aucune course n'est supprimée automatiquement. Toutes les données PMU sont conservées.

## 🔄 Fonctionnement

### Étape 1 : Détection des paris à vérifier
Le système récupère tous les paris qui :
- Ont le statut `pending`
- Sont liés à une course PMU (`pmuRaceId` non null)

### Étape 2 : Vérification de la course
Pour chaque pari, le système vérifie :
- Si la course est passée (au moins 15 minutes après la date de la course)
- Si les résultats sont disponibles

**Système de réessai** : Si les résultats ne sont pas encore disponibles, le pari reste en `pending` et sera revérifié au prochain cycle (15 minutes plus tard), et ainsi de suite jusqu'à ce que les résultats soient publiés.

### Étape 3 : Récupération des résultats
- Appel à l'API PMU pour récupérer les rapports définitifs
- Mise à jour des cotes et positions d'arrivée des chevaux
- Sauvegarde de tous les rapports en base de données

### Étape 4 : Détermination du résultat
Le système analyse le type de pari et vérifie si les conditions sont remplies :

#### Simple Gagnant
- Le cheval doit être 1er

#### Simple Placé
- Le cheval doit être dans les 3 premiers

#### Gagnant-Placé
- Gagné si 1er, placé si dans les 3 premiers

#### Couplé Gagnant
- Les 2 chevaux doivent être 1er et 2ème

#### Trio
- Les 3 chevaux doivent être dans les 3 premiers

### Étape 5 : Récupération automatique des cotes
**Pour les paris gagnés uniquement** :
- Récupération de la cote réelle depuis les rapports PMU
- Sélection de la bonne cote selon le type de pari :
  - **Simple Gagnant** → Cote du cheval gagnant
  - **Simple Placé** → Cote du cheval placé
  - **Couplé Gagnant** → Cote de la combinaison 1er-2ème
  - **Trio** → Cote des 3 premiers
  - etc.
- Calcul automatique du payout : `payout = stake × odds`

### Étape 6 : Mise à jour du pari
- Statut mis à jour : `won` ou `lost`
- Cote mise à jour avec la valeur PMU (si gagné)
- Payout calculé automatiquement (si gagné)
- Calcul du profit/perte selon la même logique que les boutons manuels :
  - **Si gagné** : `profit = payout - stake`
  - **Si perdu** : `profit = -stake`

### Étape 6 : Notification
Envoi automatique de :
- 📧 **Email** avec les détails du résultat
- 📱 **Notification push** sur l'application mobile
- 🔔 **Notification dans l'interface** web

## 📊 Exemple de Notification

### Email gagné
```
🎉 Pari gagné !

Félicitations ! Votre pari sur COMPIEGNE est gagné ! Profit: 15.50€

Détails du pari:
- Hippodrome: COMPIEGNE
- Course: R2C2
- Chevaux: 4 - HOMO DEUS
- Mise: 5€
- Cote: 12.10
- Résultat: Gagné ✅
- Profit/Perte: 15.50€
```

### Email perdu
```
😔 Pari perdu

Votre pari sur COMPIEGNE n'a malheureusement pas été gagnant. Perte: 5.00€

Détails du pari:
- Hippodrome: COMPIEGNE
- Course: R2C2
- Chevaux: 7 - MISTER GATZ
- Mise: 5€
- Cote: 8.50
- Résultat: Perdu ❌
- Profit/Perte: -5.00€
```

## 🛠️ Administration

### Désactiver temporairement
Pour désactiver temporairement le système, commentez le décorateur `@Cron()` dans le fichier `pmu-auto-update.service.ts`

### Modifier la fréquence
Changez la valeur dans le décorateur :
```typescript
@Cron(CronExpression.EVERY_10_MINUTES) // Toutes les 10 minutes
@Cron(CronExpression.EVERY_5_MINUTES)  // Toutes les 5 minutes
@Cron(CronExpression.EVERY_HOUR)       // Toutes les heures
```

### Forcer une vérification manuelle
Créez un endpoint pour déclencher manuellement :
```typescript
@Get('admin/check-bets')
async manualCheck() {
  await this.pmuAutoUpdateService.checkPendingBets();
  return { message: 'Check completed' };
}
```

## 📈 Logs

Le système génère des logs détaillés :

```
🔄 Starting automatic bet status update...
Found 5 pending bets to check
✅ Updated bet abc123: won (profit: 15.50€)
📧 Notification sent to user xyz789 for bet abc123
✅ Automatic bet status update completed
```

## 🔒 Sécurité

- ✅ Le système ne modifie que les paris en statut `pending`
- ✅ Les paris déjà terminés (`won`/`lost`) ne sont jamais modifiés
- ✅ Chaque modification est loggée
- ✅ Les erreurs sont capturées et loggées sans bloquer le système

## 🚀 Avantages

1. **Automatisation complète** : Plus besoin de mettre à jour manuellement les paris
2. **Notifications en temps réel** : Les utilisateurs sont informés immédiatement
3. **Fiabilité** : Le système fonctionne 24/7 même si personne n'est connecté
4. **Traçabilité** : Tous les changements sont loggés
5. **Performance** : Traitement par lots toutes les 10 minutes

## 📝 Notes

- Le système attend au moins 2 heures après la course avant de vérifier les résultats
- Les courses sans résultats disponibles sont ignorées et revérifiées au prochain cycle
- Le nettoyage automatique supprime les anciennes courses pour optimiser la base de données
