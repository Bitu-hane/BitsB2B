'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Search, BarChart3, ShieldAlert } from 'lucide-react';
import { Th, Td } from '../layout-components';
import { api } from '../../../services/api';

export interface GeoItem {
  region: string;
  buyers: number;
  sellers: number;
  ratio: string;
  signal: string | null;
}

export interface DemandItem {
  item: string;
  note: string;
  pct: string;
}

export default function AdminAnalyticsPage() {
  const [geo, setGeo] = useState<GeoItem[]>([]);
  const [demand] = useState<DemandItem[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  const fetchAnalytics = async () => {
    try {
      const [profileRes, metricsRes] = await Promise.all([
        api.getProfile(),
        api.getAdminMetrics(),
      ]);
      if (profileRes.data) {
        setUserProfile(prev => {
          if (JSON.stringify(prev) === JSON.stringify(profileRes.data)) return prev;
          return profileRes.data;
        });
      }
      if (metricsRes.data?.data?.geoBreakdown) {
        setGeo(prev => {
          if (JSON.stringify(prev) === JSON.stringify(metricsRes.data.data.geoBreakdown)) return prev;
          return metricsRes.data.data.geoBreakdown;
        });
      }
    } catch (err) {
      console.error('Error loading analytics data:', err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(interval);
  }, []);

  const staffRole = userProfile?.staffRole || userProfile?.staff_role || 'SUPER_ADMIN';
  const isAllowed = staffRole === 'ANALYST' || staffRole === 'SUPER_ADMIN';

  if (userProfile && !isAllowed) {
    return (
      <div className="bg-white border border-stone-200 p-8 text-center max-w-md mx-auto my-12 space-y-3">
        <ShieldAlert size={32} className="text-amber-600 mx-auto" />
        <h2 className="f-display text-lg font-semibold text-stone-900">Analyst Access Restricted</h2>
        <p className="f-body text-xs text-stone-500">
          Role balance & liquidity analytics are restricted to Analysts and Super Admins.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="f-display text-2xl font-semibold text-stone-900">Role balance & platform liquidity analytics</h1>
        <p className="f-body text-stone-500 mt-1">Spot supply/demand imbalances, monitor conversion funnels, and track top trading regions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Geographic Supply/Demand Balance (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-stone-200 shadow-sm">
          <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-2">
            <MapPin size={15} className="text-emerald-700" />
            <div>
              <h2 className="f-display text-lg font-semibold text-stone-900">Geographic supply/demand balance</h2>
              <p className="f-body text-xs text-stone-500">Buyer to seller ratio per region</p>
            </div>
          </div>
          {geo.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto text-stone-400">
                <BarChart3 size={18} />
              </div>
              <p className="f-body text-sm font-semibold text-stone-700">No regional data recorded</p>
              <p className="f-body text-xs text-stone-400">Regional ratios will generate dynamically as user transactions occur.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <Th>Region / cluster</Th>
                  <Th right>Active buyers</Th>
                  <Th right>Active sellers</Th>
                  <Th right>Ratio / signal</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {geo.map((g) => (
                  <tr key={g.region} className="hover:bg-stone-50/60 transition-colors">
                    <Td>
                      <span className="f-body text-sm font-medium text-stone-800">{g.region}</span>
                    </Td>
                    <Td right>
                      <span className="f-mono text-sm text-stone-700">{g.buyers}</span>
                    </Td>
                    <Td right>
                      <span className="f-mono text-sm text-stone-700">{g.sellers}</span>
                    </Td>
                    <Td right>
                      <span className={`f-mono text-sm font-semibold ${g.signal ? 'text-amber-800' : 'text-stone-700'}`}>
                        {g.ratio}
                      </span>
                      {g.signal && <p className="f-body text-[11px] text-amber-700 font-semibold">{g.signal}</p>}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Unmet Demand (1 col) */}
        <div className="bg-white border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Search size={15} className="text-emerald-700" />
            <h2 className="f-display text-lg font-semibold text-stone-900">Unmet demand</h2>
          </div>
          <p className="f-body text-xs text-stone-500 mb-4">High-volume searches yielding zero listing results</p>
          {demand.length === 0 ? (
            <div className="py-8 text-center space-y-1">
              <p className="f-body text-xs font-medium text-stone-500">No zero-result searches logged</p>
            </div>
          ) : (
            <div className="space-y-3">
              {demand.map((d) => (
                <div key={d.item} className="flex items-center justify-between border-b border-stone-100 pb-3 last:border-0">
                  <div>
                    <p className="f-body text-sm font-semibold text-stone-800">{d.item}</p>
                    <p className="f-body text-xs text-stone-500">{d.note}</p>
                  </div>
                  <span className="f-mono text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1">
                    {d.pct}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
