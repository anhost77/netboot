'use client';

import { AlertTriangle, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { BudgetConsumption } from '@/lib/types';
import Link from 'next/link';

interface BudgetAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  daily?: BudgetConsumption;
  weekly?: BudgetConsumption;
  monthly?: BudgetConsumption;
}

export default function BudgetAlertModal({
  isOpen,
  onClose,
  daily,
  weekly,
  monthly,
}: BudgetAlertModalProps) {
  if (!isOpen) return null;

  // Déterminer le niveau d'alerte le plus critique
  const getMaxPercentage = () => {
    const percentages = [
      daily?.percentage || 0,
      weekly?.percentage || 0,
      monthly?.percentage || 0,
    ];
    return Math.max(...percentages);
  };

  const maxPercentage = getMaxPercentage();
  const isOverBudget = maxPercentage > 100;
  const isCritical = maxPercentage > 150;

  // Déterminer quelle période est la plus critique
  const getCriticalPeriod = () => {
    const periods = [
      { name: 'journalier', percentage: daily?.percentage || 0 },
      { name: 'hebdomadaire', percentage: weekly?.percentage || 0 },
      { name: 'mensuel', percentage: monthly?.percentage || 0 },
    ];
    return periods.reduce((max, period) => 
      period.percentage > max.percentage ? period : max
    );
  };

  const criticalPeriod = getCriticalPeriod();

  const getAlertColor = () => {
    if (isCritical) return {
      bg: 'bg-red-50',
      border: 'border-red-500',
      text: 'text-red-800',
      icon: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700',
    };
    if (isOverBudget) return {
      bg: 'bg-orange-50',
      border: 'border-orange-500',
      text: 'text-orange-800',
      icon: 'text-orange-600',
      button: 'bg-orange-600 hover:bg-orange-700',
    };
    return {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      text: 'text-yellow-800',
      icon: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700',
    };
  };

  const colors = getAlertColor();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-2xl max-w-md w-full transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`${colors.bg} ${colors.border} border-l-4 p-6 rounded-t-lg`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 ${colors.icon}`}>
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${colors.text}`}>
                    Attention au budget
                  </h3>
                  <p className={`mt-1 text-sm ${colors.text}`}>
                    Vous avez consommé{' '}
                    <span className="font-bold">{criticalPeriod.percentage.toFixed(1)}%</span>{' '}
                    de votre budget {criticalPeriod.name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Daily Budget */}
            {daily && daily.limit && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Journalier</span>
                  <span className={`text-sm font-bold ${
                    (daily.percentage || 0) > 100 ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {daily.percentage?.toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{formatCurrency(daily.consumed)} / {formatCurrency(daily.limit)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      (daily.percentage || 0) > 100
                        ? 'bg-red-600'
                        : (daily.percentage || 0) > 80
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(daily.percentage || 0, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Weekly Budget */}
            {weekly && weekly.limit && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Hebdomadaire</span>
                  <span className={`text-sm font-bold ${
                    (weekly.percentage || 0) > 100 ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {weekly.percentage?.toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{formatCurrency(weekly.consumed)} / {formatCurrency(weekly.limit)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      (weekly.percentage || 0) > 100
                        ? 'bg-red-600'
                        : (weekly.percentage || 0) > 80
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(weekly.percentage || 0, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Monthly Budget */}
            {monthly && monthly.limit && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Mensuel</span>
                  <span className={`text-sm font-bold ${
                    (monthly.percentage || 0) > 100 ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {monthly.percentage?.toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{formatCurrency(monthly.consumed)} / {formatCurrency(monthly.limit)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      (monthly.percentage || 0) > 100
                        ? 'bg-red-600'
                        : (monthly.percentage || 0) > 80
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(monthly.percentage || 0, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Warning Message */}
            {isOverBudget && (
              <div className={`${colors.bg} border ${colors.border} rounded-lg p-3 mt-4`}>
                <p className={`text-sm ${colors.text}`}>
                  {isCritical ? (
                    <>
                      <strong>⚠️ Alerte critique !</strong> Vous avez largement dépassé votre budget.
                      Nous vous recommandons fortement de suspendre vos paris.
                    </>
                  ) : (
                    <>
                      <strong>Attention !</strong> Vous avez dépassé votre budget.
                      Pensez à gérer vos limites pour jouer de manière responsable.
                    </>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Fermer
            </button>
            <Link
              href="/dashboard/budget"
              onClick={onClose}
              className={`px-6 py-2 ${colors.button} text-white rounded-lg transition-colors font-medium inline-flex items-center space-x-2`}
            >
              <span>Gérer mon budget</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
