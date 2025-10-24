'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, Target, DollarSign, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface StatsCard {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  icon: React.ElementType;
  color: string;
}

export default function DashboardPage() {
  const [stats] = useState<StatsCard[]>([
    {
      title: 'Bankroll Actuel',
      value: '€2,450.00',
      change: '+12.5%',
      trend: 'up',
      icon: Wallet,
      color: 'bg-blue-500',
    },
    {
      title: 'Paris ce mois',
      value: '24',
      change: '+8',
      trend: 'up',
      icon: Target,
      color: 'bg-green-500',
    },
    {
      title: 'Profit du mois',
      value: '€350.00',
      change: '+25%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-purple-500',
    },
    {
      title: 'Taux de réussite',
      value: '62.5%',
      change: '-3.2%',
      trend: 'down',
      icon: BarChart3,
      color: 'bg-orange-500',
    },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Bienvenue sur votre tableau de bord BetTracker Pro</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
                  {stat.change && (
                    <div className="mt-2 flex items-center space-x-1">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500">vs mois dernier</span>
                    </div>
                  )}
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Bets Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Paris Récents</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏇</div>
            <p className="text-gray-500">Aucun pari récent</p>
            <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
              Ajouter un pari
            </button>
          </div>
        </div>
      </div>

      {/* Budget Alert */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Attention au budget</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Vous avez utilisé 75% de votre budget mensuel. Il vous reste €250 pour ce mois.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
