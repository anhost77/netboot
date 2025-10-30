'use client';

import { useState, useEffect } from 'react';
import { X, Cookie, Shield, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà fait un choix
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Attendre 1 seconde avant d'afficher la bannière
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie_consent', 'all');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setShowBanner(false);
    // Activer Google Analytics ou autres cookies
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }
  };

  const acceptEssential = () => {
    localStorage.setItem('cookie_consent', 'essential');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setShowBanner(false);
  };

  const rejectAll = () => {
    localStorage.setItem('cookie_consent', 'rejected');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowDetails(false)} />

      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 md:bottom-4 md:left-4 md:right-auto md:max-w-2xl bg-white rounded-t-2xl md:rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Cookie className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Gestion des cookies</h2>
                <p className="text-sm text-gray-600">Nous respectons votre vie privée</p>
              </div>
            </div>
            <button
              onClick={rejectAll}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Avertissements légaux */}
          <div className="space-y-3 mb-6">
            {/* Avertissement principal */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-900 mb-1">
                    ⚠️ BetTracker Pro n'est PAS un site de paris en ligne
                  </p>
                  <p className="text-yellow-800">
                    Nous sommes un outil de <strong>suivi et d'analyse</strong> de vos paris. 
                    Nous n'encaissons pas de paris et ne sommes pas un opérateur de jeux d'argent.
                  </p>
                </div>
              </div>
            </div>

            {/* Avertissement mineurs */}
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-red-900 mb-1">
                    🔞 Interdit aux mineurs (-18 ans)
                  </p>
                  <p className="text-red-800">
                    Les jeux d'argent comportent des risques : endettement, isolement, dépendance. 
                    Jouez avec modération. Pour être aidé, appelez le{' '}
                    <a href="tel:09-74-75-13-13" className="underline font-semibold">
                      09 74 75 13 13
                    </a>{' '}
                    (appel non surtaxé).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description cookies */}
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et 
              personnaliser le contenu. Certains cookies sont essentiels au fonctionnement du site.
            </p>

            {!showDetails ? (
              <button
                onClick={() => setShowDetails(true)}
                className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
              >
                En savoir plus sur les cookies →
              </button>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">🔒 Cookies essentiels (obligatoires)</h3>
                  <p className="text-sm text-gray-600">
                    Nécessaires au fonctionnement du site : authentification, sécurité, préférences de base.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">📊 Cookies analytiques (optionnels)</h3>
                  <p className="text-sm text-gray-600">
                    Nous aident à comprendre comment vous utilisez le site pour l'améliorer (Google Analytics anonymisé).
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">⚙️ Cookies fonctionnels (optionnels)</h3>
                  <p className="text-sm text-gray-600">
                    Mémorisent vos préférences (thème, langue) pour une meilleure expérience.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Liens légaux */}
          <div className="flex flex-wrap gap-4 text-sm mb-6">
            <Link href="/politique-cookies" className="text-primary-600 hover:underline">
              Politique de cookies
            </Link>
            <Link href="/politique-confidentialite" className="text-primary-600 hover:underline">
              Politique de confidentialité
            </Link>
            <Link href="/cgu" className="text-primary-600 hover:underline">
              CGU
            </Link>
            <Link href="/mentions-legales" className="text-primary-600 hover:underline">
              Mentions légales
            </Link>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={acceptAll}
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Tout accepter
            </button>
            <button
              onClick={acceptEssential}
              className="flex-1 bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Essentiels uniquement
            </button>
            <button
              onClick={rejectAll}
              className="sm:flex-initial bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Tout refuser
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Vous pouvez modifier vos préférences à tout moment dans les paramètres
          </p>
        </div>
      </div>
    </>
  );
}
