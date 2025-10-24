'use client';

import { useEffect, useState } from 'react';
import { statisticsAPI, type DashboardStats, type TimeSeriesData, type PerformanceMetrics, type Breakdowns } from '@/lib/api/statistics';
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
} from 'lucide-react';

export default function StatisticsPage() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([]);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [breakdowns, setBreakdowns] = useState<Breakdowns | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
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

      const [dashStats, tsData, perfData, breakData] = await Promise.all([
        statisticsAPI.getDashboard(),
        statisticsAPI.getTimeSeries(periodMap[period], dateRange.start, dateRange.end),
        statisticsAPI.getPerformance(dateRange.start, dateRange.end),
        statisticsAPI.getBreakdowns(dateRange.start, dateRange.end),
      ]);

      setDashboardStats(dashStats);
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
            {/* Simple bar chart with CSS */}
            <div className="flex items-end justify-between h-full space-x-1">
              {timeSeries.map((data, index) => {
                const maxProfit = Math.max(...timeSeries.map(d => Math.abs(d.totalProfit)));
                const height = Math.abs(data.totalProfit) / maxProfit * 100;
                const isPositive = data.totalProfit >= 0;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center group relative">
                    <div
                      className={`w-full rounded-t transition-all ${
                        isPositive ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                      }`}
                      style={{ height: `${height}%` }}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                        <div>{data.period}</div>
                        <div>Profit: {formatCurrency(data.totalProfit)}</div>
                        <div>Paris: {data.totalBets}</div>
                        <div>Taux réussite: {data.winRate.toFixed(1)}%</div>
                      </div>
                    </div>
                    {timeSeries.length <= 31 && (
                      <div className="text-xs text-gray-500 mt-1 transform rotate-45 origin-left">
                        {data.period.split('-').pop()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
              {breakdowns.byStakeRange.map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.category}</span>
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

          {/* By Type */}
          {breakdowns.byType.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Par type de pari</h3>
              <div className="space-y-3">
                {breakdowns.byType.map((item) => (
                  <div key={item.category} className="flex items-center justify-between">
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
              {breakdowns.byOddsRange.map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.category}</span>
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
        </div>
      )}
    </div>
  );
}
