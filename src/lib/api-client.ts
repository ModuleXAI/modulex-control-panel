import { ApiResponse, ApiError, ModuleXStats } from '@/types/api';
import { Tool } from '@/types/tools';

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
  ): Promise<ApiResponse<T>> {
    const url = `${this.hostAddress || this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 404 specifically
      if (response.status === 404) {
        throw new ApiError('Endpoint not found', '404');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(data.message || 'Request failed', response.status.toString());
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 'NETWORK_ERROR');
    }
  }

  // Authentication
  async validateKey(hostAddress: string, apiKey: string): Promise<ApiResponse<boolean>> {
    // Don't set credentials until we know the request will succeed
    const tempHostAddress = this.hostAddress;
    const tempApiKey = this.apiKey;
    
    try {
      // Temporarily set credentials for this request
      this.hostAddress = hostAddress;
      this.apiKey = apiKey;
      
      const result = await this.request<boolean>('/system/validate-key');
      
      // Only set credentials permanently if request succeeds
      this.setCredentials(hostAddress, apiKey);
      
      return result;
    } catch (error) {
      // Restore original credentials on failure
      this.hostAddress = tempHostAddress;
      this.apiKey = tempApiKey;
      throw error;
    }
  }

  // Tools
  async getAvailableTools(): Promise<ApiResponse<Tool[]>> {
    return this.request<Tool[]>('/integrations/available');
  }

  async getInstalledTools(): Promise<ApiResponse<Tool[]>> {
    return this.request<Tool[]>('/integrations/installed');
  }

  async installTool(toolId: string): Promise<ApiResponse<Tool>> {
    return this.request<Tool>(`/integrations/${toolId}/install`, {
      method: 'POST',
    });
  }

  async updateToolConfig(toolId: string, config: Record<string, any>): Promise<ApiResponse<Tool>> {
    return this.request<Tool>(`/integrations/${toolId}/config`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  // Dashboard
  async getDashboardStats(): Promise<ApiResponse<ModuleXStats>> {
    return this.request<ModuleXStats>('/dashboard/stats');
  }
}

export const apiClient = new ApiClient(); 