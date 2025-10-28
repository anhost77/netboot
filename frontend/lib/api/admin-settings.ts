import { apiClient } from './client';

export interface PlatformSettings {
  siteName: string;
  siteDescription: string;
  siteTagline: string;
  footerText: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  maxBetsPerDay: number;
  maxBetsPerMonth: number;
  minBetAmount: number;
  maxBetAmount: number;
  supportEmail: string;
  contactEmail: string;
  termsUrl: string;
  privacyUrl: string;
  faqUrl: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  features: {
    pmuIntegration: boolean;
    tipstersEnabled: boolean;
    budgetTracking: boolean;
    notifications: boolean;
    twoFactorAuth: boolean;
  };
  limits: {
    freePlanBetsPerMonth: number;
    basicPlanBetsPerMonth: number;
    premiumPlanBetsPerMonth: number;
  };
}

export interface SystemInfo {
  totalUsers: number;
  totalBets: number;
  totalRevenue: number;
  activeSubscriptions: number;
  storageUsed: number;
  uptime: number;
  nodeVersion: string;
  platform: string;
  memory: {
    used: number;
    total: number;
  };
}

export const adminSettingsAPI = {
  getSettings: () => apiClient.get<PlatformSettings>('/admin/settings'),
  
  updateSettings: (settings: Partial<PlatformSettings>) =>
    apiClient.patch<PlatformSettings>('/admin/settings', settings),
  
  resetSettings: () => apiClient.post<PlatformSettings>('/admin/settings/reset', {}),
  
  getSystemInfo: () => apiClient.get<SystemInfo>('/admin/settings/system-info'),
};
