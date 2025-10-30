
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Database, Plus, Filter, Download, RefreshCw, HelpCircle, Info, Eye, Edit, X, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CollectorTableConfig, 
  TableStatus, 
  CreateTableRequest, 
  TableField,
  Condition,
  JoinCondition,
  Dependence,
  JsonColumn 
} from '@/models/table';
import { tableService, TableServiceError } from '@/services/tableService';

const Tables = () => {
  const [tables, setTables] = useState<CollectorTableConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [selectedTable, setSelectedTable] = useState<CollectorTableConfig | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<CollectorTableConfig>>({});
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(6); // Number of tables displayed per page
  
  // New table related states
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [createFormData, setCreateFormData] = useState<CollectorTableConfig>({
    configId: '',
    name: '',
    tableName: '',
    primaryKey: [],
    objectKey: '',
    sequenceKey: '',
    modelName: '',
    parentName: '',
    label: '',
    joinKeys: [],
    dependOn: [],
    conditions: [],
    jsonColumns: [],
    auditColumn: '',
    ignoredColumns: [],
    dataSourceId: '',
    isList: false,
    triggered: false,
    tenantId: '',
    createdBy: '',
    lastModifiedBy: ''
  });
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Function to fetch table data
  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const tables = await tableService.getAllTables();

      setTables(tables);
      // setTotalPages(response.totalPages);
      // setTotalCount(response.total);
    } catch (error) {
      console.error('Error fetching tables:', error);
      if (error instanceof TableServiceError) {
        setError(error.message);
      } else {
        setError('Failed to fetch tables. Please try again.');
      }
      // In case of error, use mock data as fallback
      const mockTables: CollectorTableConfig[] = [
        {
          configId: '1',
          name: 'Customers',
          label: 'Customer master data including contact information',
          modelName: 'Customer',
          tableName: 'customers',
          primaryKey: ['customer_id'],
          objectKey: 'customer_id',
          tenantId: 'tenant_001',
          createdAt: '2023-01-15',
          createdBy: 'admin',
          lastModifiedAt: '2023-06-15',
          lastModifiedBy: 'system'
        },
        {
          configId: '2',
          name: 'Orders',
          label: 'Order transactions with customer references',
          modelName: 'Order',
          tableName: 'orders',
          primaryKey: ['order_id'],
          objectKey: 'order_id',
          tenantId: 'tenant_001',
          createdAt: '2023-02-10',
          createdBy: 'admin',
          lastModifiedAt: '2023-06-18',
          lastModifiedBy: 'system'
        },
        {
          configId: '3',
          name: 'Products',
          label: 'Product catalog with pricing information',
          modelName: 'Product',
          tableName: 'products',
          primaryKey: ['product_id'],
          objectKey: 'product_id',
          tenantId: 'tenant_001',
          createdAt: '2023-01-20',
          createdBy: 'admin',
          lastModifiedAt: '2023-05-30',
          lastModifiedBy: 'system'
        },
        {
          configId: '4',
          name: 'Suppliers',
          label: 'Supplier information and contact details',
          modelName: 'Supplier',
          tableName: 'suppliers',
          primaryKey: ['supplier_id'],
          objectKey: 'supplier_id',
          tenantId: 'tenant_001',
          createdAt: '2023-03-01',
          createdBy: 'admin',
          lastModifiedAt: '2023-06-10',
          lastModifiedBy: 'system'
        },
      ];
      setTables(mockTables);
      setTotalCount(mockTables.length);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [currentPage, searchTerm, selectedStatus]);

  // Filter tables based on search term and status
  const filteredTables = (tables || []).filter((table) => {
    const matchesSearch = table.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (table.label && table.label.toLowerCase().includes(searchTerm.toLowerCase()));
    // Note: CollectorTableConfig doesn't have status field, so we'll remove status filtering for now
    return matchesSearch;
  });

  // Pagination calculation logic
  const totalFilteredCount = filteredTables.length;
  const calculatedTotalPages = Math.ceil(totalFilteredCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTables = filteredTables.slice(startIndex, endIndex);

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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleViewTable = (table: CollectorTableConfig) => {
    setSelectedTable(table);
    setViewDialogOpen(true);
  };

  const handleEditTable = (table: CollectorTableConfig) => {
    setSelectedTable(table);
    setEditFormData({
      configId: table.configId,
      name: table.name,
      label: table.label,
      modelName: table.modelName,
      tableName: table.tableName,
      primaryKey: table.primaryKey,
      objectKey: table.objectKey,
      sequenceKey: table.sequenceKey,
      parentName: table.parentName,
      joinKeys: table.joinKeys,
      dependOn: table.dependOn,
      conditions: table.conditions,
      jsonColumns: table.jsonColumns,
      auditColumn: table.auditColumn,
      ignoredColumns: table.ignoredColumns,
      dataSourceId: table.dataSourceId,
      isList: table.isList,
      triggered: table.triggered,
      tenantId: table.tenantId,
      createdAt: table.createdAt,
      createdBy: table.createdBy,
      lastModifiedAt: table.lastModifiedAt,
      lastModifiedBy: table.lastModifiedBy,
      version: table.version
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedTable || !editFormData) return;

    try {
      setLoading(true);
      setError(null);

      // Call TableService to update table
      const updatedTable = await tableService.updateTable(selectedTable.configId!, editFormData);
      
      // Update local state
      const updatedTables = tables.map(table => 
        table.configId === selectedTable.configId ? updatedTable : table
      );
      setTables(updatedTables);
      
      // Close dialog and reset state
      setEditDialogOpen(false);
      setSelectedTable(null);
      setEditFormData({});
    } catch (error) {
      console.error('Error updating table:', error);
      if (error instanceof TableServiceError) {
        setError(`Failed to update table: ${error.message}`);
      } else {
        setError('Failed to update table. Please try again.');
      }
      
      // In case of error, still perform local update as fallback
      const updatedTables = tables.map(table => 
        table.configId === selectedTable.configId 
          ? { ...table, ...editFormData, lastModifiedAt: new Date().toISOString() }
          : table
      );
      setTables(updatedTables);
      setEditDialogOpen(false);
      setSelectedTable(null);
      setEditFormData({});
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('Are you sure you want to delete this table? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call TableService to delete table
      await tableService.deleteTable(tableId);
      
      // Update local state, remove deleted table
      const updatedTables = tables.filter(table => table.configId !== tableId);
      setTables(updatedTables);
      
      // If currently selected table is deleted, clear selection state
      if (selectedTable?.configId === tableId) {
        setSelectedTable(null);
        setViewDialogOpen(false);
        setEditDialogOpen(false);
      }
    } catch (error) {
      console.error('Error deleting table:', error);
      if (error instanceof TableServiceError) {
        setError(`Failed to delete table: ${error.message}`);
      } else {
        setError('Failed to delete table. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset create table form
  const resetCreateForm = () => {
    setCreateFormData({
      configId: '',
      name: '',
      label: '',
      modelName: '',
      tableName: '',
      tenantId: '',
      createdBy: '',
      lastModifiedBy: '',
      primaryKey: [],
      objectKey: '',
      sequenceKey: '',
      parentName: '',
      joinKeys: [],
      dependOn: [],
      conditions: [],
      jsonColumns: [],
      auditColumn: '',
      ignoredColumns: [],
      dataSourceId: '',
      isList: false,
      triggered: false
    });
    setFormErrors({});
    setSuccessMessage(null);
  };

  // Validate form data
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // Validate required fields
    if (!createFormData.name.trim()) {
      errors.name = 'Table name cannot be empty';
    } else if (createFormData.name.length < 2) {
      errors.name = 'Table name must be at least 2 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(createFormData.name)) {
      errors.name = 'Table name can only contain letters, numbers, underscores and hyphens';
    }

    if (!createFormData.modelName.trim()) {
      errors.modelName = 'Model name cannot be empty';
    } else if (!/^[a-zA-Z0-9_]+$/.test(createFormData.modelName)) {
      errors.modelName = 'Model name can only contain letters, numbers and underscores';
    }

    // Note: Field validation removed as CollectorTableConfig doesn't have fields property
    // Note: Record count validation removed as CollectorTableConfig doesn't have recordCount property

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle create table
  const handleCreateTable = async () => {
    try {
      setCreateLoading(true);
      setError(null);

      // Form validation
      if (!validateForm()) {
        setCreateLoading(false);
        return;
      }

      await tableService.createTable(createFormData);
      
      // Close dialog and refresh data after successful creation
      setCreateDialogOpen(false);
      resetCreateForm();
      setSuccessMessage(`Table "${createFormData.name}" created successfully!`);
      await fetchTables();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      if (err instanceof TableServiceError) {
        setError(`Failed to create table: ${err.message}`);
      } else {
        setError('Unknown error occurred while creating table');
      }
      console.error('Failed to create table:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  // Note: Field management functions removed as CollectorTableConfig doesn't have fields property

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header with title and description */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-md">
            <Database className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tables</h1>
            <p className="text-gray-600 mt-1">Manage and configure your data tables</p>
          </div>
        </div>
        <Button 
          className="gap-2 self-start md:self-auto"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add New Table
        </Button>
      </div>

      {/* Info banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-indigo-800">Table Management</h3>
          <p className="text-sm text-indigo-700 mt-1">
            Tables represent your data sources that can be configured for extraction. 
            Active tables are currently being used in configurations.
          </p>
        </div>
      </div>

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

      <Separator />

      {/* Filters and actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Input 
            placeholder="Search tables..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full sm:w-80"
          />
          <div className="flex gap-2">
            <Button 
              variant={selectedStatus === 'all' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setSelectedStatus('all')}
            >
              All
            </Button>
            <Button 
              variant={selectedStatus === 'active' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setSelectedStatus('active')}
            >
              Active
            </Button>
            <Button 
              variant={selectedStatus === 'inactive' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setSelectedStatus('inactive')}
            >
              Inactive
            </Button>
            <Button 
              variant={selectedStatus === 'pending' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setSelectedStatus('pending')}
            >
              Pending
            </Button>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Table list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border border-gray-200 shadow-sm rounded-xl overflow-hidden">
              <div className="p-5 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedTables.length > 0 ? (
            paginatedTables.map((table) => (
              <Card key={table.configId} className="border border-gray-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900">{table.name}</CardTitle>
                      {table.label && (
                        <CardDescription className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {table.label}
                        </CardDescription>
                      )}
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 ml-3 flex-shrink-0">
                      {table.triggered ? 'Triggered' : 'Manual'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Model</span>
                      <span className="text-sm font-medium text-gray-900">{table.modelName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Table</span>
                      <span className="text-sm font-medium text-gray-900">{table.tableName || 'N/A'}</span>
                    </div>
                    {table.primaryKey && table.primaryKey.length > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Primary Key</span>
                        <span className="text-sm font-medium text-gray-900 truncate ml-2">
                          {table.primaryKey.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => handleViewTable(table)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => handleEditTable(table)}
                    >
                      <Edit className="h-4 w-4" />
                      Configure
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => table.configId && handleDeleteTable(table.configId)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full bg-gray-50 rounded-lg p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No tables found</h3>
              <p className="text-gray-500 mb-4">No tables match your current search criteria.</p>
              <Button onClick={() => { setSearchTerm(''); setSelectedStatus('all'); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {totalFilteredCount > 0 && (
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

      {/* View Table Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              View Table Details - {selectedTable?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedTable && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Table Name</Label>
                  <p className="text-lg font-semibold">{selectedTable.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Config ID</Label>
                  <p className="font-medium text-sm text-gray-600">{selectedTable.configId || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Table Name (DB)</Label>
                  <p className="font-medium">{selectedTable.tableName || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Triggered</Label>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {selectedTable.triggered ? 'Triggered' : 'Manual'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Model Name</Label>
                  <p className="font-medium">{selectedTable.modelName || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Parent Name</Label>
                  <p className="font-medium">{selectedTable.parentName || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Version</Label>
                  <p className="font-medium">{selectedTable.version || '1.0'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Type</Label>
                  <p className="font-medium">{selectedTable.isList ? 'List' : 'Single'}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Label</Label>
                <p className="mt-1">{selectedTable.label || 'N/A'}</p>
              </div>

              {/* Audit Information */}
              <div>
                <Label className="text-sm font-medium text-gray-500 mb-3 block">Audit Information</Label>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Created At</p>
                    <p className="font-medium">{selectedTable.createdAt || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Created By</p>
                    <p className="font-medium">{selectedTable.createdBy || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Modified</p>
                    <p className="font-medium">{selectedTable.lastModifiedAt || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Modified By</p>
                    <p className="font-medium">{selectedTable.lastModifiedBy || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Configuration Details */}
              <div>
                <Label className="text-sm font-medium text-gray-500 mb-3 block">Configuration Details</Label>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 grid grid-cols-3 gap-4 p-3 text-sm font-medium text-gray-700">
                    <div>Property</div>
                    <div>Value</div>
                    <div>Description</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 p-3 border-t text-sm">
                    <div className="font-medium">Primary Key</div>
                    <div className="text-gray-600">{selectedTable.primaryKey?.join(', ') || 'None'}</div>
                    <div className="text-gray-600">Primary key columns</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 p-3 border-t text-sm">
                    <div className="font-medium">Object Key</div>
                    <div className="text-gray-600">{selectedTable.objectKey || 'None'}</div>
                    <div className="text-gray-600">Object identifier key</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 p-3 border-t text-sm">
                    <div className="font-medium">Sequence Key</div>
                    <div className="text-gray-600">{selectedTable.sequenceKey || 'None'}</div>
                    <div className="text-gray-600">Sequence identifier key</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 p-3 border-t text-sm">
                    <div className="font-medium">Data Source</div>
                    <div className="text-gray-600">{selectedTable.dataSourceId || 'Default'}</div>
                    <div className="text-gray-600">Data source identifier</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 p-3 border-t text-sm">
                    <div className="font-medium">Tenant ID</div>
                    <div className="text-gray-600">{selectedTable.tenantId || 'None'}</div>
                    <div className="text-gray-600">Tenant identifier</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 p-3 border-t text-sm">
                    <div className="font-medium">Audit Column</div>
                    <div className="text-gray-600">{selectedTable.auditColumn || 'None'}</div>
                    <div className="text-gray-600">Column for audit tracking</div>
                  </div>
                  {selectedTable.ignoredColumns && selectedTable.ignoredColumns.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 p-3 border-t text-sm">
                      <div className="font-medium">Ignored Columns</div>
                      <div className="text-gray-600">{selectedTable.ignoredColumns.join(', ')}</div>
                      <div className="text-gray-600">Columns to ignore during processing</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Complex Configurations */}
              {(selectedTable.joinKeys && selectedTable.joinKeys.length > 0) && (
                <div>
                  <Label className="text-sm font-medium text-gray-500 mb-3 block">Join Conditions</Label>
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <p className="text-sm text-gray-600">{selectedTable.joinKeys.length} join condition(s) configured</p>
                  </div>
                </div>
              )}

              {(selectedTable.dependOn && selectedTable.dependOn.length > 0) && (
                <div>
                  <Label className="text-sm font-medium text-gray-500 mb-3 block">Dependencies</Label>
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <p className="text-sm text-gray-600">{selectedTable.dependOn.length} dependenc(y/ies) configured</p>
                  </div>
                </div>
              )}

              {(selectedTable.conditions && selectedTable.conditions.length > 0) && (
                <div>
                  <Label className="text-sm font-medium text-gray-500 mb-3 block">Conditions</Label>
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <p className="text-sm text-gray-600">{selectedTable.conditions.length} condition(s) configured</p>
                  </div>
                </div>
              )}

              {(selectedTable.jsonColumns && selectedTable.jsonColumns.length > 0) && (
                <div>
                  <Label className="text-sm font-medium text-gray-500 mb-3 block">JSON Columns</Label>
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <p className="text-sm text-gray-600">{selectedTable.jsonColumns.length} JSON column(s) configured</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Table Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Configure - {selectedTable?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedTable && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Table Name</Label>
                    <Input
                      id="edit-name"
                      value={editFormData.name || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      placeholder="Enter table name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-table-name">Table Name (System)</Label>
                    <Input
                      id="edit-table-name"
                      value={editFormData.tableName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, tableName: e.target.value })}
                      placeholder="Enter system table name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-model-name">Model Name</Label>
                    <Input
                      id="edit-model-name"
                      value={editFormData.modelName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, modelName: e.target.value })}
                      placeholder="Enter model name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-triggered">Triggered</Label>
                    <Select
                      value={editFormData.triggered ? 'true' : 'false'}
                      onValueChange={(value) => setEditFormData({ ...editFormData, triggered: value === 'true' })}
                    >
                      <SelectTrigger id="edit-triggered">
                        <SelectValue placeholder="Select trigger mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Triggered</SelectItem>
                        <SelectItem value="false">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="edit-label">Label</Label>
                    <Textarea
                      id="edit-label"
                      value={editFormData.label || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, label: e.target.value })}
                      placeholder="Enter table label"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Configuration Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-object-key">Object Key</Label>
                    <Input
                      id="edit-object-key"
                      value={editFormData.objectKey || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, objectKey: e.target.value })}
                      placeholder="Enter object key"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-sequence-key">Sequence Key</Label>
                    <Input
                      id="edit-sequence-key"
                      value={editFormData.sequenceKey || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, sequenceKey: e.target.value })}
                      placeholder="Enter sequence key"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-parent-name">Parent Name</Label>
                    <Input
                      id="edit-parent-name"
                      value={editFormData.parentName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, parentName: e.target.value })}
                      placeholder="Enter parent name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-data-source-id">Data Source ID</Label>
                    <Input
                      id="edit-data-source-id"
                      value={editFormData.dataSourceId || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, dataSourceId: e.target.value })}
                      placeholder="Enter data source ID"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-is-list" className="block mb-2">Is List</Label>
                    <Select
                      value={editFormData.isList ? 'true' : 'false'}
                      onValueChange={(value) => setEditFormData({ ...editFormData, isList: value === 'true' })}
                    >
                      <SelectTrigger id="edit-is-list">
                        <SelectValue placeholder="Select list type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">List</SelectItem>
                        <SelectItem value="false">Single</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>



                  <div>
                    <Label htmlFor="edit-tenant-id">Tenant ID</Label>
                    <Input
                      id="edit-tenant-id"
                      value={editFormData.tenantId || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, tenantId: e.target.value })}
                      placeholder="Enter tenant ID"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Collector Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-primary-key">Primary Key</Label>
                    <Input
                      id="edit-primary-key"
                      value={editFormData.primaryKey?.join(', ') || ''}
                      onChange={(e) => setEditFormData({ 
                        ...editFormData, 
                        primaryKey: e.target.value.split(',').map(k => k.trim()).filter(k => k) 
                      })}
                      placeholder="Enter primary keys (comma separated)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-object-key">Object Key</Label>
                    <Input
                      id="edit-object-key"
                      value={editFormData.objectKey || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, objectKey: e.target.value })}
                      placeholder="Enter object key"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-sequence-key">Sequence Key</Label>
                    <Input
                      id="edit-sequence-key"
                      value={editFormData.sequenceKey || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, sequenceKey: e.target.value })}
                      placeholder="Enter sequence key"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-parent-name">Parent Name</Label>
                    <Input
                      id="edit-parent-name"
                      value={editFormData.parentName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, parentName: e.target.value })}
                      placeholder="Enter parent name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-label">Label</Label>
                    <Input
                      id="edit-label"
                      value={editFormData.label || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, label: e.target.value })}
                      placeholder="Enter label"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-audit-column">Audit Column</Label>
                    <Input
                      id="edit-audit-column"
                      value={editFormData.auditColumn || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, auditColumn: e.target.value })}
                      placeholder="Enter audit column"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-ignored-columns">Ignored Columns</Label>
                    <Input
                      id="edit-ignored-columns"
                      value={editFormData.ignoredColumns?.join(', ') || ''}
                      onChange={(e) => setEditFormData({ 
                        ...editFormData, 
                        ignoredColumns: e.target.value.split(',').map(c => c.trim()).filter(c => c) 
                      })}
                      placeholder="Enter ignored columns (comma separated)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-data-source-id">Data Source ID</Label>
                    <Input
                      id="edit-data-source-id"
                      value={editFormData.dataSourceId || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, dataSourceId: e.target.value })}
                      placeholder="Enter data source ID"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-is-list" className="block mb-2">Is List</Label>
                    <Select
                      value={editFormData.isList ? 'true' : 'false'}
                      onValueChange={(value) => setEditFormData({ ...editFormData, isList: value === 'true' })}
                    >
                      <SelectTrigger id="edit-is-list">
                        <SelectValue placeholder="Select list status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="edit-triggered" className="block mb-2">Triggered</Label>
                    <Select
                      value={editFormData.triggered ? 'true' : 'false'}
                      onValueChange={(value) => setEditFormData({ ...editFormData, triggered: value === 'true' })}
                    >
                      <SelectTrigger id="edit-triggered">
                        <SelectValue placeholder="Select trigger status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* <div>
                <h3 className="text-lg font-medium mb-4">Audit Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-created-at">Created At</Label>
                    <Input
                      id="edit-created-at"
                      type="date"
                      value={editFormData.createdAt || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, createdAt: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-created-by">Created By</Label>
                    <Input
                      id="edit-created-by"
                      value={editFormData.createdBy || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, createdBy: e.target.value })}
                      placeholder="Enter creator name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-last-modified-at">Last Modified At</Label>
                    <Input
                      id="edit-last-modified-at"
                      type="date"
                      value={editFormData.lastModifiedAt || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, lastModifiedAt: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-last-modified-by">Last Modified By</Label>
                    <Input
                      id="edit-last-modified-by"
                      value={editFormData.lastModifiedBy || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, lastModifiedBy: e.target.value })}
                      placeholder="Enter modifier name"
                    />
                  </div>
                </div>
              </div> */}
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} tables
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create Table Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Table</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="table-name">Table Name *</Label>
                  <Input
                    id="table-name"
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter table name"
                    className={formErrors.name ? "border-red-500" : ""}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="table-model-name">Model Name *</Label>
                  <Input
                    id="table-model-name"
                    value={createFormData.modelName}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, modelName: e.target.value }))}
                    placeholder="Enter model name"
                    className={formErrors.modelName ? "border-red-500" : ""}
                  />
                  {formErrors.modelName && (
                    <p className="text-sm text-red-600">{formErrors.modelName}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="table-label">Label</Label>
                <Textarea
                  id="table-label"
                  value={createFormData.label}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Enter table label"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="table-triggered">Triggered</Label>
                  <Select 
                    value={createFormData.triggered ? 'true' : 'false'} 
                    onValueChange={(value) => setCreateFormData(prev => ({ ...prev, triggered: value === 'true' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Triggered</SelectItem>
                      <SelectItem value="false">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data-source-id">Data Source ID</Label>
                  <Input
                    id="data-source-id"
                    value={createFormData.dataSourceId}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, dataSourceId: e.target.value }))}
                    placeholder="Enter data source ID"
                  />
                </div>
              </div>
            </div>



            {/* Advanced Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Advanced Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tenant-id">Tenant ID</Label>
                  <Input
                    id="tenant-id"
                    value={createFormData.tenantId}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, tenantId: e.target.value }))}
                    placeholder="Enter tenant ID"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primary-key">Primary Key</Label>
                  <Input
                    id="primary-key"
                    value={createFormData.primaryKey?.join(', ') || ''}
                    onChange={(e) => setCreateFormData(prev => ({ 
                      ...prev, 
                      primaryKey: e.target.value.split(',').map(k => k.trim()).filter(k => k) 
                    }))}
                    placeholder="Enter primary keys (comma separated)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="object-key">Object Key</Label>
                  <Input
                    id="object-key"
                    value={createFormData.objectKey}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, objectKey: e.target.value }))}
                    placeholder="Enter object key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sequence-key">Sequence Key</Label>
                  <Input
                    id="sequence-key"
                    value={createFormData.sequenceKey}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, sequenceKey: e.target.value }))}
                    placeholder="Enter sequence key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent-name">Parent Name</Label>
                  <Input
                    id="parent-name"
                    value={createFormData.parentName}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, parentName: e.target.value }))}
                    placeholder="Enter parent name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    value={createFormData.label}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="Enter label"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audit-column">Audit Column</Label>
                  <Input
                    id="audit-column"
                    value={createFormData.auditColumn}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, auditColumn: e.target.value }))}
                    placeholder="Enter audit column"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ignored-columns">Ignored Columns</Label>
                  <Input
                    id="ignored-columns"
                    value={createFormData.ignoredColumns?.join(', ') || ''}
                    onChange={(e) => setCreateFormData(prev => ({ 
                      ...prev, 
                      ignoredColumns: e.target.value.split(',').map(c => c.trim()).filter(c => c) 
                    }))}
                    placeholder="Enter ignored columns (comma separated)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data-source-id">Data Source ID</Label>
                  <Input
                    id="data-source-id"
                    value={createFormData.dataSourceId}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, dataSourceId: e.target.value }))}
                    placeholder="Enter data source ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="is-list">Is List</Label>
                  <Select 
                    value={createFormData.isList ? 'true' : 'false'} 
                    onValueChange={(value) => setCreateFormData(prev => ({ ...prev, isList: value === 'true' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select list status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="triggered">Triggered</Label>
                  <Select 
                    value={createFormData.triggered ? 'true' : 'false'} 
                    onValueChange={(value) => setCreateFormData(prev => ({ ...prev, triggered: value === 'true' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setCreateDialogOpen(false);
                  resetCreateForm();
                }}
                disabled={createLoading}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleCreateTable}
                disabled={createLoading}
              >
                {createLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Table
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help section */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Need Help?</h3>
        <p className="text-gray-600 mb-4">
          Learn how to connect and configure tables for optimal data extraction.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            View Documentation
          </Button>
          <Button variant="secondary" size="sm" className="gap-2">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Tables;
