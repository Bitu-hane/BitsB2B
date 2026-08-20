import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { UserRole } from '../types';
import {
  X,
  Phone,
  ShieldCheck,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  KeyRound,
  UserCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, loginWithPhoneOtp, allUsers, switchUser } = useMarketplace();

  // Registration step
  // 1: Phone input -> 2: OTP verification -> 3: Business details & role
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState('+251 91 ');
  const [generatedOtp, setGeneratedOtp] = useState<string>('749210');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  const [businessName, setBusinessName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('wholesaler');
  const [isSellerAccount, setIsSellerAccount] = useState(false);

  if (!authModalOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 8) return;
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    setStep(2);
    setOtpError('');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.trim() === generatedOtp || enteredOtp === '123456' || enteredOtp.length === 6) {
      setStep(3);
      setOtpError('');
    } else {
      setOtpError('Invalid OTP code. Please enter the 6-digit SMS code.');
    }
  };

  const handleCompleteRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;

    loginWithPhoneOtp(phone, businessName, selectedRole, isSellerAccount);
    setAuthModalOpen(false);
    // Reset state
    setStep(1);
    setBusinessName('');
    setEnteredOtp('');
  };

  const ROLES: { key: UserRole; title: string; desc: string }[] = [
    { key: 'importer', title: 'Importer', desc: 'Direct sourcing of international equipment & parts' },
    { key: 'producer', title: 'Producer / Factory', desc: 'Local manufacturer supplying bulk output' },
    { key: 'wholesaler', title: 'Wholesaler / Distributor', desc: 'Regional supply distributor with inventory' },
    { key: 'reseller', title: 'Reseller / Retailer', desc: 'Commercial merchant purchasing for resale' },
    { key: 'institutional buyer', title: 'Institutional Buyer', desc: 'Enterprises, agro-processing, NGOs, & fleets' },
  ];

  return (
    <AnimatePresence>
      <div
        id="auth-modal-backdrop"
        className="fixed inset-0 z-50 bg-[#0B1718]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        onClick={() => setAuthModalOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onClick={e => e.stopPropagation()}
          className="bg-[#FFFFFF] text-[#162C30] rounded-2xl max-w-lg w-full shadow-2xl border border-[#E5DFD5] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#112225] text-[#F7F4EE] p-5 relative border-b border-[#274B52]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#C85A32] flex items-center justify-center text-white font-bold text-sm">
                  NT
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight text-[#F7F4EE]">
                    B2B Business Registration &amp; Login
                  </h2>
                  <p className="text-xs text-[#A8A196]">
                    Trade verified marketplace for Ethiopia &amp; East Africa
                  </p>
                </div>
              </div>
              <button
                id="btn-close-auth-modal"
                onClick={() => setAuthModalOpen(false)}
                className="text-[#888] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper indicator */}
            <div className="mt-4 flex items-center justify-between text-xs text-[#A8A196]">
              <span className={`flex items-center gap-1 ${step >= 1 ? 'text-[#E27D56] font-semibold' : ''}`}>
                1. Phone Number
              </span>
              <span>&rarr;</span>
              <span className={`flex items-center gap-1 ${step >= 2 ? 'text-[#E27D56] font-semibold' : ''}`}>
                2. OTP Verification
              </span>
              <span>&rarr;</span>
              <span className={`flex items-center gap-1 ${step >= 3 ? 'text-[#E27D56] font-semibold' : ''}`}>
                3. Business &amp; Role
              </span>
            </div>
          </div>

          <div className="p-6">
            {/* Step 1: Phone Entry */}
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#112225] mb-1">
                    Business Representative Mobile Phone (Telebirr Enabled)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#888]">
                      <Phone className="w-4 h-4 text-[#C85A32]" />
                    </div>
                    <input
                      id="input-auth-phone"
                      type="text"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+251 91 123 4567"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-sm font-medium text-[#112225] focus:outline-none focus:border-[#C85A32]"
                    />
                  </div>
                  <p className="text-[11px] text-[#6E685F] mt-1.5">
                    We will dispatch a secure 6-digit OTP code to verify your Ethiopian telecom number.
                  </p>
                </div>

                <button
                  type="submit"
                  id="btn-auth-send-otp"
                  className="w-full py-2.5 bg-[#C85A32] hover:bg-[#A34320] text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 bg-[#FEF3C7] border border-[#FCD34D] rounded-xl text-xs text-[#92400E]">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <Sparkles className="w-4 h-4 text-[#D97706]" /> Simulated SMS Code Received:
                  </div>
                  <div className="flex items-center justify-between">
                    <span>
                      OTP for <strong>{phone}</strong>:
                    </span>
                    <button
                      type="button"
                      onClick={() => setEnteredOtp(generatedOtp)}
                      className="font-mono text-sm font-bold bg-white px-2 py-0.5 rounded border border-[#F59E0B] text-[#B45309] hover:bg-[#FFFBEB] cursor-pointer"
                    >
                      {generatedOtp} <span className="text-[10px] font-normal underline">(Auto-fill)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#112225] mb-1">
                    Enter 6-Digit Verification Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#888]">
                      <KeyRound className="w-4 h-4 text-[#C85A32]" />
                    </div>
                    <input
                      id="input-auth-otp"
                      type="text"
                      maxLength={6}
                      required
                      value={enteredOtp}
                      onChange={e => setEnteredOtp(e.target.value)}
                      placeholder="e.g. 749210"
                      className="w-full pl-9 pr-3 py-2.5 font-mono tracking-widest text-base bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-[#112225] focus:outline-none focus:border-[#C85A32]"
                    />
                  </div>
                  {otpError && <p className="text-xs text-[#C85A32] mt-1">{otpError}</p>}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[#6E685F] hover:underline cursor-pointer"
                  >
                    &larr; Change Phone Number
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                      setGeneratedOtp(newCode);
                    }}
                    className="text-[#C85A32] font-medium hover:underline cursor-pointer"
                  >
                    Resend Code
                  </button>
                </div>

                <button
                  type="submit"
                  id="btn-auth-verify-otp"
                  className="w-full py-2.5 bg-[#C85A32] hover:bg-[#A34320] text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Verify Code &amp; Proceed</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Step 3: Business Name & Role Selection */}
            {step === 3 && (
              <form onSubmit={handleCompleteRegistration} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#112225] mb-1">
                    Registered Business / Enterprise Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#888]">
                      <Building2 className="w-4 h-4 text-[#C85A32]" />
                    </div>
                    <input
                      id="input-auth-business-name"
                      type="text"
                      required
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                      placeholder="e.g. Abyssinia Logistics & Trading PLC"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-sm font-medium text-[#112225] focus:outline-none focus:border-[#C85A32]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#112225] mb-1.5">
                    Select Your Business Sourcing Role *
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {ROLES.map(role => (
                      <label
                        key={role.key}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                          selectedRole === role.key
                            ? 'bg-[#F7F4EE] border-[#C85A32]'
                            : 'bg-white border-[#E5DFD5] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="business_role"
                          checked={selectedRole === role.key}
                          onChange={() => setSelectedRole(role.key)}
                          className="mt-0.5 accent-[#C85A32]"
                        />
                        <div className="flex-1 text-xs">
                          <div className="font-semibold text-[#112225]">{role.title}</div>
                          <div className="text-[11px] text-[#6E685F]">{role.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Seller Account Checkbox */}
                <div className="p-3 bg-[#F7F4EE] border border-[#E5DFD5] rounded-xl">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#112225] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSellerAccount}
                      onChange={e => setIsSellerAccount(e.target.checked)}
                      className="accent-[#C85A32]"
                    />
                    <span>Enable Seller Publishing Capabilities (Supplier Mode)</span>
                  </label>
                  <p className="text-[11px] text-[#6E685F] mt-1 pl-5">
                    Allows listing wholesale catalog, managing stock, and accepting escrow orders.
                  </p>
                </div>

                <button
                  type="submit"
                  id="btn-auth-finish-registration"
                  className="w-full py-2.5 bg-[#C85A32] hover:bg-[#A34320] text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create Account &amp; Log In</span>
                </button>
              </form>
            )}

            {/* Quick Demo Logins */}
            <div className="mt-6 pt-5 border-t border-[#EFEAE0]">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#888] mb-2 flex items-center justify-between">
                <span>Fast 1-Click Test Personas</span>
                <span className="text-[10px] text-[#C85A32]">Pre-configured</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allUsers.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    id={`btn-fast-login-${u.id}`}
                    onClick={() => {
                      switchUser(u.id);
                      setAuthModalOpen(false);
                    }}
                    className="p-2.5 rounded-xl border border-[#D8CFBF] hover:border-[#C85A32] bg-[#FBF9F5] hover:bg-[#F3EFE6] text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#112225]">{u.name}</span>
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-[#EBE5DA] text-[#6E685F] capitalize">
                        {u.isSeller ? 'Seller' : 'Buyer'}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6E685F] truncate">{u.business.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
