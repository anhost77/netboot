#!/bin/bash

# 🚀 Script de déploiement pour Plesk
# Usage: ./scripts/deploy-plesk.sh

set -e

echo "🚀 Début du déploiement BetTracker Pro sur Plesk..."

# Variables - MODIFIEZ CES VALEURS
DOMAIN="votredomaine.com"
API_SUBDOMAIN="api.votredomaine.com"
SITE_PATH="/var/www/vhosts/$DOMAIN"
BACKEND_PATH="$SITE_PATH/$API_SUBDOMAIN/backend"
FRONTEND_PATH="$SITE_PATH/httpdocs"

# Couleurs pour les logs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier si on est dans le bon dossier
if [ ! -f "package.json" ]; then
    log_error "Erreur: Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

# 1. Mettre à jour le code
log_info "Mise à jour du code depuis Git..."
git pull origin main
log_success "Code mis à jour"

# 2. Backend
log_info "Déploiement du backend..."
cd backend

log_info "Installation des dépendances..."
npm install --production

log_info "Build du backend..."
npm run build

log_info "Migrations de la base de données..."
npx prisma migrate deploy

log_info "Génération du client Prisma..."
npx prisma generate

log_success "Backend prêt"

# 3. Frontend
log_info "Déploiement du frontend..."
cd ../frontend

log_info "Installation des dépendances..."
npm install --production

log_info "Build du frontend..."
npm run build

log_success "Frontend prêt"

# 4. Redémarrage des services
log_info "Redémarrage des services PM2..."
cd ..

if command -v pm2 &> /dev/null; then
    pm2 restart bettracker-backend
    pm2 restart bettracker-frontend
    log_success "Services redémarrés"
else
    log_error "PM2 n'est pas installé. Installez-le avec: npm install -g pm2"
fi

# 5. Vérification
log_info "Vérification du déploiement..."

echo ""
echo "========================================"
echo "✅ Déploiement terminé avec succès !"
echo "========================================"
echo ""
echo "🌐 Frontend: https://$DOMAIN"
echo "🔧 API: https://$API_SUBDOMAIN"
echo "🔐 Admin: https://$DOMAIN/admin"
echo ""
echo "📊 Vérifiez les logs avec: pm2 logs"
echo "📝 Statut des services: pm2 status"
echo ""
