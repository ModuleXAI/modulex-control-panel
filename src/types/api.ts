export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  public code: string;
  public details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ModuleXStats {
  totalUsers: number;
  activeUsers: number;
  totalIntegrations: number;
  activeIntegrations: number;
  apiCallsToday: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  lastUpdated: string;
} 