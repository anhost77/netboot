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
// Utilisateurs normaux (clients)
let clientUsers = [
  {
    id: 'user-1',
    username: 'jean.dupont',
    email: 'jean.dupont@email.com',
    password: bcrypt.hashSync('password123', 10),
    firstName: 'Jean',
    lastName: 'Dupont',
    phone: '06 12 34 56 78',
    address: '15 Rue de la République, 75001 Paris',
    role: 'client',
    createdAt: new Date('2025-10-01'),
    lastLogin: new Date('2025-10-20T10:30:00'),
    connectionHistory: [
      { date: new Date('2025-10-20T10:30:00'), ip: '192.168.1.100' },
      { date: new Date('2025-10-19T14:20:00'), ip: '192.168.1.100' },
      { date: new Date('2025-10-15T09:15:00'), ip: '192.168.1.101' }
    ],
    transactionNotes: [
      { date: new Date('2025-10-15'), note: 'Utilisateur actif, a publié sa première annonce', author: 'admin' }
    ],
    status: 'active'
  },
  {
    id: 'user-2',
    username: 'marie.martin',
    email: 'marie.martin@email.com',
    password: bcrypt.hashSync('password123', 10),
    firstName: 'Marie',
    lastName: 'Martin',
    phone: '06 98 76 54 32',
    address: '42 Avenue des Champs-Élysées, 69002 Lyon',
    role: 'client',
    createdAt: new Date('2025-10-02'),
    lastLogin: new Date('2025-10-20T16:45:00'),
    connectionHistory: [
      { date: new Date('2025-10-20T16:45:00'), ip: '192.168.2.50' },
      { date: new Date('2025-10-18T11:00:00'), ip: '192.168.2.50' },
      { date: new Date('2025-10-14T19:30:00'), ip: '192.168.2.51' }
    ],
    transactionNotes: [
      { date: new Date('2025-10-14'), note: 'Utilisateur vérifié, a publié plusieurs annonces de qualité', author: 'admin' }
    ],
    status: 'active'
  }
];

let cars = [
  {
    id: '1',
    userId: 'user-1',
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
    status: 'published',
    createdAt: new Date('2025-10-15'),
    updatedAt: new Date('2025-10-15')
  },
  {
    id: '2',
    userId: 'user-2',
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
    status: 'published',
    createdAt: new Date('2025-10-14'),
    updatedAt: new Date('2025-10-14')
  },
  {
    id: '3',
    userId: 'user-1',
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
    status: 'published',
    createdAt: new Date('2025-10-13'),
    updatedAt: new Date('2025-10-13')
  },
  {
    id: '4',
    userId: 'user-2',
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
    status: 'published',
    createdAt: new Date('2025-10-12'),
    updatedAt: new Date('2025-10-12')
  },
  {
    id: '5',
    userId: 'user-1',
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
    status: 'published',
    createdAt: new Date('2025-10-11'),
    updatedAt: new Date('2025-10-11')
  },
  {
    id: '6',
    userId: 'user-2',
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
    status: 'published',
    createdAt: new Date('2025-10-10'),
    updatedAt: new Date('2025-10-10')
  }
];

// Messages entre utilisateurs
let messages = [
  {
    id: 'msg-1',
    carId: '1',
    senderId: 'user-2',
    receiverId: 'user-1',
    subject: 'Intéressé par votre Renault Clio',
    message: 'Bonjour, je suis intéressé par votre Clio. Est-elle toujours disponible ?',
    read: true,
    createdAt: new Date('2025-10-16T10:30:00'),
    conversationId: 'conv-1'
  },
  {
    id: 'msg-2',
    carId: '1',
    senderId: 'user-1',
    receiverId: 'user-2',
    subject: 'Re: Intéressé par votre Renault Clio',
    message: 'Bonjour, oui elle est toujours disponible. Vous pouvez venir la voir quand vous voulez.',
    read: true,
    createdAt: new Date('2025-10-16T11:00:00'),
    conversationId: 'conv-1'
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

// POST créer une nouvelle annonce (nécessite authentification)
app.post('/api/cars', authenticateToken, (req, res) => {
  const newCar = {
    id: uuidv4(),
    userId: req.user.id,
    ...req.body,
    status: 'published',
    createdAt: new Date(),
    updatedAt: new Date()
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

// ============ CLIENT USER ROUTES ============

// POST register new client user
app.post('/api/users/register', async (req, res) => {
  const { username, email, password, firstName, lastName, phone } = req.body;

  // Vérifier si l'utilisateur existe déjà
  const existingUser = clientUsers.find(u => u.email === email || u.username === username);
  if (existingUser) {
    return res.status(400).json({ error: 'Cet email ou nom d\'utilisateur existe déjà' });
  }

  // Créer le nouvel utilisateur
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: uuidv4(),
    username,
    email,
    password: hashedPassword,
    firstName,
    lastName,
    phone,
    address: '',
    role: 'client',
    createdAt: new Date(),
    lastLogin: new Date(),
    connectionHistory: [
      { date: new Date(), ip: req.ip || req.connection.remoteAddress || 'Unknown' }
    ],
    transactionNotes: [],
    status: 'active'
  };

  clientUsers.push(newUser);

  // Générer un token
  const token = jwt.sign(
    { id: newUser.id, username: newUser.username, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phone: newUser.phone,
      role: newUser.role
    }
  });
});

// POST login client user
app.post('/api/users/login', async (req, res) => {
  const { username, password } = req.body;

  const user = clientUsers.find(u => u.username === username || u.email === username);

  if (!user) {
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }

  // Enregistrer la connexion
  user.lastLogin = new Date();
  if (!user.connectionHistory) {
    user.connectionHistory = [];
  }
  user.connectionHistory.unshift({
    date: new Date(),
    ip: req.ip || req.connection.remoteAddress || 'Unknown'
  });
  // Garder seulement les 20 dernières connexions
  if (user.connectionHistory.length > 20) {
    user.connectionHistory = user.connectionHistory.slice(0, 20);
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
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role
    }
  });
});

// GET current user profile
app.get('/api/users/me', authenticateToken, (req, res) => {
  const user = clientUsers.find(u => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' });
  }

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt
  });
});

// PUT update user profile
app.put('/api/users/me', authenticateToken, async (req, res) => {
  const index = clientUsers.findIndex(u => u.id === req.user.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' });
  }

  const { firstName, lastName, phone, password } = req.body;

  if (password) {
    clientUsers[index].password = await bcrypt.hash(password, 10);
  }

  clientUsers[index] = {
    ...clientUsers[index],
    firstName: firstName || clientUsers[index].firstName,
    lastName: lastName || clientUsers[index].lastName,
    phone: phone || clientUsers[index].phone
  };

  res.json({
    id: clientUsers[index].id,
    username: clientUsers[index].username,
    email: clientUsers[index].email,
    firstName: clientUsers[index].firstName,
    lastName: clientUsers[index].lastName,
    phone: clientUsers[index].phone,
    role: clientUsers[index].role
  });
});

// GET my ads
app.get('/api/users/my-ads', authenticateToken, (req, res) => {
  const userCars = cars.filter(car => car.userId === req.user.id);
  res.json(userCars);
});

// PUT update my ad
app.put('/api/users/my-ads/:id', authenticateToken, (req, res) => {
  const index = cars.findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Annonce non trouvée' });
  }

  // Vérifier que c'est bien l'annonce de l'utilisateur
  if (cars[index].userId !== req.user.id) {
    return res.status(403).json({ error: 'Non autorisé' });
  }

  cars[index] = {
    ...cars[index],
    ...req.body,
    userId: cars[index].userId, // Ne pas permettre de changer le userId
    id: req.params.id,
    updatedAt: new Date()
  };

  res.json(cars[index]);
});

// DELETE my ad
app.delete('/api/users/my-ads/:id', authenticateToken, (req, res) => {
  const index = cars.findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Annonce non trouvée' });
  }

  // Vérifier que c'est bien l'annonce de l'utilisateur
  if (cars[index].userId !== req.user.id) {
    return res.status(403).json({ error: 'Non autorisé' });
  }

  cars.splice(index, 1);
  res.status(204).send();
});

// ============ MESSAGING ROUTES ============

// GET my conversations
app.get('/api/messages/conversations', authenticateToken, (req, res) => {
  // Grouper les messages par conversation
  const userMessages = messages.filter(m =>
    m.senderId === req.user.id || m.receiverId === req.user.id
  );

  // Grouper par conversationId
  const conversations = {};
  userMessages.forEach(msg => {
    if (!conversations[msg.conversationId]) {
      conversations[msg.conversationId] = [];
    }
    conversations[msg.conversationId].push(msg);
  });

  // Formater les conversations
  const result = Object.keys(conversations).map(convId => {
    const msgs = conversations[convId];
    const latestMsg = msgs[msgs.length - 1];
    const otherUserId = latestMsg.senderId === req.user.id ? latestMsg.receiverId : latestMsg.senderId;
    const otherUser = clientUsers.find(u => u.id === otherUserId);
    const car = cars.find(c => c.id === latestMsg.carId);
    const unreadCount = msgs.filter(m => m.receiverId === req.user.id && !m.read).length;

    return {
      conversationId: convId,
      carId: latestMsg.carId,
      carTitle: car ? car.title : 'Annonce supprimée',
      otherUser: otherUser ? {
        id: otherUser.id,
        firstName: otherUser.firstName,
        lastName: otherUser.lastName
      } : null,
      latestMessage: latestMsg.message,
      latestMessageDate: latestMsg.createdAt,
      unreadCount,
      messageCount: msgs.length
    };
  });

  res.json(result.sort((a, b) => new Date(b.latestMessageDate) - new Date(a.latestMessageDate)));
});

// GET conversation messages
app.get('/api/messages/conversation/:conversationId', authenticateToken, (req, res) => {
  const conversationMessages = messages.filter(m =>
    m.conversationId === req.params.conversationId &&
    (m.senderId === req.user.id || m.receiverId === req.user.id)
  );

  // Marquer les messages reçus comme lus
  conversationMessages.forEach(msg => {
    if (msg.receiverId === req.user.id && !msg.read) {
      const index = messages.findIndex(m => m.id === msg.id);
      if (index !== -1) {
        messages[index].read = true;
      }
    }
  });

  // Enrichir avec les infos utilisateur
  const enrichedMessages = conversationMessages.map(msg => {
    const sender = clientUsers.find(u => u.id === msg.senderId);
    return {
      ...msg,
      senderName: sender ? `${sender.firstName} ${sender.lastName}` : 'Utilisateur inconnu'
    };
  });

  res.json(enrichedMessages);
});

// POST send message
app.post('/api/messages', authenticateToken, (req, res) => {
  const { carId, receiverId, message, subject } = req.body;

  // Trouver ou créer une conversation
  const existingConv = messages.find(m =>
    m.carId === carId &&
    ((m.senderId === req.user.id && m.receiverId === receiverId) ||
     (m.senderId === receiverId && m.receiverId === req.user.id))
  );

  const conversationId = existingConv ? existingConv.conversationId : `conv-${uuidv4()}`;

  const newMessage = {
    id: uuidv4(),
    carId,
    senderId: req.user.id,
    receiverId,
    subject: subject || 'Nouveau message',
    message,
    read: false,
    createdAt: new Date(),
    conversationId
  };

  messages.push(newMessage);
  res.status(201).json(newMessage);
});

// GET unread messages count
app.get('/api/messages/unread-count', authenticateToken, (req, res) => {
  const unreadCount = messages.filter(m =>
    m.receiverId === req.user.id && !m.read
  ).length;

  res.json({ count: unreadCount });
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

// ============ ADMIN USER MANAGEMENT ============

// GET all users (admin)
app.get('/api/admin/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès interdit' });
  }

  const allUsers = clientUsers.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    phone: u.phone,
    role: u.role,
    createdAt: u.createdAt,
    adsCount: cars.filter(c => c.userId === u.id).length
  }));

  res.json(allUsers);
});

// GET single user details (admin)
app.get('/api/admin/users/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès interdit' });
  }

  const user = clientUsers.find(u => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' });
  }

  // Récupérer toutes les annonces de l'utilisateur
  const userAds = cars.filter(c => c.userId === user.id);

  // Récupérer les messages de l'utilisateur
  const userMessages = messages.filter(m => m.senderId === user.id || m.receiverId === user.id);

  const userDetails = {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    address: user.address,
    role: user.role,
    status: user.status || 'active',
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
    connectionHistory: user.connectionHistory || [],
    transactionNotes: user.transactionNotes || [],
    ads: userAds.map(ad => ({
      id: ad.id,
      title: ad.title,
      brand: ad.brand,
      model: ad.model,
      year: ad.year,
      price: ad.price,
      status: ad.status,
      createdAt: ad.createdAt,
      image: ad.image
    })),
    messagesCount: userMessages.length,
    adsCount: userAds.length
  };

  res.json(userDetails);
});

// POST add transaction note to user (admin)
app.post('/api/admin/users/:id/notes', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès interdit' });
  }

  const user = clientUsers.find(u => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' });
  }

  const { note } = req.body;

  if (!note) {
    return res.status(400).json({ error: 'La note est requise' });
  }

  if (!user.transactionNotes) {
    user.transactionNotes = [];
  }

  const newNote = {
    id: uuidv4(),
    date: new Date(),
    note,
    author: req.user.username || 'admin'
  };

  user.transactionNotes.unshift(newNote);

  res.json({ success: true, note: newNote });
});

// DELETE user (admin)
app.delete('/api/admin/users/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès interdit' });
  }

  const index = clientUsers.findIndex(u => u.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' });
  }

  // Supprimer aussi les annonces de l'utilisateur
  const userCars = cars.filter(c => c.userId === req.params.id);
  userCars.forEach(car => {
    const carIndex = cars.findIndex(c => c.id === car.id);
    if (carIndex !== -1) {
      cars.splice(carIndex, 1);
    }
  });

  clientUsers.splice(index, 1);
  res.status(204).send();
});

// ============ ADMIN ADS MANAGEMENT ============

// GET all ads (admin)
app.get('/api/admin/ads', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès interdit' });
  }

  // Enrichir avec les infos utilisateur
  const enrichedCars = cars.map(car => {
    const owner = clientUsers.find(u => u.id === car.userId);
    return {
      ...car,
      owner: owner ? {
        id: owner.id,
        firstName: owner.firstName,
        lastName: owner.lastName,
        email: owner.email
      } : null
    };
  });

  res.json(enrichedCars);
});

// PUT update any ad (admin)
app.put('/api/admin/ads/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès interdit' });
  }

  const index = cars.findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Annonce non trouvée' });
  }

  cars[index] = {
    ...cars[index],
    ...req.body,
    id: req.params.id,
    updatedAt: new Date()
  };

  res.json(cars[index]);
});

// DELETE any ad (admin)
app.delete('/api/admin/ads/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès interdit' });
  }

  const index = cars.findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Annonce non trouvée' });
  }

  cars.splice(index, 1);
  res.status(204).send();
});

// POST assign user to ad (admin)
app.post('/api/admin/ads/:id/assign-user', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès interdit' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId est requis' });
  }

  // Vérifier que l'utilisateur existe
  const user = clientUsers.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' });
  }

  // Trouver l'annonce
  const index = cars.findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Annonce non trouvée' });
  }

  // Attribuer l'utilisateur à l'annonce
  cars[index] = {
    ...cars[index],
    userId: userId,
    updatedAt: new Date()
  };

  res.json({
    success: true,
    ad: cars[index],
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    }
  });
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
