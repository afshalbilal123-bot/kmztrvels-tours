import React, { useState } from 'react';
import { CreditCard, AlertCircle, MessageSquare, CheckCircle, Search, Filter, Send, Banknote } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const ReceivablesView: React.FC = () => {
  const { bookings, customers } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  // Pending bookings with unpaid balance > 0
  const pendingBookings = bookings.filter((b) => b.paymentStatus !== 'Paid' && b.totalAmount - b.paidAmount > 0);

  const totalOutstanding = pendingBookings.reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0);

  const filtered = pendingBookings.filter((b) => {
    const cust = customers.find((c) => c.id === b.customerId);
    const text = `${b.id} ${b.packageName} ${cust?.name || ''} ${cust?.phone || ''}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  const handleSendReminder = (bookingId: string, customerPhone: string, customerName: string, balance: number) => {
    const cleanPhone = (customerPhone || '').replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('92') ? cleanPhone : `92${cleanPhone.replace(/^0/, '')}`;
    const msg = `Assalamu Alaikum ${customerName} Sahib,\n\nThis is a friendly payment reminder from KMZ Travels & Tours (Pvt) Ltd regarding your Umrah/Hajj Booking #${bookingId}.\n\nRemaining Pending Balance: PKR ${balance.toLocaleString()}\n\nPayment Options:\n- Meezan Bank / HBL Transfer\n- JazzCash: 03018647596\n- EasyPaisa: 03147861122\n\nContact us at 03018647596 / 03147861122.\n\nJazakAllah Khair,\nKMZ Travels & Tours Faisalabad`;

    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-amber-400" />
            Payment Recovery & Outstanding Receivables
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time aging accounts receivable tracking, overdue balances, and 1-click WhatsApp payment reminders.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-right">
          <span className="text-[10px] text-amber-400 uppercase font-extrabold tracking-widest block">
            TOTAL RECEIVABLE BALANCE
          </span>
          <span className="text-2xl font-black text-white">PKR {totalOutstanding.toLocaleString()}</span>
        </div>
      </div>

      {/* Filter */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/80" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search customer, phone, booking ID..."
          className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-amber-500/20 rounded-xl text-xs text-zinc-100 placeholder-zinc-500"
        />
      </div>

      {/* Receivables Table */}
      <div className="bg-zinc-900/90 rounded-2xl border border-amber-500/20 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="p-4">Booking Ref</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Package Details</th>
                <th className="p-4">Total Price</th>
                <th className="p-4">Paid Amount</th>
                <th className="p-4">Overdue Balance</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-500">
                    No outstanding receivables found. All payments are clear!
                  </td>
                </tr>
              ) : (
                filtered.map((b) => {
                  const cust = customers.find((c) => c.id === b.customerId);
                  const balance = b.totalAmount - b.paidAmount;

                  return (
                    <tr key={b.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-amber-300">#{b.id}</td>
                      <td className="p-4">
                        <div className="font-bold text-white">{cust?.name || 'Customer'}</div>
                        <div className="text-[10px] text-zinc-400">{cust?.phone}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-zinc-200">{b.packageName}</div>
                        <div className="text-[10px] text-zinc-500">{b.travelDates}</div>
                      </td>
                      <td className="p-4 font-semibold text-zinc-300">PKR {b.totalAmount.toLocaleString()}</td>
                      <td className="p-4 font-semibold text-emerald-400">PKR {b.paidAmount.toLocaleString()}</td>
                      <td className="p-4 font-black text-rose-400 text-sm">PKR {balance.toLocaleString()}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {b.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleSendReminder(b.id, cust?.phone || '03018647596', cust?.name || 'Pilgrim', balance)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-xl flex items-center gap-1.5 ml-auto shadow-md shadow-emerald-600/20"
                        >
                          <MessageSquare className="w-3.5 h-3.5 fill-current" />
                          <span>WhatsApp Reminder</span>
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
    </div>
  );
};
