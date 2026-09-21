import type { ApiError } from '@/types';
import { getAuthToken } from '@/lib/auth';

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
  auth?: boolean;
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal, auth = true } = opts;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : undefined;

  if (!response.ok) {
    const err: ApiError = isJson
      ? (payload as ApiError)
      : {
          status: response.status,
          code: 'HTTP_ERROR',
          message: response.statusText || 'Request failed',
        };
    throw err;
  }

  return payload as T;
}
