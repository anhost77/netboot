# Guide de Test - Wizard d'Onboarding

## 🚀 Démarrage

### 1. Lancer l'application

```bash
# Terminal 1 - Backend
cd /home/adrien/netboot/backend
npm run start:dev

# Terminal 2 - Frontend
cd /home/adrien/netboot/frontend
npm run dev
```

## 🧪 Scénarios de Test

### **Test 1 : Accès Direct**

1. Ouvrir le navigateur : `http://localhost:3000/onboarding`
2. Vérifier que le wizard s'affiche correctement
3. Naviguer entre les étapes avec les boutons "Continuer" et "Retour"

### **Test 2 : Flux d'Inscription Complet**

#### Étape A : Créer un nouveau compte
1. Aller sur `http://localhost:3000/register`
2. Remplir le formulaire :
   - Email : `test@example.com`
   - Mot de passe : `password123`
   - Confirmer le mot de passe
3. Cliquer sur "Créer mon compte"
4. **Vérifier** : Redirection automatique vers `/onboarding`

#### Étape B : Configuration des Notifications
1. **Vérifier** : Affichage de l'étape "Notifications"
2. Tester le toggle "Activer les notifications"
3. Sélectionner un type : Web / Email / Both
4. Cocher/décocher "Notifications push"
5. Cliquer sur "Continuer"

#### Étape C : Création de la Plateforme
1. **Vérifier** : Affichage de l'étape "Plateforme"
2. Tester la sélection rapide (cliquer sur "PMU")
3. Ou saisir un nom personnalisé
4. Entrer une bankroll initiale : `500`
5. **Tester la validation** :
   - Laisser le nom vide → Erreur affichée
   - Entrer 0 ou valeur négative → Erreur affichée
6. Cliquer sur "Continuer"

#### Étape D : Configuration du Budget
1. **Vérifier** : Affichage de l'étape "Budget"
2. Sélectionner un mode de bankroll :
   - "Déduction immédiate" ou "À la perte"
3. Remplir les limites (optionnel) :
   - Journalière : `50`
   - Hebdomadaire : `200`
   - Mensuelle : `500`
4. Ajuster le seuil d'alerte avec le slider (50-95%)
5. Cliquer sur "Continuer"

#### Étape E : Récapitulatif
1. **Vérifier** : Toutes les informations sont affichées correctement
2. **Vérifier** : Les cartes colorées pour chaque section
3. Cliquer sur "Retour" pour modifier une étape
4. Revenir au récapitulatif
5. Cliquer sur "Finaliser la configuration"
6. **Vérifier** : Bouton affiche "Finalisation..." pendant le chargement
7. **Vérifier** : Redirection vers `/dashboard`

### **Test 3 : Option "Passer"**

1. Aller sur `/onboarding`
2. Sur l'étape de bienvenue, cliquer sur "Passer la configuration"
3. **Vérifier** : Redirection immédiate vers `/dashboard`

### **Test 4 : Barre de Progression**

1. Aller sur `/onboarding`
2. **Vérifier** : Étape 1 est en surbrillance (bleu)
3. Cliquer sur "Continuer"
4. **Vérifier** : Étape 1 devient verte (✓), Étape 2 en surbrillance
5. Continuer jusqu'à la fin
6. **Vérifier** : Toutes les étapes précédentes sont vertes

### **Test 5 : Gestion d'Erreurs**

#### Test API en échec
1. Arrêter le backend
2. Compléter le wizard jusqu'à la fin
3. Cliquer sur "Finaliser"
4. **Vérifier** : Message d'erreur affiché en haut à droite
5. **Vérifier** : Possibilité de fermer l'erreur
6. Redémarrer le backend et réessayer

### **Test 6 : Responsive Design**

1. Ouvrir les DevTools (F12)
2. Tester différentes tailles d'écran :
   - Mobile (375px)
   - Tablette (768px)
   - Desktop (1920px)
3. **Vérifier** : Layout s'adapte correctement
4. **Vérifier** : Barre de progression reste lisible
5. **Vérifier** : Formulaires sont utilisables

### **Test 7 : Validation des Données**

#### Backend - Vérifier les données sauvegardées

```bash
# Se connecter à la base de données
psql -U votre_user -d votre_db

# Vérifier les settings
SELECT * FROM user_settings WHERE user_id = 'ID_DU_USER';

# Vérifier la plateforme créée
SELECT * FROM platforms WHERE user_id = 'ID_DU_USER';

# Vérifier les transactions
SELECT * FROM bankroll_transactions WHERE user_id = 'ID_DU_USER';
```

#### Frontend - Vérifier localStorage

```javascript
// Dans la console du navigateur
localStorage.getItem('onboarding_completed'); // Devrait être 'true'
```

## ✅ Checklist de Validation

- [ ] Toutes les étapes s'affichent correctement
- [ ] Navigation avant/arrière fonctionne
- [ ] Barre de progression se met à jour
- [ ] Validation des champs fonctionne
- [ ] Option "Passer" redirige vers le dashboard
- [ ] Données sont sauvegardées dans la BDD
- [ ] Redirection finale vers le dashboard
- [ ] Messages d'erreur s'affichent correctement
- [ ] Design responsive sur mobile/tablette/desktop
- [ ] Animations et transitions sont fluides

## 🐛 Problèmes Connus

Si vous rencontrez des erreurs :

1. **Erreur "Cannot find module"** : Les fichiers TypeScript sont en cours de compilation
2. **Erreur API** : Vérifier que le backend est lancé sur `http://localhost:3001`
3. **Redirection ne fonctionne pas** : Vider le cache du navigateur et localStorage

## 📝 Notes

- Le wizard peut être relancé à tout moment via `/onboarding`
- Les paramètres peuvent être modifiés après via `/dashboard/settings`
- L'onboarding est marqué comme complété dans localStorage
