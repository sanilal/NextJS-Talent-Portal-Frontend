import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (only on client side)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      console.log('🔑 API Request:', config.url);
      console.log('🔑 Token being sent:', token ? 'YES' : 'NO'); 
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle specific error codes
    if (error.response) {
      const url = error.config?.url || '';
      
      switch (error.response.status) {
        case 401:
          console.log('❌ 401 Error on:', url);
          
          // ✅ CRITICAL FIX: Only clear auth for actual auth endpoints
          // Don't clear auth for data/resource endpoints (dashboard, projects, etc.)
          const isAuthEndpoint = url.includes('/auth/login') || 
                                url.includes('/auth/register') || 
                                url.includes('/auth/me') ||
                                url.includes('/auth/verify') ||
                                url.includes('/auth/refresh');
          
          if (isAuthEndpoint) {
            console.log('🔒 Auth endpoint failed - clearing auth');
            // Unauthorized on auth endpoints - clear auth and redirect
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('auth-storage');
              
              // Only redirect if not already on login page
              if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
              }
            }
          } else {
            // 401 on data endpoints - just log it, don't clear auth
            console.log('⚠️ Data endpoint returned 401 - NOT clearing auth');
            console.log('💡 This is likely a backend API issue, not an auth problem');
          }
          break;

        case 403:
          // Forbidden - permission issue, NOT auth issue
          console.log('🚫 403 Forbidden on:', url);
          console.log('💡 You are authenticated but lack permission for this resource');
          break;

        case 404:
          // Not found
          console.error('Resource not found:', url);
          break;

        case 422:
          // Validation error
          console.error('Validation failed', error.response.data);
          break;

        case 429:
          // Too many requests
          console.error('Too many requests. Please try again later.');
          break;

        case 500:
        case 502:
        case 503:
          // Server errors
          console.error('Server error on:', url);
          break;

        default:
          console.error('An error occurred:', error.message);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network error. Please check your connection.');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Helper function for file uploads
export const uploadFile = async (
  endpoint: string,
  formData: FormData,
  config?: AxiosRequestConfig
) => {
  return api.post(endpoint, formData, {
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...config?.headers,
    },
  });
};

// Helper function to handle API errors
export const handleApiError = (error: any) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    const firstError = Object.values(errors)[0];
    return Array.isArray(firstError) ? firstError[0] : firstError;
  }

  return error.message || 'An unexpected error occurred';
};

export default api;