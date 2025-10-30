'use client';

import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import { FileText } from 'lucide-react';

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingHeader />

      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <FileText className="w-12 h-12" />
              <h1 className="text-4xl md:text-5xl font-bold">Conditions Générales d'Utilisation</h1>
            </div>
            <p className="text-xl text-primary-100">
              Règles d'utilisation du service BetTracker Pro
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="prose prose-lg max-w-none">
            
            <h2>1. Objet</h2>
            <p>
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation du service 
              BetTracker Pro accessible à l'adresse bettracker.pro.
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
              <p className="font-semibold text-yellow-900 mb-2">⚠️ NATURE DU SERVICE</p>
              <p className="text-yellow-800">
                <strong>BetTracker Pro est un outil de suivi et d'analyse de paris hippiques.</strong>
              </p>
              <ul className="mt-2 text-yellow-800">
                <li>Nous <strong>NE SOMMES PAS</strong> un opérateur de paris en ligne</li>
                <li>Nous <strong>N'ENCAISSONS PAS</strong> de paris</li>
                <li>Nous <strong>NE PROPOSONS PAS</strong> de services de jeux d'argent</li>
                <li>Les utilisateurs parient sur des plateformes agréées (PMU, etc.)</li>
                <li>BetTracker Pro sert uniquement à enregistrer et analyser vos paris</li>
              </ul>
            </div>

            <h2>2. Acceptation des CGU</h2>
            <p>
              L'utilisation du service implique l'acceptation pleine et entière des présentes CGU. 
              Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le service.
            </p>

            <h2>3. Conditions d'accès</h2>
            
            <h3>3.1 Âge minimum</h3>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 my-6">
              <p className="font-semibold text-red-900">
                ⚠️ Le service est <strong>STRICTEMENT INTERDIT AUX MINEURS</strong> (-18 ans).
              </p>
              <p className="text-red-800 mt-2">
                En créant un compte, vous certifiez avoir au moins 18 ans révolus.
                Toute fausse déclaration entraînera la fermeture immédiate du compte.
              </p>
            </div>

            <h3>3.2 Inscription</h3>
            <p>Pour utiliser le service, vous devez :</p>
            <ul>
              <li>Créer un compte avec des informations exactes et à jour</li>
              <li>Choisir un mot de passe sécurisé</li>
              <li>Ne pas partager vos identifiants</li>
              <li>Nous informer immédiatement en cas d'utilisation non autorisée</li>
            </ul>

            <h2>4. Utilisation du service</h2>
            
            <h3>4.1 Licence d'utilisation</h3>
            <p>
              Nous vous accordons une licence personnelle, non exclusive, non transférable et révocable 
              pour utiliser le service conformément aux présentes CGU.
            </p>

            <h3>4.2 Usages interdits</h3>
            <p>Il est strictement interdit de :</p>
            <ul>
              <li>Utiliser le service à des fins illégales</li>
              <li>Tenter de contourner les mesures de sécurité</li>
              <li>Extraire ou copier le contenu du site (scraping)</li>
              <li>Créer plusieurs comptes pour une même personne</li>
              <li>Vendre ou transférer votre compte</li>
              <li>Utiliser des robots ou scripts automatisés</li>
              <li>Perturber le fonctionnement du service</li>
            </ul>

            <h2>5. Contenu utilisateur</h2>
            <p>
              Vous conservez la propriété des données que vous saisissez (paris, notes, etc.). 
              Vous nous accordez une licence pour stocker et traiter ces données afin de fournir le service.
            </p>
            <p>
              Vous êtes responsable de l'exactitude des informations que vous saisissez.
            </p>

            <h2>6. Propriété intellectuelle</h2>
            <p>
              Tous les éléments du site (code, design, logos, textes, etc.) sont protégés par le droit d'auteur 
              et appartiennent à BetTracker SAS.
            </p>
            <p>
              Toute reproduction, même partielle, est interdite sans autorisation écrite préalable.
            </p>

            <h2>7. Tarifs et paiement</h2>
            <p>
              Le service propose une version gratuite et des abonnements payants. 
              Les tarifs sont indiqués sur la page Tarifs et peuvent être modifiés à tout moment.
            </p>
            <p>
              Les paiements sont traités par Stripe. Nous ne stockons pas vos données bancaires.
            </p>

            <h2>8. Résiliation</h2>
            
            <h3>8.1 Par l'utilisateur</h3>
            <p>
              Vous pouvez supprimer votre compte à tout moment depuis les paramètres. 
              La suppression est définitive et irréversible.
            </p>

            <h3>8.2 Par BetTracker</h3>
            <p>
              Nous pouvons suspendre ou supprimer votre compte en cas de :
            </p>
            <ul>
              <li>Violation des présentes CGU</li>
              <li>Activité frauduleuse ou illégale</li>
              <li>Non-paiement d'un abonnement</li>
              <li>Inactivité prolongée (plus de 3 ans)</li>
            </ul>

            <h2>9. Responsabilité et garanties</h2>
            
            <h3>9.1 Disponibilité du service</h3>
            <p>
              Nous nous efforçons d'assurer une disponibilité maximale du service, mais ne garantissons pas 
              un fonctionnement ininterrompu. Des maintenances peuvent être effectuées.
            </p>

            <h3>9.2 Exactitude des données</h3>
            <p>
              Les pronostics et analyses fournis sont à titre informatif uniquement. 
              Nous ne garantissons pas leur exactitude ni leur pertinence.
            </p>

            <h3>9.3 Limitation de responsabilité</h3>
            <p>
              BetTracker Pro ne saurait être tenu responsable :
            </p>
            <ul>
              <li>Des pertes financières liées à vos paris</li>
              <li>Des décisions prises sur la base de nos analyses</li>
              <li>Des interruptions de service</li>
              <li>De la perte de données due à un cas de force majeure</li>
            </ul>

            <div className="bg-red-50 border-l-4 border-red-400 p-4 my-6">
              <p className="font-semibold text-red-900 mb-2">⚠️ AVERTISSEMENT JEU RESPONSABLE</p>
              <p className="text-red-800">
                <strong>Les jeux d'argent comportent des risques :</strong> endettement, isolement, dépendance.
              </p>
              <ul className="mt-2 text-red-800">
                <li>Jouer comporte des risques. Jouez avec modération.</li>
                <li><strong>Interdit aux mineurs (-18 ans)</strong></li>
                <li>Pour être aidé, appelez le <a href="tel:09-74-75-13-13" className="underline font-semibold">09 74 75 13 13</a> (appel non surtaxé)</li>
              </ul>
            </div>

            <h2>10. Données personnelles</h2>
            <p>
              Le traitement de vos données personnelles est décrit dans notre 
              <a href="/politique-confidentialite"> Politique de confidentialité</a>.
            </p>

            <h2>11. Modifications des CGU</h2>
            <p>
              Nous pouvons modifier ces CGU à tout moment. Les modifications importantes vous seront 
              notifiées par email. L'utilisation continue du service après modification vaut acceptation.
            </p>

            <h2>12. Droit applicable et juridiction</h2>
            <p>
              Les présentes CGU sont régies par le droit français. 
              En cas de litige, les tribunaux de Paris seront seuls compétents.
            </p>

            <h2>13. Contact</h2>
            <p>
              Pour toute question concernant ces CGU :<br />
              Email : <a href="mailto:contact@bettracker.pro">contact@bettracker.pro</a><br />
              Adresse : BetTracker SAS, 123 Avenue des Champs-Élysées, 75008 Paris
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
