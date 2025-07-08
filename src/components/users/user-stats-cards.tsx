'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users,
  UserCheck,
  UserX,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useUserStats } from '@/hooks/use-users';
import { UserStatsCardSkeleton, UserErrorState } from './user-skeleton';
import { useAuthStore } from '@/store/auth-store';

export default function UserStatsCards() {
  const { isAuthenticated, token, hostAddress } = useAuthStore();
  const { data: stats, isLoading, error, refetch } = useUserStats();

  console.log('🎯 [UserStatsCards] Component render with auth state:', { 
    isAuthenticated, 
    hasToken: !!token, 
    hasHost: !!hostAddress 
  });
  
  console.log('🎯 [UserStatsCards] Component render with hook data:', { 
    stats, 
    isLoading, 
    error,
    statsType: typeof stats,
    statsKeys: stats ? Object.keys(stats) : null
  });

  // Ensure all stats have default values
  const userStats = {
    totalUsers: stats?.totalUsers ?? 0,
    activeUsers: stats?.activeUsers ?? 0,
    inactiveUsers: stats?.inactiveUsers ?? 0,
    newUsersToday: stats?.newUsersToday ?? 0,
    activePercentage: stats?.activePercentage ?? 0,
    newUsersChange: stats?.newUsersChange ?? 0
  };

  console.log('🎯 [UserStatsCards] Processed stats:', userStats);
  console.log('🎯 [UserStatsCards] Raw stats object:', JSON.stringify(stats, null, 2));

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <UserStatsCardSkeleton />
        <UserStatsCardSkeleton />
        <UserStatsCardSkeleton />
        <UserStatsCardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="col-span-full">
          <UserErrorState
            title="Failed to load user statistics"
            message="Unable to fetch user statistics. Please try again."
            onRetry={refetch}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Users */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
          <Users className="h-5 w-5 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-bold text-gray-900">
              {userStats.totalUsers.toLocaleString()}
            </div>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              All time
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Active Users */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
          <UserCheck className="h-5 w-5 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-bold text-gray-900">
              {userStats.activeUsers.toLocaleString()}
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              {Math.round(userStats.activePercentage)}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Inactive Users */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Inactive Users</CardTitle>
          <UserX className="h-5 w-5 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-bold text-gray-900">
              {userStats.inactiveUsers.toLocaleString()}
            </div>
            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
              {Math.round(100 - userStats.activePercentage)}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* New Users Today */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">New Users Today</CardTitle>
          <Activity className="h-5 w-5 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-bold text-gray-900">
              {userStats.newUsersToday.toLocaleString()}
            </div>
            <div className="flex items-center">
              {userStats.newUsersChange > 0 ? (
                <div className="flex items-center">
                  <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">
                    +{Math.round(userStats.newUsersChange)}%
                  </span>
                </div>
              ) : userStats.newUsersChange < 0 ? (
                <div className="flex items-center">
                  <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-sm font-medium text-red-600">
                    {Math.round(userStats.newUsersChange)}%
                  </span>
                </div>
              ) : (
                <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                  Today
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 