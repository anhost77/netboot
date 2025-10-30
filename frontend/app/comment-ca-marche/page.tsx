'use client';

import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import { Trophy, Target, TrendingUp, Cloud, Award, Zap, CheckCircle } from 'lucide-react';

export default function CommentCaMarchePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingHeader />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Comment Fonctionnent Nos Pronostics ?
            </h1>
            <p className="text-xl text-primary-100">
              Découvrez la méthode scientifique derrière nos sélections quotidiennes
            </p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Une Approche Scientifique des Paris Hippiques
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Chez BetTracker Pro, nous ne laissons rien au hasard. Nos pronostics sont le résultat d'une <strong>analyse approfondie</strong> de milliers de données historiques, combinée à l'intelligence artificielle de pointe.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Chaque jour, notre système analyse <strong>toutes les courses</strong> disponibles et ne vous présente que les <strong>3 meilleures opportunités</strong>, celles qui offrent le meilleur rapport qualité/risque.
            </p>
          </div>

          {/* Les 5 Critères */}
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Les 5 Critères de Sélection
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Critère 1 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Performance Récente</h3>
                  <p className="text-sm text-blue-600 font-semibold">Poids : 30%</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Nous analysons la <strong>"musique"</strong> du cheval (ses derniers résultats) pour identifier sa forme actuelle. Un cheval régulier dans les 3 premières places a plus de chances de performer.
              </p>
              <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Exemple :</strong> Un cheval avec "1-2-3-1" dans ses 4 dernières courses obtient un excellent score de performance.
                </p>
              </div>
            </div>

            {/* Critère 2 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Jockey / Driver</h3>
                  <p className="text-sm text-green-600 font-semibold">Poids : 20%</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Le talent du jockey fait la différence. Nous analysons ses <strong>statistiques sur 90 jours</strong> : taux de victoire, régularité, et affinité avec le cheval.
              </p>
              <div className="mt-4 bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Exemple :</strong> Un jockey avec 25% de victoires et 60% de places dans le Top 3 obtient un score élevé.
                </p>
              </div>
            </div>

            {/* Critère 3 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Cloud className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Conditions de Course</h3>
                  <p className="text-sm text-purple-600 font-semibold">Poids : 20%</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Distance, état de la piste, et <strong>météo en temps réel</strong>. Certains chevaux excellent sur terrain souple, d'autres préfèrent le sec. Nous croisons ces données avec l'historique.
              </p>
              <div className="mt-4 bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Exemple :</strong> Un cheval ayant gagné 3 fois sur 2400m sous la pluie obtient un bonus si ces conditions sont prévues.
                </p>
              </div>
            </div>

            {/* Critère 4 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Rapport Cote / Valeur</h3>
                  <p className="text-sm text-yellow-600 font-semibold">Poids : 15%</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Une bonne cote ne suffit pas. Nous cherchons les <strong>chevaux sous-cotés</strong> : ceux dont la cote est supérieure à leur probabilité réelle de victoire.
              </p>
              <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Exemple :</strong> Un cheval coté à 8/1 avec un score de performance de 75/100 représente une excellente valeur.
                </p>
              </div>
            </div>

            {/* Critère 5 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Entraîneur & Écurie</h3>
                  <p className="text-sm text-red-600 font-semibold">Poids : 15%</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                L'entraîneur joue un rôle clé dans la préparation. Nous analysons son <strong>taux de réussite</strong>, sa spécialité (trot, galop, obstacles) et la qualité de son écurie.
              </p>
              <div className="mt-4 bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Exemple :</strong> Un entraîneur avec 20% de victoires et une écurie reconnue apporte un bonus significatif au cheval.
                </p>
              </div>
            </div>
          </div>

          {/* Le Score Final */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-xl shadow-2xl p-8 mb-12">
            <h2 className="text-3xl font-bold mb-6 text-center">Le Score Final</h2>
            <p className="text-lg text-primary-100 mb-6 text-center">
              Chaque cheval reçoit un score sur 100 en combinant ces 5 critères
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-center mb-4">
                <div className="text-5xl font-bold mb-2">60/100</div>
                <p className="text-primary-100">Score Minimum pour Publication</p>
              </div>
              <p className="text-sm text-primary-100 text-center">
                Seules les courses dépassant ce seuil sont publiées. C'est notre garantie qualité.
              </p>
            </div>
          </div>

          {/* Notre Stratégie */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Zap className="w-8 h-8 text-yellow-500" />
              Notre Stratégie : Qualité > Quantité
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Maximum 3 Pronostics par Jour</h3>
                  <p className="text-gray-700">
                    Contrairement aux sites qui publient 20+ pronostics, nous sélectionnons uniquement le <strong>TOP 3</strong> de la journée. Moins de courses, mais un taux de réussite supérieur.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Quinté+ Toujours Inclus</h3>
                  <p className="text-gray-700">
                    Le Quinté+ du jour est systématiquement analysé et publié (si son score dépasse 50/100), car c'est la course la plus suivie et la plus liquide.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Courses à Gros Enjeux</h3>
                  <p className="text-gray-700">
                    Nous privilégions les courses avec une <strong>allocation ≥ 50 000€</strong>, gage de qualité des partants et de fiabilité des données.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cheval du Jour & Outsider */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-7 h-7" />
                Cheval du Jour
              </h3>
              <p className="text-yellow-50 leading-relaxed">
                Parmi <strong>toutes les courses analysées</strong>, nous identifions le cheval avec le <strong>score le plus élevé</strong>. C'est notre coup de cœur absolu, celui qui cumule tous les critères de réussite.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Zap className="w-7 h-7" />
                Outsider du Jour
              </h3>
              <p className="text-purple-50 leading-relaxed">
                Le meilleur <strong>rapport qualité/cote</strong> du jour. Un cheval avec un bon score mais une cote attractive, parfait pour les parieurs cherchant un <strong>gros gain potentiel</strong>.
              </p>
            </div>
          </div>

          {/* Transparence */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🔍 Transparence Totale
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Pour chaque pronostic, vous voyez :
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                Le <strong>score détaillé</strong> de chaque cheval (performance, jockey, conditions, etc.)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                L'<strong>analyse complète</strong> générée par notre IA
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                Les <strong>conditions météo</strong> prévues pour la course
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                Nos <strong>recommandations de paris</strong> (Simple, Couplé, Trio, Quinté+)
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à Découvrir Nos Pronostics ?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Consultez gratuitement nos sélections quotidiennes et suivez vos résultats avec BetTracker Pro
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/pronostics"
              className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-primary-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all"
            >
              Voir les Pronostics du Jour
            </a>
            <a
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all"
            >
              Créer un Compte Gratuit
            </a>
          </div>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
