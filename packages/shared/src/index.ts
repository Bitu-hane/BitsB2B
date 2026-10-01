// Common domain types shared across BitsB2B Web frontend & NestJS backend

export enum UserRole {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
}

export enum StaffRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  VERIFICATION_OFFICER = 'VERIFICATION_OFFICER',
  LISTINGS_MODERATOR = 'LISTINGS_MODERATOR',
  ESCROW_OFFICER = 'ESCROW_OFFICER',
  DISPUTE_MEDIATOR = 'DISPUTE_MEDIATOR',
  ANALYST = 'ANALYST',
}

export enum BusinessSubRole {
  IMPORTER = 'importer',
  EXPORTER = 'exporter',
  PRODUCER = 'producer',
  WHOLESALER = 'wholesaler',
  DISTRIBUTOR = 'distributor',
  RESELLER = 'reseller',
  INSTITUTIONAL_BUYER = 'institutional_buyer',
}

export enum VerificationState {
  PENDING_REVIEW = 'PENDING_REVIEW',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  MORE_INFO_NEEDED = 'MORE_INFO_NEEDED',
  SUSPENDED = 'SUSPENDED',
  REVOKED = 'REVOKED',
}

export const ESCROW_RELEASE_THRESHOLD_ETB = 500000;

export interface PlatformMetrics {
  totalUsers: number;
  totalBusinesses: number;
  verifiedBusinesses: number;
  pendingVerifications: number;
  totalListings: number;
  pendingListings: number;
  totalOrders: number;
  activeEscrowAmount: number;
  releasedEscrowAmount: number;
  totalDisputes: number;
  openDisputes: number;
}

export interface UserProfile {
  id: string;
  phoneNumber: string;
  role: UserRole;
  companyName?: string;
  tradeLicenseNumber?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface ProductItem {
  id: string;
  title: string;
  category: string;
  pricePerUnit: number;
  minOrderQuantity: number;
  unit: string;
  sellerId: string;
  location: string;
  imageUrl?: string;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  totalPrice: number;
  status: 'PENDING' | 'ACCEPTED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
