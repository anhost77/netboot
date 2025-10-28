'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import OnboardingWizard, { OnboardingData } from '@/components/onboarding/onboarding-wizard';
import { platformsAPI } from '@/lib/api/platforms';
import { budgetAPI } from '@/lib/api/budget';
import { userSettingsAPI } from '@/lib/api/user-settings';
import { subscriptionsAPI } from '@/lib/api/subscriptions';

export default function OnboardingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async (data: OnboardingData) => {
    try {
      setError(null);

      // 1. Update user settings (notifications and bankroll mode)
      await userSettingsAPI.updateNotificationPreferences({
        notificationsEnabled: data.notificationsEnabled,
        pushNotificationsEnabled: data.pushNotificationsEnabled,
        notificationPreference: data.notificationPreference as any,
      });
      
      await userSettingsAPI.updateBankrollMode(data.bankrollMode);

      // 2. Create the first platform
      await platformsAPI.create({
        name: data.platformName,
        initialBankroll: data.initialBankroll,
      });

      // 3. Update budget settings
      await budgetAPI.updateSettings({
        dailyLimit: data.dailyLimit,
        weeklyLimit: data.weeklyLimit,
        monthlyLimit: data.monthlyLimit,
        alertThreshold: data.alertThreshold,
      });

      // 4. Activate subscription if a paid plan was selected
      if (data.selectedPlanId && data.selectedBillingCycle) {
        try {
          await subscriptionsAPI.demoPayment(data.selectedPlanId, data.selectedBillingCycle);
        } catch (err) {
          console.error('Error activating subscription:', err);
          // Continue anyway, user can activate later
        }
      }

      // 5. Mark onboarding as completed (store in localStorage)
      if (typeof window !== 'undefined') {
        localStorage.setItem('onboarding_completed', 'true');
      }

      // 5. Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Error completing onboarding:', err);
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la configuration');
    }
  };

  const handleSkip = () => {
    // Mark onboarding as skipped
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_completed', 'true');
    }
    router.push('/dashboard');
  };

  return (
    <div>
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Erreur</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="flex-shrink-0 text-red-400 hover:text-red-500"
            >
              <span className="sr-only">Fermer</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
      <OnboardingWizard onComplete={handleComplete} onSkip={handleSkip} />
    </div>
  );
}
