/**
 * Utility for logging API requests and responses
 * This will be used to track API requests and display them in the debug widget
 */

export interface ApiRequestLog {
  status: 'SUCCESS' | 'FAILED';
  timestamp: string;
  endpoint?: string;
  method?: string;
  responseTime?: number;
}

/**
 * Log an API request and dispatch a custom event
 * @param log The API request log details
 */
export function logApiRequest(log: ApiRequestLog): void {
  // Create a custom event with the log data
  const event = new CustomEvent('api-request-log', {
    detail: {
      ...log,
      timestamp: log.timestamp || new Date().toISOString()
    }
  });

  // Dispatch the event
  window.dispatchEvent(event);

  // Also log to console for debugging
  console.log('API Request Logged:', log);
}

/**
 * Log a successful API request
 * @param endpoint Optional endpoint information
 * @param method Optional HTTP method
 * @param responseTime Optional response time in ms
 */
export function logApiSuccess(endpoint?: string, method?: string, responseTime?: number): void {
  logApiRequest({
    status: 'SUCCESS',
    timestamp: new Date().toISOString(),
    endpoint,
    method,
    responseTime
  });
}

/**
 * Log a failed API request
 * @param endpoint Optional endpoint information
 * @param method Optional HTTP method
 * @param responseTime Optional response time in ms
 */
export function logApiFailure(endpoint?: string, method?: string, responseTime?: number): void {
  logApiRequest({
    status: 'FAILED',
    timestamp: new Date().toISOString(),
    endpoint,
    method,
    responseTime
  });
}