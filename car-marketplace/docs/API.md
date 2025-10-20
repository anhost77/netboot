# Documentation de l'API

## Base URL
```
http://localhost:3001/api
```

## Endpoints

### 1. Récupérer toutes les annonces

**GET** `/api/cars`

Récupère la liste de toutes les annonces avec possibilité de filtrage.

#### Query Parameters (optionnels)

| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `brand` | string | Filtrer par marque | `?brand=Renault` |
| `minPrice` | number | Prix minimum | `?minPrice=15000` |
| `maxPrice` | number | Prix maximum | `?maxPrice=30000` |
| `minYear` | number | Année minimum | `?minYear=2020` |
| `maxYear` | number | Année maximum | `?maxYear=2023` |
| `fuel` | string | Type de carburant | `?fuel=Diesel` |
| `transmission` | string | Type de transmission | `?transmission=Automatique` |
| `search` | string | Recherche textuelle | `?search=clio` |

#### Exemples de requêtes

```bash
# Toutes les annonces
GET /api/cars

# Filtrer par marque
GET /api/cars?brand=Renault

# Filtrer par prix
GET /api/cars?minPrice=15000&maxPrice=25000

# Combinaison de filtres
GET /api/cars?brand=BMW&fuel=Diesel&minYear=2019

# Recherche textuelle
GET /api/cars?search=golf
```

#### Réponse

**Status:** 200 OK

```json
[
  {
    "id": "1",
    "title": "Renault Clio 5 Intens",
    "brand": "Renault",
    "model": "Clio",
    "year": 2021,
    "price": 18500,
    "mileage": 25000,
    "fuel": "Essence",
    "transmission": "Manuelle",
    "location": "Paris",
    "description": "Excellent état, première main, toutes options",
    "image": "https://...",
    "seller": "Jean Dupont",
    "phone": "06 12 34 56 78",
    "email": "jean.dupont@email.com",
    "createdAt": "2025-10-15T00:00:00.000Z"
  }
]
```

---

### 2. Récupérer une annonce spécifique

**GET** `/api/cars/:id`

Récupère les détails d'une annonce spécifique.

#### Paramètres d'URL

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | string | ID de l'annonce |

#### Exemple de requête

```bash
GET /api/cars/1
```

#### Réponse

**Status:** 200 OK

```json
{
  "id": "1",
  "title": "Renault Clio 5 Intens",
  "brand": "Renault",
  "model": "Clio",
  "year": 2021,
  "price": 18500,
  "mileage": 25000,
  "fuel": "Essence",
  "transmission": "Manuelle",
  "location": "Paris",
  "description": "Excellent état, première main, toutes options",
  "image": "https://...",
  "seller": "Jean Dupont",
  "phone": "06 12 34 56 78",
  "email": "jean.dupont@email.com",
  "createdAt": "2025-10-15T00:00:00.000Z"
}
```

**Status:** 404 Not Found

```json
{
  "error": "Annonce non trouvée"
}
```

---

### 3. Créer une nouvelle annonce

**POST** `/api/cars`

Crée une nouvelle annonce de voiture.

#### Headers

```
Content-Type: application/json
```

#### Body

```json
{
  "title": "Renault Clio 5 Intens",
  "brand": "Renault",
  "model": "Clio",
  "year": 2021,
  "price": 18500,
  "mileage": 25000,
  "fuel": "Essence",
  "transmission": "Manuelle",
  "location": "Paris",
  "description": "Excellent état, première main, toutes options",
  "image": "https://images.example.com/car.jpg",
  "seller": "Jean Dupont",
  "phone": "06 12 34 56 78",
  "email": "jean.dupont@email.com"
}
```

#### Champs requis

| Champ | Type | Description | Valeurs possibles |
|-------|------|-------------|-------------------|
| `title` | string | Titre de l'annonce | - |
| `brand` | string | Marque du véhicule | - |
| `model` | string | Modèle du véhicule | - |
| `year` | number | Année de fabrication | 1990-2025 |
| `price` | number | Prix en euros | > 0 |
| `mileage` | number | Kilométrage | >= 0 |
| `fuel` | string | Type de carburant | Essence, Diesel, Électrique, Hybride |
| `transmission` | string | Type de transmission | Manuelle, Automatique |
| `location` | string | Ville | - |
| `description` | string | Description détaillée | - |
| `seller` | string | Nom du vendeur | - |
| `phone` | string | Téléphone du vendeur | - |
| `email` | string | Email du vendeur | format email valide |

#### Champs optionnels

| Champ | Type | Description |
|-------|------|-------------|
| `image` | string | URL de l'image | URL valide |

#### Exemple de requête

```bash
curl -X POST http://localhost:3001/api/cars \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Peugeot 208 GT Line",
    "brand": "Peugeot",
    "model": "208",
    "year": 2022,
    "price": 19900,
    "mileage": 12000,
    "fuel": "Essence",
    "transmission": "Automatique",
    "location": "Lyon",
    "description": "Comme neuve, garantie constructeur",
    "image": "https://...",
    "seller": "Marie Martin",
    "phone": "06 98 76 54 32",
    "email": "marie.martin@email.com"
  }'
```

#### Réponse

**Status:** 201 Created

```json
{
  "id": "uuid-generated",
  "title": "Peugeot 208 GT Line",
  "brand": "Peugeot",
  "model": "208",
  "year": 2022,
  "price": 19900,
  "mileage": 12000,
  "fuel": "Essence",
  "transmission": "Automatique",
  "location": "Lyon",
  "description": "Comme neuve, garantie constructeur",
  "image": "https://...",
  "seller": "Marie Martin",
  "phone": "06 98 76 54 32",
  "email": "marie.martin@email.com",
  "createdAt": "2025-10-20T10:30:00.000Z"
}
```

---

### 4. Supprimer une annonce

**DELETE** `/api/cars/:id`

Supprime une annonce existante.

#### Paramètres d'URL

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | string | ID de l'annonce |

#### Exemple de requête

```bash
curl -X DELETE http://localhost:3001/api/cars/1
```

#### Réponse

**Status:** 204 No Content

Aucun body retourné.

**Status:** 404 Not Found

```json
{
  "error": "Annonce non trouvée"
}
```

---

### 5. Statistiques

**GET** `/api/stats`

Récupère les statistiques générales du site.

#### Exemple de requête

```bash
GET /api/stats
```

#### Réponse

**Status:** 200 OK

```json
{
  "totalCars": 6,
  "brands": 5,
  "averagePrice": 27400,
  "latestCars": [
    {
      "id": "1",
      "title": "Renault Clio 5 Intens",
      "price": 18500,
      "createdAt": "2025-10-15T00:00:00.000Z"
    }
  ]
}
```

---

## Codes de statut HTTP

| Code | Description |
|------|-------------|
| 200 | OK - La requête a réussi |
| 201 | Created - La ressource a été créée |
| 204 | No Content - La requête a réussi, pas de contenu à retourner |
| 404 | Not Found - La ressource demandée n'existe pas |
| 500 | Internal Server Error - Erreur serveur |

---

## Types de données

### Objet Car

```typescript
interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: 'Essence' | 'Diesel' | 'Électrique' | 'Hybride';
  transmission: 'Manuelle' | 'Automatique';
  location: string;
  description: string;
  image: string;
  seller: string;
  phone: string;
  email: string;
  createdAt: Date;
}
```

---

## Exemples d'utilisation avec JavaScript

### Récupérer toutes les annonces

```javascript
const fetchCars = async () => {
  try {
    const response = await fetch('/api/cars');
    const cars = await response.json();
    console.log(cars);
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

### Créer une annonce

```javascript
const createCar = async (carData) => {
  try {
    const response = await fetch('/api/cars', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(carData)
    });
    const newCar = await response.json();
    console.log('Annonce créée:', newCar);
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

### Supprimer une annonce

```javascript
const deleteCar = async (carId) => {
  try {
    await fetch(`/api/cars/${carId}`, {
      method: 'DELETE'
    });
    console.log('Annonce supprimée');
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

---

## Notes importantes

1. **Persistance** : Les données sont actuellement stockées en mémoire. Elles sont perdues au redémarrage du serveur.

2. **Authentification** : Aucune authentification n'est implémentée. En production, ajoutez un système d'auth.

3. **Validation** : La validation des données est minimale. Ajoutez une validation robuste en production.

4. **CORS** : Le serveur accepte actuellement toutes les origines. Restreignez en production.

5. **Rate limiting** : Aucune limitation de débit n'est implémentée. Ajoutez-en pour éviter les abus.
