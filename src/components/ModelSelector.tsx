
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, FileText, User, CreditCard, Calendar, Sparkles } from 'lucide-react';

interface ModelSelectorProps {
  selectedModule: string;
  selectedModel: string;
  onModelSelect: (model: string) => void;
  aiEnabled: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModule,
  selectedModel,
  onModelSelect,
  aiEnabled
}) => {
  const getModelsForModule = (moduleId: string) => {
    const modelMappings: Record<string, any[]> = {
      policy_management: [
        { id: 'policy', name: 'Policy', icon: <FileText className="h-4 w-4" />, aiSuggested: true },
        { id: 'quote', name: 'Quote', icon: <Calendar className="h-4 w-4" />, aiSuggested: true },
        { id: 'approval', name: 'Approval', icon: <Database className="h-4 w-4" />, aiSuggested: false },
        { id: 'coverage', name: 'Coverage', icon: <FileText className="h-4 w-4" />, aiSuggested: false }
      ],
      claims: [
        { id: 'claim', name: 'Claim', icon: <FileText className="h-4 w-4" />, aiSuggested: true },
        { id: 'settlement', name: 'Settlement', icon: <CreditCard className="h-4 w-4" />, aiSuggested: true },
        { id: 'adjuster', name: 'Adjuster', icon: <User className="h-4 w-4" />, aiSuggested: false }
      ],
      finance: [
        { id: 'transaction', name: 'Transaction', icon: <CreditCard className="h-4 w-4" />, aiSuggested: true },
        { id: 'invoice', name: 'Invoice', icon: <FileText className="h-4 w-4" />, aiSuggested: true },
        { id: 'payment', name: 'Payment', icon: <CreditCard className="h-4 w-4" />, aiSuggested: false }
      ],
      reinsurance: [
        { id: 'contract', name: 'Contract', icon: <FileText className="h-4 w-4" />, aiSuggested: true },
        { id: 'treaty', name: 'Treaty', icon: <Database className="h-4 w-4" />, aiSuggested: false }
      ],
      sales_management: [
        { id: 'customer', name: 'Customer', icon: <User className="h-4 w-4" />, aiSuggested: true },
        { id: 'lead', name: 'Lead', icon: <User className="h-4 w-4" />, aiSuggested: true },
        { id: 'opportunity', name: 'Opportunity', icon: <Calendar className="h-4 w-4" />, aiSuggested: false }
      ],
      analytics: [
        { id: 'report', name: 'Report', icon: <Database className="h-4 w-4" />, aiSuggested: true },
        { id: 'dashboard', name: 'Dashboard', icon: <Database className="h-4 w-4" />, aiSuggested: false }
      ]
    };

    return modelMappings[moduleId] || [];
  };

  const models = getModelsForModule(selectedModule);

  if (!selectedModule) {
    return (
      <Card className="p-8 text-center bg-gray-50 border-dashed">
        <Database className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Please select a module first to see available models</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {models.map((model) => (
        <Card
          key={model.id}
          className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
            selectedModel === model.id
              ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200'
              : 'hover:border-gray-300'
          }`}
          onClick={() => onModelSelect(model.id)}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${
              selectedModel === model.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {model.icon}
            </div>
            <span className="font-semibold text-gray-900">{model.name}</span>
          </div>
          
          {aiEnabled && model.aiSuggested && (
            <Badge variant="outline" className="text-xs bg-purple-50 border-purple-200 text-purple-700">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Suggested
            </Badge>
          )}
        </Card>
      ))}
    </div>
  );
};

export default ModelSelector;
