
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Sparkles, Play, Loader2, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ModuleSelector from '@/components/ModuleSelector';
import ModelSelector from '@/components/ModelSelector';
import ConfigurationPreview from '@/components/ConfigurationPreview';
import { configService } from '@/services';
import { ConfigurationData } from '@/models';

const ConfigurationForm = () => {
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  const handleTestConfiguration = async () => {
    if (!selectedModule || !selectedModel) {
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
        tables: [], // Empty tables array since we removed table selection
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

  const isConfigurationComplete = selectedModule && selectedModel;
  
  const handleNextStep = () => {
    if (activeStep < 2) {
      setActiveStep(activeStep + 1);
    }
  };
  
  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with AI Enhancement Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Configuration Wizard</h3>
          <p className="text-sm text-gray-600">Follow the steps below to configure your data extraction</p>
        </div>
        <Button
          variant={isAiEnabled ? "default" : "outline"}
          size="sm"
          onClick={() => setIsAiEnabled(!isAiEnabled)}
          className="gap-2 self-start sm:self-auto"
        >
          <Sparkles className="h-4 w-4" />
          AI Assistance {isAiEnabled ? 'On' : 'Off'}
        </Button>
      </div>

      <Separator className="my-6" />

      {/* Progress Indicator */}
      <div className="relative mb-8">
        <div className="overflow-hidden h-2 mb-6 text-xs flex rounded bg-gray-200">
          <div 
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
            style={{ width: `${(activeStep / 2) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between">
          <div className={`text-center ${activeStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${activeStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {selectedModule ? <CheckCircle className="h-5 w-5" /> : "1"}
            </div>
            <div className="text-xs mt-1">Module</div>
          </div>
          <div className={`text-center ${activeStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${activeStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {selectedModel ? <CheckCircle className="h-5 w-5" /> : "2"}
            </div>
            <div className="text-xs mt-1">Model</div>
          </div>
        </div>
      </div>

      {/* Configuration Steps */}
      <div className="space-y-6">
        {/* Step 1: Module Selection */}
        <div className={`space-y-4 transition-all duration-300 ${activeStep === 1 ? 'block' : 'hidden'}`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-semibold">
              1
            </div>
            <Label className="text-lg font-semibold">Select Module</Label>
            {selectedModule && <CheckCircle className="h-5 w-5 text-green-600" />}
          </div>
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <ModuleSelector 
                selectedModule={selectedModule}
                onModuleSelect={setSelectedModule}
                aiEnabled={isAiEnabled}
              />
            </CardContent>
          </Card>
          <div className="flex justify-end mt-4">
            <Button 
              onClick={handleNextStep} 
              disabled={!selectedModule}
              className="gap-2"
            >
              Next Step
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Step 2: Model Selection */}
        <div className={`space-y-4 transition-all duration-300 ${activeStep === 2 ? 'block' : 'hidden'}`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-semibold">
              2
            </div>
            <Label className="text-lg font-semibold">Select Model</Label>
            {selectedModel && <CheckCircle className="h-5 w-5 text-green-600" />}
          </div>
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <ModelSelector
                selectedModule={selectedModule}
                selectedModel={selectedModel}
                onModelSelect={setSelectedModel}
                aiEnabled={isAiEnabled}
              />
            </CardContent>
          </Card>
          <div className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={handlePrevStep}
            >
              Back
            </Button>
          </div>
        </div>
      </div>

      {/* Configuration Preview */}
      {isConfigurationComplete && (
        <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-green-900">Configuration Preview</h4>
          </div>
          <ConfigurationPreview
            module={selectedModule}
            model={selectedModel}
            tables={[]}
          />
        </Card>
      )}

      <Separator className="my-6" />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
        <Button
          variant="outline"
          onClick={handleTestConfiguration}
          disabled={!isConfigurationComplete || isTesting}
          className="gap-2"
        >
          {isTesting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {isTesting ? "Testing..." : "Test Configuration"}
        </Button>
      </div>
    </div>
  );
};

export default ConfigurationForm;
