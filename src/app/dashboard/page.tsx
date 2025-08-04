'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { 
  Search, 
  Heart, 
  ChevronDown, 
  User as UserIcon, 
  ExternalLink, 
  Copy, 
  Plus, 
  Grid3X3, 
  MoreHorizontal, 
  Filter, 
  RefreshCw, 
  ArrowLeft, 
  Trash2, 
  Eye, 
  EyeOff, 
  Download, 
  Users, 
  TrendingUp, 
  Shield, 
  Activity, 
  Zap, 
  Globe, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  X,
  Settings,
  Code,
  BookOpen,
  Wrench,
  Check
} from 'lucide-react';

// Import existing components and hooks
import { 
  useAvailableIntegrations, 
  useInstalledIntegrations, 
  useUninstallTool, 
  useUpdateToolEnvironment 
} from '@/hooks/use-tools';
import { useAnalyticsOverview, useUserAnalytics } from '@/hooks/use-analytics';
import { useUsers } from '@/hooks/use-users';
import { useLogs } from '@/hooks/use-logs';
import { useOrganizationStore } from '@/store/organization-store';
import { useAuthStore } from '@/store/auth-store';
import { Tool } from '@/types/tools';
import { User } from '@/types/users';
import { InstallToolDialog } from '@/components/tools/install-tool-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Tab configuration
const TABS = ['Overview', 'Browse Tools', 'My Tools', 'Analytics', 'Users', 'Logs', 'Settings'] as const;
type TabType = typeof TABS[number];

const TAB_ROUTES: Record<TabType, string> = {
  'Overview': 'overview',
  'Browse Tools': 'browse-tools', 
  'My Tools': 'my-tools',
  'Analytics': 'analytics',
  'Users': 'users',
  'Logs': 'logs',
  'Settings': 'settings'
};

const ROUTE_TABS: Record<string, TabType> = Object.entries(TAB_ROUTES).reduce((acc, [tab, route]) => {
  acc[route] = tab as TabType;
  return acc;
}, {} as Record<string, TabType>);

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // URL-based tab management with localStorage backup
  const currentTab = useMemo(() => {
    // First try searchParams
    let tabParam = searchParams.get('tab');
    
    // Fallback to parsing window.location if searchParams is empty
    if (!tabParam && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      tabParam = urlParams.get('tab');
    }
    
    // If still no tab, try to restore from localStorage as last resort
    if (!tabParam && typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('dashboard-current-tab');
      if (savedTab && ROUTE_TABS[savedTab]) {
        console.log('🔄 Restoring tab from localStorage:', savedTab);
        tabParam = savedTab;
      }
    }
    
    const resolvedTab = tabParam && ROUTE_TABS[tabParam] ? ROUTE_TABS[tabParam] : 'Overview';
    
    // Save current tab to localStorage for backup
    if (typeof window !== 'undefined' && tabParam) {
      localStorage.setItem('dashboard-current-tab', tabParam);
    }
    
    return resolvedTab;
  }, [searchParams]);

  // Sub-tab states
  const [activeLogTab, setActiveLogTab] = useState('Tools');
  const [activeSettingsTab, setActiveSettingsTab] = useState('General');
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState('Overview');
  const [analyticsDateRange, setAnalyticsDateRange] = useState('7d');
  
  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [activeToolTab, setActiveToolTab] = useState('Actions');
  const [selectedInstalledTool, setSelectedInstalledTool] = useState<Tool | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedToolForInstall, setSelectedToolForInstall] = useState<Tool | null>(null);
  const [showUninstallConfirm, setShowUninstallConfirm] = useState(false);

  // API Hooks for tool management
  const uninstallTool = useUninstallTool();
  const updateToolEnvironment = useUpdateToolEnvironment();

  // Store data
  const { selectedOrganization, organizations, selectOrganization } = useOrganizationStore();
  const { user } = useAuthStore();

  // Check if user has 5+ owner roles
  const hasMaxOwnerRoles = useMemo(() => {
    const ownerCount = organizations.filter(org => org.role === 'owner').length;
    return ownerCount >= 5;
  }, [organizations]);

  // Sort organizations with selected one first
  const sortedOrganizations = useMemo(() => {
    if (!selectedOrganization) return organizations;
    
    const selected = organizations.filter(org => org.id === selectedOrganization.id);
    const others = organizations.filter(org => org.id !== selectedOrganization.id);
    
    return [...selected, ...others];
  }, [organizations, selectedOrganization]);

  // Handle organization selection
  const handleOrganizationSelect = (organizationId: string) => {
    selectOrganization(organizationId);
  };

  // Handle new organization creation
  const handleCreateNewOrganization = () => {
    router.push('/dashboard/create-organization');
  };

  // Data queries
  const { data: availableIntegrations } = useAvailableIntegrations();
  const { data: installedIntegrations } = useInstalledIntegrations();

  // Debug current state with more details
  useEffect(() => {
  }, [currentTab, pathname, searchParams]);

  // Track URL changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handlePopState = () => {
        console.log('🔄 PopState Event:', {
          url: window.location.href,
          search: window.location.search
        });
      };
      
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  // Tab change handler with URL update and localStorage backup
  const handleTabChange = useCallback((tab: TabType) => {
    const route = TAB_ROUTES[tab];
    console.log('🚀 Tab Change:', {
      from: currentTab,
      to: tab,
      route: route,
      newURL: `/dashboard?tab=${route}`,
      currentURL: typeof window !== 'undefined' ? window.location.href : 'SSR'
    });
    
    // Save to localStorage immediately
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboard-current-tab', route);
    }
    
    // Use replace instead of push to avoid navigation issues
    router.replace(`/dashboard?tab=${route}`, { scroll: false });
  }, [router, currentTab]);

  // Aggressive URL protection mechanism - continuous monitoring
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let intervalId: NodeJS.Timeout;
      
      const checkAndRestoreURL = () => {
        const currentSearch = window.location.search;
        const savedTab = localStorage.getItem('dashboard-current-tab');
        
        // If we have no URL params but have a saved tab, restore it
        if (!currentSearch && savedTab && ROUTE_TABS[savedTab]) {
          console.log('🛡️ URL Protection: Detected URL loss, restoring tab:', savedTab);
          
          // Try multiple restoration methods
          const newURL = `/dashboard?tab=${savedTab}`;
          
          // Method 1: Router replace
          router.replace(newURL, { scroll: false });
          
          // Method 2: Direct browser history manipulation (backup)
          setTimeout(() => {
            if (window.location.search === '') {
              console.log('🛡️ Router failed, using browser history API');
              window.history.replaceState({}, '', newURL);
            }
          }, 100);
        }
      };
      
      // Initial check
      checkAndRestoreURL();
      
      // Continuous monitoring every 500ms
      intervalId = setInterval(checkAndRestoreURL, 500);
      
      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }
  }, [router]);

  // Conditional API calls based on active tab
  const shouldLoadBrowseTools = currentTab === 'Browse Tools';
  const shouldLoadMyTools = currentTab === 'My Tools';
  const shouldLoadUsers = currentTab === 'Users';
  const shouldLoadLogs = currentTab === 'Logs';
  const shouldLoadAnalytics = currentTab === 'Analytics';

  // Conditional API calls based on active tab
  const { data: availableTools } = useAvailableIntegrations({
    enabled: shouldLoadBrowseTools
  });
  
  // Debug available tools for OAuth2
  useEffect(() => {
    if (availableTools && shouldLoadBrowseTools) {
      console.log('🔧 Available Tools Debug:', {
        totalTools: availableTools.length,
        oauth2Tools: availableTools.filter(t => 
          t.auth_schemas?.some(schema => schema.auth_type === 'oauth2')
        ).map(t => ({
          name: t.name,
          displayName: t.display_name,
          oauth2EnvAvailable: t.oauth2_env_available,
          authSchemas: t.auth_schemas?.map(s => s.auth_type) || []
        }))
      });
    }
  }, [availableTools, shouldLoadBrowseTools]);
  
  const { data: installedTools } = useInstalledIntegrations({
    enabled: shouldLoadMyTools || shouldLoadAnalytics
  });
  
  const { data: usersData } = useUsers(
    { page: 1, limit: 10 }, 
    { enabled: shouldLoadUsers || shouldLoadAnalytics }
  );
  
  const { data: logsData } = useLogs(
    { limit: 50, offset: 0 }, 
    { enabled: shouldLoadLogs }
  );

  // Analytics hooks - only call when analytics tab is active
  const analyticsOverviewQuery = useAnalyticsOverview(analyticsDateRange, {
    enabled: shouldLoadAnalytics && activeAnalyticsTab === 'Overview'
  });
  
  const userAnalyticsQuery = useUserAnalytics(analyticsDateRange, {
    enabled: shouldLoadAnalytics && activeAnalyticsTab === 'Users'
  });

  // Filtered tools for Browse Tools tab - memoized at component level
  const filteredAvailableTools = useMemo(() => 
    (availableTools || []).filter(tool => 
      tool.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    ), [availableTools, searchTerm]
  );

  const handleExploreClick = useCallback((section: string) => {
    if (section === 'Browse Toolkits') {
      handleTabChange('Browse Tools');
    } else {
      console.log(`Clicked: ${section}`);
    }
  }, [handleTabChange]);

  const handleToolInstall = useCallback((tool: Tool) => {
    console.log('🚀 Install Tool Clicked:', { 
      toolName: tool.name, 
      displayName: tool.display_name,
      oauth2EnvAvailable: tool.oauth2_env_available,
      hasAuthSchemas: !!tool.auth_schemas 
    });
    
    // Reset any previous state
    setIsClosing(false);
    setShowInstallDialog(false);
    // Set tool first
    setSelectedToolForInstall(tool);
    // Then show dialog after state updates
    setTimeout(() => {
      console.log('⏰ Opening Install Dialog for:', tool.name);
      setShowInstallDialog(true);
    }, 10);
  }, []);

  const handleCloseInstallDialog = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setShowInstallDialog(false);
      setIsClosing(false);
      setSelectedToolForInstall(null);
    }, 300);
  }, []);

  const getAuthTypeColor = (authType: string) => {
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

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (email?: string | null, username?: string | null) => {
    if (username) return username.substring(0, 2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return '??';
  };

  // Tool options for overview page - memoized to prevent re-creation
  const toolOptions = useMemo(() => [
    { name: 'OpenAI', icon: '🤖', selected: true },
    { name: 'Anthropic', icon: '🧠', selected: false },
    { name: 'LangChain', icon: '🔗', selected: false },
    { name: 'AI SDK', icon: '⚡', selected: false }
  ], []);

  // Mock API keys data - memoized to prevent re-creation
  const apiKeys = useMemo(() => [
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
  ], []);

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

          {/* Code Examples */}
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

  const renderToolDetailModal = () => {
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
              {selectedTool.app_url && (
                <button 
                  onClick={() => window.open(selectedTool.app_url, '_blank')}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Documentation
                </button>
              )}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleToolInstall(selectedTool);
                }}
                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center gap-2"
              >
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
                {selectedTool.auth_schemas?.map((schema, index) => (
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
                  <span>{selectedTool.actions?.length || 0} Actions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <span>v{selectedTool.version}</span>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <span>Categories: </span>
              <span className="text-gray-900">{selectedTool.categories?.map(cat => cat.name).join(', ') || 'N/A'}</span>
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
                {selectedTool.actions?.length ? (
                  selectedTool.actions.map((action, index) => (
                    <div key={index} className={`flex items-start justify-between p-4 hover:bg-gray-50 transition-colors ${
                      index !== (selectedTool.actions?.length || 0) - 1 ? 'border-b border-gray-200' : ''
                    }`}>
                      <div className="flex-shrink-0 w-80">
                        <h3 className="text-sm font-medium text-gray-900">{action.name}</h3>
                      </div>
                      <div className="flex-1 ml-6">
                        <p className="text-sm text-gray-600 leading-relaxed">{action.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No actions available
                  </div>
                )}
              </div>
            </div>
          )}

          {activeToolTab === 'Authentication' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Authentication Setup</h2>
                <p className="text-gray-600 mt-1">Configure authentication credentials for this tool.</p>
              </div>

              {selectedTool.auth_schemas?.length ? (
                selectedTool.auth_schemas.map((schema, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{schema.auth_type.toUpperCase()} Configuration</h3>
                    
                    <div className="space-y-4">
                      {schema.setup_environment_variables?.map((env, envIndex) => (
                        <div key={envIndex}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {env.name}
                            {env.about_url && (
                              <a href={env.about_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:text-blue-700">
                                <ExternalLink className="w-3 h-3 inline" />
                              </a>
                            )}
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
                ))
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-gray-500 text-center">No authentication methods available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderInstallDialog = () => {
    if (!selectedToolForInstall) return null;

    return (
      <InstallToolDialog 
        tool={selectedToolForInstall}
        open={showInstallDialog}
        onOpenChange={(open) => {
          console.log('🔄 Install Dialog State Change:', { open, toolName: selectedToolForInstall.name });
          if (!open) {
            handleCloseInstallDialog();
          } else {
            setShowInstallDialog(true);
          }
        }}
      >
        {/* Empty trigger since we control via props */}
        <span />
      </InstallToolDialog>
    );
  };

  const renderBrowseTools = () => {
    // If a tool is selected, show tool detail page
    if (selectedTool) {
      return renderToolDetailModal();
    }

    // Otherwise show tools list
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
          <p className="text-sm text-gray-600">{availableTools?.length || 0} tools</p>
        </div>

        {/* Tool Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAvailableTools.map((tool) => (
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
                  {tool.auth_schemas?.map((schema, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded text-xs font-medium ${getAuthTypeColor(schema.auth_type)}`}
                    >
                      {schema.auth_type.toUpperCase()}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{tool.actions?.length || 0} actions</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Tool detail view component
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
                <img 
                  src={selectedInstalledTool.logo} 
                  alt={selectedInstalledTool.display_name} 
                  className="w-12 h-12 rounded-lg" 
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedInstalledTool.display_name}</h1>
                  <span className="text-sm text-gray-500 uppercase tracking-wide font-medium">{selectedInstalledTool.name}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                onClick={() => {
                  if (selectedInstalledTool?.app_url) {
                    window.open(selectedInstalledTool.app_url, '_blank');
                  }
                }}
              >
                <ExternalLink className="w-4 h-4" />
                View Documentation
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2"
                onClick={() => setShowUninstallConfirm(true)}
                disabled={uninstallTool.isPending}
              >
                <Trash2 className="w-4 h-4" />
                {uninstallTool.isPending ? 'Uninstalling...' : 'Uninstall'}
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-6 max-w-4xl leading-relaxed">{selectedInstalledTool.description}</p>

          {/* Status and Info */}
          <div className="flex items-center gap-6 mb-6">
            <span className={`px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800`}>
              INSTALLED
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAuthTypeColor(selectedInstalledTool.auth_type || 'api_key')}`}>
              {(selectedInstalledTool.auth_type || 'API_KEY').toUpperCase()}
            </span>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Grid3X3 className="w-4 h-4" />
                <span>{selectedInstalledTool.enabled_actions?.length || 0} Actions</span>
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
                {(selectedInstalledTool.enabled_actions || []).map((action, index) => (
                  <div key={index} className={`flex items-start justify-between p-4 hover:bg-gray-50 transition-colors ${
                    index !== (selectedInstalledTool.enabled_actions?.length || 0) - 1 ? 'border-b border-gray-200' : ''
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
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  onClick={() => {
                    if (selectedInstalledTool?.name && selectedInstalledTool?.environment_variables) {
                      const envVars: Record<string, string> = {};
                      Object.entries(selectedInstalledTool.environment_variables).forEach(([key, value]) => {
                        if (typeof value === 'string') {
                          envVars[key] = value;
                        }
                      });
                      
                      updateToolEnvironment.mutate({
                        toolName: selectedInstalledTool.name,
                        environmentVariables: envVars
                      });
                    }
                  }}
                  disabled={updateToolEnvironment.isPending}
                >
                  {updateToolEnvironment.isPending ? 'Updating...' : 'Update Variables'}
                </button>
              </div>

              <div className="space-y-4">
                {selectedInstalledTool.environment_variables && Object.entries(selectedInstalledTool.environment_variables).map(([key, value]) => (
                  <div key={key} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">{key}</label>
                      <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                        CONFIGURED
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        value={typeof value === 'string' ? value : ''}
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tool Configuration</h3>
                <p className="text-sm text-gray-600 mb-4">
                  This tool is installed and ready to use. You can manage its environment variables in the Environment tab or uninstall it using the uninstall button in the header.
                </p>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Tool is active and configured
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

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
            onClick={() => handleTabChange('Browse Tools')}
          >
            <Grid3X3 className="w-4 h-4" />
            Browse All Tools
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
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(installedTools || []).map((tool: any) => (
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
                <span className={`px-2 py-1 rounded text-xs font-medium ${getAuthTypeColor(tool.auth_type || 'api_key')}`}>
                  {tool.auth_type?.toUpperCase() || 'API_KEY'}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800`}>
                  INSTALLED
                </span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{tool.enabled_actions?.length || 0} actions</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    );
  };

  // Import the analytics render function from the transformed analytics page
  const renderAnalytics = () => {
    const analyticsSubTabs = ['Overview', 'Users', 'Tools', 'Performance', 'Security'];

    const renderAnalyticsOverview = () => {
      // Mock data structure matching the design requirements
      const analyticsData = {
        overview: {
          total_users: analyticsOverviewQuery.data?.total_users || 6,
          total_tools: analyticsOverviewQuery.data?.total_tools || 6,
          active_tools: analyticsOverviewQuery.data?.active_tools || 3,
          system_health: analyticsOverviewQuery.data?.system_health || "optimal",
        }
      };

      if (analyticsOverviewQuery.isLoading) {
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      return (
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
    };

    const renderAnalyticsUsers = () => {
      const userMetrics = {
        new_users: { value: userAnalyticsQuery.data?.new_users?.value || 3, change: 23, change_type: "increase" },
        active_users: { value: userAnalyticsQuery.data?.active_users?.value || 0, change: 15, change_type: "increase" },
        avg_session_time: { value: userAnalyticsQuery.data?.avg_session_time?.value || 24, change: 5, change_type: "increase" },
        total_users: userAnalyticsQuery.data?.total_users || 6
      };

      if (userAnalyticsQuery.isLoading) {
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-8">
          {/* User Metrics */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border-2 border-blue-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">New Users</p>
                  <p className="text-3xl font-bold text-gray-900">{userMetrics.new_users.value}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-sm font-medium">+{userMetrics.new_users.change}%</span>
                <span className="text-gray-500 text-sm">This period</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-green-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900">{userMetrics.active_users.value}</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-sm font-medium">+{userMetrics.active_users.change}%</span>
                <span className="text-gray-500 text-sm">Of total users</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-purple-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Avg Session Time</p>
                  <p className="text-3xl font-bold text-gray-900">{userMetrics.avg_session_time.value}m</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-sm font-medium">+{userMetrics.avg_session_time.change}m</span>
                <span className="text-gray-500 text-sm">Per session</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-orange-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{userMetrics.total_users}</p>
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
              {[
                { id: "1", name: "John Doe", email: "john@example.com", tools_used: 3, last_active: "Never" },
                { id: "2", name: "Jane Smith", email: "jane@example.com", tools_used: 2, last_active: "Never" }
              ].map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-700">{user.name.split(' ').map(n => n[0]).join('')}</span>
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
    };

    const renderAnalyticsTools = () => {
      return (
        <div className="space-y-8">
          {/* Tool Metrics */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border-2 border-blue-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Installations</p>
                  <p className="text-3xl font-bold text-gray-900">{installedTools?.length || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Grid3X3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-sm font-medium">+12%</span>
                <span className="text-gray-500 text-sm">This month</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-green-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Tool Executions</p>
                  <p className="text-3xl font-bold text-gray-900">1,247</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-sm font-medium">+23%</span>
                <span className="text-gray-500 text-sm">Last 7 days</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-purple-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Success Rate</p>
                  <p className="text-3xl font-bold text-gray-900">97.3%</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-sm font-medium">+2.1%</span>
                <span className="text-gray-500 text-sm">Improved</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-orange-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Avg Execution Time</p>
                  <p className="text-3xl font-bold text-gray-900">2.1s</p>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-600 text-sm font-medium">+0.3s</span>
                <span className="text-gray-500 text-sm">Response time</span>
              </div>
            </div>
          </div>

          {/* Most Used Tools */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Most Used Tools</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
            </div>
            <div className="space-y-4">
              {(installedTools || []).slice(0, 5).map((tool: any) => (
                <div key={tool.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img src={tool.logo} alt={tool.display_name} className="w-10 h-10 rounded-lg" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{tool.display_name}</div>
                      <div className="text-sm text-gray-500">{tool.enabled_actions?.length || 0} actions</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{Math.floor(Math.random() * 500) + 100} executions</div>
                    <div className="text-sm text-gray-500">Last used today</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tool Categories Distribution */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tool Categories</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Communication</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div className="w-3/4 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium">35%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Development</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div className="w-1/2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Analytics</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div className="w-2/5 h-2 bg-purple-500 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium">20%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Productivity</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div className="w-1/5 h-2 bg-orange-500 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium">20%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tool Activities</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">GitHub action executed</div>
                    <div className="text-xs text-gray-500">2 minutes ago</div>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">Gmail tool authenticated</div>
                    <div className="text-xs text-gray-500">5 minutes ago</div>
                  </div>
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">R2R search completed</div>
                    <div className="text-xs text-gray-500">8 minutes ago</div>
                  </div>
                  <Activity className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    const renderAnalyticsPerformance = () => {
      return (
        <div className="space-y-8">
          {/* Performance Metrics */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border-2 border-blue-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Avg Response Time</p>
                  <p className="text-3xl font-bold text-gray-900">108ms</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-sm font-medium">-5.3%</span>
                <span className="text-gray-500 text-sm">Performance improved</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-green-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Uptime</p>
                  <p className="text-3xl font-bold text-gray-900">99.9%</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-sm font-medium">+0.1%</span>
                <span className="text-gray-500 text-sm">This month</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-purple-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Request Volume</p>
                  <p className="text-3xl font-bold text-gray-900">2.4K</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-sm font-medium">+18%</span>
                <span className="text-gray-500 text-sm">Requests/hour</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-red-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Error Rate</p>
                  <p className="text-3xl font-bold text-gray-900">0.1%</p>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-sm font-medium">-0.3%</span>
                <span className="text-gray-500 text-sm">Fewer errors</span>
              </div>
            </div>
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time Trends</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Response time chart</p>
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Volume</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Request volume chart</p>
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>
          </div>

          {/* Endpoint Performance */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Endpoint Performance</h3>
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Response</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requests</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error Rate</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">/api/tools/execute</div>
                      <div className="text-xs text-gray-500">Tool execution endpoint</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">145ms</td>
                    <td className="px-4 py-3 text-sm text-gray-900">1,247</td>
                    <td className="px-4 py-3 text-sm text-gray-900">0.1%</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Healthy</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">/api/auth/oauth</div>
                      <div className="text-xs text-gray-500">OAuth authentication</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">89ms</td>
                    <td className="px-4 py-3 text-sm text-gray-900">456</td>
                    <td className="px-4 py-3 text-sm text-gray-900">0.0%</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Healthy</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">/api/integrations</div>
                      <div className="text-xs text-gray-500">Integration management</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">67ms</td>
                    <td className="px-4 py-3 text-sm text-gray-900">789</td>
                    <td className="px-4 py-3 text-sm text-gray-900">0.2%</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Healthy</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    };

    const renderAnalyticsSecurity = () => {
      return (
        <div className="space-y-8">
          {/* Security Metrics */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border-2 border-emerald-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Security Score</p>
                  <p className="text-3xl font-bold text-gray-900">95/100</p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 text-sm font-medium">Excellent</span>
                <span className="text-gray-500 text-sm">Security posture</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-red-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Failed Logins</p>
                  <p className="text-3xl font-bold text-gray-900">2</p>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-sm font-medium">-50%</span>
                <span className="text-gray-500 text-sm">From last week</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-yellow-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Suspicious Activities</p>
                  <p className="text-3xl font-bold text-gray-900">0</p>
                </div>
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-sm font-medium">Clean</span>
                <span className="text-gray-500 text-sm">No threats detected</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-blue-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Sessions</p>
                  <p className="text-3xl font-bold text-gray-900">{usersData?.users?.filter((u: User) => u.is_active).length || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600 text-sm font-medium">Online now</span>
                <span className="text-gray-500 text-sm">Current users</span>
              </div>
            </div>
          </div>

          {/* Security Events Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Security Events</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Successful OAuth authentication</div>
                  <div className="text-xs text-gray-500">User authenticated via GitHub OAuth • 5 minutes ago</div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              
              <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">New API key generated</div>
                  <div className="text-xs text-gray-500">API key created for production environment • 2 hours ago</div>
                </div>
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              
              <div className="flex items-center gap-4 p-3 bg-yellow-50 rounded-lg">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Rate limit warning</div>
                  <div className="text-xs text-gray-500">API rate limit reached 80% threshold • 6 hours ago</div>
                </div>
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Authentication Methods & Security Settings */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication Methods</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">OAuth2</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div className="w-3/4 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium">75%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">API Key</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div className="w-1/4 h-2 bg-purple-500 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Recommendations</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Two-factor authentication enabled</div>
                    <div className="text-xs text-gray-500">All admin accounts protected</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">API keys regularly rotated</div>
                    <div className="text-xs text-gray-500">Last rotation 30 days ago</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Consider session timeout</div>
                    <div className="text-xs text-gray-500">Reduce session duration for better security</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div>
        {/* Analytics Sub Navigation */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
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
            <div className="flex items-center gap-3">
              <select 
                value={analyticsDateRange} 
                onChange={(e) => setAnalyticsDateRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Render analytics content based on active sub-tab */}
        {activeAnalyticsTab === 'Overview' && renderAnalyticsOverview()}
        {activeAnalyticsTab === 'Users' && renderAnalyticsUsers()}
        {activeAnalyticsTab === 'Tools' && renderAnalyticsTools()}
        {activeAnalyticsTab === 'Performance' && renderAnalyticsPerformance()}
        {activeAnalyticsTab === 'Security' && renderAnalyticsSecurity()}
      </div>
    );
  };

  const renderUsers = () => {
    const users = (usersData?.users || []) as User[];
    const totalUsers = users.length;
    const activeUsers = users.filter((user: User) => user.is_active).length;
    const inactiveUsers = users.filter((user: User) => !user.is_active).length;

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
                <p className="text-3xl font-bold text-gray-900">0</p>
                <p className="text-gray-500 text-xs mt-1">Joined today</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-purple-600" />
              </div>
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
              {users.slice(0, 5).map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-700">{getInitials(user.email, user.username)}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.username || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{user.email || 'No email'}</div>
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
                    <span className="text-sm text-gray-900">{user.toolCount || 0}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{formatDate(user.created_at)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${
                      !user.lastActiveAt ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {formatDate(user.lastActiveAt)}
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
            {(logsData?.logs || []).slice(0, 10).map((log) => (
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
                    {log.log_type?.toUpperCase()}
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
                      defaultValue={selectedOrganization?.name || "My Organization"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Workspace ID</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={selectedOrganization?.id || "ws_2UvO9BjDA_VC"}
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
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 relative z-0">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 relative z-10">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
                  <span className="text-white text-sm font-bold">⚡</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-1 hover:bg-gray-50 px-2 py-1 rounded-md transition-colors">
                      <span className="text-sm font-medium">{selectedOrganization?.name || 'organization_name'}</span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    {sortedOrganizations.map((org, index) => (
                      <DropdownMenuItem
                        key={org.id}
                        onClick={() => handleOrganizationSelect(org.id)}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{org.name}</span>
                          <span className="text-xs text-gray-500 capitalize">{org.role} • {org.domain}</span>
                        </div>
                        {selectedOrganization?.id === org.id && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </DropdownMenuItem>
                    ))}
                    {!hasMaxOwnerRoles && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="cursor-pointer text-gray-700"
                          onClick={handleCreateNewOrganization}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          New Organization
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <nav className="flex items-center space-x-6">
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Playground</a>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900">All Tools</a>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Docs & SDK</a>
              </nav>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors">
                    <UserIcon className="w-4 h-4 text-white" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.name || user?.email || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-600 hover:bg-red-50"
                    onClick={() => {
                      const { logout } = useAuthStore.getState();
                      logout();
                    }}
                  >
                    <span className="text-sm font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="px-6">
          <div className="flex space-x-8">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`py-3 px-1 border-b-2 text-sm font-medium ${
                  currentTab === tab
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
      <div className="px-6 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {currentTab === 'Overview' && renderOverview()}
          {currentTab === 'Browse Tools' && renderBrowseTools()}
          {currentTab === 'My Tools' && renderMyTools()}
          {currentTab === 'Analytics' && renderAnalytics()}
          {currentTab === 'Users' && renderUsers()}
          {currentTab === 'Logs' && renderLogs()}
          {currentTab === 'Settings' && renderSettings()}
        </div>
      </div>

      {/* Install Dialog - Global Level */}
      {renderInstallDialog()}

      {/* Uninstall Confirmation Dialog - Global Level */}
      {showUninstallConfirm && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowUninstallConfirm(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Uninstall Tool</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to uninstall <strong>{selectedInstalledTool?.display_name}</strong>? 
              This will permanently remove the tool and all its configurations.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                onClick={() => setShowUninstallConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center gap-2"
                onClick={() => {
                  if (selectedInstalledTool?.name) {
                    uninstallTool.mutate(selectedInstalledTool.name, {
                      onSuccess: () => {
                        setSelectedInstalledTool(null);
                        setShowUninstallConfirm(false);
                      },
                    });
                  }
                }}
                disabled={uninstallTool.isPending}
              >
                <Trash2 className="w-4 h-4" />
                {uninstallTool.isPending ? 'Uninstalling...' : 'Yes, Uninstall'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 