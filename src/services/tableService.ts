import { 
  TableDetailConfig, 
  TableStatus, 
  CreateTableRequest, 
  UpdateTableRequest, 
  TableFilterParams, 
  PaginatedTableResponse 
} from '../models/table';

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
interface TablePaginationParams {
  page?: number;
  limit?: number;
  sortBy?: keyof TableDetailConfig;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  status?: TableStatus | 'all';
  schema?: string;
  tenant_id?: string;
  module_trigger_id?: string;
}

/**
 * 自定义错误类
 */
class TableServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'TableServiceError';
  }
}

/**
 * Table 数据访问服务类
 * 使用原生 fetch API 实现完整的 CRUD 操作
 */
export class TableService {
  private readonly baseUrl: string;
  private readonly defaultHeaders: HeadersInit;

  constructor(baseUrl: string = '/api/tables') {
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

        throw new TableServiceError(errorMessage, response.status);
      }

      // 解析响应数据
      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof TableServiceError) {
        throw error;
      }
      
      // 网络错误或其他错误
      throw new TableServiceError(
        `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * 获取所有表格（支持分页、搜索和过滤）
   */
  async getAllTables(params: TablePaginationParams = {}): Promise<PaginatedTableResponse> {
    const queryParams = new URLSearchParams();
    
    // 添加查询参数
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.search) queryParams.append('search', params.search);
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.schema) queryParams.append('schema', params.schema);
    if (params.tenant_id) queryParams.append('tenant_id', params.tenant_id);
    if (params.module_trigger_id) queryParams.append('module_trigger_id', params.module_trigger_id);

    const endpoint = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await this.request<PaginatedTableResponse>(endpoint);
    
    if (!response.success || !response.data) {
      throw new TableServiceError(response.error || 'Failed to fetch tables');
    }

    return response.data;
  }

  /**
   * 根据 ID 获取单个表格详情
   */
  async getTableById(tableId: string): Promise<TableDetailConfig> {
    if (!tableId) {
      throw new TableServiceError('Table ID is required');
    }

    const response = await this.request<TableDetailConfig>(`/${tableId}`);
    
    if (!response.success || !response.data) {
      throw new TableServiceError(response.error || 'Failed to fetch table details');
    }

    return response.data;
  }

  /**
   * 创建新表格
   */
  async createTable(tableData: CreateTableRequest): Promise<TableDetailConfig> {
    // 验证必填字段
    this.validateTableData(tableData);

    const response = await this.request<TableDetailConfig>('', {
      method: 'POST',
      body: JSON.stringify(tableData),
    });

    if (!response.success || !response.data) {
      throw new TableServiceError(response.error || 'Failed to create table');
    }

    return response.data;
  }

  /**
   * 更新表格配置
   */
  async updateTable(tableId: string, updateData: UpdateTableRequest): Promise<TableDetailConfig> {
    if (!tableId) {
      throw new TableServiceError('Table ID is required');
    }

    // 验证更新数据
    if (Object.keys(updateData).length === 0) {
      throw new TableServiceError('Update data cannot be empty');
    }

    const response = await this.request<TableDetailConfig>(`/${tableId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });

    if (!response.success || !response.data) {
      throw new TableServiceError(response.error || 'Failed to update table');
    }

    return response.data;
  }

  /**
   * 删除单个表格
   */
  async deleteTable(tableId: string): Promise<void> {
    if (!tableId) {
      throw new TableServiceError('Table ID is required');
    }

    const response = await this.request<void>(`/${tableId}`, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new TableServiceError(response.error || 'Failed to delete table');
    }
  }

  /**
   * 批量删除表格
   */
  async deleteTables(tableIds: string[]): Promise<void> {
    if (!tableIds || tableIds.length === 0) {
      throw new TableServiceError('Table IDs are required');
    }

    const response = await this.request<void>('/batch', {
      method: 'DELETE',
      body: JSON.stringify({ ids: tableIds }),
    });

    if (!response.success) {
      throw new TableServiceError(response.error || 'Failed to delete tables');
    }
  }

  /**
   * 根据模式获取表格
   */
  async getTablesBySchema(schema: string): Promise<TableDetailConfig[]> {
    if (!schema) {
      throw new TableServiceError('Schema is required');
    }

    const response = await this.request<TableDetailConfig[]>(`/schema/${schema}`);
    
    if (!response.success || !response.data) {
      throw new TableServiceError(response.error || 'Failed to fetch tables by schema');
    }

    return response.data;
  }

  /**
   * 根据租户ID获取表格
   */
  async getTablesByTenantId(tenantId: string): Promise<TableDetailConfig[]> {
    if (!tenantId) {
      throw new TableServiceError('Tenant ID is required');
    }

    const response = await this.request<TableDetailConfig[]>(`/tenant/${tenantId}`);
    
    if (!response.success || !response.data) {
      throw new TableServiceError(response.error || 'Failed to fetch tables by tenant');
    }

    return response.data;
  }

  /**
   * 根据模块触发器ID获取表格
   */
  async getTablesByModuleTriggerId(moduleTriggerId: string): Promise<TableDetailConfig[]> {
    if (!moduleTriggerId) {
      throw new TableServiceError('Module trigger ID is required');
    }

    const response = await this.request<TableDetailConfig[]>(`/module-trigger/${moduleTriggerId}`);
    
    if (!response.success || !response.data) {
      throw new TableServiceError(response.error || 'Failed to fetch tables by module trigger');
    }

    return response.data;
  }

  /**
   * 获取表格统计信息
   */
  async getTableStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    pending: number;
    bySchema: Record<string, number>;
  }> {
    const response = await this.request<{
      total: number;
      active: number;
      inactive: number;
      pending: number;
      bySchema: Record<string, number>;
    }>('/stats');
    
    if (!response.success || !response.data) {
      throw new TableServiceError(response.error || 'Failed to fetch table statistics');
    }

    return response.data;
  }

  /**
   * 验证表格数据
   */
  private validateTableData(data: CreateTableRequest): void {
    const errors: string[] = [];

    // 验证必填字段
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Table name is required');
    }

    if (!data.schema || data.schema.trim().length === 0) {
      errors.push('Schema is required');
    }

    if (!data.status) {
      errors.push('Status is required');
    }

    // 验证状态值
    if (data.status && !['active', 'inactive', 'pending'].includes(data.status)) {
      errors.push('Invalid status value');
    }

    // 验证字段数组
    if (!data.fields || !Array.isArray(data.fields) || data.fields.length === 0) {
      errors.push('At least one field is required');
    } else {
      // 验证每个字段
      data.fields.forEach((field, index) => {
        if (!field.name || field.name.trim().length === 0) {
          errors.push(`Field ${index + 1}: name is required`);
        }
        if (!field.type || field.type.trim().length === 0) {
          errors.push(`Field ${index + 1}: type is required`);
        }
      });

      // 检查是否有主键
      const hasPrimaryKey = data.fields.some(field => field.isPrimaryKey);
      if (!hasPrimaryKey) {
        errors.push('At least one field must be marked as primary key');
      }
    }

    // 验证记录数量
    if (data.recordCount !== undefined && data.recordCount < 0) {
      errors.push('Record count cannot be negative');
    }

    if (errors.length > 0) {
      throw new TableServiceError(`Validation failed: ${errors.join(', ')}`);
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

  /**
   * 移除自定义请求头
   */
  removeCustomHeader(key: string): void {
    delete (this.defaultHeaders as Record<string, string>)[key];
  }
}

// 创建默认实例
export const tableService = new TableService();

// 导出错误类和类型
export { TableServiceError };

export type {
  ApiResponse,
  TablePaginationParams,
};