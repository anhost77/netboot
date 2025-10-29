# 🚀 Déploiement sur le serveur Ubuntu - Étapes manuelles

## Connexion au serveur

Ouvrez un terminal (PowerShell, CMD, ou Git Bash) et connectez-vous:

```bash
ssh ubuntu@37.59.99.126
```

Mot de passe: `A679563b`

---

## Option A: Déploiement automatique (RECOMMANDÉ)

Une fois connecté au serveur, copiez-collez ces commandes:

```bash
# Télécharger le script
wget https://raw.githubusercontent.com/anhost77/netboot/save/config-2025-10-29/deploy-to-server.sh

# Rendre exécutable
chmod +x deploy-to-server.sh

# Exécuter
./deploy-to-server.sh
```

Le script va tout installer automatiquement (15-20 minutes).

---

## Option B: Déploiement manuel (étape par étape)

### 1. Installation des dépendances

```bash
sudo apt update
sudo apt install -y curl git nginx postgresql postgresql-contrib redis-server
```

### 2. Installation de Node.js 18

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### 3. Cloner le projet

```bash
cd /var/www
sudo git clone https://github.com/anhost77/netboot.git
cd netboot
sudo git checkout save/config-2025-10-29
```

### 4. Configuration PostgreSQL

```bash
sudo -u postgres psql
```

Dans PostgreSQL, exécutez:

```sql
CREATE DATABASE bettracker_prod;
CREATE USER bettracker_user WITH PASSWORD 'BetTracker2025!Secure';
GRANT ALL PRIVILEGES ON DATABASE bettracker_prod TO bettracker_user;
ALTER DATABASE bettracker_prod OWNER TO bettracker_user;
\q
```

### 5. Configuration Backend

```bash
cd /var/www/netboot/backend
sudo cp .env.local.example .env
sudo nano .env
```

Modifiez ces lignes dans le fichier `.env`:
```env
FRONTEND_URL=http://37.59.99.126
BACKEND_URL=http://37.59.99.126
DATABASE_URL=postgresql://bettracker_user:BetTracker2025!Secure@localhost:5432/bettracker_prod
```

Sauvegardez (Ctrl+X, Y, Enter)

```bash
sudo npm install
sudo npx prisma generate
sudo npx prisma migrate deploy
sudo npm run seed
sudo npm run build
```

### 6. Configuration Frontend

```bash
cd /var/www/netboot/frontend
sudo cp .env.local.example .env
sudo nano .env
```

Modifiez:
```env
NEXT_PUBLIC_API_URL=http://37.59.99.126
```

Sauvegardez (Ctrl+X, Y, Enter)

```bash
sudo npm install
sudo npm run build
```

### 7. Configuration Nginx

```bash
sudo nano /etc/nginx/sites-available/bettracker
```

Collez cette configuration:

```nginx
server {
    listen 80;
    server_name 37.59.99.126;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Sauvegardez et activez:

```bash
sudo ln -s /etc/nginx/sites-available/bettracker /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 8. Démarrer les applications avec PM2

```bash
# Backend
cd /var/www/netboot/backend
pm2 start npm --name "bettracker-api" -- run start:prod

# Frontend
cd /var/www/netboot/frontend
pm2 start npm --name "bettracker-frontend" -- start

# Sauvegarder la configuration PM2
pm2 save
pm2 startup
```

### 9. Configuration du firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

---

## ✅ Vérification

Votre application devrait être accessible sur:

- **Frontend**: http://37.59.99.126
- **API**: http://37.59.99.126/api/docs
- **Compte admin**: admin@bettracker.pro / Admin123!

### Commandes utiles

```bash
# Voir le statut des services
pm2 status

# Voir les logs
pm2 logs

# Redémarrer
pm2 restart all

# Vérifier Nginx
sudo nginx -t
sudo systemctl status nginx
```

---

## 🐛 En cas de problème

### Les services ne démarrent pas

```bash
# Vérifier les logs
pm2 logs

# Redémarrer
pm2 restart all
```

### Erreur de connexion à la base de données

```bash
# Vérifier PostgreSQL
sudo systemctl status postgresql

# Se connecter à la base
sudo -u postgres psql -d bettracker_prod
```

### Nginx ne fonctionne pas

```bash
# Tester la configuration
sudo nginx -t

# Voir les logs
sudo tail -f /var/log/nginx/error.log
```

---

## 📞 Besoin d'aide?

Si vous rencontrez des problèmes, envoyez-moi:
1. La sortie de `pm2 logs`
2. La sortie de `sudo nginx -t`
3. La sortie de `sudo systemctl status postgresql`
