import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  Sparkles,
  ArrowRight,
  AlertCircle,
  KeyRound,
  ShieldAlert,
  Compass,
  UserPlus,
  LogIn,
  FileText,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { UserAvatar } from '../common/UserAvatar';

export const LoginView: React.FC = () => {
  const { login, registerCustomer, resetPassword, preferredPortalType, setPreferredPortalType, users } = useAuth();
  const { addCustomer, setActiveTab, companySettings } = useData();

  // Mode tabs: 'customer' | 'admin'
  const [portalType, setPortalType] = useState<'customer' | 'admin'>(preferredPortalType || 'customer');

  // Customer sub-mode: 'login' | 'register'
  const [customerMode, setCustomerMode] = useState<'login' | 'register'>('login');

  // Login Form States
  const [identifier, setIdentifier] = useState(
    preferredPortalType === 'admin' ? 'kmztravels1987@gmail.com' : 'm.ali@gmail.com'
  );
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password Modal States
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState<'request' | 'email_sent' | 'set_new_password'>('request');
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetUserAccount, setResetUserAccount] = useState<{ name: string; email: string; role: string } | null>(null);
  const [resetToken, setResetToken] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Sync state if preferredPortalType changes
  React.useEffect(() => {
    if (preferredPortalType === 'admin') {
      setPortalType('admin');
      setIdentifier('kmztravels1987@gmail.com');
      setPassword('');
    }
  }, [preferredPortalType]);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassport, setRegPassport] = useState('');
  const [regCnic, setRegCnic] = useState('');
  const [regCity, setRegCity] = useState('Faisalabad');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // UI Feedback
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const res = await login(identifier, password);
      if (!res.success) {
        setError(res.error || 'Authentication failed. Please verify credentials.');
        setIsSubmitting(false);
      } else {
        if (portalType === 'admin') {
          setActiveTab('dashboard');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error.');
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!regName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!regPhone.trim() || regPhone.replace(/[^0-9]/g, '').length < 10) {
      setError('Please provide a valid mobile phone number (at least 10 digits).');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please check and retype.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create Customer record in DataContext
      const newCust = addCustomer({
        fullName: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        phone: regPhone.trim(),
        whatsapp: regPhone.trim().replace(/[^0-9]/g, ''),
        passportNumber: regPassport.trim().toUpperCase() || `PK-${Math.floor(1000000 + Math.random() * 9000000)}`,
        passportExpiry: '2031-12-31',
        cnic: regCnic.trim() || '35202-0000000-0',
        city: regCity.trim() || 'Faisalabad',
        country: 'Pakistan',
        emergencyContact: `${regName.trim()} Family (${regPhone.trim()})`,
        customerType: 'Umrah',
        notes: 'Self-registered Pilgrim Account',
      });

      // 2. Register user account in AuthContext linked to new customerId
      const regRes = await registerCustomer({
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        phone: regPhone.trim(),
        passportNumber: regPassport.trim().toUpperCase(),
        cnic: regCnic.trim(),
        city: regCity.trim(),
        password: regPassword,
        customerId: newCust.id,
      });

      if (!regRes.success) {
        setError(regRes.error || 'Registration failed.');
        setIsSubmitting(false);
      } else {
        setSuccessMsg('Account registered successfully! Logging you into Pilgrim Portal...');
      }
    } catch (err: any) {
      setError(err?.message || 'Registration error.');
      setIsSubmitting(false);
    }
  };

  const handleOpenForgotPassword = () => {
    setResetIdentifier(identifier || (portalType === 'admin' ? 'kmztravels1987@gmail.com' : ''));
    setResetStep('request');
    setResetError(null);
    setResetSuccess(null);
    setResetUserAccount(null);
    setResetToken('');
    setResetNewPassword('');
    setResetConfirmPassword('');
    setShowResetModal(true);
  };

  const handleSendResetEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    const cleanId = resetIdentifier.trim().toLowerCase();
    if (!cleanId) {
      setResetError('Please enter your registered Email address or Phone number.');
      return;
    }

    // Search user in system
    const userMatch = users.find((u) => {
      const emailMatch =
        u.email.toLowerCase() === cleanId ||
        (u.id === 'u-1' && (cleanId === 'kmztravels1987@gmail.com' || cleanId === 'admin@kmztravels.com'));
      const phoneClean = (u.phone || '').replace(/[^0-9]/g, '');
      const inputClean = cleanId.replace(/[^0-9]/g, '');
      const phoneMatch = inputClean.length >= 7 && phoneClean.length >= 7 && (phoneClean.endsWith(inputClean) || inputClean.endsWith(phoneClean));
      return emailMatch || phoneMatch;
    });

    if (!userMatch) {
      setResetError('No account found associated with this email or mobile phone number.');
      return;
    }

    setIsResetting(true);
    setTimeout(() => {
      const token = `rst_${Math.random().toString(36).substring(2, 10)}${Date.now()}`;
      setResetToken(token);
      setResetUserAccount({
        name: userMatch.name,
        email: userMatch.email,
        role: userMatch.role === 'super_admin' ? 'Super Admin' : userMatch.role === 'staff' ? 'Staff Member' : 'Customer',
      });
      setResetStep('email_sent');
      setIsResetting(false);
      setResetSuccess(`Secure password reset link generated and sent to ${userMatch.email}`);
    }, 500);
  };

  const handleOpenResetLink = () => {
    setResetError(null);
    setResetSuccess(null);
    setResetStep('set_new_password');
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    if (!resetNewPassword || resetNewPassword.length < 6) {
      setResetError('New password must be at least 6 characters long.');
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('Passwords do not match. Please verify and retype.');
      return;
    }

    setIsResetting(true);
    try {
      const res = await resetPassword(resetIdentifier, resetNewPassword);
      if (!res.success) {
        setResetError(res.error || 'Failed to update password.');
        setIsResetting(false);
      } else {
        setIsResetting(false);
        setResetSuccess('Password reset successfully! Please log in with your new password.');
        setPassword('');
        setIdentifier(resetUserAccount?.email || resetIdentifier);
        setTimeout(() => {
          setShowResetModal(false);
        }, 1200);
      }
    } catch (err: any) {
      setResetError(err?.message || 'Failed to update password.');
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#021812] text-[#f5ecd0] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans selection:bg-[#d4af37] selection:text-[#021812]">
      {/* Background Decorative Royal Lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#047857]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#d4af37]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-3 p-2 px-4 rounded-2xl bg-[#022c22]/90 border border-[#d4af37]/35 shadow-2xl">
            {(portalType === 'customer' && companySettings?.customerPortalLogoUrl) || companySettings?.logoUrl ? (
              <div className="w-10 h-10 rounded-xl bg-[#021812] border border-[#d4af37]/35 p-1 flex items-center justify-center shadow-lg overflow-hidden shrink-0">
                <img
                  src={(portalType === 'customer' && companySettings?.customerPortalLogoUrl) ? companySettings.customerPortalLogoUrl : companySettings?.logoUrl}
                  alt="Brand Logo"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#064e3b] via-[#047857] to-[#d4af37] p-0.5 shadow-md">
                <div className="w-full h-full bg-[#021812] rounded-[10px] flex items-center justify-center font-serif font-black text-[#d4af37] text-lg tracking-widest">
                  KMZ
                </div>
              </div>
            )}
            <div className="text-left">
              <h1 className="text-base font-extrabold font-serif text-[#fdfbf7] tracking-wide">
                {companySettings?.companyName || 'KMZ Travels & Tours (Pvt) Ltd'}
              </h1>
              <p className="text-[10px] text-[#d4af37] font-bold uppercase tracking-widest font-serif">
                Royal Hajj & Umrah Pilgrimage Concierge
              </p>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#fdfbf7] tracking-tight">
            {portalType === 'customer'
              ? customerMode === 'login'
                ? 'Pilgrim Customer Portal Login'
                : 'Register New Pilgrim Account'
              : 'Executive Staff CRM Login'}
          </h2>
          <p className="text-xs text-emerald-200/70 max-w-md mx-auto">
            {portalType === 'customer'
              ? 'Access your personal Umrah & Hajj bookings, hotel vouchers, Nusuk E-visa, flight tickets & payment receipts.'
              : 'Authorized portal for KMZ Travels directors, staff consultants, accounting & operations.'}
          </p>
        </div>

        {/* Portal Type Switcher Tabs - Prominent Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 p-1.5 rounded-2xl bg-[#02241b] border-2 border-[#d4af37]/35 gap-1.5 shadow-xl">
          <button
            type="button"
            onClick={() => {
              setPortalType('customer');
              setPreferredPortalType('customer');
              setError(null);
              setIdentifier('m.ali@gmail.com');
              setPassword('');
            }}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              portalType === 'customer'
                ? 'bg-gradient-to-r from-[#d4af37] via-[#f5ecd0] to-[#c5a059] text-[#022c22] font-black shadow-md shadow-[#d4af37]/30'
                : 'text-emerald-100/80 hover:text-white hover:bg-[#064e3b]/40'
            }`}
          >
            <Compass className={`w-4 h-4 ${portalType === 'customer' ? 'text-[#022c22]' : 'text-[#d4af37]'}`} />
            <span>Customer Login / Register</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPortalType('admin');
              setPreferredPortalType('admin');
              setError(null);
              setIdentifier('kmztravels1987@gmail.com');
              setPassword('');
            }}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              portalType === 'admin'
                ? 'bg-gradient-to-r from-[#d4af37] via-[#f5ecd0] to-[#c5a059] text-[#022c22] font-black shadow-md shadow-[#d4af37]/30'
                : 'text-emerald-100/80 hover:text-white hover:bg-[#064e3b]/40'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${portalType === 'admin' ? 'text-[#022c22]' : 'text-[#d4af37]'}`} />
            <span>Admin Login</span>
          </button>
        </div>

        {/* Main Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#032d22]/95 to-[#021a14]/98 border border-[#d4af37]/35 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Customer Sub-mode Toggle (Sign In vs Register) */}
          {portalType === 'customer' && (
            <div className="flex items-center justify-between pb-4 border-b border-[#064e3b]/60">
              <span className="text-xs font-extrabold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5 font-serif">
                <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                {customerMode === 'login' ? 'Existing Pilgrim Login' : 'New Pilgrim Registration'}
              </span>

              <div className="flex items-center gap-1 bg-[#021812] p-1 rounded-xl border border-[#d4af37]/25 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode('login');
                    setError(null);
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    customerMode === 'login'
                      ? 'bg-[#d4af37]/20 text-[#fdfbf7] border border-[#d4af37]/40'
                      : 'text-emerald-200/60 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode('register');
                    setError(null);
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    customerMode === 'register'
                      ? 'bg-[#d4af37]/20 text-[#fdfbf7] border border-[#d4af37]/40'
                      : 'text-emerald-200/60 hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>
            </div>
          )}

          {/* Admin Identity Banner */}
          {portalType === 'admin' && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#064e3b]/30 via-[#022c22] to-[#021812] border border-[#d4af37]/35 flex items-center gap-3">
              <UserAvatar
                user={users.find((u) => u.id === 'u-1') || { name: companySettings?.ownerName || 'Toheed Asghar Shahid', avatar: companySettings?.superAdminAvatarUrl }}
                className="w-12 h-12 rounded-xl ring-2 ring-[#d4af37]/60"
              />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-extrabold text-[#d4af37] uppercase tracking-widest flex items-center gap-1.5 font-serif">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Executive Admin Account
                </div>
                <div className="text-sm font-extrabold text-[#fdfbf7] truncate">
                  {companySettings?.ownerName || 'Toheed Asghar Shahid'}
                </div>
                <div className="text-[11px] text-emerald-200/70 truncate">
                  Owner & Managing Director • {companySettings?.companyName || 'KMZ Travels Faisalabad'}
                </div>
              </div>
            </div>
          )}

          {/* Alerts */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-shake">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-xs font-semibold flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Customer Login OR Admin Login Form */}
          {(portalType === 'admin' || customerMode === 'login') && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-emerald-100 tracking-wide">
                  Email Address or Mobile Phone Number
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]/80" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      portalType === 'customer'
                        ? 'm.ali@gmail.com or 03015551234'
                        : 'kmztravels1987@gmail.com'
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-[#021f17] border border-[#064e3b] focus:border-[#d4af37] rounded-xl text-xs text-[#fdfbf7] placeholder-emerald-200/40 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/50 transition-all font-mono"
                  />
                </div>
                <span className="text-[10px] text-emerald-200/50 block">
                  You can sign in using your registered Email OR Mobile Number.
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-emerald-100 tracking-wide">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleOpenForgotPassword}
                    className="text-[11px] font-semibold text-[#d4af37] hover:text-[#f3e5ab] hover:underline transition-all cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]/80" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#021f17] border border-[#064e3b] focus:border-[#d4af37] rounded-xl text-xs text-[#fdfbf7] placeholder-emerald-200/40 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/50 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-200/50 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-[#d4af37] via-[#f5ecd0] to-[#c5a059] hover:from-[#f5ecd0] hover:to-[#d4af37] text-[#022c22] font-black text-xs tracking-wider uppercase rounded-xl shadow-lg shadow-[#d4af37]/25 hover:shadow-[#d4af37]/45 transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-4 h-4 text-[#022c22]" />
                <span>
                  {isSubmitting
                    ? 'Authenticating Credentials...'
                    : portalType === 'customer'
                    ? 'Sign In To Pilgrim Portal'
                    : 'Sign In To Staff CRM'}
                </span>
                <ArrowRight className="w-4 h-4 text-[#022c22] group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

          {/* Customer Registration Form */}
          {portalType === 'customer' && customerMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-emerald-100">
                    Full Name (as in Passport) *
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Haji Muhammad Ali"
                    className="w-full px-3 py-2 bg-[#021f17] border border-[#064e3b] focus:border-[#d4af37] rounded-xl text-xs text-[#fdfbf7] placeholder-emerald-200/40 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-emerald-100">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="03001234567 or +92 300 1234567"
                    className="w-full px-3 py-2 bg-[#021f17] border border-[#064e3b] focus:border-[#d4af37] rounded-xl text-xs text-[#fdfbf7] placeholder-emerald-200/40 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-emerald-100">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="pilgrim@gmail.com"
                    className="w-full px-3 py-2 bg-[#021f17] border border-[#064e3b] focus:border-[#d4af37] rounded-xl text-xs text-[#fdfbf7] placeholder-emerald-200/40 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-emerald-100">City</label>
                  <input
                    type="text"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    placeholder="Faisalabad, Lahore, Karachi..."
                    className="w-full px-3 py-2 bg-[#021f17] border border-[#064e3b] focus:border-[#d4af37] rounded-xl text-xs text-[#fdfbf7] placeholder-emerald-200/40 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-emerald-100">
                    Passport Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={regPassport}
                    onChange={(e) => setRegPassport(e.target.value)}
                    placeholder="e.g. PK8812903"
                    className="w-full px-3 py-2 bg-[#021f17] border border-[#064e3b] focus:border-[#d4af37] rounded-xl text-xs text-[#fdfbf7] placeholder-emerald-200/40 focus:outline-none font-mono uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-emerald-100">
                    CNIC Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={regCnic}
                    onChange={(e) => setRegCnic(e.target.value)}
                    placeholder="35202-1234567-1"
                    className="w-full px-3 py-2 bg-[#021f17] border border-[#064e3b] focus:border-[#d4af37] rounded-xl text-xs text-[#fdfbf7] placeholder-emerald-200/40 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-emerald-100">Create Password *</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3 py-2 bg-[#021f17] border border-[#064e3b] focus:border-[#d4af37] rounded-xl text-xs text-[#fdfbf7] placeholder-emerald-200/40 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-emerald-100">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Retype password"
                    className="w-full px-3 py-2 bg-[#021f17] border border-[#064e3b] focus:border-[#d4af37] rounded-xl text-xs text-[#fdfbf7] placeholder-emerald-200/40 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-[#d4af37] via-[#f5ecd0] to-[#c5a059] hover:from-[#f5ecd0] hover:to-[#d4af37] text-[#022c22] font-black text-xs tracking-wider uppercase rounded-xl shadow-lg shadow-[#d4af37]/25 hover:shadow-[#d4af37]/45 transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4 text-[#022c22]" />
                <span>
                  {isSubmitting ? 'Registering Account...' : 'Create Account & Access Pilgrim Portal'}
                </span>
                <ArrowRight className="w-4 h-4 text-[#022c22] group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}
        </div>

        {/* Footer legal note */}
        <div className="text-center text-[11px] text-emerald-200/50 space-y-1">
          <p>© 2026 KMZ Travels & Tours (Pvt) Ltd. All rights reserved.</p>
          <p className="text-[10px] text-emerald-200/40">
            Authorized by Ministry of Religious Affairs (MORA) & Saudi Nusuk Portal License
            DTS/FSD/2024/9912.
          </p>
        </div>
      </div>

      {/* Forgot / Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-gradient-to-b from-[#032d22] to-[#021812] border border-[#d4af37]/35 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 text-left relative text-[#f5ecd0]">
            <div className="flex items-center justify-between border-b border-[#064e3b]/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/35 flex items-center justify-center text-[#d4af37]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#fdfbf7] font-serif">Reset Account Password</h3>
                  <p className="text-[11px] text-emerald-200/60">Secure Password Recovery & Verification</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="text-emerald-200/60 hover:text-white p-1 rounded-lg hover:bg-[#064e3b]/40 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Error & Success Messages */}
            {resetError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/35 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{resetSuccess}</span>
              </div>
            )}

            {resetStep === 'request' && (
              <form onSubmit={handleSendResetEmail} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-emerald-100">
                    Registered Admin / User Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]/80" />
                    <input
                      type="text"
                      required
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      placeholder="e.g. kmztravels1987@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#021f17] border border-[#064e3b] focus:border-[#d4af37] rounded-xl text-xs text-[#fdfbf7] placeholder-emerald-200/40 focus:outline-none font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-emerald-200/60">
                    Enter your registered email address (Admin: <span className="text-[#d4af37] font-mono">kmztravels1987@gmail.com</span>). A secure password reset link will be sent to this email.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-4 py-2 bg-[#064e3b]/40 hover:bg-[#064e3b]/70 text-emerald-100 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="px-5 py-2 bg-gradient-to-r from-[#d4af37] to-[#b89047] text-[#022c22] text-xs font-black rounded-xl hover:from-[#f5ecd0] hover:to-[#d4af37] shadow-md shadow-[#d4af37]/25 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{isResetting ? 'Sending Email...' : 'Send Password Reset Email'}</span>
                  </button>
                </div>
              </form>
            )}

            {resetStep === 'email_sent' && (
              <div className="space-y-4">
                <div className="p-3 bg-[#d4af37]/15 border border-[#d4af37]/35 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#d4af37] font-serif">
                    <Mail className="w-4 h-4" />
                    <span>Password Reset Link Dispatched</span>
                  </div>
                  <p className="text-[11px] text-emerald-100">
                    A secure reset email has been sent to <span className="font-mono text-white font-bold">{resetUserAccount?.email}</span>. Click the link in the message below to open the password creation form.
                  </p>
                </div>

                {/* Simulated Email Preview Card */}
                <div className="bg-[#021812] border border-[#064e3b] rounded-xl p-4 space-y-3 shadow-inner">
                  <div className="border-b border-[#064e3b]/60 pb-2 flex flex-col gap-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-emerald-200/50 font-semibold">From:</span>
                      <span className="text-emerald-100 font-mono">KMZ Security &lt;security@kmztravels.com&gt;</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-200/50 font-semibold">To:</span>
                      <span className="text-[#d4af37] font-mono font-bold">{resetUserAccount?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-200/50 font-semibold">Subject:</span>
                      <span className="text-zinc-200 font-bold">🔐 Reset Password Request - KMZ Travels Admin</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-emerald-100">
                    <p>Dear <strong className="text-white">{resetUserAccount?.name}</strong>,</p>
                    <p className="text-emerald-200/70 text-[11px]">
                      We received a request to reset the password for your KMZ Travels account ({resetUserAccount?.role}). Please click the secure button below to set your new password.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleOpenResetLink}
                      className="w-full py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b89047] hover:from-[#f5ecd0] hover:to-[#d4af37] text-[#022c22] font-black text-xs rounded-xl shadow-md shadow-[#d4af37]/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>🔗 Click Here to Reset Password</span>
                    </button>
                    <p className="text-[10px] text-emerald-200/50 text-center mt-1.5 font-mono">
                      Reset Token: {resetToken}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setResetStep('request')}
                    className="text-xs text-emerald-200/60 hover:text-white cursor-pointer"
                  >
                    ← Resend Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="text-xs text-emerald-200/60 hover:text-white cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {resetStep === 'set_new_password' && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div className="p-2.5 bg-[#021812] border border-[#064e3b] rounded-xl text-xs space-y-1">
                  <span className="text-emerald-200/60 text-[11px]">Setting new password for:</span>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-[#d4af37] font-bold">{resetUserAccount?.email || resetIdentifier}</span>
                    <span className="text-[10px] text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                      Verified Token
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-emerald-100">New Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]/80" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        placeholder="Enter new password (min 6 chars)"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#021f17] border border-[#064e3b] focus:border-[#d4af37] rounded-xl text-xs text-[#fdfbf7] placeholder-emerald-200/40 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-emerald-100">Confirm New Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]/80" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={resetConfirmPassword}
                        onChange={(e) => setResetConfirmPassword(e.target.value)}
                        placeholder="Retype new password"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#021f17] border border-[#064e3b] focus:border-[#d4af37] rounded-xl text-xs text-[#fdfbf7] placeholder-emerald-200/40 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setResetStep('email_sent')}
                    className="text-xs text-emerald-200/60 hover:text-white cursor-pointer"
                  >
                    ← Back to Email
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b89047] text-[#022c22] text-xs font-black rounded-xl hover:from-[#f5ecd0] hover:to-[#d4af37] shadow-md shadow-[#d4af37]/25 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{isResetting ? 'Saving New Password...' : 'Save New Password'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
