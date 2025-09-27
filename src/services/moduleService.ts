import {
  Module,
  CreateModuleRequest,
  UpdateModuleRequest,
  ModulePaginationParams,
  PaginatedModuleResponse,
  ModuleStats,
  BatchOperationResult
} from '../models/module';

/**
 * API响应接口
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

/**
 * 模块服务错误类
 */
export class ModuleServiceError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'MODULE_SERVICE_ERROR') {
    super(message);
    this.name = 'ModuleServiceError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * 模块服务类 - 提供完整的CRUD功能
 */
export class ModuleService {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = '/api/modules') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * 通用HTTP请求方法
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ModuleServiceError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code || 'HTTP_ERROR'
        );
      }

      const data: ApiResponse<T> = await response.json();
      
      if (!data.success) {
        throw new ModuleServiceError(
          data.error || data.message || '请求失败',
          500,
          'API_ERROR'
        );
      }

      return data.data;
    } catch (error) {
      if (error instanceof ModuleServiceError) {
        throw error;
      }
      
      // 网络错误或其他未知错误
      throw new ModuleServiceError(
        error instanceof Error ? error.message : '网络请求失败',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * GET请求方法
   */
  private async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return this.request<T>(url.pathname + url.search, {
      method: 'GET',
    });
  }

  /**
   * POST请求方法
   */
  private async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT请求方法
   */
  private async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE请求方法
   */
  private async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * 数据验证方法
   */
  private validateCreateModuleRequest(data: CreateModuleRequest): void {
    if (!data.module_name?.trim()) {
      throw new ModuleServiceError('模块名称不能为空', 400, 'VALIDATION_ERROR');
    }
    
    if (data.priority < 0) {
      throw new ModuleServiceError('优先级不能为负数', 400, 'VALIDATION_ERROR');
    }
    
    if (!data.version?.trim()) {
      throw new ModuleServiceError('版本号不能为空', 400, 'VALIDATION_ERROR');
    }
    
    if (!data.tenant_id?.trim()) {
      throw new ModuleServiceError('租户ID不能为空', 400, 'VALIDATION_ERROR');
    }
    
    if (!data.created_by?.trim()) {
      throw new ModuleServiceError('创建者不能为空', 400, 'VALIDATION_ERROR');
    }
  }

  private validateUpdateModuleRequest(data: UpdateModuleRequest): void {
    if (data.module_name !== undefined && !data.module_name?.trim()) {
      throw new ModuleServiceError('模块名称不能为空', 400, 'VALIDATION_ERROR');
    }
    
    if (data.priority !== undefined && data.priority < 0) {
      throw new ModuleServiceError('优先级不能为负数', 400, 'VALIDATION_ERROR');
    }
    
    if (data.version !== undefined && !data.version?.trim()) {
      throw new ModuleServiceError('版本号不能为空', 400, 'VALIDATION_ERROR');
    }
    
    if (!data.last_modified_by?.trim()) {
      throw new ModuleServiceError('修改者不能为空', 400, 'VALIDATION_ERROR');
    }
  }

  /**
   * 获取所有模块（支持分页和搜索）
   */
  async getAllModules(params: ModulePaginationParams = {}): Promise<PaginatedModuleResponse> {
    try {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        sortBy: params.sortBy || 'created_at',
        sortOrder: params.sortOrder || 'desc',
        ...params
      };

      return await this.get<PaginatedModuleResponse>('', queryParams);
    } catch (error) {
      if (error instanceof ModuleServiceError) {
        throw error;
      }
      throw new ModuleServiceError(
        '获取模块列表失败',
        500,
        'GET_MODULES_ERROR'
      );
    }
  }

  /**
   * 根据ID获取单个模块
   */
  async getModuleById(moduleId: string): Promise<Module> {
    if (!moduleId?.trim()) {
      throw new ModuleServiceError('模块ID不能为空', 400, 'VALIDATION_ERROR');
    }

    try {
      return await this.get<Module>(`/${moduleId}`);
    } catch (error) {
      if (error instanceof ModuleServiceError) {
        throw error;
      }
      throw new ModuleServiceError(
        `获取模块 ${moduleId} 失败`,
        500,
        'GET_MODULE_ERROR'
      );
    }
  }

  /**
   * 创建新模块
   */
  async createModule(moduleData: CreateModuleRequest): Promise<Module> {
    this.validateCreateModuleRequest(moduleData);

    try {
      return await this.post<Module>('', moduleData);
    } catch (error) {
      if (error instanceof ModuleServiceError) {
        throw error;
      }
      throw new ModuleServiceError(
        '创建模块失败',
        500,
        'CREATE_MODULE_ERROR'
      );
    }
  }

  /**
   * 更新模块
   */
  async updateModule(moduleId: string, moduleData: UpdateModuleRequest): Promise<Module> {
    if (!moduleId?.trim()) {
      throw new ModuleServiceError('模块ID不能为空', 400, 'VALIDATION_ERROR');
    }

    this.validateUpdateModuleRequest(moduleData);

    try {
      return await this.put<Module>(`/${moduleId}`, moduleData);
    } catch (error) {
      if (error instanceof ModuleServiceError) {
        throw error;
      }
      throw new ModuleServiceError(
        `更新模块 ${moduleId} 失败`,
        500,
        'UPDATE_MODULE_ERROR'
      );
    }
  }

  /**
   * 删除单个模块
   */
  async deleteModule(moduleId: string): Promise<void> {
    if (!moduleId?.trim()) {
      throw new ModuleServiceError('模块ID不能为空', 400, 'VALIDATION_ERROR');
    }

    try {
      await this.delete<void>(`/${moduleId}`);
    } catch (error) {
      if (error instanceof ModuleServiceError) {
        throw error;
      }
      throw new ModuleServiceError(
        `删除模块 ${moduleId} 失败`,
        500,
        'DELETE_MODULE_ERROR'
      );
    }
  }

  /**
   * 批量删除模块
   */
  async deleteModules(moduleIds: string[]): Promise<BatchOperationResult> {
    if (!moduleIds || moduleIds.length === 0) {
      throw new ModuleServiceError('模块ID列表不能为空', 400, 'VALIDATION_ERROR');
    }

    // 验证所有ID都不为空
    const invalidIds = moduleIds.filter(id => !id?.trim());
    if (invalidIds.length > 0) {
      throw new ModuleServiceError('模块ID不能为空', 400, 'VALIDATION_ERROR');
    }

    try {
      return await this.post<BatchOperationResult>('/batch-delete', { moduleIds });
    } catch (error) {
      if (error instanceof ModuleServiceError) {
        throw error;
      }
      throw new ModuleServiceError(
        '批量删除模块失败',
        500,
        'BATCH_DELETE_ERROR'
      );
    }
  }

  /**
   * 获取模块统计信息
   */
  async getModuleStats(): Promise<ModuleStats> {
    try {
      return await this.get<ModuleStats>('/stats');
    } catch (error) {
      if (error instanceof ModuleServiceError) {
        throw error;
      }
      throw new ModuleServiceError(
        '获取模块统计信息失败',
        500,
        'GET_STATS_ERROR'
      );
    }
  }

  /**
   * 搜索模块
   */
  async searchModules(searchTerm: string, params: ModulePaginationParams = {}): Promise<PaginatedModuleResponse> {
    if (!searchTerm?.trim()) {
      throw new ModuleServiceError('搜索关键词不能为空', 400, 'VALIDATION_ERROR');
    }

    try {
      const queryParams = {
        search: searchTerm,
        page: params.page || 1,
        limit: params.limit || 10,
        sortBy: params.sortBy || 'created_at',
        sortOrder: params.sortOrder || 'desc',
        ...params
      };

      return await this.get<PaginatedModuleResponse>('/search', queryParams);
    } catch (error) {
      if (error instanceof ModuleServiceError) {
        throw error;
      }
      throw new ModuleServiceError(
        '搜索模块失败',
        500,
        'SEARCH_MODULES_ERROR'
      );
    }
  }

  /**
   * 批量更新模块
   */
  async updateModules(updates: Array<{ moduleId: string; data: UpdateModuleRequest }>): Promise<BatchOperationResult> {
    if (!updates || updates.length === 0) {
      throw new ModuleServiceError('更新数据不能为空', 400, 'VALIDATION_ERROR');
    }

    // 验证每个更新请求
    updates.forEach((update, index) => {
      if (!update.moduleId?.trim()) {
        throw new ModuleServiceError(`第${index + 1}个更新请求的模块ID不能为空`, 400, 'VALIDATION_ERROR');
      }
      this.validateUpdateModuleRequest(update.data);
    });

    try {
      return await this.post<BatchOperationResult>('/batch-update', { updates });
    } catch (error) {
      if (error instanceof ModuleServiceError) {
        throw error;
      }
      throw new ModuleServiceError(
        '批量更新模块失败',
        500,
        'BATCH_UPDATE_ERROR'
      );
    }
  }
}

// 创建并导出模块服务实例
export const moduleService = new ModuleService();