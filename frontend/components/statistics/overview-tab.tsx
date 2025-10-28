'use client';

import { Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { DashboardStats, PredefinedPeriods } from '@/lib/api/statistics';

interface OverviewTabProps {
  dashboardStats: DashboardStats | null;
  periods: PredefinedPeriods | null;
}

export function OverviewTab({ dashboardStats, periods }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Explanation Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow border-l-4 border-blue-500 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 À quoi servent ces statistiques ?</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            <strong>Statistiques par période :</strong> Comparez vos performances sur différentes périodes pour identifier vos meilleurs moments et ajuster votre stratégie.
          </p>
          <p>
            <strong>Vue d'ensemble globale :</strong> Suivez l'évolution de votre bankroll et de votre ROI sur le long terme. Un ROI positif indique que vous êtes rentable.
          </p>
          <p className="text-blue-700 font-medium">
            💡 Astuce : Si votre taux de réussite est supérieur à 50% mais votre ROI négatif, vous pariez peut-être trop sur des favoris à faible cote.
          </p>
        </div>
      </div>

      {/* Période Stats */}
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Vue d'ensemble globale</h2>
            <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              💡 ROI = (Profit / Mise totale) × 100
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Mois en cours', stats: dashboardStats.currentMonth },
              { title: 'Mois dernier', stats: dashboardStats.lastMonth },
              { title: 'Année en cours', stats: dashboardStats.yearToDate },
              { title: 'Total', stats: dashboardStats.allTime },
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
    </div>
  );
}
