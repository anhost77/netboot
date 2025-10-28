import { apiClient } from './client';

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
  maxBetsPerMonth: number | null;
  maxStorageMb: number | null;
  features: any;
  active: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  subscribersCount?: number;
}

export interface PlanStats {
  totalPlans: number;
  activePlans: number;
  totalSubscriptions: number;
  totalRevenue: number;
  planDistribution: {
    planId: string;
    planName: string;
    subscribers: number;
  }[];
}

export interface CreatePlanData {
  name: string;
  slug: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  maxBetsPerMonth?: number;
  maxStorageMb?: number;
  features?: any;
  displayOrder?: number;
}

export interface UpdatePlanData {
  name?: string;
  slug?: string;
  description?: string;
  priceMonthly?: number;
  priceYearly?: number;
  maxBetsPerMonth?: number;
  maxStorageMb?: number;
  features?: any;
  active?: boolean;
  displayOrder?: number;
}

export const adminPlansAPI = {
  getAllPlans: () => apiClient.get<Plan[]>('/admin/plans'),
  
  getPlanStats: () => apiClient.get<PlanStats>('/admin/plans/stats'),
  
  getPlan: (id: string) => apiClient.get<Plan>(`/admin/plans/${id}`),
  
  createPlan: (data: CreatePlanData) => apiClient.post<Plan>('/admin/plans', data),
  
  updatePlan: (id: string, data: UpdatePlanData) => 
    apiClient.patch<Plan>(`/admin/plans/${id}`, data),
  
  togglePlanStatus: (id: string) => 
    apiClient.patch<Plan>(`/admin/plans/${id}/toggle`, {}),
  
  deletePlan: (id: string) => 
    apiClient.delete(`/admin/plans/${id}`),
};
