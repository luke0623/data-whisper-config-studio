
import React from 'react';
import { Card } from '@/components/ui/card';
import { Brain, Database, Settings, Zap } from 'lucide-react';
import ConfigurationForm from '@/components/ConfigurationForm';
import Header from '@/components/Header';
import FeatureCards from '@/components/FeatureCards';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Header />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Configuration Panel */}
          <div className="lg:col-span-2">
            <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Data MO Configuration</h2>
                  <p className="text-gray-600">Configure your data extraction settings with AI assistance</p>
                </div>
              </div>
              
              <ConfigurationForm />
            </Card>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-1 space-y-6">
            <FeatureCards />
            
            {/* AI Assistant Panel */}
            <Card className="p-6 bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="h-6 w-6" />
                <h3 className="text-lg font-semibold">AI Assistant</h3>
              </div>
              <p className="text-violet-100 mb-4">
                Get intelligent suggestions for your configuration based on industry best practices.
              </p>
              <div className="flex items-center gap-2 text-violet-200 text-sm">
                <Zap className="h-4 w-4" />
                <span>Auto-complete • Smart mapping • Validation</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
