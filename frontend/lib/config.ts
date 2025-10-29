/**
 * Configuration centralisée de l'application
 * Utilise les variables d'environnement pour permettre le déploiement en production
 */

// URL de base de l'API (sans le préfixe /api)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// URL complète de l'API (avec le préfixe /api)
export const API_URL = `${API_BASE_URL}/api`;

// URL du frontend
export const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

// Autres configurations
export const config = {
  api: {
    baseUrl: API_BASE_URL,
    url: API_URL,
    timeout: 30000,
  },
  app: {
    name: 'BetTracker Pro',
    url: FRONTEND_URL,
  },
} as const;
