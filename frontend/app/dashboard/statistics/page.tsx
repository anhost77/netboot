'use client';

import { useEffect, useState } from 'react';
import { statisticsAPI, type DashboardStats, type TimeSeriesData, type PerformanceMetrics, type Breakdowns, type PredefinedPeriods } from '@/lib/api/statistics';
import { platformsAPI } from '@/lib/api/platforms';
import { formatCurrency } from '@/lib/utils';
import { formatLocalDate } from '@/lib/date-utils';
import { OverviewTab } from '@/components/statistics/overview-tab';
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
  Trophy,
  Download,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

type TabType = 'overview' | 'charts' | 'analysis';

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [periods, setPeriods] = useState<PredefinedPeriods | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([]);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [breakdowns, setBreakdowns] = useState<Breakdowns | null>(null);
  const [bankrolls, setBankrolls] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    return {
      start: formatLocalDate(thirtyDaysAgo),
      end: formatLocalDate(today),
    };
  });

  useEffect(() => {
    loadData();
    loadBankrolls();
  }, [period, dateRange]);

  const loadBankrolls = async () => {
    try {
      const platforms = await platformsAPI.getAll();
      const mapping: Record<string, string> = {};
      platforms.forEach(platform => {
        mapping[platform.id] = platform.name;
      });
      setBankrolls(mapping);
    } catch (error) {
      console.error('Failed to load bankrolls:', error);
    }
  };

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

  const exportToCSV = () => {
    if (!dashboardStats || !timeSeries.length) {
      toast.error('Aucune donnée à exporter');
      return;
    }

    const separator = ',';
    let csvContent = '';
    const stats = dashboardStats as any;
    const perf = performance as any;
    
    // Section 1: Résumé global
    csvContent += '=== RÉSUMÉ GLOBAL ===\n';
    csvContent += `Période,${dateRange.start} - ${dateRange.end}\n`;
    csvContent += `Total Paris,${stats.totalBets || 0}\n`;
    csvContent += `Paris Gagnés,${stats.wonBets || 0}\n`;
    csvContent += `Paris Perdus,${stats.lostBets || 0}\n`;
    csvContent += `Taux de Réussite,${(stats.winRate || 0).toFixed(2)}%\n`;
    csvContent += `Mise Totale,${(stats.totalStake || 0).toFixed(2)} €\n`;
    csvContent += `Profit Total,${(stats.totalProfit || 0).toFixed(2)} €\n`;
    csvContent += `ROI,${(stats.roi || 0).toFixed(2)}%\n\n`;
    
    // Section 2: Métriques de performance
    if (perf) {
      csvContent += '=== MÉTRIQUES DE PERFORMANCE ===\n';
      csvContent += `Série Actuelle,${perf.currentStreak?.count || 0} ${perf.currentStreak?.type === 'win' ? 'victoires' : 'défaites'}\n`;
      csvContent += `Plus Longue Série Gagnante,${perf.longestWinStreak || 0}\n`;
      csvContent += `Plus Longue Série Perdante,${perf.longestLossStreak || 0}\n`;
      csvContent += `Profit Moyen,${(perf.avgProfit || perf.averageProfit || 0).toFixed(2)} €\n`;
      csvContent += `Volatilité,${(perf.volatility || 0).toFixed(2)}\n`;
      csvContent += `Ratio de Sharpe,${(perf.sharpeRatio || 0).toFixed(2)}\n`;
      csvContent += `Score de Cohérence,${(perf.consistency || 0).toFixed(0)}%\n`;
      if (perf.bestBet) csvContent += `Meilleur Pari,${perf.bestBet.profit.toFixed(2)} € (Cote: ${perf.bestBet.odds})\n`;
      if (perf.worstBet) csvContent += `Pire Pari,${perf.worstBet.profit.toFixed(2)} € (Cote: ${perf.worstBet.odds})\n`;
      csvContent += '\n';
    }
    
    // Section 3: Séries temporelles
    csvContent += '=== ÉVOLUTION TEMPORELLE ===\n';
    csvContent += ['Date', 'Paris', 'Gagnés', 'Perdus', 'Taux (%)', 'Mise (€)', 'Profit (€)', 'ROI (%)'].join(separator) + '\n';
    timeSeries.forEach(day => {
      csvContent += [
        day.period,
        day.totalBets,
        day.wonBets,
        day.lostBets,
        day.winRate.toFixed(2),
        day.totalStake.toFixed(2),
        day.totalProfit.toFixed(2),
        day.roi.toFixed(2),
      ].join(separator) + '\n';
    });
    csvContent += '\n';
    
    // Section 4: Analyses par catégorie
    if (breakdowns) {
      const bd = breakdowns as any;
      
      // Par statut
      if (bd.byStatus?.length) {
        csvContent += '=== PAR STATUT ===\n';
        csvContent += ['Statut', 'Paris', 'Profit (€)', 'ROI (%)'].join(separator) + '\n';
        bd.byStatus.forEach((item: any) => {
          csvContent += [
            item.status || 'N/A',
            item.count || 0,
            (item.profit || 0).toFixed(2),
            (item.roi || 0).toFixed(2)
          ].join(separator) + '\n';
        });
        csvContent += '\n';
      }
      
      // Par type de pari
      if (bd.byBetType?.length) {
        csvContent += '=== PAR TYPE DE PARI ===\n';
        csvContent += ['Type', 'Paris', 'Profit (€)', 'ROI (%)'].join(separator) + '\n';
        bd.byBetType.forEach((item: any) => {
          csvContent += [
            item.betType || 'N/A',
            item.count || 0,
            (item.profit || 0).toFixed(2),
            (item.roi || 0).toFixed(2)
          ].join(separator) + '\n';
        });
        csvContent += '\n';
      }
      
      // Par montant de mise
      if (bd.byStakeRange?.length) {
        csvContent += '=== PAR MONTANT DE MISE ===\n';
        csvContent += ['Plage', 'Paris', 'Profit (€)', 'Taux (%)'].join(separator) + '\n';
        bd.byStakeRange.forEach((item: any) => {
          csvContent += [
            item.range || 'N/A',
            item.count || 0,
            (item.profit || 0).toFixed(2),
            (item.winRate || 0).toFixed(2)
          ].join(separator) + '\n';
        });
        csvContent += '\n';
      }
      
      // Par plage de cotes
      if (bd.byOddsRange?.length) {
        csvContent += '=== PAR PLAGE DE COTES ===\n';
        csvContent += ['Plage', 'Paris', 'Profit (€)', 'Taux (%)'].join(separator) + '\n';
        bd.byOddsRange.forEach((item: any) => {
          csvContent += [
            item.range || 'N/A',
            item.count || 0,
            (item.profit || 0).toFixed(2),
            (item.winRate || 0).toFixed(2)
          ].join(separator) + '\n';
        });
        csvContent += '\n';
      }
      
      // Par hippodrome
      if (bd.byHippodrome?.length) {
        csvContent += '=== PAR HIPPODROME ===\n';
        csvContent += ['Hippodrome', 'Paris', 'Profit (€)', 'ROI (%)'].join(separator) + '\n';
        bd.byHippodrome.forEach((item: any) => {
          csvContent += [
            item.hippodrome || 'N/A',
            item.count || 0,
            (item.profit || 0).toFixed(2),
            (item.roi || 0).toFixed(2)
          ].join(separator) + '\n';
        });
        csvContent += '\n';
      }
      
      // Par plateforme
      if (bd.byPlatform?.length) {
        csvContent += '=== PAR PLATEFORME ===\n';
        csvContent += ['Plateforme', 'Paris', 'Profit (€)', 'ROI (%)'].join(separator) + '\n';
        bd.byPlatform.forEach((item: any) => {
          csvContent += [
            getBankrollName(item.platform || item.category || 'N/A'),
            item.count || item.totalBets || 0,
            (item.profit || item.totalProfit || 0).toFixed(2),
            (item.roi || 0).toFixed(2)
          ].join(separator) + '\n';
        });
      }
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `statistiques_completes_${dateRange.start}_${dateRange.end}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Export CSV complet réussi');
  };

  const exportToExcel = () => {
    if (!dashboardStats || !timeSeries.length) {
      toast.error('Aucune donnée à exporter');
      return;
    }

    const separator = '\t';
    let tsvContent = '';
    const stats = dashboardStats as any;
    const perf = performance as any;
    
    // Section 1: Résumé global
    tsvContent += '=== RÉSUMÉ GLOBAL ===\n';
    tsvContent += `Période${separator}${dateRange.start} - ${dateRange.end}\n`;
    tsvContent += `Total Paris${separator}${stats.totalBets || 0}\n`;
    tsvContent += `Paris Gagnés${separator}${stats.wonBets || 0}\n`;
    tsvContent += `Paris Perdus${separator}${stats.lostBets || 0}\n`;
    tsvContent += `Taux de Réussite${separator}${(stats.winRate || 0).toFixed(2)}%\n`;
    tsvContent += `Mise Totale${separator}${(stats.totalStake || 0).toFixed(2)} €\n`;
    tsvContent += `Profit Total${separator}${(stats.totalProfit || 0).toFixed(2)} €\n`;
    tsvContent += `ROI${separator}${(stats.roi || 0).toFixed(2)}%\n\n`;
    
    // Section 2: Métriques de performance
    if (perf) {
      tsvContent += '=== MÉTRIQUES DE PERFORMANCE ===\n';
      tsvContent += `Série Actuelle${separator}${perf.currentStreak?.count || 0} ${perf.currentStreak?.type === 'win' ? 'victoires' : 'défaites'}\n`;
      tsvContent += `Plus Longue Série Gagnante${separator}${perf.longestWinStreak || 0}\n`;
      tsvContent += `Plus Longue Série Perdante${separator}${perf.longestLossStreak || 0}\n`;
      tsvContent += `Profit Moyen${separator}${(perf.avgProfit || perf.averageProfit || 0).toFixed(2)} €\n`;
      tsvContent += `Volatilité${separator}${(perf.volatility || 0).toFixed(2)}\n`;
      tsvContent += `Ratio de Sharpe${separator}${(perf.sharpeRatio || 0).toFixed(2)}\n`;
      tsvContent += `Score de Cohérence${separator}${(perf.consistency || 0).toFixed(0)}%\n`;
      if (perf.bestBet) tsvContent += `Meilleur Pari${separator}${perf.bestBet.profit.toFixed(2)} € (Cote: ${perf.bestBet.odds})\n`;
      if (perf.worstBet) tsvContent += `Pire Pari${separator}${perf.worstBet.profit.toFixed(2)} € (Cote: ${perf.worstBet.odds})\n`;
      tsvContent += '\n';
    }
    
    // Section 3: Séries temporelles
    tsvContent += '=== ÉVOLUTION TEMPORELLE ===\n';
    tsvContent += ['Date', 'Paris', 'Gagnés', 'Perdus', 'Taux (%)', 'Mise (€)', 'Profit (€)', 'ROI (%)'].join(separator) + '\n';
    timeSeries.forEach(day => {
      tsvContent += [
        day.period,
        day.totalBets,
        day.wonBets,
        day.lostBets,
        day.winRate.toFixed(2),
        day.totalStake.toFixed(2),
        day.totalProfit.toFixed(2),
        day.roi.toFixed(2),
      ].join(separator) + '\n';
    });
    tsvContent += '\n';
    
    // Section 4: Analyses par catégorie
    if (breakdowns) {
      const bd = breakdowns as any;
      
      // Par statut
      if (bd.byStatus?.length) {
        tsvContent += '=== PAR STATUT ===\n';
        tsvContent += ['Statut', 'Paris', 'Profit (€)', 'ROI (%)'].join(separator) + '\n';
        bd.byStatus.forEach((item: any) => {
          tsvContent += [
            item.status || 'N/A',
            item.count || 0,
            (item.profit || 0).toFixed(2),
            (item.roi || 0).toFixed(2)
          ].join(separator) + '\n';
        });
        tsvContent += '\n';
      }
      
      // Par type de pari
      if (bd.byBetType?.length) {
        tsvContent += '=== PAR TYPE DE PARI ===\n';
        tsvContent += ['Type', 'Paris', 'Profit (€)', 'ROI (%)'].join(separator) + '\n';
        bd.byBetType.forEach((item: any) => {
          tsvContent += [
            item.betType || 'N/A',
            item.count || 0,
            (item.profit || 0).toFixed(2),
            (item.roi || 0).toFixed(2)
          ].join(separator) + '\n';
        });
        tsvContent += '\n';
      }
      
      // Par montant de mise
      if (bd.byStakeRange?.length) {
        tsvContent += '=== PAR MONTANT DE MISE ===\n';
        tsvContent += ['Plage', 'Paris', 'Profit (€)', 'Taux (%)'].join(separator) + '\n';
        bd.byStakeRange.forEach((item: any) => {
          tsvContent += [
            item.range || 'N/A',
            item.count || 0,
            (item.profit || 0).toFixed(2),
            (item.winRate || 0).toFixed(2)
          ].join(separator) + '\n';
        });
        tsvContent += '\n';
      }
      
      // Par plage de cotes
      if (bd.byOddsRange?.length) {
        tsvContent += '=== PAR PLAGE DE COTES ===\n';
        tsvContent += ['Plage', 'Paris', 'Profit (€)', 'Taux (%)'].join(separator) + '\n';
        bd.byOddsRange.forEach((item: any) => {
          tsvContent += [
            item.range || 'N/A',
            item.count || 0,
            (item.profit || 0).toFixed(2),
            (item.winRate || 0).toFixed(2)
          ].join(separator) + '\n';
        });
        tsvContent += '\n';
      }
      
      // Par hippodrome
      if (bd.byHippodrome?.length) {
        tsvContent += '=== PAR HIPPODROME ===\n';
        tsvContent += ['Hippodrome', 'Paris', 'Profit (€)', 'ROI (%)'].join(separator) + '\n';
        bd.byHippodrome.forEach((item: any) => {
          tsvContent += [
            item.hippodrome || 'N/A',
            item.count || 0,
            (item.profit || 0).toFixed(2),
            (item.roi || 0).toFixed(2)
          ].join(separator) + '\n';
        });
        tsvContent += '\n';
      }
      
      // Par plateforme
      if (bd.byPlatform?.length) {
        tsvContent += '=== PAR PLATEFORME ===\n';
        tsvContent += ['Plateforme', 'Paris', 'Profit (€)', 'ROI (%)'].join(separator) + '\n';
        bd.byPlatform.forEach((item: any) => {
          tsvContent += [
            getBankrollName(item.platform || item.category || 'N/A'),
            item.count || item.totalBets || 0,
            (item.profit || item.totalProfit || 0).toFixed(2),
            (item.roi || 0).toFixed(2)
          ].join(separator) + '\n';
        });
      }
    }
    
    const blob = new Blob([tsvContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `statistiques_completes_${dateRange.start}_${dateRange.end}.xls`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Export Excel complet réussi');
  };

  const getBankrollName = (platformId: string) => {
    return bankrolls[platformId] || platformId;
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

  const tabs = [
    { id: 'overview' as TabType, name: 'Vue d\'ensemble', icon: BarChart3, description: 'Résumé global' },
    { id: 'charts' as TabType, name: 'Graphiques', icon: TrendingUp, description: 'Évolution temporelle' },
    { id: 'analysis' as TabType, name: 'Analyses', icon: Target, description: 'Métriques détaillées' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Statistiques</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Analysez vos performances de paris</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export Excel</span>
            <span className="sm:hidden">Excel</span>
          </button>
          <a
            href="/dashboard/pmu/statistics"
            className="flex items-center space-x-2 bg-white border-2 border-primary-600 text-primary-600 px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors text-sm"
          >
            <Trophy className="h-4 sm:h-5 w-4 sm:w-5" />
            <span className="hidden sm:inline">Statistiques PMU</span>
            <span className="sm:hidden">PMU</span>
          </a>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative min-w-0 flex-1 overflow-hidden py-4 px-4 text-center text-sm font-medium hover:bg-gray-50 focus:z-10 transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-primary-600 text-primary-600'
                      : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Icon className={`h-5 w-5 ${
                      activeTab === tab.id ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                    <span className="hidden sm:inline">{tab.name}</span>
                  </div>
                  <span className="hidden md:block text-xs text-gray-500 mt-1">{tab.description}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Period Selector & Filters - Only for charts and analysis */}
      {(activeTab === 'charts' || activeTab === 'analysis') && (
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
      )}

      {/* TAB: Vue d'ensemble */}
      {activeTab === 'overview' && (
        <OverviewTab dashboardStats={dashboardStats} periods={periods} />
      )}

      {/* TAB: Graphiques */}
      {activeTab === 'charts' && (
        <>
          {/* Explanation Banner */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow border-l-4 border-green-500 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📈 Comment lire ce graphique ?</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                <strong>Barres vertes :</strong> Jours où vous avez réalisé un profit. Plus la barre est haute, plus le profit est important.
              </p>
              <p>
                <strong>Barres rouges :</strong> Jours où vous avez subi une perte. Identifiez les périodes difficiles pour ajuster votre stratégie.
              </p>
              <p>
                <strong>Ligne horizontale :</strong> Représente le seuil de rentabilité (0€). L'objectif est de rester au-dessus le plus souvent possible.
              </p>
              <p className="text-green-700 font-medium">
                💡 Astuce : Une courbe régulièrement positive indique une stratégie gagnante. Des variations importantes suggèrent de mieux gérer votre bankroll.
              </p>
            </div>
          </div>

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
        </>
      )}

      {/* TAB: Analyses */}
      {activeTab === 'analysis' && (
        <>
          {/* Explanation Banner */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow border-l-4 border-purple-500 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🎯 Comprendre les analyses détaillées</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                <strong>Séries :</strong> Suivez vos séquences de victoires/défaites. Une longue série perdante peut indiquer qu'il faut revoir votre stratégie.
              </p>
              <p>
                <strong>Volatilité :</strong> Mesure la variation de vos résultats. Une volatilité élevée signifie des résultats irréguliers.
              </p>
              <p>
                <strong>Ratio de Sharpe :</strong> Indique si vos gains justifient les risques pris. Plus il est élevé, mieux c&apos;est (&gt;1 = bon, &gt;2 = excellent).
              </p>
              <p>
                <strong>Analyses par catégorie :</strong> Identifiez quels types de paris, cotes ou hippodromes sont les plus rentables pour vous.
              </p>
              <p className="text-purple-700 font-medium">
                💡 Astuce : Concentrez-vous sur les catégories avec le meilleur ROI et réduisez les paris sur celles qui sont déficitaires.
              </p>
            </div>
          </div>

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
                        <span className="text-sm font-medium text-gray-700">{getBankrollName(item.category || '')}</span>
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
        </>
      )}
    </div>
  );
}
