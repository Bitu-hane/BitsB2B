/**
 * BitsB2B REST API Client Service
 * Centralized HTTP network layer for communicating with NestJS backend API.
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export interface RegisterPayload {
  fullName: string;
  phone: string;
  password: string;
  email?: string;
  businessName: string;
  businessTypeCode: string;
  canBuy?: boolean;
  canSell?: boolean;
  tinNumber?: string;
  tradeLicenseNumber?: string;
  region: string;
  city: string;
  subcity?: string;
  kebele?: string;
  landmark?: string;
}

export interface AuthSessionResponse {
  accessToken: string;
  refreshToken: string;
  sessionId?: string;
  expiresInSeconds?: number;
  user: {
    id: string;
    fullName?: string;
    full_name?: string;
    phone: string;
    email?: string;
  };
  business?: {
    id: string;
    name: string;
    businessTypeCode?: string;
    canBuy?: boolean;
    canSell?: boolean;
  };
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Helper: Retrieve stored JWT access token
   */
  private getAccessToken(): string | null {
    return localStorage.getItem('bitsb2b_access_token');
  }

  /**
   * Helper: Store JWT tokens in localStorage
   */
  public storeTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('bitsb2b_access_token', accessToken);
    localStorage.setItem('bitsb2b_refresh_token', refreshToken);
  }

  /**
   * Helper: Clear stored tokens on logout
   */
  public clearTokens() {
    localStorage.removeItem('bitsb2b_access_token');
    localStorage.removeItem('bitsb2b_refresh_token');
  }

  /**
   * Base HTTP request wrapper
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data?: T; error?: ApiError }> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    const token = this.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          error: {
            statusCode: response.status,
            message: json.message || response.statusText || 'An error occurred during API request',
            error: json.error,
          },
        };
      }

      return { data: json as T };
    } catch (err: any) {
      return {
        error: {
          statusCode: 0,
          message: 'Unable to connect to the backend database server.',
          error: err.message,
        },
      };
    }
  }

  // --- Auth Endpoints ---

  /**
   * POST /v1/auth/login/password
   * Authenticate user with phone & password credentials against PostgreSQL
   */
  public async loginWithPassword(phone: string, password: string) {
    const result = await this.request<AuthSessionResponse>('/v1/auth/login/password', {
      method: 'POST',
      body: JSON.stringify({ phone: phone.trim(), password }),
    });

    if (result.data?.accessToken && result.data?.refreshToken) {
      this.storeTokens(result.data.accessToken, result.data.refreshToken);
    }

    return result;
  }

  /**
   * POST /v1/auth/register
   * Create new user, credentials, business entity & location in PostgreSQL
   */
  public async registerUser(payload: RegisterPayload) {
    const result = await this.request<AuthSessionResponse>('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (result.data?.accessToken && result.data?.refreshToken) {
      this.storeTokens(result.data.accessToken, result.data.refreshToken);
    }

    return result;
  }

  /**
   * GET /v1/auth/me
   * Get current authenticated user identity profile
   */
  public async getProfile() {
    return this.request<any>('/v1/auth/me', {
      method: 'GET',
    });
  }

  /**
   * POST /v1/auth/logout
   * Revoke device session token
   */
  public async logout() {
    const result = await this.request<any>('/v1/auth/logout', {
      method: 'POST',
    });
    this.clearTokens();
    return result;
  }
}

export const api = new ApiService();
export default api;
