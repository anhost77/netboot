'use client';

import { useEffect, useState } from 'react';
import { pmuStatsAPI, type CrossStatsResponse } from '@/lib/api/pmu-stats';
import { MapPin, Users, Trophy, Target, Info } from 'lucide-react';

export function CrossStatsSection({ userBetsOnly = false }: { userBetsOnly?: boolean }) {
  const [crossStats, setCrossStats] = useState<CrossStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'hippo-jockey' | 'hippo-horse' | 'triple'>('triple');
  const [showCount, setShowCount] = useState(10); // Afficher seulement 10 par défaut

  useEffect(() => {
    // Charger les stats uniquement si le composant est visible
    // Ajouter un petit délai pour éviter de bloquer le thread principal
    const timer = setTimeout(() => {
      loadStats();
    }, 100);
    return () => clearTimeout(timer);
  }, [userBetsOnly]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = userBetsOnly 
        ? await pmuStatsAPI.getMyCrossStats() 
        : await pmuStatsAPI.getCrossStats();
      setCrossStats(data);
    } catch (error) {
      console.error('Failed to load cross stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!crossStats) return null;

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Guide explicatif */}
      <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-purple-900 mb-2">🎯 Statistiques Croisées - Le Secret des Pros</h3>
            <p className="text-sm text-purple-800 mb-3">
              Ces combinaisons révèlent des <strong>patterns cachés</strong> que les statistiques simples ne montrent pas. 
              Elles vous donnent un avantage décisif pour vos paris !
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white rounded p-3">
                <div className="font-semibold text-gray-900 mb-1 flex items-center space-x-1">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span>Hippodrome + Jockey</span>
                </div>
                <div className="text-xs text-gray-700">
                  Certains jockeys dominent sur des hippodromes spécifiques (connaissance du terrain, conditions).
                </div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="font-semibold text-gray-900 mb-1 flex items-center space-x-1">
                  <Trophy className="h-4 w-4 text-green-600" />
                  <span>Hippodrome + Cheval</span>
                </div>
                <div className="text-xs text-gray-700">
                  Certains chevaux excellent sur des terrains particuliers (distance, type de sol).
                </div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="font-semibold text-gray-900 mb-1 flex items-center space-x-1">
                  <Target className="h-4 w-4 text-red-600" />
                  <span>Triple Combo</span>
                </div>
                <div className="text-xs text-gray-700">
                  La combinaison ultime : Hippodrome + Jockey + Cheval = prédiction la plus précise !
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-1 px-6">
          <button
            onClick={() => setActiveTab('triple')}
            className={`px-6 py-4 font-medium text-sm transition-colors ${
              activeTab === 'triple'
                ? 'border-b-2 border-red-600 text-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>🎯 Triple Combo</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('hippo-jockey')}
            className={`px-6 py-4 font-medium text-sm transition-colors ${
              activeTab === 'hippo-jockey'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>📍 Hippodrome + Jockey</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('hippo-horse')}
            className={`px-6 py-4 font-medium text-sm transition-colors ${
              activeTab === 'hippo-horse'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span>🏇 Hippodrome + Cheval</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Triple Combinations */}
        {activeTab === 'triple' && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                🎯 Top 20 Triples Combinaisons Gagnantes
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Minimum 1 course • {(crossStats.tripleCombinations as any)?.length || 0} combinaisons analysées
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(crossStats.tripleCombinations as any)?.slice(0, showCount).map((combo: any, idx: number) => (
                <div
                  key={idx}
                  className={`border-2 rounded-lg p-4 ${
                    combo.winRate === 100 ? 'border-red-400 bg-red-50' :
                    combo.winRate >= 75 ? 'border-orange-400 bg-orange-50' :
                    combo.winRate >= 50 ? 'border-yellow-400 bg-yellow-50' :
                    'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          idx === 0 ? 'bg-yellow-500' :
                          idx === 1 ? 'bg-gray-400' :
                          idx === 2 ? 'bg-orange-500' :
                          'bg-gray-300'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="text-xs font-semibold text-gray-600">
                          📍 {combo.hippodrome}
                        </div>
                      </div>
                      <div className="font-bold text-gray-900 text-lg">{combo.horseName}</div>
                      <div className="text-sm text-gray-600">🏇 {combo.jockey}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${
                        combo.winRate === 100 ? 'text-red-600' :
                        combo.winRate >= 75 ? 'text-orange-600' :
                        combo.winRate >= 50 ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}>
                        {combo.winRate.toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-500">{combo.wins}/{combo.totalRaces}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white rounded p-2">
                      <div className="text-gray-500">Courses</div>
                      <div className="font-semibold">{combo.totalRaces}</div>
                    </div>
                    <div className="bg-white rounded p-2">
                      <div className="text-gray-500">Podiums</div>
                      <div className="font-semibold text-blue-600">{combo.podiums}</div>
                    </div>
                    <div className="bg-white rounded p-2">
                      <div className="text-gray-500">Pos. Moy</div>
                      <div className="font-semibold">{combo.avgPosition.toFixed(1)}</div>
                    </div>
                  </div>

                  {combo.winRate === 100 && (
                    <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-center">
                      <span className="text-xs font-bold text-red-800">🔥 COMBO PARFAITE - 100% VICTOIRES !</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bouton "Voir plus" */}
            {showCount < ((crossStats.tripleCombinations as any)?.length || 0) && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowCount(prev => prev + 10)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Voir plus ({((crossStats.tripleCombinations as any)?.length || 0) - showCount} restants)
                </button>
              </div>
            )}
          </div>
        )}

        {/* Hippodrome + Jockey */}
        {activeTab === 'hippo-jockey' && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                📍 Top 30 Combinaisons Hippodrome-Jockey
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Minimum 3 courses • {crossStats.hippodromeJockey.total} combinaisons analysées
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hippodrome</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jockey</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Courses</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Victoires</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Taux Victoire</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pos. Moy.</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(crossStats.hippodromeJockey as any)?.slice(0, showCount).map((combo: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          idx < 3 ? 'bg-blue-500' : 'bg-gray-300'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-900">{combo.hippodrome}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">{combo.jockey}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm">{combo.totalRaces}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-semibold text-yellow-600">{combo.wins}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-bold ${
                          combo.winRate >= 60 ? 'text-green-600' :
                          combo.winRate >= 40 ? 'text-yellow-600' :
                          'text-gray-600'
                        }`}>
                          {combo.winRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">
                        {combo.avgPosition.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bouton "Voir plus" */}
            {showCount < ((crossStats.hippodromeJockey as any)?.length || 0) && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowCount(prev => prev + 10)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Voir plus ({((crossStats.hippodromeJockey as any)?.length || 0) - showCount} restants)
                </button>
              </div>
            )}
          </div>
        )}

        {/* Hippodrome + Horse */}
        {activeTab === 'hippo-horse' && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                🏇 Top 30 Combinaisons Hippodrome-Cheval
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Minimum 3 courses • {crossStats.hippodromeHorse.total} combinaisons analysées
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hippodrome</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cheval</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Courses</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Victoires</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Taux Victoire</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pos. Moy.</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(crossStats.hippodromeHorse as any)?.slice(0, showCount).map((combo: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          idx < 3 ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-900">{combo.hippodrome}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">{combo.horseName}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm">{combo.totalRaces}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-semibold text-yellow-600">{combo.wins}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-bold ${
                          combo.winRate >= 60 ? 'text-green-600' :
                          combo.winRate >= 40 ? 'text-yellow-600' :
                          'text-gray-600'
                        }`}>
                          {combo.winRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">
                        {combo.avgPosition.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bouton "Voir plus" */}
            {showCount < ((crossStats.hippodromeHorse as any)?.length || 0) && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowCount(prev => prev + 10)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Voir plus ({((crossStats.hippodromeHorse as any)?.length || 0) - showCount} restants)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
