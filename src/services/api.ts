import axios, { AxiosError } from 'axios';

// The single API base URL configured via VITE_API_BASE_URL
export const API_BASE_URL: string = 
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT Token to every outgoing request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smart_neighbour_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle status codes (401, 403, 404, 500) and user-friendly error normalization
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; success?: boolean }>) => {
    let friendlyMessage = 'Unable to connect to community services. Please check your connection.';

    if (error.response) {
      const { status, data } = error.response;
      const serverMessage = data && typeof data === 'object' && data.message ? data.message : null;

      if (status === 401) {
        localStorage.removeItem('smart_neighbour_token');
        localStorage.removeItem('smart_neighbour_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
        friendlyMessage = serverMessage || 'Your session has expired. Please sign in again.';
      } else if (status === 403) {
        friendlyMessage = serverMessage || 'Access restricted. You do not have permission for this community action.';
      } else if (status === 404) {
        friendlyMessage = serverMessage || 'The requested community item or record was not found.';
      } else if (status >= 500) {
        friendlyMessage = 'Our community servers encountered a temporary issue. Please try again in a few moments.';
      } else if (serverMessage) {
        friendlyMessage = serverMessage;
      }
    } else if (error.code === 'ECONNABORTED') {
      friendlyMessage = 'Request timed out. Please verify your connection.';
    }

    const normalizedError = new Error(friendlyMessage);
    (normalizedError as any).originalError = error;
    (normalizedError as any).status = error.response?.status;
    return Promise.reject(normalizedError);
  }
);

/**
 * Health check to see if the Spring Boot API is online
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await apiClient.get('/items', { timeout: 2500 });
    return response.status >= 200 && response.status < 400;
  } catch (err: any) {
    if (err?.status && err.status >= 200 && err.status < 500) {
      return true;
    }
    return false;
  }
}
