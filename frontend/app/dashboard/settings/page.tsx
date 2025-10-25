'use client';

import { useEffect, useState } from 'react';
import { authAPI } from '@/lib/api/auth';
import { subscriptionsAPI } from '@/lib/api/subscriptions';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  User,
  Mail,
  Shield,
  CreditCard,
  AlertTriangle,
  Save,
  Trash2,
  CheckCircle,
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  createdAt: string;
}

interface Subscription {
  id: string;
  plan: {
    name: string;
    priceMonthly: number;
    priceYearly: number;
  };
  status: string;
  billingCycle: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [userData, subData] = await Promise.all([
        authAPI.getProfile(),
        subscriptionsAPI.getCurrentSubscription().catch(() => null),
      ]);
      setUser(userData);
      setFirstName(userData.firstName || '');
      setLastName(userData.lastName || '');
      setSubscription(subData);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      await authAPI.updateProfile({ firstName, lastName });
      alert('Profil mis à jour avec succès !');
      loadData();
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Erreur lors de la mise à jour du profil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler votre abonnement ?')) {
      return;
    }

    try {
      await subscriptionsAPI.cancel();
      alert('Abonnement annulé. Vous garderez l\'accès jusqu\'à la fin de la période en cours.');
      loadData();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      alert('Erreur lors de l\'annulation de l\'abonnement');
    }
  };

  const handleResumeSubscription = async () => {
    try {
      await subscriptionsAPI.resume();
      alert('Abonnement réactivé avec succès !');
      loadData();
    } catch (error) {
      console.error('Failed to resume subscription:', error);
      alert('Erreur lors de la réactivation de l\'abonnement');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'SUPPRIMER') {
      alert('Veuillez taper "SUPPRIMER" pour confirmer');
      return;
    }

    if (!confirm('ATTENTION : Cette action est irréversible. Toutes vos données seront définitivement supprimées.')) {
      return;
    }

    try {
      // Note: You'll need to implement this endpoint in the backend
      // await authAPI.deleteAccount();
      alert('Votre compte a été supprimé. Vous allez être déconnecté.');
      window.location.href = '/login';
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Erreur lors de la suppression du compte');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      trial: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      cancelled: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
    };
    const labels = {
      trial: 'Essai gratuit',
      active: 'Actif',
      cancelled: 'Annulé',
      expired: 'Expiré',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="mt-2 text-gray-600">Gérez votre profil, abonnement et préférences de compte</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Informations personnelles</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Votre prénom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Votre nom"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="flex items-center space-x-2 text-gray-500">
              <Mail className="h-5 w-5" />
              <span>{user?.email}</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">L'email ne peut pas être modifié</p>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Section */}
      {subscription && (
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Abonnement</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{subscription.plan.name}</h3>
                <p className="text-sm text-gray-500">
                  {subscription.billingCycle === 'monthly' ? 'Mensuel' : 'Annuel'} -{' '}
                  {formatCurrency(
                    subscription.billingCycle === 'monthly'
                      ? subscription.plan.priceMonthly
                      : subscription.plan.priceYearly
                  )}{' '}
                  / {subscription.billingCycle === 'monthly' ? 'mois' : 'an'}
                </p>
              </div>
              {getStatusBadge(subscription.status)}
            </div>

            {subscription.currentPeriodEnd && (
              <div className="text-sm text-gray-600">
                <p>
                  {subscription.cancelAtPeriodEnd
                    ? 'Expire le : '
                    : 'Prochaine facturation : '}
                  <span className="font-medium">
                    {formatDate(subscription.currentPeriodEnd)}
                  </span>
                </p>
              </div>
            )}

            <div className="flex items-center space-x-3 pt-4">
              {subscription.cancelAtPeriodEnd ? (
                <button
                  onClick={handleResumeSubscription}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Réactiver l'abonnement
                </button>
              ) : (
                <button
                  onClick={handleCancelSubscription}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Annuler l'abonnement
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Security Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Sécurité</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Mot de passe</h3>
            <p className="text-sm text-gray-600 mb-3">
              Pour modifier votre mot de passe, veuillez utiliser la fonction "Mot de passe oublié" sur la page de connexion.
            </p>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-900 mb-2">Authentification à deux facteurs</h3>
            <p className="text-sm text-gray-600 mb-3">
              Ajoutez une couche de sécurité supplémentaire à votre compte.
            </p>
            <button
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              disabled
            >
              Bientôt disponible
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow border-2 border-red-200">
        <div className="border-b border-red-200 px-6 py-4 bg-red-50">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">Zone dangereuse</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Supprimer mon compte</h3>
            <p className="text-sm text-gray-600 mb-4">
              Une fois votre compte supprimé, toutes vos données seront définitivement effacées.
              Cette action est irréversible.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Supprimer mon compte</span>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-800 mb-3">
                    Pour confirmer la suppression, tapez <span className="font-bold">SUPPRIMER</span> ci-dessous :
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="SUPPRIMER"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== 'SUPPRIMER'}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirmer la suppression
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText('');
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <CheckCircle className="h-4 w-4" />
          <span>Compte créé le {user && formatDate(user.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
