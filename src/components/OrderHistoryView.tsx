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

  const STEPS: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'placed', label: 'Order Placed', desc: 'Escrow Secured' },
    { key: 'confirmed', label: 'Seller Confirmed', desc: 'Pallet Packing' },
    { key: 'shipped', label: 'Dispatched & Shipped', desc: 'In Transit' },
    { key: 'delivered', label: 'Delivered & Released', desc: 'Receipt Confirmed' },
  ];

  return (
    <div id="order-history-view-container" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-[#112225] text-[#F7F4EE] rounded-2xl p-6 border border-[#274B52] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#C85A32] text-white">
              <Package className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight">
              {currentUser?.isSeller ? 'B2B Sales & Dispatch Management' : 'My Orders & Escrow Tracking'}
            </h1>
          </div>
          <p className="text-xs text-[#A8A196] mt-1.5 max-w-xl">
            Real-time milestone tracking for wholesale dispatches in Ethiopia. All payments are protected
            in Telebirr / CBE Birr escrow until physical receipt confirmation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewingView('catalog')}
            className="px-4 py-2 bg-[#1D383D] hover:bg-[#23454B] text-xs font-semibold text-[#F7F4EE] rounded-xl border border-[#34626B] transition-colors cursor-pointer"
          >
            Browse Wholesale Catalog &rarr;
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E5DFD5] pb-3 text-xs">
        {['all', 'placed', 'confirmed', 'shipped', 'delivered'].map(st => (
          <button
            key={st}
            id={`filter-order-${st}`}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-lg font-semibold capitalize transition-colors cursor-pointer ${
              filterStatus === st
                ? 'bg-[#C85A32] text-white'
                : 'bg-[#F7F4EE] hover:bg-[#EBE5DA] text-[#6E685F]'
            }`}
          >
            {st === 'all' ? `All Orders (${userOrders.length})` : st}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E5DFD5] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#F7F4EE] flex items-center justify-center text-[#888] mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#112225]">No Orders Found</h3>
          <p className="text-xs text-[#6E685F] max-w-sm mx-auto">
            There are no orders matching this status filter. Browse products in our B2B catalog to place an order.
          </p>
          <button
            onClick={() => setViewingView('catalog')}
            className="px-4 py-2 bg-[#C85A32] hover:bg-[#A34320] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Explore Wholesale Products
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
                id={`order-row-${order.id}`}
                className="bg-white rounded-2xl border border-[#E5DFD5] shadow-xs overflow-hidden transition-all hover:border-[#C85A32]/60"
              >
                {/* Order Summary Top Bar */}
                <div className="p-4 sm:p-5 bg-[#FAF7F2] border-b border-[#E5DFD5] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#888]">Order:</span>
                      <strong className="text-[#112225] font-mono text-sm">#{order.orderNumber}</strong>
                    </div>
                    <span className="text-[#CCC]">•</span>
                    <div className="text-[#6E685F]">
                      Placed on: <span className="font-medium text-[#112225]">{order.createdAt}</span>
                    </div>
                    <span className="text-[#CCC]">•</span>
                    <div className="text-[#6E685F]">
                      Supplier:{' '}
                      <strong className="text-[#112225]">{order.sellerBusinessName}</strong>
                    </div>
                  </div>

                  {/* Escrow Status Tag */}
                  <div className="flex items-center gap-2">
                    {order.escrowStatus === 'held_escrow' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#92400E] bg-[#FEF3C7] border border-[#FCD34D] px-2.5 py-0.5 rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#D97706]" />
                        Funds Held in Escrow ({order.paymentMethod === 'telebirr' ? 'Telebirr' : 'CBE Birr'})
                      </span>
                    ) : order.escrowStatus === 'funds_released' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#162C30] bg-[#EBE5DA] border border-[#D8CFBF] px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C85A32]" />
                        Escrow Funds Settled to Seller
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-[#888] bg-[#EFEAE0] px-2.5 py-0.5 rounded-full">
                        Pending Payment
                      </span>
                    )}

                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="p-1.5 rounded-lg hover:bg-[#EBE5DA] text-[#6E685F] transition-colors cursor-pointer"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Tracking Progress Stepper (UC10) */}
                <div className="p-5 border-b border-[#EFEAE0] bg-white">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#888] mb-3">
                    Order Status Progress
                  </div>

                  <div className="relative flex items-center justify-between">
                    {/* Background line */}
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-[#E5DFD5] z-0" />
                    {/* Active progress line */}
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#C85A32] z-0 transition-all duration-500"
                      style={{
                        width: `${(currentStepIdx / (STEPS.length - 1)) * 100}%`,
                      }}
                    />

                    {STEPS.map((step, idx) => {
                      const isPast = idx < currentStepIdx;
                      const isCurrent = idx === currentStepIdx;

                      return (
                        <div key={step.key} className="relative z-10 flex flex-col items-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isPast || isCurrent
                                ? 'bg-[#C85A32] text-white shadow-md ring-4 ring-[#FAF7F2]'
                                : 'bg-[#E5DFD5] text-[#888]'
                            }`}
                          >
                            {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          <div className="text-center mt-2">
                            <div
                              className={`text-xs font-bold whitespace-nowrap ${
                                isCurrent ? 'text-[#C85A32]' : isPast ? 'text-[#112225]' : 'text-[#888]'
                              }`}
                            >
                              {step.label}
                            </div>
                            <div className="text-[10px] text-[#888] hidden sm:block">
                              {step.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Dispatch / Carrier Info if Shipped */}
                  {order.trackingNumber && (
                    <div className="mt-4 p-3 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5] flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#C85A32]" />
                        <span className="font-semibold text-[#112225]">Carrier: {order.carrierName}</span>
                        <span className="text-[#888] font-mono">({order.trackingNumber})</span>
                      </div>
                      {order.shippedAt && (
                        <span className="text-[11px] text-[#6E685F]">Dispatched: {order.shippedAt}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Items and Financial Details */}
                <div className="p-5 space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-12 h-12 rounded-lg object-cover border border-[#D8CFBF] bg-[#F7F4EE] shrink-0"
                        />
                        <div>
                          <div className="font-bold text-[#112225] line-clamp-1">{item.productName}</div>
                          <div className="text-[11px] text-[#6E685F]">
                            Quantity: <strong>{item.quantity.toLocaleString()} {item.unit}</strong> &times; {item.unitPrice.toLocaleString()} {order.currency}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-bold text-sm text-[#C85A32]">
                          {item.totalPrice.toLocaleString()} {order.currency}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Expanded Logistics Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-[#EFEAE0] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5] space-y-1">
                        <div className="font-bold text-[#112225] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#C85A32]" /> Delivery Address
                        </div>
                        <div className="text-[#6E685F]">
                          {order.deliveryAddress.landmark}, {order.deliveryAddress.kebele}, {order.deliveryAddress.subcity}
                        </div>
                        <div className="text-[#6E685F]">
                          {order.deliveryAddress.city}, {order.deliveryAddress.region}
                        </div>
                        <div className="text-[#112225] font-medium pt-1">
                          Contact: {order.deliveryAddress.contactPerson} ({order.deliveryAddress.contactPhone})
                        </div>
                      </div>

                      <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5] space-y-1">
                        <div className="font-bold text-[#112225] flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#D97706]" /> Payment &amp; Escrow
                        </div>
                        <div className="text-[#6E685F]">
                          Payment Method: <span className="font-semibold text-[#112225] capitalize">{order.paymentMethod.replace('_', ' ')}</span>
                        </div>
                        <div className="text-[#6E685F]">
                          Escrow Status: <span className="font-semibold text-[#92400E] uppercase">{order.escrowStatus.replace('_', ' ')}</span>
                        </div>
                        {order.notes && (
                          <div className="text-[#6E685F] pt-1">
                            Notes: <em>{order.notes}</em>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-[#EFEAE0] flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-[#6E685F]">
                      Total Order Value:{' '}
                      <strong className="text-sm font-bold text-[#112225]">
                        {order.totalAmount.toLocaleString()} {order.currency}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* UC12 Delivery Confirmation Button: Available when order is Shipped */}
                      {order.status === 'shipped' && !currentUser?.isSeller && (
                        <button
                          id={`btn-confirm-delivery-${order.id}`}
                          onClick={() => confirmDeliveryAndReleaseEscrow(order.id)}
                          className="px-4 py-2 bg-[#112225] hover:bg-[#274B52] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#D97706]" />
                          <span>Confirm Receipt &amp; Release Escrow Funds</span>
                        </button>
                      )}

                      {/* Advance Order Status if Seller is viewing */}
                      {currentUser?.isSeller && order.status === 'placed' && (
                        <button
                          onClick={() => advanceOrderStatus(order.id, 'confirmed')}
                          className="px-4 py-2 bg-[#C85A32] hover:bg-[#A34320] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Confirm &amp; Pack Order &rarr;
                        </button>
                      )}

                      {currentUser?.isSeller && order.status === 'confirmed' && (
                        <button
                          onClick={() => advanceOrderStatus(order.id, 'shipped')}
                          className="px-4 py-2 bg-[#C85A32] hover:bg-[#A34320] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Dispatch &amp; Mark Shipped &rarr;
                        </button>
                      )}

                      {/* 1-Tap Reorder Action */}
                      <button
                        id={`btn-reorder-${order.id}`}
                        onClick={() => reorderPastOrder(order)}
                        className="px-3.5 py-2 bg-[#F3EFE6] hover:bg-[#EBE5DA] text-[#162C30] text-xs font-semibold rounded-xl border border-[#D8CFBF] flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Repeat this exact wholesale purchase prefilled"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#C85A32]" />
                        <span>Reorder</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
