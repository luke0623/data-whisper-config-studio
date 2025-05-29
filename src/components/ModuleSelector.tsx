
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, Shield, DollarSign, FileText, Users, TrendingUp, Sparkles } from 'lucide-react';

interface ModuleSelectorProps {
  selectedModule: string;
  onModuleSelect: (module: string) => void;
  aiEnabled: boolean;
}

const ModuleSelector: React.FC<ModuleSelectorProps> = ({
  selectedModule,
  onModuleSelect,
  aiEnabled
}) => {
  const modules = [
    {
      id: 'policy_management',
      name: 'Policy Management',
      description: 'Manage insurance policies, coverage, and renewals',
      icon: <Shield className="h-5 w-5" />,
      popular: true,
      aiSuggested: true
    },
    {
      id: 'claims',
      name: 'Claims',
      description: 'Handle claims processing and settlements',
      icon: <FileText className="h-5 w-5" />,
      popular: true,
      aiSuggested: false
    },
    {
      id: 'finance',
      name: 'Finance',
      description: 'Financial operations and accounting',
      icon: <DollarSign className="h-5 w-5" />,
      popular: false,
      aiSuggested: true
    },
    {
      id: 'reinsurance',
      name: 'Reinsurance',
      description: 'Reinsurance contracts and management',
      icon: <Building className="h-5 w-5" />,
      popular: false,
      aiSuggested: false
    },
    {
      id: 'sales_management',
      name: 'Sales Management',
      description: 'Sales operations and customer management',
      icon: <Users className="h-5 w-5" />,
      popular: true,
      aiSuggested: true
    },
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'Business intelligence and reporting',
      icon: <TrendingUp className="h-5 w-5" />,
      popular: false,
      aiSuggested: false
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {modules.map((module) => (
        <Card
          key={module.id}
          className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
            selectedModule === module.id
              ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200'
              : 'hover:border-gray-300'
          }`}
          onClick={() => onModuleSelect(module.id)}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                selectedModule === module.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {module.icon}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{module.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{module.description}</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {module.popular && (
              <Badge variant="secondary" className="text-xs">
                Popular
              </Badge>
            )}
            {aiEnabled && module.aiSuggested && (
              <Badge variant="outline" className="text-xs bg-purple-50 border-purple-200 text-purple-700">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Suggested
              </Badge>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ModuleSelector;
