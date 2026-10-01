'use client';
import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  List,
  ChevronDown,
  Cog,
  Printer,
  Box,
  Truck,
  Shirt,
  Armchair,
  Monitor,
  Layers,
  ShieldCheck,
} from 'lucide-react';

export const CategoryNav: React.FC = () => {
  const {
    viewingView,
    setViewingView,
  } = useMarketplace();

  const isCatalog = viewingView === 'home' || viewingView === 'catalog';
  const isOrders = viewingView === 'orders';
  const isInquiries = viewingView === 'inquiries';
  const isSeller = viewingView === 'seller_dashboard';

  return (
    <nav className="bg-[#F1F2F5] border-b-2 border-[#1B2340] sticky top-[138px] sm:top-[128px] z-30">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 flex items-center gap-1 overflow-x-auto pt-2">
        {/* Tab 1: Catalog & RFQ */}
        <button
          onClick={() => setViewingView('catalog')}
          className={`px-5 py-3 text-[13.5px] font-semibold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap relative top-[2px] ${
            isCatalog
              ? 'bg-white text-[#1B2340] shadow-[0_-1px_0_#FFFFFF]'
              : 'bg-[#F1F2F5] text-[#6B7078] hover:text-[#1E2128] hover:bg-[#ECEDF1]'
          }`}
        >
          Catalog &amp; RFQ
        </button>

        {/* Tab 2: Orders & Escrow */}
        <button
          onClick={() => setViewingView('orders')}
          className={`px-5 py-3 text-[13.5px] font-semibold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap relative top-[2px] ${
            isOrders
              ? 'bg-white text-[#1B2340] shadow-[0_-1px_0_#FFFFFF]'
              : 'bg-[#F1F2F5] text-[#6B7078] hover:text-[#1E2128] hover:bg-[#ECEDF1]'
          }`}
        >
          Orders &amp; Escrow
        </button>

        {/* Tab 3: Inquiries */}
        <button
          onClick={() => setViewingView('inquiries')}
          className={`px-5 py-3 text-[13.5px] font-semibold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap relative top-[2px] ${
            isInquiries
              ? 'bg-white text-[#1B2340] shadow-[0_-1px_0_#FFFFFF]'
              : 'bg-[#F1F2F5] text-[#6B7078] hover:text-[#1E2128] hover:bg-[#ECEDF1]'
          }`}
        >
          Inquiries
        </button>

        {/* Tab 4: Seller Hub */}
        <button
          onClick={() => setViewingView('seller_dashboard')}
          className={`px-5 py-3 text-[13.5px] font-semibold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap relative top-[2px] ${
            isSeller
              ? 'bg-white text-[#1B2340] shadow-[0_-1px_0_#FFFFFF]'
              : 'bg-[#F1F2F5] text-[#6B7078] hover:text-[#1E2128] hover:bg-[#ECEDF1]'
          }`}
        >
          Seller Hub
        </button>
      </div>
    </nav>
  );
};
