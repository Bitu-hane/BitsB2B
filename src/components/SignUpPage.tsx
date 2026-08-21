import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { AuthHeader } from './AuthHeader';
import {
  User,
  Phone,
  Lock,
  Mail,
  Building2,
  FileText,
  MapPin,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Loader2,
  LogIn,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';
import { motion } from 'motion/react';

const ETHIOPIAN_REGIONS = [
  'Addis Ababa',
  'Oromia',
  'Amhara',
  'Sidama',
  'Dire Dawa',
  'Tigray',
  'Central Ethiopia',
  'South Ethiopia',
  'South West Ethiopia',
  'Harari',
  'Afar',
  'Somali',
  'Benishangul-Gumuz',
  'Gambela',
];

const TRADE_TYPES = [
  { code: 'wholesaler', label: 'Wholesaler / Distributor', desc: 'Regional supply distributor with bulk inventory' },
  { code: 'importer', label: 'Importer', desc: 'Direct sourcing of international equipment & parts' },
  { code: 'producer', label: 'Producer / Factory', desc: 'Local manufacturer supplying bulk output' },
  { code: 'reseller', label: 'Reseller / Retailer', desc: 'Commercial merchant purchasing for resale' },
  { code: 'institutional_buyer', label: 'Institutional Buyer', desc: 'Enterprises, agro-processing, & fleets' },
];

export const SignUpPage: React.FC = () => {
  const { setAuthView, registerWithApi, t } = useMarketplace();

  // Active form section tab (1: Personal, 2: Business, 3: Address)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+2519');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');

  const [businessName, setBusinessName] = useState('');
  const [businessTypeCode, setBusinessTypeCode] = useState('wholesaler');
  const [canBuy, setCanBuy] = useState(true);
  const [canSell, setCanSell] = useState(false);
  const [tinNumber, setTinNumber] = useState('');
  const [tradeLicenseNumber, setTradeLicenseNumber] = useState('');

  const [region, setRegion] = useState('Addis Ababa');
  const [city, setCity] = useState('Addis Ababa');
  const [subcity, setSubcity] = useState('');
  const [kebele, setKebele] = useState('');
  const [landmark, setLandmark] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (activeStep === 1) {
      if (!fullName.trim() || phone.length < 10 || !password) {
        setErrorMessage('Please fill in all required personal identity fields.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage(t('auth.passwordsDoNotMatchError'));
        return;
      }
      setActiveStep(2);
    } else if (activeStep === 2) {
      if (!businessName.trim()) {
        setErrorMessage('Please enter your business / company name.');
        return;
      }
      setActiveStep(3);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!region || !city) {
      setErrorMessage('Please enter your location details.');
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

      const payload = {
        fullName: fullName.trim(),
        phone: cleanPhone,
        password,
        email: email.trim() || undefined,
        businessName: businessName.trim(),
        businessTypeCode,
        canBuy,
        canSell,
        tinNumber: tinNumber.trim() || undefined,
        tradeLicenseNumber: tradeLicenseNumber.trim() || undefined,
        region: region.trim(),
        city: city.trim(),
        subcity: subcity.trim() || undefined,
        kebele: kebele.trim() || undefined,
        landmark: landmark.trim() || undefined,
      };

      const result = await registerWithApi(payload);

      if (!result.success) {
        setErrorMessage(result.error || 'Registration failed.');
      }
    } catch (err: any) {
      setErrorMessage('Failed to connect to database API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#162C30] flex flex-col font-sans selection:bg-[#C85A32]/20 selection:text-[#112225]">
      {/* 1. Header with Top Language Switcher */}
      <AuthHeader />

      {/* 2. Main Sign Up Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-2xl bg-[#FFFFFF] rounded-2xl border border-[#E5DFD5] shadow-2xl overflow-hidden"
        >
          {/* Card Header Banner */}
          <div className="bg-[#112225] text-[#F7F4EE] p-6 border-b border-[#274B52] relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-black tracking-tight text-[#F7F4EE] flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#E27D56]" />
                  {t('auth.signUpTitle')}
                </h1>
                <p className="text-xs text-[#A8A196] mt-1">
                  {t('auth.signUpSubtitle')}
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-[#0B1718] p-1 rounded-xl border border-[#274B52] self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeStep === 1 ? 'bg-[#C85A32] text-white' : 'text-[#A8A196]'
                  }`}
                >
                  {t('auth.step1Title')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeStep === 2 ? 'bg-[#C85A32] text-white' : 'text-[#A8A196]'
                  }`}
                >
                  {t('auth.step2Title')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeStep === 3 ? 'bg-[#C85A32] text-white' : 'text-[#A8A196]'
                  }`}
                >
                  {t('auth.step3Title')}
                </button>
              </div>
            </div>
          </div>

          {/* Form Area */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Error Message Alert */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-800 text-xs shadow-sm"
              >
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <span className="font-bold">{errorMessage}</span>
              </motion.div>
            )}

            {/* Step 1: Personal Identity */}
            {activeStep === 1 && (
              <form onSubmit={handleNextStep} className="space-y-4">
                <div className="border-b border-[#F0EBE1] pb-3 mb-2">
                  <h3 className="text-sm font-black text-[#112225] flex items-center gap-2">
                    <User className="w-4 h-4 text-[#C85A32]" />
                    {t('auth.step1Title')}
                  </h3>
                  <p className="text-xs text-[#6E685F]">Enter legal representative details</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#112225] uppercase tracking-wider mb-1.5">
                    {t('auth.fullNameLabel')} *
                  </label>
                  <input
                    id="input-signup-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder={t('auth.fullNamePlaceholder')}
                    className="w-full px-3.5 py-2.5 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-sm font-medium text-[#112225] focus:outline-none focus:border-[#C85A32]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#112225] uppercase tracking-wider mb-1.5">
                      {t('auth.phoneLabel')} *
                    </label>
                    <input
                      id="input-signup-phone"
                      type="text"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder={t('auth.phonePlaceholder')}
                      className="w-full px-3.5 py-2.5 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-sm font-medium text-[#112225] focus:outline-none focus:border-[#C85A32]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#112225] uppercase tracking-wider mb-1.5">
                      {t('auth.emailLabel')}
                    </label>
                    <input
                      id="input-signup-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={t('auth.emailPlaceholder')}
                      className="w-full px-3.5 py-2.5 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-sm font-medium text-[#112225] focus:outline-none focus:border-[#C85A32]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#112225] uppercase tracking-wider mb-1.5">
                      {t('auth.passwordLabel')} *
                    </label>
                    <input
                      id="input-signup-password"
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={t('auth.passwordPlaceholder')}
                      className="w-full px-3.5 py-2.5 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-sm font-medium text-[#112225] focus:outline-none focus:border-[#C85A32]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#112225] uppercase tracking-wider mb-1.5">
                      {t('auth.confirmPasswordLabel')} *
                    </label>
                    <input
                      id="input-signup-confirmpassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder={t('auth.confirmPasswordPlaceholder')}
                      className="w-full px-3.5 py-2.5 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-sm font-medium text-[#112225] focus:outline-none focus:border-[#C85A32]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-3 px-4 bg-[#112225] hover:bg-[#1A3337] text-[#F7F4EE] font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Continue to Business Info</span>
                  <ArrowRight className="w-4 h-4 text-[#E27D56]" />
                </button>
              </form>
            )}

            {/* Step 2: Business Info */}
            {activeStep === 2 && (
              <form onSubmit={handleNextStep} className="space-y-4">
                <div className="border-b border-[#F0EBE1] pb-3 mb-2">
                  <h3 className="text-sm font-black text-[#112225] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#C85A32]" />
                    {t('auth.step2Title')}
                  </h3>
                  <p className="text-xs text-[#6E685F]">Enter legal company &amp; commercial trade details</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#112225] uppercase tracking-wider mb-1.5">
                    {t('auth.businessNameLabel')} *
                  </label>
                  <input
                    id="input-signup-businessname"
                    type="text"
                    required
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    placeholder={t('auth.businessNamePlaceholder')}
                    className="w-full px-3.5 py-2.5 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-sm font-medium text-[#112225] focus:outline-none focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#112225] uppercase tracking-wider mb-1.5">
                    {t('auth.businessTypeLabel')} *
                  </label>
                  <select
                    id="select-signup-businesstype"
                    value={businessTypeCode}
                    onChange={e => setBusinessTypeCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-sm font-medium text-[#112225] focus:outline-none focus:border-[#C85A32]"
                  >
                    {TRADE_TYPES.map(t => (
                      <option key={t.code} value={t.code}>
                        {t.label} ({t.desc})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Capabilities check */}
                <div>
                  <label className="block text-xs font-bold text-[#112225] uppercase tracking-wider mb-2">
                    {t('auth.businessCapabilitiesLabel')}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-[#D8CFBF] bg-[#F7F4EE] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={canBuy}
                        onChange={e => setCanBuy(e.target.checked)}
                        className="w-4 h-4 accent-[#C85A32]"
                      />
                      <span className="text-xs font-bold text-[#112225]">
                        {t('auth.canBuyLabel')}
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-[#D8CFBF] bg-[#F7F4EE] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={canSell}
                        onChange={e => setCanSell(e.target.checked)}
                        className="w-4 h-4 accent-[#C85A32]"
                      />
                      <span className="text-xs font-bold text-[#112225]">
                        {t('auth.canSellLabel')}
                      </span>
                    </label>
                  </div>
                </div>

                {/* TIN and Trade License */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#112225] uppercase tracking-wider mb-1.5">
                      {t('auth.tinLabel')}
                    </label>
                    <input
                      id="input-signup-tin"
                      type="text"
                      value={tinNumber}
                      onChange={e => setTinNumber(e.target.value)}
                      placeholder={t('auth.tinPlaceholder')}
                      className="w-full px-3.5 py-2.5 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-sm font-medium text-[#112225] focus:outline-none focus:border-[#C85A32]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#112225] uppercase tracking-wider mb-1.5">
                      {t('auth.tradeLicenseLabel')}
                    </label>
                    <input
                      id="input-signup-tradelicense"
                      type="text"
                      value={tradeLicenseNumber}
                      onChange={e => setTradeLicenseNumber(e.target.value)}
                      placeholder={t('auth.tradeLicensePlaceholder')}
                      className="w-full px-3.5 py-2.5 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-sm font-medium text-[#112225] focus:outline-none focus:border-[#C85A32]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-xl"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-[#112225] hover:bg-[#1A3337] text-[#F7F4EE] font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Continue to Address</span>
                    <ArrowRight className="w-4 h-4 text-[#E27D56]" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Location & Address */}
            {activeStep === 3 && (
              <form onSubmit={handleFinalSubmit} className="space-y-4">
                <div className="border-b border-[#F0EBE1] pb-3 mb-2">
                  <h3 className="text-sm font-black text-[#112225] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#C85A32]" />
                    {t('auth.step3Title')}
                  </h3>
                  <p className="text-xs text-[#6E685F]">Enter headquarters address &amp; delivery location</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#112225] uppercase tracking-wider mb-1.5">
                      {t('auth.regionLabel')} *
                    </label>
                    <select
                      id="select-signup-region"
                      value={region}
                      onChange={e => setRegion(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-sm font-medium text-[#112225] focus:outline-none focus:border-[#C85A32]"
                    >
                      {ETHIOPIAN_REGIONS.map(r => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#112225] uppercase tracking-wider mb-1.5">
                      {t('auth.cityLabel')} *
                    </label>
                    <input
                      id="input-signup-city"
                      type="text"
                      required
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder={t('auth.cityPlaceholder')}
                      className="w-full px-3.5 py-2.5 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-sm font-medium text-[#112225] focus:outline-none focus:border-[#C85A32]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#112225] uppercase tracking-wider mb-1.5">
                      {t('auth.subcityLabel')}
                    </label>
                    <input
                      id="input-signup-subcity"
                      type="text"
                      value={subcity}
                      onChange={e => setSubcity(e.target.value)}
                      placeholder={t('auth.subcityPlaceholder')}
                      className="w-full px-3.5 py-2.5 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-sm font-medium text-[#112225] focus:outline-none focus:border-[#C85A32]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#112225] uppercase tracking-wider mb-1.5">
                      {t('auth.kebeleLabel')}
                    </label>
                    <input
                      id="input-signup-kebele"
                      type="text"
                      value={kebele}
                      onChange={e => setKebele(e.target.value)}
                      placeholder={t('auth.kebelePlaceholder')}
                      className="w-full px-3.5 py-2.5 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-sm font-medium text-[#112225] focus:outline-none focus:border-[#C85A32]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#112225] uppercase tracking-wider mb-1.5">
                    {t('auth.landmarkLabel')}
                  </label>
                  <input
                    id="input-signup-landmark"
                    type="text"
                    value={landmark}
                    onChange={e => setLandmark(e.target.value)}
                    placeholder={t('auth.landmarkPlaceholder')}
                    className="w-full px-3.5 py-2.5 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-sm font-medium text-[#112225] focus:outline-none focus:border-[#C85A32]"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-xl"
                  >
                    Back
                  </button>
                  <button
                    id="btn-submit-signup"
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3.5 px-4 bg-gradient-to-r from-[#C85A32] to-[#E27D56] hover:from-[#B54E28] hover:to-[#D46E47] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#C85A32]/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving to PostgreSQL Database...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Create Business Account</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Bottom Sign In Link Box */}
          <div className="bg-[#F7F4EE] p-4 text-center border-t border-[#E5DFD5]">
            <p className="text-xs text-[#6E685F] mb-2 font-medium">
              {t('auth.alreadyHaveAccount')}
            </p>
            <button
              id="btn-goto-login"
              type="button"
              onClick={() => setAuthView('login')}
              className="w-full py-2.5 px-4 bg-[#112225] hover:bg-[#1A3337] text-[#F7F4EE] font-bold text-xs rounded-xl border border-[#274B52] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-[#E27D56]" />
              <span>{t('auth.signInNow')}</span>
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
