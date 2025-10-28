'use client';

import { Trophy, BarChart3, Target, TrendingUp, Sparkles, Brain, LineChart, Award, Info, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PmuPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <Trophy className="h-12 w-12" />
          <div>
            <h1 className="text-4xl font-bold">PMU Intelligence</h1>
            <p className="text-primary-100 mt-2">Analyses statistiques et pronostics IA pour vos paris hippiques</p>
          </div>
        </div>
      </div>

      {/* Main Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pronostics IA */}
        <Link
          href="/dashboard/pmu/pronostics"
          className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg hover:shadow-2xl transition-all p-8 border-2 border-green-200 hover:border-green-400"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="bg-green-500 rounded-xl p-4 group-hover:scale-110 transition-transform">
              <Brain className="h-10 w-10 text-white" />
            </div>
            <ArrowRight className="h-6 w-6 text-green-600 group-hover:translate-x-2 transition-transform" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center space-x-2">
            <span>🤖 Pronostics IA</span>
          </h2>
          
          <p className="text-gray-700 mb-4 leading-relaxed">
            Obtenez des prédictions intelligentes basées sur l'analyse de milliers de courses historiques.
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Sparkles className="h-4 w-4 text-green-600" />
              <span>Podium prédit par l'IA avec scores de confiance</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Award className="h-4 w-4 text-green-600" />
              <span>Comparaison prédiction vs résultats réels</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <LineChart className="h-4 w-4 text-green-600" />
              <span>Statistiques cheval + jockey + hippodrome</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Trophy className="h-4 w-4 text-green-600" />
              <span>Historique complet de chaque participant</span>
            </div>
          </div>

          <div className="bg-green-100 rounded-lg p-3 border border-green-300">
            <p className="text-xs text-green-800 font-medium">
              💡 Idéal pour : Découvrir les favoris statistiques et prendre des décisions éclairées
            </p>
          </div>
        </Link>

        {/* Analyses Statistiques */}
        <Link
          href="/dashboard/pmu/analyses"
          className="group bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-lg hover:shadow-2xl transition-all p-8 border-2 border-purple-200 hover:border-purple-400"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="bg-purple-500 rounded-xl p-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-10 w-10 text-white" />
            </div>
            <ArrowRight className="h-6 w-6 text-purple-600 group-hover:translate-x-2 transition-transform" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center space-x-2">
            <span>📊 Analyses Statistiques</span>
          </h2>
          
          <p className="text-gray-700 mb-4 leading-relaxed">
            Explorez les données historiques pour identifier les meilleures combinaisons gagnantes.
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Trophy className="h-4 w-4 text-purple-600" />
              <span>Top chevaux par taux de victoire et podiums</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Target className="h-4 w-4 text-purple-600" />
              <span>Meilleurs jockeys et leurs statistiques</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Award className="h-4 w-4 text-purple-600" />
              <span>Combinaisons cheval-jockey les plus performantes</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <span>Stats croisées hippodrome + jockey + cheval</span>
            </div>
          </div>

          <div className="bg-purple-100 rounded-lg p-3 border border-purple-300">
            <p className="text-xs text-purple-800 font-medium">
              💡 Idéal pour : Analyser les tendances et trouver les duos gagnants
            </p>
          </div>
        </Link>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <Info className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Comment ça marche ?</h3>
          </div>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start space-x-2">
              <span className="font-bold mt-0.5">1.</span>
              <span><strong>Pronostics :</strong> L'IA analyse les stats historiques et génère un podium prédit</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-bold mt-0.5">2.</span>
              <span><strong>Analyses :</strong> Explorez les données pour comprendre qui performe le mieux</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-bold mt-0.5">3.</span>
              <span><strong>Décision :</strong> Combinez les deux pour faire vos choix de paris</span>
            </li>
          </ul>
        </div>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <Trophy className="h-6 w-6 text-amber-600" />
            <h3 className="text-lg font-semibold text-amber-900">⚠️ Avertissement</h3>
          </div>
          <p className="text-sm text-amber-800 leading-relaxed">
            Les pronostics et analyses sont basés sur des <strong>statistiques historiques</strong>. 
            Ils ne garantissent pas le résultat des courses et ne constituent pas des conseils en paris. 
            Les paris comportent des <strong>risques financiers</strong>. Ne pariez jamais plus que ce que vous pouvez perdre.
          </p>
        </div>
      </div>

      {/* Mentions légales obligatoires */}
      <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-900 mb-3">⚠️ Avertissement Légal - Jeux d'Argent</h3>
            <div className="space-y-2 text-sm text-red-800">
              <p className="font-semibold">
                Jouer comporte des risques : endettement, isolement, dépendance. Pour être aidé, appelez le 09-74-75-13-13 (appel non surtaxé).
              </p>
              <p>
                <strong>Les jeux d'argent et de hasard sont interdits aux mineurs.</strong> La participation à ces jeux peut entraîner une dépendance et des pertes financières importantes.
              </p>
              <p>
                Les pronostics présentés sur cette plateforme sont générés automatiquement à partir de données statistiques et ne constituent en aucun cas des conseils en investissement ou en paris. 
                Ils sont fournis à titre informatif uniquement.
              </p>
              <p className="font-semibold">
                Ne jouez pas plus que ce que vous pouvez vous permettre de perdre. Fixez-vous des limites et respectez-les.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
