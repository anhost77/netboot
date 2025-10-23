# Guide de Test Local - Ubuntu

## Prérequis à Installer

### 1. Node.js 18+ (si pas déjà installé)

```bash
# Vérifier si Node.js est installé
node --version
npm --version

# Si pas installé ou version < 18, installer via nvm (recommandé)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Redémarrer le terminal puis :
nvm install 18
nvm use 18
nvm alias default 18

# Vérifier l'installation
node --version  # Devrait afficher v18.x.x
npm --version   # Devrait afficher 9.x.x ou supérieur
```

### 2. PostgreSQL 15+

```bash
# Installer PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Démarrer le service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Vérifier que PostgreSQL fonctionne
sudo systemctl status postgresql
```

### 3. Redis

```bash
# Installer Redis
sudo apt update
sudo apt install redis-server

# Démarrer le service
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Vérifier que Redis fonctionne
redis-cli ping
# Devrait retourner : PONG
```

## Configuration de la Base de Données

### 1. Créer la base de données PostgreSQL

```bash
# Se connecter à PostgreSQL en tant que super utilisateur
sudo -u postgres psql

# Dans psql, exécuter :
CREATE DATABASE bettracker_dev;
CREATE USER bettracker_user WITH PASSWORD 'bettracker_password_123';
GRANT ALL PRIVILEGES ON DATABASE bettracker_dev TO bettracker_user;

# Donner les droits sur le schéma public (important pour Prisma)
\c bettracker_dev
GRANT ALL ON SCHEMA public TO bettracker_user;

# Quitter psql
\q
```

## Installation de l'Application

### 1. Naviguer vers le dossier backend

```bash
cd /home/user/netboot/backend
```

### 2. Installer les dépendances

```bash
npm install
```

⏱️ Cela peut prendre 2-5 minutes selon votre connexion internet.

### 3. Configurer les variables d'environnement

```bash
# Copier le fichier exemple
cp .env.example .env

# Éditer le fichier .env
nano .env
```

**Modifier les valeurs suivantes dans .env :**

```env
# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000

# Database (IMPORTANT : Utiliser les identifiants créés ci-dessus)
DATABASE_URL=postgresql://bettracker_user:bettracker_password_123@localhost:5432/bettracker_dev

# Redis (laisser par défaut pour local)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT (Générer des secrets aléatoires pour la sécurité)
JWT_SECRET=dev-secret-key-change-in-production-min-64-chars-long-abcdefgh123456
JWT_REFRESH_SECRET=dev-refresh-secret-key-change-in-production-min-64-chars-long-xyz789
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Stripe (Laisser vide pour le moment, on configurera plus tard)
STRIPE_SECRET_KEY=sk_test_
STRIPE_WEBHOOK_SECRET=whsec_
STRIPE_PUBLIC_KEY=pk_test_

# SMTP (Laisser par défaut pour le moment)
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@localhost
SMTP_PASSWORD=

# n8n (Optionnel pour le moment)
N8N_URL=http://localhost:5678
N8N_API_KEY=

# Storage (Utiliser le chemin absolu)
STORAGE_PATH=/home/user/netboot/storage

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

Sauvegarder avec `Ctrl+O`, `Entrée`, puis quitter avec `Ctrl+X`.

### 4. Générer le client Prisma et migrer la base de données

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer les tables dans la base de données
npm run prisma:migrate

# Si demandé un nom pour la migration, taper : init
```

### 5. Peupler la base de données avec les données initiales

```bash
npm run seed
```

Vous devriez voir :
```
🌱 Starting database seeding...
Creating subscription plans...
✅ Created 4 plans
Creating admin user...
✅ Created admin user: admin@bettracker.pro / Admin123!
Creating CMS pages...
✅ Created 4 CMS pages
Creating menu items...
✅ Created 8 menu items

🎉 Database seeding completed successfully!

📝 Admin credentials:
   Email: admin@bettracker.pro
   Password: Admin123!
```

## Lancer l'Application

### 1. Démarrer le serveur en mode développement

```bash
npm run start:dev
```

Vous devriez voir :
```
[Nest] 12345  - 10/23/2025, 10:00:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 10/23/2025, 10:00:00 AM     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12345  - 10/23/2025, 10:00:00 AM     LOG [InstanceLoader] ConfigHostModule dependencies initialized
...
✅ Database connected
🚀 Application is running on: http://localhost:3000
📚 API Documentation: http://localhost:3000/api/docs
```

## Tester l'Application

### Option 1 : Via le Navigateur (Swagger UI)

1. **Ouvrir votre navigateur** et aller sur :
   ```
   http://localhost:3000/api/docs
   ```

2. **Tester l'endpoint Health** :
   - Cliquer sur `GET /health`
   - Cliquer sur "Try it out"
   - Cliquer sur "Execute"
   - Vous devriez voir une réponse 200 avec :
   ```json
   {
     "status": "ok",
     "timestamp": "2025-10-23T...",
     "uptime": 123.456,
     "environment": "development"
   }
   ```

3. **Tester l'inscription** :
   - Cliquer sur `POST /api/auth/register`
   - Cliquer sur "Try it out"
   - Modifier le JSON :
   ```json
   {
     "email": "test@example.com",
     "password": "Test123!@#",
     "firstName": "John",
     "lastName": "Doe"
   }
   ```
   - Cliquer sur "Execute"
   - Vous recevrez un `accessToken` et un `refreshToken`

4. **Tester la connexion avec l'admin** :
   - Cliquer sur `POST /api/auth/login`
   - Cliquer sur "Try it out"
   - Utiliser :
   ```json
   {
     "email": "admin@bettracker.pro",
     "password": "Admin123!"
   }
   ```
   - Cliquer sur "Execute"
   - Copier le `accessToken` retourné

5. **Tester un endpoint protégé** :
   - Cliquer sur le bouton "Authorize" en haut à droite
   - Coller le token : `Bearer <votre_accessToken>`
   - Cliquer sur "Authorize"
   - Maintenant, tester `GET /api/auth/me`
   - Vous devriez voir vos informations utilisateur

### Option 2 : Via cURL (Terminal)

Ouvrir un **nouveau terminal** (garder le serveur actif dans l'autre) :

```bash
# Test Health Check
curl http://localhost:3000/api/health

# Test Registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "User123!@#",
    "firstName": "Test",
    "lastName": "User"
  }'

# Test Login (admin)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bettracker.pro",
    "password": "Admin123!"
  }'

# Copier le accessToken retourné, puis :
export TOKEN="<coller_le_token_ici>"

# Test endpoint protégé
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Option 3 : Via Postman ou Insomnia

1. Télécharger [Postman](https://www.postman.com/downloads/) ou [Insomnia](https://insomnia.rest/download)
2. Importer la collection depuis Swagger : `http://localhost:3000/api/docs-json`
3. Tester les endpoints avec une interface graphique

## Vérifier que Tout Fonctionne

### ✅ Checklist de Test

```bash
# 1. PostgreSQL fonctionne
sudo systemctl status postgresql
# Devrait afficher "active (running)"

# 2. Redis fonctionne
redis-cli ping
# Devrait retourner "PONG"

# 3. Base de données créée
sudo -u postgres psql -c "\l" | grep bettracker_dev
# Devrait afficher la ligne de la base de données

# 4. Tables créées
sudo -u postgres psql -d bettracker_dev -c "\dt"
# Devrait lister toutes les tables (users, plans, bets, etc.)

# 5. Données seedées
sudo -u postgres psql -d bettracker_dev -c "SELECT COUNT(*) FROM plans;"
# Devrait afficher "4" (4 plans)

sudo -u postgres psql -d bettracker_dev -c "SELECT email FROM users WHERE role='admin';"
# Devrait afficher "admin@bettracker.pro"

# 6. Serveur répond
curl http://localhost:3000/api/health
# Devrait retourner {"status":"ok",...}
```

## Prisma Studio (Interface Graphique pour la BD)

Pour visualiser et modifier les données facilement :

```bash
# Dans le dossier backend, lancer :
npm run prisma:studio
```

Cela ouvrira une interface web sur `http://localhost:5555` où vous pourrez :
- Voir toutes les tables
- Ajouter/modifier/supprimer des données
- Explorer les relations

## Commandes Utiles

```bash
# Arrêter le serveur
Ctrl + C (dans le terminal où tourne npm run start:dev)

# Relancer le serveur
npm run start:dev

# Voir les logs PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*.log

# Voir les logs Redis
sudo tail -f /var/log/redis/redis-server.log

# Redémarrer PostgreSQL
sudo systemctl restart postgresql

# Redémarrer Redis
sudo systemctl restart redis-server

# Réinitialiser complètement la base de données (⚠️ SUPPRIME TOUTES LES DONNÉES)
npm run prisma:migrate reset
# Puis re-seed :
npm run seed
```

## Problèmes Courants

### Erreur : "Port 3000 already in use"

```bash
# Trouver le processus utilisant le port
sudo lsof -i :3000

# Tuer le processus (remplacer PID par le numéro affiché)
kill -9 PID

# Ou changer le port dans .env
PORT=3001
```

### Erreur : "Can't reach database server"

```bash
# Vérifier que PostgreSQL tourne
sudo systemctl status postgresql

# Si non démarré :
sudo systemctl start postgresql

# Vérifier les identifiants dans .env
cat .env | grep DATABASE_URL
```

### Erreur : "Redis connection refused"

```bash
# Vérifier que Redis tourne
sudo systemctl status redis-server

# Si non démarré :
sudo systemctl start redis-server

# Tester la connexion
redis-cli ping
```

### Erreur Prisma : "Environment variable not found"

```bash
# Vérifier que le fichier .env existe
ls -la .env

# Vérifier qu'il contient DATABASE_URL
cat .env | grep DATABASE_URL

# Régénérer le client Prisma
npm run prisma:generate
```

## Prochaines Étapes

Une fois que tout fonctionne :

1. ✅ Tester tous les endpoints d'authentification via Swagger
2. ✅ Créer quelques utilisateurs de test
3. ✅ Explorer Prisma Studio pour voir les données
4. 🚀 Passer à la Phase 2 : développement des modules Bets et Subscriptions

## Aide Supplémentaire

Si vous rencontrez un problème, partagez-moi :
- Le message d'erreur complet
- La commande que vous avez exécutée
- Le résultat de `node --version` et `npm --version`

Bonne chance pour les tests ! 🚀
