import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Globe, Building2, ShieldCheck } from 'lucide-react';

interface AuthHeaderProps {
  showTitle?: boolean;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ showTitle = true }) => {
  const { language, setLanguage, t } = useMarketplace();

  return (
    <header className="w-full bg-[#112225] border-b border-[#274B52] py-3.5 px-4 sm:px-8 shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#C85A32] to-[#E27D56] flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-[#C85A32]/30">
            B2B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-[#F7F4EE]">
                BitsB2B
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#C85A32]/20 border border-[#C85A32]/40 text-[#E27D56] text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3" /> Ethiopia Trade
              </span>
            </div>
            <p className="text-[11px] text-[#A8A196] font-medium hidden sm:block">
              Ethiopian Wholesale &amp; Enterprise Marketplace
            </p>
          </div>
        </div>

        {/* Language Preference Switcher */}
        <div className="flex items-center gap-2 bg-[#0B1718] p-1 rounded-xl border border-[#274B52]">
          <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#A8A196] font-semibold hidden xs:flex">
            <Globe className="w-3.5 h-3.5 text-[#E27D56]" />
            <span>{t('auth.languagePreference')}</span>
          </div>

          <button
            id="btn-lang-en"
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              language === 'en'
                ? 'bg-[#C85A32] text-white shadow-md shadow-[#C85A32]/40'
                : 'text-[#A8A196] hover:text-white hover:bg-[#1A3337]'
            }`}
          >
            <span className="text-sm">🇬🇧</span>
            <span>{t('auth.english')}</span>
          </button>

          <button
            id="btn-lang-am"
            type="button"
            onClick={() => setLanguage('am')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              language === 'am'
                ? 'bg-[#C85A32] text-white shadow-md shadow-[#C85A32]/40'
                : 'text-[#A8A196] hover:text-white hover:bg-[#1A3337]'
            }`}
          >
            <span className="text-sm">🇪🇹</span>
            <span>{t('auth.amharic')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
