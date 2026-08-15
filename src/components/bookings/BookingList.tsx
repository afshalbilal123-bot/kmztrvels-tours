import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  Building,
  Plane,
  FileCheck2,
  Trash2,
  Edit2,
  Eye,
  FileText,
  DollarSign,
  Download,
  MessageSquare,
  Send,
  Bell,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Booking } from '../../types';
import { GoldBadge } from '../common/GoldBadge';
import { BookingFormModal } from './BookingFormModal';
import { Modal } from '../common/Modal';
import {
  openWhatsApp,
  createBookingConfirmationMessage,
  createPaymentReminderMessage,
  createVoucherDetailsMessage,
} from '../../utils/whatsapp';

export const BookingList: React.FC = () => {
  const { bookings, deleteBooking, setActiveTab } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);

  const handleOpenAdd = () => {
    setEditingBooking(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (b: Booking) => {
    setEditingBooking(b);
    setIsFormOpen(true);
  };

  const handleSendConfirmationWhatsApp = (b: Booking) => {
    const msg = createBookingConfirmationMessage({
      customerName: b.customerName,
      bookingNumber: b.bookingNumber,
      packageName: b.packageName,
      departureDate: b.departureDate,
      totalAmount: b.totalAmount,
      flight: b.flight,
    });
    openWhatsApp(b.customerPhone, msg);
  };

  const handleSendPaymentReminderWhatsApp = (b: Booking) => {
    const msg = createPaymentReminderMessage({
      customerName: b.customerName,
      bookingNumber: b.bookingNumber,
      packageName: b.packageName,
      totalAmount: b.totalAmount,
      paidAmount: b.paidAmount,
      balanceAmount: b.balanceAmount,
    });
    openWhatsApp(b.customerPhone, msg);
  };

  const handleSendVoucherWhatsApp = (b: Booking) => {
    const msg = createVoucherDetailsMessage({
      customerName: b.customerName,
      bookingNumber: b.bookingNumber,
      packageName: b.packageName,
      departureDate: b.departureDate,
      paxAdults: b.paxAdults,
      hotels: b.hotels,
      flight: b.flight,
      visa: b.visa,
    });
    openWhatsApp(b.customerPhone, msg);
  };

  const filteredBookings = bookings.filter((b) => {
    const matchSearch =
      b.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.flight.pnr.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'all' || b.bookingStatus === statusFilter;
    const matchType = typeFilter === 'all' || b.packageType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#032d22]/90 via-[#02241b] to-[#021812] border border-[#d4af37]/35 shadow-xl">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#fdfbf7] flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-[#d4af37]" />
            Umrah & Hajj Bookings Directory
          </h2>
          <p className="text-xs text-emerald-200/70 mt-1">
            Complete management of pilgrimage reservations, multi-hotel accommodations, flights, and Saudi E-Visas.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f5ecd0] to-[#b89047] hover:from-[#f5ecd0] hover:to-[#d4af37] text-[#021812] font-black text-xs shadow-lg shadow-[#d4af37]/25 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Booking</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#02241b]/90 p-4 rounded-xl border border-[#d4af37]/25">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]/80" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search booking #, pilgrim, PNR..."
            className="w-full pl-10 pr-4 py-2 bg-[#021812] border border-[#064e3b] focus:border-[#d4af37] rounded-xl text-xs text-[#fdfbf7] placeholder-emerald-200/40 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#021812] px-2 py-1 rounded-xl border border-[#064e3b] text-xs">
            <span className="text-emerald-200/60 font-semibold uppercase text-[10px]">Type:</span>
            {['all', 'Umrah', 'Hajj'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  typeFilter === type
                    ? 'bg-[#d4af37] text-[#021812] font-black'
                    : 'text-emerald-200/60 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-[#021812] px-2 py-1 rounded-xl border border-[#064e3b] text-xs">
            <span className="text-emerald-200/60 font-semibold uppercase text-[10px]">Status:</span>
            {['all', 'Confirmed', 'In Progress', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-[#d4af37] text-[#021812] font-black'
                    : 'text-emerald-200/60 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-[#02241b]/90 rounded-2xl border border-[#d4af37]/25 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-emerald-100">
            <thead className="bg-[#021812] text-[#d4af37] uppercase tracking-wider font-semibold border-b border-[#064e3b] font-serif">
              <tr>
                <th className="p-4">Booking Ref</th>
                <th className="p-4">Pilgrim Name</th>
                <th className="p-4">Package</th>
                <th className="p-4">Hotels Booked</th>
                <th className="p-4">Flight & PNR</th>
                <th className="p-4">Finances</th>
                <th className="p-4">Visa Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#064e3b]/35">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-emerald-200/50">
                    No bookings found matching filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#064e3b]/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#d4af37]">
                      {b.bookingNumber}
                    </td>
                    <td className="p-4 font-semibold text-[#fdfbf7]">
                      <div>{b.customerName}</div>
                      <div className="text-[10px] text-emerald-200/60">{b.customerPhone}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white">{b.packageName}</div>
                      <div className="text-[10px] text-[#d4af37]">
                        {b.paxAdults} Pax • {b.departureDate}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {b.hotels.map((h, idx) => (
                          <div
                            key={idx}
                            className="text-[10px] bg-[#021812] p-1.5 rounded-lg border border-[#064e3b] space-y-0.5"
                          >
                            <div className="font-bold text-[#d4af37]">
                              {h.city}: {h.hotelName}
                            </div>
                            <div className="text-emerald-200/70">
                              {h.roomType} • {h.checkIn} to {h.checkOut} ({h.nights}N)
                            </div>
                            <div className="text-[#f5ecd0] font-mono">
                              PKR {(h.ratePerNight || 0).toLocaleString()}/night = PKR {(h.totalRate || h.totalHotelCost || h.nights * h.ratePerNight).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-emerald-100">{b.flight.airline}</div>
                      <div className="font-mono text-[10px] text-[#d4af37] font-bold">
                        PNR: {b.flight.pnr}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-[#fdfbf7]">
                        PKR {b.totalAmount.toLocaleString()}
                      </div>
                      <div
                        className={`text-[10px] font-semibold ${
                          b.balanceAmount === 0 ? 'text-emerald-300' : 'text-rose-300'
                        }`}
                      >
                        Paid: {b.paidAmount.toLocaleString()}
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
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleSendConfirmationWhatsApp(b)}
                          className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/35 hover:bg-emerald-500/30 cursor-pointer"
                          title="WhatsApp Booking Confirmation"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        {b.balanceAmount > 0 && (
                          <button
                            onClick={() => handleSendPaymentReminderWhatsApp(b)}
                            className="p-1.5 rounded-lg bg-[#d4af37]/15 text-[#f5ecd0] border border-[#d4af37]/35 hover:bg-[#d4af37]/30 cursor-pointer"
                            title="WhatsApp Payment Reminder"
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleSendVoucherWhatsApp(b)}
                          className="p-1.5 rounded-lg bg-[#047857]/20 text-emerald-200 border border-[#047857]/40 hover:bg-[#047857]/40 cursor-pointer"
                          title="WhatsApp Voucher & Details"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setViewingBooking(b)}
                          className="p-1.5 rounded-lg bg-[#064e3b]/40 text-emerald-100 hover:text-[#d4af37] hover:bg-[#064e3b]/70 border border-[#064e3b] cursor-pointer"
                          title="View Full Booking Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="p-1.5 rounded-lg bg-[#064e3b]/40 text-emerald-100 hover:text-[#d4af37] hover:bg-[#064e3b]/70 border border-[#064e3b] cursor-pointer"
                          title="Edit Booking"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteBooking(b.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30 cursor-pointer"
                          title="Delete Booking"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Form Modal */}
      {isFormOpen && (
        <BookingFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          editingBooking={editingBooking}
        />
      )}

      {/* Detailed Booking View Modal */}
      {viewingBooking && (
        <Modal
          isOpen={true}
          onClose={() => setViewingBooking(null)}
          title={`Booking Details #${viewingBooking.bookingNumber}`}
          subtitle={`Pilgrim: ${viewingBooking.customerName} • Package: ${viewingBooking.packageName}`}
          maxWidth="4xl"
        >
          <div className="space-y-6 text-xs text-zinc-200">
            {/* Multi-Hotel Summary Box */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-amber-500/30 space-y-3">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                <Building className="w-4 h-4" /> Reserved Hotel Accommodations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {viewingBooking.hotels.map((h, i) => (
                  <div key={i} className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                      <span className="font-bold text-amber-400 text-sm">{h.city}: {h.hotelName}</span>
                      <span className="text-[10px] bg-amber-500/10 text-amber-300 font-mono px-2 py-0.5 rounded-full">{h.roomType}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300">
                      <div>Check-in: <span className="font-semibold text-white">{h.checkIn}</span></div>
                      <div>Check-out: <span className="font-semibold text-white">{h.checkOut}</span></div>
                      <div>Nights: <span className="font-semibold text-white">{h.nights}</span></div>
                      <div>Rate / Night: <span className="font-semibold text-amber-300">PKR {(h.ratePerNight || 0).toLocaleString()}</span></div>
                    </div>
                    <div className="font-extrabold text-amber-300 pt-2 border-t border-zinc-800 flex justify-between text-xs">
                      <span>Total Hotel Cost:</span>
                      <span>PKR {(h.totalRate || h.totalHotelCost || h.nights * h.ratePerNight).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Flight & Visa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <h4 className="font-bold text-amber-400 uppercase text-[11px]">Flight Info</h4>
                <div>Airline: {viewingBooking.flight.airline}</div>
                <div>PNR: <span className="font-mono font-bold text-amber-300">{viewingBooking.flight.pnr}</span></div>
                <div>Route: {viewingBooking.flight.departureAirport} to {viewingBooking.flight.arrivalAirport}</div>
                <div>Schedule: {viewingBooking.flight.departureDatetime}</div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <h4 className="font-bold text-amber-400 uppercase text-[11px]">Saudi E-Visa Info</h4>
                <div>Visa Type: {viewingBooking.visa.visaType}</div>
                <div>Status: <span className="font-bold text-emerald-400">{viewingBooking.visa.status}</span></div>
                <div>Nusuk ID: <span className="font-mono text-zinc-300">{viewingBooking.visa.nusukId}</span></div>
                <div>Expiry: {viewingBooking.visa.expiryDate || 'N/A'}</div>
              </div>
            </div>

            {/* Direct WhatsApp Alerts Panel */}
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" /> Send Direct WhatsApp Alerts
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  onClick={() => handleSendConfirmationWhatsApp(viewingBooking)}
                  className="px-3 py-2.5 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Confirmation</span>
                </button>

                <button
                  onClick={() => handleSendPaymentReminderWhatsApp(viewingBooking)}
                  className="px-3 py-2.5 rounded-xl bg-amber-600/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Send Payment Reminder</span>
                </button>

                <button
                  onClick={() => handleSendVoucherWhatsApp(viewingBooking)}
                  className="px-3 py-2.5 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/30 text-xs font-bold hover:bg-blue-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Send Voucher Details</span>
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  setViewingBooking(null);
                  setActiveTab('vouchers');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30"
              >
                Generate Service Voucher
              </button>
              <button
                onClick={() => {
                  setViewingBooking(null);
                  setActiveTab('invoices');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 text-xs font-bold hover:bg-amber-400"
              >
                View Invoice & Receipt
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
