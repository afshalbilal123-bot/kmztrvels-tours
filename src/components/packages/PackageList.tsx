import React, { useState, useRef } from 'react';
import {
  PackageCheck,
  Plus,
  Edit2,
  Trash2,
  Check,
  Building,
  Clock,
  Star,
  Image as ImageIcon,
  Upload,
  Eye,
  X,
  MapPin,
  AlertCircle,
  Building2,
  Compass,
  Plane,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Package } from '../../types';
import { Modal } from '../common/Modal';
import { GoldBadge } from '../common/GoldBadge';
import { processAndCompressImage } from '../../lib/imageUtils';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?w=800&auto=format&fit=crop&q=80';

export const PackageList: React.FC = () => {
  const { packages, addPackage, updatePackage, deletePackage } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);

  // Gallery / Package Detail Modal
  const [viewingPackage, setViewingPackage] = useState<Package | null>(null);
  const [activeGalleryTab, setActiveGalleryTab] = useState<'all' | 'makkah' | 'madina' | 'flights' | 'hotels' | 'gallery'>('all');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'Umrah' as Package['type'],
    durationDays: 15,
    makkahNights: 8,
    madinaNights: 7,
    makkahHotel: '',
    makkahAddress: 'Abraj Al Bait Clock Tower, Makkah',
    makkahStarRating: 5,
    makkahRoomType: 'Deluxe Haram View Suite',
    makkahRoomSharing: 'Quad',
    makkahRatePerNight: 85000,
    makkahTotalRate: 680000,
    makkahMealPlan: 'Breakfast Included',
    makkahDistance: '0m Direct Clock Tower Courtyard',
    makkahContact: '+966 12 500 0000',
    madinaHotel: '',
    madinaAddress: 'Northern Central Area, Madina Munawwarah',
    madinaStarRating: 5,
    madinaRoomType: 'Executive City Suite',
    madinaRoomSharing: 'Quad',
    madinaRatePerNight: 75000,
    madinaTotalRate: 525000,
    madinaMealPlan: 'Breakfast Included',
    madinaDistance: '100m to Ladies Gate',
    madinaContact: '+966 14 800 0000',
    currency: 'PKR',
    quadPrice: 350000,
    triplePrice: 400000,
    doublePrice: 480000,
    singlePrice: 650000,
    coverImage: '',
    makkahImage: '',
    madinaImage: '',
    flightImage: '',
    hotelImages: [] as string[],
    galleryImages: [] as string[],
    inclusionsText: '',
    description: '',
    featured: false,
  });

  // URL inputs for manual URL entry option
  const [newHotelImageUrl, setNewHotelImageUrl] = useState('');
  const [newGalleryImageUrl, setNewGalleryImageUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // File Input Refs
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const makkahInputRef = useRef<HTMLInputElement | null>(null);
  const madinaInputRef = useRef<HTMLInputElement | null>(null);
  const flightInputRef = useRef<HTMLInputElement | null>(null);
  const hotelInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // File Upload Helper
  const processImageFile = (file: File, onSuccess: (dataUrl: string) => void) => {
    setErrorMessage(null);
    processAndCompressImage(
      file,
      onSuccess,
      (errorMsg) => setErrorMessage(errorMsg)
    );
  };

  const handleOpenAdd = () => {
    setEditingPackage(null);
    setErrorMessage(null);
    setFormData({
      title: '',
      type: 'Umrah',
      durationDays: 15,
      makkahNights: 8,
      madinaNights: 7,
      makkahHotel: 'Fairmont Makkah Clock Royal Tower (5★)',
      makkahAddress: 'Abraj Al Bait Complex, King Abdul Aziz Road, Makkah Mukarramah',
      makkahStarRating: 5,
      makkahRoomType: 'Deluxe Haram View Suite',
      makkahRoomSharing: 'Quad',
      makkahRatePerNight: 85000,
      makkahTotalRate: 680000,
      makkahMealPlan: 'Breakfast Included',
      makkahDistance: '0m Direct Clock Tower Courtyard Access',
      makkahContact: '+966 12 500 0000',
      madinaHotel: 'Pullman Zamzam Madina (5★)',
      madinaAddress: 'Northern Central Area, Madina Munawwarah',
      madinaStarRating: 5,
      madinaRoomType: 'Executive City View Room',
      madinaRoomSharing: 'Quad',
      madinaRatePerNight: 75000,
      madinaTotalRate: 525000,
      madinaMealPlan: 'Breakfast Included',
      madinaDistance: '100m to Ladies Gate',
      madinaContact: '+966 14 800 0000',
      currency: 'PKR',
      quadPrice: 380000,
      triplePrice: 420000,
      doublePrice: 480000,
      singlePrice: 680000,
      coverImage: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?w=800&auto=format&fit=crop&q=80',
      makkahImage: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?w=800&auto=format&fit=crop&q=80',
      madinaImage: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&auto=format&fit=crop&q=80',
      flightImage: '',
      hotelImages: [
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80',
      ],
      galleryImages: [],
      inclusionsText:
        '5-Star Luxury Hotels\nSaudi Umrah E-Visa Included\nDirect Air Ticket (Saudi Airlines)\nPrivate GMC Transport\nGrand Buffet Breakfast',
      description: 'Experience pure luxury in Makkah and Madina.',
      featured: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setErrorMessage(null);
    const cover = pkg.coverImage || pkg.images[0] || '';
    const makkah = pkg.makkahImage || pkg.images[0] || '';
    const madina = pkg.madinaImage || pkg.images[1] || pkg.images[0] || '';
    const flight = pkg.flightImage || '';
    const hotels = pkg.hotelImages || (pkg.images.length > 2 ? pkg.images.slice(2) : []);
    const gallery = pkg.galleryImages || [];

    const mDet = pkg.makkahHotelDetail;
    const mdDet = pkg.madinaHotelDetail;

    setFormData({
      title: pkg.title,
      type: pkg.type,
      durationDays: pkg.durationDays,
      makkahNights: pkg.makkahNights,
      madinaNights: pkg.madinaNights,
      makkahHotel: pkg.makkahHotel,
      makkahAddress: mDet?.address || 'Abraj Al Bait Complex, Makkah',
      makkahStarRating: mDet?.starRating || 5,
      makkahRoomType: mDet?.roomType || 'Deluxe Room',
      makkahRoomSharing: (mDet?.roomSharing as any) || 'Quad',
      makkahRatePerNight: mDet?.ratePerNight || 85000,
      makkahTotalRate: mDet?.totalHotelRate || (85000 * pkg.makkahNights),
      makkahMealPlan: mDet?.mealPlan || 'Breakfast Included',
      makkahDistance: mDet?.distanceFromHaram || '0m Direct Courtyard Access',
      makkahContact: mDet?.contactPhone || '+966 12 500 0000',
      madinaHotel: pkg.madinaHotel,
      madinaAddress: mdDet?.address || 'Northern Central Area, Madina',
      madinaStarRating: mdDet?.starRating || 5,
      madinaRoomType: mdDet?.roomType || 'Executive Suite',
      madinaRoomSharing: (mdDet?.roomSharing as any) || 'Quad',
      madinaRatePerNight: mdDet?.ratePerNight || 75000,
      madinaTotalRate: mdDet?.totalHotelRate || (75000 * pkg.madinaNights),
      madinaMealPlan: mdDet?.mealPlan || 'Breakfast Included',
      madinaDistance: mdDet?.distanceFromHaram || '100m to Ladies Gate',
      madinaContact: mdDet?.contactPhone || '+966 14 800 0000',
      currency: mDet?.currency || 'PKR',
      quadPrice: pkg.quadPrice,
      triplePrice: pkg.triplePrice,
      doublePrice: pkg.doublePrice,
      singlePrice: pkg.singlePrice,
      coverImage: cover,
      makkahImage: makkah,
      madinaImage: madina,
      flightImage: flight,
      hotelImages: hotels,
      galleryImages: gallery,
      inclusionsText: pkg.inclusions.join('\n'),
      description: pkg.description,
      featured: pkg.featured || false,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inclusions = formData.inclusionsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    // Build consolidated images list
    const combinedImages = [
      formData.coverImage,
      formData.makkahImage,
      formData.madinaImage,
      formData.flightImage,
      ...formData.hotelImages,
      ...formData.galleryImages,
    ].filter(Boolean);

    const makkahHotelDetail = {
      hotelName: formData.makkahHotel,
      city: 'Makkah' as const,
      address: formData.makkahAddress,
      starRating: formData.makkahStarRating,
      roomType: formData.makkahRoomType,
      roomSharing: formData.makkahRoomSharing as any,
      nights: formData.makkahNights,
      ratePerNight: formData.makkahRatePerNight,
      totalHotelRate: formData.makkahRatePerNight * formData.makkahNights,
      currency: formData.currency as any,
      mealPlan: formData.makkahMealPlan,
      distanceFromHaram: formData.makkahDistance,
      contactPhone: formData.makkahContact,
      imageUrl: formData.makkahImage,
    };

    const madinaHotelDetail = {
      hotelName: formData.madinaHotel,
      city: 'Madina' as const,
      address: formData.madinaAddress,
      starRating: formData.madinaStarRating,
      roomType: formData.madinaRoomType,
      roomSharing: formData.madinaRoomSharing as any,
      nights: formData.madinaNights,
      ratePerNight: formData.madinaRatePerNight,
      totalHotelRate: formData.madinaRatePerNight * formData.madinaNights,
      currency: formData.currency as any,
      mealPlan: formData.madinaMealPlan,
      distanceFromHaram: formData.madinaDistance,
      contactPhone: formData.madinaContact,
      imageUrl: formData.madinaImage,
    };

    const pkgPayload = {
      title: formData.title,
      type: formData.type,
      durationDays: formData.durationDays,
      makkahNights: formData.makkahNights,
      madinaNights: formData.madinaNights,
      makkahHotel: formData.makkahHotel,
      madinaHotel: formData.madinaHotel,
      makkahHotelDetail,
      madinaHotelDetail,
      quadPrice: formData.quadPrice,
      triplePrice: formData.triplePrice,
      doublePrice: formData.doublePrice,
      singlePrice: formData.singlePrice,
      coverImage: formData.coverImage,
      makkahImage: formData.makkahImage,
      madinaImage: formData.madinaImage,
      flightImage: formData.flightImage,
      hotelImages: formData.hotelImages,
      galleryImages: formData.galleryImages,
      images: combinedImages.length > 0 ? combinedImages : [FALLBACK_IMAGE],
      inclusions,
      description: formData.description,
      featured: formData.featured,
    };

    if (editingPackage) {
      updatePackage({ ...editingPackage, ...pkgPayload });
    } else {
      addPackage(pkgPayload);
    }
    setIsModalOpen(false);
  };

  // Multiple File Upload Handlers
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, (dataUrl) => {
        setFormData((prev) => ({ ...prev, coverImage: dataUrl }));
      });
    }
    e.target.value = '';
  };

  const handleMakkahUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, (dataUrl) => {
        setFormData((prev) => ({ ...prev, makkahImage: dataUrl }));
      });
    }
    e.target.value = '';
  };

  const handleMadinaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, (dataUrl) => {
        setFormData((prev) => ({ ...prev, madinaImage: dataUrl }));
      });
    }
    e.target.value = '';
  };

  const handleFlightUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, (dataUrl) => {
        setFormData((prev) => ({ ...prev, flightImage: dataUrl }));
      });
    }
    e.target.value = '';
  };

  const handleHotelPhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    files.forEach((file) => {
      processImageFile(file, (dataUrl) => {
        setFormData((prev) => ({
          ...prev,
          hotelImages: [...prev.hotelImages, dataUrl],
        }));
      });
    });
    e.target.value = '';
  };

  const handleGalleryPhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    files.forEach((file) => {
      processImageFile(file, (dataUrl) => {
        setFormData((prev) => ({
          ...prev,
          galleryImages: [...prev.galleryImages, dataUrl],
        }));
      });
    });
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20 shadow-xl">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
            <PackageCheck className="w-6 h-6 text-amber-400" />
            Umrah & Hajj Luxury Packages Catalog
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Browse packages with high-resolution Makkah/Madina photos, hotel galleries, and room rates.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Package</span>
        </button>
      </div>

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {packages.map((pkg) => {
          const cover = pkg.coverImage || pkg.images[0] || FALLBACK_IMAGE;
          const makkahImg = pkg.makkahImage || pkg.images[0];
          const madinaImg = pkg.madinaImage || pkg.images[1] || pkg.images[0];
          const flightImg = pkg.flightImage;

          const totalPhotosCount = [
            pkg.coverImage,
            pkg.makkahImage,
            pkg.madinaImage,
            pkg.flightImage,
            ...(pkg.hotelImages || []),
            ...(pkg.galleryImages || []),
            ...pkg.images,
          ].filter(Boolean).length;

          return (
            <div
              key={pkg.id}
              className="group relative rounded-2xl bg-zinc-900 border border-amber-500/20 hover:border-amber-500/50 overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Cover Image Banner */}
                <div className="relative h-56 overflow-hidden bg-zinc-950">
                  <img
                    src={cover}
                    alt={pkg.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <GoldBadge variant={pkg.type === 'Hajj' ? 'emerald' : 'gold'}>
                      {pkg.type} Package
                    </GoldBadge>
                    {pkg.featured && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-400 text-zinc-950 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-zinc-950" /> FEATURED
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setViewingPackage(pkg)}
                    className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-zinc-950/80 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 border border-amber-500/30 text-[10px] font-bold backdrop-blur-sm flex items-center gap-1 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Gallery ({totalPhotosCount} Photos)</span>
                  </button>

                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <span className="text-xs font-bold text-amber-300 bg-zinc-950/90 px-2.5 py-1 rounded-lg border border-amber-500/30 backdrop-blur-sm flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {pkg.durationDays} Days / {pkg.makkahNights}N Makkah + {pkg.madinaNights}N Madina
                    </span>
                  </div>
                </div>

                {/* Body Info */}
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-white group-hover:text-amber-300 transition-colors">
                      {pkg.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{pkg.description}</p>
                  </div>

                  {/* Location & Hotel Image Thumbnails */}
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-amber-400 uppercase flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Makkah Hotel
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {makkahImg && (
                          <img
                            src={makkahImg}
                            alt="Makkah Hotel"
                            referrerPolicy="no-referrer"
                            onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                            className="w-10 h-10 rounded-lg object-cover ring-1 ring-amber-500/30 shrink-0 cursor-pointer"
                            onClick={() => setLightboxImage(makkahImg)}
                          />
                        )}
                        <div className="text-zinc-200 font-bold text-xs truncate">
                          {pkg.makkahHotel}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-emerald-400 uppercase flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Madina Hotel
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {madinaImg && (
                          <img
                            src={madinaImg}
                            alt="Madina Hotel"
                            referrerPolicy="no-referrer"
                            onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                            className="w-10 h-10 rounded-lg object-cover ring-1 ring-emerald-500/30 shrink-0 cursor-pointer"
                            onClick={() => setLightboxImage(madinaImg)}
                          />
                        )}
                        <div className="text-zinc-200 font-bold text-xs truncate">
                          {pkg.madinaHotel}
                        </div>
                      </div>
                    </div>

                    {flightImg && (
                      <div className="col-span-2 pt-2 border-t border-zinc-800/80 flex items-center gap-2">
                        <img
                          src={flightImg}
                          alt="Flight"
                          referrerPolicy="no-referrer"
                          onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                          className="w-8 h-8 rounded-lg object-cover ring-1 ring-sky-500/30 shrink-0 cursor-pointer"
                          onClick={() => setLightboxImage(flightImg)}
                        />
                        <div className="flex-1 truncate">
                          <span className="text-[9px] font-extrabold text-sky-400 uppercase flex items-center gap-1">
                            <Plane className="w-3 h-3 text-sky-400" /> Direct Air Flight Included
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Occupancy Pricing Matrix */}
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-amber-500/15">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase mb-2">
                      Occupancy Pricing Rates (PKR per Pax)
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                      <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800">
                        <div className="text-[9px] text-zinc-400">Quad</div>
                        <div className="font-bold text-amber-300">{(pkg.quadPrice / 1000).toFixed(0)}k</div>
                      </div>
                      <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800">
                        <div className="text-[9px] text-zinc-400">Triple</div>
                        <div className="font-bold text-amber-300">{(pkg.triplePrice / 1000).toFixed(0)}k</div>
                      </div>
                      <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800">
                        <div className="text-[9px] text-zinc-400">Double</div>
                        <div className="font-bold text-amber-300">{(pkg.doublePrice / 1000).toFixed(0)}k</div>
                      </div>
                      <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800">
                        <div className="text-[9px] text-zinc-400">Single</div>
                        <div className="font-bold text-amber-300">{(pkg.singlePrice / 1000).toFixed(0)}k</div>
                      </div>
                    </div>
                  </div>

                  {/* Key Inclusions */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase">Package Perks</div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-zinc-300">
                      {pkg.inclusions.slice(0, 4).map((inc, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="truncate">{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
                <button
                  onClick={() => setViewingPackage(pkg)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-bold border border-amber-500/30 flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" /> Photos & Specs
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(pkg)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 text-amber-300 hover:bg-zinc-700 text-xs font-bold border border-amber-500/20 flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>

                  <button
                    onClick={() => deletePackage(pkg.id)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 text-rose-400 hover:bg-rose-500/20 text-xs font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hidden File Inputs for Package Add/Edit */}
      <input
        type="file"
        ref={coverInputRef}
        onChange={handleCoverUpload}
        accept="image/jpeg,image/png,image/jpg,image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={makkahInputRef}
        onChange={handleMakkahUpload}
        accept="image/jpeg,image/png,image/jpg,image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={madinaInputRef}
        onChange={handleMadinaUpload}
        accept="image/jpeg,image/png,image/jpg,image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={flightInputRef}
        onChange={handleFlightUpload}
        accept="image/jpeg,image/png,image/jpg,image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={hotelInputRef}
        onChange={handleHotelPhotosUpload}
        accept="image/jpeg,image/png,image/jpg,image/webp"
        multiple
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

      {/* Add / Edit Package Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPackage ? 'Edit Package & Images' : 'Create New Luxury Package'}
        subtitle="Manage package specifications, Makkah & Madinah hotel photos, and gallery images."
        maxWidth="4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Core Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Package Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 font-semibold"
                placeholder="15-Day Gold Clock Tower VIP Umrah"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Package Type & Duration (Days)
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as Package['type'] })
                  }
                  className="w-1/2 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100"
                >
                  <option value="Umrah">Umrah</option>
                  <option value="Hajj">Hajj</option>
                </select>
                <input
                  type="number"
                  min="1"
                  value={formData.durationDays}
                  onChange={(e) =>
                    setFormData({ ...formData, durationDays: parseInt(e.target.value) || 1 })
                  }
                  className="w-1/2 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100"
                  placeholder="Days"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Makkah Hotel & Nights
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.makkahHotel}
                  onChange={(e) => setFormData({ ...formData, makkahHotel: e.target.value })}
                  className="w-2/3 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100"
                  placeholder="Fairmont Makkah Clock Royal Tower"
                />
                <input
                  type="number"
                  min="1"
                  value={formData.makkahNights}
                  onChange={(e) =>
                    setFormData({ ...formData, makkahNights: parseInt(e.target.value) || 0 })
                  }
                  className="w-1/3 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 text-center"
                  placeholder="Nights"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Madina Hotel & Nights
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.madinaHotel}
                  onChange={(e) => setFormData({ ...formData, madinaHotel: e.target.value })}
                  className="w-2/3 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100"
                  placeholder="Pullman Zamzam Madina"
                />
                <input
                  type="number"
                  min="1"
                  value={formData.madinaNights}
                  onChange={(e) =>
                    setFormData({ ...formData, madinaNights: parseInt(e.target.value) || 0 })
                  }
                  className="w-1/3 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 text-center"
                  placeholder="Nights"
                />
              </div>
            </div>
          </div>

          {/* PACKAGE IMAGE MANAGEMENT SECTION */}
          <div className="p-4 bg-zinc-950 border border-amber-500/20 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h4 className="text-xs font-extrabold text-amber-400 font-serif uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                Package Image Management & Galleries
              </h4>
              <span className="text-[10px] text-zinc-400">Upload or paste image URLs</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Cover Image Upload */}
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
                <span className="block text-[11px] font-bold text-amber-300 uppercase">
                  1. Package Cover Photo
                </span>

                {formData.coverImage ? (
                  <div className="relative group rounded-lg overflow-hidden h-32 bg-zinc-950">
                    <img
                      src={formData.coverImage}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, coverImage: '' })}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md hover:bg-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="w-full h-32 rounded-lg border-2 border-dashed border-zinc-700 hover:border-amber-400 bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 text-[11px] gap-1 transition-all"
                  >
                    <Upload className="w-5 h-5 text-amber-400" />
                    <span>Upload Cover Photo</span>
                  </button>
                )}

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-amber-300 rounded text-[10px] font-bold"
                  >
                    Browse
                  </button>
                  <input
                    type="text"
                    placeholder="Or paste URL..."
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    className="flex-1 px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-[10px] text-zinc-200"
                  />
                </div>
              </div>

              {/* Makkah Image Upload */}
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
                <span className="block text-[11px] font-bold text-amber-400 uppercase">
                  2. Makkah Hotel / Location Photo
                </span>

                {formData.makkahImage ? (
                  <div className="relative group rounded-lg overflow-hidden h-32 bg-zinc-950">
                    <img
                      src={formData.makkahImage}
                      alt="Makkah"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, makkahImage: '' })}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md hover:bg-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => makkahInputRef.current?.click()}
                    className="w-full h-32 rounded-lg border-2 border-dashed border-zinc-700 hover:border-amber-400 bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 text-[11px] gap-1 transition-all"
                  >
                    <Upload className="w-5 h-5 text-amber-400" />
                    <span>Upload Makkah Photo</span>
                  </button>
                )}

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => makkahInputRef.current?.click()}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-amber-300 rounded text-[10px] font-bold"
                  >
                    Browse
                  </button>
                  <input
                    type="text"
                    placeholder="Or paste URL..."
                    value={formData.makkahImage}
                    onChange={(e) => setFormData({ ...formData, makkahImage: e.target.value })}
                    className="flex-1 px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-[10px] text-zinc-200"
                  />
                </div>
              </div>

              {/* Madina Image Upload */}
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
                <span className="block text-[11px] font-bold text-emerald-400 uppercase">
                  3. Madina Hotel / Location Photo
                </span>

                {formData.madinaImage ? (
                  <div className="relative group rounded-lg overflow-hidden h-32 bg-zinc-950">
                    <img
                      src={formData.madinaImage}
                      alt="Madina"
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, madinaImage: '' })}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md hover:bg-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => madinaInputRef.current?.click()}
                    className="w-full h-32 rounded-lg border-2 border-dashed border-zinc-700 hover:border-emerald-400 bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 text-[11px] gap-1 transition-all"
                  >
                    <Upload className="w-5 h-5 text-emerald-400" />
                    <span>Upload Madina Photo</span>
                  </button>
                )}

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => madinaInputRef.current?.click()}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-emerald-300 rounded text-[10px] font-bold"
                  >
                    Browse
                  </button>
                  <input
                    type="text"
                    placeholder="Or paste URL..."
                    value={formData.madinaImage}
                    onChange={(e) => setFormData({ ...formData, madinaImage: e.target.value })}
                    className="flex-1 px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-[10px] text-zinc-200"
                  />
                </div>
              </div>

              {/* Flight Image Upload */}
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
                <span className="block text-[11px] font-bold text-sky-400 uppercase">
                  4. Flight & Airlines Banner Photo
                </span>

                {formData.flightImage ? (
                  <div className="relative group rounded-lg overflow-hidden h-32 bg-zinc-950">
                    <img
                      src={formData.flightImage}
                      alt="Flight"
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, flightImage: '' })}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md hover:bg-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => flightInputRef.current?.click()}
                    className="w-full h-32 rounded-lg border-2 border-dashed border-zinc-700 hover:border-sky-400 bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 text-[11px] gap-1 transition-all"
                  >
                    <Upload className="w-5 h-5 text-sky-400" />
                    <span>Upload Flight/Airlines Photo</span>
                  </button>
                )}

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => flightInputRef.current?.click()}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-sky-300 rounded text-[10px] font-bold"
                  >
                    Browse
                  </button>
                  <input
                    type="text"
                    placeholder="Or paste URL..."
                    value={formData.flightImage}
                    onChange={(e) => setFormData({ ...formData, flightImage: e.target.value })}
                    className="flex-1 px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-[10px] text-zinc-200"
                  />
                </div>
              </div>
            </div>

            {/* Hotel Suites Gallery */}
            <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-300 uppercase">
                  5. Additional Hotel Suites & Room Photos
                </span>
                <button
                  type="button"
                  onClick={() => hotelInputRef.current?.click()}
                  className="px-3 py-1 bg-amber-500 text-zinc-950 hover:bg-amber-400 text-[10px] font-bold rounded flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Hotel Photos
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {formData.hotelImages.map((img, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden h-20 bg-zinc-950">
                    <img src={img} alt={`Hotel ${idx}`} referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          hotelImages: prev.hotelImages.filter((_, i) => i !== idx),
                        }))
                      }
                      className="absolute top-1 right-1 p-1 bg-rose-600/90 text-white rounded hover:bg-rose-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => hotelInputRef.current?.click()}
                  className="h-20 rounded-lg border border-dashed border-zinc-700 hover:border-amber-400 bg-zinc-950/60 flex flex-col items-center justify-center text-zinc-400 text-[10px] gap-1"
                >
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Upload Files</span>
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Paste additional Hotel Photo URL..."
                  value={newHotelImageUrl}
                  onChange={(e) => setNewHotelImageUrl(e.target.value)}
                  className="flex-1 px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-[10px] text-zinc-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newHotelImageUrl.trim()) {
                      setFormData((prev) => ({
                        ...prev,
                        hotelImages: [...prev.hotelImages, newHotelImageUrl.trim()],
                      }));
                      setNewHotelImageUrl('');
                    }
                  }}
                  className="px-3 py-1 bg-zinc-800 text-amber-300 text-[10px] font-bold rounded"
                >
                  Add URL
                </button>
              </div>
            </div>

            {/* Extra Gallery Photos */}
            <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-300 uppercase">
                  6. Package Gallery & Ziyarat Photos
                </span>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="px-3 py-1 bg-amber-500 text-zinc-950 hover:bg-amber-400 text-[10px] font-bold rounded flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Gallery Photos
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {formData.galleryImages.map((img, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden h-20 bg-zinc-950">
                    <img src={img} alt={`Gallery ${idx}`} referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          galleryImages: prev.galleryImages.filter((_, i) => i !== idx),
                        }))
                      }
                      className="absolute top-1 right-1 p-1 bg-rose-600/90 text-white rounded hover:bg-rose-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="h-20 rounded-lg border border-dashed border-zinc-700 hover:border-amber-400 bg-zinc-950/60 flex flex-col items-center justify-center text-zinc-400 text-[10px] gap-1"
                >
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Upload Files</span>
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Paste Gallery Photo URL..."
                  value={newGalleryImageUrl}
                  onChange={(e) => setNewGalleryImageUrl(e.target.value)}
                  className="flex-1 px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-[10px] text-zinc-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newGalleryImageUrl.trim()) {
                      setFormData((prev) => ({
                        ...prev,
                        galleryImages: [...prev.galleryImages, newGalleryImageUrl.trim()],
                      }));
                      setNewGalleryImageUrl('');
                    }
                  }}
                  className="px-3 py-1 bg-zinc-800 text-amber-300 text-[10px] font-bold rounded"
                >
                  Add URL
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
            <span className="text-xs font-bold text-amber-300 uppercase">
              Occupancy Rates per Person (PKR)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] text-zinc-400">Quad Sharing</label>
                <input
                  type="number"
                  value={formData.quadPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, quadPrice: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400">Triple Sharing</label>
                <input
                  type="number"
                  value={formData.triplePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, triplePrice: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400">Double Room</label>
                <input
                  type="number"
                  value={formData.doublePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, doublePrice: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400">Single Room</label>
                <input
                  type="number"
                  value={formData.singlePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, singlePrice: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100 font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Description & Highlights
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Inclusions (One perk per line)
            </label>
            <textarea
              rows={3}
              value={formData.inclusionsText}
              onChange={(e) => setFormData({ ...formData, inclusionsText: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100"
            />
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500"
            >
              Save Package
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW PACKAGE SPECS & PHOTO GALLERY MODAL */}
      {viewingPackage && (
        <Modal
          isOpen={!!viewingPackage}
          onClose={() => setViewingPackage(null)}
          title={viewingPackage.title}
          subtitle={`${viewingPackage.type} Package • ${viewingPackage.durationDays} Days Duration`}
          maxWidth="5xl"
        >
          <div className="space-y-6">
            {/* Gallery Category Filter Tabs */}
            <div className="flex border-b border-zinc-800 gap-2 overflow-x-auto custom-scrollbar">
              <button
                onClick={() => setActiveGalleryTab('all')}
                className={`px-3 py-2 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
                  activeGalleryTab === 'all'
                    ? 'border-amber-400 text-amber-300 bg-zinc-900'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                All Photos
              </button>
              <button
                onClick={() => setActiveGalleryTab('makkah')}
                className={`px-3 py-2 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
                  activeGalleryTab === 'makkah'
                    ? 'border-amber-400 text-amber-300 bg-zinc-900'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                Makkah Hotel & Haram
              </button>
              <button
                onClick={() => setActiveGalleryTab('madina')}
                className={`px-3 py-2 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
                  activeGalleryTab === 'madina'
                    ? 'border-emerald-400 text-emerald-300 bg-zinc-900'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                Madina Hotel & Masjid Nabawi
              </button>
              <button
                onClick={() => setActiveGalleryTab('flights')}
                className={`px-3 py-2 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
                  activeGalleryTab === 'flights'
                    ? 'border-sky-400 text-sky-300 bg-zinc-900'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                Flights & Airlines
              </button>
              <button
                onClick={() => setActiveGalleryTab('hotels')}
                className={`px-3 py-2 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
                  activeGalleryTab === 'hotels'
                    ? 'border-amber-400 text-amber-300 bg-zinc-900'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                Hotel Suites
              </button>
              <button
                onClick={() => setActiveGalleryTab('gallery')}
                className={`px-3 py-2 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
                  activeGalleryTab === 'gallery'
                    ? 'border-amber-400 text-amber-300 bg-zinc-900'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                Ziyarat & Extra Gallery
              </button>
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {(activeGalleryTab === 'all' || activeGalleryTab === 'makkah') &&
                (viewingPackage.makkahImage || viewingPackage.images[0]) && (
                  <div
                    onClick={() => setLightboxImage(viewingPackage.makkahImage || viewingPackage.images[0])}
                    className="relative group rounded-xl overflow-hidden h-40 bg-zinc-950 cursor-pointer ring-1 ring-amber-500/30 hover:ring-amber-400 transition-all"
                  >
                    <img
                      src={viewingPackage.makkahImage || viewingPackage.images[0]}
                      alt="Makkah"
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                    <span className="absolute bottom-2 left-2 text-[10px] font-extrabold text-amber-300 uppercase">
                      Makkah Hotel
                    </span>
                  </div>
                )}

              {(activeGalleryTab === 'all' || activeGalleryTab === 'madina') &&
                (viewingPackage.madinaImage || viewingPackage.images[1]) && (
                  <div
                    onClick={() => setLightboxImage(viewingPackage.madinaImage || viewingPackage.images[1])}
                    className="relative group rounded-xl overflow-hidden h-40 bg-zinc-950 cursor-pointer ring-1 ring-emerald-500/30 hover:ring-emerald-400 transition-all"
                  >
                    <img
                      src={viewingPackage.madinaImage || viewingPackage.images[1]}
                      alt="Madina"
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                    <span className="absolute bottom-2 left-2 text-[10px] font-extrabold text-emerald-300 uppercase">
                      Madina Hotel
                    </span>
                  </div>
                )}

              {(activeGalleryTab === 'all' || activeGalleryTab === 'flights') && viewingPackage.flightImage && (
                <div
                  onClick={() => setLightboxImage(viewingPackage.flightImage!)}
                  className="relative group rounded-xl overflow-hidden h-40 bg-zinc-950 cursor-pointer ring-1 ring-sky-500/30 hover:ring-sky-400 transition-all"
                >
                  <img
                    src={viewingPackage.flightImage}
                    alt="Flight"
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-extrabold text-sky-300 uppercase">
                    Flight & Airline
                  </span>
                </div>
              )}

              {(activeGalleryTab === 'all' || activeGalleryTab === 'hotels') &&
                (viewingPackage.hotelImages || []).map((img, i) => (
                  <div
                    key={`h-${i}`}
                    onClick={() => setLightboxImage(img)}
                    className="relative group rounded-xl overflow-hidden h-40 bg-zinc-950 cursor-pointer ring-1 ring-zinc-800 hover:ring-amber-400 transition-all"
                  >
                    <img
                      src={img}
                      alt={`Hotel ${i}`}
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                    <span className="absolute bottom-2 left-2 text-[10px] font-extrabold text-zinc-200 uppercase">
                      Suite Photo #{i + 1}
                    </span>
                  </div>
                ))}

              {(activeGalleryTab === 'all' || activeGalleryTab === 'gallery') &&
                (viewingPackage.galleryImages || []).map((img, i) => (
                  <div
                    key={`g-${i}`}
                    onClick={() => setLightboxImage(img)}
                    className="relative group rounded-xl overflow-hidden h-40 bg-zinc-950 cursor-pointer ring-1 ring-zinc-800 hover:ring-amber-400 transition-all"
                  >
                    <img
                      src={img}
                      alt={`Gallery ${i}`}
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                    <span className="absolute bottom-2 left-2 text-[10px] font-extrabold text-amber-300 uppercase">
                      Ziyarat Gallery #{i + 1}
                    </span>
                  </div>
                ))}
            </div>

            {/* Package Specs Summary */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 text-xs">
              <div className="font-bold text-amber-400 font-serif">Package Details Summary</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-zinc-500 text-[10px] uppercase">Makkah Accommodation</span>
                  <div className="font-bold text-white">{viewingPackage.makkahHotel}</div>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] uppercase">Madina Accommodation</span>
                  <div className="font-bold text-white">{viewingPackage.madinaHotel}</div>
                </div>
              </div>

              <div>
                <span className="text-zinc-500 text-[10px] uppercase">Included Amenities</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {viewingPackage.inclusions.map((inc, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300"
                    >
                      ✓ {inc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ENLARGED LIGHTBOX MODAL */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in"
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-amber-400 text-sm font-bold flex items-center gap-1"
            >
              <X className="w-6 h-6" /> Close
            </button>
            <img
              src={lightboxImage}
              alt="Enlarged"
              referrerPolicy="no-referrer"
              onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
              className="max-w-full max-h-[80vh] rounded-2xl object-contain ring-2 ring-amber-500/40 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
