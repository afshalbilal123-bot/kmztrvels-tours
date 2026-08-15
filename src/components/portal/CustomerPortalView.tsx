import React, { useState } from 'react';
import {
  User,
  CalendarDays,
  Building,
  Plane,
  FileCheck2,
  CreditCard,
  Ticket,
  Bell,
  FileText,
  Lock,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  LogOut,
  Sparkles,
  Printer,
  QrCode,
  ShieldCheck,
  Send,
  AlertCircle,
  HelpCircle,
  Edit3,
  ExternalLink,
  PackageCheck,
  Receipt,
  Download,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { GoldBadge } from '../common/GoldBadge';
import { Modal } from '../common/Modal';
import { DEFAULT_FALLBACK_IMAGE } from '../../types';
import { generateInvoicePDF, generatePaymentReceiptPDF, generateVoucherPDF } from '../../utils/pdfGenerator';

export const CustomerPortalView: React.FC = () => {
  const { currentUser, logout, openAdminLogin, updateUser } = useAuth();
  const { bookings, customers, payments, invoices, packages, hotels, notifications, addNotification, updateCustomer, companySettings } = useData();

  const [activePortalTab, setActivePortalTab] = useState<
    | 'bookings'
    | 'packages'
    | 'hotels'
    | 'visa'
    | 'payments'
    | 'invoices'
    | 'vouchers'
    | 'history'
    | 'notifications'
    | 'profile'
    | 'support'
  >('bookings');

  // Modals state
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedVoucherBooking, setSelectedVoucherBooking] = useState<any>(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // Edit profile form state
  const [editPhone, setEditPhone] = useState('');
  const [editCnic, setEditCnic] = useState('');
  const [editPassport, setEditPassport] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editEmergency, setEditEmergency] = useState('');

  // Payment proof form state
  const [showPaymentProofModal, setShowPaymentProofModal] = useState(false);
  const [proofAmount, setProofAmount] = useState('');
  const [proofMethod, setProofMethod] = useState('Bank Transfer');
  const [proofRefNo, setProofRefNo] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [proofSentSuccess, setProofSentSuccess] = useState(false);

  // Support message state
  const [supportSubject, setSupportSubject] = useState('General Query');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSentSuccess, setSupportSentSuccess] = useState(false);

  // Strictly identify the logged-in customer record (DO NOT default to customers[0]!)
  const foundCustomer = customers.find(
    (c) =>
      (currentUser?.customerId && c.id === currentUser.customerId) ||
      (currentUser?.email && c.email && c.email.toLowerCase() === currentUser.email.toLowerCase()) ||
      (currentUser?.phone && c.phone && c.phone.replace(/[^0-9]/g, '').endsWith(currentUser.phone.replace(/[^0-9]/g, '')))
  );

  // Fallback profile if brand new self-registered customer doesn't exist in data store yet
  const currentCustomer = foundCustomer || {
    id: currentUser?.customerId || `c-fallback-${Date.now()}`,
    fullName: currentUser?.name || 'Valued Pilgrim',
    email: currentUser?.email || 'pilgrim@kmztravels.com',
    phone: currentUser?.phone || '03000000000',
    whatsapp: (currentUser?.phone || '03000000000').replace(/[^0-9]/g, ''),
    passportNumber: 'PK-REGISTERED',
    passportExpiry: '2031-12-31',
    cnic: '35202-0000000-0',
    city: 'Faisalabad',
    country: 'Pakistan',
    emergencyContact: 'Family Member',
    customerType: 'Umrah' as const,
    totalSpent: 0,
    totalBookings: 0,
    createdAt: new Date().toISOString().split('T')[0],
  };

  // Filter ONLY customer's own data
  const myBookings = bookings.filter(
    (b) =>
      b.customerId === currentCustomer.id ||
      (b.customerName && currentCustomer.fullName && b.customerName.toLowerCase() === currentCustomer.fullName.toLowerCase()) ||
      (currentUser?.email && currentUser?.name && b.customerName && b.customerName.toLowerCase() === currentUser.name.toLowerCase())
  );

  const myPayments = payments.filter(
    (p) =>
      p.customerId === currentCustomer.id ||
      (p.customerName && currentCustomer.fullName && p.customerName.toLowerCase() === currentCustomer.fullName.toLowerCase())
  );

  const myInvoices = invoices.filter(
    (i) =>
      i.customerId === currentCustomer.id ||
      (i.customerName && currentCustomer.fullName && i.customerName.toLowerCase() === currentCustomer.fullName.toLowerCase())
  );

  const myNotifications = notifications.filter(
    (n) =>
      n.targetCustomerId === currentCustomer.id ||
      n.targetRole === 'customer' ||
      !n.targetCustomerId
  );

  // Calculated totals
  const totalPackageCost = myBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalPaid = myBookings.reduce((sum, b) => sum + b.paidAmount, 0);
  const totalBalanceDue = Math.max(0, totalPackageCost - totalPaid);

  const openEditProfile = () => {
    setEditPhone(currentCustomer.phone);
    setEditCnic(currentCustomer.cnic);
    setEditPassport(currentCustomer.passportNumber);
    setEditCity(currentCustomer.city);
    setEditEmergency(currentCustomer.emergencyContact);
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (foundCustomer) {
      updateCustomer({
        ...foundCustomer,
        phone: editPhone,
        cnic: editCnic,
        passportNumber: editPassport,
        city: editCity,
        emergencyContact: editEmergency,
      });
    }
    if (currentUser) {
      updateUser({
        ...currentUser,
        phone: editPhone,
      });
    }
    setShowEditProfileModal(false);
  };

  const handleSendPaymentProof = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification({
      title: 'Payment Proof Submitted',
      message: `Pilgrim ${currentCustomer.fullName} submitted payment proof of PKR ${Number(
        proofAmount
      ).toLocaleString()} via ${proofMethod} (Ref: ${proofRefNo}).`,
      type: 'payment',
      linkTab: 'payments',
    });
    setProofSentSuccess(true);
    setTimeout(() => {
      setProofSentSuccess(false);
      setShowPaymentProofModal(false);
      setProofAmount('');
      setProofRefNo('');
      setProofNotes('');
    }, 1500);
  };

  const handleSendSupportMessage = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification({
      title: `Support Inquiry: ${supportSubject}`,
      message: `Inquiry from ${currentCustomer.fullName} (${currentCustomer.phone}): ${supportMessage}`,
      type: 'reminder',
      linkTab: 'notifications',
    });
    setSupportSentSuccess(true);
    setTimeout(() => {
      setSupportSentSuccess(false);
      setSupportMessage('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Pilgrim Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-2 border-amber-500/30 shadow-2xl">
        {companySettings?.customerPortalBannerUrl ? (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src={companySettings.customerPortalBannerUrl}
              alt="Customer Portal Cover Banner"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
              }}
              className="w-full h-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-zinc-950/60" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 overflow-hidden opacity-25">
            <img
              src={DEFAULT_FALLBACK_IMAGE}
              alt="Customer Portal Cover Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-zinc-950/60" />
          </div>
        )}

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {companySettings?.customerPortalLogoUrl ? (
              <div className="w-16 h-16 rounded-2xl bg-zinc-900/90 border-2 border-amber-500/40 p-1.5 shadow-xl shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src={companySettings.customerPortalLogoUrl}
                  alt="Customer Portal Logo"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 p-0.5 shadow-xl shrink-0">
                <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center font-serif font-black text-amber-400 text-xl tracking-wider">
                  KMZ
                </div>
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  Verified Pilgrim Portal
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  Passport: {currentCustomer.passportNumber}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-serif text-white mt-1">
                Labbaik, {currentCustomer.fullName}
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                KMZ Travels & Tours Executive Pilgrimage Management • Track your itinerary, hotel stays & Nusuk visa.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="p-3 bg-zinc-950/90 rounded-2xl border border-amber-500/20 text-center min-w-[100px]">
              <div className="text-[10px] text-zinc-400 uppercase font-bold">Bookings</div>
              <div className="text-lg text-amber-300 font-mono font-black">{myBookings.length}</div>
            </div>

            <div className="p-3 bg-zinc-950/90 rounded-2xl border border-amber-500/20 text-center min-w-[120px]">
              <div className="text-[10px] text-zinc-400 uppercase font-bold">Remaining Balance</div>
              <div className="text-xs font-bold text-rose-400 font-mono mt-1">
                PKR {totalBalanceDue.toLocaleString()}
              </div>
            </div>

            {/* Admin Login button */}
            <button
              onClick={openAdminLogin}
              className="p-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-zinc-950 rounded-2xl font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer border border-amber-300 hover:scale-105 active:scale-95"
              title="Open Admin & Staff CRM Login Page"
            >
              <ShieldCheck className="w-4 h-4 text-zinc-950" />
              <span>Admin Login</span>
            </button>

            {/* Logout button */}
            <button
              onClick={logout}
              className="p-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-2xl font-bold flex items-center gap-2 transition-all cursor-pointer"
              title="Sign Out of Customer Portal"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Portal 11 Sub-Navigation Tabs */}
        <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'bookings', label: 'Umrah/Hajj Bookings', icon: CalendarDays },
            { id: 'packages', label: 'Package Details', icon: PackageCheck },
            { id: 'hotels', label: 'Flight & Hotels', icon: Building },
            { id: 'visa', label: 'Visa Status', icon: FileCheck2 },
            { id: 'payments', label: 'Payments & Balance', icon: CreditCard },
            { id: 'invoices', label: 'Invoices & Receipts', icon: FileText },
            { id: 'vouchers', label: 'Service Vouchers', icon: Ticket },
            { id: 'history', label: 'Payment History', icon: Receipt },
            { id: 'notifications', label: 'Notifications', icon: Bell, badge: myNotifications.filter((n) => !n.read).length },
            { id: 'support', label: 'Support & Contact', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activePortalTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePortalTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 font-black'
                    : 'bg-zinc-900/90 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-amber-400 text-zinc-950 rounded-full text-[10px] font-black">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. PROFILE TAB */}
      {activePortalTab === 'profile' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
              <User className="w-5 h-5 text-amber-400" /> My Personal Profile & Documents
            </h3>
            <button
              onClick={openEditProfile}
              className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-amber-400" />
              <span>Edit Profile Details</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Info Card */}
            <div className="md:col-span-2 p-6 rounded-2xl bg-zinc-900 border border-amber-500/20 space-y-6 shadow-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                  <span className="text-[10px] text-amber-400/80 uppercase font-bold block">Full Name</span>
                  <span className="font-extrabold text-white text-sm">{currentCustomer.fullName}</span>
                </div>

                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                  <span className="text-[10px] text-amber-400/80 uppercase font-bold block">Mobile Phone</span>
                  <span className="font-bold text-white font-mono">{currentCustomer.phone}</span>
                </div>

                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                  <span className="text-[10px] text-amber-400/80 uppercase font-bold block">Email Address</span>
                  <span className="font-medium text-zinc-200 font-mono">{currentCustomer.email}</span>
                </div>

                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                  <span className="text-[10px] text-amber-400/80 uppercase font-bold block">Passport Number</span>
                  <span className="font-bold text-amber-300 font-mono">{currentCustomer.passportNumber}</span>
                </div>

                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                  <span className="text-[10px] text-amber-400/80 uppercase font-bold block">CNIC Number</span>
                  <span className="font-bold text-zinc-300 font-mono">{currentCustomer.cnic}</span>
                </div>

                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                  <span className="text-[10px] text-amber-400/80 uppercase font-bold block">City & Country</span>
                  <span className="font-bold text-white">{currentCustomer.city}, {currentCustomer.country}</span>
                </div>

                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1 sm:col-span-2">
                  <span className="text-[10px] text-amber-400/80 uppercase font-bold block">Emergency Contact Person</span>
                  <span className="font-bold text-white">{currentCustomer.emergencyContact}</span>
                </div>
              </div>
            </div>

            {/* Passport & Verification Card */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-amber-500/20 space-y-4 shadow-xl text-xs">
              <h4 className="font-bold text-amber-400 uppercase tracking-wide">Passport & Status</h4>
              <div className="space-y-2">
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-center">
                  <span className="text-zinc-400">Account Type:</span>
                  <GoldBadge variant="gold">{currentCustomer.customerType} Pilgrim</GoldBadge>
                </div>
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-center">
                  <span className="text-zinc-400">Registered On:</span>
                  <span className="text-white font-mono">{currentCustomer.createdAt}</span>
                </div>
              </div>

              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-center space-y-2">
                <div className="text-[10px] font-bold text-zinc-400 uppercase">Saudi Nusuk Verified</div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-xs">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Active Portal Access
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. BOOKINGS TAB */}
      {activePortalTab === 'bookings' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-amber-400" /> My Active Pilgrimage Bookings ({myBookings.length})
          </h3>

          {myBookings.length === 0 ? (
            <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center text-xs text-zinc-400 space-y-3">
              <CalendarDays className="w-8 h-8 text-amber-400 mx-auto" />
              <p>No active bookings recorded for your account yet.</p>
              <p className="text-[11px] text-zinc-500">Contact KMZ Travels support or visit our head office to register your Umrah / Hajj booking.</p>
            </div>
          ) : (
            myBookings.map((b) => {
              const matchedPkg = packages.find(
                (p) => p.id === b.packageId || p.title.toLowerCase().includes(b.packageName.toLowerCase())
              );
              const coverImg = matchedPkg?.coverImage || matchedPkg?.images[0] || 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?w=800';

              return (
                <div
                  key={b.id}
                  className="p-6 rounded-2xl bg-zinc-900 border border-amber-500/20 space-y-4 shadow-xl"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    <img
                      src={coverImg}
                      alt={b.packageName}
                      className="w-full md:w-56 h-36 object-cover rounded-xl border border-amber-500/20 shrink-0"
                    />

                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                        <div>
                          <span className="text-xs font-mono font-bold text-amber-300">
                            BOOKING #{b.bookingNumber}
                          </span>
                          <h4 className="text-lg font-bold text-white mt-0.5 font-serif">{b.packageName}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <GoldBadge variant={b.bookingStatus === 'Confirmed' ? 'emerald' : 'amber'}>
                            {b.bookingStatus}
                          </GoldBadge>
                          <span className="text-xs font-bold text-amber-400 font-mono">
                            Departure: {b.departureDate}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-zinc-500 block text-[10px] uppercase font-bold">Package Type</span>
                          <span className="font-bold text-amber-300">{b.packageType}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[10px] uppercase font-bold">Group Leader</span>
                          <span className="font-bold text-white">{b.groupLeaderName || 'KMZ Mutawwif'}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[10px] uppercase font-bold">Passengers</span>
                          <span className="font-bold text-white">{b.paxAdults} Adults</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[10px] uppercase font-bold">Return Date</span>
                          <span className="font-bold text-zinc-300 font-mono">{b.returnDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Progress Bar */}
                  <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-zinc-300">Total Price: PKR {b.totalAmount.toLocaleString()}</span>
                      <span className="text-emerald-400">Paid: PKR {b.paidAmount.toLocaleString()}</span>
                      <span className="text-rose-400">Balance: PKR {b.balanceAmount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, Math.round((b.paidAmount / (b.totalAmount || 1)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 3. PACKAGES TAB */}
      {activePortalTab === 'packages' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-amber-400" /> Booked Package Inclusions & Specs
          </h3>

          {myBookings.map((b) => {
            const matchedPkg = packages.find(
              (p) => p.id === b.packageId || p.title.toLowerCase().includes(b.packageName.toLowerCase())
            ) || packages[0];

            return (
              <div key={b.id} className="p-6 rounded-2xl bg-zinc-900 border border-amber-500/20 space-y-6 shadow-xl">
                <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-300">Booking #{b.bookingNumber}</span>
                    <h4 className="text-xl font-bold font-serif text-white mt-1">{matchedPkg?.title || b.packageName}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">{matchedPkg?.description}</p>
                  </div>
                  <GoldBadge variant="gold">{matchedPkg?.type || 'Umrah'} Package</GoldBadge>
                </div>

                {/* Hotel Images Gallery */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {matchedPkg?.makkahImage && (
                    <div className="relative h-40 rounded-xl overflow-hidden border border-zinc-800 group">
                      <img
                        src={matchedPkg.makkahImage}
                        alt="Makkah Hotel"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent p-3 flex flex-col justify-end">
                        <span className="text-[10px] font-bold uppercase text-amber-400">Makkah Holy City Hotel</span>
                        <span className="text-sm font-bold text-white font-serif">{matchedPkg.makkahHotel}</span>
                      </div>
                    </div>
                  )}

                  {matchedPkg?.madinaImage && (
                    <div className="relative h-40 rounded-xl overflow-hidden border border-zinc-800 group">
                      <img
                        src={matchedPkg.madinaImage}
                        alt="Madina Hotel"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent p-3 flex flex-col justify-end">
                        <span className="text-[10px] font-bold uppercase text-emerald-400">Madina Holy City Hotel</span>
                        <span className="text-sm font-bold text-white font-serif">{matchedPkg.madinaHotel}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Inclusions */}
                <div>
                  <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-2">Package Inclusions</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {(matchedPkg?.inclusions || ['Saudi E-Visa Issuance', 'Return Air Tickets', 'Makkah Hotel Stay', 'Madina Hotel Stay', 'VIP Transport', 'Ziyarat Services']).map((inc, i) => (
                      <div key={i} className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-300 flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. FLIGHT & HOTELS TAB */}
      {activePortalTab === 'hotels' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-400" /> Reserved Flight Tickets & Hotel Stays
          </h3>

          {myBookings.map((b) => (
            <div key={b.id} className="space-y-4">
              <div className="p-5 rounded-2xl bg-zinc-900 border border-amber-500/20 text-xs space-y-3 shadow-xl">
                <h4 className="font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2 text-sm">
                  <Plane className="w-4 h-4 text-amber-400" /> Flight Reservation (PNR: {b.flight.pnr})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Airline</span>
                    <span className="font-bold text-white text-sm">{b.flight.airline}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Route</span>
                    <span className="font-bold text-amber-300">{b.flight.departureAirport} → {b.flight.arrivalAirport}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Schedule</span>
                    <span className="font-mono text-zinc-300">{b.flight.departureDatetime}</span>
                  </div>
                </div>
              </div>

              {/* Hotels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {b.hotels.map((h, i) => {
                  const ratePerNight = h.ratePerNight || 85000;
                  const nights = h.nights || 7;
                  const totalHotelRate = h.totalRate || h.totalHotelCost || (ratePerNight * nights);
                  const currency = h.currency || 'PKR';

                  return (
                    <div key={i} className="p-5 rounded-2xl bg-zinc-900 border border-amber-500/20 text-xs space-y-3 shadow-xl flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <GoldBadge variant={h.city === 'Makkah' ? 'gold' : 'emerald'}>{h.city} Holy Stay</GoldBadge>
                          <span className="text-amber-300 font-bold bg-zinc-950 px-2.5 py-1 rounded-lg border border-amber-500/20">
                            {nights} Nights Stay
                          </span>
                        </div>

                        {(() => {
                          const catalogHotel = hotels.find(
                            (item) =>
                              item.name.toLowerCase().includes(h.hotelName.toLowerCase()) ||
                              h.hotelName.toLowerCase().includes(item.name.toLowerCase())
                          );
                          const hotelImageToDisplay = h.imageUrl || catalogHotel?.imageUrl || DEFAULT_FALLBACK_IMAGE;
                          return (
                            <div className="h-36 rounded-xl overflow-hidden bg-zinc-950 relative border border-zinc-800">
                              <img
                                src={hotelImageToDisplay}
                                alt={h.hotelName}
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                                }}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                              <div className="absolute bottom-2 left-2 text-amber-300 text-[10px] font-bold">
                                ★ {h.starRating || catalogHotel?.starRating || 5}-Star Luxury Hotel
                              </div>
                            </div>
                          );
                        })()}

                        <div>
                          <div className="text-base font-bold text-white font-serif">{h.hotelName}</div>
                          <div className="text-[11px] text-zinc-400 mt-0.5">{h.hotelAddress || (h.city === 'Makkah' ? 'King Abdul Aziz Road, Makkah' : 'Central Area, Madina')}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px]">
                          <div>
                            <span className="text-zinc-500 font-bold uppercase text-[9px] block">Room Specification</span>
                            <span className="text-white font-bold block">{h.roomType}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 font-bold uppercase text-[9px] block">Room Sharing</span>
                            <span className="text-amber-300 font-bold block">{h.roomSharing || 'Quad'} Sharing</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 font-bold uppercase text-[9px] block">Check-In</span>
                            <span className="text-zinc-300 font-mono block">{h.checkIn}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 font-bold uppercase text-[9px] block">Check-Out</span>
                            <span className="text-zinc-300 font-mono block">{h.checkOut}</span>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-gradient-to-r from-zinc-950 to-amber-950/20 border border-amber-500/30 space-y-1.5 text-[11px]">
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-400">Meal Plan:</span>
                            <span className="text-amber-300 font-bold">{h.mealPlan || 'Breakfast Included'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-400">Distance to Haram:</span>
                            <span className="text-zinc-200 font-bold">{h.distanceFromHaram || 'Close to Haram'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-400">Rate Per Night:</span>
                            <span className="text-amber-300 font-mono font-bold">{currency} {ratePerNight.toLocaleString()}</span>
                          </div>
                          <div className="pt-1.5 border-t border-zinc-800 flex justify-between items-center text-xs">
                            <span className="font-extrabold text-amber-400 uppercase">Total Hotel Cost:</span>
                            <span className="font-mono font-black text-emerald-400 text-sm">{currency} {totalHotelRate.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {h.contactPhone && (
                        <div className="pt-2 border-t border-zinc-800 flex justify-between items-center text-[11px] text-zinc-400">
                          <span>Hotel Manager / Helpdesk:</span>
                          <span className="text-emerald-400 font-bold font-mono">{h.contactPhone}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. VISA STATUS TAB */}
      {activePortalTab === 'visa' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-amber-400" /> Saudi MOFA E-Visa Status
          </h3>

          {myBookings.map((b) => (
            <div key={b.id} className="p-6 rounded-2xl bg-zinc-900 border border-amber-500/20 text-xs space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <span className="text-[10px] text-zinc-400 font-mono">Booking #{b.bookingNumber}</span>
                  <h4 className="text-base font-bold text-white font-serif">{b.visa.visaType}</h4>
                </div>
                <GoldBadge variant="emerald">{b.visa.status}</GoldBadge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-amber-400 uppercase font-bold block">Nusuk ID</span>
                  <span className="font-mono font-bold text-white text-sm">{b.visa.nusukId}</span>
                </div>

                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-amber-400 uppercase font-bold block">Application Date</span>
                  <span className="font-mono text-zinc-300">{b.visa.applicationDate}</span>
                </div>

                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-amber-400 uppercase font-bold block">Visa Expiry Date</span>
                  <span className="font-mono text-emerald-400 font-bold">{b.visa.expiryDate || 'Valid for 90 Days'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. PAYMENTS & BALANCE TAB */}
      {activePortalTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-400" /> Payments & Remaining Balance
            </h3>

            <button
              onClick={() => setShowPaymentProofModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Send className="w-4 h-4" />
              <span>Submit Payment Proof / Ref</span>
            </button>
          </div>

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-zinc-400 text-[10px] uppercase font-bold">Total Package Cost</span>
              <div className="text-xl font-extrabold text-white font-mono">PKR {totalPackageCost.toLocaleString()}</div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900 border border-emerald-500/30 space-y-1">
              <span className="text-emerald-400 text-[10px] uppercase font-bold">Total Paid</span>
              <div className="text-xl font-extrabold text-emerald-400 font-mono">PKR {totalPaid.toLocaleString()}</div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900 border border-rose-500/30 space-y-1">
              <span className="text-rose-400 text-[10px] uppercase font-bold">Remaining Balance Due</span>
              <div className="text-xl font-extrabold text-rose-400 font-mono">PKR {totalBalanceDue.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* 7. INVOICES & RECEIPTS TAB */}
      {activePortalTab === 'invoices' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" /> Invoices & Official Receipts
          </h3>

          <div className="bg-zinc-900 rounded-2xl border border-amber-500/20 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-400 uppercase font-semibold">
                <tr>
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Paid</th>
                  <th className="p-4">Balance</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {myInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="p-4 font-mono font-bold text-amber-300">{inv.invoiceNumber}</td>
                    <td className="p-4">{inv.issueDate}</td>
                    <td className="p-4 font-bold text-white">PKR {inv.totalAmount.toLocaleString()}</td>
                    <td className="p-4 text-emerald-400 font-bold">PKR {inv.paidAmount.toLocaleString()}</td>
                    <td className="p-4 text-rose-400 font-bold">PKR {inv.balanceDue.toLocaleString()}</td>
                    <td className="p-4"><GoldBadge variant={inv.status === 'Paid' ? 'emerald' : 'amber'}>{inv.status}</GoldBadge></td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => generateInvoicePDF(inv, invoices)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Invoice PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. VOUCHERS TAB */}
      {activePortalTab === 'vouchers' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-amber-400" /> Service & Hotel Vouchers
          </h3>

          {myBookings.map((b) => (
            <div key={b.id} className="p-6 rounded-2xl bg-zinc-900 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <span className="text-xs font-mono font-bold text-amber-300">BOOKING #{b.bookingNumber}</span>
                <h4 className="text-base font-bold text-white font-serif mt-0.5">{b.packageName}</h4>
                <p className="text-xs text-zinc-400">Official Hotel & Pilgrimage Transport Voucher Authorized by KMZ Travels</p>
              </div>

              <button
                onClick={() => setSelectedVoucherBooking(b)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>View / Print Voucher</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 9. PAYMENT HISTORY TAB */}
      {activePortalTab === 'history' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-400" /> Payment History & Receipts Ledger
          </h3>

          <div className="bg-zinc-900 rounded-2xl border border-amber-500/20 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-400 uppercase font-semibold">
                <tr>
                  <th className="p-4">Receipt #</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Reference #</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {myPayments.map((p) => {
                  const linkedInv = invoices.find(
                    (i) => i.id === p.invoiceId || i.invoiceNumber === p.invoiceNumber || i.bookingId === p.bookingId
                  );
                  return (
                    <tr key={p.id}>
                      <td className="p-4 font-mono font-bold text-amber-300">{p.receiptNumber}</td>
                      <td className="p-4">{p.date}</td>
                      <td className="p-4 font-extrabold text-emerald-400">PKR {p.amount.toLocaleString()}</td>
                      <td className="p-4">{p.paymentMethod}</td>
                      <td className="p-4 font-mono text-zinc-400">{p.referenceNumber}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => generatePaymentReceiptPDF(p, linkedInv)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 font-bold border border-emerald-500/40 flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Receipt PDF</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 10. NOTIFICATIONS TAB */}
      {activePortalTab === 'notifications' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" /> My Notifications & Updates
          </h3>

          <div className="space-y-2">
            {myNotifications.map((n) => (
              <div key={n.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs space-y-1">
                <div className="flex justify-between text-zinc-400">
                  <span className="font-bold text-white text-sm">{n.title}</span>
                  <span className="font-mono">{n.date}</span>
                </div>
                <p className="text-zinc-300">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. SUPPORT & CONTACT TAB */}
      {activePortalTab === 'support' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" /> Official Support & Contact Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Details Card */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-amber-500/20 space-y-4 text-xs shadow-xl">
              <h4 className="text-sm font-bold font-serif text-amber-400 uppercase">KMZ Travels Head Office</h4>
              <div className="space-y-3 text-zinc-300">
                <div>Director: <span className="font-bold text-white">Toheed Asghar Shahid</span></div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp Support: 03018647596</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span>Helpline Call: 03147861122</span>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex flex-wrap gap-2">
                <a
                  href="https://wa.me/923018647596"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" /> WhatsApp Live Chat
                </a>
                <a
                  href="tel:03147861122"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Main Office
                </a>
              </div>
            </div>

            {/* Direct Support Message Form */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-amber-500/20 space-y-4 text-xs shadow-xl">
              <h4 className="text-sm font-bold font-serif text-amber-400 uppercase">Send Inquiry to Support Team</h4>
              {supportSentSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-center">
                  Your inquiry was sent to KMZ Travels team successfully!
                </div>
              ) : (
                <form onSubmit={handleSendSupportMessage} className="space-y-3">
                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Subject</label>
                    <select
                      value={supportSubject}
                      onChange={(e) => setSupportSubject(e.target.value)}
                      className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none"
                    >
                      <option>General Query</option>
                      <option>Visa Status Inquiry</option>
                      <option>Hotel Change Request</option>
                      <option>Payment Confirmation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Message</label>
                    <textarea
                      rows={4}
                      required
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      placeholder="Write your query or special request..."
                      className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl cursor-pointer"
                  >
                    Send Message To Support
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE INVOICE MODAL */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Official Invoice #${selectedInvoice.invoiceNumber}`}
          subtitle="KMZ Travels & Tours (Pvt) Ltd • Faisalabad"
        >
          <div className="space-y-6 text-xs text-zinc-300">
            <div id="printable-invoice" className="p-6 rounded-2xl bg-zinc-900 border border-amber-500/30 space-y-4">
              <div className="flex justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold font-serif text-amber-400">KMZ TRAVELS & TOURS (PVT) LTD</h2>
                  <p className="text-[10px] text-zinc-400">Licensed Hajj & Umrah Operator • P-41 Jhung Bazar, Faisalabad</p>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-amber-300 text-sm">{selectedInvoice.invoiceNumber}</div>
                  <div className="text-[10px] text-zinc-400">Date: {selectedInvoice.issueDate}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-white">Billed To: {selectedInvoice.customerName}</div>
                <div className="text-zinc-400 font-mono">Booking Ref: {selectedInvoice.bookingNumber}</div>
              </div>

              <table className="w-full text-left text-xs border border-zinc-800 rounded-xl overflow-hidden">
                <thead className="bg-zinc-950 text-zinc-400">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {selectedInvoice.items?.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="p-3 text-zinc-200">{item.description}</td>
                      <td className="p-3 font-bold text-white">PKR {(item.total || item.unitPrice).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between pt-4 border-t border-zinc-800 text-sm font-bold">
                <span>Total Amount: PKR {selectedInvoice.totalAmount.toLocaleString()}</span>
                <span className="text-emerald-400">Paid: PKR {selectedInvoice.paidAmount.toLocaleString()}</span>
                <span className="text-rose-400">Balance: PKR {selectedInvoice.balanceDue.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => generateInvoicePDF(selectedInvoice, invoices)}
              className="w-full py-3 bg-amber-500 text-zinc-950 font-black rounded-xl cursor-pointer flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" /> Print / Save Invoice PDF
            </button>
          </div>
        </Modal>
      )}

      {/* PRINTABLE VOUCHER MODAL */}
      {selectedVoucherBooking && (
        <Modal
          isOpen={!!selectedVoucherBooking}
          onClose={() => setSelectedVoucherBooking(null)}
          title={`Pilgrimage Service Voucher #${selectedVoucherBooking.bookingNumber}`}
          subtitle="Official KMZ Travels Voucher for Saudi Ministry Checkpoints"
        >
          <div className="space-y-6 text-xs text-zinc-300">
            <div id="printable-voucher" className="p-6 rounded-2xl bg-zinc-900 border border-amber-500/30 space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold font-serif text-amber-400">KMZ TRAVELS & TOURS SERVICE VOUCHER</h3>
                  <p className="text-[10px] text-zinc-400">Authorized Director: Toheed Asghar Shahid</p>
                </div>
                <QrCode className="w-12 h-12 text-amber-400" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>Pilgrim Name: <span className="font-bold text-white">{selectedVoucherBooking.customerName}</span></div>
                <div>Passport #: <span className="font-bold text-amber-300 font-mono">{currentCustomer.passportNumber}</span></div>
                <div>Package: <span className="font-bold text-white">{selectedVoucherBooking.packageName}</span></div>
                <div>Nusuk ID: <span className="font-bold text-emerald-400 font-mono">{selectedVoucherBooking.visa.nusukId}</span></div>
              </div>

              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                <div className="font-bold text-amber-300">Hotel Confirmations:</div>
                {selectedVoucherBooking.hotels.map((h: any, i: number) => (
                  <div key={i} className="text-zinc-300">{h.city}: {h.hotelName} ({h.roomType}, {h.nights} Nights)</div>
                ))}
              </div>
            </div>

            <button
              onClick={() => generateVoucherPDF(selectedVoucherBooking, packages)}
              className="w-full py-3 bg-amber-500 text-zinc-950 font-black rounded-xl cursor-pointer flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" /> Print Official Voucher
            </button>
          </div>
        </Modal>
      )}

      {/* EDIT PROFILE MODAL */}
      {showEditProfileModal && (
        <Modal
          isOpen={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
          title="Edit Profile Information"
          subtitle="Update your personal contact details"
        >
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-bold mb-1">Mobile Phone</label>
              <input
                type="text"
                required
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-bold mb-1">CNIC Number</label>
              <input
                type="text"
                value={editCnic}
                onChange={(e) => setEditCnic(e.target.value)}
                className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-bold mb-1">Passport Number</label>
              <input
                type="text"
                value={editPassport}
                onChange={(e) => setEditPassport(e.target.value)}
                className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-bold mb-1">City</label>
              <input
                type="text"
                value={editCity}
                onChange={(e) => setEditCity(e.target.value)}
                className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-bold mb-1">Emergency Contact</label>
              <input
                type="text"
                value={editEmergency}
                onChange={(e) => setEditEmergency(e.target.value)}
                className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 text-zinc-950 font-bold rounded-xl cursor-pointer"
            >
              Save Profile Changes
            </button>
          </form>
        </Modal>
      )}

      {/* SUBMIT PAYMENT PROOF MODAL */}
      {showPaymentProofModal && (
        <Modal
          isOpen={showPaymentProofModal}
          onClose={() => setShowPaymentProofModal(false)}
          title="Submit Payment Proof / Reference"
          subtitle="Notify KMZ Travels accounts team of bank transfer or mobile wallet payment"
        >
          {proofSentSuccess ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-center text-xs">
              Payment proof submitted successfully! KMZ Travels accounts team will verify and update your receipt ledger.
            </div>
          ) : (
            <form onSubmit={handleSendPaymentProof} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Amount Paid (PKR) *</label>
                <input
                  type="number"
                  required
                  value={proofAmount}
                  onChange={(e) => setProofAmount(e.target.value)}
                  placeholder="e.g. 250000"
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Payment Method</label>
                <select
                  value={proofMethod}
                  onChange={(e) => setProofMethod(e.target.value)}
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white"
                >
                  <option>Meezan Bank Transfer</option>
                  <option>HBL Bank Transfer</option>
                  <option>JazzCash Wallet</option>
                  <option>EasyPaisa Wallet</option>
                  <option>Cash Counter Deposit</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Bank Reference / TID Number *</label>
                <input
                  type="text"
                  required
                  value={proofRefNo}
                  onChange={(e) => setProofRefNo(e.target.value)}
                  placeholder="e.g. IFT-88192019 or JazzCash TID 991823"
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Notes / Slip Details</label>
                <textarea
                  rows={2}
                  value={proofNotes}
                  onChange={(e) => setProofNotes(e.target.value)}
                  placeholder="Additional details..."
                  className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 text-zinc-950 font-bold rounded-xl cursor-pointer"
              >
                Submit Payment Reference To Accounts
              </button>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
