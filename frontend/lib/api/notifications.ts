import { apiClient } from './client';

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  link?: string;
  readAt?: string;
  createdAt: string;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  type?: 'info' | 'success' | 'warning' | 'error';
  read?: boolean;
}

export interface PaginatedNotifications {
  data: Notification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const notificationsAPI = {
  // Get all notifications with filters
  async getAll(filters?: NotificationFilters): Promise<PaginatedNotifications> {
    return apiClient.get<PaginatedNotifications>('/notifications', { params: filters });
  },

  // Get unread count
  async getUnreadCount(): Promise<{ count: number }> {
    return apiClient.get<{ count: number }>('/notifications/unread-count');
  },

  // Mark notification as read
  async markAsRead(id: string): Promise<Notification> {
    return apiClient.patch<Notification>(`/notifications/${id}/read`);
  },

  // Mark all as read
  async markAllAsRead(): Promise<{ message: string; count: number }> {
    return apiClient.patch<{ message: string; count: number }>('/notifications/mark-all-read');
  },

  // Delete a notification
  async delete(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/notifications/${id}`);
  },

  // Clear all read notifications
  async clearRead(): Promise<{ message: string; count: number }> {
    return apiClient.delete<{ message: string; count: number }>('/notifications/clear/read');
  },

  // Clear all notifications
  async clearAll(): Promise<{ message: string; count: number }> {
    return apiClient.delete<{ message: string; count: number }>('/notifications/clear/all');
  },
};
