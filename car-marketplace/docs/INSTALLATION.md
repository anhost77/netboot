# Guide d'installation détaillé

## Table des matières
1. [Prérequis](#prérequis)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Démarrage](#démarrage)
5. [Résolution des problèmes](#résolution-des-problèmes)

## Prérequis

### Node.js et npm
Vous devez avoir Node.js installé sur votre machine.

**Vérifier l'installation :**
```bash
node --version  # Doit être >= 16.0.0
npm --version   # Doit être >= 8.0.0
```

**Installation de Node.js :**
- **Windows/Mac** : Téléchargez depuis https://nodejs.org
- **Linux** :
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```

## Installation

### 1. Naviguer vers le projet
```bash
cd car-marketplace
```

### 2. Installation du backend

```bash
cd backend
npm install
```

**Dépendances installées :**
- `express` : Framework web
- `cors` : Gestion CORS
- `body-parser` : Parse des requêtes
- `uuid` : Génération d'IDs uniques
- `nodemon` : Rechargement automatique (dev)

### 3. Installation du frontend

```bash
cd ../frontend
npm install
```

**Dépendances installées :**
- `react` : Bibliothèque UI
- `react-dom` : Rendering React
- `react-router-dom` : Navigation
- `vite` : Build tool
- `@vitejs/plugin-react` : Plugin React pour Vite

## Configuration

### Backend
Le backend écoute par défaut sur le port **3001**.

Pour changer le port, modifiez `backend/server.js` :
```javascript
const PORT = process.env.PORT || 3001;
```

Ou définissez une variable d'environnement :
```bash
export PORT=4000
```

### Frontend
Le frontend écoute par défaut sur le port **3000**.

Pour changer le port, modifiez `frontend/vite.config.js` :
```javascript
server: {
  port: 3000,
  // ...
}
```

### Proxy API
Le frontend est configuré pour proxifier les requêtes `/api/*` vers le backend.

Configuration dans `frontend/vite.config.js` :
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true
  }
}
```

## Démarrage

### Méthode 1 : Démarrage séparé (Recommandé pour le développement)

**Terminal 1 - Backend :**
```bash
cd backend
npm run dev
```

Vous devriez voir :
```
🚗 Server running on http://localhost:3001
```

**Terminal 2 - Frontend :**
```bash
cd frontend
npm run dev
```

Vous devriez voir :
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

### Méthode 2 : Démarrage simultané

1. Installez `concurrently` globalement :
```bash
npm install -g concurrently
```

2. Depuis la racine du projet :
```bash
npm run dev
```

Cette commande lance automatiquement le backend et le frontend.

### Accéder à l'application

Ouvrez votre navigateur et allez sur :
```
http://localhost:3000
```

## Vérification de l'installation

### Tester le backend
```bash
curl http://localhost:3001/api/cars
```

Vous devriez recevoir une liste d'annonces en JSON.

### Tester le frontend
1. Ouvrez http://localhost:3000
2. Vous devriez voir la page d'accueil avec des annonces
3. Testez la recherche et les filtres
4. Cliquez sur une annonce pour voir les détails
5. Testez le formulaire "Déposer une annonce"

## Résolution des problèmes

### Erreur : Port déjà utilisé

**Symptôme :**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution :**
1. Trouvez le processus utilisant le port :
```bash
# Linux/Mac
lsof -i :3000

# Windows
netstat -ano | findstr :3000
```

2. Tuez le processus ou changez le port dans la configuration.

### Erreur : Cannot find module

**Symptôme :**
```
Error: Cannot find module 'express'
```

**Solution :**
Réinstallez les dépendances :
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Erreur : API calls failing

**Symptôme :**
Les requêtes API échouent avec des erreurs CORS ou 404.

**Solution :**
1. Vérifiez que le backend est bien démarré
2. Vérifiez la configuration du proxy dans `vite.config.js`
3. Vérifiez que le port du backend correspond

### Erreur : React ne se met pas à jour

**Symptôme :**
Les changements dans le code ne sont pas reflétés dans le navigateur.

**Solution :**
1. Videz le cache du navigateur (Ctrl+Shift+R)
2. Redémarrez Vite
3. Supprimez `.vite` et `node_modules/.vite`

### Page blanche au chargement

**Symptôme :**
L'application affiche une page blanche.

**Solution :**
1. Ouvrez la console du navigateur (F12)
2. Vérifiez les erreurs JavaScript
3. Vérifiez que tous les fichiers sont bien présents
4. Redémarrez le serveur de développement

## Build pour la production

### Frontend
```bash
cd frontend
npm run build
```

Les fichiers optimisés seront dans `frontend/dist/`.

### Prévisualiser le build
```bash
npm run preview
```

## Variables d'environnement

Pour une configuration plus flexible, créez un fichier `.env` :

**backend/.env**
```env
PORT=3001
NODE_ENV=development
```

**frontend/.env**
```env
VITE_API_URL=http://localhost:3001
```

## Commandes utiles

### Backend
```bash
npm start       # Démarrer en mode production
npm run dev     # Démarrer en mode développement (avec nodemon)
```

### Frontend
```bash
npm run dev     # Démarrer le serveur de développement
npm run build   # Construire pour la production
npm run preview # Prévisualiser le build de production
```

## Support

Pour toute question ou problème :
1. Vérifiez la documentation principale (README.md)
2. Consultez les logs d'erreur
3. Vérifiez que toutes les dépendances sont installées

---

Bonne utilisation ! 🚗✨
