'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Settings, 
  Download, 
  Package, 
  ExternalLink, 
  Clock, 
  User, 
  Grid3X3, 
  List, 
  Globe,
  Sparkles,
  CheckCircle2,
  Zap,
  Shield,
  Code2
} from 'lucide-react';
import { useAvailableTools, useInstalledTools } from '@/hooks/use-tools';
import { Tool } from '@/types/tools';
import { ConfigureToolDialog } from '@/components/tools/configure-tool-dialog';
import { InstallToolDialog } from '@/components/tools/install-tool-dialog';

export default function ToolsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'installed' | 'available'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { data: availableTools, isLoading: loadingAvailable } = useAvailableTools();
  const { data: installedTools, isLoading: loadingInstalled } = useInstalledTools();

  // Create a combined list with installation status
  const allTools: (Tool & { isInstalled: boolean })[] = [
    ...(installedTools || []).map(tool => ({ ...tool, isInstalled: true })),
    ...(availableTools || []).map(tool => ({ ...tool, isInstalled: false }))
  ];

  const filteredTools = allTools.filter(tool => {
    const matchesSearch = tool.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.categories?.some(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filter === 'all' || 
      (filter === 'installed' && tool.isInstalled) ||
      (filter === 'available' && !tool.isInstalled);
    
    return matchesSearch && matchesFilter;
  });

  if (loadingAvailable) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded-lg w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="h-5 bg-gray-200 rounded-lg w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded-lg"></div>
                  <div className="h-3 bg-gray-200 rounded-lg w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Tools & Integrations
        </h1>
        <p className="text-muted-foreground mt-2">
          Extend your ModuleX capabilities with powerful integrations
        </p>
      </div>

      {/* Controls Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-white border-gray-200 focus:border-blue-500 transition-colors"
            />
          </div>
          
          {/* Filter Pills */}
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-blue-600 hover:bg-blue-700 text-white border-0' : 'hover:bg-gray-50'}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              All ({allTools.length})
            </Button>
            <Button
              variant={filter === 'installed' ? 'default' : 'outline'}
              onClick={() => setFilter('installed')}
              className={filter === 'installed' ? 'bg-blue-600 hover:bg-blue-700 text-white border-0' : 'hover:bg-gray-50'}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Installed ({installedTools?.length || 0})
            </Button>
            <Button
              variant={filter === 'available' ? 'default' : 'outline'}
              onClick={() => setFilter('available')}
              className={filter === 'available' ? 'bg-blue-600 hover:bg-blue-700 text-white border-0' : 'hover:bg-gray-50'}
            >
              <Download className="h-4 w-4 mr-2" />
              Available ({allTools.filter(tool => !tool.isInstalled).length})
            </Button>
          </div>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-white shadow-sm h-8 px-3' : 'h-8 px-3 hover:bg-transparent'}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-white shadow-sm h-8 px-3' : 'h-8 px-3 hover:bg-transparent'}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        // Grid View - Modernized
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <Card 
              key={`${tool.id}-${tool.isInstalled ? 'installed' : 'available'}`} 
              className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm overflow-hidden bg-white"
            >
              {/* Status Banner */}
              <div className={`h-1 ${tool.isInstalled ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-blue-400 to-blue-600'}`} />
              
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Tool Icon */}
                    <div className={`p-2.5 rounded-xl ${tool.isInstalled ? 'bg-green-50' : 'bg-blue-50'} flex-shrink-0`}>
                      {tool.logo ? (
                        <img 
                          src={tool.logo} 
                          alt={tool.display_name}
                          className="h-8 w-8 rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Package className={`h-8 w-8 ${tool.isInstalled ? 'text-green-600' : 'text-blue-600'}`} />
                      )}
                    </div>
                    
                    {/* Title and Description */}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                        {tool.display_name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Categories */}
                {tool.categories && tool.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {tool.categories.slice(0, 2).map((category) => (
                      <Badge 
                        key={category.id} 
                        variant="secondary" 
                        className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 border-0"
                      >
                        {category.name}
                      </Badge>
                    ))}
                    {tool.categories.length > 2 && (
                      <Badge 
                        variant="secondary" 
                        className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 border-0"
                      >
                        +{tool.categories.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Author
                    </p>
                    <p className="text-sm font-medium text-gray-900">{tool.author}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Code2 className="h-3 w-3" />
                      Version
                    </p>
                    <p className="text-sm font-medium text-gray-900">{tool.version}</p>
                  </div>
                  
                  {tool.isInstalled && tool.installed_at && (
                    <>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Installed
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(tool.installed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </>
                  )}
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Actions
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {tool.actions?.length || tool.enabled_actions?.length || 0}
                    </p>
                  </div>
                </div>

                {/* Environment Variables Indicator */}
                {(tool.environment_variables || tool.setup_environment_variables) && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                    <Shield className="h-4 w-4 text-amber-600" />
                    <p className="text-xs text-amber-900">
                      {Array.isArray(tool.setup_environment_variables) 
                        ? tool.setup_environment_variables.length
                        : Object.keys(tool.setup_environment_variables || {}).length
                      } environment variables required
                    </p>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {tool.isInstalled ? (
                    <ConfigureToolDialog tool={tool}>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </ConfigureToolDialog>
                  ) : (
                    <InstallToolDialog tool={tool}>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Install
                      </Button>
                    </InstallToolDialog>
                  )}
                  
                  {/* Secondary Actions */}
                  <div className="flex gap-1">
                    {tool.app_url && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(tool.app_url, '_blank')}
                        title="Visit website"
                        className="h-9 w-9 p-0 border-gray-200 hover:bg-gray-50"
                      >
                        <Globe className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {tool.environment_variables?.[0]?.about_url && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(tool.environment_variables[0].about_url, '_blank')}
                        title="Documentation"
                        className="h-9 w-9 p-0 border-gray-200 hover:bg-gray-50"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // List View - Modernized
        <div className="space-y-4">
          {filteredTools.map((tool) => (
            <Card 
              key={`${tool.id}-${tool.isInstalled ? 'installed' : 'available'}`} 
              className="hover:shadow-md transition-all duration-300 border-0 shadow-sm overflow-hidden bg-white"
            >
              <div className="flex">
                {/* Status Indicator */}
                <div className={`w-1 ${tool.isInstalled ? 'bg-gradient-to-b from-green-400 to-green-600' : 'bg-gradient-to-b from-blue-400 to-blue-600'}`} />
                
                <CardContent className="flex-1 p-6">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Tool Icon */}
                      <div className={`p-3 rounded-xl ${tool.isInstalled ? 'bg-green-50' : 'bg-blue-50'} flex-shrink-0`}>
                        {tool.logo ? (
                          <img 
                            src={tool.logo} 
                            alt={tool.display_name}
                            className="h-10 w-10 rounded"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <Package className={`h-10 w-10 ${tool.isInstalled ? 'text-green-600' : 'text-blue-600'}`} />
                        )}
                      </div>
                      
                      {/* Tool Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {tool.display_name}
                          </h3>
                          <Badge 
                            variant={tool.isInstalled ? 'default' : 'secondary'} 
                            className={`${tool.isInstalled 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-blue-100 text-blue-800 border-blue-200'
                            }`}
                          >
                            {tool.isInstalled ? 'Installed' : 'Available'}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {tool.description}
                        </p>
                        
                        {/* Categories */}
                        {tool.categories && tool.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {tool.categories.slice(0, 3).map((category) => (
                              <Badge 
                                key={category.id} 
                                variant="secondary" 
                                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 border-0"
                              >
                                {category.name}
                              </Badge>
                            ))}
                            {tool.categories.length > 3 && (
                              <Badge 
                                variant="secondary" 
                                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 border-0"
                              >
                                +{tool.categories.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {/* Metadata */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {tool.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Code2 className="h-3 w-3" />
                            v{tool.version}
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {tool.actions?.length || tool.enabled_actions?.length || 0} actions
                          </span>
                          {tool.isInstalled && tool.installed_at && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(tool.installed_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {tool.isInstalled ? (
                        <ConfigureToolDialog tool={tool}>
                          <Button 
                            size="sm"
                            className="bg-gray-900 hover:bg-gray-800 text-white"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </Button>
                        </ConfigureToolDialog>
                      ) : (
                        <InstallToolDialog tool={tool}>
                          <Button 
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Install
                          </Button>
                        </InstallToolDialog>
                      )}
                      
                      {tool.app_url && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(tool.app_url, '_blank')}
                          title="Visit website"
                          className="h-9 w-9 p-0 border-gray-200 hover:bg-gray-50"
                        >
                          <Globe className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {tool.environment_variables?.[0]?.about_url && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(tool.environment_variables[0].about_url, '_blank')}
                          title="Documentation"
                          className="h-9 w-9 p-0 border-gray-200 hover:bg-gray-50"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredTools.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">No tools found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
} 