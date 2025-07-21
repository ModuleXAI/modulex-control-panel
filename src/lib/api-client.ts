import { ApiResponse, ApiError, ModuleXStats, DashboardStatsResponse } from '@/types/api';
import { Tool, ToolsResponse } from '@/types/tools';
import { LogsResponse, LogFilters } from '@/types/logs';
import { tokenManager } from './token-manager';

class ApiClient {
  constructor() {
    // Token manager handles the base URL and authentication
  }

  private getBaseUrl(): string {
    return process.env.NEXT_PUBLIC_MODULEX_HOST || 'http://localhost:3000';
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const accessToken = tokenManager.getAccessToken();
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Use token manager for authenticated requests
    return tokenManager.makeAuthenticatedRequest<T>(endpoint, options);
  }

  // Authentication is now handled by TokenManager
  // Use tokenManager.login() instead of validateKey

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