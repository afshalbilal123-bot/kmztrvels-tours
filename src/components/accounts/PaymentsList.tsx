import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  DollarSign,
  FileText,
  Printer,
  Smartphone,
  Wallet,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Trash2,
  Send,
  MessageSquare,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Modal } from '../common/Modal';
import { GoldBadge } from '../common/GoldBadge';
import { Payment, PaymentMethod } from '../../types';
import { generatePaymentReceiptPDF } from '../../utils/pdfGenerator';

export const PaymentsList: React.FC = () => {
  const { payments, bookings, invoices, bankAccounts, addPayment, deletePayment } = useData();

  // Filters & Tabs
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'analytics' | 'wallets'>('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingPayment, setViewingPayment] = useState<Payment | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    bookingId: bookings[0]?.id || '',
    amount: 250000,
    paymentMethod: 'JazzCash' as PaymentMethod,
    walletTitle: '',
    walletNumber: '',
    transactionId: '',
    bankAccountId: '',
    referenceNumber: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Completed' as 'Completed' | 'Pending' | 'Failed',
    notes: '',
  });

  // Default initial form state on open
  const handleOpenAdd = () => {
    const firstBooking = bookings[0];
    const defaultJazzAccount = bankAccounts.find((a) => a.bankName.includes('JazzCash')) || bankAccounts[0];

    setFormData({
      bookingId: firstBooking?.id || '',
      amount: firstBooking?.balanceAmount ? Math.min(250000, firstBooking.balanceAmount) : 250000,
      paymentMethod: 'JazzCash',
      walletTitle: firstBooking?.customerName || '',
      walletNumber: firstBooking?.customerPhone ? firstBooking.customerPhone.replace(/[^0-9]/g, '') : '',
      transactionId: `JC-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      bankAccountId: defaultJazzAccount?.id || '',
      referenceNumber: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Completed',
      notes: 'Customer mobile wallet payment deposit',
    });
    setIsModalOpen(true);
  };

  // Handle Payment Method change in modal
  const handleMethodChange = (method: PaymentMethod) => {
    let defaultBankId = formData.bankAccountId;
    let autoRef = formData.referenceNumber;
    let autoTxn = formData.transactionId;

    if (method === 'JazzCash') {
      const jazzAcc = bankAccounts.find((a) => a.bankName.toLowerCase().includes('jazzcash'));
      if (jazzAcc) defaultBankId = jazzAcc.id;
      if (!autoTxn) autoTxn = `JC-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    } else if (method === 'EasyPaisa') {
      const epAcc = bankAccounts.find((a) => a.bankName.toLowerCase().includes('easypaisa'));
      if (epAcc) defaultBankId = epAcc.id;
      if (!autoTxn) autoTxn = `EP-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    } else if (method === 'Cash') {
      const cashAcc = bankAccounts.find((a) => a.accountType === 'Cash Account' || a.bankName.includes('Cash'));
      if (cashAcc) defaultBankId = cashAcc.id;
      autoRef = `CSH-${Math.floor(1000 + Math.random() * 9000)}`;
    } else if (method === 'Bank Transfer') {
      const mzbAcc = bankAccounts.find((a) => a.bankName.toLowerCase().includes('meezan') || a.accountType !== 'Cash Account');
      if (mzbAcc) defaultBankId = mzbAcc.id;
      autoRef = `BNK-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    setFormData((prev) => ({
      ...prev,
      paymentMethod: method,
      bankAccountId: defaultBankId,
      referenceNumber: autoRef,
      transactionId: autoTxn,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedBooking = bookings.find((b) => b.id === formData.bookingId);
    const selectedBank = bankAccounts.find((a) => a.id === formData.bankAccountId);

    if (!selectedBooking) {
      alert('Please select a valid booking.');
      return;
    }

    if (formData.amount <= 0) {
      alert('Payment amount must be greater than zero.');
      return;
    }

    const isWallet = formData.paymentMethod === 'JazzCash' || formData.paymentMethod === 'EasyPaisa';
    const ref = isWallet
      ? formData.transactionId || formData.referenceNumber || `${formData.paymentMethod} Txn`
      : formData.referenceNumber || `${formData.paymentMethod} Ref`;

    addPayment({
      bookingId: selectedBooking.id,
      bookingNumber: selectedBooking.bookingNumber,
      customerId: selectedBooking.customerId,
      customerName: selectedBooking.customerName,
      amount: Number(formData.amount),
      paymentMethod: formData.paymentMethod,
      walletTitle: isWallet ? (formData.walletTitle || selectedBooking.customerName) : undefined,
      walletNumber: isWallet ? (formData.walletNumber || selectedBooking.customerPhone) : undefined,
      transactionId: isWallet ? (formData.transactionId || ref) : undefined,
      bankAccountId: selectedBank?.id,
      bankAccountName: selectedBank ? `${selectedBank.bankName} (${selectedBank.accountNumber})` : undefined,
      referenceNumber: ref,
      date: formData.date || new Date().toISOString().split('T')[0],
      status: formData.status,
      notes: formData.notes,
      recordedBy: 'KMZ Accounts Manager',
    });

    setIsModalOpen(false);
  };

  // Payment Method Wise Summaries
  const methodTotals = useMemo(() => {
    const totals: {
      Cash: { amount: number; count: number };
      'Bank Transfer': { amount: number; count: number };
      JazzCash: { amount: number; count: number };
      EasyPaisa: { amount: number; count: number };
      'Credit Card': { amount: number; count: number };
      Cheque: { amount: number; count: number };
      Total: number;
      TotalCount: number;
    } = {
      Cash: { amount: 0, count: 0 },
      'Bank Transfer': { amount: 0, count: 0 },
      JazzCash: { amount: 0, count: 0 },
      EasyPaisa: { amount: 0, count: 0 },
      'Credit Card': { amount: 0, count: 0 },
      Cheque: { amount: 0, count: 0 },
      Total: 0,
      TotalCount: 0,
    };

    payments.forEach((p) => {
      const amt = p.amount || 0;
      totals.Total += amt;
      totals.TotalCount += 1;

      const method = p.paymentMethod as keyof typeof totals;
      if (method in totals && method !== 'Total' && method !== 'TotalCount') {
        totals[method].amount += amt;
        totals[method].count += 1;
      }
    });

    return totals;
  }, [payments]);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch =
        p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.transactionId && p.transactionId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.walletNumber && p.walletNumber.includes(searchTerm)) ||
        (p.referenceNumber && p.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesMethod = methodFilter === 'all' || p.paymentMethod === methodFilter;
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [payments, searchTerm, methodFilter, statusFilter]);

  const getMethodBadge = (method: PaymentMethod) => {
    switch (method) {
      case 'JazzCash':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-red-600/20 text-red-300 border border-red-500/40">JazzCash</span>;
      case 'EasyPaisa':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-emerald-600/20 text-emerald-300 border border-emerald-500/40">EasyPaisa</span>;
      case 'Cash':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">Cash</span>;
      case 'Bank Transfer':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-blue-600/20 text-blue-300 border border-blue-500/40">Bank Transfer</span>;
      case 'Credit Card':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-purple-600/20 text-purple-300 border border-purple-500/40">Credit Card</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">{method}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20 shadow-xl">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-amber-400" />
            Payments & Wallet Accounts Center
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Record pilgrim collections via Cash, Bank Transfer, JazzCash & EasyPaisa with real-time customer balance auto-update.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Payment / Receipt</span>
        </button>
      </div>

      {/* Payment Method Wise Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Cash */}
        <div
          onClick={() => setMethodFilter(methodFilter === 'Cash' ? 'all' : 'Cash')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            methodFilter === 'Cash'
              ? 'bg-amber-500/15 border-amber-500 text-amber-300'
              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Cash
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
              {methodTotals.Cash.count} Txns
            </span>
          </div>
          <div className="text-xl font-black text-white">
            PKR {methodTotals.Cash.amount.toLocaleString()}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Physical counter collections</p>
        </div>

        {/* Bank Transfer */}
        <div
          onClick={() => setMethodFilter(methodFilter === 'Bank Transfer' ? 'all' : 'Bank Transfer')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            methodFilter === 'Bank Transfer'
              ? 'bg-blue-500/15 border-blue-500 text-blue-300'
              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Bank Transfer
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
              {methodTotals['Bank Transfer'].count} Txns
            </span>
          </div>
          <div className="text-xl font-black text-white">
            PKR {methodTotals['Bank Transfer'].amount.toLocaleString()}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Meezan, HBL & Faysal Bank</p>
        </div>

        {/* JazzCash */}
        <div
          onClick={() => setMethodFilter(methodFilter === 'JazzCash' ? 'all' : 'JazzCash')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            methodFilter === 'JazzCash'
              ? 'bg-red-500/15 border-red-500 text-red-300'
              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" /> JazzCash
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold">
              {methodTotals.JazzCash.count} Txns
            </span>
          </div>
          <div className="text-xl font-black text-white">
            PKR {methodTotals.JazzCash.amount.toLocaleString()}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Mobile wallet collections</p>
        </div>

        {/* EasyPaisa */}
        <div
          onClick={() => setMethodFilter(methodFilter === 'EasyPaisa' ? 'all' : 'EasyPaisa')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            methodFilter === 'EasyPaisa'
              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5" /> EasyPaisa
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
              {methodTotals.EasyPaisa.count} Txns
            </span>
          </div>
          <div className="text-xl font-black text-white">
            PKR {methodTotals.EasyPaisa.amount.toLocaleString()}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Telenor Microfinance wallet</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/80" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search receipt #, pilgrim name, transaction ID, wallet number..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>Method:</span>
          </div>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 font-semibold"
          >
            <option value="all">All Payment Methods ({methodTotals.TotalCount})</option>
            <option value="Cash">Cash (PKR {methodTotals.Cash.amount.toLocaleString()})</option>
            <option value="Bank Transfer">Bank Transfer (PKR {methodTotals['Bank Transfer'].amount.toLocaleString()})</option>
            <option value="JazzCash">JazzCash (PKR {methodTotals.JazzCash.amount.toLocaleString()})</option>
            <option value="EasyPaisa">EasyPaisa (PKR {methodTotals.EasyPaisa.amount.toLocaleString()})</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Cheque">Cheque</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 font-semibold"
          >
            <option value="all">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Main Payment History Table */}
      <div className="bg-zinc-900/90 rounded-2xl border border-amber-500/20 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="p-4">Receipt #</th>
                <th className="p-4">Booking Ref</th>
                <th className="p-4">Pilgrim Details</th>
                <th className="p-4">Amount Paid</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Wallet / Txn Reference</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-zinc-500">
                    No payment records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const isWallet = p.paymentMethod === 'JazzCash' || p.paymentMethod === 'EasyPaisa';

                  return (
                    <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-amber-300">{p.receiptNumber}</td>
                      <td className="p-4 font-mono text-zinc-300">{p.bookingNumber}</td>
                      <td className="p-4">
                        <div className="font-bold text-white">{p.customerName}</div>
                        {isWallet && p.walletTitle && (
                          <div className="text-[10px] text-zinc-400">
                            Title: <span className="text-zinc-200 font-medium">{p.walletTitle}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-black text-emerald-400 text-sm">
                        PKR {p.amount.toLocaleString()}
                      </td>
                      <td className="p-4">{getMethodBadge(p.paymentMethod)}</td>
                      <td className="p-4">
                        {isWallet ? (
                          <div>
                            <div className="font-mono text-xs font-bold text-amber-300">
                              {p.transactionId || p.referenceNumber}
                            </div>
                            {p.walletNumber && (
                              <div className="text-[10px] text-zinc-400">Mobile: {p.walletNumber}</div>
                            )}
                          </div>
                        ) : (
                          <div className="font-mono text-[11px] text-zinc-300">{p.referenceNumber}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            p.status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : p.status === 'Pending'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {p.status || 'Completed'}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-400 font-mono text-[11px]">{p.date}</td>
                      <td className="p-4 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingPayment(p)}
                          className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-[11px] rounded-xl border border-amber-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View Receipt</span>
                        </button>

                        <button
                          onClick={() => deletePayment(p.id)}
                          title="Delete Payment Record"
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Payment & Generate Official Receipt"
        subtitle="Select payment method including JazzCash, EasyPaisa, Cash, or Bank Transfer."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Select Pilgrim Booking *
            </label>
            <select
              value={formData.bookingId}
              onChange={(e) => {
                const selected = bookings.find((b) => b.id === e.target.value);
                setFormData((prev) => ({
                  ...prev,
                  bookingId: e.target.value,
                  amount: selected?.balanceAmount ? Math.min(250000, selected.balanceAmount) : prev.amount,
                  walletTitle: selected?.customerName || prev.walletTitle,
                  walletNumber: selected?.customerPhone ? selected.customerPhone.replace(/[^0-9]/g, '') : prev.walletNumber,
                }));
              }}
              required
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 font-medium"
            >
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  #{b.bookingNumber} - {b.customerName} (Bal Due: PKR {b.balanceAmount.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Payment Method *
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => handleMethodChange(e.target.value as PaymentMethod)}
                required
                className="w-full px-3 py-2 bg-zinc-900 border border-amber-500/40 rounded-xl text-xs text-amber-300 font-bold"
              >
                <option value="JazzCash">📱 JazzCash Wallet</option>
                <option value="EasyPaisa">📲 EasyPaisa Wallet</option>
                <option value="Cash">💵 Cash Counter</option>
                <option value="Bank Transfer">🏦 Bank Transfer</option>
                <option value="Credit Card">💳 Credit Card POS</option>
                <option value="Cheque">📜 Cheque Deposit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Amount Received (PKR) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-emerald-400 font-black text-sm"
              />
            </div>
          </div>

          {/* Conditional Wallet Fields for JazzCash / EasyPaisa */}
          {(formData.paymentMethod === 'JazzCash' || formData.paymentMethod === 'EasyPaisa') && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>{formData.paymentMethod} Wallet Details</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Account / Wallet Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muhammad Ali Khan"
                    value={formData.walletTitle}
                    onChange={(e) => setFormData({ ...formData, walletTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Mobile / Wallet Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="03018647596"
                    value={formData.walletNumber}
                    onChange={(e) => setFormData({ ...formData, walletNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Transaction ID (Txn ID) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TID-9982102938"
                  value={formData.transactionId}
                  onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-amber-300 font-mono font-bold"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Payment Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Payment Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 font-bold"
              >
                <option value="Completed">Completed (Cleared)</option>
                <option value="Pending">Pending Verification</option>
                <option value="Failed">Failed / Declined</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Deposit Account / Ledger Destination *
            </label>
            <select
              value={formData.bankAccountId}
              onChange={(e) => setFormData({ ...formData, bankAccountId: e.target.value })}
              required
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 font-medium"
            >
              {bankAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.bankName} ({a.accountNumber}) - {a.accountType}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Payment Notes & Internal Memo
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Received advance deposit for Makkah hotel voucher..."
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100"
            />
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-black rounded-xl text-xs hover:from-amber-400 hover:to-amber-500 shadow-md shadow-amber-500/20"
            >
              Issue Official Receipt
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Payment Receipt Modal */}
      {viewingPayment && (
        <Modal
          isOpen={!!viewingPayment}
          onClose={() => setViewingPayment(null)}
          title={`Official Payment Receipt #${viewingPayment.receiptNumber}`}
          subtitle="Print or share official payment voucher for pilgrim"
        >
          <div className="space-y-6">
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  const isWallet = viewingPayment.paymentMethod === 'JazzCash' || viewingPayment.paymentMethod === 'EasyPaisa';
                  const cleanPhone = viewingPayment.walletNumber ? viewingPayment.walletNumber.replace(/[^0-9]/g, '') : '';
                  const phoneWithCountry = cleanPhone.startsWith('92') ? cleanPhone : `92${cleanPhone.replace(/^0/, '')}`;
                  
                  const msg = `Assalamu Alaikum ${viewingPayment.customerName} Sahib,\n\nOfficial Payment Confirmation from KMZ Travels & Tours Faisalabad.\n\nReceipt #: ${viewingPayment.receiptNumber}\nBooking Ref #: ${viewingPayment.bookingNumber}\nAmount Paid: PKR ${viewingPayment.amount.toLocaleString()}\nPayment Method: ${viewingPayment.paymentMethod}\n${isWallet ? `Wallet Title: ${viewingPayment.walletTitle || 'N/A'}\nWallet Mobile: ${viewingPayment.walletNumber || 'N/A'}\nTxn ID: ${viewingPayment.transactionId || viewingPayment.referenceNumber}\n` : `Ref #: ${viewingPayment.referenceNumber}\n`}Date: ${viewingPayment.date}\nStatus: ${viewingPayment.status}\n\nJazakAllah Khair for choosing KMZ Travels & Tours!`;

                  window.open(`https://wa.me/${phoneWithCountry || '923018647596'}?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>WhatsApp Receipt</span>
              </button>

              <button
                onClick={() => {
                  const linkedInv = invoices.find(
                    (i) => i.id === viewingPayment.invoiceId || i.invoiceNumber === viewingPayment.invoiceNumber || i.bookingId === viewingPayment.bookingId
                  );
                  generatePaymentReceiptPDF(viewingPayment, linkedInv);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-black text-xs shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Download Receipt PDF</span>
              </button>
            </div>

            <div
              id="printable-payment-receipt"
              className="p-8 bg-zinc-950 border-2 border-amber-500/40 rounded-2xl space-y-6 text-zinc-100"
            >
              {/* Receipt Header */}
              <div className="flex items-center justify-between pb-6 border-b border-amber-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-200 p-0.5">
                    <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center font-serif font-black text-amber-400 text-xl">
                      KMZ
                    </div>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold font-serif text-white">KMZ TRAVELS & TOURS</h1>
                    <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">
                      Official Payment Voucher & Receipt
                    </p>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                      P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-mono font-bold text-amber-300">
                    RECEIPT #{viewingPayment.receiptNumber}
                  </div>
                  <div className="text-[10px] text-zinc-400">Date: {viewingPayment.date}</div>
                  <div className="text-[10px] text-amber-400 font-bold mt-1">
                    WhatsApp: 03018647596 | Call: 03147861122
                  </div>
                </div>
              </div>

              {/* Receipt Body */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                <div>
                  <span className="text-[10px] text-amber-400 font-bold uppercase">Received From Pilgrim</span>
                  <div className="font-bold text-white text-sm mt-0.5">{viewingPayment.customerName}</div>
                  <div className="text-zinc-400">Booking Ref: <span className="font-mono text-amber-300">{viewingPayment.bookingNumber}</span></div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-amber-400 font-bold uppercase">Amount Received</span>
                  <div className="text-xl font-black text-emerald-400 mt-0.5">
                    PKR {viewingPayment.amount.toLocaleString()}
                  </div>
                  <div className="text-zinc-300 text-[10px] font-bold mt-0.5">Method: {viewingPayment.paymentMethod}</div>
                </div>
              </div>

              {/* Wallet / Reference details */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs space-y-2">
                {(viewingPayment.paymentMethod === 'JazzCash' || viewingPayment.paymentMethod === 'EasyPaisa') ? (
                  <>
                    <div className="flex justify-between text-zinc-300">
                      <span>Account / Wallet Title:</span>
                      <span className="font-bold text-white">{viewingPayment.walletTitle || viewingPayment.customerName}</span>
                    </div>
                    <div className="flex justify-between text-zinc-300">
                      <span>Mobile / Wallet Number:</span>
                      <span className="font-mono font-bold text-zinc-200">{viewingPayment.walletNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-zinc-300">
                      <span>Transaction ID (Txn ID):</span>
                      <span className="font-mono font-bold text-amber-300">{viewingPayment.transactionId || viewingPayment.referenceNumber}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-zinc-300">
                    <span>Transaction Reference #:</span>
                    <span className="font-mono font-bold text-amber-300">{viewingPayment.referenceNumber}</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-300 pt-2 border-t border-zinc-800">
                  <span>Payment Clearance Status:</span>
                  <span className="font-extrabold uppercase text-emerald-400">{viewingPayment.status || 'Completed'}</span>
                </div>

                {viewingPayment.notes && (
                  <div className="flex justify-between text-zinc-400 pt-2 border-t border-zinc-800">
                    <span>Payment Notes:</span>
                    <span>{viewingPayment.notes}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-400 pt-2 border-t border-zinc-800">
                  <span>Recorded By:</span>
                  <span className="text-white font-semibold">{viewingPayment.recordedBy || 'Toheed Asghar Shahid'}</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-6 flex items-center justify-between text-[10px] text-zinc-400 border-t border-amber-500/20">
                <div>
                  <p className="font-bold text-amber-300">Toheed Asghar Shahid (Owner)</p>
                  <p className="text-zinc-400 font-medium">KMZ Travels & Tours, Faisalabad</p>
                </div>
                <div className="border border-amber-500/40 px-4 py-2 rounded-xl text-center font-mono text-amber-400 font-bold uppercase">
                  KMZ OFFICIAL PAYMENT RECEIVED STAMP
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
