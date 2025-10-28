import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: {
    default: 'BetTracker',
    template: '%s - BetTracker',
  },
  description: 'Plateforme de gestion de paris hippiques',
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
            {children}
            <Toaster position="top-right" />
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
