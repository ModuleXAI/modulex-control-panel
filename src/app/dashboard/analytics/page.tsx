'use client';

import { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Users, 
  Package, 
  Activity,
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Shield,
  Clock,
  AlertCircle
} from 'lucide-react';
import AnalyticsOverview from '@/components/analytics/analytics-overview';
import UserAnalytics from '@/components/analytics/user-analytics';
import ToolAnalytics from '@/components/analytics/tool-analytics';
import PerformanceAnalytics from '@/components/analytics/performance-analytics';
import SecurityAnalytics from '@/components/analytics/security-analytics';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<string>('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting analytics data...');
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Analytics
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor system performance, user engagement, and tool usage patterns
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40 h-10 bg-white border-gray-200">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Action Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-10 hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            size="sm"
            onClick={handleExport}
            className="h-10 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid h-11">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Tools
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AnalyticsOverview dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserAnalytics dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <ToolAnalytics dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceAnalytics dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecurityAnalytics dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 