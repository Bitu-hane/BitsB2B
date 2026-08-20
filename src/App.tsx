import React, { useState } from 'react';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { SMSNotificationBanner } from './components/SMSNotificationBanner';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { ProductCard } from './components/ProductCard';
import { AuthModal } from './components/AuthModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { StructuredInquiryModal } from './components/StructuredInquiryModal';
import { PlaceOrderModal } from './components/PlaceOrderModal';
import { PaymentEscrowModal } from './components/PaymentEscrowModal';
import { SellerProfileModal } from './components/SellerProfileModal';
import { ProductEditModal } from './components/ProductEditModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { OrderHistoryView } from './components/OrderHistoryView';
import { SellerDashboard } from './components/SellerDashboard';
import { InquiriesInboxView } from './components/InquiriesInboxView';
import { HeroSearch } from './components/HeroSearch';
import { CategoriesForYou } from './components/CategoriesForYou';
import {
  ShieldCheck,
  Truck,
  Building2,
  Lock,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2,
  Search,
  Store,
  Phone,
  HelpCircle,
  Package,
} from 'lucide-react';

const MarketplaceContent: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    setSelectedProduct,
    viewingView,
    setViewingView,
    currentUser,
    setAuthModalOpen,
  } = useMarketplace();

  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedZone, setSelectedZone] = useState('all');

  // Filter products by category, search query, verified seller, stock status, delivery zone
  const filteredProducts = products.filter(product => {
    if (selectedCategory !== 'all' && product.categoryId !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      const matchCategory = product.categoryName.toLowerCase().includes(q);
      const matchSeller = product.sellerBusinessName.toLowerCase().includes(q);
      const matchSpecs = Object.values(product.specifications || {}).some(v =>
        String(v).toLowerCase().includes(q)
      );
      if (!matchName && !matchDesc && !matchCategory && !matchSeller && !matchSpecs) {
        return false;
      }
    }
    if (verifiedOnly && !product.sellerVerified) {
      return false;
    }
    if (inStockOnly && product.stockStatus === 'out_of_stock') {
      return false;
    }
    if (selectedZone !== 'all') {
      const hasZone = product.deliveryZones.some(
        z => z.toLowerCase().includes(selectedZone.toLowerCase()) || z.toLowerCase().includes('nationwide')
      );
      if (!hasZone) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#162C30] flex flex-col font-sans selection:bg-[#C85A32]/20 selection:text-[#112225]">
      {/* 1. Real-time SMS Notification Toast Banner (UC16) */}
      <SMSNotificationBanner />

      {/* 2. Global Header */}
      <Header />

      {/* 3. Main Views Rendering */}
      {viewingView === 'orders' ? (
        <OrderHistoryView />
      ) : viewingView === 'seller_dashboard' ? (
        <SellerDashboard />
      ) : viewingView === 'inquiries' ? (
        <InquiriesInboxView />
      ) : (
        /* Catalog & Home View */
        <main className="flex-1 pb-16">
          {/* Category Navigation Bar */}
          <CategoryNav />

          {/* Hero Search Section (Alibaba Style Mode Tabs & Pill Input) */}
          <HeroSearch />

          {/* Categories for You Box & Frequently Searched Grid (Alibaba Style) */}
          <CategoriesForYou />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            {/* Sourcing Banner / Value Proposition */}
            <div className="bg-[#112225] text-[#F7F4EE] rounded-2xl p-6 md:p-8 border border-[#274B52] shadow-xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-2xl space-y-3 z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C85A32]/20 border border-[#C85A32]/30 text-[#E27D56] text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Industrial &amp; Wholesale Suppliers in Ethiopia
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F7F4EE] leading-tight">
                  Direct Factory &amp; Importer Sourcing with Guaranteed Escrow
                </h1>
                <p className="text-xs sm:text-sm text-[#A8A196] leading-relaxed">
                  Source industrial machinery, packaging boxes, vehicle parts, and bulk supplies.
                  All payments are held securely in <strong>Telebirr &amp; CBE Birr Escrow</strong> until physical delivery confirmation.
                </p>

                {/* Feature Chips */}
                <div className="pt-2 flex flex-wrap gap-4 text-xs text-[#EBE5DA]">
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#C85A32]" />
                    <span>Tiered Wholesale MOQ Pricing</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#C85A32]" />
                    <span>Live Stock Status Management</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#C85A32]" />
                    <span>Instant Regional Dispatch Alerts</span>
                  </div>
                </div>
              </div>

              {/* Decorative background grid pattern */}
              <div className="absolute right-0 top-0 bottom-0 w-96 opacity-10 pointer-events-none bg-[radial-gradient(#FFF_1px,transparent_1px)] [background-size:16px_16px]" />
            </div>

            {/* Filter & Subheader Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
              <div>
                <h2 className="text-lg font-bold text-[#112225] flex items-center gap-2">
                  <span>
                    {selectedCategory === 'all'
                      ? 'All Wholesale Products'
                      : categories.find(c => c.id === selectedCategory)?.name}
                  </span>
                  <span className="text-xs font-normal text-[#6E685F]">
                    ({filteredProducts.length} items found)
                  </span>
                </h2>
                {searchQuery && (
                  <p className="text-xs text-[#C85A32] mt-0.5">
                    Filtering by keyword: <strong>"{searchQuery}"</strong>{' '}
                    <button
                      onClick={() => setSearchQuery('')}
                      className="underline text-xs text-[#888] hover:text-[#112225] ml-1 cursor-pointer"
                    >
                      Clear search
                    </button>
                  </p>
                )}
              </div>

              {/* Interactive Filter Controls */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Verified Sellers Toggle (UC6) */}
                <button
                  id="filter-toggle-verified"
                  type="button"
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    verifiedOnly
                      ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#92400E]'
                      : 'bg-white border-[#D8CFBF] text-[#6E685F] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Verified Suppliers Only</span>
                </button>

                {/* In Stock Toggle (UC4/UC15) */}
                <button
                  id="filter-toggle-instock"
                  type="button"
                  onClick={() => setInStockOnly(!inStockOnly)}
                  className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    inStockOnly
                      ? 'bg-[#C85A32]/10 border-[#C85A32] text-[#C85A32]'
                      : 'bg-white border-[#D8CFBF] text-[#6E685F] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <span>In Stock Only</span>
                </button>

                {/* Delivery Zone Selector */}
                <select
                  id="filter-select-zone"
                  value={selectedZone}
                  onChange={e => setSelectedZone(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-[#D8CFBF] rounded-lg text-xs font-semibold text-[#112225] focus:outline-none focus:border-[#C85A32] cursor-pointer"
                >
                  <option value="all">All Delivery Zones</option>
                  <option value="Addis Ababa">Addis Ababa Metro</option>
                  <option value="Oromia">Oromia Region</option>
                  <option value="Hawassa">Hawassa Industrial Park</option>
                  <option value="Dire Dawa">Dire Dawa Free Trade</option>
                </select>
              </div>
            </div>

            {/* Anonymous Visitor Prompt Notice if Not Logged In */}
            {!currentUser && (
              <div
                id="anonymous-visitor-notice-banner"
                className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#D8CFBF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#C85A32] text-white flex items-center justify-center shrink-0 font-bold">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[#112225]">B2B Member Wholesale Pricing is Protected</strong>
                    <p className="text-[#6E685F]">
                      Register your verified business or test-login to unlock transparent tiered pricing, submit RFQ inquiries, and place escrow orders.
                    </p>
                  </div>
                </div>

                <button
                  id="btn-banner-login-action"
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="px-4 py-2 bg-[#C85A32] hover:bg-[#A34320] text-white font-bold rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  Register / Login (100% Free)
                </button>
              </div>
            )}

            {/* Product Catalog Grid */}
            {filteredProducts.length === 0 ? (
              <div className="p-16 text-center bg-white rounded-2xl border border-[#E5DFD5] space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#FAF7F2] flex items-center justify-center text-[#888] mx-auto">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#112225]">No Products Match Filters</h3>
                <p className="text-xs text-[#6E685F] max-w-sm mx-auto">
                  Try clearing your search query or toggling off the strict verification filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setVerifiedOnly(false);
                    setInStockOnly(false);
                    setSelectedZone('all');
                  }}
                  className="px-4 py-2 bg-[#112225] hover:bg-[#274B52] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={p => setSelectedProduct(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* Global Modals & Drawers */}
      <AuthModal />
      <ProductDetailModal />
      <StructuredInquiryModal />
      <PlaceOrderModal />
      <PaymentEscrowModal />
      <SellerProfileModal />
      <ProductEditModal />
      <NotificationDrawer />

      {/* Footer */}
      <footer className="w-full bg-[#112225] text-[#F7F4EE] border-t border-[#274B52] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
            {/* Col 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#C85A32] flex items-center justify-center font-bold text-white text-base">
                  BB
                </div>
                <span className="text-base font-bold tracking-tight">BitsB2B Marketplace</span>
              </div>
              <p className="text-[#A8A196] leading-relaxed">
                Empowering wholesale commerce, manufacturing supply chains, and industrial procurement across Ethiopia &amp; East Africa.
              </p>
              <div className="text-[11px] text-[#A8A196] pt-1">
                Addis Ababa Metro &bull; Mojo Dry Port &bull; Hawassa IP
              </div>
            </div>

            {/* Col 2 */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-[#F7F4EE]">Wholesale Categories</h4>
              <ul className="space-y-1.5 text-[#A8A196]">
                {categories.slice(0, 5).map(c => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory(c.id);
                        setViewingView('catalog');
                      }}
                      className="hover:text-[#E27D56] transition-colors cursor-pointer"
                    >
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-[#F7F4EE]">B2B Trade Security</h4>
              <ul className="space-y-1.5 text-[#A8A196]">
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Telebirr Escrow Protection</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>CBE Birr Corporate Escrow</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>TIN &amp; Trade License Verification</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Nationwide Pallet Freight Logistics</span>
                </li>
              </ul>
            </div>

            {/* Col 4 */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-[#F7F4EE]">Supplier Hub</h4>
              <p className="text-[#A8A196]">
                Are you a licensed manufacturer, importer, or bulk distributor in Ethiopia?
              </p>
              <button
                type="button"
                onClick={() => {
                  if (currentUser?.isSeller) {
                    setViewingView('seller_dashboard');
                  } else {
                    setAuthModalOpen(true);
                  }
                }}
                className="px-4 py-2 bg-[#1D383D] hover:bg-[#2D545C] text-white border border-[#34626B] rounded-xl font-semibold transition-colors cursor-pointer"
              >
                {currentUser?.isSeller ? 'Open Seller Dashboard &rarr;' : 'Register as Supplier &rarr;'}
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#274B52] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#A8A196]">
            <div>
              &copy; {new Date().getFullYear()} BitsB2B Marketplace. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Trade Terms</span>
              <span>&bull;</span>
              <span>Escrow Protection Policy</span>
              <span>&bull;</span>
              <span>Logistics Standards</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <MarketplaceProvider>
      <MarketplaceContent />
    </MarketplaceProvider>
  );
}

export default App;
