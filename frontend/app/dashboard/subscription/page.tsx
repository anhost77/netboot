'use client';

import { useEffect, useState } from 'react';
import { subscriptionsAPI, type Plan, type Subscription, type Invoice } from '@/lib/api/subscriptions';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  CreditCard,
  Check,
  X,
  Calendar,
  AlertCircle,
  Download,
  Zap,
  Crown,
  Rocket,
  Shield,
  RefreshCw,
  XCircle,
} from 'lucide-react';

export default function SubscriptionPage() {
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [subscriptionData, plansData, invoicesData] = await Promise.all([
        subscriptionsAPI.getCurrentSubscription().catch(() => null),
        subscriptionsAPI.getPlans().catch(() => []),
        subscriptionsAPI.getInvoices().catch((err) => {
          console.error('Error loading invoices:', err);
          return [];
        }),
      ]);
      console.log('Loaded invoices:', invoicesData);
      setCurrentSubscription(subscriptionData);
      setPlans(Array.isArray(plansData) ? plansData : []);
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      setPlans([]);
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowUpgradeModal(true);
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlan) return;

    try {
      setIsProcessing(true);
      // Use demo payment for development
      const result = await subscriptionsAPI.demoPayment(selectedPlan.id, selectedBillingCycle);
      console.log('Demo payment result:', result);
      setShowUpgradeModal(false);
      
      // Wait a bit for backend to create invoice
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadData();
      
      alert('Abonnement activé avec succès !');
    } catch (error: any) {
      console.error('Failed to upgrade:', error);
      alert(error.response?.data?.message || 'Erreur lors de la mise à niveau');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler votre abonnement ? Il restera actif jusqu\'à la fin de la période en cours.')) {
      return;
    }

    try {
      await subscriptionsAPI.cancel();
      await loadData();
      alert('Abonnement annulé. Il restera actif jusqu\'à la fin de la période.');
    } catch (error: any) {
      console.error('Failed to cancel:', error);
      alert(error.response?.data?.message || 'Erreur lors de l\'annulation');
    }
  };

  const handleResumeSubscription = async () => {
    try {
      await subscriptionsAPI.resume();
      await loadData();
      alert('Abonnement réactivé avec succès !');
    } catch (error: any) {
      console.error('Failed to resume:', error);
      alert(error.response?.data?.message || 'Erreur lors de la réactivation');
    }
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Generate invoice content
    const content = `
╔════════════════════════════════════════════════════════════╗
║                    FACTURE / INVOICE                       ║
╚════════════════════════════════════════════════════════════╝

Numéro de facture : ${invoice.id}
Date : ${formatDate(invoice.createdAt)}
Statut : ${invoice.status === 'paid' ? 'Payée' : invoice.status === 'pending' ? 'En attente' : 'Impayée'}
${invoice.paidAt ? `Date de paiement : ${formatDate(invoice.paidAt)}` : ''}

────────────────────────────────────────────────────────────

DÉTAILS DE LA FACTURE

Description : Abonnement BetTracker Pro
${currentSubscription ? `Plan : ${currentSubscription.plan.name}` : ''}
${currentSubscription ? `Cycle : ${currentSubscription.billingCycle === 'monthly' ? 'Mensuel' : 'Annuel'}` : ''}

────────────────────────────────────────────────────────────

MONTANT

Montant HT : ${formatCurrency(invoice.amount / 1.2)}
TVA (20%) : ${formatCurrency(invoice.amount - (invoice.amount / 1.2))}
TOTAL TTC : ${formatCurrency(invoice.amount)}

────────────────────────────────────────────────────────────

BetTracker Pro
Application de suivi de paris hippiques
https://bettracker.pro

Merci pour votre confiance !

────────────────────────────────────────────────────────────
Mode DEMO - Cette facture est générée à des fins de test
────────────────────────────────────────────────────────────
`;

    // Create blob and download
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `facture-${invoice.id.substring(0, 8)}-${new Date(invoice.createdAt).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      trial: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      cancelled: 'bg-orange-100 text-orange-800',
      expired: 'bg-red-100 text-red-800',
      past_due: 'bg-red-100 text-red-800',
    };
    const labels = {
      trial: 'Essai',
      active: 'Actif',
      cancelled: 'Annulé',
      expired: 'Expiré',
      past_due: 'Impayé',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

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
        return CreditCard;
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Abonnement</h1>
        <p className="mt-2 text-gray-600">Gérez votre abonnement et vos factures</p>
      </div>

      {/* Current Subscription */}
      {currentSubscription && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold">{currentSubscription.plan.name}</h2>
                {getStatusBadge(currentSubscription.status)}
              </div>
              <p className="text-primary-100 mb-4">
                {currentSubscription.billingCycle === 'monthly' ? 'Facturation mensuelle' : 'Facturation annuelle'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-primary-100 text-sm">Prix</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      currentSubscription.billingCycle === 'monthly'
                        ? currentSubscription.plan.priceMonthly
                        : currentSubscription.plan.priceYearly
                    )}
                    <span className="text-sm font-normal">
                      /{currentSubscription.billingCycle === 'monthly' ? 'mois' : 'an'}
                    </span>
                  </p>
                </div>
                {currentSubscription.currentPeriodEnd && (
                  <div>
                    <p className="text-primary-100 text-sm">
                      {currentSubscription.cancelAtPeriodEnd ? 'Expire le' : 'Renouvellement le'}
                    </p>
                    <p className="text-lg font-semibold">{formatDate(currentSubscription.currentPeriodEnd)}</p>
                  </div>
                )}
                <div>
                  <p className="text-primary-100 text-sm">Paris par mois</p>
                  <p className="text-lg font-semibold">
                    {currentSubscription.plan.maxBetsPerMonth || 'Illimité'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex space-x-3">
            {currentSubscription.cancelAtPeriodEnd ? (
              <button
                onClick={handleResumeSubscription}
                className="flex items-center space-x-2 px-4 py-2 bg-white text-primary-600 rounded-md hover:bg-primary-50 transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Réactiver l'abonnement</span>
              </button>
            ) : (
              <button
                onClick={handleCancelSubscription}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 text-white rounded-md hover:bg-white/20 transition-colors"
              >
                <XCircle className="h-5 w-5" />
                <span>Annuler l'abonnement</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Alert if subscription is cancelled */}
      {currentSubscription?.cancelAtPeriodEnd && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-orange-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">Abonnement annulé</h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>
                  Votre abonnement a été annulé et prendra fin le{' '}
                  {currentSubscription.currentPeriodEnd && formatDate(currentSubscription.currentPeriodEnd)}.
                  Vous pouvez le réactiver à tout moment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plans */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Plans disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(plans) && plans.map((plan) => {
            const Icon = getPlanIcon(plan.slug);
            const isCurrentPlan = currentSubscription?.planId === plan.id;
            const features = plan.features || {};

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                  isCurrentPlan ? 'ring-2 ring-primary-600' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${
                      plan.slug === 'free' ? 'bg-gray-100' :
                      plan.slug === 'starter' ? 'bg-blue-100' :
                      plan.slug === 'pro' ? 'bg-purple-100' :
                      'bg-orange-100'
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        plan.slug === 'free' ? 'text-gray-600' :
                        plan.slug === 'starter' ? 'text-blue-600' :
                        plan.slug === 'pro' ? 'text-purple-600' :
                        'text-orange-600'
                      }`} />
                    </div>
                    {isCurrentPlan && (
                      <span className="px-3 py-1 bg-primary-100 text-primary-800 text-xs font-semibold rounded-full">
                        Plan actuel
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  {plan.description && (
                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  )}

                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">
                        {formatCurrency(selectedBillingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly)}
                      </span>
                      <span className="text-gray-600 ml-2">
                        /{selectedBillingCycle === 'monthly' ? 'mois' : 'an'}
                      </span>
                    </div>
                    {selectedBillingCycle === 'yearly' && plan.priceYearly < plan.priceMonthly * 12 && (
                      <p className="text-sm text-green-600 mt-1">
                        Économisez {formatCurrency(plan.priceMonthly * 12 - plan.priceYearly)} par an
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">
                        {plan.maxBetsPerMonth ? `${plan.maxBetsPerMonth} paris par mois` : 'Paris illimités'}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">
                        {plan.maxStorageMb ? `${plan.maxStorageMb} MB de stockage` : 'Stockage illimité'}
                      </span>
                    </li>
                    {features.statistics && (
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">Statistiques avancées</span>
                      </li>
                    )}
                    {features.export && (
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">Export CSV/Excel</span>
                      </li>
                    )}
                    {features.support && (
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">
                          Support {features.support === 'priority' ? 'prioritaire' : 'standard'}
                        </span>
                      </li>
                    )}
                    {features.api && (
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">Accès API</span>
                      </li>
                    )}
                  </ul>

                  {!isCurrentPlan && (
                    <button
                      onClick={() => handleUpgrade(plan)}
                      className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    >
                      {currentSubscription ? 'Changer de plan' : 'Choisir ce plan'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Billing Cycle Toggle */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedBillingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setSelectedBillingCycle('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedBillingCycle === 'yearly'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annuel
              <span className="ml-2 text-xs text-green-600 font-semibold">-20%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Historique des factures</h2>
        </div>
        
        {/* Vue desktop - Tableau */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!Array.isArray(invoices) || invoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="font-medium">Aucune facture disponible</p>
                    <p className="text-sm mt-2">
                      Les factures seront créées automatiquement lors de vos paiements.
                    </p>
                    {currentSubscription && (
                      <p className="text-xs mt-1 text-gray-400">
                        Abonnement actuel : {currentSubscription.plan.name}
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(invoice.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(invoice.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status === 'paid' ? 'Payée' : invoice.status === 'pending' ? 'En attente' : 'Impayée'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDownloadInvoice(invoice)}
                        className="text-primary-600 hover:text-primary-900 inline-flex items-center transition-colors"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Télécharger
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Vue mobile - Cartes */}
        <div className="md:hidden p-4">
          {!Array.isArray(invoices) || invoices.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="font-medium">Aucune facture disponible</p>
              <p className="text-sm mt-2">
                Les factures seront créées automatiquement lors de vos paiements.
              </p>
              {currentSubscription && (
                <p className="text-xs mt-1 text-gray-400">
                  Abonnement actuel : {currentSubscription.plan.name}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-primary-600" />
                      <div className="font-semibold text-gray-900">
                        {formatDate(invoice.createdAt)}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      invoice.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : invoice.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {invoice.status === 'paid' ? 'Payée' : invoice.status === 'pending' ? 'En attente' : 'Impayée'}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-sm text-gray-500">Montant</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(invoice.amount)}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDownloadInvoice(invoice)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Télécharger la facture</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Confirmer le changement</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Vous êtes sur le point de passer au plan <strong>{selectedPlan.name}</strong>.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-semibold">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Facturation:</span>
                  <span className="font-semibold">
                    {selectedBillingCycle === 'monthly' ? 'Mensuelle' : 'Annuelle'}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>
                    {formatCurrency(
                      selectedBillingCycle === 'monthly' ? selectedPlan.priceMonthly : selectedPlan.priceYearly
                    )}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                💡 Mode démo : Le paiement sera simulé pour les tests.
              </p>
            </div>
            <div className="p-6 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                disabled={isProcessing}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmUpgrade}
                disabled={isProcessing}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Traitement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
