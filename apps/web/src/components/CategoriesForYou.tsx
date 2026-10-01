'use client';
import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  Star,
  ChevronRight,
  Cog,
  Printer,
  Box,
  Truck,
  Shirt,
  Armchair,
  Monitor,
  Layers,
  ShieldCheck,
  ArrowRight,
  X,
  Flame,
  TrendingUp,
  Package,
  Cpu,
  ShoppingBag,
  Zap,
  Tag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCategory } from '../types';
import { CanvasProductImage } from './CanvasProductImage';

interface SubcategoryItem {
  name: string;
  isHot?: boolean;
  isTrending?: boolean;
}

export const CategoriesForYou: React.FC = () => {
  const { categories, products, setSelectedCategory, setViewingView, setSelectedProduct } = useMarketplace();
  const [activeCategory, setActiveCategory] = useState<ProductCategory | null>(null);

  const getCategoryIcon = (name: string) => {
    switch (name) {
      case 'Industrial Machinery':
        return <Cog className="w-4 h-4 text-[#C85A32]" />;
      case 'Packaging & Printing':
        return <Printer className="w-4 h-4 text-[#C85A32]" />;
      case 'Bags & Boxes':
        return <Box className="w-4 h-4 text-[#C85A32]" />;
      case 'Vehicle parts':
        return <Truck className="w-4 h-4 text-[#C85A32]" />;
      case 'Apparel & Accessories':
        return <Shirt className="w-4 h-4 text-[#C85A32]" />;
      case 'Furniture':
        return <Armchair className="w-4 h-4 text-[#C85A32]" />;
      case 'Computer Products':
        return <Monitor className="w-4 h-4 text-[#C85A32]" />;
      default:
        return <Layers className="w-4 h-4 text-[#C85A32]" />;
    }
  };

  // Structured Subcategories List matching Alibaba layout
  const SUBCATEGORIES_DATA: Record<string, SubcategoryItem[]> = {
    'cat-packaging': [
      { name: 'Cardboard Boxes', isHot: true },
      { name: 'Printed Poly Bags', isTrending: true },
      { name: 'Printing Ink & Reels' },
      { name: 'Bottle Labels & Caps', isHot: true },
      { name: 'Corrugated Cartons' },
      { name: 'Woven Sack Rolls', isTrending: true },
      { name: 'Eco Kraft Packages' },
      { name: 'Shrink Film Wraps', isHot: true },
      { name: 'Blister Packaging' },
      { name: 'Labeling Tape', isTrending: true },
      { name: 'Custom Gift Boxes' },
      { name: 'Packaging Straps' },
    ],
    'cat-industrial': [
      { name: 'Slurry Pumps', isHot: true },
      { name: 'Bag Heat Sealers', isTrending: true },
      { name: 'Electric Motors' },
      { name: 'Hydraulic Cylinders', isHot: true },
      { name: 'Water Filter Units' },
      { name: 'Diesel Generators', isTrending: true },
      { name: 'Air Compressors' },
      { name: 'Conveyor Belts', isHot: true },
      { name: 'CNC Lathe Units' },
      { name: 'Heavy Cranes', isTrending: true },
      { name: 'Sludge Separators' },
      { name: 'Industrial Valves' },
    ],
    'cat-bags': [
      { name: '50kg Grain Sacks', isHot: true },
      { name: 'Shipping Cartons', isTrending: true },
      { name: 'Jumbo Bulk Bags' },
      { name: 'Export Pallets', isHot: true },
      { name: 'Plastic Bins' },
      { name: 'Storage Crates', isTrending: true },
      { name: 'Woven Sacks', isHot: true },
      { name: 'Strapping Film' },
      { name: 'Metal Drums' },
      { name: 'Container Liners' },
      { name: 'Wooden Boxes' },
      { name: 'Mesh Tote Bags' },
    ],
    'cat-vehicle': [
      { name: 'Brake Chambers', isHot: true },
      { name: 'Fuel Filters', isTrending: true },
      { name: 'Hydraulic Lifts' },
      { name: 'Air Suspensions', isHot: true },
      { name: 'Common Injectors' },
      { name: 'Commercial Tyres', isTrending: true },
      { name: 'Heavy Engine Oil', isHot: true },
      { name: 'Turbochargers' },
      { name: 'Truck Axles' },
      { name: 'Batteries', isTrending: true },
      { name: 'Radiator Units' },
      { name: 'Clutch Plates' },
    ],
    'cat-apparel': [
      { name: 'Safety Vests', isHot: true },
      { name: 'Work Boots', isTrending: true },
      { name: 'Factory Uniforms' },
      { name: 'Technical Fabrics', isHot: true },
      { name: 'Work Gloves' },
      { name: 'Industrial Overalls', isTrending: true },
      { name: 'Leather Aprons' },
      { name: 'Hard Helmets', isHot: true },
      { name: 'Rainwear Coats' },
      { name: 'Thermal Jackets' },
      { name: 'Reflective Pants' },
      { name: 'Filter Masks' },
    ],
    'cat-furniture': [
      { name: 'Mesh Office Chairs', isHot: true },
      { name: 'Warehouse Racks', isTrending: true },
      { name: 'Workstations' },
      { name: 'Executive Desks', isHot: true },
      { name: 'Steel Lockers' },
      { name: 'Filing Cabinets', isTrending: true },
      { name: 'Conference Tables', isHot: true },
      { name: 'Ergonomic Stools' },
      { name: 'Display Shelves' },
      { name: 'Folding Tables' },
      { name: 'Reception Counters' },
      { name: 'Metal Cabinets' },
    ],
    'cat-computer': [
      { name: 'Touch POS Terminals', isHot: true },
      { name: '42U Server Racks', isTrending: true },
      { name: 'Receipt Printers' },
      { name: 'Barcode Scanners', isHot: true },
      { name: 'Network Switches' },
      { name: 'Industrial Monitors', isTrending: true },
      { name: 'UPS Power Units', isHot: true },
      { name: 'Fiber Cables' },
      { name: 'Thermal Rollers' },
      { name: 'Server Memory' },
      { name: 'Ethernet Hubs' },
      { name: 'POS Drawers' },
    ],
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setViewingView('catalog');
  };

  // Select items for "Frequently searched" cards
  const freqItem1 = products[0];
  const freqItem2 = products[1];
  const freqItem3 = products[2];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Top Banner Sub-Header (Alibaba Style) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 mb-4 border-b border-[#E5DFD5] text-xs text-[#6E685F]">
        <div className="font-bold text-[#112225] text-sm flex items-center gap-2">
          <span>Welcome to BitsB2B Ethiopia</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C85A32]/15 text-[#C85A32] font-semibold border border-[#C85A32]/30">
            Verified Wholesale Platform
          </span>
        </div>
        <div className="flex items-center gap-4 font-medium text-[#112225] text-xs">
          <span className="flex items-center gap-1 cursor-pointer hover:text-[#C85A32]">
            <ShieldCheck className="w-4 h-4 text-[#C85A32]" /> Request for Quotation (RFQ)
          </span>
          <span className="text-[#CCC]">•</span>
          <span className="flex items-center gap-1 cursor-pointer hover:text-[#C85A32]">
            <Star className="w-4 h-4 text-[#D97706]" /> Top Ranking Suppliers
          </span>
          <span className="text-[#CCC]">•</span>
          <span className="flex items-center gap-1 cursor-pointer hover:text-[#C85A32]">
            <Cog className="w-4 h-4 text-[#C85A32]" /> Fast Customization
          </span>
        </div>
      </div>

      {/* Main Grid Section (Matching Alibaba Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative">
        {/* 1. Left Box: "Categories for you" Vertical Menu Box */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E5DFD5] shadow-lg overflow-hidden">
          {/* Box Header */}
          <div className="p-4 border-b border-[#EFEAE0] bg-[#FAF7F2] rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-[#112225]">
              <Star className="w-4 h-4 text-[#D97706] fill-[#D97706]" />
              <span>Categories for you</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#888]" />
          </div>

          {/* Vertical Category Items */}
          <div className="py-2 divide-y divide-[#F5F2EB]">
            {categories.map(cat => {
              const isActive = activeCategory?.id === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setActiveCategory(activeCategory?.id === cat.id ? null : cat)}
                  className={`px-4 py-3 flex items-center justify-between text-xs font-semibold cursor-pointer transition-all relative ${
                    isActive
                      ? 'bg-[#F7F4EE] text-[#C85A32] font-bold border-l-4 border-[#C85A32]'
                      : 'text-[#162C30] hover:bg-[#FAF7F2] hover:text-[#C85A32]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {getCategoryIcon(cat.name)}
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                      isActive ? 'text-[#C85A32] translate-x-1 rotate-90 sm:rotate-0' : 'text-[#A8A196]'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Bottom Action: View all */}
          <div className="p-3 border-t border-[#EFEAE0] bg-[#FAF7F2] rounded-b-2xl">
            <button
              type="button"
              onClick={() => handleCategorySelect('all')}
              className="w-full py-1.5 px-3 bg-white hover:bg-[#F3EFE6] text-[#112225] border border-[#D8CFBF] rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>View all categories</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#C85A32]" />
            </button>
          </div>
        </div>

        {/* 2. Right Side: Popup Panel (If Category Selected) OR Frequently Searched Cards (Default) */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            {activeCategory ? (
              /* ALIBABA STYLE POPUP SUBCATEGORIES BOX (Opens when a category is clicked) */
              <motion.div
                key={activeCategory.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl border border-[#D8CFBF] shadow-xl p-6 relative space-y-6"
              >
                {/* Header Row with Title and Close (X) Button */}
                <div className="flex items-start justify-between pb-4 border-b border-[#EFEAE0]">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-[#C85A32]/10 border border-[#C85A32]/20">
                        {getCategoryIcon(activeCategory.name)}
                      </div>
                      <h2 className="text-xl font-extrabold text-[#112225]">
                        {activeCategory.name}
                      </h2>
                    </div>
                    <p className="text-xs text-[#6E685F] mt-1">
                      {activeCategory.description || 'Explore verified factories and subcategories.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveCategory(null)}
                    className="w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#EFEAE0] text-[#6E685F] hover:text-[#112225] flex items-center justify-center transition-colors cursor-pointer border border-[#D8CFBF]"
                    aria-label="Close panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Subcategories Icon Grid (Alibaba Style Grid with Rounded Badge Icons) */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-[#888] uppercase tracking-wider flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-[#D97706] fill-[#D97706]" />
                      <span>Popular Subcategories &amp; Sourcing Tags</span>
                    </h3>
                    <span className="text-xs font-semibold text-[#C85A32]">
                      {activeCategory.itemCount} items available
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {(SUBCATEGORIES_DATA[activeCategory.id] || []).map((sub, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleCategorySelect(activeCategory.id)}
                        className="group flex flex-col items-center text-center p-3 rounded-2xl bg-[#FAF7F2] hover:bg-white border border-[#E5DFD5] hover:border-[#C85A32] hover:shadow-lg transition-all duration-200 cursor-pointer relative"
                      >
                        {/* Trending / Hot Tag Badge */}
                        {sub.isHot && (
                          <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
                            <Flame className="w-2.5 h-2.5 fill-white" />
                          </span>
                        )}
                        {sub.isTrending && (
                          <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-xs">
                            <TrendingUp className="w-2.5 h-2.5" />
                          </span>
                        )}

                        {/* Circular Icon Container (Matching Alibaba Circle Badge) */}
                        <div className="w-16 h-16 rounded-full bg-white group-hover:bg-[#F7F4EE] border border-[#EFEAE0] group-hover:border-[#C85A32]/40 flex items-center justify-center shadow-xs group-hover:scale-110 transition-all duration-200 mb-2">
                          <Package className="w-7 h-7 text-[#C85A32]" />
                        </div>

                        {/* Subcategory Name */}
                        <span className="text-xs font-bold text-[#112225] group-hover:text-[#C85A32] transition-colors leading-tight line-clamp-2">
                          {sub.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA Row */}
                <div className="pt-4 border-t border-[#EFEAE0] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-[#6E685F]">
                    <ShieldCheck className="w-4 h-4 text-[#D97706]" />
                    <span>Telebirr &amp; CBE Birr Escrow Protected &bull; Verified Ethiopian Factories</span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setActiveCategory(null)}
                      className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#EFEAE0] text-[#112225] font-semibold text-xs rounded-xl border border-[#D8CFBF] transition-colors cursor-pointer"
                    >
                      Close Panel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCategorySelect(activeCategory.id)}
                      className="px-6 py-2 bg-[#C85A32] hover:bg-[#A34320] text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
                    >
                      <span>Explore Full {activeCategory.name} Catalog</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* DEFAULT VIEW: Frequently Searched Product Cards & Factory Showcase Banner */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Card 1: Frequently Searched */}
                {freqItem1 && (
                  <div
                    onClick={() => setSelectedProduct(freqItem1)}
                    className="bg-white rounded-2xl p-4 border border-[#E5DFD5] shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#888] uppercase tracking-wider">
                        Frequently searched
                      </div>
                      <h3 className="font-extrabold text-sm text-[#112225] mt-0.5 group-hover:text-[#C85A32] transition-colors line-clamp-1">
                        {freqItem1.name}
                      </h3>
                    </div>

                    <div className="my-3 bg-[#FBF9F5] rounded-xl p-3 border border-[#EFEAE0] flex items-center justify-center overflow-hidden h-36">
                      <CanvasProductImage
                        src={freqItem1.images[0]}
                        alt={freqItem1.name}
                        className="h-full object-contain group-hover:scale-105 transition-transform duration-300 rounded-lg"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F5F2EB]">
                      <div className="font-extrabold text-[#C85A32]">
                        {freqItem1.price.toLocaleString()} {freqItem1.currency}
                      </div>
                      <div className="text-[11px] text-[#6E685F] font-medium">
                        MOQ: {freqItem1.moq} {freqItem1.unit}
                      </div>
                    </div>
                  </div>
                )}

                {/* Card 2: Frequently Searched */}
                {freqItem2 && (
                  <div
                    onClick={() => setSelectedProduct(freqItem2)}
                    className="bg-white rounded-2xl p-4 border border-[#E5DFD5] shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#888] uppercase tracking-wider">
                        Frequently searched
                      </div>
                      <h3 className="font-extrabold text-sm text-[#112225] mt-0.5 group-hover:text-[#C85A32] transition-colors line-clamp-1">
                        {freqItem2.name}
                      </h3>
                    </div>

                    <div className="my-3 bg-[#FBF9F5] rounded-xl p-3 border border-[#EFEAE0] flex items-center justify-center overflow-hidden h-36">
                      <CanvasProductImage
                        src={freqItem2.images[0]}
                        alt={freqItem2.name}
                        className="h-full object-contain group-hover:scale-105 transition-transform duration-300 rounded-lg"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F5F2EB]">
                      <div className="font-extrabold text-[#C85A32]">
                        {freqItem2.price.toLocaleString()} {freqItem2.currency}
                      </div>
                      <div className="text-[11px] text-[#6E685F] font-medium">
                        MOQ: {freqItem2.moq} {freqItem2.unit}
                      </div>
                    </div>
                  </div>
                )}

                {/* Card 3: Frequently Searched */}
                {freqItem3 && (
                  <div
                    onClick={() => setSelectedProduct(freqItem3)}
                    className="bg-white rounded-2xl p-4 border border-[#E5DFD5] shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#888] uppercase tracking-wider">
                        Frequently searched
                      </div>
                      <h3 className="font-extrabold text-sm text-[#112225] mt-0.5 group-hover:text-[#C85A32] transition-colors line-clamp-1">
                        {freqItem3.name}
                      </h3>
                    </div>

                    <div className="my-3 bg-[#FBF9F5] rounded-xl p-3 border border-[#EFEAE0] flex items-center justify-center overflow-hidden h-36">
                      <CanvasProductImage
                        src={freqItem3.images[0]}
                        alt={freqItem3.name}
                        className="h-full object-contain group-hover:scale-105 transition-transform duration-300 rounded-lg"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F5F2EB]">
                      <div className="font-extrabold text-[#C85A32]">
                        {freqItem3.price.toLocaleString()} {freqItem3.currency}
                      </div>
                      <div className="text-[11px] text-[#6E685F] font-medium">
                        MOQ: {freqItem3.moq} {freqItem3.unit}
                      </div>
                    </div>
                  </div>
                )}

                {/* Banner Card: Verified Factory Showcase */}
                <div className="sm:col-span-2 lg:col-span-3 bg-gradient-to-r from-[#112225] via-[#162C30] to-[#1D383D] text-[#F7F4EE] rounded-2xl p-6 border border-[#274B52] shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 z-10 max-w-lg">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C85A32]/20 border border-[#C85A32]/30 text-[#E27D56] text-xs font-bold">
                      <ShieldCheck className="w-4 h-4 text-[#C85A32]" />
                      Virtual Showroom &amp; Verified Producers
                    </div>
                    <h2 className="text-xl font-extrabold text-[#F7F4EE] tracking-tight">
                      Verified Industrial Suppliers &amp; Factory Showcase
                    </h2>
                    <p className="text-xs text-[#A8A196] leading-relaxed">
                      Connect directly with licensed producers in Akaki-Kality, Dukem SEZ, and Bole Industrial Zone with Telebirr Escrow protection.
                    </p>
                  </div>

                  <div className="z-10 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCategorySelect('all')}
                      className="px-6 py-2.5 bg-white hover:bg-[#F7F4EE] text-[#112225] font-extrabold text-xs rounded-full shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                      <span>View Showcase</span>
                      <ArrowRight className="w-4 h-4 text-[#C85A32]" />
                    </button>
                  </div>

                  {/* Subtle background overlay */}
                  <div className="absolute right-0 top-0 bottom-0 w-80 opacity-10 pointer-events-none bg-[radial-gradient(#FFF_1px,transparent_1px)] [background-size:16px_16px]" />
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
