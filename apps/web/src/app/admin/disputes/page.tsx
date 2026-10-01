'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Send, ArrowRight } from 'lucide-react';
import { Seal, Btn } from '../layout-components';
import { api } from '../../../services/api';
import { toast } from '../../../components/Toast';

export interface DisputeTicketItem {
  id: string;
  ticketNumber: string;
  orderId: string;
  orderNumber: string;
  buyerName: string;
  sellerName: string;
  amount: number;
  currency: string;
  status: string;
  reason: string;
  description: string;
  recommendation?: string;
  recommendationNote?: string;
  createdAt: string;
}

export default function AdminDisputesPage() {
  const [tickets, setTickets] = useState<DisputeTicketItem[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');

  const fetchDisputes = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const { data } = await api.getAdminDisputes();
      if (data?.data && Array.isArray(data.data)) {
        setTickets(prev => {
          if (JSON.stringify(prev) === JSON.stringify(data.data)) return prev;
          return data.data;
        });
        if (data.data.length > 0 && !selectedTicketId) {
          setSelectedTicketId(data.data[0].id);
        }
      }
    } catch (err: any) {
      console.error('Error fetching disputes:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes(true);
    const interval = setInterval(() => fetchDisputes(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const handleRecommend = async (rec: 'REFUND' | 'RELEASE' | 'SPLIT') => {
    if (!selectedTicket) return;
    try {
      const { data, error } = await api.recommendDispute(selectedTicket.id, rec, note || 'Mediator recommendation submitted');
      if (data?.success) {
        toast.success(data.message || 'Dispute recommendation submitted.', 'Recommendation Saved');
        setNote('');
        fetchDisputes();
      } else if (error) {
        toast.error(error.message, 'Recommendation Failed');
      }
    } catch (err: any) {
      toast.error(err.message, 'Recommendation Failed');
    }
  };

  const handleExecute = async (act: 'RESOLVED_REFUND' | 'RESOLVED_RELEASE') => {
    if (!selectedTicket) return;
    try {
      const { data, error } = await api.executeDisputePayout(selectedTicket.id, act, note || 'Financial payout executed');
      if (data?.success) {
        toast.success(data.message || 'Dispute payout executed successfully.', 'Payout Executed');
        setNote('');
        fetchDisputes();
      } else if (error) {
        toast.error(error.message, 'Payout Failed');
      }
    } catch (err: any) {
      toast.error(err.message, 'Payout Failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="f-display text-2xl font-semibold text-stone-900">Dispute resolution center</h1>
        <p className="f-body text-stone-500 mt-1">
          Maker-Checker Dispute Desk: Mediators investigate & recommend $\rightarrow$ Escrow Officers / Admin execute payouts.
        </p>
      </div>

      {loading ? (
        <p className="f-body text-sm text-stone-400 p-8">Loading dispute cases...</p>
      ) : tickets.length === 0 ? (
        <div className="bg-white border border-stone-200 p-12 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto text-stone-400">
            <ShieldAlert size={22} />
          </div>
          <p className="f-display text-lg font-semibold text-stone-800">No open dispute cases</p>
          <p className="f-body text-sm text-stone-500 max-w-sm mx-auto">
            There are currently no active buyer or seller dispute tickets filed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dispute Tickets Sidebar (1 col) */}
          <div className="bg-white border border-stone-200 p-4 h-fit shadow-sm space-y-3">
            <p className="f-mono text-[11px] uppercase tracking-wider text-stone-400 mb-3">Dispute tickets ({tickets.length})</p>
            <div className="space-y-2">
              {tickets.map((t) => {
                const active = t.id === selectedTicketId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`w-full text-left p-4 border-2 transition-all cursor-pointer ${
                      active ? 'border-amber-700 bg-amber-50 shadow-sm' : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="f-mono text-xs font-semibold text-stone-700">{t.ticketNumber || t.id.slice(0, 8)}</p>
                      <Seal label={t.status} tone={t.status.includes('RECOMMENDED') ? 'amber' : t.status.includes('RESOLVED') ? 'emerald' : 'rose'} />
                    </div>
                    <p className="f-body text-sm font-semibold text-stone-800 mt-2">{t.reason}</p>
                    <p className="f-mono text-xs text-stone-500 mt-1">{t.amount} {t.currency || 'ETB'}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ticket Detail & Mediation Panel (2 cols) */}
          {selectedTicket && (
            <div className="lg:col-span-2 bg-white border border-stone-200 p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-start pb-4 border-b border-stone-100">
                <div>
                  <p className="f-mono text-xs text-stone-400">Order Ref: {selectedTicket.orderNumber || selectedTicket.orderId}</p>
                  <h2 className="f-display text-xl font-semibold text-stone-900 mt-1">{selectedTicket.reason}</h2>
                  <p className="f-body text-xs text-stone-500 mt-0.5">Filed by {selectedTicket.buyerName} against {selectedTicket.sellerName}</p>
                </div>
                <div className="text-right">
                  <p className="f-mono text-xs uppercase tracking-wider text-stone-400">Disputed Amount</p>
                  <p className="f-display text-2xl font-semibold text-amber-900 tabular">{selectedTicket.amount?.toLocaleString()} {selectedTicket.currency || 'ETB'}</p>
                </div>
              </div>

              <div>
                <h3 className="f-mono text-xs uppercase tracking-wider text-stone-500 mb-2">Claim Description</h3>
                <div className="bg-stone-50 p-4 border border-stone-200 text-sm text-stone-800 rounded-sm">
                  {selectedTicket.description}
                </div>
              </div>

              {selectedTicket.recommendationNote && (
                <div className="bg-amber-50 border border-amber-200 p-4">
                  <p className="f-mono text-xs text-amber-800 font-semibold uppercase tracking-wider mb-1">⚖️ Dispute Mediator Recommendation</p>
                  <p className="f-body text-sm text-amber-900">{selectedTicket.recommendationNote}</p>
                  <p className="f-mono text-[11px] text-amber-700 mt-2">Recommendation code: {selectedTicket.recommendation || selectedTicket.status}</p>
                </div>
              )}

              {/* Action Form */}
              <div className="space-y-4 pt-4 border-t border-stone-100">
                <div>
                  <label className="f-mono text-xs text-stone-500 block mb-1">Mediation / Payout Note</label>
                  <textarea
                    rows={2}
                    placeholder="Enter findings, delivery evidence verification, or payout instructions..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full border border-stone-300 p-2.5 text-sm focus:outline-none focus:border-emerald-700"
                  />
                </div>

                <div className="space-y-2">
                  <p className="f-mono text-xs font-semibold text-stone-500 uppercase tracking-wider">Step 1: Dispute Mediator Action (Decide / Recommend)</p>
                  <div className="flex gap-2">
                    <Btn tone="amber" filled onClick={() => handleRecommend('REFUND')}>
                      Recommend Buyer Refund
                    </Btn>
                    <Btn tone="amber" onClick={() => handleRecommend('RELEASE')}>
                      Recommend Seller Release
                    </Btn>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <p className="f-mono text-xs font-semibold text-stone-500 uppercase tracking-wider">Step 2: Escrow Officer / Admin Execution (Move Money)</p>
                  <div className="flex gap-2">
                    <Btn tone="rose" filled onClick={() => handleExecute('RESOLVED_REFUND')}>
                      Execute Refund to Buyer
                    </Btn>
                    <Btn tone="emerald" filled onClick={() => handleExecute('RESOLVED_RELEASE')}>
                      Execute Release to Seller
                    </Btn>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
