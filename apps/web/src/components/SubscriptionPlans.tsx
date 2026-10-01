'use client';

import React, { useState } from 'react';
import { ArrowLeft, Check, Crown, ShieldCheck, Sparkles } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

type Cycle = 'monthly' | 'sixMonths' | 'annual';
const options: Record<Cycle, { label: string; price: string; cadence: string; saving?: string }> = {
  monthly: { label: 'Per month', price: '1,200', cadence: 'billed monthly' },
  sixMonths: { label: 'Per 6 months', price: '6,120', cadence: 'billed every 6 months', saving: 'Save 15%' },
  annual: { label: 'Per 12 months', price: '10,800', cadence: 'billed annually', saving: 'Save 25%' },
};

export const SubscriptionPlans: React.FC = () => {
  const { setViewingView, subscriptionUpgrade, currentUser } = useMarketplace();
  const [cycle, setCycle] = useState<Cycle>('sixMonths');
  const [requested, setRequested] = useState(false);
  const plan = options[cycle];
  const usage = subscriptionUpgrade?.currentCount !== undefined && subscriptionUpgrade?.listingLimit !== undefined
    ? `${subscriptionUpgrade.currentCount} of ${subscriptionUpgrade.listingLimit} listing slots used`
    : null;

  return <main className="min-h-[calc(100vh-120px)] bg-[#FBF9F5] px-4 py-8 sm:px-6 lg:py-12">
    <div className="max-w-5xl mx-auto">
      <button type="button" onClick={() => setViewingView('seller_dashboard')} className="inline-flex items-center gap-2 text-xs font-bold text-[#6E685F] hover:text-[#112225] cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> Back to seller dashboard
      </button>

      <section className="mt-5 overflow-hidden rounded-3xl border border-[#274B52] bg-[#112225] text-[#F7F4EE] shadow-xl">
        <div className="relative px-6 py-9 sm:px-10 sm:py-12">
          <div className="absolute -right-10 -top-14 h-44 w-44 rounded-full bg-[#C85A32]/25 blur-2xl" />
          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E27D56]/40 bg-[#E27D56]/15 px-3 py-1 text-[11px] font-bold text-[#F3C6B5]"><Sparkles className="w-3.5 h-3.5" /> Seller growth plans</div>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">Keep your catalog growing.</h1>
            <p className="mt-3 text-sm leading-6 text-[#C6C2B9]">Upgrade {currentUser?.business.name ? `${currentUser.business.name}'s` : 'your'} seller account for a larger listing allowance, priority support, and a more visible storefront.</p>
            {usage && <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs text-[#F7F4EE]"><ShieldCheck className="w-4 h-4 text-[#F2DFAE]" /> {usage}</div>}
          </div>
        </div>
      </section>

      <section className="mt-7 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-3xl border border-[#E5DFD5] bg-white p-5 sm:p-7 shadow-sm">
          <div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-widest text-[#C85A32]">Recommended upgrade</p><h2 className="mt-1 text-2xl font-bold text-[#112225]">Seller Growth</h2><p className="mt-1 text-sm text-[#6E685F]">More room to publish, sell, and scale.</p></div><div className="rounded-xl bg-[#FFF1EA] p-2.5 text-[#C85A32]"><Crown className="w-5 h-5" /></div></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Billing period">
            {(Object.entries(options) as [Cycle, typeof plan][]).map(([key, option]) => <button key={key} type="button" role="radio" aria-checked={cycle === key} onClick={() => { setCycle(key); setRequested(false); }} className={`relative rounded-2xl border p-4 text-left transition-all cursor-pointer ${cycle === key ? 'border-[#C85A32] bg-[#FFF7F3] ring-1 ring-[#C85A32]' : 'border-[#E5DFD5] hover:border-[#C9BEB0]'}`}>
              {option.saving && <span className="absolute -top-2 right-3 rounded-full bg-[#33553A] px-2 py-0.5 text-[10px] font-bold text-white">{option.saving}</span>}
              <span className="block text-xs font-bold text-[#112225]">{option.label}</span><span className="mt-2 block text-lg font-black text-[#112225]">ETB {option.price}</span><span className="block text-[11px] text-[#6E685F]">{option.cadence}</span>
            </button>)}
          </div>
          <div className="mt-6 border-t border-[#EEE8DE] pt-5"><p className="text-xs font-bold text-[#112225]">Included with Seller Growth</p><div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs text-[#4C514D]">{['Up to 25 active product listings', 'Priority listing review', 'Supplier storefront insights', 'Dedicated seller support'].map(item => <div key={item} className="flex items-center gap-2"><Check className="w-4 h-4 text-[#33553A] shrink-0" />{item}</div>)}</div></div>
        </div>
        <aside className="rounded-3xl border border-[#E5DFD5] bg-[#FAF7F2] p-6 sm:p-7"><p className="text-xs font-bold uppercase tracking-wider text-[#6E685F]">Your selection</p><p className="mt-3 text-lg font-bold text-[#112225]">Seller Growth · {plan.label}</p><div className="my-5 border-y border-[#E5DFD5] py-4"><span className="text-3xl font-black text-[#112225]">ETB {plan.price}</span><span className="ml-1 text-xs text-[#6E685F]">{plan.cadence}</span></div>{requested ? <div className="rounded-xl border border-[#9DC2A3] bg-[#EFF8F0] p-4 text-sm text-[#223B28]"><strong className="flex gap-2"><ShieldCheck className="w-4 h-4" /> Plan request saved</strong><p className="mt-1 text-xs leading-5">Payment activation is not connected yet. Your limit changes only after payment and plan activation are confirmed.</p></div> : <button type="button" onClick={() => setRequested(true)} className="w-full rounded-xl bg-[#C85A32] px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-[#A34320] transition-colors cursor-pointer">Request this plan</button>}</aside>
      </section>
    </div>
  </main>;
};
