import { cache } from 'react';
import { API_URL } from '@/lib/config';

export interface ServerPlatformSettings {
  siteName: string;
  siteDescription: string;
  siteTagline: string;
  footerText: string;
  supportEmail: string;
  contactEmail: string;
}

// Cache la requête pour éviter les appels multiples
export const getServerSettings = cache(async (): Promise<ServerPlatformSettings> => {
  try {
    const response = await fetch(`${API_URL}/settings/public`, {
      next: { revalidate: 60 }, // Cache pendant 60 secondes
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to load server settings:', error);
    // Valeurs par défaut
    return {
      siteName: 'BetTracker',
      siteDescription: 'Gérez vos paris hippiques avec intelligence. Statistiques avancées, intégration IA et outils professionnels.',
      siteTagline: 'Plateforme de gestion de paris hippiques',
      footerText: 'Fait avec ❤️ pour les passionnés de turf',
      supportEmail: 'support@bettracker.fr',
      contactEmail: 'contact@bettracker.fr',
    };
  }
});
