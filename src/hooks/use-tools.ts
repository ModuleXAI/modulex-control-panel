import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// Organization-scoped tools (requires organization_id)
export const useAvailableTools = () => {
  return useQuery({
    queryKey: ['tools', 'available'],
    queryFn: () => apiClient.getAvailableTools(),
    select: (data) => data.tools,
  });
};

export const useInstalledTools = () => {
  return useQuery({
    queryKey: ['tools', 'installed'],
    queryFn: () => apiClient.getInstalledTools(),
    select: (data) => data.tools,
  });
};

export const useOpenAITools = () => {
  return useQuery({
    queryKey: ['tools', 'openai'],
    queryFn: () => apiClient.getOpenAITools(),
    select: (data) => data.tools,
  });
};

// Integration management (requires organization_id)
export const useAvailableIntegrations = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['integrations', 'available'],
    queryFn: () => apiClient.getAvailableIntegrations(),
    select: (data) => data.tools,
    enabled: options?.enabled ?? true,
  });
};

export const useInstalledIntegrations = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['integrations', 'installed'],
    queryFn: () => apiClient.getInstalledIntegrations(),
    select: (data) => data.tools,
    enabled: options?.enabled ?? true,
  });
};

export const useInstallTool = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ toolName, authType, config }: { 
      toolName: string; 
      authType: string; 
      config?: Record<string, any> 
    }) => 
      apiClient.installTool(toolName, authType, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
};

export const useUninstallTool = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (toolName: string) => 
      apiClient.uninstallTool(toolName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
};

export const useUpdateToolConfig = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ toolName, config }: { toolName: string; config: Record<string, any> }) =>
      apiClient.updateToolConfig(toolName, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
};

export const useExecuteTool = () => {
  return useMutation({
    mutationFn: ({ toolName, action, parameters }: { 
      toolName: string; 
      action: string; 
      parameters: any;
    }) => apiClient.executeTool(toolName, action, parameters),
  });
};

// User-level tools (no organization_id needed)
export const useUserTools = () => {
  return useQuery({
    queryKey: ['user', 'tools'],
    queryFn: () => apiClient.getUserTools(),
    select: (data) => data.tools,
  });
};

export const useUpdateUserToolStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ toolName, isActive }: { toolName: string; isActive: boolean }) =>
      apiClient.updateUserToolStatus(toolName, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'tools'] });
    },
  });
};

// OAuth and manual authentication (no organization_id needed)
export const useGetOAuthUrl = () => {
  return useMutation({
    mutationFn: (toolName: string) => apiClient.getOAuthUrl(toolName),
  });
};

export const useManualAuth = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ toolName, credentials }: { 
      toolName: string; 
      credentials: Record<string, any>; 
    }) => apiClient.manualAuth(toolName, credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'tools'] });
      queryClient.invalidateQueries({ queryKey: ['tools'] });
    },
  });
}; 