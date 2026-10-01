'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { History, Search, Filter, ShieldCheck, RefreshCw, Calendar, UserCheck, ShieldAlert } from 'lucide-react';
import { Th, Td, Seal, Monogram, Btn } from '../layout-components';
import { api } from '../../../services/api';

export interface AuditLogItem {
  id: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}

function formatRelativeTime(dateStr: string): { relative: string; exact: string } {
  if (!dateStr) return { relative: 'Unknown time', exact: '' };
  const logDate = new Date(dateStr);
  if (isNaN(logDate.getTime())) {
    return { relative: dateStr, exact: dateStr };
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - logDate.getTime()) / 1000);

  let relative = '';
  if (diffInSeconds < 30) {
    relative = 'Just now';
  } else if (diffInSeconds < 60) {
    relative = `${diffInSeconds}s ago`;
  } else if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    relative = `${mins} ${mins === 1 ? 'min' : 'mins'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    relative = `${hours} ${hours === 1 ? 'hr' : 'hrs'} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    relative = `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    relative = `${weeks} ${weeks === 1 ? 'wk' : 'wks'} ago`;
  } else {
    const months = Math.floor(diffInSeconds / 2592000);
    relative = `${months} ${months === 1 ? 'mo' : 'mos'} ago`;
  }

  const exact = logDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return { relative, exact };
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Filters State
  const [staffFilter, setStaffFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const [profileRes, logsRes] = await Promise.all([
        api.getProfile(),
        api.getAdminAuditLogs(),
      ]);
      if (profileRes.data) {
        setUserProfile(prev => {
          if (JSON.stringify(prev) === JSON.stringify(profileRes.data)) return prev;
          return profileRes.data;
        });
      }
      if (logsRes.data?.data && Array.isArray(logsRes.data.data)) {
        setLogs(prev => {
          if (JSON.stringify(prev) === JSON.stringify(logsRes.data.data)) return prev;
          return logsRes.data.data;
        });
      }
    } catch (err: any) {
      console.error('Error fetching audit logs:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(true);
    const interval = setInterval(() => fetchLogs(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const staffRole = userProfile?.staffRole || userProfile?.staff_role || 'SUPER_ADMIN';
  const isSuperAdmin = staffRole === 'SUPER_ADMIN';

  // Dynamic list of unique staff names from logs
  const staffOptions = useMemo(() => {
    const names = Array.from(new Set(logs.map((l) => l.adminName).filter(Boolean)));
    return names.sort();
  }, [logs]);

  // Robust Filtered Audit Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const nameUpper = (log.adminName || '').toUpperCase();
      const actionUpper = (log.action || '').toUpperCase();
      const targetUpper = (log.targetType || '').toUpperCase();
      const detailsUpper = (log.details || '').toUpperCase();

      // 1. Staff Filter (Staff Name or Staff Role category)
      if (staffFilter !== 'ALL') {
        if (staffFilter === 'VERIFICATION_OFFICER') {
          if (!nameUpper.includes('YONAS') && !actionUpper.includes('VERIF') && !detailsUpper.includes('VERIF')) return false;
        } else if (staffFilter === 'LISTINGS_MODERATOR') {
          if (!nameUpper.includes('MERON') && !actionUpper.includes('LISTING') && !detailsUpper.includes('LISTING')) return false;
        } else if (staffFilter === 'ESCROW_OFFICER') {
          if (!nameUpper.includes('ROBEL') && !actionUpper.includes('ESCROW') && !detailsUpper.includes('ESCROW')) return false;
        } else if (staffFilter === 'DISPUTE_MEDIATOR') {
          if (!nameUpper.includes('HANA') && !actionUpper.includes('DISPUTE') && !detailsUpper.includes('DISPUTE')) return false;
        } else if (staffFilter === 'SUPER_ADMIN') {
          if (!nameUpper.includes('SELAMAWIT') && !nameUpper.includes('ADMIN')) return false;
        } else {
          if (log.adminName !== staffFilter && !nameUpper.includes(staffFilter.toUpperCase())) return false;
        }
      }

      // 2. Action Category Filter
      if (categoryFilter !== 'ALL') {
        const cat = categoryFilter.toUpperCase();
        if (cat === 'VERIFICATION') {
          if (!actionUpper.includes('VERIF') && !targetUpper.includes('USER') && !detailsUpper.includes('VERIF')) return false;
        } else if (cat === 'ESCROW') {
          if (!actionUpper.includes('ESCROW') && !actionUpper.includes('PAYOUT') && !actionUpper.includes('RELEASE') && !actionUpper.includes('REFUND') && !targetUpper.includes('ESCROW')) return false;
        } else if (cat === 'LISTING') {
          if (!actionUpper.includes('LISTING') && !actionUpper.includes('PRODUCT') && !targetUpper.includes('LISTING')) return false;
        } else if (cat === 'DISPUTE') {
          if (!actionUpper.includes('DISPUTE') && !targetUpper.includes('DISPUTE')) return false;
        } else if (cat === 'STAFF') {
          if (!actionUpper.includes('STAFF') && !actionUpper.includes('ROLE') && !detailsUpper.includes('STAFF')) return false;
        }
      }

      // 3. Date Filter (Relative Time / Hour & Day Ranges)
      if (dateFilter !== 'ALL') {
        const logDateStr = log.timestamp || '';
        const now = new Date();
        const logDate = new Date(logDateStr);
        if (!isNaN(logDate.getTime())) {
          const diffInHours = (now.getTime() - logDate.getTime()) / (1000 * 3600);
          if (dateFilter === '1HOUR' && diffInHours > 1) return false;
          if (dateFilter === '6HOURS' && diffInHours > 6) return false;
          if (dateFilter === 'TODAY' && diffInHours > 24) return false;
          if (dateFilter === '7DAYS' && diffInHours > 24 * 7) return false;
          if (dateFilter === '30DAYS' && diffInHours > 24 * 30) return false;
        }
      }

      // 4. Case-Insensitive Search Term Substring Matching
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const matchName = (log.adminName || '').toLowerCase().includes(q);
        const matchAction = (log.action || '').toLowerCase().includes(q);
        const matchDetails = (log.details || '').toLowerCase().includes(q);
        const matchTarget = (log.targetType || '').toLowerCase().includes(q);
        const matchTime = (log.timestamp || '').toLowerCase().includes(q);
        const matchId = (log.targetId || '').toLowerCase().includes(q);
        return matchName || matchAction || matchDetails || matchTarget || matchTime || matchId;
      }

      return true;
    });
  }, [logs, staffFilter, categoryFilter, dateFilter, searchTerm]);

  const resetFilters = () => {
    setStaffFilter('ALL');
    setCategoryFilter('ALL');
    setDateFilter('ALL');
    setSearchTerm('');
  };

  if (userProfile && !isSuperAdmin) {
    return (
      <div className="bg-white border border-stone-200 p-8 text-center max-w-md mx-auto my-12 space-y-3 shadow-sm">
        <ShieldAlert size={32} className="text-amber-600 mx-auto" />
        <h2 className="f-display text-lg font-semibold text-stone-900">Audit Access Restricted</h2>
        <p className="f-body text-xs text-stone-500">
          The full platform audit ledger is restricted exclusively to Super Admins.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="f-display text-2xl font-semibold text-stone-900 flex items-center gap-2">
            <History className="text-emerald-700" size={24} /> Staff Operational Audit Log Trail
          </h1>
          <p className="f-body text-stone-500 mt-1">
            Immutable security ledger tracking every user verification, escrow release, catalog approval, and dispute resolution.
          </p>
        </div>
        <Btn tone="emerald" onClick={() => fetchLogs()}>
          <span className="inline-flex items-center gap-1.5">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh Trail
          </span>
        </Btn>
      </div>

      {/* Top Filtering Toolbar */}
      <div className="bg-white border border-stone-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2 text-stone-700">
            <Filter size={16} className="text-emerald-700" />
            <span className="f-display font-semibold text-sm">Filter Audit Records</span>
          </div>
          <button
            onClick={resetFilters}
            className="f-mono text-xs text-emerald-800 hover:underline cursor-pointer font-medium"
          >
            Reset all filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Filter 1: Staff Member Dropdown */}
          <div>
            <label className="f-mono text-xs text-stone-500 block mb-1">Staff Member / Role</label>
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 p-2 text-sm text-stone-900 font-medium focus:outline-none focus:border-emerald-700"
            >
              <option value="ALL">All Staff Members ({staffOptions.length})</option>
              <optgroup label="By Role Desk">
                <option value="VERIFICATION_OFFICER">Verification Officer (Yonas)</option>
                <option value="LISTINGS_MODERATOR">Product Approver (Meron)</option>
                <option value="ESCROW_OFFICER">Escrow Officer (Robel)</option>
                <option value="DISPUTE_MEDIATOR">Dispute Resolver (Hana)</option>
                <option value="SUPER_ADMIN">Super Admin (Selamawit)</option>
              </optgroup>
              <optgroup label="By Name">
                {staffOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Filter 2: Action Category Dropdown */}
          <div>
            <label className="f-mono text-xs text-stone-500 block mb-1">Operational Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 p-2 text-sm text-stone-900 font-medium focus:outline-none focus:border-emerald-700"
            >
              <option value="ALL">All Action Categories</option>
              <option value="VERIFICATION">User & Merchant Verifications</option>
              <option value="LISTING">Product Catalog Approvals</option>
              <option value="ESCROW">Escrow & Financial Payouts</option>
              <option value="DISPUTE">Dispute Resolutions</option>
              <option value="STAFF">Staff Role Assignments</option>
            </select>
          </div>

          {/* Filter 3: Date Range Filter */}
          <div>
            <label className="f-mono text-xs text-stone-500 block mb-1">Time Range</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 p-2 text-sm text-stone-900 font-medium focus:outline-none focus:border-emerald-700"
            >
              <option value="ALL">All Time History</option>
              <option value="1HOUR">Past 1 Hour</option>
              <option value="6HOURS">Past 6 Hours</option>
              <option value="TODAY">Past 24 Hours (Today)</option>
              <option value="7DAYS">Past 7 Days</option>
              <option value="30DAYS">Past 30 Days</option>
            </select>
          </div>

          {/* Filter 4: Search Keywords */}
          <div>
            <label className="f-mono text-xs text-stone-500 block mb-1">Search Keywords</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search details or action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-300 text-stone-900 font-medium focus:outline-none focus:border-emerald-700 placeholder:text-stone-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <span className="f-body text-sm font-semibold text-stone-800">
            Showing {filteredLogs.length} of {logs.length} audit entries
          </span>
          <span className="f-mono text-xs text-stone-400">Immutable Ledger</span>
        </div>

        {loading ? (
          <div className="p-12 text-center f-body text-sm text-stone-400">Loading platform audit logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="f-display text-base font-semibold text-stone-700">No matching audit logs found</p>
            <p className="f-body text-xs text-stone-400">Try adjusting your staff, category, or search filters above.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <Th>Time & Date</Th>
                <Th>Staff Member</Th>
                <Th>Operational Action</Th>
                <Th>Target Area</Th>
                <Th>Action Details & Notes</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredLogs.map((log) => {
                const initials = (log.adminName || 'Admin')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase();
                const { relative, exact } = formatRelativeTime(log.timestamp);
                return (
                  <tr key={log.id} className="hover:bg-stone-50/60 transition-colors">
                    <Td>
                      <div className="space-y-0.5">
                        <span className="inline-block font-mono text-[11px] font-semibold text-emerald-900 bg-emerald-100/70 border border-emerald-200/80 px-2 py-0.5 rounded shadow-2xs">
                          {relative}
                        </span>
                        <div className="flex items-center gap-1 font-mono text-[10px] text-stone-400">
                          <Calendar size={11} className="text-stone-400" />
                          <span>{exact || log.timestamp}</span>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <Monogram text={initials} tone="emerald" />
                        <div>
                          <p className="f-body text-sm font-semibold text-stone-900">{log.adminName}</p>
                          <p className="f-mono text-[10px] text-stone-400">Authorized Staff</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <Seal
                        label={log.action}
                        tone={
                          log.action.includes('REJECT') || log.action.includes('REVOKE')
                            ? 'rose'
                            : log.action.includes('APPROVE') || log.action.includes('RELEASE')
                            ? 'emerald'
                            : 'amber'
                        }
                      />
                    </Td>
                    <Td>
                      <span className="f-mono text-xs font-semibold px-2 py-0.5 bg-stone-100 text-stone-700 border border-stone-200">
                        {log.targetType}
                      </span>
                    </Td>
                    <Td>
                      <p className="f-body text-xs text-stone-700 font-medium max-w-md">{log.details}</p>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
