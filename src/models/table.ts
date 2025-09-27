/**
 * Table data models
 * Comprehensive table configuration and metadata interfaces
 */

/**
 * Table field definition
 */
export interface TableField {
  name: string;
  type: string;
  description: string;
  isPrimaryKey: boolean;
}

/**
 * Table status enumeration
 */
export type TableStatus = 'active' | 'inactive' | 'pending';

/**
 * Comprehensive table configuration interface
 * This interface contains detailed table information including metadata,
 * trigger configurations, and audit information
 */
export interface TableDetailConfig {
  id: string;
  name: string;
  description: string;
  schema: string;
  status: TableStatus;
  lastUpdated: string;
  recordCount: number;
  fields: TableField[];
  
  // Extended configuration fields
  table_trigger_id?: string;
  table_name?: string;
  data_count?: number;
  model_name?: string;
  is_extracted?: boolean;
  model_trigger_id?: string;
  event_trigger_id?: string;
  tenant_id?: string;
  created_at?: string;
  created_by?: string;
  last_modified_at?: string;
  last_modified_by?: string;
  module_trigger_id?: string;
}

/**
 * Table creation request (excludes auto-generated fields)
 */
export type CreateTableRequest = Omit<TableDetailConfig, 'id' | 'lastUpdated' | 'created_at' | 'last_modified_at'>;

/**
 * Table update request (partial fields)
 */
export type UpdateTableRequest = Partial<Omit<TableDetailConfig, 'id' | 'created_at' | 'created_by'>>;

/**
 * Table filter parameters for queries
 */
export interface TableFilterParams {
  search?: string;
  status?: TableStatus | 'all';
  schema?: string;
  page?: number;
  limit?: number;
  sortBy?: keyof TableDetailConfig;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated table response
 */
export interface PaginatedTableResponse {
  items: TableDetailConfig[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}