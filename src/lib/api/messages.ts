import api from './axios';
import type { Message, Conversation, ApiResponse, PaginatedResponse } from '@/types';

export const messagesAPI = {
  /**
   * Get all messages
   */
  getMessages: async (params?: any) => {
    const response = await api.get<PaginatedResponse<Message>>('/messages', { params });
    return response.data;
  },

  /**
   * Get conversations list
   */
  getConversations: async () => {
    const response = await api.get<Conversation[]>('/messages/conversations');
    return response.data;
  },

  /**
   * Get conversation with specific user
   */
  getConversation: async (userId: number, params?: any) => {
    const response = await api.get<PaginatedResponse<Message>>(`/messages/conversations/${userId}`, { params });
    return response.data;
  },

  /**
   * Send message
   */
  sendMessage: async (data: {
    receiver_id: number;
    message: string;
  }) => {
    const response = await api.post<Message>('/messages', data);
    return response.data;
  },

  /**
   * Get single message
   */
  getMessage: async (id: number) => {
    const response = await api.get<Message>(`/messages/${id}`);
    return response.data;
  },

  /**
   * Mark message as read
   */
  markAsRead: async (id: number) => {
    const response = await api.put<ApiResponse>(`/messages/${id}/read`);
    return response.data;
  },

  /**
   * Delete message
   */
  deleteMessage: async (id: number) => {
    const response = await api.delete<ApiResponse>(`/messages/${id}`);
    return response.data;
  },
};