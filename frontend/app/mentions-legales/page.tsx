'use client';

import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import { Scale } from 'lucide-react';

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingHeader />

      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <Scale className="w-12 h-12" />
              <h1 className="text-4xl md:text-5xl font-bold">Mentions Légales</h1>
            </div>
            <p className="text-xl text-primary-100">
              Informations légales et éditoriales
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="prose prose-lg max-w-none">
            <h2>1. Éditeur du site</h2>
            <p>
              Le site BetTracker Pro est édité par :<br />
              <strong>BetTracker SAS</strong><br />
              Capital social : 10 000 €<br />
              RCS Paris : XXX XXX XXX<br />
              Siège social : 123 Avenue des Champs-Élysées, 75008 Paris, France<br />
              Email : contact@bettracker.pro<br />
              Téléphone : +33 1 23 45 67 89
            </p>

            <h2>2. Directeur de publication</h2>
            <p>
              Le directeur de la publication est : [Nom du directeur]<br />
              Email : direction@bettracker.pro
            </p>

            <h2>3. Hébergement</h2>
            <p>
              Le site est hébergé par :<br />
              <strong>Vercel Inc.</strong><br />
              340 S Lemon Ave #4133<br />
              Walnut, CA 91789, USA<br />
              Site web : https://vercel.com
            </p>

            <h2>4. Nature du service</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
              <p className="font-semibold text-yellow-900 mb-2">⚠️ IMPORTANT</p>
              <p className="text-yellow-800">
                <strong>BetTracker Pro est une plateforme de suivi et d'analyse de paris hippiques.</strong>
              </p>
              <ul className="mt-2 text-yellow-800">
                <li>Nous <strong>NE SOMMES PAS</strong> un opérateur de jeux d'argent</li>
                <li>Nous <strong>N'ENCAISSONS PAS</strong> de paris</li>
                <li>Nous <strong>NE PROPOSONS PAS</strong> de services de paris en ligne</li>
                <li>Nous fournissons uniquement des outils d'analyse et de suivi</li>
              </ul>
              <p className="mt-2 text-yellow-800">
                Les utilisateurs parient sur les plateformes agréées (PMU, Betclic, Unibet, etc.) 
                et utilisent BetTracker Pro pour enregistrer et analyser leurs performances.
              </p>
            </div>

            <h2>5. Propriété intellectuelle</h2>
            <p>
              L'ensemble du contenu de ce site (textes, images, vidéos, logos, graphismes, etc.) 
              est la propriété exclusive de BetTracker SAS, sauf mention contraire.
            </p>
            <p>
              Toute reproduction, représentation, modification, publication ou adaptation de tout 
              ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est 
              interdite sans l'autorisation écrite préalable de BetTracker SAS.
            </p>

            <h2>6. Données personnelles</h2>
            <p>
              Les informations recueillies sur ce site font l'objet d'un traitement informatique 
              destiné à la gestion de votre compte et à l'amélioration de nos services.
            </p>
            <p>
              Conformément au RGPD et à la loi Informatique et Libertés, vous disposez d'un droit 
              d'accès, de rectification, de suppression et d'opposition aux données vous concernant.
            </p>
            <p>
              Pour exercer ces droits, contactez-nous à : <a href="mailto:rgpd@bettracker.pro">rgpd@bettracker.pro</a>
            </p>
            <p>
              Pour plus d'informations, consultez notre <a href="/politique-confidentialite">Politique de confidentialité</a>.
            </p>

            <h2>7. Cookies</h2>
            <p>
              Ce site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic.
              Pour plus d'informations, consultez notre <a href="/politique-cookies">Politique de cookies</a>.
            </p>

            <h2>8. Responsabilité</h2>
            <p>
              BetTracker SAS s'efforce d'assurer l'exactitude et la mise à jour des informations 
              diffusées sur ce site. Toutefois, nous ne pouvons garantir l'exactitude, la précision 
              ou l'exhaustivité des informations mises à disposition.
            </p>
            <p>
              BetTracker SAS ne saurait être tenu responsable des dommages directs ou indirects 
              résultant de l'utilisation de ce site ou de l'impossibilité d'y accéder.
            </p>

            <h2>9. Jeu responsable</h2>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 my-6">
              <p className="font-semibold text-red-900 mb-2">⚠️ AVERTISSEMENT</p>
              <p className="text-red-800">
                <strong>Les jeux d'argent comportent des risques :</strong> endettement, isolement, dépendance.
              </p>
              <ul className="mt-2 text-red-800">
                <li><strong>Interdit aux mineurs (-18 ans)</strong></li>
                <li>Jouer comporte des risques. Jouez avec modération.</li>
                <li>Pour être aidé, appelez le <a href="tel:09-74-75-13-13" className="underline font-semibold">09 74 75 13 13</a> (appel non surtaxé)</li>
              </ul>
            </div>

            <h2>10. Droit applicable</h2>
            <p>
              Les présentes mentions légales sont régies par le droit français. 
              En cas de litige, les tribunaux français seront seuls compétents.
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
