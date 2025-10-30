import { Model } from '../models/model';
import { API_BASE_URL } from '../utils/apiConfig';
import { authService } from './authService';

/**
 * API Response Interface
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Pagination Query Parameters
 */
interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: keyof Model;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

/**
 * Paginated Response Data
 */
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Create Model Request Data (excluding auto-generated fields)
 */
type CreateModelRequest = Omit<Model, 'modelId' | 'createdAt' | 'lastModifiedAt'>;

/**
 * Update Model Request Data (partial fields optional)
 */
type UpdateModelRequest = Partial<Omit<Model, 'modelId' | 'createdAt' | 'createdBy'>>;

/**
 * Custom Error Class for Model Service
 */
export class ModelServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ModelServiceError';
  }
}

export const getDefaultHeaders = () => {
  // Get token from logged-in user via authService
  const token = authService.getStoredToken();
 
  return {
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Authorization': `Bearer ${token}`,
  };
};

/**
 * Mock data for fallback when API is unavailable
 */
const MOCK_MODELS: Model[] = [
  {
    modelId: 'policy_001',
    modelName: 'Policy',
    dependOn: '',
    rawTopicCode: 'POLICY_TOPIC',
    isParalleled: true,
    version: '1.0.0',
    tenantId: 'tenant_001',
    createdAt: '2024-01-15T10:00:00Z',
    createdBy: 'admin',
    lastModifiedAt: '2024-01-15T10:00:00Z',
    lastModifiedBy: 'admin',
    moduleId: 'policy_mgmt_001',
    priority: 1
  },
  {
    modelId: 'customer_001',
    modelName: 'Customer',
    dependOn: '',
    rawTopicCode: 'CUSTOMER_TOPIC',
    isParalleled: false,
    version: '1.2.0',
    tenantId: 'tenant_001',
    createdAt: '2024-01-10T08:30:00Z',
    createdBy: 'admin',
    lastModifiedAt: '2024-01-20T14:15:00Z',
    lastModifiedBy: 'system',
    moduleId: 'customer_mgmt_001',
    priority: 2
  },
  {
    modelId: 'order_001',
    modelName: 'Order',
    dependOn: 'customer_001',
    rawTopicCode: 'ORDER_TOPIC',
    isParalleled: true,
    version: '1.1.0',
    tenantId: 'tenant_001',
    createdAt: '2024-01-12T12:00:00Z',
    createdBy: 'admin',
    lastModifiedAt: '2024-01-18T16:45:00Z',
    lastModifiedBy: 'developer',
    moduleId: 'order_mgmt_001',
    priority: 3
  }
];

/**
 * Model Data Access Service Class
 * Implements complete CRUD operations using native fetch API
 */
export class ModelService {
  private useMockData: boolean;

  constructor(useMockData: boolean = false) {
    this.useMockData = useMockData;
  }

  /**
   * Generic HTTP Request Method
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}/watchmen/ingest/config/model${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...getDefaultHeaders(),
          ...options.headers,
        },
      });

      // 检查 HTTP 状态码
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If not JSON format, use original error text
          errorMessage = errorText || errorMessage;
        }
        
        throw new ModelServiceError(errorMessage, response.status);
      }

      // 解析响应数据
      const data = await response.json();
      return {
        success: true,
        data,
        message: data.message
      };
    } catch (error) {
      if (error instanceof ModelServiceError) {
        throw error;
      }
      
      throw new ModelServiceError(
        `Network request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get All Models (Paginated)
   */
  async getAllModels(params: PaginationParams = {}): Promise<PaginatedResponse<Model>> {
    if (this.useMockData) {
      // Apply client-side filtering and pagination for mock data
      let filteredModels = MOCK_MODELS;
      
      // Apply search filter
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredModels = filteredModels.filter(model => 
          (model.modelName || '').toLowerCase().includes(searchLower) ||
          (model.dependOn || '').toLowerCase().includes(searchLower) ||
          (model.rawTopicCode || '').toLowerCase().includes(searchLower)
        );
      }
      
      // Apply sorting
      if (params.sortBy) {
        filteredModels.sort((a, b) => {
          const aValue = a[params.sortBy as keyof Model];
          const bValue = b[params.sortBy as keyof Model];
          
          if (aValue < bValue) return params.sortOrder === 'desc' ? 1 : -1;
          if (aValue > bValue) return params.sortOrder === 'desc' ? -1 : 1;
          return 0;
        });
      }
      
      // Apply pagination
      const { page = 1, limit = 10 } = params;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const items = filteredModels.slice(startIndex, endIndex);
      
      return {
        items,
        total: filteredModels.length,
        page,
        limit,
        totalPages: Math.ceil(filteredModels.length / limit)
      };
    }

    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.search) queryParams.append('search', params.search);
    
    // Default sort by creation time
    if (!params.sortBy) {
      queryParams.append('sortBy', 'createdAt');
      queryParams.append('sortOrder', 'desc');
    }

    try {
      const response = await this.request<PaginatedResponse<Model>>(`?${queryParams}`);
      
      if (!response.success || !response.data) {
        throw new ModelServiceError(response.error || 'Failed to get model list');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching models:', error);
      // Fallback to mock data if enabled
      if (this.useMockData) {
        return this.getAllModels(params);
      }
      throw new ModelServiceError(
        'Failed to fetch models',
        undefined,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Get mock models data
   * @returns Model[] - Array of mock models
   */
  getMockModels(): Model[] {
    return MOCK_MODELS;
  }

  /**
   * Find All Models (No Pagination)
   * Uses the /watchmen/ingest/config/model/all endpoint to retrieve all models
   */
  async findAllModels(): Promise<Model[]> {
    console.log('[ModelService] Starting findAllModels request');
    
    try {
      const url = `${API_BASE_URL}/watchmen/ingest/config/model/all`;
      console.log('[ModelService] Making request to:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders()
      });

      console.log('[ModelService] Response status:', response.status, response.statusText);

      // Check HTTP status code
      if (!response.ok) {
        throw new ModelServiceError(
          `Failed to fetch models: ${response.status} ${response.statusText}`,
          response.status
        );
      }

      // Parse response data
      const data = await response.json();
      console.log('[ModelService] Raw response data:', data);
      
      // Handle different response formats
      if (Array.isArray(data)) {
        console.log('[ModelService] Response is array, returning directly:', data.length, 'items');
        return data;
      } else if (data.data && Array.isArray(data.data)) {
        console.log('[ModelService] Response has data array:', data.data.length, 'items');
        return data.data;
      } else if (data.success && data.data && Array.isArray(data.data)) {
        console.log('[ModelService] Response has success.data array:', data.data.length, 'items');
        return data.data;
      } else {
        console.warn('[ModelService] Invalid response format, falling back to mock data');
        const mockData = this.getMockModels();
        console.log('[ModelService] Using mock data:', mockData.length, 'items');
        return mockData;
      }
    } catch (error) {
      console.warn(`[ModelService] Network error: ${error instanceof Error ? error.message : 'Unknown error'}, falling back to mock data`);
      const mockData = this.getMockModels();
      console.log('[ModelService] Using mock data due to error:', mockData.length, 'items');
      return mockData;
    }
  }

  /**
   * Get Model by ID
   */
  async getModelById(modelId: string): Promise<Model> {
    if (!modelId) {
      throw new ModelServiceError('Model ID cannot be empty');
    }

    if (this.useMockData) {
      const model = MOCK_MODELS.find(m => m.modelId === modelId);
      if (!model) {
        throw new ModelServiceError(`Model with ID ${modelId} not found`, 404);
      }
      return model;
    }

    try {
      const response = await this.request<Model>(`/${encodeURIComponent(modelId)}`);
      
      if (!response.success || !response.data) {
        throw new ModelServiceError(response.error || 'Failed to get model details');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching model details:', error);
      if (this.useMockData) {
        const model = MOCK_MODELS.find(m => m.modelId === modelId);
        if (!model) throw new ModelServiceError(`Model with ID ${modelId} not found`, 404);
        return model;
      }
      throw error;
    }
  }

  /**
   * Create New Model
   */
  async createModel(data: CreateModelRequest): Promise<Model> {
    this.validateCreateModelRequest(data);

    const response = await this.request<Model>('', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.success || !response.data) {
      throw new ModelServiceError(response.error || 'Failed to create model');
    }
    
    return response.data;
  }

  /**
   * Update Model
   */
  async updateModel(id: string, data: UpdateModelRequest): Promise<Model> {
    if (!id) {
      throw new ModelServiceError('Model ID cannot be empty');
    }
    
    this.validateUpdateModelRequest(data);

    const response = await this.request<Model>(`/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        lastModifiedAt: new Date().toISOString(),
      }),
    });
    
    if (!response.success || !response.data) {
      throw new ModelServiceError(response.error || 'Failed to update model');
    }
    
    return response.data;
  }

  /**
   * Delete Model
   */
  async deleteModel(modelId: string): Promise<void> {
    if (!modelId) {
      throw new ModelServiceError('Model ID cannot be empty');
    }

    const response = await this.request<void>(`/${encodeURIComponent(modelId)}`, {
      method: 'DELETE',
    });
    
    if (!response.success) {
      throw new ModelServiceError(response.error || 'Failed to delete model');
    }
  }

  /**
   * 批量删除模型
   */
  async deleteModels(modelIds: string[]): Promise<void> {
    if (!modelIds || modelIds.length === 0) {
      throw new ModelServiceError('模型 ID 列表不能为空');
    }

    const response = await this.request<void>('/batch', {
      method: 'DELETE',
      body: JSON.stringify({ modelIds }),
    });
    
    if (!response.success) {
      throw new ModelServiceError(response.error || '批量删除模型失败');
    }
  }

  /**
   * 根据模块 ID 获取模型列表
   */
  async getModelsByModuleId(moduleId: string): Promise<Model[]> {
    if (!moduleId) {
      throw new ModelServiceError('模块 ID 不能为空');
    }

    const response = await this.request<Model[]>(`/module/${encodeURIComponent(moduleId)}`);
    
    if (!response.success || !response.data) {
      throw new ModelServiceError(response.error || '获取模块模型列表失败');
    }
    
    return response.data;
  }

  /**
   * 根据租户 ID 获取模型列表
   */
  async getModelsByTenantId(tenantId: string): Promise<Model[]> {
    if (!tenantId) {
      throw new ModelServiceError('租户 ID 不能为空');
    }

    const response = await this.request<Model[]>(`/tenant/${encodeURIComponent(tenantId)}`);
    
    if (!response.success || !response.data) {
      throw new ModelServiceError(response.error || '获取租户模型列表失败');
    }
    
    return response.data;
  }

  /**
   * 搜索模型
   */
  async searchModels(params: {
    query?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{ models: Model[]; total: number; page: number; limit: number }> {
    const queryParams = new URLSearchParams();
    
    if (params.query) queryParams.append('query', params.query);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    // 默认按创建时间排序
    if (!params.sortBy) {
      queryParams.append('sortBy', 'createdAt');
      queryParams.append('sortOrder', 'desc');
    }

    const response = await this.request<{ models: Model[]; total: number; page: number; limit: number }>(`/search?${queryParams}`);
    
    if (!response.success || !response.data) {
      throw new ModelServiceError(response.error || '搜索模型失败');
    }
    
    return response.data;
  }

  /**
   * Validate Create Model Request Data
   */
  private validateCreateModelRequest(data: CreateModelRequest): void {
    const requiredFields = [
      'modelName',
      'dependOn',
      'rawTopicCode',
      'version',
      'tenantId',
      'createdBy',
      'lastModifiedBy',
      'moduleId',
    ];

    for (const field of requiredFields) {
      if (!data[field as keyof CreateModelRequest]) {
        throw new ModelServiceError(`${field} is a required field`);
      }
    }

    if (typeof data.isParalleled !== 'boolean') {
      throw new ModelServiceError('isParalleled must be a boolean value');
    }

    if (typeof data.priority !== 'number') {
      throw new ModelServiceError('priority must be a number');
    }

    if (data.modelName.length > 255) {
      throw new ModelServiceError('modelName length cannot exceed 255 characters');
    }
  }

  /**
   * Validate Update Model Request Data
   */
  private validateUpdateModelRequest(data: UpdateModelRequest): void {
    if (data.modelName && data.modelName.length > 255) {
      throw new ModelServiceError('modelName length cannot exceed 255 characters');
    }

    if (data.isParalleled !== undefined && typeof data.isParalleled !== 'boolean') {
      throw new ModelServiceError('isParalleled must be a boolean value');
    }

    if (data.priority !== undefined && typeof data.priority !== 'number') {
      throw new ModelServiceError('priority must be a number');
    }

    if (data.lastModifiedBy && !data.lastModifiedBy.trim()) {
      throw new ModelServiceError('lastModifiedBy cannot be empty');
    }
  }

  /**
   * Set mock data mode
   */
  setMockDataMode(useMockData: boolean): void {
    this.useMockData = useMockData;
  }

  /**
   * Get current mock data mode
   */
  getMockDataMode(): boolean {
    return this.useMockData;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (this.useMockData) {
      return true;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/watchmen/ingest/config/model/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// 导出默认实例
export const modelService = new ModelService();

// ModelServiceError is already exported above

// 导出类型
export type {
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  CreateModelRequest,
  UpdateModelRequest,
};