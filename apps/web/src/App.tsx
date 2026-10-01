'use client';

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
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { HeroSearch } from './components/HeroSearch';
import { CategoriesForYou } from './components/CategoriesForYou';
import { LoginPage } from './components/LoginPage';
import { SignUpPage } from './components/SignUpPage';
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
    if (selectedCategory !== 'all' && product.categoryId !== selectedCategory && product.categoryName !== selectedCategory) {
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
    <div className="min-h-screen bg-[#F1F2F5] text-[#1E2128] flex flex-col font-sans selection:bg-[#C08829]/20 selection:text-[#1B2340]">
      {/* 1. Real-time SMS Notification Toast Banner (UC16) */}
      <SMSNotificationBanner />

      {/* 2. Global Header */}
      <Header />

      {/* Shared primary workspace navigation */}
      <CategoryNav />

      {/* 3. Main Views Rendering */}
      {viewingView === 'orders' ? (
        <OrderHistoryView />
      ) : viewingView === 'seller_dashboard' ? (
        <SellerDashboard />
      ) : viewingView === 'inquiries' ? (
        <InquiriesInboxView />
      ) : viewingView === 'subscription_plans' ? (
        <SubscriptionPlans />
      ) : (
        /* Catalog & Home View */
        <main className="flex-1 pb-16">
          {/* Catalog Top Subheader & Filter Pills Bar (Screenshot 3 Layout) */}
          <div className="bg-slate-50 border-b border-slate-200 py-6">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-bold text-2xl tracking-tight text-slate-900">
                Wholesale catalog
              </h2>

              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Verified Toggle Pill */}
                <button
                  id="filter-toggle-verified"
                  type="button"
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold transition-colors cursor-pointer border ${
                    verifiedOnly
                      ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-slate-500'
                  }`}
                >
                  <span className="text-xs">✓</span>
                  <span>Verified suppliers only</span>
                </button>

                {/* In Stock Toggle Pill */}
                <button
                  id="filter-toggle-instock"
                  type="button"
                  onClick={() => setInStockOnly(!inStockOnly)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold transition-colors cursor-pointer border ${
                    inStockOnly
                      ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-slate-500'
                  }`}
                >
                  <span>In stock only</span>
                </button>

                {/* Delivery Zone Selector Pill */}
                <select
                  id="filter-select-zone"
                  value={selectedZone}
                  onChange={e => setSelectedZone(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-900 px-3.5 py-2 rounded-full text-[13px] font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">Addis Ababa Metro</option>
                  <option value="Oromia">Oromia Region</option>
                  <option value="Hawassa">Hawassa Industrial Park</option>
                  <option value="Dire Dawa">Dire Dawa Free Trade</option>
                </select>
              </div>
            </div>
          </div>

          {/* Catalog Body (2 Columns: Left Sidebar Filters + Right Product Grid) */}
          <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-8 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
            {/* Left Sidebar Filter Column */}
            <aside className="space-y-6">
              {/* Category Filter */}
              <div className="filter-block">
                <h5 className="font-serif italic font-semibold text-xs text-[#6B7078] uppercase tracking-wider mb-3">
                  Category
                </h5>
                <div className="space-y-1.5 text-[13.5px]">
                  <label className="flex items-center gap-2.5 cursor-pointer hover:text-[#C08829]">
                    <input
                      type="checkbox"
                      checked={selectedCategory === 'all'}
                      onChange={() => setSelectedCategory('all')}
                      className="accent-[#33553A] w-[15px] h-[15px]"
                    />
                    <span>All Categories</span>
                  </label>
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer hover:text-[#C08829]">
                      <input
                        type="checkbox"
                        checked={selectedCategory === cat.id}
                        onChange={() => setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id)}
                        className="accent-[#33553A] w-[15px] h-[15px]"
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Delivery Zone Filter */}
              <div className="filter-block pt-4 border-t border-[#E2E4EA]">
                <h5 className="font-serif italic font-semibold text-xs text-[#6B7078] uppercase tracking-wider mb-3">
                  Delivery zone
                </h5>
                <div className="space-y-1.5 text-[13.5px]">
                  <label className="flex items-center gap-2.5 cursor-pointer hover:text-[#C08829]">
                    <input
                      type="checkbox"
                      checked={selectedZone === 'all'}
                      onChange={() => setSelectedZone('all')}
                      className="accent-[#33553A] w-[15px] h-[15px]"
                    />
                    <span>Addis Ababa Metro</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer hover:text-[#C08829]">
                    <input
                      type="checkbox"
                      checked={selectedZone === 'Oromia'}
                      onChange={() => setSelectedZone(selectedZone === 'Oromia' ? 'all' : 'Oromia')}
                      className="accent-[#33553A] w-[15px] h-[15px]"
                    />
                    <span>Oromia</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer hover:text-[#C08829]">
                    <input
                      type="checkbox"
                      checked={selectedZone === 'Hawassa'}
                      onChange={() => setSelectedZone(selectedZone === 'Hawassa' ? 'all' : 'Hawassa')}
                      className="accent-[#33553A] w-[15px] h-[15px]"
                    />
                    <span>Hawassa</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer hover:text-[#C08829]">
                    <input
                      type="checkbox"
                      checked={selectedZone === 'Nationwide'}
                      onChange={() => setSelectedZone(selectedZone === 'Nationwide' ? 'all' : 'Nationwide')}
                      className="accent-[#33553A] w-[15px] h-[15px]"
                    />
                    <span>Nationwide freight</span>
                  </label>
                </div>
              </div>

              {/* Minimum Order Qty Filter */}
              <div className="filter-block pt-4 border-t border-[#E2E4EA]">
                <h5 className="font-serif italic font-semibold text-xs text-[#6B7078] uppercase tracking-wider mb-3">
                  Minimum order qty
                </h5>
                <div className="space-y-1.5 text-[13.5px]">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" className="accent-[#33553A] w-[15px] h-[15px]" />
                    <span>Under 50 units</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-[#33553A] w-[15px] h-[15px]" />
                    <span>50–500 units</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" className="accent-[#33553A] w-[15px] h-[15px]" />
                    <span>500+ units</span>
                  </label>
                </div>
              </div>
            </aside>

            {/* Right Column: Product Grid */}
            <section>
              {filteredProducts.length === 0 ? (
                <div className="p-16 text-center bg-white rounded-[18px] border border-dashed border-[#E2E4EA] space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#F1F2F5] flex items-center justify-center text-[#6B7078] mx-auto">
                    <Package className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1E2128]">No Products Match Filters</h3>
                  <p className="text-xs text-[#6B7078] max-w-sm mx-auto">
                    Try clearing your search query or toggling off the filter checkboxes.
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
                    className="px-5 py-2.5 bg-[#1B2340] text-[#F4EFE3] hover:bg-[#223B28] text-xs font-semibold rounded-[7px] transition-colors cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={p => setSelectedProduct(p)}
                    />
                  ))}
                </div>
              )}
            </section>
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

      {/* 4. Footer (Exact Ledger Navy Theme from test.html & Screenshot 4) */}
      <footer className="w-full bg-[#1B2340] text-[#A7AECB] pt-[50px] pb-[26px] mt-auto">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10">
            {/* Col 1: Logo & Info */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-[36px] h-[36px] rounded-[8px] bg-[#C08829] font-serif font-bold text-base text-[#1B2340] flex items-center justify-center">
                  B2
                </div>
                <span className="font-serif font-semibold text-[19px] text-[#F4EFE3]">
                  Bits<em className="not-italic text-[#C08829]">B2B</em>.et
                </span>
              </div>
              <p className="text-[13px] leading-relaxed max-w-[38ch] text-[#A7AECB] mb-3">
                Empowering wholesale commerce, manufacturing supply chains, and industrial procurement across Ethiopia and East Africa.
              </p>
              <div className="text-[12px] text-[#A7AECB]/80 font-mono">
                Addis Ababa Metro &mdash; Mojo Dry Port &mdash; Hawassa Industrial Park
              </div>
            </div>

            {/* Col 2: Categories */}
            <div>
              <h5 className="text-[#F4EFE3] text-[13.5px] font-semibold mb-3.5">Wholesale categories</h5>
              <ul className="space-y-2 text-[13px] list-none p-0 m-0">
                {categories.slice(0, 4).map(c => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory(c.id);
                        setViewingView('catalog');
                      }}
                      className="hover:text-[#F4EFE3] transition-colors cursor-pointer text-left"
                    >
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Trade Security */}
            <div>
              <h5 className="text-[#F4EFE3] text-[13.5px] font-semibold mb-3.5">Trade security</h5>
              <ul className="space-y-2 text-[13px] list-none p-0 m-0">
                <li>Telebirr escrow protection</li>
                <li>CBE Birr corporate escrow</li>
                <li>TIN &amp; trade license verification</li>
                <li>Nationwide pallet freight</li>
              </ul>
            </div>

            {/* Col 4: Supplier Hub */}
            <div>
              <h5 className="text-[#F4EFE3] text-[13.5px] font-semibold mb-3.5">Supplier hub</h5>
              <p className="text-[13px] leading-relaxed mb-3">
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
                className="text-[#C08829] font-bold text-[13px] hover:underline cursor-pointer inline-block"
              >
                Register as supplier
              </button>
            </div>
          </div>

          <div className="border-t border-[#F4EFE3]/10 mt-9 pt-[20px] flex flex-wrap items-center justify-between text-[12.5px] gap-2">
            <div>&copy; 2026 BM B2B Marketplace. All rights reserved.</div>
            <div className="flex items-center gap-4 text-[#A7AECB]">
              <span>Trade Terms</span>
              <span>&mdash;</span>
              <span>Escrow Protection Policy</span>
              <span>&mdash;</span>
              <span>Logistics Standards</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export interface AppProps {
  defaultView?: 'home' | 'catalog' | 'orders' | 'seller_dashboard' | 'inquiries' | 'subscription_plans';
  defaultAuthView?: 'login' | 'signup' | 'marketplace';
}

const MainApp: React.FC<{ defaultView?: any; defaultAuthView?: any }> = ({ defaultView }) => {
  const { currentUser, authView, setViewingView } = useMarketplace();

  React.useEffect(() => {
    if (defaultView) setViewingView(defaultView);
  }, [defaultView, setViewingView]);

  if (!currentUser && authView === 'signup') {
    return <SignUpPage />;
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  return <MarketplaceContent />;
};

export function App({ defaultView, defaultAuthView }: AppProps = {}) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <MainApp defaultView={defaultView} defaultAuthView={defaultAuthView} />;
}

export default App;
