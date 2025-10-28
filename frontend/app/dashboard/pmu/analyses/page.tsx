'use client';

import React, { useState, useEffect } from 'react';
import { pmuStatsAPI } from '@/lib/api/pmu-stats';
import { Trophy, TrendingUp, TrendingDown, Award, Target, Users, BarChart3, PieChart, Activity, ChevronDown, Search, Info, HelpCircle, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { HorsePerformanceCard } from '@/components/bets/horse-performance-card';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function PmuAnalysesPage() {
  const [horseStats, setHorseStats] = useState<any[]>([]);
  const [jockeyStats, setJockeyStats] = useState<any>(null);
  const [combinations, setCombinations] = useState<any[]>([]);
  const [crossStats, setCrossStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCrossStats, setIsLoadingCrossStats] = useState(false);
  const [showCrossStats, setShowCrossStats] = useState(true);
  const [horsesLimit, setHorsesLimit] = useState(10);
  const [jockeysLimit, setJockeysLimit] = useState(10);
  const [combosLimit, setCombosLimit] = useState(10);
  const [crossStatsLimit, setCrossStatsLimit] = useState(10);
  const [selectedHorse, setSelectedHorse] = useState<string | null>(null);
  const [selectedJockey, setSelectedJockey] = useState<string | null>(null);
  const [selectedCombo, setSelectedCombo] = useState<string | null>(null);
  const [horseSearch, setHorseSearch] = useState('');
  const [jockeySearch, setJockeySearch] = useState('');

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      setIsLoading(true);
      const [horses, jockeys, combos, cross] = await Promise.all([
        pmuStatsAPI.getHorsePerformance().catch(() => []),
        pmuStatsAPI.getJockeyStats().catch(() => ({ total: 0, topJockeys: [] })),
        pmuStatsAPI.getHorseJockeyCombinations().catch(() => ({ total: 0, topCombinations: [] })),
        pmuStatsAPI.getCrossStats().catch(() => null),
      ]);
      
      setHorseStats(horses);
      setJockeyStats(jockeys);
      setCombinations(combos.topCombinations || []);
      setCrossStats(cross);
    } catch (error) {
      console.error('Error loading analyses:', error);
      toast.error('Erreur lors du chargement des analyses');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCrossStats = async () => {
    if (crossStats) {
      setShowCrossStats(!showCrossStats);
      return;
    }
    
    try {
      setIsLoadingCrossStats(true);
      setShowCrossStats(true);
      const data = await pmuStatsAPI.getCrossStats();
      setCrossStats(data);
    } catch (error) {
      console.error('Error loading cross stats:', error);
      toast.error('Erreur lors du chargement des statistiques croisées');
    } finally {
      setIsLoadingCrossStats(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Tous les chevaux filtrés et triés avec recherche
  const topHorses = horseStats
    .filter(h => h.totalRaces >= 5) // Au moins 5 courses
    .filter(h => horseSearch === '' || h.horseName.toLowerCase().includes(horseSearch.toLowerCase()))
    .sort((a, b) => b.winRate - a.winRate);

  // Tous les jockeys filtrés et triés avec recherche
  const topJockeys = jockeyStats?.topJockeys
    ?.filter((j: any) => j.totalRaces >= 5)
    ?.filter((j: any) => jockeySearch === '' || j.jockey.toLowerCase().includes(jockeySearch.toLowerCase()))
    ?.sort((a: any, b: any) => b.winRate - a.winRate) || [];

  // Toutes les combinaisons filtrées et triées
  const topCombinations = combinations
    .filter(c => c.totalRaces >= 3)
    .sort((a, b) => b.winRate - a.winRate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <BarChart3 className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Analyses PMU</h1>
          </div>
          <p className="text-gray-600">Analyses avancées et statistiques détaillées des performances</p>
        </div>
        <Link
          href="/dashboard/pmu"
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          ← Retour
        </Link>
      </div>

      {/* Avertissement important */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg p-6 shadow">
        <div className="flex items-start space-x-3">
          <Info className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-2">⚠️ Avertissement Important</h3>
            <div className="text-sm text-red-800 space-y-2">
              <p className="font-semibold">
                Ces analyses sont fournies à titre informatif uniquement et ne constituent en aucun cas des conseils en paris hippiques.
              </p>
              <p>
                <strong>Les paris comportent des risques financiers :</strong> Vous pouvez perdre tout ou partie de l'argent misé. 
                Ne pariez jamais plus que ce que vous pouvez vous permettre de perdre.
              </p>
              <p>
                <strong>Jeu responsable :</strong> Les statistiques passées ne garantissent pas les résultats futurs. 
                Si vous ou un proche êtes en difficulté avec le jeu, contactez Joueurs Info Service au 09 74 75 13 13 (appel non surtaxé).
              </p>
              <div className="mt-3 bg-red-100 rounded p-2 text-xs">
                <strong>🔞 Interdit aux mineurs :</strong> Les paris hippiques sont strictement réservés aux personnes majeures. 
                L'abus de jeu est dangereux pour la santé et peut entraîner une dépendance.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guide pour débutants */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-6 shadow">
        <div className="flex items-start space-x-3">
          <Lightbulb className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Guide pour débutants - Comment utiliser ces analyses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <p className="font-semibold mb-1">🐴 Taux de victoire</p>
                <p className="text-xs">Pourcentage de courses gagnées. Un cheval avec 20%+ est considéré comme excellent.</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <p className="font-semibold mb-1">🏆 Taux de podium</p>
                <p className="text-xs">Pourcentage de courses terminées dans les 3 premiers. 40%+ est très bon.</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <p className="font-semibold mb-1">📊 Position moyenne</p>
                <p className="text-xs">Plus le chiffre est bas, mieux c'est. Une position moyenne &lt;5 est excellente.</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <p className="font-semibold mb-1">🤝 Combinaisons</p>
                <p className="text-xs">Certains chevaux performent mieux avec certains jockeys. Cherchez les duos gagnants !</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-blue-700 bg-blue-100 rounded p-2">
              <strong>💰 Astuce :</strong> Combinez plusieurs critères ! Un cheval avec bon taux de victoire + bonne combinaison jockey + hippodrome favorable = meilleure chance de succès.
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <Trophy className="h-8 w-8 text-blue-600" />
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-900">{horseStats.length}</div>
              <div className="text-sm text-blue-700">Chevaux analysés</div>
            </div>
          </div>
          <div className="text-xs text-blue-600">
            Basé sur {horseStats.reduce((sum, h) => sum + h.totalRaces, 0)} courses
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6 border-2 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 text-green-600" />
            <div className="text-right">
              <div className="text-3xl font-bold text-green-900">{topJockeys.length}</div>
              <div className="text-sm text-green-700">Jockeys actifs</div>
            </div>
          </div>
          <div className="text-xs text-green-600">
            Top performers avec 5+ courses
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-6 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <Award className="h-8 w-8 text-purple-600" />
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-900">{combinations.length}</div>
              <div className="text-sm text-purple-700">Combinaisons</div>
            </div>
          </div>
          <div className="text-xs text-purple-600">
            Duos cheval-jockey analysés
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Horses Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-primary-600" />
            <span>Top 10 Chevaux - Taux de Victoire</span>
          </h3>
          {topHorses.length > 0 ? (
            <Bar
              data={{
                labels: topHorses.map(h => h.horseName?.substring(0, 15) || 'Inconnu'),
                datasets: [
                  {
                    label: 'Taux de victoire (%)',
                    data: topHorses.map(h => h.winRate),
                    backgroundColor: 'rgba(34, 197, 94, 0.7)',
                    borderColor: 'rgb(34, 197, 94)',
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.parsed.y ? context.parsed.y.toFixed(1) : '0.0'}% de victoires`,
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: (value) => `${value}%`,
                    },
                  },
                },
              }}
            />
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
          )}
        </div>

        {/* Top Jockeys Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary-600" />
            <span>Top 10 Jockeys - Taux de Victoire</span>
          </h3>
          {topJockeys.length > 0 ? (
            <Bar
              data={{
                labels: topJockeys.map((j: any) => j.jockey?.substring(0, 15) || 'Inconnu'),
                datasets: [
                  {
                    label: 'Taux de victoire (%)',
                    data: topJockeys.map((j: any) => j.winRate),
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.parsed.y ? context.parsed.y.toFixed(1) : '0.0'}% de victoires`,
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: (value) => `${value}%`,
                    },
                  },
                },
              }}
            />
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
          )}
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Horses Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span>Meilleurs Chevaux</span>
              </h3>
              <div className="group relative">
                <HelpCircle className="h-5 w-5 text-gray-400 hover:text-blue-600 cursor-help" />
                <div className="absolute right-0 top-6 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-lg">
                  <p className="font-semibold mb-1">📚 Comment lire ce tableau :</p>
                  <p className="mb-2">Les chevaux sont classés par taux de victoire. Cherchez ceux avec 20%+ de victoires et 40%+ de podiums.</p>
                  <p className="text-yellow-200">💡 Cliquez sur "Voir détails" pour l'historique complet !</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un cheval..."
                value={horseSearch}
                onChange={(e) => setHorseSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>
          
          {/* Vue desktop - Tableau */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cheval</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Courses</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Victoires</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Taux</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topHorses.slice(0, horsesLimit).map((horse, index) => (
                  <React.Fragment key={index}>
                    <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{horse.horseName}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">{horse.totalRaces}</td>
                    <td className="px-4 py-3 text-sm text-center text-green-600 font-semibold">{horse.wins}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
                        {horse.winRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <button
                        onClick={() => setSelectedHorse(selectedHorse === horse.horseName ? null : horse.horseName)}
                        className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-full font-medium transition-colors"
                      >
                        {selectedHorse === horse.horseName ? 'Masquer' : 'Voir détails'}
                      </button>
                    </td>
                  </tr>
                  {selectedHorse === horse.horseName && (
                    <tr>
                      <td colSpan={6} className="px-4 py-4 bg-gray-50">
                        <HorsePerformanceCard 
                          horseId={horse.horseName}
                          horseName={horse.horseName}
                        />
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Vue mobile - Cartes */}
          <div className="md:hidden space-y-3 p-4">
            {topHorses.slice(0, horsesLimit).map((horse, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{horse.horseName}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        {horse.winRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">Courses:</span>
                    <div className="font-semibold">{horse.totalRaces}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Victoires:</span>
                    <div className="font-semibold text-green-600">{horse.wins}</div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedHorse(selectedHorse === horse.horseName ? null : horse.horseName)}
                  className="w-full text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-2 rounded-lg font-medium transition-colors"
                >
                  {selectedHorse === horse.horseName ? 'Masquer' : 'Voir détails'}
                </button>
                {selectedHorse === horse.horseName && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <HorsePerformanceCard 
                      horseId={horse.horseName}
                      horseName={horse.horseName}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {topHorses.length > horsesLimit && (
            <div className="p-4 border-t border-gray-200 text-center">
              <button
                onClick={() => setHorsesLimit(horsesLimit + 10)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <ChevronDown className="h-4 w-4" />
                <span>Charger 10 de plus</span>
              </button>
            </div>
          )}
        </div>

        {/* Top Jockeys Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span>Meilleurs Jockeys</span>
              </h3>
              <div className="group relative">
                <HelpCircle className="h-5 w-5 text-gray-400 hover:text-blue-600 cursor-help" />
                <div className="absolute right-0 top-6 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-lg">
                  <p className="font-semibold mb-1">🏇 Importance du jockey :</p>
                  <p className="mb-2">Un bon jockey peut faire la différence ! Un taux de victoire de 15%+ est excellent.</p>
                  <p className="text-yellow-200">💡 Regardez aussi le taux de podium pour la régularité !</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un jockey..."
                value={jockeySearch}
                onChange={(e) => setJockeySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>
          
          {/* Vue desktop - Tableau */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jockey</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Courses</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Victoires</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Podiums</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Taux</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topJockeys.slice(0, jockeysLimit).map((jockey: any, index: number) => (
                  <React.Fragment key={index}>
                    <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{jockey.jockey}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">{jockey.totalRaces}</td>
                    <td className="px-4 py-3 text-sm text-center text-green-600 font-semibold">{jockey.wins}</td>
                    <td className="px-4 py-3 text-sm text-center text-blue-600 font-semibold">{jockey.podiums || 0}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                        {jockey.winRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <button
                        onClick={() => setSelectedJockey(selectedJockey === jockey.jockey ? null : jockey.jockey)}
                        className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-full font-medium transition-colors"
                      >
                        {selectedJockey === jockey.jockey ? 'Masquer' : 'Voir détails'}
                      </button>
                    </td>
                  </tr>
                  {selectedJockey === jockey.jockey && (
                    <tr>
                      <td colSpan={7} className="px-4 py-4 bg-gray-50">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="text-xs text-gray-600 mb-1">Total Courses</div>
                              <div className="text-2xl font-bold text-gray-900">{jockey.totalRaces}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-green-200">
                              <div className="text-xs text-gray-600 mb-1">Victoires</div>
                              <div className="text-2xl font-bold text-green-600">{jockey.wins}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-blue-200">
                              <div className="text-xs text-gray-600 mb-1">Podiums</div>
                              <div className="text-2xl font-bold text-blue-600">{jockey.podiums || 0}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-purple-200">
                              <div className="text-xs text-gray-600 mb-1">Taux Podium</div>
                              <div className="text-2xl font-bold text-purple-600">{jockey.podiumRate ? jockey.podiumRate.toFixed(1) : '0.0'}%</div>
                            </div>
                          </div>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                              <strong>📊 Analyse :</strong> {jockey.jockey} a participé à {jockey.totalRaces} courses avec un taux de victoire de {jockey.winRate.toFixed(1)}%. 
                              {jockey.winRate > 15 ? 'Excellent jockey avec un taux de victoire supérieur à la moyenne !' : 'Jockey régulier avec des performances stables.'}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Vue mobile - Cartes */}
          <div className="md:hidden space-y-3 p-4">
            {topJockeys.slice(0, jockeysLimit).map((jockey: any, index: number) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{jockey.jockey}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {jockey.winRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-gray-500 text-xs">Courses:</span>
                    <div className="font-semibold">{jockey.totalRaces}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Victoires:</span>
                    <div className="font-semibold text-green-600">{jockey.wins}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Podiums:</span>
                    <div className="font-semibold text-blue-600">{jockey.podiums || 0}</div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedJockey(selectedJockey === jockey.jockey ? null : jockey.jockey)}
                  className="w-full text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-2 rounded-lg font-medium transition-colors"
                >
                  {selectedJockey === jockey.jockey ? 'Masquer' : 'Voir détails'}
                </button>
                {selectedJockey === jockey.jockey && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="text-xs text-gray-600 mb-1">Total Courses</div>
                        <div className="text-xl font-bold text-gray-900">{jockey.totalRaces}</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="text-xs text-gray-600 mb-1">Victoires</div>
                        <div className="text-xl font-bold text-green-600">{jockey.wins}</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-xs text-gray-600 mb-1">Podiums</div>
                        <div className="text-xl font-bold text-blue-600">{jockey.podiums || 0}</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <div className="text-xs text-gray-600 mb-1">Taux Podium</div>
                        <div className="text-xl font-bold text-purple-600">{jockey.podiumRate ? jockey.podiumRate.toFixed(1) : '0.0'}%</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {topJockeys.length > jockeysLimit && (
            <div className="p-4 border-t border-gray-200 text-center">
              <button
                onClick={() => setJockeysLimit(jockeysLimit + 10)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <ChevronDown className="h-4 w-4" />
                <span>Charger 10 de plus</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Top Combinations */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
              <Award className="h-5 w-5 text-purple-500" />
              <span>Meilleures Combinaisons Cheval-Jockey</span>
            </h3>
            <div className="group relative">
              <HelpCircle className="h-5 w-5 text-gray-400 hover:text-blue-600 cursor-help" />
              <div className="absolute right-0 top-6 w-72 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-lg">
                <p className="font-semibold mb-1">🤝 La synergie gagnante :</p>
                <p className="mb-2">Certains duos cheval-jockey ont une alchimie spéciale ! Un taux de victoire de 20%+ ensemble est excellent.</p>
                <p className="text-yellow-200">💡 Privilégiez les duos avec au moins 5 courses ensemble pour des stats fiables !</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Vue desktop - Tableau */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cheval</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jockey</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Courses</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Victoires</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Podiums</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Taux Victoire</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Taux Podium</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topCombinations.slice(0, combosLimit).map((combo, index) => {
                const comboKey = `${combo.horseName}-${combo.jockey}`;
                return (
                <React.Fragment key={index}>
                  <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{combo.horseName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{combo.jockey}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">{combo.totalRaces || 0}</td>
                  <td className="px-4 py-3 text-sm text-center text-green-600 font-semibold">{combo.wins || 0}</td>
                  <td className="px-4 py-3 text-sm text-center text-blue-600 font-semibold">{combo.podiums || 0}</td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full font-semibold text-xs">
                      {combo.winRate ? combo.winRate.toFixed(1) : '0.0'}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold text-xs">
                      {combo.podiumRate ? combo.podiumRate.toFixed(1) : '0.0'}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <button
                      onClick={() => setSelectedCombo(selectedCombo === comboKey ? null : comboKey)}
                      className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1 rounded-full font-medium transition-colors"
                    >
                      {selectedCombo === comboKey ? 'Masquer' : 'Voir détails'}
                    </button>
                  </td>
                </tr>
                {selectedCombo === comboKey && (
                  <tr>
                    <td colSpan={9} className="px-4 py-4 bg-gray-50">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="text-xs text-gray-600 mb-1">Courses Ensemble</div>
                            <div className="text-2xl font-bold text-gray-900">{combo.totalRaces || 0}</div>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-green-200">
                            <div className="text-xs text-gray-600 mb-1">Victoires</div>
                            <div className="text-2xl font-bold text-green-600">{combo.wins || 0}</div>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <div className="text-xs text-gray-600 mb-1">Podiums</div>
                            <div className="text-2xl font-bold text-blue-600">{combo.podiums || 0}</div>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-purple-200">
                            <div className="text-xs text-gray-600 mb-1">Position Moyenne</div>
                            <div className="text-2xl font-bold text-purple-600">{combo.avgPosition ? combo.avgPosition.toFixed(1) : 'N/A'}</div>
                          </div>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <p className="text-sm text-purple-800">
                            <strong>🤝 Synergie :</strong> La combinaison {combo.horseName} + {combo.jockey} a couru ensemble {combo.totalRaces || 0} fois avec un taux de victoire de {combo.winRate ? combo.winRate.toFixed(1) : '0.0'}%. 
                            {(combo.winRate || 0) > 20 ? ' Cette combinaison est particulièrement performante !' : ' Une combinaison régulière à surveiller.'}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Vue mobile - Cartes */}
        <div className="md:hidden space-y-3 p-4">
          {topCombinations.slice(0, combosLimit).map((combo, index) => {
            const comboKey = `${combo.horseName}-${combo.jockey}`;
            return (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{combo.horseName}</div>
                    <div className="text-sm text-gray-600">🏇 {combo.jockey}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-xs text-gray-500">Courses</div>
                    <div className="font-semibold">{combo.totalRaces || 0}</div>
                  </div>
                  <div className="bg-green-50 rounded p-2">
                    <div className="text-xs text-gray-500">Victoires</div>
                    <div className="font-semibold text-green-600">{combo.wins || 0}</div>
                  </div>
                  <div className="bg-blue-50 rounded p-2">
                    <div className="text-xs text-gray-500">Podiums</div>
                    <div className="font-semibold text-blue-600">{combo.podiums || 0}</div>
                  </div>
                  <div className="bg-purple-50 rounded p-2">
                    <div className="text-xs text-gray-500">Taux Victoire</div>
                    <div className="font-semibold text-purple-600">{combo.winRate ? combo.winRate.toFixed(1) : '0.0'}%</div>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedCombo(selectedCombo === comboKey ? null : comboKey)}
                  className="w-full text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-2 rounded-lg font-medium transition-colors"
                >
                  {selectedCombo === comboKey ? 'Masquer' : 'Voir détails'}
                </button>
                
                {selectedCombo === comboKey && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="text-xs text-gray-600 mb-1">Courses Ensemble</div>
                        <div className="text-xl font-bold text-gray-900">{combo.totalRaces || 0}</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="text-xs text-gray-600 mb-1">Victoires</div>
                        <div className="text-xl font-bold text-green-600">{combo.wins || 0}</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-xs text-gray-600 mb-1">Podiums</div>
                        <div className="text-xl font-bold text-blue-600">{combo.podiums || 0}</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <div className="text-xs text-gray-600 mb-1">Taux Podium</div>
                        <div className="text-xl font-bold text-purple-600">{combo.podiumRate ? combo.podiumRate.toFixed(1) : '0.0'}%</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {topCombinations.length > combosLimit && (
          <div className="p-4 border-t border-gray-200 text-center">
            <button
              onClick={() => setCombosLimit(combosLimit + 10)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <ChevronDown className="h-4 w-4" />
              <span>Charger 10 de plus</span>
            </button>
          </div>
        )}
      </div>

      {/* Cross Stats Section */}
      <div className="bg-white rounded-lg shadow">
        <button
          onClick={loadCrossStats}
          className="w-full p-6 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center space-x-3 flex-1">
            <Target className="h-6 w-6 text-purple-600" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  🎯 Statistiques Croisées (Hippodrome + Jockey + Cheval)
                </h3>
                <div className="group relative">
                  <HelpCircle className="h-5 w-5 text-gray-400 hover:text-blue-600 cursor-help" />
                  <div className="absolute right-0 top-6 w-80 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-lg">
                    <p className="font-semibold mb-1">🎯 L'analyse ultime :</p>
                    <p className="mb-2">Ces combinaisons triple sont les plus précises ! Elles montrent comment un cheval performe avec un jockey spécifique sur un hippodrome spécifique.</p>
                    <p className="text-yellow-200">💡 Un cheval peut être excellent à Vincennes avec le jockey X, mais moyen ailleurs. C'est ici que vous trouvez ces pépites !</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Cliquez pour {showCrossStats ? 'masquer' : 'charger'} les combinaisons triple
              </p>
            </div>
          </div>
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${showCrossStats ? 'rotate-180' : ''}`} />
        </button>

        {showCrossStats && (
          <div className="border-t border-gray-200">
            {isLoadingCrossStats ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : crossStats ? (
              <div className="p-6 space-y-6">
                {/* Triple Combinations */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    <span>Meilleures Combinaisons Triple (Hippodrome + Jockey + Cheval)</span>
                  </h4>
                  
                  {/* Vue desktop - Tableau */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hippodrome</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jockey</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cheval</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Courses</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Victoires</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Podiums</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Taux Victoire</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Taux Podium</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {crossStats.tripleCombinations?.top?.slice(0, crossStatsLimit).map((combo: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                              }`}>
                                {index + 1}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{combo.hippodrome}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{combo.jockey}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{combo.horseName}</td>
                            <td className="px-4 py-3 text-sm text-center text-gray-600">{combo.totalRaces || 0}</td>
                            <td className="px-4 py-3 text-sm text-center text-green-600 font-semibold">{combo.wins || 0}</td>
                            <td className="px-4 py-3 text-sm text-center text-blue-600 font-semibold">{combo.podiums || 0}</td>
                            <td className="px-4 py-3 text-sm text-center">
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full font-semibold text-xs">
                                {combo.winRate ? combo.winRate.toFixed(1) : '0.0'}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-center">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold text-xs">
                                {combo.podiumRate ? combo.podiumRate.toFixed(1) : '0.0'}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Vue mobile - Cartes */}
                  <div className="md:hidden space-y-3">
                    {crossStats.tripleCombinations?.top?.slice(0, crossStatsLimit).map((combo: any, index: number) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{combo.horseName}</div>
                            <div className="text-xs text-gray-600 mt-0.5">
                              🏇 {combo.jockey}
                            </div>
                            <div className="text-xs text-gray-600">
                              📍 {combo.hippodrome}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div className="bg-gray-50 rounded p-2">
                            <div className="text-xs text-gray-500">Courses</div>
                            <div className="font-semibold">{combo.totalRaces || 0}</div>
                          </div>
                          <div className="bg-green-50 rounded p-2">
                            <div className="text-xs text-gray-500">Victoires</div>
                            <div className="font-semibold text-green-600">{combo.wins || 0}</div>
                          </div>
                          <div className="bg-blue-50 rounded p-2">
                            <div className="text-xs text-gray-500">Podiums</div>
                            <div className="font-semibold text-blue-600">{combo.podiums || 0}</div>
                          </div>
                          <div className="bg-purple-50 rounded p-2">
                            <div className="text-xs text-gray-500">Taux</div>
                            <div className="font-semibold text-purple-600">{combo.winRate ? combo.winRate.toFixed(1) : '0.0'}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {(crossStats.tripleCombinations?.top?.length || 0) > crossStatsLimit && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => setCrossStatsLimit(crossStatsLimit + 10)}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <ChevronDown className="h-4 w-4" />
                        <span>Charger 10 de plus</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-800">
                    <strong>💡 Astuce :</strong> Ces combinaisons triple montrent les performances d'un cheval spécifique 
                    avec un jockey spécifique sur un hippodrome spécifique. C'est l'analyse la plus précise pour identifier 
                    les configurations gagnantes !
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                Aucune donnée disponible
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>À propos des analyses</span>
        </h3>
        <div className="text-blue-700 space-y-2 text-sm">
          <p>
            <strong>Chevaux :</strong> Classés par taux de victoire (minimum 5 courses pour être inclus)
          </p>
          <p>
            <strong>Jockeys :</strong> Performances basées sur toutes les courses montées
          </p>
          <p>
            <strong>Combinaisons :</strong> Duos cheval-jockey ayant couru ensemble au moins 3 fois
          </p>
          <p className="mt-3 text-xs">
            Les données sont mises à jour quotidiennement avec les résultats des courses PMU.
          </p>
        </div>
      </div>
    </div>
  );
}
