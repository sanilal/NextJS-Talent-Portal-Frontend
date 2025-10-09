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
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }
          break;

        case 403:
          // Forbidden
          console.error('Access forbidden');
          break;

        case 404:
          // Not found
          console.error('Resource not found');
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
          console.error('Server error. Please try again later.');
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