'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Check,
  Lock,
  UserPlus,
  Save,
  Trash2,
  UserX,
  ChevronDown,
  ChevronUp,
  Sliders,
  CheckCircle2,
  UserCog,
  Key,
} from 'lucide-react';
import { Th, Td, Btn, Seal, Monogram } from '../layout-components';
import { api } from '../../../services/api';
import { toast } from '../../../components/Toast';

export interface RBACRole {
  id: string;
  name: string;
  code: string;
  description: string;
  staffCount: number;
  permissions: Record<string, { read: boolean; write: boolean; approve: boolean; override: boolean }>;
}

export interface StaffItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  staffRole: string;
  isActive: boolean;
  createdAt: string;
}

// Role Scope & Task Checklist mapping
const ROLE_SCOPES: Record<string, { scope: string; tasks: string[] }> = {
  SUPER_ADMIN: {
    scope: 'Full platform administrative authority',
    tasks: [
      'Unrestricted administrative access across all desks',
      'Approve top-level product category verticals',
      'Authorize escrow releases exceeding 50,000 ETB threshold',
      'Manage operational staff assignments and RBAC matrices',
    ],
  },
  VERIFICATION_OFFICER: {
    scope: 'User verification & onboarding queue only',
    tasks: [
      'Review business license, TIN & import/export documents',
      'Approve, reject, or request more info on new accounts',
      'Flag suspicious or mismatched trade credentials',
      'Escalate large institutional buyers to Super Admin',
    ],
  },
  LISTINGS_MODERATOR: {
    scope: 'Product listings moderation queue only',
    tasks: [
      'Approve new product listings before publishing live',
      'Remove policy-violating or misleading listings',
      'Request seller fixes for missing information',
      'Manage product subcategories & submit top-level requests',
    ],
  },
  ESCROW_OFFICER: {
    scope: 'Escrow release under 50,000 ETB',
    tasks: [
      'Release escrow funds to seller under sign-off threshold',
      'Process buyer refunds under threshold',
      'Reconcile held vs. released escrow balances',
      'Escalate releases above 50,000 ETB to Super Admin',
    ],
  },
  DISPUTE_MEDIATOR: {
    scope: 'Investigate disputes & recommend payout',
    tasks: [
      'Review order chat logs & evidence for open disputes',
      'Contact buyer and seller for evidence clarification',
      'Write binding mediation recommendation',
      'Hand off financial release to Escrow Officer or Admin',
    ],
  },
  ANALYST: {
    scope: 'Read-only analytics & liquidity metrics',
    tasks: [
      'Monitor supply/demand liquidity balance across regions',
      'Track buyer search terms yielding zero listing results',
      'Audit platform trade volumes and transaction counts',
      'Generate operational intelligence reports',
    ],
  },
};

export default function AdminRolesPage() {
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [expandedStaffId, setExpandedStaffId] = useState<string | null>(null);

  // Escrow Sign-off Threshold State
  const [escrowThreshold, setEscrowThreshold] = useState<number>(50000);
  const [isAdjustingThreshold, setIsAdjustingThreshold] = useState(false);
  const [tempThreshold, setTempThreshold] = useState('50000');

  // New Staff Modal State
  const [newStaffModal, setNewStaffModal] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    staffRole: 'VERIFICATION_OFFICER',
  });
  const [newStaffSubmitting, setNewStaffSubmitting] = useState(false);

  const managementAreas = [
    { key: 'users', label: 'User control & verification' },
    { key: 'listings', label: 'Listings moderation' },
    { key: 'escrow', label: 'Escrow & transactions' },
    { key: 'disputes', label: 'Dispute resolution' },
    { key: 'analytics', label: 'Role balance analytics' },
    { key: 'audit', label: 'Audit logs & system settings' },
  ];

  const fetchStaff = async (isInitial = false) => {
    try {
      if (isInitial) setLoadingStaff(true);
      const { data } = await api.getAdminStaff();
      if (data?.data && Array.isArray(data.data)) {
        setStaffList(prev => {
          if (JSON.stringify(prev) === JSON.stringify(data.data)) return prev;
          return data.data;
        });
      }
    } catch (err: any) {
      console.error('Error fetching staff list:', err);
    } finally {
      if (isInitial) setLoadingStaff(false);
    }
  };

  useEffect(() => {
    fetchStaff(true);
    const interval = setInterval(() => fetchStaff(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const initialRoles: RBACRole[] = [
    {
      id: 'role_super',
      name: 'Super Admin',
      code: 'SUPER_ADMIN',
      description: 'Unrestricted full administrative access & emergency system overrides',
      staffCount: staffList.filter((s) => s.staffRole === 'SUPER_ADMIN').length || 1,
      permissions: managementAreas.reduce((acc, area) => {
        acc[area.key] = { read: true, write: true, approve: true, override: true };
        return acc;
      }, {} as any),
    },
    {
      id: 'role_verifier',
      name: 'Verification Officer',
      code: 'VERIFICATION_OFFICER',
      description: 'Reviews business licenses, TIN numbers, and manages onboarding queues',
      staffCount: staffList.filter((s) => s.staffRole === 'VERIFICATION_OFFICER').length || 1,
      permissions: {
        users: { read: true, write: true, approve: true, override: false },
        listings: { read: true, write: false, approve: false, override: false },
        escrow: { read: false, write: false, approve: false, override: false },
        disputes: { read: false, write: false, approve: false, override: false },
        analytics: { read: true, write: false, approve: false, override: false },
        audit: { read: true, write: false, approve: false, override: false },
      },
    },
    {
      id: 'role_moderator',
      name: 'Listings Moderator',
      code: 'LISTINGS_MODERATOR',
      description: 'Inspects wholesale product submissions, categories, and handles reports',
      staffCount: staffList.filter((s) => s.staffRole === 'LISTINGS_MODERATOR').length || 1,
      permissions: {
        users: { read: true, write: false, approve: false, override: false },
        listings: { read: true, write: true, approve: true, override: false },
        escrow: { read: false, write: false, approve: false, override: false },
        disputes: { read: false, write: false, approve: false, override: false },
        analytics: { read: true, write: false, approve: false, override: false },
        audit: { read: false, write: false, approve: false, override: false },
      },
    },
    {
      id: 'role_escrow',
      name: 'Escrow Officer',
      code: 'ESCROW_OFFICER',
      description: 'Executes escrow releases under 50,000 ETB & processes refunds',
      staffCount: staffList.filter((s) => s.staffRole === 'ESCROW_OFFICER').length || 1,
      permissions: {
        users: { read: false, write: false, approve: false, override: false },
        listings: { read: false, write: false, approve: false, override: false },
        escrow: { read: true, write: true, approve: true, override: true },
        disputes: { read: true, write: false, approve: true, override: false },
        analytics: { read: true, write: false, approve: false, override: false },
        audit: { read: false, write: false, approve: false, override: false },
      },
    },
    {
      id: 'role_mediator',
      name: 'Dispute Mediator',
      code: 'DISPUTE_MEDIATOR',
      description: 'Investigates order disputes and submits recommendations (no direct money movement)',
      staffCount: staffList.filter((s) => s.staffRole === 'DISPUTE_MEDIATOR').length || 1,
      permissions: {
        users: { read: true, write: false, approve: false, override: false },
        listings: { read: false, write: false, approve: false, override: false },
        escrow: { read: true, write: false, approve: false, override: false },
        disputes: { read: true, write: true, approve: true, override: false },
        analytics: { read: true, write: false, approve: false, override: false },
        audit: { read: false, write: false, approve: false, override: false },
      },
    },
    {
      id: 'role_analyst',
      name: 'Analyst',
      code: 'ANALYST',
      description: 'Read-only access to KPI metrics, liquidity reports, and platform dashboards',
      staffCount: staffList.filter((s) => s.staffRole === 'ANALYST').length || 1,
      permissions: {
        users: { read: true, write: false, approve: false, override: false },
        listings: { read: true, write: false, approve: false, override: false },
        escrow: { read: true, write: false, approve: false, override: false },
        disputes: { read: true, write: false, approve: false, override: false },
        analytics: { read: true, write: false, approve: false, override: false },
        audit: { read: true, write: false, approve: false, override: false },
      },
    },
  ];

  const [roles, setRoles] = useState<RBACRole[]>(initialRoles);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('role_verifier');
  const [saveToast, setSaveToast] = useState(false);

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  const togglePermission = (areaKey: string, permType: 'read' | 'write' | 'approve' | 'override') => {
    if (selectedRole.code === 'SUPER_ADMIN') return;
    setRoles((prev) =>
      prev.map((role) => {
        if (role.id === selectedRoleId) {
          const areaPerms = role.permissions[areaKey] || { read: false, write: false, approve: false, override: false };
          return {
            ...role,
            permissions: {
              ...role.permissions,
              [areaKey]: {
                ...areaPerms,
                [permType]: !areaPerms[permType],
              },
            },
          };
        }
        return role;
      }),
    );
  };

  const handleSaveMatrix = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setNewStaffSubmitting(true);
      const { data, error } = await api.createOrAssignStaff(newStaffForm);
      if (data?.success) {
        toast.success(`Staff account created for ${newStaffForm.fullName}.`, 'Staff Added');
        setNewStaffModal(false);
        setNewStaffForm({ fullName: '', phone: '', email: '', password: '', staffRole: 'VERIFICATION_OFFICER' });
        fetchStaff();
      } else {
        toast.error(error?.message || 'Failed to create staff account', 'Action Failed');
      }
    } catch (err: any) {
      toast.error(err.message, 'Action Failed');
    } finally {
      setNewStaffSubmitting(false);
    }
  };

  const handleRevokeStaff = async (id: string) => {
    toast.confirm({
      title: 'Revoke Staff Access',
      message: 'Are you sure you want to revoke this staff member access?',
      confirmText: 'Revoke Access',
      tone: 'danger',
      onConfirm: async () => {
        try {
          const { data, error } = await api.revokeStaff(id);
          if (data?.success) {
            toast.success('Staff access revoked successfully.', 'Access Revoked');
            fetchStaff();
          } else {
            toast.error(error?.message || 'Failed to revoke staff account', 'Revocation Failed');
          }
        } catch (err: any) {
          toast.error(err.message, 'Revocation Failed');
        }
      },
    });
  };

  const toggleStaffTasks = (id: string) => {
    setExpandedStaffId(expandedStaffId === id ? null : id);
  };

  const handleUpdateThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(tempThreshold, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setEscrowThreshold(parsed);
      setIsAdjustingThreshold(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Masthead Header */}
      <div className="border-b border-stone-200 pb-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="f-mono text-[10px] uppercase tracking-[0.2em] text-stone-400">Team & Access Control</p>
            <h1 className="f-display text-[28px] font-semibold text-stone-900 mt-1 leading-none">
              Staff Register & RBAC Permissions
            </h1>
          </div>
          <div className="text-right">
            <p className="f-mono text-[10px] uppercase tracking-widest text-stone-400">Registry No.</p>
            <p className="f-mono text-xs text-stone-600 font-semibold">ETH-2026-TEAM-1</p>
          </div>
        </div>
        <div className="mt-3 border-t-2 border-stone-900" />
        <div className="border-t border-stone-300 mt-[3px]" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3">
          <p className="f-body text-sm text-stone-500 max-w-2xl">
            Assign staff to a single functional area. Only Super Admin can grant roles, move commission settings, or approve escrow above the sign-off threshold.
          </p>
          <div className="flex items-center gap-2 shrink-0">
            {saveToast && (
              <span className="f-mono text-xs text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1.5 flex items-center gap-1 font-semibold">
                <Check size={14} /> Permissions Policy Saved
              </span>
            )}
            <Btn tone="emerald" filled onClick={handleSaveMatrix}>
              <span className="inline-flex items-center gap-1.5">
                <Save size={14} /> Save Permission Policy
              </span>
            </Btn>
          </div>
        </div>
      </div>

      {/* SECTION 1: ACTIVE OPERATIONAL STAFF REGISTER */}
      <div className="bg-white border border-stone-200 shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="f-display text-lg font-semibold text-stone-900 flex items-center gap-2">
              <UserCog size={20} className="text-emerald-800" /> Staff Register
            </h2>
            <p className="f-body text-xs text-stone-500">
              Operational staff accounts registered in the system
            </p>
          </div>
          <Btn tone="emerald" filled onClick={() => setNewStaffModal(true)}>
            <span className="inline-flex items-center gap-1.5">
              <UserPlus size={14} /> Add Staff Member
            </span>
          </Btn>
        </div>

        {loadingStaff ? (
          <p className="f-body text-sm text-stone-400 p-8">Loading active staff members...</p>
        ) : staffList.length === 0 ? (
          <p className="f-body text-sm text-stone-400 p-8">No staff members found.</p>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <Th>Staff Member</Th>
                <Th>Assigned Role</Th>
                <Th>Scope</Th>
                <Th>Status</Th>
                <Th>Last Active / Joined</Th>
                <Th right>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {staffList.map((staff) => {
                const roleInfo = ROLE_SCOPES[staff.staffRole] || ROLE_SCOPES.VERIFICATION_OFFICER;
                const isExpanded = expandedStaffId === staff.id;

                return (
                  <React.Fragment key={staff.id}>
                    <tr
                      className="hover:bg-stone-50/70 transition-colors cursor-pointer"
                      onClick={() => toggleStaffTasks(staff.id)}
                    >
                      <Td>
                        <div className="flex items-center gap-3">
                          <Monogram text={staff.fullName.split(' ').map((n) => n[0]).join('')} tone="amber" />
                          <div>
                            <p className="f-body text-sm font-semibold text-stone-900">{staff.fullName}</p>
                            <p className="f-mono text-xs text-stone-500">{staff.email}</p>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <Seal label={staff.staffRole} tone={staff.staffRole === 'SUPER_ADMIN' ? 'amber' : 'emerald'} />
                      </Td>
                      <Td>
                        <span className="f-body text-xs text-stone-600 font-medium">{roleInfo.scope}</span>
                      </Td>
                      <Td>
                        <Seal label={staff.isActive ? 'Active' : 'Suspended'} tone={staff.isActive ? 'emerald' : 'rose'} />
                      </Td>
                      <Td>
                        <span className="f-mono text-xs text-stone-500">{staff.createdAt}</span>
                      </Td>
                      <Td right>
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleStaffTasks(staff.id)}
                            className="f-body text-xs font-semibold px-2.5 py-1 border border-stone-300 text-stone-700 hover:bg-stone-50 flex items-center gap-1 transition-colors"
                          >
                            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            {isExpanded ? 'Hide Tasks' : 'View Tasks'}
                          </button>

                          {staff.staffRole !== 'SUPER_ADMIN' && (
                            <button
                              onClick={() => handleRevokeStaff(staff.id)}
                              className="f-body text-xs font-semibold px-2.5 py-1 border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100 flex items-center gap-1 transition-colors"
                            >
                              <UserX size={13} /> Suspend
                            </button>
                          )}
                        </div>
                      </Td>
                    </tr>

                    {/* Expandable Individual Task Checklist Drawer */}
                    {isExpanded && (
                      <tr className="bg-stone-50/90 border-b border-stone-200">
                        <Td colSpan={6} className="!py-4 !px-8">
                          <div className="bg-white border border-stone-200 p-4 rounded-md space-y-2 shadow-xs">
                            <p className="f-mono text-[10px] uppercase tracking-widest text-emerald-800 font-bold flex items-center gap-1.5">
                              <CheckCircle2 size={13} /> Individual Task Checklist — {staff.fullName} ({staff.staffRole})
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 pt-1">
                              {roleInfo.tasks.map((task, idx) => (
                                <p key={idx} className="f-body text-xs text-stone-700 flex items-start gap-2">
                                  <span className="f-mono text-emerald-700 font-bold mt-0.5">
                                    {String(idx + 1).padStart(2, '0')}
                                  </span>
                                  <span>{task}</span>
                                </p>
                              ))}
                            </div>
                          </div>
                        </Td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* SECTION 2: ESCROW SIGN-OFF THRESHOLD CARD */}
      <div className="bg-white border border-stone-200 p-6 space-y-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <h2 className="f-display text-lg font-semibold text-stone-900 flex items-center gap-2">
              <Lock size={18} className="text-amber-700" /> Escrow Sign-Off Threshold
            </h2>
            <p className="f-body text-xs text-stone-500 mt-0.5">
              Financial authorization limit for operational Escrow Officers
            </p>
          </div>
          <span className="f-mono text-xs bg-amber-50 text-amber-900 border border-amber-300 px-3 py-1 font-semibold self-start md:self-auto rounded">
            Super Admin Policy Enforced
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-2">
            <p className="f-body text-xs text-stone-600 leading-relaxed">
              Escrow Officers can release funds or execute refunds up to this limit. Any order value higher than this threshold automatically escalates to Super Admin sign-off to mitigate financial fraud and high-value risk.
            </p>
          </div>

          <div className="bg-stone-50 border border-stone-200 p-4 rounded-md flex items-center justify-between">
            <div>
              <p className="f-mono text-[10px] uppercase text-stone-500 font-semibold">Active Release Limit</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="f-mono text-3xl font-bold text-stone-900 tabular">
                  {escrowThreshold.toLocaleString()}
                </span>
                <span className="f-body text-sm font-semibold text-stone-500">ETB</span>
              </div>
            </div>
            {isAdjustingThreshold ? (
              <form onSubmit={handleUpdateThreshold} className="flex flex-col gap-2">
                <input
                  type="number"
                  value={tempThreshold}
                  onChange={(e) => setTempThreshold(e.target.value)}
                  className="f-mono text-xs p-1.5 bg-white border border-stone-300 rounded text-stone-900 font-semibold focus:outline-none focus:border-emerald-800 w-28"
                />
                <div className="flex gap-1">
                  <button
                    type="submit"
                    className="px-2 py-1 bg-emerald-800 text-white text-[10px] font-semibold rounded hover:bg-emerald-900 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdjustingThreshold(false)}
                    className="px-2 py-1 bg-stone-200 text-stone-700 text-[10px] font-semibold rounded hover:bg-stone-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <Btn tone="stone" onClick={() => setIsAdjustingThreshold(true)}>
                <span className="inline-flex items-center gap-1 text-xs">
                  <Sliders size={13} /> Adjust
                </span>
              </Btn>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: GRANULAR RBAC PERMISSIONS MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-stone-200">
        {/* Roles Sidebar (1 col) */}
        <div className="bg-white border border-stone-200 p-4 h-fit shadow-sm space-y-3 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <p className="f-mono text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
              Staff Admin Roles ({roles.length})
            </p>
          </div>
          <div className="space-y-2">
            {roles.map((r) => {
              const active = r.id === selectedRoleId;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoleId(r.id)}
                  className={`w-full text-left p-4 border-2 rounded transition-all cursor-pointer ${
                    active ? 'border-emerald-700 bg-emerald-50/60 shadow-sm' : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <p className={`f-mono text-xs font-semibold ${active ? 'text-emerald-900' : 'text-stone-700'}`}>{r.code}</p>
                    <Seal label={`${r.staffCount} Staff`} tone={active ? 'emerald' : 'stone'} />
                  </div>
                  <p className="f-body text-sm font-semibold text-stone-800 mt-2">{r.name}</p>
                  <p className="f-body text-xs text-stone-500 mt-1 line-clamp-2">{r.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Permissions Matrix (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-stone-200 p-6 shadow-sm space-y-5 rounded-lg">
          <div className="flex justify-between items-start pb-5 border-b border-stone-100">
            <div>
              <p className="f-mono text-xs text-stone-400 font-semibold">{selectedRole.code}</p>
              <h2 className="f-display text-xl font-semibold text-stone-900 mt-1">{selectedRole.name} Permissions Matrix</h2>
              <p className="f-body text-xs text-stone-500 mt-0.5">{selectedRole.description}</p>
            </div>
            {selectedRole.code === 'SUPER_ADMIN' && (
              <span className="f-mono text-xs text-rose-800 bg-rose-50 border border-rose-200 px-3 py-1 flex items-center gap-1 font-semibold">
                <Lock size={12} /> Locked (Full Access)
              </span>
            )}
          </div>

          {/* Matrix Table */}
          <div className="overflow-hidden border border-stone-200 rounded">
            <table className="w-full text-left">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <Th>Management Area</Th>
                  <Th right>Read (View)</Th>
                  <Th right>Write (Edit)</Th>
                  <Th right>Approve / Reject</Th>
                  <Th right>Override / Action</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {managementAreas.map((area) => {
                  const perm = selectedRole.permissions[area.key] || { read: false, write: false, approve: false, override: false };
                  const isLocked = selectedRole.code === 'SUPER_ADMIN';

                  return (
                    <tr key={area.key} className="hover:bg-stone-50/60 transition-colors">
                      <Td>
                        <span className="f-body text-sm font-semibold text-stone-800">{area.label}</span>
                      </Td>
                      <Td right>
                        <input
                          type="checkbox"
                          disabled={isLocked}
                          checked={perm.read}
                          onChange={() => togglePermission(area.key, 'read')}
                          className="w-4 h-4 accent-emerald-700 cursor-pointer"
                        />
                      </Td>
                      <Td right>
                        <input
                          type="checkbox"
                          disabled={isLocked}
                          checked={perm.write}
                          onChange={() => togglePermission(area.key, 'write')}
                          className="w-4 h-4 accent-emerald-700 cursor-pointer"
                        />
                      </Td>
                      <Td right>
                        <input
                          type="checkbox"
                          disabled={isLocked}
                          checked={perm.approve}
                          onChange={() => togglePermission(area.key, 'approve')}
                          className="w-4 h-4 accent-emerald-700 cursor-pointer"
                        />
                      </Td>
                      <Td right>
                        <input
                          type="checkbox"
                          disabled={isLocked}
                          checked={perm.override}
                          onChange={() => togglePermission(area.key, 'override')}
                          className="w-4 h-4 accent-emerald-700 cursor-pointer"
                        />
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: ADD NEW STAFF MEMBER */}
      {newStaffModal && (
        <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full p-6 border border-stone-200 rounded-lg shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="f-display text-lg font-semibold text-stone-900 flex items-center gap-2">
                <UserPlus size={18} className="text-emerald-800" /> Assign New Operational Staff Role
              </h3>
              <button
                onClick={() => setNewStaffModal(false)}
                className="text-stone-400 hover:text-stone-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateStaff} className="space-y-3">
              <div>
                <label className="f-mono text-xs text-stone-600 block mb-1 font-semibold">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yonas Tadesse"
                  value={newStaffForm.fullName}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, fullName: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded text-stone-900 font-medium placeholder:text-stone-400 focus:outline-none focus:border-emerald-800"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="f-mono text-xs text-stone-600 block mb-1 font-semibold">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+251911000001"
                    value={newStaffForm.phone}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, phone: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded text-stone-900 font-medium placeholder:text-stone-400 focus:outline-none focus:border-emerald-800"
                  />
                </div>
                <div>
                  <label className="f-mono text-xs text-stone-600 block mb-1 font-semibold">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="yonas@bitsb2b.et"
                    value={newStaffForm.email}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded text-stone-900 font-medium placeholder:text-stone-400 focus:outline-none focus:border-emerald-800"
                  />
                </div>
              </div>
              <div>
                <label className="f-mono text-xs text-stone-600 block mb-1 font-semibold flex items-center gap-1">
                  <Key size={12} className="text-amber-700" /> Account Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={newStaffForm.password}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, password: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded text-stone-900 font-medium placeholder:text-stone-400 focus:outline-none focus:border-emerald-800"
                />
              </div>
              <div>
                <label className="f-mono text-xs text-stone-600 block mb-1 font-semibold">Staff Role *</label>
                <select
                  value={newStaffForm.staffRole}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, staffRole: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded text-stone-900 font-medium focus:outline-none focus:border-emerald-800"
                >
                  <option value="VERIFICATION_OFFICER">Verification Officer (User verification only)</option>
                  <option value="LISTINGS_MODERATOR">Listings Moderator (Listings queue only)</option>
                  <option value="ESCROW_OFFICER">Escrow Officer (Escrow release & refunds)</option>
                  <option value="DISPUTE_MEDIATOR">Dispute Mediator (Investigate & recommend only)</option>
                  <option value="ANALYST">Analyst (Read-only analytics)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <Btn tone="stone" onClick={() => setNewStaffModal(false)}>
                  Cancel
                </Btn>
                <Btn tone="emerald" filled type="submit" disabled={newStaffSubmitting}>
                  {newStaffSubmitting ? 'Assigning Role...' : 'Assign Staff Role'}
                </Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
