'use client';

import { CheckCircle, Bell, Wallet, DollarSign, Sparkles, Crown } from 'lucide-react';
import { OnboardingData } from '../onboarding-wizard';
import { formatCurrency } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { subscriptionsAPI, type Plan } from '@/lib/api/subscriptions';

interface SummaryStepProps {
  data: OnboardingData;
  onBack: () => void;
  onComplete: () => void;
  isSubmitting: boolean;
}

export default function SummaryStep({ data, onBack, onComplete, isSubmitting }: SummaryStepProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    const loadPlan = async () => {
      if (data.selectedPlanId) {
        try {
          const plans = await subscriptionsAPI.getPlans();
          const plan = plans.find((p: Plan) => p.id === data.selectedPlanId);
          if (plan) setSelectedPlan(plan);
        } catch (error) {
          console.error('Error loading plan:', error);
        }
      }
    };
    loadPlan();
  }, [data.selectedPlanId]);

  const notificationLabel = {
    web: 'Web uniquement',
    email: 'Email uniquement',
    both: 'Web + Email',
  };

  const bankrollModeLabel = {
    immediate: 'Déduction immédiate',
    on_loss: 'À la perte',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Sparkles className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Récapitulatif de votre configuration
        </h2>
        <p className="text-gray-600">
          Vérifiez vos paramètres avant de finaliser
        </p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-4">
        {/* Notifications */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Notifications</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium">État:</span>{' '}
                  {data.notificationsEnabled ? (
                    <span className="text-green-600">✓ Activées</span>
                  ) : (
                    <span className="text-gray-500">Désactivées</span>
                  )}
                </p>
                {data.notificationsEnabled && (
                  <>
                    <p>
                      <span className="font-medium">Type:</span> {notificationLabel[data.notificationPreference]}
                    </p>
                    <p>
                      <span className="font-medium">Push:</span>{' '}
                      {data.pushNotificationsEnabled ? 'Oui' : 'Non'}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Subscription */}
        {selectedPlan && (
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Crown className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Abonnement</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Formule:</span> {selectedPlan.name}
                  </p>
                  <p>
                    <span className="font-medium">Facturation:</span>{' '}
                    {data.selectedBillingCycle === 'monthly' ? 'Mensuelle' : 'Annuelle'}
                  </p>
                  <p>
                    <span className="font-medium">Prix:</span>{' '}
                    {formatCurrency(
                      data.selectedBillingCycle === 'monthly'
                        ? selectedPlan.priceMonthly
                        : selectedPlan.priceYearly / 12
                    )}
                    /mois
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Platform */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Wallet className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Plateforme</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Nom:</span> {data.platformName}
                </p>
                <p>
                  <span className="font-medium">Bankroll initiale:</span>{' '}
                  {formatCurrency(data.initialBankroll)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Budget</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Mode:</span> {bankrollModeLabel[data.bankrollMode]}
                </p>
                {data.dailyLimit && (
                  <p>
                    <span className="font-medium">Limite journalière:</span> {formatCurrency(data.dailyLimit)}
                  </p>
                )}
                {data.weeklyLimit && (
                  <p>
                    <span className="font-medium">Limite hebdomadaire:</span> {formatCurrency(data.weeklyLimit)}
                  </p>
                )}
                {data.monthlyLimit && (
                  <p>
                    <span className="font-medium">Limite mensuelle:</span> {formatCurrency(data.monthlyLimit)}
                  </p>
                )}
                <p>
                  <span className="font-medium">Seuil d'alerte:</span> {data.alertThreshold}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-primary-800">
            <p className="font-medium mb-1">Tout est prêt !</p>
            <p>
              Votre compte sera configuré avec ces paramètres. Vous pourrez les modifier à tout moment
              depuis les paramètres de l'application.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors disabled:opacity-50"
        >
          ← Retour
        </button>
        <button
          onClick={onComplete}
          disabled={isSubmitting}
          className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Finalisation...</span>
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5" />
              <span>Finaliser la configuration</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
