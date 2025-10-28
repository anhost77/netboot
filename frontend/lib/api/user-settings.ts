import { apiClient } from './client';

export type NotificationPreference = 'web_only' | 'email_only' | 'both' | 'none';

export interface UserSettings {
  id: string;
  userId: string;
  initialBankroll: number | null;
  currentBankroll: number | null;
  dailyLimit: number | null;
  weeklyLimit: number | null;
  monthlyLimit: number | null;
  alertThreshold: number | null;
  bankrollMode: 'immediate' | 'on_loss';
  favoriteHippodromes: any;
  notificationsEnabled: boolean;
  emailNotifications: any;
  pushNotificationsEnabled: boolean;
  notificationPreference: NotificationPreference;
  theme: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
}

export const userSettingsAPI = {
  // Get user settings
  async getSettings(): Promise<UserSettings> {
    return apiClient.get<UserSettings>('/user-settings');
  },

  // Update bankroll mode
  async updateBankrollMode(bankrollMode: 'immediate' | 'on_loss'): Promise<{ message: string; bankrollMode: string }> {
    return apiClient.patch('/user-settings/bankroll-mode', { bankrollMode });
  },

  // Update notification preferences
  async updateNotificationPreferences(data: {
    notificationsEnabled?: boolean;
    pushNotificationsEnabled?: boolean;
    notificationPreference?: NotificationPreference;
  }): Promise<{ message: string; settings: any }> {
    return apiClient.patch('/user-settings/notification-preferences', data);
  },

  // Get VAPID public key
  async getVapidPublicKey(): Promise<{ publicKey: string }> {
    return apiClient.get('/user-settings/vapid-public-key');
  },

  // Subscribe to push notifications
  async subscribeToPush(subscription: {
    endpoint: string;
    p256dh: string;
    auth: string;
    userAgent?: string;
  }): Promise<{ message: string; subscription: PushSubscription }> {
    return apiClient.post('/user-settings/push-subscriptions', subscription);
  },

  // Get push subscriptions
  async getPushSubscriptions(): Promise<PushSubscription[]> {
    return apiClient.get('/user-settings/push-subscriptions');
  },

  // Unsubscribe from push notifications
  async unsubscribeFromPush(endpoint: string): Promise<{ message: string }> {
    return apiClient.delete(`/user-settings/push-subscriptions/${encodeURIComponent(endpoint)}`);
  },

  // API Key Management
  async generateApiKey(): Promise<{ message: string; apiKey: string; warning: string }> {
    return apiClient.post('/user-settings/api-key/generate');
  },

  async getApiKey(): Promise<{ hasApiKey: boolean; apiKey?: string; message: string }> {
    return apiClient.get('/user-settings/api-key');
  },

  async revokeApiKey(): Promise<{ message: string }> {
    return apiClient.delete('/user-settings/api-key');
  },
};
