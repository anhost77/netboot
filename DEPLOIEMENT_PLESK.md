# 🚀 Guide de Déploiement BetTracker Pro sur Plesk

## 📋 Table des matières
1. [Prérequis](#prérequis)
2. [Configuration de la base de données](#configuration-de-la-base-de-données)
3. [Installation du Backend](#installation-du-backend)
4. [Installation du Frontend](#installation-du-frontend)
5. [Configuration du domaine](#configuration-du-domaine)
6. [Démarrage des services](#démarrage-des-services)
7. [Dépannage](#dépannage)

---

## 🔧 Prérequis

Avant de commencer, vérifiez que votre Plesk dispose de :

- ✅ **Node.js** version 18+ installé
- ✅ **PostgreSQL** disponible
- ✅ **Git** installé
- ✅ **Accès SSH** (recommandé mais pas obligatoire)
- ✅ Un **domaine** ou sous-domaine (ex: `bettracker.votredomaine.com`)

### Vérifier si Node.js est installé

**Via l'interface Plesk :**
1. Allez dans **Extensions** → **Node.js**
2. Si vous voyez "Node.js n'est pas installé", installez-le
3. Version recommandée : **18.x** ou **20.x**

**Via SSH :**
```bash
node --version
# Devrait afficher : v18.x.x ou v20.x.x
```

---

## 💾 1. Configuration de la Base de Données

### Étape 1.1 : Créer la base PostgreSQL

**Via l'interface Plesk :**

1. Allez dans **Bases de données**
2. Cliquez sur **Ajouter une base de données**
3. Configuration :
   - Type : **PostgreSQL**
   - Nom : `bettracker_db`
   - Utilisateur : `bettracker_user`
   - Mot de passe : (générez un mot de passe sécurisé)
4. Notez ces informations !

**Via SSH :**
```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base et l'utilisateur
CREATE DATABASE bettracker_db;
CREATE USER bettracker_user WITH ENCRYPTED PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE bettracker_db TO bettracker_user;
\q
```

### Étape 1.2 : Tester la connexion

```bash
psql -h localhost -U bettracker_user -d bettracker_db
# Entrez le mot de passe quand demandé
# Si ça fonctionne, tapez \q pour quitter
```

---

## 🔙 2. Installation du Backend

### Étape 2.1 : Créer un sous-domaine pour l'API

**Via l'interface Plesk :**

1. Allez dans **Domaines** → **Ajouter un sous-domaine**
2. Nom : `api.votredomaine.com` (ou `bettracker-api.votredomaine.com`)
3. Document root : `/var/www/vhosts/votredomaine.com/api.votredomaine.com`

### Étape 2.2 : Récupérer le code

**Via SSH :**
```bash
# Aller dans le dossier du domaine
cd /var/www/vhosts/votredomaine.com/api.votredomaine.com

# Cloner le dépôt
git clone https://github.com/anhost77/netboot.git .

# Aller dans le dossier backend
cd backend

# Installer les dépendances
npm install
```

**Via FTP (si pas d'accès SSH) :**
1. Téléchargez le projet depuis GitHub en ZIP
2. Extrayez-le sur votre ordinateur
3. Uploadez le dossier `backend/` via FTP dans `/var/www/vhosts/votredomaine.com/api.votredomaine.com/`
4. Connectez-vous en SSH pour faire `npm install`

### Étape 2.3 : Configurer les variables d'environnement

**Créer le fichier `.env` :**
```bash
cd /var/www/vhosts/votredomaine.com/api.votredomaine.com/backend
nano .env
```

**Contenu du `.env` :**
```env
# Database
DATABASE_URL="postgresql://bettracker_user:votre_mot_de_passe@localhost:5432/bettracker_db"

# JWT
JWT_SECRET="votre_secret_jwt_tres_long_et_securise"
JWT_EXPIRES_IN="7d"

# API
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://votredomaine.com

# Admin
ADMIN_EMAIL=admin@votredomaine.com
ADMIN_PASSWORD=VotreMotDePasseAdmin123!

# Email (optionnel)
SMTP_HOST=smtp.votrehebergeur.com
SMTP_PORT=587
SMTP_USER=noreply@votredomaine.com
SMTP_PASS=votre_mot_de_passe_email
EMAIL_FROM=noreply@votredomaine.com

# Redis (optionnel, si vous l'avez)
REDIS_HOST=localhost
REDIS_PORT=6379

# Stripe (pour les paiements, optionnel)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Enregistrer :** `Ctrl+O` puis `Entrée`, puis `Ctrl+X`

### Étape 2.4 : Initialiser la base de données

```bash
cd /var/www/vhosts/votredomaine.com/api.votredomaine.com/backend

# Générer le client Prisma
npx prisma generate

# Lancer les migrations
npx prisma migrate deploy

# Créer l'utilisateur admin
npm run create-admin
```

### Étape 2.5 : Builder le backend

```bash
npm run build
```

### Étape 2.6 : Configurer Node.js dans Plesk

**Via l'interface Plesk :**

1. Allez dans **Domaines** → Sélectionnez `api.votredomaine.com`
2. Allez dans **Node.js**
3. Configuration :
   - **Version Node.js** : 18.x ou 20.x
   - **Mode** : Production
   - **Document root** : `/var/www/vhosts/votredomaine.com/api.votredomaine.com/backend`
   - **Application startup file** : `dist/main.js`
   - **Variables d'environnement** : Copiez le contenu du `.env`
4. Cliquez sur **Activer Node.js**
5. Cliquez sur **Redémarrer l'application**

**Ou via PM2 (recommandé si SSH disponible) :**

```bash
cd /var/www/vhosts/votredomaine.com/api.votredomaine.com/backend

# Installer PM2 globalement
npm install -g pm2

# Démarrer le backend
pm2 start dist/main.js --name bettracker-backend

# Sauvegarder la configuration
pm2 save

# Auto-démarrage au reboot du serveur
pm2 startup
# Suivez les instructions affichées
```

---

## 🎨 3. Installation du Frontend

### Étape 3.1 : Configurer le domaine principal

**Via l'interface Plesk :**

1. Allez dans **Domaines** → Sélectionnez `votredomaine.com`
2. Document root : `/var/www/vhosts/votredomaine.com/httpdocs`

### Étape 3.2 : Récupérer le code frontend

```bash
cd /var/www/vhosts/votredomaine.com/httpdocs

# Copier le frontend depuis le dépôt
cp -r /var/www/vhosts/votredomaine.com/api.votredomaine.com/frontend/* .

# Installer les dépendances
npm install
```

### Étape 3.3 : Configurer les variables d'environnement

**Créer le fichier `.env.local` :**
```bash
nano .env.local
```

**Contenu :**
```env
NEXT_PUBLIC_API_URL=https://api.votredomaine.com
NEXT_PUBLIC_SITE_URL=https://votredomaine.com
```

### Étape 3.4 : Builder le frontend

```bash
npm run build
```

### Étape 3.5 : Démarrer le frontend

**Option 1 : Next.js standalone (recommandé)**

```bash
# Démarrer avec PM2
pm2 start npm --name bettracker-frontend -- start

# Sauvegarder
pm2 save
```

**Option 2 : Export statique (si vous voulez juste du HTML)**

Modifiez `next.config.js` pour ajouter :
```javascript
module.exports = {
  output: 'export',
  images: {
    unoptimized: true,
  },
}
```

Puis :
```bash
npm run build
# Les fichiers statiques seront dans /out
# Copiez-les dans httpdocs
```

---

## 🌐 4. Configuration du Domaine

### Étape 4.1 : Activer SSL/HTTPS

**Via l'interface Plesk :**

1. Allez dans **Domaines** → Sélectionnez votre domaine
2. Allez dans **SSL/TLS Certificates**
3. Cliquez sur **Install a free basic certificate provided by Let's Encrypt**
4. Cochez **Secure the domain and www** + **Secure the mail**
5. Cliquez sur **Get it free**

Répétez pour `api.votredomaine.com`

### Étape 4.2 : Configurer le proxy pour l'API

**Via l'interface Plesk :**

1. Allez dans **Apache & nginx Settings** pour `api.votredomaine.com`
2. Dans **Additional nginx directives**, ajoutez :

```nginx
location / {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

3. Cliquez sur **OK**

**Via SSH (fichier de config nginx) :**

```bash
nano /var/www/vhosts/system/api.votredomaine.com/conf/vhost_nginx.conf
```

---

## 🚀 5. Démarrage des Services

### Vérifier que tout fonctionne

**Backend :**
```bash
# Vérifier les logs PM2
pm2 logs bettracker-backend

# Ou via curl
curl https://api.votredomaine.com/health
# Devrait retourner : {"status":"ok"}
```

**Frontend :**
```bash
# Vérifier les logs PM2
pm2 logs bettracker-frontend

# Ou via navigateur
# Ouvrez : https://votredomaine.com
```

### Liste des processus PM2

```bash
pm2 list
# Devrait afficher :
# bettracker-backend | online
# bettracker-frontend | online
```

---

## 🔍 6. Dépannage

### Problème : "Cannot connect to database"

**Solution :**
```bash
# Vérifier que PostgreSQL fonctionne
systemctl status postgresql

# Tester la connexion
psql -h localhost -U bettracker_user -d bettracker_db
```

### Problème : "Port 3001 already in use"

**Solution :**
```bash
# Trouver le processus qui utilise le port
lsof -i :3001

# Tuer le processus
kill -9 <PID>

# Redémarrer l'application
pm2 restart bettracker-backend
```

### Problème : "Module not found"

**Solution :**
```bash
cd /var/www/vhosts/votredomaine.com/api.votredomaine.com/backend
npm install
npm run build
pm2 restart bettracker-backend
```

### Problème : Frontend affiche "Failed to fetch"

**Solution :**
- Vérifiez que `NEXT_PUBLIC_API_URL` pointe vers `https://api.votredomaine.com`
- Vérifiez que le backend est bien démarré
- Vérifiez les CORS dans le backend

### Logs utiles

```bash
# Logs Backend
pm2 logs bettracker-backend --lines 100

# Logs Frontend
pm2 logs bettracker-frontend --lines 100

# Logs Nginx
tail -f /var/log/nginx/error.log

# Logs PostgreSQL
tail -f /var/log/postgresql/postgresql-*.log
```

---

## 📊 7. Vérification Post-Déploiement

### Checklist finale :

- [ ] Base de données PostgreSQL créée et accessible
- [ ] Backend déployé et accessible via `https://api.votredomaine.com`
- [ ] Frontend déployé et accessible via `https://votredomaine.com`
- [ ] SSL/HTTPS activé sur les deux domaines
- [ ] Utilisateur admin créé (`npm run create-admin`)
- [ ] PM2 configuré pour redémarrer automatiquement
- [ ] Variables d'environnement correctement configurées
- [ ] Logs accessibles et sans erreurs

### Tester l'application :

1. **Test Backend :**
   ```bash
   curl https://api.votredomaine.com/health
   # Doit retourner : {"status":"ok"}
   ```

2. **Test Frontend :**
   - Ouvrez `https://votredomaine.com`
   - Vous devriez voir la page de connexion

3. **Test Admin :**
   - Allez sur `https://votredomaine.com/admin/login`
   - Connectez-vous avec les credentials du `.env`

---

## 🎉 C'est prêt !

Votre application **BetTracker Pro** est maintenant déployée sur votre serveur Plesk !

### URLs importantes :

- 🌐 **Frontend** : `https://votredomaine.com`
- 🔧 **API** : `https://api.votredomaine.com`
- 🔐 **Admin** : `https://votredomaine.com/admin`
- 📊 **API Docs** : `https://api.votredomaine.com/api` (Swagger)

### Commandes utiles :

```bash
# Redémarrer les services
pm2 restart all

# Voir les logs
pm2 logs

# Mettre à jour le code
cd /var/www/vhosts/votredomaine.com/api.votredomaine.com
git pull
cd backend && npm install && npm run build
pm2 restart bettracker-backend

# Sauvegarder la base de données
pg_dump -U bettracker_user bettracker_db > backup.sql
```

---

## 📞 Support

Si vous rencontrez des problèmes, vérifiez :
1. Les logs PM2 : `pm2 logs`
2. Les logs Nginx : `tail -f /var/log/nginx/error.log`
3. La connexion à la base de données
4. Les variables d'environnement

Bon déploiement ! 🚀
