import React, { useState, useRef, useEffect } from 'react';
import {
  Settings,
  Building2,
  CreditCard,
  Users,
  ShieldCheck,
  Save,
  RotateCcw,
  CheckCircle2,
  Camera,
  Trash2,
  Upload,
  User as UserIcon,
  AlertCircle,
  Mail,
  Phone as PhoneIcon,
  Briefcase,
  Sparkles,
  Globe,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { UserAvatar } from '../common/UserAvatar';
import { DEFAULT_FALLBACK_IMAGE } from '../../types';
import { processAndCompressImage } from '../../lib/imageUtils';

export const SettingsView: React.FC = () => {
  const { currentUser, users, updateUser, resetUsers } = useAuth();
  const { resetDemoData, companySettings, updateCompanySettings, uploadBrandingImage } = useData();

  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'portal' | 'gateways' | 'users'>('profile');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savedSuccessText, setSavedSuccessText] = useState('Settings updated successfully!');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Current User Profile Fields
  const [userName, setUserName] = useState(currentUser.name);
  const [userEmail, setUserEmail] = useState(currentUser.email);
  const [userPhone, setUserPhone] = useState(currentUser.phone || '');
  const [userDesignation, setUserDesignation] = useState(currentUser.designation || '');

  // File Input Refs for Uploads
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const staffFileInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const portalLogoInputRef = useRef<HTMLInputElement | null>(null);
  const portalBannerInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedStaffForAvatar, setSelectedStaffForAvatar] = useState<string | null>(null);

  // Pending files for Logo and Banner
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [pendingBannerFile, setPendingBannerFile] = useState<File | null>(null);
  const [pendingPortalLogoFile, setPendingPortalLogoFile] = useState<File | null>(null);
  const [pendingPortalBannerFile, setPendingPortalBannerFile] = useState<File | null>(null);

  // Company Settings Form State
  const [companyName, setCompanyName] = useState(companySettings?.companyName || 'KMZ Travels & Tours (Pvt) Ltd');
  const [ownerName, setOwnerName] = useState(companySettings?.ownerName || 'Toheed Asghar Shahid');
  const [address, setAddress] = useState(companySettings?.address || 'P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad');
  const [whatsapp, setWhatsapp] = useState(companySettings?.whatsappNumber || '03018647596');
  const [phone, setPhone] = useState(companySettings?.phone || '03147861122');
  const [ntnNumber, setNtnNumber] = useState(companySettings?.ntnNumber || 'NTN-7492018-9');
  const [dtsLicense, setDtsLicense] = useState(companySettings?.dtsLicense || 'DTS/FSD/2024/9912');
  const [logoUrl, setLogoUrl] = useState(companySettings?.logoUrl || '');
  const [dashboardBannerUrl, setDashboardBannerUrl] = useState(companySettings?.dashboardBannerUrl || '');
  const [portalLogoUrl, setPortalLogoUrl] = useState(companySettings?.customerPortalLogoUrl || '');
  const [portalBannerUrl, setPortalBannerUrl] = useState(companySettings?.customerPortalBannerUrl || '');

  // Sync state when companySettings loads from database
  useEffect(() => {
    if (companySettings) {
      setCompanyName(companySettings.companyName || 'KMZ Travels & Tours (Pvt) Ltd');
      setOwnerName(companySettings.ownerName || 'Toheed Asghar Shahid');
      setAddress(companySettings.address || 'P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad');
      setWhatsapp(companySettings.whatsappNumber || '03018647596');
      setPhone(companySettings.phone || '03147861122');
      setNtnNumber(companySettings.ntnNumber || 'NTN-7492018-9');
      setDtsLicense(companySettings.dtsLicense || 'DTS/FSD/2024/9912');
      if (!pendingLogoFile) setLogoUrl(companySettings.logoUrl || '');
      if (!pendingBannerFile) setDashboardBannerUrl(companySettings.dashboardBannerUrl || '');
      if (!pendingPortalLogoFile) setPortalLogoUrl(companySettings.customerPortalLogoUrl || '');
      if (!pendingPortalBannerFile) setPortalBannerUrl(companySettings.customerPortalBannerUrl || '');
    }
  }, [companySettings]);

  // Customer Portal Logo file selection handler (Live Preview)
  const handlePortalLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setErrorMessage('Invalid format. Please select a JPG, JPEG, PNG, or WebP file.');
        return;
      }
      setErrorMessage(null);
      setPendingPortalLogoFile(file);
      setPortalLogoUrl(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  // Customer Portal Cover/Banner file selection handler (Live Preview)
  const handlePortalBannerFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setErrorMessage('Invalid format. Please select a JPG, JPEG, PNG, or WebP file.');
        return;
      }
      setErrorMessage(null);
      setPendingPortalBannerFile(file);
      setPortalBannerUrl(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  // Payment Gateways
  const [meezanMerchantId, setMeezanMerchantId] = useState('MEEZAN-KMZ-88912');
  const [meezanApiKey, setMeezanApiKey] = useState('mzn_live_sk_991823719238129312');
  const [hblMerchantId, setHblMerchantId] = useState('HBL-PAY-FSD-4410');
  const [jazzcashMerchantId, setJazzcashMerchantId] = useState('MC-JAZZ-KMZ-03018647596');
  const [easypaisaMerchantId, setEasypaisaMerchantId] = useState('EP-KMZ-77182');

  // Logo file selection handler (Live Preview)
  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setErrorMessage('Invalid format. Please select a JPG, JPEG, PNG, or WebP file.');
        return;
      }
      setErrorMessage(null);
      setPendingLogoFile(file);
      setLogoUrl(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  // Banner file selection handler (Live Preview)
  const handleBannerFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setErrorMessage('Invalid format. Please select a JPG, JPEG, PNG, or WebP file.');
        return;
      }
      setErrorMessage(null);
      setPendingBannerFile(file);
      setDashboardBannerUrl(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  // Image Upload Validation & Processing for User Avatars
  const processImageFile = (file: File, onSuccess: (dataUrl: string) => void) => {
    setErrorMessage(null);
    processAndCompressImage(
      file,
      (dataUrl) => {
        onSuccess(dataUrl);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      },
      (errorMsg) => {
        setErrorMessage(errorMsg);
      }
    );
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsSubmitting(true);
      setErrorMessage(null);
      try {
        const permanentUrl = await uploadBrandingImage(file, 'admin_avatar');
        updateUser({
          ...currentUser,
          avatar: permanentUrl,
        });

        if (currentUser.id === 'u-1' || currentUser.role === 'super_admin') {
          await updateCompanySettings({
            ...companySettings,
            superAdminAvatarUrl: permanentUrl,
          });
        }
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } catch (err: any) {
        console.error('Error uploading avatar:', err);
        setErrorMessage(err.message || 'Failed to upload profile photo.');
      } finally {
        setIsSubmitting(false);
      }
    }
    e.target.value = '';
  };

  const handleRemoveAvatar = async () => {
    updateUser({
      ...currentUser,
      avatar: undefined,
    });

    if (currentUser.id === 'u-1' || currentUser.role === 'super_admin') {
      await updateCompanySettings({
        ...companySettings,
        superAdminAvatarUrl: '',
      });
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleStaffAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedStaffForAvatar) {
      const targetUser = users.find((u) => u.id === selectedStaffForAvatar);
      if (targetUser) {
        setIsSubmitting(true);
        setErrorMessage(null);
        try {
          const permanentUrl = await uploadBrandingImage(file, 'admin_avatar');
          updateUser({
            ...targetUser,
            avatar: permanentUrl,
          });
          setSavedSuccess(true);
          setTimeout(() => setSavedSuccess(false), 3000);
        } catch (err: any) {
          console.error('Error uploading staff photo:', err);
          setErrorMessage(err.message || 'Failed to upload staff photo.');
        } finally {
          setIsSubmitting(false);
        }
      }
    }
    e.target.value = '';
    setSelectedStaffForAvatar(null);
  };

  const handleRemoveStaffAvatar = (staffId: string) => {
    const targetUser = users.find((u) => u.id === staffId);
    if (targetUser) {
      updateUser({
        ...targetUser,
        avatar: undefined,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      ...currentUser,
      name: userName,
      email: userEmail,
      phone: userPhone,
      designation: userDesignation,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Save System Settings & Upload Logo / Banner to Storage & DB
  const handleSaveSystemSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let finalLogoUrl = logoUrl;
      let finalBannerUrl = dashboardBannerUrl;

      // 1. Upload Logo if new file selected
      if (pendingLogoFile) {
        finalLogoUrl = await uploadBrandingImage(pendingLogoFile, 'logo');
        setPendingLogoFile(null);
        setLogoUrl(finalLogoUrl);
      }

      // 2. Upload Banner if new file selected
      if (pendingBannerFile) {
        finalBannerUrl = await uploadBrandingImage(pendingBannerFile, 'banner');
        setPendingBannerFile(null);
        setDashboardBannerUrl(finalBannerUrl);
      }

      // 3. Save permanent Storage URLs to Database
      await updateCompanySettings({
        ...companySettings,
        companyName,
        ownerName,
        address,
        whatsappNumber: whatsapp,
        phone,
        ntnNumber,
        dtsLicense,
        logoUrl: finalLogoUrl,
        dashboardBannerUrl: finalBannerUrl,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      console.error('Error saving branding/settings:', err);
      setErrorMessage(err.message || 'Failed to upload image or save settings to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Individual handler: Save Customer Portal Logo to Storage & Database
  const handleSavePortalLogo = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let finalLogoUrl = portalLogoUrl;
      if (pendingPortalLogoFile) {
        finalLogoUrl = await uploadBrandingImage(pendingPortalLogoFile, 'portal_logo');
        setPendingPortalLogoFile(null);
        setPortalLogoUrl(finalLogoUrl);
      }

      await updateCompanySettings({
        ...companySettings,
        customerPortalLogoUrl: finalLogoUrl,
      });

      setSavedSuccessText('Customer Portal Logo saved permanently to database!');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      console.error('Error saving Customer Portal Logo:', err);
      setErrorMessage(err.message || 'Failed to upload or save Customer Portal Logo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Individual handler: Remove Customer Portal Logo
  const handleRemovePortalLogo = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      setPortalLogoUrl('');
      setPendingPortalLogoFile(null);

      await updateCompanySettings({
        ...companySettings,
        customerPortalLogoUrl: '',
      });

      setSavedSuccessText('Customer Portal Logo removed. Default system logo will be used.');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      console.error('Error removing Customer Portal Logo:', err);
      setErrorMessage(err.message || 'Failed to remove Customer Portal Logo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Individual handler: Save Customer Portal Cover/Banner to Storage & Database
  const handleSavePortalBanner = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let finalBannerUrl = portalBannerUrl;
      if (pendingPortalBannerFile) {
        finalBannerUrl = await uploadBrandingImage(pendingPortalBannerFile, 'portal_banner');
        setPendingPortalBannerFile(null);
        setPortalBannerUrl(finalBannerUrl);
      }

      await updateCompanySettings({
        ...companySettings,
        customerPortalBannerUrl: finalBannerUrl,
      });

      setSavedSuccessText('Customer Portal Cover/Banner saved permanently to database!');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      console.error('Error saving Customer Portal Banner:', err);
      setErrorMessage(err.message || 'Failed to upload or save Customer Portal Banner.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Individual handler: Remove Customer Portal Cover/Banner
  const handleRemovePortalBanner = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      setPortalBannerUrl('');
      setPendingPortalBannerFile(null);

      await updateCompanySettings({
        ...companySettings,
        customerPortalBannerUrl: '',
      });

      setSavedSuccessText('Customer Portal Cover/Banner removed. Default backdrop will be used.');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      console.error('Error removing Customer Portal Banner:', err);
      setErrorMessage(err.message || 'Failed to remove Customer Portal Banner.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save Customer Portal Branding Images (Logo & Cover Banner) to Storage & DB
  const handleSavePortalSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let finalLogoUrl = portalLogoUrl;
      let finalBannerUrl = portalBannerUrl;

      // 1. Upload Customer Portal Logo if new file selected
      if (pendingPortalLogoFile) {
        finalLogoUrl = await uploadBrandingImage(pendingPortalLogoFile, 'portal_logo');
        setPendingPortalLogoFile(null);
        setPortalLogoUrl(finalLogoUrl);
      }

      // 2. Upload Customer Portal Banner if new file selected
      if (pendingPortalBannerFile) {
        finalBannerUrl = await uploadBrandingImage(pendingPortalBannerFile, 'portal_banner');
        setPendingPortalBannerFile(null);
        setPortalBannerUrl(finalBannerUrl);
      }

      // 3. Save permanent Storage URLs to Database
      await updateCompanySettings({
        ...companySettings,
        customerPortalLogoUrl: finalLogoUrl,
        customerPortalBannerUrl: finalBannerUrl,
      });

      setSavedSuccessText('Customer Portal Branding saved permanently to database!');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      console.error('Error saving Customer Portal branding:', err);
      setErrorMessage(err.message || 'Failed to upload image or save Customer Portal branding to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reload entire demo dataset? This will reset all sample records.')) {
      resetDemoData();
      resetUsers();
      alert('CRM Data successfully reset to fresh demo dataset!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-400" />
            CRM System Settings & Admin Profile
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your Admin profile photo, company details, payment gateway integrations, and staff permissions.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-4 py-2 bg-zinc-950 border border-amber-500/30 text-amber-300 hover:text-amber-400 hover:bg-amber-500/10 rounded-xl text-xs font-bold transition-all"
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
          <span>Reload Demo Dataset</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 gap-2 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold transition-all shrink-0 ${
            activeTab === 'profile'
              ? 'border-amber-400 text-amber-300 bg-zinc-900/60'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <UserIcon className="w-4 h-4" /> Admin Profile & Avatar
        </button>
        <button
          onClick={() => setActiveTab('company')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold transition-all shrink-0 ${
            activeTab === 'company'
              ? 'border-amber-400 text-amber-300 bg-zinc-900/60'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Building2 className="w-4 h-4" /> Company Profile
        </button>
        <button
          onClick={() => setActiveTab('portal')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold transition-all shrink-0 ${
            activeTab === 'portal'
              ? 'border-amber-400 text-amber-300 bg-zinc-900/60'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" /> Customer Portal Branding
        </button>
        <button
          onClick={() => setActiveTab('gateways')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold transition-all shrink-0 ${
            activeTab === 'gateways'
              ? 'border-amber-400 text-amber-300 bg-zinc-900/60'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Payment Gateways
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold transition-all shrink-0 ${
            activeTab === 'users'
              ? 'border-amber-400 text-amber-300 bg-zinc-900/60'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Users className="w-4 h-4" /> Staff & Permissions
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {savedSuccessText}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          {errorMessage}
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileChange}
        accept="image/jpeg,image/png,image/jpg,image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={staffFileInputRef}
        onChange={handleStaffAvatarChange}
        accept="image/jpeg,image/png,image/jpg,image/webp"
        className="hidden"
      />

      {/* Profile & Avatar Tab */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar Upload Card */}
          <div className="p-6 bg-zinc-900/90 rounded-2xl border border-amber-500/20 flex flex-col items-center text-center space-y-4">
            <h3 className="text-sm font-bold text-amber-400 font-serif uppercase tracking-wider">
              Profile Photo
            </h3>

            <div className="relative group">
              <UserAvatar user={currentUser} className="w-32 h-32 rounded-2xl ring-4 ring-amber-400/50 shadow-2xl" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-1"
              >
                <Camera className="w-6 h-6 text-amber-400" />
                <span>Change Photo</span>
              </button>
            </div>

            <div className="space-y-1">
              <div className="font-extrabold text-white text-base">{currentUser.name}</div>
              <div className="text-xs text-amber-400 font-mono uppercase">{(currentUser?.role || 'admin').replace('_', ' ')}</div>
              <div className="text-[11px] text-zinc-400">{currentUser.designation || 'KMZ Executive'}</div>
            </div>

            <div className="flex flex-col w-full gap-2 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" /> Upload New Photo
              </button>

              {currentUser.avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="w-full py-2 bg-zinc-950 border border-rose-500/30 hover:border-rose-500 text-rose-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Photo
                </button>
              )}
            </div>

            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-[10px] text-zinc-400 text-left space-y-1 w-full">
              <div className="font-bold text-amber-300">File Validation Rules:</div>
              <div>• Formats: JPG, JPEG, PNG, WebP</div>
              <div>• Maximum File Size: 5 MB</div>
              <div>• Auto-displays in Header, Sidebar, and Dashboard</div>
            </div>
          </div>

          {/* Edit Profile Info Form */}
          <div className="lg:col-span-2 p-6 bg-zinc-900/90 rounded-2xl border border-amber-500/20 space-y-5">
            <h3 className="text-sm font-bold text-amber-400 font-serif flex items-center gap-2">
              <UserIcon className="w-4 h-4" /> Edit Account Details
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] font-bold mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] font-bold mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] font-bold mb-1">
                    Phone / Contact
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                    <input
                      type="text"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] font-bold mb-1">
                    Designation / Title
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                    <input
                      type="text"
                      value={userDesignation}
                      onChange={(e) => setUserDesignation(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">System Access Role</div>
                  <div className="text-[10px] text-zinc-400 uppercase font-mono">
                    {currentUser.role}
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase border border-emerald-500/30">
                  Full Authorization
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Profile Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Company Profile Tab */}
      {activeTab === 'company' && (
        <form onSubmit={handleSaveSystemSettings} className="space-y-6">
          <div className="p-6 bg-zinc-900/90 rounded-2xl border border-amber-500/20 space-y-4">
            <h3 className="text-sm font-bold text-amber-400 font-serif flex items-center gap-2">
              <Building2 className="w-4 h-4" /> KMZ Travels Official Business Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-zinc-400 uppercase text-[10px] font-bold mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] font-bold mb-1">
                  Owner & Managing Director
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-amber-300 font-bold"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] font-bold mb-1">
                  Official WhatsApp Number
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-emerald-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] font-bold mb-1">
                  Landline / Direct Contact
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-400 uppercase text-[10px] font-bold mb-1">
                  Faisalabad Office Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] font-bold mb-1">
                  Tax Registration NTN
                </label>
                <input
                  type="text"
                  value={ntnNumber}
                  onChange={(e) => setNtnNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] font-bold mb-1">
                  DTS License Registration
                </label>
                <input
                  type="text"
                  value={dtsLicense}
                  onChange={(e) => setDtsLicense(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-300 font-mono"
                />
              </div>

              {/* Company Logo File Upload */}
              <div className="sm:col-span-2 pt-2 space-y-2 border-t border-zinc-800">
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoFileSelect}
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="hidden"
                />
                <label className="block text-zinc-300 font-bold text-xs flex items-center justify-between">
                  <span>Official Company Logo / Branding Badge</span>
                  <span className="text-[10px] text-amber-400">Max size 5MB (JPG, PNG, WebP)</span>
                </label>

                {logoUrl ? (
                  <div className="flex items-center gap-4 p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <img
                      src={logoUrl}
                      alt="Company Logo"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="w-16 h-16 object-contain bg-zinc-900 rounded-lg p-1 border border-zinc-800"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="px-3 py-1.5 bg-amber-500 text-zinc-950 text-xs font-bold rounded-lg flex items-center gap-1"
                      >
                        <Camera className="w-3.5 h-3.5" /> Replace Logo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLogoUrl('');
                          setPendingLogoFile(null);
                        }}
                        className="px-3 py-1.5 bg-rose-600/20 text-rose-400 border border-rose-500/30 text-xs font-bold rounded-lg flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full p-4 border-2 border-dashed border-zinc-700 hover:border-amber-400/60 rounded-xl bg-zinc-950 flex flex-col items-center justify-center text-xs text-zinc-400 gap-1"
                  >
                    <Upload className="w-5 h-5 text-amber-400" />
                    <span>Upload Official Company Logo</span>
                  </button>
                )}
              </div>

              {/* Dashboard Operations Banner Photo Upload */}
              <div className="sm:col-span-2 pt-2 space-y-2">
                <input
                  type="file"
                  ref={bannerInputRef}
                  onChange={handleBannerFileSelect}
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="hidden"
                />
                <label className="block text-zinc-300 font-bold text-xs flex items-center justify-between">
                  <span>Dashboard Cover & Operations Banner Image</span>
                  <span className="text-[10px] text-amber-400">Max size 5MB (JPG, PNG, WebP)</span>
                </label>

                {dashboardBannerUrl ? (
                  <div className="relative group rounded-xl overflow-hidden h-28 bg-zinc-950 border border-zinc-800">
                    <img
                      src={dashboardBannerUrl}
                      alt="Dashboard Banner"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => bannerInputRef.current?.click()}
                        className="px-3 py-1.5 bg-amber-500 text-zinc-950 font-extrabold text-xs rounded-lg flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" /> Replace Banner
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDashboardBannerUrl('');
                          setPendingBannerFile(null);
                        }}
                        className="px-3 py-1.5 bg-rose-600 text-white font-extrabold text-xs rounded-lg flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    className="w-full p-4 border-2 border-dashed border-zinc-700 hover:border-amber-400/60 rounded-xl bg-zinc-950 flex flex-col items-center justify-center text-xs text-zinc-400 gap-1"
                  >
                    <Upload className="w-5 h-5 text-amber-400" />
                    <span>Upload Dashboard Banner Image</span>
                  </button>
                )}
              </div>

              {/* Customer Portal Branding Quick Link Box */}
              <div className="sm:col-span-2 p-4 bg-gradient-to-r from-emerald-950/40 via-zinc-950 to-amber-950/30 rounded-xl border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Customer Portal Branding Controls</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Looking to change the Pilgrim Customer Portal Logo and Cover Banner? Manage them with direct preview and upload controls.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('portal')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-extrabold rounded-xl shrink-0 flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Configure Portal Branding</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-zinc-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> {isSubmitting ? 'Uploading & Saving...' : 'Save Business Profile'}
            </button>
          </div>
        </form>
      )}

      {/* Customer Portal Settings Tab */}
      {activeTab === 'portal' && (
        <form onSubmit={handleSavePortalSettings} className="space-y-6">
          <div className="p-6 bg-zinc-900/90 rounded-2xl border border-amber-500/20 space-y-6">
            <div>
              <h3 className="text-base font-bold text-amber-400 font-serif flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Customer Portal Branding Image Management
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Customize the official Logo and Cover/Banner images displayed on the Pilgrim Customer Portal. Changes saved here are uploaded to Supabase Storage and stored permanently in the database.
              </p>
            </div>

            {/* 1. Customer Portal Logo Section */}
            <div className="p-6 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Upload className="w-4 h-4 text-amber-400" />
                    1. Customer Portal Logo
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Official logo displayed in the Pilgrim Portal welcome header and brand navigation bar. (Supported formats: JPG, JPEG, PNG, WebP)
                  </p>
                </div>
                {portalLogoUrl && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 w-fit">
                    Active Custom Logo
                  </span>
                )}
              </div>

              <input
                type="file"
                ref={portalLogoInputRef}
                onChange={handlePortalLogoFileSelect}
                accept="image/jpeg,image/png,image/jpg,image/webp"
                className="hidden"
                id="customer-portal-logo-input"
              />

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 bg-zinc-900/80 rounded-xl border border-zinc-800">
                {/* Current Image Preview */}
                <div className="w-32 h-24 bg-zinc-950 rounded-xl border border-zinc-800 p-2 flex items-center justify-center shrink-0 overflow-hidden relative shadow-inner">
                  {portalLogoUrl ? (
                    <img
                      src={portalLogoUrl}
                      alt="Customer Portal Logo Preview"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-zinc-600 text-xs font-medium">
                      Default Logo
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Upload / Change Logo button */}
                    <button
                      type="button"
                      id="upload-change-portal-logo-btn"
                      onClick={() => portalLogoInputRef.current?.click()}
                      className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-extrabold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>{portalLogoUrl ? 'Upload / Change Logo' : 'Upload / Change Logo'}</span>
                    </button>

                    {/* Save Logo button */}
                    <button
                      type="button"
                      id="save-portal-logo-btn"
                      onClick={handleSavePortalLogo}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Saving...' : 'Save Logo'}</span>
                    </button>

                    {/* Remove Logo button */}
                    {portalLogoUrl && (
                      <button
                        type="button"
                        id="remove-portal-logo-btn"
                        onClick={handleRemovePortalLogo}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-extrabold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Remove Logo</span>
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-zinc-400 font-medium">
                    {pendingPortalLogoFile ? (
                      <span className="text-amber-300 font-semibold">
                        Previewing selected file: {pendingPortalLogoFile.name} — Click "Save Logo" to upload to Supabase Storage and persist to database.
                      </span>
                    ) : portalLogoUrl ? (
                      'Saved logo URL active on Customer Portal.'
                    ) : (
                      'No custom logo uploaded. Customer Portal displays default system logo.'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Customer Portal Cover/Banner Section */}
            <div className="p-6 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-400" />
                    2. Customer Portal Cover / Banner
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    High-definition cover banner rendered in the Customer Portal welcome header background. (Supported formats: JPG, JPEG, PNG, WebP)
                  </p>
                </div>
                {portalBannerUrl && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 w-fit">
                    Active Custom Banner
                  </span>
                )}
              </div>

              <input
                type="file"
                ref={portalBannerInputRef}
                onChange={handlePortalBannerFileSelect}
                accept="image/jpeg,image/png,image/jpg,image/webp"
                className="hidden"
                id="customer-portal-banner-input"
              />

              <div className="space-y-4 p-4 bg-zinc-900/80 rounded-xl border border-zinc-800">
                {/* Current Image Preview */}
                <div className="w-full h-44 bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden relative flex items-center justify-center shadow-inner">
                  {portalBannerUrl ? (
                    <img
                      src={portalBannerUrl}
                      alt="Customer Portal Cover Banner Preview"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-zinc-600 text-xs font-medium">
                      Default Customer Portal Cover Banner
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Upload / Change Banner button */}
                    <button
                      type="button"
                      id="upload-change-portal-banner-btn"
                      onClick={() => portalBannerInputRef.current?.click()}
                      className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-extrabold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>{portalBannerUrl ? 'Upload / Change Banner' : 'Upload / Change Banner'}</span>
                    </button>

                    {/* Save Banner button */}
                    <button
                      type="button"
                      id="save-portal-banner-btn"
                      onClick={handleSavePortalBanner}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Saving...' : 'Save Banner'}</span>
                    </button>

                    {/* Remove Banner button */}
                    {portalBannerUrl && (
                      <button
                        type="button"
                        id="remove-portal-banner-btn"
                        onClick={handleRemovePortalBanner}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-extrabold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Remove Banner</span>
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-zinc-400 font-medium">
                    {pendingPortalBannerFile ? (
                      <span className="text-amber-300 font-semibold">
                        Previewing selected file: {pendingPortalBannerFile.name} — Click "Save Banner" to upload to Supabase Storage and persist to database.
                      </span>
                    ) : portalBannerUrl ? (
                      'Saved cover banner active on Customer Portal.'
                    ) : (
                      'No custom banner uploaded. Customer Portal displays default gradient backdrop.'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Form Save All Button */}
            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <button
                type="submit"
                id="save-all-portal-branding-btn"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-zinc-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Uploading & Saving to Supabase...' : 'Save All Customer Portal Branding'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Payment Gateways Tab */}
      {activeTab === 'gateways' && (
        <form onSubmit={handleSaveSystemSettings} className="space-y-6">
          <div className="p-6 bg-zinc-900/90 rounded-2xl border border-amber-500/20 space-y-5">
            <h3 className="text-sm font-bold text-amber-400 font-serif flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Payment Gateways & Merchant Accounts
            </h3>

            {/* Meezan Bank Gateway */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 text-xs">Meezan Bank Digital Gateway</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-zinc-500 text-[10px]">Merchant ID</label>
                  <input
                    type="text"
                    value={meezanMerchantId}
                    onChange={(e) => setMeezanMerchantId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 text-[10px]">API Secret Key</label>
                  <input
                    type="password"
                    value={meezanApiKey}
                    onChange={(e) => setMeezanApiKey(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* JazzCash & EasyPaisa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                <span className="font-bold text-amber-300 text-xs">JazzCash Merchant Wallet</span>
                <div>
                  <label className="block text-zinc-500 text-[10px]">Merchant Code</label>
                  <input
                    type="text"
                    value={jazzcashMerchantId}
                    onChange={(e) => setJazzcashMerchantId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                <span className="font-bold text-emerald-400 text-xs">EasyPaisa Merchant Account</span>
                <div>
                  <label className="block text-zinc-500 text-[10px]">Store ID</label>
                  <input
                    type="text"
                    value={easypaisaMerchantId}
                    onChange={(e) => setEasypaisaMerchantId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Payment Gateways
            </button>
          </div>
        </form>
      )}

      {/* Staff & Permissions Tab */}
      {activeTab === 'users' && (
        <div className="p-6 bg-zinc-900/90 rounded-2xl border border-amber-500/20 space-y-4">
          <h3 className="text-sm font-bold text-amber-400 font-serif flex items-center gap-2">
            <Users className="w-4 h-4" /> System Users & Staff Profile Photos
          </h3>

          <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-xl overflow-hidden">
            {users.map((u) => (
              <div key={u.id} className="p-4 bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <UserAvatar user={u} className="w-10 h-10 rounded-xl" />
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      {u.name}
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 uppercase">
                        {u.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400">{u.email} • {u.designation || 'Staff'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStaffForAvatar(u.id);
                      staffFileInputRef.current?.click();
                    }}
                    className="px-3 py-1.5 bg-zinc-900 border border-amber-500/30 hover:border-amber-400 text-amber-300 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Change Photo</span>
                  </button>

                  {u.avatar && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStaffAvatar(u.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                      title="Remove User Avatar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold pl-2">
                    <ShieldCheck className="w-3.5 h-3.5" /> Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
