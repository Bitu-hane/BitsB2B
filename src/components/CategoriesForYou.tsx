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
  Building2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCategory, Product } from '../types';

export const CategoriesForYou: React.FC = () => {
  const { categories, products, setSelectedCategory, setViewingView, setSelectedProduct } = useMarketplace();
  const [hoveredCategory, setHoveredCategory] = useState<ProductCategory | null>(null);

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

  // Subcategories mapping for flyout dropdown
  const SUBCATEGORIES_MAP: Record<string, string[]> = {
    'cat-industrial': [
      'Centrifugal Slurry Pumps',
      'Automatic Bag Sealers',
      'Industrial Electric Motors',
      'Hydraulic Machinery',
      'Water Treatment Units',
    ],
    'cat-packaging': [
      'Corrugated Shipping Sacks',
      'Shrink Film Rolls',
      'Label Reels & Printing Ink',
      'Blister Packaging Units',
      'Flexographic Printing Plates',
    ],
    'cat-bags': [
      '50kg PP Woven Grain Sacks',
      '5-Ply Heavy Shipping Cartons',
      '1,000kg Jumbo Bulk Bags',
      'Wooden Export Pallets',
      'Plastic Storage Containers',
    ],
    'cat-vehicle': [
      'Truck Spring Brake Chambers',
      'Secondary Diesel Fuel Filters',
      'Hydraulic Lift Cylinders',
      'Commercial Air Suspensions',
      'Common Rail Injector Units',
    ],
    'cat-apparel': [
      'High-Vis Safety Vests',
      'Leather Industrial Work Boots',
      'Factory Cotton Uniforms',
      'Bulk Technical Textiles',
      'Institutional Overalls',
    ],
    'cat-furniture': [
      'Ergonomic Mesh Office Chairs',
      'Heavy Duty Warehouse Racking',
      'Modular Office Workstations',
      'Executive Desk Systems',
      'Steel Storage Lockers',
    ],
    'cat-computer': [
      'Commercial Touch POS Stations',
      '42U 19" Network Server Racks',
      'High-Speed Receipt Printers',
      'Industrial Barcode Scanners',
      'Enterprise Switch Hardware',
    ],
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setViewingView('catalog');
  };

  // Select 3 items for "Frequently searched" cards
  const freqItem1 = products[0]; // Slurry Pump
  const freqItem2 = products[1]; // Bag Sealer
  const freqItem3 = products[2]; // Corrugated Sacks

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 1. Left Box: "Categories for you" Vertical Menu Box */}
        <div
          className="lg:col-span-3 bg-white rounded-2xl border border-[#E5DFD5] shadow-lg overflow-visible relative"
          onMouseLeave={() => setHoveredCategory(null)}
        >
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
              const isHovered = hoveredCategory?.id === cat.id;
              return (
                <div
                  key={cat.id}
                  onMouseEnter={() => setHoveredCategory(cat)}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`px-4 py-3 flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors relative ${
                    isHovered
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
                      isHovered ? 'text-[#C85A32] translate-x-1' : 'text-[#A8A196]'
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

          {/* Interactive Flyout Dropdown Menu (Opens on Hover/Selection) */}
          <AnimatePresence>
            {hoveredCategory && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute left-full top-0 ml-2 w-80 sm:w-96 bg-white border border-[#D8CFBF] rounded-2xl shadow-2xl p-5 z-50 text-xs text-[#162C30] space-y-4"
                onMouseEnter={() => setHoveredCategory(hoveredCategory)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                {/* Category Banner inside Flyout */}
                <div className="flex items-center justify-between pb-3 border-b border-[#EFEAE0]">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#112225] flex items-center gap-2">
                      {getCategoryIcon(hoveredCategory.name)}
                      <span>{hoveredCategory.name}</span>
                    </h3>
                    <p className="text-[11px] text-[#888] mt-0.5">{hoveredCategory.description}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#C85A32]/10 text-[#C85A32] rounded-full border border-[#C85A32]/20">
                    {hoveredCategory.itemCount} items
                  </span>
                </div>

                {/* Popular Subcategories List */}
                <div>
                  <h4 className="font-bold text-[11px] uppercase tracking-wider text-[#A8A196] mb-2">
                    Popular Subcategories &amp; Specifications
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(SUBCATEGORIES_MAP[hoveredCategory.id] || []).map((sub, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleCategorySelect(hoveredCategory.id)}
                        className="px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#F3EFE6] text-[#112225] border border-[#E5DFD5] rounded-lg text-[11px] font-medium transition-colors cursor-pointer text-left"
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Verified Supplier Trust Badge */}
                <div className="p-3 bg-[#112225] text-[#F7F4EE] rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#D97706] shrink-0" />
                    <div>
                      <div className="font-bold text-xs text-[#F7F4EE]">Verified Factory Suppliers</div>
                      <div className="text-[10px] text-[#A8A196]">Telebirr &amp; CBE Birr Escrow Protected</div>
                    </div>
                  </div>
                </div>

                {/* Explore Full Catalog CTA */}
                <button
                  type="button"
                  onClick={() => handleCategorySelect(hoveredCategory.id)}
                  className="w-full py-2 bg-[#C85A32] hover:bg-[#A34320] text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs shadow-md"
                >
                  <span>Explore {hoveredCategory.name} Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2. Middle & Right: "Frequently searched" Cards & Verified Showcase Banner (Matching Alibaba Image 1) */}
        <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Frequently Searched - Industrial Machinery */}
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

              <div className="my-3 bg-[#FBF9F5] rounded-xl p-3 border border-[#EFEAE0] flex items-center justify-center overflow-hidden">
                <img
                  src={freqItem1.images[0]}
                  alt={freqItem1.name}
                  className="h-36 object-contain group-hover:scale-105 transition-transform duration-300 rounded-lg"
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

          {/* Card 2: Frequently Searched - Packaging & Bag Sealer */}
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

              <div className="my-3 bg-[#FBF9F5] rounded-xl p-3 border border-[#EFEAE0] flex items-center justify-center overflow-hidden">
                <img
                  src={freqItem2.images[0]}
                  alt={freqItem2.name}
                  className="h-36 object-contain group-hover:scale-105 transition-transform duration-300 rounded-lg"
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

          {/* Card 3: Frequently Searched - Corrugated Sacks */}
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

              <div className="my-3 bg-[#FBF9F5] rounded-xl p-3 border border-[#EFEAE0] flex items-center justify-center overflow-hidden">
                <img
                  src={freqItem3.images[0]}
                  alt={freqItem3.name}
                  className="h-36 object-contain group-hover:scale-105 transition-transform duration-300 rounded-lg"
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

          {/* Banner Card: Verified Factory Showcase / Showroom (Matching Right Card in Image 1) */}
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
      </div>
    </div>
  );
};
