import { apiClient } from './client';

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  changes: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  admin: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
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

export interface AuditLogStats {
  totalLogs: number;
  recentActivity24h: number;
  actionDistribution: {
    action: string;
    count: number;
  }[];
  entityTypeDistribution: {
    entityType: string;
    count: number;
  }[];
  topUsers: {
    userId: string;
    email: string;
    name: string;
    role: string;
    count: number;
  }[];
  activityByHour: {
    hour: number;
    count: number;
  }[];
}

export interface ActivityTimeline {
  date: string;
  count: number;
}

export const adminAuditLogsAPI = {
  getAuditLogs: (params: {
    page?: number;
    limit?: number;
    adminId?: string;
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.adminId) queryParams.append('adminId', params.adminId);
    if (params.action) queryParams.append('action', params.action);
    if (params.entityType) queryParams.append('entityType', params.entityType);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    return apiClient.get<AuditLogsResponse>(`/admin/audit-logs?${queryParams.toString()}`);
  },

  getStats: (startDate?: string, endDate?: string) => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    return apiClient.get<AuditLogStats>(`/admin/audit-logs/stats?${queryParams.toString()}`);
  },

  getTimeline: (days?: number) => {
    const queryParams = new URLSearchParams();
    if (days) queryParams.append('days', days.toString());

    return apiClient.get<ActivityTimeline[]>(`/admin/audit-logs/timeline?${queryParams.toString()}`);
  },
};
