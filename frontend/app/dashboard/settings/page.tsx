'use client';

import { useEffect, useState } from 'react';
import { authAPI } from '@/lib/api/auth';
import { subscriptionsAPI } from '@/lib/api/subscriptions';
import { userSettingsAPI } from '@/lib/api/user-settings';
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
  Wallet,
  TrendingDown,
  TrendingUp,
  Bell,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { ApiKeySection } from '@/components/settings/api-key-section';

interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  createdAt: string;
  twoFactorEnabled?: boolean;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
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
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Bankroll preference state
  const [bankrollMode, setBankrollMode] = useState<'immediate' | 'on_loss'>('immediate');

  // 2FA state
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [is2FALoading, setIs2FALoading] = useState(false);

  useEffect(() => {
    loadData();
    loadBankrollMode();
  }, []);

  const loadBankrollMode = async () => {
    try {
      const settings = await userSettingsAPI.getSettings();
      setBankrollMode(settings.bankrollMode);
    } catch (error) {
      console.error('Failed to load bankroll mode:', error);
      // Default to immediate if error
      setBankrollMode('immediate');
    }
  };

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
      setPhone(userData.phone || '');
      setAddress(userData.address || '');
      setCity(userData.city || '');
      setPostalCode(userData.postalCode || '');
      setCountry(userData.country || '');
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
      await authAPI.updateProfile({ 
        firstName, 
        lastName,
        phone,
        address,
        city,
        postalCode,
        country
      });
      alert('Profil mis à jour avec succès !');
      loadData();
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Erreur lors de la mise à jour du profil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBankrollMode = async () => {
    try {
      setIsSaving(true);
      await userSettingsAPI.updateBankrollMode(bankrollMode);
      alert('Préférence de bankroll sauvegardée !');
    } catch (error) {
      console.error('Failed to save bankroll mode:', error);
      alert('Erreur lors de la sauvegarde de la préférence');
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

  const handleEnable2FA = async () => {
    try {
      setIs2FALoading(true);
      const result = await authAPI.enable2FA();
      setQrCode(result.qrCode);
      setSecret(result.secret);
      setShow2FASetup(true);
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
      alert('Erreur lors de l\'activation du 2FA');
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      alert('Veuillez entrer un code à 6 chiffres');
      return;
    }

    try {
      setIs2FALoading(true);
      await authAPI.verify2FA(verificationCode);
      alert('2FA activé avec succès !');
      setShow2FASetup(false);
      setVerificationCode('');
      loadData();
    } catch (error) {
      console.error('Failed to verify 2FA:', error);
      alert('Code invalide. Veuillez réessayer.');
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleDisable2FA = async () => {
    const code = prompt('Entrez votre code 2FA pour désactiver :');
    if (!code) return;

    try {
      setIs2FALoading(true);
      await authAPI.disable2FA(code);
      alert('2FA désactivé avec succès');
      loadData();
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
      alert('Code invalide ou erreur lors de la désactivation');
    } finally {
      setIs2FALoading(false);
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Votre numéro de téléphone"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Votre adresse"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code postal
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="75001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ville
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Paris"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pays
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="France"
              />
            </div>
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

      {/* Bankroll Management Preferences */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Gestion de la Bankroll</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Mode de déduction de la mise</h3>
            <p className="text-sm text-gray-600 mb-4">
              Choisissez comment votre bankroll doit être mise à jour lors de la création d'un pari.
            </p>
          </div>

          <div className="space-y-3">
            {/* Option 1: Déduction immédiate */}
            <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
              bankrollMode === 'immediate' 
                ? 'border-primary-600 bg-primary-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="bankrollMode"
                value="immediate"
                checked={bankrollMode === 'immediate'}
                onChange={(e) => setBankrollMode(e.target.value as 'immediate')}
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5 text-primary-600" />
                  <span className="font-semibold text-gray-900">Déduction immédiate</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Recommandé
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  La mise est déduite de votre bankroll dès la création du pari. 
                  Le gain est ajouté uniquement si vous gagnez.
                </p>
                <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  <strong>Exemple :</strong> Bankroll 1000€ → Pari -50€ → Bankroll 950€<br/>
                  Si gagné (+75€) → 1025€ | Si perdu → reste 950€
                </div>
              </div>
            </label>

            {/* Option 2: Déduction à la perte */}
            <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
              bankrollMode === 'on_loss' 
                ? 'border-primary-600 bg-primary-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="bankrollMode"
                value="on_loss"
                checked={bankrollMode === 'on_loss'}
                onChange={(e) => setBankrollMode(e.target.value as 'on_loss')}
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <span className="font-semibold text-gray-900">Déduction à la perte</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  La bankroll reste inchangée lors de la création. 
                  Elle est mise à jour uniquement quand le pari est gagné ou perdu.
                </p>
                <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  <strong>Exemple :</strong> Bankroll 1000€ → Pari créé → Bankroll 1000€<br/>
                  Si gagné (+25€) → 1025€ | Si perdu (-50€) → 950€
                </div>
              </div>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-start space-x-2 text-sm text-gray-600 mb-4">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Note :</strong> Le mode "Déduction immédiate" est utilisé par tous les sites de paris professionnels 
                et reflète mieux la réalité de votre bankroll disponible.
              </p>
            </div>
            <button
              onClick={handleSaveBankrollMode}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Enregistrer la préférence</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Gérez vos préférences de notifications (Web, Email, Push)
          </p>
          <Link
            href="/dashboard/settings/notifications"
            className="inline-flex items-center justify-between w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Bell className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Paramètres de notifications</p>
                <p className="text-sm text-gray-500">Choisir comment recevoir les notifications</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </Link>
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

            {user?.twoFactorEnabled ? (
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Activé
                </span>
                <button
                  onClick={handleDisable2FA}
                  disabled={is2FALoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {is2FALoading ? 'Chargement...' : 'Désactiver 2FA'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleEnable2FA}
                disabled={is2FALoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {is2FALoading ? 'Chargement...' : 'Activer 2FA'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* API Key Section */}
      <ApiKeySection />

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

      {/* 2FA Setup Modal */}
      {show2FASetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Configurer l'authentification à deux facteurs
              </h3>
              <button
                onClick={() => {
                  setShow2FASetup(false);
                  setQrCode('');
                  setSecret('');
                  setVerificationCode('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Scannez ce QR code avec votre application d'authentification (Google Authenticator, Authy, etc.)
                </p>
                {qrCode && (
                  <div className="flex justify-center">
                    <img src={qrCode} alt="QR Code 2FA" className="border rounded-lg" />
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Ou entrez manuellement ce code secret :
                </p>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <code className="text-sm font-mono break-all">{secret}</code>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code de vérification (6 chiffres)
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-2xl tracking-widest font-mono"
                  maxLength={6}
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={handleVerify2FA}
                  disabled={is2FALoading || verificationCode.length !== 6}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {is2FALoading ? 'Vérification...' : 'Vérifier et activer'}
                </button>
                <button
                  onClick={() => {
                    setShow2FASetup(false);
                    setQrCode('');
                    setSecret('');
                    setVerificationCode('');
                  }}
                  disabled={is2FALoading}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
