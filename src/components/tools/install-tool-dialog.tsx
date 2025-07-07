'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Download, 
  Package,
  User,
  Key,
  Activity,
  Info,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Settings
} from 'lucide-react';
import { Tool } from '@/types/tools';
import { useInstallTool } from '@/hooks/use-tools';
import { toast } from 'sonner';

interface InstallToolDialogProps {
  tool: Tool;
  children: React.ReactNode;
}

export function InstallToolDialog({ tool, children }: InstallToolDialogProps) {
  const [open, setOpen] = useState(false);
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const installTool = useInstallTool();

  const handleInstall = async () => {
    try {
      console.log('🔧 Installing tool:', tool.name, envVars);
      
      await installTool.mutateAsync({
        toolName: tool.name,
        config: envVars
      });
      
      toast.success('Tool installed successfully!');
      setOpen(false);
    } catch (error) {
      console.error('❌ Failed to install tool:', error);
      toast.error('Failed to install tool. Please try again.');
    }
  };

  const envVariables = tool.environment_variables || tool.setup_environment_variables || [];
  const envVarsList = Array.isArray(envVariables) ? envVariables : 
    Object.entries(envVariables).map(([key, value]) => ({
      name: key,
      description: typeof value === 'string' ? value : '',
      required: true,
      sample_format: '',
      about_url: undefined
    }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-3xl h-[60vh] flex flex-col overflow-hidden">
        <DialogHeader className="pb-3">
          <DialogTitle className="flex items-center space-x-2 text-base">
            {tool.logo ? (
              <img 
                src={tool.logo} 
                alt={tool.display_name}
                className="h-5 w-5 rounded"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <Package className="h-4 w-4 text-blue-600" />
            )}
            <span>Install {tool.display_name}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Configure and install this integration to your ModuleX instance.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={envVarsList.length > 0 ? "configure" : "info"} className="w-full flex flex-col flex-1 min-h-0">
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0 mb-3 h-8">
            <TabsTrigger value="configure" className="flex items-center space-x-1 text-xs h-6">
              <Settings className="h-3 w-3" />
              <span>Configure</span>
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center space-x-1 text-xs h-6">
              <Activity className="h-3 w-3" />
              <span>Actions</span>
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center space-x-1 text-xs h-6">
              <Info className="h-3 w-3" />
              <span>Info</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="configure" className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-2 p-1">
                <Card>
                  <CardHeader className="pb-1">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <Key className="h-3.5 w-3.5" />
                      <span>Environment Variables</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0 -mt-1">
                    {envVarsList.length > 0 ? (
                      envVarsList.map((envVar, index) => (
                        <div key={index} className="space-y-1 w-full">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={envVar.name} className="text-xs font-medium">
                              {envVar.name}
                              {envVar.required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </Label>
                            {envVar.about_url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(envVar.about_url, '_blank')}
                                className="h-6 w-6 p-0"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <Input
                            id={envVar.name}
                            type={envVar.name.toLowerCase().includes('secret') || 
                                  envVar.name.toLowerCase().includes('key') || 
                                  envVar.name.toLowerCase().includes('password') ? 'password' : 'text'}
                            placeholder={envVar.sample_format || `Enter ${envVar.name}`}
                            value={envVars[envVar.name] || ''}
                            onChange={(e) => setEnvVars(prev => ({
                              ...prev,
                              [envVar.name]: e.target.value
                            }))}
                            className="w-full max-w-full overflow-hidden text-ellipsis h-7 text-xs"
                            style={{ 
                              fontFamily: 'monospace',
                              letterSpacing: envVar.name.toLowerCase().includes('secret') || 
                                           envVar.name.toLowerCase().includes('key') || 
                                           envVar.name.toLowerCase().includes('password') ? '0.1em' : 'normal'
                            }}
                          />
                          {envVar.description && (
                            <p className="text-xs text-muted-foreground leading-tight">
                              {envVar.description}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <Key className="h-5 w-5 mx-auto mb-1.5 text-gray-300" />
                        <p className="text-xs">No environment variables required for this tool.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-2 pt-1">
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" className="h-7 text-xs" onClick={handleInstall} disabled={installTool.isPending}>
                    <Download className="h-3 w-3 mr-1" />
                    {installTool.isPending ? 'Installing...' : 'Install Tool'}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="actions" className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-2 p-1">
                <Card>
                  <CardHeader className="pb-1">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <Activity className="h-3.5 w-3.5" />
                      <span>Available Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 -mt-1">
                    {(tool.actions || tool.enabled_actions || []).length > 0 ? (
                      <div className="space-y-2">
                        {(tool.actions || tool.enabled_actions || []).map((action, index) => (
                          <div key={index} className="flex items-start space-x-2.5 p-2.5 border rounded-md">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">
                                {typeof action === 'string' ? action : action.name}
                              </h4>
                              {typeof action === 'object' && action.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                                  {action.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <Activity className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No actions available for this tool.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="info" className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-2 p-1">
                <Card>
                  <CardHeader className="pb-1">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <Info className="h-3.5 w-3.5" />
                      <span>Tool Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0 -mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Display Name</Label>
                        <p className="text-sm">{tool.display_name}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Version</Label>
                        <Badge variant="outline" className="text-xs">{tool.version}</Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Author</Label>
                        <div className="flex items-center space-x-1.5">
                          <User className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-sm">{tool.author}</span>
                        </div>
                      </div>
                      
                      {tool.app_url && (
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Website</Label>
                          <div className="flex items-center space-x-1.5">
                            <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                            <a 
                              href={tool.app_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {tool.app_url}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Categories */}
                    {tool.categories && tool.categories.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">Categories</Label>
                          <div className="flex flex-wrap gap-1">
                            {tool.categories.map((category) => (
                              <Badge key={category.id} variant="outline" className="text-xs">
                                {category.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    
                    <Separator />
                    
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Description</Label>
                      <p className="text-sm text-muted-foreground leading-relaxed">{tool.description}</p>
                    </div>
                    
                    {/* Required Configuration Preview */}
                    {envVarsList.length > 0 && (
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Required Configuration</Label>
                        <div className="text-sm text-muted-foreground">
                          {envVarsList.length} environment variable{envVarsList.length !== 1 ? 's' : ''} required
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 