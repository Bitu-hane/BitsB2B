'use client';
import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  Bell,
  MessageSquare,
  Package,
  Store,
  LogOut,
  Globe,
  ShoppingCart,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    logout,
    setAuthModalOpen,
    setViewingView,
    notifications,
    setNotificationDrawerOpen,
    inquiries,
    orders,
    searchQuery,
    setSearchQuery,
    language,
    setLanguage,
    t,
  } = useMarketplace();

  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const unreadNotifCount = notifications.filter(n => !n.read).length;
  const activeInquiriesCount = inquiries.length;

  const freqSearches = [
    'Slurry pump',
    'Corrugated boxes',
    'PP woven sacks',
    'Brake actuator',
    'POS station',
    'Grain sealer',
    'Diesel fuel filter',
  ];

  // User initials
  const getUserInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="w-full bg-[#1B2340] text-[#F4EFE3] pb-4 sticky top-0 z-40 shadow-lg border-b border-[#2B3558]">
      {/* Main Header Row */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 pt-4 pb-2">
        <div className="flex items-center justify-between gap-6 flex-wrap lg:flex-nowrap">
          {/* Brand Logo */}
          <div
            id="brand-logo-button"
            onClick={() => setViewingView('home')}
            className="flex items-center gap-3 cursor-pointer select-none shrink-0"
          >
            <div className="w-[40px] h-[40px] rounded-[9px] bg-[#C08829] flex items-center justify-center font-serif font-bold text-[17px] text-[#1B2340] shadow-xs">
              B2
            </div>
            <div className="font-serif font-semibold text-[21px] text-[#F4EFE3]">
              Bits<em className="not-italic text-[#C08829]">B2B</em>
              <span className="text-[12.5px] font-sans font-medium text-[#A7AECB] ml-1">.et</span>
            </div>
          </div>

          {/* Search Shell */}
          <div className="flex-1 max-w-[640px] flex items-stretch bg-white rounded-[9px] border border-black/5 overflow-hidden shadow-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('catalog.searchPlaceholder')}
              className="flex-1 border-none bg-transparent px-4.5 py-3 text-[14.5px] text-[#1E2128] font-sans focus:outline-none placeholder:text-[#6B7078]"
            />
            <button
              onClick={() => setViewingView('catalog')}
              className="bg-[#C08829] hover:bg-[#9C6B1A] text-[#1B2340] hover:text-white px-5 font-semibold text-[14px] flex items-center gap-2 transition-colors border-none cursor-pointer shrink-0"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <span>{language === 'am' ? 'ፈልግ' : 'Search'}</span>
            </button>
          </div>

          {/* Header Action Icons */}
          <div className="flex items-center gap-5 shrink-0">
            {/* Language Switcher Button */}
            <div className="flex items-center gap-1 bg-[#131A30] p-1 rounded-xl border border-[#2B3558]">
              <button
                type="button"
                onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#E2B159] hover:text-white hover:bg-[#1B2340] transition-all cursor-pointer flex items-center gap-1.5"
                title="Toggle Language / ቋንቋ ቀይር"
              >
                <Globe className="w-3.5 h-3.5 text-[#C08829]" />
                <span>{language === 'en' ? 'EN' : 'አማ'}</span>
              </button>
            </div>

            {/* Cart Icon */}
            <button
              id="nav-btn-orders"
              onClick={() => setViewingView('orders')}
              className="relative bg-none border-none text-[#A7AECB] hover:text-[#F4EFE3] flex flex-col items-center gap-0.5 text-[10.5px] cursor-pointer transition-colors"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {orders.length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#A6432B] text-white text-[9.5px] font-bold w-[15px] h-[15px] rounded-full flex items-center justify-center border-2 border-[#1B2340]">
                    {orders.length}
                  </span>
                )}
              </div>
              <span>{t('common.navOrders')}</span>
            </button>

            {/* Inquiries Icon */}
            <button
              id="nav-btn-inquiries"
              onClick={() => setViewingView('inquiries')}
              className="relative bg-none border-none text-[#A7AECB] hover:text-[#F4EFE3] flex flex-col items-center gap-0.5 text-[10.5px] cursor-pointer transition-colors"
            >
              <div className="relative">
                <MessageSquare className="w-5 h-5" />
                {activeInquiriesCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#A6432B] text-white text-[9.5px] font-bold w-[15px] h-[15px] rounded-full flex items-center justify-center border-2 border-[#1B2340]">
                    {activeInquiriesCount}
                  </span>
                )}
              </div>
              <span>{t('common.navInquiries')}</span>
            </button>

            {/* Alerts Icon */}
            <button
              id="nav-btn-notifications-bell"
              onClick={() => setNotificationDrawerOpen(true)}
              className="relative bg-none border-none text-[#A7AECB] hover:text-[#F4EFE3] flex flex-col items-center gap-0.5 text-[10.5px] cursor-pointer transition-colors"
            >
              <div className="relative">
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#A6432B] text-white text-[9.5px] font-bold w-[15px] h-[15px] rounded-full flex items-center justify-center border-2 border-[#1B2340]">
                    {unreadNotifCount}
                  </span>
                )}
              </div>
              <span>{t('common.notifications')}</span>
            </button>

            {/* Account User Avatar & Info */}
            <div className="relative">
              {currentUser ? (
                <button
                  id="nav-btn-user-account-dropdown"
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className="flex items-center gap-2.5 bg-none border-none text-[#F4EFE3] cursor-pointer text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-[#33553A] flex items-center justify-center font-serif font-semibold text-xs text-[#F4EFE3] shrink-0">
                    {getUserInitials(currentUser.name)}
                  </div>
                  <div className="hidden sm:block leading-tight text-left">
                    <div className="text-[13px] font-semibold text-[#F4EFE3]">{currentUser.name.split(' ')[0]}</div>
                    <div className="text-[11px] text-[#A7AECB] capitalize">{currentUser.business.role}</div>
                  </div>
                </button>
              ) : (
                <button
                  id="nav-btn-login-register"
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-2 bg-none border-none text-[#F4EFE3] cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-[#33553A] flex items-center justify-center font-serif font-semibold text-xs text-[#F4EFE3]">
                    SB
                  </div>
                  <div className="hidden sm:block leading-tight text-left">
                    <div className="text-[13px] font-semibold text-[#F4EFE3]">Selamawit</div>
                    <div className="text-[11px] text-[#A7AECB]">Reseller</div>
                  </div>
                </button>
              )}

              {/* Account Dropdown */}
              {currentUser && accountDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-[#242E52] border border-[#2E3A63] rounded-xl shadow-2xl py-2 z-50 text-xs text-[#F4EFE3]"
                  onMouseLeave={() => setAccountDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-[#2E3A63]">
                    <div className="font-bold">{currentUser.business.name}</div>
                    <div className="text-[11px] text-[#A7AECB]">{currentUser.phone}</div>
                  </div>

                  <button
                    onClick={() => {
                      setViewingView('orders');
                      setAccountDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2"
                  >
                    <Package className="w-3.5 h-3.5 text-[#C08829]" />
                    <span>{t('common.navOrders')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setViewingView('inquiries');
                      setAccountDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#C08829]" />
                    <span>{t('common.navInquiries')}</span>
                  </button>

                  {currentUser.isSeller && (
                    <button
                      onClick={() => {
                        setViewingView('seller_dashboard');
                        setAccountDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2 text-[#C08829] font-semibold"
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>{t('common.navSellerHub')}</span>
                    </button>
                  )}

                  <div className="border-t border-[#2E3A63] pt-1 mt-1">
                    <button
                      onClick={() => {
                        logout();
                        setAccountDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-[#A6432B] hover:bg-white/10 flex items-center gap-2 font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('auth.logout')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Frequently Searched Pill Tags */}
        <div className="flex items-center gap-2.5 flex-wrap mt-4 text-[13px] text-[#A7AECB]">
          <div className="flex items-center gap-1.5">
            <span className="text-[#C08829]">★</span>
            <span>{language === 'am' ? 'በተደጋጋሚ የተፈለጉ፡' : 'Frequently searched:'}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {freqSearches.map(tag => (
              <button
                key={tag}
                onClick={() => {
                  setSearchQuery(tag);
                  setViewingView('catalog');
                }}
                className="bg-[#F4EFE3]/[0.06] border border-[#F4EFE3]/[0.12] hover:bg-[#F4EFE3]/[0.13] hover:border-[#F4EFE3]/[0.24] text-[#F4EFE3] px-3.5 py-1.5 rounded-full text-[12.5px] transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
