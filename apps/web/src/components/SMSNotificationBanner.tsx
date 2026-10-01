'use client';
import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { MessageSquare, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SMSNotificationBanner: React.FC = () => {
  const { activeSMS, dismissSMS, setViewingView, setNotificationDrawerOpen } = useMarketplace();

  if (!activeSMS) return null;

  // Sanitize message to guarantee non-technical user-friendly text
  const cleanMessage = activeSMS.message
    .replace(/Internal Server Error/gi, 'Subscription Plan Limit Reached')
    .replace(/ENOENT:[^]*$/gi, '')
    .replace(/\[BitsB2B\]/gi, 'BitsB2B Notice:');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        id="sms-notification-banner"
        className="fixed top-4 right-4 z-50 max-w-md w-full bg-[#1E293B] text-white rounded-2xl shadow-2xl border border-slate-700 p-4 overflow-hidden"
      >
        {/* Accent Bar - Deep Teal */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600" />

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center shrink-0 text-teal-400">
            <MessageSquare className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> SMS Dispatch Notice
                </span>
                <span className="text-[11px] text-slate-400">to {activeSMS.phone}</span>
              </div>
              <span className="text-[11px] text-slate-400">{activeSMS.timestamp}</span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed line-clamp-3 font-medium">
              {cleanMessage}
            </p>

            <div className="mt-2.5 flex items-center gap-2">
              <button
                id="btn-sms-view-notifications"
                onClick={() => {
                  dismissSMS();
                  setNotificationDrawerOpen(true);
                }}
                className="text-[11px] font-bold text-teal-400 hover:text-teal-300 hover:underline cursor-pointer"
              >
                Open Notification Center &rarr;
              </button>
              <span className="text-slate-600 text-xs">•</span>
              <button
                id="btn-sms-dismiss"
                onClick={dismissSMS}
                className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>

          <button
            id="btn-sms-close-icon"
            onClick={dismissSMS}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
            aria-label="Close SMS banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
