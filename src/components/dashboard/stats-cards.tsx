'use client';

import { Card, CardContent } from '@/components/ui/card';
import { 
  Activity,
  AlertCircle,
  BarChart3,
  Shield,
  ShieldCheck,
  UserCheck,
  Users,
  Zap
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useOrganizationStore } from '@/store/organization-store';
import { useEffect } from 'react';

export default function StatsCards() {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      console.log('🔄 Fetching dashboard stats...');
      const result = await apiClient.getDashboardStats();
      console.log('📊 Dashboard stats response:', result);
      return result;
    },
    staleTime: 30000, // Cache for 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  // Extract stats from response
  const stats = response?.stats;

  console.log('Stats data:', stats);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    console.error('❌ Error loading dashboard stats:', error);
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="md:col-span-2 lg:col-span-4">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Failed to load dashboard statistics</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    console.warn('⚠️ No stats data available');
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="md:col-span-2 lg:col-span-4">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="h-5 w-5" />
              <span>No statistics available</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getHealthIcon = (health?: string) => {
    switch (health) {
      case 'healthy': return <Shield className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-amber-600" />;
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const getHealthColor = (health?: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-amber-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Users */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {(stats.total_members ?? stats.total_users ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <UserCheck className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Organization members</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tool Authentications */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tool Authentications</p>
            </div>
            <ShieldCheck className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {(stats.total_tool_authenticated ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Connected integrations</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Integrations */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Integrations</p>
            </div>
            <Zap className="h-8 w-8 text-purple-600" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {(stats.total_integrations ?? stats.total_tools ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-green-600 font-medium">
                  {stats.active_integrations ?? stats.active_tools ?? 0} active
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Calls Today */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">API Calls Today</p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-600" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {(stats.api_calls_today ?? stats.total_requests ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-sm">
              {getHealthIcon(stats.system_health)}
              <span className={`font-medium ${getHealthColor(stats.system_health)}`}>
                System {stats.system_health || 'unknown'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 