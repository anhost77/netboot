import { apiClient } from './client';

export interface AdminOverview {
  users: {
    total: number;
    recent: number;
  };
  bets: {
    total: number;
  };
  revenue: {
    total: number;
  };
  subscriptions: {
    active: number;
  };
  support: {
    openTickets: number;
  };
}

export interface AdminActivity {
  recentBets: any[];
  recentUsers: any[];
  recentTickets: any[];
}

export interface AdminCharts {
  bets: Array<{ month: string; count: number; total_stake: number }>;
  revenue: Array<{ month: string; revenue: number }>;
  users: Array<{ month: string; count: number }>;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  emailVerifiedAt: string | null;
}

export interface AdminUsersResponse {
  data: AdminUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  details: any;
  ipAddress: string;
  createdAt: string;
  admin: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface AuditLogsResponse {
  data: AuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const adminAPI = {
  // Dashboard
  async getOverview(): Promise<AdminOverview> {
    return apiClient.get<AdminOverview>('/admin/dashboard/overview');
  },

  async getActivity(limit: number = 20): Promise<AdminActivity> {
    return apiClient.get<AdminActivity>(`/admin/dashboard/activity?limit=${limit}`);
  },

  async getCharts(months: number = 6): Promise<AdminCharts> {
    return apiClient.get<AdminCharts>(`/admin/dashboard/charts?months=${months}`);
  },

  // Users Management
  async getUsers(page: number = 1, limit: number = 20, search?: string, role?: string): Promise<AdminUsersResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    
    return apiClient.get<AdminUsersResponse>(`/admin/users?${params.toString()}`);
  },

  async updateUserRole(userId: string, role: string): Promise<{ message: string }> {
    return apiClient.patch(`/admin/users/${userId}/role`, { role });
  },

  async deleteUser(userId: string): Promise<{ message: string }> {
    return apiClient.delete(`/admin/users/${userId}`);
  },

  // Audit Logs
  async getAuditLogs(page: number = 1, limit: number = 50, adminId?: string, action?: string): Promise<AuditLogsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (adminId) params.append('adminId', adminId);
    if (action) params.append('action', action);
    
    return apiClient.get<AuditLogsResponse>(`/admin/audit-logs?${params.toString()}`);
  },
};
