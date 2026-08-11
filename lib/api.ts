import config from './config';

type NextFetchOptions = RequestInit & {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

export const apiClient = {
  baseUrl: config.apiBaseUrl,
  
  async request(endpoint: string, options: NextFetchOptions = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const customHeaders = (options.headers as Record<string, string>) || {};
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    const defaultOptions: RequestInit = {
      headers,
    };
    
    return fetch(url, { ...defaultOptions, ...options });
  },
  
  // Convenience methods
  get: (endpoint: string, options?: NextFetchOptions) => 
    apiClient.request(endpoint, { ...options, method: 'GET' }),
    
  post: (endpoint: string, data?: any, options?: NextFetchOptions) =>
    apiClient.request(endpoint, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
    }),
    
  put: (endpoint: string, data?: any, options?: NextFetchOptions) =>
    apiClient.request(endpoint, {
      ...options,
      method: 'PUT',
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
    }),
    
  patch: (endpoint: string, data?: any, options?: NextFetchOptions) =>
    apiClient.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
    }),
    
  delete: (endpoint: string, options?: NextFetchOptions) =>
    apiClient.request(endpoint, { ...options, method: 'DELETE' }),
};

export default apiClient;
