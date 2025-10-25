import { apiClient } from './client';

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  maxBetsPerMonth: number | null;
  maxStorageMb: number | null;
  features: any;
  active: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'trial' | 'active' | 'cancelled' | 'expired' | 'past_due';
  billingCycle: 'monthly' | 'yearly';
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
  plan: Plan;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

export const subscriptionsAPI = {
  // Get all available plans
  async getPlans(): Promise<Plan[]> {
    return apiClient.get<Plan[]>('/subscriptions/plans');
  },

  // Get current subscription
  async getCurrentSubscription(): Promise<Subscription> {
    return apiClient.get<Subscription>('/subscriptions/current');
  },

  // Create checkout session
  async createCheckout(planId: string, billingCycle: 'monthly' | 'yearly'): Promise<{ url: string }> {
    return apiClient.post('/subscriptions/checkout', { planId, billingCycle });
  },

  // Change plan
  async changePlan(planId: string): Promise<Subscription> {
    return apiClient.post<Subscription>('/subscriptions/change-plan', { planId });
  },

  // Cancel subscription
  async cancel(): Promise<Subscription> {
    return apiClient.post<Subscription>('/subscriptions/cancel');
  },

  // Resume cancelled subscription
  async resume(): Promise<Subscription> {
    return apiClient.post<Subscription>('/subscriptions/resume');
  },

  // Get invoices
  async getInvoices(): Promise<Invoice[]> {
    return apiClient.get<Invoice[]>('/subscriptions/invoices');
  },

  // Get specific invoice
  async getInvoice(id: string): Promise<Invoice> {
    return apiClient.get<Invoice>(`/subscriptions/invoices/${id}`);
  },

  // Demo: simulate payment
  async demoPayment(planId: string, billingCycle: 'monthly' | 'yearly'): Promise<Subscription> {
    return apiClient.post<Subscription>('/subscriptions/demo/payment', { planId, billingCycle });
  },
};
