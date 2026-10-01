'use client';
import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  Grid,
  Package,
  MessageSquare,
  Store,
  User as UserIcon,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const {
    viewingView,
    setViewingView,
    setAuthView,
    currentUser,
    setAuthModalOpen,
    orders,
    inquiries,
    t,
  } = useMarketplace();

  const unreadOrdersCount = orders.length;
  const activeInquiriesCount = inquiries.length;

  return (
    <nav
      id="mobile-bottom-navigation-bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#112225]/95 backdrop-blur-md border-t border-[#274B52] shadow-2xl py-1.5 px-2 flex items-center justify-around text-[10px] font-mono text-[#A8A196]"
    >
      {/* 1. Wholesale Catalog Tab */}
      <button
        id="mob-nav-catalog"
        onClick={() => setViewingView('catalog')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-colors cursor-pointer flex-1 ${
          viewingView === 'catalog' || viewingView === 'home'
            ? 'text-[#F59E0B] font-bold bg-[#193338]'
            : 'hover:text-[#F7F4EE]'
        }`}
      >
        <Grid className="w-5 h-5" />
        <span>{t('common.navCatalog')}</span>
      </button>

      {/* 2. Orders & Escrow Tracking Tab */}
      <button
        id="mob-nav-orders"
        onClick={() => {
          if (!currentUser || currentUser.id === 'visitor') {
            setAuthView('login');
          } else {
            setViewingView('orders');
          }
        }}
        className={`relative flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-colors cursor-pointer flex-1 ${
          viewingView === 'orders'
            ? 'text-[#F59E0B] font-bold bg-[#193338]'
            : 'hover:text-[#F7F4EE]'
        }`}
      >
        <Package className="w-5 h-5" />
        <span>{t('common.navOrders')}</span>
        {unreadOrdersCount > 0 && (
          <span className="absolute top-0.5 right-3 bg-[#D97706] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-[#112225]">
            {unreadOrdersCount}
          </span>
        )}
      </button>

      {/* 3. Inquiries & RFQs Tab */}
      <button
        id="mob-nav-inquiries"
        onClick={() => {
          if (!currentUser || currentUser.id === 'visitor') {
            setAuthView('login');
          } else {
            setViewingView('inquiries');
          }
        }}
        className={`relative flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-colors cursor-pointer flex-1 ${
          viewingView === 'inquiries'
            ? 'text-[#F59E0B] font-bold bg-[#193338]'
            : 'hover:text-[#F7F4EE]'
        }`}
      >
        <MessageSquare className="w-5 h-5" />
        <span>{t('common.navInquiries')}</span>
        {activeInquiriesCount > 0 && (
          <span className="absolute top-0.5 right-3 bg-[#F59E0B] text-[#112225] text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-[#112225]">
            {activeInquiriesCount}
          </span>
        )}
      </button>

      {/* 4. Seller Control Center / Supplier Hub */}
      <button
        id="mob-nav-seller-hub"
        onClick={() => {
          const staffRole = (currentUser as any)?.staffRole || (currentUser as any)?.staff_role;
          const isOperationalStaff = staffRole && staffRole !== 'SUPER_ADMIN';
          if (!currentUser || currentUser.id === 'visitor') {
            setAuthView('login');
          } else if (isOperationalStaff) {
            window.location.href = '/admin';
          } else if (currentUser.isSeller || currentUser?.business?.verificationStatus === 'verified' || currentUser?.business?.canSell || currentUser?.business?.role !== 'institutional buyer' || staffRole === 'SUPER_ADMIN') {
            setViewingView('seller_dashboard');
          } else {
            setAuthView('login');
          }
        }}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-colors cursor-pointer flex-1 ${
          viewingView === 'seller_dashboard'
            ? 'text-[#F59E0B] font-bold bg-[#193338]'
            : 'hover:text-[#F7F4EE]'
        }`}
      >
        {(() => {
          const staffRole = (currentUser as any)?.staffRole || (currentUser as any)?.staff_role;
          const isOperationalStaff = staffRole && staffRole !== 'SUPER_ADMIN';
          const isSellerHubEligible = !isOperationalStaff && (currentUser?.isSeller || currentUser?.business?.verificationStatus === 'verified' || currentUser?.business?.canSell || currentUser?.business?.role !== 'institutional buyer' || staffRole === 'SUPER_ADMIN');
          return isSellerHubEligible ? <Store className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />;
        })()}
        <span>{(() => {
          const staffRole = (currentUser as any)?.staffRole || (currentUser as any)?.staff_role;
          const isOperationalStaff = staffRole && staffRole !== 'SUPER_ADMIN';
          const isSellerHubEligible = !isOperationalStaff && (currentUser?.isSeller || currentUser?.business?.verificationStatus === 'verified' || currentUser?.business?.canSell || currentUser?.business?.role !== 'institutional buyer' || staffRole === 'SUPER_ADMIN');
          return isSellerHubEligible ? t('common.navSellerHub') : (isOperationalStaff ? 'Staff Desk' : 'Account');
        })()}</span>
      </button>
    </nav>
  );
};
