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
    const response = await apiClient.get<Subscription | { subscription?: Subscription; demoMode?: boolean }>('/subscriptions/current');
    // Check if response has subscription property (wrapped) or is direct subscription
    if (response && typeof response === 'object' && 'subscription' in response) {
      return (response as any).subscription;
    }
    return response as Subscription;
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
    const response = await apiClient.get<{ invoices: Invoice[]; demoMode?: boolean }>('/subscriptions/invoices');
    // Backend returns { invoices: [...], demoMode: true } in demo mode
    return response.invoices || response as any;
  },

  // Get specific invoice
  async getInvoice(id: string): Promise<Invoice> {
    const response = await apiClient.get<{ invoice: Invoice; demoMode?: boolean }>(`/subscriptions/invoices/${id}`);
    // Backend returns { invoice: {...}, demoMode: true } in demo mode
    return response.invoice || response as any;
  },

  // Demo: simulate payment
  async demoPayment(planId: string, billingCycle: 'monthly' | 'yearly'): Promise<Subscription> {
    const response = await apiClient.post<{ subscription: Subscription; demoMode?: boolean; message?: string }>('/subscriptions/demo/payment', { planId, billingCycle });
    // Backend returns { subscription: {...}, demoMode: true, message: '...' }
    return response.subscription || response as any;
  },
};
