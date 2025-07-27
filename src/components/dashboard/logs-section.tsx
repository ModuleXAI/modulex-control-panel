'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  XCircle,
  Clock
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useLogs } from '@/hooks/use-logs';
import { LogLevel, LogType, LogEntry } from '@/types/logs';
import { useOrganizationStore } from '@/store/organization-store';

interface LogsSectionProps {
  className?: string;
}

export default function LogsSection({ className }: LogsSectionProps) {
  const { selectedOrganization, selectedOrganizationId } = useOrganizationStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [logType, setLogType] = useState<LogType | 'all'>('all');
  const [level, setLevel] = useState<LogLevel | 'all'>('all');
  const [page, setPage] = useState(1);
  const limit = 10;
  const offset = (page - 1) * limit;

  const filters = {
    search: searchTerm || undefined,
    log_type: logType !== 'all' ? logType : undefined,
    level: level !== 'all' ? level : undefined,
    limit,
    offset,
  };

  const { data: logsData, isLoading, error, refetch } = useLogs(filters);

  useEffect(() => {
    console.log('📋 LogsSection - State:', {
      hasSelectedOrg: !!selectedOrganization,
      selectedOrgId: selectedOrganizationId,
      selectedOrgName: selectedOrganization?.name,
      isLoading,
      hasError: !!error,
      hasData: !!logsData,
      filters
    });
  }, [selectedOrganization, selectedOrganizationId, isLoading, error, logsData, filters]);

  const handleSearch = () => {
    setPage(1);
    refetch();
  };

  const handleTypeFilter = (log_type: LogType | 'all') => {
    setLogType(log_type);
    setPage(1);
  };

  const handleLevelFilter = (level: LogLevel | 'all') => {
    setLevel(level);
    setPage(1);
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (logsData?.pagination.has_next) {
      setPage(page + 1);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderLogEntry = (log: LogEntry) => {
    const getLevelIcon = (level: LogLevel) => {
      switch (level) {
        case 'INFO':
          return <Info className="h-4 w-4 text-blue-500" />;
        case 'WARNING':
          return <AlertTriangle className="h-4 w-4 text-amber-500" />;
        case 'ERROR':
          return <XCircle className="h-4 w-4 text-red-500" />;
        case 'CRITICAL':
          return <AlertCircle className="h-4 w-4 text-red-600" />;
        default:
          return <CheckCircle2 className="h-4 w-4 text-gray-500" />;
      }
    };

    const getLevelColor = (level: LogLevel) => {
      switch (level) {
        case 'INFO':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'WARNING':
          return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'ERROR':
          return 'bg-red-100 text-red-800 border-red-200';
        case 'CRITICAL':
          return 'bg-red-100 text-red-900 border-red-300';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    return (
      <div key={log.id} className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex-shrink-0 mt-1">
          {getLevelIcon(log.level)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={`${getLevelColor(log.level)} text-xs px-2 py-1`}>
              {log.level}
            </Badge>
            <Badge variant="secondary" className="text-xs px-2 py-1">
              {log.log_type}
            </Badge>
            {log.tool_name && (
              <Badge variant="outline" className="text-xs px-2 py-1">
                {log.tool_name}
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-gray-900 mb-1 font-medium">
            {log.message}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTimestamp(log.timestamp)}
            </span>
            {log.user_id && (
              <span>User: {log.user_id.slice(0, 8)}...</span>
            )}
            {log.category && (
              <span>Category: {log.category}</span>
            )}
          </div>
          
          {log.details && (
            <details className="mt-2">
              <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                Show details
              </summary>
              <pre className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded border overflow-auto">
                {log.details}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  };

  if (!selectedOrganizationId) {
    return (
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">System Logs</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            Select an organization to view system logs
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <CardTitle className="text-lg font-semibold">System Logs</CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 w-full sm:w-64 h-9"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-2">
              <Select value={logType} onValueChange={(value: LogType | 'all') => handleTypeFilter(value)}>
                <SelectTrigger className="w-32 h-9">
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

              <Select value={level} onValueChange={(value: LogLevel | 'all') => handleLevelFilter(value)}>
                <SelectTrigger className="w-32 h-9">
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

              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="h-9 px-3"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                    <div className="h-5 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-2">Failed to load logs</p>
            <p className="text-sm text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'An unknown error occurred'}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </div>
        ) : !logsData?.logs?.length ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No logs found</p>
            <p className="text-sm text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {logsData.logs.map(renderLogEntry)}
            </div>

            {/* Pagination */}
            {logsData.pagination && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Showing {logsData.pagination.offset + 1} to{' '}
                  {Math.min(
                    logsData.pagination.offset + logsData.pagination.limit,
                    logsData.pagination.total_count
                  )}{' '}
                  of {logsData.pagination.total_count} logs
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={page === 1 || isLoading}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm text-gray-600 min-w-[60px] text-center">
                    Page {page}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!logsData.pagination.has_next || isLoading}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 