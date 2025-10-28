# ✅ Votre Configuration Plesk - VALIDÉE

## 📊 Résumé de vérification

**Date** : 28 octobre 2025
**Plesk** : Obsidian Web Pro Edition v18.0.72
**Statut** : 🟢 **PRÊT POUR LE DÉPLOIEMENT**

---

## ✅ Prérequis validés

| Composant | Statut | Détails |
|-----------|--------|---------|
| **Plesk** | ✅ | Obsidian Web Pro v18.0.72 |
| **Node.js Toolkit** | ✅ | v2.4.4 installé (v2.4.5 disponible) |
| **PostgreSQL** | ✅ | localhost:5432 disponible |
| **MariaDB** | ✅ | localhost:3306 (bonus) |
| **Accès SSH** | ⚠️ | À vérifier |

---

## 🚀 Prochaines étapes

### Option 1 : Déploiement complet (~2h)

Suivez le guide détaillé : **`DEPLOIEMENT_PLESK.md`**

**Ce guide vous montrera :**
1. Comment créer la base de données PostgreSQL
2. Comment créer un sous-domaine pour l'API
3. Comment déployer le backend (Node.js)
4. Comment déployer le frontend (Next.js)
5. Comment configurer SSL/HTTPS
6. Comment tester l'application

---

### Option 2 : Checklist rapide (~2h)

Suivez la checklist : **`CHECKLIST_DEPLOIEMENT.md`**

**Format :**
- [ ] Étapes à cocher
- [ ] Commandes prêtes à copier-coller
- [ ] Tests de validation

---

## 📝 Configuration recommandée

### 1. Base de données PostgreSQL

**À créer dans Plesk :**
- **Nom** : `bettracker_db`
- **Utilisateur** : `bettracker_user`
- **Mot de passe** : (générez un mot de passe fort)

### 2. Domaines

**Recommandé :**
- **Frontend** : `votredomaine.com` (ou `bettracker.votredomaine.com`)
- **API Backend** : `api.votredomaine.com`

**Pourquoi deux domaines ?**
- Séparation claire frontend/backend
- Meilleure sécurité
- Plus facile à gérer

### 3. Node.js

**Version recommandée :**
- Node.js **18.x** ou **20.x** (LTS)

**Comment choisir dans Plesk :**
1. Allez dans le domaine de votre API
2. Cliquez sur "Node.js"
3. Sélectionnez la version 18.x ou 20.x

---

## 🔧 Avant de commencer

### 1. Mettre à jour Node.js Toolkit (optionnel)

Vous avez la version 2.4.4, une mise à jour 2.4.5 est disponible.

**Comment faire :**
1. Dans Plesk, allez dans **Extensions**
2. Cherchez **Node.js Toolkit**
3. Cliquez sur **Mettre à jour**

**Nécessaire ?** Non, mais recommandé pour avoir les dernières améliorations.

---

### 2. Vérifier l'accès SSH

**Comment vérifier :**
1. Dans Plesk, allez dans un domaine
2. Cherchez **"Accès web"** ou **"Web Hosting Access"**
3. Regardez si vous voyez une section **"Accès SSH"**

**Si vous avez SSH :**
- ✅ Le déploiement sera plus facile
- ✅ Vous pourrez utiliser les commandes directement
- ✅ Installation plus rapide

**Si vous n'avez PAS SSH :**
- ⚠️ Vous devrez utiliser l'interface Plesk
- ⚠️ Ce sera un peu plus manuel
- ✅ Mais c'est quand même possible !

---

### 3. Préparer votre domaine

**Avez-vous déjà un domaine configuré dans Plesk ?**

✅ **OUI** → Notez le nom de votre domaine
❌ **NON** → Ajoutez-en un dans Plesk (Domaines → Ajouter un domaine)

---

## 📂 Structure finale

Une fois déployé, voici à quoi ressemblera votre serveur :

```
/var/www/vhosts/votredomaine.com/
│
├── api.votredomaine.com/              # Backend (API)
│   └── backend/
│       ├── dist/                      # Code compilé
│       ├── node_modules/              # Dépendances
│       ├── prisma/                    # Base de données
│       ├── .env                       # Configuration
│       └── package.json
│
├── httpdocs/                          # Frontend
│   ├── .next/                         # Code compilé
│   ├── node_modules/                  # Dépendances
│   ├── .env.local                     # Configuration
│   └── package.json
│
└── storage/                           # Fichiers uploadés
```

---

## 🎯 Récapitulatif : Que faire maintenant ?

### ✅ Vous êtes prêt !

Tout est OK, vous pouvez commencer le déploiement.

### 📚 Choisissez votre guide :

**Pour les débutants :**
→ Ouvrez **`DEPLOIEMENT_PLESK.md`** (guide détaillé avec explications)

**Pour les pressés :**
→ Ouvrez **`CHECKLIST_DEPLOIEMENT.md`** (format checklist rapide)

---

## ⏱️ Temps estimé

| Étape | Durée |
|-------|-------|
| Créer la base de données | 5 min |
| Créer le sous-domaine API | 5 min |
| Installer le backend | 30 min |
| Installer le frontend | 20 min |
| Configurer SSL | 10 min |
| Configuration Nginx/Proxy | 10 min |
| Tests | 10 min |
| **TOTAL** | **~2 heures** |

---

## 💰 Coût

**0€ supplémentaire** - Tout est inclus dans votre Plesk actuel !

---

## 📞 Besoin d'aide ?

Si vous êtes bloqué à une étape :
1. Consultez la section "Dépannage" dans `DEPLOIEMENT_PLESK.md`
2. Vérifiez les logs (indiqués dans le guide)
3. Demandez de l'aide en indiquant l'étape où vous êtes bloqué

---

## 🎉 C'est parti !

Vous avez tout ce qu'il faut, il ne reste plus qu'à suivre le guide !

→ **Ouvrez `DEPLOIEMENT_PLESK.md` et commencez l'aventure !**

Bon déploiement ! 🚀

---

**Créé le** : 28 octobre 2025
**Configuration vérifiée** : Plesk Obsidian Web Pro v18.0.72
