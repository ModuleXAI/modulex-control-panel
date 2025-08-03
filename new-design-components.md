import { useState } from 'react';
import { Search, Heart, ChevronDown, User, ExternalLink, Copy, Plus, Grid3X3, MoreHorizontal, Filter, RefreshCw, ArrowLeft, Trash2, Eye, EyeOff, Download, Users, TrendingUp, Shield, Activity, Zap, Globe, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

// Mock data based on real API responses

// Available Tools (from /integrations/available GET)
const availableTools = [
  {
    id: 29,
    name: "reddit",
    display_name: "Reddit",
    description: "Reddit API integration for posts, comments, subreddits and search functionality",
    author: "ModuleX",
    version: "1.0.0",
    actions: [
      { name: "get_comments_by_submission", description: "Retrieve comments from a specific Reddit submission" },
      { name: "get_comment_by_id", description: "Retrieve a specific comment by its ID" },
      { name: "get_submission", description: "Retrieve a specific submission by its ID" },
      { name: "get_subreddit", description: "Retrieve information about a specific subreddit" },
      { name: "search_posts", description: "Search for posts within a specific subreddit" }
    ],
    auth_schemas: [{
      auth_type: "oauth2",
      setup_environment_variables: [
        { name: "REDDIT_CLIENT_ID", about_url: "https://www.reddit.com/prefs/apps", description: "Reddit application client ID" },
        { name: "REDDIT_CLIENT_SECRET", about_url: "https://www.reddit.com/prefs/apps", description: "Reddit application client secret" }
      ]
    }],
    oauth2_env_available: true,
    logo: "https://cdn.jsdelivr.net/gh/ModuleXAI/logox@main/tools/reddit.svg",
    app_url: "https://reddit.com",
    categories: [
      { id: "social-media", name: "Social Media" },
      { id: "news-&-content", name: "News & Content" },
      { id: "community", name: "Community" }
    ],
    created_at: "2025-06-23T08:17:32.129833+00:00",
    updated_at: "2025-07-29T01:03:40.685897+00:00"
  },
  {
    id: 2,
    name: "github",
    display_name: "GitHub",
    description: "GitHub repository and user management",
    author: "ModuleX",
    version: "1.0.0",
    actions: [
      { name: "list_repositories", description: "List user's GitHub repositories" },
      { name: "create_repository", description: "Create a new GitHub repository" },
      { name: "get_user_info", description: "Get authenticated user information" }
    ],
    auth_schemas: [{
      auth_type: "oauth2",
      setup_environment_variables: [
        { name: "GITHUB_CLIENT_ID", about_url: "https://github.com/settings/applications/new", description: "GitHub client ID" },
        { name: "GITHUB_CLIENT_SECRET", about_url: "https://github.com/settings/applications/new", description: "GitHub client secret" }
      ]
    }],
    oauth2_env_available: true,
    logo: "https://cdn.jsdelivr.net/gh/ModuleXAI/logox@main/tools/github.svg",
    app_url: "https://github.com",
    categories: [
      { id: "developer-tools", name: "Developer Tools" },
      { id: "version-control", name: "Version Control" }
    ],
    created_at: "2025-06-20T00:34:13.456946+00:00",
    updated_at: "2025-07-29T01:03:40.685897+00:00"
  },
  {
    id: 116,
    name: "gmail",
    display_name: "Gmail",
    description: "Gmail integration for sending, reading, and managing emails",
    author: "ModuleX",
    version: "1.0.0",
    actions: [
      { name: "send_email", description: "Send an email to specified recipient" },
      { name: "get_unread_emails", description: "Retrieve unread emails from inbox" },
      { name: "read_email", description: "Read specific email content by email ID" },
      { name: "mark_email_as_read", description: "Mark email as read by email ID" },
      { name: "trash_email", description: "Move email to trash by email ID" },
      { name: "search_emails", description: "Search emails with query" },
      { name: "get_user_profile", description: "Get authenticated user's Gmail profile information" }
    ],
    auth_schemas: [{
      auth_type: "oauth2",
      setup_environment_variables: [
        { name: "GOOGLE_CLIENT_ID", about_url: "https://console.developers.google.com/apis/credentials", description: "Google OAuth2 Client ID" },
        { name: "GOOGLE_CLIENT_SECRET", about_url: "https://console.developers.google.com/apis/credentials", description: "Google OAuth2 Client Secret" }
      ]
    }],
    oauth2_env_available: true,
    logo: "https://cdn.jsdelivr.net/gh/ModuleXAI/logox@main/tools/gmail.svg",
    app_url: "https://mail.google.com",
    categories: [
      { id: "communication", name: "Communication" },
      { id: "email", name: "Email" }
    ],
    created_at: "2025-06-28T21:23:55.418907+00:00",
    updated_at: "2025-07-29T01:03:40.685897+00:00"
  },
  {
    id: 130,
    name: "gdrive",
    display_name: "Google Drive & Docs",
    description: "Google Drive & Docs integration for managing files and folders",
    author: "ModuleX",
    version: "1.0.0",
    actions: [
      { name: "search_files", description: "Search for files in Google Drive" },
      { name: "get_file", description: "Get file content and metadata by file ID" },
      { name: "list_files", description: "List files in Google Drive with optional filters" },
      { name: "create_document", description: "Create a new Google Docs document with content" },
      { name: "create_spreadsheet", description: "Create a new Google Sheets spreadsheet with optional data" }
    ],
    auth_schemas: [{
      auth_type: "oauth2",
      setup_environment_variables: [
        { name: "GOOGLE_CLIENT_ID", about_url: "https://console.developers.google.com/apis/credentials", description: "Google OAuth2 Client ID" },
        { name: "GOOGLE_CLIENT_SECRET", about_url: "https://console.developers.google.com/apis/credentials", description: "Google OAuth2 Client Secret" }
      ]
    }],
    oauth2_env_available: true,
    logo: "https://cdn.jsdelivr.net/gh/ModuleXAI/logox@main/tools/gdrive.svg",
    app_url: "https://drive.google.com",
    categories: [
      { id: "cloud-storage", name: "Cloud Storage" },
      { id: "productivity", name: "Productivity" },
      { id: "document-management", name: "Document Management" }
    ],
    created_at: "2025-06-29T01:47:25.316411+00:00",
    updated_at: "2025-07-29T01:03:40.685897+00:00"
  },
  {
    id: 25,
    name: "n8n",
    display_name: "N8N Workflow Automation",
    description: "Integration with n8n workflow automation platform for managing workflows, nodes, and automations",
    author: "ModuleX",
    version: "1.0.0",
    actions: [
      { name: "test_connection", description: "Test connection to n8n instance using user credentials" },
      { name: "list_workflows", description: "List all workflows from the n8n instance using user credentials" },
      { name: "create_workflow", description: "Create a new workflow in n8n with specified nodes and connections" }
    ],
    auth_schemas: [{
      auth_type: "api_key",
      setup_environment_variables: [
        { name: "N8N_BASE_URL", about_url: "https://docs.n8n.io/hosting/", description: "N8N Instance Base URL" },
        { name: "N8N_API_KEY", about_url: "https://docs.n8n.io/api/", description: "N8N API Key" }
      ]
    }],
    oauth2_env_available: false,
    logo: "https://cdn.jsdelivr.net/gh/ModuleXAI/logox@main/tools/n8n.svg",
    app_url: "https://n8n.io",
    categories: [
      { id: "automation", name: "Automation" },
      { id: "workflow", name: "Workflow" },
      { id: "integration", name: "Integration" }
    ],
    created_at: "2025-06-23T07:03:37.355243+00:00",
    updated_at: "2025-07-29T01:03:40.685897+00:00"
  },
  {
    id: 1,
    name: "r2r",
    display_name: "Sciphi R2R",
    description: "R2R (RAG to Riches) is a production-ready, scalable retrieval-augmented generation system",
    author: "ModuleX",
    version: "1.0.0",
    actions: [
      { name: "search", description: "Perform a vector search in the R2R knowledge base" },
      { name: "rag", description: "Perform a Retrieval-Augmented Generation query" },
      { name: "list_documents", description: "List documents in the R2R system" },
      { name: "get_document", description: "Get detailed information about a specific document" },
      { name: "list_collections", description: "List collections in the R2R system" }
    ],
    auth_schemas: [{
      auth_type: "oauth2",
      setup_environment_variables: [
        { name: "R2R_API_BASE", about_url: "https://docs.sciphi.ai/r2r/getting-started/quick-start", description: "R2R API base URL" },
        { name: "R2R_API_KEY", about_url: "https://docs.sciphi.ai/r2r/getting-started/quick-start", description: "R2R API key" }
      ]
    }],
    oauth2_env_available: false,
    logo: "https://cdn.jsdelivr.net/gh/ModuleXAI/logox@main/tools/r2r.svg",
    app_url: "https://r2r-docs.sciphi.ai",
    categories: [
      { id: "ai-&-machine-learning", name: "AI & Machine Learning" },
      { id: "data-processing", name: "Data Processing" },
      { id: "retrieval-augmented-generation", name: "Retrieval Augmented Generation" }
    ],
    created_at: "2025-06-20T00:34:13.456946+00:00",
    updated_at: "2025-07-28T18:17:07.519662+00:00"
  }
];

// Installed Tools (from /integrations/installed GET)
const installedTools = [
  {
    id: 1,
    name: "github",
    display_name: "GitHub",
    description: "GitHub repository and user management",
    author: "ModuleX",
    version: "1.0.0",
    enabled_actions: [
      { name: "list_repositories", description: "List user's GitHub repositories" },
      { name: "create_repository", description: "Create a new GitHub repository" },
      { name: "get_user_info", description: "Get authenticated user information" }
    ],
    disabled_actions: [],
    environment_variables: {
      GITHUB_CLIENT_ID: "Ov23l***************",
      GITHUB_CLIENT_SECRET: "cdbf6************..."
    },
    installation_status: {
      GITHUB_CLIENT_ID: true,
      GITHUB_CLIENT_SECRET: true
    },
    auth_type: "oauth2",
    env_source: "env_file",
    logo: "https://cdn.jsdelivr.net/gh/ModuleXAI/logox@main/tools/github.svg",
    app_url: "https://github.com",
    categories: [
      { id: "developer-tools", name: "Developer Tools" },
      { id: "version-control", name: "Version Control" }
    ],
    installed_at: "2025-06-20T00:39:22.869744+00:00",
    updated_at: "2025-07-28T18:17:07.532134+00:00",
    organization_id: "d15cc040-8bbc-44fe-ae46-a7c76da7d416",
    status: "ENABLED"
  },
  {
    id: 5,
    name: "r2r",
    display_name: "Sciphi R2R",
    description: "R2R (RAG to Riches) is a production-ready, scalable retrieval-augmented generation system",
    author: "ModuleX",
    version: "1.0.0",
    enabled_actions: [
      { name: "search", description: "Perform a vector search in the R2R knowledge base" },
      { name: "rag", description: "Perform a Retrieval-Augmented Generation query" },
      { name: "list_documents", description: "List documents in the R2R system" },
      { name: "get_document", description: "Get detailed information about a specific document" },
      { name: "list_collections", description: "List collections in the R2R system" }
    ],
    disabled_actions: [],
    environment_variables: {
      R2R_API_BASE: "http:************...",
      R2R_API_KEY: "pk_GG************..."
    },
    installation_status: {
      R2R_API_KEY: true,
      R2R_API_BASE: true
    },
    auth_type: "oauth2",
    env_source: "env_file",
    logo: "https://cdn.jsdelivr.net/gh/ModuleXAI/logox@main/tools/r2r.svg",
    app_url: "https://r2r-docs.sciphi.ai",
    categories: [
      { id: "ai-&-machine-learning", name: "AI & Machine Learning" },
      { id: "data-processing", name: "Data Processing" },
      { id: "retrieval-augmented-generation", name: "Retrieval Augmented Generation" }
    ],
    installed_at: "2025-07-08T01:53:53.474036+00:00",
    updated_at: "2025-07-08T01:53:53.474036+00:00",
    organization_id: "d15cc040-8bbc-44fe-ae46-a7c76da7d416",
    status: "ENABLED"
  },
  {
    id: 3,
    name: "gmail",
    display_name: "Gmail",
    description: "Gmail integration for sending, reading, and managing emails",
    author: "ModuleX",
    version: "1.0.0",
    enabled_actions: [
      { name: "send_email", description: "Send an email to specified recipient" },
      { name: "get_unread_emails", description: "Retrieve unread emails from inbox" },
      { name: "read_email", description: "Read specific email content by email ID" },
      { name: "mark_email_as_read", description: "Mark email as read by email ID" },
      { name: "trash_email", description: "Move email to trash by email ID" },
      { name: "search_emails", description: "Search emails with query" },
      { name: "get_user_profile", description: "Get authenticated user's Gmail profile information" }
    ],
    disabled_actions: [],
    environment_variables: {
      GOOGLE_CLIENT_ID: "15966************...",
      GOOGLE_CLIENT_SECRET: "GOCSP************..."
    },
    installation_status: {
      GOOGLE_CLIENT_ID: true,
      GOOGLE_CLIENT_SECRET: true
    },
    auth_type: "oauth2",
    env_source: "env_file",
    logo: "https://cdn.jsdelivr.net/gh/ModuleXAI/logox@main/tools/gmail.svg",
    app_url: "https://mail.google.com",
    categories: [
      { id: "communication", name: "Communication" },
      { id: "email", name: "Email" }
    ],
    installed_at: "2025-07-02T03:55:12.282209+00:00",
    updated_at: "2025-07-28T18:17:07.532134+00:00",
    organization_id: "d15cc040-8bbc-44fe-ae46-a7c76da7d416",
    status: "DISABLED"
  }
];

// Users (from /dashboard/users GET)
const users = [
  {
    id: "d01fa470-13ed-42ce-b488-7d1ec6cc355f",
    email: "admin@modulex.dev",
    username: "admin",
    avatar: null,
    is_active: true,
    created_at: "2025-07-11T05:42:10.711988",
    updated_at: "2025-07-11T05:42:10.711991",
    last_active_at: "2025-07-29T04:24:22.485160",
    tool_count: 0,
    active_tool_count: 0,
    total_logins: 23
  },
  {
    id: "3dd95ccb-4050-43b7-a217-b577b1e2ad0a",
    email: "user_3dd95ccb-4050-43b7-a217-b577b1e2ad0a@placeholder.local",
    username: null,
    avatar: null,
    is_active: true,
    created_at: "2025-07-02T03:16:19.846459",
    updated_at: "2025-07-02T03:16:19.846461",
    last_active_at: null,
    tool_count: 0,
    active_tool_count: 0,
    total_logins: 0
  },
  {
    id: "afff5573-0afe-4615-997f-77ae8efb4611",
    email: "user_afff5573-0afe-4615-997f-77ae8efb4611@placeholder.local",
    username: null,
    avatar: null,
    is_active: true,
    created_at: "2025-06-30T23:46:24.397215",
    updated_at: "2025-06-30T23:46:24.397218",
    last_active_at: null,
    tool_count: 2,
    active_tool_count: 2,
    total_logins: 0
  },
  {
    id: "18673133-d617-40fb-a0b0-d0f416826519",
    email: "user_18673133-d617-40fb-a0b0-d0f416826519@placeholder.local",
    username: null,
    avatar: null,
    is_active: true,
    created_at: "2025-06-23T09:39:49.868110",
    updated_at: "2025-06-23T09:39:49.868113",
    last_active_at: null,
    tool_count: 1,
    active_tool_count: 1,
    total_logins: 0
  },
  {
    id: "6825bd6e-2803-4a23-9657-a346706947a7",
    email: "user_6825bd6e-2803-4a23-9657-a346706947a7@placeholder.local",
    username: null,
    avatar: null,
    is_active: true,
    created_at: "2025-06-21T04:49:09.054261",
    updated_at: "2025-06-21T04:49:09.054263",
    last_active_at: null,
    tool_count: 2,
    active_tool_count: 2,
    total_logins: 0
  },
  {
    id: "51b04dcb-e8e6-4350-9848-a7c9c937dfc3",
    email: "user_51b04dcb-e8e6-4350-9848-a7c9c937dfc3@placeholder.local",
    username: null,
    avatar: null,
    is_active: true,
    created_at: "2025-06-12T05:00:33.742686",
    updated_at: "2025-06-12T05:00:33.742689",
    last_active_at: null,
    tool_count: 3,
    active_tool_count: 2,
    total_logins: 0
  }
];

// Analytics Data (from various /dashboard/analytics/* GET)
const analyticsData = {
  overview: {
    total_users: 6,
    total_tools: 6,
    active_tools: 3,
    system_health: "optimal",
    user_growth: [],
    tool_usage: [],
    system_performance: [
      { time: "05:00", cpu: 45, memory: 62, response_time: 120 },
      { time: "08:00", cpu: 45, memory: 62, response_time: 120 },
      { time: "17:00", cpu: 45, memory: 62, response_time: 49 },
      { time: "18:00", cpu: 45, memory: 62, response_time: 122 },
      { time: "19:00", cpu: 45, memory: 62, response_time: 82 },
      { time: "20:00", cpu: 45, memory: 62, response_time: 155 },
      { time: "23:00", cpu: 45, memory: 62, response_time: 11 }
    ],
    recent_alerts: []
  },
  users: {
    total_users: 6,
    new_users: { value: 3, change: 23, change_type: "increase", period: "30d" },
    active_users: { value: 0, change: 15, change_type: "increase", period: "30d" },
    avg_session_time: { value: 24, change: 5, change_type: "increase", period: "30d" },
    user_growth: [
      { date: "2025-06-30T00:00:00", new_users: 1, total_users: 1 },
      { date: "2025-07-02T00:00:00", new_users: 1, total_users: 2 },
      { date: "2025-07-11T00:00:00", new_users: 1, total_users: 3 }
    ],
    top_users: [
      {
        id: "51b04dcb-e8e6-4350-9848-a7c9c937dfc3",
        name: "Unknown",
        email: "user_51b04dcb-e8e6-4350-9848-a7c9c937dfc3@placeholder.local",
        tools_used: 3,
        last_active: "Never"
      },
      {
        id: "6825bd6e-2803-4a23-9657-a346706947a7",
        name: "Unknown",
        email: "user_6825bd6e-2803-4a23-9657-a346706947a7@placeholder.local",
        tools_used: 2,
        last_active: "Never"
      }
    ]
  },
  tools: {
    total_installations: { value: 0, change: 28, change_type: "increase", period: "7d" },
    tool_executions: { value: 0, change: 15, change_type: "increase", period: "7d" },
    success_rate: { value: 0, change: 0.5, change_type: "increase", period: "7d" },
    avg_execution_time: { value: 275, change: -12, change_type: "decrease", period: "7d" },
    tool_adoption: [],
    tool_usage_by_category: [],
    top_tools: [],
    tool_performance: []
  },
  performance: {
    avg_response_time: { value: 128, change: -8, change_type: "decrease", period: "24h" },
    uptime: { value: 99.95, change: 0, change_type: "stable", period: "30d" },
    request_volume: { value: 0, change: 12, change_type: "increase", period: "24h" },
    error_rate: { value: 0, change: -0.05, change_type: "decrease", period: "24h" },
    system_metrics: [
      { name: "CPU Usage", value: 68, color: "#3b82f6" },
      { name: "Memory Usage", value: 74, color: "#10b981" },
      { name: "Disk Usage", value: 45, color: "#f59e0b" }
    ]
  },
  security: {
    security_score: 91,
    failed_logins: { value: 0, change: -15, change_type: "decrease", period: "24h" },
    suspicious_activities: { value: 0, change: 2, change_type: "increase", period: "24h" },
    active_sessions: 342,
    suspicious_ips: [],
    recent_security_events: [
      { id: 614482, type: "token_refresh", message: "TOKEN_REFRESH event", severity: "info", time: "4 hours ago" },
      { id: 150379, type: "token_refresh", message: "TOKEN_REFRESH event", severity: "info", time: "4 hours ago" },
      { id: 5884, type: "token_refresh", message: "TOKEN_REFRESH event", severity: "info", time: "8 hours ago" }
    ]
  }
};

// Logs (from /dashboard/logs GET)
const logs = [
  {
    id: "ade524e4-8abb-43ec-a1fa-bb865ac78652",
    timestamp: "2025-07-29T04:33:29.574383",
    log_type: "security",
    level: "INFO",
    user_id: "d01fa470-13ed-42ce-b488-7d1ec6cc355f",
    message: "LOGIN: Security event",
    success: true,
    tool_name: null,
    category: "Security",
    details: "LOGIN"
  },
  {
    id: "0d0fbf6d-68f3-40b6-a051-e04cd2fc5599",
    timestamp: "2025-07-29T04:32:46.957702",
    log_type: "security",
    level: "INFO",
    user_id: "d01fa470-13ed-42ce-b488-7d1ec6cc355f",
    message: "TOKEN_REFRESH: Security event",
    success: true,
    tool_name: null,
    category: "Security",
    details: "TOKEN_REFRESH"
  },
  {
    id: "c7ce52cc-5ab4-4c2e-92c8-421055cf26ca",
    timestamp: "2025-07-29T03:03:02.562780",
    log_type: "business",
    level: "INFO",
    user_id: "d01fa470-13ed-42ce-b488-7d1ec6cc355f",
    message: "TOOL_UNINSTALL - reddit ()",
    success: true,
    tool_name: "reddit",
    category: "Integration",
    details: "TOOL_UNINSTALL"
  },
  {
    id: "1b36c861-4c05-48c3-93a6-5f51d7eb1c74",
    timestamp: "2025-07-29T02:41:03.212322",
    log_type: "business",
    level: "INFO",
    user_id: "d01fa470-13ed-42ce-b488-7d1ec6cc355f",
    message: "TOOL_UNINSTALL - gdrive ()",
    success: true,
    tool_name: "gdrive",
    category: "Integration",
    details: "TOOL_UNINSTALL"
  },
  {
    id: "88f8f1fd-fc22-408a-b57b-65fcca97a6f0",
    timestamp: "2025-07-29T00:08:12.185223",
    log_type: "system",
    level: "CRITICAL",
    user_id: null,
    message: "MIGRATION: Database migrations failed: cannot import name 'get_database_url' from 'app.core.database'",
    success: false,
    tool_name: null,
    category: "Database",
    details: "MIGRATION"
  }
];

const toolOptions = [
  { name: 'OpenAI', icon: '🤖', selected: true },
  { name: 'Anthropic', icon: '🧠', selected: false },
  { name: 'LangChain', icon: '🔗', selected: false },
  { name: 'AI SDK', icon: '⚡', selected: false }
];

const apiKeys = [
  {
    id: 1,
    name: 'production_key',
    key: 'zr15nx...',
    created: 'Jul 28, 2025 at 09:15 AM',
    lastUsed: 'Just now'
  },
  {
    id: 2,
    name: 'development_key',
    key: 'ak23mw...',
    created: 'Jul 25, 2025 at 02:30 PM',
    lastUsed: '2 hours ago'
  }
];

export default function ToolkitDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');
  const [activeLogTab, setActiveLogTab] = useState('Tools');
  const [activeSettingsTab, setActiveSettingsTab] = useState('General');
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState('Overview');
  const [selectedTool, setSelectedTool] = useState(null);
  const [activeToolTab, setActiveToolTab] = useState('Actions');
  const [selectedInstalledTool, setSelectedInstalledTool] = useState(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  const tabs = ['Overview', 'Browse Tools', 'My Tools', 'Analytics', 'Users', 'Logs', 'Settings'];

  const getAuthTypeColor = (authType) => {
    switch (authType) {
      case 'oauth2':
        return 'bg-blue-100 text-blue-800';
      case 'bearer_token':
        return 'bg-purple-100 text-purple-800';
      case 'api_key':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (email, username) => {
    if (username) return username.substring(0, 2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return '??';
  };

  const handleExploreClick = (section) => {
    if (section === 'Browse Toolkits') {
      setActiveTab('Browse Tools');
    } else {
      console.log(`Clicked: ${section}`);
    }
  };

  const renderInstalledToolDetail = () => {
    if (!selectedInstalledTool) return null;

    return (
      <div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedInstalledTool(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <img src={selectedInstalledTool.logo} alt={selectedInstalledTool.display_name} className="w-12 h-12 rounded-lg" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedInstalledTool.display_name}</h1>
                  <span className="text-sm text-gray-500 uppercase tracking-wide font-medium">{selectedInstalledTool.name}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                View Documentation
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Uninstall
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-6 max-w-4xl leading-relaxed">{selectedInstalledTool.description}</p>

          {/* Status and Info */}
          <div className="flex items-center gap-6 mb-6">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedInstalledTool.status === 'ENABLED' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {selectedInstalledTool.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAuthTypeColor(selectedInstalledTool.auth_type)}`}>
              {selectedInstalledTool.auth_type.toUpperCase()}
            </span>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Grid3X3 className="w-4 h-4" />
                <span>{selectedInstalledTool.enabled_actions.length} Actions</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Installed {formatDate(selectedInstalledTool.installed_at)}</span>
              </div>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex space-x-8">
            {['Actions', 'Environment', 'Settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveToolTab(tab)}
                className={`py-2 px-1 border-b-2 text-sm font-medium ${
                  activeToolTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          {activeToolTab === 'Actions' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Actions</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search actions"
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {selectedInstalledTool.enabled_actions.map((action, index) => (
                  <div key={index} className={`flex items-start justify-between p-4 hover:bg-gray-50 transition-colors ${
                    index !== selectedInstalledTool.enabled_actions.length - 1 ? 'border-b border-gray-200' : ''
                  }`}>
                    <div className="flex-shrink-0 w-80">
                      <h3 className="text-sm font-medium text-gray-900">{action.name}</h3>
                    </div>
                    <div className="flex-1 ml-6">
                      <p className="text-sm text-gray-600 leading-relaxed">{action.description}</p>
                    </div>
                    <div className="ml-4">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        ENABLED
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeToolTab === 'Environment' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Environment Variables</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  Update Variables
                </button>
              </div>

              <div className="space-y-4">
                {Object.entries(selectedInstalledTool.environment_variables).map(([key, value]) => (
                  <div key={key} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">{key}</label>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        selectedInstalledTool.installation_status[key] 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedInstalledTool.installation_status[key] ? 'CONFIGURED' : 'MISSING'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        value={value}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 font-mono text-sm"
                      />
                      <button className="p-2 text-gray-500 hover:text-gray-700">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeToolTab === 'Settings' && (
            <div className="space-y-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tool Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="status" 
                          value="ENABLED" 
                          defaultChecked={selectedInstalledTool.status === 'ENABLED'}
                          className="mr-2" 
                        />
                        <span className="text-sm text-gray-700">Enabled</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="status" 
                          value="DISABLED" 
                          defaultChecked={selectedInstalledTool.status === 'DISABLED'}
                          className="mr-2" 
                        />
                        <span className="text-sm text-gray-700">Disabled</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-red-200 p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
                <p className="text-red-600 mb-4">Permanently uninstall this tool and remove all configurations.</p>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Uninstall Tool
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderToolDetail = () => {
    if (!selectedTool) return null;

    return (
      <div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedTool(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <img src={selectedTool.logo} alt={selectedTool.display_name} className="w-12 h-12 rounded-lg" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedTool.display_name}</h1>
                  <span className="text-sm text-gray-500 uppercase tracking-wide font-medium">{selectedTool.name}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                View Documentation
              </button>
              <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Install Tool
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-6 max-w-4xl leading-relaxed">{selectedTool.description}</p>

          {/* Tags and Stats */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-6">
              <div className="flex gap-2">
                {selectedTool.auth_schemas.map((schema, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 rounded text-xs font-medium ${getAuthTypeColor(schema.auth_type)}`}
                  >
                    {schema.auth_type.toUpperCase()}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Grid3X3 className="w-4 h-4" />
                  <span>{selectedTool.actions.length} Actions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <span>v{selectedTool.version}</span>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <span>Categories: </span>
              <span className="text-gray-900">{selectedTool.categories.map(cat => cat.name).join(', ')}</span>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex space-x-8">
            {['Actions', 'Authentication'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveToolTab(tab)}
                className={`py-2 px-1 border-b-2 text-sm font-medium ${
                  activeToolTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          {activeToolTab === 'Actions' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Actions</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search actions"
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {selectedTool.actions.map((action, index) => (
                  <div key={index} className={`flex items-start justify-between p-4 hover:bg-gray-50 transition-colors ${
                    index !== selectedTool.actions.length - 1 ? 'border-b border-gray-200' : ''
                  }`}>
                    <div className="flex-shrink-0 w-80">
                      <h3 className="text-sm font-medium text-gray-900">{action.name}</h3>
                    </div>
                    <div className="flex-1 ml-6">
                      <p className="text-sm text-gray-600 leading-relaxed">{action.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeToolTab === 'Authentication' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Authentication Setup</h2>
                <p className="text-gray-600 mt-1">Configure authentication credentials for this tool.</p>
              </div>

              {selectedTool.auth_schemas.map((schema, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{schema.auth_type.toUpperCase()} Configuration</h3>
                  
                  <div className="space-y-4">
                    {schema.setup_environment_variables.map((env, envIndex) => (
                      <div key={envIndex}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {env.name}
                          <a href={env.about_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:text-blue-700">
                            <ExternalLink className="w-3 h-3 inline" />
                          </a>
                        </label>
                        <p className="text-sm text-gray-600 mb-2">{env.description}</p>
                        <input
                          type="text"
                          placeholder={env.sample_format || `Enter ${env.name}`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end mt-6">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Test Connection
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="flex gap-8">
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Get started with building smarter agents</h1>
          <p className="text-lg text-gray-600">Jump into the playground and explore powerful AI tools in action, or head straight to setting up Auth for toolkits</p>
        </div>

        {/* Execute your first tool */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Execute your first tool</h2>
          
          {/* Tool Selection */}
          <div className="grid grid-cols-5 gap-3 mb-8">
            {toolOptions.map((tool) => (
              <div
                key={tool.name}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  tool.selected 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{tool.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{tool.name}</div>
                </div>
              </div>
            ))}
            <div className="p-4 rounded-lg border-2 border-gray-200 bg-white hover:border-gray-300 cursor-pointer">
              <div className="text-center">
                <div className="text-2xl mb-2">📋</div>
                <div className="text-sm font-medium text-gray-900">Browse all</div>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">1</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Install ModuleX</h3>
                <p className="text-gray-600 mb-4">Install the SDK for OpenAI</p>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">python</span>
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">typescript</span>
                    </div>
                    <Copy className="w-4 h-4 text-gray-400 cursor-pointer" />
                  </div>
                  <code className="text-green-400 text-sm">pip install modulex-core openai</code>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">2</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Connect an account</h3>
                <p className="text-gray-600 mb-4">Connect an account for your toolkit</p>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">python</span>
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">typescript</span>
                    </div>
                    <Copy className="w-4 h-4 text-gray-400 cursor-pointer" />
                  </div>
                  <pre className="text-green-400 text-sm">
{`from modulex import ModuleX

modulex = ModuleX(api_key="your-api-key")

connection_request = modulex.tools.authorize(
    user_id="user-id",
    tool="gmail",
)

redirect_url = connection_request.redirect_url

# Wait for the connection to be established
connection_request.wait_for_connection()`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">3</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Fetch and Execute</h3>
                <p className="text-gray-600 mb-4">Execute actions with your installed tools</p>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">python</span>
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">typescript</span>
                    </div>
                    <Copy className="w-4 h-4 text-gray-400 cursor-pointer" />
                  </div>
                  <pre className="text-green-400 text-sm">
{`openai_client = OpenAI()

# Get installed tools that are configured
tools = modulex.tools.get(user_id="default", tools=["GMAIL_SEND_EMAIL"])

response = openai_client.chat.completions.create(
    model="gpt-4o-mini",
    tools=tools,
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Send an email..."}
    ]
)`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Explore the Platform</h3>
          
          <div className="space-y-4">
            <div 
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer group"
              onClick={() => handleExploreClick('Browse Toolkits')}
            >
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <span className="text-blue-600">🔧</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">Browse Toolkits</h4>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </div>
                <p className="text-sm text-gray-600 mt-1">Explore our toolkits for more than 500 services. See supported tools, triggers, and schema details.</p>
              </div>
            </div>

            <div 
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer group"
              onClick={() => handleExploreClick('Documentation')}
            >
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <span className="text-green-600">📚</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">Documentation</h4>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </div>
                <p className="text-sm text-gray-600 mt-1">Get started fast with guides, setup instructions, and best practices across the platform.</p>
              </div>
            </div>

            <div 
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer group"
              onClick={() => handleExploreClick('SDK')}
            >
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <span className="text-purple-600">⚙️</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">SDK</h4>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </div>
                <p className="text-sm text-gray-600 mt-1">Integrate ModuleX programmatically using our SDKs. Supports custom triggers, tools, and environment setup.</p>
              </div>
            </div>

            <div 
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer group"
              onClick={() => handleExploreClick('Community')}
            >
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <span className="text-orange-600">👥</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">Community</h4>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </div>
                <p className="text-sm text-gray-600 mt-1">Join our community to get help, share your ideas, and stay up to date with the latest news.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => {
    const analyticsSubTabs = ['Overview', 'Users', 'Tools', 'Performance', 'Security'];

    const renderAnalyticsOverview = () => (
      <div className="space-y-8">
        {/* Main Metrics */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border-2 border-blue-200 p-6 hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.overview.total_users}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-sm font-medium">+15.2%</span>
              <span className="text-gray-500 text-sm">vs previous period</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-green-200 p-6 hover:border-green-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Tools</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.overview.active_tools}/{analyticsData.overview.total_tools}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-sm font-medium">50%</span>
              <span className="text-gray-500 text-sm">Tool utilization rate</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-purple-200 p-6 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg Response Time</p>
                <p className="text-3xl font-bold text-gray-900">108ms</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-sm font-medium">-5.3%</span>
              <span className="text-gray-500 text-sm">Performance improved</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-emerald-200 p-6 hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">System Health</p>
                <p className="text-3xl font-bold text-gray-900">99.9%</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 text-sm font-medium">Healthy</span>
              <span className="text-gray-500 text-sm">Security score: 95/100</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
              <span className="text-green-600 text-sm font-medium">+15.2%</span>
            </div>
            <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tool Usage Distribution</h3>
              <span className="text-blue-600 text-sm font-medium">Top 5</span>
            </div>
            <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
              <div className="w-24 h-24 border-8 border-blue-200 border-t-blue-600 rounded-full"></div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>GitHub</span><span>35%</span></div>
              <div className="flex justify-between"><span>Gmail</span><span>25%</span></div>
              <div className="flex justify-between"><span>R2R</span><span>20%</span></div>
              <div className="flex justify-between"><span>N8N</span><span>15%</span></div>
              <div className="flex justify-between"><span>Others</span><span>5%</span></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">API Performance Over Time</h3>
            <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
              <Activity className="w-8 h-8 text-gray-400" />
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Response Time</span>
              <span>Request Count</span>
            </div>
          </div>
        </div>
      </div>
    );

    const renderAnalyticsUsers = () => (
      <div className="space-y-8">
        {/* User Metrics */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border-2 border-blue-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">New Users</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.users.new_users.value}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-sm font-medium">+{analyticsData.users.new_users.change}%</span>
              <span className="text-gray-500 text-sm">This period</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-green-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Users</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.users.active_users.value}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-sm font-medium">+{analyticsData.users.active_users.change}%</span>
              <span className="text-gray-500 text-sm">Of total users</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-purple-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg Session Time</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.users.avg_session_time.value}m</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-sm font-medium">+{analyticsData.users.avg_session_time.change}m</span>
              <span className="text-gray-500 text-sm">Per session</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-orange-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.users.total_users}</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-sm font-medium">All time</span>
              <span className="text-gray-500 text-sm">Registered</span>
            </div>
          </div>
        </div>

        {/* Most Active Users */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Most Active Users</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {analyticsData.users.top_users.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-700">{getInitials(user.email, user.name)}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{user.tools_used} tools</div>
                  <div className="text-sm text-gray-500">{user.last_active}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    return (
      <div>
        {/* Analytics Sub Navigation */}
        <div className="mb-6">
          <div className="flex space-x-8">
            {analyticsSubTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveAnalyticsTab(tab)}
                className={`py-2 px-1 border-b-2 text-sm font-medium ${
                  activeAnalyticsTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Content */}
        {activeAnalyticsTab === 'Overview' && renderAnalyticsOverview()}
        {activeAnalyticsTab === 'Users' && renderAnalyticsUsers()}
        {activeAnalyticsTab === 'Tools' && (
          <div className="space-y-8">
            {/* Tools Metrics */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-white rounded-xl border-2 border-blue-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Installations</p>
                    <p className="text-3xl font-bold text-gray-900">{analyticsData.tools.total_installations.value}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Grid3X3 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-sm font-medium">+{analyticsData.tools.total_installations.change}%</span>
                  <span className="text-gray-500 text-sm">This period</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-green-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Tool Executions</p>
                    <p className="text-3xl font-bold text-gray-900">{analyticsData.tools.tool_executions.value}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-sm font-medium">+{analyticsData.tools.tool_executions.change}%</span>
                  <span className="text-gray-500 text-sm">Total executions</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-emerald-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Success Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{analyticsData.tools.success_rate.value}%</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 text-sm font-medium">Good</span>
                  <span className="text-gray-500 text-sm">Execution success</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-purple-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Avg Execution Time</p>
                    <p className="text-3xl font-bold text-gray-900">{analyticsData.tools.avg_execution_time.value}ms</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-sm font-medium">{analyticsData.tools.avg_execution_time.change}%</span>
                  <span className="text-gray-500 text-sm">Performance improved</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeAnalyticsTab === 'Performance' && (
          <div className="space-y-8">
            {/* Performance Metrics */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-white rounded-xl border-2 border-blue-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Avg Response Time</p>
                    <p className="text-3xl font-bold text-gray-900">{analyticsData.performance.avg_response_time.value}ms</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-sm font-medium">{analyticsData.performance.avg_response_time.change}%</span>
                  <span className="text-gray-500 text-sm">P50 latency</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-green-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Uptime</p>
                    <p className="text-3xl font-bold text-gray-900">{analyticsData.performance.uptime.value}%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-sm font-medium">Excellent</span>
                  <span className="text-gray-500 text-sm">Last 30 days</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-purple-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Request Volume</p>
                    <p className="text-3xl font-bold text-gray-900">{analyticsData.performance.request_volume.value}k/h</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-sm font-medium">+{analyticsData.performance.request_volume.change}%</span>
                  <span className="text-gray-500 text-sm">Average per hour</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-red-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Error Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{analyticsData.performance.error_rate.value}%</p>
                  </div>
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-sm font-medium">{analyticsData.performance.error_rate.change}%</span>
                  <span className="text-gray-500 text-sm">Of total requests</span>
                </div>
              </div>
            </div>

            {/* Performance Charts and Resources */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Response Time Distribution</h3>
                  <span className="text-blue-600 text-sm font-medium">24 hours</span>
                </div>
                <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                  <Activity className="w-8 h-8 text-gray-400" />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">System Resources</h3>
                  <span className="text-green-600 text-sm font-medium">Real-time</span>
                </div>
                <div className="space-y-4">
                  {analyticsData.performance.system_metrics.map((metric, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-700">{metric.name}</span>
                      <span className="text-gray-900 font-medium">{metric.value}%</span>
                    </div>
                  ))}
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Overall system health:</span>
                      <span className="text-green-600 font-medium">Optimal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeAnalyticsTab === 'Security' && (
          <div className="space-y-8">
            {/* Security Metrics */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-white rounded-xl border-2 border-green-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Security Score</p>
                    <p className="text-3xl font-bold text-gray-900">{analyticsData.security.security_score}/100</p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-sm font-medium">Excellent</span>
                  <span className="text-gray-500 text-sm">Overall security health</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-red-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Failed Logins</p>
                    <p className="text-3xl font-bold text-gray-900">{analyticsData.security.failed_logins.value}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-sm font-medium">{analyticsData.security.failed_logins.change}%</span>
                  <span className="text-gray-500 text-sm">Last 24 hours</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-orange-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Suspicious Activities</p>
                    <p className="text-3xl font-bold text-gray-900">{analyticsData.security.suspicious_activities.value}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-600 text-sm font-medium">Monitoring</span>
                  <span className="text-gray-500 text-sm">Active threats</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-blue-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Active Sessions</p>
                    <p className="text-3xl font-bold text-gray-900">{analyticsData.security.active_sessions}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 text-sm font-medium">Active</span>
                  <span className="text-gray-500 text-sm">Authenticated users</span>
                </div>
              </div>
            </div>

            {/* Recent Security Events */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Security Events</h3>
                <span className="text-green-600 text-sm font-medium">Live</span>
              </div>
              <div className="space-y-4">
                {analyticsData.security.recent_security_events.slice(0, 5).map((event, index) => (
                  <div key={event.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="text-sm text-gray-900">{event.message}</div>
                    <div className="text-xs text-gray-500 mt-1">{event.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderUsers = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.is_active).length;
    const inactiveUsers = users.filter(user => !user.is_active).length;
    const newUsersToday = users.filter(user => {
      const today = new Date().toISOString().split('T')[0];
      return user.created_at.split('T')[0] === today;
    }).length;

    return (
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border-2 border-blue-200 p-6 hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
                <p className="text-gray-500 text-xs mt-1">All registered users</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-green-200 p-6 hover:border-green-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Active Users</p>
                <p className="text-3xl font-bold text-gray-900">{activeUsers}</p>
                <p className="text-gray-500 text-xs mt-1">Currently active</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-red-200 p-6 hover:border-red-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Inactive Users</p>
                <p className="text-3xl font-bold text-gray-900">{inactiveUsers}</p>
                <p className="text-gray-500 text-xs mt-1">Need attention</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-red-500 rounded-full opacity-60"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-purple-200 p-6 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">New Today</p>
                <p className="text-3xl font-bold text-gray-900">{newUsersToday}</p>
                <p className="text-gray-500 text-xs mt-1">Joined today</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <option>All Tools</option>
                <option>0-2 Tools</option>
                <option>3-5 Tools</option>
                <option>6+ Tools</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
            
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <option>Sort: Created (Newest)</option>
                <option>Sort: Created (Oldest)</option>
                <option>Sort: Name (A-Z)</option>
                <option>Sort: Name (Z-A)</option>
                <option>Sort: Last Active</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  USER
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TOOLS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CREATED
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LAST ACTIVE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-700">{getInitials(user.email, user.username)}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.username || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{user.tool_count}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{formatDate(user.created_at)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${
                      !user.last_active_at ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {formatDate(user.last_active_at)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{users.length}</span> of{' '}
            <span className="font-medium">{users.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
              1
            </button>
            <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled>
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderLogs = () => (
    <div>
      {/* Sub tabs */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-8">
            {['Tools', 'Triggers'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveLogTab(tab)}
                className={`py-2 px-1 border-b-2 text-sm font-medium ${
                  activeLogTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Add filters
            </button>
            
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <option>All time</option>
                <option>Last 24 hours</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
            
            <button className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                TIMESTAMP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                TYPE
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                MESSAGE
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                LEVEL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                TOOL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                STATUS
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{formatDate(log.timestamp)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    log.log_type === 'security' ? 'bg-blue-100 text-blue-800' :
                    log.log_type === 'business' ? 'bg-green-100 text-green-800' :
                    log.log_type === 'system' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {log.log_type.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900">{log.message}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    log.level === 'INFO' ? 'bg-blue-100 text-blue-800' :
                    log.level === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {log.level}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{log.tool_name || '-'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {log.success !== null && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {log.success ? 'SUCCESS' : 'FAILED'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="flex gap-8">
      {/* Sidebar */}
      <div className="w-64">
        <div className="mb-6">
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />
            Back to Organization
          </button>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Workspace Settings</h1>
        
        <nav className="space-y-1">
          {['General', 'API Management', 'Integrations', 'Advanced'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSettingsTab(tab)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                activeSettingsTab === tab
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {activeSettingsTab === 'General' && (
          <div className="space-y-8">
            {/* Project Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Workspace Information</h2>
              <p className="text-gray-600 mb-6">Basic information about your workspace.</p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Workspace Name</label>
                    <input
                      type="text"
                      defaultValue="My Organization"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Workspace ID</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value="ws_2UvO9BjDA_VC"
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                      <button className="p-2 text-gray-500 hover:text-gray-700">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your workspace..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex justify-end">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSettingsTab === 'API Management' && (
          <div className="space-y-8">
            {/* API Keys Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">API Keys</h2>
                  <p className="text-gray-600 mt-1">Manage your API keys for accessing our services.</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Generate New Key
                </button>
              </div>

              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">API Key</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Used</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {apiKeys.map((apiKey) => (
                      <tr key={apiKey.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900">{apiKey.name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <code className="text-sm text-gray-600 font-mono">{apiKey.key}</code>
                            <button className="text-gray-400 hover:text-gray-600">
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{apiKey.created}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{apiKey.lastUsed}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button className="text-gray-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSettingsTab === 'Integrations' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connected Services</h2>
            <p className="text-gray-600 mb-6">Manage your integrated third-party services.</p>
            
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Grid3X3 className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-500">No integrations configured yet.</p>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Browse Integrations
              </button>
            </div>
          </div>
        )}

        {activeSettingsTab === 'Advanced' && (
          <div className="space-y-8">
            {/* Debug Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Debug Information</h2>
                  <p className="text-gray-600 mt-1">Technical details for troubleshooting and support.</p>
                </div>
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => console.log('Debug info copied to clipboard')}
                >
                  <Copy className="w-4 h-4" />
                  Copy Debug Info
                </button>
              </div>

              <button
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                {showDebugInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showDebugInfo ? 'Hide' : 'Show'} Debug Information
              </button>

              {showDebugInfo && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
{`Workspace ID: ws_2UvO9BjDA_VC
Organization ID: org_1A2B3C4D5E
API Version: v2.1.0
Region: us-east-1
Created: 2025-07-01T10:30:00Z
Last Activity: 2025-07-28T14:22:15Z
Features: [api_keys, webhooks, advanced_auth]
Rate Limits: 1000/hour
Storage Used: 2.3GB / 10GB`}
                  </pre>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-xl border border-red-200 p-6">
              <h2 className="text-xl font-semibold text-red-900 mb-2">Danger Zone</h2>
              <p className="text-red-600 mb-6">Irreversible and destructive actions.</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Reset All Configurations</h3>
                    <p className="text-sm text-gray-600">Clear all auth configs and API keys.</p>
                  </div>
                  <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50">
                    Reset
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Delete Workspace</h3>
                    <p className="text-sm text-gray-600">Permanently delete this workspace and all its data.</p>
                  </div>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderMyTools = () => {
    // If an installed tool is selected, show the detail page
    if (selectedInstalledTool) {
      return renderInstalledToolDetail();
    }

    return (
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Tools</h1>
          <div className="flex items-center gap-3">
            <button 
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              onClick={() => setActiveTab('Browse Tools')}
            >
              <Grid3X3 className="w-4 h-4" />
              Browse All Tools
            </button>
            <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Install Tool
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <option>All Tools</option>
                <option>GitHub</option>
                <option>Gmail</option>
                <option>R2R</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <option>All Statuses</option>
                <option>Enabled</option>
                <option>Disabled</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <option>All Auth</option>
                <option>OAuth2</option>
                <option>API Key</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search Tools"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
            
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <option>Sort: Updated (Latest)</option>
                <option>Sort: Updated (Oldest)</option>
                <option>Sort: Name (A-Z)</option>
                <option>Sort: Name (Z-A)</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {installedTools.map((tool) => (
            <div 
              key={tool.id} 
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedInstalledTool(tool)}
            >
              <div className="flex items-start space-x-4 mb-4">
                <img src={tool.logo} alt={tool.display_name} className="w-12 h-12 rounded-lg" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{tool.display_name}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{tool.name}</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {tool.description.length > 100 ? tool.description.substring(0, 100) + '...' : tool.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getAuthTypeColor(tool.auth_type)}`}>
                    {tool.auth_type.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    tool.status === 'ENABLED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {tool.status}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{tool.enabled_actions.length} actions</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTools = () => {
    // If a tool is selected, show the detail page
    if (selectedTool) {
      return renderToolDetail();
    }

    return (
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Tools</h1>
          <p className="text-gray-600">All the tools that we support.</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tools by name or description"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tool Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">{availableTools.length} tools</p>
        </div>

        {/* Tool Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableTools.filter(tool => 
            tool.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchTerm.toLowerCase())
          ).map((tool) => (
            <div 
              key={tool.id} 
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedTool(tool)}
            >
              <div className="flex items-start space-x-4 mb-4">
                <img src={tool.logo} alt={tool.display_name} className="w-12 h-12 rounded-lg" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{tool.display_name}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{tool.name}</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {tool.description.length > 100 ? tool.description.substring(0, 100) + '...' : tool.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {tool.auth_schemas.map((schema, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded text-xs font-medium ${getAuthTypeColor(schema.auth_type)}`}
                    >
                      {schema.auth_type.toUpperCase()}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{tool.actions.length} actions</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
                  <span className="text-white text-sm font-bold">⚡</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium">organization_name</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <nav className="flex items-center space-x-6">
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Playground</a>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900">All Tools</a>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Docs & SDK</a>
              </nav>
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 border-b-2 text-sm font-medium ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'Overview' && renderOverview()}
          {activeTab === 'Browse Tools' && renderTools()}
          {activeTab === 'My Tools' && renderMyTools()}
          {activeTab === 'Analytics' && renderAnalytics()}
          {activeTab === 'Users' && renderUsers()}
          {activeTab === 'Logs' && renderLogs()}
          {activeTab === 'Settings' && renderSettings()}
        </div>
      </div>
    </div>
  );
}


