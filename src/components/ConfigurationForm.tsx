
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Sparkles, Save, Play, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ModuleSelector from '@/components/ModuleSelector';
import ModelSelector from '@/components/ModelSelector';
import TableSelector from '@/components/TableSelector';
import ConfigurationPreview from '@/components/ConfigurationPreview';
import { configService } from '@/services';
import { ConfigurationData } from '@/models';

const ConfigurationForm = () => {
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleSaveConfiguration = async () => {
    if (!selectedModule || !selectedModel || selectedTables.length === 0) {
      toast({
        title: "Incomplete Configuration",
        description: "Please select a module, model, and at least one table.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Prepare configuration data
      const configData: ConfigurationData = {
        module: selectedModule,
        model: selectedModel,
        tables: selectedTables,
        aiEnabled: isAiEnabled
      };
      
      // Call the service to save configuration
      const response = await configService.saveConfiguration(configData);
      
      toast({
        title: "Configuration Saved",
        description: "Your data MO configuration has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error Saving Configuration",
        description: error.message || "An error occurred while saving the configuration.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConfiguration = async () => {
    if (!selectedModule || !selectedModel || selectedTables.length === 0) {
      toast({
        title: "Incomplete Configuration",
        description: "Please complete the configuration before testing.",
        variant: "destructive"
      });
      return;
    }
    
    setIsTesting(true);
    
    try {
      // Prepare configuration data
      const configData: ConfigurationData = {
        module: selectedModule,
        model: selectedModel,
        tables: selectedTables,
        aiEnabled: isAiEnabled
      };
      
      toast({
        title: "Test Started",
        description: "Testing your configuration... This may take a few moments.",
      });
      
      // Call the service to test configuration
      const response = await configService.testConfiguration(configData);
      
      toast({
        title: "Test Completed",
        description: "Your configuration test completed successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Test Failed",
        description: error.message || "An error occurred while testing the configuration.",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const isConfigurationComplete = selectedModule && selectedModel && selectedTables.length > 0;

  return (
    <div className="space-y-8">
      {/* AI Enhancement Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Configuration Settings</h3>
          <p className="text-sm text-gray-600">Configure your data extraction parameters</p>
        </div>
        <Button
          variant={isAiEnabled ? "default" : "outline"}
          size="sm"
          onClick={() => setIsAiEnabled(!isAiEnabled)}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          AI Assistance {isAiEnabled ? 'On' : 'Off'}
        </Button>
      </div>

      <Separator />

      {/* Configuration Steps */}
      <div className="space-y-6">
        {/* Step 1: Module Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-semibold">
              1
            </div>
            <Label className="text-base font-semibold">Select Module</Label>
            {selectedModule && <CheckCircle className="h-5 w-5 text-green-600" />}
          </div>
          <ModuleSelector 
            selectedModule={selectedModule}
            onModuleSelect={setSelectedModule}
            aiEnabled={isAiEnabled}
          />
        </div>

        {/* Step 2: Model Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-semibold ${
              selectedModule ? 'bg-blue-600' : 'bg-gray-400'
            }`}>
              2
            </div>
            <Label className="text-base font-semibold">Select Model</Label>
            {selectedModel && <CheckCircle className="h-5 w-5 text-green-600" />}
          </div>
          <ModelSelector
            selectedModule={selectedModule}
            selectedModel={selectedModel}
            onModelSelect={setSelectedModel}
            aiEnabled={isAiEnabled}
          />
        </div>

        {/* Step 3: Table Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-semibold ${
              selectedModel ? 'bg-blue-600' : 'bg-gray-400'
            }`}>
              3
            </div>
            <Label className="text-base font-semibold">Select Tables</Label>
            {selectedTables.length > 0 && <CheckCircle className="h-5 w-5 text-green-600" />}
          </div>
          <TableSelector
            selectedModule={selectedModule}
            selectedModel={selectedModel}
            selectedTables={selectedTables}
            onTablesSelect={setSelectedTables}
            aiEnabled={isAiEnabled}
          />
        </div>
      </div>

      {/* Configuration Preview */}
      {isConfigurationComplete && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-green-900">Configuration Preview</h4>
          </div>
          <ConfigurationPreview
            module={selectedModule}
            model={selectedModel}
            tables={selectedTables}
          />
        </Card>
      )}

      <Separator />

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={handleTestConfiguration}
          disabled={!isConfigurationComplete || isTesting || isSaving}
          className="gap-2"
        >
          {isTesting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {isTesting ? "Testing..." : "Test Configuration"}
        </Button>
        <Button
          onClick={handleSaveConfiguration}
          disabled={!isConfigurationComplete || isSaving || isTesting}
          className="gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
};

export default ConfigurationForm;
