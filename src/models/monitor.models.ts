// Monitoring data models

export interface IngestionEvent {
  id: number;
  module: string;
  model: string;
  table: string;
  status: 'success' | 'failed' | 'running' | 'warning';
  recordsProcessed: number;
  startTime: string;
  endTime: string | null;
  duration: string;
  errors: number;
  warnings: number;
}

export interface MonitoringSummary {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  runningEvents: number;
  warningEvents: number;
  successRate: number;
}