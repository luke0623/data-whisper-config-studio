
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Layers, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Module, CreateModuleRequest, UpdateModuleRequest } from '../models/module';
import { moduleService } from '../services/moduleService';
import { toast } from '@/hooks/use-toast';
import { ExecutionFlowDiagram } from '../components/flow/ExecutionFlowDiagram';



const Modules: React.FC = () => {
  // State management
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form and modal states
  const [isEditing, setIsEditing] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState<Partial<Module>>({});


  // Disable mock data mode to use remote service
  useEffect(() => {
    moduleService.setMockDataMode(false);
  }, []);

  // Fetch modules data
  const fetchModules = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await moduleService.getAllModules();
      setModules(data);
      setSuccessMessage('Modules loaded successfully');
    } catch (err) {
      console.error('Failed to fetch modules:', err);
      setError('Failed to load modules. Please try again.');
      // Fallback to empty array on error
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchModules();
  }, []);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);



  // CRUD handlers
  const handleCreate = () => {
    setIsEditing(true);
    setEditingModule(null);
    setFormData({
      moduleId: '',
      moduleName: '',
      priority: 1,
      version: '1.0.0',
      tenantId: 'tenant_001',
      createdBy: 'current_user',
      lastModifiedBy: 'current_user'
    });
  };

  const handleEdit = (module: Module) => {
    setIsEditing(true);
    setEditingModule(module);
    setFormData(module);
  };

  const handleSave = async () => {
    if (!formData.moduleName || !formData.moduleId) {
      toast({
        title: "Validation Error",
        description: "Module ID and Name are required.",
        variant: "destructive"
      });
      return;
    }

    try {
      const now = new Date().toISOString();
      const moduleData = {
        ...formData,
        createdAt: editingModule ? editingModule.createdAt : now,
        lastModifiedAt: now
      } as Module;

      if (editingModule) {
        await moduleService.updateModule(editingModule.moduleId, moduleData);
        setModules(prev => prev.map(m => m.moduleId === editingModule.moduleId ? moduleData : m));
        setSuccessMessage('Module updated successfully');
        toast({
          title: "Module Updated",
          description: "Module has been updated successfully."
        });
      } else {
        const createRequest: CreateModuleRequest = {
          moduleName: formData.moduleName!,
          priority: formData.priority!,
          version: formData.version!,
          tenantId: formData.tenantId!,
          createdBy: 'current_user'
        };
        const newModule = await moduleService.createModule(createRequest);
        setModules(prev => [...prev, newModule]);
        setSuccessMessage('Module created successfully');
        toast({
          title: "Module Created",
          description: "New module has been created successfully."
        });
      }

      setIsEditing(false);
      setEditingModule(null);
      setFormData({});
    } catch (err) {
      console.error('Failed to save module:', err);
      setError('Failed to save module. Please try again.');
      toast({
        title: "Error",
        description: "Failed to save module. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (moduleId: string) => {
    try {
      await moduleService.deleteModule(moduleId);
      setModules(prev => prev.filter(m => m.moduleId !== moduleId));
      setSuccessMessage('Module deleted successfully');
      toast({
        title: "Module Deleted",
        description: "Module has been deleted successfully."
      });
    } catch (err) {
      console.error('Failed to delete module:', err);
      setError('Failed to delete module. Please try again.');
      toast({
        title: "Error",
        description: "Failed to delete module. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading modules...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Modules</h1>
            <p className="text-gray-600">Manage system modules</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <GitBranch className="h-4 w-4" />
                Execution Flow 
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-none max-h-none w-screen h-screen p-0 m-0 border-0">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle>Flow Diagram </DialogTitle>
              </DialogHeader>
              <div className="flex-1 h-[calc(100vh-80px)] p-6 pt-2">
                <ExecutionFlowDiagram 
                  height="100%"
                  width="100%"
                  autoFetch={true}
                  onNodeClick={(node) => {
                    toast({
                      title: `${node.data.type} `,
                      description: `name: ${node.data.label}${node.data.priority ? ` | priority : ${node.data.priority}` : ''}`,
                    });
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Module
          </Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <Separator />

      {/* Create/Edit Form */}
      {isEditing && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingModule ? 'Edit Module' : 'Create New Module'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="moduleId">Module ID</Label>
              <Input
                id="moduleId"
                value={formData.moduleId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, moduleId: e.target.value }))}
                disabled={!!editingModule}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="moduleName">Module Name</Label>
              <Input
                id="moduleName"
                value={formData.moduleName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, moduleName: e.target.value }))}
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
              <Label htmlFor="tenantId">Tenant ID</Label>
              <Input
                id="tenantId"
                value={formData.tenantId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, tenantId: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={handleSave}>Save</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {modules.map((module) => (
          <Card key={module.moduleId} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{module.moduleName}</h3>
                <p className="text-sm text-gray-600">ID: {module.moduleId}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(module)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(module.moduleId)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Priority: {module.priority}</Badge>
                <Badge variant="outline">v{module.version}</Badge>
              </div>
              {/* <p className="text-sm text-gray-600">Tenant: {module.tenantId}</p> */}
              <p className="text-sm text-gray-600">
                Last modified: {new Date(module.lastModifiedAt).toLocaleDateString()}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {modules.length === 0 && !loading && (
        <div className="text-center py-12">
          <Layers className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No modules found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new module.
          </p>
          <div className="mt-6">
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Module
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Modules;
