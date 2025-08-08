import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { UserFilters } from '@/types/users';
import { useAuthStore } from '@/store/auth-store';

// Removed mock data - real API calls will be used instead

export const useUsers = (filters: UserFilters, options?: { enabled?: boolean }) => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      
      try {
        const response = await apiClient.getUsers(filters);
        console.log('✅ Users API response:', response);
        return response;
      } catch (error) {
        console.error('❌ Users API failed:', error);
        throw error;
      }
    },
    enabled: isAuthenticated && (options?.enabled ?? true),
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useUserStats = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['users', 'stats'],
    queryFn: async () => {
      try {
        const response = await apiClient.getUserStats();
        console.log('✅ User stats API response:', response);
        return response;
      } catch (error) {
        console.error('❌ User stats API failed:', error);
        throw error;
      }
    },
    enabled: isAuthenticated,
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useUserDetail = (userId: string) => {
  const { isAuthenticated } = useAuthStore();

  console.log('🔍 [useUserDetail] Hook called with:', {
    userId,
    userIdType: typeof userId,
    userIdLength: userId?.length,
    isAuthenticated
  });

  return useQuery({
    queryKey: ['users', userId],
    queryFn: async () => {
      try {
        const response = await apiClient.getUserDetail(userId);
        console.log('✅ User detail API response:', response);
        return response;
      } catch (error) {
        console.error('❌ User detail API failed:', error);
        throw error;
      }
    },
    enabled: isAuthenticated,
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
    refetchOnWindowFocus: false,
  });
}; 