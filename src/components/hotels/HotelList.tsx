import React, { useState, useRef } from 'react';
import {
  Building,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Star,
  Phone,
  User,
  Search,
  Calendar,
  DollarSign,
  Utensils,
  BedDouble,
  ShieldCheck,
  ImageIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  Upload,
  X,
  AlertCircle,
  Camera,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Hotel, DEFAULT_FALLBACK_IMAGE } from '../../types';
import { Modal } from '../common/Modal';
import { GoldBadge } from '../common/GoldBadge';
import { processAndCompressImage } from '../../lib/imageUtils';

export const HotelList: React.FC = () => {
  const { hotels, addHotel, updateHotel, deleteHotel } = useData();
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // File refs for image upload
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Quick Rate Edit Modal State
  const [quickRateHotel, setQuickRateHotel] = useState<Hotel | null>(null);
  const [quickRatePerNight, setQuickRatePerNight] = useState<number>(0);
  const [quickNights, setQuickNights] = useState<number>(7);

  // Process uploaded image file into base64 DataURL
  const processImageFile = (file: File, onSuccess: (dataUrl: string) => void) => {
    setErrorMessage(null);
    processAndCompressImage(
      file,
      onSuccess,
      (errorMsg) => setErrorMessage(errorMsg)
    );
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, (dataUrl) => {
        setFormData((prev) => ({ ...prev, imageUrl: dataUrl }));
      });
    }
    e.target.value = '';
  };

  const handleGalleryPhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    files.forEach((file) => {
      processImageFile(file, (dataUrl) => {
        setFormData((prev) => {
          const currentList = prev.imagesText
            .split('\n')
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
          return {
            ...prev,
            imagesText: [...currentList, dataUrl].join('\n'),
          };
        });
      });
    });
    e.target.value = '';
  };

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    city: 'Makkah' as Hotel['city'],
    address: '',
    starRating: 5 as Hotel['starRating'],
    roomType: 'Deluxe Haram View Suite',
    roomSharing: 'Quad' as Hotel['roomSharing'],
    checkIn: '2026-09-01',
    checkOut: '2026-09-08',
    nights: 7,
    ratePerNight: 85000,
    totalHotelRate: 595000,
    currency: 'PKR' as Hotel['currency'],
    mealPlan: 'Breakfast Included',
    distanceFromHaram: '50m from Haram Courtyard',
    distanceFromHaramMeters: 50,
    distanceFromLadiesGateMeters: 100,
    contactPerson: 'Saleh Al-Otaibi',
    contactPhone: '+966 12 500 0000',
    baseSingleRate: 180000,
    baseDoubleRate: 130000,
    baseTripleRate: 105000,
    baseQuadRate: 85000,
    imageUrl: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?w=800&auto=format&fit=crop&q=80',
    imagesText: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80\nhttps://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
  });

  // Calculate nights and total hotel rate dynamically in form
  const handleRateNightsChange = (field: 'ratePerNight' | 'nights' | 'checkIn' | 'checkOut', val: any) => {
    let newRate = field === 'ratePerNight' ? parseFloat(val) || 0 : formData.ratePerNight;
    let newNights = field === 'nights' ? parseInt(val) || 1 : formData.nights;
    let newCheckIn = field === 'checkIn' ? val : formData.checkIn;
    let newCheckOut = field === 'checkOut' ? val : formData.checkOut;

    if (field === 'checkIn' || field === 'checkOut') {
      const d1 = new Date(newCheckIn);
      const d2 = new Date(newCheckOut);
      if (!isNaN(d1.getTime()) && !isNaN(d2.getTime()) && d2 > d1) {
        newNights = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
      }
    } else if (field === 'nights' && newCheckIn) {
      const d1 = new Date(newCheckIn);
      if (!isNaN(d1.getTime())) {
        const d2 = new Date(d1);
        d2.setDate(d2.getDate() + newNights);
        newCheckOut = d2.toISOString().split('T')[0];
      }
    }

    const calculatedTotal = newRate * newNights;

    setFormData({
      ...formData,
      ratePerNight: newRate,
      nights: newNights,
      checkIn: newCheckIn,
      checkOut: newCheckOut,
      totalHotelRate: calculatedTotal,
    });
  };

  const handleOpenAdd = () => {
    setEditingHotel(null);
    setFormData({
      name: '',
      city: 'Makkah',
      address: 'King Abdul Aziz Road, Abraj Al Bait, Makkah Mukarramah',
      starRating: 5,
      roomType: 'Deluxe Haram View Suite',
      roomSharing: 'Quad',
      checkIn: '2026-09-01',
      checkOut: '2026-09-08',
      nights: 7,
      ratePerNight: 85000,
      totalHotelRate: 595000,
      currency: 'PKR',
      mealPlan: 'Breakfast Included',
      distanceFromHaram: '0m Direct Courtyard Access',
      distanceFromHaramMeters: 0,
      distanceFromLadiesGateMeters: 0,
      contactPerson: 'Saleh Al-Otaibi',
      contactPhone: '+966 12 500 0000',
      baseSingleRate: 180000,
      baseDoubleRate: 130000,
      baseTripleRate: 105000,
      baseQuadRate: 85000,
      imageUrl: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?w=800&auto=format&fit=crop&q=80',
      imagesText: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80\nhttps://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (h: Hotel) => {
    setEditingHotel(h);
    const nights = h.nights || 7;
    const ratePerNight = h.ratePerNight || h.baseQuadRate || 85000;
    const totalRate = h.totalHotelRate || ratePerNight * nights;

    setFormData({
      name: h.name,
      city: h.city,
      address: h.address || (h.city === 'Makkah' ? 'King Abdul Aziz Road, Makkah' : 'Northern Central Area, Madina'),
      starRating: h.starRating,
      roomType: h.roomType || 'Standard Deluxe Room',
      roomSharing: h.roomSharing || 'Quad',
      checkIn: h.checkIn || '2026-09-01',
      checkOut: h.checkOut || '2026-09-08',
      nights: nights,
      ratePerNight: ratePerNight,
      totalHotelRate: totalRate,
      currency: h.currency || 'PKR',
      mealPlan: h.mealPlan || 'Breakfast Included',
      distanceFromHaram: h.distanceFromHaram || (h.distanceFromHaramMeters === 0 ? '0m Direct Courtyard' : `${h.distanceFromHaramMeters}m to Haram`),
      distanceFromHaramMeters: h.distanceFromHaramMeters || 50,
      distanceFromLadiesGateMeters: h.distanceFromLadiesGateMeters || 0,
      contactPerson: h.contactPerson || 'Hotel Manager',
      contactPhone: h.contactPhone || '+966 12 000 0000',
      baseSingleRate: h.baseSingleRate || ratePerNight * 2,
      baseDoubleRate: h.baseDoubleRate || ratePerNight * 1.5,
      baseTripleRate: h.baseTripleRate || ratePerNight * 1.2,
      baseQuadRate: h.baseQuadRate || ratePerNight,
      imageUrl: h.imageUrl,
      imagesText: (h.images || []).join('\n'),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedImages = formData.imagesText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload: Partial<Hotel> = {
      name: formData.name,
      city: formData.city,
      address: formData.address,
      starRating: formData.starRating,
      roomType: formData.roomType,
      roomSharing: formData.roomSharing,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      nights: formData.nights,
      ratePerNight: formData.ratePerNight,
      totalHotelRate: formData.totalHotelRate,
      currency: formData.currency,
      mealPlan: formData.mealPlan,
      distanceFromHaram: formData.distanceFromHaram,
      distanceFromHaramMeters: formData.distanceFromHaramMeters,
      distanceFromLadiesGateMeters: formData.distanceFromLadiesGateMeters,
      contactPerson: formData.contactPerson,
      contactPhone: formData.contactPhone,
      baseSingleRate: formData.baseSingleRate,
      baseDoubleRate: formData.baseDoubleRate,
      baseTripleRate: formData.baseTripleRate,
      baseQuadRate: formData.baseQuadRate,
      imageUrl: formData.imageUrl,
      images: parsedImages.length > 0 ? parsedImages : [formData.imageUrl],
    };

    if (editingHotel) {
      updateHotel({ ...editingHotel, ...payload });
    } else {
      addHotel(payload as Omit<Hotel, 'id'>);
    }
    setIsModalOpen(false);
  };

  const handleOpenQuickRate = (h: Hotel) => {
    setQuickRateHotel(h);
    setQuickRatePerNight(h.ratePerNight || h.baseQuadRate || 85000);
    setQuickNights(h.nights || 7);
  };

  const handleSaveQuickRate = () => {
    if (quickRateHotel) {
      const calculatedTotal = quickRatePerNight * quickNights;
      updateHotel({
        ...quickRateHotel,
        ratePerNight: quickRatePerNight,
        nights: quickNights,
        baseQuadRate: quickRatePerNight,
        totalHotelRate: calculatedTotal,
      });
      setQuickRateHotel(null);
    }
  };

  const filteredHotels = hotels.filter((h) => {
    const matchSearch =
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.address && h.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (h.contactPerson && h.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCity = cityFilter === 'all' || h.city === cityFilter;
    return matchSearch && matchCity;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Building className="w-3.5 h-3.5 text-amber-400" /> Hotel Accommodations Directory & Contract Rates
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-tight">
            Saudi Hotel & Haram Proximity Directory
          </h1>
          <p className="text-xs text-zinc-400 max-w-2xl">
            Contracted 5-Star & 4-Star hotels in Makkah Mukarramah and Madina Munawwarah. Manage room types, sharing rates, check-in dates, meal plans, and total stay rates.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-zinc-950" />
            <span>Add New Saudi Hotel</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/90 p-4 rounded-2xl border border-amber-500/20 shadow-xl">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/80" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search hotel name, address, or manager..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar w-full sm:w-auto">
          {['all', 'Makkah', 'Madina', 'Jeddah'].map((c) => (
            <button
              key={c}
              onClick={() => setCityFilter(c)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                cityFilter === c
                  ? 'bg-amber-500 text-zinc-950 font-extrabold shadow-md'
                  : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700'
              }`}
            >
              {c === 'all' ? 'All Holy Cities' : `${c} Hotels`}
            </button>
          ))}
        </div>
      </div>

      {/* Hotel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHotels.map((h) => {
          const nights = h.nights || 7;
          const ratePerNight = h.ratePerNight || h.baseQuadRate || 85000;
          const totalHotelRate = h.totalHotelRate || ratePerNight * nights;
          const currency = h.currency || 'PKR';

          return (
            <div
              key={h.id}
              className="rounded-2xl bg-zinc-900 border border-amber-500/20 hover:border-amber-500/50 overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Image Header with City Badge & Star Rating */}
                <div className="relative h-48 bg-zinc-950 overflow-hidden">
                  <img
                    src={h.imageUrl || DEFAULT_FALLBACK_IMAGE}
                    alt={h.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <GoldBadge variant={h.city === 'Makkah' ? 'gold' : 'emerald'}>
                      {h.city}
                    </GoldBadge>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-950/80 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                      {h.mealPlan || 'Breakfast Included'}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-300 text-xs font-bold bg-zinc-950/90 px-2.5 py-1 rounded-lg border border-amber-500/30">
                      {Array.from({ length: h.starRating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="ml-1">{h.starRating} Star</span>
                    </div>

                    <button
                      onClick={() => handleOpenQuickRate(h)}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[10px] font-extrabold rounded-lg shadow-md cursor-pointer flex items-center gap-1"
                      title="Update Hotel Rates"
                    >
                      <DollarSign className="w-3 h-3" /> Update Rates
                    </button>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-4 text-xs">
                  <div>
                    <h3 className="text-base font-bold text-white font-serif tracking-wide">{h.name}</h3>
                    <p className="text-[11px] text-zinc-400 font-medium line-clamp-1 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                      {h.address || `${h.city} Mukarramah, Kingdom of Saudi Arabia`}
                    </p>
                  </div>

                  {/* Proximity & Room Sharing */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-0.5">
                      <span className="text-zinc-500 font-bold uppercase text-[9px] block">Proximity to Haram</span>
                      <span className="text-amber-300 font-bold block truncate">
                        {h.distanceFromHaram || `${h.distanceFromHaramMeters || 50}m to Courtyard`}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-0.5">
                      <span className="text-zinc-500 font-bold uppercase text-[9px] block">Room Type / Sharing</span>
                      <span className="text-white font-bold block truncate">
                        {h.roomType || 'Standard'} ({h.roomSharing || 'Quad'})
                      </span>
                    </div>
                  </div>

                  {/* Complete Rate & Calculation Box */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-950 to-amber-950/20 border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400 font-medium">Rate Per Night:</span>
                      <span className="font-mono font-bold text-amber-300">
                        {currency} {ratePerNight.toLocaleString()} / night
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400 font-medium">Stay Duration ({nights} Nights):</span>
                      <span className="font-mono text-zinc-300 font-bold">
                        {nights} Nights ({h.checkIn || '2026-09-01'} to {h.checkOut || '2026-09-08'})
                      </span>
                    </div>

                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase text-amber-400">Total Hotel Rate:</span>
                      <span className="text-sm font-extrabold font-mono text-emerald-400">
                        {currency} {totalHotelRate.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Quad / Triple / Double Rate Breakdown */}
                  <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center font-mono">
                    <div className="p-1.5 bg-zinc-950 rounded-lg border border-zinc-800">
                      <div className="text-zinc-500">Quad</div>
                      <div className="font-bold text-amber-300">{currency} {(h.baseQuadRate || ratePerNight).toLocaleString()}</div>
                    </div>
                    <div className="p-1.5 bg-zinc-950 rounded-lg border border-zinc-800">
                      <div className="text-zinc-500">Triple</div>
                      <div className="font-bold text-amber-300">{currency} {(h.baseTripleRate || Math.round(ratePerNight * 1.2)).toLocaleString()}</div>
                    </div>
                    <div className="p-1.5 bg-zinc-950 rounded-lg border border-zinc-800">
                      <div className="text-zinc-500">Double</div>
                      <div className="font-bold text-amber-300">{currency} {(h.baseDoubleRate || Math.round(ratePerNight * 1.5)).toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Manager Contacts */}
                  <div className="text-[11px] text-zinc-400 space-y-1 pt-1 border-t border-zinc-800">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1"><User className="w-3 h-3 text-amber-400" /> Manager:</span>
                      <span className="text-white font-bold">{h.contactPerson || 'Saleh Al-Otaibi'}</span>
                    </div>
                    <div className="flex items-center justify-between font-mono">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-emerald-400" /> Phone:</span>
                      <span className="text-emerald-400 font-bold">{h.contactPhone || '+966 12 500 0000'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between gap-2">
                <span className="text-[10px] text-zinc-500 font-mono">ID: {h.id}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(h)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete ${h.name}?`)) {
                        deleteHotel(h.id);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Rate Update Modal */}
      {quickRateHotel && (
        <Modal
          isOpen={!!quickRateHotel}
          onClose={() => setQuickRateHotel(null)}
          title={`Update Hotel Rates — ${quickRateHotel.name}`}
          subtitle="Adjust room rate per night and stay duration to recalculate total rate."
        >
          <div className="space-y-4 text-xs text-zinc-300">
            <div className="p-4 rounded-xl bg-zinc-900 border border-amber-500/30 space-y-2">
              <div className="font-bold text-white text-sm">{quickRateHotel.name}</div>
              <div className="text-zinc-400">{quickRateHotel.city} • Star Rating: {quickRateHotel.starRating}★</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Rate Per Night (PKR)</label>
                <input
                  type="number"
                  value={quickRatePerNight}
                  onChange={(e) => setQuickRatePerNight(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Number of Nights</label>
                <input
                  type="number"
                  value={quickNights}
                  onChange={(e) => setQuickNights(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-amber-500/40 flex justify-between items-center">
              <span className="font-bold text-amber-400 uppercase text-xs">Calculated Total Hotel Cost:</span>
              <span className="font-mono font-extrabold text-emerald-400 text-lg">
                PKR {(quickRatePerNight * quickNights).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setQuickRateHotel(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuickRate}
                className="px-5 py-2 rounded-xl bg-amber-500 text-zinc-950 font-extrabold hover:bg-amber-400"
              >
                Save Updated Rates
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Complete Add / Edit Hotel Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHotel ? `Edit Hotel — ${editingHotel.name}` : 'Add New Saudi Hotel'}
        subtitle="Manage complete hotel specifications, room sharing rates, meal plans, and Haram distance."
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-zinc-300 mb-1">Hotel Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Fairmont Makkah Clock Royal Tower"
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-300 mb-1">Holy City</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value as Hotel['city'] })}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-bold"
              >
                <option value="Makkah">Makkah Mukarramah</option>
                <option value="Madina">Madina Munawwarah</option>
                <option value="Jeddah">Jeddah</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-300 mb-1">Star Rating</label>
              <select
                value={formData.starRating}
                onChange={(e) => setFormData({ ...formData, starRating: parseInt(e.target.value) as any })}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-bold"
              >
                <option value={5}>5-Star Luxury</option>
                <option value={4}>4-Star Premium</option>
                <option value={3}>3-Star Standard</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-zinc-300 mb-1">Hotel Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. King Abdul Aziz Road, Abraj Al Bait Complex, Makkah"
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-300 mb-1">Room Type</label>
              <input
                type="text"
                value={formData.roomType}
                onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                placeholder="e.g. Executive Haram View Suite"
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-300 mb-1">Room Sharing</label>
              <select
                value={formData.roomSharing}
                onChange={(e) => setFormData({ ...formData, roomSharing: e.target.value as any })}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-bold"
              >
                <option value="Quad">Quad Sharing (4 Bed)</option>
                <option value="Triple">Triple Sharing (3 Bed)</option>
                <option value="Double">Double Sharing (2 Bed)</option>
                <option value="Single">Single Executive Room</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-300 mb-1">Meal Plan</label>
              <select
                value={formData.mealPlan}
                onChange={(e) => setFormData({ ...formData, mealPlan: e.target.value })}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-bold"
              >
                <option value="Breakfast Included">Breakfast Included</option>
                <option value="Half Board">Half Board (Breakfast & Dinner)</option>
                <option value="Full Board">Full Board (Breakfast, Lunch, Dinner)</option>
                <option value="Suhoor & Iftar">Suhoor & Iftar (Ramadan Special)</option>
                <option value="Room Only">Room Only (No Meals)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-300 mb-1">Distance from Haram</label>
              <input
                type="text"
                value={formData.distanceFromHaram}
                onChange={(e) => setFormData({ ...formData, distanceFromHaram: e.target.value })}
                placeholder="e.g. 0m Direct Courtyard Access"
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
              />
            </div>

            {/* Check-in, Check-out, Nights, Rate Per Night */}
            <div>
              <label className="block font-bold text-zinc-300 mb-1">Check-in Date</label>
              <input
                type="date"
                value={formData.checkIn}
                onChange={(e) => handleRateNightsChange('checkIn', e.target.value)}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-300 mb-1">Check-out Date</label>
              <input
                type="date"
                value={formData.checkOut}
                onChange={(e) => handleRateNightsChange('checkOut', e.target.value)}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-300 mb-1">Number of Nights</label>
              <input
                type="number"
                min={1}
                value={formData.nights}
                onChange={(e) => handleRateNightsChange('nights', e.target.value)}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-300 mb-1">Rate Per Night (PKR)</label>
              <input
                type="number"
                value={formData.ratePerNight}
                onChange={(e) => handleRateNightsChange('ratePerNight', e.target.value)}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-mono font-bold"
              />
            </div>

            {/* Total Hotel Rate Calculation Box */}
            <div className="sm:col-span-2 p-4 rounded-xl bg-zinc-950 border border-amber-500/40 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase block">Automatic Rate Calculation</span>
                <span className="text-amber-300 font-bold text-xs font-mono">
                  {formData.nights} Nights × PKR {formData.ratePerNight.toLocaleString()} / night
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-amber-400 font-extrabold uppercase block">Total Hotel Cost</span>
                <span className="text-emerald-400 font-extrabold font-mono text-base">
                  PKR {formData.totalHotelRate.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Room Sharing Specific Rates */}
            <div>
              <label className="block font-bold text-zinc-300 mb-1">Quad Base Rate (PKR)</label>
              <input
                type="number"
                value={formData.baseQuadRate}
                onChange={(e) => setFormData({ ...formData, baseQuadRate: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-300 mb-1">Double Base Rate (PKR)</label>
              <input
                type="number"
                value={formData.baseDoubleRate}
                onChange={(e) => setFormData({ ...formData, baseDoubleRate: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-mono"
              />
            </div>

            {/* Contact Details */}
            <div>
              <label className="block font-bold text-zinc-300 mb-1">Hotel Manager Name</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-300 mb-1">Manager Phone Number</label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-mono"
              />
            </div>

            {/* Hidden file inputs */}
            <input
              type="file"
              ref={coverInputRef}
              onChange={handleCoverUpload}
              accept="image/jpeg,image/png,image/jpg,image/webp"
              className="hidden"
            />
            <input
              type="file"
              ref={galleryInputRef}
              onChange={handleGalleryPhotosUpload}
              accept="image/jpeg,image/png,image/jpg,image/webp"
              multiple
              className="hidden"
            />

            {errorMessage && (
              <div className="sm:col-span-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Main Cover Photo Upload & Preview */}
            <div className="sm:col-span-2 space-y-2">
              <label className="block font-bold text-zinc-300 text-xs flex items-center justify-between">
                <span>Hotel Main Cover Photo</span>
                <span className="text-[10px] text-amber-400 font-normal">Max file size: 5MB (JPG, PNG, WebP)</span>
              </label>

              {formData.imageUrl ? (
                <div className="relative group rounded-xl overflow-hidden h-40 bg-zinc-950 border border-zinc-800">
                  <img
                    src={formData.imageUrl}
                    alt="Hotel Cover Preview"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="px-3 py-1.5 bg-amber-500 text-zinc-950 font-extrabold text-xs rounded-lg flex items-center gap-1.5 shadow"
                    >
                      <Camera className="w-3.5 h-3.5" /> Replace Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      className="px-3 py-1.5 bg-rose-600 text-white font-extrabold text-xs rounded-lg flex items-center gap-1.5 shadow"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => coverInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-700 hover:border-amber-500/60 rounded-xl p-6 text-center cursor-pointer bg-zinc-950/60 hover:bg-zinc-900 transition-colors flex flex-col items-center justify-center gap-2"
                >
                  <Upload className="w-6 h-6 text-amber-400" />
                  <span className="text-xs font-bold text-zinc-300">Click to upload hotel cover image</span>
                  <span className="text-[10px] text-zinc-500">Supports PNG, JPG, JPEG, WebP</span>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-amber-500/30"
                >
                  <Upload className="w-3.5 h-3.5" /> Browse Image File
                </button>
                <input
                  type="text"
                  placeholder="Or paste image URL here..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* Additional Gallery Photos */}
            <div className="sm:col-span-2 space-y-2">
              <label className="block font-bold text-zinc-300 text-xs flex items-center justify-between">
                <span>Additional Gallery Photos</span>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" /> + Upload Gallery Photos
                </button>
              </label>

              {/* Gallery Thumbnails List */}
              {formData.imagesText.trim().length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {formData.imagesText
                    .split('\n')
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0)
                    .map((imgUrl, idx) => (
                      <div key={idx} className="relative group h-20 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800">
                        <img
                          src={imgUrl}
                          alt={`Gallery ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                          }}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const list = formData.imagesText
                              .split('\n')
                              .map((s) => s.trim())
                              .filter((s) => s.length > 0);
                            list.splice(idx, 1);
                            setFormData({ ...formData, imagesText: list.join('\n') });
                          }}
                          className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md shadow"
                          title="Delete photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                </div>
              )}

              <textarea
                rows={2}
                placeholder="Paste image URLs (one per line)..."
                value={formData.imagesText}
                onChange={(e) => setFormData({ ...formData, imagesText: e.target.value })}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-xs font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 font-black text-xs hover:from-amber-400 hover:to-amber-300 shadow-lg shadow-amber-500/20"
            >
              Save Hotel Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
