'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Loader2 } from 'lucide-react';

const TONES: Record<string, { ring: string; text: string; bg: string; dot: string }> = {
  emerald: { ring: 'border-emerald-700', text: 'text-emerald-800', bg: 'bg-emerald-50', dot: 'bg-emerald-700' },
  amber: { ring: 'border-amber-700', text: 'text-amber-800', bg: 'bg-amber-50', dot: 'bg-amber-700' },
  rose: { ring: 'border-rose-700', text: 'text-rose-800', bg: 'bg-rose-50', dot: 'bg-rose-700' },
  stone: { ring: 'border-stone-400', text: 'text-stone-700', bg: 'bg-stone-100', dot: 'bg-stone-500' },
};

const TOP_BORDERS: Record<string, string> = {
  emerald: 'border-t-4 border-t-emerald-700',
  amber: 'border-t-4 border-t-amber-700',
  rose: 'border-t-4 border-t-rose-700',
  stone: 'border-t-4 border-t-stone-500',
};

export function Seal({ label, tone = 'stone' }: { label: string; tone?: string }) {
  const t = TONES[tone] || TONES.stone;
  return (
    <span
      className={`f-mono inline-flex items-center gap-1.5 px-2.5 py-1 border ${t.ring} ${t.bg} ${t.text} text-[10px] tracking-wider uppercase font-semibold rounded-sm`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
      {label}
    </span>
  );
}

export function Monogram({ text, tone = 'stone' }: { text: string; tone?: string }) {
  const t = TONES[tone] || TONES.stone;
  return (
    <div
      className={`w-9 h-9 shrink-0 flex items-center justify-center border-2 ${t.ring} ${t.bg} rounded-full`}
    >
      <span className={`f-display font-semibold text-sm ${t.text}`}>{text}</span>
    </div>
  );
}

export function StatCard({
  eyebrow,
  value,
  unit,
  note,
  tone = 'stone',
  cta,
  href,
}: {
  eyebrow: string;
  value: string;
  unit?: string;
  note: string;
  tone?: string;
  cta?: string;
  href?: string;
}) {
  const t = TONES[tone] || TONES.stone;
  const topBorder = TOP_BORDERS[tone] || TOP_BORDERS.stone;

  return (
    <div className={`bg-white border border-stone-200 ${topBorder} p-5 shadow-sm`}>
      <p className="f-mono text-[11px] uppercase tracking-wider text-stone-500 mb-3">{eyebrow}</p>
      <p className="f-display text-4xl font-semibold text-stone-900 leading-none">
        {value}
        {unit && <span className="text-lg font-medium text-stone-400 ml-1">{unit}</span>}
      </p>
      <p className="f-body text-sm text-stone-500 mt-2">{note}</p>
      {cta && href && (
        <Link
          href={href}
          className={`f-body text-sm font-medium ${t.text} mt-4 inline-flex items-center gap-1 hover:gap-1.5 transition-all`}
        >
          {cta}
          <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}

export function Btn({
  children,
  tone = 'stone',
  filled,
  type = 'button',
  disabled,
  loading,
  loadingText,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  tone?: 'emerald' | 'rose' | 'amber' | 'stone';
  filled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const map: Record<string, string> = {
    emerald: filled
      ? 'bg-emerald-800 text-white border-emerald-800 hover:bg-emerald-900 active:scale-[0.98] shadow-xs'
      : 'border-emerald-700 text-emerald-800 hover:bg-emerald-50 active:scale-[0.98]',
    amber: filled
      ? 'bg-amber-800 text-white border-amber-800 hover:bg-amber-900 active:scale-[0.98] shadow-xs'
      : 'border-amber-700 text-amber-800 hover:bg-amber-50 active:scale-[0.98]',
    rose: filled
      ? 'bg-rose-900 text-white border-rose-900 hover:bg-rose-950 active:scale-[0.98] shadow-xs'
      : 'border-rose-300 text-rose-800 hover:bg-rose-50 active:scale-[0.98]',
    stone: filled
      ? 'bg-stone-800 text-white border-stone-800 hover:bg-stone-900 active:scale-[0.98] shadow-xs'
      : 'border-stone-300 text-stone-700 hover:bg-stone-50 active:scale-[0.98]',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`f-body text-xs font-semibold px-3 py-1.5 border rounded-sm transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 disabled:scale-100 inline-flex items-center justify-center gap-1.5 ${
        map[tone] || map.stone
      } ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th
      className={`f-mono text-[11px] uppercase tracking-wider text-stone-500 font-medium py-3 px-4 ${
        right ? 'text-right' : 'text-left'
      }`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  right,
  colSpan,
  className = '',
}: {
  children: React.ReactNode;
  right?: boolean;
  colSpan?: number;
  className?: string;
}) {
  return (
    <td colSpan={colSpan} className={`py-4 px-4 align-middle ${right ? 'text-right' : ''} ${className}`}>
      {children}
    </td>
  );
}
