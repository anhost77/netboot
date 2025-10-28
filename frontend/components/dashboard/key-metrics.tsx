'use client';

import { useEffect, useState } from 'react';
import { betsAPI } from '@/lib/api/bets';
import { TrendingUp, TrendingDown, Activity, DollarSign, Target, Wallet, BarChart3, Percent } from 'lucide-react';

interface KeyMetrics {
  totalBets: number;
  averageOdds: number;
  totalStake: number;
  pendingStake: number;
  averageStake: number;
  winRate: number;
  initialBankroll: number;
  bankrollOperations: number;
  totalProfit: number;
  currentBankroll: number;
  roc: number;
  roi: number;
}

export function KeyMetrics() {
  const [metrics, setMetrics] = useState<KeyMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const stats = await betsAPI.getStats();
      setMetrics(stats as KeyMetrics);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const metricsData = [
    {
      label: 'Nombre de paris',
      value: metrics.totalBets,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Cote moyenne',
      value: metrics.averageOdds.toFixed(2),
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Mises jouées',
      value: `${metrics.totalStake.toFixed(2)} €`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Mises en cours',
      value: `${metrics.pendingStake.toFixed(2)} €`,
      icon: Activity,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Mise moyenne',
      value: `${metrics.averageStake.toFixed(2)} €`,
      icon: Target,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      label: 'Fiabilité moyenne',
      value: metrics.winRate.toFixed(0),
      icon: Percent,
      color: metrics.winRate >= 50 ? 'text-green-600' : 'text-gray-600',
      bgColor: metrics.winRate >= 50 ? 'bg-green-50' : 'bg-gray-50',
    },
    {
      label: 'Bankroll de départ',
      value: `${metrics.initialBankroll.toFixed(2)} €`,
      icon: Wallet,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
    {
      label: 'Opérations bankrolls',
      value: `${metrics.bankrollOperations >= 0 ? '+' : ''}${metrics.bankrollOperations.toFixed(2)} €`,
      icon: Activity,
      color: metrics.bankrollOperations >= 0 ? 'text-blue-600' : 'text-orange-600',
      bgColor: metrics.bankrollOperations >= 0 ? 'bg-blue-50' : 'bg-orange-50',
    },
    {
      label: 'Bénéfices / pertes',
      value: `${metrics.totalProfit >= 0 ? '+' : ''}${metrics.totalProfit.toFixed(2)} €`,
      icon: metrics.totalProfit >= 0 ? TrendingUp : TrendingDown,
      color: metrics.totalProfit >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: metrics.totalProfit >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
    {
      label: 'Bankroll actuelle',
      value: `${metrics.currentBankroll.toFixed(2)} €`,
      icon: Wallet,
      color: metrics.currentBankroll >= metrics.initialBankroll ? 'text-green-600' : 'text-red-600',
      bgColor: metrics.currentBankroll >= metrics.initialBankroll ? 'bg-green-50' : 'bg-red-50',
    },
    {
      label: 'ROC (Évolution bankroll)',
      value: `${metrics.roc >= 0 ? '+' : ''}${metrics.roc.toFixed(2)} %`,
      icon: metrics.roc >= 0 ? TrendingUp : TrendingDown,
      color: metrics.roc >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: metrics.roc >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
    {
      label: 'ROI (Retour sur investissement)',
      value: metrics.totalStake > 0 ? `${metrics.roi >= 0 ? '+' : ''}${metrics.roi.toFixed(2)} %` : '/',
      icon: metrics.roi >= 0 ? TrendingUp : TrendingDown,
      color: metrics.roi >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: metrics.roi >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Chiffres Importants</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {metricsData.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className={`${metric.bgColor} rounded-lg p-4 transition-all hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <div className={`text-2xl font-bold ${metric.color} mb-1`}>
                  {metric.value}
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  {metric.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
