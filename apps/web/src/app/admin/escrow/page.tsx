'use client';

import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { StatCard, Seal, Th, Td, Btn } from '../layout-components';
import { api } from '../../../services/api';
import { toast } from '../../../components/Toast';

export interface AdminEscrowOrder {
  id: string;
  item: string;
  buyer: string;
  seller: string;
  amount: string;
  amountValue?: number;
  status: string;
}

export default function AdminEscrowPage() {
  const [escrowOrders, setEscrowOrders] = useState<AdminEscrowOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEscrow = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const { data, error } = await api.getAdminEscrowTransactions();
      if (data?.data && Array.isArray(data.data)) {
        setEscrowOrders(prev => {
          if (JSON.stringify(prev) === JSON.stringify(data.data)) return prev;
          return data.data;
        });
      }
    } catch (err: any) {
      console.error('Error fetching escrow transactions:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscrow(true);
    const interval = setInterval(() => fetchEscrow(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOverride = async (orderId: string, action: 'RELEASE' | 'REFUND') => {
    try {
      const { data, error } = await api.handleEscrowOverride(orderId, action);
      if (data?.success) {
        toast.success(`Escrow payout ${action.toLowerCase()}ed successfully for order #${orderId.slice(0, 8)}.`, 'Escrow Action Completed');
        fetchEscrow();
      } else if (error) {
        toast.error(error.message, 'Escrow Action Failed');
      }
    } catch (err: any) {
      toast.error(err.message, 'Escrow Action Failed');
    }
  };

  const totalHeld = escrowOrders
    .filter((o) => o.status === 'HELD_ESCROW' || o.status === 'Held')
    .reduce((acc, o) => acc + (o.amountValue || parseFloat(o.amount) || 0), 0);

  const totalReleased = escrowOrders
    .filter((o) => o.status === 'FUNDS_RELEASED' || o.status === 'Released')
    .reduce((acc, o) => acc + (o.amountValue || parseFloat(o.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="f-display text-2xl font-semibold text-stone-900">Transaction & escrow ledger</h1>
        <p className="f-body text-stone-500 mt-1">
          Monitor held escrow balances, manual release overrides, and platform transaction ledgers (Escrow Officer limit: 50,000 ETB).
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard eyebrow="Total escrow held" value={totalHeld.toLocaleString()} unit="ETB" note="Secured in Telebirr & CBE Birr escrow" tone="amber" />
        <StatCard eyebrow="Total released" value={totalReleased.toLocaleString()} unit="ETB" note="Completed order releases" tone="emerald" />
        <StatCard eyebrow="Platform commission · 2.5%" value={(totalReleased * 0.025).toLocaleString()} unit="ETB" note="Earned marketplace revenue" tone="stone" />
      </div>

      {/* Escrow Orders Table / Empty State */}
      <div className="bg-white border border-stone-200 overflow-hidden shadow-sm">
        {loading ? (
          <p className="f-body text-sm text-stone-400 p-8">Loading escrow transactions...</p>
        ) : escrowOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto text-stone-400">
              <Lock size={22} />
            </div>
            <p className="f-display text-lg font-semibold text-stone-800">Escrow ledger is empty</p>
            <p className="f-body text-sm text-stone-500 max-w-sm mx-auto">
              There are currently no active or historical escrow orders in the ledger. Completed transactions will record automatically here.
            </p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <Th>Order & Item</Th>
                <Th>Buyer Enterprise</Th>
                <Th>Seller Enterprise</Th>
                <Th right>Escrow Amount</Th>
                <Th>Escrow Status</Th>
                <Th right>Escrow Overrides</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {escrowOrders.map((o) => (
                <tr key={o.id} className="hover:bg-stone-50/60 transition-colors">
                  <Td>
                    <div>
                      <p className="f-body text-sm font-semibold text-stone-900">{o.item}</p>
                      <p className="f-mono text-[10px] text-stone-400">Order ID: {o.id}</p>
                    </div>
                  </Td>
                  <Td>
                    <span className="f-body text-xs text-stone-700">{o.buyer}</span>
                  </Td>
                  <Td>
                    <span className="f-body text-xs text-stone-700">{o.seller}</span>
                  </Td>
                  <Td right>
                    <span className="f-mono text-xs font-semibold text-stone-900">{o.amount}</span>
                  </Td>
                  <Td>
                    <Seal
                      label={o.status}
                      tone={
                        o.status === 'FUNDS_RELEASED' || o.status === 'Released'
                          ? 'emerald'
                          : o.status === 'REFUNDED'
                          ? 'rose'
                          : 'amber'
                      }
                    />
                  </Td>
                  <Td right>
                    {o.status === 'HELD_ESCROW' || o.status === 'Held' ? (
                      <div className="flex justify-end gap-1.5">
                        <Btn tone="emerald" filled onClick={() => handleOverride(o.id, 'RELEASE')}>
                          Release
                        </Btn>
                        <Btn tone="rose" onClick={() => handleOverride(o.id, 'REFUND')}>
                          Refund
                        </Btn>
                      </div>
                    ) : (
                      <span className="f-mono text-xs text-stone-400">Settled</span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
