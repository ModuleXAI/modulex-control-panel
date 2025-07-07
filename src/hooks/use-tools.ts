import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

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

export const useInstallTool = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ toolName, config }: { toolName: string; config?: Record<string, any> }) => 
      apiClient.installTool(toolName, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
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
    },
  });
}; 