
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Database, Loader2, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Model } from '@/models/model';
import { modelService } from '@/services/modelService';

const Models = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  
  // Form states
  const [createFormData, setCreateFormData] = useState<Partial<Model>>({});
  const [editFormData, setEditFormData] = useState<Partial<Model>>({});
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(6); // Number of models displayed per page

  // Fetch models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedModels = await modelService.findAllModels();
        setModels(fetchedModels);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch models');
        console.error('Error fetching models:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  // Pagination calculation logic
  const totalFilteredCount = models.length;
  const calculatedTotalPages = Math.ceil(totalFilteredCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedModels = models.slice(startIndex, endIndex);

  // Update pagination state
  React.useEffect(() => {
    setTotalCount(totalFilteredCount);
    setTotalPages(calculatedTotalPages);
    
    // If current page exceeds total pages, reset to first page
    if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalFilteredCount, calculatedTotalPages, currentPage, pageSize]);

  // Pagination control functions
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset create form
  const resetCreateForm = () => {
    setCreateFormData({
      modelId: '',
      modelName: '',
      dependOn: '',
      rawTopicCode: '',
      isParalleled: false,
      version: '1.0.0',
      tenantId: 'tenant_001',
      createdBy: 'current_user',
      lastModifiedBy: 'current_user',
      moduleId: '',
      priority: 1
    });
    setFormErrors({});
    setSuccessMessage(null);
  };

  // Validate form data
  const validateForm = (formData: Partial<Model>): boolean => {
    const errors: {[key: string]: string} = {};

    if (!formData.modelName?.trim()) {
      errors.modelName = 'Model name cannot be empty';
    } else if (formData.modelName.length < 2) {
      errors.modelName = 'Model name must be at least 2 characters';
    }

    if (!formData.modelId?.trim()) {
      errors.modelId = 'Model ID cannot be empty';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.modelId)) {
      errors.modelId = 'Model ID can only contain letters, numbers, underscores and hyphens';
    }

    if (!formData.moduleId?.trim()) {
      errors.moduleId = 'Module ID cannot be empty';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = () => {
    setCreateDialogOpen(true);
    resetCreateForm();
  };

  const handleEdit = (model: Model) => {
    setSelectedModel(model);
    setEditFormData(model);
    setEditDialogOpen(true);
    setFormErrors({});
    setSuccessMessage(null);
  };

  const handleCreateModel = async () => {
    try {
      setCreateLoading(true);
      setError(null);

      if (!validateForm(createFormData)) {
        setCreateLoading(false);
        return;
      }

      const now = new Date().toISOString();
      const modelData = {
        ...createFormData,
        createdAt: now,
        lastModifiedAt: now
      } as Model;

      setModels(prev => [...prev, modelData]);
      setCreateDialogOpen(false);
      resetCreateForm();
      setSuccessMessage(`Model "${createFormData.modelName}" created successfully!`);
      
      toast({
        title: "Model Created",
        description: "New model has been created successfully."
      });

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to create model. Please try again.');
      console.error('Failed to create model:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedModel || !editFormData) return;

    try {
      setEditLoading(true);
      setError(null);

      if (!validateForm(editFormData)) {
        setEditLoading(false);
        return;
      }

      const now = new Date().toISOString();
      const modelData = {
        ...editFormData,
        lastModifiedAt: now
      } as Model;

      setModels(prev => prev.map(m => m.modelId === selectedModel.modelId ? modelData : m));
      setEditDialogOpen(false);
      setSelectedModel(null);
      setEditFormData({});
      setSuccessMessage(`Model "${editFormData.modelName}" updated successfully!`);
      
      toast({
        title: "Model Updated",
        description: "Model has been updated successfully."
      });

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to update model. Please try again.');
      console.error('Failed to update model:', err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (modelId: string) => {
    if (!confirm('Are you sure you want to delete this model? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      setModels(prev => prev.filter(m => m.modelId !== modelId));
      setSuccessMessage('Model deleted successfully!');
      
      toast({
        title: "Model Deleted",
        description: "Model has been deleted successfully."
      });

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to delete model. Please try again.');
      console.error('Failed to delete model:', err);
    } finally {
      setLoading(false);
    }
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

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <X className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Success banner */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <div className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-green-800">Success</h3>
            <p className="text-sm text-green-700 mt-1">{successMessage}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSuccessMessage(null)}
            className="text-green-600 hover:text-green-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {loading && (
        <Card className="p-8">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-lg">Loading models...</p>
          </div>
        </Card>
      )}

      {!loading && !error && models.length === 0 && (
        <Card className="p-8">
          <div className="text-center">
            <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Models Found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first model.</p>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Create First Model
            </Button>
          </div>
        </Card>
      )}

      {!loading && models.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {paginatedModels.map((model) => (
          <Card key={model.modelId} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{model.modelName}</h3>
                <p className="text-sm text-gray-600">ID: {model.modelId}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(model)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(model.modelId)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Priority: {model.priority}</Badge>
                <Badge variant="outline">v{model.version}</Badge>
                {model.isParalleled && <Badge variant="secondary">Paralleled</Badge>}
              </div>
              <p className="text-sm text-gray-600">Module: {model.moduleId}</p>
              <p className="text-sm text-gray-600">Topic: {model.rawTopicCode}</p>
              {model.dependOn && <p className="text-sm text-gray-600">Depends on: {model.dependOn}</p>}
              <p className="text-sm text-gray-600">
                Last modified: {new Date(model.lastModifiedAt).toLocaleDateString()} by {model.lastModifiedBy}
              </p>
            </div>
          </Card>
        ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && models.length > 0 && totalFilteredCount > 0 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          {/* Pagination Info */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              Showing {Math.min(startIndex + 1, totalFilteredCount)} - {Math.min(endIndex, totalFilteredCount)} of {totalFilteredCount} items
            </span>
            <div className="flex items-center gap-2">
              <span>Items per page:</span>
              <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="48">48</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pagination Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Page Number Buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNumber)}
                    className="h-8 w-8 p-0"
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Model Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Model</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-modelId">Model ID *</Label>
              <Input
                id="create-modelId"
                value={createFormData.modelId || ''}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, modelId: e.target.value }))}
                placeholder="Enter model ID"
              />
              {formErrors.modelId && <p className="text-sm text-red-600">{formErrors.modelId}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-modelName">Model Name *</Label>
              <Input
                id="create-modelName"
                value={createFormData.modelName || ''}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, modelName: e.target.value }))}
                placeholder="Enter model name"
              />
              {formErrors.modelName && <p className="text-sm text-red-600">{formErrors.modelName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-moduleId">Module ID *</Label>
              <Input
                id="create-moduleId"
                value={createFormData.moduleId || ''}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, moduleId: e.target.value }))}
                placeholder="Enter module ID"
              />
              {formErrors.moduleId && <p className="text-sm text-red-600">{formErrors.moduleId}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-dependOn">Depends On</Label>
              <Input
                id="create-dependOn"
                value={createFormData.dependOn || ''}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, dependOn: e.target.value }))}
                placeholder="Enter dependencies"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-rawTopicCode">Raw Topic Code</Label>
              <Input
                id="create-rawTopicCode"
                value={createFormData.rawTopicCode || ''}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, rawTopicCode: e.target.value }))}
                placeholder="Enter raw topic code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-priority">Priority</Label>
              <Input
                id="create-priority"
                type="number"
                value={createFormData.priority || 1}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-version">Version</Label>
              <Input
                id="create-version"
                value={createFormData.version || ''}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, version: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-tenantId">Tenant ID</Label>
              <Input
                id="create-tenantId"
                value={createFormData.tenantId || ''}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, tenantId: e.target.value }))}
                placeholder="Enter tenant ID"
              />
            </div>
            <div className="flex items-center space-x-2 md:col-span-2">
              <Checkbox
                id="create-isParalleled"
                checked={createFormData.isParalleled || false}
                onCheckedChange={(checked) => setCreateFormData(prev => ({ ...prev, isParalleled: !!checked }))}
              />
              <Label htmlFor="create-isParalleled">Is Paralleled</Label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={handleCreateModel} disabled={createLoading}>
              {createLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create Model
            </Button>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Model Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Model</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-modelId">Model ID *</Label>
              <Input
                id="edit-modelId"
                value={editFormData.modelId || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, modelId: e.target.value }))}
                placeholder="Enter model ID"
                disabled
              />
              {formErrors.modelId && <p className="text-sm text-red-600">{formErrors.modelId}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-modelName">Model Name *</Label>
              <Input
                id="edit-modelName"
                value={editFormData.modelName || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, modelName: e.target.value }))}
                placeholder="Enter model name"
              />
              {formErrors.modelName && <p className="text-sm text-red-600">{formErrors.modelName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-moduleId">Module ID *</Label>
              <Input
                id="edit-moduleId"
                value={editFormData.moduleId || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, moduleId: e.target.value }))}
                placeholder="Enter module ID"
              />
              {formErrors.moduleId && <p className="text-sm text-red-600">{formErrors.moduleId}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dependOn">Depends On</Label>
              <Input
                id="edit-dependOn"
                value={editFormData.dependOn || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, dependOn: e.target.value }))}
                placeholder="Enter dependencies"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rawTopicCode">Raw Topic Code</Label>
              <Input
                id="edit-rawTopicCode"
                value={editFormData.rawTopicCode || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, rawTopicCode: e.target.value }))}
                placeholder="Enter raw topic code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-priority">Priority</Label>
              <Input
                id="edit-priority"
                type="number"
                value={editFormData.priority || 1}
                onChange={(e) => setEditFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-version">Version</Label>
              <Input
                id="edit-version"
                value={editFormData.version || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, version: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tenantId">Tenant ID</Label>
              <Input
                id="edit-tenantId"
                value={editFormData.tenantId || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, tenantId: e.target.value }))}
                placeholder="Enter tenant ID"
              />
            </div>
            <div className="flex items-center space-x-2 md:col-span-2">
              <Checkbox
                id="edit-isParalleled"
                checked={editFormData.isParalleled || false}
                onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, isParalleled: !!checked }))}
              />
              <Label htmlFor="edit-isParalleled">Is Paralleled</Label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={handleSaveEdit} disabled={editLoading}>
              {editLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Models;
