import api from './axios';
import type { Notification, ApiResponse, PaginatedResponse } from '@/types';

export const notificationsAPI = {
  /**
   * Get all notifications
   */
  getNotifications: async (params?: any) => {
    const response = await api.get<PaginatedResponse<Notification>>('/notifications', { params });
    return response.data;
  },

  /**
   * Get unread count
   */
  getUnreadCount: async () => {
    const response = await api.get<{ count: number }>('/notifications/unread');
    return response.data;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: string) => {
    const response = await api.post<ApiResponse>(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all as read
   */
  markAllAsRead: async () => {
    const response = await api.post<ApiResponse>('/notifications/read-all');
    return response.data;
  },

  /**
   * Delete notification
   */
  deleteNotification: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/notifications/${id}`);
    return response.data;
  },
};