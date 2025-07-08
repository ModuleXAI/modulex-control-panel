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
  hostAddress: string | null;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,
      hostAddress: null,

      hydrate: () => {
        const token = Cookies.get('auth-token');
        const hostAddress = Cookies.get('host-address');
        const currentState = get();
        
        console.log('🔄 Hydrating auth store:', { 
          hasToken: !!token, 
          hasHost: !!hostAddress,
          currentIsAuthenticated: currentState.isAuthenticated,
          tokenPreview: token?.substring(0, 10) + '...',
          hostAddress
        });
        
        if (token && hostAddress && !currentState.isAuthenticated) {
          // Set API client credentials immediately
          console.log('🔧 Setting API client credentials during hydration');
          apiClient.setCredentials(hostAddress, token);
          
          set({
            isAuthenticated: true,
            token: token,
            hostAddress: hostAddress,
          });
          
          console.log('✅ Auth state updated after hydration');
        } else {
          console.log('❌ Hydration skipped:', {
            hasToken: !!token,
            hasHost: !!hostAddress,
            alreadyAuthenticated: currentState.isAuthenticated
          });
        }
      },

      login: async (credentials) => {
        set({ isLoading: true });
        
        try {
          // Set credentials for validation
          apiClient.setCredentials(credentials.hostAddress, credentials.apiKey);
          
          // Validate credentials
          const response = await apiClient.validateKey(credentials.hostAddress, credentials.apiKey);
          
          // Only set cookie and state if we get a successful response
          if (response && response.success === true) {
            // Set cookies for server-side authentication
            Cookies.set('auth-token', credentials.apiKey, { 
              expires: 7, // 7 days
              sameSite: 'strict',
              secure: process.env.NODE_ENV === 'production'
            });
            
            Cookies.set('host-address', credentials.hostAddress, { 
              expires: 7, // 7 days
              sameSite: 'strict',
              secure: process.env.NODE_ENV === 'production'
            });
            
            console.log('✅ Login successful, credentials stored');
            
            set({
              isAuthenticated: true,
              token: credentials.apiKey,
              hostAddress: credentials.hostAddress,
              isLoading: false,
            });
          } else {
            // Clear any existing cookies on failed authentication
            Cookies.remove('auth-token');
            Cookies.remove('host-address');
            set({ isLoading: false });
            throw new Error('Invalid credentials');
          }
        } catch (error) {
          // Clear any existing cookies on any error
          Cookies.remove('auth-token');
          Cookies.remove('host-address');
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        // Remove cookies
        Cookies.remove('auth-token');
        Cookies.remove('host-address');
        
        console.log('🚪 Logout - clearing auth state');
        
        set({
          user: null,
          isAuthenticated: false,
          token: null,
          hostAddress: null,
        });
      },

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        hostAddress: state.hostAddress,
      }),
    }
  )
);

// Hydrate auth state on app start
if (typeof window !== 'undefined') {
  useAuthStore.getState().hydrate();
} 