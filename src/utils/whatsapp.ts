export const KMZ_WHATSAPP_NUMBER = '923018647596';
export const KMZ_DISPLAY_PHONE = '+92 301 8647596';

export const cleanPhoneNumber = (phone?: string): string => {
  if (!phone) return KMZ_WHATSAPP_NUMBER;
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '92' + cleaned.substring(1);
  } else if (!cleaned.startsWith('92') && cleaned.length === 10) {
    cleaned = '92' + cleaned;
  }
  return cleaned || KMZ_WHATSAPP_NUMBER;
};

export const formatDisplayPhone = (phone?: string): string => {
  if (!phone) return KMZ_DISPLAY_PHONE;
  const cleaned = cleanPhoneNumber(phone);
  if (cleaned.startsWith('92') && cleaned.length === 12) {
    return `+92 ${cleaned.substring(2, 5)} ${cleaned.substring(5, 8)} ${cleaned.substring(8)}`;
  }
  return phone.startsWith('+') ? phone : `+${cleaned}`;
};

export const getWhatsAppUrl = (phone?: string, text?: string): string => {
  const targetPhone = cleanPhoneNumber(phone);
  const encodedText = text ? encodeURIComponent(text) : '';
  return `https://wa.me/${targetPhone}${encodedText ? `?text=${encodedText}` : ''}`;
};

export const openWhatsApp = (phone?: string, text?: string) => {
  window.open(getWhatsAppUrl(phone, text), '_blank');
};

export const getContextualWhatsAppMessage = (activeTab?: string, customerName?: string): string => {
  const greeting = customerName ? `Assalam-o-Alaikum, I am ${customerName}.` : 'Assalam-o-Alaikum,';

  switch (activeTab) {
    case 'packages':
      return `${greeting} I would like to inquire about KMZ Travels Umrah & Hajj packages, pricing, and custom group quotes.`;
    case 'hotels':
      return `${greeting} I would like to inquire about available Makkah & Madinah 5-Star hotel room rates and booking availability.`;
    case 'bookings':
    case 'vouchers':
      return `${greeting} I need assistance regarding an Umrah booking or hotel/flight voucher confirmation status.`;
    case 'visas':
      return `${greeting} I would like to check Saudi Nusuk Umrah Visa requirements and processing timelines.`;
    case 'invoices':
    case 'payments':
    case 'receivables':
      return `${greeting} I have an inquiry regarding billing, invoice payment schedules, or official bank receipts.`;
    case 'customer-portal':
      return `${greeting} I am logged into the KMZ Customer Portal and need live support for my pilgrimage booking.`;
    default:
      return `${greeting} I would like to inquire about KMZ Travels & Tours Umrah & Hajj services. How can you assist me?`;
  }
};

export const DEFAULT_ENQUIRY_MESSAGE =
  'Assalam-o-Alaikum, I would like to enquire about KMZ Travels Umrah & Hajj packages.';

export const createCustomerEnquiryMessage = (customerName: string, customerType?: string) => {
  return `Assalam-o-Alaikum ${customerName}, thank you for contacting KMZ Travels & Tours! We are reaching out regarding your ${customerType || 'Umrah & Hajj'} enquiry. How can we assist you today?`;
};

export const createBookingConfirmationMessage = (booking: {
  customerName: string;
  bookingNumber: string;
  packageName: string;
  departureDate: string;
  totalAmount: number;
  flight?: { pnr: string };
}) => {
  return `Assalam-o-Alaikum ${booking.customerName},\n\nYour booking with KMZ Travels & Tours has been CONFIRMED!\n\n📋 Booking Ref: ${booking.bookingNumber}\n🕋 Package: ${booking.packageName}\n📅 Departure Date: ${booking.departureDate}\n✈️ Flight PNR: ${booking.flight?.pnr || 'TBA'}\n💰 Total Package Price: PKR ${booking.totalAmount.toLocaleString()}\n\nThank you for trusting KMZ Travels for your sacred journey!`;
};

export const createPaymentReminderMessage = (booking: {
  customerName: string;
  bookingNumber: string;
  packageName: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
}) => {
  return `Assalam-o-Alaikum ${booking.customerName},\n\nThis is a friendly payment reminder from KMZ Travels & Tours regarding your booking #${booking.bookingNumber} (${booking.packageName}).\n\n💵 Total Amount: PKR ${booking.totalAmount.toLocaleString()}\n✅ Paid Amount: PKR ${booking.paidAmount.toLocaleString()}\n⚠️ Remaining Balance: PKR ${booking.balanceAmount.toLocaleString()}\n\nKindly complete the remaining payment at your earliest convenience to finalize your travel vouchers.`;
};

export const createVoucherDetailsMessage = (booking: {
  customerName: string;
  bookingNumber: string;
  packageName: string;
  departureDate: string;
  paxAdults: number;
  hotels: Array<{ city: string; hotelName: string; roomType: string; nights: number }>;
  flight?: { airline: string; pnr: string };
  visa?: { status: string; nusukId?: string };
}) => {
  const hotelSummary = booking.hotels
    .map((h) => `• ${h.city}: ${h.hotelName} (${h.roomType}, ${h.nights} Nights)`)
    .join('\n');

  return `Assalam-o-Alaikum ${booking.customerName},\n\nHere are your KMZ Travels Voucher & Pilgrimage Booking Details:\n\n📋 Booking Ref: ${booking.bookingNumber}\n🕋 Package: ${booking.packageName}\n👥 Pilgrims: ${booking.paxAdults} Pax\n📅 Departure: ${booking.departureDate}\n\n🏨 Reserved Accommodations:\n${hotelSummary}\n\n✈️ Flight: ${booking.flight?.airline || 'Saudi Airlines'} (PNR: ${booking.flight?.pnr || 'N/A'})\n📄 Saudi Visa Status: ${booking.visa?.status || 'Approved'}${booking.visa?.nusukId ? ` (Nusuk ID: ${booking.visa.nusukId})` : ''}\n\nFor any immediate assistance, call us at +92 301 8647596. JazaakAllahu Khair!`;
};
