'use client';

import { useState } from 'react';
import { DollarSign, AlertTriangle, Zap, Clock } from 'lucide-react';
import { OnboardingData } from '../onboarding-wizard';

interface BudgetStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

export default function BudgetStep({ data, onNext, onBack }: BudgetStepProps) {
  const [dailyLimit, setDailyLimit] = useState(data.dailyLimit?.toString() || '');
  const [weeklyLimit, setWeeklyLimit] = useState(data.weeklyLimit?.toString() || '');
  const [monthlyLimit, setMonthlyLimit] = useState(data.monthlyLimit?.toString() || '');
  const [alertThreshold, setAlertThreshold] = useState(data.alertThreshold.toString());
  const [bankrollMode, setBankrollMode] = useState<'immediate' | 'on_loss'>(data.bankrollMode);

  const handleNext = () => {
    onNext({
      dailyLimit: dailyLimit ? parseFloat(dailyLimit) : undefined,
      weeklyLimit: weeklyLimit ? parseFloat(weeklyLimit) : undefined,
      monthlyLimit: monthlyLimit ? parseFloat(monthlyLimit) : undefined,
      alertThreshold: parseFloat(alertThreshold),
      bankrollMode,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Gestion du budget
        </h2>
        <p className="text-gray-600">
          Définissez vos limites pour jouer de manière responsable
        </p>
      </div>

      {/* Bankroll Mode */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Mode de gestion de la bankroll</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setBankrollMode('immediate')}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              bankrollMode === 'immediate'
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3 mb-2">
              <Zap className={`h-5 w-5 ${bankrollMode === 'immediate' ? 'text-primary-600' : 'text-gray-400'}`} />
              <h4 className="font-semibold text-gray-900">Déduction immédiate</h4>
            </div>
            <p className="text-sm text-gray-600">
              La mise est déduite dès la création du pari
            </p>
          </button>

          <button
            onClick={() => setBankrollMode('on_loss')}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              bankrollMode === 'on_loss'
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3 mb-2">
              <Clock className={`h-5 w-5 ${bankrollMode === 'on_loss' ? 'text-primary-600' : 'text-gray-400'}`} />
              <h4 className="font-semibold text-gray-900">À la perte</h4>
            </div>
            <p className="text-sm text-gray-600">
              La mise est déduite uniquement quand le pari est perdu
            </p>
          </button>
        </div>
      </div>

      {/* Budget Limits */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Limites de budget (optionnel)</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limite journalière (€)
            </label>
            <input
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              placeholder="Ex: 50"
              step="0.01"
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limite hebdomadaire (€)
            </label>
            <input
              type="number"
              value={weeklyLimit}
              onChange={(e) => setWeeklyLimit(e.target.value)}
              placeholder="Ex: 200"
              step="0.01"
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limite mensuelle (€)
            </label>
            <input
              type="number"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              placeholder="Ex: 500"
              step="0.01"
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Alert Threshold */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seuil d'alerte (%)
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="range"
            value={alertThreshold}
            onChange={(e) => setAlertThreshold(e.target.value)}
            min="50"
            max="95"
            step="5"
            className="flex-1"
          />
          <span className="text-lg font-semibold text-gray-900 w-16 text-right">
            {alertThreshold}%
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Vous serez alerté quand vous atteignez ce pourcentage de votre limite
        </p>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Jeu responsable</p>
            <p>
              Ces limites vous aident à contrôler vos dépenses. Vous pouvez les modifier à tout moment,
              mais nous vous encourageons à les respecter.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors"
        >
          ← Retour
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          Continuer →
        </button>
      </div>
    </div>
  );
}
