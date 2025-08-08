import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, LoginCredentials } from '@/types/auth';
import { apiClient } from '@/lib/api-client';
import { tokenManager } from '@/lib/token-manager';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { isSupabaseProvider } from '@/lib/auth-provider';
import { getSupabaseClient, handleSessionChange } from '@/lib/supabase-client';

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

      hydrate: async () => {
        const currentState = get();
        if (isSupabaseProvider()) {
          const supabase = getSupabaseClient();
          if (!supabase) return;
          const { data } = await supabase.auth.getSession();
          handleSessionChange(data.session ?? null);
        }

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
          const authResponse = await tokenManager.login(credentials);
          console.log('✅ Login successful');
          set({
            user: authResponse.user,
            isAuthenticated: true,
            accessToken: authResponse.access_token,
            refreshToken: authResponse.refresh_token,
            hostAddress: tokenManager.getHostAddress(),
            isLoading: false,
          });
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

          if (isSupabaseProvider()) {
            const supabase = getSupabaseClient();
            if (!supabase) throw new Error('Supabase client not initialized');
            const { data: signUpData, error } = await supabase.auth.signUp({
              email: data.email,
              password: data.password,
              options: {
                data: data.username ? { username: data.username } : undefined,
              },
            });
            if (error) throw error;
            const session = signUpData.session; // may be null if email confirmation required
            if (session) {
              tokenManager.setTokens(session.access_token, session.refresh_token as string);
              if (process.env.NEXT_PUBLIC_MODULEX_HOST) {
                tokenManager.setBaseUrl(process.env.NEXT_PUBLIC_MODULEX_HOST);
              }
              set({
                user: {
                  id: session.user.id,
                  email: session.user.email || '',
                  name: session.user.user_metadata?.name || session.user.email || '',
                  role: 'user',
                  createdAt: session.user.created_at || new Date().toISOString(),
                } as User,
                isAuthenticated: true,
                accessToken: session.access_token,
                refreshToken: session.refresh_token as string,
                hostAddress: tokenManager.getHostAddress(),
                isLoading: false,
              });
              toast.success('Registration successful!', {
                description: 'Welcome to ModuleX Control Panel',
                duration: 3000,
              });
            } else {
              set({ isLoading: false });
              toast.success('Check your email to confirm your account', { duration: 3000 });
            }
          } else {
            const authResponse = await apiClient.register(data);
            tokenManager.setTokens(
              authResponse.access_token,
              authResponse.refresh_token
            );
            const currentHost = process.env.NEXT_PUBLIC_MODULEX_HOST;
            if (currentHost) {
              tokenManager.setBaseUrl(currentHost);
              const isProduction = process.env.NODE_ENV === 'production';
              Cookies.set('host-address', currentHost, {
                expires: 7,
                sameSite: 'strict',
                secure: isProduction
              });
            }
            set({
              user: authResponse.user,
              isAuthenticated: true,
              accessToken: authResponse.access_token,
              refreshToken: authResponse.refresh_token,
              hostAddress: currentHost || tokenManager.getHostAddress(),
              isLoading: false,
            });
            toast.success('Registration successful!', {
              description: 'Welcome to ModuleX Control Panel',
              duration: 3000,
            });
          }
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

      logout: async () => {
        console.log('🚪 Logout initiated from auth store');
        toast.success('Logged out successfully', {
          description: 'You have been logged out securely',
          duration: 2000,
        });
        if (isSupabaseProvider()) {
          try {
            const supabase = getSupabaseClient();
            if (supabase) await supabase.auth.signOut();
          } catch {}
        }
        tokenManager.logout();
        set({
          user: null,
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          hostAddress: null,
          isLoading: false,
        });
        if (typeof window !== 'undefined') {
          try {
            import('@/store/organization-store').then(({ useOrganizationStore }) => {
              useOrganizationStore.getState().clearOrganizations();
            });
          } catch {}
        }
        console.log('✅ Auth store state cleared');
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