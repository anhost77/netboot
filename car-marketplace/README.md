# 🚗 AutoMarket - Marketplace de Voitures

Un site web moderne de petites annonces automobiles, inspiré de leboncoin.fr, spécialisé dans la vente de voitures d'occasion.

![AutoMarket](https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=400&fit=crop)

## ✨ Fonctionnalités

### Pour les visiteurs
- 🔍 **Recherche avancée** : Trouvez rapidement la voiture qui vous convient
- 🎯 **Filtres multiples** : Par marque, prix, année, carburant, transmission
- 📱 **Design responsive** : Fonctionne sur tous les appareils
- 🖼️ **Interface moderne** : Design inspiré des meilleurs sites de petites annonces
- 📊 **Vue détaillée** : Toutes les informations sur chaque véhicule

### Pour les vendeurs
- ➕ **Déposer une annonce** : Formulaire simple et intuitif
- 📝 **Description complète** : Ajoutez tous les détails de votre véhicule
- 📞 **Contact direct** : Les acheteurs peuvent vous contacter facilement

## 🛠️ Technologies utilisées

### Frontend
- **React 18** : Bibliothèque UI moderne
- **React Router** : Navigation entre les pages
- **Vite** : Build tool ultra-rapide
- **CSS3** : Styling moderne et responsive

### Backend
- **Node.js** : Runtime JavaScript
- **Express.js** : Framework web minimaliste
- **CORS** : Gestion des requêtes cross-origin

## 📦 Installation

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn

### Étapes d'installation

1. **Cloner le repository**
```bash
cd car-marketplace
```

2. **Installer les dépendances du backend**
```bash
cd backend
npm install
```

3. **Installer les dépendances du frontend**
```bash
cd ../frontend
npm install
```

## 🚀 Lancement de l'application

### Option 1 : Lancer backend et frontend séparément

**Terminal 1 - Backend :**
```bash
cd backend
npm run dev
```
Le serveur démarre sur http://localhost:3001

**Terminal 2 - Frontend :**
```bash
cd frontend
npm run dev
```
L'application démarre sur http://localhost:3000

### Option 2 : Lancer tout en même temps

Depuis la racine du projet :
```bash
npm install -g concurrently
npm run dev
```

## 📖 Utilisation

### Page d'accueil
- Voir toutes les annonces disponibles
- Utiliser la barre de recherche pour trouver un véhicule spécifique
- Appliquer des filtres pour affiner les résultats

### Voir une annonce
- Cliquer sur une carte de voiture pour voir tous les détails
- Voir les spécifications complètes
- Contacter le vendeur par téléphone ou email

### Déposer une annonce
1. Cliquer sur "Déposer une annonce" dans le header
2. Remplir le formulaire avec les informations du véhicule
3. Ajouter vos coordonnées de contact
4. Publier l'annonce

## 🗂️ Structure du projet

```
car-marketplace/
├── backend/
│   ├── server.js          # Serveur Express et API
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   │   ├── CarCard.jsx
│   │   │   ├── Filters.jsx
│   │   │   └── SearchBar.jsx
│   │   ├── pages/         # Pages principales
│   │   │   ├── Home.jsx
│   │   │   ├── CarDetail.jsx
│   │   │   └── PostAd.jsx
│   │   ├── App.jsx        # Composant principal
│   │   ├── main.jsx       # Point d'entrée
│   │   └── index.css      # Styles globaux
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### GET /api/cars
Récupère toutes les annonces avec filtres optionnels

**Query Parameters :**
- `brand` : Filtrer par marque
- `minPrice` / `maxPrice` : Filtrer par prix
- `minYear` / `maxYear` : Filtrer par année
- `fuel` : Filtrer par carburant
- `transmission` : Filtrer par transmission
- `search` : Recherche textuelle

**Exemple :**
```
GET /api/cars?brand=Renault&minPrice=15000&maxPrice=25000
```

### GET /api/cars/:id
Récupère une annonce spécifique

**Exemple :**
```
GET /api/cars/1
```

### POST /api/cars
Crée une nouvelle annonce

**Body :**
```json
{
  "title": "Renault Clio 5",
  "brand": "Renault",
  "model": "Clio",
  "year": 2021,
  "price": 18500,
  "mileage": 25000,
  "fuel": "Essence",
  "transmission": "Manuelle",
  "location": "Paris",
  "description": "Excellent état",
  "image": "https://...",
  "seller": "Jean Dupont",
  "phone": "06 12 34 56 78",
  "email": "jean@email.com"
}
```

### DELETE /api/cars/:id
Supprime une annonce

### GET /api/stats
Récupère les statistiques

## 🎨 Personnalisation

### Couleurs
Les couleurs principales sont définies dans `frontend/src/index.css` :

```css
:root {
  --primary-color: #ff6b35;    /* Orange principal */
  --secondary-color: #004e89;   /* Bleu secondaire */
  --dark-color: #1a1a2e;        /* Couleur sombre */
  --light-color: #f5f5f5;       /* Couleur claire */
}
```

### Données
Les données sont stockées en mémoire dans `backend/server.js`. Pour une application en production, vous devriez utiliser une vraie base de données (MongoDB, PostgreSQL, etc.).

## 🚀 Déploiement

### Frontend
Le frontend peut être déployé sur :
- Vercel
- Netlify
- GitHub Pages

```bash
cd frontend
npm run build
```

### Backend
Le backend peut être déployé sur :
- Heroku
- Railway
- Render
- DigitalOcean

## 📝 Améliorations possibles

- [ ] Authentification des utilisateurs
- [ ] Base de données persistante (MongoDB, PostgreSQL)
- [ ] Upload d'images
- [ ] Messagerie entre acheteurs et vendeurs
- [ ] Système de favoris
- [ ] Comparateur de véhicules
- [ ] Pagination des résultats
- [ ] Géolocalisation
- [ ] Notifications email
- [ ] Backoffice d'administration

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

MIT License - Vous êtes libre d'utiliser ce projet comme bon vous semble.

## 👨‍💻 Auteur

Développé avec ❤️ par Claude

---

**Note :** Ce projet est une démonstration. Pour une utilisation en production, ajoutez :
- Une vraie base de données
- Un système d'authentification
- Une validation des données côté serveur
- Une gestion des erreurs robuste
- Des tests unitaires et d'intégration
