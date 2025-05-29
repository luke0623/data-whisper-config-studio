import React, { useState, useEffect, useCallback } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { Database, Search, Sparkles, Info, RefreshCw, HelpCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import DatabaseFlowChart from '@/components/discovery/DatabaseFlowChart';
import EntityDetails from '@/components/discovery/EntityDetails';
import DatabaseInsights from '@/components/discovery/DatabaseInsights';
import { discoveryService } from '@/services';
import { DatabaseEntity, DatabaseInsight } from '@/models/discovery.models';

const Discovery = () => {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [entities, setEntities] = useState<DatabaseEntity[]>([]);
  const [filteredEntities, setFilteredEntities] = useState<DatabaseEntity[]>([]);
  const [relationships, setRelationships] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState<DatabaseEntity | null>(null);
  const [insights, setInsights] = useState<DatabaseInsight[]>([]);
  const [activeTab, setActiveTab] = useState('visualization');

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // In a real application, these would be API calls
        // For now, we'll use the mock data from the service
        const mockEntities = discoveryService.getMockDatabaseEntities();
        const mockRelationships = discoveryService.getMockRelationships();
        const mockInsights = discoveryService.getMockInsights();
        
        setEntities(mockEntities);
        setFilteredEntities(mockEntities);
        setRelationships(mockRelationships);
        setInsights(mockInsights);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filter entities based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEntities(entities);
      return;
    }
    
    const filtered = entities.filter(entity => 
      entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.columns.some(col => 
        col.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        col.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    
    setFilteredEntities(filtered);
  }, [searchTerm, entities]);

  // Handle entity selection
  const handleEntitySelect = useCallback((entity: DatabaseEntity | null) => {
    setSelectedEntity(entity);
  }, []);

  // Handle insight click
  const handleInsightClick = useCallback((insight: DatabaseInsight) => {
    if (insight.relatedEntities && insight.relatedEntities.length > 0) {
      const entityId = insight.relatedEntities[0];
      const entity = entities.find(e => e.id === entityId);
      if (entity) {
        setSelectedEntity(entity);
        setActiveTab('visualization');
      }
    }
  }, [entities]);

  // Simulate AI analysis
  const runAnalysis = useCallback(async () => {
    setAnalyzing(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real application, this would be an API call
      const mockInsights = discoveryService.getMockInsights();
      setInsights(mockInsights);
      
      // Switch to insights tab
      setActiveTab('insights');
    } catch (error) {
      console.error('Error running analysis:', error);
    } finally {
      setAnalyzing(false);
    }
  }, []);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header with title and description */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md">
            <Database className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Discovery</h1>
            <p className="text-gray-600 mt-1">Explore your database structure and discover insights</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2 self-start md:self-auto">
          <HelpCircle className="h-4 w-4" />
          View Documentation
        </Button>
      </div>
      
      {/* Info banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-indigo-800">AI-Powered Database Discovery</h3>
          <p className="text-sm text-indigo-700 mt-1">
            This tool visualizes your database structure and uses AI to provide insights about relationships,
            optimization opportunities, and potential issues. Select tables to view details and run analysis
            to get AI-generated recommendations.
          </p>
        </div>
      </div>
      
      <Separator />
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search and actions */}
          <Card className="p-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search entities..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Button 
                className="w-full gap-2" 
                onClick={runAnalysis}
                disabled={analyzing || loading}
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Run AI Analysis
                  </>
                )}
              </Button>
            </div>
          </Card>
          
          
        </div>
        
        {/* Main content area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tabs and visualization/insights content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="visualization" className="gap-2">
                  <Database className="h-4 w-4" />
                  Visualization
                </TabsTrigger>
                <TabsTrigger value="insights" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI Insights
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                    {insights.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 flex items-center gap-1 px-3 py-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Enhanced
                </Badge>
              </div>
            </div>
            
            <TabsContent value="visualization" className="m-0">
              {loading ? (
                <div className="h-[600px] bg-gray-50 rounded-lg border flex items-center justify-center">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading database structure...</p>
                  </div>
                </div>
              ) : (
                <ReactFlowProvider>
                  <DatabaseFlowChart 
                    entities={filteredEntities}
                    relationships={relationships}
                    onEntitySelect={handleEntitySelect}
                  />
                </ReactFlowProvider>
              )}
              
              <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span>Click on an entity to view its details. Drag to reposition entities.</span>
              </div>
            </TabsContent>
            
            <TabsContent value="insights" className="m-0 space-y-4">
              {loading || analyzing ? (
                <Card className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </Card>
              ) : insights.length > 0 ? (
                <DatabaseInsights 
                  insights={insights} 
                  onInsightClick={handleInsightClick}
                />
              ) : (
                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertTitle>No insights available</AlertTitle>
                  <AlertDescription>
                    Run the AI analysis to generate insights about your database structure.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Entity details moved to bottom */}
          
          <div className="h-[300px]">
            {loading ? (
              <Card className="h-full p-6 space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Separator />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </Card>
            ) : (
              <EntityDetails entity={selectedEntity} />
            )}
          </div>
        </div>
      </div>
      
      {/* Help section */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Need Help?</h3>
        <p className="text-gray-600 mb-4">
          If you need assistance with data discovery, please refer to our documentation
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

export default Discovery;