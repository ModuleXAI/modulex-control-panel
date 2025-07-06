'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  Calendar,
  FileText,
  Shield,
  Briefcase,
  AlertTriangle,
  Settings,
  Eye
} from 'lucide-react';
import { useLogs } from '@/hooks/use-logs';
import { LogFilters, LogType, LogLevel, LogEntry } from '@/types/logs';

const LOG_TYPE_ICONS = {
  request: FileText,
  security: Shield,
  business: Briefcase,
  error: AlertTriangle,
  system: Settings,
  audit: Eye,
};

const LOG_LEVEL_COLORS = {
  INFO: 'bg-blue-100 text-blue-800',
  WARNING: 'bg-yellow-100 text-yellow-800',
  ERROR: 'bg-red-100 text-red-800',
  CRITICAL: 'bg-red-200 text-red-900',
};

export default function LogsSection() {
  const [filters, setFilters] = useState<LogFilters>({
    limit: 50,
    offset: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useLogs(filters);

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm || undefined,
      offset: 0, // Reset to first page
    }));
  };

  const handleTypeFilter = (log_type: LogType | 'all') => {
    setFilters(prev => ({
      ...prev,
      log_type: log_type === 'all' ? undefined : log_type,
      offset: 0,
    }));
  };

  const handleLevelFilter = (level: LogLevel | 'all') => {
    setFilters(prev => ({
      ...prev,
      level: level === 'all' ? undefined : level,
      offset: 0,
    }));
  };

  const handlePreviousPage = () => {
    if (data?.pagination.has_previous) {
      setFilters(prev => ({
        ...prev,
        offset: Math.max(0, prev.offset - prev.limit),
      }));
    }
  };

  const handleNextPage = () => {
    if (data?.pagination.has_next) {
      setFilters(prev => ({
        ...prev,
        offset: prev.offset + prev.limit,
      }));
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderLogEntry = (log: LogEntry) => {
    const IconComponent = LOG_TYPE_ICONS[log.log_type];
    const isExpanded = expandedLog === log.id;

    return (
      <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <IconComponent className="h-5 w-5 text-gray-500 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {log.log_type}
                </Badge>
                <Badge className={`text-xs ${LOG_LEVEL_COLORS[log.level]}`}>
                  {log.level}
                </Badge>
                {log.success !== null && (
                  <Badge variant={log.success ? "default" : "destructive"} className="text-xs">
                    {log.success ? 'Success' : 'Failed'}
                  </Badge>
                )}
                {log.category && (
                  <Badge variant="secondary" className="text-xs">
                    {log.category}
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                {log.message}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>{formatTimestamp(log.timestamp)}</span>
                {log.tool_name && (
                  <span>Tool: {log.tool_name}</span>
                )}
                {log.user_id && (
                  <span>User: {log.user_id}</span>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpandedLog(isExpanded ? null : log.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
        
        {isExpanded && (
          <div className="mt-3 pt-3 border-t">
            <div className="bg-gray-50 rounded p-3">
              <h4 className="text-sm font-medium mb-2">Log Details</h4>
              <div className="space-y-1 text-xs">
                <div><strong>ID:</strong> {log.id}</div>
                <div><strong>Timestamp:</strong> {log.timestamp}</div>
                <div><strong>Type:</strong> {log.log_type}</div>
                <div><strong>Level:</strong> {log.level}</div>
                {log.user_id && <div><strong>User ID:</strong> {log.user_id}</div>}
                {log.tool_name && <div><strong>Tool:</strong> {log.tool_name}</div>}
                {log.category && <div><strong>Category:</strong> {log.category}</div>}
                {log.details && <div><strong>Details:</strong> {log.details}</div>}
                <div><strong>Success:</strong> {log.success === null ? 'N/A' : log.success ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Logs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Failed to load logs</p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Logs</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-64"
            />
            <Button onClick={handleSearch} size="sm">
              Search
            </Button>
          </div>
          
          <Select value={filters.log_type || 'all'} onValueChange={handleTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="request">Request</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="audit">Audit</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.level || 'all'} onValueChange={handleLevelFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="INFO">Info</SelectItem>
              <SelectItem value="WARNING">Warning</SelectItem>
              <SelectItem value="ERROR">Error</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logs List */}
        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="flex items-start space-x-3">
                    <div className="h-5 w-5 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : data?.logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No logs found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.logs.map(renderLogEntry)}
            </div>
          )}
        </ScrollArea>

        {/* Pagination */}
        {data && data.logs.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-gray-500">
              Showing {data.pagination.offset + 1} to {Math.min(data.pagination.offset + data.pagination.limit, data.pagination.total_count)} of {data.pagination.total_count} logs
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={!data.pagination.has_previous}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!data.pagination.has_next}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 