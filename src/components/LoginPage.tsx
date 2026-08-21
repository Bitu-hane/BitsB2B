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
} from 'lucide-react';
import { motion } from 'motion/react';

export const LoginPage: React.FC = () => {
  const { setAuthView, loginWithApi, t } = useMarketplace();

  const [phone, setPhone] = useState('+251911223344');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen bg-[#FBF9F5] text-[#162C30] flex flex-col font-sans selection:bg-[#C85A32]/20 selection:text-[#112225]">
      {/* 1. Header with Top Language Switcher */}
      <AuthHeader />

      {/* 2. Main Login Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-md bg-[#FFFFFF] rounded-2xl border border-[#E5DFD5] shadow-2xl overflow-hidden"
        >
          {/* Card Header Banner */}
          <div className="bg-[#112225] text-[#F7F4EE] p-6 text-center border-b border-[#274B52] relative overflow-hidden">
            <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-28 h-28 bg-[#C85A32]/10 rounded-full blur-xl pointer-events-none" />
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-[#C85A32] to-[#E27D56] text-white shadow-lg shadow-[#C85A32]/30 mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-[#F7F4EE]">
              {t('auth.loginTitle')}
            </h1>
            <p className="text-xs text-[#A8A196] mt-1">
              {t('auth.loginSubtitle')}
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8 space-y-5">
            {/* Database User Existence Error Banner */}
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
                    Check your phone number formatting or click Sign Up below to create a new account.
                  </span>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone Field */}
              <div>
                <label className="block text-xs font-bold text-[#112225] uppercase tracking-wider mb-1.5">
                  {t('auth.phoneLabel')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#888]">
                    <Phone className="w-4 h-4 text-[#C85A32]" />
                  </div>
                  <input
                    id="input-login-phone"
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder={t('auth.phonePlaceholder')}
                    className="w-full pl-10 pr-3.5 py-3 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-sm font-medium text-[#112225] focus:outline-none focus:border-[#C85A32] focus:ring-2 focus:ring-[#C85A32]/20 transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-bold text-[#112225] uppercase tracking-wider mb-1.5">
                  {t('auth.passwordLabel')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#888]">
                    <Lock className="w-4 h-4 text-[#C85A32]" />
                  </div>
                  <input
                    id="input-login-password"
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    className="w-full pl-10 pr-3.5 py-3 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-sm font-medium text-[#112225] focus:outline-none focus:border-[#C85A32] focus:ring-2 focus:ring-[#C85A32]/20 transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="btn-submit-login"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#C85A32] to-[#E27D56] hover:from-[#B54E28] hover:to-[#D46E47] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#C85A32]/30 hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Checking Database...</span>
                  </>
                ) : (
                  <>
                    <span>{t('auth.login')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Value Proposition Pills */}
            <div className="pt-2 flex items-center justify-around border-t border-[#F0EBE1] text-[11px] text-[#6E685F]">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C85A32]" /> Verified Trade
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Escrow Protected
              </span>
            </div>
          </div>

          {/* Bottom Sign Up Navigation Box */}
          <div className="bg-[#F7F4EE] p-4 text-center border-t border-[#E5DFD5]">
            <p className="text-xs text-[#6E685F] mb-2 font-medium">
              {t('auth.dontHaveAccount')}
            </p>
            <button
              id="btn-goto-signup"
              type="button"
              onClick={() => setAuthView('signup')}
              className="w-full py-2.5 px-4 bg-[#112225] hover:bg-[#1A3337] text-[#F7F4EE] font-bold text-xs rounded-xl border border-[#274B52] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-[#E27D56]" />
              <span>{t('auth.signUpNow')}</span>
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
