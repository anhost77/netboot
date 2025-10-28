'use client';

import { Sparkles, Target, TrendingUp, Shield } from 'lucide-react';
import { OnboardingData } from '../onboarding-wizard';

interface WelcomeStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onSkip?: () => void;
  isFirst: boolean;
}

export default function WelcomeStep({ onNext, onSkip }: WelcomeStepProps) {
  const features = [
    {
      icon: Target,
      title: 'Suivi des Paris',
      description: 'Enregistrez et analysez tous vos paris hippiques en détail',
    },
    {
      icon: TrendingUp,
      title: 'Statistiques Avancées',
      description: 'Visualisez vos performances avec des graphiques et métriques',
    },
    {
      icon: Shield,
      title: 'Gestion du Budget',
      description: 'Définissez des limites et recevez des alertes pour jouer responsable',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
          <Sparkles className="h-8 w-8 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenue sur BetTracker Pro ! 🎉
        </h1>
        <p className="text-lg text-gray-600">
          Configurons votre compte en quelques étapes simples
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-lg border border-primary-100"
            >
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Astuce :</strong> Ce wizard vous aidera à configurer les paramètres essentiels.
          Vous pourrez toujours les modifier plus tard dans les paramètres.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <button
          onClick={onSkip}
          className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          Passer la configuration
        </button>
        <button
          onClick={() => onNext({})}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          Commencer la configuration →
        </button>
      </div>
    </div>
  );
}
