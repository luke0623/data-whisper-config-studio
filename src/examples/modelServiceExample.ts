import { 
  ModelService, 
  modelService, 
  ModelServiceError,
  CreateModelRequest,
  UpdateModelRequest,
  PaginationParams 
} from '../services/modelService';
import { Model } from '../models/model';

/**
 * ModelService 使用示例
 * 展示如何使用 ModelService 进行各种 CRUD 操作
 */

// 示例：创建自定义 ModelService 实例
const customModelService = new ModelService('https://api.example.com/v1/models');

// 示例：设置认证令牌
customModelService.setAuthToken('your-jwt-token-here');

/**
 * 示例 1: 获取所有模型（带分页和搜索）
 */
async function getAllModelsExample() {
  try {
    // 基础查询
    const allModels = await modelService.getAllModels();
    console.log('所有模型:', allModels);

    // 带分页的查询
    const paginationParams: PaginationParams = {
      page: 1,
      limit: 10,
      sortBy: 'created_at',
      sortOrder: 'desc',
      search: 'user'
    };
    
    const paginatedModels = await modelService.getAllModels(paginationParams);
    console.log('分页模型列表:', paginatedModels);
    console.log(`总共 ${paginatedModels.total} 个模型，当前第 ${paginatedModels.page} 页`);
    
  } catch (error) {
    if (error instanceof ModelServiceError) {
      console.error('获取模型列表失败:', error.message);
      console.error('状态码:', error.statusCode);
    } else {
      console.error('未知错误:', error);
    }
  }
}

/**
 * 示例 2: 获取单个模型
 */
async function getModelByIdExample() {
  try {
    const modelId = 'model-123';
    const model = await modelService.getModelById(modelId);
    console.log('模型详情:', model);
    
  } catch (error) {
    if (error instanceof ModelServiceError) {
      console.error('获取模型详情失败:', error.message);
      if (error.statusCode === 404) {
        console.error('模型不存在');
      }
    }
  }
}

/**
 * 示例 3: 创建新模型
 */
async function createModelExample() {
  try {
    const newModelData: CreateModelRequest = {
      model_name: 'User Behavior Analysis Model',
      depend_on: 'user_events,user_profiles',
      raw_topic_code: 'user_behavior_analysis',
      is_paralleled: true,
      version: '1.0.0',
      tenant_id: 'tenant-001',
      created_by: 'user-123',
      last_modified_by: 'user-123',
      module_id: 'module-456',
      priority: 1
    };

    const createdModel = await modelService.createModel(newModelData);
    console.log('创建的模型:', createdModel);
    
  } catch (error) {
    if (error instanceof ModelServiceError) {
      console.error('创建模型失败:', error.message);
    }
  }
}

/**
 * 示例 4: 更新模型
 */
async function updateModelExample() {
  try {
    const modelId = 'model-123';
    const updateData: UpdateModelRequest = {
      model_name: 'Updated User Behavior Analysis Model',
      version: '1.1.0',
      priority: 2,
      last_modified_by: 'user-456'
    };

    const updatedModel = await modelService.updateModel(modelId, updateData);
    console.log('更新后的模型:', updatedModel);
    
  } catch (error) {
    if (error instanceof ModelServiceError) {
      console.error('更新模型失败:', error.message);
    }
  }
}

/**
 * 示例 5: 删除模型
 */
async function deleteModelExample() {
  try {
    const modelId = 'model-123';
    await modelService.deleteModel(modelId);
    console.log('模型删除成功');
    
  } catch (error) {
    if (error instanceof ModelServiceError) {
      console.error('删除模型失败:', error.message);
    }
  }
}

/**
 * 示例 6: 批量删除模型
 */
async function batchDeleteModelsExample() {
  try {
    const modelIds = ['model-123', 'model-456', 'model-789'];
    await modelService.deleteModels(modelIds);
    console.log('批量删除成功');
    
  } catch (error) {
    if (error instanceof ModelServiceError) {
      console.error('批量删除失败:', error.message);
    }
  }
}

/**
 * 示例 7: 根据模块 ID 获取模型
 */
async function getModelsByModuleIdExample() {
  try {
    const moduleId = 'module-456';
    const models = await modelService.getModelsByModuleId(moduleId);
    console.log(`模块 ${moduleId} 的模型列表:`, models);
    
  } catch (error) {
    if (error instanceof ModelServiceError) {
      console.error('获取模块模型失败:', error.message);
    }
  }
}

/**
 * 示例 8: 根据租户 ID 获取模型
 */
async function getModelsByTenantIdExample() {
  try {
    const tenantId = 'tenant-001';
    const models = await modelService.getModelsByTenantId(tenantId);
    console.log(`租户 ${tenantId} 的模型列表:`, models);
    
  } catch (error) {
    if (error instanceof ModelServiceError) {
      console.error('获取租户模型失败:', error.message);
    }
  }
}

/**
 * 示例 9: 完整的 CRUD 操作流程
 */
async function fullCrudExample() {
  try {
    console.log('=== 完整 CRUD 操作示例 ===');
    
    // 1. 创建模型
    console.log('1. 创建新模型...');
    const newModel: CreateModelRequest = {
      model_name: 'Test Model',
      depend_on: 'test_data',
      raw_topic_code: 'test_model',
      is_paralleled: false,
      version: '1.0.0',
      tenant_id: 'test-tenant',
      created_by: 'test-user',
      last_modified_by: 'test-user',
      module_id: 'test-module',
      priority: 0
    };
    
    const created = await modelService.createModel(newModel);
    console.log('创建成功:', created.model_id);
    
    // 2. 读取模型
    console.log('2. 读取模型详情...');
    const retrieved = await modelService.getModelById(created.model_id);
    console.log('读取成功:', retrieved.model_name);
    
    // 3. 更新模型
    console.log('3. 更新模型...');
    const updated = await modelService.updateModel(created.model_id, {
      model_name: 'Updated Test Model',
      version: '1.1.0'
    });
    console.log('更新成功:', updated.model_name);
    
    // 4. 删除模型
    console.log('4. 删除模型...');
    await modelService.deleteModel(created.model_id);
    console.log('删除成功');
    
    console.log('=== CRUD 操作完成 ===');
    
  } catch (error) {
    if (error instanceof ModelServiceError) {
      console.error('CRUD 操作失败:', error.message);
    }
  }
}

/**
 * 示例 10: 错误处理和重试机制
 */
async function errorHandlingExample() {
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      const models = await modelService.getAllModels();
      console.log('获取成功:', models.items.length);
      break;
      
    } catch (error) {
      retryCount++;
      
      if (error instanceof ModelServiceError) {
        console.error(`尝试 ${retryCount}/${maxRetries} 失败:`, error.message);
        
        // 根据错误类型决定是否重试
        if (error.statusCode === 401) {
          console.error('认证失败，停止重试');
          break;
        }
        
        if (error.statusCode && error.statusCode >= 500 && retryCount < maxRetries) {
          console.log(`服务器错误，${2 ** retryCount} 秒后重试...`);
          await new Promise(resolve => setTimeout(resolve, 2 ** retryCount * 1000));
          continue;
        }
      }
      
      if (retryCount >= maxRetries) {
        console.error('达到最大重试次数，操作失败');
        throw error;
      }
    }
  }
}

// 导出示例函数
export {
  getAllModelsExample,
  getModelByIdExample,
  createModelExample,
  updateModelExample,
  deleteModelExample,
  batchDeleteModelsExample,
  getModelsByModuleIdExample,
  getModelsByTenantIdExample,
  fullCrudExample,
  errorHandlingExample
};

// 如果直接运行此文件，执行所有示例
if (require.main === module) {
  (async () => {
    console.log('开始执行 ModelService 示例...');
    
    // 注意：这些示例需要实际的 API 端点才能运行
    // 在实际使用中，请确保 API 服务器正在运行
    
    try {
      await getAllModelsExample();
      await getModelByIdExample();
      await createModelExample();
      await updateModelExample();
      await deleteModelExample();
      await batchDeleteModelsExample();
      await getModelsByModuleIdExample();
      await getModelsByTenantIdExample();
      await fullCrudExample();
      await errorHandlingExample();
    } catch (error) {
      console.error('示例执行失败:', error);
    }
  })();
}