// lib/api/auth.ts
import api from './axios';
import { useAuthStore } from '@/store/authStore';

// Match your actual backend response structure
interface LoginResponse {
  token: string;  // Your backend uses "token" not "access_token"
  token_type: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    user_type: 'talent' | 'recruiter';
    email_verified_at?: string;
    phone?: string;
    bio?: string;
    location?: string;
    account_status: string;
    is_verified: boolean;
    talent_profile?: any;
    recruiter_profile?: any;
  };
  message: string;
}

interface RegisterData {
  email: string;
  password: string;
  password_confirmation: string;
  first_name: string;
  last_name: string;
  user_type: 'talent' | 'recruiter';
  phone?: string;
}

export const authApi = {
  // Login
  login: async (email: string, password: string) => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;

      // Store token and user in auth store
      useAuthStore.getState().setToken(token);
      useAuthStore.getState().setUser(user);

      return response.data;
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Register
  register: async (data: RegisterData) => {
    try {
      const response = await api.post<LoginResponse>('/auth/register', data);

      const { token, user } = response.data;

      // Store token and user
      useAuthStore.getState().setToken(token);
      useAuthStore.getState().setUser(user);

      return response.data;
    } catch (error: any) {
      console.error('Register error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear auth state regardless of API response
      useAuthStore.getState().clearAuth();
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      
      // Update user in store
      useAuthStore.getState().setUser(response.data.user || response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Get current user error:', error.response?.data || error.message);
      
      // If unauthorized, clear auth
      if (error.response?.status === 401) {
        useAuthStore.getState().clearAuth();
      }
      
      throw error;
    }
  },

  // Request password reset
  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      console.error('Forgot password error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token: string, password: string, password_confirmation: string) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password,
        password_confirmation,
      });
      return response.data;
    } catch (error: any) {
      console.error('Reset password error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Verify email
  verifyEmail: async (token: string) => {
    try {
      const response = await api.post('/auth/verify-email', { token });
      return response.data;
    } catch (error: any) {
      console.error('Verify email error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Resend verification email
  resendVerification: async () => {
    try {
      const response = await api.post('/auth/resend-verification');
      return response.data;
    } catch (error: any) {
      console.error('Resend verification error:', error.response?.data || error.message);
      throw error;
    }
  },
};