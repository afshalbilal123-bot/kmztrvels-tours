export const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?w=800&auto=format&fit=crop&q=80';

export interface CompanySettings {
  companyName: string;
  ownerName: string;
  address: string;
  whatsappNumber: string;
  phone: string;
  ntnNumber: string;
  dtsLicense: string;
  logoUrl?: string;
  dashboardBannerUrl?: string;
  customerPortalLogoUrl?: string;
  customerPortalBannerUrl?: string;
  superAdminAvatarUrl?: string;
}

export type Role = 'super_admin' | 'staff' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  passwordHash?: string;
  password?: string; // Kept for backwards compatibility during migration, never stored in plain text
  avatar?: string;
  phone?: string;
  designation?: string;
  customerId?: string; // Linked customer ID if role is customer
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  passportNumber: string;
  passportExpiry: string;
  cnic: string;
  city: string;
  country: string;
  emergencyContact: string;
  customerType: 'Umrah' | 'Hajj' | 'Corporate' | 'VIP' | 'Repeat';
  totalSpent: number;
  totalBookings: number;
  passportCopyUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface HotelBookingItem {
  id: string;
  city: 'Makkah' | 'Madina' | 'Jeddah';
  hotelName: string;
  hotelAddress?: string;
  starRating?: number;
  roomType: 'Standard' | 'Deluxe' | 'Executive' | 'Haram View Suite' | 'Family Room' | string;
  roomSharing?: 'Single' | 'Double' | 'Triple' | 'Quad' | 'Sharing' | string;
  nights: number;
  ratePerNight: number;
  checkIn: string;
  checkOut: string;
  totalRate: number;
  totalHotelCost?: number;
  currency?: 'PKR' | 'SAR';
  mealPlan?: 'Room Only' | 'Breakfast Included' | 'Half Board' | 'Full Board' | 'Suhoor & Iftar' | string;
  distanceFromHaram?: string;
  contactPerson?: string;
  contactPhone?: string;
  imageUrl?: string;
  images?: string[];
}

export interface FlightDetail {
  airline: string;
  flightNumber: string;
  pnr: string;
  departureAirport: string;
  arrivalAirport: string;
  departureDatetime: string;
  returnDatetime: string;
  ticketPrice: number;
  status: 'Confirmed' | 'Reserved' | 'Ticketed' | 'Cancelled';
}

export interface VisaDetail {
  visaType: 'Umrah Visa' | 'Tourist E-Visa' | 'Hajj Visa' | 'Business Visa';
  visaNumber?: string;
  nusukId?: string;
  status: 'Submitted' | 'Processing' | 'Approved' | 'Issued' | 'Rejected';
  applicationDate: string;
  issueDate?: string;
  expiryDate?: string;
  fee: number;
  documentUrl?: string;
}

export interface TransportDetail {
  transportType: 'Private GMC' | 'Luxury Coaster' | 'VIP Bus' | 'High-Speed Haramain Train' | 'Standard Sharing';
  route: string;
  vehicleNumber?: string;
  driverName?: string;
  driverContact?: string;
}

export interface Booking {
  id: string;
  bookingNumber: string; // e.g., KMZ-2026-8801
  customerId: string;
  customerName: string;
  customerPhone: string;
  packageId?: string;
  packageName: string;
  packageType: 'Umrah' | 'Hajj' | 'Custom';
  paxAdults: number;
  paxChildren: number;
  paxInfants: number;
  departureDate: string;
  returnDate: string;
  
  // Multi-hotel bookings
  hotels: HotelBookingItem[];
  
  // Flight info
  flight: FlightDetail;
  
  // Visa info
  visa: VisaDetail;
  
  // Transport info
  transport: TransportDetail;
  
  // Financials
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: 'Paid' | 'Partial' | 'Overdue' | 'Unpaid';
  bookingStatus: 'Confirmed' | 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  
  groupLeaderId?: string;
  groupLeaderName?: string;
  
  specialRequests?: string;
  createdAt: string;
}

export interface PackageHotelDetail {
  hotelName: string;
  city: 'Makkah' | 'Madina' | 'Jeddah';
  address?: string;
  starRating?: number;
  roomType?: string;
  roomSharing?: 'Single' | 'Double' | 'Triple' | 'Quad';
  checkInDate?: string;
  checkOutDate?: string;
  nights: number;
  ratePerNight: number;
  totalHotelRate: number;
  currency?: 'PKR' | 'SAR';
  mealPlan?: string;
  distanceFromHaram?: string;
  contactPerson?: string;
  contactPhone?: string;
  imageUrl?: string;
  images?: string[];
}

export interface Package {
  id: string;
  title: string;
  type: 'Umrah' | 'Hajj';
  durationDays: number;
  makkahNights: number;
  madinaNights: number;
  makkahHotel: string;
  madinaHotel: string;
  makkahHotelDetail?: PackageHotelDetail;
  madinaHotelDetail?: PackageHotelDetail;
  quadPrice: number;
  triplePrice: number;
  doublePrice: number;
  singlePrice: number;
  images: string[];
  inclusions: string[];
  description: string;
  featured?: boolean;
  coverImage?: string;
  makkahImage?: string;
  madinaImage?: string;
  flightImage?: string;
  hotelImages?: string[];
  galleryImages?: string[];
}

export interface Hotel {
  id: string;
  name: string;
  city: 'Makkah' | 'Madina' | 'Jeddah';
  address?: string;
  starRating: 3 | 4 | 5;
  roomType?: string;
  roomSharing?: 'Single' | 'Double' | 'Triple' | 'Quad' | 'Sharing';
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  ratePerNight?: number;
  totalHotelRate?: number;
  currency?: 'PKR' | 'SAR';
  mealPlan?: 'Room Only' | 'Breakfast Included' | 'Half Board' | 'Full Board' | 'Suhoor & Iftar' | string;
  distanceFromHaram?: string;
  distanceFromHaramMeters: number;
  distanceFromLadiesGateMeters?: number;
  contactPerson: string;
  contactPhone: string;
  baseQuadRate: number;
  baseTripleRate?: number;
  baseDoubleRate: number;
  baseSingleRate?: number;
  imageUrl: string;
  images?: string[];
}

export interface BankAccount {
  id: string;
  bankName: string; // e.g. "Meezan Bank Limited", "Habib Bank Limited", "Cash Account"
  accountTitle: string; // e.g. "KMZ Travels & Tours Pvt Ltd"
  accountNumber: string; // e.g. "0102010928120"
  iban: string; // e.g. "PK36MEZN000102010928120"
  branch: string; // e.g. "Gulberg Branch, Lahore"
  accountType: 'Current' | 'Savings' | 'Islamic Business' | 'Cash Account' | 'Mobile Wallet';
  openingBalance: number;
  currentBalance?: number;
  status: 'Active' | 'Inactive';
  notes?: string;
  createdAt: string;
}

export interface BankTransfer {
  id: string;
  transferNumber: string; // e.g. TRF-2026-001
  fromAccountId: string;
  fromAccountName: string;
  toAccountId: string;
  toAccountName: string;
  amount: number;
  date: string;
  referenceNumber?: string;
  description?: string;
  recordedBy: string;
}

export interface BankTransaction {
  id: string;
  bankAccountId: string;
  date: string;
  type: 'Receipt' | 'Expense' | 'Transfer In' | 'Transfer Out' | 'Salary' | 'Opening Balance';
  referenceNo: string;
  narration: string;
  debit: number; // Inflow / Deposit
  credit: number; // Outflow / Withdrawal
  runningBalance: number;
}

export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'JazzCash' | 'EasyPaisa' | 'Credit Card' | 'Cheque' | 'Online Nusuk' | 'Company Card';

export interface Payment {
  id: string;
  receiptNumber: string; // e.g. REC-2026-901
  bookingId: string;
  bookingNumber: string;
  invoiceId?: string; // Linked Invoice ID
  invoiceNumber?: string; // Linked Invoice Number (e.g. INV-UMR-1001)
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  walletTitle?: string; // Account/Wallet Title (JazzCash / EasyPaisa)
  walletNumber?: string; // Mobile/Wallet Number (JazzCash / EasyPaisa)
  transactionId?: string; // Transaction ID
  bankAccountId?: string;
  bankAccountName?: string;
  referenceNumber: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
  notes?: string;
  recordedBy: string;
  balanceRemaining?: number; // Balance remaining on linked invoice after this payment
}

export type InvoiceType =
  | 'Umrah Package Invoice'
  | 'Hotel Invoice'
  | 'Flight Invoice'
  | 'Visa Invoice'
  | 'Transport Invoice'
  | 'Extra Services Invoice'
  | 'Payment Receipt'
  | 'Consolidated Total Invoice';

export interface InvoiceItem {
  id?: string;
  description: string;
  qty: number;
  unitPrice: number;
  discount?: number;
  total: number;
  serviceCategory?: 'Package' | 'Hotel' | 'Flight' | 'Visa' | 'Transport' | 'Extra Services';
}

export interface InvoicePaymentRecord {
  id: string;
  paymentId?: string;
  receiptNumber: string;
  date: string;
  amount: number;
  paymentMethod: PaymentMethod | string;
  referenceNumber?: string;
  notes?: string;
  recordedBy?: string;
  balanceRemaining?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-UMR-1001, INV-HTL-1001, INV-FLT-1001, INV-VIS-1001, INV-TRN-1001, INV-EXT-1001, REC-2026-1001, INV-CON-1001
  invoiceType: InvoiceType;
  bookingId: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  customerAddress?: string;
  customerPhone: string;
  customerEmail?: string;
  passportNumber?: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: 'Paid' | 'Partially Paid' | 'Unpaid';
  items: InvoiceItem[];
  paymentHistory?: InvoicePaymentRecord[];
  notes?: string;
  terms?: string;
  consolidatedInvoices?: string[]; // Child service invoice numbers or IDs
  createdAt?: string;
}

export interface Expense {
  id: string;
  expenseNumber: string;
  category: 'Hotel Supplier' | 'Airline Tickets' | 'MOFA Visa Fee' | 'Transport Vendor' | 'Office Rent & Utilities' | 'Marketing' | 'Staff Salary' | 'Other';
  title: string;
  amount: number;
  paymentMethod: PaymentMethod;
  bankAccountId?: string;
  bankAccountName?: string;
  vendorName?: string;
  date: string;
  status: 'Paid' | 'Pending';
  notes?: string;
  recordedBy: string;
}

export interface StaffMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  cnic: string;
  phone: string;
  email: string;
  basicSalary: number;
  bankAccountNo: string;
  bankName: string;
}

export interface SalarySlip {
  id: string;
  slipNumber: string; // e.g. SAL-2026-0801
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  cnic?: string;
  accountNo?: string;
  month: string; // e.g. "August"
  year: number; // e.g. 2026
  basicSalary: number;
  paidDays: number; // e.g. 30
  status: 'Draft' | 'Issued' | 'Paid';

  // Flat & Nested Allowance structure for maximum compatibility
  houseRent: number;
  medicalAllowance: number;
  transportAllowance: number;
  bonus: number;
  otherAllowance: number;
  totalAllowances: number;

  // Flat & Nested Deduction structure
  tax: number;
  absenceDeduction: number;
  loanDeduction: number;
  otherDeduction: number;
  totalDeductions: number;

  netSalary: number; // Auto-calculated

  paymentMethod: PaymentMethod | string;
  paymentDate: string;
  bankAccountId?: string;
  bankAccountName?: string;
  bankAccountDetails?: string;
  notes?: string;
  createdAt?: string;

  // Optional nested objects for backward compatibility if accessed
  allowances?: {
    houseRent?: number;
    medical?: number;
    conveyance?: number;
    mobile?: number;
    hajjUmrahDuty?: number;
    bonus?: number;
    other?: number;
  };
  deductions?: {
    tax?: number;
    absenceDeduction?: number;
    loanDeduction?: number;
    advanceSalary?: number;
    providentFund?: number;
    other?: number;
  };
  paymentStatus?: 'Paid' | 'Pending' | 'Issued' | 'Draft';
}

export interface StaffReport {
  id: string;
  staffId: string;
  staffName: string;
  employeeId?: string;
  designation?: string;
  department?: string;
  date: string; // YYYY-MM-DD
  callsMade: number; // Inquiries / Customer Calls / Follow-ups
  newInquiriesCount?: number;
  bookingsCreated: number;
  paymentsCollected: number;
  visasProcessed: number;
  passportsCollectedCount?: number;
  tasksCompleted: string;
  summaryNotes?: string;
  attendanceStatus?: 'Present' | 'Late' | 'On Field' | 'Work From Home' | 'Leave' | 'Half Day';
  checkInTime?: string;
  checkOutTime?: string;
  challengesOrIssues?: string;
  adminFeedback?: string;
  status: 'Submitted' | 'Reviewed' | 'Pending Review';
  createdAt?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'visa' | 'salary' | 'reminder' | 'system';
  date: string;
  read: boolean;
  linkTab?: string;
  targetRole?: Role;
  targetCustomerId?: string;
}
