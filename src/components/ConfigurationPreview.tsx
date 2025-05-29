
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Database, ArrowRight } from 'lucide-react';

interface ConfigurationPreviewProps {
  module: string;
  model: string;
  tables: string[];
}

const ConfigurationPreview: React.FC<ConfigurationPreviewProps> = ({
  module,
  model,
  tables
}) => {
  const formatName = (id: string) => {
    return id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-gray-600" />
          <span className="font-medium">Module:</span>
          <Badge variant="outline">{formatName(module)}</Badge>
        </div>
        
        <ArrowRight className="h-4 w-4 text-gray-400" />
        
        <div className="flex items-center gap-2">
          <span className="font-medium">Model:</span>
          <Badge variant="outline">{formatName(model)}</Badge>
        </div>
      </div>

      <Separator className="bg-green-200" />

      <div>
        <span className="text-sm font-medium text-gray-700 mb-2 block">Selected Tables:</span>
        <div className="flex flex-wrap gap-2">
          {tables.map((table) => (
            <Badge key={table} variant="secondary" className="bg-blue-100 text-blue-800">
              {formatName(table)}
            </Badge>
          ))}
        </div>
      </div>

      <div className="text-xs text-green-700 bg-green-100 p-2 rounded">
        <strong>Preview:</strong> This configuration will extract data from {tables.length} table{tables.length > 1 ? 's' : ''} 
        in the {formatName(model)} model within the {formatName(module)} module. 
        The data will be joined and formatted as JSON for ingestion.
      </div>
    </div>
  );
};

export default ConfigurationPreview;
