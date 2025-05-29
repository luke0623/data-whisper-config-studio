
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, CheckCircle, XCircle, Clock, RefreshCw, AlertTriangle } from 'lucide-react';

const Monitor = () => {
  const [selectedModule, setSelectedModule] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for ingestion events
  const ingestionEvents = [
    {
      id: 1,
      module: 'Policy Management',
      model: 'Policy',
      table: 'policies',
      status: 'success',
      recordsProcessed: 1250,
      startTime: '2024-01-15 09:30:00',
      endTime: '2024-01-15 09:35:22',
      duration: '5m 22s',
      errors: 0,
      warnings: 2
    },
    {
      id: 2,
      module: 'Claims',
      model: 'Claim',
      table: 'claims_data',
      status: 'failed',
      recordsProcessed: 0,
      startTime: '2024-01-15 10:15:00',
      endTime: '2024-01-15 10:16:45',
      duration: '1m 45s',
      errors: 1,
      warnings: 0
    },
    {
      id: 3,
      module: 'Finance',
      model: 'Transaction',
      table: 'financial_records',
      status: 'running',
      recordsProcessed: 892,
      startTime: '2024-01-15 11:00:00',
      endTime: null,
      duration: '15m 30s',
      errors: 0,
      warnings: 5
    },
    {
      id: 4,
      module: 'Customer Management',
      model: 'Customer',
      table: 'customers',
      status: 'success',
      recordsProcessed: 567,
      startTime: '2024-01-15 08:45:00',
      endTime: '2024-01-15 08:48:15',
      duration: '3m 15s',
      errors: 0,
      warnings: 0
    },
    {
      id: 5,
      module: 'Reinsurance',
      model: 'Reinsurance Policy',
      table: 'reinsurance_data',
      status: 'warning',
      recordsProcessed: 234,
      startTime: '2024-01-15 07:30:00',
      endTime: '2024-01-15 07:33:45',
      duration: '3m 45s',
      errors: 0,
      warnings: 12
    }
  ];

  const modules = ['Policy Management', 'Claims', 'Finance', 'Customer Management', 'Reinsurance'];

  const filteredEvents = selectedModule === 'all' 
    ? ingestionEvents 
    : ingestionEvents.filter(event => event.module === selectedModule);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      running: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  // Calculate summary statistics
  const totalEvents = filteredEvents.length;
  const successfulEvents = filteredEvents.filter(e => e.status === 'success').length;
  const failedEvents = filteredEvents.filter(e => e.status === 'failed').length;
  const runningEvents = filteredEvents.filter(e => e.status === 'running').length;
  const warningEvents = filteredEvents.filter(e => e.status === 'warning').length;
  const successRate = totalEvents > 0 ? Math.round((successfulEvents / totalEvents) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Ingestion Monitor</h1>
            <p className="text-gray-600">Track data ingestion events across all modules</p>
          </div>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold">{totalEvents}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{successRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failedEvents}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Running</p>
                <p className="text-2xl font-bold text-blue-600">{runningEvents}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">{warningEvents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Events Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ingestion Events</CardTitle>
              <CardDescription>Monitor the status of data ingestion across all modules</CardDescription>
            </div>
            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules.map((module) => (
                  <SelectItem key={module} value={module}>
                    {module}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Errors</TableHead>
                <TableHead>Warnings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(event.status)}
                      {getStatusBadge(event.status)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{event.module}</TableCell>
                  <TableCell>{event.model}</TableCell>
                  <TableCell className="font-mono text-sm">{event.table}</TableCell>
                  <TableCell>{event.recordsProcessed.toLocaleString()}</TableCell>
                  <TableCell>{event.duration}</TableCell>
                  <TableCell>{event.startTime}</TableCell>
                  <TableCell>
                    {event.errors > 0 ? (
                      <span className="text-red-600 font-medium">{event.errors}</span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {event.warnings > 0 ? (
                      <span className="text-yellow-600 font-medium">{event.warnings}</span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Monitor;
