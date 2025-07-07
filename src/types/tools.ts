export interface Tool {
  id: number;
  name: string;
  display_name: string;
  description: string;
  author: string;
  version: string;
  logo?: string;
  app_url?: string;
  categories?: ToolCategory[];
  actions?: ToolAction[];
  enabled_actions?: ToolAction[];
  disabled_actions?: ToolAction[];
  environment_variables?: EnvironmentVariable[];
  setup_environment_variables?: Record<string, string> | EnvironmentVariable[];
  created_at: string;
  updated_at: string;
  installed_at?: string;
}

export interface ToolCategory {
  id: string;
  name: string;
}

export interface ToolAction {
  name: string;
  description: string;
}

export interface EnvironmentVariable {
  name: string;
  about_url?: string;
  description: string;
  sample_format: string;
  value?: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'url' | 'secret';
}

export interface ToolsResponse {
  success: boolean;
  tools: Tool[];
  total: number;
}

export interface ToolSearchFilters {
  category?: string;
  installed?: boolean;
  enabled?: boolean;
  search?: string;
} 