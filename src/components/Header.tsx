import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  ShieldCheck,
  Bell,
  MessageSquare,
  Package,
  Store,
  User as UserIcon,
  ChevronDown,
  RefreshCw,
  LogOut,
  Building2,
  Phone,
  CheckCircle2,
  Globe,
  ShoppingCart,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    allUsers,
    switchUser,
    logout,
    setAuthModalOpen,
    viewingView,
    setViewingView,
    notifications,
    setNotificationDrawerOpen,
    inquiries,
    orders,
    resetToDefaults,
  } = useMarketplace();

  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const unreadNotifCount = notifications.filter(n => !n.read).length;
  const activeInquiriesCount = inquiries.length;

  return (
    <header id="main-marketplace-header" className="w-full bg-[#112225] text-white border-b-3 border-[#D97706] sticky top-0 z-40 shadow-xl">
      {/* Top Utility Bar (Dark Forest Teal) */}
      <div className="w-full bg-[#0B1719] border-b border-[#274B52]/60 text-xs py-1.5 px-4 sm:px-7 text-[#A8A196]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left info */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-medium text-[#F7F4EE]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F59E0B]" />
              Trade Assurance Escrow &bull; <b className="text-[#F59E0B]">Telebirr &amp; CBE Birr Protected</b>
            </span>
            <span className="hidden md:inline text-white/20">•</span>
            <span className="hidden md:inline">Currency: <strong className="text-[#F7F4EE]">ETB (Birr)</strong></span>
            <span className="hidden lg:inline text-white/20">•</span>
            <span className="hidden lg:inline">B2B Regional Freight: <span className="text-[#F59E0B] font-semibold">Nationwide Delivery</span></span>
          </div>

          {/* Right Fast Switcher */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                id="btn-role-switcher-toggle"
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                className="flex items-center gap-1.5 bg-[#193338] hover:bg-[#23454B] text-[#E2E8F0] px-3 py-1 rounded-full border border-[#274B52] transition-colors cursor-pointer text-xs shadow-xs"
              >
                <span className="text-[11px] text-[#A8A196]">Simulate Role:</span>
                <span className="font-semibold text-[#F59E0B]">
                  {currentUser ? `${currentUser.business.name.slice(0, 18)}... (${currentUser.business.role})` : 'Anonymous Visitor'}
                </span>
                <ChevronDown className="w-3 h-3 text-[#E2E8F0]" />
              </button>

              {roleSwitcherOpen && (
                <div
                  id="role-switcher-dropdown"
                  className="absolute right-0 mt-1.5 w-72 bg-[#162C30] border border-[#274B52] rounded-2xl shadow-2xl py-2 z-50 text-xs text-[#E2E8F0]"
                  onMouseLeave={() => setRoleSwitcherOpen(false)}
                >
                  <div className="px-3.5 py-1.5 border-b border-[#274B52] text-[11px] font-mono uppercase tracking-wider text-[#F59E0B] font-bold">
                    Quick Switch Account (Interactive Demo)
                  </div>

                  <button
                    id="switch-to-visitor"
                    onClick={() => {
                      switchUser('visitor');
                      setRoleSwitcherOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-white/10 flex items-center justify-between cursor-pointer ${
                      !currentUser ? 'bg-[#D97706]/20 text-[#F59E0B] font-semibold' : 'text-[#E2E8F0]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Unregistered Visitor</div>
                      <div className="text-[11px] text-[#A8A196]">Browse mode (Prices hidden)</div>
                    </div>
                    {!currentUser && <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" />}
                  </button>

                  {allUsers.map(u => (
                    <button
                      key={u.id}
                      id={`switch-to-user-${u.id}`}
                      onClick={() => {
                        switchUser(u.id);
                        setRoleSwitcherOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-white/10 flex items-center justify-between cursor-pointer ${
                        currentUser?.id === u.id ? 'bg-[#D97706]/20 text-[#F59E0B] font-semibold' : 'text-[#E2E8F0]'
                      }`}
                    >
                      <div>
                        <div className="font-semibold flex items-center gap-1">
                          {u.name}
                          {u.business.verificationStatus === 'verified' && (
                            <ShieldCheck className="w-3.5 h-3.5 text-[#F59E0B]" />
                          )}
                        </div>
                        <div className="text-[11px] text-[#A8A196]">
                          {u.business.name} &bull; <span className="capitalize">{u.business.role}</span>
                        </div>
                      </div>
                      {currentUser?.id === u.id && <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" />}
                    </button>
                  ))}

                  <div className="px-3.5 pt-2 mt-1 border-t border-[#274B52]">
                    <button
                      id="btn-quick-new-registration"
                      onClick={() => {
                        setRoleSwitcherOpen(false);
                        setAuthModalOpen(true);
                      }}
                      className="w-full text-center py-1.5 bg-[#D97706] hover:bg-[#B45309] text-white font-bold rounded-xl transition-colors cursor-pointer font-mono"
                    >
                      + Register New Business
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              id="btn-reset-demo-data"
              onClick={resetToDefaults}
              title="Reset initial catalog, orders, and inquiries"
              className="flex items-center gap-1 text-[#A8A196] hover:text-[#F59E0B] transition-colors p-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Reset Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Row (Matches Image Layout: Brand Logo | Deliver to ET | English-ETB | Cart | Sign In | Create Account) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-7 py-3">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          {/* Brand Logo (BitsB2B) */}
          <div
            id="brand-logo-button"
            onClick={() => {
              setViewingView('home');
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D97706] via-[#B45309] to-[#78350F] flex items-center justify-center text-white font-serif font-extrabold text-lg border border-amber-400/40 shadow-lg">
              BB
            </div>
            <div>
              <div className="text-2xl font-serif font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span>BitsB2B</span>
                <span className="text-[9px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-[#D97706]/20 text-[#F59E0B] border border-[#D97706]/40">
                  .et
                </span>
              </div>
            </div>
          </div>

          {/* Right Header Tools Aligned to Reference Image */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0 text-xs text-[#E2E8F0]">
            {/* Deliver to: ET */}
            <div className="hidden sm:flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity">
              <div className="text-right leading-tight font-mono">
                <div className="text-[10px] text-[#A8A196]">Deliver to:</div>
                <div className="flex items-center gap-1 font-bold text-white text-xs">
                  <span className="text-base leading-none">🇪🇹</span>
                  <span>ET</span>
                </div>
              </div>
            </div>

            {/* Language & Currency Selector */}
            <div className="hidden md:flex items-center gap-1.5 cursor-pointer hover:text-[#F59E0B] transition-colors font-mono">
              <Globe className="w-4 h-4 text-[#F59E0B]" />
              <span className="font-semibold text-white text-xs">English-ETB</span>
            </div>

            {/* Cart / Orders Icon */}
            <button
              id="nav-btn-orders"
              onClick={() => {
                if (!currentUser) {
                  setAuthModalOpen(true);
                } else {
                  setViewingView('orders');
                }
              }}
              className="relative p-1.5 text-white hover:text-[#F59E0B] transition-colors cursor-pointer"
              title="Cart & Orders"
            >
              <ShoppingCart className="w-5 h-5 text-[#F59E0B]" />
              {orders.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#D97706] text-white text-[10px] font-extrabold min-w-4.5 h-4.5 rounded-full flex items-center justify-center px-1 border border-[#112225]">
                  {orders.length}
                </span>
              )}
            </button>

            {/* Inquiries Icon */}
            <button
              id="nav-btn-inquiries"
              onClick={() => {
                if (!currentUser) {
                  setAuthModalOpen(true);
                } else {
                  setViewingView('inquiries');
                }
              }}
              className="relative p-1.5 text-white hover:text-[#F59E0B] transition-colors cursor-pointer"
              title="Structured Product Inquiries & RFQs"
            >
              <MessageSquare className="w-5 h-5 text-[#F59E0B]" />
              {activeInquiriesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#F59E0B] text-[#112225] text-[10px] font-extrabold min-w-4.5 h-4.5 rounded-full flex items-center justify-center px-1 border border-[#112225]">
                  {activeInquiriesCount}
                </span>
              )}
            </button>

            {/* Notifications Bell */}
            <button
              id="nav-btn-notifications-bell"
              onClick={() => setNotificationDrawerOpen(true)}
              className="relative p-1.5 text-white hover:text-[#F59E0B] transition-colors cursor-pointer"
              aria-label="Open notifications"
            >
              <Bell className="w-5 h-5 text-[#F59E0B]" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-[#D97706] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse border border-[#112225]">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Sign in / User Account section */}
            <div className="relative">
              {currentUser ? (
                <button
                  id="nav-btn-user-account-dropdown"
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className="flex items-center gap-2 hover:text-[#F59E0B] transition-colors cursor-pointer"
                >
                  <UserIcon className="w-5 h-5 text-[#F59E0B]" />
                  <div className="text-left hidden lg:block font-mono leading-tight">
                    <div className="font-bold text-white flex items-center gap-1 text-xs">
                      {currentUser.name.split(' ')[0]}
                      {currentUser.business.verificationStatus === 'verified' && (
                        <ShieldCheck className="w-3.5 h-3.5 text-[#F59E0B]" />
                      )}
                    </div>
                    <div className="text-[10px] text-[#A8A196] capitalize">{currentUser.business.role}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#A8A196]" />
                </button>
              ) : (
                <button
                  id="nav-btn-login-register"
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-white hover:text-[#F59E0B] cursor-pointer"
                >
                  <UserIcon className="w-4.5 h-4.5 text-[#F59E0B]" />
                  <span>Sign in</span>
                </button>
              )}

              {/* Account Menu Dropdown */}
              {currentUser && accountDropdownOpen && (
                <div
                  id="account-dropdown-menu"
                  className="absolute right-0 mt-2 w-64 bg-[#162C30] border border-[#274B52] rounded-2xl shadow-2xl py-2 z-50 text-xs text-white font-mono"
                  onMouseLeave={() => setAccountDropdownOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-[#274B52]">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      {currentUser.business.name}
                      {currentUser.business.verificationStatus === 'verified' && (
                        <span className="bg-[#F59E0B]/20 text-[#F59E0B] text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 border border-[#F59E0B]/40">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#CBD5E1] mt-0.5 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-[#F59E0B]" /> Role: <span className="capitalize text-[#F59E0B] font-bold">{currentUser.business.role}</span>
                    </div>
                    <div className="text-[11px] text-[#CBD5E1] mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#F59E0B]" /> {currentUser.phone}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setViewingView('orders');
                        setAccountDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2 cursor-pointer"
                    >
                      <Package className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>{currentUser.isSeller ? 'Orders & Sales Management' : 'My Orders & Escrow Tracking'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setViewingView('inquiries');
                        setAccountDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>Structured Inquiries Inbox</span>
                    </button>

                    {currentUser.isSeller && (
                      <button
                        onClick={() => {
                          setViewingView('seller_dashboard');
                          setAccountDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2 cursor-pointer text-[#F59E0B] font-bold"
                      >
                        <Store className="w-3.5 h-3.5" />
                        <span>Seller Control Center</span>
                      </button>
                    )}
                  </div>

                  <div className="border-t border-[#274B52] pt-1">
                    <button
                      id="btn-account-logout"
                      onClick={() => {
                        logout();
                        setAccountDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-[#EF4444] hover:bg-white/10 flex items-center gap-2 cursor-pointer font-bold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out (Browse as Anonymous)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Create Account Pill Button */}
            {!currentUser && (
              <button
                id="nav-btn-create-account"
                onClick={() => setAuthModalOpen(true)}
                className="bg-[#D97706] hover:bg-[#B45309] text-white px-5 py-2 rounded-full font-bold text-xs tracking-tight shadow-md transition-colors cursor-pointer font-mono border border-amber-400/40"
              >
                Create account
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
