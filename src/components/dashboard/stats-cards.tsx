'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Package, 
  Activity, 
  Shield,
  AlertCircle,
  TrendingUp,
  UserCheck,
  Zap
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export default function StatsCards() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => apiClient.getDashboardStats(),
    select: (data) => data.stats,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded-lg w-24"></div>
                <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded-lg w-20 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded-lg w-32"></div>
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
        {[
          { title: 'Total Users', icon: Users, color: 'blue' },
          { title: 'Integrations', icon: Package, color: 'purple' },
          { title: 'API Calls Today', icon: Activity, color: 'green' },
          { title: 'System Health', icon: Shield, color: 'amber' }
        ].map((item, i) => (
          <Card key={i} className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {item.title}
                </CardTitle>
                <div className={`p-2.5 rounded-xl bg-gray-50`}>
                  <item.icon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-300">--</div>
              <p className="text-xs text-muted-foreground mt-1">
                Unable to load data
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return 'bg-green-50';
      case 'warning': return 'bg-amber-50';
      case 'critical': return 'bg-red-50';
      default: return 'bg-gray-50';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Users Card */}
      <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Users
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-blue-50 group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats.totalUsers.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <UserCheck className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              {stats.totalToolAuthenticated} tool authentications
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Integrations Card */}
      <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600" />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">
              Integrations
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-purple-50 group-hover:scale-110 transition-transform">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats.totalIntegrations}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              {stats.activeIntegrations} active
            </span>
          </div>
        </CardContent>
      </Card>

      {/* API Calls Card */}
      <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-green-400 to-green-600" />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">
              API Calls Today
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-green-50 group-hover:scale-110 transition-transform">
              <Activity className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats.apiCallsToday.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              Requests processed
            </span>
          </div>
        </CardContent>
      </Card>

      {/* System Health Card */}
      <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white overflow-hidden">
        <div className={`h-1 bg-gradient-to-r ${
          stats.systemHealth === 'healthy' ? 'from-green-400 to-green-600' :
          stats.systemHealth === 'warning' ? 'from-amber-400 to-amber-600' :
          'from-red-400 to-red-600'
        }`} />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">
              System Health
            </CardTitle>
            <div className={`p-2.5 rounded-xl ${getHealthIcon(stats.systemHealth)} group-hover:scale-110 transition-transform`}>
              <Shield className={`h-5 w-5 ${
                stats.systemHealth === 'healthy' ? 'text-green-600' :
                stats.systemHealth === 'warning' ? 'text-amber-600' :
                'text-red-600'
              }`} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-2">
            <Badge className={`${getHealthColor(stats.systemHealth)} border px-3 py-1`}>
              {stats.systemHealth.charAt(0).toUpperCase() + stats.systemHealth.slice(1)}
            </Badge>
            {stats.systemHealth !== 'healthy' && (
              <AlertCircle className={`h-4 w-4 ${
                stats.systemHealth === 'warning' ? 'text-amber-500' : 'text-red-500'
              }`} />
            )}
          </div>
          <p className="text-xs text-gray-600">
            {stats.lastUpdated ? 
              `Updated ${new Date(stats.lastUpdated).toLocaleTimeString()}` :
              'Real-time monitoring active'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 