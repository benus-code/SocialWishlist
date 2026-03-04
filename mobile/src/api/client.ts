import {getToken} from '../utils/storage';

// Change this to your deployed backend URL
const BASE_URL = 'https://socialwishlist-api.onrender.com';

type RequestOptions = {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  auth?: boolean;
};

class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, data: any) {
    super(data?.detail || `Request failed with status ${status}`);
    this.status = status;
    this.data = data;
  }
}

async function request<T = any>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const {method = 'GET', body, headers = {}, auth = true} = options;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (auth) {
    const token = await getToken();
    if (token) {
      finalHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    method,
    headers: finalHeaders,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    let data;
    try {
      data = await response.json();
    } catch {
      data = {detail: response.statusText};
    }
    throw new ApiError(response.status, data);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  get: <T = any>(endpoint: string, auth = true) =>
    request<T>(endpoint, {auth}),

  post: <T = any>(endpoint: string, body?: any, auth = true) =>
    request<T>(endpoint, {method: 'POST', body, auth}),

  put: <T = any>(endpoint: string, body?: any, auth = true) =>
    request<T>(endpoint, {method: 'PUT', body, auth}),

  delete: <T = any>(endpoint: string, auth = true) =>
    request<T>(endpoint, {method: 'DELETE', auth}),
};

export {ApiError, BASE_URL};
