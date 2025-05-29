
import React from 'react';
import { Database, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Header = () => {
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
          <Database className="h-8 w-8 text-white" />
        </div>
        <div className="text-left">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Data MO Ingestion
          </h1>
          <p className="text-lg text-gray-600">Master Object Configuration Platform</p>
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-2">
        <Badge variant="outline" className="bg-white/70 backdrop-blur-sm border-blue-200">
          <Sparkles className="h-3 w-3 mr-1" />
          AI Enhanced
        </Badge>
        <Badge variant="outline" className="bg-white/70 backdrop-blur-sm border-green-200">
          Business Friendly
        </Badge>
        <Badge variant="outline" className="bg-white/70 backdrop-blur-sm border-purple-200">
          Real-time Configuration
        </Badge>
      </div>
    </div>
  );
};

export default Header;
