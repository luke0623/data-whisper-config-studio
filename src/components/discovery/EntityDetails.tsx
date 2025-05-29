
import React from 'react';
import { DatabaseEntity, Column } from '@/models/discovery.models';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Database, Key, KeyRound, AlertCircle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EntityDetailsProps {
  entity: DatabaseEntity | null;
}

const EntityDetails: React.FC<EntityDetailsProps> = ({ entity }) => {
  if (!entity) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5 text-gray-500" />
            Entity Details
          </CardTitle>
          <CardDescription>
            Select an entity from the diagram to view its details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-400">
            <p>No entity selected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="h-6 w-6 text-blue-500" />
            <div>
              <CardTitle className="text-xl">{entity.name}</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                {entity.schema}.{entity.name}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 capitalize">
            {entity.type}
          </Badge>
        </div>
        {entity.description && (
          <p className="text-sm text-gray-600 mt-2">{entity.description}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div>
          <h4 className="text-lg font-semibold mb-4">Columns</h4>
          <div className="border rounded-lg overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">Name</TableHead>
                  <TableHead className="font-semibold text-gray-700">Type</TableHead>
                  <TableHead className="font-semibold text-gray-700">Attributes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entity.columns.map((column) => (
                  <TableRow key={column.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {column.isPrimaryKey && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Key className="h-4 w-4 text-amber-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Primary Key</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {column.isForeignKey && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <KeyRound className="h-4 w-4 text-blue-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Foreign Key</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <span>{column.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-700 font-mono text-sm">
                        {formatColumnType(column)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {column.isPrimaryKey && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs">
                            Primary Key
                          </Badge>
                        )}
                        {column.isForeignKey && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 text-xs">
                            Foreign Key
                          </Badge>
                        )}
                        {!column.isNullable && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs">
                            Not Null
                          </Badge>
                        )}
                        {column.defaultValue && (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300 text-xs">
                            Default: {column.defaultValue}
                          </Badge>
                        )}
                      </div>
                      {column.isForeignKey && column.referencedColumn && (
                        <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          References {column.referencedColumn.tableName}.{column.referencedColumn.columnName}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {entity.relationships && entity.relationships.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-3">Relationships</h4>
            <div className="space-y-2">
              {entity.relationships.map((rel) => (
                <div key={rel.id} className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{rel.name || 'Relationship'}</span>
                    <Badge variant="outline" className="capitalize">{rel.type}</Badge>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {rel.sourceEntityId === entity.id ? 'To' : 'From'}: {rel.sourceEntityId === entity.id ? rel.targetEntityId : rel.sourceEntityId}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to format column type display
const formatColumnType = (column: Column): string => {
  let typeStr = column.type.name;
  if (column.type.size) typeStr += `(${column.type.size})`;
  else if (column.type.precision && column.type.scale) {
    typeStr += `(${column.type.precision},${column.type.scale})`;
  }
  return typeStr;
};

export default EntityDetails;
