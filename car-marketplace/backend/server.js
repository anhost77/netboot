const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'automarket-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

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

// Admin users (password: admin123)
let users = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@automarket.fr',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    createdAt: new Date()
  }
];

// Pages de contenu
let pages = [
  {
    id: '1',
    slug: 'mentions-legales',
    title: 'Mentions Légales',
    content: '<h2>Mentions Légales</h2><p>Éditeur du site : AutoMarket SAS</p><p>Siège social : 123 Rue de la Voiture, 75001 Paris</p><p>SIRET : 123 456 789 00010</p><p>Directeur de publication : Jean Dupont</p>',
    metaTitle: 'Mentions Légales - AutoMarket',
    metaDescription: 'Mentions légales du site AutoMarket',
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    slug: 'contact',
    title: 'Contactez-nous',
    content: '<h2>Contactez-nous</h2><p>Vous avez une question ? N\'hésitez pas à nous contacter !</p><p><strong>Email :</strong> contact@automarket.fr</p><p><strong>Téléphone :</strong> 01 23 45 67 89</p><p><strong>Adresse :</strong> 123 Rue de la Voiture, 75001 Paris</p>',
    metaTitle: 'Contact - AutoMarket',
    metaDescription: 'Contactez l\'équipe AutoMarket',
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    slug: 'conditions-generales',
    title: 'Conditions Générales d\'Utilisation',
    content: '<h2>Conditions Générales d\'Utilisation</h2><p>Dernière mise à jour : Octobre 2025</p><h3>Article 1 - Objet</h3><p>Les présentes conditions générales ont pour objet de définir les modalités d\'utilisation du site AutoMarket.</p>',
    metaTitle: 'CGU - AutoMarket',
    metaDescription: 'Conditions générales d\'utilisation',
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    slug: 'politique-confidentialite',
    title: 'Politique de Confidentialité',
    content: '<h2>Politique de Confidentialité</h2><p>Nous respectons votre vie privée et nous engageons à protéger vos données personnelles.</p><h3>Collecte des données</h3><p>Nous collectons uniquement les données nécessaires au bon fonctionnement du service.</p>',
    metaTitle: 'Politique de Confidentialité - AutoMarket',
    metaDescription: 'Notre politique de protection des données',
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Menus de navigation
let menus = [
  {
    id: '1',
    name: 'Menu Principal',
    location: 'main',
    items: [
      { id: '1', label: 'Accueil', url: '/', order: 1 },
      { id: '2', label: 'Déposer une annonce', url: '/post-ad', order: 2 }
    ]
  },
  {
    id: '2',
    name: 'Menu Footer',
    location: 'footer',
    items: [
      { id: '1', label: 'Mentions Légales', url: '/page/mentions-legales', order: 1 },
      { id: '2', label: 'CGU', url: '/page/conditions-generales', order: 2 },
      { id: '3', label: 'Politique de Confidentialité', url: '/page/politique-confidentialite', order: 3 },
      { id: '4', label: 'Contact', url: '/page/contact', order: 4 }
    ]
  }
];

// Editorial content (homepage banner, etc.)
let editorials = {
  homepageBanner: {
    title: 'Trouvez la voiture de vos rêves',
    subtitle: 'Des milliers d\'annonces de voitures d\'occasion vérifiées',
    updatedAt: new Date()
  }
};

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

// ============ AUTHENTICATION ROUTES ============

// POST login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username || u.email === username);

  if (!user) {
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});

// GET verify token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// ============ PAGES ROUTES ============

// GET toutes les pages (publiques seulement)
app.get('/api/pages', (req, res) => {
  const publishedPages = pages.filter(p => p.isPublished);
  res.json(publishedPages.map(p => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription
  })));
});

// GET une page par slug
app.get('/api/pages/:slug', (req, res) => {
  const page = pages.find(p => p.slug === req.params.slug);

  if (!page || !page.isPublished) {
    return res.status(404).json({ error: 'Page non trouvée' });
  }

  res.json(page);
});

// GET toutes les pages (admin)
app.get('/api/admin/pages', authenticateToken, (req, res) => {
  res.json(pages);
});

// GET une page par ID (admin)
app.get('/api/admin/pages/:id', authenticateToken, (req, res) => {
  const page = pages.find(p => p.id === req.params.id);

  if (!page) {
    return res.status(404).json({ error: 'Page non trouvée' });
  }

  res.json(page);
});

// POST créer une page (admin)
app.post('/api/admin/pages', authenticateToken, (req, res) => {
  const newPage = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  pages.push(newPage);
  res.status(201).json(newPage);
});

// PUT mettre à jour une page (admin)
app.put('/api/admin/pages/:id', authenticateToken, (req, res) => {
  const index = pages.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Page non trouvée' });
  }

  pages[index] = {
    ...pages[index],
    ...req.body,
    id: req.params.id,
    updatedAt: new Date()
  };

  res.json(pages[index]);
});

// DELETE supprimer une page (admin)
app.delete('/api/admin/pages/:id', authenticateToken, (req, res) => {
  const index = pages.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Page non trouvée' });
  }

  pages.splice(index, 1);
  res.status(204).send();
});

// ============ MENUS ROUTES ============

// GET menus par location
app.get('/api/menus/:location', (req, res) => {
  const menu = menus.find(m => m.location === req.params.location);

  if (!menu) {
    return res.json({ items: [] });
  }

  res.json(menu);
});

// GET tous les menus (admin)
app.get('/api/admin/menus', authenticateToken, (req, res) => {
  res.json(menus);
});

// PUT mettre à jour un menu (admin)
app.put('/api/admin/menus/:id', authenticateToken, (req, res) => {
  const index = menus.findIndex(m => m.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Menu non trouvé' });
  }

  menus[index] = {
    ...menus[index],
    ...req.body,
    id: req.params.id
  };

  res.json(menus[index]);
});

// ============ EDITORIAL ROUTES ============

// GET editorial content
app.get('/api/editorial/:key', (req, res) => {
  const content = editorials[req.params.key];

  if (!content) {
    return res.status(404).json({ error: 'Contenu non trouvé' });
  }

  res.json(content);
});

// GET all editorial content (admin)
app.get('/api/admin/editorial', authenticateToken, (req, res) => {
  res.json(editorials);
});

// PUT update editorial content (admin)
app.put('/api/admin/editorial/:key', authenticateToken, (req, res) => {
  editorials[req.params.key] = {
    ...req.body,
    updatedAt: new Date()
  };

  res.json(editorials[req.params.key]);
});

app.listen(PORT, () => {
  console.log(`🚗 Server running on http://localhost:${PORT}`);
  console.log(`👤 Admin credentials: username: admin, password: admin123`);
});
