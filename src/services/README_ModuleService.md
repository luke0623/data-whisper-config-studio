# ModuleService 模块服务

## 概述

ModuleService 是一个完整的模块管理服务，提供了模块的 CRUD（创建、读取、更新、删除）操作，支持分页、搜索、批量操作等功能。该服务采用 TypeScript 编写，遵循最佳实践，包含完整的错误处理和数据验证机制。

## 功能特性

### 🔧 核心功能
- ✅ 获取所有模块（支持分页和搜索）
- ✅ 根据ID获取单个模块
- ✅ 创建新模块
- ✅ 更新模块信息
- ✅ 删除单个模块
- ✅ 批量删除模块
- ✅ 批量更新模块
- ✅ 模块搜索
- ✅ 获取模块统计信息

### 🛡️ 安全特性
- 完整的数据验证
- 类型安全的 TypeScript 接口
- 详细的错误处理
- 自定义错误类型

### 📊 高级功能
- 分页支持
- 排序功能
- 过滤查询
- 批量操作
- 统计信息

## 接口定义

### 核心接口

```typescript
// 模块基础接口
interface Module {
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

// 创建模块请求
interface CreateModuleRequest {
  module_name: string;
  priority: number;
  version: string;
  tenant_id: string;
  created_by: string;
}

// 更新模块请求
interface UpdateModuleRequest {
  module_name?: string;
  priority?: number;
  version?: string;
  last_modified_by: string;
}
```

### 分页和查询接口

```typescript
// 分页查询参数
interface ModulePaginationParams {
  page?: number;
  limit?: number;
  sortBy?: keyof Module;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  // ... 其他过滤参数
}

// 分页响应
interface PaginatedModuleResponse {
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
```

## 使用方法

### 1. 导入服务

```typescript
import { moduleService, ModuleServiceError } from '../services/moduleService';
```

### 2. 基本操作

#### 获取所有模块
```typescript
try {
  const result = await moduleService.getAllModules({
    page: 1,
    limit: 10,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  
  console.log('模块列表:', result.data);
  console.log('分页信息:', result.pagination);
} catch (error) {
  if (error instanceof ModuleServiceError) {
    console.error('错误:', error.message, error.code);
  }
}
```

#### 创建模块
```typescript
try {
  const newModule = await moduleService.createModule({
    module_name: '数据处理模块',
    priority: 1,
    version: '1.0.0',
    tenant_id: 'tenant_001',
    created_by: 'admin'
  });
  
  console.log('创建成功:', newModule);
} catch (error) {
  console.error('创建失败:', error.message);
}
```

#### 更新模块
```typescript
try {
  const updatedModule = await moduleService.updateModule('module_id', {
    module_name: '更新的模块名',
    priority: 2,
    last_modified_by: 'admin'
  });
  
  console.log('更新成功:', updatedModule);
} catch (error) {
  console.error('更新失败:', error.message);
}
```

#### 删除模块
```typescript
try {
  await moduleService.deleteModule('module_id');
  console.log('删除成功');
} catch (error) {
  console.error('删除失败:', error.message);
}
```

### 3. 高级操作

#### 搜索模块
```typescript
try {
  const result = await moduleService.searchModules('数据处理', {
    page: 1,
    limit: 20,
    tenant_id: 'tenant_001'
  });
  
  console.log('搜索结果:', result.data);
} catch (error) {
  console.error('搜索失败:', error.message);
}
```

#### 批量删除
```typescript
try {
  const result = await moduleService.deleteModules(['id1', 'id2', 'id3']);
  console.log(`成功删除 ${result.successCount} 个，失败 ${result.failedCount} 个`);
} catch (error) {
  console.error('批量删除失败:', error.message);
}
```

#### 获取统计信息
```typescript
try {
  const stats = await moduleService.getModuleStats();
  console.log('总模块数:', stats.total);
  console.log('最近创建:', stats.recentlyCreated);
} catch (error) {
  console.error('获取统计失败:', error.message);
}
```

## 错误处理

### ModuleServiceError 类

```typescript
class ModuleServiceError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  
  constructor(message: string, statusCode: number, code: string);
}
```

### 常见错误代码

- `VALIDATION_ERROR`: 数据验证失败
- `HTTP_ERROR`: HTTP 请求错误
- `API_ERROR`: API 响应错误
- `NETWORK_ERROR`: 网络连接错误
- `GET_MODULES_ERROR`: 获取模块列表失败
- `CREATE_MODULE_ERROR`: 创建模块失败
- `UPDATE_MODULE_ERROR`: 更新模块失败
- `DELETE_MODULE_ERROR`: 删除模块失败

### 错误处理最佳实践

```typescript
try {
  const result = await moduleService.getAllModules();
  // 处理成功结果
} catch (error) {
  if (error instanceof ModuleServiceError) {
    // 处理已知的服务错误
    switch (error.code) {
      case 'VALIDATION_ERROR':
        // 处理验证错误
        break;
      case 'NETWORK_ERROR':
        // 处理网络错误
        break;
      default:
        // 处理其他服务错误
        break;
    }
  } else {
    // 处理未知错误
    console.error('未知错误:', error);
  }
}
```

## 数据验证

### 创建模块验证规则
- `module_name`: 不能为空
- `priority`: 不能为负数
- `version`: 不能为空
- `tenant_id`: 不能为空
- `created_by`: 不能为空

### 更新模块验证规则
- `module_name`: 如果提供，不能为空
- `priority`: 如果提供，不能为负数
- `version`: 如果提供，不能为空
- `last_modified_by`: 必须提供且不能为空

## API 端点

服务默认使用以下 API 端点：

- `GET /api/modules` - 获取所有模块
- `GET /api/modules/:id` - 获取单个模块
- `POST /api/modules` - 创建模块
- `PUT /api/modules/:id` - 更新模块
- `DELETE /api/modules/:id` - 删除模块
- `POST /api/modules/batch-delete` - 批量删除
- `POST /api/modules/batch-update` - 批量更新
- `GET /api/modules/search` - 搜索模块
- `GET /api/modules/stats` - 获取统计信息

## 配置

### 自定义基础 URL

```typescript
const customModuleService = new ModuleService('/custom/api/modules');
```

### 自定义请求头

服务会自动添加以下默认请求头：
- `Content-Type: application/json`

## 示例代码

完整的使用示例请参考：`src/examples/moduleServiceExample.ts`

## 依赖注入

服务已经创建了默认实例并导出：

```typescript
// 直接使用默认实例
import { moduleService } from '../services/moduleService';

// 或者创建自定义实例
import { ModuleService } from '../services/moduleService';
const customService = new ModuleService('/custom/api');
```

## 最佳实践

1. **错误处理**: 始终使用 try-catch 包装异步调用
2. **类型安全**: 使用提供的 TypeScript 接口
3. **数据验证**: 依赖服务内置的验证机制
4. **分页**: 对于大量数据，使用分页参数
5. **搜索**: 使用专门的搜索方法而不是客户端过滤
6. **批量操作**: 对于多个操作，使用批量方法提高性能

## 版本信息

- 版本: 1.0.0
- TypeScript: 支持
- 依赖: 无外部依赖（仅使用原生 fetch API）