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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Download, 
  Package,
  User,
  Activity,
  Info,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Settings,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Tool } from '@/types/tools';
import { useInstallTool } from '@/hooks/use-tools';
import { AuthTypeSelector } from './auth-type-selector';
import { EnvironmentVariablesForm } from './environment-variables-form';
import { toast } from 'sonner';

interface InstallToolDialogProps {
  tool: Tool;
  children: React.ReactNode;
}

export function InstallToolDialog({ tool, children }: InstallToolDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'auth' | 'config'>('auth');
  const [selectedAuthType, setSelectedAuthType] = useState('');
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [useCustomCredentials, setUseCustomCredentials] = useState(false);
  const installTool = useInstallTool();

  // Reset state when dialog opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setStep('auth');
      setSelectedAuthType('');
      setEnvVars({});
      setUseCustomCredentials(false);
    }
  };

  const handleAuthTypeSelect = (authType: string) => {
    setSelectedAuthType(authType);
    setEnvVars({}); // Reset env vars when auth type changes
    setUseCustomCredentials(false); // Reset custom credentials when auth type changes
    setStep('config');
  };

  const handleBack = () => {
    setStep('auth');
  };

  const handleInstall = async () => {
    if (!selectedAuthType) {
      toast.error('Please select an authentication method');
      return;
    }

    try {
      // For OAuth2 with system credentials, don't send environment variables
      const isOAuth2WithSystemCredentials = selectedAuthType === 'oauth2' && 
                                           tool.oauth2_env_available && 
                                           !useCustomCredentials;
      
      const configToSend = isOAuth2WithSystemCredentials ? undefined : envVars;
      
      console.log('🔧 Installing tool:', tool.name, { 
        authType: selectedAuthType, 
        config: configToSend,
        useCustomCredentials,
        isOAuth2WithSystemCredentials
      });
      
      await installTool.mutateAsync({
        toolName: tool.name,
        authType: selectedAuthType,
        config: configToSend
      });
      
      toast.success('Tool installed successfully!');
      setOpen(false);
    } catch (error) {
      console.error('❌ Failed to install tool:', error);
      toast.error('Failed to install tool. Please try again.');
    }
  };

  // Get auth schemas from tool (new structure) or fallback to legacy structure
  const authSchemas = tool.auth_schemas || [];
  const selectedSchema = authSchemas.find(schema => schema.auth_type === selectedAuthType);



  // Legacy fallback for tools without auth_schemas
  const hasLegacyStructure = !tool.auth_schemas && (tool.environment_variables || tool.setup_environment_variables);
  
  if (hasLegacyStructure) {
    // Auto-select single auth type for legacy tools
    if (!selectedAuthType && authSchemas.length === 0) {
      const legacyEnvVars = tool.environment_variables || tool.setup_environment_variables || [];
      const envVarsList = Array.isArray(legacyEnvVars) ? legacyEnvVars : 
        Object.entries(legacyEnvVars).map(([key, value]) => ({
          name: key,
          description: typeof value === 'string' ? value : '',
          required: true,
          sample_format: '',
          about_url: undefined
        }));
      
      // Create a fallback auth schema
      authSchemas.push({
        auth_type: 'manual',
        setup_environment_variables: envVarsList,
        system_has_oauth2_variables: false
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
            <span>
              {step === 'auth' ? 'Configure' : 'Install'} {tool.display_name}
            </span>
            {step === 'config' && selectedAuthType && (
              <Badge variant="outline" className="text-xs">
                {selectedAuthType.toUpperCase()}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {step === 'auth' 
              ? 'Choose your authentication method for this integration.'
              : 'Configure environment variables and install the integration.'
            }
          </DialogDescription>
        </DialogHeader>

{/* Step-based Installation Flow */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {step === 'auth' ? (
            /* Auth Type Selection Step */
            <ScrollArea className="h-full">
              <div className="p-4">
                <AuthTypeSelector 
                  authSchemas={authSchemas}
                  selectedAuthType={selectedAuthType}
                  onAuthTypeChange={handleAuthTypeSelect}
                  oauth2EnvAvailable={tool.oauth2_env_available}
                />
                
                {/* Tool Info Preview */}
                <Card className="mt-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <Info className="h-4 w-4" />
                      <span>Tool Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Display Name</p>
                        <p className="text-sm">{tool.display_name}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Version</p>
                        <Badge variant="outline" className="text-xs">{tool.version}</Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Author</p>
                        <div className="flex items-center space-x-1.5">
                          <User className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-sm">{tool.author}</span>
                        </div>
                      </div>
                      
                      {tool.app_url && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Website</p>
                          <div className="flex items-center space-x-1.5">
                            <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                            <a 
                              href={tool.app_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Visit Website
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {tool.categories && tool.categories.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Categories</p>
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
                      <p className="text-xs font-medium text-muted-foreground">Description</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{tool.description}</p>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Cancel Button */}
                <div className="flex justify-end mt-6">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </ScrollArea>
          ) : (
            /* Configuration Step */
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {selectedSchema && (
                  <EnvironmentVariablesForm
                    schema={selectedSchema}
                    values={envVars}
                    onChange={setEnvVars}
                    useCustomCredentials={useCustomCredentials}
                    onCustomCredentialsChange={setUseCustomCredentials}
                    oauth2EnvAvailable={tool.oauth2_env_available}
                  />
                )}
                
                {/* Actions Preview */}
                {(tool.actions || tool.enabled_actions || []).length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-sm">
                        <Activity className="h-4 w-4" />
                        <span>Available Actions</span>
                        <Badge variant="outline" className="text-xs">
                          {(tool.actions || tool.enabled_actions || []).length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {(tool.actions || tool.enabled_actions || []).slice(0, 4).map((action, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 border rounded-md bg-gray-50">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm font-medium">
                              {typeof action === 'string' ? action : action.name}
                            </span>
                          </div>
                        ))}
                        {(tool.actions || tool.enabled_actions || []).length > 4 && (
                          <div className="text-xs text-muted-foreground p-2">
                            +{(tool.actions || tool.enabled_actions || []).length - 4} more actions
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Action Buttons */}
                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleInstall} 
                      disabled={installTool.isPending || !selectedAuthType}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {installTool.isPending ? 'Installing...' : 'Install Tool'}
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 