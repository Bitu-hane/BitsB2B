/**
 * BitsB2B REST API Client Service
 * Centralized HTTP network layer for communicating with NestJS backend API.
 */

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:3000";

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
    staffRole?: string;
    staff_role?: string;
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
    return localStorage.getItem("bitsb2b_access_token");
  }

  /**
   * Helper: Store JWT tokens in localStorage
   */
  public storeTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem("bitsb2b_access_token", accessToken);
    localStorage.setItem("bitsb2b_refresh_token", refreshToken);
  }

  /**
   * Helper: Clear stored tokens on logout
   */
  public clearTokens() {
    localStorage.removeItem("bitsb2b_access_token");
    localStorage.removeItem("bitsb2b_refresh_token");
  }

  /**
   * Base HTTP request wrapper
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<{ data?: T; error?: ApiError }> {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    const token = this.getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
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
            message:
              json.message ||
              response.statusText ||
              "An error occurred during API request",
            error: json.error,
          },
        };
      }

      return { data: json as T };
    } catch (err: any) {
      return {
        error: {
          statusCode: 0,
          message: "Unable to connect to the backend database server.",
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
    const result = await this.request<AuthSessionResponse>(
      "/v1/auth/login/password",
      {
        method: "POST",
        body: JSON.stringify({ phone: phone.trim(), password }),
      },
    );

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
    const result = await this.request<AuthSessionResponse>(
      "/v1/auth/register",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

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
    return this.request<any>("/v1/auth/me", {
      method: "GET",
    });
  }

  /**
   * POST /v1/auth/logout
   * Revoke device session token
   */
  public async logout() {
    const result = await this.request<any>("/v1/auth/logout", {
      method: "POST",
    });
    this.clearTokens();
    return result;
  }

  // --- Payments & Escrow Endpoints ---

  /**
   * POST /v1/payments/initiate
   * Initiate Telebirr or CBE Birr payment and create escrow ledger hold
   */
  public async initiatePayment(payload: {
    orderId: string;
    provider: "telebirr" | "cbe_birr" | "bank_transfer" | "awash_birr";
    paymentMethod: string;
    amount: number;
    currency?: string;
    phoneNumber?: string;
    accountNumber?: string;
    idempotencyKey?: string;
  }) {
    return this.request<any>("/v1/payments/initiate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * GET /v1/payments/order/:orderId
   * Retrieve payment records and escrow audit entries for an order
   */
  public async getPaymentForOrder(orderId: string) {
    return this.request<any>(`/v1/payments/order/${orderId}`, {
      method: "GET",
    });
  }

  /**
   * GET /v1/payments/escrow/:orderId/status
   * Get current escrow status and milestones
   */
  public async getEscrowStatus(orderId: string) {
    return this.request<any>(`/v1/payments/escrow/${orderId}/status`, {
      method: "GET",
    });
  }

  /**
   * POST /v1/payments/escrow/:orderId/release
   * Release escrow funds to seller upon delivery verification
   */
  public async releaseEscrow(orderId: string, notes?: string) {
    return this.request<any>(`/v1/payments/escrow/${orderId}/release`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    });
  }

  /**
   * POST /v1/payments/escrow/:orderId/refund
   * Refund escrow funds back to buyer
   */
  public async refundEscrow(orderId: string, reason?: string) {
    return this.request<any>(`/v1/payments/escrow/${orderId}/refund`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }

  // --- Admin Console Endpoints ---

  public async getAdminMetrics() {
    return this.request<any>("/v1/admin/metrics", { method: "GET" });
  }

  public async getAdminUsers(subRole?: string, status?: string) {
    let query = '';
    const params = new URLSearchParams();
    if (subRole) params.append('subRole', subRole);
    if (status) params.append('status', status);
    if (params.toString()) query = `?${params.toString()}`;
    return this.request<any>(`/v1/admin/users${query}`, { method: 'GET' });
  }

  public async updateUserVerification(
    userId: string,
    action: 'APPROVE' | 'REJECT' | 'REQUEST_INFO',
    reason?: string,
  ) {
    return this.request<any>(`/v1/admin/users/${userId}/verification`, {
      method: 'PATCH',
      body: JSON.stringify({ action, reason }),
    });
  }

  public async handleUserVerification(
    userId: string,
    action: 'APPROVE' | 'REJECT' | 'REQUEST_INFO',
    reason?: string,
  ) {
    return this.updateUserVerification(userId, action, reason);
  }

  public async changeUserStatus(
    userId: string,
    status: string,
    reason: string,
    isFraudRelated?: boolean,
  ) {
    return this.request<any>(`/v1/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason, isFraudRelated }),
    });
  }

  public async getUserStatusHistory(userId: string) {
    return this.request<any>(`/v1/admin/users/${userId}/history`, { method: 'GET' });
  }

  public async getAdminListings(status?: string) {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.request<any>(`/v1/admin/listings${q}`, { method: 'GET' });
  }

  public async handleListingAction(
    listingId: string,
    action: 'APPROVE' | 'REJECT' | 'FLAG' | 'REQUEST_FIX' | 'BULK_REMOVE_SELLER',
    notes?: string,
  ) {
    return this.request<any>(`/v1/admin/listings/${listingId}/action`, {
      method: 'PATCH',
      body: JSON.stringify({ action, notes }),
    });
  }

  public async submitCategoryRequest(
    payloadOrName: string | { name: string; reason: string; icon?: string },
    reasonStr?: string,
    iconStr?: string,
  ) {
    const body = typeof payloadOrName === 'object'
      ? payloadOrName
      : { name: payloadOrName, reason: reasonStr || '', icon: iconStr };
    return this.request<any>('/v1/admin/categories/requests', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async getCategoryRequests() {
    return this.request<any>('/v1/admin/categories/requests', { method: 'GET' });
  }

  public async handleCategoryRequestAction(
    requestId: string,
    action: 'APPROVE' | 'REJECT',
    rejectionReason?: string,
  ) {
    return this.request<any>(
      `/v1/admin/categories/requests/${requestId}/action`,
      {
        method: 'PATCH',
        body: JSON.stringify({ action, rejectionReason }),
      },
    );
  }

  public async createSubcategory(payload: { parentId: string; name: string; icon?: string }) {
    return this.request<any>('/v1/catalog/categories/subcategories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async createTopLevelCategory(payload: { name: string; description?: string; icon?: string }) {
    return this.request<any>('/v1/catalog/categories/top-level', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async updateCategory(categoryId: string, payload: { name: string; description?: string; icon?: string }) {
    return this.request<any>(`/v1/catalog/categories/${categoryId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  public async deleteCategory(categoryId: string) {
    return this.request<any>(`/v1/catalog/categories/${categoryId}`, {
      method: 'DELETE',
    });
  }

  public async pinCategoryCoverImage(categoryId: string, coverImage: string | null) {
    return this.request<any>(`/v1/catalog/categories/${categoryId}/cover-image`, {
      method: 'PATCH',
      body: JSON.stringify({ coverImage }),
    });
  }

  public async getEscrowTransactions() {
    return this.request<any>('/v1/admin/escrow/transactions', { method: 'GET' });
  }

  public async getAdminEscrowTransactions() {
    return this.getEscrowTransactions();
  }

  public async handleEscrowOverride(
    orderId: string,
    action: 'RELEASE' | 'REFUND',
  ) {
    return this.request<any>(`/v1/admin/escrow/${orderId}/override`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }

  public async getDisputes() {
    return this.request<any>('/v1/admin/disputes', { method: 'GET' });
  }

  public async getAdminDisputes() {
    return this.getDisputes();
  }

  public async recommendDisputeResolution(
    disputeId: string,
    recommendation: 'REFUND' | 'RELEASE' | 'SPLIT',
    note: string,
  ) {
    return this.request<any>(`/v1/admin/disputes/${disputeId}/recommend`, {
      method: 'POST',
      body: JSON.stringify({ recommendation, note }),
    });
  }

  public async recommendDispute(
    disputeId: string,
    recommendation: 'REFUND' | 'RELEASE' | 'SPLIT',
    note: string,
  ) {
    return this.recommendDisputeResolution(disputeId, recommendation, note);
  }

  public async executeDisputePayout(
    disputeId: string,
    action: 'RESOLVED_REFUND' | 'RESOLVED_RELEASE',
    note: string,
  ) {
    return this.request<any>(`/v1/admin/disputes/${disputeId}/execute`, {
      method: 'POST',
      body: JSON.stringify({ action, note }),
    });
  }

  public async getAdminStaff() {
    return this.request<any>('/v1/admin/staff', { method: 'GET' });
  }

  public async createOrAssignStaff(payload: {
    fullName: string;
    phone: string;
    email: string;
    password?: string;
    staffRole: string;
  }) {
    return this.request<any>('/v1/admin/staff', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async revokeStaff(id: string) {
    return this.request<any>(`/v1/admin/staff/${id}`, { method: 'DELETE' });
  }

  public async getAuditLogs() {
    return this.request<any>('/v1/admin/audit-logs', { method: 'GET' });
  }

  public async getAdminAuditLogs() {
    return this.getAuditLogs();
  }

  // --- Catalog & Product Endpoints ---
  public async getCategories() {
    return this.request<any>('/v1/catalog/categories', { method: 'GET' });
  }

  public async getProducts(params?: { categoryId?: string; sellerBusinessId?: string; status?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.categoryId) query.set('categoryId', params.categoryId);
    if (params?.sellerBusinessId) query.set('sellerBusinessId', params.sellerBusinessId);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    const qStr = query.toString() ? `?${query.toString()}` : '';
    return this.request<any>(`/v1/catalog/products${qStr}`, { method: 'GET' });
  }

  public async createProduct(productData: any) {
    return this.request<any>('/v1/catalog/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  public async updateProduct(id: string, productData: any) {
    return this.request<any>(`/v1/catalog/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(productData),
    });
  }

  public async deleteProduct(id: string) {
    return this.request<any>(`/v1/catalog/products/${id}`, { method: 'DELETE' });
  }

  public async getSellerById(id: string) {
    return this.request<any>(`/v1/catalog/sellers/${id}`, { method: 'GET' });
  }
}

export const api = new ApiService();
export default api;
