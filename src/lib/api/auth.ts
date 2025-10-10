import api from './axios';

// Match your actual backend response structure
interface LoginResponse {
  token: string;
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
  category_id?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | '';
}

export const authApi = {
  // Login - Just return data, don't touch store
  login: async (email: string, password: string) => {
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

  // Register - Map user_type to role for backend
  register: async (data: RegisterData) => {
    try {
      // Transform the data to match backend expectations
      const requestData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        role: data.user_type, // Backend expects 'role' not 'user_type'
        phone: data.phone,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
      };

      const response = await api.post<LoginResponse>('/auth/register', requestData);

      return response.data;
    } catch (error: any) {
      console.error('Register error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Logout - Just make the API call
  logout: async () => {
    try {
      await api.post('/auth/logout');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error };
    }
  },

  // Get current user - Just return user data
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data.user || response.data;
    } catch (error: any) {
      console.error('Get current user error:', error.response?.data || error.message);
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