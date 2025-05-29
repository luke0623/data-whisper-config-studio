
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Database, Plus, Filter, Download, RefreshCw, HelpCircle, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
}

const Tables = () => {
  const [tables, setTables] = useState<TableDetailConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

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
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="default" size="sm">Configure</Button>
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
