'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X, ShieldAlert } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export interface ConfirmState {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  tone?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  confirm: (options: Omit<ConfirmState, 'isOpen'>) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Global event bus listener for non-React contexts
type ToastListener = (toast: Omit<ToastItem, 'id'>) => void;
type ConfirmListener = (options: Omit<ConfirmState, 'isOpen'>) => void;

let globalToastListener: ToastListener | null = null;
let globalConfirmListener: ConfirmListener | null = null;

export const toast = {
  show: (message: string, type: ToastType = 'info', title?: string, duration?: number) => {
    if (globalToastListener) {
      globalToastListener({ message, type, title, duration });
    }
  },
  success: (message: string, title?: string) => {
    toast.show(message, 'success', title);
  },
  error: (message: string, title?: string) => {
    toast.show(message, 'error', title, 6000);
  },
  warning: (message: string, title?: string) => {
    toast.show(message, 'warning', title, 6000);
  },
  info: (message: string, title?: string) => {
    toast.show(message, 'info', title);
  },
  confirm: (options: Omit<ConfirmState, 'isOpen'>) => {
    if (globalConfirmListener) {
      globalConfirmListener(options);
    }
  },
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmModal, setConfirmModal] = useState<ConfirmState | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const showToast = (message: string, type: ToastType = 'info', title?: string, duration?: number) => {
    const id = Math.random().toString(36).substring(2, 9);
    const item: ToastItem = {
      id,
      type,
      title,
      message,
      duration: duration || (type === 'error' || type === 'warning' ? 5500 : 4000),
    };
    setToasts(prev => [item, ...prev.slice(0, 4)]);
  };

  const confirm = (options: Omit<ConfirmState, 'isOpen'>) => {
    setConfirmModal({
      ...options,
      isOpen: true,
    });
  };

  const success = (message: string, title?: string) => showToast(message, 'success', title);
  const error = (message: string, title?: string) => showToast(message, 'error', title);
  const warning = (message: string, title?: string) => showToast(message, 'warning', title);
  const info = (message: string, title?: string) => showToast(message, 'info', title);

  useEffect(() => {
    globalToastListener = ({ message, type, title, duration }) => {
      showToast(message, type, title, duration);
    };
    globalConfirmListener = options => {
      confirm(options);
    };

    return () => {
      globalToastListener = null;
      globalConfirmListener = null;
    };
  }, []);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        confirm,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none px-4">
        <AnimatePresence>
          {toasts.map(t => (
            <ToastSingleItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal && confirmModal.isOpen && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-[#1B2340]/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-[#FFFFFF] border border-[#E2E4EA] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-[#1E2128]"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                    confirmModal.tone === 'danger'
                      ? 'bg-[#F3DBCF] text-[#A6432B]'
                      : confirmModal.tone === 'warning'
                      ? 'bg-[#F2DFAE] text-[#1B2340]'
                      : 'bg-[#1B2340] text-[#C08829]'
                  }`}
                >
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif font-semibold text-base text-[#1E2128]">
                    {confirmModal.title || 'Confirmation Required'}
                  </h3>
                  <p className="text-xs text-[#6B7078] leading-relaxed whitespace-pre-line">
                    {confirmModal.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#ECEDF1]">
                <button
                  type="button"
                  disabled={confirmLoading}
                  onClick={() => {
                    if (confirmModal.onCancel) confirmModal.onCancel();
                    setConfirmModal(null);
                  }}
                  className="px-4 py-2 bg-[#F1F2F5] hover:bg-[#E2E4EA] text-[#6B7078] font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  {confirmModal.cancelText || 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={confirmLoading}
                  onClick={async () => {
                    setConfirmLoading(true);
                    try {
                      await confirmModal.onConfirm();
                    } finally {
                      setConfirmLoading(false);
                      setConfirmModal(null);
                    }
                  }}
                  className={`px-4 py-2 font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer ${
                    confirmModal.tone === 'danger'
                      ? 'bg-[#A6432B] hover:bg-[#853420] text-white'
                      : confirmModal.tone === 'warning'
                      ? 'bg-[#C08829] hover:bg-[#9C6B1A] text-[#1B2340]'
                      : 'bg-[#1B2340] hover:bg-[#242E52] text-[#F4EFE3]'
                  }`}
                >
                  {confirmLoading ? 'Processing...' : confirmModal.confirmText || 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};

const ToastSingleItem: React.FC<{ toast: ToastItem; onClose: () => void }> = ({ toast: item, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, item.duration || 4000);
    return () => clearTimeout(timer);
  }, [item, onClose]);

  const config = {
    success: {
      border: 'border-l-4 border-l-emerald-600 border-slate-200',
      iconBg: 'bg-emerald-50 text-emerald-700',
      icon: CheckCircle2,
      badge: 'Success',
      progressBg: 'bg-emerald-600',
    },
    error: {
      border: 'border-l-4 border-l-rose-600 border-slate-200',
      iconBg: 'bg-rose-50 text-rose-700',
      icon: AlertCircle,
      badge: 'Notice',
      progressBg: 'bg-rose-600',
    },
    warning: {
      border: 'border-l-4 border-l-amber-500 border-slate-200',
      iconBg: 'bg-amber-50 text-amber-700',
      icon: AlertTriangle,
      badge: 'Warning',
      progressBg: 'bg-amber-500',
    },
    info: {
      border: 'border-l-4 border-l-teal-600 border-slate-200',
      iconBg: 'bg-teal-50 text-teal-700',
      icon: Info,
      badge: 'Info',
      progressBg: 'bg-teal-600',
    },
  }[item.type];

  const IconComp = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`pointer-events-auto w-full bg-white ${config.border} rounded-xl p-4 shadow-xl border relative overflow-hidden flex items-start gap-3.5 text-slate-900 font-sans`}
    >
      <div className={`w-8 h-8 rounded-lg ${config.iconBg} flex items-center justify-center shrink-0 mt-0.5 shadow-xs`}>
        <IconComp className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0 pr-4">
        {item.title && (
          <h4 className="font-bold text-xs text-slate-900 mb-0.5 tracking-tight">
            {item.title}
          </h4>
        )}
        <p className="text-xs text-slate-600 leading-snug break-words">
          {item.message}
        </p>
      </div>

      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-800 transition-colors p-1 rounded-md cursor-pointer shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Subtle Progress Bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: (item.duration || 4000) / 1000, ease: 'linear' }}
        className={`absolute bottom-0 left-0 right-0 h-0.5 origin-left ${config.progressBg}`}
      />
    </motion.div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
