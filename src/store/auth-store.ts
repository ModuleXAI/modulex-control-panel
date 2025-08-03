import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, LoginCredentials } from '@/types/auth';
import { tokenManager } from '@/lib/token-manager';
import { toast } from 'sonner';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
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
        
        
        if (isTokenManagerAuthenticated && hostAddress && !currentState.isAuthenticated) {
          
          set({
            isAuthenticated: true,
            accessToken: tokenManager.getAccessToken(),
            refreshToken: tokenManager.getRefreshToken(),
            hostAddress: hostAddress,
          });
        } else {
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