'use client';

import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Globe, ShieldCheck } from 'lucide-react';

interface AuthHeaderProps {
  showTitle?: boolean;
  showNavigation?: boolean;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ showTitle = true }) => {
  const { language, setLanguage, t } = useMarketplace();

  return (
    <header className="w-full bg-[#1B2340] border-b border-[#2B3558] py-3.5 px-4 sm:px-8 shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Title (Exact Ledger Navy & Gold Theme) */}
        <div className="flex items-center gap-3">
          <div className="w-[38px] h-[38px] rounded-[8px] bg-[#C08829] font-serif font-bold text-base text-[#1B2340] flex items-center justify-center shadow-md shadow-[#C08829]/20">
            B2
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-semibold text-[19px] text-[#F4EFE3]">
                Bits<em className="not-italic text-[#C08829]">B2B</em>.et
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#C08829]/20 border border-[#C08829]/40 text-[#E2B159] text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3" /> Ethiopia Trade
              </span>
            </div>
            <p className="text-[11px] text-[#A7AECB] font-medium hidden sm:block">
              Ethiopian Wholesale &amp; Enterprise Marketplace
            </p>
          </div>
        </div>

        {/* Language Preference Switcher */}
        <div className="flex items-center gap-2 bg-[#131A30] p-1 rounded-xl border border-[#2B3558]">
          <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#A7AECB] font-semibold hidden xs:flex">
            <Globe className="w-3.5 h-3.5 text-[#C08829]" />
            <span suppressHydrationWarning>{t('auth.languagePreference')}</span>
          </div>

          <button
            id="btn-lang-en"
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              language === 'en'
                ? 'bg-[#C08829] text-[#1B2340] shadow-md shadow-[#C08829]/30'
                : 'text-[#A7AECB] hover:text-white hover:bg-[#1B2340]'
            }`}
          >
            <span className="text-sm">🇬🇧</span>
            <span suppressHydrationWarning>{t('auth.english')}</span>
          </button>

          <button
            id="btn-lang-am"
            type="button"
            onClick={() => setLanguage('am')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              language === 'am'
                ? 'bg-[#C08829] text-[#1B2340] shadow-md shadow-[#C08829]/30'
                : 'text-[#A7AECB] hover:text-white hover:bg-[#1B2340]'
            }`}
          >
            <span className="text-sm">🇪🇹</span>
            <span suppressHydrationWarning>{t('auth.amharic')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

