import api from './axios';
import type { 
  AuthResponse, 
  LoginCredentials, 
  RegisterData, 
  User,
  ApiResponse 
} from '@/types';

export const authAPI = {
  /**
   * Login user
   */
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register new user
   */
  register: async (userData: RegisterData) => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async () => {
    const response = await api.post<ApiResponse>('/auth/logout');
    return response.data;
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async () => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<User>) => {
    const response = await api.put<User>('/auth/update-profile', data);
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (passwords: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }) => {
    const response = await api.post<ApiResponse>(
      '/auth/change-password',
      passwords
    );
    return response.data;
  },

  /**
   * Send password reset email
   */
  forgotPassword: async (email: string) => {
    const response = await api.post<ApiResponse>('/auth/forgot-password', {
      email,
    });
    return response.data;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data: {
    email: string;
    token: string;
    password: string;
    password_confirmation: string;
  }) => {
    const response = await api.post<ApiResponse>('/auth/reset-password', data);
    return response.data;
  },

  /**
   * Verify email
   */
  verifyEmail: async (token: string) => {
    const response = await api.post<ApiResponse>('/auth/verify-email', {
      token,
    });
    return response.data;
  },

  /**
   * Resend verification email
   */
  resendVerificationEmail: async () => {
    const response = await api.post<ApiResponse>(
      '/auth/resend-verification'
    );
    return response.data;
  },

  /**
   * Enable 2FA
   */
  enable2FA: async () => {
    const response = await api.post<ApiResponse>('/auth/2fa/enable');
    return response.data;
  },

  /**
   * Disable 2FA
   */
  disable2FA: async () => {
    const response = await api.post<ApiResponse>('/auth/2fa/disable');
    return response.data;
  },

  /**
   * Verify 2FA code
   */
  verify2FA: async (code: string) => {
    const response = await api.post<ApiResponse>('/auth/2fa/verify', {
      code,
    });
    return response.data;
  },
};