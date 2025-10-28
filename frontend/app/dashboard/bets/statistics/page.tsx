'use client';

import { useState, useEffect } from 'react';
import { ArrowUpDown, TrendingUp, TrendingDown, Award, AlertCircle, BarChart3 } from 'lucide-react';
import { betsAPI } from '@/lib/api/bets';
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

interface BetTypeStats {
  betType: string;
  totalBets: number;
  wonBets: number;
  halfWon: number;
  lostBets: number;
  halfLost: number;
  cancelled: number;
  refunded: number;
  cashout: number;
  pendingBets: number;
  avgOdds: number;
  totalStake: number;
  pendingStake: number;
  totalPayout: number;
  totalProfit: number;
  roi: number;
  winRate: number;
}

export default function BetsStatisticsPage() {
  const [statistics, setStatistics] = useState<BetTypeStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'roi' | 'winRate' | 'profit' | 'totalBets'>('totalBets');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      const stats = await betsAPI.getStatsByBetType();
      
      // Transform data into BetTypeStats format
      const transformedStats: BetTypeStats[] = (Array.isArray(stats) ? stats : []).map((data: any) => {
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
          betType: data.betType || 'Non spécifié',
          totalBets,
          wonBets,
          halfWon: 0, // À implémenter si nécessaire
          lostBets,
          halfLost: 0, // À implémenter si nécessaire
          cancelled: 0, // À implémenter si nécessaire
          refunded,
          cashout: 0, // À implémenter si nécessaire
          pendingBets,
          avgOdds,
          totalStake,
          pendingStake,
          totalPayout,
          totalProfit,
          roi,
          winRate,
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

  const getBetTypeLabel = (betType: string) => {
    const labels: Record<string, string> = {
      'gagnant': 'Simple Gagnant',
      'place': 'Simple Placé',
      'gagnant_place': 'Couplé Gagnant-Placé',
      'couple': 'Couplé',
      'couple_ordre': 'Couplé Ordre',
      'trio': 'Trio',
      'trio_ordre': 'Trio Ordre',
      'quarte': 'Quarté',
      'quarte_ordre': 'Quarté Ordre',
      'quinte': 'Quinté',
      'quinte_ordre': 'Quinté Ordre',
      'multi': 'Multi',
      'pick5': 'Pick 5',
      'autre': 'Autre',
    };
    return labels[betType] || betType;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Statistiques par Type de Pari</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Analyse détaillée de vos performances</p>
          </div>
          <Link
            href="/dashboard/bets"
            className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base self-start sm:self-auto"
          >
            ← Retour aux paris
          </Link>
        </div>
      </div>

      {statistics.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune statistique</h3>
          <p className="text-gray-500 mb-6">Créez des paris pour voir les statistiques par type</p>
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
              
              return (
                <div
                  key={stat.betType}
                  className={`rounded-lg shadow-md p-4 border-l-4 transition-all hover:shadow-lg ${
                    isPositive ? 'border-green-500 bg-gradient-to-br from-green-50 to-white' : 'border-red-500 bg-gradient-to-br from-red-50 to-white'
                  }`}
                >
                  {/* En-tête */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 text-sm truncate">
                      {getBetTypeLabel(stat.betType)}
                    </h3>
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
              {/* Graphique en barres - ROI par type */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-primary-600" />
                  <span>ROI par Type de Pari</span>
                </h3>
                <Bar
                data={{
                  labels: sortedStatistics.map(s => getBetTypeLabel(s.betType)),
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des Paris par Type</h3>
              <Doughnut
                data={{
                  labels: sortedStatistics.map(s => getBetTypeLabel(s.betType)),
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

            {/* Graphique en barres - Profit par type */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit/Perte par Type de Pari</h3>
              <Bar
                data={{
                  labels: sortedStatistics.map(s => getBetTypeLabel(s.betType)),
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

            {/* Graphique en barres - Taux de réussite */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Taux de Réussite par Type</h3>
              <Bar
                data={{
                  labels: sortedStatistics.map(s => getBetTypeLabel(s.betType)),
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
          </div>
          </details>

          {/* Tableau détaillé - Desktop uniquement */}
          <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedStatistics.map((stat, index) => (
                  <tr 
                    key={stat.betType} 
                    className={`hover:bg-gray-50 ${index === 0 && sortBy === 'roi' ? 'bg-green-50' : ''}`}
                  >
                    {/* Type */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">{getBetTypeLabel(stat.betType)}</div>
                      {index === 0 && sortBy === 'roi' && (
                        <div className="flex items-center space-x-1 text-xs text-green-600">
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
                      {stat.refunded}
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
                  </tr>
                ))}
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
                    {statistics.reduce((sum, s) => sum + s.refunded, 0)}
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
                </tr>
              </tfoot>
            </table>
            </div>
          </div>

          {/* Vue mobile - Liste simplifiée */}
          <div className="lg:hidden space-y-4">
            {sortedStatistics.map((stat) => (
              <div key={stat.betType} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900">{getBetTypeLabel(stat.betType)}</h3>
                  {stat.roi >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">Paris:</span>
                    <div className="font-semibold">{stat.totalBets}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Réussite:</span>
                    <div className={`font-semibold ${stat.winRate >= 50 ? 'text-green-600' : 'text-gray-900'}`}>
                      {stat.winRate.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Gagnés:</span>
                    <div className="font-semibold text-green-600">{stat.wonBets}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Perdus:</span>
                    <div className="font-semibold text-red-600">{stat.lostBets}</div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Mise totale:</span>
                    <span className="font-semibold">{stat.totalStake.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Profit:</span>
                    <span className={`font-bold ${getProfitColor(stat.totalProfit)}`}>
                      {stat.totalProfit >= 0 ? '+' : ''}{stat.totalProfit.toFixed(2)}€
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">ROI:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${getROIColor(stat.roi)}`}>
                      {stat.roi >= 0 ? '+' : ''}{stat.roi.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Total sur mobile */}
            <div className="bg-gray-100 rounded-lg shadow p-4 font-bold">
              <h3 className="text-lg mb-3">TOTAL</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Paris:</span>
                  <div>{statistics.reduce((sum, s) => sum + s.totalBets, 0)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Réussite:</span>
                  <div>
                    {((statistics.reduce((sum, s) => sum + s.wonBets, 0) / 
                      statistics.reduce((sum, s) => sum + s.totalBets, 0)) * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Gagnés:</span>
                  <div className="text-green-600">{statistics.reduce((sum, s) => sum + s.wonBets, 0)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Perdus:</span>
                  <div className="text-red-600">{statistics.reduce((sum, s) => sum + s.lostBets, 0)}</div>
                </div>
              </div>
              <div className="border-t border-gray-300 mt-3 pt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mise totale:</span>
                  <span>{statistics.reduce((sum, s) => sum + s.totalStake, 0).toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profit:</span>
                  <span className={getProfitColor(statistics.reduce((sum, s) => sum + s.totalProfit, 0))}>
                    {statistics.reduce((sum, s) => sum + s.totalProfit, 0) >= 0 ? '+' : ''}
                    {statistics.reduce((sum, s) => sum + s.totalProfit, 0).toFixed(2)}€
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ROI:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    getROIColor(
                      (statistics.reduce((sum, s) => sum + s.totalProfit, 0) / 
                      statistics.reduce((sum, s) => sum + s.totalStake, 0)) * 100
                    )
                  }`}>
                    {((statistics.reduce((sum, s) => sum + s.totalProfit, 0) / 
                      statistics.reduce((sum, s) => sum + s.totalStake, 0)) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
