'use client';

import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { AuthHeader } from './AuthHeader';
import {
  Phone,
  Lock,
  ArrowRight,
  AlertCircle,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  UserPlus,
  Eye,
  EyeOff,
} from 'lucide-react';
import { motion } from 'motion/react';

export const LoginPage: React.FC = () => {
  const { setAuthView, loginWithApi, t } = useMarketplace();

  const [phone, setPhone] = useState('+251911223344');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!phone.trim() || !password) {
      setErrorMessage(t('auth.invalidCredentialsError'));
      return;
    }

    setLoading(true);
    try {
      let cleanPhone = phone.replace(/\s+/g, '');
      if (cleanPhone.startsWith('09')) {
        cleanPhone = '+251' + cleanPhone.slice(1);
      } else if (cleanPhone.startsWith('9')) {
        cleanPhone = '+251' + cleanPhone;
      }

      const result = await loginWithApi(cleanPhone, password);
      if (!result.success) {
        setErrorMessage(result.error || t('auth.userDoesNotExistError'));
      }
    } catch (err: any) {
      setErrorMessage(t('auth.userDoesNotExistError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#162C30] flex flex-col font-sans selection:bg-[#C08829]/20 selection:text-[#112225]">
      {/* 1. Header with Top Language Switcher */}
      <AuthHeader />

      {/* 2. Main Login Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-md bg-white rounded-[18px] border border-[#E2E4EA] shadow-xl overflow-hidden"
        >
          {/* Card Header Banner (Ledger Navy Theme matching catalog header & footer) */}
          <div className="bg-[#1B2340] text-[#F4EFE3] p-6 text-center border-b border-[#2B3558] relative overflow-hidden">
            <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-28 h-28 bg-[#C08829]/10 rounded-full blur-xl pointer-events-none" />
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#C08829]/20 border border-[#C08829]/30 text-[#E2B159] shadow-md shadow-[#C08829]/10 mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="font-serif font-bold text-xl tracking-tight text-[#F4EFE3]">
              {t('auth.loginTitle')}
            </h1>
            <p className="text-xs text-[#A7AECB] mt-1">
              {t('auth.loginSubtitle')}
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8 space-y-5">
            {/* User Account Error Banner */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-800 text-xs shadow-sm"
              >
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">{errorMessage}</span>
                  <span className="text-[11px] text-red-600 block">
                    Double check your phone number or click Sign Up below to create a new account.
                  </span>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone Field */}
              <div>
                <label className="block text-xs font-bold text-[#1E2128] uppercase tracking-wider mb-1.5">
                  {t('auth.phoneLabel')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#888]">
                    <Phone className="w-4 h-4 text-[#C08829]" />
                  </div>
                  <input
                    id="input-login-phone"
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder={t('auth.phonePlaceholder')}
                    className="w-full pl-10 pr-3.5 py-3 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-sm font-medium text-[#1E2128] focus:outline-none focus:border-[#C08829] focus:ring-2 focus:ring-[#C08829]/20 transition-all"
                  />
                </div>
              </div>

              {/* Password Field with Eye Toggle */}
              <div>
                <label className="block text-xs font-bold text-[#1E2128] uppercase tracking-wider mb-1.5">
                  {t('auth.passwordLabel')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#888]">
                    <Lock className="w-4 h-4 text-[#C08829]" />
                  </div>
                  <input
                    id="input-login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    className="w-full pl-10 pr-11 py-3 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-sm font-medium text-[#1E2128] focus:outline-none focus:border-[#C08829] focus:ring-2 focus:ring-[#C08829]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#888] hover:text-[#1B2340] cursor-pointer transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="btn-submit-login"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-[#1B2340] hover:bg-[#2A3760] text-[#F4EFE3] font-bold text-sm rounded-xl shadow-md shadow-[#1B2340]/20 hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#C08829]" />
                    <span>Verifying Account &amp; Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>{t('auth.login')}</span>
                    <ArrowRight className="w-4 h-4 text-[#C08829]" />
                  </>
                )}
              </button>
            </form>

            {/* Value Proposition Pills */}
            <div className="pt-2 flex items-center justify-around border-t border-[#E2E4EA] text-[11px] text-[#6B7078]">
              <span className="flex items-center gap-1 font-semibold text-[#1E2128]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C08829]" /> Verified Trade
              </span>
              <span className="flex items-center gap-1 font-semibold text-[#1E2128]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#33553A]" /> Escrow Protected
              </span>
            </div>
          </div>

          {/* Bottom Sign Up Navigation Box */}
          <div className="bg-[#F1F2F5] p-4 text-center border-t border-[#E2E4EA]">
            <p className="text-xs text-[#6B7078] mb-2 font-medium">
              {t('auth.dontHaveAccount')}
            </p>
            <button
              id="btn-goto-signup"
              type="button"
              onClick={() => setAuthView('signup')}
              className="w-full py-2.5 px-4 bg-[#C08829] hover:bg-[#A97520] text-[#1B2340] font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('auth.signUpNow')}</span>
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
