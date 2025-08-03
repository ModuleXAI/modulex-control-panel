import { Tool, ToolsResponse, ToolInstallationRequest } from '@/types/tools';
import { LogsResponse, LogFilters } from '@/types/logs';
import { ApiResponse, DashboardStatsResponse } from '@/types/api';
import { tokenManager } from './token-manager';
import { useOrganizationStore } from '@/store/organization-store';

class ApiClient {
  constructor() {
    // Bind methods to preserve 'this' context
    this.request = this.request.bind(this);
  }

  private getBaseUrl(): string {
    // Use the same environment variable as token manager
    const envBaseUrl = process.env.NEXT_PUBLIC_MODULEX_HOST || '';
    
    // Also check if token manager has a stored base URL (from cookies)
    const tokenManagerBaseUrl = tokenManager.getHostAddress();
    
    // Priority: Token manager stored URL > Environment variable
    const baseUrl = tokenManagerBaseUrl || envBaseUrl;
    
    return baseUrl;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = tokenManager.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private addOrganizationId(url: string): string {
    // Get selected organization ID from store
    const selectedOrgId = useOrganizationStore.getState().getSelectedOrganizationId();
  
    if (!selectedOrgId) {
      return url;
    }

    // Parse URL to add organization_id parameter
    const baseUrl = this.getBaseUrl();
    const urlObj = new URL(url, baseUrl);
    urlObj.searchParams.set('organization_id', selectedOrgId);
    
    const finalUrl = urlObj.pathname + urlObj.search;
    
    return finalUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    addOrgId: boolean = true
  ): Promise<T> {
    // Add organization_id parameter if needed
    const finalEndpoint = addOrgId ? this.addOrganizationId(endpoint) : endpoint;
    const baseUrl = this.getBaseUrl();
    
  
    
    if (!baseUrl) {
      throw new Error('Base URL not configured. Please check NEXT_PUBLIC_MODULEX_HOST environment variable.');
    }
    
    try {
      const response = await tokenManager.makeAuthenticatedRequest<T>(
        finalEndpoint,
        {
          headers: this.getHeaders(),
          ...options,
        }
      );

      
      return response;
    } catch (error) {
     
      throw error;
    }
  }

  // User Organizations (no org_id needed)
  async getUserOrganizations(): Promise<any> {
    return this.request('/auth/me/organizations', {}, false);
  }

  // User profile (no org_id needed)
  async getCurrentUser(): Promise<any> {
    return this.request('/auth/me', {}, false);
  }

  // User Tools (no org_id needed)
  async getUserTools(): Promise<any> {
    return this.request('/auth/tools', {}, false);
  }

  async updateUserToolStatus(toolName: string, isActive: boolean): Promise<any> {
    return this.request(`/auth/tools/${toolName}/status`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: isActive }),
    }, false);
  }

  // Organization Tools (requires org_id)
  async getAvailableTools(): Promise<ToolsResponse> {
    return this.request('/tools/available');
  }

  async getInstalledTools(): Promise<ToolsResponse> {
    return this.request('/tools/user');
  }

  async getOpenAITools(): Promise<any> {
    return this.request('/tools/openai-tools');
  }

  // Integration Management (requires org_id)
  async getAvailableIntegrations(): Promise<ToolsResponse> {
    return this.request('/integrations/available');
  }

  async getInstalledIntegrations(): Promise<ToolsResponse> {
    return this.request('/integrations/installed');
  }

  async installTool(toolName: string, authType: string, config?: Record<string, any>): Promise<ApiResponse<Tool>> {
    return this.request(`/integrations/install`, {
      method: 'POST',
      body: JSON.stringify({
        tool_name: toolName,
        auth_type: authType, // NEW: Required auth type
        environment_variables: config,
      }),
    });
  }

  async uninstallTool(toolName: string): Promise<ApiResponse<any>> {
    return this.request(`/integrations/${toolName}`, {
      method: 'DELETE',
    });
  }

  async updateToolConfig(toolName: string, config: Record<string, any>): Promise<ApiResponse<any>> {
    return this.request(`/integrations/${toolName}/config`, {
      method: 'PUT',
      body: JSON.stringify({ config }),
    });
  }

  // Dashboard (requires org_id)
  async getDashboardStats(): Promise<DashboardStatsResponse> {
    return this.request('/dashboard/stats');
  }

  async getLogs(filters: LogFilters): Promise<LogsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const endpoint = `/dashboard/logs?${params.toString()}`;
    return this.request(endpoint);
  }

  async getUsers(filters: any): Promise<any> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const endpoint = `/dashboard/users?${params.toString()}`;
    return this.request(endpoint);
  }

  async getUserDetail(userId: string): Promise<any> {
    return this.request(`/dashboard/users/${userId}`);
  }

  // Tool execution (requires org_id)
  async executeTool(toolName: string, action: string, parameters: any): Promise<any> {
    return this.request(`/tools/${toolName}/execute`, {
      method: 'POST',
      body: JSON.stringify({
        action,
        parameters,
      }),
    });
  }

  // Analytics endpoints (requires org_id)
  async getAnalyticsOverview(period: string): Promise<ApiResponse<any>> {
    return this.request(`/dashboard/analytics/overview?period=${period}`);
  }

  async getUserAnalytics(period: string): Promise<ApiResponse<any>> {
    return this.request(`/dashboard/analytics/users?period=${period}`);
  }

  async getToolAnalytics(period: string): Promise<ApiResponse<any>> {
    return this.request(`/dashboard/analytics/tools?period=${period}`);
  }

  async getPerformanceAnalytics(period: string): Promise<ApiResponse<any>> {
    return this.request(`/dashboard/analytics/performance?period=${period}`);
  }

  async getSecurityAnalytics(period: string): Promise<ApiResponse<any>> {
    return this.request(`/dashboard/analytics/security?period=${period}`);
  }

  // OAuth URL generation (no org_id needed)
  async getOAuthUrl(toolName: string): Promise<any> {
    return this.request(`/auth/url/${toolName}`, {}, false);
  }

  // Manual authentication (no org_id needed)
  async manualAuth(toolName: string, credentials: Record<string, any>): Promise<any> {
    return this.request('/auth/manual', {
      method: 'POST',
      body: JSON.stringify({
        tool_name: toolName,
        credentials,
      }),
    }, false);
  }
}

export const apiClient = new ApiClient();
export default ApiClient; 