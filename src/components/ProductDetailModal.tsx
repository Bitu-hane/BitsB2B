import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  X,
  ShieldCheck,
  MapPin,
  Clock,
  Truck,
  CheckCircle2,
  Lock,
  MessageSquare,
  ShoppingCart,
  Building2,
  Star,
  Package,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    currentUser,
    setAuthModalOpen,
    setInquiryTargetProduct,
    setInquiryModalOpen,
    setOrderTargetProduct,
    setOrderModalOpen,
    setSelectedSeller,
    allUsers,
  } = useMarketplace();

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!selectedProduct) return null;

  const handleSellerClick = () => {
    const sellerUser = allUsers.find(u => u.business.id === selectedProduct.sellerId || u.isSeller);
    if (sellerUser) {
      setSelectedSeller(sellerUser.business);
    } else {
      setSelectedSeller({
        id: selectedProduct.sellerId,
        name: selectedProduct.sellerBusinessName,
        role: 'producer',
        phone: '+251 91 123 4567',
        region: selectedProduct.sellerRegion,
        city: 'Addis Ababa',
        verificationStatus: selectedProduct.sellerVerified ? 'verified' : 'unverified',
        establishedYear: 2015,
        averageResponseTime: '< 2 hours',
        responseRate: '98%',
        rating: 4.8,
        totalOrdersCompleted: 150,
        description: 'Verified B2B wholesale producer and distributor.',
      });
    }
  };

  const handleInquire = () => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setInquiryTargetProduct(selectedProduct);
    setInquiryModalOpen(true);
  };

  const handleOrder = () => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setOrderTargetProduct(selectedProduct);
    setOrderModalOpen(true);
  };

  return (
    <AnimatePresence>
      <div
        id="product-detail-modal-backdrop"
        className="fixed inset-0 z-50 bg-[#0B1718]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        onClick={() => setSelectedProduct(null)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          onClick={e => e.stopPropagation()}
          className="bg-[#FFFFFF] text-[#162C30] rounded-2xl max-w-4xl w-full shadow-2xl border border-[#E5DFD5] overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header Bar */}
          <div className="bg-[#112225] text-[#F7F4EE] px-6 py-4 flex items-center justify-between border-b border-[#274B52] shrink-0">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#A8A196]">Catalog</span>
              <span className="text-[#666]">&rarr;</span>
              <span className="text-[#E27D56] font-medium">{selectedProduct.categoryName}</span>
              <span className="text-[#666]">&rarr;</span>
              <span className="text-[#F7F4EE] truncate max-w-[200px] sm:max-w-xs">{selectedProduct.name}</span>
            </div>
            <button
              id="btn-close-product-detail"
              onClick={() => setSelectedProduct(null)}
              className="text-[#888] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content Scroll Area */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Top Grid: Gallery & Main Info */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Image Gallery (Left 5 cols) */}
              <div className="md:col-span-5 space-y-3">
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#F3EFE9] border border-[#E5DFD5] relative">
                  <img
                    src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#112225]/80 backdrop-blur-xs text-[#F7F4EE] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      {selectedProduct.categoryName}
                    </span>
                  </div>
                </div>

                {/* Thumbnails */}
                {selectedProduct.images.length > 1 && (
                  <div className="flex gap-2">
                    {selectedProduct.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-16 h-14 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                          activeImageIndex === idx ? 'border-[#C85A32] shadow-sm' : 'border-[#E5DFD5] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Supplier Trust Card (UC6 & UC7) */}
                <div className="p-4 bg-[#FBF9F5] rounded-xl border border-[#E5DFD5]">
                  <div className="text-[10px] uppercase font-bold text-[#888] tracking-wider mb-2">
                    Supplier Profile
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-[#112225] flex items-center gap-1.5">
                        <span>{selectedProduct.sellerBusinessName}</span>
                      </div>
                      <div className="text-xs text-[#6E685F] mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#C85A32]" />
                        <span>{selectedProduct.sellerRegion}</span>
                      </div>
                    </div>

                    {selectedProduct.sellerVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#92400E] bg-[#FEF3C7] border border-[#FCD34D] px-2 py-0.5 rounded-full shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#D97706]" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#888] bg-[#EFEAE0] px-2 py-0.5 rounded-full shrink-0">
                        Unverified
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#EFEAE0] text-xs">
                    <div>
                      <span className="text-[#888] text-[11px] block">Avg Response:</span>
                      <span className="font-semibold text-[#112225]">&lt; 2 Hours</span>
                    </div>
                    <div>
                      <span className="text-[#888] text-[11px] block">Trade Rating:</span>
                      <span className="font-semibold text-[#112225] flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[#D97706] text-[#D97706]" /> 4.9 (99%)
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleSellerClick}
                    className="w-full mt-3 py-1.5 bg-white hover:bg-[#F3EFE6] border border-[#D8CFBF] text-xs font-semibold text-[#162C30] rounded-lg transition-colors cursor-pointer text-center"
                  >
                    View Supplier Showroom &rarr;
                  </button>
                </div>
              </div>

              {/* Product Specifications & Commercial Terms (Right 7 cols) */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <h1 className="text-xl font-bold text-[#112225] leading-snug">
                    {selectedProduct.name}
                  </h1>
                  <p className="text-xs text-[#6E685F] mt-1.5 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Price Section (UC4 restricted view if not registered) */}
                <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5]">
                  {currentUser ? (
                    <div>
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-xs font-semibold text-[#6E685F]">Standard Unit Price:</span>
                        <div className="text-xl font-bold text-[#C85A32]">
                          {selectedProduct.price.toLocaleString()}{' '}
                          <span className="text-sm font-medium text-[#112225]">{selectedProduct.currency}</span>
                          <span className="text-xs font-normal text-[#6E685F]"> / {selectedProduct.unit}</span>
                        </div>
                      </div>

                      {/* Tiered Volume Discount Table */}
                      {selectedProduct.priceTiers && selectedProduct.priceTiers.length > 0 && (
                        <div className="mt-3">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-[#888] mb-1.5">
                            Wholesale Tier Pricing (MOQ Scaled)
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            {selectedProduct.priceTiers.map((tier, idx) => (
                              <div
                                key={idx}
                                className="p-2 bg-white rounded-lg border border-[#D8CFBF] text-xs"
                              >
                                <div className="text-[#6E685F] font-medium text-[11px]">
                                  {tier.maxQty ? `${tier.minQty} - ${tier.maxQty}` : `${tier.minQty}+`}{' '}
                                  {selectedProduct.unit}
                                </div>
                                <div className="font-bold text-[#C85A32] mt-0.5">
                                  {tier.pricePerUnit.toLocaleString()} {selectedProduct.currency}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#C85A32]/10 text-[#C85A32] mb-2">
                        <Lock className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-[#112225]">Wholesale Pricing Protected</h4>
                      <p className="text-xs text-[#6E685F] max-w-sm mx-auto mt-1 mb-3">
                        Wholesale rates and tiered volume discounts are exclusively available to verified business accounts.
                      </p>
                      <button
                        onClick={() => setAuthModalOpen(true)}
                        className="px-4 py-2 bg-[#C85A32] hover:bg-[#A34320] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                      >
                        Register or Sign In to View Price
                      </button>
                    </div>
                  )}
                </div>

                {/* Sourcing Parameters Table */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-[#FBF9F5] rounded-xl border border-[#E5DFD5]">
                    <span className="text-[11px] text-[#888] block">Min Order Qty (MOQ)</span>
                    <span className="text-sm font-bold text-[#112225]">
                      {selectedProduct.moq.toLocaleString()} {selectedProduct.unit}
                    </span>
                  </div>

                  <div className="p-3 bg-[#FBF9F5] rounded-xl border border-[#E5DFD5]">
                    <span className="text-[11px] text-[#888] block">Stock Status</span>
                    <span className="text-xs font-bold text-[#112225] capitalize flex items-center gap-1 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                      {selectedProduct.stockStatus.replace('_', ' ')} ({selectedProduct.stockQuantity})
                    </span>
                    <span className="text-[10px] text-[#888] block mt-0.5">
                      Updated: {selectedProduct.stockLastUpdated}
                    </span>
                  </div>

                  <div className="p-3 bg-[#FBF9F5] rounded-xl border border-[#E5DFD5]">
                    <span className="text-[11px] text-[#888] block">Dispatch Lead Time</span>
                    <span className="text-xs font-bold text-[#112225] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-[#C85A32]" />
                      {selectedProduct.leadTime}
                    </span>
                  </div>
                </div>

                {/* Delivery Zones */}
                <div className="p-3.5 bg-[#FBF9F5] rounded-xl border border-[#E5DFD5]">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#112225] mb-1.5">
                    <Truck className="w-4 h-4 text-[#C85A32]" />
                    <span>Eligible Freight &amp; Delivery Zones</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProduct.deliveryZones.map((zone, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium bg-white text-[#112225] px-2.5 py-1 rounded-md border border-[#D8CFBF]"
                      >
                        {zone}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Escrow Protection Guarantee */}
                <div className="p-3 bg-[#FEF3C7] border border-[#FCD34D] rounded-xl flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-[#D97706] shrink-0" />
                  <div className="text-xs text-[#92400E]">
                    <span className="font-bold">BitsB2B Escrow Assurance:</span> Payment held securely in
                    Telebirr / CBE Birr escrow until you confirm delivery at your warehouse.
                  </div>
                </div>

                {/* Primary Action CTA buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    id="btn-modal-inquire-rfq"
                    onClick={handleInquire}
                    className="py-3 px-4 bg-[#F3EFE6] hover:bg-[#EBE5DA] text-[#162C30] font-semibold text-xs rounded-xl border border-[#D8CFBF] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-[#C85A32]" />
                    <span>Ask a Question (Structured RFQ)</span>
                  </button>

                  <button
                    id="btn-modal-place-order"
                    onClick={handleOrder}
                    disabled={selectedProduct.stockStatus === 'out_of_stock'}
                    className={`py-3 px-4 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md ${
                      selectedProduct.stockStatus === 'out_of_stock'
                        ? 'bg-[#E5DFD5] text-[#999] cursor-not-allowed'
                        : 'bg-[#C85A32] hover:bg-[#A34320] text-white'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Place Order (Escrow Protected)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Full Specifications Table */}
            {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
              <div className="pt-4 border-t border-[#EFEAE0]">
                <h3 className="text-sm font-bold text-[#112225] mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C85A32]" />
                  <span>Technical Specifications &amp; Parameters</span>
                </h3>
                <div className="bg-[#FAF7F2] rounded-xl border border-[#E5DFD5] overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E5DFD5]">
                    {Object.entries(selectedProduct.specifications).map(([key, value], idx) => (
                      <div key={idx} className="p-3 text-xs flex justify-between border-b border-[#E5DFD5]">
                        <span className="font-medium text-[#6E685F]">{key}:</span>
                        <span className="font-semibold text-[#112225] text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
