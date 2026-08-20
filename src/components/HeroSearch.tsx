import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Search, Tag } from 'lucide-react';

export const HeroSearch: React.FC = () => {
  const { searchQuery, setSearchQuery, setViewingView } = useMarketplace();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setViewingView('catalog');
  };

  const POPULAR_KEYWORDS = [
    'Slurry Pump',
    'Corrugated Boxes',
    'PP Woven Sacks',
    'Brake Actuator',
    'POS Station',
    'Grain Sealer',
    'Diesel Fuel Filter',
  ];

  return (
    <div className="w-full bg-gradient-to-b from-[#112225] via-[#162C30] to-[#1D383D] text-[#F7F4EE] py-8 sm:py-10 px-4 sm:px-6 shadow-xl border-b border-[#274B52] relative overflow-hidden">
      {/* Decorative subtle background grid */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#FFF_1px,transparent_1px)] [background-size:20px_20px]" />

      <div className="max-w-4xl mx-auto space-y-6 text-center relative z-10">
        {/* Large Rounded Search Bar (Alibaba Pill Style) */}
        <form onSubmit={handleSearch} className="w-full">
          <div className="relative flex items-center bg-white rounded-full p-2 border-3 border-[#C85A32] shadow-2xl focus-within:ring-4 focus-within:ring-[#C85A32]/30 transition-all">
            <div className="pl-4 text-[#C85A32]">
              <Search className="w-6 h-6" />
            </div>

            <input
              id="hero-main-search-input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products by name, specifications, machinery model, packaging..."
              className="w-full py-2.5 px-4 text-sm sm:text-base text-[#112225] placeholder-[#888] bg-transparent focus:outline-none font-medium"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="pr-2 text-xs text-[#888] hover:text-[#112225] font-bold cursor-pointer"
              >
                Clear
              </button>
            )}

            {/* Pill Search Button */}
            <button
              type="submit"
              id="btn-hero-search-submit"
              className="px-6 py-3 bg-gradient-to-r from-[#C85A32] to-[#E27D56] hover:from-[#A34320] hover:to-[#C85A32] text-white font-bold text-sm sm:text-base rounded-full flex items-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer shrink-0"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Search</span>
            </button>
          </div>
        </form>

        {/* Popular Keyword Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#A8A196]">
          <span className="flex items-center gap-1 text-[#EBE5DA] font-semibold">
            <Tag className="w-3.5 h-3.5 text-[#C85A32]" />
            Frequently Searched:
          </span>
          {POPULAR_KEYWORDS.map(kw => (
            <button
              key={kw}
              type="button"
              onClick={() => {
                setSearchQuery(kw);
                setViewingView('catalog');
              }}
              className="px-3 py-1 bg-[#1D383D] hover:bg-[#274B52] text-[#F7F4EE] border border-[#34626B] rounded-full transition-colors cursor-pointer text-[11px]"
            >
              {kw}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

