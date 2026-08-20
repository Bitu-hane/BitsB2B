import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  X,
  ShieldCheck,
  MapPin,
  Clock,
  Star,
  Package,
  Calendar,
  Building2,
  Phone,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';
import { ProductCard } from './ProductCard';
import { motion, AnimatePresence } from 'motion/react';

export const SellerProfileModal: React.FC = () => {
  const { selectedSeller, setSelectedSeller, products, setSelectedProduct } = useMarketplace();

  if (!selectedSeller) return null;

  // Filter products by this seller
  const sellerProducts = products.filter(
    p => p.sellerId === selectedSeller.id || p.sellerBusinessName === selectedSeller.name
  );

  return (
    <AnimatePresence>
      <div
        id="seller-profile-modal-backdrop"
        className="fixed inset-0 z-50 bg-[#0B1718]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        onClick={() => setSelectedSeller(null)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onClick={e => e.stopPropagation()}
          className="bg-[#FFFFFF] text-[#162C30] rounded-2xl max-w-5xl w-full shadow-2xl border border-[#E5DFD5] overflow-hidden max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-[#112225] text-[#F7F4EE] p-6 border-b border-[#274B52] relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#C85A32] flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0">
                {selectedSeller.name.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#F7F4EE]">
                    {selectedSeller.name}
                  </h1>
                  {selectedSeller.verificationStatus === 'verified' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#D97706] bg-[#FEF3C7]/20 border border-[#D97706]/40 px-2.5 py-0.5 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Supplier
                    </span>
                  ) : (
                    <span className="text-xs text-[#888] bg-[#1D383D] px-2.5 py-0.5 rounded-full">
                      Unverified
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#A8A196] mt-1 flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
                    {selectedSeller.subcity ? `${selectedSeller.subcity}, ` : ''}{selectedSeller.city}, {selectedSeller.region}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#A8A196]" />
                    Est. {selectedSeller.establishedYear}
                  </span>
                  <span>&bull;</span>
                  <span className="capitalize text-[#E27D56] font-semibold">
                    Role: {selectedSeller.role}
                  </span>
                </p>
              </div>
            </div>

            <button
              id="btn-close-seller-profile"
              onClick={() => setSelectedSeller(null)}
              className="text-[#888] hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer self-start sm:self-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Verification & Trust Metrics Grid (UC6 / UC7) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5] text-xs">
                <span className="text-[#888] text-[11px] block">Avg Response Time</span>
                <span className="text-sm font-bold text-[#112225] flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-[#C85A32]" />
                  {selectedSeller.averageResponseTime}
                </span>
              </div>

              <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5] text-xs">
                <span className="text-[#888] text-[11px] block">Response Rate</span>
                <span className="text-sm font-bold text-[#112225] mt-0.5 block">
                  {selectedSeller.responseRate}
                </span>
              </div>

              <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5] text-xs">
                <span className="text-[#888] text-[11px] block">Supplier Rating</span>
                <span className="text-sm font-bold text-[#112225] flex items-center gap-1 mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />
                  {selectedSeller.rating} / 5.0
                </span>
              </div>

              <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5] text-xs">
                <span className="text-[#888] text-[11px] block">Escrow Orders Completed</span>
                <span className="text-sm font-bold text-[#112225] mt-0.5 block">
                  {selectedSeller.totalOrdersCompleted}+ Deals
                </span>
              </div>
            </div>

            {/* Business Description & Licenses */}
            <div className="p-4 bg-[#FBF9F5] rounded-xl border border-[#E5DFD5] space-y-2 text-xs">
              <h3 className="font-bold text-sm text-[#112225]">About Supplier &amp; Manufacturing Capacity</h3>
              <p className="text-[#6E685F] leading-relaxed">
                {selectedSeller.description}
              </p>

              {selectedSeller.licenseNumber && (
                <div className="pt-2 border-t border-[#EFEAE0] flex flex-wrap gap-4 text-[11px] text-[#112225]">
                  <span className="flex items-center gap-1 font-medium">
                    <FileCheck className="w-3.5 h-3.5 text-[#D97706]" />
                    Trade License: <strong className="font-mono">{selectedSeller.licenseNumber}</strong>
                  </span>
                  {selectedSeller.tinNumber && (
                    <span className="flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D97706]" />
                      TIN: <strong className="font-mono">{selectedSeller.tinNumber}</strong>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Seller Product Catalog Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#112225] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#C85A32]" />
                  <span>Product Catalog ({sellerProducts.length} Listings)</span>
                </h3>
                <span className="text-xs text-[#888]">
                  Direct wholesale supply &bull; MOQ enabled
                </span>
              </div>

              {sellerProducts.length === 0 ? (
                <div className="p-8 text-center bg-[#FAF7F2] rounded-xl border border-[#E5DFD5] text-xs text-[#888]">
                  No products listed yet by this seller.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sellerProducts.map(prod => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onSelect={p => {
                        setSelectedSeller(null);
                        setSelectedProduct(p);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
