export type UserRole = 'importer' | 'producer' | 'wholesaler' | 'reseller' | 'institutional buyer';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export type VerificationStatus = 'verified' | 'pending' | 'unverified';

export type OrderStatus = 'placed' | 'confirmed' | 'shipped' | 'delivered';

export type EscrowPaymentStatus = 'pending' | 'held_escrow' | 'funds_released' | 'refunded';

export type PaymentMethod = 'telebirr' | 'cbe_birr';

export interface Business {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  region: string;
  city: string;
  subcity?: string;
  verificationStatus: VerificationStatus;
  licenseNumber?: string;
  tinNumber?: string;
  verifiedDate?: string;
  establishedYear: number;
  averageResponseTime: string;
  responseRate: string;
  rating: number;
  totalOrdersCompleted: number;
  logoUrl?: string;
  bannerUrl?: string;
  description: string;
}

export interface User {
  id: string;
  phone: string;
  name: string;
  business: Business;
  isSeller: boolean;
  avatar?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  image: string;
  itemCount: number;
}

export interface PriceTier {
  minQty: number;
  maxQty?: number;
  pricePerUnit: number;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  sellerId: string;
  sellerBusinessName: string;
  sellerVerified: boolean;
  sellerRegion: string;
  price: number;
  currency: string;
  priceTiers: PriceTier[];
  moq: number;
  unit: string;
  stockStatus: StockStatus;
  stockQuantity: number;
  stockLastUpdated: string;
  leadTime: string;
  deliveryZones: string[];
  images: string[];
  description: string;
  specifications: Record<string, string>;
  createdAt: string;
  featured?: boolean;
}

export interface DeliveryAddress {
  region: string;
  city: string;
  subcity: string;
  kebele: string;
  landmark: string;
  contactPerson: string;
  contactPhone: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  unit: string;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  buyerBusinessName: string;
  buyerPhone: string;
  sellerId: string;
  sellerBusinessName: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  escrowStatus: EscrowPaymentStatus;
  deliveryAddress: DeliveryAddress;
  createdAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  trackingNumber?: string;
  carrierName?: string;
  notes?: string;
}

export interface InquiryMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderBusiness: string;
  isSeller: boolean;
  text: string;
  timestamp: string;
}

export interface StructuredInquiry {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productMoq: number;
  productUnit: string;
  buyerId: string;
  buyerName: string;
  buyerBusinessName: string;
  buyerPhone: string;
  sellerId: string;
  sellerBusinessName: string;
  topic: 'quotation' | 'sample_request' | 'specifications' | 'delivery_time' | 'custom_bulk';
  targetQuantity?: number;
  targetPrice?: number;
  status: 'pending_reply' | 'answered' | 'closed';
  messages: InquiryMessage[];
  createdAt: string;
  lastActivityAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order_status' | 'new_inquiry' | 'inquiry_reply' | 'escrow_update' | 'system';
  relatedOrderId?: string;
  relatedInquiryId?: string;
  read: boolean;
  createdAt: string;
  timestamp?: string;
  smsDispatched?: boolean;
}

export interface SMSAlert {
  id: string;
  phone: string;
  message: string;
  timestamp: string;
}
