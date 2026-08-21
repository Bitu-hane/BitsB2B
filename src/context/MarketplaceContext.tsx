import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Product,
  ProductCategory,
  User,
  Business,
  Order,
  StructuredInquiry,
  NotificationItem,
  SMSAlert,
  OrderStatus,
  StockStatus,
  UserRole,
  PaymentMethod,
  DeliveryAddress,
} from '../types';
import {
  CATEGORIES,
  INITIAL_PRODUCTS,
  MOCK_USERS,
  INITIAL_ORDERS,
  INITIAL_INQUIRIES,
  INITIAL_NOTIFICATIONS,
  MOCK_BUSINESSES,
} from '../data/mockData';
import enTranslations from '../i18n/en.json';
import amTranslations from '../i18n/am.json';
import { api } from '../services/api';

const translationsMap: Record<string, any> = {
  en: enTranslations,
  am: amTranslations,
};

interface MarketplaceContextType {
  // i18n & Language Preference
  language: 'en' | 'am';
  setLanguage: (lang: 'en' | 'am') => void;
  authView: 'login' | 'signup' | 'marketplace';
  setAuthView: (view: 'login' | 'signup' | 'marketplace') => void;
  t: (key: string, params?: Record<string, string | number>) => string;

  // Auth & Session
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  loginWithPhoneOtp: (phone: string, businessName: string, role: UserRole, isSeller?: boolean) => User;
  loginWithApi: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerWithApi: (formData: any) => Promise<{ success: boolean; error?: string }>;
  switchUser: (userId: string | 'visitor') => void;
  logout: () => void;
  allUsers: User[];

  // Catalog & Navigation
  categories: ProductCategory[];
  products: Product[];
  selectedCategory: string; // 'all' or categoryId
  setSelectedCategory: (catId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStock: string;
  setFilterStock: (status: string) => void;
  filterVerifiedOnly: boolean;
  setFilterVerifiedOnly: (val: boolean) => void;
  sortBy: 'featured' | 'price_low' | 'price_high' | 'moq_low' | 'newest';
  setSortBy: (val: 'featured' | 'price_low' | 'price_high' | 'moq_low' | 'newest') => void;

  // Modals & Navigation Active State
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  selectedSeller: Business | null;
  setSelectedSeller: (biz: Business | null) => void;
  viewingView: 'home' | 'catalog' | 'orders' | 'seller_dashboard' | 'inquiries';
  setViewingView: (view: 'home' | 'catalog' | 'orders' | 'seller_dashboard' | 'inquiries') => void;

  // Active Modals
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  inquiryModalOpen: boolean;
  setInquiryModalOpen: (open: boolean) => void;
  inquiryTargetProduct: Product | null;
  setInquiryTargetProduct: (p: Product | null) => void;
  orderModalOpen: boolean;
  setOrderModalOpen: (open: boolean) => void;
  orderTargetProduct: Product | null;
  setOrderTargetProduct: (p: Product | null) => void;
  prefilledOrderData: Order | null;
  setPrefilledOrderData: (order: Order | null) => void;
  paymentModalOpen: boolean;
  setPaymentModalOpen: (open: boolean) => void;
  pendingPaymentOrder: Order | null;
  setPendingPaymentOrder: (order: Order | null) => void;
  notificationDrawerOpen: boolean;
  setNotificationDrawerOpen: (open: boolean) => void;
  productEditModalOpen: boolean;
  setProductEditModalOpen: (open: boolean) => void;
  editingProduct: Product | null;
  setEditingProduct: (p: Product | null) => void;

  // Actions
  // Product Management (Seller UC15)
  addProduct: (productData: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, productData: Partial<Product>) => void;
  toggleProductStock: (productId: string, newStatus: StockStatus) => void;
  deleteProduct: (id: string) => void;

  // Inquiries (UC8)
  inquiries: StructuredInquiry[];
  createInquiry: (
    product: Product,
    topic: 'quotation' | 'sample_request' | 'specifications' | 'delivery_time' | 'custom_bulk',
    firstMessage: string,
    targetQuantity?: number,
    targetPrice?: number
  ) => StructuredInquiry;
  replyToInquiry: (inquiryId: string, replyText: string) => void;

  // Orders (UC9 - UC14)
  orders: Order[];
  createOrder: (
    product: Product,
    quantity: number,
    deliveryAddress: DeliveryAddress,
    paymentMethod: PaymentMethod,
    notes?: string
  ) => Order;
  completePaymentEscrow: (orderId: string, paymentMethod: PaymentMethod) => void;
  advanceOrderStatus: (orderId: string, newStatus: OrderStatus, trackingNumber?: string, carrier?: string) => void;
  confirmDeliveryAndReleaseEscrow: (orderId: string) => void;
  reorderPastOrder: (order: Order) => void;

  // Notifications (UC16)
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  activeSMS: SMSAlert | null;
  dismissSMS: () => void;

  // Helper
  resetToDefaults: () => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'bitsb2b_products_v2',
  ORDERS: 'bitsb2b_orders_v2',
  INQUIRIES: 'bitsb2b_inquiries_v2',
  NOTIFICATIONS: 'bitsb2b_notifs_v2',
  USER: 'bitsb2b_current_user_v2',
  USERS_LIST: 'bitsb2b_users_list_v2',
};

export const MarketplaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // i18n Language & Auth Navigation state
  const [language, setLanguageState] = useState<'en' | 'am'>(() => {
    const saved = localStorage.getItem('bitsb2b_language_v2');
    return saved === 'am' || saved === 'en' ? saved : 'en';
  });

  const setLanguage = (lang: 'en' | 'am') => {
    setLanguageState(lang);
    localStorage.setItem('bitsb2b_language_v2', lang);
  };

  const [authView, setAuthView] = useState<'login' | 'signup' | 'marketplace'>('login');

  const t = (key: string, params?: Record<string, string | number>): string => {
    const currentDict = translationsMap[language] || translationsMap['en'];
    const parts = key.split('.');
    let val: any = currentDict;
    for (const p of parts) {
      if (val && typeof val === 'object' && p in val) {
        val = val[p];
      } else {
        val = key;
        break;
      }
    }
    if (typeof val === 'string' && params) {
      Object.keys(params).forEach(p => {
        val = (val as string).replace(new RegExp(`{{${p}}}`, 'g'), String(params[p]));
      });
    }
    return typeof val === 'string' ? val : key;
  };

  // Load initial states from localStorage if available
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return MOCK_USERS[0];
      }
    }
    return null; // Start with Login page when no saved user
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return MOCK_USERS;
      }
    }
    return MOCK_USERS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_ORDERS;
      }
    }
    return INITIAL_ORDERS;
  });

  const [inquiries, setInquiries] = useState<StructuredInquiry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_INQUIRIES;
      }
    }
    return INITIAL_INQUIRIES;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_NOTIFICATIONS;
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  // UI Filter and Navigation States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStock, setFilterStock] = useState<string>('all');
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'moq_low' | 'newest'>('featured');

  const [viewingView, setViewingView] = useState<'home' | 'catalog' | 'orders' | 'seller_dashboard' | 'inquiries'>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<Business | null>(null);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inquiryTargetProduct, setInquiryTargetProduct] = useState<Product | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderTargetProduct, setOrderTargetProduct] = useState<Product | null>(null);
  const [prefilledOrderData, setPrefilledOrderData] = useState<Order | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [pendingPaymentOrder, setPendingPaymentOrder] = useState<Order | null>(null);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [productEditModalOpen, setProductEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Simulated SMS Toast Queue
  const [activeSMS, setActiveSMS] = useState<SMSAlert | null>(null);

  // Persist state updates
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
  }, [inquiries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(allUsers));
  }, [allUsers]);

  // Dispatch an In-App Notification and SMS Alert
  const triggerNotificationAndSMS = (
    userId: string,
    title: string,
    message: string,
    type: 'order_status' | 'new_inquiry' | 'inquiry_reply' | 'escrow_update' | 'system',
    phone?: string,
    relatedOrderId?: string,
    relatedInquiryId?: string
  ) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId,
      title,
      message,
      type,
      relatedOrderId,
      relatedInquiryId,
      read: false,
      createdAt: 'Just now',
    };

    setNotifications(prev => [newNotif, ...prev]);

    // Send SMS alert
    if (phone) {
      setActiveSMS({
        id: `sms-${Date.now()}`,
        phone,
        message: `[BitsB2B] ${title}: ${message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }
  };

  const dismissSMS = () => {
    setActiveSMS(null);
  };

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
  };

  const switchUser = (userId: string | 'visitor') => {
    if (userId === 'visitor') {
      setCurrentUserState(null);
      return;
    }
    const found = allUsers.find(u => u.id === userId);
    if (found) {
      setCurrentUserState(found);
    }
  };

  const logout = () => {
    api.logout().catch(() => {});
    setCurrentUserState(null);
    setAuthView('login');
  };

  const loginWithApi = async (phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanPhone = phone.trim();
    const { data, error } = await api.loginWithPassword(cleanPhone, password);

    if (error) {
      // Local fallback for offline/demo environment when backend server is unreachable
      if (error.statusCode === 0) {
        const localMatch = allUsers.find(u => u.phone.replace(/\s+/g, '') === cleanPhone.replace(/\s+/g, ''));
        if (localMatch) {
          setCurrentUserState(localMatch);
          setAuthView('marketplace');
          return { success: true };
        }
      }
      if (error.statusCode === 401 || error.statusCode === 404 || error.message.toLowerCase().includes('invalid')) {
        return {
          success: false,
          error: t('auth.userDoesNotExistError'),
        };
      }
      return {
        success: false,
        error: error.message || t('auth.invalidCredentialsError'),
      };
    }

    if (data?.user) {
      const mappedUser: User = {
        id: data.user.id || `user_${Date.now()}`,
        name: data.user.fullName || data.user.full_name || 'B2B Merchant',
        phone: data.user.phone || cleanPhone,
        isSeller: false,
        business: {
          id: data.business?.id || `biz_${Date.now()}`,
          name: data.business?.name || (data.user.fullName || 'B2B User') + ' Enterprise',
          role: 'reseller',
          phone: data.user.phone || cleanPhone,
          region: 'Addis Ababa',
          city: 'Addis Ababa',
          subcity: 'Bole Subcity',
          verificationStatus: 'verified',
          establishedYear: 2024,
          averageResponseTime: '< 1 hour',
          responseRate: '100%',
          rating: 4.9,
          totalOrdersCompleted: 12,
          description: 'Registered Ethiopian B2B enterprise merchant.',
        },
      };

      setCurrentUserState(mappedUser);
      setAuthView('marketplace');
      return { success: true };
    }

    return {
      success: false,
      error: t('auth.userDoesNotExistError'),
    };
  };

  const registerWithApi = async (formData: any): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await api.registerUser(formData);

    if (error) {
      if (error.statusCode === 0) {
        // Fallback for offline demo mode when backend server is unreachable
        const newUser: User = {
          id: `user_${Date.now()}`,
          name: formData.fullName,
          phone: formData.phone,
          isSeller: formData.canSell ?? false,
          business: {
            id: `biz_${Date.now()}`,
            name: formData.businessName,
            role: (formData.businessTypeCode as UserRole) || 'wholesaler',
            phone: formData.phone,
            region: formData.region || 'Addis Ababa',
            city: formData.city || 'Addis Ababa',
            subcity: formData.subcity || 'Bole Subcity',
            tinNumber: formData.tinNumber,
            tradeLicenseNumber: formData.tradeLicenseNumber,
            verificationStatus: 'pending',
            establishedYear: new Date().getFullYear(),
            averageResponseTime: '< 2 hours',
            responseRate: '100%',
            rating: 5.0,
            totalOrdersCompleted: 0,
            description: `Registered Ethiopian B2B ${formData.businessTypeCode || 'Wholesale'} Enterprise.`,
          },
        };
        setAllUsers(prev => [newUser, ...prev]);
        setCurrentUserState(newUser);
        setAuthView('marketplace');
        return { success: true };
      }

      if (error.message && (error.message.includes('already registered') || error.message.includes('unique'))) {
        return {
          success: false,
          error: t('auth.phoneAlreadyExistsError'),
        };
      }

      return {
        success: false,
        error: error.message || 'Registration failed. Please check form inputs.',
      };
    }

    if (data?.user) {
      const newUser: User = {
        id: data.user.id || `user_${Date.now()}`,
        name: formData.fullName,
        phone: formData.phone,
        isSeller: formData.canSell ?? false,
        business: {
          id: data.business?.id || `biz_${Date.now()}`,
          name: formData.businessName,
          role: (formData.businessTypeCode as UserRole) || 'wholesaler',
          phone: formData.phone,
          region: formData.region || 'Addis Ababa',
          city: formData.city || 'Addis Ababa',
          subcity: formData.subcity || 'Bole Subcity',
          tinNumber: formData.tinNumber,
          tradeLicenseNumber: formData.tradeLicenseNumber,
          verificationStatus: 'pending',
          establishedYear: new Date().getFullYear(),
          averageResponseTime: '< 2 hours',
          responseRate: '100%',
          rating: 5.0,
          totalOrdersCompleted: 0,
          description: `Registered Ethiopian B2B ${formData.businessTypeCode || 'Wholesale'} Enterprise.`,
        },
      };

      setAllUsers(prev => [newUser, ...prev]);
      setCurrentUserState(newUser);
      setAuthView('marketplace');
      return { success: true };
    }

    return {
      success: false,
      error: 'Registration failed.',
    };
  };

  const loginWithPhoneOtp = (phone: string, businessName: string, role: UserRole, isSeller = false): User => {
    const newUserId = `user-${Date.now()}`;
    const newBizId = `biz-${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      name: businessName.split(' ')[0] + ' (Representative)',
      phone,
      isSeller,
      business: {
        id: newBizId,
        name: businessName,
        role,
        phone,
        region: 'Addis Ababa',
        city: 'Addis Ababa',
        subcity: 'Bole Subcity',
        verificationStatus: 'pending',
        establishedYear: new Date().getFullYear(),
        averageResponseTime: '< 2 hours',
        responseRate: '100%',
        rating: 5.0,
        totalOrdersCompleted: 0,
        description: `Registered B2B ${role} enterprise operating in Ethiopia.`,
      },
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    };

    setAllUsers(prev => [...prev, newUser]);
    setCurrentUserState(newUser);

    triggerNotificationAndSMS(
      newUserId,
      'Welcome to BitsB2B Marketplace',
      `Your business account "${businessName}" (${role}) has been created with pending verification.`,
      'system',
      phone
    );

    return newUser;
  };

  // Product Management
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      stockLastUpdated: 'Just now',
    };
    setProducts(prev => [newProd, ...prev]);
    if (currentUser) {
      triggerNotificationAndSMS(
        currentUser.id,
        'Listing Published',
        `Product "${newProd.name}" is now live on BitsB2B catalog.`,
        'system',
        currentUser.phone
      );
    }
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            ...productData,
            stockLastUpdated: 'Just now',
          };
        }
        return p;
      })
    );
  };

  const toggleProductStock = (productId: string, newStatus: StockStatus) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            stockStatus: newStatus,
            stockLastUpdated: 'Just now',
          };
        }
        return p;
      })
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Structured Inquiries (UC8)
  const createInquiry = (
    product: Product,
    topic: 'quotation' | 'sample_request' | 'specifications' | 'delivery_time' | 'custom_bulk',
    firstMessage: string,
    targetQuantity?: number,
    targetPrice?: number
  ): StructuredInquiry => {
    if (!currentUser) {
      throw new Error('Must be registered to create inquiry');
    }

    const newInquiryId = `inq-${Date.now()}`;
    const newInquiry: StructuredInquiry = {
      id: newInquiryId,
      productId: product.id,
      productName: product.name,
      productImage: product.images[0] || '',
      productMoq: product.moq,
      productUnit: product.unit,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      buyerBusinessName: currentUser.business.name,
      buyerPhone: currentUser.phone,
      sellerId: product.sellerId,
      sellerBusinessName: product.sellerBusinessName,
      topic,
      targetQuantity,
      targetPrice,
      status: 'pending_reply',
      createdAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lastActivityAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderBusiness: currentUser.business.name,
          isSeller: false,
          text: firstMessage,
          timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    setInquiries(prev => [newInquiry, ...prev]);

    // Notify seller
    const sellerUser = allUsers.find(u => u.business.id === product.sellerId || u.isSeller);
    const sellerPhone = sellerUser ? sellerUser.phone : '+251 91 123 4567';
    const sellerUserId = sellerUser ? sellerUser.id : 'user-seller-1';

    triggerNotificationAndSMS(
      sellerUserId,
      'New Structured Inquiry Received',
      `${currentUser.business.name} submitted an RFQ for "${product.name}".`,
      'new_inquiry',
      sellerPhone,
      undefined,
      newInquiryId
    );

    return newInquiry;
  };

  const replyToInquiry = (inquiryId: string, replyText: string) => {
    if (!currentUser) return;

    setInquiries(prev =>
      prev.map(inq => {
        if (inq.id === inquiryId) {
          const isSellerReplying = currentUser.id === inq.sellerId || currentUser.isSeller;
          const newMsg = {
            id: `msg-${Date.now()}`,
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderBusiness: currentUser.business.name,
            isSeller: isSellerReplying,
            text: replyText,
            timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          const targetUserId = isSellerReplying ? inq.buyerId : inq.sellerId;
          const targetPhone = isSellerReplying ? inq.buyerPhone : '+251 91 123 4567';

          triggerNotificationAndSMS(
            targetUserId,
            isSellerReplying ? 'Seller Answered Your Inquiry' : 'Buyer Followed Up on Inquiry',
            `${currentUser.business.name}: "${replyText.slice(0, 70)}..."`,
            'inquiry_reply',
            targetPhone,
            undefined,
            inquiryId
          );

          return {
            ...inq,
            status: isSellerReplying ? 'answered' : inq.status,
            lastActivityAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            messages: [...inq.messages, newMsg],
          };
        }
        return inq;
      })
    );
  };

  // Orders & Escrow (UC9 - UC14)
  const createOrder = (
    product: Product,
    quantity: number,
    deliveryAddress: DeliveryAddress,
    paymentMethod: PaymentMethod,
    notes?: string
  ): Order => {
    if (!currentUser) {
      throw new Error('Must be registered to place an order');
    }

    // Determine unit price based on tiered pricing
    let unitPrice = product.price;
    if (product.priceTiers && product.priceTiers.length > 0) {
      const sorted = [...product.priceTiers].sort((a, b) => b.minQty - a.minQty);
      for (const tier of sorted) {
        if (quantity >= tier.minQty) {
          unitPrice = tier.pricePerUnit;
          break;
        }
      }
    }

    const totalAmount = unitPrice * quantity;
    const orderNum = `NT-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrderId = `ord-${Date.now()}`;

    const newOrder: Order = {
      id: newOrderId,
      orderNumber: orderNum,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      buyerBusinessName: currentUser.business.name,
      buyerPhone: currentUser.phone,
      sellerId: product.sellerId,
      sellerBusinessName: product.sellerBusinessName,
      items: [
        {
          productId: product.id,
          productName: product.name,
          productImage: product.images[0] || '',
          unitPrice,
          quantity,
          unit: product.unit,
          totalPrice: totalAmount,
        },
      ],
      totalAmount,
      currency: product.currency,
      status: 'placed',
      paymentMethod,
      escrowStatus: 'pending',
      deliveryAddress,
      createdAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes,
    };

    setOrders(prev => [newOrder, ...prev]);

    return newOrder;
  };

  const completePaymentEscrow = (orderId: string, paymentMethod: PaymentMethod) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const providerName = paymentMethod === 'telebirr' ? 'Telebirr B2B Escrow' : 'CBE Birr Escrow';

          // Notify buyer
          triggerNotificationAndSMS(
            ord.buyerId,
            'Payment Secured in Escrow',
            `${ord.totalAmount.toLocaleString()} ${ord.currency} held securely in ${providerName} for Order #${ord.orderNumber}. Release will occur upon delivery confirmation.`,
            'escrow_update',
            ord.buyerPhone,
            ord.id
          );

          // Notify seller
          const sellerUser = allUsers.find(u => u.business.id === ord.sellerId || u.isSeller);
          const sellerPhone = sellerUser ? sellerUser.phone : '+251 91 123 4567';
          const sellerUserId = sellerUser ? sellerUser.id : 'user-seller-1';

          triggerNotificationAndSMS(
            sellerUserId,
            'New Escrow Secured Order',
            `Order #${ord.orderNumber} for ${ord.totalAmount.toLocaleString()} ${ord.currency} is funded & ready for dispatch.`,
            'order_status',
            sellerPhone,
            ord.id
          );

          return {
            ...ord,
            paymentMethod,
            escrowStatus: 'held_escrow',
            status: 'placed',
          };
        }
        return ord;
      })
    );
  };

  const advanceOrderStatus = (orderId: string, newStatus: OrderStatus, trackingNumber?: string, carrier?: string) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const timeNow = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const updated: Order = {
            ...ord,
            status: newStatus,
          };

          if (newStatus === 'confirmed') {
            updated.confirmedAt = timeNow;
          } else if (newStatus === 'shipped') {
            updated.shippedAt = timeNow;
            updated.trackingNumber = trackingNumber || `TRK-ETH-${Math.floor(100000 + Math.random() * 900000)}`;
            updated.carrierName = carrier || 'Ethiopian B2B Freight Logistics Fleet';
          } else if (newStatus === 'delivered') {
            updated.deliveredAt = timeNow;
          }

          // Trigger buyer SMS and notifications on status changes
          const statusMessages: Record<OrderStatus, string> = {
            placed: `Order #${ord.orderNumber} placed.`,
            confirmed: `Seller "${ord.sellerBusinessName}" has confirmed Order #${ord.orderNumber} and is preparing packing.`,
            shipped: `Order #${ord.orderNumber} has been dispatched with ${updated.carrierName} (${updated.trackingNumber}).`,
            delivered: `Order #${ord.orderNumber} is delivered. Please inspect and confirm receipt to release escrow funds.`,
          };

          triggerNotificationAndSMS(
            ord.buyerId,
            `Order Status Update: ${newStatus.toUpperCase()}`,
            statusMessages[newStatus],
            'order_status',
            ord.buyerPhone,
            ord.id
          );

          return updated;
        }
        return ord;
      })
    );
  };

  const confirmDeliveryAndReleaseEscrow = (orderId: string) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const timeNow = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          // Notify buyer
          triggerNotificationAndSMS(
            ord.buyerId,
            'Receipt Confirmed & Order Completed',
            `Thank you for confirming receipt for Order #${ord.orderNumber}. Escrow payment of ${ord.totalAmount.toLocaleString()} ${ord.currency} has been settled to seller.`,
            'escrow_update',
            ord.buyerPhone,
            ord.id
          );

          // Notify seller that funds are released
          const sellerUser = allUsers.find(u => u.business.id === ord.sellerId || u.isSeller);
          const sellerPhone = sellerUser ? sellerUser.phone : '+251 91 123 4567';
          const sellerUserId = sellerUser ? sellerUser.id : 'user-seller-1';

          triggerNotificationAndSMS(
            sellerUserId,
            'Escrow Payout Released',
            `Buyer has confirmed delivery for Order #${ord.orderNumber}. ${ord.totalAmount.toLocaleString()} ${ord.currency} is now transferred to your ${ord.paymentMethod === 'telebirr' ? 'Telebirr Merchant' : 'CBE Birr'} account.`,
            'escrow_update',
            sellerPhone,
            ord.id
          );

          return {
            ...ord,
            status: 'delivered',
            escrowStatus: 'funds_released',
            deliveredAt: timeNow,
          };
        }
        return ord;
      })
    );
  };

  const reorderPastOrder = (pastOrder: Order) => {
    const item = pastOrder.items[0];
    const originalProd = products.find(p => p.id === item.productId) || {
      id: item.productId,
      name: item.productName,
      categoryId: 'cat-industrial',
      categoryName: 'General Supplies',
      sellerId: pastOrder.sellerId,
      sellerBusinessName: pastOrder.sellerBusinessName,
      sellerVerified: true,
      sellerRegion: 'Addis Ababa',
      price: item.unitPrice,
      currency: pastOrder.currency,
      priceTiers: [],
      moq: 1,
      unit: item.unit,
      stockStatus: 'in_stock' as StockStatus,
      stockQuantity: 100,
      stockLastUpdated: 'Today',
      leadTime: '3-5 days',
      deliveryZones: ['Addis Ababa', 'Nationwide'],
      images: [item.productImage],
      description: item.productName,
      specifications: {},
      createdAt: '2024-01-01',
    };

    setPrefilledOrderData(pastOrder);
    setOrderTargetProduct(originalProd);
    setOrderModalOpen(true);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const resetToDefaults = () => {
    localStorage.clear();
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setInquiries(INITIAL_INQUIRIES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAllUsers(MOCK_USERS);
    setCurrentUserState(MOCK_USERS[0]);
    setSelectedCategory('all');
    setSearchQuery('');
    setViewingView('home');
  };

  return (
    <MarketplaceContext.Provider
      value={{
        language,
        setLanguage,
        authView,
        setAuthView,
        t,
        currentUser,
        setCurrentUser,
        loginWithPhoneOtp,
        loginWithApi,
        registerWithApi,
        switchUser,
        logout,
        allUsers,
        categories: CATEGORIES,
        products,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        filterStock,
        setFilterStock,
        filterVerifiedOnly,
        setFilterVerifiedOnly,
        sortBy,
        setSortBy,
        selectedProduct,
        setSelectedProduct,
        selectedSeller,
        setSelectedSeller,
        viewingView,
        setViewingView,
        authModalOpen,
        setAuthModalOpen,
        inquiryModalOpen,
        setInquiryModalOpen,
        inquiryTargetProduct,
        setInquiryTargetProduct,
        orderModalOpen,
        setOrderModalOpen,
        orderTargetProduct,
        setOrderTargetProduct,
        prefilledOrderData,
        setPrefilledOrderData,
        paymentModalOpen,
        setPaymentModalOpen,
        pendingPaymentOrder,
        setPendingPaymentOrder,
        notificationDrawerOpen,
        setNotificationDrawerOpen,
        productEditModalOpen,
        setProductEditModalOpen,
        editingProduct,
        setEditingProduct,
        addProduct,
        updateProduct,
        toggleProductStock,
        deleteProduct,
        inquiries,
        createInquiry,
        replyToInquiry,
        orders,
        createOrder,
        completePaymentEscrow,
        advanceOrderStatus,
        confirmDeliveryAndReleaseEscrow,
        reorderPastOrder,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        activeSMS,
        dismissSMS,
        resetToDefaults,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
