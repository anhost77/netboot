'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import WelcomeStep from './steps/welcome-step';
import NotificationsStep from './steps/notifications-step';
import PlatformStep from './steps/platform-step';
import BudgetStep from './steps/budget-step';
import SubscriptionStep from './steps/subscription-step';
import SummaryStep from './steps/summary-step';

export interface OnboardingData {
  // Notifications
  notificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  notificationPreference: 'web' | 'email' | 'both';
  
  // Platform
  platformName: string;
  initialBankroll: number;
  
  // Budget
  dailyLimit?: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
  alertThreshold: number;
  bankrollMode: 'immediate' | 'on_loss';
  
  // Subscription
  selectedPlanId?: string;
  selectedBillingCycle?: 'monthly' | 'yearly';
}

const steps = [
  { id: 1, name: 'Bienvenue', component: WelcomeStep },
  { id: 2, name: 'Abonnement', component: SubscriptionStep },
  { id: 3, name: 'Notifications', component: NotificationsStep },
  { id: 4, name: 'Plateforme', component: PlatformStep },
  { id: 5, name: 'Budget', component: BudgetStep },
  { id: 6, name: 'Récapitulatif', component: SummaryStep },
];

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => Promise<void>;
  onSkip?: () => void;
}

export default function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    notificationsEnabled: true,
    pushNotificationsEnabled: false,
    notificationPreference: 'web',
    platformName: '',
    initialBankroll: 100,
    alertThreshold: 80,
    bankrollMode: 'immediate',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = (stepData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...stepData }));
    
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await onComplete(data);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      index < currentStep
                        ? 'bg-green-500 text-white'
                        : index === currentStep
                        ? 'bg-primary-600 text-white ring-4 ring-primary-200'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-all ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <CurrentStepComponent
            data={data}
            onNext={handleNext}
            onBack={handleBack}
            onComplete={handleComplete}
            onSkip={onSkip}
            isFirst={currentStep === 0}
            isLast={currentStep === steps.length - 1}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
