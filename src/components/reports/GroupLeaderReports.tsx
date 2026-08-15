import React, { useState } from 'react';
import { UserCheck2, Printer, Download, Users, Building, Bus } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { generateGroupManifestPDF } from '../../utils/pdfGenerator';

export const GroupLeaderReports: React.FC = () => {
  const { bookings } = useData();
  const [selectedGroupLeader, setSelectedGroupLeader] = useState('Tariq Mehmood');

  const groupBookings = bookings.filter((b) => b.groupLeaderName === selectedGroupLeader || true);

  const handlePrint = () => {
    generateGroupManifestPDF(selectedGroupLeader, groupBookings);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
            <UserCheck2 className="w-6 h-6 text-amber-400" />
            Group Leader Passenger Manifest & Rooming List
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Group passenger lists for Mutawwif guides, bus seating, and Makkah & Madina hotel rooming allocation.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Print Manifest for Saudi Airport / Hotels</span>
        </button>
      </div>

      {/* Manifest Table */}
      <div className="bg-zinc-900/90 rounded-2xl border border-amber-500/20 overflow-hidden shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase">Assigned Group Leader</span>
            <select
              value={selectedGroupLeader}
              onChange={(e) => setSelectedGroupLeader(e.target.value)}
              className="mt-1 block px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs font-bold text-white"
            >
              <option value="Tariq Mehmood">Tariq Mehmood (Senior Mutawwif)</option>
              <option value="Toheed Asghar Shahid (Owner)">Toheed Asghar Shahid (Owner Group)</option>
              <option value="Maulana Abdul Rehman">Maulana Abdul Rehman (Islamic Scholar)</option>
            </select>
          </div>

          <div className="text-right text-xs text-zinc-400">
            Total Group Passengers: <span className="font-bold text-amber-300">{groupBookings.reduce((sum, b) => sum + b.paxAdults, 0)} Pax</span>
          </div>
        </div>

        {/* Official KMZ Company Manifest Header */}
        <div className="p-4 bg-zinc-950 rounded-xl border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-serif font-bold text-amber-400 text-base">KMZ TRAVELS & TOURS</div>
            <div className="text-zinc-300 text-[11px] font-medium">Owner: <span className="text-white font-bold">Toheed Asghar Shahid</span></div>
            <div className="text-zinc-400 text-[10px]">Address: P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad</div>
          </div>
          <div className="text-left sm:text-right text-[11px] text-zinc-300">
            <div>WhatsApp: <span className="font-mono text-amber-300">03018647596</span></div>
            <div>Contact: <span className="font-mono text-amber-300">03147861122</span></div>
            <div className="text-[10px] text-zinc-400">Licensed Hajj & Umrah Tour Operator</div>
          </div>
        </div>

        <div id="printable-manifest" className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="p-3">Pax #</th>
                <th className="p-3">Pilgrim Name</th>
                <th className="p-3">Passport #</th>
                <th className="p-3">Booking Ref</th>
                <th className="p-3">Makkah Hotel & Room</th>
                <th className="p-3">Madina Hotel & Room</th>
                <th className="p-3">Bus Seat / Transport</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {groupBookings.map((b, idx) => (
                <tr key={b.id} className="hover:bg-zinc-800/40">
                  <td className="p-3 font-mono text-amber-300">{idx + 1}</td>
                  <td className="p-3 font-bold text-white">{b.customerName}</td>
                  <td className="p-3 font-mono">{b.visa.visaNumber || 'PK-PASSPORT'}</td>
                  <td className="p-3 font-mono text-amber-400">{b.bookingNumber}</td>
                  <td className="p-3 text-[11px]">
                    {b.hotels[0]?.hotelName || 'Fairmont Clock Tower'} ({b.hotels[0]?.roomType || 'Quad'})
                  </td>
                  <td className="p-3 text-[11px]">
                    {b.hotels[1]?.hotelName || 'Pullman Zamzam'} ({b.hotels[1]?.roomType || 'Quad'})
                  </td>
                  <td className="p-3 font-semibold text-zinc-200">
                    {b.transport.transportType}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
