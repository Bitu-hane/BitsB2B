'use client';
import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  X,
  Bell,
  CheckCircle2,
  Package,
  MessageSquare,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const NotificationDrawer: React.FC = () => {
  const {
    notificationDrawerOpen,
    setNotificationDrawerOpen,
    notifications,
    markNotificationRead,
    setViewingView,
  } = useMarketplace();

  if (!notificationDrawerOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'order_placed':
      case 'order_confirmed':
      case 'order_shipped':
      case 'order_delivered':
        return <Package className="w-4 h-4 text-teal-600" />;
      case 'inquiry_received':
      case 'inquiry_answered':
        return <MessageSquare className="w-4 h-4 text-teal-600" />;
      case 'escrow_held':
      case 'escrow_released':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-teal-600" />;
    }
  };

  return (
    <AnimatePresence>
      <div
        id="notification-drawer-backdrop"
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end"
        onClick={() => setNotificationDrawerOpen(false)}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          onClick={e => e.stopPropagation()}
          className="bg-slate-50 text-slate-900 w-full max-w-md h-full shadow-2xl border-l border-slate-200 flex flex-col"
        >
          {/* Header */}
          <div className="p-5 bg-[#1E293B] text-white flex items-center justify-between border-b border-slate-700 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-white">
                  Notifications &amp; Dispatch Alerts
                </h2>
                <p className="text-[11px] text-slate-300">
                  Real-time trade events &bull; Verified SMS dispatches
                </p>
              </div>
            </div>
            <button
              onClick={() => setNotificationDrawerOpen(false)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="p-4 overflow-y-auto flex-1 space-y-3 divide-y divide-slate-200">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 space-y-2">
                <Bell className="w-8 h-8 mx-auto text-slate-300" />
                <p>No notifications yet.</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`pt-3 first:pt-0 p-3 rounded-xl transition-colors cursor-pointer ${
                    !notif.read ? 'bg-white border border-slate-200 shadow-xs' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 shrink-0 shadow-xs mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-500">{notif.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* SMS Mirror Badge if applicable */}
                      {notif.smsDispatched && (
                        <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          <Smartphone className="w-3 h-3 text-emerald-600" />
                          <span>SMS Dispatched to User Mobile</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer view shortcuts */}
          <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
            <button
              onClick={() => {
                setNotificationDrawerOpen(false);
                setViewingView('orders');
              }}
              className="text-teal-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Orders &rarr;</span>
            </button>
            <button
              onClick={() => {
                setNotificationDrawerOpen(false);
                setViewingView('inquiries');
              }}
              className="text-slate-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Inquiries &rarr;</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
