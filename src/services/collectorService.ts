import { API_BASE_URL, getDefaultHeaders, checkResponse } from '@/utils/apiConfig';

export interface TriggerEventRequest {
  startTime: string; // ISO datetime string
  endTime: string;   // ISO datetime string
  modelId: string;
}

class CollectorService {
  async triggerEventByModel(payload: TriggerEventRequest): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/collector/trigger/event/model`, {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify(payload),
    });
    return checkResponse(response);
  }
}

export const collectorService = new CollectorService();
export default collectorService;