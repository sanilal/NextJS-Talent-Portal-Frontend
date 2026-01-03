import api from './axios';
import type {
  LoginResponse,
  RegisterData,
  RegisterResponse,
  VerifyEmailData,
  VerifyEmailResponse,
  ResendOTPResponse,
} from '@/types';

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    try {
      const response = await api.post<RegisterResponse>('/auth/register', data);
      return response.data;
    } catch (error: any) {
      console.error('Register error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Login user
   * Returns 403 with requires_verification if email not verified
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error };
    }
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get('/user');
      return response.data.user || response.data;
    } catch (error: any) {
      console.error('Get current user error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Verify email with OTP
   */
  verifyEmail: async (data: VerifyEmailData): Promise<VerifyEmailResponse> => {
    try {
      const response = await api.post<VerifyEmailResponse>('/auth/email/verify', data);
      return response.data;
    } catch (error: any) {
      console.error('Verify email error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Resend OTP to email
   */
  resendOTP: async (email: string): Promise<ResendOTPResponse> => {
    try {
      const response = await api.post<ResendOTPResponse>('/auth/email/resend', { email });
      return response.data;
    } catch (error: any) {
      console.error('Resend OTP error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Check email verification status
   */
  checkVerificationStatus: async (email: string) => {
    try {
      const response = await api.get(`/auth/email/status?email=${email}`);
      return response.data;
    } catch (error: any) {
      console.error('Check verification status error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Request password reset
   */
  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/auth/password/email', { email });
      return response.data;
    } catch (error: any) {
      console.error('Forgot password error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Reset password with token
   */
  resetPassword: async (
    token: string,
    password: string,
    password_confirmation: string
  ) => {
    try {
      const response = await api.post('/auth/password/reset', {
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

  /**
   * Update user profile
   */
  updateProfile: async (data: any) => {
    try {
      const response = await api.put('/user/profile', data);
      return response.data;
    } catch (error: any) {
      console.error('Update profile error:', error.response?.data || error.message);
      throw error;
    }
  },
};

/**
 * Countries API
 */
export const countriesApi = {
  /**
   * Get all countries
   */
  getAll: async () => {
    try {
      const response = await api.get('/public/countries');
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Get countries error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Search countries
   */
  search: async (query: string) => {
    try {
      const response = await api.get(`/public/countries/search?q=${query}`);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Search countries error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get states for a country
   */
  getStates: async (countryId: number) => {
    try {
      const response = await api.get(`/public/states?country_id=${countryId}`);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Get states error:', error.response?.data || error.message);
      throw error;
    }
  },
};

// ============================================
// ✅ NEW: Named exports for casting calls compatibility
// These are convenience exports that wrap existing functionality
// ============================================

/**
 * Get all countries
 * Wrapper around countriesApi.getAll() for named import compatibility
 */
export const getCountries = () => countriesApi.getAll();

/**
 * Get states by country ID
 * Wrapper around countriesApi.getStates() for named import compatibility
 */
export const getStates = (countryId: number) => countriesApi.getStates(countryId);