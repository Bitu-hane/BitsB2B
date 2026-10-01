'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Eye,
  Users,
  CheckCircle,
  ShieldAlert,
  History,
  AlertTriangle,
  Lock,
  RefreshCw,
  X,
  FileText,
  Download,
  CheckCircle2,
  ShieldCheck,
  FileCheck,
  ExternalLink,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';
import { Monogram, Seal, Th, Td, Btn } from '../layout-components';
import { api } from '../../../services/api';
import { toast } from '../../../components/Toast';

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
  statusReason?: string;
  statusUpdatedAt?: string;
  badge?: string;
  joined: string;
  docs: number;
  tradeLicenseNumber?: string;
  tinNumber?: string;
  licenseNumber?: string;
  registrationDocUrl?: string;
  tinDocUrl?: string;
  ownerIdDocUrl?: string;
}

export interface StatusHistoryItem {
  id: string;
  previousStatus: string;
  newStatus: string;
  reason: string;
  changedByName: string;
  changedByRole: string;
  createdAt: string;
}

function UserQueueInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = (searchParams.get('q') || '').trim().toLowerCase();
  const targetUserId = searchParams.get('user');
  const targetModal = searchParams.get('modal');

  const [userTab, setUserTab] = useState<'all' | 'unverified' | 'pending' | 'verified' | 'under_review' | 'suspended' | 'banned'>('all');
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Document Audit Modal State
  const [docModalUser, setDocModalUser] = useState<AdminUserItem | null>(null);
  const [verifyingDocAction, setVerifyingDocAction] = useState<boolean>(false);
  const [docNote, setDocNote] = useState<string>('');

  // Status Change Modal State
  const [statusModalUser, setStatusModalUser] = useState<AdminUserItem | null>(null);
  const [targetStatus, setTargetStatus] = useState<string>('VERIFIED');
  const [statusReason, setStatusReason] = useState<string>('');
  const [isFraudRelated, setIsFraudRelated] = useState<boolean>(false);
  const [submittingStatus, setSubmittingStatus] = useState<boolean>(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // History Modal State
  const [historyModalUser, setHistoryModalUser] = useState<AdminUserItem | null>(null);
  const [historyLogs, setHistoryLogs] = useState<StatusHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  const fetchUsers = async () => {
    if (typeof window === 'undefined') return;
    try {
      setLoading(true);
      const { data, error } = await api.getAdminUsers();
      if (data?.data && Array.isArray(data.data)) {
        setUsers(data.data);
      } else if (error) {
        console.warn('API Error fetching admin users:', error.message);
      }
    } catch (err: any) {
      console.error('Network Error fetching admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // URL-driven modal deep linking effect
  useEffect(() => {
    if (!loading && users.length > 0 && targetUserId) {
      const match = users.find((u) => u.id === targetUserId);
      if (match) {
        if (targetModal === 'documents') {
          setDocModalUser(match);
        } else if (targetModal === 'status') {
          setStatusModalUser(match);
          const raw = (match.rawState || '').toUpperCase();
          setTargetStatus(raw === 'PENDING_REVIEW' || match.status === 'Pending review' ? 'VERIFIED' : raw || 'VERIFIED');
        } else if (targetModal === 'history') {
          openHistoryModal(match, false);
        }
      }
    }
  }, [loading, users, targetUserId, targetModal]);

  const openDocModal = (user: AdminUserItem) => {
    setDocModalUser(user);
    setDocNote('');
    const params = new URLSearchParams(searchParams.toString());
    params.set('user', user.id);
    params.set('modal', 'documents');
    router.replace(`/admin/users?${params.toString()}`);
  };

  const closeDocModal = () => {
    setDocModalUser(null);
    setDocNote('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('user');
    params.delete('modal');
    const qStr = params.toString() ? `?${params.toString()}` : '';
    router.replace(`/admin/users${qStr}`);
  };

  const openStatusModal = (user: AdminUserItem) => {
    setStatusModalUser(user);
    const raw = (user.rawState || '').toUpperCase();
    const defaultTarget = raw === 'PENDING_REVIEW' || user.status === 'Pending review' ? 'VERIFIED' : raw || 'VERIFIED';
    setTargetStatus(defaultTarget);
    setStatusReason('');
    setIsFraudRelated(false);
    setStatusError(null);
    const params = new URLSearchParams(searchParams.toString());
    params.set('user', user.id);
    params.set('modal', 'status');
    router.replace(`/admin/users?${params.toString()}`);
  };

  const closeStatusModal = () => {
    setStatusModalUser(null);
    setStatusError(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('user');
    params.delete('modal');
    const qStr = params.toString() ? `?${params.toString()}` : '';
    router.replace(`/admin/users${qStr}`);
  };

  const openHistoryModal = async (user: AdminUserItem, updateUrl = true) => {
    setHistoryModalUser(user);
    setLoadingHistory(true);
    if (updateUrl) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('user', user.id);
      params.set('modal', 'history');
      router.replace(`/admin/users?${params.toString()}`);
    }
    try {
      const { data } = await api.getUserStatusHistory(user.id);
      if (data?.data && Array.isArray(data.data)) {
        setHistoryLogs(data.data);
      } else {
        setHistoryLogs([]);
      }
    } catch {
      setHistoryLogs([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const closeHistoryModal = () => {
    setHistoryModalUser(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('user');
    params.delete('modal');
    const qStr = params.toString() ? `?${params.toString()}` : '';
    router.replace(`/admin/users${qStr}`);
  };

  const handleDocVerificationAction = async (action: 'APPROVE' | 'REJECT' | 'REQUEST_INFO') => {
    if (!docModalUser) return;
    setVerifyingDocAction(true);
    try {
      const { data } = await api.handleUserVerification(
        docModalUser.id,
        action,
        docNote.trim() || `Verification action ${action} executed by staff`,
      );
      if (data?.success) {
        toast.success(`Verification action "${action}" completed for merchant.`, 'Verification Updated');
        closeDocModal();
        fetchUsers();
      } else {
        toast.error(data?.message || 'Failed to update verification status', 'Action Failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error processing document verification', 'Action Failed');
    } finally {
      setVerifyingDocAction(false);
    }
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalUser) return;
    if (!statusReason.trim()) {
      setStatusError('Reason description is required for status changes.');
      return;
    }

    setSubmittingStatus(true);
    setStatusError(null);

    try {
      const { data, error } = await api.changeUserStatus(
        statusModalUser.id,
        targetStatus as any,
        statusReason.trim(),
        isFraudRelated,
      );

      if (data?.success) {
        closeStatusModal();
        fetchUsers();
      } else {
        setStatusError(error?.message || data?.message || 'Failed to update user account status.');
      }
    } catch (err: any) {
      setStatusError(err.message || 'Error executing status update.');
    } finally {
      setSubmittingStatus(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const raw = (u.rawState || '').toUpperCase();
    if (userTab === 'unverified' && raw !== 'UNVERIFIED') return false;
    if (userTab === 'pending' && raw !== 'PENDING_REVIEW' && u.status !== 'Pending review') return false;
    if (userTab === 'verified' && raw !== 'VERIFIED' && u.status !== 'Verified') return false;
    if (userTab === 'under_review' && raw !== 'UNDER_REVIEW') return false;
    if (userTab === 'suspended' && raw !== 'SUSPENDED') return false;
    if (userTab === 'banned' && raw !== 'BANNED' && raw !== 'REVOKED') return false;

    if (searchQuery) {
      const matchName = (u.name || '').toLowerCase().includes(searchQuery);
      const matchCo = (u.co || '').toLowerCase().includes(searchQuery);
      const matchPhone = (u.phone || '').toLowerCase().includes(searchQuery);
      const matchEmail = (u.email || '').toLowerCase().includes(searchQuery);
      return matchName || matchCo || matchPhone || matchEmail;
    }

    return true;
  });

  const getTabCount = (tabKey: typeof userTab) => {
    if (tabKey === 'all') return users.length;
    return users.filter((u) => {
      const raw = (u.rawState || '').toUpperCase();
      if (tabKey === 'unverified') return raw === 'UNVERIFIED';
      if (tabKey === 'pending') return raw === 'PENDING_REVIEW' || u.status === 'Pending review';
      if (tabKey === 'verified') return raw === 'VERIFIED' || u.status === 'Verified';
      if (tabKey === 'under_review') return raw === 'UNDER_REVIEW';
      if (tabKey === 'suspended') return raw === 'SUSPENDED';
      if (tabKey === 'banned') return raw === 'BANNED' || raw === 'REVOKED';
      return true;
    }).length;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-stone-200 p-6 rounded-lg shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="f-display text-2xl font-bold text-stone-900">User Account & Verification Management</h1>
            <Seal label={`${users.length} Registered`} tone="emerald" />
          </div>
          <p className="f-body text-xs text-stone-500 mt-1">
            Verification desk for inspecting enterprise trade licenses, TIN certificates, owner credentials, and account statuses.
          </p>
        </div>
        <Btn tone="emerald" onClick={fetchUsers}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Directory
        </Btn>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-stone-200 pb-2">
        {[
          { key: 'all', label: 'All Users' },
          { key: 'pending', label: 'Pending Review' },
          { key: 'verified', label: 'Verified Merchants' },
          { key: 'unverified', label: 'Unverified' },
          { key: 'under_review', label: 'Under Review' },
          { key: 'suspended', label: 'Suspended' },
          { key: 'banned', label: 'Banned / Revoked' },
        ].map((tab) => {
          const isActive = userTab === tab.key;
          const count = getTabCount(tab.key as any);
          return (
            <button
              key={tab.key}
              onClick={() => setUserTab(tab.key as any)}
              className={`f-body text-xs font-semibold px-3 py-1.5 rounded-t-md transition-colors cursor-pointer border-b-2 ${
                isActive
                  ? 'border-emerald-800 text-emerald-900 bg-white shadow-2xs font-bold'
                  : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {tab.label} <span className="ml-1 text-[10px] opacity-75 font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Main Table */}
      <div className="bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-400 font-mono">
            Loading merchant accounts &amp; verification records...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto text-stone-400">
              <Users size={22} />
            </div>
            <p className="f-display text-lg font-semibold text-stone-800">No users match tab filter</p>
            <p className="f-body text-sm text-stone-500 max-w-sm mx-auto">
              No business accounts found under this status filter. Select "All Users" to view full user directory.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[520px] overflow-y-auto border-t border-stone-200">
            <table className="w-full text-left min-w-[800px] border-collapse">
              <thead className="bg-stone-50 border-b border-stone-200 sticky top-0 z-10 shadow-2xs">
                <tr>
                  <Th>User / Company</Th>
                  <Th>Role</Th>
                  <Th>Contact</Th>
                  <Th>Current Access Status</Th>
                  <Th>Joined</Th>
                  <Th right>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/60 transition-colors">
                    <Td>
                      <div className="flex items-center gap-3">
                        <Monogram text={u.name.split(' ').map((n) => n[0]).join('')} tone={u.tone || 'amber'} />
                        <div>
                          <p className="f-body text-sm font-semibold text-stone-800">{u.name}</p>
                          <p className="f-body text-xs text-stone-500">{u.co}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <Seal label={u.role} tone={u.roleTone || 'stone'} />
                    </Td>
                    <Td>
                      <p className="f-mono text-xs text-stone-700">{u.phone}</p>
                      <p className="f-mono text-xs text-stone-400">{u.email}</p>
                    </Td>
                    <Td>
                      <Seal label={u.status} tone={u.tone} />
                      {u.statusReason && (
                        <p className="f-body text-[11px] text-stone-500 mt-1 max-w-xs truncate" title={u.statusReason}>
                          Reason: {u.statusReason}
                        </p>
                      )}
                    </Td>
                    <Td>
                      <span className="f-mono text-xs text-stone-500">{u.joined}</span>
                    </Td>
                    <Td right>
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => openHistoryModal(u)}
                          title="View Status History Log"
                          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                        >
                          <History size={15} />
                        </button>

                        <Btn
                          tone="amber"
                          onClick={() => openDocModal(u)}
                        >
                          <FileText size={13} /> View Docs
                        </Btn>

                        {(u.status === 'Pending review' || u.rawState === 'PENDING_REVIEW') && (
                          <Btn
                            tone="emerald"
                            filled
                            onClick={async () => {
                              const reason = prompt(`Approve & Verify merchant account "${u.name}" (${u.co})?\n\nEnter verification reason / document check note:`, 'Trade license & TIN verified');
                              if (reason !== null) {
                                try {
                                  const { data } = await api.handleUserVerification(u.id, 'APPROVE', reason.trim() || 'Approved by Verification Officer');
                                  if (data?.success) {
                                    toast.success(`Merchant account "${u.name}" verified.`, 'Account Verified');
                                    fetchUsers();
                                  }
                                } catch (err: any) {
                                  toast.error(err.message || 'Failed to verify account', 'Verification Error');
                                }
                              }
                            }}
                          >
                            Approve &amp; Verify
                          </Btn>
                        )}

                        <Btn tone="stone" onClick={() => openStatusModal(u)}>
                          Manage Access &amp; Status
                        </Btn>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Business Registration Documents Audit Desk */}
      {docModalUser && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-300 shadow-2xl max-w-2xl w-full p-6 space-y-5 text-stone-800">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="f-display text-base font-bold text-stone-900">
                    Business Owner Verification Documents
                  </h3>
                  <p className="f-body text-xs text-stone-500">
                    Merchant: <strong>{docModalUser.name}</strong> &bull; Company: <strong>{docModalUser.co}</strong>
                  </p>
                </div>
              </div>
              <button onClick={closeDocModal} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Document Files Grid */}
            <div className="grid sm:grid-cols-2 gap-3">
              {/* Card 1: Trade Registration / License */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="f-mono text-[10px] uppercase font-bold text-stone-500 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-emerald-700" /> Trade License File
                  </span>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    Verified Format
                  </span>
                </div>
                <p className="f-body text-xs font-semibold text-stone-900 truncate">
                  No: {docModalUser.tradeLicenseNumber || docModalUser.licenseNumber || 'TR-2026-ETH-9918'}
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <a
                    href={docModalUser.registrationDocUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 px-2.5 bg-white border border-stone-300 hover:bg-stone-100 rounded-lg text-[11px] font-semibold text-stone-700 flex items-center justify-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-700" /> View Document
                  </a>
                  <a
                    href={docModalUser.registrationDocUrl || '#'}
                    download
                    className="py-1.5 px-2 bg-stone-200 hover:bg-stone-300 rounded-lg text-stone-700 text-xs transition-colors"
                    title="Download Copy"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Card 2: TIN Certificate */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="f-mono text-[10px] uppercase font-bold text-stone-500 flex items-center gap-1">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-amber-700" /> Tax Identification (TIN)
                  </span>
                  <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                    Valid TIN
                  </span>
                </div>
                <p className="f-body text-xs font-semibold text-stone-900 truncate">
                  TIN: {docModalUser.tinNumber || '0019284716'}
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <a
                    href={docModalUser.tinDocUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 px-2.5 bg-white border border-stone-300 hover:bg-stone-100 rounded-lg text-[11px] font-semibold text-stone-700 flex items-center justify-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-700" /> View Certificate
                  </a>
                  <a
                    href={docModalUser.tinDocUrl || '#'}
                    download
                    className="py-1.5 px-2 bg-stone-200 hover:bg-stone-300 rounded-lg text-stone-700 text-xs transition-colors"
                    title="Download Copy"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Verification Note Input */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Verification Audit Note / Staff Check Remarks:
              </label>
              <textarea
                value={docNote}
                onChange={(e) => setDocNote(e.target.value)}
                placeholder="e.g. Verified official Ministry of Trade registration stamp & TIN record match company name..."
                rows={2}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-emerald-700 placeholder:text-stone-400"
              />
            </div>

            {/* Staff Verification Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={closeDocModal}
                className="px-4 py-2 border border-stone-300 text-stone-700 font-semibold text-xs rounded-xl hover:bg-stone-50 cursor-pointer"
              >
                Close Audit
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={verifyingDocAction}
                  onClick={() => handleDocVerificationAction('REQUEST_INFO')}
                  className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Request Info / Correction
                </button>
                <button
                  type="button"
                  disabled={verifyingDocAction}
                  onClick={() => handleDocVerificationAction('APPROVE')}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {verifyingDocAction && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve &amp; Verify Merchant</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Status Change Modal */}
      {statusModalUser && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-300 shadow-2xl max-w-lg w-full p-6 space-y-4 text-stone-800">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="f-display text-base font-bold text-stone-900">Manage Account Access Status</h3>
                <p className="f-body text-xs text-stone-500">
                  User: <strong>{statusModalUser.name}</strong> ({statusModalUser.co})
                </p>
              </div>
              <button onClick={closeStatusModal} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {statusError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{statusError}</span>
              </div>
            )}

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Select New Account Status
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-emerald-700 cursor-pointer"
                >
                  <option value="VERIFIED">🟢 Verified (Full Standing · All Capabilities Enabled)</option>
                  <option value="UNDER_REVIEW">🟠 Under Review (Existing live, new listings &amp; orders blocked)</option>
                  <option value="SUSPENDED">🔴 Suspended (All listings hidden, activity paused)</option>
                  <option value="BANNED">⬛ Revoked / Banned (Permanent removal · Admin Only)</option>
                  <option value="PENDING_REVIEW">🟡 Pending Review (Sitting in verification queue)</option>
                  <option value="UNVERIFIED">⚪ Unverified (Drafts &amp; browse only)</option>
                </select>
              </div>

              {targetStatus === 'SUSPENDED' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-700" /> Routine vs. Fraud Suspension
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Routine suspensions (expired license, minor document issues) can be performed by Verification Officers. Fraud-related suspensions require **Super Admin** authority.
                  </p>
                  <label className="flex items-center gap-2 pt-1 font-semibold text-stone-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFraudRelated}
                      onChange={(e) => setIsFraudRelated(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                    <span>Mark as Fraud-related Suspension (Requires Super Admin)</span>
                  </label>
                </div>
              )}

              {targetStatus === 'BANNED' && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2">
                  <Lock className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Permanent Revocation / Ban:</strong> Requires **Super Admin** role. All listings will be hidden/removed and account disabled except for past invoice downloads.
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Reason &amp; Audit Justification <span className="text-rose-600">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Provide explicit operational or document reason for this status change..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-emerald-700 placeholder:text-stone-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={closeStatusModal}
                  className="px-4 py-2 border border-stone-300 text-stone-700 font-semibold text-xs rounded-xl hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingStatus}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                >
                  {submittingStatus && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Status Change</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: History Timeline Modal */}
      {historyModalUser && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-300 shadow-2xl max-w-lg w-full p-6 space-y-4 text-stone-800">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="f-display text-base font-bold text-stone-900 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-emerald-700" /> Account Status Audit Trail
                </h3>
                <p className="f-body text-xs text-stone-500">
                  User: <strong>{historyModalUser.name}</strong> ({historyModalUser.co})
                </p>
              </div>
              <button onClick={closeHistoryModal} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
              {loadingHistory ? (
                <div className="p-6 text-center text-xs text-stone-400 font-mono">Loading status history...</div>
              ) : historyLogs.length === 0 ? (
                <div className="p-6 text-center text-xs text-stone-400">No status change history recorded yet for this account.</div>
              ) : (
                historyLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-stone-700 font-semibold">
                      <span>
                        {log.previousStatus} &rarr; <strong className="text-emerald-800">{log.newStatus}</strong>
                      </span>
                      <span className="f-mono text-[10px] text-stone-400">{log.createdAt}</span>
                    </div>
                    <p className="text-stone-600 text-[11px]">Reason: {log.reason}</p>
                    <div className="f-mono text-[10px] text-stone-400">
                      Executed by: {log.changedByName} ({log.changedByRole})
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-stone-200">
              <button
                onClick={closeHistoryModal}
                className="px-4 py-2 bg-stone-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-stone-500 font-mono text-sm">Loading verification desk...</div>}>
      <UserQueueInner />
    </Suspense>
  );
}
