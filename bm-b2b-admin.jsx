import React, { useState } from "react";
import {
  LayoutGrid, Users, Package, Lock, ShieldAlert, BarChart3,
  Search, Bell, ChevronLeft, MapPin, Paperclip, ChevronRight, UserCog, ShieldCheck
} from "lucide-react";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,900&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
.f-display { font-family: 'Fraunces', serif; }
.f-body { font-family: 'Inter', sans-serif; }
.f-mono { font-family: 'IBM Plex Mono', monospace; }
.tabular { font-variant-numeric: tabular-nums; }
@keyframes stampIn {
  0% { transform: scale(2.1) rotate(-28deg); opacity: 0; }
  55% { transform: scale(0.88) rotate(-4deg); opacity: 1; }
  75% { transform: scale(1.04) rotate(-7deg); }
  100% { transform: scale(1) rotate(-6deg); opacity: 1; }
}
.stamp-in { animation: stampIn 0.4s cubic-bezier(.34,1.56,.64,1) both; }
.ruled {
  background-image: repeating-linear-gradient(180deg, transparent, transparent 47px, rgba(180,160,120,0.14) 47px, rgba(180,160,120,0.14) 48px);
}
.folder-card { transition: transform 0.15s ease, border-color 0.15s ease; }
.folder-card:hover { transform: translateY(-2px); }
`;

const TONES = {
  emerald: { ring: "border-emerald-700", text: "text-emerald-800", bg: "bg-emerald-50", dot: "bg-emerald-700", solid: "#047857" },
  amber: { ring: "border-amber-700", text: "text-amber-800", bg: "bg-amber-50", dot: "bg-amber-700", solid: "#b45309" },
  rose: { ring: "border-rose-700", text: "text-rose-800", bg: "bg-rose-50", dot: "bg-rose-700", solid: "#9f1239" },
  stone: { ring: "border-stone-400", text: "text-stone-700", bg: "bg-stone-100", dot: "bg-stone-500", solid: "#78716c" },
};

function Seal({ label, tone = "stone", size = "sm" }) {
  const t = TONES[tone];
  return (
    <span
      className={`stamp-in f-mono inline-flex items-center gap-1.5 px-2.5 py-1 border-2 ${t.ring} ${t.bg} ${t.text} ${size === "sm" ? "text-[10px]" : "text-[11px]"} tracking-wider uppercase`}
      style={{ borderRadius: 2, transform: "rotate(-3deg)" }}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
      {label}
    </span>
  );
}

function Monogram({ text, tone = "stone" }) {
  const t = TONES[tone];
  return (
    <div className={`w-10 h-10 shrink-0 flex items-center justify-center border-2 ${t.ring} ${t.bg} relative`} style={{ borderRadius: "50%" }}>
      <span className={`f-display font-semibold text-sm ${t.text}`}>{text}</span>
      <span className="absolute inset-[-3px] rounded-full border border-dashed border-stone-300" />
    </div>
  );
}

function Masthead({ eyebrow, title, sub, reg }) {
  return (
    <div className="mb-7">
      <div className="flex items-end justify-between">
        <div>
          <p className="f-mono text-[10px] uppercase tracking-[0.2em] text-stone-400">{eyebrow}</p>
          <h1 className="f-display text-[28px] font-semibold text-stone-900 mt-1 leading-none">{title}</h1>
        </div>
        <div className="text-right">
          <p className="f-mono text-[10px] uppercase tracking-widest text-stone-400">Registry no.</p>
          <p className="f-mono text-xs text-stone-500">{reg}</p>
        </div>
      </div>
      <div className="mt-3 border-t-2 border-stone-800" />
      <div className="border-t border-stone-300 mt-[3px]" />
      <p className="f-body text-sm text-stone-500 mt-3">{sub}</p>
    </div>
  );
}

function LineNo({ n }) {
  return <span className="f-mono text-[10px] text-stone-300 mr-3 select-none">{String(n).padStart(2, "0")}</span>;
}

function Th({ children, right }) {
  return <th className={`f-mono text-[11px] uppercase tracking-wider text-stone-500 font-medium py-3 px-4 ${right ? "text-right" : "text-left"}`}>{children}</th>;
}
function Td({ children, right, className = "", colSpan }) {
  return <td colSpan={colSpan} className={`py-4 px-4 align-top ${right ? "text-right" : ""} ${className}`}>{children}</td>;
}

function Btn({ children, tone = "stone", filled, onClick }) {
  const map = {
    emerald: filled ? "bg-emerald-800 text-white border-emerald-800 hover:bg-emerald-900" : "border-emerald-700 text-emerald-800 hover:bg-emerald-50",
    rose: filled ? "bg-rose-900 text-white border-rose-900 hover:bg-rose-950" : "border-rose-300 text-rose-800 hover:bg-rose-50",
    stone: "border-stone-300 text-stone-700 hover:bg-stone-50",
  };
  return <button onClick={onClick} className={`f-body text-xs font-semibold px-3 py-1.5 border ${map[tone]} transition-colors`}>{children}</button>;
}

const NAV = [
  { key: "dashboard", label: "Admin dashboard", icon: LayoutGrid, tone: "emerald" },
  { key: "users", label: "User control & verification", icon: Users, badge: "3", tone: "amber" },
  { key: "listings", label: "Listings moderation", icon: Package, badge: "1", tone: "amber" },
  { key: "escrow", label: "Escrow & transactions", icon: Lock, tone: "emerald" },
  { key: "disputes", label: "Dispute resolution", icon: ShieldAlert, badge: "1", tone: "rose" },
  { key: "analytics", label: "Role balance analytics", icon: BarChart3, tone: "emerald" },
  { key: "team", label: "Team & access", icon: UserCog, tone: "stone", adminOnly: true },
];

function AdminOnlyTag() {
  return (
    <span className="f-mono text-[9px] uppercase tracking-wider text-stone-400 border border-stone-300 px-1.5 py-0.5 inline-flex items-center gap-1">
      <ShieldCheck size={10} /> Admin only
    </span>
  );
}

const ESCROW_LIMIT = 50000;

const VIEWERS = [
  { key: "super_admin", name: "Selamawit B.", title: "Super Admin", initials: "SB", tone: "amber" },
  { key: "verification_officer", name: "Yonas T.", title: "Verification Officer", initials: "YT", tone: "amber" },
  { key: "listings_moderator", name: "Meron A.", title: "Listings Moderator", initials: "MA", tone: "amber" },
  { key: "escrow_officer", name: "Robel K.", title: "Escrow Officer", initials: "RK", tone: "amber" },
  { key: "dispute_mediator", name: "Hana G.", title: "Dispute Mediator", initials: "HG", tone: "amber" },
];

const PERMS = {
  super_admin: ["dashboard", "users", "listings", "escrow", "disputes", "analytics", "team"],
  verification_officer: ["dashboard", "users", "analytics"],
  listings_moderator: ["dashboard", "listings", "analytics"],
  escrow_officer: ["dashboard", "escrow", "analytics"],
  dispute_mediator: ["dashboard", "disputes", "analytics"],
};

const STAFF_LIST = [
  { name: "Yonas T.", email: "yonas@bmb2b.et", role: "Verification Officer", scope: "User verification only", status: "Active", last: "Today, 09:12",
    tasks: ["Review business license, TIN & import/export documents", "Approve, reject, or request more info on new accounts", "Flag suspicious or mismatched documents", "Escalate large institutional buyers to Admin"] },
  { name: "Meron A.", email: "meron@bmb2b.et", role: "Listings Moderator", scope: "Listings queue only", status: "Active", last: "Today, 08:40",
    tasks: ["Approve new product listings before publish", "Remove policy-violating or duplicate listings", "Handle reported/flagged listings", "Manage product categories"] },
  { name: "Robel K.", email: "robel@bmb2b.et", role: "Escrow Officer", scope: "Escrow release under 50,000 ETB", status: "Active", last: "Yesterday, 17:05",
    tasks: ["Release escrow funds to seller under threshold", "Process buyer refunds under threshold", "Reconcile held vs. released balances", "Escalate releases above 50,000 ETB to Admin"] },
  { name: "Hana G.", email: "hana@bmb2b.et", role: "Dispute Mediator", scope: "Investigate & recommend only", status: "Active", last: "Today, 11:22",
    tasks: ["Review chat logs & evidence for open disputes", "Contact buyer/seller for clarification", "Write binding mediation recommendation", "Hand off fund release to Escrow Officer or Admin"] },
];

export default function AdminConsole() {
  const [page, setPage] = useState("dashboard");
  const [userTab, setUserTab] = useState("all");
  const [listingTab, setListingTab] = useState("all");
  const [stamped, setStamped] = useState({});
  const [viewer, setViewer] = useState("super_admin");
  const [expandedStaff, setExpandedStaff] = useState(null);

  const toggleStamp = (key) => setStamped((s) => ({ ...s, [key]: !s[key] }));
  const isAdmin = viewer === "super_admin";
  const allowed = PERMS[viewer];
  const goTo = (key) => { if (allowed.includes(key)) setPage(key); };

  const users = [
    { key: "abel", name: "Abel Berhanu", co: "Ethio Import & Trading PLC", role: "Importer", roleTone: "amber", phone: "+251 91 122 3344", email: "abel@ethioimport.com", status: "Pending review", tone: "amber", joined: "18 Aug 2026", docs: 2 },
    { key: "beth", name: "Bethlehem Tadesse", co: "Nile Garment & Textile Mill", role: "Producer", roleTone: "emerald", phone: "+251 91 144 5566", email: "bethlehem@niletextiles.et", status: "Verified", tone: "emerald", badge: "New seller", joined: "2 Jul 2026", docs: 0 },
    { key: "dawit", name: "Dawit Solomon", co: "Solomon General Contractors", role: "Institutional buyer", roleTone: "stone", phone: "+251 92 277 8899", email: "dawit@solomonbuilding.com", status: "More info needed", tone: "rose", joined: "20 Aug 2026", docs: 1 },
  ];

  const listings = [
    { key: "rebar", name: "High grade steel rebars (12mm & 16mm)", cat: "Construction materials", seller: "Ethio Import & Trading PLC", price: "1,450 ETB / quintal", moq: "100 units", status: "Pending approval", tone: "amber" },
    { key: "coffee", name: "Organic Ethiopian Yirgacheffe coffee beans, grade 1", cat: "Agriculture & food", seller: "Nile Garment & Textile Mill", price: "980 ETB / kg", moq: "50 units", status: "Published", tone: "emerald" },
    { key: "solar", name: "Industrial heavy duty solar inverters, 10kW", cat: "Electronics & energy", seller: "Ethio Import & Trading PLC", price: "45,000 ETB / unit", moq: "5 units", status: "Flagged · 2 reports", tone: "rose" },
  ];

  const escrowOrders = [
    { id: "ORD-2026-881", item: "Organic Ethiopian Yirgacheffe coffee beans", buyer: "Solomon General Contractors", seller: "Nile Garment & Textile Mill", amount: 98000, status: "Held", tone: "amber" },
    { id: "ORD-2026-770", item: "High grade steel rebars", buyer: "Ethio Import & Trading PLC", seller: "Nile Garment Mill", amount: 290000, status: "Released", tone: "emerald" },
  ];
  let running = 0;

  const geo = [
    { region: "Addis Ababa (Kality / Bole)", buyers: 420, sellers: 180, ratio: 2.3, signal: null },
    { region: "Sidama (Hawassa Industrial)", buyers: 110, sellers: 95, ratio: 1.1, signal: null },
    { region: "Oromia (Adama / Modjo)", buyers: 280, sellers: 60, ratio: 4.6, signal: "High demand" },
    { region: "Amhara (Bahir Dar / Gondar)", buyers: 150, sellers: 40, ratio: 3.7, signal: null },
  ];
  const maxRatio = Math.max(...geo.map((g) => g.ratio));

  const demand = [
    { item: "500kVA transformer", note: "142 buyer searches this month", pct: 28 },
    { item: "PVC pipes, 110mm class B", note: "98 buyer searches this month", pct: 15 },
    { item: "Sesame seed export bulk", note: "76 buyer searches this month", pct: 12 },
  ];

  return (
    <div className="f-body min-h-screen bg-stone-50 flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{FONTS}</style>

      <aside className="w-72 shrink-0 bg-white border-r border-stone-200 flex flex-col relative">
        <div className="px-6 pt-7 pb-6 border-b border-stone-100 flex items-center gap-3">
          <div className="relative w-11 h-11 shrink-0">
            <div className="absolute inset-0 border-2 border-emerald-800 rounded-full" />
            <div className="absolute inset-[3px] border border-dashed border-emerald-700 rounded-full flex items-center justify-center">
              <span className="f-display font-bold text-emerald-900 text-base">B</span>
            </div>
          </div>
          <div>
            <p className="f-display font-semibold text-stone-900 text-base leading-tight">BM B2B</p>
            <p className="f-mono text-[10px] uppercase tracking-widest text-stone-400 mt-0.5">Est. Addis Ababa</p>
          </div>
          <ChevronLeft size={16} className="ml-auto text-stone-300" />
        </div>

        <div className="px-6 pt-6 pb-2">
          <p className="f-mono text-[10px] uppercase tracking-widest text-stone-400">Management areas</p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV.map(({ key, label, icon: Icon, badge, tone, adminOnly }) => {
            const permitted = allowed.includes(key);
            if (!permitted) return null;
            const active = page === key;
            const t = TONES[tone];
            return (
              <button
                key={key}
                onClick={() => setPage(key)}
                className={`relative w-full flex items-center gap-3 px-3.5 py-3 text-left transition-colors ${
                  active ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                <Icon size={17} className={active ? "text-stone-300" : "text-stone-400"} />
                <span className="f-body text-sm font-medium flex-1">{label}</span>
                {adminOnly && !active && <ShieldCheck size={13} className="text-stone-300" />}
                {badge && (
                  <span className={`f-mono text-[10px] font-semibold px-1.5 py-0.5 ${active ? "bg-stone-700 text-stone-200" : `${t.bg} ${t.text} border ${t.ring}`}`}>
                    {badge}
                  </span>
                )}
                {active && (
                  <span
                    className="absolute top-1/2 -translate-y-1/2"
                    style={{ right: -13, width: 14, height: 30, background: t.solid, clipPath: "polygon(0 10%, 100% 0, 100% 100%, 0 90%)" }}
                  />
                )}
              </button>
            );
          })}
          {!isAdmin && (
            <p className="f-body text-xs text-stone-400 px-3.5 pt-3 leading-relaxed">
              Signed in with limited staff access. Sections outside your role are hidden.
            </p>
          )}
        </nav>

        <div className="px-4 py-4 border-t border-stone-100">
          <div className="flex items-center gap-3 mb-3">
            <Monogram text={VIEWERS.find((v) => v.key === viewer).initials} tone={isAdmin ? "amber" : "stone"} />
            <div>
              <p className="f-body text-sm font-semibold text-stone-800">{VIEWERS.find((v) => v.key === viewer).name}</p>
              <p className="f-mono text-[10px] text-stone-400">{isAdmin ? "system:owner" : "staff:limited"}</p>
            </div>
          </div>
          <label className="f-mono text-[9px] uppercase tracking-widest text-stone-400 block mb-1">View as (demo)</label>
          <select
            value={viewer}
            onChange={(e) => { setViewer(e.target.value); if (!PERMS[e.target.value].includes(page)) setPage("dashboard"); }}
            className="f-body w-full text-xs border border-stone-300 px-2 py-1.5 bg-stone-50 focus:outline-none focus:border-emerald-700"
          >
            {VIEWERS.map((v) => <option key={v.key} value={v.key}>{v.title}</option>)}
          </select>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 bg-white border-b border-stone-200 flex items-center px-8 gap-6">
          <div className="flex-1 max-w-md relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input placeholder="Search users, orders, TIN..." className="f-body w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 focus:outline-none focus:border-emerald-700 placeholder:text-stone-400" />
          </div>
          <div className="ml-auto flex items-center gap-4">
            <button className="relative text-stone-400 hover:text-stone-600">
              <Bell size={18} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-600 rounded-full" />
            </button>
            <span className="f-mono text-[11px] uppercase tracking-wider px-3 py-1.5 border border-emerald-700 text-emerald-800 bg-emerald-50 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" /> Session verified
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          {page === "dashboard" && (
            <div>
              <Masthead eyebrow="Marketplace control tower" title="The trade desk, today" reg="ETH-2026-0091" sub="Real-time oversight of buyer/seller verifications, escrow security, and platform liquidity." />

              <div className="grid grid-cols-3 gap-8 mb-8">
                <div className="col-span-2 bg-white border-2 border-stone-900 p-8 flex flex-col justify-between">
                  <p className="f-mono text-[11px] uppercase tracking-wider text-amber-700">Lead figure · held in escrow</p>
                  <p className="f-display text-7xl font-semibold text-stone-900 leading-none my-4 tabular">98,000<span className="text-2xl text-stone-400 ml-2 font-medium">ETB</span></p>
                  <div className="flex items-center justify-between">
                    <p className="f-body text-sm text-stone-500">Active order <span className="f-mono text-stone-700">ORD-2026-881</span> · awaiting delivery confirmation</p>
                    <button onClick={() => setPage("escrow")} className="f-body text-sm font-semibold text-emerald-800 inline-flex items-center gap-1">Open ledger <ChevronRight size={14} /></button>
                  </div>
                </div>
                <div className="bg-white border border-stone-200 divide-y divide-stone-100">
                  {[
                    { label: "Pending verifications", value: "3", tone: "amber", go: "users" },
                    { label: "Listings awaiting review", value: "1", tone: "amber", go: "listings" },
                    { label: "Open disputes", value: "1", tone: "rose", go: "disputes" },
                  ].filter((r) => allowed.includes(r.go)).map((r) => (
                    <button key={r.label} onClick={() => goTo(r.go)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-stone-50">
                      <span className="f-body text-sm text-stone-600">{r.label}</span>
                      <span className={`f-display text-2xl font-semibold ${TONES[r.tone].text}`}>{r.value}</span>
                    </button>
                  ))}
                  {!isAdmin && !["users","listings","disputes"].some(k => allowed.includes(k)) && (
                    <p className="f-body text-xs text-stone-400 px-5 py-4">No action queues assigned to your role — check Analytics for platform activity.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {allowed.includes("users") ? (
                <div className="col-span-2 bg-white border border-stone-200">
                  <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                    <div>
                      <h2 className="f-display text-lg font-semibold text-stone-900">Pending verification queue</h2>
                      <p className="f-body text-sm text-stone-500">Business license, TIN, and procurement authorizations</p>
                    </div>
                    <button onClick={() => goTo("users")} className="f-body text-sm font-medium text-emerald-800">View all</button>
                  </div>
                  <div className="divide-y divide-stone-100">
                    {users.filter((u) => u.status !== "Verified").map((u) => (
                      <div key={u.key} className="px-6 py-4 flex items-center gap-4">
                        <Monogram text={u.name.split(" ").map((n) => n[0]).join("")} tone={u.tone} />
                        <div className="flex-1 min-w-0">
                          <p className="f-body text-sm font-semibold text-stone-800 flex items-center gap-2">{u.name} <Seal label={u.role} tone={u.roleTone} /></p>
                          <p className="f-body text-sm text-stone-500 mt-0.5">{u.co}</p>
                          <p className="f-mono text-[11px] text-stone-400 mt-1 flex items-center gap-1"><Paperclip size={10} /> Submitted {u.joined} · {u.docs} document{u.docs !== 1 ? "s" : ""} attached</p>
                        </div>
                        {stamped[u.key] ? <Seal label="Verified" tone="emerald" /> : <Seal label={u.status} tone={u.tone} />}
                        <Btn tone="emerald" filled onClick={() => toggleStamp(u.key)}>{stamped[u.key] ? "Undo" : "Review docs"}</Btn>
                      </div>
                    ))}
                  </div>
                </div>
                ) : (
                <div className="col-span-2 bg-white border border-dashed border-stone-300 flex items-center justify-center p-10">
                  <p className="f-body text-sm text-stone-400">Verification queue is outside {VIEWERS.find((v) => v.key === viewer).title}'s access scope.</p>
                </div>
                )}

                <div className="bg-white border border-stone-200 p-6">
                  <h2 className="f-display text-lg font-semibold text-stone-900">Role liquidity</h2>
                  <p className="f-body text-sm text-stone-500 mb-5">Balance across producers and buyers</p>
                  {[
                    { label: "Importers", pct: 33.3, tone: "amber" },
                    { label: "Producers", pct: 33.3, tone: "emerald" },
                    { label: "Institutional buyers", pct: 33.3, tone: "amber" },
                  ].map((r) => (
                    <div key={r.label} className="mb-4">
                      <div className="flex justify-between mb-1.5">
                        <span className="f-body text-sm text-stone-600">{r.label}</span>
                        <span className="f-mono text-xs text-stone-500">{r.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-stone-100">
                        <div className={`h-1.5 ${TONES[r.tone].dot}`} style={{ width: `${r.pct}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="mt-5 pt-5 border-t border-stone-100">
                    <p className="f-mono text-[11px] uppercase tracking-wider text-emerald-800 mb-1.5">Liquidity signal</p>
                    <p className="f-body text-sm text-stone-600">Equal balance across producers and institutional buyers. Recommend recruiting more wholesalers in Adama and Hawassa.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {page === "users" && (
            <div>
              <Masthead eyebrow="User control" title="Verification queue" reg="ETH-2026-VER-3" sub="Review business credentials, trade licenses, TIN certificates, and manage roles." />
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1 border-b border-stone-200">
                  {[["all", "All users"], ["pending", "Pending review · 1"], ["verified", "Verified · 1"]].map(([k, l]) => (
                    <button key={k} onClick={() => setUserTab(k)} className={`f-body text-sm font-medium px-4 py-2.5 border-b-2 ${userTab === k ? "border-stone-900 text-stone-900" : "border-transparent text-stone-500"}`}>{l}</button>
                  ))}
                </div>
                <span className="f-mono text-xs text-stone-400">Total users: 3</span>
              </div>

              <div className="grid grid-cols-3 gap-5">
                {users.map((u, i) => (
                  <div key={u.key} className="folder-card bg-white border border-stone-200 relative">
                    <div className="absolute -top-3 left-5 bg-stone-100 border border-stone-300 px-3 py-0.5 f-mono text-[10px] text-stone-500">FILE {String(i + 1).padStart(3, "0")}</div>
                    <div className="p-5 pt-7">
                      <div className="flex items-start justify-between">
                        <Monogram text={u.name.split(" ").map((n) => n[0]).join("")} tone={u.tone} />
                        {stamped[u.key] ? <Seal label="Verified" tone="emerald" /> : <Seal label={u.status} tone={u.tone} />}
                      </div>
                      <p className="f-body text-sm font-semibold text-stone-800 mt-3">{u.name}</p>
                      <p className="f-body text-xs text-stone-500">{u.co}</p>
                      <div className="mt-3">
                        <Seal label={u.role} tone={u.roleTone} />
                      </div>
                      <div className="mt-4 pt-4 border-t border-dashed border-stone-200 space-y-1">
                        <p className="f-mono text-xs text-stone-600">{u.phone}</p>
                        <p className="f-mono text-xs text-stone-400">{u.email}</p>
                        <p className="f-mono text-[11px] text-stone-400 flex items-center gap-1 pt-1"><Paperclip size={10} /> {u.docs} document{u.docs !== 1 ? "s" : ""} · joined {u.joined}</p>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Btn>View file</Btn>
                        <Btn tone="emerald" filled onClick={() => toggleStamp(u.key)}>{stamped[u.key] ? "Undo stamp" : "Approve"}</Btn>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {page === "listings" && (
            <div>
              <Masthead eyebrow="Listings moderation" title="Cargo manifest" reg="ETH-2026-MAN-7" sub="Review product listings, handle policy flags, and manage categories." />
              <div className="flex gap-1 border-b border-stone-200 mb-4">
                {[["all", "All listings"], ["pending", "Pending approval · 1"], ["flagged", "Reported · 1"], ["published", "Published"]].map(([k, l]) => (
                  <button key={k} onClick={() => setListingTab(k)} className={`f-body text-sm font-medium px-4 py-2.5 border-b-2 ${listingTab === k ? "border-stone-900 text-stone-900" : "border-transparent text-stone-500"}`}>{l}</button>
                ))}
              </div>
              <div className="bg-white border border-stone-200 overflow-hidden ruled">
                <table className="w-full">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr><Th>Product listing</Th><Th>Category</Th><Th>Seller</Th><Th>Price & MOQ</Th><Th>Status</Th><Th right>Actions</Th></tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {listings.map((l, i) => (
                      <tr key={l.key}>
                        <Td className="max-w-xs">
                          <div className="flex items-start gap-3">
                            <LineNo n={i + 1} />
                            <p className="f-body text-sm font-semibold text-stone-800 leading-snug">{l.name}</p>
                          </div>
                        </Td>
                        <Td><span className="f-body text-xs text-stone-600">{l.cat}</span></Td>
                        <Td><span className="f-body text-xs text-stone-600">{l.seller}</span></Td>
                        <Td><p className="f-mono text-sm text-stone-800 tabular">{l.price}</p><p className="f-mono text-xs text-stone-400">MOQ {l.moq}</p></Td>
                        <Td>{stamped[l.key] ? <Seal label="Approved" tone="emerald" /> : <Seal label={l.status} tone={l.tone} />}</Td>
                        <Td right>
                          <div className="flex justify-end gap-2">
                            <Btn tone="rose">Remove</Btn>
                            <Btn tone="emerald" filled onClick={() => toggleStamp(l.key)}>{stamped[l.key] ? "Undo" : "Approve"}</Btn>
                          </div>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {page === "escrow" && (
            <div>
              <Masthead eyebrow="Escrow & transactions" title="Running ledger" reg="ETH-2026-ESC-2" sub={`Monitor held escrow balances, manual release overrides, and platform transaction ledgers. Releases over ${ESCROW_LIMIT.toLocaleString()} ETB require Super Admin sign-off.`} />
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-stone-200 p-5" style={{ borderTop: "3px solid #b45309" }}>
                  <p className="f-mono text-[11px] uppercase tracking-wider text-stone-500 mb-2">Total held</p>
                  <p className="f-display text-3xl font-semibold text-stone-900 tabular">98,000 <span className="text-sm text-stone-400 font-medium">ETB</span></p>
                  <p className="f-body text-xs text-stone-500 mt-1">Secured in Telebirr & CBE Birr escrow</p>
                </div>
                <div className="bg-white border border-stone-200 p-5" style={{ borderTop: "3px solid #047857" }}>
                  <p className="f-mono text-[11px] uppercase tracking-wider text-stone-500 mb-2">Total released</p>
                  <p className="f-display text-3xl font-semibold text-stone-900 tabular">290,000 <span className="text-sm text-stone-400 font-medium">ETB</span></p>
                  <p className="f-body text-xs text-stone-500 mt-1">Completed orders</p>
                </div>
                <div className="bg-white border border-stone-200 p-5" style={{ borderTop: "3px solid #78716c" }}>
                  <p className="f-mono text-[11px] uppercase tracking-wider text-stone-500 mb-2">Commission · 2.5%</p>
                  <p className="f-display text-3xl font-semibold text-stone-900 tabular">9,700 <span className="text-sm text-stone-400 font-medium">ETB</span></p>
                  <p className="f-body text-xs text-stone-500 mt-1">Earned revenue</p>
                </div>
              </div>
              <div className="bg-white border border-stone-200 overflow-hidden ruled">
                <table className="w-full">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr><Th>Order & item</Th><Th>Buyer</Th><Th>Seller</Th><Th right>Amount</Th><Th right>Running balance</Th><Th>Status</Th><Th right>Overrides</Th></tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {escrowOrders.map((o, i) => {
                      running += o.status === "Held" ? o.amount : 0;
                      return (
                        <tr key={o.id}>
                          <Td><div className="flex gap-3"><LineNo n={i + 1} /><div><p className="f-mono text-xs text-emerald-800">{o.id}</p><p className="f-body text-sm font-semibold text-stone-800 mt-0.5">{o.item}</p></div></div></Td>
                          <Td><span className="f-body text-sm text-stone-600">{o.buyer}</span></Td>
                          <Td><span className="f-body text-sm text-stone-600">{o.seller}</span></Td>
                          <Td right><span className="f-mono text-sm font-semibold text-stone-900 tabular">{o.amount.toLocaleString()}</span></Td>
                          <Td right><span className="f-mono text-sm text-amber-800 tabular">{running.toLocaleString()}</span></Td>
                          <Td>{stamped[o.id] ? <Seal label="Funds released" tone="emerald" /> : <Seal label={o.status === "Held" ? "Held escrow" : "Funds released"} tone={o.tone} />}</Td>
                          <Td right>
                            {o.status === "Held" && !stamped[o.id] ? (
                              o.amount > ESCROW_LIMIT && !isAdmin ? (
                                <div className="flex flex-col items-end gap-1">
                                  <Btn tone="stone">Escalate to Admin</Btn>
                                  <AdminOnlyTag />
                                </div>
                              ) : (
                                <div className="flex justify-end gap-2">
                                  <Btn tone="rose">Refund buyer</Btn>
                                  <Btn tone="emerald" filled onClick={() => toggleStamp(o.id)}>Release to seller</Btn>
                                </div>
                              )
                            ) : (
                              <span className="f-body text-xs text-emerald-700 font-medium">✓ Payout settled</span>
                            )}
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {page === "disputes" && (
            <div>
              <Masthead eyebrow="Dispute resolution" title="Case file" reg="ETH-2026-DSP-44" sub="Review buyer/seller chat logs, inspect order status, and make binding escrow resolution decisions." />
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white border border-stone-200 p-4 h-fit">
                  <p className="f-mono text-[11px] uppercase tracking-wider text-stone-400 mb-3">Docket</p>
                  <div className="p-4 border-2 border-amber-700 bg-amber-50">
                    <div className="flex justify-between items-start">
                      <p className="f-mono text-xs text-amber-900 font-semibold">DSP-2026-044</p>
                      <Seal label="Investigating" tone="amber" />
                    </div>
                    <p className="f-body text-sm font-semibold text-stone-800 mt-2">Defective goods</p>
                    <p className="f-body text-xs text-stone-500 mt-1">Shipment batch #2 contained 10 bags with moisture damage.</p>
                    <div className="flex justify-between mt-3 pt-3 border-t border-amber-200">
                      <span className="f-mono text-xs text-stone-500">Order: ORD-2026-881</span>
                      <span className="f-mono text-xs font-semibold text-stone-800 tabular">98,000 ETB</span>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 bg-white border border-stone-200 p-6">
                  <div className="flex justify-between items-start pb-5 border-b border-stone-100">
                    <div>
                      <p className="f-mono text-xs text-stone-400">Docket DSP-2026-044 · Kality Industrial Zone</p>
                      <h2 className="f-display text-xl font-semibold text-stone-900 mt-1">Dispute: defective goods</h2>
                    </div>
                    <div className="text-right">
                      <p className="f-mono text-2xl font-semibold text-stone-900 tabular">98,000 <span className="text-sm text-stone-400">ETB</span></p>
                      <p className="f-body text-xs text-stone-500">Escrow held</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 py-5 border-b border-stone-100">
                    <div>
                      <p className="f-mono text-[11px] uppercase tracking-wider text-stone-400">Buyer (claimant)</p>
                      <p className="f-body text-sm font-semibold text-stone-800 mt-1">Solomon General Contractors</p>
                    </div>
                    <div>
                      <p className="f-mono text-[11px] uppercase tracking-wider text-stone-400">Seller (respondent)</p>
                      <p className="f-body text-sm font-semibold text-stone-800 mt-1">Nile Garment & Textile Mill</p>
                    </div>
                  </div>

                  <div className="py-5 space-y-3 border-b border-stone-100">
                    <p className="f-mono text-[11px] uppercase tracking-wider text-stone-400 mb-2">Evidence & chat history</p>
                    <div className="bg-stone-50 border-l-2 border-stone-300 p-3.5">
                      <div className="flex justify-between"><p className="f-body text-xs font-semibold text-stone-700"><span className="f-mono text-stone-400 mr-1">Exhibit A</span> Solomon Contractors (buyer)</p><p className="f-mono text-[10px] text-stone-400">01:00 PM</p></div>
                      <p className="f-body text-sm text-stone-600 mt-1">We received the shipment today but 10 bags have water damage. Requesting 10% refund or replacement.</p>
                    </div>
                    <div className="bg-stone-50 border-l-2 border-stone-300 p-3.5">
                      <div className="flex justify-between"><p className="f-body text-xs font-semibold text-stone-700"><span className="f-mono text-stone-400 mr-1">Exhibit B</span> Nile Textile Mill (seller)</p><p className="f-mono text-[10px] text-stone-400">02:30 PM</p></div>
                      <p className="f-body text-sm text-stone-600 mt-1">The goods left our warehouse in perfect condition. We suspect transport damage.</p>
                    </div>
                  </div>

                  <div className="pt-5">
                    <p className="f-mono text-[11px] uppercase tracking-wider text-stone-400 mb-2">Administrative mediation decision</p>
                    <textarea rows={3} placeholder="Enter binding mediation notes..." className="f-body w-full p-3 text-sm border border-stone-200 focus:outline-none focus:border-emerald-700 placeholder:text-stone-400" />
                    <div className="flex justify-end gap-2 mt-3">
                      <Btn tone="rose">Full refund to buyer</Btn>
                      <Btn tone="emerald" filled>Release funds to seller</Btn>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {page === "analytics" && (
            <div>
              <Masthead eyebrow="Role balance" title="Liquidity register" reg="ETH-2026-ANL-9" sub="Spot supply/demand imbalances, monitor conversion funnels, and track top trading regions." />
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 bg-white border border-stone-200">
                  <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-2">
                    <MapPin size={15} className="text-emerald-700" />
                    <div>
                      <h2 className="f-display text-lg font-semibold text-stone-900">Geographic supply/demand balance</h2>
                      <p className="f-body text-xs text-stone-500">Buyer to seller ratio per region</p>
                    </div>
                  </div>
                  <div className="divide-y divide-stone-100">
                    {geo.map((g) => (
                      <div key={g.region} className="px-6 py-4">
                        <div className="flex justify-between mb-2">
                          <span className="f-body text-sm font-medium text-stone-800">{g.region}</span>
                          <span className={`f-mono text-sm font-semibold ${g.signal ? "text-amber-800" : "text-stone-700"}`}>{g.ratio.toFixed(1)} : 1 {g.signal && <span className="text-[11px] font-normal">· {g.signal}</span>}</span>
                        </div>
                        <div className="flex gap-3 items-center">
                          <span className="f-mono text-[11px] text-stone-400 w-24">{g.buyers} buyers</span>
                          <div className="flex-1 h-1.5 bg-stone-100">
                            <div className={`h-1.5 ${g.signal ? "bg-amber-700" : "bg-emerald-700"}`} style={{ width: `${(g.ratio / maxRatio) * 100}%` }} />
                          </div>
                          <span className="f-mono text-[11px] text-stone-400 w-24 text-right">{g.sellers} sellers</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-stone-200 p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <Search size={15} className="text-emerald-700" />
                    <h2 className="f-display text-lg font-semibold text-stone-900">Unmet demand</h2>
                  </div>
                  <p className="f-body text-xs text-stone-500 mb-4">High-volume searches yielding zero listing results</p>
                  <div className="space-y-4">
                    {demand.map((d) => (
                      <div key={d.item} className="border-b border-stone-100 pb-3 last:border-0">
                        <div className="flex items-center justify-between">
                          <p className="f-body text-sm font-semibold text-stone-800">{d.item}</p>
                          <span className="f-mono text-xs font-semibold text-emerald-800">+{d.pct}%</span>
                        </div>
                        <p className="f-body text-xs text-stone-500 mb-1.5">{d.note}</p>
                        <div className="h-1 bg-stone-100"><div className="h-1 bg-emerald-700" style={{ width: `${d.pct * 3}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {page === "team" && isAdmin && (
            <div>
              <Masthead eyebrow="Team & access" title="Staff register" reg="ETH-2026-TEAM-1" sub="Assign staff to a single functional area. Only Super Admin can grant roles, move commission settings, or approve escrow above the sign-off threshold." />

              <div className="bg-white border border-stone-200 mb-6">
                <table className="w-full">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr><Th>Staff member</Th><Th>Assigned role</Th><Th>Scope</Th><Th>Status</Th><Th>Last active</Th><Th right>Actions</Th></tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {STAFF_LIST.map((s) => (
                      <React.Fragment key={s.email}>
                      <tr className="cursor-pointer hover:bg-stone-50/60" onClick={() => setExpandedStaff(expandedStaff === s.email ? null : s.email)}>
                        <Td>
                          <div className="flex items-center gap-3">
                            <Monogram text={s.name.split(" ").map((n) => n[0]).join("")} tone="stone" />
                            <div><p className="f-body text-sm font-semibold text-stone-800">{s.name}</p><p className="f-mono text-xs text-stone-400">{s.email}</p></div>
                          </div>
                        </Td>
                        <Td><Seal label={s.role} tone="amber" /></Td>
                        <Td><span className="f-body text-xs text-stone-600">{s.scope}</span></Td>
                        <Td><Seal label={s.status} tone="emerald" /></Td>
                        <Td><span className="f-mono text-xs text-stone-500">{s.last}</span></Td>
                        <Td right>
                          <div className="flex justify-end gap-2">
                            <Btn>{expandedStaff === s.email ? "Hide tasks" : "View tasks"}</Btn>
                            <Btn tone="rose">Suspend</Btn>
                          </div>
                        </Td>
                      </tr>
                      {expandedStaff === s.email && (
                        <tr className="bg-stone-50">
                          <Td colSpan={6} className="!py-4">
                            <p className="f-mono text-[10px] uppercase tracking-widest text-stone-400 mb-2">Individual task checklist — {s.name}</p>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
                              {s.tasks.map((t, i) => (
                                <p key={i} className="f-body text-sm text-stone-600 flex items-start gap-2">
                                  <span className="f-mono text-emerald-700 mt-0.5">{String(i + 1).padStart(2, "0")}</span> {t}
                                </p>
                              ))}
                            </div>
                          </Td>
                        </tr>
                      )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white border border-stone-200 p-6">
                  <h2 className="f-display text-lg font-semibold text-stone-900 mb-1">Add staff member</h2>
                  <p className="f-body text-sm text-stone-500 mb-4">New staff are scoped to exactly one functional area — they never see sections outside their role.</p>
                  <div className="space-y-3">
                    <input placeholder="Full name" className="f-body w-full text-sm border border-stone-200 px-3 py-2 focus:outline-none focus:border-emerald-700" />
                    <input placeholder="Email address" className="f-body w-full text-sm border border-stone-200 px-3 py-2 focus:outline-none focus:border-emerald-700" />
                    <select className="f-body w-full text-sm border border-stone-200 px-3 py-2 focus:outline-none focus:border-emerald-700">
                      <option>Verification Officer</option>
                      <option>Listings Moderator</option>
                      <option>Escrow Officer</option>
                      <option>Dispute Mediator</option>
                    </select>
                    <Btn tone="emerald" filled>Send invite</Btn>
                  </div>
                </div>
                <div className="bg-white border border-stone-200 p-6">
                  <h2 className="f-display text-lg font-semibold text-stone-900 mb-1">Escrow sign-off threshold</h2>
                  <p className="f-body text-sm text-stone-500 mb-4">Escrow Officers can release funds up to this amount. Anything higher escalates to you.</p>
                  <div className="flex items-center gap-3">
                    <span className="f-mono text-3xl font-semibold text-stone-900 tabular">{ESCROW_LIMIT.toLocaleString()}</span>
                    <span className="f-body text-sm text-stone-400">ETB</span>
                  </div>
                  <div className="mt-4"><Btn tone="stone">Adjust threshold</Btn></div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
