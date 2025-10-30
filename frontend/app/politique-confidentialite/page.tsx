'use client';

import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import { Shield } from 'lucide-react';

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingHeader />

      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <Shield className="w-12 h-12" />
              <h1 className="text-4xl md:text-5xl font-bold">Politique de Confidentialité</h1>
            </div>
            <p className="text-xl text-primary-100">
              Protection de vos données personnelles (RGPD)
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="prose prose-lg max-w-none">
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
              <p className="font-semibold text-blue-900">
                BetTracker Pro s'engage à protéger votre vie privée et vos données personnelles 
                conformément au Règlement Général sur la Protection des Données (RGPD).
              </p>
            </div>

            <h2>1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données est :<br />
              <strong>BetTracker SAS</strong><br />
              123 Avenue des Champs-Élysées, 75008 Paris<br />
              Email : rgpd@bettracker.pro
            </p>

            <h2>2. Données collectées</h2>
            <p>Nous collectons les données suivantes :</p>
            
            <h3>2.1 Données d'inscription</h3>
            <ul>
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Mot de passe (chiffré)</li>
              <li>Date de création du compte</li>
            </ul>

            <h3>2.2 Données d'utilisation</h3>
            <ul>
              <li>Historique des paris enregistrés</li>
              <li>Statistiques de performance</li>
              <li>Préférences utilisateur</li>
              <li>Logs de connexion</li>
            </ul>

            <h3>2.3 Données techniques</h3>
            <ul>
              <li>Adresse IP</li>
              <li>Type de navigateur</li>
              <li>Système d'exploitation</li>
              <li>Cookies (voir Politique de cookies)</li>
            </ul>

            <h2>3. Finalités du traitement</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul>
              <li><strong>Gestion de votre compte</strong> : création, authentification, support</li>
              <li><strong>Fourniture du service</strong> : suivi de vos paris, statistiques, analyses</li>
              <li><strong>Amélioration du service</strong> : analyse d'usage, développement de nouvelles fonctionnalités</li>
              <li><strong>Communication</strong> : emails transactionnels, notifications importantes</li>
              <li><strong>Sécurité</strong> : prévention de la fraude, protection du compte</li>
            </ul>

            <h2>4. Base légale du traitement</h2>
            <p>Le traitement de vos données repose sur :</p>
            <ul>
              <li><strong>Votre consentement</strong> : pour les cookies non essentiels, newsletters</li>
              <li><strong>L'exécution du contrat</strong> : pour la fourniture du service</li>
              <li><strong>L'intérêt légitime</strong> : pour la sécurité et l'amélioration du service</li>
              <li><strong>Obligations légales</strong> : conservation des données pour conformité fiscale</li>
            </ul>

            <h2>5. Durée de conservation</h2>
            <ul>
              <li><strong>Données de compte actif</strong> : pendant toute la durée d'utilisation du service</li>
              <li><strong>Données de compte inactif</strong> : 3 ans après la dernière connexion</li>
              <li><strong>Données de facturation</strong> : 10 ans (obligation légale)</li>
              <li><strong>Logs de connexion</strong> : 12 mois</li>
              <li><strong>Cookies</strong> : 13 mois maximum</li>
            </ul>

            <h2>6. Destinataires des données</h2>
            <p>Vos données peuvent être transmises à :</p>
            <ul>
              <li><strong>Personnel autorisé</strong> : équipe technique et support</li>
              <li><strong>Prestataires techniques</strong> : hébergement (Vercel), base de données, emails</li>
              <li><strong>Processeurs de paiement</strong> : Stripe (si abonnement payant)</li>
              <li><strong>Outils d'analyse</strong> : Google Analytics (anonymisé)</li>
            </ul>
            <p>
              Tous nos prestataires sont conformes au RGPD et situés dans l'UE ou disposent de 
              garanties appropriées (clauses contractuelles types).
            </p>

            <h2>7. Transferts hors UE</h2>
            <p>
              Certaines données peuvent être transférées hors de l'Union Européenne (hébergement Vercel aux USA). 
              Ces transferts sont encadrés par des clauses contractuelles types approuvées par la Commission Européenne.
            </p>

            <h2>8. Vos droits</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            
            <h3>8.1 Droit d'accès</h3>
            <p>Vous pouvez demander une copie de toutes vos données personnelles.</p>

            <h3>8.2 Droit de rectification</h3>
            <p>Vous pouvez corriger vos données inexactes ou incomplètes.</p>

            <h3>8.3 Droit à l'effacement ("droit à l'oubli")</h3>
            <p>Vous pouvez demander la suppression de vos données dans certains cas.</p>

            <h3>8.4 Droit à la limitation du traitement</h3>
            <p>Vous pouvez demander le gel temporaire de vos données.</p>

            <h3>8.5 Droit à la portabilité</h3>
            <p>Vous pouvez récupérer vos données dans un format structuré et lisible.</p>

            <h3>8.6 Droit d'opposition</h3>
            <p>Vous pouvez vous opposer au traitement de vos données pour motif légitime.</p>

            <h3>8.7 Droit de retirer votre consentement</h3>
            <p>Vous pouvez retirer votre consentement à tout moment (cookies, newsletter).</p>

            <div className="bg-green-50 border-l-4 border-green-400 p-4 my-6">
              <p className="font-semibold text-green-900 mb-2">💡 Comment exercer vos droits ?</p>
              <p className="text-green-800">
                Envoyez un email à <a href="mailto:rgpd@bettracker.pro" className="underline font-semibold">rgpd@bettracker.pro</a> 
                avec une copie de votre pièce d'identité.<br />
                Nous vous répondrons sous <strong>1 mois maximum</strong>.
              </p>
            </div>

            <h2>9. Sécurité des données</h2>
            <p>Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :</p>
            <ul>
              <li>Chiffrement des mots de passe (bcrypt)</li>
              <li>Connexions HTTPS (SSL/TLS)</li>
              <li>Sauvegardes régulières</li>
              <li>Accès restreint aux données</li>
              <li>Surveillance des accès</li>
              <li>Mises à jour de sécurité régulières</li>
            </ul>

            <h2>10. Mineurs</h2>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 my-6">
              <p className="font-semibold text-red-900">
                ⚠️ Notre service est <strong>INTERDIT AUX MINEURS</strong> (-18 ans).
              </p>
              <p className="text-red-800 mt-2">
                Nous ne collectons pas sciemment de données de personnes de moins de 18 ans. 
                Si vous êtes parent et découvrez que votre enfant nous a fourni des données, 
                contactez-nous immédiatement à rgpd@bettracker.pro pour suppression.
              </p>
            </div>

            <h2>11. Modifications de cette politique</h2>
            <p>
              Nous pouvons modifier cette politique de confidentialité. Les modifications importantes 
              vous seront notifiées par email ou via une bannière sur le site.
            </p>

            <h2>12. Réclamation</h2>
            <p>
              Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation 
              auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) :
            </p>
            <p>
              <strong>CNIL</strong><br />
              3 Place de Fontenoy - TSA 80715<br />
              75334 PARIS CEDEX 07<br />
              Téléphone : 01 53 73 22 22<br />
              Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>
            </p>

            <h2>13. Contact</h2>
            <p>
              Pour toute question concernant cette politique de confidentialité ou vos données personnelles :<br />
              Email : <a href="mailto:rgpd@bettracker.pro">rgpd@bettracker.pro</a><br />
              Courrier : BetTracker SAS - Service RGPD, 123 Avenue des Champs-Élysées, 75008 Paris
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
