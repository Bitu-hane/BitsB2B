'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  LayoutGrid,
  Users,
  Package,
  Lock,
  ShieldAlert,
  BarChart3,
  ShieldCheck,
  Search,
  Bell,
  ChevronLeft,
  LogOut,
  History,
} from 'lucide-react';
import { Monogram } from './layout-components';
import { api } from '../../services/api';

const ROLE_NAV_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ['dashboard', 'users', 'listings', 'escrow', 'disputes', 'analytics', 'audit', 'roles'],
  VERIFICATION_OFFICER: ['dashboard', 'users'],
  LISTINGS_MODERATOR: ['dashboard', 'listings'],
  ESCROW_OFFICER: ['dashboard', 'escrow'],
  DISPUTE_MEDIATOR: ['dashboard', 'disputes'],
  ANALYST: ['dashboard', 'analytics'],
};

const ROLE_DESK_NAMES: Record<string, string> = {
  SUPER_ADMIN: 'Admin dashboard',
  VERIFICATION_OFFICER: 'Verification Desk',
  LISTINGS_MODERATOR: 'Product Approval Desk',
  ESCROW_OFFICER: 'Escrow & Finance Desk',
  DISPUTE_MEDIATOR: 'Dispute Resolution Desk',
  ANALYST: 'Analytics & Liquidity Desk',
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  VERIFICATION_OFFICER: 'Verification Officer',
  LISTINGS_MODERATOR: 'Product Approver',
  ESCROW_OFFICER: 'Escrow Officer',
  DISPUTE_MEDIATOR: 'Dispute Resolver',
  ANALYST: 'Analyst',
};

function AdminHeaderSearch({ staffRole }: { staffRole: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const isVerificationDesk = staffRole === 'VERIFICATION_OFFICER' || staffRole === 'SUPER_ADMIN';

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set('q', val);
    } else {
      params.delete('q');
    }
    const targetPath = pathname.startsWith('/admin/users') ? pathname : '/admin/users';
    router.replace(`${targetPath}?${params.toString()}`);
  };

  return (
    <div className="flex-1 max-w-md relative">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        disabled={!isVerificationDesk}
        placeholder={
          isVerificationDesk
            ? 'Search users, phone, email, TIN...'
            : 'Search active on Verification Desk'
        }
        className="f-body w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-300 focus:outline-none focus:border-emerald-700 text-black font-semibold placeholder:text-stone-400 placeholder:font-normal disabled:opacity-60 disabled:cursor-not-allowed"
      />
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, metricsRes] = await Promise.all([
          api.getProfile(),
          api.getAdminMetrics().catch(() => ({ data: null })),
        ]);

        const profileData = profileRes.data;
        const currentStaffRole = profileData?.staffRole || profileData?.staff_role;

        if (profileData && currentStaffRole) {
          setUserProfile(profileData);
          if (metricsRes.data?.data) {
            setMetrics(metricsRes.data.data);
          }
          setLoadingAuth(false);
          return;
        }

        // Fallback check for demo/offline mode using localStorage
        const savedUserStr = localStorage.getItem('bitsb2b_current_user_v2');
        if (savedUserStr) {
          try {
            const savedUser = JSON.parse(savedUserStr);
            const localRole = savedUser?.staffRole || savedUser?.staff_role;
            if (localRole) {
              setUserProfile(savedUser);
              setLoadingAuth(false);
              return;
            }
          } catch {}
        }

        // User is not an authorized staff member (e.g. Business Owner or Guest) -> Redirect to Marketplace
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      } catch (err) {
        // If API request fails (401/unauthenticated) -> Check localStorage for demo staff or redirect to /
        const savedUserStr = typeof window !== 'undefined' ? localStorage.getItem('bitsb2b_current_user_v2') : null;
        if (savedUserStr) {
          try {
            const savedUser = JSON.parse(savedUserStr);
            const localRole = savedUser?.staffRole || savedUser?.staff_role;
            if (localRole) {
              setUserProfile(savedUser);
              setLoadingAuth(false);
              return;
            }
          } catch {}
        }
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      } finally {
        setLoadingAuth(false);
      }
    };

    fetchData();
  }, [router]);

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-stone-900 text-white flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="f-mono text-xs uppercase tracking-widest text-stone-400">Verifying Operational Credentials...</p>
        </div>
      </div>
    );
  }

  const staffRole = userProfile?.staffRole || userProfile?.staff_role || 'SUPER_ADMIN';
  const allowedKeys = ROLE_NAV_PERMISSIONS[staffRole] || ROLE_NAV_PERMISSIONS.SUPER_ADMIN;

  const usersBadge = metrics?.pendingVerifications > 0 ? String(metrics.pendingVerifications) : undefined;
  const listingsBadge = metrics?.pendingListings > 0 ? String(metrics.pendingListings) : undefined;
  const disputesBadge = metrics?.openDisputes > 0 ? String(metrics.openDisputes) : undefined;

  const allNavItems = [
    { key: 'dashboard', label: ROLE_DESK_NAMES[staffRole] || 'Admin dashboard', href: '/admin', icon: LayoutGrid },
    { key: 'users', label: 'User control & verification', href: '/admin/users', icon: Users, badge: usersBadge },
    { key: 'listings', label: 'Product catalog approval', href: '/admin/listings', icon: Package, badge: listingsBadge },
    { key: 'escrow', label: 'Escrow & transactions', href: '/admin/escrow', icon: Lock },
    { key: 'disputes', label: 'Dispute resolution', href: '/admin/disputes', icon: ShieldAlert, badge: disputesBadge },
    { key: 'analytics', label: 'Role balance analytics', href: '/admin/analytics', icon: BarChart3 },
    { key: 'audit', label: 'Staff operational audit logs', href: '/admin/audit', icon: History, adminOnly: true },
    { key: 'roles', label: 'Staff & RBAC permissions', href: '/admin/roles', icon: ShieldCheck, adminOnly: true },
  ];

  const visibleNavItems = allNavItems.filter((item) => allowedKeys.includes(item.key));

  const userName = userProfile?.fullName || userProfile?.full_name || 'Super Admin';
  const initials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();
  const roleTitle = ROLE_LABELS[staffRole] || 'Super Admin';

  const confirmLogout = async () => {
    try {
      setLoggingOut(true);
      await api.logout();
      window.location.href = '/';
    } catch {
      window.location.href = '/';
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="f-body min-h-screen bg-stone-50 flex" suppressHydrationWarning>
      {/* Sidebar */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-20' : 'w-72'
        } shrink-0 bg-stone-900 text-stone-200 flex flex-col relative transition-all duration-200 shadow-xl`}
      >
        {/* Header Branding */}
        <div className="px-6 pt-7 pb-6 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 shrink-0">
              <div className="absolute inset-0 border-2 border-emerald-500 rounded-full" />
              <div className="absolute inset-[3px] border border-dashed border-emerald-400 rounded-full flex items-center justify-center bg-stone-950">
                <span className="f-display font-bold text-emerald-400 text-sm">B</span>
              </div>
            </div>
            {!sidebarCollapsed && (
              <div>
                <p className="f-display font-semibold text-white text-base leading-tight">Bits B2B</p>
                <p className="f-mono text-[9px] uppercase tracking-widest text-stone-400 mt-0.5">Trade Console</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} className={sidebarCollapsed ? 'rotate-180 transition-transform' : ''} />
          </button>
        </div>

        {/* Section Label */}
        {!sidebarCollapsed && (
          <div className="px-6 pt-6 pb-2">
            <p className="f-mono text-[10px] uppercase tracking-widest text-stone-500">Management Areas</p>
          </div>
        )}

        {/* Navigation items */}
        <nav className="flex-1 px-3 space-y-1 mt-2">
          {visibleNavItems.map(({ key, label, href, icon: Icon, badge, adminOnly }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
            return (
              <Link
                key={key}
                href={href}
                className={`relative w-full flex items-center gap-3 px-3.5 py-3 rounded text-left transition-colors ${
                  active
                    ? 'bg-emerald-900/60 text-white font-semibold border-l-4 border-emerald-500'
                    : 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
                }`}
              >
                <Icon size={18} className={active ? 'text-emerald-400' : 'text-stone-400'} />
                {!sidebarCollapsed && <span className="f-body text-sm flex-1">{label}</span>}
                {adminOnly && !sidebarCollapsed && <ShieldCheck size={13} className="text-amber-400" />}
                {badge && !sidebarCollapsed && (
                  <span className="f-mono text-[10px] font-semibold px-1.5 py-0.5 bg-stone-800 text-stone-300 border border-stone-700">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logged in User Profile Card */}
        {sidebarCollapsed ? (
          <div className="px-3 py-4 border-t border-stone-800 bg-stone-950/60 flex flex-col items-center gap-3">
            <Monogram text={initials} tone={staffRole === 'SUPER_ADMIN' ? 'amber' : 'emerald'} />
            <button
              onClick={() => setShowLogoutModal(true)}
              title="Sign Out"
              className="text-stone-400 hover:text-rose-400 transition-colors p-1.5 rounded hover:bg-stone-800 cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="px-4 py-4 border-t border-stone-800 bg-stone-950/60 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Monogram text={initials} tone={staffRole === 'SUPER_ADMIN' ? 'amber' : 'emerald'} />
              <div className="min-w-0">
                <p className="f-body text-sm font-semibold text-white truncate">{userName}</p>
                <p className="f-mono text-[10px] text-emerald-400 font-medium truncate">{roleTitle}</p>
              </div>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              title="Sign Out"
              className="text-stone-400 hover:text-rose-400 transition-colors p-1.5 rounded hover:bg-stone-800 cursor-pointer flex items-center gap-1 text-xs"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 shrink-0 bg-white border-b border-stone-200 flex items-center px-8 gap-6 shadow-sm">
          <Suspense fallback={<div className="flex-1 max-w-md h-9 bg-stone-100 animate-pulse" />}>
            <AdminHeaderSearch staffRole={staffRole} />
          </Suspense>

          <div className="ml-auto flex items-center gap-4">
            <button className="relative text-stone-400 hover:text-stone-600">
              <Bell size={18} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-600 rounded-full" />
            </button>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="f-mono text-[11px] uppercase tracking-wider px-3 py-1.5 border border-emerald-700 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
              title="Click to Logout"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" /> {userName} ({roleTitle})
              <LogOut size={13} className="ml-1 text-stone-500" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>

      {/* Logout Confirmation Dialog Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-sm w-full p-6 border border-stone-200 rounded-lg shadow-xl space-y-4">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0">
                <LogOut size={20} />
              </div>
              <div>
                <h3 className="f-display text-lg font-semibold text-stone-900">Sign Out Confirmation</h3>
                <p className="f-mono text-[10px] uppercase tracking-wider text-stone-400">Operational Session</p>
              </div>
            </div>

            <p className="f-body text-xs text-stone-600 leading-relaxed">
              Are you sure you want to log out of your operational session as <strong className="text-stone-900 font-semibold">{userName}</strong> ({roleTitle})?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="f-body text-xs font-semibold px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-50 rounded transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                disabled={loggingOut}
                className="f-body text-xs font-semibold px-4 py-2 bg-rose-800 hover:bg-rose-900 text-white rounded transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <LogOut size={14} />
                {loggingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
