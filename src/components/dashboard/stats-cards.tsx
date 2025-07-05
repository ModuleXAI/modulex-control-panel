'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Package, 
  Activity, 
  Shield,
  AlertCircle,
  Key
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export default function StatsCards() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => apiClient.getDashboardStats(),
    select: (data) => data.stats,
    retry: false, // Don't retry on error
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Show error state instead of breaking the page
  if (error || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {i === 0 && 'Total Users'}
                {i === 1 && 'Integrations'}
                {i === 2 && 'API Calls Today'}
                {i === 3 && 'System Health'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-400">--</div>
              <p className="text-xs text-muted-foreground">
                {i === 0 && 'Unable to load data'}
                {i === 1 && 'Unable to load data'}
                {i === 2 && 'Unable to load data'}
                {i === 3 && 'Unable to load data'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalToolAuthenticated} tool authenticated
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Integrations</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalIntegrations}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeIntegrations} active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">API Calls Today</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.apiCallsToday}</div>
          <p className="text-xs text-muted-foreground">
            Requests processed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Health</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Badge className={getHealthColor(stats.systemHealth)}>
              {stats.systemHealth}
            </Badge>
            {stats.systemHealth !== 'healthy' && (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.lastUpdated ? 
              `Last updated: ${new Date(stats.lastUpdated).toLocaleTimeString()}` :
              'Real-time monitoring'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 