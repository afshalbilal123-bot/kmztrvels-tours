import React, { useState } from 'react';
import {
  FileCheck2,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Filter,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { GoldBadge } from '../common/GoldBadge';

export const VisaList: React.FC = () => {
  const { bookings, updateBooking } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredBookings = bookings.filter((b) => {
    const matchSearch =
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.visa.nusukId && b.visa.nusukId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus = statusFilter === 'all' || b.visa.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleUpdateStatus = (bookingId: string, newStatus: any) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      updateBooking({
        ...booking,
        visa: {
          ...booking.visa,
          status: newStatus,
          issueDate: newStatus === 'Issued' ? new Date().toISOString().split('T')[0] : booking.visa.issueDate,
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-amber-400" />
            Saudi MOFA & Nusuk E-Visa Processing
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time tracking of Nusuk portal submissions, MOFA approval workflow, and visa barcode issuance.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/80" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search pilgrim, Nusuk ID, booking #..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-amber-500/20 rounded-xl text-xs text-zinc-100 placeholder-zinc-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'Submitted', 'Processing', 'Approved', 'Issued'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Visas Table */}
      <div className="bg-zinc-900/90 rounded-2xl border border-amber-500/20 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="p-4">Pilgrim & Booking</th>
                <th className="p-4">Visa Type</th>
                <th className="p-4">Nusuk ID & Visa #</th>
                <th className="p-4">Issue / Expiry Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">
                    No visas found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{b.customerName}</div>
                      <div className="font-mono text-[10px] text-amber-300">{b.bookingNumber}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-zinc-200">{b.visa.visaType}</div>
                      <div className="text-[10px] text-zinc-400">Pax: {b.paxAdults}</div>
                    </td>
                    <td className="p-4 font-mono">
                      <div className="text-amber-300 font-bold">{b.visa.nusukId || 'NUSUK-PENDING'}</div>
                      <div className="text-zinc-400 text-[10px]">{b.visa.visaNumber || 'SA-MOFA-GEN'}</div>
                    </td>
                    <td className="p-4 text-[11px]">
                      <div>Issued: {b.visa.issueDate || 'In Process'}</div>
                      <div className="text-zinc-500">Exp: {b.visa.expiryDate || 'N/A'}</div>
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
                      <select
                        value={b.visa.status}
                        onChange={(e) => handleUpdateStatus(b.id, e.target.value)}
                        className="px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-xs text-amber-300 font-bold focus:outline-none"
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Processing">Processing</option>
                        <option value="Approved">Approved</option>
                        <option value="Issued">Issued</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
