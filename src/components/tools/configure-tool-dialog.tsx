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
import { 
  Settings, 
  Key, 
  Activity, 
  Info, 
  ExternalLink,
  Save,
  Package,
  User,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Tool } from '@/types/tools';

interface ConfigureToolDialogProps {
  tool: Tool;
  children: React.ReactNode;
}

export function ConfigureToolDialog({ tool, children }: ConfigureToolDialogProps) {
  const [open, setOpen] = useState(false);
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual save functionality
      console.log('Saving configuration for tool:', tool.id, envVars);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOpen(false);
    } catch (error) {
      console.error('Failed to save configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const envVariables = tool.environment_variables || tool.setup_environment_variables || [];
  const envVarsList = Array.isArray(envVariables) ? envVariables : 
    Object.entries(envVariables).map(([key, value]) => ({
      name: key,
      description: typeof value === 'string' ? value : '',
      required: true,
      sample_format: ''
    }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span>Configure {tool.display_name}</span>
          </DialogTitle>
          <DialogDescription>
            Set up environment variables and configure settings for this integration.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Configuration</span>
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Actions</span>
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center space-x-2">
              <Info className="h-4 w-4" />
              <span>Information</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span>Environment Variables</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {envVarsList.length > 0 ? (
                  envVarsList.map((envVar, index) => (
                    <div key={index} className="space-y-2 w-full">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={envVar.name} className="text-sm font-medium">
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
                            className="h-auto p-1"
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
                        className="w-full max-w-full overflow-hidden text-ellipsis"
                        style={{ 
                          fontFamily: 'monospace',
                          letterSpacing: envVar.name.toLowerCase().includes('secret') || 
                                       envVar.name.toLowerCase().includes('key') || 
                                       envVar.name.toLowerCase().includes('password') ? '0.1em' : 'normal'
                        }}
                      />
                      {envVar.description && (
                        <p className="text-xs text-muted-foreground">
                          {envVar.description}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Key className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No environment variables required for this tool.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {envVarsList.length > 0 && (
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Configuration'}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Available Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(tool.actions || tool.enabled_actions || []).length > 0 ? (
                  <div className="space-y-3">
                    {(tool.actions || tool.enabled_actions || []).map((action, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            {typeof action === 'string' ? action : action.name}
                          </h4>
                          {typeof action === 'object' && action.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {action.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No actions available for this tool.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="h-4 w-4" />
                  <span>Tool Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Display Name</Label>
                    <p className="text-sm">{tool.display_name}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Version</Label>
                    <Badge variant="outline">{tool.version}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Author</Label>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{tool.author}</span>
                    </div>
                  </div>
                  
                  {tool.installed_at && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Installed Date</Label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {new Date(tool.installed_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tool ID</Label>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{tool.id}</code>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 