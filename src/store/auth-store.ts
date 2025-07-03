import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, HostValidationRequest } from '@/types/auth';
import { apiClient } from '@/lib/api-client';
import Cookies from 'js-cookie';

interface AuthStore extends AuthState {
  login: (credentials: HostValidationRequest) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,

      hydrate: () => {
        const token = Cookies.get('auth-token');
        if (token && !get().isAuthenticated) {
          set({
            isAuthenticated: true,
            token: token,
          });
        }
      },

      login: async (credentials) => {
        set({ isLoading: true });
        
        // Clear any existing cookies first
        Cookies.remove('auth-token');
        
        try {
          const response = await apiClient.validateKey(
            credentials.hostAddress,
            credentials.apiKey
          );
          
          // Only set cookie and state if we get a successful response
          if (response && response.success === true) {
            // Set cookie for server-side authentication
            Cookies.set('auth-token', credentials.apiKey, { 
              expires: 7, // 7 days
              sameSite: 'strict',
              secure: process.env.NODE_ENV === 'production'
            });
            
            set({
              isAuthenticated: true,
              token: credentials.apiKey,
              isLoading: false,
            });
          } else {
            // Clear any existing cookies on failed authentication
            Cookies.remove('auth-token');
            set({ isLoading: false });
            throw new Error('Invalid credentials');
          }
        } catch (error) {
          // Clear any existing cookies on any error
          Cookies.remove('auth-token');
          set({ isLoading: false });
          
          // Provide more specific error messages
          if (error instanceof Error) {
            if (error.message.includes('404') || error.message.includes('Endpoint not found')) {
              throw new Error('Invalid host address or endpoint not found');
            } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
              throw new Error('Invalid API key');
            } else {
              throw new Error(`Authentication failed: ${error.message}`);
            }
          } else {
            throw new Error('Authentication failed');
          }
        }
      },

      logout: () => {
        // Remove cookie
        Cookies.remove('auth-token');
        
        set({
          user: null,
          isAuthenticated: false,
          token: null,
        });
      },

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
    }
  )
);

// Hydrate auth state on app start
if (typeof window !== 'undefined') {
  useAuthStore.getState().hydrate();
} 