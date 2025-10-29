#!/bin/bash
# Script de déploiement complet pour BetTracker Pro
# À exécuter sur le serveur Ubuntu

set -e

echo "🚀 Installation de BetTracker Pro..."

# Installation des dépendances système
sudo apt update
sudo apt install -y curl git nginx postgresql postgresql-contrib redis-server

# Installation de Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Installation de PM2
sudo npm install -g pm2

# Cloner le projet
cd /var/www
sudo git clone https://github.com/anhost77/netboot.git
cd netboot
sudo git checkout save/config-2025-10-29

# Configuration PostgreSQL
sudo -u postgres psql << EOF
CREATE DATABASE bettracker_prod;
CREATE USER bettracker_user WITH PASSWORD 'BetTracker2025!Secure';
GRANT ALL PRIVILEGES ON DATABASE bettracker_prod TO bettracker_user;
ALTER DATABASE bettracker_prod OWNER TO bettracker_user;
\q
EOF

# Configuration Backend
cd /var/www/netboot/backend
sudo cp .env.local.example .env
sudo sed -i 's|http://localhost:3000|http://37.59.99.126|g' .env
sudo sed -i 's|http://localhost:3001|http://37.59.99.126|g' .env
sudo sed -i 's|password|BetTracker2025!Secure|g' .env
sudo npm install
sudo npx prisma generate
sudo npx prisma migrate deploy
sudo npm run seed

# Configuration Frontend
cd /var/www/netboot/frontend
sudo cp .env.local.example .env
sudo sed -i 's|http://localhost:3001|http://37.59.99.126|g' .env
sudo npm install
sudo npm run build

# Configuration Nginx
sudo tee /etc/nginx/sites-available/bettracker << 'EOF'
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
EOF

sudo ln -sf /etc/nginx/sites-available/bettracker /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Démarrer avec PM2
cd /var/www/netboot/backend
pm2 start npm --name "bettracker-api" -- run start:prod
cd /var/www/netboot/frontend
pm2 start npm --name "bettracker-frontend" -- start
pm2 save
pm2 startup

# Configuration firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo "✅ Déploiement terminé!"
echo "🌐 Frontend: http://37.59.99.126"
echo "🌐 API: http://37.59.99.126/api/docs"
echo "👤 Admin: admin@bettracker.pro / Admin123!"
