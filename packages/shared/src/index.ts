// Common domain types shared across BitsB2B Web frontend & NestJS backend

export enum UserRole {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
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
