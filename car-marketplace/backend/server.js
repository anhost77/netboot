const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Base de données en mémoire (pour la démo)
let cars = [
  {
    id: '1',
    title: 'Renault Clio 5 Intens',
    brand: 'Renault',
    model: 'Clio',
    year: 2021,
    price: 18500,
    mileage: 25000,
    fuel: 'Essence',
    transmission: 'Manuelle',
    location: 'Paris',
    description: 'Excellent état, première main, toutes options',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
    seller: 'Jean Dupont',
    phone: '06 12 34 56 78',
    email: 'jean.dupont@email.com',
    createdAt: new Date('2025-10-15')
  },
  {
    id: '2',
    title: 'Peugeot 3008 GT Line',
    brand: 'Peugeot',
    model: '3008',
    year: 2020,
    price: 28900,
    mileage: 45000,
    fuel: 'Diesel',
    transmission: 'Automatique',
    location: 'Lyon',
    description: 'SUV familial, très bien entretenu, garantie constructeur',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800',
    seller: 'Marie Martin',
    phone: '06 98 76 54 32',
    email: 'marie.martin@email.com',
    createdAt: new Date('2025-10-14')
  },
  {
    id: '3',
    title: 'BMW Série 3 320d',
    brand: 'BMW',
    model: 'Série 3',
    year: 2019,
    price: 32000,
    mileage: 60000,
    fuel: 'Diesel',
    transmission: 'Automatique',
    location: 'Marseille',
    description: 'Pack M Sport, GPS, cuir, toit panoramique',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
    seller: 'Pierre Dubois',
    phone: '06 45 67 89 12',
    email: 'pierre.dubois@email.com',
    createdAt: new Date('2025-10-13')
  },
  {
    id: '4',
    title: 'Volkswagen Golf 8 GTI',
    brand: 'Volkswagen',
    model: 'Golf',
    year: 2022,
    price: 38500,
    mileage: 15000,
    fuel: 'Essence',
    transmission: 'Automatique',
    location: 'Toulouse',
    description: 'Version sportive, parfait état, garantie 2 ans',
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800',
    seller: 'Sophie Laurent',
    phone: '06 23 45 67 89',
    email: 'sophie.laurent@email.com',
    createdAt: new Date('2025-10-12')
  },
  {
    id: '5',
    title: 'Mercedes Classe A 180d',
    brand: 'Mercedes',
    model: 'Classe A',
    year: 2021,
    price: 29900,
    mileage: 35000,
    fuel: 'Diesel',
    transmission: 'Automatique',
    location: 'Bordeaux',
    description: 'Pack AMG Line, écran MBUX, sièges chauffants',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
    seller: 'Thomas Bernard',
    phone: '06 78 90 12 34',
    email: 'thomas.bernard@email.com',
    createdAt: new Date('2025-10-11')
  },
  {
    id: '6',
    title: 'Audi A3 Sportback',
    brand: 'Audi',
    model: 'A3',
    year: 2020,
    price: 26500,
    mileage: 42000,
    fuel: 'Essence',
    transmission: 'Automatique',
    location: 'Nice',
    description: 'Finition S Line, cockpit virtuel, excellent état',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
    seller: 'Claire Petit',
    phone: '06 34 56 78 90',
    email: 'claire.petit@email.com',
    createdAt: new Date('2025-10-10')
  }
];

// Routes API
// GET toutes les annonces avec filtres
app.get('/api/cars', (req, res) => {
  let filtered = [...cars];

  const { brand, minPrice, maxPrice, minYear, maxYear, fuel, transmission, search } = req.query;

  if (brand) {
    filtered = filtered.filter(car => car.brand.toLowerCase() === brand.toLowerCase());
  }

  if (minPrice) {
    filtered = filtered.filter(car => car.price >= parseInt(minPrice));
  }

  if (maxPrice) {
    filtered = filtered.filter(car => car.price <= parseInt(maxPrice));
  }

  if (minYear) {
    filtered = filtered.filter(car => car.year >= parseInt(minYear));
  }

  if (maxYear) {
    filtered = filtered.filter(car => car.year <= parseInt(maxYear));
  }

  if (fuel) {
    filtered = filtered.filter(car => car.fuel.toLowerCase() === fuel.toLowerCase());
  }

  if (transmission) {
    filtered = filtered.filter(car => car.transmission.toLowerCase() === transmission.toLowerCase());
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(car =>
      car.title.toLowerCase().includes(searchLower) ||
      car.brand.toLowerCase().includes(searchLower) ||
      car.model.toLowerCase().includes(searchLower) ||
      car.description.toLowerCase().includes(searchLower)
    );
  }

  // Trier par date (plus récent en premier)
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(filtered);
});

// GET une annonce spécifique
app.get('/api/cars/:id', (req, res) => {
  const car = cars.find(c => c.id === req.params.id);
  if (!car) {
    return res.status(404).json({ error: 'Annonce non trouvée' });
  }
  res.json(car);
});

// POST créer une nouvelle annonce
app.post('/api/cars', (req, res) => {
  const newCar = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date()
  };

  cars.push(newCar);
  res.status(201).json(newCar);
});

// DELETE supprimer une annonce
app.delete('/api/cars/:id', (req, res) => {
  const index = cars.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Annonce non trouvée' });
  }

  cars.splice(index, 1);
  res.status(204).send();
});

// GET statistiques
app.get('/api/stats', (req, res) => {
  const brands = [...new Set(cars.map(c => c.brand))];
  const avgPrice = cars.reduce((sum, car) => sum + car.price, 0) / cars.length;

  res.json({
    totalCars: cars.length,
    brands: brands.length,
    averagePrice: Math.round(avgPrice),
    latestCars: cars.slice(0, 3)
  });
});

app.listen(PORT, () => {
  console.log(`🚗 Server running on http://localhost:${PORT}`);
});
