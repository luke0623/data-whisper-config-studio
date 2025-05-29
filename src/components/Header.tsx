
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface HeaderProps {
  title: string;
  description?: string;
  showAIBadge?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  description, 
  showAIBadge = false 
}) => {
  return (
    <div className="flex flex-col space-y-2 mb-6">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {showAIBadge && (
          <Badge variant="outline" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 flex items-center gap-1 px-3 py-1 h-6">
            <Sparkles className="h-3.5 w-3.5" />
            AI Enhanced
          </Badge>
        )}
      </div>
      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

export default Header;
