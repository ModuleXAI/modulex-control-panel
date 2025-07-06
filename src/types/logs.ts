// Log types based on backend logging.py models

export interface LogsResponse {
  success: boolean;
  logs: LogEntry[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: LogType;
  level?: LogLevel;
  message: string;
  data: Record<string, any>; // JSON data from backend
}

export type LogType = 
  | 'request' 
  | 'security' 
  | 'business' 
  | 'error' 
  | 'system' 
  | 'audit';

export type LogLevel = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface LogFilters {
  type?: LogType;
  level?: LogLevel;
  limit: number;
  offset: number;
  search?: string;
  startDate?: string;
  endDate?: string;
} 