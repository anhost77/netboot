'use client';

import { useState, useEffect } from 'react';
import { ArrowUpDown, TrendingUp, TrendingDown, Award, AlertCircle, BarChart3, Wallet } from 'lucide-react';
import { betsAPI } from '@/lib/api/bets';
import { platformsAPI } from '@/lib/api/platforms';
import Link from 'next/link';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface PlatformStats {
  platform: string;
  totalBets: number;
  wonBets: number;
  halfWon: number;
  lostBets: number;
  halfLost: number;
  cancelled: number;
  refundedBets: number;
  cashout: number;
  pendingBets: number;
  avgOdds: number;
  totalStake: number;
  pendingStake: number;
  totalPayout: number;
  totalProfit: number;
  roi: number;
  winRate: number;
  initialBalance: number;
  currentBalance: number;
}

export default function BankrollStatisticsPage() {
  const [statistics, setStatistics] = useState<PlatformStats[]>([]);
  const [platforms, setPlatforms] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'roi' | 'winRate' | 'profit' | 'totalBets'>('totalBets');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadPlatforms();
    loadStatistics();
  }, []);

  const loadPlatforms = async () => {
    try {
      const platformsData = await platformsAPI.getAll();
      const mapping: Record<string, string> = {};
      platformsData.forEach(platform => {
        mapping[platform.id] = platform.name;
      });
      setPlatforms(mapping);
    } catch (error) {
      console.error('Failed to load platforms:', error);
    }
  };

  const getPlatformName = (platformId: string) => {
    return platforms[platformId] || platformId;
  };

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      const stats = await betsAPI.getStatsByPlatform();
      
      const transformedStats: PlatformStats[] = (Array.isArray(stats) ? stats : []).map((data: any) => {
        const totalBets = data.totalBets || 0;
        const wonBets = data.wonBets || 0;
        const lostBets = data.lostBets || 0;
        const pendingBets = data.pendingBets || 0;
        const refunded = data.refundedBets || 0;
        const totalStake = data.totalStake || 0;
        const totalProfit = data.totalProfit || 0;
        const totalPayout = data.totalPayout || 0;
        const roi = data.roi || 0;
        const winRate = data.winRate || 0;
        const pendingStake = totalBets > 0 ? (totalStake * (pendingBets / totalBets)) : 0;
        const avgOdds = data.avgOdds || 0;

        return {
          platform: data.platform || 'Non spécifié',
          totalBets,
          wonBets,
          halfWon: 0,
          lostBets,
          halfLost: 0,
          cancelled: 0,
          refundedBets: refunded,
          cashout: 0,
          pendingBets,
          avgOdds,
          totalStake,
          pendingStake,
          totalPayout,
          totalProfit,
          roi,
          winRate,
          initialBalance: data.initialBalance || 0,
          currentBalance: data.currentBalance || 0,
        };
      });

      setStatistics(transformedStats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (column: 'roi' | 'winRate' | 'profit' | 'totalBets') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const sortedStatistics = [...statistics].sort((a, b) => {
    let aValue: number, bValue: number;

    switch (sortBy) {
      case 'roi':
        aValue = a.roi;
        bValue = b.roi;
        break;
      case 'winRate':
        aValue = a.winRate;
        bValue = b.winRate;
        break;
      case 'profit':
        aValue = a.totalProfit;
        bValue = b.totalProfit;
        break;
      case 'totalBets':
        aValue = a.totalBets;
        bValue = b.totalBets;
        break;
      default:
        return 0;
    }

    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const getROIColor = (roi: number) => {
    if (roi >= 10) return 'text-green-600 bg-green-50';
    if (roi >= 0) return 'text-green-600 bg-green-50';
    if (roi >= -10) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getProfitColor = (profit: number) => {
    if (profit > 0) return 'text-green-600';
    if (profit === 0) return 'text-gray-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Statistiques par Bankroll / Bookmaker</h1>
            <p className="text-gray-600 mt-2">Analyse détaillée de vos performances par plateforme</p>
          </div>
          <Link
            href="/dashboard/bankroll"
            className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Retour à la bankroll
          </Link>
        </div>
      </div>

      {statistics.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune statistique</h3>
          <p className="text-gray-500 mb-6">Créez des paris pour voir les statistiques par plateforme</p>
          <Link
            href="/dashboard/bets"
            className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <span>Créer un pari</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Badges de statistiques visuelles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {sortedStatistics.map((stat) => {
              const isPositive = stat.roi >= 0;
              const isProfit = stat.totalProfit >= 0;
              const bankrollEvolution = stat.currentBalance - stat.initialBalance;
              
              return (
                <div
                  key={stat.platform}
                  className={`rounded-lg shadow-md p-4 border-l-4 transition-all hover:shadow-lg ${
                    isPositive ? 'border-green-500 bg-gradient-to-br from-green-50 to-white' : 'border-red-500 bg-gradient-to-br from-red-50 to-white'
                  }`}
                >
                  {/* En-tête */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Wallet className="h-4 w-4 text-primary-600 flex-shrink-0" />
                      <h3 className="font-bold text-gray-900 text-sm truncate">
                        {getPlatformName(stat.platform)}
                      </h3>
                    </div>
                    {isPositive ? (
                      <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600 flex-shrink-0" />
                    )}
                  </div>

                  {/* ROI Badge */}
                  <div className="mb-3">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      ROI: {isPositive ? '+' : ''}{stat.roi.toFixed(1)}%
                    </div>
                  </div>

                  {/* Statistiques */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Paris:</span>
                      <span className="font-semibold text-gray-900">{stat.totalBets}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Gagnés:</span>
                      <span className="font-semibold text-green-600">{stat.wonBets}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Perdus:</span>
                      <span className="font-semibold text-red-600">{stat.lostBets}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Réussite:</span>
                      <span className={`font-semibold ${stat.winRate >= 50 ? 'text-green-600' : 'text-gray-900'}`}>
                        {stat.winRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-gray-600">Profit:</span>
                      <span className={`font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                        {isProfit ? '+' : ''}{stat.totalProfit.toFixed(2)}€
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Bankroll:</span>
                      <span className={`font-bold ${bankrollEvolution >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.currentBalance.toFixed(2)}€
                      </span>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${stat.winRate >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(stat.winRate, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Graphiques détaillés (optionnel - à déplier) */}
          <details className="mb-6">
            <summary className="cursor-pointer bg-white rounded-lg shadow p-4 hover:bg-gray-50 transition-colors">
              <span className="font-semibold text-gray-900 flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-primary-600" />
                <span>Voir les graphiques détaillés</span>
              </span>
            </summary>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Graphique en barres - ROI par plateforme */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-primary-600" />
                  <span>ROI par Plateforme</span>
                </h3>
                <Bar
                  data={{
                    labels: sortedStatistics.map(s => s.platform),
                    datasets: [
                      {
                        label: 'ROI (%)',
                        data: sortedStatistics.map(s => s.roi),
                        backgroundColor: sortedStatistics.map(s => 
                          s.roi >= 0 ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)'
                        ),
                        borderColor: sortedStatistics.map(s => 
                          s.roi >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
                        ),
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
                          label: (context) => `ROI: ${(context.parsed.y || 0).toFixed(2)}%`,
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => `${value}%`,
                        },
                      },
                    },
                  }}
                />
              </div>

              {/* Graphique circulaire - Répartition des paris */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des Paris par Plateforme</h3>
                <Doughnut
                  data={{
                    labels: sortedStatistics.map(s => s.platform),
                    datasets: [
                      {
                        label: 'Nombre de paris',
                        data: sortedStatistics.map(s => s.totalBets),
                        backgroundColor: [
                          'rgba(59, 130, 246, 0.7)',
                          'rgba(34, 197, 94, 0.7)',
                          'rgba(251, 146, 60, 0.7)',
                          'rgba(168, 85, 247, 0.7)',
                          'rgba(236, 72, 153, 0.7)',
                          'rgba(14, 165, 233, 0.7)',
                          'rgba(132, 204, 22, 0.7)',
                          'rgba(234, 179, 8, 0.7)',
                        ],
                        borderColor: [
                          'rgb(59, 130, 246)',
                          'rgb(34, 197, 94)',
                          'rgb(251, 146, 60)',
                          'rgb(168, 85, 247)',
                          'rgb(236, 72, 153)',
                          'rgb(14, 165, 233)',
                          'rgb(132, 204, 22)',
                          'rgb(234, 179, 8)',
                        ],
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = sortedStatistics.reduce((sum, s) => sum + s.totalBets, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} paris (${percentage}%)`;
                          },
                        },
                      },
                    },
                  }}
                />
              </div>

              {/* Graphique en barres - Profit par plateforme */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit/Perte par Plateforme</h3>
                <Bar
                  data={{
                    labels: sortedStatistics.map(s => s.platform),
                    datasets: [
                      {
                        label: 'Profit (€)',
                        data: sortedStatistics.map(s => s.totalProfit),
                        backgroundColor: sortedStatistics.map(s => 
                          s.totalProfit >= 0 ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)'
                        ),
                        borderColor: sortedStatistics.map(s => 
                          s.totalProfit >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
                        ),
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
                          label: (context) => `Profit: ${(context.parsed.y || 0).toFixed(2)}€`,
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => `${value}€`,
                        },
                      },
                    },
                  }}
                />
              </div>

              {/* Graphique en barres - Évolution de la bankroll */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution de la Bankroll</h3>
                <Bar
                  data={{
                    labels: sortedStatistics.map(s => s.platform),
                    datasets: [
                      {
                        label: 'Bankroll de départ',
                        data: sortedStatistics.map(s => s.initialBalance),
                        backgroundColor: 'rgba(156, 163, 175, 0.7)',
                        borderColor: 'rgb(156, 163, 175)',
                        borderWidth: 2,
                      },
                      {
                        label: 'Bankroll actuelle',
                        data: sortedStatistics.map(s => s.currentBalance),
                        backgroundColor: sortedStatistics.map(s => 
                          s.currentBalance >= s.initialBalance ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)'
                        ),
                        borderColor: sortedStatistics.map(s => 
                          s.currentBalance >= s.initialBalance ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
                        ),
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => `${context.dataset.label}: ${(context.parsed.y || 0).toFixed(2)}€`,
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => `${value}€`,
                        },
                      },
                    },
                  }}
                />
              </div>

              {/* Graphique en barres - Taux de réussite */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Taux de Réussite par Plateforme</h3>
                <Bar
                  data={{
                    labels: sortedStatistics.map(s => s.platform),
                    datasets: [
                      {
                        label: 'Gagnés',
                        data: sortedStatistics.map(s => s.wonBets),
                        backgroundColor: 'rgba(34, 197, 94, 0.7)',
                        borderColor: 'rgb(34, 197, 94)',
                        borderWidth: 2,
                      },
                      {
                        label: 'Perdus',
                        data: sortedStatistics.map(s => s.lostBets),
                        backgroundColor: 'rgba(239, 68, 68, 0.7)',
                        borderColor: 'rgb(239, 68, 68)',
                        borderWidth: 2,
                      },
                      {
                        label: 'En cours',
                        data: sortedStatistics.map(s => s.pendingBets),
                        backgroundColor: 'rgba(251, 146, 60, 0.7)',
                        borderColor: 'rgb(251, 146, 60)',
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                        },
                      },
                    },
                  }}
                />
              </div>

              {/* Graphique circulaire - Répartition de la mise */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition de la Mise par Plateforme</h3>
                <Doughnut
                  data={{
                    labels: sortedStatistics.map(s => s.platform),
                    datasets: [
                      {
                        label: 'Mise totale',
                        data: sortedStatistics.map(s => s.totalStake),
                        backgroundColor: [
                          'rgba(59, 130, 246, 0.7)',
                          'rgba(34, 197, 94, 0.7)',
                          'rgba(251, 146, 60, 0.7)',
                          'rgba(168, 85, 247, 0.7)',
                          'rgba(236, 72, 153, 0.7)',
                          'rgba(14, 165, 233, 0.7)',
                          'rgba(132, 204, 22, 0.7)',
                          'rgba(234, 179, 8, 0.7)',
                        ],
                        borderColor: [
                          'rgb(59, 130, 246)',
                          'rgb(34, 197, 94)',
                          'rgb(251, 146, 60)',
                          'rgb(168, 85, 247)',
                          'rgb(236, 72, 153)',
                          'rgb(14, 165, 233)',
                          'rgb(132, 204, 22)',
                          'rgb(234, 179, 8)',
                        ],
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = sortedStatistics.reduce((sum, s) => sum + s.totalStake, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value.toFixed(2)}€ (${percentage}%)`;
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </details>

          {/* Tableau détaillé */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Vue desktop - Tableau */}
            <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bankroll / Bookmaker
                  </th>
                  <th 
                    className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('totalBets')}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>Paris</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gagnés
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    1/2 G
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Perdus
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    1/2 P
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Annulés
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remboursés
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cashout
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    En cours
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cote Value CO
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mises
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    En cours
                  </th>
                  <th 
                    className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('profit')}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Bénéfices/Pertes</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('roi')}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>ROI</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('winRate')}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>% Réussite</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bankroll de départ
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bankroll actuelle
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedStatistics.map((stat, index) => {
                  const bankrollEvolution = stat.currentBalance - stat.initialBalance;
                  
                  return (
                    <tr 
                      key={stat.platform} 
                      className={`hover:bg-gray-50 ${index === 0 && sortBy === 'roi' ? 'bg-green-50' : ''}`}
                    >
                      {/* Platform */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Wallet className="h-4 w-4 text-primary-600" />
                          <div className="font-semibold text-gray-900">{getPlatformName(stat.platform)}</div>
                        </div>
                        {index === 0 && sortBy === 'roi' && (
                          <div className="flex items-center space-x-1 text-xs text-green-600 mt-1">
                            <Award className="h-3 w-3" />
                            <span>Meilleur ROI</span>
                          </div>
                        )}
                      </td>

                      {/* Paris */}
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                        {stat.totalBets}
                      </td>

                      {/* Gagnés */}
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-green-600">
                        {stat.wonBets}
                      </td>

                      {/* 1/2 Gagnés */}
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-green-500">
                        {stat.halfWon}
                      </td>

                      {/* Perdus */}
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-red-600">
                        {stat.lostBets}
                      </td>

                      {/* 1/2 Perdus */}
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-red-500">
                        {stat.halfLost}
                      </td>

                      {/* Annulés */}
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        {stat.cancelled}
                      </td>

                      {/* Remboursés */}
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-blue-500">
                        {stat.refundedBets}
                      </td>

                      {/* Cashout */}
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-purple-500">
                        {stat.cashout}
                      </td>

                      {/* En cours */}
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-orange-600">
                        {stat.pendingBets}
                      </td>

                      {/* Cote Value CO */}
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {stat.avgOdds > 0 ? stat.avgOdds.toFixed(2) : '-'}
                      </td>

                      {/* Mises */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        {stat.totalStake.toFixed(2)}€
                      </td>

                      {/* En cours (mises) */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-orange-600">
                        {stat.pendingStake.toFixed(2)}€
                      </td>

                      {/* Bénéfices/Pertes */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className={`text-sm font-bold flex items-center justify-end space-x-1 ${getProfitColor(stat.totalProfit)}`}>
                          {stat.totalProfit >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span>{stat.totalProfit >= 0 ? '+' : ''}{stat.totalProfit.toFixed(2)}€</span>
                        </div>
                      </td>

                      {/* ROI */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getROIColor(stat.roi)}`}>
                          {stat.roi >= 0 ? '+' : ''}{stat.roi.toFixed(2)}%
                        </span>
                      </td>

                      {/* % Réussite */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`text-sm font-bold ${stat.winRate >= 50 ? 'text-green-600' : 'text-gray-900'}`}>
                          {stat.winRate.toFixed(1)}%
                        </span>
                      </td>

                      {/* Bankroll de départ */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {stat.initialBalance.toFixed(2)}€
                      </td>

                      {/* Bankroll actuelle */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex flex-col items-end">
                          <span className={`text-sm font-bold ${bankrollEvolution >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stat.currentBalance.toFixed(2)}€
                          </span>
                          <span className={`text-xs ${bankrollEvolution >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ({bankrollEvolution >= 0 ? '+' : ''}{bankrollEvolution.toFixed(2)}€)
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              
              {/* Total Row */}
              <tfoot className="bg-gray-100 font-bold">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">TOTAL</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">
                    {statistics.reduce((sum, s) => sum + s.totalBets, 0)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">
                    {statistics.reduce((sum, s) => sum + s.wonBets, 0)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-500">
                    {statistics.reduce((sum, s) => sum + s.halfWon, 0)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-red-600">
                    {statistics.reduce((sum, s) => sum + s.lostBets, 0)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-red-500">
                    {statistics.reduce((sum, s) => sum + s.halfLost, 0)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">
                    {statistics.reduce((sum, s) => sum + s.cancelled, 0)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-blue-500">
                    {statistics.reduce((sum, s) => sum + s.refundedBets, 0)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-purple-500">
                    {statistics.reduce((sum, s) => sum + s.cashout, 0)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-orange-600">
                    {statistics.reduce((sum, s) => sum + s.pendingBets, 0)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">-</td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900">
                    {statistics.reduce((sum, s) => sum + s.totalStake, 0).toFixed(2)}€
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-orange-600">
                    {statistics.reduce((sum, s) => sum + s.pendingStake, 0).toFixed(2)}€
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-bold ${getProfitColor(statistics.reduce((sum, s) => sum + s.totalProfit, 0))}`}>
                      {statistics.reduce((sum, s) => sum + s.totalProfit, 0) >= 0 ? '+' : ''}
                      {statistics.reduce((sum, s) => sum + s.totalProfit, 0).toFixed(2)}€
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                      getROIColor(
                        (statistics.reduce((sum, s) => sum + s.totalProfit, 0) / 
                        statistics.reduce((sum, s) => sum + s.totalStake, 0)) * 100
                      )
                    }`}>
                      {((statistics.reduce((sum, s) => sum + s.totalProfit, 0) / 
                        statistics.reduce((sum, s) => sum + s.totalStake, 0)) * 100).toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">
                    {((statistics.reduce((sum, s) => sum + s.wonBets, 0) / 
                      statistics.reduce((sum, s) => sum + s.totalBets, 0)) * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900">
                    {statistics.reduce((sum, s) => sum + s.initialBalance, 0).toFixed(2)}€
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900">
                    {statistics.reduce((sum, s) => sum + s.currentBalance, 0).toFixed(2)}€
                  </td>
                </tr>
              </tfoot>
            </table>
            </div>
            
            {/* Vue mobile - Cartes */}
            <div className="md:hidden p-4 space-y-4">
              {sortedStatistics.map((stat, index) => {
                const isPositive = stat.roi >= 0;
                return (
                  <div
                    key={stat.platform}
                    className={`rounded-lg p-4 border-2 ${
                      isPositive ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Wallet className="h-5 w-5 text-primary-600" />
                        <div className="font-bold text-gray-900">{getPlatformName(stat.platform)}</div>
                      </div>
                      {index === 0 && sortBy === 'roi' && (
                        <Award className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    
                    {/* Section Paris */}
                    <div className="mb-3">
                      <div className="text-xs font-semibold text-gray-700 mb-2">📊 Paris</div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white rounded p-2">
                          <div className="text-xs text-gray-500">Total</div>
                          <div className="font-semibold">{stat.totalBets}</div>
                        </div>
                        <div className="bg-white rounded p-2">
                          <div className="text-xs text-gray-500">Gagnés</div>
                          <div className="font-semibold text-green-600">{stat.wonBets}</div>
                        </div>
                        <div className="bg-white rounded p-2">
                          <div className="text-xs text-gray-500">1/2 G</div>
                          <div className="font-semibold text-green-400">{stat.halfWon}</div>
                        </div>
                        <div className="bg-white rounded p-2">
                          <div className="text-xs text-gray-500">Perdus</div>
                          <div className="font-semibold text-red-600">{stat.lostBets}</div>
                        </div>
                        <div className="bg-white rounded p-2">
                          <div className="text-xs text-gray-500">1/2 P</div>
                          <div className="font-semibold text-red-400">{stat.halfLost}</div>
                        </div>
                        <div className="bg-white rounded p-2">
                          <div className="text-xs text-gray-500">Annulés</div>
                          <div className="font-semibold text-gray-600">{stat.cancelled}</div>
                        </div>
                        <div className="bg-white rounded p-2">
                          <div className="text-xs text-gray-500">Remboursés</div>
                          <div className="font-semibold text-blue-600">{stat.refundedBets}</div>
                        </div>
                        <div className="bg-white rounded p-2">
                          <div className="text-xs text-gray-500">Cashout</div>
                          <div className="font-semibold text-orange-600">{stat.cashout}</div>
                        </div>
                        <div className="bg-white rounded p-2">
                          <div className="text-xs text-gray-500">En cours</div>
                          <div className="font-semibold text-yellow-600">{stat.pendingBets}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Section Financière */}
                    <div className="mb-3">
                      <div className="text-xs font-semibold text-gray-700 mb-2">💰 Finances</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white rounded p-2">
                          <div className="text-xs text-gray-500">Cote moy</div>
                          <div className="font-semibold">{stat.avgOdds.toFixed(2)}</div>
                        </div>
                        <div className="bg-white rounded p-2">
                          <div className="text-xs text-gray-500">Mises</div>
                          <div className="font-semibold">{stat.totalStake.toFixed(2)}€</div>
                        </div>
                        <div className="bg-white rounded p-2">
                          <div className="text-xs text-gray-500">En cours</div>
                          <div className="font-semibold text-yellow-600">{stat.pendingStake.toFixed(2)}€</div>
                        </div>
                        <div className="bg-white rounded p-2">
                          <div className="text-xs text-gray-500">Profit</div>
                          <div className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {stat.totalProfit.toFixed(2)}€
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Section Performance */}
                    <div className="mb-3">
                      <div className="text-xs font-semibold text-gray-700 mb-2">📈 Performance</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className={`rounded p-2 text-center ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
                          <div className="text-xs text-gray-600">ROI</div>
                          <div className={`font-bold ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
                            {stat.roi.toFixed(2)}%
                          </div>
                        </div>
                        <div className="bg-white rounded p-2 text-center">
                          <div className="text-xs text-gray-600">% Réussite</div>
                          <div className="font-bold text-green-600">{stat.winRate.toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Section Bankroll */}
                    <div>
                      <div className="text-xs font-semibold text-gray-700 mb-2">💼 Bankroll</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white rounded p-2">
                          <div className="text-xs text-gray-500">Départ</div>
                          <div className="font-semibold">{stat.initialBalance.toFixed(2)}€</div>
                        </div>
                        <div className="bg-white rounded p-2">
                          <div className="text-xs text-gray-500">Actuelle</div>
                          <div className="font-semibold text-primary-600">{stat.currentBalance.toFixed(2)}€</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Carte TOTAL */}
              {statistics.length > 0 && (
                <div className="rounded-lg p-4 border-2 border-primary-600 bg-primary-50">
                  <div className="flex items-center space-x-2 mb-3">
                    <BarChart3 className="h-5 w-5 text-primary-600" />
                    <div className="font-bold text-primary-900 text-lg">TOTAL</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white rounded p-2">
                      <div className="text-xs text-gray-500">Paris</div>
                      <div className="font-semibold">{statistics.reduce((sum, s) => sum + s.totalBets, 0)}</div>
                    </div>
                    <div className="bg-white rounded p-2">
                      <div className="text-xs text-gray-500">Gagnés</div>
                      <div className="font-semibold text-green-600">{statistics.reduce((sum, s) => sum + s.wonBets, 0)}</div>
                    </div>
                    <div className="bg-white rounded p-2">
                      <div className="text-xs text-gray-500">Perdus</div>
                      <div className="font-semibold text-red-600">{statistics.reduce((sum, s) => sum + s.lostBets, 0)}</div>
                    </div>
                    <div className="bg-white rounded p-2">
                      <div className="text-xs text-gray-500">Taux victoire</div>
                      <div className="font-semibold text-green-600">
                        {statistics.reduce((sum, s) => sum + s.totalBets, 0) > 0
                          ? ((statistics.reduce((sum, s) => sum + s.wonBets, 0) / statistics.reduce((sum, s) => sum + s.totalBets, 0)) * 100).toFixed(1)
                          : '0.0'}%
                      </div>
                    </div>
                    <div className="bg-white rounded p-2">
                      <div className="text-xs text-gray-500">Mise totale</div>
                      <div className="font-semibold">{statistics.reduce((sum, s) => sum + s.totalStake, 0).toFixed(2)}€</div>
                    </div>
                    <div className="bg-white rounded p-2">
                      <div className="text-xs text-gray-500">Profit</div>
                      <div className={`font-semibold ${statistics.reduce((sum, s) => sum + s.totalProfit, 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {statistics.reduce((sum, s) => sum + s.totalProfit, 0) >= 0 ? '+' : ''}{statistics.reduce((sum, s) => sum + s.totalProfit, 0).toFixed(2)}€
                      </div>
                    </div>
                  </div>
                  
                  <div className={`text-center py-2 rounded font-bold ${
                    statistics.reduce((sum, s) => sum + s.totalProfit, 0) >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    ROI: {statistics.reduce((sum, s) => sum + s.totalStake, 0) > 0
                      ? ((statistics.reduce((sum, s) => sum + s.totalProfit, 0) / statistics.reduce((sum, s) => sum + s.totalStake, 0)) * 100).toFixed(2)
                      : '0.00'}%
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="bg-white rounded p-2">
                      <div className="text-xs text-gray-500">Balance initiale</div>
                      <div className="font-semibold">{statistics.reduce((sum, s) => sum + s.initialBalance, 0).toFixed(2)}€</div>
                    </div>
                    <div className="bg-white rounded p-2">
                      <div className="text-xs text-gray-500">Balance actuelle</div>
                      <div className="font-semibold text-primary-600">{statistics.reduce((sum, s) => sum + s.currentBalance, 0).toFixed(2)}€</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
