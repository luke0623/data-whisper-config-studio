
import React from 'react';
import ConfigurationForm from '@/components/ConfigurationForm';
import { Card } from '@/components/ui/card';
import { Settings, Info, HelpCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

const Config = () => {
  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header with title and description */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
            <Settings className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Watchmen Configuration</h1>
            <p className="text-gray-600 mt-1">Configure your data extraction settings for optimal results</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2 self-start md:self-auto">
          <HelpCircle className="h-4 w-4" />
          View Documentation
        </Button>
      </div>
      
      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-blue-800">Configuration Wizard</h3>
          <p className="text-sm text-blue-700 mt-1">
            This wizard will guide you through setting up your data extraction configuration.
            Follow the steps to select your module, model, and tables for data ingestion.
          </p>
        </div>
      </div>
      
      <Separator />
      
      {/* Main content */}
      <Card className="p-8 border border-gray-200 shadow-lg rounded-xl bg-white">
        <ConfigurationForm />
      </Card>
      
      {/* Help section */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Need Help?</h3>
        <p className="text-gray-600 mb-4">
          If you need assistance with configuration, please refer to our documentation
          or contact the support team.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            View Documentation
          </Button>
          <Button variant="secondary" size="sm" className="gap-2">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Config;
