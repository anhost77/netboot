# Configuration du projet BetTracker Pro

## Variables d'environnement

### Backend (`backend/.env`)

```env
# Application
NODE_ENV=development|production
PORT=3001                                    # Port du backend
FRONTEND_URL=http://localhost:3000          # URL du frontend (pour CORS)
BACKEND_URL=http://localhost:3001           # URL du backend (pour emails)

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Stripe (optionnel)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLIC_KEY=pk_test_...

# SMTP (optionnel)
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@domain.com
SMTP_PASSWORD=

# Storage
STORAGE_PATH=/path/to/storage

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

### Frontend (`frontend/.env`)

```env
# API URL (backend base URL, SANS le préfixe /api)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Frontend URL (optionnel)
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

## Configuration pour la production

### Backend

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://votredomaine.com
BACKEND_URL=https://api.votredomaine.com

DATABASE_URL=postgresql://user:password@prod-db-host:5432/bettracker_prod
REDIS_HOST=prod-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=votre-mot-de-passe-redis

JWT_SECRET=votre-secret-jwt-tres-securise
JWT_REFRESH_SECRET=votre-refresh-secret-tres-securise

STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLIC_KEY=pk_live_...

SMTP_HOST=smtp.votredomaine.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=noreply@votredomaine.com
SMTP_PASSWORD=votre-mot-de-passe-smtp

STORAGE_PATH=/var/www/vhosts/votredomaine.com/storage
```

### Frontend

```env
NEXT_PUBLIC_API_URL=https://api.votredomaine.com
NEXT_PUBLIC_FRONTEND_URL=https://votredomaine.com
```

## Architecture des URLs

### Développement

- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:3001`
- **API Routes**: `http://localhost:3001/api/*`
- **Swagger**: `http://localhost:3001/api/docs`

### Production

- **Frontend**: `https://votredomaine.com`
- **Backend**: `https://api.votredomaine.com`
- **API Routes**: `https://api.votredomaine.com/api/*`
- **Swagger**: `https://api.votredomaine.com/api/docs`

## Configuration Nginx (exemple pour la production)

```nginx
# Frontend
server {
    listen 80;
    server_name votredomaine.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.votredomaine.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Notes importantes

1. **Pas de URLs hardcodées**: Toutes les URLs utilisent des variables d'environnement
2. **CORS**: Le backend autorise uniquement l'URL définie dans `FRONTEND_URL`
3. **Préfixe API**: Toutes les routes backend ont le préfixe `/api`
4. **Configuration centralisée**: Le frontend utilise `lib/config.ts` pour centraliser les URLs
5. **Sécurité**: Changez tous les secrets en production (JWT, SMTP, Stripe, etc.)
