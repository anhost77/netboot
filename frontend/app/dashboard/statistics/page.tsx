'use client';

import { useEffect, useState } from 'react';
import { statisticsAPI, type DashboardStats, type TimeSeriesData, type PerformanceMetrics, type Breakdowns, type PredefinedPeriods } from '@/lib/api/statistics';
import { formatCurrency } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Wallet,
  Award,
  AlertCircle,
  BarChart3,
  Calendar,
  Filter,
  Clock,
} from 'lucide-react';

export default function StatisticsPage() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [periods, setPeriods] = useState<PredefinedPeriods | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([]);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [breakdowns, setBreakdowns] = useState<Breakdowns | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Format dates in local timezone YYYY-MM-DD
    const formatLocalDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      start: formatLocalDate(thirtyDaysAgo),
      end: formatLocalDate(today),
    };
  });

  useEffect(() => {
    loadData();
  }, [period, dateRange]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Map UI period values to backend expected values
      const periodMap = {
        'day': 'daily',
        'week': 'weekly',
        'month': 'monthly',
      } as const;

      const [dashStats, periodsData, tsData, perfData, breakData] = await Promise.all([
        statisticsAPI.getDashboard(),
        statisticsAPI.getPeriods(),
        statisticsAPI.getTimeSeries(periodMap[period], dateRange.start, dateRange.end),
        statisticsAPI.getPerformance(dateRange.start, dateRange.end),
        statisticsAPI.getBreakdowns(dateRange.start, dateRange.end),
      ]);

      // Debug: Log time series data
      console.log('=== DEBUG GRAPHIQUE ===');
      console.log('Nombre de jours:', tsData.length);
      console.log('Premier jour:', tsData[0]);
      console.log('Dernier jour:', tsData[tsData.length - 1]);
      console.log('Tous les profits:', tsData.map(d => ({ date: d.period, profit: d.totalProfit })));
      console.log('Max profit:', Math.max(...tsData.map(d => Math.abs(d.totalProfit))));

      setDashboardStats(dashStats);
      setPeriods(periodsData);
      setTimeSeries(tsData);
      setPerformance(perfData);
      setBreakdowns(breakData);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
          <p className="mt-2 text-gray-600">Analysez vos performances de paris</p>
        </div>
      </div>

      {/* Period Selector & Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Période graphique</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="day">Par jour</option>
              <option value="week">Par semaine</option>
              <option value="month">Par mois</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Période Stats - Aujourd'hui, Hier, Semaine, etc. */}
      {periods && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="h-5 w-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Statistiques par période</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Aujourd'hui", stats: periods.today, icon: '📅' },
              { title: 'Hier', stats: periods.yesterday, icon: '📆' },
              { title: 'Cette semaine', stats: periods.thisWeek, icon: '📊' },
              { title: 'Semaine dernière', stats: periods.lastWeek, icon: '📈' },
              { title: 'Ce mois', stats: periods.thisMonth, icon: '📋' },
              { title: 'Mois dernier', stats: periods.lastMonth, icon: '📁' },
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-4 border-l-4 border-primary-500">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500">Paris</p>
                    <p className="font-semibold">{item.stats.totalBets}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Taux</p>
                    <p className="font-semibold">{item.stats.winRate.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Mise</p>
                    <p className="font-semibold">{formatCurrency(item.stats.totalStake)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Profit</p>
                    <p className={`font-semibold ${item.stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(item.stats.totalProfit)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard Stats */}
      {dashboardStats && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Vue d'ensemble</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Mois en cours',
                stats: dashboardStats.currentMonth,
                trend: dashboardStats.trends.totalProfit,
              },
              {
                title: 'Mois dernier',
                stats: dashboardStats.lastMonth,
                trend: 0,
              },
              {
                title: 'Année en cours',
                stats: dashboardStats.yearToDate,
                trend: 0,
              },
              {
                title: 'Total',
                stats: dashboardStats.allTime,
                trend: 0,
              },
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-4">{item.title}</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Paris</span>
                    <span className="text-sm font-semibold">{item.stats.totalBets}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Mise totale</span>
                    <span className="text-sm font-semibold">{formatCurrency(item.stats.totalStake)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Profit</span>
                    <span className={`text-sm font-semibold ${item.stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(item.stats.totalProfit)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Taux réussite</span>
                    <span className="text-sm font-semibold">{item.stats.winRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">ROI</span>
                    <span className={`text-sm font-semibold ${item.stats.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.stats.roi.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time Series Chart */}
      {timeSeries.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Évolution des profits</h2>
          <div className="relative h-64">
            {/* Check if we have any data */}
            {(() => {
              const maxProfit = Math.max(...timeSeries.map(d => Math.abs(d.totalProfit)));
              const hasData = maxProfit > 0;

              if (!hasData) {
                return (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <p className="text-sm">Aucune donnée de profit pour cette période</p>
                      <p className="text-xs mt-1">Ajoutez des paris pour voir le graphique</p>
                    </div>
                  </div>
                );
              }

              // Hauteur maximale du graphique en pixels (h-64 = 256px, moins espace pour titre et labels)
              const MAX_CHART_HEIGHT = 200;

              return (
                <div className="flex flex-col h-full">
                  {/* Graphique avec ligne de base à 0 */}
                  <div className="flex-1 flex items-end justify-between relative" style={{ height: `${MAX_CHART_HEIGHT}px` }}>
                    {/* Ligne horizontale à 0 */}
                    <div className="absolute inset-x-0 bottom-0 border-b-2 border-gray-300 z-0"></div>

                    <div className="flex items-end justify-between w-full space-x-1 relative z-10">
                      {timeSeries.map((data, index) => {
                        // Calculer la hauteur en pixels au lieu de pourcentage
                        const heightRatio = maxProfit > 0 ? Math.abs(data.totalProfit) / maxProfit : 0;
                        const heightPx = heightRatio * MAX_CHART_HEIGHT;
                        const isPositive = data.totalProfit > 0;
                        const isZero = data.totalProfit === 0;

                        // Pour les jours à 0, afficher une petite barre grise, sinon minimum 10px
                        const displayHeightPx = isZero ? 0 : Math.max(heightPx, 10);

                        // Debug: Log height calculations
                        if (data.totalProfit !== 0) {
                          console.log(`Jour ${data.period}:`, {
                            profit: data.totalProfit,
                            maxProfit,
                            heightRatio: heightRatio.toFixed(3),
                            heightPx: `${heightPx.toFixed(1)}px`,
                            displayHeightPx: `${displayHeightPx.toFixed(1)}px`
                          });
                        }

                        return (
                          <div key={index} className="flex-1 flex flex-col items-center group relative">
                            {/* Barre */}
                            <div
                              className={`w-full rounded-t transition-all cursor-pointer ${
                                isZero
                                  ? 'bg-gray-300 hover:bg-gray-400'
                                  : isPositive
                                    ? 'bg-green-500 hover:bg-green-600'
                                    : 'bg-red-500 hover:bg-red-600'
                              }`}
                              style={{
                                height: isZero ? '2px' : `${displayHeightPx}px`,
                                minHeight: isZero ? '2px' : '10px'
                              }}
                            >
                              {/* Tooltip on hover */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-20 shadow-lg">
                                <div className="font-semibold">{data.period}</div>
                                <div className={`${data.totalProfit > 0 ? 'text-green-400' : data.totalProfit < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                  Profit: {formatCurrency(data.totalProfit)}
                                </div>
                                <div>Paris: {data.totalBets}</div>
                                {data.totalBets > 0 && (
                                  <div>Taux réussite: {data.winRate.toFixed(1)}%</div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Labels des dates */}
                  <div className="flex justify-between mt-2 px-1">
                    {timeSeries.length <= 31 && timeSeries.map((data, index) => {
                      // Afficher un label tous les X jours selon le nombre total
                      const showLabel = timeSeries.length <= 7 || index % Math.ceil(timeSeries.length / 7) === 0 || index === timeSeries.length - 1;
                      return (
                        <div key={index} className="flex-1 text-center">
                          {showLabel && (
                            <div className="text-xs text-gray-500">
                              {data.period.split('-').slice(1).join('/')}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {performance && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Métriques de performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Séries</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Série actuelle</span>
                  {performance.streaks.currentWinStreak > 0 ? (
                    <span className="text-sm font-semibold text-green-600">
                      {performance.streaks.currentWinStreak} victoires
                    </span>
                  ) : performance.streaks.currentLoseStreak > 0 ? (
                    <span className="text-sm font-semibold text-red-600">
                      {performance.streaks.currentLoseStreak} défaites
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-gray-600">0</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Plus longue série gagnante</span>
                  <span className="text-sm font-semibold text-green-600">{performance.streaks.maxWinStreak}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Plus longue série perdante</span>
                  <span className="text-sm font-semibold text-red-600">{performance.streaks.maxLoseStreak}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Indicateurs</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Profit moyen</span>
                  <span className={`text-sm font-semibold ${performance.avgProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(performance.avgProfit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Volatilité</span>
                  <span className="text-sm font-semibold">{performance.volatility.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ratio de Sharpe</span>
                  <span className="text-sm font-semibold">{performance.sharpeRatio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Score de cohérence</span>
                  <span className="text-sm font-semibold">{performance.consistencyScore.toFixed(0)}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Meilleur/Pire pari</span>
              </div>
              <div className="space-y-2">
                {performance.bestBet && (
                  <div className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Meilleur:</span>
                      <span className="font-semibold text-green-600">+{formatCurrency(performance.bestBet.profit)}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(performance.bestBet.date).toLocaleDateString('fr-FR')} - Cote: {Number(performance.bestBet.odds).toFixed(2)}
                    </div>
                  </div>
                )}
                {performance.worstBet && (
                  <div className="text-sm mt-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Pire:</span>
                      <span className="font-semibold text-red-600">{formatCurrency(performance.worstBet.profit)}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(performance.worstBet.date).toLocaleDateString('fr-FR')} - Cote: {Number(performance.worstBet.odds).toFixed(2)}
                    </div>
                  </div>
                )}
                {!performance.bestBet && !performance.worstBet && (
                  <div className="text-sm text-gray-500">Aucune donnée</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Breakdowns */}
      {breakdowns && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Par statut</h3>
            <div className="space-y-3">
              {breakdowns.byStatus.map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">{item.category}</span>
                      <span className="text-sm text-gray-600">{item.totalBets} paris</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${item.winRate}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className={`text-sm font-semibold ${item.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(item.totalProfit)}
                    </div>
                    <div className="text-xs text-gray-500">ROI: {item.roi.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Stake Range */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Par montant de mise</h3>
            <div className="space-y-3">
              {breakdowns.byStakeRange.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.range}</span>
                      <span className="text-sm text-gray-600">{item.totalBets} paris</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${item.winRate}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className={`text-sm font-semibold ${item.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(item.totalProfit)}
                    </div>
                    <div className="text-xs text-gray-500">Taux: {item.winRate.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Bet Type */}
          {breakdowns.byBetType.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Par type de pari</h3>
              <div className="space-y-3">
                {breakdowns.byBetType.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.category || 'Non spécifié'}</span>
                        <span className="text-sm text-gray-600">{item.totalBets} paris</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${item.winRate}%` }}
                        />
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className={`text-sm font-semibold ${item.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(item.totalProfit)}
                      </div>
                      <div className="text-xs text-gray-500">ROI: {item.roi.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* By Odds Range */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Par plage de cotes</h3>
            <div className="space-y-3">
              {breakdowns.byOddsRange.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.range}</span>
                      <span className="text-sm text-gray-600">{item.totalBets} paris</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{ width: `${item.winRate}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className={`text-sm font-semibold ${item.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(item.totalProfit)}
                    </div>
                    <div className="text-xs text-gray-500">Taux: {item.winRate.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Hippodrome */}
          {breakdowns.byHippodrome.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Par hippodrome</h3>
              <div className="space-y-3">
                {breakdowns.byHippodrome.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.category || 'Non spécifié'}</span>
                        <span className="text-sm text-gray-600">{item.totalBets} paris</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${item.winRate}%` }}
                        />
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className={`text-sm font-semibold ${item.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(item.totalProfit)}
                      </div>
                      <div className="text-xs text-gray-500">ROI: {item.roi.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* By Platform */}
          {breakdowns.byPlatform.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Par plateforme</h3>
              <div className="space-y-3">
                {breakdowns.byPlatform.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.category || 'Non spécifié'}</span>
                        <span className="text-sm text-gray-600">{item.totalBets} paris</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-pink-600 h-2 rounded-full"
                          style={{ width: `${item.winRate}%` }}
                        />
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className={`text-sm font-semibold ${item.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(item.totalProfit)}
                      </div>
                      <div className="text-xs text-gray-500">ROI: {item.roi.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
