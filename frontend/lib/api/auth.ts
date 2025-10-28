import { apiClient } from './client';
import type { LoginResponse, RegisterData, User, TwoFactorRequiredResponse } from '../types';

export const authAPI = {
  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/register', data);
    apiClient.saveAuth(response.access_token, response.refresh_token, response.user);
    return response;
  },

  async login(email: string, password: string, twoFactorCode?: string): Promise<LoginResponse | TwoFactorRequiredResponse> {
    const response = await apiClient.post<LoginResponse | TwoFactorRequiredResponse>('/auth/login', {
      email,
      password,
      twoFactorCode
    });

    // If 2FA is required, return the response without saving auth
    if ('requiresTwoFactor' in response) {
      return response;
    }

    // Otherwise save auth and return
    apiClient.saveAuth(response.access_token, response.refresh_token, response.user);
    return response;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      apiClient.logout();
    }
  },

  async getProfile(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  },

  async refreshToken(): Promise<LoginResponse> {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
    return apiClient.post<LoginResponse>('/auth/refresh', { refresh_token: refreshToken });
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return apiClient.post('/auth/reset-password', { token, newPassword });
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    return apiClient.post('/auth/verify-email', { token });
  },

  async updateProfile(data: { 
    firstName?: string; 
    lastName?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  }): Promise<User> {
    return apiClient.patch<User>('/auth/me', data);
  },

  async enable2FA(): Promise<{ qrCode: string; secret: string }> {
    return apiClient.post('/auth/2fa/enable');
  },

  async verify2FA(code: string): Promise<{ message: string }> {
    return apiClient.post('/auth/2fa/verify', { code });
  },

  async disable2FA(code: string): Promise<{ message: string }> {
    return apiClient.post('/auth/2fa/disable', { code });
  },
};
