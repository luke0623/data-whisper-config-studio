
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Database, Plus, Filter, Download, RefreshCw, HelpCircle, Info, Eye, Edit, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// This interface is specifically for the detailed table configuration shown on this page
// It's different from the TableConfig in models/config.models.ts
interface TableDetailConfig {
  id: string;
  name: string;
  description: string;
  schema: string;
  status: 'active' | 'inactive' | 'pending';
  lastUpdated: string;
  recordCount: number;
  fields: {
    name: string;
    type: string;
    description: string;
    isPrimaryKey: boolean;
  }[];
  // 新增字段
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

const Tables = () => {
  const [tables, setTables] = useState<TableDetailConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [selectedTable, setSelectedTable] = useState<TableDetailConfig | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<TableDetailConfig>>({});

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        // This would be replaced with an actual API call
        const mockTables: TableDetailConfig[] = [
          {
            id: '1',
            name: 'Customers',
            description: 'Customer master data including contact information',
            schema: 'public',
            status: 'active',
            lastUpdated: '2023-06-15',
            recordCount: 15420,
            fields: [
              { name: 'customer_id', type: 'uuid', description: 'Unique identifier', isPrimaryKey: true },
              { name: 'name', type: 'varchar(100)', description: 'Customer name', isPrimaryKey: false },
              { name: 'email', type: 'varchar(255)', description: 'Email address', isPrimaryKey: false },
              { name: 'created_at', type: 'timestamp', description: 'Creation date', isPrimaryKey: false },
            ],
            table_trigger_id: 'trig_cust_001',
            table_name: 'customers',
            data_count: 15420,
            model_name: 'Customer Model',
            is_extracted: true,
            model_trigger_id: 'mod_trig_001',
            event_trigger_id: 'evt_trig_001',
            tenant_id: 'tenant_001',
            created_at: '2023-01-15',
            created_by: 'admin',
            last_modified_at: '2023-06-15',
            last_modified_by: 'system',
            module_trigger_id: 'mod_001'
          },
          {
            id: '2',
            name: 'Orders',
            description: 'Order transactions with customer references',
            schema: 'sales',
            status: 'active',
            lastUpdated: '2023-06-18',
            recordCount: 32150,
            fields: [
              { name: 'order_id', type: 'uuid', description: 'Unique identifier', isPrimaryKey: true },
              { name: 'customer_id', type: 'uuid', description: 'Reference to customer', isPrimaryKey: false },
              { name: 'amount', type: 'decimal(10,2)', description: 'Order amount', isPrimaryKey: false },
              { name: 'status', type: 'varchar(20)', description: 'Order status', isPrimaryKey: false },
              { name: 'created_at', type: 'timestamp', description: 'Creation date', isPrimaryKey: false },
            ],
            table_trigger_id: 'trig_ord_001',
            table_name: 'orders',
            data_count: 32150,
            model_name: 'Order Model',
            is_extracted: true,
            model_trigger_id: 'mod_trig_002',
            event_trigger_id: 'evt_trig_002',
            tenant_id: 'tenant_001',
            created_at: '2023-02-10',
            created_by: 'admin',
            last_modified_at: '2023-06-18',
            last_modified_by: 'system',
            module_trigger_id: 'mod_002'
          },
          {
            id: '3',
            name: 'Products',
            description: 'Product catalog with pricing information',
            schema: 'inventory',
            status: 'inactive',
            lastUpdated: '2023-05-30',
            recordCount: 8745,
            fields: [
              { name: 'product_id', type: 'uuid', description: 'Unique identifier', isPrimaryKey: true },
              { name: 'name', type: 'varchar(100)', description: 'Product name', isPrimaryKey: false },
              { name: 'price', type: 'decimal(10,2)', description: 'Product price', isPrimaryKey: false },
              { name: 'category', type: 'varchar(50)', description: 'Product category', isPrimaryKey: false },
              { name: 'created_at', type: 'timestamp', description: 'Creation date', isPrimaryKey: false },
            ],
          },
          {
            id: '4',
            name: 'Suppliers',
            description: 'Supplier information and contact details',
            schema: 'inventory',
            status: 'pending',
            lastUpdated: '2023-06-10',
            recordCount: 320,
            fields: [
              { name: 'supplier_id', type: 'uuid', description: 'Unique identifier', isPrimaryKey: true },
              { name: 'name', type: 'varchar(100)', description: 'Supplier name', isPrimaryKey: false },
              { name: 'contact_email', type: 'varchar(255)', description: 'Contact email', isPrimaryKey: false },
              { name: 'country', type: 'varchar(50)', description: 'Country', isPrimaryKey: false },
              { name: 'created_at', type: 'timestamp', description: 'Creation date', isPrimaryKey: false },
            ],
          },
        ];

        setTimeout(() => {
          setTables(mockTables);
          setLoading(false);
        }, 800); // Simulate network delay
      } catch (error) {
        console.error('Error fetching tables:', error);
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  // Filter tables based on search term and status
  const filteredTables = tables.filter((table) => {
    const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         table.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || table.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

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

  const handleViewTable = (table: TableDetailConfig) => {
    setSelectedTable(table);
    setViewDialogOpen(true);
  };

  const handleEditTable = (table: TableDetailConfig) => {
    setSelectedTable(table);
    setEditFormData({
      name: table.name,
      description: table.description,
      schema: table.schema,
      status: table.status,
      table_trigger_id: table.table_trigger_id || '',
      table_name: table.table_name || '',
      data_count: table.data_count || 0,
      model_name: table.model_name || '',
      is_extracted: table.is_extracted || false,
      model_trigger_id: table.model_trigger_id || '',
      event_trigger_id: table.event_trigger_id || '',
      tenant_id: table.tenant_id || '',
      created_at: table.created_at || '',
      created_by: table.created_by || '',
      last_modified_at: table.last_modified_at || '',
      last_modified_by: table.last_modified_by || '',
      module_trigger_id: table.module_trigger_id || ''
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedTable && editFormData) {
      const updatedTables = tables.map(table => 
        table.id === selectedTable.id 
          ? { ...table, ...editFormData, lastUpdated: new Date().toISOString().split('T')[0] }
          : table
      );
      setTables(updatedTables);
      setEditDialogOpen(false);
      setSelectedTable(null);
      setEditFormData({});
    }
  };

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
        <Button className="gap-2 self-start md:self-auto">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border border-gray-200 shadow-sm rounded-xl overflow-hidden">
              <div className="p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTables.length > 0 ? (
            filteredTables.map((table) => (
              <Card key={table.id} className="border border-gray-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{table.name}</CardTitle>
                      <CardDescription className="mt-1">{table.description}</CardDescription>
                    </div>
                    <Badge variant="secondary" className={`capitalize ${table.status === 'active' ? 'bg-green-100 text-green-800' : table.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {table.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-500">Schema</p>
                      <p className="font-medium">{table.schema}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Records</p>
                      <p className="font-medium">{table.recordCount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Last Updated</p>
                      <p className="font-medium">{table.lastUpdated}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fields</p>
                      <p className="font-medium">{table.fields.length}</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
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
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-2 bg-gray-50 rounded-lg p-8 text-center">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Table Name</Label>
                  <p className="text-lg font-semibold">{selectedTable.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge variant="secondary" className={`capitalize ${selectedTable.status === 'active' ? 'bg-green-100 text-green-800' : selectedTable.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {selectedTable.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Schema</Label>
                  <p className="font-medium">{selectedTable.schema}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Record Count</Label>
                  <p className="font-medium">{selectedTable.recordCount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
                  <p className="font-medium">{selectedTable.lastUpdated}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Total Fields</Label>
                  <p className="font-medium">{selectedTable.fields.length}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Description</Label>
                <p className="mt-1">{selectedTable.description}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500 mb-3 block">Table Fields</Label>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 grid grid-cols-4 gap-4 p-3 text-sm font-medium text-gray-700">
                    <div>Field Name</div>
                    <div>Data Type</div>
                    <div>Description</div>
                    <div>Primary Key</div>
                  </div>
                  {selectedTable.fields.map((field, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4 p-3 border-t text-sm">
                      <div className="font-medium">{field.name}</div>
                      <div className="text-gray-600">{field.type}</div>
                      <div className="text-gray-600">{field.description}</div>
                      <div>
                        {field.isPrimaryKey && (
                          <Badge variant="outline" className="text-xs">PK</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                      value={editFormData.table_name || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, table_name: e.target.value })}
                      placeholder="Enter system table name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-schema">Schema</Label>
                    <Input
                      id="edit-schema"
                      value={editFormData.schema || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, schema: e.target.value })}
                      placeholder="Enter schema name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={editFormData.status || ''}
                      onValueChange={(value) => setEditFormData({ ...editFormData, status: value as 'active' | 'inactive' | 'pending' })}
                    >
                      <SelectTrigger id="edit-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={editFormData.description || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      placeholder="Enter table description"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Trigger & Model Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-table-trigger-id">Table Trigger ID</Label>
                    <Input
                      id="edit-table-trigger-id"
                      value={editFormData.table_trigger_id || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, table_trigger_id: e.target.value })}
                      placeholder="Enter table trigger ID"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-model-trigger-id">Model Trigger ID</Label>
                    <Input
                      id="edit-model-trigger-id"
                      value={editFormData.model_trigger_id || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, model_trigger_id: e.target.value })}
                      placeholder="Enter model trigger ID"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-event-trigger-id">Event Trigger ID</Label>
                    <Input
                      id="edit-event-trigger-id"
                      value={editFormData.event_trigger_id || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, event_trigger_id: e.target.value })}
                      placeholder="Enter event trigger ID"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-module-trigger-id">Module Trigger ID</Label>
                    <Input
                      id="edit-module-trigger-id"
                      value={editFormData.module_trigger_id || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, module_trigger_id: e.target.value })}
                      placeholder="Enter module trigger ID"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-model-name">Model Name</Label>
                    <Input
                      id="edit-model-name"
                      value={editFormData.model_name || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, model_name: e.target.value })}
                      placeholder="Enter model name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-is-extracted" className="block mb-2">Is Extracted</Label>
                    <Select
                      value={editFormData.is_extracted ? 'true' : 'false'}
                      onValueChange={(value) => setEditFormData({ ...editFormData, is_extracted: value === 'true' })}
                    >
                      <SelectTrigger id="edit-is-extracted">
                        <SelectValue placeholder="Select extraction status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="edit-data-count">Data Count</Label>
                    <Input
                      id="edit-data-count"
                      type="number"
                      value={editFormData.data_count?.toString() || '0'}
                      onChange={(e) => setEditFormData({ ...editFormData, data_count: parseInt(e.target.value) || 0 })}
                      placeholder="Enter data count"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-tenant-id">Tenant ID</Label>
                    <Input
                      id="edit-tenant-id"
                      value={editFormData.tenant_id || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, tenant_id: e.target.value })}
                      placeholder="Enter tenant ID"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Audit Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-created-at">Created At</Label>
                    <Input
                      id="edit-created-at"
                      type="date"
                      value={editFormData.created_at || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, created_at: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-created-by">Created By</Label>
                    <Input
                      id="edit-created-by"
                      value={editFormData.created_by || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, created_by: e.target.value })}
                      placeholder="Enter creator name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-last-modified-at">Last Modified At</Label>
                    <Input
                      id="edit-last-modified-at"
                      type="date"
                      value={editFormData.last_modified_at || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, last_modified_at: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-last-modified-by">Last Modified By</Label>
                    <Input
                      id="edit-last-modified-by"
                      value={editFormData.last_modified_by || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, last_modified_by: e.target.value })}
                      placeholder="Enter modifier name"
                    />
                  </div>
                </div>
              </div>
              
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
