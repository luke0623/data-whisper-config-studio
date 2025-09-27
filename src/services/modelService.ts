import { Model } from '../models/model';

/**
 * API 响应接口
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * 分页查询参数
 */
interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: keyof Model;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

/**
 * 分页响应数据
 */
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 创建模型的请求数据（不包含自动生成的字段）
 */
type CreateModelRequest = Omit<Model, 'model_id' | 'created_at' | 'last_modified_at'>;

/**
 * 更新模型的请求数据（部分字段可选）
 */
type UpdateModelRequest = Partial<Omit<Model, 'model_id' | 'created_at' | 'created_by'>>;

/**
 * 自定义错误类
 */
class ModelServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ModelServiceError';
  }
}

/**
 * Model 数据访问服务类
 * 使用原生 fetch API 实现完整的 CRUD 操作
 */
export class ModelService {
  private readonly baseUrl: string;
  private readonly defaultHeaders: HeadersInit;

  constructor(baseUrl: string = '/api/models') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * 通用的 HTTP 请求方法
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
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
          // 如果不是 JSON 格式，使用原始错误文本
          errorMessage = errorText || errorMessage;
        }
        
        throw new ModelServiceError(errorMessage, response.status);
      }

      // 解析响应数据
      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ModelServiceError) {
        throw error;
      }
      
      // 处理网络错误或其他异常
      throw new ModelServiceError(
        `请求失败: ${error instanceof Error ? error.message : '未知错误'}`,
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * 获取所有模型（支持分页和搜索）
   */
  async getAllModels(params: PaginationParams = {}): Promise<PaginatedResponse<Model>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
    if (params.search) searchParams.append('search', params.search);

    const endpoint = searchParams.toString() ? `?${searchParams.toString()}` : '';
    
    const response = await this.request<PaginatedResponse<Model>>(endpoint);
    
    if (!response.success || !response.data) {
      throw new ModelServiceError(response.error || '获取模型列表失败');
    }
    
    return response.data;
  }

  /**
   * 根据 ID 获取单个模型
   */
  async getModelById(modelId: string): Promise<Model> {
    if (!modelId) {
      throw new ModelServiceError('模型 ID 不能为空');
    }

    const response = await this.request<Model>(`/${encodeURIComponent(modelId)}`);
    
    if (!response.success || !response.data) {
      throw new ModelServiceError(response.error || '获取模型详情失败');
    }
    
    return response.data;
  }

  /**
   * 创建新模型
   */
  async createModel(modelData: CreateModelRequest): Promise<Model> {
    // 验证必填字段
    this.validateModelData(modelData);

    const response = await this.request<Model>('', {
      method: 'POST',
      body: JSON.stringify({
        ...modelData,
        created_at: new Date().toISOString(),
        last_modified_at: new Date().toISOString(),
      }),
    });
    
    if (!response.success || !response.data) {
      throw new ModelServiceError(response.error || '创建模型失败');
    }
    
    return response.data;
  }

  /**
   * 更新现有模型
   */
  async updateModel(modelId: string, updateData: UpdateModelRequest): Promise<Model> {
    if (!modelId) {
      throw new ModelServiceError('模型 ID 不能为空');
    }

    // 验证更新数据
    if (Object.keys(updateData).length === 0) {
      throw new ModelServiceError('更新数据不能为空');
    }

    const response = await this.request<Model>(`/${encodeURIComponent(modelId)}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...updateData,
        last_modified_at: new Date().toISOString(),
      }),
    });
    
    if (!response.success || !response.data) {
      throw new ModelServiceError(response.error || '更新模型失败');
    }
    
    return response.data;
  }

  /**
   * 删除模型
   */
  async deleteModel(modelId: string): Promise<void> {
    if (!modelId) {
      throw new ModelServiceError('模型 ID 不能为空');
    }

    const response = await this.request<void>(`/${encodeURIComponent(modelId)}`, {
      method: 'DELETE',
    });
    
    if (!response.success) {
      throw new ModelServiceError(response.error || '删除模型失败');
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
      body: JSON.stringify({ ids: modelIds }),
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
   * 验证模型数据
   */
  private validateModelData(data: CreateModelRequest): void {
    const requiredFields: (keyof CreateModelRequest)[] = [
      'model_name',
      'depend_on',
      'raw_topic_code',
      'version',
      'tenant_id',
      'created_by',
      'last_modified_by',
      'module_id',
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        throw new ModelServiceError(`字段 ${field} 是必填的`);
      }
    }

    // 验证数据类型
    if (typeof data.is_paralleled !== 'boolean') {
      throw new ModelServiceError('is_paralleled 必须是布尔值');
    }

    if (typeof data.priority !== 'number' || data.priority < 0) {
      throw new ModelServiceError('priority 必须是非负数');
    }

    // 验证字符串长度
    if (data.model_name.length > 255) {
      throw new ModelServiceError('模型名称长度不能超过 255 个字符');
    }

    if (data.version.length > 50) {
      throw new ModelServiceError('版本号长度不能超过 50 个字符');
    }
  }

  /**
   * 设置认证令牌
   */
  setAuthToken(token: string): void {
    (this.defaultHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  /**
   * 移除认证令牌
   */
  removeAuthToken(): void {
    delete (this.defaultHeaders as Record<string, string>)['Authorization'];
  }

  /**
   * 设置自定义请求头
   */
  setCustomHeader(key: string, value: string): void {
    (this.defaultHeaders as Record<string, string>)[key] = value;
  }
}

// 导出默认实例
export const modelService = new ModelService();

// 导出错误类
export { ModelServiceError };

// 导出类型
export type {
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  CreateModelRequest,
  UpdateModelRequest,
};