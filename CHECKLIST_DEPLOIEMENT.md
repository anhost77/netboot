# ✅ Checklist de Déploiement Plesk - BetTracker Pro

## 📋 Avant de commencer

- [ ] J'ai accès à l'interface Plesk
- [ ] J'ai accès SSH au serveur (recommandé)
- [ ] J'ai un domaine configuré (ex: `votredomaine.com`)
- [ ] J'ai lu le guide `DEPLOIEMENT_PLESK.md`

---

## 1️⃣ Configuration de Base (15 min)

### Base de données PostgreSQL
- [ ] Créer la base de données `bettracker_db` dans Plesk
- [ ] Créer l'utilisateur `bettracker_user`
- [ ] Tester la connexion avec `psql`
- [ ] Noter le mot de passe dans un endroit sûr

### Node.js
- [ ] Vérifier que Node.js 18+ est installé
- [ ] Installer PM2 globalement : `npm install -g pm2`

### Domaines
- [ ] Créer le sous-domaine : `api.votredomaine.com`
- [ ] Vérifier que le domaine principal fonctionne

---

## 2️⃣ Backend (30 min)

### Récupérer le code
- [ ] Cloner le dépôt GitHub dans `/var/www/vhosts/votredomaine.com/api.votredomaine.com/`
- [ ] Aller dans le dossier `backend/`

### Configuration
- [ ] Copier `.env.production.example` vers `.env`
- [ ] Remplir `DATABASE_URL` avec les credentials PostgreSQL
- [ ] Générer `JWT_SECRET` avec : `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- [ ] Remplir `FRONTEND_URL` : `https://votredomaine.com`
- [ ] Configurer `ADMIN_EMAIL` et `ADMIN_PASSWORD`

### Installation
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npm run create-admin
```

- [ ] Installation réussie
- [ ] Build réussie
- [ ] Migrations OK
- [ ] Admin créé

### Démarrage
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

- [ ] Backend démarré
- [ ] Accessible via `https://api.votredomaine.com/health`

---

## 3️⃣ Frontend (20 min)

### Récupérer le code
- [ ] Copier le dossier `frontend/` dans `/var/www/vhosts/votredomaine.com/httpdocs/`

### Configuration
- [ ] Copier `.env.production.example` vers `.env.local`
- [ ] Remplir `NEXT_PUBLIC_API_URL` : `https://api.votredomaine.com`
- [ ] Remplir `NEXT_PUBLIC_SITE_URL` : `https://votredomaine.com`

### Installation
```bash
cd httpdocs
npm install
npm run build
```

- [ ] Installation réussie
- [ ] Build réussie

### Démarrage
```bash
pm2 start npm --name bettracker-frontend -- start
pm2 save
```

- [ ] Frontend démarré
- [ ] Accessible via `https://votredomaine.com`

---

## 4️⃣ SSL/HTTPS (10 min)

### Let's Encrypt
- [ ] Activer SSL sur `votredomaine.com`
- [ ] Activer SSL sur `api.votredomaine.com`
- [ ] Vérifier que HTTPS fonctionne

---

## 5️⃣ Nginx/Apache (10 min)

### Proxy pour l'API
- [ ] Configurer le reverse proxy pour `api.votredomaine.com`
- [ ] Port : `3001`
- [ ] Redémarrer Nginx/Apache

---

## 6️⃣ Tests (10 min)

### Backend
- [ ] `curl https://api.votredomaine.com/health` retourne `{"status":"ok"}`
- [ ] Swagger accessible : `https://api.votredomaine.com/api`
- [ ] Logs PM2 sans erreurs : `pm2 logs bettracker-backend`

### Frontend
- [ ] Page d'accueil charge : `https://votredomaine.com`
- [ ] Page de connexion fonctionne : `https://votredomaine.com/login`
- [ ] Admin accessible : `https://votredomaine.com/admin/login`
- [ ] Logs PM2 sans erreurs : `pm2 logs bettracker-frontend`

### Base de données
- [ ] Connexion OK
- [ ] Tables créées (vérifier avec `psql` ou Prisma Studio)

### Fonctionnalités
- [ ] Inscription d'un utilisateur fonctionne
- [ ] Connexion fonctionne
- [ ] Dashboard utilisateur accessible
- [ ] Admin peut se connecter

---

## 7️⃣ Sécurité (5 min)

- [ ] Fichiers `.env` ne sont PAS accessibles via le web
- [ ] HTTPS activé partout
- [ ] Mots de passe admin changés
- [ ] Rate limiting activé
- [ ] Pare-feu configuré (si possible)

---

## 8️⃣ Monitoring (5 min)

### PM2
- [ ] Auto-redémarrage configuré : `pm2 startup`
- [ ] Liste des processus : `pm2 list`
- [ ] Monitoring actif : `pm2 monit`

### Logs
- [ ] Créer dossier `/var/www/vhosts/votredomaine.com/logs`
- [ ] Vérifier que les logs s'écrivent
- [ ] Configurer la rotation des logs

---

## 9️⃣ Backups (10 min)

### Base de données
```bash
pg_dump -U bettracker_user bettracker_db > backup_$(date +%Y%m%d).sql
```

- [ ] Script de backup créé
- [ ] Tâche cron configurée (quotidienne)

### Code
- [ ] Code poussé sur GitHub
- [ ] Branch `main` à jour

---

## 🎉 Finalisation

### Checklist finale
- [ ] Backend fonctionne ✅
- [ ] Frontend fonctionne ✅
- [ ] Base de données OK ✅
- [ ] SSL/HTTPS OK ✅
- [ ] Admin peut se connecter ✅
- [ ] Utilisateurs peuvent s'inscrire ✅
- [ ] Logs accessibles ✅
- [ ] Backups configurés ✅

### URLs à tester
- 🌐 **Site** : https://votredomaine.com
- 🔧 **API** : https://api.votredomaine.com
- 🔐 **Admin** : https://votredomaine.com/admin
- 📚 **Docs API** : https://api.votredomaine.com/api

---

## 📞 En cas de problème

### Commandes utiles
```bash
# Statut des services
pm2 status

# Logs
pm2 logs

# Redémarrer
pm2 restart all

# Vérifier les ports
lsof -i :3001

# Tester la base de données
psql -U bettracker_user -d bettracker_db
```

### Fichiers importants
- Backend : `/var/www/vhosts/votredomaine.com/api.votredomaine.com/backend/.env`
- Frontend : `/var/www/vhosts/votredomaine.com/httpdocs/.env.local`
- Logs : `/var/www/vhosts/votredomaine.com/logs/`
- Nginx : `/etc/nginx/`

---

## 🚀 Prochaines étapes

Après le déploiement :
- [ ] Configurer les paiements Stripe (si nécessaire)
- [ ] Configurer l'envoi d'emails SMTP
- [ ] Configurer les notifications push
- [ ] Ajouter Google Analytics
- [ ] Configurer les backups automatiques
- [ ] Optimiser les performances
- [ ] Mettre en place un monitoring (UptimeRobot, etc.)

---

**Temps total estimé : ~2 heures**

Bon déploiement ! 🎉
