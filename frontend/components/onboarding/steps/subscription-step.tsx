'use client';

import { useState, useEffect } from 'react';
import { Check, Zap, Crown, Rocket, Shield, Sparkles } from 'lucide-react';
import { OnboardingData } from '../onboarding-wizard';
import { subscriptionsAPI, type Plan } from '@/lib/api/subscriptions';
import { formatCurrency } from '@/lib/utils';

interface SubscriptionStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

export default function SubscriptionStep({ data, onNext, onBack }: SubscriptionStepProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const plansData = await subscriptionsAPI.getPlans();
        setPlans(Array.isArray(plansData) ? plansData : []);
        // Pre-select free plan
        const freePlan = plansData.find((p: Plan) => p.slug === 'free');
        if (freePlan) setSelectedPlan(freePlan);
      } catch (error) {
        console.error('Error loading plans:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPlans();
  }, []);

  const getPlanIcon = (slug: string) => {
    switch (slug) {
      case 'free':
        return Shield;
      case 'starter':
        return Zap;
      case 'pro':
        return Crown;
      case 'enterprise':
        return Rocket;
      default:
        return Sparkles;
    }
  };

  const getPlanColor = (slug: string) => {
    switch (slug) {
      case 'free':
        return 'bg-gray-500';
      case 'starter':
        return 'bg-blue-500';
      case 'pro':
        return 'bg-purple-500';
      case 'enterprise':
        return 'bg-orange-500';
      default:
        return 'bg-primary-500';
    }
  };

  const handleNext = () => {
    onNext({
      selectedPlanId: selectedPlan?.id,
      selectedBillingCycle: billingCycle,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Chargement des formules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choisissez votre formule
        </h2>
        <p className="text-gray-600">
          Commencez gratuitement et passez à une formule supérieure quand vous le souhaitez
        </p>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            billingCycle === 'monthly'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Mensuel
        </button>
        <button
          onClick={() => setBillingCycle('yearly')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors relative ${
            billingCycle === 'yearly'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Annuel
          <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
            -20%
          </span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const Icon = getPlanIcon(plan.slug);
          const isSelected = selectedPlan?.id === plan.id;
          const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly / 12;
          const features = Array.isArray(plan.features) ? plan.features : [];

          return (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className={`relative p-6 rounded-lg border-2 text-left transition-all hover:shadow-lg ${
                isSelected
                  ? 'border-primary-600 bg-primary-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {/* Popular Badge */}
              {plan.slug === 'pro' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    POPULAIRE
                  </span>
                </div>
              )}

              {/* Selected Checkmark */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className="bg-primary-600 rounded-full p-1">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}

              {/* Icon */}
              <div className={`w-12 h-12 ${getPlanColor(plan.slug)} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="h-6 w-6 text-white" />
              </div>

              {/* Plan Name */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatCurrency(price)}
                  </span>
                  <span className="text-gray-600 ml-1">/mois</span>
                </div>
                {billingCycle === 'yearly' && plan.priceYearly > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {formatCurrency(plan.priceYearly)} facturé annuellement
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-2">
                {features.slice(0, 4).map((feature: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
                {features.length > 4 && (
                  <li className="text-sm text-gray-500 italic">
                    +{features.length - 4} autres fonctionnalités
                  </li>
                )}
              </ul>
            </button>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Bon à savoir :</strong> Vous pouvez commencer avec la formule gratuite et changer
          d'abonnement à tout moment depuis vos paramètres. Aucune carte bancaire requise pour démarrer !
        </p>
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
          disabled={!selectedPlan}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuer →
        </button>
      </div>
    </div>
  );
}
