import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Building,
  Plane,
  FileCheck2,
  Car,
  Calculator,
  Calendar,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Booking, HotelBookingItem } from '../../types';
import { Modal } from '../common/Modal';

interface BookingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBooking?: Booking | null;
}

export const BookingFormModal: React.FC<BookingFormModalProps> = ({
  isOpen,
  onClose,
  editingBooking,
}) => {
  const { customers, packages, hotels, addBooking, updateBooking } = useData();

  // Form State
  const [customerId, setCustomerId] = useState(editingBooking?.customerId || (customers[0]?.id || ''));
  const [packageId, setPackageId] = useState(editingBooking?.packageId || (packages[0]?.id || ''));
  const [paxAdults, setPaxAdults] = useState(editingBooking?.paxAdults || 2);
  const [paxChildren, setPaxChildren] = useState(editingBooking?.paxChildren || 0);
  const [paxInfants, setPaxInfants] = useState(editingBooking?.paxInfants || 0);
  const [departureDate, setDepartureDate] = useState(editingBooking?.departureDate || '2026-09-01');
  const [returnDate, setReturnDate] = useState(editingBooking?.returnDate || '2026-09-15');
  const [bookingStatus, setBookingStatus] = useState<Booking['bookingStatus']>(
    editingBooking?.bookingStatus || 'Confirmed'
  );

  // Multi-Hotel items array
  const [hotelItems, setHotelItems] = useState<HotelBookingItem[]>(
    editingBooking?.hotels || [
      {
        id: 'hb-1',
        city: 'Makkah',
        hotelName: 'Fairmont Makkah Clock Royal Tower',
        roomType: 'Quad',
        nights: 7,
        ratePerNight: 85000,
        checkIn: '2026-09-01',
        checkOut: '2026-09-08',
        totalRate: 595000,
        distanceFromHaram: '0m',
      },
      {
        id: 'hb-2',
        city: 'Madina',
        hotelName: 'Pullman Zamzam Madina',
        roomType: 'Quad',
        nights: 7,
        ratePerNight: 75000,
        checkIn: '2026-09-08',
        checkOut: '2026-09-15',
        totalRate: 525000,
        distanceFromHaram: '80m',
      },
    ]
  );

  // Flight Details
  const [flight, setFlight] = useState(
    editingBooking?.flight || {
      airline: 'Saudi Arabian Airlines (SV)',
      flightNumber: 'SV-738',
      pnr: 'KMZSV92',
      departureAirport: 'LHE',
      arrivalAirport: 'JED',
      departureDatetime: '2026-09-01 04:30',
      returnDatetime: '2026-09-15 18:15',
      ticketPrice: 240000,
      status: 'Confirmed' as const,
    }
  );

  // Visa Details
  const [visa, setVisa] = useState(
    editingBooking?.visa || {
      visaType: 'Umrah Visa' as const,
      visaNumber: 'VISA-SA-991000',
      nusukId: 'NUSUK-881920',
      status: 'Approved' as const,
      applicationDate: '2026-08-01',
      issueDate: '2026-08-05',
      expiryDate: '2026-11-05',
      fee: 45000,
    }
  );

  // Transport
  const [transport, setTransport] = useState(
    editingBooking?.transport || {
      transportType: 'Private GMC' as const,
      route: 'Jeddah Apt -> Makkah Hotel -> Madina Hotel -> Madina Apt',
      vehicleNumber: 'GMC-SA-4412',
      driverName: 'Abdelrahman Al-Sayed',
      driverContact: '+966 50 112 2334',
    }
  );

  // Initial Payment Amount
  const [paidAmountInput, setPaidAmountInput] = useState(editingBooking?.paidAmount || 500000);
  const [specialRequests, setSpecialRequests] = useState(editingBooking?.specialRequests || '');

  // Add Hotel Item
  const handleAddHotelItem = () => {
    const lastItem = hotelItems[hotelItems.length - 1];
    const newCity = lastItem?.city === 'Makkah' ? 'Madina' : lastItem?.city === 'Madina' ? 'Jeddah' : 'Makkah';
    const checkInDate = lastItem?.checkOut || departureDate || '2026-09-01';
    const dIn = new Date(checkInDate);
    const dOut = new Date(dIn);
    dOut.setDate(dOut.getDate() + 7);
    const checkOutDate = dOut.toISOString().split('T')[0];

    const newItem: HotelBookingItem = {
      id: `hb-${Date.now()}`,
      city: newCity,
      hotelName: newCity === 'Madina' ? 'Pullman Zamzam Madina' : newCity === 'Jeddah' ? 'Jeddah Trident Hotel' : 'Swissôtel Makkah',
      roomType: 'Double',
      nights: 7,
      ratePerNight: 85000,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalRate: 595000,
      totalHotelCost: 595000,
    };
    setHotelItems([...hotelItems, newItem]);
  };

  const handleUpdateHotelItem = (index: number, field: keyof HotelBookingItem, value: any) => {
    const updated = [...hotelItems];
    const item = { ...updated[index], [field]: value };

    if (field === 'checkIn' || field === 'checkOut') {
      if (item.checkIn && item.checkOut) {
        const d1 = new Date(item.checkIn);
        const d2 = new Date(item.checkOut);
        if (!isNaN(d1.getTime()) && !isNaN(d2.getTime()) && d2 > d1) {
          const diffDays = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
          item.nights = Math.max(1, diffDays);
        }
      }
    } else if (field === 'nights' && item.checkIn) {
      const d1 = new Date(item.checkIn);
      if (!isNaN(d1.getTime())) {
        const d2 = new Date(d1);
        d2.setDate(d2.getDate() + (parseInt(value) || 1));
        item.checkOut = d2.toISOString().split('T')[0];
      }
    }

    item.totalRate = (item.nights || 0) * (item.ratePerNight || 0);
    item.totalHotelCost = item.totalRate;

    updated[index] = item;
    setHotelItems(updated);
  };

  const handleRemoveHotelItem = (index: number) => {
    setHotelItems(hotelItems.filter((_, i) => i !== index));
  };

  // Calculations
  const totalHotelsCost = hotelItems.reduce((sum, h) => sum + (h.totalRate || h.totalHotelCost || (h.nights * h.ratePerNight) || 0), 0);
  const totalVisaCost = visa.fee * (paxAdults + paxChildren);
  const totalFlightCost = flight.ticketPrice * paxAdults;
  const calculatedGrandTotal = totalHotelsCost + totalVisaCost + totalFlightCost + 50000; // includes transport/services
  const balanceAmount = Math.max(0, calculatedGrandTotal - paidAmountInput);
  const paymentStatus =
    balanceAmount === 0 ? 'Paid' : paidAmountInput > 0 ? 'Partial' : 'Unpaid';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customerObj = customers.find((c) => c.id === customerId);
    const packageObj = packages.find((p) => p.id === packageId);

    const bookingData = {
      customerId,
      customerName: customerObj?.fullName || 'Pilgrim',
      customerPhone: customerObj?.phone || '',
      packageId,
      packageName: packageObj?.title || 'Custom Umrah Package',
      packageType: packageObj?.type || 'Umrah',
      paxAdults,
      paxChildren,
      paxInfants,
      departureDate,
      returnDate,
      hotels: hotelItems,
      flight,
      visa,
      transport,
      totalAmount: calculatedGrandTotal,
      paidAmount: paidAmountInput,
      balanceAmount,
      paymentStatus: paymentStatus as any,
      bookingStatus,
      specialRequests,
    };

    if (editingBooking) {
      updateBooking({
        ...editingBooking,
        ...bookingData,
      });
    } else {
      addBooking(bookingData);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingBooking ? `Edit Booking ${editingBooking.bookingNumber}` : 'New Umrah / Hajj Booking Wizard'}
      subtitle="Configure multi-hotel breakdown, flight details, Nusuk visa status, and payments."
      maxWidth="6xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Customer & Package Selection */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-amber-500/20 space-y-4">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> 1. Customer & Package Selection
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Select Pilgrim *
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.passportNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Select Base Package
              </label>
              <select
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
              >
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Package Image Preview Badge */}
            {(() => {
              const selectedPkg = packages.find((p) => p.id === packageId);
              if (!selectedPkg) return null;
              const coverImg = selectedPkg.coverImage || selectedPkg.images[0];
              return (
                <div className="col-span-1 sm:col-span-2 md:col-span-4 p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {coverImg && (
                      <img
                        src={coverImg}
                        alt={selectedPkg.title}
                        className="w-14 h-14 rounded-lg object-cover ring-1 ring-amber-500/30 shrink-0"
                      />
                    )}
                    <div>
                      <div className="text-xs font-bold text-amber-300">{selectedPkg.title}</div>
                      <div className="text-[10px] text-zinc-400">
                        {selectedPkg.durationDays} Days • Makkah: {selectedPkg.makkahHotel} | Madina: {selectedPkg.madinaHotel}
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-2">
                    {selectedPkg.makkahImage && (
                      <img
                        src={selectedPkg.makkahImage}
                        alt="Makkah"
                        className="w-10 h-10 rounded-lg object-cover ring-1 ring-amber-500/20"
                        title="Makkah Hotel Photo"
                      />
                    )}
                    {selectedPkg.madinaImage && (
                      <img
                        src={selectedPkg.madinaImage}
                        alt="Madina"
                        className="w-10 h-10 rounded-lg object-cover ring-1 ring-emerald-500/20"
                        title="Madina Hotel Photo"
                      />
                    )}
                  </div>
                </div>
              );
            })()}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Pilgrim Pax Count (Adults / Children / Infants)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={paxAdults}
                  onChange={(e) => setPaxAdults(parseInt(e.target.value) || 1)}
                  className="w-1/3 px-2 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-center text-zinc-100"
                  title="Adults"
                />
                <input
                  type="number"
                  min="0"
                  value={paxChildren}
                  onChange={(e) => setPaxChildren(parseInt(e.target.value) || 0)}
                  className="w-1/3 px-2 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-center text-zinc-100"
                  title="Children"
                />
                <input
                  type="number"
                  min="0"
                  value={paxInfants}
                  onChange={(e) => setPaxInfants(parseInt(e.target.value) || 0)}
                  className="w-1/3 px-2 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-center text-zinc-100"
                  title="Infants"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Travel Dates (Departure - Return)
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-1/2 px-2 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-zinc-100"
                />
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-1/2 px-2 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-zinc-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: MULTIPLE HOTELS PER BOOKING (Makkah, Madina, Jeddah) */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-amber-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
              <Building className="w-4 h-4" /> 2. Multiple Hotel Accommodations (Hotel Name, City, Room Type, Check-in, Check-out, Nights, Rate Per Night, Total Cost)
            </h4>
            <button
              type="button"
              onClick={handleAddHotelItem}
              className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Hotel Accommodation
            </button>
          </div>

          <div className="space-y-4">
            {hotelItems.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400">Hotel Accommodation #{idx + 1}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-mono">
                      {item.city}
                    </span>
                  </div>
                  {hotelItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveHotelItem(idx)}
                      className="p-1 px-2.5 rounded-lg bg-zinc-900 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* 1. Hotel Name */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                      Hotel Name
                    </label>
                    <input
                      type="text"
                      list={`hotel-options-${idx}`}
                      value={item.hotelName}
                      onChange={(e) => handleUpdateHotelItem(idx, 'hotelName', e.target.value)}
                      placeholder="e.g. Swissôtel Makkah"
                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                    />
                    <datalist id={`hotel-options-${idx}`}>
                      {hotels
                        .filter((h) => h.city === item.city)
                        .map((h) => (
                          <option key={h.id} value={h.name} />
                        ))}
                    </datalist>
                  </div>

                  {/* 2. City */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                      City
                    </label>
                    <select
                      value={item.city}
                      onChange={(e) => handleUpdateHotelItem(idx, 'city', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                    >
                      <option value="Makkah">Makkah</option>
                      <option value="Madina">Madina</option>
                      <option value="Jeddah">Jeddah</option>
                    </select>
                  </div>

                  {/* 3. Room Type */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                      Room Type
                    </label>
                    <select
                      value={item.roomType}
                      onChange={(e) => handleUpdateHotelItem(idx, 'roomType', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                    >
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Triple">Triple</option>
                      <option value="Quad">Quad</option>
                      <option value="Sharing">Sharing</option>
                      <option value="Suite">Suite</option>
                      <option value="VIP Clock Tower Suite">VIP Clock Tower Suite</option>
                    </select>
                  </div>

                  {/* 4. Check-in */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      value={item.checkIn || ''}
                      onChange={(e) => handleUpdateHotelItem(idx, 'checkIn', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* 5. Check-out */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      value={item.checkOut || ''}
                      onChange={(e) => handleUpdateHotelItem(idx, 'checkOut', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* 6. Nights */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                      Nights
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.nights || 1}
                      onChange={(e) => handleUpdateHotelItem(idx, 'nights', parseInt(e.target.value) || 1)}
                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-100 text-center font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* 7. Rate Per Night */}
                  <div>
                    <label className="block text-[10px] font-bold text-amber-400 uppercase mb-1">
                      Rate Per Night (PKR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={item.ratePerNight || 0}
                      onChange={(e) => handleUpdateHotelItem(idx, 'ratePerNight', parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-amber-500/50 rounded-lg text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* 8. Total Hotel Cost */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                      Total Hotel Cost
                    </label>
                    <div className="px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs font-extrabold text-amber-300 flex items-center justify-between">
                      <span className="text-[10px] text-zinc-400 font-mono">PKR</span>
                      <span>{((item.nights || 0) * (item.ratePerNight || 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Flight & Visa Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Flight */}
          <div className="p-4 rounded-xl bg-zinc-900 border border-amber-500/20 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
              <Plane className="w-4 h-4" /> Flight Booking
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase">Airline & Flight #</label>
                <input
                  type="text"
                  value={flight.airline}
                  onChange={(e) => setFlight({ ...flight, airline: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase">PNR Code</label>
                <input
                  type="text"
                  value={flight.pnr}
                  onChange={(e) => setFlight({ ...flight, pnr: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono text-amber-300"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase">Departure / Arrival</label>
                <input
                  type="text"
                  value={`${flight.departureAirport} -> ${flight.arrivalAirport}`}
                  onChange={(e) => setFlight({ ...flight, departureAirport: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase">Ticket Price / Pax</label>
                <input
                  type="number"
                  value={flight.ticketPrice}
                  onChange={(e) =>
                    setFlight({ ...flight, ticketPrice: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-100"
                />
              </div>
            </div>
          </div>

          {/* Visa */}
          <div className="p-4 rounded-xl bg-zinc-900 border border-amber-500/20 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4" /> Saudi MOFA Visa Details
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase">Visa Type</label>
                <select
                  value={visa.visaType}
                  onChange={(e) => setVisa({ ...visa, visaType: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-100"
                >
                  <option value="Umrah Visa">Umrah Visa</option>
                  <option value="Hajj Visa">Hajj Visa</option>
                  <option value="Tourist E-Visa">Tourist E-Visa</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase">Status</label>
                <select
                  value={visa.status}
                  onChange={(e) => setVisa({ ...visa, status: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-100"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Processing">Processing</option>
                  <option value="Approved">Approved</option>
                  <option value="Issued">Issued</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase">Nusuk ID / Ref</label>
                <input
                  type="text"
                  value={visa.nusukId}
                  onChange={(e) => setVisa({ ...visa, nusukId: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase">Visa Fee / Pax</label>
                <input
                  type="number"
                  value={visa.fee}
                  onChange={(e) =>
                    setVisa({ ...visa, fee: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Grand Financial Summary */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-zinc-900 to-amber-500/10 border border-amber-500/40 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
              <Calculator className="w-4 h-4" /> Grand Financial Calculation
            </span>
            <span className="text-xs text-zinc-400">Auto-calculated totals</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
              <span className="text-zinc-400 font-semibold">Total Package Price</span>
              <div className="text-lg font-black text-white mt-1">
                PKR {calculatedGrandTotal.toLocaleString()}
              </div>
            </div>

            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
              <label className="block text-zinc-400 font-semibold mb-1">Advance Paid (PKR)</label>
              <input
                type="number"
                value={paidAmountInput}
                onChange={(e) => setPaidAmountInput(parseInt(e.target.value) || 0)}
                className="w-full px-2.5 py-1 bg-zinc-900 border border-amber-500/30 rounded text-sm font-bold text-emerald-400"
              />
            </div>

            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
              <span className="text-zinc-400 font-semibold">Balance Due</span>
              <div className="text-lg font-black text-rose-400 mt-1">
                PKR {balanceAmount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500"
          >
            {editingBooking ? 'Update Booking' : 'Confirm & Save Booking'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
