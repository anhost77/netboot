# 🏠 Hébergement BetTracker Pro

## 📁 Fichiers de déploiement créés

Pour vous aider à déployer sur votre serveur **Plesk**, j'ai créé ces fichiers :

### 📚 Documentation
- **`DEPLOIEMENT_PLESK.md`** - Guide complet étape par étape (30 pages)
- **`CHECKLIST_DEPLOIEMENT.md`** - Checklist rapide à cocher
- **`HEBERGEMENT.md`** - Ce fichier (vue d'ensemble)

### ⚙️ Configuration
- **`backend/.env.production.example`** - Variables d'environnement backend
- **`frontend/.env.production.example`** - Variables d'environnement frontend
- **`backend/ecosystem.config.js`** - Configuration PM2

### 🚀 Scripts
- **`scripts/deploy-plesk.sh`** - Script de déploiement automatique

---

## 🎯 Par où commencer ?

### Méthode 1 : Guidé (recommandé pour débutants)
1. Ouvrez **`DEPLOIEMENT_PLESK.md`**
2. Suivez les étapes une par une
3. Cochez au fur et à mesure dans **`CHECKLIST_DEPLOIEMENT.md`**

### Méthode 2 : Rapide (si vous connaissez Plesk)
1. Ouvrez **`CHECKLIST_DEPLOIEMENT.md`**
2. Cochez les étapes au fur et à mesure
3. Référez-vous au guide détaillé si besoin

---

## 🔧 Prérequis Plesk

Votre serveur Plesk doit avoir :
- ✅ **Node.js 18+** (installable via Plesk Extensions)
- ✅ **PostgreSQL** (base de données)
- ✅ **Git** (pour récupérer le code)
- ✅ **Accès SSH** (recommandé)
- ✅ Un **domaine** configuré

---

## 📊 Architecture du déploiement

```
Serveur Plesk
│
├── api.votredomaine.com (Backend)
│   └── /var/www/vhosts/votredomaine.com/api.votredomaine.com/
│       └── backend/
│           ├── dist/ (code compilé)
│           ├── .env (configuration)
│           └── node_modules/
│
├── votredomaine.com (Frontend)
│   └── /var/www/vhosts/votredomaine.com/httpdocs/
│       ├── .next/ (code compilé)
│       ├── .env.local (configuration)
│       └── node_modules/
│
└── Base de données PostgreSQL
    └── bettracker_db
        └── Tables (créées par Prisma)
```

---

## 🌐 URLs après déploiement

- **Frontend** : `https://votredomaine.com`
- **API Backend** : `https://api.votredomaine.com`
- **Admin** : `https://votredomaine.com/admin`
- **API Docs** : `https://api.votredomaine.com/api` (Swagger)

---

## ⏱️ Temps estimé

| Étape | Temps |
|-------|-------|
| Configuration base de données | 15 min |
| Installation backend | 30 min |
| Installation frontend | 20 min |
| Configuration SSL | 10 min |
| Configuration Nginx | 10 min |
| Tests | 10 min |
| **TOTAL** | **~2 heures** |

---

## 💰 Coût estimé

Si vous avez déjà un serveur Plesk : **0€ supplémentaire**

Votre serveur Plesk hébergera :
- Backend Node.js
- Frontend Next.js
- Base de données PostgreSQL
- Tout est inclus dans votre abonnement actuel

---

## 📞 Besoin d'aide ?

### 1. Consultez la documentation
- Guide complet : `DEPLOIEMENT_PLESK.md`
- Section dépannage en bas du guide

### 2. Vérifiez les logs
```bash
# Logs des applications
pm2 logs

# Logs Nginx
tail -f /var/log/nginx/error.log

# Logs PostgreSQL
tail -f /var/log/postgresql/*.log
```

### 3. Commandes utiles
```bash
# Statut des services
pm2 status

# Redémarrer tout
pm2 restart all

# Tester la base de données
psql -U bettracker_user -d bettracker_db
```

---

## 🚀 Prêt à déployer ?

1. Ouvrez votre **Plesk** : `https://votre-domaine:8443`
2. Suivez le guide : **`DEPLOIEMENT_PLESK.md`**
3. Cochez la checklist : **`CHECKLIST_DEPLOIEMENT.md`**

Bon déploiement ! 🎉

---

## 📌 Alternatives si Plesk ne suffit pas

Si votre Plesk ne permet pas Node.js ou PostgreSQL :

**Option 1 : Upgrade Plesk**
- Ajouter l'extension Node.js
- Activer PostgreSQL
- Coût : Peut-être inclus dans votre plan

**Option 2 : Hébergement externe pour le Backend**
- Frontend → Reste sur Plesk (HTML statique)
- Backend + DB → Railway (~7€/mois)

**Option 3 : VPS complet**
- Migrer vers un VPS (Hetzner, OVH, ~5€/mois)
- Plus de contrôle mais plus technique

---

**Dernière mise à jour :** 28 octobre 2025
