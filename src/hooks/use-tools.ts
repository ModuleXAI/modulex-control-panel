import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export const useAvailableTools = () => {
  return useQuery({
    queryKey: ['tools', 'available'],
    queryFn: () => apiClient.getAvailableTools(),
    select: (data) => data.data,
  });
};

export const useInstalledTools = () => {
  return useQuery({
    queryKey: ['tools', 'installed'],
    queryFn: () => apiClient.getInstalledTools(),
    select: (data) => data.data,
  });
};

export const useInstallTool = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (toolId: string) => apiClient.installTool(toolId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
    },
  });
};

export const useUpdateToolConfig = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ toolId, config }: { toolId: string; config: Record<string, any> }) =>
      apiClient.updateToolConfig(toolId, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
    },
  });
}; 