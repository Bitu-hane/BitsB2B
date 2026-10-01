'use client';
import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  Package,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  RotateCcw,
  MapPin,
  Building2,
  Phone,
  ChevronRight,
  ChevronDown,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { CanvasProductImage } from './CanvasProductImage';

export const OrderHistoryView: React.FC = () => {
  const {
    orders,
    currentUser,
    confirmDeliveryAndReleaseEscrow,
    reorderPastOrder,
    advanceOrderStatus,
    setViewingView,
  } = useMarketplace();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Filter orders according to buyer or seller view
  const userOrders = orders.filter(ord => {
    if (currentUser?.isSeller) {
      return ord.sellerId === currentUser.business.id || ord.sellerBusinessName === currentUser.business.name;
    }
    return ord.buyerId === currentUser?.id || !currentUser;
  });

  const filteredOrders = userOrders.filter(ord => {
    if (filterStatus === 'all') return true;
    return ord.status === filterStatus;
  });

  const getStatusStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return 0;
      case 'confirmed':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
    }
  };

  const STEPS: { key: OrderStatus; label: string }[] = [
    { key: 'placed', label: 'Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
  ];

  return (
    <div id="order-history-view-container" className="max-w-[1240px] mx-auto px-4 sm:px-8 py-8 space-y-6">
      {/* 1. Orders Hero Banner (Dark Bottle Green) */}
      <div className="bg-[#1B2340] text-[#F4EFE3] rounded-[18px] p-[30px_32px] flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h3 className="font-serif text-[21px] font-semibold text-white mb-2">
            My orders &amp; escrow tracking
          </h3>
          <p className="text-[#A7AECB] text-[13.5px] leading-relaxed max-w-[58ch]">
            Real-time milestone tracking for wholesale dispatches across Ethiopia. Every Birr stays in Telebirr or CBE Birr escrow until you confirm physical receipt.
          </p>
        </div>

        <button
          onClick={() => setViewingView('catalog')}
          className="bg-[#F4EFE3]/10 border border-[#F4EFE3]/25 text-white hover:bg-white hover:text-[#1B2340] px-[20px] py-[11px] rounded-[8px] text-[13.5px] font-semibold transition-colors cursor-pointer shrink-0"
        >
          Browse wholesale catalog
        </button>
      </div>

      {/* 2. Order Status Filter Tabs */}
      <div className="flex gap-2 border-b border-[#E2E4EA] pb-0 mb-6 overflow-x-auto">
        {['all', 'placed', 'confirmed', 'shipped', 'delivered'].map(st => {
          const isActive = filterStatus === st;
          const label = st === 'all' ? `All orders (${userOrders.length})` : st.charAt(0).toUpperCase() + st.slice(1);

          return (
            <button
              key={st}
              id={`filter-order-${st}`}
              onClick={() => setFilterStatus(st)}
              className={`px-4 py-2.5 text-[13.5px] font-semibold transition-colors cursor-pointer whitespace-nowrap border-b-[2.5px] ${
                isActive
                  ? 'text-[#1B2340] border-[#C08829]'
                  : 'text-[#6B7078] border-transparent hover:text-[#1E2128]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 3. Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-dashed border-[#E2E4EA] rounded-[18px] p-12 text-center">
          <div className="w-[54px] h-[54px] rounded-full bg-[#F2DFAE] text-[#9C6B1A] flex items-center justify-center mx-auto mb-4">
            <Package className="w-6 h-6" />
          </div>
          <h4 className="font-serif text-[18px] font-semibold text-[#1E2128] mb-2">No active orders</h4>
          <p className="text-[#6B7078] text-[13.5px] max-w-[44ch] mx-auto mb-6 leading-relaxed">
            There are no orders matching this status. Browse products in our wholesale catalog to place an order with escrow protection.
          </p>
          <button
            onClick={() => setViewingView('catalog')}
            className="bg-[#1B2340] text-[#F4EFE3] hover:bg-[#223B28] px-6 py-3 rounded-[8px] text-[13.5px] font-semibold transition-colors cursor-pointer"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const currentStepIdx = getStatusStepIndex(order.status);
            const isExpanded = expandedOrderId === order.id;

            return (
              <div
                key={order.id}
                id={`order-card-${order.id}`}
                className="bg-white border border-[#E2E4EA] rounded-[11px] p-5 shadow-xs"
              >
                {/* Top Card Row */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <CanvasProductImage
                      src={order.items[0]?.productImage}
                      alt={order.items[0]?.productName || 'Wholesale Order'}
                      className="w-full h-full object-contain"
                      containerClassName="w-14 h-14 rounded-lg bg-[#FAF7F2] border border-[#E2E4EA] overflow-hidden shrink-0"
                    />
                    <div>
                      <h4 className="font-semibold text-[15px] text-[#1E2128] mb-1">
                        {order.items[0]?.productName || 'Wholesale Order'} &bull; {order.items[0]?.quantity} pcs
                      </h4>
                      <div className="text-xs text-[#6B7078] font-mono">
                        Order #{order.orderNumber} &mdash; {order.sellerBusinessName} &mdash; {order.totalAmount.toLocaleString()} {order.currency} in escrow
                      </div>
                    </div>
                  </div>

                  {/* Status Tag Pill */}
                  <div>
                    {order.status === 'shipped' ? (
                      <span className="bg-[#F2DFAE] text-[#9C6B1A] font-bold text-[11.5px] px-3 py-1 rounded-full">
                        Shipped
                      </span>
                    ) : order.status === 'confirmed' ? (
                      <span className="bg-[#DCE7DC] text-[#223B28] font-bold text-[11.5px] px-3 py-1 rounded-full">
                        Confirmed
                      </span>
                    ) : order.status === 'delivered' ? (
                      <span className="bg-[#DCE7DC] text-[#223B28] font-bold text-[11.5px] px-3 py-1 rounded-full">
                        Delivered &amp; Released
                      </span>
                    ) : (
                      <span className="bg-[#F2DFAE] text-[#9C6B1A] font-bold text-[11.5px] px-3 py-1 rounded-full">
                        Placed
                      </span>
                    )}
                  </div>
                </div>

                {/* 4-Step Milestone Progress Line */}
                <div className="my-6 px-4">
                  <div className="relative flex items-center justify-between">
                    {/* Line Background */}
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#E2E4EA] z-0" />
                    {/* Active Line Progress */}
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#33553A] z-0 transition-all duration-300"
                      style={{
                        width: `${(currentStepIdx / (STEPS.length - 1)) * 100}%`,
                      }}
                    />

                    {STEPS.map((step, idx) => {
                      const isDone = idx <= currentStepIdx;

                      return (
                        <div key={step.key} className="relative z-10 flex flex-col items-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                              isDone
                                ? 'bg-[#33553A] text-white'
                                : 'bg-[#E2E4EA] text-[#6B7078]'
                            }`}
                          >
                            {isDone ? '✓' : idx + 1}
                          </div>
                          <span
                            className={`text-[12px] mt-2 font-medium ${
                              isDone ? 'text-[#1E2128]' : 'text-[#6B7078]'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Expanded Details & Action Bar */}
                <div className="pt-3 border-t border-[#ECEDF1] flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    className="text-xs font-medium text-[#6B7078] hover:text-[#1E2128] flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide logistics details' : 'View logistics & delivery address'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  <div className="flex items-center gap-2">
                    {order.status === 'shipped' && !currentUser?.isSeller && (
                      <button
                        onClick={() => confirmDeliveryAndReleaseEscrow(order.id)}
                        className="bg-[#223B28] hover:bg-[#33553A] text-white px-4 py-2 rounded-[7px] text-xs font-bold transition-colors cursor-pointer"
                      >
                        Confirm Receipt &amp; Release Escrow
                      </button>
                    )}

                    {currentUser?.isSeller && order.status === 'placed' && (
                      <button
                        onClick={() => advanceOrderStatus(order.id, 'confirmed')}
                        className="bg-[#C08829] hover:bg-[#9C6B1A] text-[#1B2340] hover:text-white px-4 py-2 rounded-[7px] text-xs font-bold transition-colors cursor-pointer"
                      >
                        Confirm &amp; Pack Order
                      </button>
                    )}

                    {currentUser?.isSeller && order.status === 'confirmed' && (
                      <button
                        onClick={() => advanceOrderStatus(order.id, 'shipped')}
                        className="bg-[#C08829] hover:bg-[#9C6B1A] text-[#1B2340] hover:text-white px-4 py-2 rounded-[7px] text-xs font-bold transition-colors cursor-pointer"
                      >
                        Dispatch &amp; Mark Shipped
                      </button>
                    )}

                    <button
                      onClick={() => reorderPastOrder(order)}
                      className="border border-[#1B2340] text-[#1B2340] hover:bg-[#1B2340] hover:text-white px-3.5 py-2 rounded-[7px] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reorder</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Box */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[#ECEDF1] text-xs text-[#6B7078] grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F1F2F5] p-3 rounded-[8px]">
                    <div>
                      <strong className="text-[#1E2128]">Delivery Location:</strong>
                      <div>{order.deliveryAddress.city}, {order.deliveryAddress.subcity} ({order.deliveryAddress.landmark})</div>
                      <div>Contact: {order.deliveryAddress.contactPerson} - {order.deliveryAddress.contactPhone}</div>
                    </div>
                    <div>
                      <strong className="text-[#1E2128]">Escrow Protection:</strong>
                      <div>Method: {order.paymentMethod.toUpperCase()} Escrow</div>
                      <div>Status: <span className="font-bold text-[#9C6B1A]">{order.escrowStatus}</span></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
