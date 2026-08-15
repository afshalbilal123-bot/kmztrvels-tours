import React, { useState } from 'react';
import { Ticket, Search, Printer, Download, Building, Plane, Car, Sparkles, MessageSquare } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Booking } from '../../types';
import { Modal } from '../common/Modal';
import { openWhatsApp, createVoucherDetailsMessage } from '../../utils/whatsapp';
import { generateVoucherPDF } from '../../utils/pdfGenerator';

export const VoucherList: React.FC = () => {
  const { bookings, packages } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(bookings[0] || null);

  const filtered = bookings.filter((b) =>
    b.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => {
    if (selectedBooking) {
      generateVoucherPDF(selectedBooking, packages);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
            <Ticket className="w-6 h-6 text-amber-400" />
            Official Umrah & Hajj Service Vouchers
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Generate and print verified hotel vouchers, flight PNR vouchers, and transport authorization receipts.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List */}
        <div className="bg-zinc-900/90 p-4 rounded-2xl border border-amber-500/20 space-y-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search booking..."
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100"
          />

          <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
            {filtered.map((b) => (
              <div
                key={b.id}
                onClick={() => setSelectedBooking(b)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedBooking?.id === b.id
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <div className="font-mono font-bold text-xs">{b.bookingNumber}</div>
                <div className="font-semibold text-white text-xs">{b.customerName}</div>
                <div className="text-[10px] text-zinc-400 mt-1">{b.packageName}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Voucher Preview Box */}
        <div className="lg:col-span-2">
          {selectedBooking ? (
            <div className="bg-zinc-900 rounded-2xl border border-amber-500/30 p-6 space-y-6 shadow-2xl relative">
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    const msg = createVoucherDetailsMessage({
                      customerName: selectedBooking.customerName,
                      bookingNumber: selectedBooking.bookingNumber,
                      packageName: selectedBooking.packageName,
                      departureDate: selectedBooking.departureDate,
                      paxAdults: selectedBooking.paxAdults,
                      hotels: selectedBooking.hotels,
                      flight: selectedBooking.flight,
                      visa: selectedBooking.visa,
                    });
                    openWhatsApp(selectedBooking.customerPhone, msg);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-emerald-600 transition-all"
                >
                  <MessageSquare className="w-4 h-4 fill-current" /> Share Voucher via WhatsApp
                </button>

                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500"
                >
                  <Printer className="w-4 h-4" /> Print Voucher / Download PDF
                </button>
              </div>

              {/* Printable Voucher Card */}
              <div id="printable-voucher" className="p-8 bg-zinc-950 border-2 border-amber-500/40 rounded-2xl space-y-6 text-zinc-100">
                {/* Voucher Header */}
                <div className="flex items-center justify-between pb-6 border-b border-amber-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-200 p-0.5">
                      <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center font-serif font-black text-amber-400 text-xl">
                        KMZ
                      </div>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold font-serif text-white tracking-wide">
                        KMZ TRAVELS & TOURS
                      </h1>
                      <p className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest">
                        Official Pilgrimage Service Voucher
                      </p>
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-amber-300">
                      VOUCHER #{selectedBooking.bookingNumber}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Issue Date: {new Date().toISOString().split('T')[0]}
                    </div>
                    <div className="text-[10px] text-amber-400 font-bold mt-1">
                      WhatsApp: 03018647596 | Call: 03147861122
                    </div>
                  </div>
                </div>

                {/* Pilgrim Information */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                  <div>
                    <span className="text-[10px] text-amber-400 uppercase font-bold">Pilgrim Name</span>
                    <div className="font-bold text-white text-sm mt-0.5">{selectedBooking.customerName}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-400 uppercase font-bold">Phone Number</span>
                    <div className="font-medium text-zinc-200 mt-0.5">{selectedBooking.customerPhone}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-400 uppercase font-bold">Pax Breakdown</span>
                    <div className="font-medium text-zinc-200 mt-0.5">
                      {selectedBooking.paxAdults} Adults, {selectedBooking.paxChildren} Children
                    </div>
                  </div>
                </div>

                {/* Hotel Accommodations */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-4 h-4" /> Saudi Hotel Accommodations
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedBooking.hotels.map((h, i) => {
                      const matchedPkg = packages.find(
                        (p) => p.id === selectedBooking.packageId || p.title.toLowerCase().includes(selectedBooking.packageName.toLowerCase())
                      );
                      const imgUrl =
                        h.city === 'Makkah'
                          ? matchedPkg?.makkahImage
                          : h.city === 'Madina'
                          ? matchedPkg?.madinaImage
                          : null;

                      return (
                        <div key={i} className="p-3.5 rounded-xl bg-zinc-900 border border-amber-500/20 text-xs space-y-2 flex items-start gap-3">
                          {imgUrl && (
                            <img src={imgUrl} alt={h.hotelName} className="w-14 h-14 rounded-lg object-cover ring-1 ring-amber-500/30 shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-sm">{h.city}: {h.hotelName}</span>
                              <span className="text-[10px] bg-amber-500/10 text-amber-300 font-mono px-2 py-0.5 rounded">{h.roomType}</span>
                            </div>
                            <div className="text-zinc-300 text-[11px]">
                              Check-in: <span className="font-semibold text-white">{h.checkIn}</span> • Check-out: <span className="font-semibold text-white">{h.checkOut}</span> ({h.nights} Nights)
                            </div>
                            <div className="text-zinc-300 text-[11px] flex justify-between pt-1 border-t border-zinc-800">
                              <span>Rate / Night: <span className="font-bold text-amber-300">PKR {(h.ratePerNight || 0).toLocaleString()}</span></span>
                              <span>Total: <span className="font-extrabold text-amber-300">PKR {(h.totalRate || h.totalHotelCost || h.nights * h.ratePerNight).toLocaleString()}</span></span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Flight & Transport Authorization */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <h4 className="font-bold text-amber-400 uppercase text-[10px] flex items-center gap-1">
                      <Plane className="w-3.5 h-3.5" /> Flight Ticket Reservation
                    </h4>
                    <div>Airline: {selectedBooking.flight.airline}</div>
                    <div>PNR Code: <span className="font-mono font-bold text-amber-300">{selectedBooking.flight.pnr}</span></div>
                    <div>Route: {selectedBooking.flight.departureAirport} to {selectedBooking.flight.arrivalAirport}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <h4 className="font-bold text-amber-400 uppercase text-[10px] flex items-center gap-1">
                      <Car className="w-3.5 h-3.5" /> Private Transport & Ziyarat
                    </h4>
                    <div>Vehicle: {selectedBooking.transport.transportType}</div>
                    <div>Route: {selectedBooking.transport.route}</div>
                    <div>Driver Contact: {selectedBooking.transport.driverContact || 'Assigned on arrival'}</div>
                  </div>
                </div>

                {/* Voucher Footer Seal & QR */}
                <div className="pt-6 border-t border-amber-500/30 flex items-center justify-between text-[10px] text-zinc-400">
                  <div className="space-y-1">
                    <div className="font-bold text-amber-300">KMZ TRAVELS & TOURS (PVT) LTD</div>
                    <div>Owner: <span className="text-white font-bold">Toheed Asghar Shahid</span></div>
                    <div>Address: P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad</div>
                    <div>WhatsApp: <span className="font-mono text-amber-400">03018647596</span> | Contact: <span className="font-mono text-amber-400">03147861122</span></div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="w-16 h-16 bg-white p-1 rounded-lg flex items-center justify-center font-mono text-[8px] text-black font-bold text-center ml-auto">
                      [QR CODE VERIFIED]
                    </div>
                    <div className="text-[9px] text-zinc-500">Official KMZ Authorization</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500 bg-zinc-900 rounded-2xl border border-zinc-800">
              Select a booking from the left list to view service voucher.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
