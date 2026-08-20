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
        return <Package className="w-4 h-4 text-[#C85A32]" />;
      case 'inquiry_received':
      case 'inquiry_answered':
        return <MessageSquare className="w-4 h-4 text-[#C85A32]" />;
      case 'escrow_held':
      case 'escrow_released':
        return <ShieldCheck className="w-4 h-4 text-[#D97706]" />;
      default:
        return <Bell className="w-4 h-4 text-[#C85A32]" />;
    }
  };

  return (
    <AnimatePresence>
      <div
        id="notification-drawer-backdrop"
        className="fixed inset-0 z-50 bg-[#0B1718]/70 backdrop-blur-xs flex justify-end"
        onClick={() => setNotificationDrawerOpen(false)}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          onClick={e => e.stopPropagation()}
          className="bg-white text-[#162C30] w-full max-w-md h-full shadow-2xl border-l border-[#E5DFD5] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 bg-[#112225] text-[#F7F4EE] flex items-center justify-between border-b border-[#274B52] shrink-0">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#C85A32]" />
              <div>
                <h2 className="font-bold text-sm text-[#F7F4EE]">
                  Notifications &amp; Dispatch Alerts
                </h2>
                <p className="text-[11px] text-[#A8A196]">
                  Real-time trade events &bull; SMS mirror logs
                </p>
              </div>
            </div>
            <button
              onClick={() => setNotificationDrawerOpen(false)}
              className="text-[#888] hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="p-4 overflow-y-auto flex-1 space-y-3 divide-y divide-[#EFEAE0]">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#888] space-y-2">
                <Bell className="w-8 h-8 mx-auto text-[#CCC]" />
                <p>No notifications yet.</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`pt-3 first:pt-0 p-3 rounded-xl transition-colors cursor-pointer ${
                    !notif.read ? 'bg-[#FAF7F2] border border-[#E5DFD5]' : 'hover:bg-[#FBF9F5]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white border border-[#D8CFBF] shrink-0 shadow-2xs mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-[#112225]">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-[#888]">{notif.timestamp}</span>
                      </div>
                      <p className="text-xs text-[#6E685F] mt-1 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* SMS Mirror Badge if applicable */}
                      {notif.smsDispatched && (
                        <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[#92400E] bg-[#FEF3C7] border border-[#FCD34D] px-2 py-0.5 rounded-full">
                          <Smartphone className="w-3 h-3" />
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
          <div className="p-4 bg-[#FAF7F2] border-t border-[#E5DFD5] flex items-center justify-between text-xs shrink-0">
            <button
              onClick={() => {
                setNotificationDrawerOpen(false);
                setViewingView('orders');
              }}
              className="text-[#C85A32] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Orders &rarr;</span>
            </button>
            <button
              onClick={() => {
                setNotificationDrawerOpen(false);
                setViewingView('inquiries');
              }}
              className="text-[#112225] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Inquiries &rarr;</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
