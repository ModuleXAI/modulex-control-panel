import { ApiResponse, ApiError, ModuleXStats, DashboardStatsResponse } from '@/types/api';
import { Tool, ToolsResponse } from '@/types/tools';
import { LogsResponse, LogFilters } from '@/types/logs';

class ApiClient {
  private baseUrl: string;
  private apiKey: string | null = null;
  private hostAddress: string | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }

  setCredentials(hostAddress: string, apiKey: string) {
    this.hostAddress = hostAddress;
    this.apiKey = apiKey;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['X-API-KEY'] = this.apiKey;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.hostAddress || this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    console.log('🔍 API Request Details:', {
      url,
      method: config.method || 'GET',
      headers: config.headers,
      endpoint,
      hostAddress: this.hostAddress,
      baseUrl: this.baseUrl
    });

    try {
      const response = await fetch(url, config);
      
      console.log('📥 API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      // Handle 404 specifically
      if (response.status === 404) {
        console.error('❌ 404 Error - Endpoint not found:', url);
        throw new ApiError('Endpoint not found', '404');
      }

      const data = await response.json();
      console.log('📦 Response Data:', data);

      if (!response.ok) {
        console.error('❌ API Error:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        throw new ApiError(data.message || 'Request failed', response.status.toString());
      }

      return data;
    } catch (error) {
      console.error('❌ Request Error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 'NETWORK_ERROR');
    }
  }

  // Authentication
  async validateKey(hostAddress: string, apiKey: string): Promise<ApiResponse<boolean>> {
    console.log('🔐 Starting validateKey with:', {
      hostAddress,
      apiKeyLength: apiKey.length,
      apiKeyPreview: apiKey.substring(0, 10) + '...'
    });

    // Don't set credentials until we know the request will succeed
    const tempHostAddress = this.hostAddress;
    const tempApiKey = this.apiKey;
    
    try {
      // Temporarily set credentials for this request
      this.hostAddress = hostAddress;
      this.apiKey = apiKey;
      
      console.log('🔍 Making request to /system/validate-key');
      const result = await this.request<ApiResponse<boolean>>('/system/validate-key');
      
      // Only set credentials permanently if request succeeds
      this.setCredentials(hostAddress, apiKey);
      console.log('✅ validateKey successful, credentials set');
      
      return result;
    } catch (error) {
      console.error('❌ validateKey failed:', error);
      // Restore original credentials on failure
      this.hostAddress = tempHostAddress;
      this.apiKey = tempApiKey;
      throw error;
    }
  }

  // Tools
  async getAvailableTools(): Promise<ToolsResponse> {
    return this.request<ToolsResponse>('/integrations/not-installed');
  }

  async getInstalledTools(): Promise<ToolsResponse> {
    return this.request<ToolsResponse>('/integrations/installed');
  }

  async installTool(toolName: string, config?: Record<string, any>): Promise<ApiResponse<Tool>> {
    const body = JSON.stringify({
      tool_name: toolName,
      config_data: config || {}
    });
    
    return this.request<ApiResponse<Tool>>('/integrations/install', {
      method: 'POST',
      body,
    });
  }

  async updateToolConfig(toolName: string, config: Record<string, any>): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/integrations/${toolName}/config`, {
      method: 'PUT',
      body: JSON.stringify({
        config_data: config
      }),
    });
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStatsResponse> {
    return this.request<DashboardStatsResponse>('/dashboard/stats');
  }

  // Logs
  async getLogs(filters: LogFilters): Promise<LogsResponse> {
    const params = new URLSearchParams();
    
    if (filters.log_type) params.append('log_type', filters.log_type);
    if (filters.level) params.append('level', filters.level);
    if (filters.search) params.append('search', filters.search);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    
    params.append('limit', filters.limit.toString());
    params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    const endpoint = `/dashboard/logs${queryString ? `?${queryString}` : ''}`;
    
    return this.request<LogsResponse>(endpoint);
  }

  // Analytics endpoints
  async getAnalyticsOverview(period: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/dashboard/analytics/overview?period=${period}`);
  }

  async getUserAnalytics(period: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/dashboard/analytics/users?period=${period}`);
  }

  async getToolAnalytics(period: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/dashboard/analytics/tools?period=${period}`);
  }

  async getPerformanceAnalytics(period: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/dashboard/analytics/performance?period=${period}`);
  }

  async getSecurityAnalytics(period: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/dashboard/analytics/security?period=${period}`);
  }

  // Users endpoints
  async getUsers(filters: any): Promise<any> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.sortBy) params.append('sort_by', filters.sortBy);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `/dashboard/users${queryString ? `?${queryString}` : ''}`;
    
    return this.request<any>(endpoint);
  }



  async getUserDetail(userId: string): Promise<any> {
    return this.request<any>(`/dashboard/users/${userId}`);
  }
}

export const apiClient = new ApiClient(); 