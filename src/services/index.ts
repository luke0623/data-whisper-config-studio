// Export all services from a single entry point
// Only export the service instances, not the types (moved to models folder)
export { default as apiService } from './api';
export { default as configService } from './configService';
export { default as monitorService } from './monitorService';
export { default as discoveryService } from './discoveryService';

// Also export default instances for flexibility
import apiService from './api';
import configService from './configService';
import monitorService from './monitorService';

export default {
  api: apiService,
  config: configService,
  monitor: monitorService
};