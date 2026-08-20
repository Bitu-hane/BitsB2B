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
    categories,
    selectedCategory,
    setSelectedCategory,
    setViewingView,
    currentUser,
    setAuthModalOpen,
  } = useMarketplace();

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const getCategoryIcon = (name: string) => {
    switch (name) {
      case 'Industrial Machinery':
        return <Cog className="w-4 h-4" />;
      case 'Packaging & Printing':
        return <Printer className="w-4 h-4" />;
      case 'Bags & Boxes':
        return <Box className="w-4 h-4" />;
      case 'Vehicle parts':
        return <Truck className="w-4 h-4" />;
      case 'Apparel & Accessories':
        return <Shirt className="w-4 h-4" />;
      case 'Furniture':
        return <Armchair className="w-4 h-4" />;
      case 'Computer Products':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId);
    setViewingView('catalog');
    setCategoryDropdownOpen(false);
  };

  return (
    <nav
      id="category-navigation-bar"
      className="w-full bg-[#162C30] border-b border-[#274B52] text-xs text-[#E2E8F0] font-sans relative z-30 shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-7 flex items-center justify-between h-10">
        {/* Left Side Navigation Links: All categories | Verified manufacturers */}
        <div className="flex items-center gap-6">
          {/* All categories Dropdown Trigger */}
          <div className="relative">
            <button
              id="cat-tab-all"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              onMouseEnter={() => setCategoryDropdownOpen(true)}
              className="flex items-center gap-2 py-2 font-medium text-[#E2E8F0] hover:text-[#F59E0B] transition-colors cursor-pointer"
            >
              <List className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-[13px] font-semibold">All categories</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#A8A196] transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Categories Dropdown Menu */}
            {categoryDropdownOpen && (
              <div
                className="absolute left-0 top-full mt-0 w-64 bg-[#112225] border border-[#274B52] rounded-b-2xl shadow-2xl py-2 z-50 text-xs text-[#E2E8F0]"
                onMouseLeave={() => setCategoryDropdownOpen(false)}
              >
                <button
                  onClick={() => handleCategoryClick('all')}
                  className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 hover:bg-white/10 hover:text-[#F59E0B] transition-colors ${
                    selectedCategory === 'all' ? 'font-bold text-[#F59E0B] bg-amber-500/10' : 'text-[#E2E8F0]'
                  }`}
                >
                  <Layers className="w-4 h-4 text-[#F59E0B]" />
                  <span>All Sourcing Categories</span>
                </button>
                <div className="h-px bg-[#274B52] my-1" />
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`w-full text-left px-4 py-2 flex items-center gap-2.5 hover:bg-white/10 hover:text-[#F59E0B] transition-colors ${
                      selectedCategory === cat.id ? 'font-bold text-[#F59E0B] bg-amber-500/10' : 'text-[#CBD5E1]'
                    }`}
                  >
                    <span className="text-[#A8A196]">{getCategoryIcon(cat.name)}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Verified manufacturers */}
          <button
            onClick={() => {
              setSelectedCategory('all');
              setViewingView('catalog');
            }}
            className="flex items-center gap-1.5 text-[13px] font-medium text-[#E2E8F0] hover:text-[#F59E0B] transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Verified manufacturers</span>
          </button>
        </div>

        {/* Right Side Navigation Links: About BitsB2B | Help Center | Accio Work | Sell on BitsB2B */}
        <div className="hidden md:flex items-center gap-6 text-[13px] font-medium text-[#CBD5E1]">
          <button
            onClick={() => setViewingView('catalog')}
            className="hover:text-[#F59E0B] transition-colors cursor-pointer"
          >
            About BitsB2B
          </button>

          <button
            onClick={() => setViewingView('catalog')}
            className="hover:text-[#F59E0B] transition-colors cursor-pointer"
          >
            Help Center
          </button>

  

          <button
            onClick={() => setViewingView('seller_dashboard')}
            className="hover:text-[#F59E0B] transition-colors cursor-pointer font-bold text-[#F59E0B]"
          >
            Supplier Dashboard
          </button>
        </div>
      </div>
    </nav>
  );
};
