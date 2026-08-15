import React, { useState, useMemo } from 'react';
import {
  Printer,
  Download,
  FileText,
  Receipt,
  Ticket,
  Building,
  Plane,
  FileCheck2,
  Bus,
  Package,
  Layers,
  Search,
  User,
  Calendar,
  Filter,
  CheckCircle,
  Eye,
  RefreshCw,
  Sparkles,
  Phone,
  MapPin,
  Clock,
  CreditCard,
  Building2,
  HelpCircle,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Invoice, Payment, Booking, Customer, InvoiceType } from '../../types';
import {
  generateInvoicePDF,
  generatePaymentReceiptPDF,
  generateVoucherPDF,
} from '../../utils/pdfGenerator';

type DocTypeFilter =
  | 'All Invoices'
  | 'Hotel Invoice'
  | 'Flight Invoice'
  | 'Visa Invoice'
  | 'Umrah Package Invoice'
  | 'Transport Invoice'
  | 'Extra Service Invoice'
  | 'Total/Consolidated Invoice'
  | 'Payment Receipt'
  | 'Voucher';

export const DocumentsCenterView: React.FC = () => {
  const { invoices, payments, bookings, customers, packages, companySettings } = useData();

  // Navigation / Selection States
  const [selectedDocCategory, setSelectedDocCategory] = useState<DocTypeFilter>('All Invoices');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('all');
  const [selectedBookingId, setSelectedBookingId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Selected specific Document State
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('');
  const [selectedVoucherBookingId, setSelectedVoucherBookingId] = useState<string>('');

  // 1. Filtered list of Customers
  const filteredCustomers = useMemo(() => {
    return customers.sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [customers]);

  // 2. Filtered list of Bookings
  const filteredBookings = useMemo(() => {
    let list = bookings;
    if (selectedCustomerId !== 'all') {
      list = list.filter((b) => b.customerId === selectedCustomerId);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookings, selectedCustomerId]);

  // 3. Filtered Invoices according to Category, Customer, Booking, and Search
  const categoryInvoices = useMemo(() => {
    let list = invoices;

    // Filter by document type
    if (selectedDocCategory === 'Hotel Invoice') {
      list = list.filter((i) => i.invoiceType === 'Hotel Invoice' || i.items?.some((item) => item.serviceCategory === 'Hotel'));
    } else if (selectedDocCategory === 'Flight Invoice') {
      list = list.filter((i) => i.invoiceType === 'Flight Invoice' || i.items?.some((item) => item.serviceCategory === 'Flight'));
    } else if (selectedDocCategory === 'Visa Invoice') {
      list = list.filter((i) => i.invoiceType === 'Visa Invoice' || i.items?.some((item) => item.serviceCategory === 'Visa'));
    } else if (selectedDocCategory === 'Umrah Package Invoice') {
      list = list.filter((i) => i.invoiceType === 'Umrah Package Invoice' || i.items?.some((item) => item.serviceCategory === 'Package'));
    } else if (selectedDocCategory === 'Transport Invoice') {
      list = list.filter((i) => i.invoiceType === 'Transport Invoice' || i.items?.some((item) => item.serviceCategory === 'Transport'));
    } else if (selectedDocCategory === 'Extra Service Invoice') {
      list = list.filter((i) => i.invoiceType === 'Extra Services Invoice' || i.items?.some((item) => item.serviceCategory === 'Extra Services'));
    } else if (selectedDocCategory === 'Total/Consolidated Invoice') {
      list = list.filter((i) => i.invoiceType === 'Consolidated Total Invoice');
    }

    // Filter by customer
    if (selectedCustomerId !== 'all') {
      list = list.filter((i) => i.customerId === selectedCustomerId);
    }

    // Filter by booking
    if (selectedBookingId !== 'all') {
      list = list.filter((i) => i.bookingId === selectedBookingId);
    }

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(q) ||
          i.customerName.toLowerCase().includes(q) ||
          i.bookingNumber.toLowerCase().includes(q)
      );
    }

    return list;
  }, [invoices, selectedDocCategory, selectedCustomerId, selectedBookingId, searchTerm]);

  // 4. Filtered Payments
  const categoryPayments = useMemo(() => {
    let list = payments;

    if (selectedCustomerId !== 'all') {
      list = list.filter((p) => p.customerId === selectedCustomerId);
    }

    if (selectedBookingId !== 'all') {
      list = list.filter((p) => p.bookingId === selectedBookingId);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.receiptNumber.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q) ||
          p.bookingNumber.toLowerCase().includes(q) ||
          (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(q))
      );
    }

    return list;
  }, [payments, selectedCustomerId, selectedBookingId, searchTerm]);

  // 5. Filtered Voucher Bookings
  const categoryVouchers = useMemo(() => {
    let list = bookings;

    if (selectedCustomerId !== 'all') {
      list = list.filter((b) => b.customerId === selectedCustomerId);
    }

    if (selectedBookingId !== 'all') {
      list = list.filter((b) => b.id === selectedBookingId);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (b) =>
          b.bookingNumber.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.packageName.toLowerCase().includes(q)
      );
    }

    return list;
  }, [bookings, selectedCustomerId, selectedBookingId, searchTerm]);

  // Ensure active selection when category or filters change
  const activeInvoice: Invoice | null = useMemo(() => {
    if (selectedDocCategory === 'Payment Receipt' || selectedDocCategory === 'Voucher') return null;
    if (selectedInvoiceId) {
      const found = categoryInvoices.find((i) => i.id === selectedInvoiceId);
      if (found) return found;
    }
    return categoryInvoices[0] || null;
  }, [categoryInvoices, selectedInvoiceId, selectedDocCategory]);

  const activePayment: Payment | null = useMemo(() => {
    if (selectedDocCategory !== 'Payment Receipt') return null;
    if (selectedPaymentId) {
      const found = categoryPayments.find((p) => p.id === selectedPaymentId);
      if (found) return found;
    }
    return categoryPayments[0] || null;
  }, [categoryPayments, selectedPaymentId, selectedDocCategory]);

  const activeVoucherBooking: Booking | null = useMemo(() => {
    if (selectedDocCategory !== 'Voucher') return null;
    if (selectedVoucherBookingId) {
      const found = categoryVouchers.find((b) => b.id === selectedVoucherBookingId);
      if (found) return found;
    }
    return categoryVouchers[0] || null;
  }, [categoryVouchers, selectedVoucherBookingId, selectedDocCategory]);

  // Linked invoice for active payment if available
  const linkedPaymentInvoice = useMemo(() => {
    if (!activePayment) return null;
    if (activePayment.invoiceId) {
      return invoices.find((i) => i.id === activePayment.invoiceId) || null;
    }
    if (activePayment.invoiceNumber) {
      return invoices.find((i) => i.invoiceNumber === activePayment.invoiceNumber) || null;
    }
    return invoices.find((i) => i.bookingId === activePayment.bookingId) || null;
  }, [activePayment, invoices]);

  // Action Handlers
  const handlePrint = () => {
    if (selectedDocCategory === 'Payment Receipt' && activePayment) {
      generatePaymentReceiptPDF(activePayment, linkedPaymentInvoice);
    } else if (selectedDocCategory === 'Voucher' && activeVoucherBooking) {
      generateVoucherPDF(activeVoucherBooking, packages);
    } else if (activeInvoice) {
      generateInvoicePDF(activeInvoice, invoices);
    } else {
      alert('Please select a valid document record to print.');
    }
  };

  const handleDownloadPDF = () => {
    handlePrint();
  };

  const docCategoryTabs: { id: DocTypeFilter; label: string; icon: any; count: number }[] = [
    { id: 'All Invoices', label: 'All Invoices', icon: FileText, count: invoices.length },
    { id: 'Hotel Invoice', label: 'Hotel Invoices', icon: Building, count: invoices.filter((i) => i.invoiceType === 'Hotel Invoice' || i.items?.some((item) => item.serviceCategory === 'Hotel')).length },
    { id: 'Flight Invoice', label: 'Flight Invoices', icon: Plane, count: invoices.filter((i) => i.invoiceType === 'Flight Invoice' || i.items?.some((item) => item.serviceCategory === 'Flight')).length },
    { id: 'Visa Invoice', label: 'Visa Invoices', icon: FileCheck2, count: invoices.filter((i) => i.invoiceType === 'Visa Invoice' || i.items?.some((item) => item.serviceCategory === 'Visa')).length },
    { id: 'Umrah Package Invoice', label: 'Package Invoices', icon: Package, count: invoices.filter((i) => i.invoiceType === 'Umrah Package Invoice' || i.items?.some((item) => item.serviceCategory === 'Package')).length },
    { id: 'Transport Invoice', label: 'Transport Invoices', icon: Bus, count: invoices.filter((i) => i.invoiceType === 'Transport Invoice' || i.items?.some((item) => item.serviceCategory === 'Transport')).length },
    { id: 'Extra Service Invoice', label: 'Extra Services', icon: Layers, count: invoices.filter((i) => i.invoiceType === 'Extra Services Invoice' || i.items?.some((item) => item.serviceCategory === 'Extra Services')).length },
    { id: 'Total/Consolidated Invoice', label: 'Consolidated', icon: Receipt, count: invoices.filter((i) => i.invoiceType === 'Consolidated Total Invoice').length },
    { id: 'Payment Receipt', label: 'Payment Receipts', icon: CreditCard, count: payments.length },
    { id: 'Voucher', label: 'Service Vouchers', icon: Ticket, count: bookings.length },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/40 border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5" /> Official Document & Print Hub
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white font-serif tracking-tight">
              Documents & Print Center
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Select, preview, print, and export high-resolution standalone PDF invoices, payment receipts, and travel service vouchers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              disabled={!activeInvoice && !activePayment && !activeVoucherBooking}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-zinc-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95 text-sm"
            >
              <Printer className="w-4 h-4" /> Print Document
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={!activeInvoice && !activePayment && !activeVoucherBooking}
              className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 text-sm"
            >
              <Download className="w-4 h-4 text-blue-400" /> Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Category Selection Tabs */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-2 shadow-lg backdrop-blur-md overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-1 min-w-max">
          {docCategoryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedDocCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedDocCategory(tab.id);
                  setSelectedInvoiceId('');
                  setSelectedPaymentId('');
                  setSelectedVoucherBookingId('');
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20 scale-[1.02]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-950' : 'text-amber-400'}`} />
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                    isActive ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Selection Controls */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Customer Filter */}
        <div>
          <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <User className="w-3.5 h-3.5" /> 1. Select Customer
          </label>
          <select
            value={selectedCustomerId}
            onChange={(e) => {
              setSelectedCustomerId(e.target.value);
              setSelectedBookingId('all');
            }}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="all">-- All Customers --</option>
            {filteredCustomers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} ({c.phone})
              </option>
            ))}
          </select>
        </div>

        {/* Booking Filter */}
        <div>
          <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> 2. Select Booking
          </label>
          <select
            value={selectedBookingId}
            onChange={(e) => setSelectedBookingId(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="all">-- All Bookings --</option>
            {filteredBookings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.bookingNumber} - {b.customerName} ({b.packageName})
              </option>
            ))}
          </select>
        </div>

        {/* Document Selector */}
        <div>
          <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> 3. Select Exact Document
          </label>
          {selectedDocCategory === 'Payment Receipt' ? (
            <select
              value={activePayment?.id || ''}
              onChange={(e) => setSelectedPaymentId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono font-bold focus:border-amber-500 focus:outline-none"
            >
              {categoryPayments.length === 0 ? (
                <option value="">No receipt records found</option>
              ) : (
                categoryPayments.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.receiptNumber} | {p.customerName} | PKR {p.amount.toLocaleString()} ({p.date})
                  </option>
                ))
              )}
            </select>
          ) : selectedDocCategory === 'Voucher' ? (
            <select
              value={activeVoucherBooking?.id || ''}
              onChange={(e) => setSelectedVoucherBookingId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono font-bold focus:border-amber-500 focus:outline-none"
            >
              {categoryVouchers.length === 0 ? (
                <option value="">No voucher bookings found</option>
              ) : (
                categoryVouchers.map((b) => (
                  <option key={b.id} value={b.id}>
                    VOUCH-{b.bookingNumber} | {b.customerName} | {b.packageName}
                  </option>
                ))
              )}
            </select>
          ) : (
            <select
              value={activeInvoice?.id || ''}
              onChange={(e) => setSelectedInvoiceId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono font-bold focus:border-amber-500 focus:outline-none"
            >
              {categoryInvoices.length === 0 ? (
                <option value="">No invoices found for filter</option>
              ) : (
                categoryInvoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} | {inv.customerName} | PKR {inv.totalAmount.toLocaleString()} ({inv.invoiceType})
                  </option>
                ))
              )}
            </select>
          )}
        </div>

        {/* Search Bar & Reset */}
        <div>
          <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Search className="w-3.5 h-3.5" /> Quick Search
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search number, name, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCustomerId('all');
                setSelectedBookingId('all');
                setSelectedInvoiceId('');
                setSelectedPaymentId('');
                setSelectedVoucherBookingId('');
              }}
              title="Reset Filters"
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl border border-zinc-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Document Preview Container */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 md:p-8 shadow-2xl space-y-4">
        {/* Action Header Bar above Document */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 text-xs">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white uppercase tracking-wider">
              Document Live Preview
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-mono font-semibold">
              {selectedDocCategory}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-amber-500 text-zinc-950 font-bold rounded-lg hover:bg-amber-400 transition-all flex items-center gap-1.5 text-xs shadow-md"
            >
              <Printer className="w-3.5 h-3.5" /> Print Live Document
            </button>
          </div>
        </div>

        {/* Live A4 Render Sheet */}
        <div className="bg-zinc-900/50 p-2 md:p-6 rounded-xl overflow-x-auto flex justify-center">
          <div className="w-full max-w-3xl bg-white text-zinc-900 rounded-xl shadow-2xl border border-amber-500/20 p-6 md:p-10 font-sans text-xs leading-relaxed transition-all">
            {/* If Invoices Category */}
            {selectedDocCategory !== 'Payment Receipt' && selectedDocCategory !== 'Voucher' && (
              <>
                {activeInvoice ? (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-amber-600 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-amber-600 text-white rounded-xl flex items-center justify-center font-serif font-extrabold text-xl shadow-md">
                          KMZ
                        </div>
                        <div>
                          <h2 className="text-xl font-black font-serif text-zinc-950 tracking-tight">
                            KMZ TRAVELS & TOURS
                          </h2>
                          <div className="inline-block text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-300 rounded px-2 py-0.5 uppercase tracking-wide mt-0.5">
                            {activeInvoice.invoiceType}
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-1">
                            P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad • DTS Lic # 8820
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-black font-mono text-amber-700">
                          {activeInvoice.invoiceNumber}
                        </div>
                        <div className="text-[11px] font-bold text-zinc-700 mt-0.5">
                          Booking #: <span className="font-mono text-amber-700">{activeInvoice.bookingNumber}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">Issue Date: {activeInvoice.issueDate}</div>
                        <div className="text-[10px] text-zinc-500">Due Date: {activeInvoice.dueDate}</div>
                      </div>
                    </div>

                    {/* Customer Info Grid */}
                    <div className="grid grid-cols-2 gap-4 bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-[11px]">
                      <div>
                        <div className="text-[9px] font-bold uppercase text-amber-700 tracking-wider mb-1">
                          Billed To (Customer Details)
                        </div>
                        <div className="font-extrabold text-zinc-950 text-xs">{activeInvoice.customerName}</div>
                        <div className="text-zinc-600">Phone: {activeInvoice.customerPhone}</div>
                        {activeInvoice.customerEmail && <div className="text-zinc-600">Email: {activeInvoice.customerEmail}</div>}
                        {activeInvoice.passportNumber && <div className="text-zinc-600 font-mono">Passport #: {activeInvoice.passportNumber}</div>}
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-bold uppercase text-amber-700 tracking-wider mb-1">
                          Payment Status & Overview
                        </div>
                        <div className="inline-block px-2.5 py-1 rounded font-bold text-xs uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 mb-1">
                          {activeInvoice.status}
                        </div>
                        <div className="text-zinc-700">Total Billed: <span className="font-bold font-mono text-zinc-950">PKR {activeInvoice.totalAmount.toLocaleString()}</span></div>
                        <div className="text-emerald-700 font-bold">Total Paid: <span className="font-mono">PKR {activeInvoice.paidAmount.toLocaleString()}</span></div>
                        <div className="text-red-600 font-bold">Balance Due: <span className="font-mono">PKR {activeInvoice.balanceDue.toLocaleString()}</span></div>
                      </div>
                    </div>

                    {/* Items Table */}
                    <div>
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-900 text-amber-400 uppercase text-[9px] font-extrabold tracking-wider">
                            <th className="p-2.5 rounded-l-lg">Description / Particulars</th>
                            <th className="p-2.5 text-center">Qty</th>
                            <th className="p-2.5 text-right">Unit Price (PKR)</th>
                            <th className="p-2.5 text-right rounded-r-lg">Total Amount (PKR)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 text-[11px]">
                          {activeInvoice.items && activeInvoice.items.length > 0 ? (
                            activeInvoice.items.map((item, idx) => (
                              <tr key={idx} className="hover:bg-amber-50/50">
                                <td className="p-2.5 font-medium text-zinc-900">{item.description}</td>
                                <td className="p-2.5 text-center font-mono">{item.qty}</td>
                                <td className="p-2.5 text-right font-mono">PKR {item.unitPrice.toLocaleString()}</td>
                                <td className="p-2.5 text-right font-mono font-bold text-zinc-950">
                                  PKR {item.total.toLocaleString()}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="p-4 text-center text-zinc-500">
                                No specific items itemized
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Consolidated Sub-Invoices if applicable */}
                    {activeInvoice.invoiceType === 'Consolidated Total Invoice' && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <div className="text-[10px] font-bold uppercase text-amber-800 tracking-wide mb-2">
                          Consolidated Service Invoices Summary
                        </div>
                        <div className="space-y-1">
                          {invoices
                            .filter(
                              (i) => i.bookingId === activeInvoice.bookingId && i.invoiceType !== 'Consolidated Total Invoice'
                            )
                            .map((child, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[11px] py-1 border-b border-amber-200/60 last:border-0">
                                <div>
                                  <span className="font-mono font-bold text-amber-800">{child.invoiceNumber}</span>
                                  <span className="ml-2 text-zinc-700">({child.invoiceType})</span>
                                </div>
                                <div className="font-mono font-bold text-zinc-900">
                                  PKR {child.totalAmount.toLocaleString()}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Financial Totals */}
                    <div className="flex justify-between items-start pt-3 border-t border-zinc-200">
                      <div className="max-w-xs text-[10px] text-zinc-500 space-y-1">
                        <div className="font-bold text-zinc-700">Terms & Conditions:</div>
                        <div>1. Non-refundable per Saudi Hajj & Umrah Ministry rules.</div>
                        <div>2. Payment valid only against official company receipt.</div>
                      </div>

                      <div className="w-64 bg-amber-50 border border-amber-300 rounded-xl p-3 space-y-1.5 text-[11px]">
                        <div className="flex justify-between text-zinc-700">
                          <span>Subtotal:</span>
                          <span className="font-mono font-bold">PKR {activeInvoice.subtotal.toLocaleString()}</span>
                        </div>
                        {activeInvoice.discountAmount > 0 && (
                          <div className="flex justify-between text-emerald-700">
                            <span>Discount:</span>
                            <span className="font-mono font-bold">- PKR {activeInvoice.discountAmount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-zinc-950 font-black border-t border-amber-200 pt-1 text-xs">
                          <span className="text-amber-800">Grand Total:</span>
                          <span className="font-mono text-amber-900">PKR {activeInvoice.totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-emerald-700 font-bold">
                          <span>Total Paid:</span>
                          <span className="font-mono">PKR {activeInvoice.paidAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-red-600 font-extrabold border-t border-amber-300 pt-1 text-xs">
                          <span>Balance Due:</span>
                          <span className="font-mono">PKR {activeInvoice.balanceDue.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Official Stamp Footer */}
                    <div className="pt-6 border-t border-zinc-200 flex justify-between items-center text-[10px] text-zinc-500">
                      <div>
                        <div className="font-bold text-zinc-900">Toheed Asghar Shahid (Owner)</div>
                        <div>Managing Director, KMZ Travels & Tours</div>
                      </div>
                      <div className="border-2 border-dashed border-amber-600 text-amber-700 bg-amber-50 font-black px-4 py-1.5 rounded-lg uppercase tracking-wider text-[9px]">
                        KMZ OFFICIAL SERVICE INVOICE
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center text-zinc-500">
                    <HelpCircle className="w-10 h-10 mx-auto text-zinc-300 mb-2" />
                    <p className="font-semibold text-zinc-700">No matching invoice found for selected filter.</p>
                    <p className="text-xs">Adjust customer, booking or category selection above.</p>
                  </div>
                )}
              </>
            )}

            {/* If Payment Receipt Category */}
            {selectedDocCategory === 'Payment Receipt' && (
              <>
                {activePayment ? (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-amber-600 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-amber-600 text-white rounded-xl flex items-center justify-center font-serif font-extrabold text-xl shadow-md">
                          KMZ
                        </div>
                        <div>
                          <h2 className="text-xl font-black font-serif text-zinc-950 tracking-tight">
                            KMZ TRAVELS & TOURS
                          </h2>
                          <div className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 rounded px-2 py-0.5 uppercase tracking-wide mt-0.5">
                            OFFICIAL PAYMENT RECEIPT
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-1">
                            P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad • DTS Lic # 8820
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-black font-mono text-emerald-700">
                          {activePayment.receiptNumber}
                        </div>
                        <div className="text-[11px] font-bold text-zinc-700 mt-0.5">
                          Date: {activePayment.date}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                          Booking #: <span className="font-mono text-amber-700 font-bold">{activePayment.bookingNumber}</span>
                        </div>
                      </div>
                    </div>

                    {/* Receipt Details Grid */}
                    <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 grid grid-cols-2 gap-4 text-[11px]">
                      <div>
                        <div className="text-[9px] font-bold uppercase text-emerald-800 tracking-wider mb-1">
                          Received From Customer
                        </div>
                        <div className="font-extrabold text-zinc-950 text-sm">{activePayment.customerName}</div>
                        <div className="text-zinc-600 mt-0.5">Booking Ref: <span className="font-mono font-bold text-zinc-900">{activePayment.bookingNumber}</span></div>
                        {activePayment.invoiceNumber && (
                          <div className="text-zinc-600">Invoice Ref: <span className="font-mono font-bold text-amber-700">{activePayment.invoiceNumber}</span></div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="text-[9px] font-bold uppercase text-emerald-800 tracking-wider mb-1">
                          Amount Received (PKR)
                        </div>
                        <div className="text-2xl font-black font-mono text-emerald-700">
                          PKR {activePayment.amount.toLocaleString()}
                        </div>
                        <div className="text-xs font-bold text-emerald-900 mt-1">
                          Payment Method: {activePayment.paymentMethod}
                        </div>
                      </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="border border-zinc-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-zinc-900 text-amber-400 uppercase text-[9px] font-extrabold">
                          <tr>
                            <th className="p-2.5">Parameter</th>
                            <th className="p-2.5">Transaction Detail</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 text-[11px]">
                          <tr>
                            <td className="p-2.5 font-bold text-zinc-700">Receipt Ref Number</td>
                            <td className="p-2.5 font-mono font-bold text-amber-700">{activePayment.receiptNumber}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-bold text-zinc-700">Payment Date</td>
                            <td className="p-2.5">{activePayment.date}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-bold text-zinc-700">Payment Mode / Channel</td>
                            <td className="p-2.5 font-semibold text-emerald-800">{activePayment.paymentMethod}</td>
                          </tr>
                          {activePayment.referenceNumber && (
                            <tr>
                              <td className="p-2.5 font-bold text-zinc-700">Bank / Txn Reference #</td>
                              <td className="p-2.5 font-mono">{activePayment.referenceNumber}</td>
                            </tr>
                          )}
                          {activePayment.walletTitle && (
                            <tr>
                              <td className="p-2.5 font-bold text-zinc-700">Account / Wallet Title</td>
                              <td className="p-2.5">{activePayment.walletTitle} ({activePayment.walletNumber})</td>
                            </tr>
                          )}
                          {activePayment.bankAccountName && (
                            <tr>
                              <td className="p-2.5 font-bold text-zinc-700">Deposited To Bank</td>
                              <td className="p-2.5">{activePayment.bankAccountName}</td>
                            </tr>
                          )}
                          <tr>
                            <td className="p-2.5 font-bold text-zinc-700">Remaining Balance Due</td>
                            <td className="p-2.5 font-mono font-bold text-red-600">
                              PKR {(activePayment.balanceRemaining ?? (linkedPaymentInvoice ? linkedPaymentInvoice.balanceDue : 0)).toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Official Stamp Footer */}
                    <div className="pt-6 border-t border-zinc-200 flex justify-between items-center text-[10px] text-zinc-500">
                      <div>
                        <div className="font-bold text-zinc-900">Toheed Asghar Shahid (Owner)</div>
                        <div>Managing Director, KMZ Travels & Tours</div>
                      </div>
                      <div className="border-2 border-dashed border-emerald-600 text-emerald-700 bg-emerald-50 font-black px-4 py-1.5 rounded-lg uppercase tracking-wider text-[9px]">
                        PAYMENT RECEIVED & VERIFIED
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center text-zinc-500">
                    <HelpCircle className="w-10 h-10 mx-auto text-zinc-300 mb-2" />
                    <p className="font-semibold text-zinc-700">No payment receipt found for selected filter.</p>
                  </div>
                )}
              </>
            )}

            {/* If Service Voucher Category */}
            {selectedDocCategory === 'Voucher' && (
              <>
                {activeVoucherBooking ? (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-amber-600 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-amber-600 text-white rounded-xl flex items-center justify-center font-serif font-extrabold text-xl shadow-md">
                          KMZ
                        </div>
                        <div>
                          <h2 className="text-xl font-black font-serif text-zinc-950 tracking-tight">
                            KMZ TRAVELS & TOURS
                          </h2>
                          <div className="inline-block text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 rounded px-2 py-0.5 uppercase tracking-wide mt-0.5">
                            OFFICIAL PILGRIMAGE SERVICE VOUCHER
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-1">
                            P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad • DTS Lic # 8820
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-black font-mono text-amber-700">
                          VOUCH-{activeVoucherBooking.bookingNumber}
                        </div>
                        <div className="text-[11px] font-bold text-zinc-700 mt-0.5">
                          Package: {activeVoucherBooking.packageName}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                          Travel: {activeVoucherBooking.departureDate} to {activeVoucherBooking.returnDate}
                        </div>
                      </div>
                    </div>

                    {/* Passenger & Trip Info */}
                    <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 grid grid-cols-2 gap-4 text-[11px]">
                      <div>
                        <div className="text-[9px] font-bold uppercase text-amber-800 tracking-wider mb-1">
                          Lead Pilgrim / Group Leader
                        </div>
                        <div className="font-extrabold text-zinc-950 text-sm">{activeVoucherBooking.customerName}</div>
                        <div className="text-zinc-600 mt-0.5">Phone: {activeVoucherBooking.customerPhone}</div>
                        <div className="text-zinc-600">Pax: <span className="font-bold text-zinc-900">{activeVoucherBooking.paxAdults} Adults / {activeVoucherBooking.paxChildren} Children</span></div>
                      </div>

                      <div className="text-right">
                        <div className="text-[9px] font-bold uppercase text-amber-800 tracking-wider mb-1">
                          Visa & Flight Credentials
                        </div>
                        <div className="font-mono font-bold text-zinc-900">PNR: {activeVoucherBooking.flight?.pnr || 'CONFIRMED'}</div>
                        <div className="text-zinc-600 mt-0.5">Visa Status: <span className="font-bold text-emerald-700">{activeVoucherBooking.visa?.status || 'Approved'}</span></div>
                        {activeVoucherBooking.visa?.nusukId && (
                          <div className="text-zinc-600 font-mono">Nusuk ID: {activeVoucherBooking.visa.nusukId}</div>
                        )}
                      </div>
                    </div>

                    {/* Hotel Vouchers Table */}
                    <div>
                      <div className="text-[10px] font-extrabold uppercase text-amber-800 tracking-wider mb-2">
                        1. Hotel Accommodations
                      </div>
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-900 text-amber-400 uppercase text-[9px] font-extrabold">
                          <tr>
                            <th className="p-2.5 rounded-l-lg">City & Hotel Name</th>
                            <th className="p-2.5">Room Type</th>
                            <th className="p-2.5">Check In</th>
                            <th className="p-2.5">Check Out</th>
                            <th className="p-2.5 text-right rounded-r-lg">Nights</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 text-[11px]">
                          {activeVoucherBooking.hotels && activeVoucherBooking.hotels.length > 0 ? (
                            activeVoucherBooking.hotels.map((h, idx) => (
                              <tr key={idx}>
                                <td className="p-2.5 font-bold text-zinc-900">{h.city}: {h.hotelName}</td>
                                <td className="p-2.5">{h.roomType}</td>
                                <td className="p-2.5 font-mono">{h.checkIn}</td>
                                <td className="p-2.5 font-mono">{h.checkOut}</td>
                                <td className="p-2.5 text-right font-mono font-bold">{h.nights} Nights</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="p-3 text-center text-zinc-500">
                                No hotel accommodation listed
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Ground Transport & Ziyarat */}
                    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                      <div className="text-[10px] font-extrabold uppercase text-amber-800 tracking-wider mb-1">
                        2. Transport & Ziyarat Routes
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>Vehicle: <strong>{activeVoucherBooking.transport?.transportType || 'Private GMC / Luxury Coaster'}</strong></div>
                        <div>Route: <strong>{activeVoucherBooking.transport?.route || 'Jeddah - Makkah - Madina'}</strong></div>
                        <div>Driver: <strong>{activeVoucherBooking.transport?.driverName || 'Assigned on Arrival'}</strong></div>
                        <div>Contact: <strong>{activeVoucherBooking.transport?.driverContact || '03018647596'}</strong></div>
                      </div>
                    </div>

                    {/* Official Stamp Footer */}
                    <div className="pt-6 border-t border-zinc-200 flex justify-between items-center text-[10px] text-zinc-500">
                      <div>
                        <div className="font-bold text-zinc-900">Toheed Asghar Shahid (Owner)</div>
                        <div>Managing Director, KMZ Travels & Tours</div>
                      </div>
                      <div className="border-2 border-dashed border-amber-600 text-amber-700 bg-amber-50 font-black px-4 py-1.5 rounded-lg uppercase tracking-wider text-[9px]">
                        KMZ SERVICE VOUCHER AUTHORIZED
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center text-zinc-500">
                    <HelpCircle className="w-10 h-10 mx-auto text-zinc-300 mb-2" />
                    <p className="font-semibold text-zinc-700">No service voucher booking found for selected filter.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
