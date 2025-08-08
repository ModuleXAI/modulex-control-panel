import { AuthResponse, RefreshTokenResponse, LoginCredentials } from '@/types/auth';
import Cookies from 'js-cookie';
import { isSupabaseProvider } from '@/lib/auth-provider';
import { getSupabaseClient } from '@/lib/supabase-client';

class TokenManager {
  private baseUrl: string = '';
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshTimeoutId: NodeJS.Timeout | null = null;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    // Set base URL from environment variable
    this.baseUrl = process.env.NEXT_PUBLIC_MODULEX_HOST || '';
    // Persist host address cookie if available
    if (this.baseUrl) {
      const isProduction = process.env.NODE_ENV === 'production';
      Cookies.set('host-address', this.baseUrl, {
        expires: 7,
        sameSite: 'strict',
        secure: isProduction,
      });
    }
    
    // Initialize from cookies on instantiation
    this.loadTokensFromStorage();
  }

  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Keep cookie in sync so middleware sees auth host
    if (baseUrl) {
      const isProduction = process.env.NODE_ENV === 'production';
      Cookies.set('host-address', baseUrl, {
        expires: 7,
        sameSite: 'strict',
        secure: isProduction,
      });
    }
  }

  private loadTokensFromStorage() {
    this.accessToken = Cookies.get('access-token') || null;
    this.refreshToken = Cookies.get('refresh-token') || null;
    
    console.log('🔄 TokenManager.loadTokensFromStorage:', {
      hasAccessToken: !!this.accessToken,
      hasRefreshToken: !!this.refreshToken,
      accessTokenPreview: this.accessToken ? this.accessToken.substring(0, 20) + '...' : null
    });
    
    if (this.accessToken) {
      this.scheduleTokenRefresh();
    }
  }

  setTokens(accessToken: string, refreshToken: string) {
    console.log('📝 TokenManager.setTokens called:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : null
    });
    
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.saveTokensToStorage(accessToken, refreshToken);
    this.scheduleTokenRefresh();
    
    // Verify tokens were saved
    const savedAccessToken = Cookies.get('access-token');
    const savedRefreshToken = Cookies.get('refresh-token');
    console.log('✅ Tokens saved verification:', {
      accessTokenSaved: !!savedAccessToken,
      refreshTokenSaved: !!savedRefreshToken
    });
  }

  private saveTokensToStorage(accessToken: string, refreshToken: string) {
    // Save tokens to cookies with proper security settings
    const isProduction = process.env.NODE_ENV === 'production';
    
    Cookies.set('access-token', accessToken, {
      expires: 1, // 1 day for access token cookie
      sameSite: 'strict',
      secure: isProduction,
      httpOnly: false // We need access from JS
    });

    Cookies.set('refresh-token', refreshToken, {
      expires: 7, // 7 days for refresh token
      sameSite: 'strict',
      secure: isProduction,
      httpOnly: false
    });

    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  private clearTokensFromStorage() {
    Cookies.remove('access-token');
    Cookies.remove('refresh-token');
    this.accessToken = null;
    this.refreshToken = null;
    
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }
  }

  private scheduleTokenRefresh() {
    if (!this.accessToken) return;

    try {
      // Decode JWT to get expiration time
      const payload = this.decodeJwt(this.accessToken);
      if (!payload || !payload.exp) {
        throw new Error('Invalid access token payload');
      }
      const expiresAt = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const refreshAt = expiresAt - (30 * 60 * 1000); // Refresh 30 minutes before expiry
      
      const timeUntilRefresh = refreshAt - now;
      
      if (timeUntilRefresh > 0) {
        this.refreshTimeoutId = setTimeout(() => {
          this.refreshAccessToken();
        }, timeUntilRefresh);
        
        console.log('🔄 Token refresh scheduled in', Math.round(timeUntilRefresh / 1000 / 60), 'minutes');
      } else {
        // Token is already expired or about to expire, refresh immediately
        this.refreshAccessToken();
      }
    } catch (error) {
      console.error('❌ Error scheduling token refresh:', error);
      // If we can't decode the token, try to refresh anyway
      this.refreshAccessToken();
    }
  }

  private decodeJwt(token: string): any | null {
    try {
      const [, payload] = token.split('.');
      if (!payload) return null;
      return JSON.parse(atob(payload));
    } catch (e) {
      return null;
    }
  }

  private getAccessTokenExpiryMs(): number | null {
    if (!this.accessToken) return null;
    const payload = this.decodeJwt(this.accessToken);
    if (!payload || !payload.exp) return null;
    return payload.exp * 1000;
  }

  private isAccessTokenExpired(thresholdMs: number = 0): boolean {
    const expiresAt = this.getAccessTokenExpiryMs();
    if (!expiresAt) return false; // if unknown, assume not expired to avoid loops
    const now = Date.now();
    return expiresAt - now <= thresholdMs;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      if (isSupabaseProvider()) {
        const supabase = getSupabaseClient();
        if (!supabase) throw new Error('Supabase client not initialized');
        console.log('🔐 Attempting Supabase login');
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });
        if (error) throw error;
        const session = data.session;
        if (!session) throw new Error('No Supabase session returned');
        this.saveTokensToStorage(session.access_token, session.refresh_token as string);
        this.scheduleTokenRefresh();
        // Ensure backend host cookie exists
        if (process.env.NEXT_PUBLIC_MODULEX_HOST) {
          this.setBaseUrl(process.env.NEXT_PUBLIC_MODULEX_HOST);
        }
        console.log('✅ Supabase login successful');
        const authResponse: AuthResponse = {
          access_token: session.access_token,
          refresh_token: session.refresh_token as string,
          user: {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email || '',
            role: 'user',
            createdAt: session.user.created_at || new Date().toISOString(),
          },
        } as unknown as AuthResponse;
        return authResponse;
      } else {
        if (!this.baseUrl) {
          throw new Error('NEXT_PUBLIC_MODULEX_HOST environment variable is not set');
        }

        console.log('🔐 Attempting login to:', `${this.baseUrl}/auth/login`);
        
        const response = await fetch(`${this.baseUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Login failed: ${response.status}`);
        }

        const authResponse: AuthResponse = await response.json();
        
        // Save tokens and schedule refresh
        this.saveTokensToStorage(authResponse.access_token, authResponse.refresh_token);
        this.scheduleTokenRefresh();
        
        // Save the base URL to cookie for persistence
        Cookies.set('host-address', this.baseUrl, {
          expires: 7,
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production'
        });

        console.log('✅ Login successful');
        return authResponse;
      }
      
    } catch (error) {
      console.error('❌ Login failed:', error);
      this.clearTokensFromStorage();
      throw error;
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.refreshToken) {
      console.error('❌ No refresh token available');
      return false;
    }

    this.isRefreshing = true;
    this.refreshPromise = this._performRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async _performRefresh(): Promise<boolean> {
    try {
      console.log('🔄 Refreshing access token...');
      if (isSupabaseProvider()) {
        const supabase = getSupabaseClient();
        if (!supabase) return false;
        // Try to get the current session (auto-refresh may have occurred)
        const { data: sessionData, error: getErr } = await supabase.auth.getSession();
        if (getErr) {
          console.error('❌ Supabase getSession error:', getErr);
        }
        const currentSession = sessionData?.session;
        if (currentSession?.access_token && currentSession.refresh_token) {
          this.saveTokensToStorage(currentSession.access_token, currentSession.refresh_token);
          this.scheduleTokenRefresh();
          console.log('✅ Supabase session used for refresh');
          return true;
        }
        // Fallback: explicitly refresh
        const { data, error } = await supabase.auth.refreshSession();
        if (error || !data.session) {
          console.error('❌ Supabase token refresh failed:', error);
          this.clearTokensFromStorage();
          return false;
        }
        this.saveTokensToStorage(data.session.access_token, data.session.refresh_token as string);
        this.scheduleTokenRefresh();
        console.log('✅ Supabase token refreshed successfully');
        return true;
      } else {
        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh_token: this.refreshToken,
          }),
        });

        if (!response.ok) {
          console.error('❌ Token refresh failed:', response.status);
          this.clearTokensFromStorage();
          return false;
        }

        const refreshResponse: RefreshTokenResponse = await response.json();
        
        // Update tokens
        this.saveTokensToStorage(refreshResponse.access_token, refreshResponse.refresh_token);
        this.scheduleTokenRefresh();
        
        console.log('✅ Token refreshed successfully');
        return true;
      }
      
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      this.clearTokensFromStorage();
      return false;
    }
  }

  async makeAuthenticatedRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    // Ensure we have a valid access token, attempt refresh if missing but refresh token exists
    if (!this.accessToken) {
      if (this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (!refreshed || !this.accessToken) {
          throw new Error('Authentication failed');
        }
      } else {
        throw new Error('No access token available');
      }
    }

    // Preflight: refresh if token is expired or expiring soon (within 60 seconds)
    if (this.isAccessTokenExpired(60_000)) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed || !this.accessToken) {
        throw new Error('Authentication failed');
      }
    }

    const makeRequest = async (token: string): Promise<Response> => {
      return fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });
    };

    try {
      let response = await makeRequest(this.accessToken);

      // If we get a 401, try to refresh (or wait if in progress) and retry once
      if (response.status === 401) {
        console.log('🔄 Got 401, handling token refresh...');
        if (this.isRefreshing && this.refreshPromise) {
          await this.refreshPromise;
        } else {
          const refreshed = await this.refreshAccessToken();
          if (!refreshed) {
            throw new Error('Authentication failed');
          }
        }

        if (!this.accessToken) {
          throw new Error('Authentication failed');
        }
        console.log('🔄 Retrying request with new token...');
        response = await makeRequest(this.accessToken);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed: ${response.status}`);
      }

      return response.json();
      
    } catch (error) {
      console.error('❌ Authenticated request failed:', error);
      throw error;
    }
  }

  logout() {
    console.log('�� Logging out...');
    
    // Clear refresh timeout
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }
    
    // Clear memory tokens
    this.accessToken = null;
    this.refreshToken = null;
    this.baseUrl = '';
    this.isRefreshing = false;
    this.refreshPromise = null;
    
    // Clear storage
    this.clearTokensFromStorage();
    Cookies.remove('host-address');
    
    console.log('✅ Logout completed - all tokens cleared');
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  isAuthenticated(): boolean {
    const isAuth = !!this.accessToken;
    console.log('🔐 TokenManager.isAuthenticated check:', {
      hasAccessToken: !!this.accessToken,
      hasRefreshToken: !!this.refreshToken,
      isAuthenticated: isAuth,
      accessTokenPreview: this.accessToken ? this.accessToken.substring(0, 20) + '...' : null
    });
    return isAuth;
  }

  getHostAddress(): string | null {
    return Cookies.get('host-address') || null;
  }
}

// Create a singleton instance
export const tokenManager = new TokenManager();
export default TokenManager; 