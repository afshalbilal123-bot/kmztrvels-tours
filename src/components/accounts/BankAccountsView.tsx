import React, { useState, useMemo } from 'react';
import {
  Landmark,
  Plus,
  Search,
  ArrowUpDown,
  FileText,
  Edit2,
  Trash2,
  Eye,
  Building2,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Printer,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Download,
  Wallet,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { BankAccount, BankTransfer } from '../../types';
import { Modal } from '../common/Modal';
import { generateBankStatementPDF } from '../../utils/pdfGenerator';

export const BankAccountsView: React.FC = () => {
  const {
    bankAccounts,
    bankTransfers,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    addBankTransfer,
    deleteBankTransfer,
    getBankAccountBalance,
    getAccountTransactions,
  } = useData();

  const [activeSubTab, setActiveSubTab] = useState<'accounts' | 'transfers' | 'statements' | 'reports'>('accounts');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');

  // Account Modal State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [accountFormData, setAccountFormData] = useState({
    bankName: '',
    accountTitle: '',
    accountNumber: '',
    iban: '',
    branch: '',
    accountType: 'Current',
    openingBalance: 0,
    status: 'Active' as 'Active' | 'Inactive',
    notes: '',
  });

  // Transfer Modal State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferFormData, setTransferFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    description: '',
    recordedBy: 'Admin',
  });
  const [transferError, setTransferError] = useState('');

  // Statement / Report Date Filter State
  const [selectedAccountId, setSelectedAccountId] = useState<string>(bankAccounts[0]?.id || '');
  const [statementStartDate, setStatementStartDate] = useState<string>('');
  const [statementEndDate, setStatementEndDate] = useState<string>('');

  // Delete Confirmation State
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);
  const [deletingTransferId, setDeletingTransferId] = useState<string | null>(null);

  // Detail View State
  const [viewingAccountId, setViewingAccountId] = useState<string | null>(null);

  // Compute Overall Totals
  const accountBalances = useMemo(() => {
    return bankAccounts.map((acc) => ({
      ...acc,
      currentBalance: getBankAccountBalance(acc.id),
    }));
  }, [bankAccounts, getBankAccountBalance]);

  const totalBankBalance = useMemo(() => {
    return accountBalances
      .filter((a) => a.accountType !== 'Cash Account')
      .reduce((sum, a) => sum + a.currentBalance, 0);
  }, [accountBalances]);

  const totalCashBalance = useMemo(() => {
    return accountBalances
      .filter((a) => a.accountType === 'Cash Account')
      .reduce((sum, a) => sum + a.currentBalance, 0);
  }, [accountBalances]);

  const grandTotalLiquidity = totalBankBalance + totalCashBalance;

  // Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return accountBalances.filter((acc) => {
      const matchesSearch =
        acc.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.accountTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.iban.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.branch.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || acc.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [accountBalances, searchTerm, statusFilter]);

  // Filtered Transfers
  const filteredTransfers = useMemo(() => {
    return bankTransfers.filter((trf) => {
      return (
        trf.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trf.fromAccountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trf.toAccountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trf.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trf.description && trf.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }, [bankTransfers, searchTerm]);

  // Selected Account Transactions for Statements
  const activeStatementAccount = useMemo(() => {
    return bankAccounts.find((a) => a.id === selectedAccountId) || bankAccounts[0];
  }, [bankAccounts, selectedAccountId]);

  const statementData = useMemo(() => {
    if (!activeStatementAccount) return { openingBalance: 0, totalInflows: 0, totalOutflows: 0, closingBalance: 0, transactions: [] };
    return getAccountTransactions(activeStatementAccount.id, statementStartDate, statementEndDate);
  }, [activeStatementAccount, statementStartDate, statementEndDate, getAccountTransactions]);

  // Handlers for Account Modal
  const handleOpenAddAccount = () => {
    setEditingAccount(null);
    setAccountFormData({
      bankName: '',
      accountTitle: 'KMZ Travels & Tours (Pvt) Ltd',
      accountNumber: '',
      iban: '',
      branch: '',
      accountType: 'Current',
      openingBalance: 0,
      status: 'Active',
      notes: '',
    });
    setIsAccountModalOpen(true);
  };

  const handleOpenEditAccount = (acc: BankAccount) => {
    setEditingAccount(acc);
    setAccountFormData({
      bankName: acc.bankName,
      accountTitle: acc.accountTitle,
      accountNumber: acc.accountNumber,
      iban: acc.iban,
      branch: acc.branch,
      accountType: acc.accountType,
      openingBalance: acc.openingBalance,
      status: acc.status,
      notes: acc.notes || '',
    });
    setIsAccountModalOpen(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountFormData.bankName || !accountFormData.accountTitle || !accountFormData.accountNumber) {
      alert('Please fill in required fields: Bank Name, Account Title, and Account Number.');
      return;
    }

    if (editingAccount) {
      updateBankAccount({
        ...editingAccount,
        ...accountFormData,
      });
    } else {
      addBankAccount(accountFormData);
    }
    setIsAccountModalOpen(false);
  };

  // Handlers for Transfers
  const handleOpenTransferModal = () => {
    setTransferError('');
    const defaultFrom = bankAccounts[0]?.id || '';
    const defaultTo = bankAccounts.length > 1 ? bankAccounts[1].id : bankAccounts[0]?.id || '';
    setTransferFormData({
      fromAccountId: defaultFrom,
      toAccountId: defaultTo,
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      referenceNumber: `TRF-REF-${Math.floor(1000 + Math.random() * 9000)}`,
      description: '',
      recordedBy: 'Aisha Malik (Finance)',
    });
    setIsTransferModalOpen(true);
  };

  const handleSaveTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError('');

    if (!transferFormData.fromAccountId || !transferFormData.toAccountId) {
      setTransferError('Please select both source and destination accounts.');
      return;
    }

    if (transferFormData.fromAccountId === transferFormData.toAccountId) {
      setTransferError('Source and destination accounts cannot be the same.');
      return;
    }

    if (transferFormData.amount <= 0) {
      setTransferError('Transfer amount must be greater than zero.');
      return;
    }

    const sourceBalance = getBankAccountBalance(transferFormData.fromAccountId);
    if (transferFormData.amount > sourceBalance) {
      setTransferError(
        `Insufficient funds in source account! Available balance: PKR ${sourceBalance.toLocaleString()}, requested: PKR ${transferFormData.amount.toLocaleString()}`
      );
      return;
    }

    const fromAcc = bankAccounts.find((a) => a.id === transferFormData.fromAccountId);
    const toAcc = bankAccounts.find((a) => a.id === transferFormData.toAccountId);

    addBankTransfer({
      fromAccountId: transferFormData.fromAccountId,
      fromAccountName: `${fromAcc?.bankName} (${fromAcc?.accountNumber})`,
      toAccountId: transferFormData.toAccountId,
      toAccountName: `${toAcc?.bankName} (${toAcc?.accountNumber})`,
      amount: transferFormData.amount,
      date: transferFormData.date,
      referenceNumber: transferFormData.referenceNumber,
      description: transferFormData.description,
      recordedBy: transferFormData.recordedBy,
    });

    setIsTransferModalOpen(false);
  };

  const handlePrintStatement = () => {
    if (activeStatementAccount) {
      generateBankStatementPDF(activeStatementAccount, statementData, statementStartDate, statementEndDate);
    }
  };

  const handleExportCSV = () => {
    if (!statementData.transactions.length) return;
    const headers = ['Date', 'Reference', 'Type', 'Narration', 'Debit (PKR)', 'Credit (PKR)', 'Running Balance (PKR)'];
    const rows = statementData.transactions.map((tx) => [
      tx.date,
      tx.referenceNo,
      tx.type,
      `"${(tx.narration || '').replace(/"/g, '""')}"`,
      tx.debit,
      tx.credit,
      tx.runningBalance,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Statement_${activeStatementAccount.bankName}_${activeStatementAccount.accountNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 p-6 rounded-2xl border border-amber-500/20 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Landmark className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Multi-Bank Account Management</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Core Module
              </span>
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              Manage corporate bank accounts, cash desks, fund transfers, and running balances for KMZ Travels.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleOpenTransferModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-500/30 hover:border-amber-500/50 rounded-xl font-medium transition-all text-sm shadow-md"
          >
            <ArrowUpDown className="w-4 h-4" />
            Bank / Cash Transfer
          </button>

          <button
            onClick={handleOpenAddAccount}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-semibold rounded-xl transition-all text-sm shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Bank Account
          </button>
        </div>
      </div>

      {/* Liquidity Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Liquidity */}
        <div className="bg-zinc-900/80 border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Liquid Funds</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-100 tracking-tight">
            PKR {grandTotalLiquidity.toLocaleString()}
          </div>
          <div className="text-xs text-amber-400/80 mt-2 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            Combined Cash + Bank Balances
          </div>
        </div>

        {/* Total Bank Balance */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Bank Accounts Balance</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-100 tracking-tight">
            PKR {totalBankBalance.toLocaleString()}
          </div>
          <div className="text-xs text-zinc-400 mt-2 flex items-center justify-between">
            <span>{bankAccounts.filter((a) => a.accountType !== 'Cash Account').length} Active Accounts</span>
            <span className="text-blue-400 font-medium">Commercial Banks</span>
          </div>
        </div>

        {/* Total Cash Balance */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Cash Account Balance</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">
            PKR {totalCashBalance.toLocaleString()}
          </div>
          <div className="text-xs text-zinc-400 mt-2 flex items-center justify-between">
            <span>Physical Cash Drawer</span>
            <span className="text-emerald-400 font-medium">Head Office</span>
          </div>
        </div>

        {/* Internal Transfers Summary */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Recorded Transfers</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ArrowUpDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-100 tracking-tight">
            {bankTransfers.length} Transfers
          </div>
          <div className="text-xs text-zinc-400 mt-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            Double-entry verified
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <button
            onClick={() => setActiveSubTab('accounts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeSubTab === 'accounts'
                ? 'bg-amber-500 text-zinc-950 font-semibold shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Bank Accounts & Cash ({bankAccounts.length})
          </button>

          <button
            onClick={() => setActiveSubTab('transfers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeSubTab === 'transfers'
                ? 'bg-amber-500 text-zinc-950 font-semibold shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <ArrowUpDown className="w-4 h-4" />
            Bank & Cash Transfers ({bankTransfers.length})
          </button>

          <button
            onClick={() => setActiveSubTab('statements')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeSubTab === 'statements'
                ? 'bg-amber-500 text-zinc-950 font-semibold shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Bank Statement & Ledger
          </button>

          <button
            onClick={() => setActiveSubTab('reports')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeSubTab === 'reports'
                ? 'bg-amber-500 text-zinc-950 font-semibold shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Bank Balance Reports
          </button>
        </div>

        {/* Search & Filter Bar (visible for accounts & transfers) */}
        {(activeSubTab === 'accounts' || activeSubTab === 'transfers') && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder={activeSubTab === 'accounts' ? 'Search bank, account #, IBAN...' : 'Search transfer #, ref, narration...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 w-64"
              />
            </div>

            {activeSubTab === 'accounts' && (
              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-300 focus:outline-none focus:border-amber-500/50"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
            )}
          </div>
        )}
      </div>

      {/* SUB-TAB 1: BANK ACCOUNTS OVERVIEW */}
      {activeSubTab === 'accounts' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAccounts.map((acc) => {
              const isCash = acc.accountType === 'Cash Account';
              return (
                <div
                  key={acc.id}
                  className={`bg-zinc-900/90 border rounded-2xl p-6 relative overflow-hidden transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/5 ${
                    isCash
                      ? 'border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-zinc-900'
                      : 'border-zinc-800 hover:border-amber-500/30'
                  }`}
                >
                  {/* Account Type Badge & Status */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner ${
                          isCash
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                            : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                        }`}
                      >
                        {isCash ? <DollarSign className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-100 text-lg leading-tight">{acc.bankName}</h3>
                        <p className="text-xs text-zinc-400">{acc.accountType}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        acc.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      {acc.status}
                    </span>
                  </div>

                  {/* Account Numbers & Details */}
                  <div className="space-y-2 bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/80 mb-4 text-xs font-mono">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-sans">Account Title:</span>
                      <span className="text-zinc-200 font-medium font-sans truncate max-w-[170px]" title={acc.accountTitle}>
                        {acc.accountTitle}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-sans">Account #:</span>
                      <span className="text-amber-400 font-bold tracking-wider">{acc.accountNumber}</span>
                    </div>
                    {acc.iban && acc.iban !== 'N/A' && (
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500 font-sans">IBAN:</span>
                        <span className="text-zinc-300 font-sans text-[11px] truncate max-w-[180px]" title={acc.iban}>
                          {acc.iban}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-sans">Branch:</span>
                      <span className="text-zinc-400 font-sans truncate max-w-[180px]" title={acc.branch}>
                        {acc.branch}
                      </span>
                    </div>
                  </div>

                  {/* Balance Display */}
                  <div className="border-t border-zinc-800 pt-4 mb-5 flex items-end justify-between">
                    <div>
                      <span className="text-xs text-zinc-400 uppercase tracking-wider block mb-0.5">Opening Balance</span>
                      <span className="text-sm font-semibold text-zinc-400">
                        PKR {acc.openingBalance.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-amber-400 uppercase tracking-wider block font-semibold mb-0.5">
                        Current Balance
                      </span>
                      <span
                        className={`text-xl font-extrabold ${
                          acc.currentBalance >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        PKR {acc.currentBalance.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
                    <button
                      onClick={() => {
                        setSelectedAccountId(acc.id);
                        setActiveSubTab('statements');
                      }}
                      className="flex-1 py-2 px-3 bg-zinc-800/80 hover:bg-amber-500/10 hover:text-amber-400 text-zinc-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-zinc-700/60 hover:border-amber-500/30"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Statement / Ledger
                    </button>

                    <button
                      onClick={() => handleOpenEditAccount(acc)}
                      className="p-2 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all border border-zinc-700/60"
                      title="Edit Account Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeletingAccountId(acc.id)}
                      className="p-2 bg-zinc-800/80 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 rounded-xl transition-all border border-zinc-700/60"
                      title="Delete Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAccounts.length === 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
              <Landmark className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-zinc-200">No bank accounts match your search</h3>
              <p className="text-sm text-zinc-400 mt-1">Try adjusting your filters or search keywords.</p>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: BANK & CASH TRANSFERS */}
      {activeSubTab === 'transfers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-amber-400" />
              Internal Bank & Cash Transfer History
            </h2>
            <button
              onClick={handleOpenTransferModal}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl text-sm shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              New Transfer
            </button>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-950 text-zinc-400 uppercase text-xs tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4">Transfer #</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">From Account (Source)</th>
                    <th className="px-6 py-4">To Account (Destination)</th>
                    <th className="px-6 py-4 text-right">Amount (PKR)</th>
                    <th className="px-6 py-4">Ref / Narration</th>
                    <th className="px-6 py-4">Recorded By</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                  {filteredTransfers.map((trf) => (
                    <tr key={trf.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-6 py-4 font-mono text-amber-400 font-semibold">{trf.transferNumber}</td>
                      <td className="px-6 py-4 text-zinc-400 whitespace-nowrap">{trf.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-zinc-200 font-medium">
                          <ArrowUpRight className="w-4 h-4 text-red-400 shrink-0" />
                          <span>{trf.fromAccountName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-zinc-200 font-medium">
                          <ArrowDownLeft className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{trf.toAccountName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-amber-400 font-mono text-base">
                        PKR {trf.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="text-zinc-200 font-mono text-xs">{trf.referenceNumber}</div>
                        {trf.description && <div className="text-zinc-400 text-xs truncate">{trf.description}</div>}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-400">{trf.recordedBy}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setDeletingTransferId(trf.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Reverse / Delete Transfer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredTransfers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-zinc-500">
                        No transfer logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: BANK STATEMENT & ITEMIZE LEDGER */}
      {activeSubTab === 'statements' && (
        <div className="space-y-6">
          {/* Statement Controls Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 print:hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  Account Transaction Statement & Ledger
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Filter statement by bank account and date range to view running balance and itemized entries.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold border border-zinc-700 transition-all"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  Export CSV
                </button>
                <button
                  onClick={handlePrintStatement}
                  className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-semibold rounded-xl text-xs transition-all shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  Print Statement
                </button>
              </div>
            </div>

            {/* Filter Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-zinc-800/80 pt-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Select Account</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50"
                >
                  {bankAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.bankName} - {acc.accountNumber} ({acc.accountType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">From Date</label>
                <input
                  type="date"
                  value={statementStartDate}
                  onChange={(e) => setStatementStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">To Date</label>
                <input
                  type="date"
                  value={statementEndDate}
                  onChange={(e) => setStatementEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>
          </div>

          {/* Printable Statement Sheet */}
          {activeStatementAccount && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl space-y-6 print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
              {/* Statement Header */}
              <div className="flex justify-between items-start border-b border-zinc-800 pb-6 print:border-black/30">
                <div>
                  <h1 className="text-2xl font-extrabold text-amber-400 tracking-tight print:text-black">
                    KMZ TRAVELS & TOURS (PVT) LTD
                  </h1>
                  <p className="text-xs text-zinc-400 mt-1 print:text-gray-600">
                    Main Head Office: P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad, Pakistan
                  </p>
                  <p className="text-xs text-zinc-400 print:text-gray-600">
                    Phone: +92 301 8647596 | Email: accounts@kmztravels.com
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs uppercase font-bold tracking-widest text-amber-500 print:text-black">
                    OFFICIAL BANK STATEMENT
                  </div>
                  <div className="text-sm font-bold text-zinc-100 mt-1 print:text-black">{activeStatementAccount.bankName}</div>
                  <div className="text-xs font-mono text-zinc-400 print:text-gray-700">A/C: {activeStatementAccount.accountNumber}</div>
                  {activeStatementAccount.iban && (
                    <div className="text-xs font-mono text-zinc-400 print:text-gray-700">IBAN: {activeStatementAccount.iban}</div>
                  )}
                  <div className="text-xs text-zinc-500 mt-2 print:text-gray-500">
                    Generated on: {new Date().toLocaleDateString('en-GB')}
                  </div>
                </div>
              </div>

              {/* Statement Summary KPI Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-zinc-950/80 p-5 rounded-xl border border-zinc-800 print:bg-gray-100 print:border-gray-300">
                <div>
                  <span className="text-xs text-zinc-400 uppercase tracking-wider block print:text-gray-600">Opening Balance</span>
                  <span className="text-lg font-bold text-zinc-200 print:text-black">
                    PKR {statementData.openingBalance.toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-emerald-400 uppercase tracking-wider block print:text-gray-600">Total Inflows (Debit)</span>
                  <span className="text-lg font-bold text-emerald-400 print:text-emerald-700">
                    + PKR {statementData.totalInflows.toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-red-400 uppercase tracking-wider block print:text-gray-600">Total Outflows (Credit)</span>
                  <span className="text-lg font-bold text-red-400 print:text-red-700">
                    - PKR {statementData.totalOutflows.toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-amber-400 uppercase tracking-wider block font-bold print:text-gray-600">
                    Closing Balance
                  </span>
                  <span className="text-xl font-black text-amber-400 print:text-black">
                    PKR {statementData.closingBalance.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Statement Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans print:text-black">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider border-b border-zinc-800 print:bg-gray-200 print:text-black">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Ref / Voucher #</th>
                      <th className="px-4 py-3">Transaction Type</th>
                      <th className="px-4 py-3">Particulars / Narration</th>
                      <th className="px-4 py-3 text-right">Debit (IN +)</th>
                      <th className="px-4 py-3 text-right">Credit (OUT -)</th>
                      <th className="px-4 py-3 text-right">Running Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 print:divide-gray-300">
                    {/* Initial Line for Opening Balance */}
                    <tr className="bg-zinc-950/40 text-zinc-400 italic print:bg-gray-50">
                      <td className="px-4 py-3">{statementStartDate || activeStatementAccount.createdAt}</td>
                      <td className="px-4 py-3">OPEN-BAL</td>
                      <td className="px-4 py-3">Opening Balance</td>
                      <td className="px-4 py-3">Brought Forward / Account Opening Balance</td>
                      <td className="px-4 py-3 text-right">-</td>
                      <td className="px-4 py-3 text-right">-</td>
                      <td className="px-4 py-3 text-right font-bold text-zinc-200 print:text-black font-mono">
                        PKR {statementData.openingBalance.toLocaleString()}
                      </td>
                    </tr>

                    {statementData.transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-zinc-300 print:text-black">{tx.date}</td>
                        <td className="px-4 py-3 font-mono text-amber-400 print:text-black font-medium">{tx.referenceNo}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                              tx.debit > 0
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-red-500/10 text-red-400 border-red-500/30'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-200 print:text-black">{tx.narration}</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-400 print:text-emerald-800">
                          {tx.debit > 0 ? `PKR ${tx.debit.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-red-400 print:text-red-800">
                          {tx.credit > 0 ? `PKR ${tx.credit.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-zinc-100 print:text-black">
                          PKR {tx.runningBalance.toLocaleString()}
                        </td>
                      </tr>
                    ))}

                    {statementData.transactions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                          No transactions found for the selected period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Statement Footer */}
              <div className="pt-8 border-t border-zinc-800 flex justify-between items-end print:border-black/30">
                <div className="text-xs text-zinc-500 print:text-gray-600">
                  <p>Computer generated document. Valid without signature.</p>
                  <p>KMZ CRM Multi-Bank Module Ledger</p>
                </div>
                <div className="text-center">
                  <div className="w-48 border-b border-zinc-600 mb-1 print:border-black" />
                  <p className="text-xs font-semibold text-zinc-400 print:text-black">Authorized Accountant Signature</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: BANK BALANCE REPORTS */}
      {activeSubTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  Consolidated Bank & Cash Balances Report
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Summary of opening balances, inflows, outflows, and current net balances across all accounts.
                </p>
              </div>

              <button
                onClick={handlePrintStatement}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl text-xs transition-all shadow-md"
              >
                <Printer className="w-4 h-4" />
                Print Balance Report
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-950 text-zinc-400 uppercase text-xs tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4">Bank Name / Cash Desk</th>
                    <th className="px-6 py-4">Account Title</th>
                    <th className="px-6 py-4">Account #</th>
                    <th className="px-6 py-4 text-right">Opening Balance</th>
                    <th className="px-6 py-4 text-right text-emerald-400">Total Receipts (+)</th>
                    <th className="px-6 py-4 text-right text-red-400">Total Expenses (-)</th>
                    <th className="px-6 py-4 text-right font-bold text-amber-400">Closing Balance</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                  {bankAccounts.map((acc) => {
                    const txSummary = getAccountTransactions(acc.id);
                    return (
                      <tr key={acc.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="px-6 py-4 font-bold text-zinc-100 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-amber-400" />
                          {acc.bankName}
                        </td>
                        <td className="px-6 py-4 text-zinc-300">{acc.accountTitle}</td>
                        <td className="px-6 py-4 font-mono text-zinc-400">{acc.accountNumber}</td>
                        <td className="px-6 py-4 text-right font-mono">
                          PKR {acc.openingBalance.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-emerald-400 font-semibold">
                          + PKR {txSummary.totalInflows.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-red-400 font-semibold">
                          - PKR {txSummary.totalOutflows.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-extrabold text-amber-400 text-base">
                          PKR {txSummary.closingBalance.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              acc.status === 'Active'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {acc.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-zinc-950 font-bold border-t-2 border-amber-500/30 text-zinc-100">
                  <tr>
                    <td colSpan={3} className="px-6 py-4 uppercase tracking-wider text-xs text-amber-400">
                      CONSOLIDATED TOTALS
                    </td>
                    <td className="px-6 py-4 text-right font-mono">
                      PKR {bankAccounts.reduce((sum, a) => sum + a.openingBalance, 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-emerald-400">
                      + PKR{' '}
                      {bankAccounts
                        .reduce((sum, a) => sum + getAccountTransactions(a.id).totalInflows, 0)
                        .toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-red-400">
                      - PKR{' '}
                      {bankAccounts
                        .reduce((sum, a) => sum + getAccountTransactions(a.id).totalOutflows, 0)
                        .toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-amber-400 text-lg">
                      PKR {grandTotalLiquidity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center text-xs text-zinc-500">AUDITED</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT BANK ACCOUNT */}
      <Modal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        title={editingAccount ? 'Edit Bank Account' : 'Add New Bank Account'}
        subtitle="Manage corporate banking details and cash accounts for transaction tracking."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveAccount} className="space-y-4 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Bank Name / Account Label <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Meezan Bank, Cash Counter"
                value={accountFormData.bankName}
                onChange={(e) => setAccountFormData({ ...accountFormData, bankName: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Account Type</label>
              <select
                value={accountFormData.accountType}
                onChange={(e) => setAccountFormData({ ...accountFormData, accountType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50"
              >
                <option value="Current">Current Account</option>
                <option value="Savings">Savings Account</option>
                <option value="Islamic Business">Islamic Business Account</option>
                <option value="Cash Account">Cash Account / Counter</option>
                <option value="Foreign Currency">Foreign Currency Account</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Account Title (Beneficiary Name) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. KMZ Travels & Tours (Pvt) Ltd"
                value={accountFormData.accountTitle}
                onChange={(e) => setAccountFormData({ ...accountFormData, accountTitle: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Account Number <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 0102010293841"
                value={accountFormData.accountNumber}
                onChange={(e) => setAccountFormData({ ...accountFormData, accountNumber: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">IBAN (International Bank #)</label>
              <input
                type="text"
                placeholder="e.g. PK89MEZN000102010293841"
                value={accountFormData.iban}
                onChange={(e) => setAccountFormData({ ...accountFormData, iban: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Branch Name & City</label>
              <input
                type="text"
                placeholder="e.g. Gulberg III Branch, Lahore"
                value={accountFormData.branch}
                onChange={(e) => setAccountFormData({ ...accountFormData, branch: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Opening Balance (PKR)</label>
              <input
                type="number"
                min="0"
                value={accountFormData.openingBalance}
                onChange={(e) => setAccountFormData({ ...accountFormData, openingBalance: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Account Status</label>
              <select
                value={accountFormData.status}
                onChange={(e: any) => setAccountFormData({ ...accountFormData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-300 mb-1">Internal Remarks / Notes</label>
              <textarea
                rows={2}
                placeholder="Optional operational details, checkbook limits..."
                value={accountFormData.notes}
                onChange={(e) => setAccountFormData({ ...accountFormData, notes: e.target.value })}
                className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsAccountModalOpen(false)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              {editingAccount ? 'Update Bank Account' : 'Save Bank Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: NEW BANK / CASH TRANSFER */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Record Bank / Cash Transfer"
        subtitle="Transfer funds between bank accounts or deposit physical cash into bank."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveTransfer} className="space-y-4 p-6">
          {transferError && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{transferError}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                From Account (Source / Debited Account) <span className="text-red-400">*</span>
              </label>
              <select
                value={transferFormData.fromAccountId}
                onChange={(e) => setTransferFormData({ ...transferFormData, fromAccountId: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50"
              >
                {bankAccounts.map((acc) => {
                  const bal = getBankAccountBalance(acc.id);
                  return (
                    <option key={acc.id} value={acc.id}>
                      {acc.bankName} ({acc.accountNumber}) - Available: PKR {bal.toLocaleString()}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                To Account (Destination / Credited Account) <span className="text-red-400">*</span>
              </label>
              <select
                value={transferFormData.toAccountId}
                onChange={(e) => setTransferFormData({ ...transferFormData, toAccountId: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50"
              >
                {bankAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.bankName} ({acc.accountNumber})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Transfer Amount (PKR) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="0"
                  value={transferFormData.amount || ''}
                  onChange={(e) => setTransferFormData({ ...transferFormData, amount: Number(e.target.value) })}
                  required
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 font-mono font-bold text-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Transfer Date</label>
                <input
                  type="date"
                  value={transferFormData.date}
                  onChange={(e) => setTransferFormData({ ...transferFormData, date: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Reference / Cheque / Online Ref #</label>
              <input
                type="text"
                placeholder="e.g. IFT-991023, Cheque #00421"
                value={transferFormData.referenceNumber}
                onChange={(e) => setTransferFormData({ ...transferFormData, referenceNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Purpose / Narration</label>
              <input
                type="text"
                placeholder="e.g. Cash counter deposit into Meezan, Liquidity shift for Nusuk visa wallet"
                value={transferFormData.description}
                onChange={(e) => setTransferFormData({ ...transferFormData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(false)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              Confirm Transfer
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: DELETE ACCOUNT CONFIRMATION */}
      {deletingAccountId && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingAccountId(null)}
          title="Confirm Delete Bank Account"
          maxWidth="sm"
        >
          <div className="p-6 space-y-4 text-center">
            <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <p className="text-sm text-zinc-300">
              Are you sure you want to delete this bank account? Historical transaction records will remain in the database for auditing purposes.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingAccountId(null)}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteBankAccount(deletingAccountId);
                  setDeletingAccountId(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold"
              >
                Delete Account
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 4: DELETE TRANSFER CONFIRMATION */}
      {deletingTransferId && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingTransferId(null)}
          title="Reverse / Delete Transfer"
          maxWidth="sm"
        >
          <div className="p-6 space-y-4 text-center">
            <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto">
              <ArrowUpDown className="w-6 h-6" />
            </div>
            <p className="text-sm text-zinc-300">
              Are you sure you want to delete this fund transfer record? The transfer amount will be restored to source account and deducted from destination account.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingTransferId(null)}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteBankTransfer(deletingTransferId);
                  setDeletingTransferId(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold"
              >
                Delete & Reverse
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
