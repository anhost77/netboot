'use client';

import { useEffect, useState } from 'react';
import { userSettingsAPI, type NotificationPreference } from '@/lib/api/user-settings';
import { pushNotificationService } from '@/lib/push-notification-service';
import { notificationService } from '@/lib/notification-service';
import { Bell, Mail, Smartphone, BellOff, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function NotificationSettingsPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [preference, setPreference] = useState<NotificationPreference>('web_only');
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
    checkPushSupport();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const settings = await userSettingsAPI.getSettings();
      setNotificationsEnabled(settings.notificationsEnabled);
      setPushEnabled(settings.pushNotificationsEnabled);
      setPreference(settings.notificationPreference);
    } catch (error) {
      console.error('Failed to load settings:', error);
      notificationService.error('Erreur', 'Impossible de charger les paramètres');
    } finally {
      setIsLoading(false);
    }
  };

  const checkPushSupport = async () => {
    const supported = pushNotificationService.isSupported();
    setIsPushSupported(supported);

    if (supported) {
      const subscribed = await pushNotificationService.isSubscribed();
      setIsPushSubscribed(subscribed);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await userSettingsAPI.updateNotificationPreferences({
        notificationsEnabled,
        pushNotificationsEnabled: pushEnabled,
        notificationPreference: preference,
      });

      notificationService.success(
        'Paramètres sauvegardés',
        'Vos préférences de notifications ont été mises à jour'
      );
    } catch (error) {
      console.error('Failed to save settings:', error);
      notificationService.error('Erreur', 'Impossible de sauvegarder les paramètres');
    } finally {
      setSaving(false);
    }
  };

  const handleEnablePush = async () => {
    try {
      if (pushNotificationService.isDenied()) {
        notificationService.warning(
          'Permission refusée',
          'Vous avez bloqué les notifications. Veuillez les autoriser dans les paramètres de votre navigateur.'
        );
        return;
      }

      await pushNotificationService.subscribe();
      setPushEnabled(true);
      setIsPushSubscribed(true);
      
      notificationService.success(
        'Notifications push activées !',
        'Vous recevrez maintenant des notifications push'
      );
    } catch (error) {
      console.error('Failed to enable push:', error);
      notificationService.error(
        'Erreur',
        'Impossible d\'activer les notifications push'
      );
    }
  };

  const handleDisablePush = async () => {
    try {
      await pushNotificationService.unsubscribe();
      setPushEnabled(false);
      setIsPushSubscribed(false);
      
      notificationService.info(
        'Notifications push désactivées',
        'Vous ne recevrez plus de notifications push'
      );
    } catch (error) {
      console.error('Failed to disable push:', error);
      notificationService.error(
        'Erreur',
        'Impossible de désactiver les notifications push'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Bell className="h-8 w-8 mr-3 text-primary-600" />
          Paramètres de notifications
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Gérez comment vous souhaitez recevoir les notifications
        </p>
      </div>

      {/* Notification Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Activer les notifications</h3>
            <p className="text-sm text-gray-600 mt-1">
              Recevoir des notifications pour les événements importants
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>
      </div>

      {/* Notification Preference */}
      {notificationsEnabled && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Type de notifications</h3>
          
          <div className="space-y-3">
            {/* Web Only */}
            <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="preference"
                value="web_only"
                checked={preference === 'web_only'}
                onChange={(e) => setPreference(e.target.value as NotificationPreference)}
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="font-medium text-gray-900">Web uniquement</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Notifications visibles uniquement dans l'application web
                </p>
              </div>
            </label>

            {/* Email Only */}
            <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="preference"
                value="email_only"
                checked={preference === 'email_only'}
                onChange={(e) => setPreference(e.target.value as NotificationPreference)}
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-green-500 mr-2" />
                  <span className="font-medium text-gray-900">Email uniquement</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Recevoir les notifications par email seulement
                </p>
              </div>
            </label>

            {/* Both */}
            <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="preference"
                value="both"
                checked={preference === 'both'}
                onChange={(e) => setPreference(e.target.value as NotificationPreference)}
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center">
                  <Smartphone className="h-5 w-5 text-purple-500 mr-2" />
                  <span className="font-medium text-gray-900">Les deux (Web + Email + Push)</span>
                  <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                    Recommandé
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Recevoir les notifications sur tous les canaux disponibles
                </p>
              </div>
            </label>

            {/* None */}
            <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="preference"
                value="none"
                checked={preference === 'none'}
                onChange={(e) => setPreference(e.target.value as NotificationPreference)}
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center">
                  <BellOff className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="font-medium text-gray-900">Aucune</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Désactiver toutes les notifications
                </p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Push Notifications */}
      {notificationsEnabled && preference !== 'email_only' && preference !== 'none' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications Push</h3>
          
          {!isPushSupported ? (
            <div className="flex items-start p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Notifications push non supportées
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Votre navigateur ne supporte pas les notifications push
                </p>
              </div>
            </div>
          ) : isPushSubscribed ? (
            <div className="space-y-4">
              <div className="flex items-start p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">
                    Notifications push activées
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Vous recevez les notifications push sur cet appareil
                  </p>
                </div>
              </div>
              <button
                onClick={handleDisablePush}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Désactiver les notifications push
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <XCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">
                    Notifications push désactivées
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Activez les notifications push pour recevoir des alertes même quand l'application est fermée
                  </p>
                </div>
              </div>
              <button
                onClick={handleEnablePush}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors inline-flex items-center"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Activer les notifications push
              </button>
            </div>
          )}
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
        >
          {isSaving ? (
            <>
              <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></div>
              Enregistrement...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Enregistrer les paramètres
            </>
          )}
        </button>
      </div>
    </div>
  );
}
