'use client';

import { useState } from 'react';
import { Wallet, AlertCircle } from 'lucide-react';
import { OnboardingData } from '../onboarding-wizard';

interface PlatformStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

export default function PlatformStep({ data, onNext, onBack }: PlatformStepProps) {
  const [platformName, setPlatformName] = useState(data.platformName);
  const [initialBankroll, setInitialBankroll] = useState(data.initialBankroll.toString());
  const [errors, setErrors] = useState<{ platformName?: string; initialBankroll?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!platformName.trim()) {
      newErrors.platformName = 'Le nom de la plateforme est requis';
    }

    const bankroll = parseFloat(initialBankroll);
    if (isNaN(bankroll) || bankroll <= 0) {
      newErrors.initialBankroll = 'La bankroll doit être un nombre positif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext({
        platformName: platformName.trim(),
        initialBankroll: parseFloat(initialBankroll),
      });
    }
  };

  const popularPlatforms = [
    'PMU', 'Betclic', 'Unibet', 'Winamax', 'ZEturf', 'Genybet'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Votre première plateforme
        </h2>
        <p className="text-gray-600">
          Créez votre première plateforme de paris pour commencer à suivre votre bankroll
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Qu'est-ce qu'une plateforme ?</p>
            <p>
              Une plateforme représente un site de paris (PMU, Betclic, etc.) où vous avez un compte.
              Vous pouvez en ajouter plusieurs pour suivre votre bankroll sur chaque site séparément.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Platform Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom de la plateforme *
          </label>
          <input
            type="text"
            value={platformName}
            onChange={(e) => {
              setPlatformName(e.target.value);
              if (errors.platformName) setErrors({ ...errors, platformName: undefined });
            }}
            placeholder="Ex: PMU, Betclic..."
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.platformName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.platformName && (
            <p className="mt-1 text-sm text-red-600">{errors.platformName}</p>
          )}

          {/* Quick Select */}
          <div className="mt-3">
            <p className="text-sm text-gray-600 mb-2">Plateformes populaires :</p>
            <div className="flex flex-wrap gap-2">
              {popularPlatforms.map((platform) => (
                <button
                  key={platform}
                  onClick={() => setPlatformName(platform)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Initial Bankroll */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bankroll initiale * (€)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Wallet className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              value={initialBankroll}
              onChange={(e) => {
                setInitialBankroll(e.target.value);
                if (errors.initialBankroll) setErrors({ ...errors, initialBankroll: undefined });
              }}
              placeholder="100"
              step="0.01"
              min="0"
              className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.initialBankroll ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.initialBankroll && (
            <p className="mt-1 text-sm text-red-600">{errors.initialBankroll}</p>
          )}
          <p className="mt-2 text-sm text-gray-500">
            Montant actuellement disponible sur cette plateforme
          </p>
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
