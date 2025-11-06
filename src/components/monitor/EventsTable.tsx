import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PaginatedEventsResponse, EventTriggerItem } from '@/models/monitor.models';

interface EventsTableProps {
  eventsPage: PaginatedEventsResponse | null;
  selectedEvent: EventTriggerItem | null;
  onSelectEvent: (evt: EventTriggerItem) => void;
  typeLabelMap?: Record<number, string>;
}

const EventsTable: React.FC<EventsTableProps> = ({ eventsPage, selectedEvent, onSelectEvent, typeLabelMap }) => {
  const rows = useMemo(() => eventsPage?.data ?? [], [eventsPage]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Event ID</TableHead>
          <TableHead>Table</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Start</TableHead>
          <TableHead>End</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((evt) => (
          <TableRow
            key={evt.eventTriggerId}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') onSelectEvent(evt); }}
            className={(selectedEvent?.eventTriggerId === evt.eventTriggerId ? 'bg-blue-50 ' : '') + 'hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300'}
          >
            <TableCell className="font-mono text-sm">{evt.eventTriggerId}</TableCell>
            <TableCell className="font-mono text-sm">{evt.tableName}</TableCell>
            <TableCell>
              <Badge className={evt.isFinished ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                {evt.isFinished ? 'Finished' : 'Running'} (#{evt.status})
              </Badge>
            </TableCell>
            <TableCell>
              {typeLabelMap?.[evt.type] ? (
                <span className="text-sm">{typeLabelMap[evt.type]} <span className="text-xs text-gray-500">(#{evt.type})</span></span>
              ) : (
                <span className="text-sm">#{evt.type}</span>
              )}
            </TableCell>
            <TableCell>{evt.startTime ?? '-'}</TableCell>
            <TableCell>{evt.endTime ?? '-'}</TableCell>
            <TableCell>{evt.createdAt}</TableCell>
            <TableCell>
              <Button variant="outline" size="sm" onClick={() => onSelectEvent(evt)}>View Details</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

EventsTable.propTypes = ({
  eventsPage: PropTypes.shape({
    pageNumber: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        eventTriggerId: PropTypes.number.isRequired,
        startTime: PropTypes.string,
        endTime: PropTypes.string,
        isFinished: PropTypes.bool,
        status: PropTypes.number,
        type: PropTypes.number,
        tableName: PropTypes.string,
        records: PropTypes.array,
        pipelineId: PropTypes.number,
        params: PropTypes.any,
        createdAt: PropTypes.string.isRequired,
        createdBy: PropTypes.string,
        lastModifiedAt: PropTypes.string,
        lastModifiedBy: PropTypes.string,
        tenantId: PropTypes.string,
      })
    ).isRequired,
    total: PropTypes.number,
    totalPages: PropTypes.number,
  }),
  selectedEvent: PropTypes.shape({
    eventTriggerId: PropTypes.number.isRequired,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    isFinished: PropTypes.bool,
    status: PropTypes.number,
    type: PropTypes.number,
    tableName: PropTypes.string,
    records: PropTypes.array,
    pipelineId: PropTypes.number,
    params: PropTypes.any,
    createdAt: PropTypes.string.isRequired,
    createdBy: PropTypes.string,
    lastModifiedAt: PropTypes.string,
    lastModifiedBy: PropTypes.string,
    tenantId: PropTypes.string,
  }),
  typeLabelMap: PropTypes.objectOf(PropTypes.string),
  onSelectEvent: PropTypes.func.isRequired,
}) as unknown as React.WeakValidationMap<EventsTableProps>;

export default React.memo(EventsTable);