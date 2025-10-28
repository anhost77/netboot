'use client';

import { useEffect, useState } from 'react';
import { pmuStatsAPI, type JockeyStat, type HorseJockeyCombination } from '@/lib/api/pmu-stats';
import { Trophy, TrendingUp, Users, Award, HelpCircle, Info, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function JockeyStatsSection({ userBetsOnly = false }: { userBetsOnly?: boolean }) {
  const [jockeyStats, setJockeyStats] = useState<JockeyStat[]>([]);
  const [combinations, setCombinations] = useState<HorseJockeyCombination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'jockeys' | 'combinations'>('jockeys');
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
      const [jockeyData, combinationData] = await Promise.all([
        userBetsOnly ? pmuStatsAPI.getMyJockeyStats() : pmuStatsAPI.getJockeyStats(),
        userBetsOnly ? pmuStatsAPI.getMyHorseJockeyCombinations() : pmuStatsAPI.getHorseJockeyCombinations(),
      ]);
      
      setJockeyStats(jockeyData.topJockeys || []);
      setCombinations(combinationData.topCombinations || []);
    } catch (error) {
      console.error('Failed to load jockey stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportJockeysToCSV = () => {
    if (!jockeyStats.length) {
      toast.error('Aucune donnée à exporter');
      return;
    }
    const csv = [
      'Jockey,Courses,Victoires,Podiums,Taux Victoire (%),Taux Podium (%)',
      ...jockeyStats.map(j => `${j.jockey},${j.totalRaces},${j.wins},${j.podiums || 0},${j.winRate.toFixed(2)},${j.podiumRate ? j.podiumRate.toFixed(2) : '0.00'}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'jockeys.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV réussi');
  };

  const exportJockeysToExcel = () => {
    if (!jockeyStats.length) {
      toast.error('Aucune donnée à exporter');
      return;
    }
    const tsv = [
      'Jockey\tCourses\tVictoires\tPodiums\tTaux Victoire (%)\tTaux Podium (%)',
      ...jockeyStats.map(j => `${j.jockey}\t${j.totalRaces}\t${j.wins}\t${j.podiums || 0}\t${j.winRate.toFixed(2)}\t${j.podiumRate ? j.podiumRate.toFixed(2) : '0.00'}`)
    ].join('\n');
    const blob = new Blob([tsv], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'jockeys.xls';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export Excel réussi');
  };

  const exportCombinationsToCSV = () => {
    if (!combinations.length) {
      toast.error('Aucune donnée à exporter');
      return;
    }
    const csv = [
      'Cheval,Jockey,Courses,Victoires,Podiums,Taux Victoire (%),Taux Podium (%)',
      ...combinations.map(c => `${c.horseName},${c.jockey},${c.totalRaces},${c.wins},${c.podiums || 0},${c.winRate ? c.winRate.toFixed(2) : '0.00'},${c.podiumRate ? c.podiumRate.toFixed(2) : '0.00'}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'combinaisons.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV réussi');
  };

  const exportCombinationsToExcel = () => {
    if (!combinations.length) {
      toast.error('Aucune donnée à exporter');
      return;
    }
    const tsv = [
      'Cheval\tJockey\tCourses\tVictoires\tPodiums\tTaux Victoire (%)\tTaux Podium (%)',
      ...combinations.map(c => `${c.horseName}\t${c.jockey}\t${c.totalRaces}\t${c.wins}\t${c.podiums || 0}\t${c.winRate ? c.winRate.toFixed(2) : '0.00'}\t${c.podiumRate ? c.podiumRate.toFixed(2) : '0.00'}`)
    ].join('\n');
    const blob = new Blob([tsv], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'combinaisons.xls';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export Excel réussi');
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex justify-between items-center px-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('jockeys')}
              className={`px-6 py-4 font-medium text-sm transition-colors ${
                activeTab === 'jockeys'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>🏇 Top Jockeys</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('combinations')}
              className={`px-6 py-4 font-medium text-sm transition-colors ${
                activeTab === 'combinations'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4" />
                <span>🤝 Meilleures Combinaisons</span>
              </div>
            </button>
          </div>
          <div className="flex gap-2 py-2">
            {activeTab === 'jockeys' ? (
              <>
                <button
                  onClick={exportJockeysToCSV}
                  className="flex items-center space-x-1 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  title="Export CSV"
                >
                  <Download className="h-3 w-3" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={exportJockeysToExcel}
                  className="flex items-center space-x-1 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  title="Export Excel"
                >
                  <Download className="h-3 w-3" />
                  <span>Excel</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={exportCombinationsToCSV}
                  className="flex items-center space-x-1 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  title="Export CSV"
                >
                  <Download className="h-3 w-3" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={exportCombinationsToExcel}
                  className="flex items-center space-x-1 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  title="Export Excel"
                >
                  <Download className="h-3 w-3" />
                  <span>Excel</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'jockeys' && (
          <div>
            {/* Guide pour débutants */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-2">📚 Guide pour débutants</h4>
                  <div className="text-sm text-blue-800 space-y-2">
                    <p>
                      <strong>Le jockey</strong> est la personne qui monte le cheval pendant la course. Son expérience et sa relation avec le cheval sont cruciales pour la performance.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div className="bg-white rounded p-3">
                        <div className="font-semibold text-gray-900 mb-1">📊 Taux de victoire</div>
                        <div className="text-xs text-gray-700">
                          Pourcentage de courses gagnées (1ère place). Un bon jockey a généralement &gt;20% de victoires.
                        </div>
                      </div>
                      <div className="bg-white rounded p-3">
                        <div className="font-semibold text-gray-900 mb-1">🥇 Taux de podium</div>
                        <div className="text-xs text-gray-700">
                          Pourcentage de courses terminées dans le top 3. Un taux &gt;40% est excellent.
                        </div>
                      </div>
                      <div className="bg-white rounded p-3">
                        <div className="font-semibold text-gray-900 mb-1">📍 Position moyenne</div>
                        <div className="text-xs text-gray-700">
                          Position moyenne d'arrivée. Plus c'est bas, mieux c'est ! Une moyenne &lt;5 est très bonne.
                        </div>
                      </div>
                      <div className="bg-white rounded p-3">
                        <div className="font-semibold text-gray-900 mb-1">🐴 Chevaux montés</div>
                        <div className="text-xs text-gray-700">
                          Nombre de chevaux différents. Un jockey polyvalent s'adapte à plusieurs chevaux.
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-xs">
                        <strong>💡 Astuce :</strong> Un jockey avec un taux de victoire élevé ET beaucoup de courses est plus fiable qu'un jockey avec peu de courses.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span>Top 20 Jockeys par Taux de Victoire</span>
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Minimum 5 courses • Basé sur {jockeyStats.length} jockeys
              </p>
            </div>

            {/* Vue desktop - Tableau */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jockey</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Courses</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Victoires</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Podiums</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Taux Victoire</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Taux Podium</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pos. Moy.</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Chevaux</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jockeyStats.slice(0, showCount).map((jockey, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                          idx === 0 ? 'bg-yellow-500' :
                          idx === 1 ? 'bg-gray-400' :
                          idx === 2 ? 'bg-orange-500' :
                          'bg-gray-300'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-900">{jockey.jockey}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {jockey.totalRaces}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-yellow-600">{jockey.wins}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-blue-600">{jockey.podiums}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center">
                          <span className={`text-sm font-bold ${
                            jockey.winRate >= 50 ? 'text-green-600' :
                            jockey.winRate >= 30 ? 'text-yellow-600' :
                            'text-gray-600'
                          }`}>
                            {jockey.winRate.toFixed(1)}%
                          </span>
                          <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className={`h-1.5 rounded-full ${
                                jockey.winRate >= 50 ? 'bg-green-500' :
                                jockey.winRate >= 30 ? 'bg-yellow-500' :
                                'bg-gray-500'
                              }`}
                              style={{ width: `${Math.min(jockey.winRate, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-gray-600">{jockey.podiumRate.toFixed(1)}%</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-gray-600">{jockey.avgPosition.toFixed(1)}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {jockey.uniqueHorses}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Vue mobile - Cartes */}
            <div className="md:hidden space-y-3">
              {jockeyStats.slice(0, showCount).map((jockey: any, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${
                      idx === 0 ? 'bg-yellow-500' :
                      idx === 1 ? 'bg-gray-400' :
                      idx === 2 ? 'bg-orange-600' :
                      'bg-gray-300'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{jockey.jockey}</div>
                      <div className="text-xs text-gray-500">{jockey.uniqueHorses} chevaux</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-xs text-gray-500">Courses</div>
                      <div className="font-semibold">{jockey.totalRaces}</div>
                    </div>
                    <div className="bg-yellow-50 rounded p-2">
                      <div className="text-xs text-gray-500">Victoires</div>
                      <div className="font-semibold text-yellow-600">{jockey.wins}</div>
                    </div>
                    <div className="bg-blue-50 rounded p-2">
                      <div className="text-xs text-gray-500">Podiums</div>
                      <div className="font-semibold text-blue-600">{jockey.podiums || 0}</div>
                    </div>
                    <div className="bg-green-50 rounded p-2">
                      <div className="text-xs text-gray-500">Pos. moy</div>
                      <div className="font-semibold">{jockey.avgPosition.toFixed(1)}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="flex-1 bg-green-100 rounded p-2 text-center">
                      <div className="text-xs text-gray-600">Taux victoire</div>
                      <div className="text-sm font-bold text-green-700">{jockey.winRate.toFixed(1)}%</div>
                    </div>
                    <div className="flex-1 bg-blue-100 rounded p-2 text-center">
                      <div className="text-xs text-gray-600">Taux podium</div>
                      <div className="text-sm font-bold text-blue-700">{jockey.podiumRate.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bouton "Voir plus" */}
            {showCount < jockeyStats.length && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowCount(prev => prev + 10)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Voir plus ({jockeyStats.length - showCount} restants)
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'combinations' && (
          <div>
            {/* Guide pour débutants - Combinaisons */}
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900 mb-2">🤝 Comprendre les combinaisons Cheval-Jockey</h4>
                  <div className="text-sm text-green-800 space-y-2">
                    <p>
                      Une <strong>combinaison cheval-jockey</strong> représente l'association d'un cheval spécifique avec un jockey particulier. Certaines paires fonctionnent exceptionnellement bien ensemble !
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                      <div className="bg-white rounded p-3">
                        <div className="font-semibold text-gray-900 mb-1">🎯 Pourquoi c'est important ?</div>
                        <div className="text-xs text-gray-700">
                          Un jockey qui connaît bien son cheval peut mieux anticiper ses réactions et optimiser sa stratégie de course.
                        </div>
                      </div>
                      <div className="bg-white rounded p-3">
                        <div className="font-semibold text-gray-900 mb-1">💯 Taux de victoire 100%</div>
                        <div className="text-xs text-gray-700">
                          Ces combinaisons ont gagné TOUTES leurs courses ensemble ! Mais attention au nombre de courses (minimum 3).
                        </div>
                      </div>
                      <div className="bg-white rounded p-3">
                        <div className="font-semibold text-gray-900 mb-1">📈 Comment l'utiliser ?</div>
                        <div className="text-xs text-gray-700">
                          Si vous voyez cette combinaison dans une course future, c'est un signal fort pour votre pari !
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-xs">
                        <strong>💡 Conseil pro :</strong> Une combinaison avec 75%+ de victoires sur 5+ courses est plus fiable qu'une combinaison à 100% sur seulement 3 courses.
                      </p>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-xs">
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-400 rounded"></div>
                        <span>100% de victoires</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded"></div>
                        <span>75%+ de victoires</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-4 bg-white border-2 border-gray-200 rounded"></div>
                        <span>Autres</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Award className="h-5 w-5 text-blue-600" />
                <span>Top 30 Combinaisons Cheval-Jockey</span>
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Minimum 3 courses ensemble • Basé sur {combinations.length} combinaisons
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {combinations.slice(0, showCount).map((combo, idx) => (
                <div
                  key={idx}
                  className={`border-2 rounded-lg p-4 ${
                    combo.winRate === 100 ? 'border-yellow-400 bg-yellow-50' :
                    combo.winRate >= 75 ? 'border-green-400 bg-green-50' :
                    'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          idx === 0 ? 'bg-yellow-500' :
                          idx === 1 ? 'bg-gray-400' :
                          idx === 2 ? 'bg-orange-500' :
                          'bg-gray-300'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-gray-900">{combo.horseName}</div>
                          <div className="text-sm text-gray-600">🏇 {combo.jockey}</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        combo.winRate === 100 ? 'text-yellow-600' :
                        combo.winRate >= 75 ? 'text-green-600' :
                        'text-blue-600'
                      }`}>
                        {combo.winRate.toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-500">{combo.wins}/{combo.totalRaces} victoires</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
                    <div className="bg-white rounded p-2">
                      <div className="text-gray-500">Courses</div>
                      <div className="font-semibold text-gray-900">{combo.totalRaces}</div>
                    </div>
                    <div className="bg-white rounded p-2">
                      <div className="text-gray-500">Podiums</div>
                      <div className="font-semibold text-blue-600">{combo.podiums}</div>
                    </div>
                    <div className="bg-white rounded p-2">
                      <div className="text-gray-500">Pos. Moy.</div>
                      <div className="font-semibold text-gray-900">{combo.avgPosition.toFixed(1)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bouton "Voir plus" */}
            {showCount < combinations.length && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowCount(prev => prev + 10)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Voir plus ({combinations.length - showCount} restants)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
