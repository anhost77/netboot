'use client';

import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import { Cookie } from 'lucide-react';

export default function PolitiqueCookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingHeader />

      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <Cookie className="w-12 h-12" />
              <h1 className="text-4xl md:text-5xl font-bold">Politique de Cookies</h1>
            </div>
            <p className="text-xl text-primary-100">
              Comment nous utilisons les cookies
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="prose prose-lg max-w-none">
            
            <h2>1. Qu'est-ce qu'un cookie ?</h2>
            <p>
              Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, smartphone, tablette) 
              lors de la visite d'un site web. Il permet de reconnaître votre navigateur et de mémoriser certaines informations.
            </p>

            <h2>2. Types de cookies utilisés</h2>

            <h3>2.1 Cookies essentiels (obligatoires)</h3>
            <p>Ces cookies sont nécessaires au fonctionnement du site. Ils ne peuvent pas être désactivés.</p>
            <table className="min-w-full">
              <thead>
                <tr>
                  <th>Cookie</th>
                  <th>Finalité</th>
                  <th>Durée</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>access_token</code></td>
                  <td>Authentification utilisateur</td>
                  <td>7 jours</td>
                </tr>
                <tr>
                  <td><code>refresh_token</code></td>
                  <td>Renouvellement de session</td>
                  <td>30 jours</td>
                </tr>
                <tr>
                  <td><code>cookie_consent</code></td>
                  <td>Mémorisation de votre choix cookies</td>
                  <td>13 mois</td>
                </tr>
              </tbody>
            </table>

            <h3>2.2 Cookies de performance (optionnels)</h3>
            <p>Ces cookies nous aident à comprendre comment les visiteurs utilisent le site.</p>
            <table className="min-w-full">
              <thead>
                <tr>
                  <th>Cookie</th>
                  <th>Finalité</th>
                  <th>Durée</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>_ga</code></td>
                  <td>Google Analytics - Analyse d'audience</td>
                  <td>13 mois</td>
                </tr>
                <tr>
                  <td><code>_gid</code></td>
                  <td>Google Analytics - Identification visiteur</td>
                  <td>24 heures</td>
                </tr>
              </tbody>
            </table>

            <h3>2.3 Cookies fonctionnels (optionnels)</h3>
            <p>Ces cookies améliorent votre expérience en mémorisant vos préférences.</p>
            <table className="min-w-full">
              <thead>
                <tr>
                  <th>Cookie</th>
                  <th>Finalité</th>
                  <th>Durée</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>theme</code></td>
                  <td>Préférence thème clair/sombre</td>
                  <td>12 mois</td>
                </tr>
                <tr>
                  <td><code>language</code></td>
                  <td>Préférence de langue</td>
                  <td>12 mois</td>
                </tr>
              </tbody>
            </table>

            <h2>3. Gestion de vos préférences</h2>
            <p>Vous pouvez à tout moment modifier vos préférences de cookies :</p>
            <ul>
              <li>Via la bannière de consentement lors de votre première visite</li>
              <li>Via les paramètres de votre navigateur</li>
              <li>En cliquant sur le lien "Gérer les cookies" en bas de page</li>
            </ul>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
              <p className="font-semibold text-blue-900 mb-2">💡 Comment refuser les cookies ?</p>
              <p className="text-blue-800">
                <strong>Dans votre navigateur :</strong>
              </p>
              <ul className="text-blue-800">
                <li><strong>Chrome</strong> : Paramètres → Confidentialité et sécurité → Cookies</li>
                <li><strong>Firefox</strong> : Options → Vie privée et sécurité → Cookies</li>
                <li><strong>Safari</strong> : Préférences → Confidentialité → Cookies</li>
                <li><strong>Edge</strong> : Paramètres → Cookies et autorisations de site</li>
              </ul>
            </div>

            <h2>4. Cookies tiers</h2>
            <p>Nous utilisons des services tiers qui peuvent déposer leurs propres cookies :</p>
            <ul>
              <li><strong>Google Analytics</strong> : analyse d'audience (anonymisé)</li>
              <li><strong>Stripe</strong> : traitement des paiements (si abonnement)</li>
            </ul>
            <p>
              Ces services ont leurs propres politiques de confidentialité. Nous vous recommandons de les consulter.
            </p>

            <h2>5. Durée de conservation</h2>
            <p>
              Les cookies sont conservés pour une durée maximale de <strong>13 mois</strong> conformément aux 
              recommandations de la CNIL. Votre consentement est redemandé après cette période.
            </p>

            <h2>6. Mise à jour de cette politique</h2>
            <p>
              Cette politique peut être modifiée. La date de dernière mise à jour est indiquée en bas de page.
            </p>

            <h2>7. Contact</h2>
            <p>
              Pour toute question sur notre utilisation des cookies :<br />
              Email : <a href="mailto:rgpd@bettracker.pro">rgpd@bettracker.pro</a>
            </p>

            <p className="text-sm text-gray-500 mt-8">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
