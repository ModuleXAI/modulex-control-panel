import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  AnalyticsOverview, 
  UserAnalytics, 
  ToolAnalytics, 
  PerformanceAnalytics, 
  SecurityAnalytics 
} from '@/types/analytics';

export const useAnalyticsOverview = (dateRange: string) => {
  return useQuery({
    queryKey: ['analytics', 'overview', dateRange],
    queryFn: async () => {
      try {
        const response = await apiClient.getAnalyticsOverview(dateRange);
        return response.data;
      } catch (error) {
        throw new Error('Analytics overview API endpoint is not available yet');
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useUserAnalytics = (dateRange: string) => {
  return useQuery({
    queryKey: ['analytics', 'users', dateRange],
    queryFn: async () => {
      try {
        const response = await apiClient.getUserAnalytics(dateRange);
        return response.data;
      } catch (error) {
        throw new Error('User analytics API endpoint is not available yet');
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useToolAnalytics = (dateRange: string) => {
  return useQuery({
    queryKey: ['analytics', 'tools', dateRange],
    queryFn: async () => {
      try {
        const response = await apiClient.getToolAnalytics(dateRange);
        return response.data;
      } catch (error) {
        throw new Error('Tool analytics API endpoint is not available yet');
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const usePerformanceAnalytics = (dateRange: string) => {
  return useQuery({
    queryKey: ['analytics', 'performance', dateRange],
    queryFn: async () => {
      try {
        const response = await apiClient.getPerformanceAnalytics(dateRange);
        return response.data;
      } catch (error) {
        throw new Error('Performance analytics API endpoint is not available yet');
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useSecurityAnalytics = (dateRange: string) => {
  return useQuery({
    queryKey: ['analytics', 'security', dateRange],
    queryFn: async () => {
      try {
        const response = await apiClient.getSecurityAnalytics(dateRange);
        return response.data;
      } catch (error) {
        throw new Error('Security analytics API endpoint is not available yet');
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}; 