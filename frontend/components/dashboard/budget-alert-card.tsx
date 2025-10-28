'use client';

import { BudgetOverview } from '@/lib/types';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

interface BudgetAlertCardProps {
  budgetOverview: BudgetOverview | null;
  isLoading?: boolean;
}

export default function BudgetAlertCard({ budgetOverview, isLoading }: BudgetAlertCardProps) {
  if (isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-blue-200 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-blue-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (!budgetOverview) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Configuration du budget</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Configurez vos limites de budget pour mieux gérer vos paris.{' '}
                <Link href="/dashboard/budget" className="font-medium underline hover:text-blue-900">
                  Configurer maintenant
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if there are any alerts
  if (!budgetOverview.hasAlerts) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Budget sous contrôle</h3>
            <div className="mt-2 text-sm text-green-700">
              <p>Vous respectez vos limites de budget. Continuez ainsi !</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine alert level
  const getAlertLevel = () => {
    const dailyPercentage = budgetOverview.daily.percentage || 0;
    const weeklyPercentage = budgetOverview.weekly.percentage || 0;
    const monthlyPercentage = budgetOverview.monthly.percentage || 0;
    const maxPercentage = Math.max(dailyPercentage, weeklyPercentage, monthlyPercentage);

    if (maxPercentage >= 90) return 'danger';
    if (maxPercentage >= 75) return 'warning';
    return 'info';
  };

  const alertLevel = getAlertLevel();
  const styles = {
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-400',
      title: 'text-red-800',
      text: 'text-red-700',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-400',
      title: 'text-yellow-800',
      text: 'text-yellow-700',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-400',
      title: 'text-blue-800',
      text: 'text-blue-700',
    },
  };

  const style = styles[alertLevel];

  return (
    <div className={`${style.bg} border ${style.border} rounded-lg p-4`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className={`h-5 w-5 ${style.icon}`} />
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${style.title}`}>Attention au budget</h3>
          <div className={`mt-2 text-sm ${style.text} space-y-1`}>
            {budgetOverview.alerts.map((alert, index) => (
              <p key={index}>{alert}</p>
            ))}
            <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
              {budgetOverview.daily.limit && (
                <div>
                  <p className="font-medium">Journalier</p>
                  <p>
                    {formatCurrency(budgetOverview.daily.consumed)} / {formatCurrency(budgetOverview.daily.limit)}
                  </p>
                  <p className="font-semibold">{budgetOverview.daily.percentage?.toFixed(0)}%</p>
                </div>
              )}
              {budgetOverview.weekly.limit && (
                <div>
                  <p className="font-medium">Hebdomadaire</p>
                  <p>
                    {formatCurrency(budgetOverview.weekly.consumed)} / {formatCurrency(budgetOverview.weekly.limit)}
                  </p>
                  <p className="font-semibold">{budgetOverview.weekly.percentage?.toFixed(0)}%</p>
                </div>
              )}
              {budgetOverview.monthly.limit && (
                <div>
                  <p className="font-medium">Mensuel</p>
                  <p>
                    {formatCurrency(budgetOverview.monthly.consumed)} / {formatCurrency(budgetOverview.monthly.limit)}
                  </p>
                  <p className="font-semibold">{budgetOverview.monthly.percentage?.toFixed(0)}%</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-3">
            <Link
              href="/dashboard/budget"
              className={`text-sm font-medium ${style.title} hover:underline`}
            >
              Gérer mon budget →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
