export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  isInstalled: boolean;
  isEnabled: boolean;
  configurationRequired: boolean;
  icon?: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  environmentVariables?: EnvironmentVariable[];
}

export interface EnvironmentVariable {
  key: string;
  value: string;
  description: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'url' | 'secret';
}

export interface ToolSearchFilters {
  category?: string;
  installed?: boolean;
  enabled?: boolean;
  search?: string;
} 