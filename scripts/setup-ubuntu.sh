#!/bin/bash

# BetTracker Pro - Script d'Installation Automatique pour Ubuntu
# Ce script installe et configure tous les prérequis

set -e  # Arrêter en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║       BetTracker Pro - Installation Ubuntu              ║"
echo "║                                                          ║"
echo "║  Ce script va installer :                                ║"
echo "║  - Node.js 18+                                           ║"
echo "║  - PostgreSQL 15+                                        ║"
echo "║  - Redis                                                 ║"
echo "║  - Configuration de la base de données                   ║"
echo "║  - Dépendances npm                                       ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Demander confirmation
read -p "Voulez-vous continuer ? (o/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Oo]$ ]]; then
    echo -e "${RED}Installation annulée.${NC}"
    exit 1
fi

# Fonction pour vérifier si une commande existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

log_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

log_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

# 1. Mise à jour du système
log_info "Mise à jour des paquets système..."
sudo apt update

# 2. Installation de Node.js
log_info "Vérification de Node.js..."
if command_exists node; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        log_success "Node.js $(node -v) déjà installé"
    else
        log_warning "Node.js version trop ancienne. Installation de Node.js 18..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt install -y nodejs
        log_success "Node.js $(node -v) installé"
    fi
else
    log_info "Installation de Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    log_success "Node.js $(node -v) installé"
fi

# 3. Installation de PostgreSQL
log_info "Vérification de PostgreSQL..."
if command_exists psql; then
    log_success "PostgreSQL déjà installé"
else
    log_info "Installation de PostgreSQL..."
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    log_success "PostgreSQL installé et démarré"
fi

# 4. Installation de Redis
log_info "Vérification de Redis..."
if command_exists redis-cli; then
    log_success "Redis déjà installé"
else
    log_info "Installation de Redis..."
    sudo apt install -y redis-server
    sudo systemctl start redis-server
    sudo systemctl enable redis-server
    log_success "Redis installé et démarré"
fi

# 5. Configuration de la base de données PostgreSQL
log_info "Configuration de la base de données PostgreSQL..."

DB_NAME="bettracker_dev"
DB_USER="bettracker_user"
DB_PASS="bettracker_password_123"

# Vérifier si la base existe déjà
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    log_warning "La base de données $DB_NAME existe déjà"
    read -p "Voulez-vous la supprimer et la recréer ? (o/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Oo]$ ]]; then
        sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
        sudo -u postgres psql -c "DROP USER IF EXISTS $DB_USER;"
        log_info "Base de données supprimée"
    else
        log_info "Conservation de la base de données existante"
    fi
fi

# Créer la base de données et l'utilisateur
if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    log_info "Création de la base de données $DB_NAME..."
    sudo -u postgres psql <<EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
EOF
    log_success "Base de données $DB_NAME créée"
else
    log_success "Base de données $DB_NAME déjà existante"
fi

# 6. Navigation vers le dossier backend
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_DIR/backend"

log_info "Navigation vers $BACKEND_DIR..."
cd "$BACKEND_DIR"

# 7. Installation des dépendances npm
log_info "Installation des dépendances npm (cela peut prendre quelques minutes)..."
npm install
log_success "Dépendances npm installées"

# 8. Configuration du fichier .env
log_info "Configuration du fichier .env..."
if [ -f ".env" ]; then
    log_warning "Le fichier .env existe déjà"
    read -p "Voulez-vous le remplacer ? (o/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Oo]$ ]]; then
        log_info "Conservation du fichier .env existant"
    else
        cp .env.example .env
        # Remplacer les valeurs dans .env
        sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME|" .env
        sed -i "s|STORAGE_PATH=.*|STORAGE_PATH=$PROJECT_DIR/storage|" .env
        log_success "Fichier .env créé et configuré"
    fi
else
    cp .env.example .env
    # Remplacer les valeurs dans .env
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME|" .env
    sed -i "s|STORAGE_PATH=.*|STORAGE_PATH=$PROJECT_DIR/storage|" .env
    log_success "Fichier .env créé et configuré"
fi

# 9. Génération du client Prisma
log_info "Génération du client Prisma..."
npm run prisma:generate
log_success "Client Prisma généré"

# 10. Migration de la base de données
log_info "Migration de la base de données..."
npm run prisma:migrate -- --name init || true
log_success "Migrations appliquées"

# 11. Seeding de la base de données
log_info "Peuplement de la base de données avec les données initiales..."
npm run seed
log_success "Base de données peuplée"

# 12. Vérification finale
echo ""
log_info "Vérification de l'installation..."

# Vérifier PostgreSQL
if sudo systemctl is-active --quiet postgresql; then
    log_success "PostgreSQL est actif"
else
    log_error "PostgreSQL n'est pas actif"
fi

# Vérifier Redis
if redis-cli ping > /dev/null 2>&1; then
    log_success "Redis est actif"
else
    log_error "Redis n'est pas actif"
fi

# Vérifier la base de données
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    log_success "Base de données $DB_NAME existe"
else
    log_error "Base de données $DB_NAME n'existe pas"
fi

# 13. Résumé
echo ""
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║           Installation Terminée avec Succès !           ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${BLUE}📝 Informations de connexion à la base de données :${NC}"
echo -e "   Database: ${GREEN}$DB_NAME${NC}"
echo -e "   User:     ${GREEN}$DB_USER${NC}"
echo -e "   Password: ${GREEN}$DB_PASS${NC}"
echo ""
echo -e "${BLUE}👤 Compte administrateur créé :${NC}"
echo -e "   Email:    ${GREEN}admin@bettracker.pro${NC}"
echo -e "   Password: ${GREEN}Admin123!${NC}"
echo ""
echo -e "${BLUE}🚀 Pour démarrer l'application :${NC}"
echo -e "   ${YELLOW}cd $BACKEND_DIR${NC}"
echo -e "   ${YELLOW}npm run start:dev${NC}"
echo ""
echo -e "${BLUE}📚 Documentation API (une fois démarré) :${NC}"
echo -e "   ${GREEN}http://localhost:3000/api/docs${NC}"
echo ""
echo -e "${BLUE}🔍 Prisma Studio (visualiser la base de données) :${NC}"
echo -e "   ${YELLOW}npm run prisma:studio${NC}"
echo -e "   ${GREEN}http://localhost:5555${NC}"
echo ""
echo -e "${YELLOW}⚠️  N'oubliez pas de changer le mot de passe admin en production !${NC}"
echo ""
