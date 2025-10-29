'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { type PlatformSettings } from '@/lib/api/admin-settings';
import { API_URL } from '@/lib/config';

interface SettingsContextType {
  settings: PlatformSettings | null;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);

  const loadSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/settings/public`, {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      
      const data = await response.json();
      setSettings(data as any);
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Set default values if API fails
      setSettings({
        siteName: 'BetTracker',
        siteDescription: 'Gérez vos paris hippiques avec intelligence. Statistiques avancées, intégration IA et outils professionnels.',
        siteTagline: 'Plateforme de gestion de paris hippiques',
        footerText: 'Fait avec ❤️ pour les passionnés de turf',
        maintenanceMode: false,
        registrationEnabled: true,
        emailVerificationRequired: false,
        maxBetsPerDay: 100,
        maxBetsPerMonth: 3000,
        minBetAmount: 1,
        maxBetAmount: 10000,
        supportEmail: 'support@bettracker.fr',
        contactEmail: 'contact@bettracker.fr',
        termsUrl: '/terms',
        privacyUrl: '/privacy',
        faqUrl: '/faq',
        socialLinks: {},
        features: {
          pmuIntegration: true,
          tipstersEnabled: true,
          budgetTracking: true,
          notifications: true,
          twoFactorAuth: true,
        },
        limits: {
          freePlanBetsPerMonth: 50,
          basicPlanBetsPerMonth: 500,
          premiumPlanBetsPerMonth: 0,
        },
      });
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings: loadSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
