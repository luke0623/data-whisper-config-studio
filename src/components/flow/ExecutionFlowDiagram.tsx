import React, { useCallback, useMemo, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  ConnectionMode,
  Panel,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { RefreshCw, AlertCircle, Loader2, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { useFlowData } from '../../hooks/useFlowData';
import { nodeTypes } from './FlowNodes';
import { useToast } from '../../hooks/use-toast';
import { ModuleNodeData, ModelNodeData } from './FlowNodes';

/**
 * ExecutionFlowDiagram component props interface
 * Defines all configurable properties for the component
 */
export interface ExecutionFlowDiagramProps {
  autoFetch?: boolean;
  onNodeClick?: (node: Node) => void;
  onConnect?: (connection: Connection) => void;
  height?: string | number;
  width?: string | number;
  showControls?: boolean;
  showMiniMap?: boolean;
  showBackground?: boolean;
  showRefreshButton?: boolean;
  className?: string;
}

/**
 * Component internal state interface
 * Manages expanded modules and animation states
 */
interface DiagramState {
  /** Set of currently expanded module IDs */
  expandedModules: Set<string>;
  /** Set of node IDs currently executing animations */
  animatingNodes: Set<string>;
}

/**
 * Horizontal layout configuration interface
 * Defines all layout-related parameters
 */
interface HorizontalLayoutConfig {
  /** Horizontal spacing between modules */
  moduleSpacing: number;
  /** Vertical spacing between model nodes */
  modelVerticalSpacing: number;
  /** Horizontal offset from module to model */
  moduleToModelOffset: number;
  /** Layout starting position */
  startPosition: { x: number; y: number };
  /** Default node size */
  nodeSize: { width: number; height: number };
  /** Animation duration in milliseconds */
  animationDuration: number;
  /** Minimum distance between nodes */
  minNodeDistance: number;
  /** Edge margin */
  edgeMargin: number;
}

/**
 * Module layout information interface
 * Used to store module-related information during layout calculation
 */
interface ModuleLayoutInfo {
  /** Module node */
  module: Node<ModuleNodeData>;
  /** Number of models contained in the module */
  modelCount: number;
  /** Whether the module is expanded */
  isExpanded: boolean;
}

/**
 * Layout calculation result interface
 */
interface LayoutResult {
  /** Array of calculated nodes */
  nodes: Node[];
  /** Array of calculated edges */
  edges: Edge[];
}

/**
 * Flow statistics interface
 */
interface FlowStatistics {
  /** Total number of modules */
  modules: number;
  /** Total number of models */
  models: number;
  /** Total number of connection edges */
  connections: number;
  /** Number of expanded modules */
  expanded: number;
}

/**
 * Horizontal layout configuration
 * Defines node spacing, starting position and other layout parameters
 */
const HORIZONTAL_LAYOUT: HorizontalLayoutConfig = {
  // Horizontal spacing between module nodes (increased to avoid overlap)
  moduleSpacing: 600,
  // Vertical spacing between model nodes (increased for better readability)
  modelVerticalSpacing: 150,
  // Horizontal offset from module to model (increased for clear separation)
  moduleToModelOffset: 300,
  // Starting position (adjusted to ensure complete display)
  startPosition: { x: 150, y: 250 },
  // Node size (used for layout calculation)
  nodeSize: { width: 220, height: 90 },
  // Animation duration
  animationDuration: 600,
  // Minimum node distance (prevent overlap)
  minNodeDistance: 120,
  // Edge margin
  edgeMargin: 50,
};

/**
 * Utility function to calculate horizontal layout positions
 * 
 * @param moduleNodes - Array of module nodes
 * @param expandedModules - Set of expanded module IDs
 * @param animatingNodes - Set of node IDs currently executing animations
 * @param getModelsByModule - Function to get model nodes by module ID
 * @returns Layout result containing calculated nodes and edges
 */
const calculateHorizontalLayout = (
  moduleNodes: Node<ModuleNodeData>[],
  expandedModules: Set<string>,
  animatingNodes: Set<string>,
  getModelsByModule: (moduleId: string) => Node<ModelNodeData>[]
): LayoutResult => {
  const layoutNodes: Node[] = [];
  const layoutEdges: Edge[] = [];
  
  // Sort module nodes by priority
  const sortedModules = [...moduleNodes].sort((a, b) => a.data.priority - b.data.priority);
  
  // Calculate model count for each module, used for dynamic spacing adjustment
  const moduleModelCounts: ModuleLayoutInfo[] = sortedModules.map(module => ({
    module,
    modelCount: getModelsByModule(module.data.moduleId).length,
    isExpanded: expandedModules.has(module.data.moduleId)
  }));
  
  // Calculate module node positions (horizontal arrangement)
  let currentX = HORIZONTAL_LAYOUT.startPosition.x;
  
  moduleModelCounts.forEach((moduleInfo, moduleIndex) => {
    const { module: moduleNode, modelCount, isExpanded } = moduleInfo;
    const moduleY = HORIZONTAL_LAYOUT.startPosition.y;
    
    // Dynamically adjust module spacing, considering expanded model count
    if (moduleIndex > 0) {
      const prevModuleInfo = moduleModelCounts[moduleIndex - 1];
      const prevExpandedHeight = prevModuleInfo.isExpanded ? 
        prevModuleInfo.modelCount * HORIZONTAL_LAYOUT.modelVerticalSpacing : 0;
      const currentExpandedHeight = isExpanded ? 
        modelCount * HORIZONTAL_LAYOUT.modelVerticalSpacing : 0;
      
      // Adjust spacing based on expansion state
      const dynamicSpacing = Math.max(
        HORIZONTAL_LAYOUT.moduleSpacing,
        HORIZONTAL_LAYOUT.moduleToModelOffset + HORIZONTAL_LAYOUT.minNodeDistance
      );
      
      currentX += dynamicSpacing;
    }
    
    // Add module node
    const positionedModule: Node<ModuleNodeData> = {
      ...moduleNode,
      position: { x: currentX, y: moduleY },
      data: {
        ...moduleNode.data,
        isExpanded: expandedModules.has(moduleNode.data.moduleId),
        isAnimating: animatingNodes.has(moduleNode.id),
        childCount: getModelsByModule(moduleNode.data.moduleId).length,
      },
      style: {
        ...moduleNode.style,
        transition: `all ${HORIZONTAL_LAYOUT.animationDuration}ms ease-in-out`,
        zIndex: 10, // Ensure module nodes are on top layer
      },
    };
    
    layoutNodes.push(positionedModule);
    
    // If module is expanded, add its model nodes
    if (expandedModules.has(moduleNode.data.moduleId)) {
      const models = getModelsByModule(moduleNode.data.moduleId);
      
      // Calculate vertical distribution of model nodes, ensuring center alignment
      const totalHeight = (models.length - 1) * HORIZONTAL_LAYOUT.modelVerticalSpacing;
      const startY = moduleY - totalHeight / 2;
      
      models.forEach((modelNode, modelIndex) => {
        const modelX = currentX + HORIZONTAL_LAYOUT.moduleToModelOffset;
        const modelY = startY + modelIndex * HORIZONTAL_LAYOUT.modelVerticalSpacing;
        
        const positionedModel: Node<ModelNodeData> = {
          ...modelNode,
          position: { x: modelX, y: modelY },
          data: {
            ...modelNode.data,
            level: 1,
            isAnimating: animatingNodes.has(modelNode.id),
          },
          style: {
            ...modelNode.style,
            transition: `all ${HORIZONTAL_LAYOUT.animationDuration}ms ease-in-out`,
            opacity: 1,
            zIndex: 5, // Model nodes on middle layer
          },
        };
        
        layoutNodes.push(positionedModel);
        
        // Add connection edge from module to model (real data)
        layoutEdges.push({
          id: `edge-${moduleNode.id}-${modelNode.id}`,
          source: moduleNode.id,
          target: modelNode.id,
          sourceHandle: 'module-output',
          targetHandle: 'model-input',
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#94a3b8', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
          data: { type: 'module-model', level: 1 },
        });
      });
    }
  });
  
  // Add dependency edges between modules
  const processedPairs = new Set<string>();
  
  sortedModules.forEach(sourceModule => {
    const sourceModels = getModelsByModule(sourceModule.data.moduleId);
    
    sourceModels.forEach(sourceModel => {
      if (sourceModel.data.dependOn) {
        // Find dependent model
        sortedModules.forEach(targetModule => {
          if (targetModule.data.moduleId !== sourceModule.data.moduleId) {
            const targetModels = getModelsByModule(targetModule.data.moduleId);
            const dependentModel = targetModels.find(model => 
              model.data.modelId === sourceModel.data.dependOn ||
              model.data.label === sourceModel.data.dependOn
            );
            
            if (dependentModel) {
              const pairKey = `${sourceModule.data.moduleId}-${targetModule.data.moduleId}`;
              
              if (!processedPairs.has(pairKey)) {
                processedPairs.add(pairKey);
                
                // Add inter-module dependency edge (derived from real model dependencies)
                layoutEdges.push({
                  id: `module-edge-${sourceModule.id}-${targetModule.id}`,
                  source: targetModule.id,
                  target: sourceModule.id,
                  sourceHandle: 'module-output',
                  targetHandle: 'module-input',
                  type: 'smoothstep',
                  animated: false,
                  style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '6,4' },
                  markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
                  data: { type: 'module-dependency', level: 0 },
                });
              }
            }
          }
        });
      }
    });
  });
  
  return { nodes: layoutNodes, edges: layoutEdges };
};

function ExecutionFlowDiagram(props: ExecutionFlowDiagramProps) {
  // console.log('=== EXECUTION FLOW DIAGRAM COMPONENT MOUNTED ===');

  const {
    autoFetch = true,
    onNodeClick,
    onConnect,
    height = 600,
    width = '100%',
    showControls = true,
    showMiniMap = true,
    showBackground = true,
    showRefreshButton = true,
    className = '',
  } = props;

  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  const { toast } = useToast();
  const { isLoading, error, refetch, clearCache, getModuleNodes, getModelsByModule } = useFlowData(autoFetch);

  // Component state management
  const [state, setState] = useState<DiagramState>({
    expandedModules: new Set(),
    animatingNodes: new Set(),
  });

  // ReactFlow state management
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Calculate visible nodes and edges based on expansion state
  const visibleContent = useMemo(() => {
    console.log('=== CALCULATING VISIBLE CONTENT ===');
    console.log('Expanded modules:', state.expandedModules);

    const moduleNodes = getModuleNodes();
    console.log('Available module nodes:', moduleNodes.length);

    const result = calculateHorizontalLayout(
      moduleNodes,
      state.expandedModules,
      state.animatingNodes,
      getModelsByModule
    );

    console.log('=== LAYOUT RESULT ===');
    console.log('Nodes created:', result.nodes.length);
    console.log('Edges created:', result.edges.length);

    result.nodes.forEach((node, index) => {
      console.log(`Node ${index + 1}:`, {
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
      });
    });

    result.edges.forEach((edge, index) => {
      console.log(`Edge ${index + 1}:`, {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
        style: edge.style,
        label: edge.label,
        animated: edge.animated,
      });
    });

    return result;
  }, [getModuleNodes, getModelsByModule, state.expandedModules, state.animatingNodes]);

  // Update ReactFlow nodes and edges
  useEffect(() => {
    // console.log('=== UPDATING REACTFLOW STATE ===');
    // console.log('Current nodes count:', visibleContent.nodes.length);
    // console.log('Current edges count:', visibleContent.edges.length);
    
    // if (visibleContent.edges.length > 0) {
    console.log('Sample edges being set:', visibleContent.edges.slice(0, 3));
    
    
    setNodes(visibleContent.nodes);
    setEdges(visibleContent.edges);
    
    console.log('ReactFlow state updated successfully');
  }, [visibleContent, setNodes, setEdges]);

  // Handle connections
  const handleConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
      onConnect?.(params);
    },
    [setEdges, onConnect]
  );

  // Handle node click events
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const nodeData = node.data as ModuleNodeData | ModelNodeData;
    
    if (nodeData.type === 'module') {
      const moduleId = (nodeData as ModuleNodeData).moduleId;
      const isExpanded = state.expandedModules.has(moduleId);
      
      // Add animation state
      setState(prev => ({
        ...prev,
        animatingNodes: new Set([...prev.animatingNodes, node.id]),
      }));
      
      // Delay updating expansion state to achieve animation effect
      setTimeout(() => {
        setState(prev => {
          const newExpandedModules = new Set(prev.expandedModules);
          const newAnimatingNodes = new Set(prev.animatingNodes);
          
          if (isExpanded) {
            newExpandedModules.delete(moduleId);
          } else {
            newExpandedModules.add(moduleId);
          }
          
          newAnimatingNodes.delete(node.id);
          
          return {
            expandedModules: newExpandedModules,
            animatingNodes: newAnimatingNodes,
          };
        });
      }, 50);
      
      toast({
        title: isExpanded ? "Module Collapsed" : "Module Expanded",
        description: nodeData.label,
      });
    }
    
    onNodeClick?.(node);
  }, [state, toast, onNodeClick]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    try {
      await refetch();
      toast({
        title: "Refresh Successful",
        description: "Flow diagram has been updated",
      });
    } catch (err) {
      toast({
        title: "Refresh Failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  }, [refetch, toast]);

  // Handle cache clearing
  const handleClearCache = useCallback(() => {
    clearCache();
    setState({
      expandedModules: new Set(),
      animatingNodes: new Set(),
    });
    toast({
      title: "Cache Cleared",
      description: "Next load will fetch latest data",
    });
  }, [clearCache, toast]);

  // Reset view
  const handleResetView = useCallback(() => {
    setState({
      expandedModules: new Set(),
      animatingNodes: new Set(),
    });
    toast({
      title: "View Reset",
      description: "Returned to module overview",
    });
  }, [toast]);

  // Mini map node color
  const miniMapNodeColor = useCallback((node: Node) => {
    switch (node.data.type) {
      case 'module': return '#3b82f6';
      case 'model': return '#10b981';
      default: return '#6b7280';
    }
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const moduleCount = nodes.filter(n => n.data.type === 'module').length;
    const modelCount = nodes.filter(n => n.data.type === 'model').length;
    
    return {
      modules: moduleCount,
      models: modelCount,
      connections: edges.length,
      expanded: state.expandedModules.size,
    };
  }, [nodes, edges, state.expandedModules]);

  // Debug logging
  useEffect(() => {
    console.log('=== COMPONENT RENDERED ===');
    console.log('Nodes:', nodes.length);
    console.log('Edges:', edges.length);
    console.log('First few edges:', edges.slice(0, 3));
  }, [nodes, edges]);

  console.log('[ExecutionFlowDiagram] Data from useFlowData:', {
    isLoading,
    error,
    moduleNodesCount: getModuleNodes().length,
    hasGetModelsByModule: typeof getModelsByModule === 'function'
  });

  // NOW SAFE TO HAVE EARLY RETURNS AFTER ALL HOOKS
  // Loading state
  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg ${className}`}
        style={{ height, width }}
      >
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-600">Loading execution flow diagram...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`p-4 ${className}`} style={{ height, width }}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>Error loading flow diagram: {error}</p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </Button>
                <Button variant="outline" size="sm" onClick={handleClearCache}>
                  Clear Cache
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div 
      className={`relative border border-gray-200 rounded-lg overflow-hidden ${className}`}
      style={{ height, width }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ 
          padding: 0.2,
          includeHiddenNodes: false,
          minZoom: 0.1,
          maxZoom: 2,
        }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        // Remove defaultEdgeOptions to let individual edge styles work
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        onlyRenderVisibleElements={false} // Changed to false for testing
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnScroll={false}
        zoomOnDoubleClick={false}
      >
        {showControls && <Controls showInteractive={false} />}
        
        {showMiniMap && (
          <MiniMap 
            nodeColor={miniMapNodeColor}
            nodeStrokeWidth={3}
            zoomable
            pannable
            style={{
              height: 120,
              width: 200,
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
        )}
        
        {showBackground && (
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={25}
            size={1.5}
            color="#e5e7eb"
          />
        )}

        {/* Statistics panel */}
        <Panel position="top-left">
          <div className="bg-white p-3 rounded-lg shadow-lg border text-xs max-w-xs">
            <div className="font-semibold text-gray-700 mb-2 flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              Flow Statistics
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Modules:</span>
                <span className="text-blue-500">{stats.modules}</span>
              </div>
              <div className="flex justify-between">
                <span>Models:</span>
                <span className="text-green-500">{stats.models}</span>
              </div>
              <div className="flex justify-between">
                <span>Connections:</span>
                <span className="text-orange-500">{stats.connections}</span>
              </div>
              <div className="flex justify-between">
                <span>Expanded:</span>
                <span className="text-amber-500">{stats.expanded}</span>
              </div>
            </div>
          </div>
        </Panel>

        {/* Control panel */}
        {showRefreshButton && (
          <Panel position="top-right">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClearCache}>
                Clear Cache
              </Button>
              {state.expandedModules.size > 0 && (
                <Button variant="secondary" size="sm" onClick={handleResetView}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset View
                </Button>
              )}
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};
export default ExecutionFlowDiagram;
export { ExecutionFlowDiagram };