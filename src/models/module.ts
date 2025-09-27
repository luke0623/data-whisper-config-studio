/**
 * 模块基础接口
 */
export interface Module {
    module_id: string;
    module_name: string;
    priority: number;
    version: string;
    tenant_id: string;
    created_at: string;
    created_by: string;
    last_modified_at: string;
    last_modified_by: string;
}

/**
 * 创建模块请求接口
 */
export interface CreateModuleRequest {
    module_name: string;
    priority: number;
    version: string;
    tenant_id: string;
    created_by: string;
}

/**
 * 更新模块请求接口
 */
export interface UpdateModuleRequest {
    module_name?: string;
    priority?: number;
    version?: string;
    last_modified_by: string;
}

/**
 * 模块查询过滤参数
 */
export interface ModuleFilterParams {
    module_name?: string;
    priority?: number;
    version?: string;
    tenant_id?: string;
    created_by?: string;
    last_modified_by?: string;
    created_at_from?: string;
    created_at_to?: string;
    last_modified_at_from?: string;
    last_modified_at_to?: string;
}

/**
 * 分页查询参数
 */
export interface ModulePaginationParams extends ModuleFilterParams {
    page?: number;
    limit?: number;
    sortBy?: keyof Module;
    sortOrder?: 'asc' | 'desc';
    search?: string;
}

/**
 * 分页响应接口
 */
export interface PaginatedModuleResponse {
    data: Module[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

/**
 * 模块统计信息接口
 */
export interface ModuleStats {
    total: number;
    byTenant: Record<string, number>;
    byVersion: Record<string, number>;
    byPriority: Record<number, number>;
    recentlyCreated: number; // 最近7天创建的模块数量
    recentlyModified: number; // 最近7天修改的模块数量
}

/**
 * 批量操作结果接口
 */
export interface BatchOperationResult {
    success: string[];
    failed: Array<{
        id: string;
        error: string;
    }>;
    total: number;
    successCount: number;
    failedCount: number;
}
  