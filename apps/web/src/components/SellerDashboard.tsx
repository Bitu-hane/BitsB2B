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
  Eye,
  FileText,
  Archive,
  Ban,
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
    updateProductStatus,
    deleteProduct,
    setEditingProduct,
    setProductEditModalOpen,
    advanceOrderStatus,
    replyToInquiry,
    setSelectedProduct,
    t,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'inquiries'>('products');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'out_of_stock' | 'archived'>('all');
  const [inquiryReplyText, setInquiryReplyText] = useState<{ [inqId: string]: string }>({});

  // Filter products strictly for this seller's business
  const sellerBizId = currentUser?.business.id;
  const sellerBizName = currentUser?.business.name;

  const sellerProducts = products.filter(
    p => (sellerBizId && p.sellerId === sellerBizId) ||
         (sellerBizName && p.sellerBusinessName === sellerBizName)
  );

  const filteredSellerProducts = sellerProducts.filter(p => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'published') return (p.status === 'published' || !p.status) && p.stockStatus !== 'out_of_stock';
    if (statusFilter === 'draft') return p.status === 'draft';
    if (statusFilter === 'out_of_stock') return p.stockStatus === 'out_of_stock';
    if (statusFilter === 'archived') return p.status === 'archived';
    return true;
  });

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

  const handleStockChange = async (productId: string, newStockStatus: StockStatus) => {
    await toggleProductStock(productId, newStockStatus);
  };

  const handleStatusChange = async (productId: string, newStatus: string) => {
    let stockStat: StockStatus | undefined = undefined;
    if (newStatus === 'out_of_stock') stockStat = 'out_of_stock';
    if (newStatus === 'published') stockStat = 'in_stock';
    await updateProductStatus(productId, newStatus, stockStat);
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
    <div id="seller-dashboard-container" className="max-w-[1280px] mx-auto px-4 sm:px-8 py-8 space-y-6 bg-slate-50 min-h-screen text-slate-800">
      {/* Header Banner - Sleek Executive Navy */}
      <div className="bg-[#1E293B] text-white rounded-2xl p-6 border border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {currentUser?.business.name || t('dashboard.supplierControlCenter')}
                </h1>
                {currentUser?.business.verificationStatus === 'verified' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 border border-amber-400/40 px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" /> {t('dashboard.verifiedSupplier')}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Role: <strong className="capitalize text-teal-300">{currentUser?.business.role || t('dashboard.producer')}</strong> &bull; Region: {currentUser?.business.region || 'Addis Ababa'}
              </p>
            </div>
          </div>
        </div>

        <button
          id="btn-seller-add-new-product"
          onClick={handleAddNewProduct}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('dashboard.addNewProduct')}</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            {t('dashboard.activeListings')}
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {sellerProducts.length} <span className="text-xs font-normal text-slate-500">{t('dashboard.activeItems')}</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            {t('dashboard.ordersDispatch')}
          </span>
          <div className="text-2xl font-black text-teal-700 mt-1">
            {pendingFulfillmentCount} <span className="text-xs font-normal text-slate-500">{t('dashboard.pendingOrders')}</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            {t('dashboard.unansweredInquiries')}
          </span>
          <div className="text-2xl font-black text-amber-700 mt-1">
            {pendingInquiriesCount} <span className="text-xs font-normal text-slate-500">{t('dashboard.newInquiries')}</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            {t('dashboard.totalSales')}
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {totalSalesVolume.toLocaleString()} <span className="text-xs font-normal text-slate-500">{t('common.currency')}</span>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-slate-200 text-xs gap-2 bg-white rounded-t-xl px-2 pt-2 shadow-xs">
        <button
          id="seller-tab-products"
          onClick={() => setActiveTab('products')}
          className={`px-4 py-3 font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 rounded-t-lg ${
            activeTab === 'products'
              ? 'text-teal-700 border-teal-600 bg-slate-50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t('dashboard.productCatalogTab')} ({sellerProducts.length})</span>
        </button>

        <button
          id="seller-tab-orders"
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-3 font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 rounded-t-lg ${
            activeTab === 'orders'
              ? 'text-teal-700 border-teal-600 bg-slate-50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/60'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{t('dashboard.incomingOrdersTab')} ({sellerOrders.length})</span>
        </button>

        <button
          id="seller-tab-inquiries"
          onClick={() => setActiveTab('inquiries')}
          className={`px-4 py-3 font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 rounded-t-lg ${
            activeTab === 'inquiries'
              ? 'text-teal-700 border-teal-600 bg-slate-50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/60'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{t('dashboard.inquiriesInboxTab')} ({sellerInquiries.length})</span>
        </button>
      </div>

      {/* Tab 1: Product Catalog & Stock Toggles */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-b-2xl rounded-tr-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
          {/* Sub-Header & Status Filter Bar */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                {t('dashboard.manualStockTitle')}
              </span>
              <span className="text-[11px] text-slate-500">
                Manage live status (Published, Draft, Archived) and stock levels synced with PostgreSQL backend.
              </span>
            </div>

            {/* Product Status Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({sellerProducts.length})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('published')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === 'published'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                Published
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('draft')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === 'draft'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Drafts
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('out_of_stock')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === 'out_of_stock'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                Out of Stock
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('archived')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === 'archived'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                Archived
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px]">
                  <th className="py-3.5 px-4">{t('dashboard.tableProductDetails')}</th>
                  <th className="py-3.5 px-3">{t('dashboard.tableWholesalePrice')}</th>
                  <th className="py-3.5 px-3">PUBLICATION STATUS</th>
                  <th className="py-3.5 px-3">{t('dashboard.tableStockToggle')}</th>
                  <th className="py-3.5 px-3">{t('dashboard.tableAvailableQty')}</th>
                  <th className="py-3.5 px-3">{t('dashboard.tableLeadTime')}</th>
                  <th className="py-3.5 px-4 text-right">{t('dashboard.tableActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSellerProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                      No products found matching current status filter.
                    </td>
                  </tr>
                ) : (
                  filteredSellerProducts.map(prod => {
                    const currentStatus = prod.status || (prod.stockStatus === 'out_of_stock' ? 'out_of_stock' : 'published');

                    return (
                      <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                        {/* Details */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <CanvasProductImage
                              src={prod.images[0]}
                              alt={prod.name}
                              className="w-full h-full object-contain"
                              containerClassName="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0"
                            />
                            <div className="max-w-xs">
                              <button
                                onClick={() => setSelectedProduct(prod)}
                                className="font-bold text-slate-900 hover:text-teal-700 text-left line-clamp-1 cursor-pointer"
                              >
                                {prod.name}
                              </button>
                              <div className="text-[11px] text-slate-500">{prod.categoryName}</div>
                            </div>
                          </div>
                        </td>

                        {/* Price / MOQ */}
                        <td className="py-3.5 px-3">
                          <div className="font-extrabold text-slate-900">
                            {prod.price.toLocaleString()} {prod.currency} <span className="font-normal text-slate-500">/ {prod.unit}</span>
                          </div>
                          <div className="text-[11px] text-slate-600">
                            {t('catalog.moqLabel')}: <strong>{prod.moq} {prod.unit}</strong>
                          </div>
                        </td>

                        {/* Publication Status Selector Dropdown */}
                        <td className="py-3.5 px-3">
                          <select
                            id={`status-select-${prod.id}`}
                            value={currentStatus}
                            onChange={e => handleStatusChange(prod.id, e.target.value)}
                            className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer transition-all ${
                              currentStatus === 'published'
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                                : currentStatus === 'draft'
                                ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                                : currentStatus === 'out_of_stock'
                                ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                                : 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                            }`}
                          >
                            <option value="published">🟢 Published</option>
                            <option value="draft">📝 Draft</option>
                            <option value="out_of_stock">⚠️ Out of Stock</option>
                            <option value="archived">📦 Archived</option>
                          </select>
                        </td>

                        {/* Manual Stock Status Toggle */}
                        <td className="py-3.5 px-3">
                          <select
                            id={`stock-select-${prod.id}`}
                            value={prod.stockStatus}
                            onChange={e => handleStockChange(prod.id, e.target.value as StockStatus)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                              prod.stockStatus === 'in_stock'
                                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-800'
                                : prod.stockStatus === 'low_stock'
                                ? 'bg-amber-50 border-amber-300 text-amber-800'
                                : 'bg-slate-200 border-slate-300 text-slate-600'
                            }`}
                          >
                            <option value="in_stock">{t('dashboard.inStock')}</option>
                            <option value="low_stock">{t('dashboard.lowStock')}</option>
                            <option value="out_of_stock">{t('dashboard.outOfStock')}</option>
                          </select>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {prod.stockLastUpdated}
                          </div>
                        </td>

                        {/* Quantity */}
                        <td className="py-3.5 px-3">
                          <span className="font-semibold text-slate-900">{prod.stockQuantity.toLocaleString()}</span>{' '}
                          <span className="text-[11px] text-slate-500">{prod.unit}</span>
                        </td>

                        {/* Lead Time */}
                        <td className="py-3.5 px-3 text-slate-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{prod.leadTime}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              id={`btn-edit-prod-${prod.id}`}
                              onClick={() => handleEditProduct(prod)}
                              className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer transition-colors"
                              title="Edit listing details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`btn-delete-prod-${prod.id}`}
                              onClick={() => deleteProduct(prod.id)}
                              className="p-1.5 rounded-lg border border-slate-300 hover:bg-rose-50 text-rose-600 cursor-pointer transition-colors"
                              title="Delete listing"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Incoming Orders & Fulfillment Workflow */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {sellerOrders.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              {t('dashboard.noOrders')}
            </div>
          ) : (
            sellerOrders.map(order => (
              <div
                key={order.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm text-slate-900">{t('orders.orderNumber')}{order.orderNumber}</strong>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          order.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t('dashboard.status')}: {order.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      {t('dashboard.buyer')}: <strong className="text-slate-900">{order.buyerBusinessName}</strong> ({order.buyerName}) &bull; {order.buyerPhone}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">
                      {order.totalAmount.toLocaleString()} {order.currency}
                    </div>
                    <div className="text-[10px] text-teal-700 font-medium">
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
                          containerClassName="w-8 h-8 rounded bg-slate-100 border border-slate-200 overflow-hidden shrink-0"
                        />
                        <span className="font-semibold text-slate-900">{it.productName}</span>
                      </div>
                      <div>
                        {it.quantity} {it.unit} &times; {it.unitPrice.toLocaleString()} {order.currency}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Location */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-0.5">{t('dashboard.destinationWarehouse')}:</span>
                  <div className="text-slate-600">
                    {order.deliveryAddress.landmark}, {order.deliveryAddress.subcity}, {order.deliveryAddress.city}, {order.deliveryAddress.region}
                  </div>
                </div>

                {/* Seller Advance Order Controls */}
                <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                  <div className="text-[11px] text-slate-500">
                    {order.status === 'placed' && 'Payment secured in escrow. Confirm & prepare package for dispatch.'}
                    {order.status === 'confirmed' && 'Package ready. Dispatch via regional logistics.'}
                    {order.status === 'shipped' && `Dispatched with ${order.carrierName} (${order.trackingNumber}). Awaiting buyer delivery confirmation.`}
                    {order.status === 'delivered' && 'Buyer confirmed delivery. Escrow funds released to your account.'}
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === 'placed' && (
                      <button
                        onClick={() => advanceOrderStatus(order.id, 'confirmed')}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        {t('dashboard.confirmOrder')} &rarr;
                      </button>
                    )}

                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => advanceOrderStatus(order.id, 'shipped')}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
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
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              {t('dashboard.noInquiries')}
            </div>
          ) : (
            sellerInquiries.map(inq => (
              <div
                key={inq.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <CanvasProductImage
                      src={inq.productImage}
                      alt={inq.productName}
                      className="w-full h-full object-contain"
                      containerClassName="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0"
                    />
                    <div>
                      <div className="font-bold text-sm text-slate-900">{inq.productName}</div>
                      <div className="text-[11px] text-slate-600">
                        {t('dashboard.buyer')}: <strong className="text-slate-900">{inq.buyerBusinessName}</strong> ({inq.buyerPhone})
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        inq.status === 'answered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {inq.status === 'answered' ? t('dashboard.answered') : t('dashboard.awaitingReply')}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1">Topic: {inq.topic.toUpperCase()}</div>
                  </div>
                </div>

                {/* Messages Thread */}
                <div className="space-y-2.5">
                  {inq.messages.map(m => (
                    <div
                      key={m.id}
                      className={`p-3 rounded-xl ${
                        m.isSeller ? 'bg-slate-100 border border-teal-500/30 ml-6' : 'bg-slate-50 border border-slate-200 mr-6'
                      }`}
                    >
                      <div className="flex justify-between text-[11px] font-bold text-slate-900 mb-1">
                        <span>{m.senderBusiness} ({m.isSeller ? 'You / Seller' : t('dashboard.buyer')})</span>
                        <span className="text-slate-500 font-normal">{m.timestamp}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{m.text}</p>
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
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                  <button
                    onClick={() => handleReplyInquiry(inq.id)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
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
