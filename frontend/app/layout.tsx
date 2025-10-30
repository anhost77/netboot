import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import { Toaster } from 'react-hot-toast';
import CookieConsent from '@/components/CookieConsent';

export const metadata: Metadata = {
  title: {
    default: 'BetTracker Pro - Gestion et Analyse de Paris Hippiques PMU',
    template: '%s | BetTracker Pro',
  },
  description: 'Plateforme complète de gestion de paris hippiques PMU. Suivez vos paris, analysez vos performances, accédez aux pronostics et au calendrier des courses. Mode simulation, statistiques avancées et intégration PMU temps réel.',
  keywords: ['pmu', 'paris hippiques', 'courses chevaux', 'turf', 'pronostics', 'quinté', 'tiercé', 'quarté', 'suivi paris', 'statistiques pmu', 'hippodromes', 'jockeys', 'calendrier courses'],
  authors: [{ name: 'BetTracker Pro' }],
  creator: 'BetTracker Pro',
  publisher: 'BetTracker Pro',
  metadataBase: new URL('https://bettracker.io'),
  alternates: {
    canonical: 'https://bettracker.io',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://bettracker.io',
    siteName: 'BetTracker Pro',
    title: 'BetTracker Pro - Gestion et Analyse de Paris Hippiques PMU',
    description: 'Suivez, analysez et optimisez vos paris hippiques PMU avec des statistiques avancées, mode simulation et intégration temps réel',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'BetTracker Pro',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BetTracker Pro - Gestion de Paris Hippiques',
    description: 'Plateforme complète pour suivre et analyser vos paris hippiques PMU',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">
        <AuthProvider>
          <SettingsProvider>
            <AuthModalProvider>
              {children}
              <Toaster position="top-right" />
              <CookieConsent />
            </AuthModalProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
