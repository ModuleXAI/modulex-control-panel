import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, LoginCredentials } from '@/types/auth';
import { tokenManager } from '@/lib/token-manager';

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
        
        console.log('🔄 Hydrating auth store:', { 
          isTokenManagerAuthenticated,
          hasHost: !!hostAddress,
          currentIsAuthenticated: currentState.isAuthenticated,
          hostAddress
        });
        
        if (isTokenManagerAuthenticated && hostAddress && !currentState.isAuthenticated) {
          console.log('✅ Auth state updated after hydration');
          
          set({
            isAuthenticated: true,
            accessToken: tokenManager.getAccessToken(),
            refreshToken: tokenManager.getRefreshToken(),
            hostAddress: hostAddress,
          });
        } else {
          console.log('❌ Hydration skipped:', {
            isTokenManagerAuthenticated,
            hasHost: !!hostAddress,
            alreadyAuthenticated: currentState.isAuthenticated
          });
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
            hostAddress: process.env.NEXT_PUBLIC_MODULEX_HOST || null,
            isLoading: false,
          });
        } catch (error) {
          console.error('❌ Login failed:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        console.log('🚪 Logout - clearing auth state');
        
        // Use token manager for logout
        tokenManager.logout();
        
        set({
          user: null,
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
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