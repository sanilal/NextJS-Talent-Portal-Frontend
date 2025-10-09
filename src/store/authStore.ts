import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authAPI } from '@/lib/api/auth';
import type { User, LoginCredentials, RegisterData } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: any }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: any }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (user: User) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authAPI.login(credentials);
          const { user, token } = response;

          // Save token to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
          }

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error: any) {
          const errorMessage = 
            error.response?.data?.message || 
            'Login failed. Please try again.';

          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          });

          return {
            success: false,
            error: error.response?.data || errorMessage,
          };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authAPI.register(userData);
          const { user, token } = response;

          // Save token to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
          }

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            'Registration failed. Please try again.';

          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          });

          return {
            success: false,
            error: error.response?.data || errorMessage,
          };
        }
      },

      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear everything regardless of API response
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      checkAuth: async () => {
        // Only run on client side
        if (typeof window === 'undefined') return;

        const token = localStorage.getItem('token');
        
        if (!token) {
          set({
            isAuthenticated: false,
            user: null,
            token: null,
          });
          return;
        }

        try {
          const user = await authAPI.getCurrentUser();
          
          set({
            user,
            token,
            isAuthenticated: true,
          });
        } catch (error) {
          // Token is invalid, clear auth
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },

      updateUser: (user) => {
        set({ user });
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        // Only use localStorage on client side
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Return dummy storage for server side
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors for easy access
export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectIsLoading = (state: AuthStore) => state.isLoading;
export const selectError = (state: AuthStore) => state.error;