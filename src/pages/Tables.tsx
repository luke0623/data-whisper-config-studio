
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Table } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TableConfig {
  config_id: string;
  name: string;
  table_name: string;
  primary_key: string;
  object_key: string;
  sequence_key: string;
  model_name: string;
  parent_name: string;
  label: string;
  join_keys: string;
  depend_on: string;
  audit_column: string;
  conditions: string;
  data_source_id: string;
  is_list: boolean;
  triggered: boolean;
  version: string;
  tenant_id: string;
  created_at: string;
  created_by: string;
  last_modified_at: string;
  last_modified_by: string;
  json_columns: string;
}

const Tables = () => {
  const [tables, setTables] = useState<TableConfig[]>([
    {
      config_id: 'config_001',
      name: 'Policies Table',
      table_name: 'policies',
      primary_key: 'policy_id',
      object_key: 'policy_number',
      sequence_key: 'seq_id',
      model_name: 'Policy',
      parent_name: '',
      label: 'Policy Records',
      join_keys: 'policy_id',
      depend_on: '',
      audit_column: 'audit_info',
      conditions: 'status = "ACTIVE"',
      data_source_id: 'ds_001',
      is_list: true,
      triggered: false,
      version: '1.0.0',
      tenant_id: 'tenant_001',
      created_at: '2024-01-15T10:00:00Z',
      created_by: 'admin',
      last_modified_at: '2024-01-15T10:00:00Z',
      last_modified_by: 'admin',
      json_columns: 'policy_details,coverage_info'
    }
  ]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingTable, setEditingTable] = useState<TableConfig | null>(null);
  const [formData, setFormData] = useState<Partial<TableConfig>>({});

  const handleCreate = () => {
    setIsEditing(true);
    setEditingTable(null);
    setFormData({
      config_id: '',
      name: '',
      table_name: '',
      primary_key: '',
      object_key: '',
      sequence_key: '',
      model_name: '',
      parent_name: '',
      label: '',
      join_keys: '',
      depend_on: '',
      audit_column: '',
      conditions: '',
      data_source_id: '',
      is_list: false,
      triggered: false,
      version: '1.0.0',
      tenant_id: 'tenant_001',
      created_by: 'current_user',
      last_modified_by: 'current_user',
      json_columns: ''
    });
  };

  const handleEdit = (table: TableConfig) => {
    setIsEditing(true);
    setEditingTable(table);
    setFormData(table);
  };

  const handleSave = () => {
    if (!formData.name || !formData.config_id || !formData.table_name) {
      toast({
        title: "Validation Error",
        description: "Config ID, Name, and Table Name are required.",
        variant: "destructive"
      });
      return;
    }

    const now = new Date().toISOString();
    const tableData = {
      ...formData,
      created_at: editingTable ? editingTable.created_at : now,
      last_modified_at: now
    } as TableConfig;

    if (editingTable) {
      setTables(prev => prev.map(t => t.config_id === editingTable.config_id ? tableData : t));
      toast({
        title: "Table Updated",
        description: "Table configuration has been updated successfully."
      });
    } else {
      setTables(prev => [...prev, tableData]);
      toast({
        title: "Table Created",
        description: "New table configuration has been created successfully."
      });
    }

    setIsEditing(false);
    setEditingTable(null);
    setFormData({});
  };

  const handleDelete = (configId: string) => {
    setTables(prev => prev.filter(t => t.config_id !== configId));
    toast({
      title: "Table Deleted",
      description: "Table configuration has been deleted successfully."
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Table className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Tables</h1>
            <p className="text-gray-600">Manage table configurations</p>
          </div>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Table Config
        </Button>
      </div>

      <Separator />

      {isEditing && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingTable ? 'Edit Table Configuration' : 'Create New Table Configuration'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="config_id">Config ID</Label>
              <Input
                id="config_id"
                value={formData.config_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, config_id: e.target.value }))}
                disabled={!!editingTable}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="table_name">Table Name</Label>
              <Input
                id="table_name"
                value={formData.table_name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, table_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primary_key">Primary Key</Label>
              <Input
                id="primary_key"
                value={formData.primary_key || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, primary_key: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="object_key">Object Key</Label>
              <Input
                id="object_key"
                value={formData.object_key || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, object_key: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sequence_key">Sequence Key</Label>
              <Input
                id="sequence_key"
                value={formData.sequence_key || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, sequence_key: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model_name">Model Name</Label>
              <Input
                id="model_name"
                value={formData.model_name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, model_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent_name">Parent Name</Label>
              <Input
                id="parent_name"
                value={formData.parent_name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, parent_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={formData.label || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="join_keys">Join Keys</Label>
              <Input
                id="join_keys"
                value={formData.join_keys || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, join_keys: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="depend_on">Depends On</Label>
              <Input
                id="depend_on"
                value={formData.depend_on || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, depend_on: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="audit_column">Audit Column</Label>
              <Input
                id="audit_column"
                value={formData.audit_column || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, audit_column: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_source_id">Data Source ID</Label>
              <Input
                id="data_source_id"
                value={formData.data_source_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, data_source_id: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={formData.version || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant_id">Tenant ID</Label>
              <Input
                id="tenant_id"
                value={formData.tenant_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, tenant_id: e.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="conditions">Conditions</Label>
              <Textarea
                id="conditions"
                value={formData.conditions || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, conditions: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="json_columns">JSON Columns (comma-separated)</Label>
              <Textarea
                id="json_columns"
                value={formData.json_columns || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, json_columns: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_list"
                checked={formData.is_list || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_list: checked }))}
              />
              <Label htmlFor="is_list">Is List</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="triggered"
                checked={formData.triggered || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, triggered: checked }))}
              />
              <Label htmlFor="triggered">Triggered</Label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={handleSave}>Save</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6">
        {tables.map((table) => (
          <Card key={table.config_id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{table.name}</h3>
                <p className="text-sm text-gray-600">Config ID: {table.config_id}</p>
                <p className="text-sm text-gray-600">Table: {table.table_name}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(table)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(table.config_id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Model:</span> {table.model_name}
              </div>
              <div>
                <span className="font-medium">Primary Key:</span> {table.primary_key}
              </div>
              <div>
                <span className="font-medium">Object Key:</span> {table.object_key}
              </div>
              <div>
                <span className="font-medium">Data Source:</span> {table.data_source_id}
              </div>
              <div>
                <span className="font-medium">Version:</span> {table.version}
              </div>
              <div className="flex items-center gap-2">
                {table.is_list && <Badge variant="secondary">List</Badge>}
                {table.triggered && <Badge variant="secondary">Triggered</Badge>}
              </div>
            </div>
            {table.conditions && (
              <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                <span className="font-medium">Conditions:</span> {table.conditions}
              </div>
            )}
            <div className="mt-3 text-xs text-gray-500">
              Last modified: {new Date(table.last_modified_at).toLocaleDateString()} by {table.last_modified_by}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Tables;
