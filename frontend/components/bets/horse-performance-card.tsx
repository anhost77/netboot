'use client';

import { useEffect, useState } from 'react';
import { horsePerformancesAPI, type HorsePerformanceResponse } from '@/lib/api/horse-performances';
import { Trophy, TrendingUp, TrendingDown, MapPin, Calendar, Award, Minus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface HorsePerformanceCardProps {
  horseId: string;
  horseName: string;
}

export function HorsePerformanceCard({ horseId, horseName }: HorsePerformanceCardProps) {
  const [data, setData] = useState<HorsePerformanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadPerformances();
  }, [horseId]);

  const loadPerformances = async () => {
    try {
      setIsLoading(true);
      // Use horse name as ID (since we're passing the name as horseId)
      const response = await horsePerformancesAPI.getHorsePerformancesByName(horseId);
      setData(response);
    } catch (error) {
      console.error('Failed to load horse performances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!data || !data.stats || data.performances.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm">
        <p>Aucune donnée de performance disponible pour ce cheval</p>
      </div>
    );
  }

  const { stats, performances } = data;

  // Determine form indicator
  const getFormIndicator = () => {
    const recentPerfs = performances.slice(0, 5);
    const recentPodiums = recentPerfs.filter(p => p.position && p.position <= 3).length;
    const recentWins = recentPerfs.filter(p => p.position === 1).length;

    if (recentWins >= 2 || recentPodiums >= 3) {
      return { icon: '🔥', label: 'En forme', color: 'text-green-600 bg-green-50' };
    } else if (recentPodiums === 0) {
      return { icon: '❌', label: 'Hors forme', color: 'text-red-600 bg-red-50' };
    } else {
      return { icon: '⚠️', label: 'Irrégulier', color: 'text-orange-600 bg-orange-50' };
    }
  };

  const formIndicator = getFormIndicator();

  // Best hippodrome
  const bestHippodrome = Object.entries(stats.hippodromeStats)
    .filter(([_, stats]) => stats.races >= 2)
    .sort((a, b) => (b[1].wins / b[1].races) - (a[1].wins / a[1].races))[0];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 overflow-hidden">
      {/* Header with stats */}
      <div className="p-4 bg-white border-b border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
            <Trophy className="h-4 w-4 text-yellow-600" />
            <span>Performances de {horseName}</span>
          </h4>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${formIndicator.color}`}>
            {formIndicator.icon} {formIndicator.label}
          </span>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-gray-50 rounded p-2">
            <p className="text-xs text-gray-500">Courses</p>
            <p className="text-lg font-bold text-gray-900">{stats.totalRaces}</p>
          </div>
          <div className="bg-green-50 rounded p-2">
            <p className="text-xs text-green-600">Victoires</p>
            <p className="text-lg font-bold text-green-700">{stats.wins}</p>
          </div>
          <div className="bg-blue-50 rounded p-2">
            <p className="text-xs text-blue-600">Podiums</p>
            <p className="text-lg font-bold text-blue-700">{stats.podiums}</p>
          </div>
          <div className="bg-purple-50 rounded p-2">
            <p className="text-xs text-purple-600">Pos. moy.</p>
            <p className="text-lg font-bold text-purple-700">{stats.avgPosition}</p>
          </div>
        </div>

        {/* Performance bars */}
        <div className="mt-3 space-y-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Taux de victoire</span>
              <span className="font-semibold text-gray-900">{stats.winRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${stats.winRate >= 20 ? 'bg-green-500' : stats.winRate >= 10 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(stats.winRate, 100)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Taux de podium</span>
              <span className="font-semibold text-gray-900">{stats.podiumRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{ width: `${Math.min(stats.podiumRate, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Best hippodrome */}
        {bestHippodrome && (
          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-2">
            <p className="text-xs text-yellow-800 flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span><strong>Hippodrome favorable:</strong> {bestHippodrome[0]} ({bestHippodrome[1].wins}/{bestHippodrome[1].races} victoires)</span>
            </p>
          </div>
        )}
      </div>

      {/* Recent performances */}
      <div className="p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 mb-2"
        >
          <span className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>5 dernières courses</span>
          </span>
          <span className="text-xs text-gray-500">{isExpanded ? '▼' : '▶'}</span>
        </button>

        {/* Performance timeline */}
        <div className="flex items-center space-x-1 mb-3">
          {performances.slice(0, 5).reverse().map((perf, idx) => {
            const position = perf.position || 99;
            let bgColor = 'bg-gray-400';
            let icon = <Minus className="h-3 w-3 text-white" />;

            if (position === 1) {
              bgColor = 'bg-yellow-500';
              icon = <Trophy className="h-3 w-3 text-white" />;
            } else if (position <= 3) {
              bgColor = 'bg-blue-500';
              icon = <Award className="h-3 w-3 text-white" />;
            } else if (position <= 5) {
              bgColor = 'bg-green-500';
              icon = <TrendingUp className="h-3 w-3 text-white" />;
            } else if (position > 10) {
              bgColor = 'bg-red-500';
              icon = <TrendingDown className="h-3 w-3 text-white" />;
            }

            return (
              <div
                key={idx}
                className={`flex-1 h-10 ${bgColor} rounded flex items-center justify-center relative group cursor-pointer`}
                title={`${perf.hippodrome} - ${perf.position}ème/${perf.nbParticipants}`}
              >
                {icon}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                  <div className="font-semibold">{perf.hippodrome}</div>
                  <div>{perf.position}ème / {perf.nbParticipants}</div>
                  <div className="text-gray-300">{new Date(perf.date).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed list */}
        {isExpanded && (
          <div className="space-y-2 mt-3">
            {performances.slice(0, 5).map((perf, idx) => (
              <div key={idx} className="bg-white rounded border border-gray-200 p-2 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900">{perf.hippodrome}</span>
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    perf.position === 1 ? 'bg-yellow-100 text-yellow-800' :
                    perf.position && perf.position <= 3 ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {perf.position}ème
                  </span>
                </div>
                <div className="text-gray-600 space-y-0.5">
                  <div>{perf.raceName || 'Course'}</div>
                  <div className="flex items-center space-x-2">
                    <span>{new Date(perf.date).toLocaleDateString('fr-FR')}</span>
                    {perf.distance && <span>• {perf.distance}m</span>}
                    {perf.nbParticipants && <span>• {perf.nbParticipants} partants</span>}
                  </div>
                  {perf.jockey && <div className="text-gray-500">Jockey: {perf.jockey}</div>}
                  
                  {/* Competitors */}
                  {perf.competitors && perf.competitors.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
                        👥 Voir les concurrents ({perf.competitors.length})
                      </summary>
                      <div className="mt-2 space-y-1 pl-2 border-l-2 border-blue-200">
                        {perf.competitors
                          .filter(c => c.place?.place)
                          .sort((a, b) => (a.place?.place || 99) - (b.place?.place || 99))
                          .slice(0, 10)
                          .map((competitor, cIdx) => (
                            <div key={cIdx} className={`flex items-center justify-between py-1 ${competitor.itsHim ? 'bg-blue-50 font-semibold' : ''}`}>
                              <div className="flex items-center space-x-2">
                                <span className={`w-6 text-center ${
                                  competitor.place?.place === 1 ? 'text-yellow-600 font-bold' :
                                  competitor.place?.place && competitor.place.place <= 3 ? 'text-blue-600 font-bold' :
                                  'text-gray-500'
                                }`}>
                                  {competitor.place?.place}.
                                </span>
                                <span className={competitor.itsHim ? 'text-blue-700' : 'text-gray-700'}>
                                  {competitor.nomCheval}
                                  {competitor.itsHim && ' ⭐'}
                                </span>
                              </div>
                              <span className="text-gray-500 text-xs">{competitor.nomJockey}</span>
                            </div>
                          ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
