'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Settings, Download, Package, ExternalLink, Clock, User, Grid3X3, List } from 'lucide-react';
import { useAvailableTools, useInstalledTools, useInstallTool } from '@/hooks/use-tools';
import { Tool } from '@/types/tools';
import { ConfigureToolDialog } from '@/components/tools/configure-tool-dialog';

export default function ToolsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'installed' | 'available'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { data: availableTools, isLoading: loadingAvailable } = useAvailableTools();
  const { data: installedTools, isLoading: loadingInstalled } = useInstalledTools();
  const installTool = useInstallTool();

  const handleInstall = async (toolId: number) => {
    try {
      await installTool.mutateAsync(toolId);
    } catch (error) {
      console.error('Failed to install tool:', error);
    }
  };



  // Create a combined list with installation status
  // Available tools are already not-installed, so we don't need to filter them
  const allTools: (Tool & { isInstalled: boolean })[] = [
    ...(installedTools || []).map(tool => ({ ...tool, isInstalled: true })),
    ...(availableTools || []).map(tool => ({ ...tool, isInstalled: false }))
  ];

  const filteredTools = allTools.filter(tool => {
    const matchesSearch = tool.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
      (filter === 'installed' && tool.isInstalled) ||
      (filter === 'available' && !tool.isInstalled);
    
    return matchesSearch && matchesFilter;
  });

  if (loadingAvailable) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tools</h1>
        <p className="text-muted-foreground">
          Manage your ModuleX integrations and tools
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex space-x-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All ({allTools.length})
            </Button>
            <Button
              variant={filter === 'installed' ? 'default' : 'outline'}
              onClick={() => setFilter('installed')}
            >
              Installed ({installedTools?.length || 0})
            </Button>
            <Button
              variant={filter === 'available' ? 'default' : 'outline'}
              onClick={() => setFilter('available')}
            >
              Ready to Install ({allTools.filter(tool => !tool.isInstalled).length})
            </Button>
          </div>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-8 w-8 p-0"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <Card key={`${tool.id}-${tool.isInstalled ? 'installed' : 'available'}`} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      <span>{tool.display_name}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      {tool.description}
                    </p>
                  </div>
                  <Badge 
                    variant={tool.isInstalled ? 'default' : 'secondary'} 
                    className={`ml-2 ${tool.isInstalled ? 'bg-green-100 text-green-800' : ''}`}
                  >
                    {tool.isInstalled ? 'Installed' : 'Ready to Install'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3 text-gray-400" />
                      <span className="text-muted-foreground">Author</span>
                    </div>
                    <span className="font-medium">{tool.author}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Version</span>
                    <Badge variant="outline" className="text-xs">{tool.version}</Badge>
                  </div>

                  {tool.isInstalled && tool.installed_at && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-muted-foreground">Installed</span>
                      </div>
                      <span className="text-xs">
                        {new Date(tool.installed_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* Actions count */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Actions</span>
                    <span className="font-medium">
                      {tool.actions?.length || tool.enabled_actions?.length || 0} available
                    </span>
                  </div>

                  {/* Environment variables count */}
                  {(tool.environment_variables || tool.setup_environment_variables) && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Config vars</span>
                      <span className="font-medium">
                        {Array.isArray(tool.setup_environment_variables) 
                          ? tool.setup_environment_variables.length
                          : Object.keys(tool.setup_environment_variables || {}).length
                        } required
                      </span>
                    </div>
                  )}
                  
                  <div className="flex space-x-2 pt-2">
                    {tool.isInstalled ? (
                      <ConfigureToolDialog tool={tool}>
                        <Button size="sm" className="flex-1">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                      </ConfigureToolDialog>
                    ) : (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleInstall(tool.id)}
                        disabled={installTool.isPending}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {installTool.isPending ? 'Installing...' : 'Install'}
                      </Button>
                    )}
                    
                    {/* Documentation link if available */}
                    {tool.environment_variables?.[0]?.about_url && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(tool.environment_variables[0].about_url, '_blank')}
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
        // List View
        <div className="space-y-4">
          {filteredTools.map((tool) => (
            <Card key={`${tool.id}-${tool.isInstalled ? 'installed' : 'available'}`} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <Package className="h-8 w-8 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold truncate">{tool.display_name}</h3>
                        <Badge 
                          variant={tool.isInstalled ? 'default' : 'secondary'} 
                          className={`${tool.isInstalled ? 'bg-green-100 text-green-800' : ''}`}
                        >
                          {tool.isInstalled ? 'Installed' : 'Ready to Install'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {tool.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Author: {tool.author}</span>
                        <span>Version: {tool.version}</span>
                        <span>Actions: {tool.actions?.length || tool.enabled_actions?.length || 0}</span>
                        {tool.isInstalled && tool.installed_at && (
                          <span>Installed: {new Date(tool.installed_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {tool.isInstalled ? (
                      <ConfigureToolDialog tool={tool}>
                        <Button size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                      </ConfigureToolDialog>
                    ) : (
                      <Button 
                        size="sm"
                        onClick={() => handleInstall(tool.id)}
                        disabled={installTool.isPending}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {installTool.isPending ? 'Installing...' : 'Install'}
                      </Button>
                    )}
                    
                    {/* Documentation link if available */}
                    {tool.environment_variables?.[0]?.about_url && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(tool.environment_variables[0].about_url, '_blank')}
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
      )}

      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-muted-foreground">No tools found matching your criteria.</p>
        </div>
      )}
    </div>
  );
} 