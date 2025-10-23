# BetTracker Pro - Backend API

API REST NestJS pour l'application BetTracker Pro.

## 🚀 Installation Rapide (Ubuntu)

### Méthode Automatique (Recommandée)

Depuis la racine du projet :

```bash
./scripts/setup-ubuntu.sh
```

Ce script va automatiquement :
- ✅ Installer Node.js 18+
- ✅ Installer PostgreSQL 15+
- ✅ Installer Redis
- ✅ Créer la base de données
- ✅ Installer les dépendances npm
- ✅ Configurer le fichier .env
- ✅ Migrer la base de données
- ✅ Peupler avec les données initiales

### Méthode Manuelle

Voir [TEST_LOCAL_UBUNTU.md](../docs/TEST_LOCAL_UBUNTU.md)

## 🎯 Démarrage

```bash
# Mode développement (avec hot-reload)
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

L'API sera disponible sur **http://localhost:3000**

## 📚 Documentation

- **Swagger UI** : http://localhost:3000/api/docs
- **Health Check** : http://localhost:3000/api/health
- **API JSON** : http://localhost:3000/api/docs-json

## 🧪 Tests

```bash
# Tests rapides via script
../scripts/quick-test.sh

# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Couverture
npm run test:cov
```

## 🗄️ Base de Données

### Prisma Studio

Interface graphique pour explorer et modifier la base de données :

```bash
npm run prisma:studio
```

Accès : http://localhost:5555

### Commandes Prisma

```bash
# Générer le client
npm run prisma:generate

# Créer une migration
npm run prisma:migrate

# Appliquer les migrations
npx prisma migrate deploy

# Réinitialiser la base (⚠️ Supprime toutes les données)
npx prisma migrate reset

# Peupler la base de données
npm run seed
```

### Informations de Connexion par Défaut

- **Database** : `bettracker_dev`
- **User** : `bettracker_user`
- **Password** : `bettracker_password_123`
- **Port** : `5432`

## 👤 Comptes par Défaut

Après le seeding :

**Admin**
- Email : `admin@bettracker.pro`
- Password : `Admin123!`

⚠️ **Changez ce mot de passe en production !**

## 🔑 API Endpoints

### Authentification

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/api/auth/register` | Inscription | - |
| POST | `/api/auth/login` | Connexion | - |
| POST | `/api/auth/logout` | Déconnexion | ✓ |
| POST | `/api/auth/refresh` | Refresh token | - |
| POST | `/api/auth/forgot-password` | Demande reset password | - |
| POST | `/api/auth/reset-password` | Reset password | - |
| POST | `/api/auth/verify-email` | Vérifier email | - |
| GET | `/api/auth/me` | Profil utilisateur | ✓ |
| POST | `/api/auth/2fa/enable` | Activer 2FA | ✓ |
| POST | `/api/auth/2fa/verify` | Vérifier code 2FA | ✓ |
| POST | `/api/auth/2fa/disable` | Désactiver 2FA | ✓ |

### Health

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/api/health` | Health check | - |

## 🛠️ Variables d'Environnement

Copier `.env.example` vers `.env` et configurer :

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bettracker_dev

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Stripe (optionnel pour développement)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SMTP (optionnel pour développement)
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=noreply@localhost
```

## 📁 Structure

```
src/
├── auth/                   # Module d'authentification
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── dto/               # DTOs de validation
│   └── strategies/        # Stratégies Passport (JWT, Local)
├── common/                # Modules partagés
│   ├── decorators/        # Décorateurs personnalisés
│   ├── guards/            # Guards (Auth, Roles, etc.)
│   ├── filters/           # Exception filters
│   └── interceptors/      # Interceptors
├── users/                 # Module utilisateurs (à venir)
├── bets/                  # Module paris (à venir)
├── subscriptions/         # Module abonnements (à venir)
├── app.module.ts          # Module racine
├── main.ts                # Point d'entrée
└── prisma.service.ts      # Service Prisma
```

## 🔒 Sécurité

- ✅ JWT avec refresh tokens
- ✅ 2FA (TOTP)
- ✅ Bcrypt pour les mots de passe (10 rounds)
- ✅ Rate limiting (100 req/min par défaut)
- ✅ Helmet.js pour les headers de sécurité
- ✅ CORS configuré
- ✅ Validation des inputs (class-validator)

### Règles de Mot de Passe

- Minimum 8 caractères
- Au moins 1 majuscule
- Au moins 1 minuscule
- Au moins 1 chiffre
- Au moins 1 caractère spécial

## 🐛 Debugging

```bash
# Mode debug
npm run start:debug

# Lancer avec inspection Node.js
node --inspect dist/main.js

# Voir les logs PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*.log

# Voir les logs Redis
sudo tail -f /var/log/redis/redis-server.log
```

## 📦 Scripts Disponibles

| Script | Description |
|--------|-------------|
| `npm run start` | Démarrer en mode normal |
| `npm run start:dev` | Démarrer en mode développement (hot-reload) |
| `npm run start:prod` | Démarrer en mode production |
| `npm run build` | Compiler TypeScript |
| `npm run test` | Tests unitaires |
| `npm run test:e2e` | Tests e2e |
| `npm run test:cov` | Tests avec couverture |
| `npm run lint` | Linter le code |
| `npm run format` | Formater le code (Prettier) |
| `npm run prisma:generate` | Générer le client Prisma |
| `npm run prisma:migrate` | Créer et appliquer une migration |
| `npm run prisma:studio` | Ouvrir Prisma Studio |
| `npm run seed` | Peupler la base de données |

## 🚀 Déploiement

Voir [DEPLOYMENT.md](../docs/DEPLOYMENT.md) pour le déploiement en production sur Plesk.

### PM2 (Production)

```bash
# Compiler
npm run build

# Démarrer avec PM2
pm2 start ecosystem.config.js

# Voir les logs
pm2 logs bettracker-api

# Redémarrer
pm2 restart bettracker-api

# Arrêter
pm2 stop bettracker-api
```

## 🤝 Développement

### Créer un nouveau module

```bash
# Générer un module avec NestJS CLI
npx nest generate module users
npx nest generate service users
npx nest generate controller users
```

### Ajouter une table Prisma

1. Modifier `prisma/schema.prisma`
2. Créer la migration : `npm run prisma:migrate`
3. Générer le client : `npm run prisma:generate`

### Créer un endpoint

1. Créer le DTO dans `module/dto/`
2. Ajouter la méthode dans le service
3. Ajouter la route dans le controller
4. Ajouter les décorateurs Swagger

## ❓ Problèmes Courants

### Port 3000 déjà utilisé

```bash
# Trouver le processus
sudo lsof -i :3000

# Ou changer le port dans .env
PORT=3001
```

### Erreur de connexion PostgreSQL

```bash
# Vérifier le statut
sudo systemctl status postgresql

# Redémarrer
sudo systemctl restart postgresql
```

### Erreur Prisma

```bash
# Régénérer le client
npm run prisma:generate

# Réappliquer les migrations
npx prisma migrate deploy
```

## 📝 Licence

Private - All Rights Reserved

## 🆘 Support

Pour toute question, consultez la [documentation complète](../docs/) ou contactez l'équipe de développement.

---

**Développé avec ❤️ pour les passionnés de paris hippiques**
