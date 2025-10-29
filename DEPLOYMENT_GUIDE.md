# Guide de déploiement sur Ubuntu Server

## 📋 Informations serveur
- **IP**: 37.59.99.126
- **User**: ubuntu
- **OS**: Ubuntu Server

## 🚀 Déploiement automatique

### Étape 1: Connexion au serveur

```bash
ssh ubuntu@37.59.99.126
```

### Étape 2: Télécharger et exécuter le script d'installation

```bash
# Cloner le repository
git clone https://github.com/anhost77/netboot.git
cd netboot
git checkout save/config-2025-10-29

# Rendre le script exécutable
chmod +x scripts/deploy-production.sh

# Exécuter le script de déploiement
sudo ./scripts/deploy-production.sh
```

## 📝 Ce que fait le script automatiquement

1. ✅ Installation de Node.js 18+
2. ✅ Installation de PostgreSQL 15+
3. ✅ Installation de Redis
4. ✅ Installation de Nginx
5. ✅ Installation de PM2 (gestionnaire de processus)
6. ✅ Configuration de la base de données
7. ✅ Installation des dépendances backend/frontend
8. ✅ Configuration des variables d'environnement
9. ✅ Build du frontend
10. ✅ Migrations de la base de données
11. ✅ Configuration Nginx avec reverse proxy
12. ✅ Démarrage des services avec PM2
13. ✅ Configuration du firewall

## 🌐 Après le déploiement

Votre application sera accessible sur:
- **Frontend**: http://37.59.99.126
- **Backend API**: http://37.59.99.126/api
- **Swagger**: http://37.59.99.126/api/docs

## 🔒 Configuration SSL (optionnel mais recommandé)

Si vous avez un nom de domaine:

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtenir un certificat SSL
sudo certbot --nginx -d votredomaine.com -d api.votredomaine.com

# Le renouvellement automatique est configuré
```

## 🔧 Commandes utiles

### Gérer les services avec PM2

```bash
# Voir le statut
pm2 status

# Voir les logs
pm2 logs

# Redémarrer
pm2 restart all

# Arrêter
pm2 stop all

# Démarrer
pm2 start all
```

### Gérer Nginx

```bash
# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx

# Voir les logs
sudo tail -f /var/log/nginx/error.log
```

### Base de données

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql bettracker_prod

# Voir les tables
\dt

# Quitter
\q
```

## 🔄 Mise à jour de l'application

```bash
cd /var/www/netboot

# Récupérer les dernières modifications
git pull origin main

# Backend
cd backend
npm install
npx prisma migrate deploy
pm2 restart bettracker-api

# Frontend
cd ../frontend
npm install
npm run build
pm2 restart bettracker-frontend
```

## 🐛 Dépannage

### Vérifier les logs

```bash
# Logs PM2
pm2 logs

# Logs Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Logs système
sudo journalctl -u nginx -f
```

### Redémarrer tous les services

```bash
sudo systemctl restart nginx
pm2 restart all
sudo systemctl restart postgresql
sudo systemctl restart redis
```

### Vérifier les ports

```bash
# Voir les ports en écoute
sudo netstat -tulpn | grep LISTEN

# Backend devrait être sur 3001
# Frontend devrait être sur 3000
# Nginx sur 80 (et 443 si SSL)
```

## 📊 Monitoring

### Installer un monitoring basique

```bash
# Installer htop pour surveiller les ressources
sudo apt install htop -y

# Lancer htop
htop
```

### PM2 Monitoring

```bash
# Monitoring en temps réel
pm2 monit
```

## 🔐 Sécurité

### Firewall (déjà configuré par le script)

```bash
# Voir les règles
sudo ufw status

# Autoriser un nouveau port si nécessaire
sudo ufw allow 8080/tcp
```

### Mise à jour du système

```bash
# Mettre à jour les paquets
sudo apt update && sudo apt upgrade -y

# Redémarrer si nécessaire
sudo reboot
```

## 📞 Support

En cas de problème:
1. Vérifier les logs avec `pm2 logs`
2. Vérifier Nginx avec `sudo nginx -t`
3. Vérifier la base de données avec `sudo systemctl status postgresql`
4. Vérifier Redis avec `sudo systemctl status redis`
