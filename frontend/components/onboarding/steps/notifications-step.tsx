'use client';

import { useState } from 'react';
import { Bell, Mail, Monitor, Check } from 'lucide-react';
import { OnboardingData } from '../onboarding-wizard';

interface NotificationsStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

export default function NotificationsStep({ data, onNext, onBack }: NotificationsStepProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(data.notificationsEnabled);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(data.pushNotificationsEnabled);
  const [notificationPreference, setNotificationPreference] = useState<'web' | 'email' | 'both'>(
    data.notificationPreference
  );

  const handleNext = () => {
    onNext({
      notificationsEnabled,
      pushNotificationsEnabled,
      notificationPreference,
    });
  };

  const preferences = [
    {
      value: 'web' as const,
      icon: Monitor,
      title: 'Web uniquement',
      description: 'Notifications dans l\'application',
    },
    {
      value: 'email' as const,
      icon: Mail,
      title: 'Email uniquement',
      description: 'Notifications par email',
    },
    {
      value: 'both' as const,
      icon: Bell,
      title: 'Web + Email',
      description: 'Tous les canaux de notification',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Notifications
        </h2>
        <p className="text-gray-600">
          Choisissez comment vous souhaitez être informé de vos paris et alertes
        </p>
      </div>

      {/* Enable Notifications Toggle */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Bell className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Activer les notifications</h3>
              <p className="text-sm text-gray-600">Recevez des alertes pour vos paris et votre budget</p>
            </div>
          </div>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notificationsEnabled ? 'bg-primary-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      {notificationsEnabled && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Type de notifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {preferences.map((pref) => {
              const Icon = pref.icon;
              const isSelected = notificationPreference === pref.value;
              return (
                <button
                  key={pref.value}
                  onClick={() => setNotificationPreference(pref.value)}
                  className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-5 w-5 text-primary-600" />
                    </div>
                  )}
                  <Icon className={`h-6 w-6 mb-2 ${isSelected ? 'text-primary-600' : 'text-gray-400'}`} />
                  <h4 className="font-semibold text-gray-900 mb-1">{pref.title}</h4>
                  <p className="text-sm text-gray-600">{pref.description}</p>
                </button>
              );
            })}
          </div>

          {/* Push Notifications */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={pushNotificationsEnabled}
                onChange={(e) => setPushNotificationsEnabled(e.target.checked)}
                className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <div className="flex-1">
                <label className="font-medium text-gray-900 cursor-pointer">
                  Activer les notifications push
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Recevez des notifications même quand l'application est fermée
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
