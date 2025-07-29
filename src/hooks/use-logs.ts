import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { LogFilters } from '@/types/logs';

export const useLogs = (filters: LogFilters, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['logs', filters],
    queryFn: () => apiClient.getLogs(filters),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute for real-time updates
    enabled: options?.enabled ?? true,
  });
}; 