import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ExecutionFlowDiagram } from '../ExecutionFlowDiagram';
import { flowDataService } from '../../../services/flowDataService';

// Mock the services
jest.mock('../../../services/flowDataService');
jest.mock('../../../services/moduleService');
jest.mock('../../../services/modelService');
jest.mock('../../../services/tableService');

// Mock ReactFlow
jest.mock('reactflow', () => ({
  ReactFlow: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="react-flow">{children}</div>
  ),
  Controls: () => <div data-testid="controls" />,
  MiniMap: () => <div data-testid="minimap" />,
  Background: () => <div data-testid="background" />,
  BackgroundVariant: { Dots: 'dots' },
  useNodesState: () => [[], jest.fn()],
  useEdgesState: () => [[], jest.fn()],
}));

const mockFlowDataService = flowDataService as jest.Mocked<typeof flowDataService>;

describe('ExecutionFlowDiagram', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFlowDataService.getAllRelationshipData.mockResolvedValue({
      modules: [],
      models: [],
      tables: [],
    });
  });

  it('renders loading state initially', () => {
    render(<ExecutionFlowDiagram />);
    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });

  it('renders ReactFlow components when data is loaded', async () => {
    render(<ExecutionFlowDiagram autoFetch={true} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });
    
    expect(screen.getByTestId('controls')).toBeInTheDocument();
    expect(screen.getByTestId('minimap')).toBeInTheDocument();
    expect(screen.getByTestId('background')).toBeInTheDocument();
  });

  it('displays error message when data loading fails', async () => {
    mockFlowDataService.getAllRelationshipData.mockRejectedValue(
      new Error('Failed to load data')
    );

    render(<ExecutionFlowDiagram autoFetch={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('加载失败')).toBeInTheDocument();
    });
  });

  it('shows statistics when data is loaded', async () => {
    mockFlowDataService.getAllRelationshipData.mockResolvedValue({
      modules: [{ moduleId: 1, moduleName: 'Test Module', priority: 1 }],
      models: [{ modelId: 1, modelName: 'Test Model', priority: 1, moduleId: 1 }],
      tables: [{ configId: 1, name: 'Test Table', modelName: 'Test Model' }],
    });

    render(<ExecutionFlowDiagram autoFetch={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('1 个模块')).toBeInTheDocument();
      expect(screen.getByText('1 个模型')).toBeInTheDocument();
      expect(screen.getByText('1 个表')).toBeInTheDocument();
    });
  });

  it('renders refresh button', async () => {
    render(<ExecutionFlowDiagram />);
    
    await waitFor(() => {
      expect(screen.getByText('刷新')).toBeInTheDocument();
    });
  });
});