'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StatCard, Seal, Monogram, Btn } from './layout-components';
import { Users, Package, Lock, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';

export interface AdminUserItem {
  id: string;
  name: string;
  co: string;
  role: string;
  roleTone?: string;
  phone: string;
  email: string;
  status: string;
  tone: string;
  rawState?: string;
  joined: string;
  docs: number;
}

const ROLE_SCOPES: Record<string, { title: string; scope: string; tasks: string[]; queueHref: string; queueLabel: string }> = {
  SUPER_ADMIN: {
    title: 'Super Admin',
    scope: 'Full System Ownership & Override Authority',
    queueHref: '/admin/users',
    queueLabel: 'Open verification queue',
    tasks: [
      'Manage money movement authority & platform commission settings',
      'Hire, assign, or revoke operational staff member roles',
      'Approve escrow releases & dispute payouts over 50,000 ETB',
      'Review platform audit logs and system activity',
    ],
  },
  VERIFICATION_OFFICER: {
    title: 'Verification Officer',
    scope: 'User Verification & Business Onboarding Only',
    queueHref: '/admin/users',
    queueLabel: 'Go to verification queue',
    tasks: [
      'Review business license, TIN & import/export documents',
      'Approve, reject, or request more info on new merchant accounts',
      'Flag suspicious or mismatched registration documents',
      'Escalate large institutional buyer accounts to Super Admin',
    ],
  },
  LISTINGS_MODERATOR: {
    title: 'Product Approver',
    scope: 'Product Listings Moderation Queue Only',
    queueHref: '/admin/listings',
    queueLabel: 'Go to product approval queue',
    tasks: [
      'Approve new wholesale product listings before publish',
      'Remove policy-violating or duplicate product submissions',
      'Investigate reported/flagged product listings',
      'Manage product categories and wholesale taxonomy',
    ],
  },
  ESCROW_OFFICER: {
    title: 'Escrow Officer',
    scope: 'Routine Escrow Releases & Refunds Under 50,000 ETB',
    queueHref: '/admin/escrow',
    queueLabel: 'Go to escrow ledger',
    tasks: [
      'Release escrow funds to seller for orders under 50,000 ETB',
      'Process buyer refunds under the 50,000 ETB threshold',
      'Reconcile held vs. released escrow balances',
      'Escalate transaction releases above 50,000 ETB to Super Admin',
    ],
  },
  DISPUTE_MEDIATOR: {
    title: 'Dispute Resolver',
    scope: 'Investigate Disputes & Write Binding Recommendations',
    queueHref: '/admin/disputes',
    queueLabel: 'Go to dispute resolution desk',
    tasks: [
      'Review chat logs & delivery evidence for open order disputes',
      'Contact buyer and seller for clarification on claims',
      'Write binding mediation recommendation note',
      'Hand off financial payout execution to Escrow Officer or Admin',
    ],
  },
  ANALYST: {
    title: 'Analyst',
    scope: 'Read-Only Liquidity & Market Demand Analytics',
    queueHref: '/admin/analytics',
    queueLabel: 'View liquidity analytics',
    tasks: [
      'Monitor role liquidity ratios across Ethiopian regions',
      'Analyze buyer search demand signals & procurement trends',
      'Inspect platform transaction volume & order throughput',
      'Generate platform liquidity reports for executive team',
    ],
  },
};

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const [usersRes, metricsRes, profileRes] = await Promise.all([
        api.getAdminUsers(),
        api.getAdminMetrics(),
        api.getProfile(),
      ]);

      if (usersRes.data?.data && Array.isArray(usersRes.data.data)) {
        setUsers(prev => {
          if (JSON.stringify(prev) === JSON.stringify(usersRes.data.data)) return prev;
          return usersRes.data.data;
        });
      }
      if (metricsRes.data?.data) {
        setMetrics(prev => {
          if (JSON.stringify(prev) === JSON.stringify(metricsRes.data.data)) return prev;
          return metricsRes.data.data;
        });
      }
      if (profileRes.data) {
        setUserProfile(prev => {
          if (JSON.stringify(prev) === JSON.stringify(profileRes.data)) return prev;
          return profileRes.data;
        });
      }
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(true);
    const interval = setInterval(() => fetchDashboardData(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const staffRole = userProfile?.staffRole || userProfile?.staff_role || 'SUPER_ADMIN';
  const isAdmin = staffRole === 'SUPER_ADMIN';
  const roleConfig = ROLE_SCOPES[staffRole] || ROLE_SCOPES.SUPER_ADMIN;

  const userName = userProfile?.fullName || userProfile?.full_name || 'Staff User';
  const firstName = userName.split(' ')[0];

  const pendingUsers = users.filter((u) => (u.rawState || 'PENDING_REVIEW') === 'PENDING_REVIEW' || u.status === 'Pending review');
  const pendingCount = metrics?.pendingVerifications ?? pendingUsers.length;
  const activeListings = metrics?.activeListings ?? 0;
  const heldEscrowETB = metrics?.heldEscrowETB ?? 0;
  const openDisputes = metrics?.openDisputes ?? 0;

  return (
    <div className="space-y-8">
      {/* Masthead Header Banner */}
      <div className="bg-white border border-stone-200 border-l-4 border-l-emerald-700 p-8 shadow-sm">
        <div className="flex items-end justify-between">
          <div>
            <p className="f-mono text-[10px] uppercase tracking-[0.2em] text-stone-400">
              {isAdmin ? 'Marketplace control tower' : `${roleConfig.title} · Daily Desk`}
            </p>
            <h1 className="f-display text-3xl font-semibold text-stone-900 mt-1">
              {isAdmin ? 'The trade desk, today' : `Good morning, ${firstName}`}
            </h1>
          </div>
          <div className="text-right">
            <p className="f-mono text-[10px] uppercase tracking-widest text-stone-400">Registry No.</p>
            <p className="f-mono text-xs text-stone-500">ETH-2026-0091</p>
          </div>
        </div>
        <p className="f-body text-sm text-stone-500 mt-3 pt-3 border-t border-stone-100">
          {isAdmin
            ? 'Real-time oversight of buyer/seller verifications, escrow security, and platform liquidity.'
            : "Here's your assigned action queue and task checklist — nothing outside your role scope is shown."}
        </p>
      </div>

      {/* Scope Banner (For Non-Admin Staff) */}
      {!isAdmin && (
        <div className="bg-white border-2 border-stone-900 p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="f-mono text-[11px] uppercase tracking-wider text-amber-700 font-semibold">Your Assigned Staff Scope</p>
            <p className="f-display text-xl font-semibold text-stone-900 mt-1">{roleConfig.scope}</p>
          </div>
          <Link href={roleConfig.queueHref}>
            <Btn tone="emerald" filled>
              <span className="inline-flex items-center gap-1.5">
                {roleConfig.queueLabel} <ArrowRight size={14} />
              </span>
            </Btn>
          </Link>
        </div>
      )}

      {/* Stat Cards Grid (Only shown for Admin or role-appropriate counts) */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            eyebrow="Pending verifications"
            value={String(pendingCount)}
            note={pendingCount > 0 ? `${pendingCount} accounts pending review` : 'No accounts pending review'}
            tone={pendingCount > 0 ? 'amber' : 'stone'}
            cta="Review"
            href="/admin/users"
          />
          <StatCard
            eyebrow="Listings moderation"
            value={String(activeListings)}
            note={activeListings > 0 ? `${activeListings} active published listings` : 'No listings awaiting approval'}
            tone="stone"
            cta="Review"
            href="/admin/listings"
          />
          <StatCard
            eyebrow="Held escrow funds"
            value={heldEscrowETB.toLocaleString()}
            unit="ETB"
            note={heldEscrowETB > 0 ? 'Secured in Telebirr & CBE Birr escrow' : 'No active escrow orders held'}
            tone={heldEscrowETB > 0 ? 'amber' : 'stone'}
            cta="View"
            href="/admin/escrow"
          />
          <StatCard
            eyebrow="Open disputes"
            value={String(openDisputes)}
            note={openDisputes > 0 ? `${openDisputes} active open dispute cases` : 'No open disputes reported'}
            tone={openDisputes > 0 ? 'rose' : 'stone'}
            cta="Resolve"
            href="/admin/disputes"
          />
        </div>
      )}

      {/* Two Column Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Queue Column (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-stone-200 shadow-sm">
          {(isAdmin || staffRole === 'VERIFICATION_OFFICER') && (
            <div>
              <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h2 className="f-display text-lg font-semibold text-stone-900">Pending verification queue</h2>
                  <p className="f-body text-sm text-stone-500">Business license, TIN, and procurement authorizations</p>
                </div>
                <Link href="/admin/users" className="f-body text-sm font-medium text-emerald-800 hover:underline">
                  View all
                </Link>
              </div>

              {loading ? (
                <p className="f-body text-sm text-stone-400 p-8">Loading queue...</p>
              ) : pendingUsers.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto text-stone-400">
                    <Users size={18} />
                  </div>
                  <p className="f-body text-sm font-semibold text-stone-700">Verification queue is empty</p>
                  <p className="f-body text-xs text-stone-400">All registered user accounts are currently verified or clear.</p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {pendingUsers.map((u) => (
                    <div key={u.id} className="px-6 py-4 flex items-center gap-4 hover:bg-stone-50/50 transition-colors">
                      <Monogram text={u.name.split(' ').map((n) => n[0]).join('')} tone={u.tone} />
                      <div className="flex-1 min-w-0">
                        <p className="f-body text-sm font-semibold text-stone-800 flex items-center gap-2">
                          <span>{u.name}</span>
                          <Seal label={u.role} tone={u.roleTone || 'amber'} />
                        </p>
                        <p className="f-body text-sm text-stone-500 mt-0.5">{u.co}</p>
                        <p className="f-mono text-[11px] text-stone-400 mt-1">
                          Submitted {u.joined} · {u.docs} document{u.docs !== 1 ? 's' : ''} attached
                        </p>
                      </div>
                      <Seal label={u.status} tone={u.tone} />
                      <Link href="/admin/users">
                        <Btn tone="emerald" filled>Review docs</Btn>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {staffRole === 'LISTINGS_MODERATOR' && (
            <div>
              <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h2 className="f-display text-lg font-semibold text-stone-900">Listings moderation queue</h2>
                  <p className="f-body text-sm text-stone-500">Inspect product submissions and reported items</p>
                </div>
                <Link href="/admin/listings" className="f-body text-sm font-medium text-emerald-800 hover:underline">
                  View all listings
                </Link>
              </div>
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto text-stone-400">
                  <Package size={18} />
                </div>
                <p className="f-body text-sm font-semibold text-stone-700">Listings moderation queue is clear</p>
                <p className="f-body text-xs text-stone-400">No new product submissions awaiting review.</p>
              </div>
            </div>
          )}

          {staffRole === 'ESCROW_OFFICER' && (
            <div>
              <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h2 className="f-display text-lg font-semibold text-stone-900">Escrow ledger — Action needed</h2>
                  <p className="f-body text-sm text-stone-500">Release threshold: 50,000 ETB</p>
                </div>
                <Link href="/admin/escrow" className="f-body text-sm font-medium text-emerald-800 hover:underline">
                  View full ledger
                </Link>
              </div>
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto text-stone-400">
                  <Lock size={18} />
                </div>
                <p className="f-body text-sm font-semibold text-stone-700">Escrow release queue is clear</p>
                <p className="f-body text-xs text-stone-400">No active escrow orders held under threshold.</p>
              </div>
            </div>
          )}

          {staffRole === 'DISPUTE_MEDIATOR' && (
            <div>
              <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h2 className="f-display text-lg font-semibold text-stone-900">Open disputes — Investigation queue</h2>
                  <p className="f-body text-sm text-stone-500">Investigate claims and submit recommendations</p>
                </div>
                <Link href="/admin/disputes" className="f-body text-sm font-medium text-emerald-800 hover:underline">
                  View dispute cases
                </Link>
              </div>
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto text-stone-400">
                  <ShieldAlert size={18} />
                </div>
                <p className="f-body text-sm font-semibold text-stone-700">Dispute mediation queue is clear</p>
                <p className="f-body text-xs text-stone-400">No active open dispute cases filed.</p>
              </div>
            </div>
          )}

          {staffRole === 'ANALYST' && (
            <div className="p-8 text-center space-y-2">
              <p className="f-body text-sm font-semibold text-stone-700">Read-Only Analytics Mode</p>
              <p className="f-body text-xs text-stone-400">Check Role Liquidity panel to monitor platform trade signals.</p>
            </div>
          )}
        </div>

        {/* Task Checklist or Role Liquidity Column (1 col) */}
        {!isAdmin ? (
          <div className="bg-white border border-stone-200 p-6 shadow-sm">
            <h2 className="f-display text-lg font-semibold text-stone-900">Your Task Checklist</h2>
            <p className="f-body text-xs text-stone-500 mb-4">{roleConfig.title} Duties</p>
            <div className="space-y-3">
              {roleConfig.tasks.map((task, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="f-mono text-xs font-semibold text-emerald-800 shrink-0 mt-0.5">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <p className="f-body text-xs text-stone-700 leading-relaxed">{task}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-stone-200 p-6 shadow-sm">
            <h2 className="f-display text-lg font-semibold text-stone-900">Role liquidity</h2>
            <p className="f-body text-sm text-stone-500 mb-5">Balance across producers and buyers</p>
            {[
              { label: 'Importers', pct: 0, tone: 'amber' },
              { label: 'Producers', pct: 0, tone: 'emerald' },
              { label: 'Institutional buyers', pct: 0, tone: 'amber' },
            ].map((r) => (
              <div key={r.label} className="mb-4">
                <div className="flex justify-between mb-1.5">
                  <span className="f-body text-sm text-stone-600">{r.label}</span>
                  <span className="f-mono text-xs text-stone-500">{r.pct}%</span>
                </div>
                <div className="h-1.5 bg-stone-100">
                  <div
                    className={`h-1.5 ${
                      r.tone === 'emerald' ? 'bg-emerald-700' : 'bg-amber-700'
                    }`}
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="mt-5 pt-5 border-t border-stone-100">
              <p className="f-mono text-[11px] uppercase tracking-wider text-stone-500 mb-1.5 font-semibold">Liquidity status</p>
              <p className="f-body text-sm text-stone-600">
                Real-time platform liquidity indicators calculate automatically as accounts onboard into PostgreSQL.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
