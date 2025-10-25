import { apiClient } from './client';
import type { LoginResponse, RegisterData, User } from '../types';

export const authAPI = {
  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/register', data);
    apiClient.saveAuth(response.access_token, response.refresh_token, response.user);
    return response;
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
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

  async updateProfile(data: { firstName?: string; lastName?: string }): Promise<User> {
    return apiClient.patch<User>('/auth/me', data);
  },
};
