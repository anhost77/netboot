import { apiClient } from './client';
import type { BudgetSettings, BudgetOverview, BudgetConsumption } from '../types';

export interface UpdateBudgetSettingsData {
  // Note: initialBankroll and currentBankroll are managed via platforms API
  // These fields are kept for backward compatibility but should not be used
  initialBankroll?: number;
  currentBankroll?: number;
  dailyLimit?: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
  alertThreshold?: number;
}

export interface BudgetConsumptionParams {
  period: 'daily' | 'weekly' | 'monthly';
  startDate?: string;
  endDate?: string;
}

export interface MonthlyBudgetHistory {
  month: string;
  year: number;
  totalStake?: number;
  totalProfit?: number;
  betsCount?: number;
  winRate?: number;
  roi?: number;
}

export const budgetAPI = {
  // Get budget settings
  getSettings: () => 
    apiClient.get<BudgetSettings>('/budget/settings'),

  // Update budget settings
  updateSettings: (data: UpdateBudgetSettingsData) => 
    apiClient.patch<BudgetSettings>('/budget/settings', data),

  // Get budget overview
  getOverview: () => 
    apiClient.get<BudgetOverview>('/budget/overview'),

  // Get budget consumption for a period
  getConsumption: (params: BudgetConsumptionParams) => 
    apiClient.get<BudgetConsumption>('/budget/consumption', { params }),

  // Get monthly budget history
  getHistory: () => 
    apiClient.get<MonthlyBudgetHistory[]>('/budget/history'),
};
