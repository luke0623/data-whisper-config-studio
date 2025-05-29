
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Database } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Model } from '@/models/model';



const Models = () => {
  const [models, setModels] = useState<Model[]>([
    {
      model_id: 'policy_001',
      model_name: 'Policy',
      depend_on: '',
      raw_topic_code: 'POLICY_TOPIC',
      is_paralleled: true,
      version: '1.0.0',
      tenant_id: 'tenant_001',
      created_at: '2024-01-15T10:00:00Z',
      created_by: 'admin',
      last_modified_at: '2024-01-15T10:00:00Z',
      last_modified_by: 'admin',
      module_id: 'policy_mgmt_001',
      priority: 1
    }
  ]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [formData, setFormData] = useState<Partial<Model>>({});

  const handleCreate = () => {
    setIsEditing(true);
    setEditingModel(null);
    setFormData({
      model_id: '',
      model_name: '',
      depend_on: '',
      raw_topic_code: '',
      is_paralleled: false,
      version: '1.0.0',
      tenant_id: 'tenant_001',
      created_by: 'current_user',
      last_modified_by: 'current_user',
      module_id: '',
      priority: 1
    });
  };

  const handleEdit = (model: Model) => {
    setIsEditing(true);
    setEditingModel(model);
    setFormData(model);
  };

  const handleSave = () => {
    if (!formData.model_name || !formData.model_id) {
      toast({
        title: "Validation Error",
        description: "Model ID and Name are required.",
        variant: "destructive"
      });
      return;
    }

    const now = new Date().toISOString();
    const modelData = {
      ...formData,
      created_at: editingModel ? editingModel.created_at : now,
      last_modified_at: now
    } as Model;

    if (editingModel) {
      setModels(prev => prev.map(m => m.model_id === editingModel.model_id ? modelData : m));
      toast({
        title: "Model Updated",
        description: "Model has been updated successfully."
      });
    } else {
      setModels(prev => [...prev, modelData]);
      toast({
        title: "Model Created",
        description: "New model has been created successfully."
      });
    }

    setIsEditing(false);
    setEditingModel(null);
    setFormData({});
  };

  const handleDelete = (modelId: string) => {
    setModels(prev => prev.filter(m => m.model_id !== modelId));
    toast({
      title: "Model Deleted",
      description: "Model has been deleted successfully."
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Models</h1>
            <p className="text-gray-600">Manage domain models</p>
          </div>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Model
        </Button>
      </div>

      <Separator />

      {isEditing && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingModel ? 'Edit Model' : 'Create New Model'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model_id">Model ID</Label>
              <Input
                id="model_id"
                value={formData.model_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, model_id: e.target.value }))}
                disabled={!!editingModel}
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
              <Label htmlFor="module_id">Module ID</Label>
              <Input
                id="module_id"
                value={formData.module_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, module_id: e.target.value }))}
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
              <Label htmlFor="raw_topic_code">Raw Topic Code</Label>
              <Input
                id="raw_topic_code"
                value={formData.raw_topic_code || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, raw_topic_code: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority || 1}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
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
            <div className="flex items-center space-x-2">
              <Switch
                id="is_paralleled"
                checked={formData.is_paralleled || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_paralleled: checked }))}
              />
              <Label htmlFor="is_paralleled">Is Paralleled</Label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={handleSave}>Save</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {models.map((model) => (
          <Card key={model.model_id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{model.model_name}</h3>
                <p className="text-sm text-gray-600">ID: {model.model_id}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(model)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(model.model_id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Priority: {model.priority}</Badge>
                <Badge variant="outline">v{model.version}</Badge>
                {model.is_paralleled && <Badge variant="secondary">Paralleled</Badge>}
              </div>
              <p className="text-sm text-gray-600">Module: {model.module_id}</p>
              <p className="text-sm text-gray-600">Topic: {model.raw_topic_code}</p>
              {model.depend_on && <p className="text-sm text-gray-600">Depends on: {model.depend_on}</p>}
              <p className="text-sm text-gray-600">
                Last modified: {new Date(model.last_modified_at).toLocaleDateString()} by {model.last_modified_by}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Models;
