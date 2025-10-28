'use client';

import { Activity, BarChart3, DollarSign, Target, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface DetailedMetricsProps {
  totalBets: number;
  averageOdds: number;
  totalStake: number;
  pendingStake: number;
  averageStake: number;
  initialBankroll: number;
  bankrollOperations: number;
  currentBankroll: number;
  roc: number;
  roi: number;
}

export function DetailedMetrics({
  totalBets,
  averageOdds,
  totalStake,
  pendingStake,
  averageStake,
  initialBankroll,
  bankrollOperations,
  currentBankroll,
  roc,
  roi,
}: DetailedMetricsProps) {
  const metrics = [
    {
      label: 'Nombre de paris',
      value: totalBets,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Cote moyenne',
      value: averageOdds.toFixed(2),
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Mises jouées',
      value: `${totalStake.toFixed(2)} €`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Mises en cours',
      value: `${pendingStake.toFixed(2)} €`,
      icon: Activity,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Mise moyenne',
      value: `${averageStake.toFixed(2)} €`,
      icon: Target,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      label: 'Bankroll de départ',
      value: `${initialBankroll.toFixed(2)} €`,
      icon: Wallet,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
    {
      label: 'Opérations bankrolls',
      value: `${bankrollOperations >= 0 ? '+' : ''}${bankrollOperations.toFixed(2)} €`,
      icon: Activity,
      color: bankrollOperations >= 0 ? 'text-blue-600' : 'text-orange-600',
      bgColor: bankrollOperations >= 0 ? 'bg-blue-50' : 'bg-orange-50',
    },
    {
      label: 'ROC (Évolution bankroll)',
      value: `${roc >= 0 ? '+' : ''}${roc.toFixed(2)} %`,
      icon: roc >= 0 ? TrendingUp : TrendingDown,
      color: roc >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: roc >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
    {
      label: 'ROI (Retour sur investissement)',
      value: totalStake > 0 ? `${roi >= 0 ? '+' : ''}${roi.toFixed(2)} %` : '/',
      icon: roi >= 0 ? TrendingUp : TrendingDown,
      color: roi >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: roi >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Métriques Détaillées</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className={`${metric.bgColor} rounded-lg p-4 transition-all hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <div className={`text-xl font-bold ${metric.color} mb-1`}>
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
