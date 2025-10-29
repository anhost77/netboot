'use client';

import { useEffect, useState } from 'react';
import { budgetAPI, type UpdateBudgetSettingsData, type MonthlyBudgetHistory } from '@/lib/api/budget';
import type { BudgetOverview, BudgetConsumption } from '@/lib/types';
import { useMode } from '@/contexts/ModeContext';
import { formatCurrency } from '@/lib/utils';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Settings,
  Calendar,
  DollarSign,
  Target,
  Activity,
  Save,
  X,
  Edit,
  CheckCircle,
  XCircle,
  Play,
  Zap,
} from 'lucide-react';

export default function BudgetPage() {
  const { mode, isSimulation } = useMode();
  const [overview, setOverview] = useState<BudgetOverview | null>(null);
  const [history, setHistory] = useState<MonthlyBudgetHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, [mode]); // Recharger quand le mode change

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [overviewData, historyData] = await Promise.all([
        budgetAPI.getOverview(),
        budgetAPI.getHistory(),
      ]);
      setOverview(overviewData);
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load budget data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getConsumptionColor = (percentage: number | null) => {
    if (percentage === null) return 'bg-gray-200';
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getConsumptionTextColor = (percentage: number | null) => {
    if (percentage === null) return 'text-gray-600';
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Erreur lors du chargement des données</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Budget</h1>
            {/* Indicateur de mode */}
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold ${
              isSimulation 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {isSimulation ? (
                <>
                  <Play className="h-3 w-3" />
                  <span>Simulation</span>
                </>
              ) : (
                <>
                  <Zap className="h-3 w-3" />
                  <span>Réel</span>
                </>
              )}
            </div>
          </div>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Gérez votre budget et suivez vos dépenses {isSimulation ? '(mode simulation)' : '(mode réel)'}</p>
        </div>
        <button
          onClick={() => setShowSettingsModal(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors w-full sm:w-auto"
        >
          <Settings className="h-5 w-5" />
          <span>Paramètres</span>
        </button>
      </div>

      {/* Alerts */}
      {overview.hasAlerts && overview.alerts.length > 0 && (
        <div className="space-y-2">
          {overview.alerts.map((alert, index) => (
            <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Alerte Budget</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{alert}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bankroll Overview */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg shadow-lg p-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-primary-100 text-sm font-medium">Bankroll Initial</p>
            <p className="mt-2 text-3xl font-bold">{formatCurrency(overview.bankroll.initial)}</p>
          </div>
          <div>
            <p className="text-primary-100 text-sm font-medium">Bankroll Actuel</p>
            <p className="mt-2 text-3xl font-bold">{formatCurrency(overview.bankroll.current)}</p>
          </div>
          <div>
            <p className="text-primary-100 text-sm font-medium">Évolution</p>
            <div className="mt-2 flex items-center space-x-2">
              <p className="text-3xl font-bold">{formatCurrency(overview.bankroll.change)}</p>
              {overview.bankroll.change >= 0 ? (
                <TrendingUp className="h-6 w-6" />
              ) : (
                <TrendingDown className="h-6 w-6" />
              )}
            </div>
          </div>
          <div>
            <p className="text-primary-100 text-sm font-medium">Pourcentage</p>
            <p className={`mt-2 text-3xl font-bold ${overview.bankroll.changePercent >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {overview.bankroll.changePercent >= 0 ? '+' : ''}{overview.bankroll.changePercent.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Budget Consumption */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily */}
        <BudgetConsumptionCard
          title="Budget Journalier"
          icon={Calendar}
          consumption={overview.daily}
          color="blue"
        />

        {/* Weekly */}
        <BudgetConsumptionCard
          title="Budget Hebdomadaire"
          icon={Activity}
          consumption={overview.weekly}
          color="purple"
        />

        {/* Monthly */}
        <BudgetConsumptionCard
          title="Budget Mensuel"
          icon={Target}
          consumption={overview.monthly}
          color="orange"
        />
      </div>

      {/* Budget Settings Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Paramètres de Budget</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          💡 Les informations de bankroll sont gérées automatiquement via vos plateformes dans la section <strong>Bankroll</strong>.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Limite Journalière</span>
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {overview.settings.dailyLimit ? formatCurrency(overview.settings.dailyLimit) : 'Non défini'}
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Limite Hebdomadaire</span>
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {overview.settings.weeklyLimit ? formatCurrency(overview.settings.weeklyLimit) : 'Non défini'}
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Limite Mensuelle</span>
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {overview.settings.monthlyLimit ? formatCurrency(overview.settings.monthlyLimit) : 'Non défini'}
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Seuil d'Alerte</span>
              <AlertTriangle className="h-5 w-5 text-gray-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {overview.settings.alertThreshold ? `${overview.settings.alertThreshold}%` : 'Non défini'}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly History */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Historique Mensuel</h2>
        </div>
        
        {/* Vue desktop - Tableau */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Période
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mise Totale
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paris
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taux de Réussite
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ROI
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p>Aucun historique disponible</p>
                  </td>
                </tr>
              ) : (
                history.map((item, index) => {
                  // Calculer le ROI si manquant
                  const totalStake = item.totalStake ?? 0;
                  const totalProfit = item.totalProfit ?? 0;
                  const calculatedRoi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;
                  const roi = item.roi ?? calculatedRoi;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.month} {item.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(totalStake)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(totalProfit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.betsCount ?? 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.winRate != null ? `${item.winRate.toFixed(1)}%` : '0.0%'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        roi >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {roi >= 0 ? '+' : ''}{roi.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Vue mobile - Cartes */}
        <div className="md:hidden p-4 space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>Aucun historique disponible</p>
            </div>
          ) : (
            history.map((item, index) => {
              // Calculer le ROI si manquant
              const totalStake = item.totalStake ?? 0;
              const totalProfit = item.totalProfit ?? 0;
              const calculatedRoi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;
              const roi = item.roi ?? calculatedRoi;
              
              const isProfit = totalProfit >= 0;
              const isRoiPositive = roi >= 0;
              
              return (
                <div
                  key={index}
                  className={`rounded-lg p-4 border-2 ${
                    isProfit ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-primary-600" />
                      <div className="font-bold text-gray-900">{item.month} {item.year}</div>
                    </div>
                    {isProfit ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white rounded p-2">
                      <div className="text-xs text-gray-500">Mise totale</div>
                      <div className="font-semibold">{formatCurrency(totalStake)}</div>
                    </div>
                    <div className="bg-white rounded p-2">
                      <div className="text-xs text-gray-500">Paris</div>
                      <div className="font-semibold">{item.betsCount ?? 0}</div>
                    </div>
                    <div className="bg-white rounded p-2">
                      <div className="text-xs text-gray-500">Profit</div>
                      <div className={`font-semibold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(totalProfit)}
                      </div>
                    </div>
                    <div className="bg-white rounded p-2">
                      <div className="text-xs text-gray-500">Taux réussite</div>
                      <div className="font-semibold text-green-600">
                        {item.winRate != null ? `${item.winRate.toFixed(1)}%` : '0.0%'}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`text-center py-2 rounded font-bold ${
                    isRoiPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    ROI: {roi >= 0 ? '+' : ''}{roi.toFixed(2)}%
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <BudgetSettingsModal
          settings={overview.settings}
          onClose={() => setShowSettingsModal(false)}
          onSuccess={() => {
            setShowSettingsModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// Budget Consumption Card Component
function BudgetConsumptionCard({
  title,
  icon: Icon,
  consumption,
  color,
}: {
  title: string;
  icon: React.ElementType;
  consumption: BudgetConsumption;
  color: 'blue' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  const getProgressColor = (percentage: number | null) => {
    if (percentage === null) return 'bg-gray-200';
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColor = (percentage: number | null) => {
    if (percentage === null) return 'text-gray-600';
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className={`${colorClasses[color]} rounded-lg p-2`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Consommé</span>
            <span className="font-medium text-gray-900">{formatCurrency(consumption.consumed)}</span>
          </div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Limite</span>
            <span className="font-medium text-gray-900">
              {consumption.limit ? formatCurrency(consumption.limit) : 'Non défini'}
            </span>
          </div>
          {consumption.remaining !== null && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Restant</span>
              <span className={`font-medium ${getTextColor(consumption.percentage)}`}>
                {formatCurrency(consumption.remaining)}
              </span>
            </div>
          )}
        </div>

        {consumption.limit && consumption.percentage !== null && (
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Progression</span>
              <span className={`font-bold ${getTextColor(consumption.percentage)}`}>
                {consumption.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`${getProgressColor(consumption.percentage)} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${Math.min(consumption.percentage, 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Nombre de paris</span>
            <span className="font-medium text-gray-900">{consumption.betsCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">Profit</span>
            <span className={`font-medium ${consumption.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(consumption.totalProfit)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Budget Settings Modal Component
function BudgetSettingsModal({
  settings,
  onClose,
  onSuccess,
}: {
  settings: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<UpdateBudgetSettingsData>({
    dailyLimit: settings.dailyLimit || undefined,
    weeklyLimit: settings.weeklyLimit || undefined,
    monthlyLimit: settings.monthlyLimit || undefined,
    alertThreshold: settings.alertThreshold || undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      await budgetAPI.updateSettings(formData);
      onSuccess();
    } catch (error: any) {
      console.error('Failed to update settings:', error);
      alert(error.response?.data?.message || 'Erreur lors de la mise à jour des paramètres');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Paramètres de Budget</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Wallet className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Les informations de bankroll (initial et actuel) sont gérées automatiquement via vos plateformes. 
                  Rendez-vous dans la section <strong>Bankroll</strong> pour les gérer.
                </p>
              </div>
            </div>
          </div>

          {/* Budget Limits */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Limites de Budget</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Limite Journalière (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.dailyLimit || ''}
                  onChange={(e) => setFormData({ ...formData, dailyLimit: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="50.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Limite Hebdomadaire (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.weeklyLimit || ''}
                  onChange={(e) => setFormData({ ...formData, weeklyLimit: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="300.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Limite Mensuelle (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monthlyLimit || ''}
                  onChange={(e) => setFormData({ ...formData, monthlyLimit: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="1000.00"
                />
              </div>
            </div>
          </div>

          {/* Alert Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertes</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seuil d'Alerte (%)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={formData.alertThreshold || ''}
                onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="75"
              />
              <p className="mt-1 text-xs text-gray-500">
                Vous serez alerté lorsque vous atteignez ce pourcentage de votre limite
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5" />
              <span>{isSubmitting ? 'Enregistrement...' : 'Enregistrer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
