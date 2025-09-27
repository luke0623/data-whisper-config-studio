/**
 * 模块服务使用示例
 * 
 * 这个文件展示了如何使用 ModuleService 进行各种操作
 */

import { moduleService, ModuleServiceError } from '../services/moduleService';
import { CreateModuleRequest, UpdateModuleRequest, ModulePaginationParams } from '../models/module';

/**
 * 示例：获取所有模块（带分页）
 */
export async function getAllModulesExample() {
  try {
    const params: ModulePaginationParams = {
      page: 1,
      limit: 10,
      sortBy: 'created_at',
      sortOrder: 'desc',
      search: '数据处理'
    };

    const result = await moduleService.getAllModules(params);
    
    console.log('模块列表:', result.data);
    console.log('分页信息:', result.pagination);
    
    return result;
  } catch (error) {
    if (error instanceof ModuleServiceError) {
      console.error('获取模块列表失败:', error.message, error.code);
    } else {
      console.error('未知错误:', error);
    }
    throw error;
  }
}

/**
 * 示例：根据ID获取单个模块
 */
export async function getModuleByIdExample(moduleId: string) {
  try {
    const module = await moduleService.getModuleById(moduleId);
    console.log('模块详情:', module);
    return module;
  } catch (error) {
    if (error instanceof ModuleServiceError) {
      console.error('获取模块详情失败:', error.message, error.code);
    }
    throw error;
  }
}

/**
 * 示例：创建新模块
 */
export async function createModuleExample() {
  try {
    const newModule: CreateModuleRequest = {
      module_name: '数据处理模块',
      priority: 1,
      version: '1.0.0',
      tenant_id: 'tenant_001',
      created_by: 'admin'
    };

    const createdModule = await moduleService.createModule(newModule);
    console.log('创建的模块:', createdModule);
    return createdModule;
  } catch (error) {
    if (error instanceof ModuleServiceError) {
      console.error('创建模块失败:', error.message, error.code);
    }
    throw error;
  }
}

/**
 * 示例：更新模块
 */
export async function updateModuleExample(moduleId: string) {
  try {
    const updateData: UpdateModuleRequest = {
      module_name: '数据处理模块 v2',
      priority: 2,
      version: '2.0.0',
      last_modified_by: 'admin'
    };

    const updatedModule = await moduleService.updateModule(moduleId, updateData);
    console.log('更新的模块:', updatedModule);
    return updatedModule;
  } catch (error) {
    if (error instanceof ModuleServiceError) {
      console.error('更新模块失败:', error.message, error.code);
    }
    throw error;
  }
}

/**
 * 示例：删除单个模块
 */
export async function deleteModuleExample(moduleId: string) {
  try {
    await moduleService.deleteModule(moduleId);
    console.log('模块删除成功');
  } catch (error) {
    if (error instanceof ModuleServiceError) {
      console.error('删除模块失败:', error.message, error.code);
    }
    throw error;
  }
}

/**
 * 示例：批量删除模块
 */
export async function batchDeleteModulesExample(moduleIds: string[]) {
  try {
    const result = await moduleService.deleteModules(moduleIds);
    console.log('批量删除结果:', result);
    console.log(`成功删除 ${result.successCount} 个模块，失败 ${result.failedCount} 个`);
    
    if (result.failed.length > 0) {
      console.log('删除失败的模块:', result.failed);
    }
    
    return result;
  } catch (error) {
    if (error instanceof ModuleServiceError) {
      console.error('批量删除失败:', error.message, error.code);
    }
    throw error;
  }
}

/**
 * 示例：搜索模块
 */
export async function searchModulesExample(searchTerm: string) {
  try {
    const params: ModulePaginationParams = {
      page: 1,
      limit: 20,
      tenant_id: 'tenant_001'
    };

    const result = await moduleService.searchModules(searchTerm, params);
    console.log('搜索结果:', result.data);
    console.log(`找到 ${result.pagination.total} 个匹配的模块`);
    
    return result;
  } catch (error) {
    if (error instanceof ModuleServiceError) {
      console.error('搜索模块失败:', error.message, error.code);
    }
    throw error;
  }
}

/**
 * 示例：获取模块统计信息
 */
export async function getModuleStatsExample() {
  try {
    const stats = await moduleService.getModuleStats();
    console.log('模块统计信息:', stats);
    console.log(`总模块数: ${stats.total}`);
    console.log(`最近7天创建: ${stats.recentlyCreated}`);
    console.log(`最近7天修改: ${stats.recentlyModified}`);
    
    return stats;
  } catch (error) {
    if (error instanceof ModuleServiceError) {
      console.error('获取统计信息失败:', error.message, error.code);
    }
    throw error;
  }
}

/**
 * 示例：批量更新模块
 */
export async function batchUpdateModulesExample() {
  try {
    const updates = [
      {
        moduleId: 'module_001',
        data: {
          priority: 3,
          last_modified_by: 'admin'
        }
      },
      {
        moduleId: 'module_002',
        data: {
          module_name: '更新的模块名称',
          version: '1.1.0',
          last_modified_by: 'admin'
        }
      }
    ];

    const result = await moduleService.updateModules(updates);
    console.log('批量更新结果:', result);
    console.log(`成功更新 ${result.successCount} 个模块，失败 ${result.failedCount} 个`);
    
    return result;
  } catch (error) {
    if (error instanceof ModuleServiceError) {
      console.error('批量更新失败:', error.message, error.code);
    }
    throw error;
  }
}

/**
 * 完整的工作流示例
 */
export async function completeWorkflowExample() {
  try {
    console.log('=== 模块服务完整工作流示例 ===');
    
    // 1. 获取统计信息
    console.log('\n1. 获取模块统计信息...');
    await getModuleStatsExample();
    
    // 2. 创建新模块
    console.log('\n2. 创建新模块...');
    const newModule = await createModuleExample();
    
    // 3. 获取模块详情
    console.log('\n3. 获取模块详情...');
    await getModuleByIdExample(newModule.module_id);
    
    // 4. 更新模块
    console.log('\n4. 更新模块...');
    await updateModuleExample(newModule.module_id);
    
    // 5. 搜索模块
    console.log('\n5. 搜索模块...');
    await searchModulesExample('数据处理');
    
    // 6. 获取所有模块
    console.log('\n6. 获取所有模块...');
    await getAllModulesExample();
    
    console.log('\n=== 工作流完成 ===');
    
  } catch (error) {
    console.error('工作流执行失败:', error);
  }
}