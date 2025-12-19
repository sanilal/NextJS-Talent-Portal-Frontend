import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi } from '@/lib/api/auth';
import type { User, LoginCredentials, RegisterData } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  validationErrors: Record<string, string[]> | null; // ✅ ADDED: Store validation errors
  _hasHydrated: boolean;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: any }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: any; validationErrors?: any }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (user: User) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

// ✅ Helper function to normalize API user response to match User type
const normalizeUser = (apiUser: any): User => {
  return {
    id: typeof apiUser.id === 'string' ? parseInt(apiUser.id) : apiUser.id,
    first_name: apiUser.first_name,
    last_name: apiUser.last_name,
    email: apiUser.email,
    user_type: apiUser.user_type,
    account_status: apiUser.account_status || 'active',
    email_verified_at: apiUser.email_verified_at,
    phone: apiUser.phone,
    date_of_birth: apiUser.date_of_birth,
    gender: apiUser.gender,
    avatar_url: apiUser.avatar_url,
    is_verified: apiUser.is_verified ?? apiUser.email_verified_at !== null,
    is_active: apiUser.is_active ?? true,
    created_at: apiUser.created_at || new Date().toISOString(),
    updated_at: apiUser.updated_at || new Date().toISOString(),
  };
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, _get) => ({
      // Initial State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      validationErrors: null, // ✅ ADDED
      _hasHydrated: false,

      // Actions
      setHasHydrated: (hasHydrated) => {
        console.log('💧 AUTH STORE: setHasHydrated:', hasHydrated);
        set({ _hasHydrated: hasHydrated, isLoading: false });
      },

      login: async (credentials) => {
        console.log('📝 AUTH STORE: login() called');
        console.log('📧 Email:', credentials.email);
        set({ isLoading: true, error: null, validationErrors: null });
        
        try {
          const response = await authApi.login(credentials.email, credentials.password);
          const { user: apiUser, token } = response;

          console.log('✅ AUTH STORE: Login API success');
          console.log('👤 User:', apiUser?.email);
          console.log('🔑 Token:', token ? 'EXISTS' : 'MISSING');

          const user = normalizeUser(apiUser);

          // Save token to localStorage explicitly
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            console.log('💾 Saved to localStorage');
          }

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            validationErrors: null,
          });

          console.log('✅ AUTH STORE: login() complete');
          return { success: true };
        } catch (error: any) {
          console.error('❌ AUTH STORE: Login failed:', error);
          
          const errorMessage = 
            error.response?.data?.message || 
            error.message ||
            'Login failed. Please try again.';

          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null,
            validationErrors: null,
          });

          return {
            success: false,
            error: error,
          };
        }
      },

      register: async (userData) => {
        console.log('📝 AUTH STORE: register() called');
        console.log('📋 Registration data:', userData);
        set({ isLoading: true, error: null, validationErrors: null });

        try {
          const response = await authApi.register(userData);
          const { user: apiUser, token } = response;

          console.log('✅ AUTH STORE: Register API success');

          const user = normalizeUser(apiUser);

          // Save token to localStorage explicitly
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
          }

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            validationErrors: null,
          });

          console.log('✅ AUTH STORE: register() complete');
          return { success: true };
        } catch (error: any) {
          console.error('❌ AUTH STORE: Register failed:', error);
          
          // ✅ IMPROVED: Extract and display all validation errors
          let errorMessage = 'Registration failed. Please try again.';
          let validationErrors = null;
          
          if (error.response?.data?.errors) {
            // Laravel validation errors format: { field: ["error1", "error2"] }
            validationErrors = error.response.data.errors;
            
            // Create a user-friendly error message from validation errors
            const errorMessages: string[] = [];
            Object.entries(validationErrors).forEach(([field, messages]) => {
              if (Array.isArray(messages)) {
                errorMessages.push(...messages);
              }
            });
            
            errorMessage = errorMessages.join(' ');
            
            console.log('🚨 Validation errors:', validationErrors);
            console.log('📝 Error message:', errorMessage);
          } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          set({
            isLoading: false,
            error: errorMessage,
            validationErrors: validationErrors, // ✅ Store validation errors
            isAuthenticated: false,
            user: null,
            token: null,
          });

          return {
            success: false,
            error: error.response?.data || { message: errorMessage },
            validationErrors: validationErrors, // ✅ Return validation errors
          };
        }
      },

      logout: async () => {
        console.log('🚪 AUTH STORE: logout() called');
        console.trace('🔍 Logout called from:');
        
        try {
          await authApi.logout();
          console.log('✅ Logout API call succeeded');
        } catch (error) {
          console.error('⚠️ Logout API call failed:', error);
        } finally {
          // Clear everything regardless of API response
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('auth-storage');
            console.log('🗑️ Cleared localStorage');
          }

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
            validationErrors: null,
            isLoading: false,
          });
          
          console.log('✅ AUTH STORE: logout() complete');
        }
      },

      checkAuth: async () => {
        console.log('🔍 AUTH STORE: checkAuth() called');
        
        // Only run on client side
        if (typeof window === 'undefined') {
          console.log('⚠️ checkAuth() called on server, skipping');
          set({ isLoading: false });
          return;
        }

        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        console.log('🔍 Token exists:', !!token);
        console.log('🔍 Stored user exists:', !!storedUser);
        
        if (!token) {
          console.log('❌ No token found, clearing auth');
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
          });
          return;
        }

        // If we have a token and stored user, set them immediately
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            console.log('✅ Setting auth from localStorage');
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            console.error('❌ Error parsing stored user:', error);
          }
        }

        // Then verify with the server in the background
        console.log('🌐 Verifying auth with backend...');
        try {
          const apiUser = await authApi.getCurrentUser();
          
          console.log('✅ Backend auth verification succeeded');
          
          const user = normalizeUser(apiUser);
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Update stored user
          localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
          console.error('❌ AUTH STORE: Backend auth verification failed:', error);
          console.log('🗑️ Clearing auth due to failed verification');
          
          // Token is invalid, clear auth
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('auth-storage');
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      updateUser: (user) => {
        console.log('👤 AUTH STORE: updateUser() called');
        set({ user });
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user));
        }
      },

      clearError: () => {
        set({ error: null, validationErrors: null });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
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
      onRehydrateStorage: () => {
        console.log('🔄 AUTH STORE: Starting rehydration...');
        return (state, error) => {
          if (error) {
            console.error('❌ AUTH STORE: Rehydration error:', error);
            if (state) {
              state.setHasHydrated(true);
            }
            return;
          }

          if (state) {
            console.log('💧 AUTH STORE: Rehydration complete');
            console.log('📦 Rehydrated state:', {
              hasUser: !!state.user,
              hasToken: !!state.token,
              isAuthenticated: state.isAuthenticated,
            });

            if (state.user && state.token) {
              console.log('✅ Valid auth data found, setting isAuthenticated = true');
              
              // Also sync with localStorage for axios interceptor
              if (typeof window !== 'undefined') {
                localStorage.setItem('token', state.token);
                localStorage.setItem('user', JSON.stringify(state.user));
              }
              
              state.isAuthenticated = true;
            } else {
              console.log('⚠️ No valid auth data found during rehydration');
              state.isAuthenticated = false;
            }

            // Mark as hydrated
            state.setHasHydrated(true);
          }
        };
      },
    }
  )
);

// Selectors for easy access
export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectIsLoading = (state: AuthStore) => state.isLoading;
export const selectError = (state: AuthStore) => state.error;
export const selectValidationErrors = (state: AuthStore) => state.validationErrors; // ✅ ADDED
export const selectHasHydrated = (state: AuthStore) => state._hasHydrated;