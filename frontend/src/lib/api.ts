/**
 * API client for communicating with the NestJS backend.
 *
 * Design decision: Thin wrapper around fetch() instead of axios.
 * - No extra dependency
 * - Native browser API
 * - Credentials: 'include' sends HTTP-only cookies automatically
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

class ApiClient {
  private baseUrl: string;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async tryRefreshToken(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const res = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        return res.ok;
      } catch {
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      credentials: 'include', // Send cookies with every request
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    // If unauthorized and this isn't already a retry or an auth endpoint, attempt token refresh
    if (response.status === 401 && !isRetry && !endpoint.startsWith('/auth/')) {
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        return this.request<T>(endpoint, options, true);
      }
    }

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        statusCode: response.status,
        message: response.statusText,
        error: 'Request failed',
      }));

      throw new ApiRequestError(
        Array.isArray(error.message) ? error.message[0] : error.message,
        error.statusCode,
      );
    }

    // Handle empty responses (204 No Content, etc.)
    const text = await response.text();
    if (!text) return {} as T;
    return JSON.parse(text);
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Upload a file with multipart/form-data.
   * Don't set Content-Type — browser sets it with boundary.
   */
  async upload<T>(endpoint: string, formData: FormData, isRetry = false): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (response.status === 401 && !isRetry && !endpoint.startsWith('/auth/')) {
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        return this.upload<T>(endpoint, formData, true);
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
        statusCode: response.status,
      }));
      throw new ApiRequestError(
        Array.isArray(error.message) ? error.message[0] : error.message,
        error.statusCode,
      );
    }

    return response.json();
  }

  /**
   * Convenience method to upload a single File object.
   */
  async uploadFile<T>(endpoint: string, file: File, paramName = 'file'): Promise<T> {
    const formData = new FormData();
    formData.append(paramName, file);
    return this.upload<T>(endpoint, formData);
  }

  /**
   * Convenience method to upload multiple File objects.
   */
  async uploadFiles<T>(endpoint: string, files: File[]): Promise<T> {
    const formData = new FormData();
    files.forEach((file) => {
      const filename = (file as any).webkitRelativePath || file.name;
      formData.append('files', file, filename);
    });
    return this.upload<T>(endpoint, formData);
  }
}

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

// Singleton API client instance
export const api = new ApiClient(API_BASE);
