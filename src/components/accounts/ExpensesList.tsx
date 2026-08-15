import React, { useState } from 'react';
import { Receipt, Plus, Search, Trash2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Expense } from '../../types';
import { Modal } from '../common/Modal';
import { GoldBadge } from '../common/GoldBadge';

export const ExpensesList: React.FC = () => {
  const { expenses, bankAccounts, addExpense, deleteExpense } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    category: 'Hotel Supplier' as Expense['category'],
    title: '',
    amount: 150000,
    paymentMethod: 'Bank Transfer' as Expense['paymentMethod'],
    bankAccountId: bankAccounts[0]?.id || '',
    vendorName: '',
    notes: '',
  });

  const handleOpenAdd = () => {
    setFormData({
      category: 'Hotel Supplier',
      title: 'Fairmont Hotel Advance Settlement',
      amount: 250000,
      paymentMethod: 'Bank Transfer',
      bankAccountId: bankAccounts[0]?.id || '',
      vendorName: 'Fairmont Hotel Saudi Arabia',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedBank = bankAccounts.find((a) => a.id === formData.bankAccountId);
    addExpense({
      ...formData,
      bankAccountId: selectedBank?.id,
      bankAccountName: selectedBank ? `${selectedBank.bankName} (${selectedBank.accountNumber})` : undefined,
      date: new Date().toISOString().split('T')[0],
      status: 'Paid',
      recordedBy: 'Finance Dept',
    });
    setIsModalOpen(false);
  };

  const filteredExpenses = expenses.filter(
    (e) =>
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.vendorName && e.vendorName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-amber-400" />
            Company Operating Expenses & Accounts
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Track vendor payments, Saudi hotel deposits, airline group ticketing, MOFA visa wallet top-ups, and office overheads.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/90 rounded-2xl border border-amber-500/20 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-zinc-800">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search title, category, vendor..."
            className="w-full max-w-sm px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="p-4">Ref #</th>
                <th className="p-4">Category</th>
                <th className="p-4">Expense Title</th>
                <th className="p-4">Vendor / Payee</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Method</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredExpenses.map((e) => (
                <tr key={e.id} className="hover:bg-zinc-800/40">
                  <td className="p-4 font-mono font-bold text-amber-400">{e.expenseNumber}</td>
                  <td className="p-4">
                    <GoldBadge variant="slate">{e.category}</GoldBadge>
                  </td>
                  <td className="p-4 font-semibold text-white">{e.title}</td>
                  <td className="p-4 text-zinc-300">{e.vendorName || 'N/A'}</td>
                  <td className="p-4 font-extrabold text-rose-400">
                    PKR {e.amount.toLocaleString()}
                  </td>
                  <td className="p-4 text-zinc-400">{e.paymentMethod}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => deleteExpense(e.id)}
                      className="p-1.5 rounded-lg bg-zinc-800 text-rose-400 hover:bg-rose-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Operating Expense"
        subtitle="Keep track of all vendor outflows for net profit calculation."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value as Expense['category'] })
              }
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100"
            >
              <option value="Hotel Supplier">Hotel Supplier</option>
              <option value="Airline Tickets">Airline Tickets</option>
              <option value="MOFA Visa Fee">MOFA Visa Fee</option>
              <option value="Transport Vendor">Transport Vendor</option>
              <option value="Office Rent & Utilities">Office Rent & Utilities</option>
              <option value="Marketing">Marketing</option>
              <option value="Staff Salary">Staff Salary</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Expense Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Amount (PKR) *
              </label>
              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Vendor / Payee Name
              </label>
              <input
                type="text"
                value={formData.vendorName}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Paid From Bank / Cash Account *
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
              className="px-5 py-2 bg-amber-500 text-zinc-950 font-extrabold rounded-xl text-xs hover:bg-amber-400"
            >
              Save Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
