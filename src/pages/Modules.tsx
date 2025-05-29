
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Layers } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Module } from '@/models/module';



const Modules = () => {
  const [modules, setModules] = useState<Module[]>([
    {
      module_id: 'policy_mgmt_001',
      module_name: 'Policy Management',
      priority: 1,
      version: '1.0.0',
      tenant_id: 'tenant_001',
      created_at: '2024-01-15T10:00:00Z',
      created_by: 'admin',
      last_modified_at: '2024-01-15T10:00:00Z',
      last_modified_by: 'admin'
    },
    {
      module_id: 'claims_001',
      module_name: 'Claims',
      priority: 2,
      version: '1.0.0',
      tenant_id: 'tenant_001',
      created_at: '2024-01-15T10:00:00Z',
      created_by: 'admin',
      last_modified_at: '2024-01-15T10:00:00Z',
      last_modified_by: 'admin'
    }
  ]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState<Partial<Module>>({});

  const handleCreate = () => {
    setIsEditing(true);
    setEditingModule(null);
    setFormData({
      module_id: '',
      module_name: '',
      priority: 1,
      version: '1.0.0',
      tenant_id: 'tenant_001',
      created_by: 'current_user',
      last_modified_by: 'current_user'
    });
  };

  const handleEdit = (module: Module) => {
    setIsEditing(true);
    setEditingModule(module);
    setFormData(module);
  };

  const handleSave = () => {
    if (!formData.module_name || !formData.module_id) {
      toast({
        title: "Validation Error",
        description: "Module ID and Name are required.",
        variant: "destructive"
      });
      return;
    }

    const now = new Date().toISOString();
    const moduleData = {
      ...formData,
      created_at: editingModule ? editingModule.created_at : now,
      last_modified_at: now
    } as Module;

    if (editingModule) {
      setModules(prev => prev.map(m => m.module_id === editingModule.module_id ? moduleData : m));
      toast({
        title: "Module Updated",
        description: "Module has been updated successfully."
      });
    } else {
      setModules(prev => [...prev, moduleData]);
      toast({
        title: "Module Created",
        description: "New module has been created successfully."
      });
    }

    setIsEditing(false);
    setEditingModule(null);
    setFormData({});
  };

  const handleDelete = (moduleId: string) => {
    setModules(prev => prev.filter(m => m.module_id !== moduleId));
    toast({
      title: "Module Deleted",
      description: "Module has been deleted successfully."
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Modules</h1>
            <p className="text-gray-600">Manage system modules</p>
          </div>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Module
        </Button>
      </div>

      <Separator />

      {isEditing && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingModule ? 'Edit Module' : 'Create New Module'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="module_id">Module ID</Label>
              <Input
                id="module_id"
                value={formData.module_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, module_id: e.target.value }))}
                disabled={!!editingModule}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="module_name">Module Name</Label>
              <Input
                id="module_name"
                value={formData.module_name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, module_name: e.target.value }))}
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
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={handleSave}>Save</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {modules.map((module) => (
          <Card key={module.module_id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{module.module_name}</h3>
                <p className="text-sm text-gray-600">ID: {module.module_id}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(module)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(module.module_id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Priority: {module.priority}</Badge>
                <Badge variant="outline">v{module.version}</Badge>
              </div>
              <p className="text-sm text-gray-600">Tenant: {module.tenant_id}</p>
              <p className="text-sm text-gray-600">
                Last modified: {new Date(module.last_modified_at).toLocaleDateString()} by {module.last_modified_by}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Modules;
