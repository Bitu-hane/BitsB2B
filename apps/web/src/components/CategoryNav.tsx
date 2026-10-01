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
    <nav className="bg-slate-100 border-b border-slate-300 sticky top-[64px] z-30 shadow-xs">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex items-center gap-1 overflow-x-auto pt-2">
        {/* Tab 1: Catalog & RFQ */}
        <button
          onClick={() => setViewingView('catalog')}
          className={`px-5 py-3 text-[13.5px] font-bold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap relative top-[1px] ${
            isCatalog
              ? 'bg-white text-slate-900 border-t-2 border-x border-t-teal-600 border-x-slate-300 shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          Catalog &amp; RFQ
        </button>

        {/* Tab 2: Orders & Escrow */}
        <button
          onClick={() => setViewingView('orders')}
          className={`px-5 py-3 text-[13.5px] font-bold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap relative top-[1px] ${
            isOrders
              ? 'bg-white text-slate-900 border-t-2 border-x border-t-teal-600 border-x-slate-300 shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          Orders &amp; Escrow
        </button>

        {/* Tab 3: Inquiries */}
        <button
          onClick={() => setViewingView('inquiries')}
          className={`px-5 py-3 text-[13.5px] font-bold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap relative top-[1px] ${
            isInquiries
              ? 'bg-white text-slate-900 border-t-2 border-x border-t-teal-600 border-x-slate-300 shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          Inquiries
        </button>

        {/* Tab 4: Seller Hub */}
        <button
          onClick={() => setViewingView('seller_dashboard')}
          className={`px-5 py-3 text-[13.5px] font-bold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap relative top-[1px] ${
            isSeller
              ? 'bg-white text-slate-900 border-t-2 border-x border-t-teal-600 border-x-slate-300 shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          Seller Hub
        </button>
      </div>
    </nav>
  );
};
