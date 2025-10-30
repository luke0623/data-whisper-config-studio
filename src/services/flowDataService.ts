import { moduleService } from './moduleService';
import { modelService } from './modelService';
import { tableService } from './tableService';

// 数据类型定义
export interface FlowRelationshipData {
  modules: any[];
  models: any[];
  tables: any[];
}

export interface FlowDataCache {
  data: FlowRelationshipData | null;
  timestamp: number;
  error: string | null;
}

// 缓存配置
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存
const CACHE_KEY = 'flow_relationship_data';

class FlowDataService {
  private cache: FlowDataCache = {
    data: null,
    timestamp: 0,
    error: null,
  };

  // 检查缓存是否有效
  private isCacheValid(): boolean {
    const now = Date.now();
    return this.cache.data !== null && 
           (now - this.cache.timestamp) < CACHE_DURATION &&
           this.cache.error === null;
  }

  // 清除缓存
  public clearCache(): void {
    this.cache = {
      data: null,
      timestamp: 0,
      error: null,
    };
  }

  // 获取所有关系数据
  public async getAllRelationshipData(forceRefresh = false): Promise<FlowRelationshipData> {
    console.log('[FlowDataService] Starting data fetch, forceRefresh:', forceRefresh);
    
    // 如果有有效缓存且不强制刷新，返回缓存数据
    if (!forceRefresh && this.isCacheValid() && this.cache.data) {
      console.log('[FlowDataService] Using cached data');
      return this.cache.data;
    }

    try {
      console.log('[FlowDataService] Fetching fresh data from APIs');
      
      // 确保服务使用远程数据
      moduleService.setMockDataMode(false);
      modelService.setMockDataMode(false);
      tableService.setMockDataMode(false);

      // 并行获取所有数据
      console.log('[FlowDataService] Making parallel API calls...');
      const [modulesData, modelsData, tablesData] = await Promise.all([
        moduleService.getAllModules(),
        modelService.findAllModels(), // 使用findAllModels获取所有模型数据
        tableService.getAllTables(),
      ]);

      console.log('[FlowDataService] API responses received:');
      console.log('- Modules:', modulesData?.length || 0, 'items');
      console.log('- Models:', modelsData?.length || 0, 'items');
      console.log('- Tables:', tablesData?.length || 0, 'items');

      // modelsData已经是数组格式，无需额外处理
      const models = modelsData || [];

      const relationshipData: FlowRelationshipData = {
        modules: modulesData || [],
        models: models,
        tables: tablesData || [],
      };

      console.log('[FlowDataService] Relationship data prepared:', {
        modules: relationshipData.modules.length,
        models: relationshipData.models.length,
        tables: relationshipData.tables.length
      });

      // 更新缓存
      this.cache = {
        data: relationshipData,
        timestamp: Date.now(),
        error: null,
      };

      console.log('[FlowDataService] Data cached successfully');
      return relationshipData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('[FlowDataService] Error fetching data:', errorMessage);
      
      // 更新缓存错误状态
      this.cache = {
        data: null,
        timestamp: Date.now(),
        error: errorMessage,
      };

      throw new Error(`Failed to fetch relationship data: ${errorMessage}`);
    }
  }

  // 获取缓存状态
  public getCacheStatus(): { 
    hasCache: boolean; 
    isValid: boolean; 
    age: number; 
    error: string | null;
  } {
    const now = Date.now();
    return {
      hasCache: this.cache.data !== null,
      isValid: this.isCacheValid(),
      age: now - this.cache.timestamp,
      error: this.cache.error,
    };
  }

  // 预加载数据
  public async preloadData(): Promise<void> {
    try {
      await this.getAllRelationshipData();
    } catch (error) {
      console.warn('Failed to preload flow data:', error);
    }
  }
}

// 导出单例实例
export const flowDataService = new FlowDataService();