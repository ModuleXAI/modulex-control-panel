import { AuthResponse, RefreshTokenResponse, LoginCredentials } from '@/types/auth';
import Cookies from 'js-cookie';

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
    
    // Initialize from cookies on instantiation
    this.loadTokensFromStorage();
  }

  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private loadTokensFromStorage() {
    this.accessToken = Cookies.get('access-token') || null;
    this.refreshToken = Cookies.get('refresh-token') || null;
    
    if (this.accessToken) {
      this.scheduleTokenRefresh();
    }
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
      const payload = JSON.parse(atob(this.accessToken.split('.')[1]));
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

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
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
    // Ensure we have a valid access token
    if (!this.accessToken) {
      throw new Error('No access token available');
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

      // If we get a 401, try to refresh and retry once
      if (response.status === 401 && !this.isRefreshing) {
        console.log('🔄 Got 401, attempting token refresh...');
        
        const refreshed = await this.refreshAccessToken();
        
        if (refreshed && this.accessToken) {
          console.log('🔄 Retrying request with new token...');
          response = await makeRequest(this.accessToken);
        } else {
          throw new Error('Authentication failed');
        }
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
    console.log('🚪 Logging out...');
    this.clearTokensFromStorage();
    Cookies.remove('host-address');
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getHostAddress(): string | null {
    return Cookies.get('host-address') || null;
  }
}

// Create a singleton instance
export const tokenManager = new TokenManager();
export default TokenManager; 