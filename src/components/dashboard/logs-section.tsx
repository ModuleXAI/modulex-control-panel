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
  ClipboardList
} from 'lucide-react';
import { useLogs } from '@/hooks/use-logs';
import { LogFilters, LogType, LogLevel, LogEntry } from '@/types/logs';

const LOG_TYPE_ICONS = {
  request: FileText,
  security: Shield,
  business: Briefcase,
  error: AlertTriangle,
  system: Settings,
  audit: ClipboardList,
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
      <div 
        key={log.id} 
        className="border rounded-md p-2 hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={() => setExpandedLog(isExpanded ? null : log.id)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-1.5 flex-1 min-w-0">
            <IconComponent className="h-3.5 w-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1 mb-1">
                <Badge variant="outline" className="text-xs px-1 py-0 h-4 text-xs">
                  {log.log_type}
                </Badge>
                <Badge className={`text-xs px-1 py-0 h-4 text-xs ${LOG_LEVEL_COLORS[log.level]}`}>
                  {log.level}
                </Badge>
                {log.success !== null && (
                  <Badge variant={log.success ? "default" : "destructive"} className={`text-xs px-1 py-0 h-4 text-xs ${log.success ? 'bg-green-100 text-green-800' : ''}`}>
                    {log.success ? 'Success' : 'Failed'}
                  </Badge>
                )}
                {log.category && (
                  <Badge variant="secondary" className="text-xs px-1 py-0 h-4 text-xs">
                    {log.category}
                  </Badge>
                )}
                              </div>
              <p className="text-sm font-medium text-gray-900 mb-0.5 line-clamp-1">
                {log.message}
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                {log.tool_name && (
                  <span>Tool: {log.tool_name}</span>
                )}
                {log.user_id && (
                  <span>User: {log.user_id}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 text-right flex-shrink-0 ml-2">
            {formatTimestamp(log.timestamp)}
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-1.5 pt-1.5 border-t">
            <div className="bg-gray-50 rounded p-1.5">
              <h4 className="text-xs font-medium mb-0.5">Details</h4>
              <div className="space-y-0.5 text-xs">
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
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span className="text-base">Logs</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-xs">Refresh</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <Search className="h-3 w-3 text-gray-400" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-48 h-8 text-xs"
            />
            <Button onClick={handleSearch} size="sm" className="h-8 text-xs">
              Search
            </Button>
          </div>
          
          <Select value={filters.log_type || 'all'} onValueChange={handleTypeFilter}>
            <SelectTrigger className="w-28 h-8 text-xs">
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
            <SelectTrigger className="w-28 h-8 text-xs">
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
        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="space-y-1.5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border rounded-md p-2 animate-pulse">
                  <div className="flex items-start space-x-2">
                    <div className="h-3.5 w-3.5 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : data?.logs.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs">No logs found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {data?.logs.map(renderLogEntry)}
            </div>
          )}
        </ScrollArea>

        {/* Pagination */}
        {data && data.logs.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <div className="text-xs text-gray-500">
              Showing {data.pagination.offset + 1} to {Math.min(data.pagination.offset + data.pagination.limit, data.pagination.total_count)} of {data.pagination.total_count} logs
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={!data.pagination.has_previous}
                className="h-7 text-xs"
              >
                <ChevronLeft className="h-3 w-3" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!data.pagination.has_next}
                className="h-7 text-xs"
              >
                Next
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 