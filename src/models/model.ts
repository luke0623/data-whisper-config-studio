export interface Model {
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