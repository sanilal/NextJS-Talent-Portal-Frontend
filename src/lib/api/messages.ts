import api from './axios';
import type { Message, Conversation, ApiResponse, PaginatedResponse } from '@/types';

// Response wrapper types for messages API
interface ConversationsResponse {
  conversations: Conversation[];
}

interface ConversationMessagesResponse {
  data: Message[];  // Backend wraps in 'data' key
}

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
   * Returns: { conversations: Conversation[] }
   */
  getConversations: async (): Promise<ConversationsResponse> => {
    const response = await api.get<ConversationsResponse>('/messages/conversations');
    return response.data;
  },

  /**
   * Get conversation with specific user
   * Returns: { data: Message[] }
   */
  getConversation: async (userId: number, params?: any): Promise<ConversationMessagesResponse> => {
    const response = await api.get<ConversationMessagesResponse>(`/messages/conversations/${userId}`, { params });
    return response.data;
  },

  /**
   * Send message
   */
  sendMessage: async (data: {
    receiver_id: number;
    message: string;
  }) => {
    const response = await api.post<{ message: string; data: Message }>('/messages', data);
    return response.data;
  },

  /**
   * Get single message
   */
  getMessage: async (id: number) => {
    const response = await api.get<{ data: Message }>(`/messages/${id}`);
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