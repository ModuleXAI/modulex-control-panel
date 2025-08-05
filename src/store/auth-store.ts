import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, LoginCredentials } from '@/types/auth';
import { apiClient } from '@/lib/api-client';
import { tokenManager } from '@/lib/token-manager';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: { email: string; password: string; username?: string }) => Promise<void>;
  checkUnique: (data: { username?: string; email?: string }) => Promise<{ username_available: boolean | null; email_available: boolean | null }>;
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
      accessToken: null,
      refreshToken: null,
      hostAddress: null,

      hydrate: () => {
        const currentState = get();
        const isTokenManagerAuthenticated = tokenManager.isAuthenticated();
        const hostAddress = tokenManager.getHostAddress();
        
        console.log('🔄 Auth store hydration:', {
          isTokenManagerAuthenticated,
          hasHostAddress: !!hostAddress,
          currentlyAuthenticated: currentState.isAuthenticated,
          accessToken: !!tokenManager.getAccessToken(),
          refreshToken: !!tokenManager.getRefreshToken()
        });
        
        if (isTokenManagerAuthenticated && hostAddress && !currentState.isAuthenticated) {
          console.log('✅ Hydrating auth state from TokenManager');
          set({
            isAuthenticated: true,
            accessToken: tokenManager.getAccessToken(),
            refreshToken: tokenManager.getRefreshToken(),
            hostAddress: hostAddress,
          });
        } else {
          console.log('⚠️ Auth hydration skipped - missing requirements');
        }
      },

      login: async (credentials) => {
        set({ isLoading: true });
        
        try {
          // Use token manager for login
          const authResponse = await tokenManager.login(credentials);
          
          console.log('✅ Login successful');
          
          set({
            user: authResponse.user,
            isAuthenticated: true,
            accessToken: authResponse.access_token,
            refreshToken: authResponse.refresh_token,
            hostAddress: tokenManager.getHostAddress(), // Get from token manager instead of env
            isLoading: false,
          });

          // Note: Organization fetching will be handled by DashboardLayout
          
        } catch (error) {
          console.error('❌ Login failed:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        
        try {
          console.log('🔐 Attempting registration with:', {
            email: data.email,
            username: data.username
          });
          
          const authResponse = await apiClient.register(data);
          
          console.log('✅ Registration successful', {
            hasAccessToken: !!authResponse.access_token,
            hasRefreshToken: !!authResponse.refresh_token,
            hasUser: !!authResponse.user
          });
          
          // Store tokens in token manager
          tokenManager.setTokens(
            authResponse.access_token,
            authResponse.refresh_token
          );
          
          // Ensure base URL is set before saving host address
          const currentHost = process.env.NEXT_PUBLIC_MODULEX_HOST;
          if (currentHost) {
            tokenManager.setBaseUrl(currentHost);
            
            // Save the base URL to cookie for persistence (same as login)
            const isProduction = process.env.NODE_ENV === 'production';
            Cookies.set('host-address', currentHost, {
              expires: 7,
              sameSite: 'strict',
              secure: isProduction
            });
            console.log('🍪 Host address cookie set:', currentHost);
          } else {
            console.error('❌ NEXT_PUBLIC_MODULEX_HOST not set');
          }
          
          // Check if tokens are properly stored
          const storedAccessToken = Cookies.get('access-token');
          const storedRefreshToken = Cookies.get('refresh-token');
          const storedHostAddress = Cookies.get('host-address');
          
          console.log('🍪 Cookies after registration:', {
            hasAccessToken: !!storedAccessToken,
            hasRefreshToken: !!storedRefreshToken,
            hasHostAddress: !!storedHostAddress,
            accessTokenPreview: storedAccessToken ? storedAccessToken.substring(0, 20) + '...' : null
          });
          
          set({
            user: authResponse.user,
            isAuthenticated: true,
            accessToken: authResponse.access_token,
            refreshToken: authResponse.refresh_token,
            hostAddress: currentHost || tokenManager.getHostAddress(),
            isLoading: false,
          });
          
          console.log('🔄 Auth state updated:', {
            isAuthenticated: true,
            hasUser: !!authResponse.user,
            hostAddress: tokenManager.getHostAddress()
          });

          toast.success('Registration successful!', {
            description: 'Welcome to ModuleX Control Panel',
            duration: 3000,
          });
          
        } catch (error) {
          console.error('❌ Registration failed:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      checkUnique: async (data) => {
        try {
          console.log('🔍 Checking uniqueness for:', data);
          const result = await apiClient.checkUnique(data);
          console.log('✅ Uniqueness check result:', result);
          return result;
        } catch (error) {
          console.error('❌ Uniqueness check failed:', error);
          throw error;
        }
      },

      logout: () => {
        console.log('🚪 Logout initiated from auth store');
        
        // Show logout toast
        toast.success('Logged out successfully', {
          description: 'You have been logged out securely',
          duration: 2000,
        });
        
        // Use token manager for logout
        tokenManager.logout();
        
        // Clear auth store state
        set({
          user: null,
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          hostAddress: null,
          isLoading: false,
        });

        // Clear organization store
        if (typeof window !== 'undefined') {
          try {
            // Clear organization store by importing it dynamically
            import('@/store/organization-store').then(({ useOrganizationStore }) => {
              useOrganizationStore.getState().clearOrganizations();
            });
          } catch (error) {
          }
        }
        
        console.log('✅ Auth store state cleared');
        
        // Force redirect to login page
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      },

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        hostAddress: state.hostAddress,
      }),
    }
  )
);

// Hydrate auth state on app start
if (typeof window !== 'undefined') {
  useAuthStore.getState().hydrate();
} 