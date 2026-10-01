'use client';
import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  Store,
  Plus,
  Package,
  Layers,
  MessageSquare,
  ShieldCheck,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Truck,
  DollarSign,
  TrendingUp,
  Clock,
  Send,
  Building2,
  RotateCcw,
} from 'lucide-react';
import { StockStatus, OrderStatus, Product } from '../types';
import { CanvasProductImage } from './CanvasProductImage';

export const SellerDashboard: React.FC = () => {
  const {
    currentUser,
    products,
    orders,
    inquiries,
    toggleProductStock,
    deleteProduct,
    setEditingProduct,
    setProductEditModalOpen,
    advanceOrderStatus,
    replyToInquiry,
    setSelectedProduct,
    t,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'inquiries'>('products');
  const [inquiryReplyText, setInquiryReplyText] = useState<{ [inqId: string]: string }>({});

  // Filter products strictly for this seller's business
  const sellerBizId = currentUser?.business.id;
  const sellerBizName = currentUser?.business.name;

  const sellerProducts = products.filter(
    p => (sellerBizId && p.sellerId === sellerBizId) ||
         (sellerBizName && p.sellerBusinessName === sellerBizName)
  );

  const sellerOrders = orders.filter(
    o => (sellerBizId && o.sellerId === sellerBizId) ||
         (sellerBizName && o.sellerBusinessName === sellerBizName)
  );

  const sellerInquiries = inquiries.filter(
    inq => (sellerBizId && inq.sellerId === sellerBizId) ||
           (sellerBizName && inq.sellerBusinessName === sellerBizName)
  );

  // Financial statistics
  const totalSalesVolume = sellerOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingFulfillmentCount = sellerOrders.filter(o => o.status === 'placed' || o.status === 'confirmed').length;
  const pendingInquiriesCount = sellerInquiries.filter(i => i.status === 'pending_reply').length;

  const handleStockChange = (productId: string, newStatus: StockStatus) => {
    toggleProductStock(productId, newStatus);
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductEditModalOpen(true);
  };

  const handleAddNewProduct = () => {
    setEditingProduct(null);
    setProductEditModalOpen(true);
  };

  const handleReplyInquiry = (inquiryId: string) => {
    const text = inquiryReplyText[inquiryId];
    if (!text || !text.trim()) return;

    replyToInquiry(inquiryId, text);
    setInquiryReplyText(prev => ({ ...prev, [inquiryId]: '' }));
  };

  return (
    <div id="seller-dashboard-container" className="max-w-[1240px] mx-auto px-4 sm:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-[#1B2340] text-[#F4EFE3] rounded-[18px] p-6 border border-[#2E3A63] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#C08829] flex items-center justify-center text-[#1B2340] font-bold text-base shadow-sm">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-[21px] font-semibold tracking-tight">
                  {currentUser?.business.name || t('dashboard.supplierControlCenter')}
                </h1>
                {currentUser?.business.verificationStatus === 'verified' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D97706] bg-[#FEF3C7]/15 border border-[#D97706]/40 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" /> {t('dashboard.verifiedSupplier')}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#A7AECB] mt-0.5">
                Role: <strong className="capitalize text-[#F2DFAE]">{currentUser?.business.role || t('dashboard.producer')}</strong> &bull; Region: {currentUser?.business.region || 'Addis Ababa'}
              </p>
            </div>
          </div>
        </div>

        <button
          id="btn-seller-add-new-product"
          onClick={handleAddNewProduct}
          className="px-4 py-2.5 bg-[#C08829] hover:bg-[#9C6B1A] text-[#1B2340] hover:text-white font-bold text-xs rounded-[8px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>{t('dashboard.addNewProduct')}</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-[11px] border border-[#E2E4EA] shadow-xs">
          <span className="text-[11px] font-semibold text-[#888] uppercase tracking-wider block">
            {t('dashboard.activeListings')}
          </span>
          <div className="text-2xl font-black text-[#112225] mt-1">
            {sellerProducts.length} <span className="text-xs font-normal text-[#6E685F]">{t('dashboard.activeItems')}</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-[11px] border border-[#E2E4EA] shadow-xs">
          <span className="text-[11px] font-semibold text-[#888] uppercase tracking-wider block">
            {t('dashboard.ordersDispatch')}
          </span>
          <div className="text-2xl font-black text-[#C85A32] mt-1">
            {pendingFulfillmentCount} <span className="text-xs font-normal text-[#6E685F]">{t('dashboard.pendingOrders')}</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-[11px] border border-[#E2E4EA] shadow-xs">
          <span className="text-[11px] font-semibold text-[#888] uppercase tracking-wider block">
            {t('dashboard.unansweredInquiries')}
          </span>
          <div className="text-2xl font-black text-[#92400E] mt-1">
            {pendingInquiriesCount} <span className="text-xs font-normal text-[#6E685F]">{t('dashboard.newInquiries')}</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-[11px] border border-[#E2E4EA] shadow-xs">
          <span className="text-[11px] font-semibold text-[#888] uppercase tracking-wider block">
            {t('dashboard.totalSales')}
          </span>
          <div className="text-2xl font-black text-[#112225] mt-1">
            {totalSalesVolume.toLocaleString()} <span className="text-xs font-normal text-[#6E685F]">{t('common.currency')}</span>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-[#E5DFD5] text-xs gap-2">
        <button
          id="seller-tab-products"
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'products'
              ? 'text-[#C85A32] border-[#C85A32] bg-[#FAF7F2]'
              : 'border-transparent text-[#6E685F] hover:text-[#112225]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t('dashboard.productCatalogTab')} ({sellerProducts.length})</span>
        </button>

        <button
          id="seller-tab-orders"
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'text-[#C85A32] border-[#C85A32] bg-[#FAF7F2]'
              : 'border-transparent text-[#6E685F] hover:text-[#112225]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{t('dashboard.incomingOrdersTab')} ({sellerOrders.length})</span>
        </button>

        <button
          id="seller-tab-inquiries"
          onClick={() => setActiveTab('inquiries')}
          className={`px-4 py-2.5 font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'inquiries'
              ? 'text-[#C85A32] border-[#C85A32] bg-[#FAF7F2]'
              : 'border-transparent text-[#6E685F] hover:text-[#112225]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{t('dashboard.inquiriesInboxTab')} ({sellerInquiries.length})</span>
        </button>
      </div>

      {/* Tab 1: Product Catalog & Stock Toggles */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-[#E5DFD5] shadow-xs overflow-hidden">
          <div className="p-4 bg-[#FAF7F2] border-b border-[#E5DFD5] flex items-center">
            <span className="text-xs font-bold text-[#112225]">
              {t('dashboard.manualStockTitle')}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F3EFE6] border-b border-[#E5DFD5] text-[#6E685F] uppercase font-semibold text-[10px]">
                  <th className="py-3 px-4">{t('dashboard.tableProductDetails')}</th>
                  <th className="py-3 px-3">{t('dashboard.tableWholesalePrice')}</th>
                  <th className="py-3 px-3">{t('dashboard.tableStockToggle')}</th>
                  <th className="py-3 px-3">{t('dashboard.tableAvailableQty')}</th>
                  <th className="py-3 px-3">{t('dashboard.tableLeadTime')}</th>
                  <th className="py-3 px-4 text-right">{t('dashboard.tableActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEAE0]">
                {sellerProducts.map(prod => (
                  <tr key={prod.id} className="hover:bg-[#FAF7F2] transition-colors">
                    {/* Details */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <CanvasProductImage
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-full h-full object-contain"
                          containerClassName="w-12 h-12 rounded-lg bg-[#FAF7F2] border border-[#D8CFBF] overflow-hidden shrink-0"
                        />
                        <div className="max-w-xs">
                          <button
                            onClick={() => setSelectedProduct(prod)}
                            className="font-bold text-[#112225] hover:text-[#C85A32] text-left line-clamp-1 cursor-pointer"
                          >
                            {prod.name}
                          </button>
                          <div className="text-[11px] text-[#888]">{prod.categoryName}</div>
                        </div>
                      </div>
                    </td>

                    {/* Price / MOQ */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#C85A32]">
                        {prod.price.toLocaleString()} {prod.currency} <span className="font-normal text-[#888]">/ {prod.unit}</span>
                      </div>
                      <div className="text-[11px] text-[#6E685F]">
                        {t('catalog.moqLabel')}: <strong>{prod.moq} {prod.unit}</strong>
                      </div>
                    </td>

                    {/* Manual Stock Status Toggle */}
                    <td className="py-3 px-3">
                      <select
                        id={`stock-select-${prod.id}`}
                        value={prod.stockStatus}
                        onChange={e => handleStockChange(prod.id, e.target.value as StockStatus)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                          prod.stockStatus === 'in_stock'
                            ? 'bg-[#FEF3C7]/40 border-[#F59E0B] text-[#92400E]'
                            : prod.stockStatus === 'low_stock'
                            ? 'bg-[#C85A32]/15 border-[#C85A32] text-[#A34320]'
                            : 'bg-[#E5DFD5] border-[#888] text-[#555]'
                        }`}
                      >
                        <option value="in_stock">{t('dashboard.inStock')}</option>
                        <option value="low_stock">{t('dashboard.lowStock')}</option>
                        <option value="out_of_stock">{t('dashboard.outOfStock')}</option>
                      </select>
                      <div className="text-[10px] text-[#888] mt-0.5">
                        {prod.stockLastUpdated}
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-3">
                      <span className="font-semibold text-[#112225]">{prod.stockQuantity.toLocaleString()}</span>{' '}
                      <span className="text-[11px] text-[#888]">{prod.unit}</span>
                    </td>

                    {/* Lead Time */}
                    <td className="py-3 px-3 text-[#6E685F]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#C85A32]" />
                        <span>{prod.leadTime}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          id={`btn-edit-prod-${prod.id}`}
                          onClick={() => handleEditProduct(prod)}
                          className="p-1.5 rounded-lg border border-[#D8CFBF] hover:bg-[#EBE5DA] text-[#112225] cursor-pointer"
                          title="Edit listing details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`btn-delete-prod-${prod.id}`}
                          onClick={() => deleteProduct(prod.id)}
                          className="p-1.5 rounded-lg border border-[#D8CFBF] hover:bg-[#FBE8E8] text-[#C85A32] cursor-pointer"
                          title="Delete listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Incoming Orders & Fulfillment Workflow */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {sellerOrders.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E5DFD5] text-xs text-[#888]">
              {t('dashboard.noOrders')}
            </div>
          ) : (
            sellerOrders.map(order => (
              <div
                key={order.id}
                className="p-5 bg-white rounded-2xl border border-[#E5DFD5] shadow-xs space-y-4 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EFEAE0]">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm text-[#112225]">{t('orders.orderNumber')}{order.orderNumber}</strong>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          order.status === 'delivered'
                            ? 'bg-[#EBE5DA] text-[#162C30]'
                            : 'bg-[#FEF3C7] text-[#92400E]'
                        }`}
                      >
                        {t('dashboard.status')}: {order.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6E685F] mt-0.5">
                      {t('dashboard.buyer')}: <strong className="text-[#112225]">{order.buyerBusinessName}</strong> ({order.buyerName}) &bull; {order.buyerPhone}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-[#C85A32]">
                      {order.totalAmount.toLocaleString()} {order.currency}
                    </div>
                    <div className="text-[10px] text-[#92400E] font-medium">
                      {t('dashboard.escrow')}: {order.escrowStatus.toUpperCase()} ({order.paymentMethod === 'telebirr' ? 'Telebirr' : 'CBE Birr'})
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CanvasProductImage
                          src={it.productImage}
                          alt={it.productName}
                          className="w-full h-full object-contain"
                          containerClassName="w-8 h-8 rounded bg-[#FAF7F2] border border-[#E2E4EA] overflow-hidden shrink-0"
                        />
                        <span className="font-semibold text-[#112225]">{it.productName}</span>
                      </div>
                      <div>
                        {it.quantity} {it.unit} &times; {it.unitPrice.toLocaleString()} {order.currency}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Location */}
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5]">
                  <span className="font-bold text-[#112225] block mb-0.5">{t('dashboard.destinationWarehouse')}:</span>
                  <div className="text-[#6E685F]">
                    {order.deliveryAddress.landmark}, {order.deliveryAddress.subcity}, {order.deliveryAddress.city}, {order.deliveryAddress.region}
                  </div>
                </div>

                {/* Seller Advance Order Controls */}
                <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                  <div className="text-[11px] text-[#888]">
                    {order.status === 'placed' && 'Payment secured in escrow. Confirm & prepare package for dispatch.'}
                    {order.status === 'confirmed' && 'Package ready. Dispatch via regional logistics.'}
                    {order.status === 'shipped' && `Dispatched with ${order.carrierName} (${order.trackingNumber}). Awaiting buyer delivery confirmation.`}
                    {order.status === 'delivered' && 'Buyer confirmed delivery. Escrow funds released to your account.'}
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === 'placed' && (
                      <button
                        onClick={() => advanceOrderStatus(order.id, 'confirmed')}
                        className="px-4 py-2 bg-[#C85A32] hover:bg-[#A34320] text-white font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        {t('dashboard.confirmOrder')} &rarr;
                      </button>
                    )}

                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => advanceOrderStatus(order.id, 'shipped')}
                        className="px-4 py-2 bg-[#C85A32] hover:bg-[#A34320] text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>{t('dashboard.dispatchMarkShipped')} &rarr;</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Structured Inquiries Inbox */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          {sellerInquiries.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E5DFD5] text-xs text-[#888]">
              {t('dashboard.noInquiries')}
            </div>
          ) : (
            sellerInquiries.map(inq => (
              <div
                key={inq.id}
                className="p-5 bg-white rounded-2xl border border-[#E5DFD5] shadow-xs space-y-4 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EFEAE0]">
                  <div className="flex items-center gap-3">
                    <CanvasProductImage
                      src={inq.productImage}
                      alt={inq.productName}
                      className="w-full h-full object-contain"
                      containerClassName="w-12 h-12 rounded-lg bg-[#FAF7F2] border border-[#D8CFBF] overflow-hidden shrink-0"
                    />
                    <div>
                      <div className="font-bold text-sm text-[#112225]">{inq.productName}</div>
                      <div className="text-[11px] text-[#6E685F]">
                        {t('dashboard.buyer')}: <strong className="text-[#112225]">{inq.buyerBusinessName}</strong> ({inq.buyerPhone})
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        inq.status === 'answered'
                          ? 'bg-[#EBE5DA] text-[#112225]'
                          : 'bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]'
                      }`}
                    >
                      {inq.status === 'answered' ? t('dashboard.answered') : t('dashboard.awaitingReply')}
                    </span>
                    <div className="text-[10px] text-[#888] mt-1">Topic: {inq.topic.toUpperCase()}</div>
                  </div>
                </div>

                {/* Messages Thread */}
                <div className="space-y-2.5">
                  {inq.messages.map(m => (
                    <div
                      key={m.id}
                      className={`p-3 rounded-xl ${
                        m.isSeller ? 'bg-[#FAF7F2] border border-[#C85A32]/30 ml-6' : 'bg-[#F7F4EE] mr-6'
                      }`}
                    >
                      <div className="flex justify-between text-[11px] font-bold text-[#112225] mb-1">
                        <span>{m.senderBusiness} ({m.isSeller ? 'You / Seller' : t('dashboard.buyer')})</span>
                        <span className="text-[#888] font-normal">{m.timestamp}</span>
                      </div>
                      <p className="text-[#162C30] leading-relaxed">{m.text}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <div className="pt-2 flex gap-2">
                  <input
                    type="text"
                    value={inquiryReplyText[inq.id] || ''}
                    onChange={e =>
                      setInquiryReplyText(prev => ({ ...prev, [inq.id]: e.target.value }))
                    }
                    placeholder={t('dashboard.typeReplyPlaceholder')}
                    className="flex-1 px-3 py-2 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-xs text-[#112225] focus:outline-none focus:border-[#C85A32]"
                  />
                  <button
                    onClick={() => handleReplyInquiry(inq.id)}
                    className="px-4 py-2 bg-[#C85A32] hover:bg-[#A34320] text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t('dashboard.sendAnswer')}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
