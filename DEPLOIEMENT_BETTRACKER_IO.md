# 🚀 Guide de Déploiement - bettracker.io

## 📋 Prérequis (à faire avant)

Avant de commencer ce guide, vous devez avoir :
- ✅ Domaine `bettracker.io` ajouté dans Plesk
- ✅ Sous-domaine `api.bettracker.io` créé dans Plesk
- ✅ Base de données PostgreSQL `bettracker_db` créée
- ✅ DNS configuré et propagé

**Pas encore fait ?** → Suivez d'abord **`CONFIGURATION_BETTRACKER_IO.md`**

---

## 🌐 Architecture de votre application

```
bettracker.io              → Frontend Next.js (interface utilisateur)
api.bettracker.io          → Backend NestJS (API + base de données)
```

---

## 📂 Structure des fichiers sur le serveur

```
/var/www/vhosts/bettracker.io/
│
├── httpdocs/                          # Frontend
│   ├── .next/                         # (généré après build)
│   ├── node_modules/                  # (installé par npm)
│   ├── .env.local                     # ⚠️ À créer
│   └── ...
│
├── api.bettracker.io/                 # Backend
│   ├── dist/                          # (généré après build)
│   ├── node_modules/                  # (installé par npm)
│   ├── prisma/
│   ├── .env                           # ⚠️ À créer
│   └── ...
│
└── storage/                           # Fichiers uploadés
```

---

## 🔙 PARTIE 1 : Déployer le Backend (API)

### Étape 1.1 : Récupérer le code via FTP ou SSH

**Option A : Via SSH (recommandé)**

```bash
# Se connecter en SSH
ssh votre_utilisateur@bettracker.io

# Aller dans le dossier API
cd /var/www/vhosts/bettracker.io/api.bettracker.io

# Cloner le code depuis GitHub
git clone https://github.com/anhost77/netboot.git .

# Aller dans le dossier backend
cd backend
```

**Option B : Via FTP**

1. Téléchargez le projet depuis GitHub en ZIP
2. Extrayez-le sur votre ordinateur
3. Uploadez le contenu du dossier `backend/` vers :
   `/var/www/vhosts/bettracker.io/api.bettracker.io/backend/`

---

### Étape 1.2 : Créer le fichier de configuration `.env`

**Via SSH :**

```bash
cd /var/www/vhosts/bettracker.io/api.bettracker.io/backend
nano .env
```

**Copiez-collez ce contenu** (remplacez les valeurs entre `[...]`) :

```env
# Application
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://bettracker.io
BACKEND_URL=https://api.bettracker.io

# Database PostgreSQL
DATABASE_URL="postgresql://bettracker_user:[VOTRE_MOT_DE_PASSE_DB]@localhost:5432/bettracker_db"

# JWT - Générez des secrets sécurisés !
# Utilisez: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET="[GÉNÉREZ_UN_SECRET_LONG_ET_ALÉATOIRE]"
JWT_REFRESH_SECRET="[GÉNÉREZ_UN_AUTRE_SECRET_LONG_ET_ALÉATOIRE]"
JWT_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# Admin - Credentials pour l'espace admin
ADMIN_EMAIL=admin@bettracker.io
ADMIN_PASSWORD=[CHOISISSEZ_UN_MOT_DE_PASSE_ADMIN_FORT]

# SMTP - Configuration email (optionnel pour commencer)
SMTP_HOST=smtp.votre-hebergeur.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@bettracker.io
SMTP_PASSWORD=[VOTRE_MOT_DE_PASSE_EMAIL]

# Storage
STORAGE_PATH=/var/www/vhosts/bettracker.io/storage

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# Redis (optionnel - laissez vide pour commencer)
REDIS_HOST=
REDIS_PORT=

# Stripe (optionnel - pour les paiements plus tard)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PUBLIC_KEY=
```

**Enregistrer :**
- Nano : `Ctrl+O` puis `Entrée`, puis `Ctrl+X`
- Vi : `Esc` puis `:wq`

---

### Étape 1.3 : Générer les secrets JWT

**Via SSH :**

```bash
# Générer le JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copier le résultat et le mettre dans .env à la ligne JWT_SECRET=

# Générer le JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copier le résultat et le mettre dans .env à la ligne JWT_REFRESH_SECRET=
```

---

### Étape 1.4 : Installer les dépendances

```bash
cd /var/www/vhosts/bettracker.io/api.bettracker.io/backend

# Installer les dépendances Node.js
npm install

# Si vous avez des erreurs, essayez :
npm install --legacy-peer-deps
```

⏱️ **Temps estimé :** 5-10 minutes

---

### Étape 1.5 : Initialiser la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Lancer les migrations (créer les tables)
npx prisma migrate deploy

# Créer l'utilisateur admin
npm run create-admin
```

**Résultat attendu :**
```
✅ Admin user created successfully!
📧 Email: admin@bettracker.io
```

---

### Étape 1.6 : Builder le backend

```bash
npm run build
```

⏱️ **Temps estimé :** 2-3 minutes

**Vérifiez que le dossier `dist/` a été créé :**
```bash
ls -la dist/
```

---

### Étape 1.7 : Configurer Node.js dans Plesk

**Via l'interface Plesk :**

1. **Allez dans "Domaines"** → Sélectionnez **`api.bettracker.io`**
2. Cliquez sur **"Node.js"**
3. Configuration :

   ```
   ☑ Activer Node.js

   Version Node.js : 18.x ou 20.x (LTS)
   Mode : Production
   Document root : /var/www/vhosts/bettracker.io/api.bettracker.io/backend
   Application startup file : dist/main.js

   Variables d'environnement :
   (Copiez-collez le contenu de votre fichier .env)
   ```

4. Cliquez sur **"Activer Node.js"**
5. Cliquez sur **"Redémarrer l'application"**

---

### Étape 1.8 : OU Démarrer avec PM2 (recommandé)

**Via SSH :**

```bash
# Installer PM2 globalement
npm install -g pm2

# Démarrer le backend
cd /var/www/vhosts/bettracker.io/api.bettracker.io/backend
pm2 start dist/main.js --name bettracker-backend

# Sauvegarder la configuration
pm2 save

# Auto-démarrage au reboot
pm2 startup
# Suivez les instructions affichées
```

---

### ✅ Étape 1.9 : Tester le backend

**Via navigateur :**
Ouvrez : `https://api.bettracker.io/health`

**Résultat attendu :**
```json
{"status":"ok"}
```

**Via SSH :**
```bash
curl https://api.bettracker.io/health
```

**Si ça ne fonctionne pas :**
- Vérifiez les logs : `pm2 logs bettracker-backend`
- Vérifiez que le port 3001 est ouvert
- Vérifiez le fichier `.env`

---

## 🎨 PARTIE 2 : Déployer le Frontend

### Étape 2.1 : Récupérer le code frontend

**Via SSH :**

```bash
# Aller dans le dossier frontend
cd /var/www/vhosts/bettracker.io/httpdocs

# Copier le code frontend depuis le dépôt
git clone https://github.com/anhost77/netboot.git temp
mv temp/frontend/* .
mv temp/frontend/.* . 2>/dev/null || true
rm -rf temp
```

**Via FTP :**
Uploadez le contenu du dossier `frontend/` vers :
`/var/www/vhosts/bettracker.io/httpdocs/`

---

### Étape 2.2 : Créer le fichier de configuration `.env.local`

**Via SSH :**

```bash
cd /var/www/vhosts/bettracker.io/httpdocs
nano .env.local
```

**Contenu :**

```env
# API Backend URL
NEXT_PUBLIC_API_URL=https://api.bettracker.io

# Site URL
NEXT_PUBLIC_SITE_URL=https://bettracker.io

# Stripe (optionnel - pour plus tard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

**Enregistrer et quitter**

---

### Étape 2.3 : Installer les dépendances

```bash
cd /var/www/vhosts/bettracker.io/httpdocs
npm install
```

⏱️ **Temps estimé :** 3-5 minutes

---

### Étape 2.4 : Builder le frontend

```bash
npm run build
```

⏱️ **Temps estimé :** 2-3 minutes

**Vérifiez que le dossier `.next/` a été créé :**
```bash
ls -la .next/
```

---

### Étape 2.5 : Démarrer le frontend avec PM2

```bash
cd /var/www/vhosts/bettracker.io/httpdocs

# Démarrer avec PM2
pm2 start npm --name bettracker-frontend -- start

# Sauvegarder
pm2 save
```

---

### ✅ Étape 2.6 : Tester le frontend

**Via navigateur :**
Ouvrez : `https://bettracker.io`

**Résultat attendu :**
- Page d'accueil de BetTracker
- Ou page de connexion

**Si ça ne fonctionne pas :**
- Vérifiez les logs : `pm2 logs bettracker-frontend`
- Vérifiez le fichier `.env.local`
- Vérifiez que l'API fonctionne

---

## 🔒 PARTIE 3 : Configurer SSL/HTTPS

### Étape 3.1 : Activer Let's Encrypt

**Pour le domaine principal :**

1. Dans Plesk, allez dans **"Domaines"** → **`bettracker.io`**
2. Cliquez sur **"SSL/TLS Certificates"**
3. Cliquez sur **"Install a free basic certificate provided by Let's Encrypt"**
4. Cochez :
   - ☑ Secure the domain
   - ☑ Secure www.bettracker.io
5. Cliquez sur **"Get it free"**

**Pour le sous-domaine API :**

1. Dans Plesk, allez dans **"Domaines"** → **`api.bettracker.io`**
2. Répétez les mêmes étapes

---

### Étape 3.2 : Forcer HTTPS (redirection)

**Dans Plesk :**

1. Allez dans **"Domaines"** → **`bettracker.io`**
2. Cliquez sur **"Hébergement & DNS"** → **"Paramètres Apache & nginx"**
3. Cochez : **☑ Rediriger HTTP vers HTTPS de manière permanente**
4. Cliquez sur **"OK"**

Répétez pour `api.bettracker.io`

---

## 🔧 PARTIE 4 : Configuration Nginx (Proxy)

### Étape 4.1 : Configurer le proxy pour l'API

**Dans Plesk :**

1. Allez dans **"Domaines"** → **`api.bettracker.io`**
2. Cliquez sur **"Apache & nginx Settings"**
3. Dans **"Additional nginx directives"**, ajoutez :

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

4. Cliquez sur **"OK"**
5. Cliquez sur **"Appliquer"**

---

## ✅ PARTIE 5 : Tests finaux

### Test 1 : API Backend

```bash
curl https://api.bettracker.io/health
```

**Résultat attendu :** `{"status":"ok"}`

---

### Test 2 : Frontend

Ouvrez dans un navigateur : `https://bettracker.io`

**Résultat attendu :**
- Page de connexion ou d'accueil
- Pas d'erreur console

---

### Test 3 : Admin

Ouvrez : `https://bettracker.io/admin/login`

Connectez-vous avec :
- **Email** : `admin@bettracker.io`
- **Mot de passe** : (celui du `.env`)

---

### Test 4 : Inscription utilisateur

1. Allez sur : `https://bettracker.io/register`
2. Créez un compte de test
3. Vérifiez que ça fonctionne

---

## 📊 Vérification complète

### Checklist finale :

- [ ] Backend accessible : `https://api.bettracker.io/health`
- [ ] Frontend accessible : `https://bettracker.io`
- [ ] SSL/HTTPS activé (cadenas vert)
- [ ] Admin peut se connecter
- [ ] Inscription fonctionne
- [ ] PM2 actif : `pm2 list`
- [ ] Base de données connectée
- [ ] Logs sans erreurs : `pm2 logs`

---

## 🎉 Félicitations !

Votre application **BetTracker Pro** est maintenant déployée sur **bettracker.io** ! 🚀

### URLs importantes :

- 🌐 **Application** : https://bettracker.io
- 🔧 **API** : https://api.bettracker.io
- 🔐 **Admin** : https://bettracker.io/admin
- 📚 **API Docs** : https://api.bettracker.io/api

---

## 🔄 Pour mettre à jour plus tard :

```bash
# Se connecter en SSH
ssh votre_utilisateur@bettracker.io

# Backend
cd /var/www/vhosts/bettracker.io/api.bettracker.io/backend
git pull
npm install
npm run build
pm2 restart bettracker-backend

# Frontend
cd /var/www/vhosts/bettracker.io/httpdocs
git pull
npm install
npm run build
pm2 restart bettracker-frontend
```

---

## 📞 Besoin d'aide ?

**Commandes utiles :**

```bash
# Voir les logs
pm2 logs

# Statut des services
pm2 status

# Redémarrer tout
pm2 restart all

# Vérifier la base de données
psql -U bettracker_user -d bettracker_db
```

**Fichiers importants :**
- Backend : `/var/www/vhosts/bettracker.io/api.bettracker.io/backend/.env`
- Frontend : `/var/www/vhosts/bettracker.io/httpdocs/.env.local`

---

**Temps total de déploiement :** ~2 heures

Bon lancement ! 🎉
