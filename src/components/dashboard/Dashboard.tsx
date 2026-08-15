import React, { useState, useRef } from 'react';
import {
  DollarSign,
  CalendarDays,
  Users,
  FileCheck,
  FileCheck2,
  TrendingUp,
  Plus,
  ArrowRight,
  Filter,
  CreditCard,
  Building,
  Plane,
  Sparkles,
  Banknote,
  AlertCircle,
  FileText,
  Landmark,
  Building2,
  Wallet,
  Camera,
  Upload,
  Trash2,
  Check,
  CheckCircle2,
  LogOut,
  Printer,
  Download,
  Eye,
  Receipt,
  Package,
  Bus,
  Layers,
  Ticket,
  User,
  Calendar,
  Search,
  X,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../common/StatCard';
import { GoldBadge } from '../common/GoldBadge';
import { UserAvatar } from '../common/UserAvatar';
import { Modal } from '../common/Modal';
import { processAndCompressImage } from '../../lib/imageUtils';
import { generateInvoicePDF, generatePaymentReceiptPDF } from '../../utils/pdfGenerator';
import { Invoice, Payment } from '../../types';

export const Dashboard: React.FC = () => {
  const { currentUser, isSuperAdmin, logout } = useAuth();
  const {
    bookings,
    customers,
    payments,
    invoices,
    expenses,
    salarySlips,
    bankAccounts,
    getBankAccountBalance,
    setActiveTab,
    setActiveDocCategory,
    searchTerm,
    companySettings,
    updateCompanySettings,
    uploadBrandingImage,
  } = useData();

  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Dashboard Billing Modules State
  const [dashInvoiceFilter, setDashInvoiceFilter] = useState<string>('All');
  const [dashPaymentMethodFilter, setDashPaymentMethodFilter] = useState<string>('All');
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [viewingPayment, setViewingPayment] = useState<Payment | null>(null);

  // Dashboard Customer Document Flow State
  const [docFlowCustomerId, setDocFlowCustomerId] = useState<string>('all');
  const [docFlowBookingId, setDocFlowBookingId] = useState<string>('all');
  const [docFlowCategory, setDocFlowCategory] = useState<string>('Umrah Package Invoice');
  const [docFlowSelectedId, setDocFlowSelectedId] = useState<string>('');

  // Dashboard Cover Image Modal & Upload state
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [previewBannerUrl, setPreviewBannerUrl] = useState<string | null>(null);
  const [pendingBannerFile, setPendingBannerFile] = useState<File | null>(null);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const bannerFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenBannerModal = () => {
    setPreviewBannerUrl(companySettings?.dashboardBannerUrl || '');
    setPendingBannerFile(null);
    setUploadError(null);
    setSaveSuccess(false);
    setIsBannerModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setUploadError('Invalid format. Please select a JPG, JPEG, PNG, or WebP photo.');
        return;
      }
      setUploadError(null);
      setPendingBannerFile(file);
      setPreviewBannerUrl(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  const handleSaveBanner = async () => {
    try {
      setIsUploadingBanner(true);
      setUploadError(null);

      let finalUrl = previewBannerUrl || '';

      if (pendingBannerFile) {
        finalUrl = await uploadBrandingImage(pendingBannerFile, 'banner');
        setPendingBannerFile(null);
      }

      await updateCompanySettings({
        ...companySettings,
        dashboardBannerUrl: finalUrl,
      });

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsBannerModalOpen(false);
      }, 1200);
    } catch (err: any) {
      console.error('Failed to save banner:', err);
      setUploadError(err.message || 'Failed to upload cover banner photo.');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleDeleteBanner = async () => {
    if (window.confirm('Remove custom dashboard banner image?')) {
      setPreviewBannerUrl('');
      setPendingBannerFile(null);
      await updateCompanySettings({
        ...companySettings,
        dashboardBannerUrl: '',
      });
      setIsBannerModalOpen(false);
    }
  };

  // Filter calculations based on dateFilter
  const now = new Date();
  const filteredBookings = bookings.filter((b) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const match =
        b.customerName.toLowerCase().includes(term) ||
        b.bookingNumber.toLowerCase().includes(term) ||
        b.customerPhone.includes(term) ||
        b.packageName.toLowerCase().includes(term);
      if (!match) return false;
    }

    if (dateFilter === 'all') return true;
    const bDate = new Date(b.createdAt);
    if (dateFilter === 'today') {
      return bDate.toDateString() === now.toDateString();
    }
    if (dateFilter === 'week') {
      const diff = (now.getTime() - bDate.getTime()) / (1000 * 3600 * 24);
      return diff <= 7;
    }
    if (dateFilter === 'month') {
      return bDate.getMonth() === now.getMonth() && bDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  // Key KPI metrics
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalPaid = bookings.reduce((sum, b) => sum + b.paidAmount, 0);
  const totalReceivables = bookings.reduce((sum, b) => sum + b.balanceAmount, 0);
  const totalPilgrims = bookings.reduce((sum, b) => sum + (b.paxAdults + b.paxChildren + b.paxInfants), 0);
  const visasIssued = bookings.filter((b) => b.visa.status === 'Issued' || b.visa.status === 'Approved').length;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalPaid - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border border-amber-500/30 relative overflow-hidden shadow-2xl">
        {companySettings?.dashboardBannerUrl && (
          <img
            src={companySettings.dashboardBannerUrl}
            alt="Dashboard Banner"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
            className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
          />
        )}

        {/* Admin Cover Image Upload Trigger */}
        {isSuperAdmin && (
          <button
            type="button"
            onClick={handleOpenBannerModal}
            className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-900 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Upload or Change Dashboard Cover Image"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>{companySettings?.dashboardBannerUrl ? 'Change Cover' : 'Upload Cover'}</span>
          </button>
        )}
        <div className="flex items-center gap-4 relative z-10">
          <UserAvatar user={currentUser} className="w-14 h-14 rounded-2xl ring-2 ring-amber-400/60 shadow-xl" showStatus={true} />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">
                Welcome back, {currentUser.name}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 uppercase">
                {(currentUser?.role || 'admin').replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-white">
              Umrah & Hajj Executive Operations
            </h2>
            <p className="text-xs text-zinc-400 max-w-xl">
              Real-time financial status, pilgrim bookings, multi-hotel reservations, visa processing, and staff performance.
            </p>
          </div>
        </div>

        {/* Date Filter Pills & Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-xs">
            {(['all', 'today', 'week', 'month'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                  dateFilter === filter
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {filter === 'all' ? 'All Time' : filter}
              </button>
            ))}
          </div>

          <button
            onClick={() => setActiveTab('bookings')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs transition-all cursor-pointer"
            title="Sign Out of Admin Session"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Booking Volume"
          value={`PKR ${(totalRevenue / 1000000).toFixed(2)}M`}
          change="+18.4% vs last mo"
          isPositive={true}
          icon={DollarSign}
          subtitle={`Paid: PKR ${(totalPaid / 1000000).toFixed(2)}M`}
          badge="REVENUE"
        />
        <StatCard
          title="Pending Receivables"
          value={`PKR ${(totalReceivables / 100000).toFixed(1)} Lac`}
          change="Due across bookings"
          isPositive={false}
          icon={CreditCard}
          subtitle={`${bookings.filter((b) => b.balanceAmount > 0).length} Bookings Pending`}
          badge="RECEIVABLES"
        />
        <StatCard
          title="Total Pilgrims (Pax)"
          value={totalPilgrims}
          change="+12 this week"
          isPositive={true}
          icon={Users}
          subtitle={`${filteredBookings.length} Active Group Bookings`}
          badge="PILGRIMS"
        />
        <StatCard
          title="Visas Approved / Issued"
          value={`${visasIssued} / ${bookings.length}`}
          change="High Nusuk Success Rate"
          isPositive={true}
          icon={FileCheck2}
          subtitle="Saudi MOFA E-Visas"
          badge="NUSUK"
        />
      </div>

      {/* Secondary Highlights Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-amber-500/20 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 font-medium">Net Operational Profit</span>
            <div className="text-xl font-bold text-emerald-400">
              PKR {netProfit > 0 ? netProfit.toLocaleString() : '0'}
            </div>
            <div className="text-[11px] text-zinc-500">
              After deducting PKR {totalExpenses.toLocaleString()} expenses
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-amber-500/20 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 font-medium">Payroll / Salary Slips</span>
            <div className="text-xl font-bold text-amber-300">
              {salarySlips.length} Slips Issued
            </div>
            <div className="text-[11px] text-zinc-500">
              Total Net Payroll: PKR{' '}
              {salarySlips.reduce((sum, s) => sum + s.netSalary, 0).toLocaleString()}
            </div>
          </div>
          <button
            onClick={() => setActiveTab('salary-slips')}
            className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl hover:bg-amber-500/20 transition-colors"
            title="View Salary Slips"
          >
            <Banknote className="w-6 h-6" />
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-amber-500/20 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 font-medium">Quick Shortcuts</span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                onClick={() => setActiveTab('customers')}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 text-[11px] font-medium text-amber-300 hover:bg-zinc-700"
              >
                + Customer
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 text-[11px] font-medium text-amber-300 hover:bg-zinc-700"
              >
                + Payment
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 text-[11px] font-medium text-amber-300 hover:bg-zinc-700"
              >
                + Invoice
              </button>
            </div>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ADMIN DASHBOARD: DOCUMENTS & INVOICES HUB */}
      <div className="bg-zinc-900/95 rounded-2xl border border-amber-500/30 p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-lg font-serif">Documents & Invoices Hub</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                  Print Center
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Separate invoice & voucher modules. Filter by customer & booking to view, print or download standalone A4 PDFs.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('documents-center')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 hover:bg-amber-400 font-bold text-xs transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Open Documents Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 9 SEPARATE DASHBOARD DOCUMENT MODULES GRID */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            <span>Document Modules (9 Standalone Types)</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2.5">
            {[
              { id: 'Umrah Package Invoice', title: 'Package Invoices', icon: Package, badge: 'PACKAGE', color: 'amber' },
              { id: 'Hotel Invoice', title: 'Hotel Invoices', icon: Building2, badge: 'HOTEL', color: 'emerald' },
              { id: 'Flight Invoice', title: 'Flight Invoices', icon: Plane, badge: 'FLIGHT', color: 'sky' },
              { id: 'Visa Invoice', title: 'Visa Invoices', icon: FileCheck, badge: 'VISA', color: 'purple' },
              { id: 'Transport Invoice', title: 'Transport Invoices', icon: Bus, badge: 'GROUND', color: 'orange' },
              { id: 'Extra Service Invoice', title: 'Extra Service', icon: Layers, badge: 'EXTRA', color: 'blue' },
              { id: 'Payment Receipt', title: 'Payment Receipts', icon: Receipt, badge: 'RECEIPTS', color: 'green' },
              { id: 'Voucher', title: 'Vouchers', icon: Ticket, badge: 'VOUCHERS', color: 'amber' },
              { id: 'Total/Consolidated Invoice', title: 'Total / Consolidated', icon: Printer, badge: 'MASTER', color: 'amber' },
            ].map((mod) => {
              const IconComp = mod.icon;
              const isCurrent = docFlowCategory === mod.id;
              
              // calculate count for badge
              let count = 0;
              if (mod.id === 'Payment Receipt') {
                count = payments.length;
              } else if (mod.id === 'Voucher') {
                count = bookings.length;
              } else if (mod.id === 'Total/Consolidated Invoice') {
                count = invoices.filter(i => i.invoiceType === 'Consolidated Total Invoice').length;
              } else {
                count = invoices.filter(i => i.invoiceType === mod.id).length;
              }

              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => {
                    setDocFlowCategory(mod.id);
                    setActiveDocCategory(mod.id);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between h-28 group ${
                    isCurrent
                      ? 'bg-amber-500/15 border-amber-500/60 ring-2 ring-amber-500/30 text-amber-300'
                      : 'bg-zinc-950/70 border-zinc-800 hover:border-amber-500/40 text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 group-hover:border-amber-500/30 text-amber-400">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {count}
                    </span>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500/80 mb-0.5">{mod.badge}</div>
                    <div className="text-xs font-extrabold text-white leading-tight group-hover:text-amber-300">
                      {mod.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* CUSTOMER DOCUMENT FLOW WIDGET */}
        <div className="bg-zinc-950/80 rounded-xl border border-zinc-800 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              <span>Customer Document Flow Selector</span>
            </h4>
            <span className="text-[11px] text-zinc-400 font-mono">
              Active Module: <strong className="text-amber-400">{docFlowCategory}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Step 1: Select Customer */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                1. Select Customer
              </label>
              <select
                value={docFlowCustomerId}
                onChange={(e) => {
                  setDocFlowCustomerId(e.target.value);
                  setDocFlowBookingId('all');
                  setDocFlowSelectedId('');
                }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Customers ({customers.length})</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Select Booking */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                2. Select Booking
              </label>
              <select
                value={docFlowBookingId}
                onChange={(e) => {
                  setDocFlowBookingId(e.target.value);
                  setDocFlowSelectedId('');
                }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Bookings</option>
                {bookings
                  .filter((b) => docFlowCustomerId === 'all' || b.customerId === docFlowCustomerId)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bookingNumber} - {b.customerName} ({b.packageName})
                    </option>
                  ))}
              </select>
            </div>

            {/* Step 3: Select Document Record */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                3. Select Document Record
              </label>
              {(() => {
                // calculate matching docs
                let matchingDocs: { id: string; label: string; item: any }[] = [];
                
                if (docFlowCategory === 'Payment Receipt') {
                  matchingDocs = payments
                    .filter((p) => {
                      if (docFlowCustomerId !== 'all') {
                        const cust = customers.find(c => c.id === docFlowCustomerId);
                        if (cust && p.customerName !== cust.fullName) return false;
                      }
                      if (docFlowBookingId !== 'all') {
                        const bk = bookings.find(b => b.id === docFlowBookingId);
                        if (bk && p.bookingNumber !== bk.bookingNumber) return false;
                      }
                      return true;
                    })
                    .map((p) => ({
                      id: p.id,
                      label: `${p.receiptNumber} - ${p.customerName} (PKR ${p.amount.toLocaleString()})`,
                      item: p,
                    }));
                } else if (docFlowCategory === 'Voucher') {
                  matchingDocs = bookings
                    .filter((b) => {
                      if (docFlowCustomerId !== 'all' && b.customerId !== docFlowCustomerId) return false;
                      if (docFlowBookingId !== 'all' && b.id !== docFlowBookingId) return false;
                      return true;
                    })
                    .map((b) => ({
                      id: b.id,
                      label: `Voucher: ${b.bookingNumber} - ${b.customerName}`,
                      item: b,
                    }));
                } else {
                  matchingDocs = invoices
                    .filter((inv) => {
                      if (inv.invoiceType !== docFlowCategory) return false;
                      if (docFlowCustomerId !== 'all') {
                        const cust = customers.find(c => c.id === docFlowCustomerId);
                        if (cust && inv.customerName !== cust.fullName) return false;
                      }
                      if (docFlowBookingId !== 'all' && inv.bookingId !== docFlowBookingId) return false;
                      return true;
                    })
                    .map((inv) => ({
                      id: inv.id,
                      label: `${inv.invoiceNumber} - ${inv.customerName} (PKR ${inv.totalAmount.toLocaleString()})`,
                      item: inv,
                    }));
                }

                const selectedDoc = matchingDocs.find(d => d.id === docFlowSelectedId) || matchingDocs[0];
                const activeId = selectedDoc?.id || '';

                return (
                  <div className="space-y-2">
                    <select
                      value={activeId}
                      onChange={(e) => setDocFlowSelectedId(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    >
                      {matchingDocs.length === 0 ? (
                        <option value="">No document records available</option>
                      ) : (
                        matchingDocs.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.label}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* DOCUMENT ACTION BAR & QUICK DETAILS */}
          {(() => {
            // resolve active item
            let selectedItem: any = null;
            let itemType: 'invoice' | 'receipt' | 'voucher' = 'invoice';

            if (docFlowCategory === 'Payment Receipt') {
              itemType = 'receipt';
              const matching = payments.filter((p) => {
                if (docFlowCustomerId !== 'all') {
                  const cust = customers.find(c => c.id === docFlowCustomerId);
                  if (cust && p.customerName !== cust.fullName) return false;
                }
                if (docFlowBookingId !== 'all') {
                  const bk = bookings.find(b => b.id === docFlowBookingId);
                  if (bk && p.bookingNumber !== bk.bookingNumber) return false;
                }
                return true;
              });
              selectedItem = matching.find(p => p.id === docFlowSelectedId) || matching[0];
            } else if (docFlowCategory === 'Voucher') {
              itemType = 'voucher';
              const matching = bookings.filter((b) => {
                if (docFlowCustomerId !== 'all' && b.customerId !== docFlowCustomerId) return false;
                if (docFlowBookingId !== 'all' && b.id !== docFlowBookingId) return false;
                return true;
              });
              selectedItem = matching.find(b => b.id === docFlowSelectedId) || matching[0];
            } else {
              itemType = 'invoice';
              const matching = invoices.filter((inv) => {
                if (inv.invoiceType !== docFlowCategory) return false;
                if (docFlowCustomerId !== 'all') {
                  const cust = customers.find(c => c.id === docFlowCustomerId);
                  if (cust && inv.customerName !== cust.fullName) return false;
                }
                if (docFlowBookingId !== 'all' && inv.bookingId !== docFlowBookingId) return false;
                return true;
              });
              selectedItem = matching.find(inv => inv.id === docFlowSelectedId) || matching[0];
            }

            if (!selectedItem) {
              return (
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-500 text-center">
                  No document selected. Choose a valid customer or booking record above.
                </div>
              );
            }

            return (
              <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/40 p-3 rounded-lg">
                <div className="text-xs space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Selected Document:</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {itemType === 'invoice' ? selectedItem.invoiceNumber : itemType === 'receipt' ? selectedItem.receiptNumber : `VOUCHER-${selectedItem.bookingNumber}`}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 font-mono">
                      {itemType === 'invoice' ? selectedItem.invoiceType : itemType === 'receipt' ? 'Official Payment Receipt' : 'Service Voucher'}
                    </span>
                  </div>
                  <div className="text-zinc-400">
                    Customer: <strong className="text-zinc-200">{selectedItem.customerName}</strong> • Phone: {selectedItem.customerPhone || selectedItem.phone || '-'}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDocCategory(docFlowCategory);
                      setActiveTab('documents-center');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Document</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (itemType === 'invoice') {
                        generateInvoicePDF(selectedItem, invoices);
                      } else if (itemType === 'receipt') {
                        const linked = invoices.find(i => i.invoiceNumber === selectedItem.invoiceNumber || i.bookingNumber === selectedItem.bookingNumber);
                        generatePaymentReceiptPDF(selectedItem, linked);
                      } else {
                        // import generateVoucherPDF or print window
                        const origTitle = document.title;
                        const sanitizedCustomer = (selectedItem.customerName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
                        document.title = `Voucher_${selectedItem.bookingNumber}_${sanitizedCustomer}`;
                        const printWindow = window.open('', '_blank', 'width=880,height=1100');
                        if (printWindow) {
                          printWindow.document.write(`
                            <!DOCTYPE html>
                            <html>
                              <head>
                                <title>Voucher_${selectedItem.bookingNumber}_${sanitizedCustomer}</title>
                                <meta charset="utf-8" />
                                <style>
                                  @page { size: A4; margin: 10mm; }
                                  body { font-family: sans-serif; padding: 20px; color: #0f172a; }
                                  .header { border-bottom: 2px solid #d97706; padding-bottom: 10px; margin-bottom: 15px; display: flex; justify-content: space-between; }
                                  .title { font-size: 20px; font-weight: 900; color: #b45309; }
                                  .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 15px; }
                                  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                                  th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 11px; }
                                  th { background: #0f172a; color: #fbbf24; }
                                </style>
                              </head>
                              <body>
                                <div class="header">
                                  <div>
                                    <div class="title">KMZ TRAVELS & TOURS</div>
                                    <div style="font-size: 12px; font-weight: bold; color: #b45309;">OFFICIAL SERVICE VOUCHER</div>
                                    <div style="font-size: 10px; color: #64748b;">DTS Lic # 8820 • Faisalabad</div>
                                  </div>
                                  <div style="text-align: right;">
                                    <div style="font-weight: 900; font-family: monospace;">REF: ${selectedItem.bookingNumber}</div>
                                    <div style="font-size: 11px;">Date: ${selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleDateString() : '2026-08-14'}</div>
                                  </div>
                                </div>
                                <div class="box">
                                  <strong>Pilgrim / Guest Name:</strong> ${selectedItem.customerName}<br/>
                                  <strong>Phone:</strong> ${selectedItem.customerPhone}<br/>
                                  <strong>Package:</strong> ${selectedItem.packageName} (${selectedItem.paxAdults} Adults, ${selectedItem.paxChildren} Children, ${selectedItem.paxInfants} Infants)<br/>
                                  <strong>Travel Dates:</strong> ${selectedItem.departureDate} to ${selectedItem.returnDate}
                                </div>
                                <h3>Reserved Services & Accommodations</h3>
                                <table>
                                  <thead>
                                    <tr>
                                      <th>Service</th>
                                      <th>Details & Specifications</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td><strong>Umrah Package</strong></td>
                                      <td>${selectedItem.packageName}</td>
                                    </tr>
                                    ${selectedItem.hotels && selectedItem.hotels.length > 0 ? selectedItem.hotels.map((h: any) => `
                                      <tr>
                                        <td><strong>Hotel (${h.city})</strong></td>
                                        <td>${h.hotelName} • Check-in: ${h.checkIn} • Check-out: ${h.checkOut} • Room: ${h.roomType} (${h.nights} Nights)</td>
                                      </tr>
                                    `).join('') : ''}
                                    ${selectedItem.flight ? `
                                      <tr>
                                        <td><strong>Flight Reservation</strong></td>
                                        <td>${selectedItem.flight.airline} (${selectedItem.flight.flightNumber}) • Route: ${selectedItem.flight.departureAirport} to ${selectedItem.flight.arrivalAirport} • PNR: ${selectedItem.flight.pnr}</td>
                                      </tr>
                                    ` : ''}
                                    ${selectedItem.visa ? `
                                      <tr>
                                        <td><strong>Visa Status</strong></td>
                                        <td>Type: ${selectedItem.visa.visaType} • Status: ${selectedItem.visa.status}</td>
                                      </tr>
                                    ` : ''}
                                    ${selectedItem.transport ? `
                                      <tr>
                                        <td><strong>Ground Transport</strong></td>
                                        <td>${selectedItem.transport.transportType} • Route: ${selectedItem.transport.route}</td>
                                      </tr>
                                    ` : ''}
                                  </tbody>
                                </table>
                                <div style="margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px;">
                                  <div>
                                    <strong>Issued by:</strong> KMZ Travels Operations Desk<br/>
                                    <strong>Contact:</strong> 03018647596
                                  </div>
                                  <div style="border: 2px dashed #b45309; padding: 6px 12px; font-weight: bold; color: #b45309;">
                                    KMZ OFFICIAL SEAL
                                  </div>
                                </div>
                                <script>
                                  window.onload = function() { setTimeout(function() { window.print(); }, 250); };
                                </script>
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                        }
                        setTimeout(() => { document.title = origTitle; }, 1000);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Document</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (itemType === 'invoice') {
                        generateInvoicePDF(selectedItem, invoices);
                      } else if (itemType === 'receipt') {
                        const linked = invoices.find(i => i.invoiceNumber === selectedItem.invoiceNumber || i.bookingNumber === selectedItem.bookingNumber);
                        generatePaymentReceiptPDF(selectedItem, linked);
                      } else {
                        // generate voucher print/PDF
                        setActiveDocCategory('Voucher');
                        setActiveTab('documents-center');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Multi-Bank Accounts & Cash Liquidity Overview */}
      <div className="bg-zinc-900/90 rounded-2xl border border-amber-500/20 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-100 text-base">Bank Accounts & Cash Desks Summary</h3>
              <p className="text-xs text-zinc-400">Real-time balances across active corporate bank accounts and cash counter</p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('bank-accounts')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-all self-start sm:self-auto"
          >
            <span>Manage Accounts & Transfers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {bankAccounts.map((acc) => {
            const balance = getBankAccountBalance(acc.id);
            const isCash = acc.accountType === 'Cash Account';
            return (
              <div
                key={acc.id}
                onClick={() => setActiveTab('bank-accounts')}
                className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                  isCash
                    ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50'
                    : 'bg-zinc-950/60 border-zinc-800 hover:border-amber-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-zinc-400 truncate max-w-[130px]">{acc.bankName}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    isCash ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {acc.accountType}
                  </span>
                </div>
                <div className="text-lg font-bold text-zinc-100 font-mono tracking-tight">
                  PKR {balance.toLocaleString()}
                </div>
                <div className="text-[11px] font-mono text-zinc-500 mt-1 truncate">
                  A/C: {acc.accountNumber}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-zinc-900/90 rounded-2xl border border-amber-500/20 overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-amber-500/15 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-amber-400" />
              Recent Umrah & Hajj Bookings
            </h3>
            <p className="text-xs text-zinc-400">
              Showing active bookings with multi-hotel reservations, flights, visas & balance due.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('bookings')}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            View All Bookings <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="p-4">Booking Ref</th>
                <th className="p-4">Pilgrim Name</th>
                <th className="p-4">Package</th>
                <th className="p-4">Hotels Booked</th>
                <th className="p-4">Dates</th>
                <th className="p-4">Total / Paid</th>
                <th className="p-4">Visa Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-500">
                    No bookings found matching your search/filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-amber-300">
                      {b.bookingNumber}
                    </td>
                    <td className="p-4 font-semibold text-white">
                      <div>{b.customerName}</div>
                      <div className="text-[10px] text-zinc-400">{b.customerPhone}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-zinc-200 line-clamp-1">{b.packageName}</div>
                      <span className="text-[10px] text-amber-400 font-semibold uppercase">
                        {b.paxAdults} Adults • {b.packageType}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {b.hotels.map((h, idx) => (
                          <div
                            key={idx}
                            className="text-[11px] bg-zinc-950/80 px-2 py-1 rounded border border-zinc-800 text-zinc-300"
                          >
                            <span className="font-bold text-amber-400">{h.city}:</span>{' '}
                            {h.hotelName} ({h.roomType}, {h.nights}N)
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-[11px]">
                      <div>{b.departureDate}</div>
                      <div className="text-zinc-500">to {b.returnDate}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white">
                        PKR {b.totalAmount.toLocaleString()}
                      </div>
                      <div
                        className={`text-[10px] font-semibold ${
                          b.balanceAmount === 0 ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        Paid: PKR {b.paidAmount.toLocaleString()}
                        {b.balanceAmount > 0 && ` (Bal: ${b.balanceAmount.toLocaleString()})`}
                      </div>
                    </td>
                    <td className="p-4">
                      <GoldBadge
                        variant={
                          b.visa.status === 'Issued' || b.visa.status === 'Approved'
                            ? 'emerald'
                            : 'amber'
                        }
                      >
                        {b.visa.status}
                      </GoldBadge>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setActiveTab('bookings')}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30 transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BILLING MODULE 1: INVOICES (Service Billing)                              */}
      {/* ========================================================================= */}
      <div className="bg-zinc-900/90 rounded-2xl border border-amber-500/20 overflow-hidden shadow-2xl space-y-4 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-amber-500/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-serif text-white">INVOICES</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  SERVICE BILLING
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Customer service invoices for Umrah Package, Hotel, Flight, Visa, Transport & Extra Services.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('invoices')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <span>Manage Service Invoices</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice Categories Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
          {[
            { id: 'All', label: 'All Invoices' },
            { id: 'Umrah Package Invoice', label: 'Umrah Package' },
            { id: 'Hotel Invoice', label: 'Hotel Booking' },
            { id: 'Flight Invoice', label: 'Flight Ticket' },
            { id: 'Visa Invoice', label: 'Visa Processing' },
            { id: 'Transport Invoice', label: 'Transport' },
            { id: 'Extra Services Invoice', label: 'Extra Services' },
            { id: 'Consolidated Total Invoice', label: 'Consolidated' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setDashInvoiceFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                dashInvoiceFilter === cat.id
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'bg-zinc-950/80 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Invoices Financial Summary Header */}
        {(() => {
          const matchingInvoices = invoices.filter((i) => {
            if (dashInvoiceFilter !== 'All' && i.invoiceType !== dashInvoiceFilter) return false;
            if (searchTerm) {
              const term = searchTerm.toLowerCase();
              return (
                i.invoiceNumber.toLowerCase().includes(term) ||
                i.customerName.toLowerCase().includes(term) ||
                i.bookingNumber.toLowerCase().includes(term)
              );
            }
            return true;
          });

          const totalBilled = matchingInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
          const totalPaid = matchingInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
          const totalRemaining = matchingInvoices.reduce((sum, i) => sum + i.balanceDue, 0);

          return (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Total Billed Services</span>
                  <span className="text-sm font-extrabold text-white font-mono">PKR {totalBilled.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Total Amount Paid</span>
                  <span className="text-sm font-extrabold text-emerald-400 font-mono">PKR {totalPaid.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Remaining Invoice Balance</span>
                  <span className="text-sm font-extrabold text-rose-400 font-mono">PKR {totalRemaining.toLocaleString()}</span>
                </div>
              </div>

              {/* Service Invoices Table */}
              <div className="overflow-x-auto rounded-xl border border-zinc-800">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
                    <tr>
                      <th className="p-3">Invoice #</th>
                      <th className="p-3">Customer / Pilgrim</th>
                      <th className="p-3">Service Category</th>
                      <th className="p-3 text-right">Total Amount</th>
                      <th className="p-3 text-right">Paid</th>
                      <th className="p-3 text-right">Remaining Balance</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
                    {matchingInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-zinc-500 font-sans">
                          No service invoices found for this category or filter.
                        </td>
                      </tr>
                    ) : (
                      matchingInvoices.slice(0, 8).map((inv) => (
                        <tr key={inv.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="p-3 font-bold text-amber-300">{inv.invoiceNumber}</td>
                          <td className="p-3 font-sans font-semibold text-white">
                            <div>{inv.customerName}</div>
                            <div className="text-[10px] text-zinc-500 font-mono">Booking #{inv.bookingNumber}</div>
                          </td>
                          <td className="p-3 font-sans">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              {(inv.invoiceType || '').replace(' Invoice', '')}
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold text-white">PKR {inv.totalAmount.toLocaleString()}</td>
                          <td className="p-3 text-right font-bold text-emerald-400">PKR {inv.paidAmount.toLocaleString()}</td>
                          <td className="p-3 text-right font-bold text-rose-400">PKR {inv.balanceDue.toLocaleString()}</td>
                          <td className="p-3 text-center font-sans">
                            <GoldBadge
                              variant={
                                inv.status === 'Paid' ? 'emerald' : inv.status === 'Partially Paid' ? 'amber' : 'rose'
                              }
                            >
                              {inv.status}
                            </GoldBadge>
                          </td>
                          <td className="p-3 text-right font-sans">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setViewingInvoice(inv)}
                                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                                title="View Full Invoice Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => generateInvoicePDF(inv, invoices)}
                                className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Print Invoice PDF"
                              >
                                <Printer className="w-3.5 h-3.5 text-amber-400" />
                                <span>Print</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => generateInvoicePDF(inv, invoices)}
                                className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition-colors cursor-pointer"
                                title="Download PDF"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          );
        })()}
      </div>

      {/* ========================================================================= */}
      {/* BILLING MODULE 2: PAYMENT RECEIPTS (Money Received Proof)                 */}
      {/* ========================================================================= */}
      <div className="bg-zinc-900/90 rounded-2xl border border-emerald-500/20 overflow-hidden shadow-2xl space-y-4 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-emerald-500/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-serif text-white">PAYMENT RECEIPTS</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PROOF OF MONEY RECEIVED
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Official receipts generated strictly upon receiving money from customers, linked to invoices & bookings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('payments')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-black text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <span>Manage Payment Receipts</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Payment Methods Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
          {[
            { id: 'All', label: 'All Receipts' },
            { id: 'Cash', label: 'Cash Receipts' },
            { id: 'Bank Transfer', label: 'Bank Transfers' },
            { id: 'JazzCash', label: 'JazzCash' },
            { id: 'EasyPaisa', label: 'EasyPaisa' },
          ].map((method) => (
            <button
              key={method.id}
              onClick={() => setDashPaymentMethodFilter(method.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                dashPaymentMethodFilter === method.id
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                  : 'bg-zinc-950/80 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {method.label}
            </button>
          ))}
        </div>

        {/* Payment Receipts Summary Banner */}
        {(() => {
          const matchingPayments = payments.filter((p) => {
            if (dashPaymentMethodFilter !== 'All' && p.paymentMethod !== dashPaymentMethodFilter) return false;
            if (searchTerm) {
              const term = searchTerm.toLowerCase();
              return (
                p.receiptNumber.toLowerCase().includes(term) ||
                p.customerName.toLowerCase().includes(term) ||
                p.bookingNumber.toLowerCase().includes(term) ||
                (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(term))
              );
            }
            return true;
          });

          const totalReceiptsCount = matchingPayments.length;
          const totalMoneyReceived = matchingPayments.reduce((sum, p) => sum + p.amount, 0);

          return (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Total Official Receipts</span>
                  <span className="text-sm font-extrabold text-amber-300 font-mono">{totalReceiptsCount} Receipts Issued</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Total Money Received</span>
                  <span className="text-sm font-extrabold text-emerald-400 font-mono">PKR {totalMoneyReceived.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Supported Payment Channels</span>
                  <span className="text-xs font-semibold text-zinc-300">Cash • Bank • JazzCash • EasyPaisa</span>
                </div>
              </div>

              {/* Payment Receipts Table */}
              <div className="overflow-x-auto rounded-xl border border-zinc-800">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
                    <tr>
                      <th className="p-3">Receipt #</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Customer / Pilgrim</th>
                      <th className="p-3">Linked Invoice / Booking</th>
                      <th className="p-3 text-right">Amount Received</th>
                      <th className="p-3">Payment Method</th>
                      <th className="p-3 text-right">Remaining Balance</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
                    {matchingPayments.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-zinc-500 font-sans">
                          No payment receipts found for this method or filter.
                        </td>
                      </tr>
                    ) : (
                      matchingPayments.slice(0, 8).map((p) => {
                        const linkedInv = invoices.find(
                          (i) => i.id === p.invoiceId || i.invoiceNumber === p.invoiceNumber || i.bookingId === p.bookingId
                        );
                        const remBal = p.balanceRemaining !== undefined ? p.balanceRemaining : (linkedInv ? linkedInv.balanceDue : 0);

                        return (
                          <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                            <td className="p-3 font-bold text-emerald-400">{p.receiptNumber}</td>
                            <td className="p-3 text-zinc-300">{p.date}</td>
                            <td className="p-3 font-sans font-semibold text-white">{p.customerName}</td>
                            <td className="p-3 font-mono text-zinc-400">
                              <div className="font-bold text-amber-300">{p.invoiceNumber || linkedInv?.invoiceNumber || 'Linked Invoice'}</div>
                              <div className="text-[10px] text-zinc-500">Booking #{p.bookingNumber}</div>
                            </td>
                            <td className="p-3 text-right font-bold text-emerald-400">PKR {p.amount.toLocaleString()}</td>
                            <td className="p-3 font-sans">
                              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                {p.paymentMethod}
                              </span>
                            </td>
                            <td className="p-3 text-right font-bold text-zinc-300">PKR {remBal.toLocaleString()}</td>
                            <td className="p-3 text-right font-sans">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setViewingPayment(p)}
                                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                                  title="View Receipt Voucher"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => generatePaymentReceiptPDF(p, linkedInv)}
                                  className="px-2 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Print Payment Receipt PDF"
                                >
                                  <Printer className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Receipt PDF</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          );
        })()}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: VIEW INVOICE DETAILS                                               */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!viewingInvoice}
        onClose={() => setViewingInvoice(null)}
        title={`Service Invoice Details — #${viewingInvoice?.invoiceNumber}`}
        subtitle={`Billed to ${viewingInvoice?.customerName} for ${viewingInvoice?.invoiceType}`}
      >
        {viewingInvoice && (
          <div className="space-y-4 text-xs text-zinc-300">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase block">Customer Information</span>
                <div className="font-bold text-white text-sm mt-0.5">{viewingInvoice.customerName}</div>
                <div>Phone: {viewingInvoice.customerPhone}</div>
                <div>Booking Ref: #{viewingInvoice.bookingNumber}</div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-amber-400 uppercase block">Invoice Overview</span>
                <div className="font-mono font-bold text-amber-300 text-sm mt-0.5">{viewingInvoice.invoiceNumber}</div>
                <div>Issue Date: {viewingInvoice.issueDate}</div>
                <div>Due Date: {viewingInvoice.dueDate}</div>
              </div>
            </div>

            {/* Billed Items List */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-zinc-200">Billed Services Breakdown:</span>
              <div className="rounded-xl border border-zinc-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] font-semibold">
                    <tr>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Unit Price</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 font-mono text-[11px]">
                    {viewingInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-sans font-medium text-white">{item.description}</td>
                        <td className="p-2.5 text-center">{item.qty}</td>
                        <td className="p-2.5 text-right">PKR {item.unitPrice.toLocaleString()}</td>
                        <td className="p-2.5 text-right font-bold text-amber-300">PKR {item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex justify-between items-center font-mono">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase block font-sans">Payment Status</span>
                <GoldBadge variant={viewingInvoice.status === 'Paid' ? 'emerald' : 'amber'}>
                  {viewingInvoice.status}
                </GoldBadge>
              </div>

              <div className="text-right space-y-0.5">
                <div className="text-xs text-zinc-400">Total Amount: PKR {viewingInvoice.totalAmount.toLocaleString()}</div>
                <div className="text-xs text-emerald-400 font-bold">Paid: PKR {viewingInvoice.paidAmount.toLocaleString()}</div>
                <div className="text-sm text-rose-400 font-extrabold">Remaining Due: PKR {viewingInvoice.balanceDue.toLocaleString()}</div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setViewingInvoice(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => generateInvoicePDF(viewingInvoice, invoices)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-black flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Download Invoice PDF</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: VIEW PAYMENT RECEIPT VOUCHER                                      */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!viewingPayment}
        onClose={() => setViewingPayment(null)}
        title={`Official Payment Receipt Voucher — #${viewingPayment?.receiptNumber}`}
        subtitle={`Proof of money received from ${viewingPayment?.customerName}`}
      >
        {viewingPayment && (
          <div className="space-y-4 text-xs text-zinc-300">
            <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-widest block">
                Official Amount Received
              </span>
              <div className="text-3xl font-black font-mono text-emerald-400">
                PKR {viewingPayment.amount.toLocaleString()}
              </div>
              <div className="text-xs font-bold text-white font-sans">
                Method: {viewingPayment.paymentMethod}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase block">Received From</span>
                <div className="font-bold text-white text-sm">{viewingPayment.customerName}</div>
                <div>Booking Ref: #{viewingPayment.bookingNumber}</div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-amber-400 uppercase block">Receipt Metadata</span>
                <div className="font-mono font-bold text-emerald-400">{viewingPayment.receiptNumber}</div>
                <div>Date: {viewingPayment.date}</div>
                <div>Ref #: {viewingPayment.referenceNumber}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
              <div className="text-zinc-400">Linked Invoice: <strong className="text-amber-300 font-mono">{viewingPayment.invoiceNumber || 'Linked Invoice'}</strong></div>
              <div className="text-zinc-400">Remaining Balance on Invoice: <strong className="text-rose-400 font-mono">PKR {(viewingPayment.balanceRemaining !== undefined ? viewingPayment.balanceRemaining : 0).toLocaleString()}</strong></div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setViewingPayment(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const linkedInv = invoices.find(
                    (i) => i.id === viewingPayment.invoiceId || i.invoiceNumber === viewingPayment.invoiceNumber || i.bookingId === viewingPayment.bookingId
                  );
                  generatePaymentReceiptPDF(viewingPayment, linkedInv);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-zinc-950 font-black flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Download Receipt PDF</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Hidden File Input for Banner Upload */}
      <input
        type="file"
        ref={bannerFileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/jpg,image/webp,image/gif,image/svg+xml"
        className="hidden"
      />

      {/* Dashboard Hero Banner Upload & Preview Modal */}
      <Modal
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        title="Dashboard Cover & Hero Image"
        subtitle="Upload a custom hero banner image to personalize your Executive Operations Dashboard."
      >
        <div className="space-y-4 text-xs">
          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-medium">
              {uploadError}
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Dashboard cover image saved permanently!</span>
            </div>
          )}

          {/* Live Preview Container */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-2 flex items-center justify-between">
              <span>Image Preview</span>
              <span className="text-[10px] text-amber-400">Max file size 10MB (Auto-compressed)</span>
            </label>

            {previewBannerUrl ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-zinc-950 shadow-2xl h-48 group">
                <img
                  src={previewBannerUrl}
                  alt="Banner Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent flex items-end justify-between p-4">
                  <span className="text-[11px] font-mono text-amber-300 bg-zinc-950/90 px-2.5 py-1 rounded-lg border border-amber-500/40 shadow">
                    Live Banner Preview
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => bannerFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1 shadow transition-all cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" /> Replace File
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewBannerUrl('')}
                      className="px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1 shadow transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => bannerFileInputRef.current?.click()}
                className="w-full h-44 border-2 border-dashed border-zinc-700 hover:border-amber-400/60 rounded-2xl bg-zinc-950/60 hover:bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-2 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="font-bold text-white text-xs block">Click to Upload Cover Image</span>
                  <span className="text-[10px] text-zinc-500">Supports JPG, PNG, WebP, GIF & SVG</span>
                </div>
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
            {companySettings?.dashboardBannerUrl ? (
              <button
                type="button"
                onClick={handleDeleteBanner}
                className="px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Existing Banner</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveBanner}
                disabled={isUploadingBanner}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-zinc-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{isUploadingBanner ? 'Uploading & Saving...' : 'Save Banner Image'}</span>
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
