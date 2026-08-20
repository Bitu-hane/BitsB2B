import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Building2,
  Phone,
  QrCode,
  ArrowRight,
  Sparkles,
  Smartphone,
  CreditCard,
} from 'lucide-react';
import { PaymentMethod } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export const PaymentEscrowModal: React.FC = () => {
  const {
    paymentModalOpen,
    setPaymentModalOpen,
    pendingPaymentOrder,
    completePaymentEscrow,
    setViewingView,
  } = useMarketplace();

  const [method, setMethod] = useState<PaymentMethod>('telebirr');
  const [telebirrPhone, setTelebirrPhone] = useState('+251 91 234 5678');
  const [telebirrPin, setTelebirrPin] = useState('****');
  const [cbeAccount, setCbeAccount] = useState('1000189283741');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!paymentModalOpen || !pendingPaymentOrder) return null;

  const handleAuthorizePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      completePaymentEscrow(pendingPaymentOrder.id, method);
      setIsProcessing(false);
      setIsSuccess(true);
    }, 1200);
  };

  const handleFinish = () => {
    setPaymentModalOpen(false);
    setIsSuccess(false);
    setViewingView('orders');
  };

  return (
    <AnimatePresence>
      <div
        id="payment-escrow-modal-backdrop"
        className="fixed inset-0 z-50 bg-[#0B1718]/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        onClick={() => {
          if (!isProcessing) setPaymentModalOpen(false);
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onClick={e => e.stopPropagation()}
          className="bg-[#FFFFFF] text-[#162C30] rounded-2xl max-w-lg w-full shadow-2xl border border-[#E5DFD5] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#112225] text-[#F7F4EE] p-5 border-b border-[#274B52] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#C85A32] flex items-center justify-center text-white font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#F7F4EE]">
                  B2B Trade Escrow Gateway
                </h2>
                <p className="text-xs text-[#A8A196]">
                  Order #{pendingPaymentOrder.orderNumber} &bull; Secured by Bank/Telecom Escrow
                </p>
              </div>
            </div>
            {!isProcessing && !isSuccess && (
              <button
                id="btn-close-payment-modal"
                onClick={() => setPaymentModalOpen(false)}
                className="text-[#888] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="p-6">
            {!isSuccess ? (
              <form onSubmit={handleAuthorizePayment} className="space-y-4">
                {/* Amount to Lock */}
                <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5] text-center">
                  <span className="text-[11px] font-semibold text-[#6E685F] uppercase tracking-wider block">
                    Total Amount to Hold in Escrow
                  </span>
                  <div className="text-2xl font-black text-[#C85A32] mt-0.5">
                    {pendingPaymentOrder.totalAmount.toLocaleString()}{' '}
                    <span className="text-sm font-bold text-[#112225]">{pendingPaymentOrder.currency}</span>
                  </div>
                  <div className="text-[11px] text-[#6E685F] mt-1 flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3 text-[#D97706]" />
                    <span>Funds protected until you inspect &amp; confirm physical delivery</span>
                  </div>
                </div>

                {/* Gateway Selector */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod('telebirr')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      method === 'telebirr'
                        ? 'bg-[#F7F4EE] border-[#C85A32] text-[#C85A32] ring-1 ring-[#C85A32]'
                        : 'bg-white border-[#E5DFD5] text-[#112225] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Telebirr B2B</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('cbe_birr')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      method === 'cbe_birr'
                        ? 'bg-[#F7F4EE] border-[#C85A32] text-[#C85A32] ring-1 ring-[#C85A32]'
                        : 'bg-white border-[#E5DFD5] text-[#112225] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>CBE Birr Escrow</span>
                  </button>
                </div>

                {/* Provider Specific Inputs */}
                {method === 'telebirr' ? (
                  <div className="p-4 bg-[#FBF9F5] rounded-xl border border-[#E5DFD5] space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#112225] flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#C85A32]" />
                        Telebirr Wallet Payment
                      </span>
                      <span className="text-[10px] bg-[#EBE5DA] px-2 py-0.5 rounded font-mono font-semibold">
                        Instant USSD / App Push
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#112225] mb-1">
                        Telebirr Registered Phone Number
                      </label>
                      <input
                        type="text"
                        required
                        value={telebirrPhone}
                        onChange={e => setTelebirrPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-lg text-xs font-medium text-[#112225] focus:outline-none focus:border-[#C85A32]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#112225] mb-1">
                        Telebirr PIN / OTP Confirmation
                      </label>
                      <input
                        type="password"
                        required
                        value={telebirrPin}
                        onChange={e => setTelebirrPin(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-lg text-xs font-mono tracking-widest text-[#112225] focus:outline-none focus:border-[#C85A32]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[#FBF9F5] rounded-xl border border-[#E5DFD5] space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#112225] flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#C85A32]" />
                        Commercial Bank of Ethiopia (CBE) Escrow
                      </span>
                      <span className="text-[10px] bg-[#EBE5DA] px-2 py-0.5 rounded font-mono font-semibold">
                        CBE Birr Corporate
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#112225] mb-1">
                        CBE Account / Mobile Number
                      </label>
                      <input
                        type="text"
                        required
                        value={cbeAccount}
                        onChange={e => setCbeAccount(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-lg text-xs font-medium text-[#112225] focus:outline-none focus:border-[#C85A32]"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  id="btn-authorize-escrow-payment"
                  disabled={isProcessing}
                  className="w-full py-3 bg-[#C85A32] hover:bg-[#A34320] text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Securing Funds in {method === 'telebirr' ? 'Telebirr' : 'CBE'} Escrow...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Lock {pendingPaymentOrder.totalAmount.toLocaleString()} ETB in Escrow</span>
                    </span>
                  )}
                </button>
              </form>
            ) : (
              /* Success confirmation */
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#FEF3C7] border border-[#FCD34D] text-[#D97706] flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#112225]">
                    Escrow Deposit Confirmed!
                  </h3>
                  <p className="text-xs text-[#6E685F] mt-1 max-w-sm mx-auto">
                    <strong>{pendingPaymentOrder.totalAmount.toLocaleString()} ETB</strong> has been successfully secured in{' '}
                    <strong>{method === 'telebirr' ? 'Telebirr Escrow' : 'CBE Birr Escrow'}</strong> for Order #{pendingPaymentOrder.orderNumber}.
                  </p>
                </div>

                <div className="p-3 bg-[#F7F4EE] rounded-xl border border-[#E5DFD5] text-xs text-left space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#888]">Escrow Status:</span>
                    <span className="font-bold text-[#92400E]">HELD IN ESCROW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">Next Step:</span>
                    <span className="font-medium text-[#112225]">Seller begins pallet packaging &amp; dispatch</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">SMS Notification:</span>
                    <span className="font-medium text-[#C85A32]">Sent to your mobile device</span>
                  </div>
                </div>

                <button
                  id="btn-finish-payment-view-orders"
                  onClick={handleFinish}
                  className="w-full py-2.5 bg-[#112225] hover:bg-[#1D383D] text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Track Order in My Orders &rarr;</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
