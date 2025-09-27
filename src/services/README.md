# ModelService 使用指南

ModelService 是一个基于原生 fetch API 的数据访问服务类，提供完整的 CRUD 操作功能，具有类型安全性和完善的错误处理机制。

## 特性

- ✅ **完整的 CRUD 操作**：支持创建、读取、更新、删除操作
- ✅ **类型安全**：完全基于 TypeScript，提供完整的类型定义
- ✅ **原生 fetch API**：无第三方依赖，轻量级实现
- ✅ **错误处理**：自定义错误类和完善的错误处理机制
- ✅ **分页支持**：内置分页、排序、搜索功能
- ✅ **批量操作**：支持批量删除等操作
- ✅ **认证支持**：支持 JWT 令牌认证
- ✅ **可配置**：支持自定义 API 端点和请求头

## 快速开始

### 基础用法

```typescript
import { modelService } from '../services/modelService';

// 获取所有模型
const models = await modelService.getAllModels();

// 获取单个模型
const model = await modelService.getModelById('model-123');

// 创建新模型
const newModel = await modelService.createModel({
  model_name: 'My Model',
  depend_on: 'data_source',
  raw_topic_code: 'my_model',
  is_paralleled: true,
  version: '1.0.0',
  tenant_id: 'tenant-001',
  created_by: 'user-123',
  last_modified_by: 'user-123',
  module_id: 'module-456',
  priority: 1
});
```

### 自定义配置

```typescript
import { ModelService } from '../services/modelService';

// 创建自定义实例
const customService = new ModelService('https://api.example.com/v1/models');

// 设置认证令牌
customService.setAuthToken('your-jwt-token');

// 设置自定义请求头
customService.setCustomHeader('X-Custom-Header', 'value');
```

## API 参考

### 构造函数

```typescript
new ModelService(baseUrl?: string)
```

- `baseUrl`: API 基础 URL，默认为 `/api/models`

### 主要方法

#### getAllModels(params?)

获取所有模型，支持分页和搜索。

```typescript
const params = {
  page: 1,
  limit: 10,
  sortBy: 'created_at',
  sortOrder: 'desc',
  search: 'keyword'
};

const result = await modelService.getAllModels(params);
```

**返回值：**
```typescript
{
  items: Model[],
  total: number,
  page: number,
  limit: number,
  totalPages: number
}
```

#### getModelById(modelId)

根据 ID 获取单个模型。

```typescript
const model = await modelService.getModelById('model-123');
```

#### createModel(modelData)

创建新模型。

```typescript
const modelData = {
  model_name: 'New Model',
  depend_on: 'data_source',
  raw_topic_code: 'new_model',
  is_paralleled: false,
  version: '1.0.0',
  tenant_id: 'tenant-001',
  created_by: 'user-123',
  last_modified_by: 'user-123',
  module_id: 'module-456',
  priority: 1
};

const createdModel = await modelService.createModel(modelData);
```

#### updateModel(modelId, updateData)

更新现有模型。

```typescript
const updateData = {
  model_name: 'Updated Model Name',
  version: '1.1.0',
  priority: 2
};

const updatedModel = await modelService.updateModel('model-123', updateData);
```

#### deleteModel(modelId)

删除单个模型。

```typescript
await modelService.deleteModel('model-123');
```

#### deleteModels(modelIds)

批量删除模型。

```typescript
await modelService.deleteModels(['model-123', 'model-456']);
```

#### getModelsByModuleId(moduleId)

根据模块 ID 获取模型列表。

```typescript
const models = await modelService.getModelsByModuleId('module-456');
```

#### getModelsByTenantId(tenantId)

根据租户 ID 获取模型列表。

```typescript
const models = await modelService.getModelsByTenantId('tenant-001');
```

### 认证方法

#### setAuthToken(token)

设置 JWT 认证令牌。

```typescript
modelService.setAuthToken('your-jwt-token');
```

#### removeAuthToken()

移除认证令牌。

```typescript
modelService.removeAuthToken();
```

#### setCustomHeader(key, value)

设置自定义请求头。

```typescript
modelService.setCustomHeader('X-API-Key', 'your-api-key');
```

## 错误处理

ModelService 使用自定义的 `ModelServiceError` 类来处理错误：

```typescript
import { ModelServiceError } from '../services/modelService';

try {
  const model = await modelService.getModelById('invalid-id');
} catch (error) {
  if (error instanceof ModelServiceError) {
    console.error('错误信息:', error.message);
    console.error('状态码:', error.statusCode);
    console.error('原始错误:', error.originalError);
  }
}
```

### 常见错误码

- `400`: 请求参数错误
- `401`: 认证失败
- `403`: 权限不足
- `404`: 资源不存在
- `409`: 资源冲突
- `500`: 服务器内部错误

## 类型定义

### Model 接口

```typescript
interface Model {
  model_id: string;
  model_name: string;
  depend_on: string;
  raw_topic_code: string;
  is_paralleled: boolean;
  version: string;
  tenant_id: string;
  created_at: string;
  created_by: string;
  last_modified_at: string;
  last_modified_by: string;
  module_id: string;
  priority: number;
}
```

### CreateModelRequest

创建模型时使用的类型（排除自动生成的字段）：

```typescript
type CreateModelRequest = Omit<Model, 'model_id' | 'created_at' | 'last_modified_at'>;
```

### UpdateModelRequest

更新模型时使用的类型（部分字段可选）：

```typescript
type UpdateModelRequest = Partial<Omit<Model, 'model_id' | 'created_at' | 'created_by'>>;
```

### PaginationParams

分页查询参数：

```typescript
interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: keyof Model;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}
```

## 最佳实践

### 1. 错误处理

始终使用 try-catch 块来处理异步操作：

```typescript
try {
  const models = await modelService.getAllModels();
  // 处理成功结果
} catch (error) {
  if (error instanceof ModelServiceError) {
    // 处理已知错误
    console.error('操作失败:', error.message);
  } else {
    // 处理未知错误
    console.error('未知错误:', error);
  }
}
```

### 2. 重试机制

对于网络错误，实现重试机制：

```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (error instanceof ModelServiceError && error.statusCode && error.statusCode < 500) {
        // 客户端错误，不重试
        throw error;
      }
      
      if (i < maxRetries - 1) {
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, 2 ** i * 1000));
      }
    }
  }
  
  throw lastError!;
}

// 使用示例
const models = await withRetry(() => modelService.getAllModels());
```

### 3. 数据验证

在创建或更新模型前进行数据验证：

```typescript
function validateModelData(data: CreateModelRequest): void {
  if (!data.model_name?.trim()) {
    throw new Error('模型名称不能为空');
  }
  
  if (data.priority < 0) {
    throw new Error('优先级不能为负数');
  }
  
  // 更多验证逻辑...
}

// 使用示例
try {
  validateModelData(modelData);
  const model = await modelService.createModel(modelData);
} catch (error) {
  console.error('数据验证失败:', error.message);
}
```

### 4. 缓存策略

对于频繁访问的数据，考虑实现缓存：

```typescript
class CachedModelService {
  private cache = new Map<string, { data: Model; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5分钟

  async getModelById(modelId: string): Promise<Model> {
    const cached = this.cache.get(modelId);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    
    const model = await modelService.getModelById(modelId);
    this.cache.set(modelId, { data: model, timestamp: Date.now() });
    
    return model;
  }
}
```

## 示例代码

完整的使用示例请参考 `src/examples/modelServiceExample.ts` 文件。

## 许可证

MIT License