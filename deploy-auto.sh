#!/bin/bash
# Script de déploiement automatique complet pour BetTracker Pro
# Gère la réinitialisation et l'installation complète

set -e

echo "🚀 Déploiement automatique de BetTracker Pro"
echo "=============================================="

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Variables
SERVER_IP="37.59.99.126"
DB_NAME="bettracker_prod"
DB_USER="bettracker_user"
DB_PASSWORD="BetTracker2025!Secure"

echo -e "${GREEN}✓${NC} Configuration chargée"

# Fonction de nettoyage
cleanup() {
    echo -e "\n${YELLOW}Nettoyage des installations précédentes...${NC}"
    
    # Arrêter PM2
    pm2 delete all 2>/dev/null || true
    pm2 kill 2>/dev/null || true
    
    # Supprimer l'ancien dossier
    sudo rm -rf /var/www/netboot 2>/dev/null || true
    
    # Supprimer l'ancienne base de données
    sudo -u postgres psql -c "DROP DATABASE IF EXISTS ${DB_NAME};" 2>/dev/null || true
    sudo -u postgres psql -c "DROP USER IF EXISTS ${DB_USER};" 2>/dev/null || true
    
    # Supprimer la config Nginx
    sudo rm -f /etc/nginx/sites-enabled/bettracker 2>/dev/null || true
    sudo rm -f /etc/nginx/sites-available/bettracker 2>/dev/null || true
    
    echo -e "${GREEN}✓${NC} Nettoyage terminé"
}

# Demander si on doit nettoyer
if [ -d "/var/www/netboot" ]; then
    echo -e "${YELLOW}Installation existante détectée${NC}"
    cleanup
fi

# 1. Mise à jour système
echo -e "\n${YELLOW}[1/12]${NC} Mise à jour du système..."
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -qq
sudo apt-get upgrade -y -qq
echo -e "${GREEN}✓${NC} Système à jour"

# 2. Installation Node.js
echo -e "\n${YELLOW}[2/12]${NC} Installation de Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - > /dev/null 2>&1
    sudo apt-get install -y nodejs -qq
fi
echo -e "${GREEN}✓${NC} Node.js $(node -v) installé"

# 3. Installation PostgreSQL
echo -e "\n${YELLOW}[3/12]${NC} Installation de PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt-get install -y postgresql postgresql-contrib -qq
fi
sudo systemctl start postgresql
sudo systemctl enable postgresql
echo -e "${GREEN}✓${NC} PostgreSQL installé"

# 4. Installation Redis
echo -e "\n${YELLOW}[4/12]${NC} Installation de Redis..."
if ! command -v redis-cli &> /dev/null; then
    sudo apt-get install -y redis-server -qq
fi
sudo systemctl start redis-server
sudo systemctl enable redis-server
echo -e "${GREEN}✓${NC} Redis installé"

# 5. Installation Nginx
echo -e "\n${YELLOW}[5/12]${NC} Installation de Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt-get install -y nginx -qq
fi
sudo systemctl start nginx
sudo systemctl enable nginx
echo -e "${GREEN}✓${NC} Nginx installé"

# 6. Installation PM2
echo -e "\n${YELLOW}[6/12]${NC} Installation de PM2..."
sudo npm install -g pm2 --silent
echo -e "${GREEN}✓${NC} PM2 installé"

# 7. Configuration PostgreSQL
echo -e "\n${YELLOW}[7/12]${NC} Configuration de la base de données..."

# Terminer toutes les connexions à la base
sudo -u postgres psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}';" 2>/dev/null || true

# Supprimer la base si elle existe
sudo -u postgres psql -c "DROP DATABASE IF EXISTS ${DB_NAME};" 2>/dev/null || true

# Supprimer l'utilisateur si il existe
sudo -u postgres psql -c "DROP USER IF EXISTS ${DB_USER};" 2>/dev/null || true

# Créer l'utilisateur
sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';"

# Créer la base de données
sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"

# Donner tous les privilèges
sudo -u postgres psql -d ${DB_NAME} << EOF
GRANT ALL ON SCHEMA public TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${DB_USER};
\q
EOF

echo -e "${GREEN}✓${NC} Base de données créée"

# 8. Clonage du projet
echo -e "\n${YELLOW}[8/12]${NC} Clonage du projet..."
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/anhost77/netboot.git > /dev/null 2>&1
cd netboot
sudo git checkout save/config-2025-10-29 > /dev/null 2>&1
sudo chown -R ubuntu:ubuntu /var/www/netboot
echo -e "${GREEN}✓${NC} Projet cloné"

# 9. Configuration et installation Backend
echo -e "\n${YELLOW}[9/12]${NC} Configuration du backend..."
cd /var/www/netboot/backend

# Créer le fichier .env
cat > .env << EOF
NODE_ENV=production
PORT=3001
FRONTEND_URL=http://${SERVER_IP}
BACKEND_URL=http://${SERVER_IP}

DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -d '\n')
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PUBLIC_KEY=

SMTP_HOST=localhost
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@bettracker.pro
SMTP_PASSWORD=

STORAGE_PATH=/var/www/netboot/storage

THROTTLE_TTL=60
THROTTLE_LIMIT=100
EOF

echo -e "${GREEN}✓${NC} Fichier .env backend créé"

# Installation des dépendances backend
echo -e "${YELLOW}Installation des dépendances backend...${NC}"
npm install --silent 2>&1 | grep -v "npm warn" || true
echo -e "${GREEN}✓${NC} Dépendances installées"

# Prisma
echo -e "${YELLOW}Génération du client Prisma...${NC}"
if npx prisma generate 2>&1 | tee /tmp/prisma-generate.log; then
    echo -e "${GREEN}✓${NC} Client Prisma généré"
else
    echo -e "${RED}✗${NC} Erreur lors de la génération Prisma:"
    cat /tmp/prisma-generate.log
    exit 1
fi

echo -e "${YELLOW}Exécution des migrations...${NC}"
if npx prisma migrate deploy 2>&1 | tee /tmp/prisma-migrate.log; then
    echo -e "${GREEN}✓${NC} Migrations appliquées"
else
    echo -e "${RED}✗${NC} Erreur lors des migrations:"
    cat /tmp/prisma-migrate.log
    exit 1
fi

echo -e "${YELLOW}Peuplement de la base de données...${NC}"
if npm run seed 2>&1 | tee /tmp/seed.log; then
    echo -e "${GREEN}✓${NC} Base de données peuplée"
else
    echo -e "${RED}✗${NC} Erreur lors du seed:"
    cat /tmp/seed.log
    exit 1
fi

# Build backend
echo -e "${YELLOW}Build du backend...${NC}"
if npm run build 2>&1 | grep -v "npm warn" | tee /tmp/build-backend.log; then
    echo -e "${GREEN}✓${NC} Backend compilé"
else
    echo -e "${RED}✗${NC} Erreur lors du build:"
    cat /tmp/build-backend.log
    exit 1
fi

echo -e "${GREEN}✓${NC} Backend configuré"

# 10. Configuration et installation Frontend
echo -e "\n${YELLOW}[10/12]${NC} Configuration du frontend..."
cd /var/www/netboot/frontend

# Créer le fichier .env
cat > .env << EOF
NEXT_PUBLIC_API_URL=http://${SERVER_IP}
NEXT_PUBLIC_FRONTEND_URL=http://${SERVER_IP}
EOF

echo -e "${GREEN}✓${NC} Fichier .env frontend créé"

# Installation des dépendances frontend
echo "Installation des dépendances frontend..."
npm install --silent > /dev/null 2>&1

# Build frontend
echo "Build du frontend..."
npm run build > /dev/null 2>&1

echo -e "${GREEN}✓${NC} Frontend configuré"

# 11. Configuration Nginx
echo -e "\n${YELLOW}[11/12]${NC} Configuration de Nginx..."
sudo tee /etc/nginx/sites-available/bettracker > /dev/null << 'NGINX'
server {
    listen 80;
    server_name 37.59.99.126;

    client_max_body_size 100M;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/bettracker /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo -e "${GREEN}✓${NC} Nginx configuré"

# 12. Démarrage avec PM2
echo -e "\n${YELLOW}[12/12]${NC} Démarrage des services..."

# Backend
cd /var/www/netboot/backend
pm2 start npm --name "bettracker-api" -- run start:prod

# Frontend
cd /var/www/netboot/frontend
pm2 start npm --name "bettracker-frontend" -- start

# Sauvegarder la configuration PM2
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

echo -e "${GREEN}✓${NC} Services démarrés"

# Configuration firewall
echo -e "\n${YELLOW}Configuration du firewall...${NC}"
sudo ufw --force enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo -e "${GREEN}✓${NC} Firewall configuré"

# Résumé
echo -e "\n${GREEN}=============================================="
echo -e "✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS!"
echo -e "==============================================${NC}"
echo -e ""
echo -e "🌐 ${GREEN}Frontend:${NC} http://${SERVER_IP}"
echo -e "🌐 ${GREEN}API Docs:${NC} http://${SERVER_IP}/api/docs"
echo -e "👤 ${GREEN}Admin:${NC} admin@bettracker.pro / Admin123!"
echo -e ""
echo -e "${YELLOW}Commandes utiles:${NC}"
echo -e "  pm2 status          - Voir l'état des services"
echo -e "  pm2 logs            - Voir les logs"
echo -e "  pm2 restart all     - Redémarrer les services"
echo -e "  sudo nginx -t       - Tester la config Nginx"
echo -e ""
echo -e "${GREEN}Bon développement! 🚀${NC}"
