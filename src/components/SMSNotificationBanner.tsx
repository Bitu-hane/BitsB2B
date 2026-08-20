import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { MessageSquare, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SMSNotificationBanner: React.FC = () => {
  const { activeSMS, dismissSMS, setViewingView, setNotificationDrawerOpen } = useMarketplace();

  if (!activeSMS) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        id="sms-notification-banner"
        className="fixed top-4 right-4 z-50 max-w-md w-full bg-[#162C30] text-[#F7F4EE] rounded-xl shadow-2xl border border-[#C85A32]/40 p-4 overflow-hidden"
      >
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C85A32] via-[#E27D56] to-[#C85A32]" />

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#C85A32]/20 border border-[#C85A32]/50 flex items-center justify-center shrink-0 text-[#E27D56]">
            <MessageSquare className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#E27D56] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> SMS Gateway
                </span>
                <span className="text-[11px] text-[#A8A196]">to {activeSMS.phone}</span>
              </div>
              <span className="text-[11px] text-[#A8A196]">{activeSMS.timestamp}</span>
            </div>

            <p className="text-xs text-[#EBE5DA] leading-relaxed line-clamp-3">
              {activeSMS.message}
            </p>

            <div className="mt-2.5 flex items-center gap-2">
              <button
                id="btn-sms-view-notifications"
                onClick={() => {
                  dismissSMS();
                  setNotificationDrawerOpen(true);
                }}
                className="text-[11px] font-medium text-[#C85A32] hover:text-[#E27D56] hover:underline cursor-pointer"
              >
                Open Notification Center &rarr;
              </button>
              <span className="text-[#34626B] text-xs">•</span>
              <button
                id="btn-sms-dismiss"
                onClick={dismissSMS}
                className="text-[11px] text-[#A8A196] hover:text-white cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>

          <button
            id="btn-sms-close-icon"
            onClick={dismissSMS}
            className="text-[#888] hover:text-white p-1 rounded-md transition-colors cursor-pointer"
            aria-label="Close SMS banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
