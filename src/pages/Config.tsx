
import React from 'react';
import ConfigurationForm from '@/components/ConfigurationForm';
import { Card } from '@/components/ui/card';
import { Settings } from 'lucide-react';

const Config = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Configuration</h1>
          <p className="text-gray-600">Configure data extraction settings</p>
        </div>
      </div>
      
      <Card className="p-8">
        <ConfigurationForm />
      </Card>
    </div>
  );
};

export default Config;
