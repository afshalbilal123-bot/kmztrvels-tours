import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Customer,
  Package,
  Hotel,
  Booking,
  Payment,
  Invoice,
  InvoiceType,
  PaymentMethod,
  InvoicePaymentRecord,
  Expense,
  SalarySlip,
  StaffReport,
  NotificationItem,
  BankAccount,
  BankTransfer,
  BankTransaction,
  CompanySettings,
} from '../types';
import {
  INITIAL_CUSTOMERS,
  INITIAL_PACKAGES,
  INITIAL_HOTELS,
  INITIAL_BOOKINGS,
  INITIAL_PAYMENTS,
  INITIAL_INVOICES,
  INITIAL_EXPENSES,
  INITIAL_SALARY_SLIPS,
  INITIAL_STAFF_REPORTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_BANK_TRANSFERS,
} from '../data/mockData';
import {
  supabase,
  uploadBrandingImageToSupabase,
  saveCompanySettingsToSupabase,
  fetchCompanySettingsFromSupabase,
} from '../lib/supabase';

interface DataContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeDocCategory: string;
  setActiveDocCategory: (cat: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  dateRange: { start: string; end: string };
  setDateRange: (range: { start: string; end: string }) => void;
  
  // Entities
  customers: Customer[];
  packages: Package[];
  hotels: Hotel[];
  bookings: Booking[];
  payments: Payment[];
  invoices: Invoice[];
  expenses: Expense[];
  salarySlips: SalarySlip[];
  staffReports: StaffReport[];
  dailyStaffReports: StaffReport[];
  notifications: NotificationItem[];
  bankAccounts: BankAccount[];
  bankTransfers: BankTransfer[];
  companySettings: CompanySettings;

  // Settings Actions
  updateCompanySettings: (settings: CompanySettings) => Promise<void>;
  uploadBrandingImage: (file: File, type: 'logo' | 'banner' | 'portal_logo' | 'portal_banner' | 'admin_avatar') => Promise<string>;
  
  // Actions
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'totalSpent' | 'totalBookings'>) => Customer;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;

  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'bookingNumber'>) => Booking;
  updateBooking: (booking: Booking) => void;
  deleteBooking: (id: string) => void;

  addPackage: (pkg: Omit<Package, 'id'>) => Package;
  updatePackage: (pkg: Package) => void;
  deletePackage: (id: string) => void;

  addHotel: (hotel: Omit<Hotel, 'id'>) => Hotel;
  updateHotel: (hotel: Hotel) => void;
  deleteHotel: (id: string) => void;

  addPayment: (payment: Omit<Payment, 'id' | 'receiptNumber'>) => Payment;
  deletePayment: (id: string) => void;

  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'> & { invoiceNumber?: string }) => Invoice;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  recordPaymentForInvoice: (
    invoiceId: string,
    amount: number,
    paymentMethod: PaymentMethod | string,
    referenceNumber?: string,
    notes?: string,
    bankAccountId?: string
  ) => Payment | null;
  generateServiceInvoicesForBooking: (bookingId: string) => Invoice[];

  addExpense: (expense: Omit<Expense, 'id' | 'expenseNumber'>) => Expense;
  deleteExpense: (id: string) => void;

  addSalarySlip: (slip: Omit<SalarySlip, 'id' | 'slipNumber' | 'totalAllowances' | 'totalDeductions' | 'netSalary'>) => SalarySlip;
  updateSalarySlip: (slip: SalarySlip) => void;
  deleteSalarySlip: (id: string) => void;

  addStaffReport: (report: Omit<StaffReport, 'id'>) => StaffReport;
  addDailyStaffReport: (report: Omit<StaffReport, 'id'>) => StaffReport;
  updateStaffReport: (report: StaffReport) => void;
  updateDailyStaffReport: (report: StaffReport) => void;
  deleteStaffReport: (id: string) => void;
  deleteDailyStaffReport: (id: string) => void;

  // Bank Account Actions
  addBankAccount: (account: Omit<BankAccount, 'id' | 'createdAt'>) => BankAccount;
  updateBankAccount: (account: BankAccount) => void;
  deleteBankAccount: (id: string) => void;
  addBankTransfer: (transfer: Omit<BankTransfer, 'id' | 'transferNumber'>) => BankTransfer;
  deleteBankTransfer: (id: string) => void;

  // Balance & Ledger Queries
  getBankAccountBalance: (accountId: string, beforeDate?: string) => number;
  getAccountTransactions: (
    accountId: string,
    startDate?: string,
    endDate?: string
  ) => {
    openingBalance: number;
    totalInflows: number;
    totalOutflows: number;
    closingBalance: number;
    transactions: BankTransaction[];
  };

  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'date' | 'read'>) => void;
  resetDemoData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeDocCategory, setActiveDocCategory] = useState<string>('Umrah Package Invoice');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

  // Auto-migrate if version mismatch
  const checkStoredData = <T,>(key: string, initialData: T[]): T[] => {
    const isV5 = localStorage.getItem('kmz_demo_version_v5');
    if (!isV5) {
      localStorage.setItem('kmz_demo_version_v5', 'true');
      localStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    }
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialData;
  };

  // Persistent storage wrappers
  const INITIAL_COMPANY_SETTINGS: CompanySettings = {
    companyName: 'KMZ Travels & Tours (Pvt) Ltd',
    ownerName: 'Toheed Asghar Shahid',
    address: 'P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad',
    whatsappNumber: '03018647596',
    phone: '03147861122',
    ntnNumber: 'NTN-7492018-9',
    dtsLicense: 'DTS/FSD/2024/9912',
    logoUrl: '',
    dashboardBannerUrl: '',
    customerPortalLogoUrl: '',
    customerPortalBannerUrl: '',
    superAdminAvatarUrl: '',
  };

  const [companySettings, setCompanySettingsState] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem('kmz_company_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_COMPANY_SETTINGS, ...parsed };
      } catch {}
    }
    return INITIAL_COMPANY_SETTINGS;
  });

  // Load permanent company settings from Database on app initialization
  useEffect(() => {
    let isMounted = true;
    const loadCompanySettingsFromDatabase = async () => {
      // 1. Try Supabase Database first
      try {
        const supabaseData = await fetchCompanySettingsFromSupabase();
        if (supabaseData && isMounted) {
          setCompanySettingsState(supabaseData);
          localStorage.setItem('kmz_company_settings', JSON.stringify(supabaseData));
          return;
        }
      } catch (err) {
        console.warn('Supabase DB load failed, trying server DB endpoint:', err);
      }

      // 2. Try Server API Database
      try {
        const res = await fetch('/api/company-settings');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.settings && isMounted) {
            setCompanySettingsState(data.settings);
            localStorage.setItem('kmz_company_settings', JSON.stringify(data.settings));
          }
        }
      } catch (err) {
        console.warn('Server API DB load failed:', err);
      }
    };

    loadCompanySettingsFromDatabase();
    return () => { isMounted = false; };
  }, []);

  // Save updated company settings permanently to Database
  const updateCompanySettings = async (newSettings: CompanySettings) => {
    setCompanySettingsState(newSettings);
    localStorage.setItem('kmz_company_settings', JSON.stringify(newSettings));

    // Save to Supabase Database
    try {
      await saveCompanySettingsToSupabase(newSettings);
    } catch (err) {
      console.warn('Failed saving to Supabase database:', err);
    }

    // Save to Server Database
    try {
      await fetch('/api/company-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
    } catch (err) {
      console.warn('Failed saving to server database:', err);
    }
  };

  // Upload branding image file to Supabase Storage (with server storage fallback)
  const uploadBrandingImage = async (
    file: File,
    type: 'logo' | 'banner' | 'portal_logo' | 'portal_banner' | 'admin_avatar'
  ): Promise<string> => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      throw new Error('Invalid file format. Please select a JPG, JPEG, PNG, or WebP photo.');
    }

    // Attempt Supabase Storage Upload first
    try {
      if (supabase) {
        const publicUrl = await uploadBrandingImageToSupabase(file, type);
        if (publicUrl) return publicUrl;
      }
    } catch (err) {
      console.warn('Supabase Storage upload warning, attempting server storage backend:', err);
    }

    // Fallback Server Storage Upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch('/api/upload-branding', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errRes = await response.json().catch(() => ({}));
      throw new Error(errRes.error || 'Failed to upload image file to server storage.');
    }

    const resData = await response.json();
    if (!resData.success || !resData.url) {
      throw new Error(resData.error || 'Invalid server storage upload response.');
    }

    return resData.url;
  };

  const [customers, setCustomers] = useState<Customer[]>(() => checkStoredData('kmz_customers', INITIAL_CUSTOMERS));
  const [packages, setPackages] = useState<Package[]>(() => checkStoredData('kmz_packages', INITIAL_PACKAGES));
  const [hotels, setHotels] = useState<Hotel[]>(() => checkStoredData('kmz_hotels', INITIAL_HOTELS));
  const [bookings, setBookings] = useState<Booking[]>(() => checkStoredData('kmz_bookings', INITIAL_BOOKINGS));
  const [payments, setPayments] = useState<Payment[]>(() => checkStoredData('kmz_payments', INITIAL_PAYMENTS));
  const [invoices, setInvoices] = useState<Invoice[]>(() => checkStoredData('kmz_invoices', INITIAL_INVOICES));
  const [expenses, setExpenses] = useState<Expense[]>(() => checkStoredData('kmz_expenses', INITIAL_EXPENSES));
  const [salarySlips, setSalarySlips] = useState<SalarySlip[]>(() => checkStoredData('kmz_salary_slips', INITIAL_SALARY_SLIPS));
  const [staffReports, setStaffReports] = useState<StaffReport[]>(() => checkStoredData('kmz_staff_reports', INITIAL_STAFF_REPORTS));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => checkStoredData('kmz_notifications', INITIAL_NOTIFICATIONS));
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => checkStoredData('kmz_bank_accounts', INITIAL_BANK_ACCOUNTS));
  const [bankTransfers, setBankTransfers] = useState<BankTransfer[]>(() => checkStoredData('kmz_bank_transfers', INITIAL_BANK_TRANSFERS));

  const resetDemoData = () => {
    setCustomers(INITIAL_CUSTOMERS);
    setPackages(INITIAL_PACKAGES);
    setHotels(INITIAL_HOTELS);
    setBookings(INITIAL_BOOKINGS);
    setPayments(INITIAL_PAYMENTS);
    setInvoices(INITIAL_INVOICES);
    setExpenses(INITIAL_EXPENSES);
    setSalarySlips(INITIAL_SALARY_SLIPS);
    setStaffReports(INITIAL_STAFF_REPORTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setBankAccounts(INITIAL_BANK_ACCOUNTS);
    setBankTransfers(INITIAL_BANK_TRANSFERS);

    localStorage.setItem('kmz_demo_version_v5', 'true');
    localStorage.setItem('kmz_customers', JSON.stringify(INITIAL_CUSTOMERS));
    localStorage.setItem('kmz_packages', JSON.stringify(INITIAL_PACKAGES));
    localStorage.setItem('kmz_hotels', JSON.stringify(INITIAL_HOTELS));
    localStorage.setItem('kmz_bookings', JSON.stringify(INITIAL_BOOKINGS));
    localStorage.setItem('kmz_payments', JSON.stringify(INITIAL_PAYMENTS));
    localStorage.setItem('kmz_invoices', JSON.stringify(INITIAL_INVOICES));
    localStorage.setItem('kmz_expenses', JSON.stringify(INITIAL_EXPENSES));
    localStorage.setItem('kmz_salary_slips', JSON.stringify(INITIAL_SALARY_SLIPS));
    localStorage.setItem('kmz_staff_reports', JSON.stringify(INITIAL_STAFF_REPORTS));
    localStorage.setItem('kmz_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem('kmz_bank_accounts', JSON.stringify(INITIAL_BANK_ACCOUNTS));
    localStorage.setItem('kmz_bank_transfers', JSON.stringify(INITIAL_BANK_TRANSFERS));
    // Note: Do NOT clear permanent branding images/settings on reset demo data
  };

  // LocalStorage sync
  useEffect(() => { localStorage.setItem('kmz_customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('kmz_packages', JSON.stringify(packages)); }, [packages]);
  useEffect(() => { localStorage.setItem('kmz_hotels', JSON.stringify(hotels)); }, [hotels]);
  useEffect(() => { localStorage.setItem('kmz_bookings', JSON.stringify(bookings)); }, [bookings]);
  useEffect(() => { localStorage.setItem('kmz_payments', JSON.stringify(payments)); }, [payments]);
  useEffect(() => { localStorage.setItem('kmz_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('kmz_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('kmz_salary_slips', JSON.stringify(salarySlips)); }, [salarySlips]);
  useEffect(() => { localStorage.setItem('kmz_staff_reports', JSON.stringify(staffReports)); }, [staffReports]);
  useEffect(() => { localStorage.setItem('kmz_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('kmz_bank_accounts', JSON.stringify(bankAccounts)); }, [bankAccounts]);
  useEffect(() => { localStorage.setItem('kmz_bank_transfers', JSON.stringify(bankTransfers)); }, [bankTransfers]);
  useEffect(() => { localStorage.setItem('kmz_company_settings', JSON.stringify(companySettings)); }, [companySettings]);
  useEffect(() => { localStorage.setItem('kmz_salary_slips', JSON.stringify(salarySlips)); }, [salarySlips]);
  useEffect(() => { localStorage.setItem('kmz_staff_reports', JSON.stringify(staffReports)); }, [staffReports]);
  useEffect(() => { localStorage.setItem('kmz_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('kmz_bank_accounts', JSON.stringify(bankAccounts)); }, [bankAccounts]);
  useEffect(() => { localStorage.setItem('kmz_bank_transfers', JSON.stringify(bankTransfers)); }, [bankTransfers]);

  // Actions
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'totalSpent' | 'totalBookings'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `c-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split('T')[0],
      totalSpent: 0,
      totalBookings: 0,
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    addNotification({
      title: 'New Customer Added',
      message: `Customer ${newCustomer.fullName} registered successfully.`,
      type: 'system',
      linkTab: 'customers',
    });
    return newCustomer;
  };

  const updateCustomer = (updated: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const addBooking = (bookingData: Omit<Booking, 'id' | 'createdAt' | 'bookingNumber'>) => {
    const bookingNumber = `KMZ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: Booking = {
      ...bookingData,
      id: `b-${Date.now()}`,
      bookingNumber,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Update customer stats
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === newBooking.customerId) {
          return {
            ...c,
            totalBookings: c.totalBookings + 1,
            totalSpent: c.totalSpent + newBooking.totalAmount,
          };
        }
        return c;
      })
    );

    // Auto-create initial invoice with hotel breakdown
    const hotelInvoiceItems = newBooking.hotels.map((h) => ({
      description: `Hotel Stay: ${h.city} - ${h.hotelName} (${h.roomType}, ${h.nights} Nights @ PKR ${(h.ratePerNight || 0).toLocaleString()}/night)`,
      qty: h.nights,
      unitPrice: h.ratePerNight || 0,
      total: h.totalRate || h.totalHotelCost || (h.nights * (h.ratePerNight || 0)),
    }));

    const newInvoiceItems = [
      {
        description: `${newBooking.packageName} (${newBooking.paxAdults} Adult${newBooking.paxAdults > 1 ? 's' : ''})`,
        qty: 1,
        unitPrice: newBooking.totalAmount,
        total: newBooking.totalAmount,
      },
      ...hotelInvoiceItems,
    ];

    addInvoice({
      invoiceType: 'Umrah Package Invoice',
      bookingId: newBooking.id,
      bookingNumber: newBooking.bookingNumber,
      customerId: newBooking.customerId,
      customerName: newBooking.customerName,
      customerPhone: newBooking.customerPhone,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: newBooking.departureDate,
      subtotal: newBooking.totalAmount,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: newBooking.totalAmount,
      paidAmount: newBooking.paidAmount,
      balanceDue: newBooking.balanceAmount,
      status: newBooking.paidAmount >= newBooking.totalAmount ? 'Paid' : newBooking.paidAmount > 0 ? 'Partially Paid' : 'Unpaid',
      items: newInvoiceItems,
    });

    addNotification({
      title: 'New Booking Created',
      message: `Booking #${bookingNumber} for ${newBooking.customerName} added.`,
      type: 'booking',
      linkTab: 'bookings',
      targetCustomerId: newBooking.customerId,
    });

    return newBooking;
  };

  const updateBooking = (updated: Booking) => {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));

    // Sync corresponding invoice if exists
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.bookingId === updated.id || inv.bookingNumber === updated.bookingNumber) {
          const hotelItemsList = updated.hotels.map((h) => ({
            description: `Hotel Stay: ${h.city} - ${h.hotelName} (${h.roomType}, ${h.nights} Nights @ PKR ${(h.ratePerNight || 0).toLocaleString()}/night)`,
            qty: h.nights,
            unitPrice: h.ratePerNight || 0,
            total: h.totalRate || h.totalHotelCost || (h.nights * (h.ratePerNight || 0)),
          }));

          const packageItem = {
            description: `${updated.packageName} (${updated.paxAdults} Adult${updated.paxAdults > 1 ? 's' : ''})`,
            qty: 1,
            unitPrice: updated.totalAmount,
            total: updated.totalAmount,
          };

          return {
            ...inv,
            customerName: updated.customerName,
            customerPhone: updated.customerPhone,
            subtotal: updated.totalAmount,
            totalAmount: updated.totalAmount,
            paidAmount: updated.paidAmount,
            balanceDue: updated.balanceAmount,
            status: updated.paidAmount >= updated.totalAmount ? 'Paid' : updated.paidAmount > 0 ? 'Partially Paid' : 'Unpaid',
            items: [packageItem, ...hotelItemsList],
          };
        }
        return inv;
      })
    );
  };

  const deleteBooking = (id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  const addPackage = (pkgData: Omit<Package, 'id'>) => {
    const newPkg: Package = { ...pkgData, id: `pkg-${Date.now()}` };
    setPackages((prev) => [newPkg, ...prev]);
    return newPkg;
  };

  const updatePackage = (pkg: Package) => {
    setPackages((prev) => prev.map((p) => (p.id === pkg.id ? pkg : p)));
  };

  const deletePackage = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  const addHotel = (hotelData: Omit<Hotel, 'id'>) => {
    const newHotel: Hotel = { ...hotelData, id: `h-${Date.now()}` };
    setHotels((prev) => [newHotel, ...prev]);
    return newHotel;
  };

  const updateHotel = (hotel: Hotel) => {
    setHotels((prev) => prev.map((h) => (h.id === hotel.id ? hotel : h)));
  };

  const deleteHotel = (id: string) => {
    setHotels((prev) => prev.filter((h) => h.id !== id));
  };

  const getNextReceiptNumber = (currentPayments: Payment[]) => {
    const prefix = 'REC-2026-';
    let maxSeq = 900;
    currentPayments.forEach((p) => {
      if (p.receiptNumber && p.receiptNumber.includes('REC-')) {
        const parts = p.receiptNumber.split('-');
        const lastPart = parts[parts.length - 1];
        const num = parseInt(lastPart, 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    });

    let candidateSeq = maxSeq + 1;
    let candidateNum = `${prefix}${candidateSeq}`;

    while (currentPayments.some((p) => p.receiptNumber === candidateNum)) {
      candidateSeq++;
      candidateNum = `${prefix}${candidateSeq}`;
    }

    return candidateNum;
  };

  const addPayment = (paymentData: Omit<Payment, 'id' | 'receiptNumber'> & { receiptNumber?: string }) => {
    let receiptNumber = paymentData.receiptNumber;
    if (!receiptNumber || payments.some((p) => p.receiptNumber === receiptNumber)) {
      receiptNumber = getNextReceiptNumber(payments);
    }

    // Find linked invoice if provided or find suitable invoice for bookingId
    let linkedInv = invoices.find(
      (i) =>
        (paymentData.invoiceId && i.id === paymentData.invoiceId) ||
        (paymentData.invoiceNumber && i.invoiceNumber === paymentData.invoiceNumber)
    );

    if (!linkedInv && paymentData.bookingId) {
      linkedInv =
        invoices.find((i) => i.bookingId === paymentData.bookingId && i.balanceDue > 0) ||
        invoices.find((i) => i.bookingId === paymentData.bookingId);
    }

    const calculatedBalanceRemaining = linkedInv
      ? Math.max(0, linkedInv.balanceDue - paymentData.amount)
      : undefined;

    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      receiptNumber,
      invoiceId: linkedInv?.id || paymentData.invoiceId,
      invoiceNumber: linkedInv?.invoiceNumber || paymentData.invoiceNumber,
      balanceRemaining: calculatedBalanceRemaining,
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Update corresponding booking balance
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === newPayment.bookingId) {
          const newPaid = b.paidAmount + newPayment.amount;
          const newBalance = Math.max(0, b.totalAmount - newPaid);
          const paymentStatus = newBalance === 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Unpaid';
          return {
            ...b,
            paidAmount: newPaid,
            balanceAmount: newBalance,
            paymentStatus,
          };
        }
        return b;
      })
    );

    // Update corresponding linked invoice
    if (linkedInv) {
      setInvoices((prev) =>
        prev.map((inv) => {
          if (inv.id === linkedInv!.id) {
            const newPaid = inv.paidAmount + newPayment.amount;
            const newBalance = Math.max(0, inv.totalAmount - newPaid);
            const status: 'Paid' | 'Partially Paid' | 'Unpaid' =
              newBalance === 0 ? 'Paid' : newPaid > 0 ? 'Partially Paid' : 'Unpaid';

            const newRec: InvoicePaymentRecord = {
              id: `iprec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              paymentId: newPayment.id,
              receiptNumber: newPayment.receiptNumber,
              date: newPayment.date,
              amount: newPayment.amount,
              paymentMethod: newPayment.paymentMethod,
              referenceNumber: newPayment.referenceNumber,
              notes: newPayment.notes,
              recordedBy: newPayment.recordedBy,
              balanceRemaining: newBalance,
            };

            return {
              ...inv,
              paidAmount: newPaid,
              balanceDue: newBalance,
              status,
              paymentHistory: [newRec, ...(inv.paymentHistory || [])],
            };
          }
          return inv;
        })
      );
    }

    // Update corresponding customer total spent
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === newPayment.customerId) {
          return {
            ...c,
            totalSpent: (c.totalSpent || 0) + newPayment.amount,
          };
        }
        return c;
      })
    );

    addNotification({
      title: 'Payment Receipt Issued',
      message: `Receipt #${receiptNumber} - PKR ${newPayment.amount.toLocaleString()} received for ${newPayment.customerName} via ${newPayment.paymentMethod}.`,
      type: 'payment',
      linkTab: 'payments',
      targetCustomerId: newPayment.customerId,
    });

    return newPayment;
  };

  const deletePayment = (id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  const getNextInvoiceNumber = (type: InvoiceType, currentInvoices: Invoice[]) => {
    let prefix = 'INV-2026-';
    if (type === 'Umrah Package Invoice') prefix = 'INV-UMR-';
    else if (type === 'Hotel Invoice') prefix = 'INV-HTL-';
    else if (type === 'Flight Invoice') prefix = 'INV-FLT-';
    else if (type === 'Visa Invoice') prefix = 'INV-VIS-';
    else if (type === 'Transport Invoice') prefix = 'INV-TRN-';
    else if (type === 'Extra Services Invoice') prefix = 'INV-EXT-';
    else if (type === 'Payment Receipt') prefix = 'REC-2026-';
    else if (type === 'Consolidated Total Invoice') prefix = 'INV-CON-';

    let maxSeq = 1000;
    currentInvoices.forEach((inv) => {
      if (inv.invoiceNumber && inv.invoiceNumber.startsWith(prefix)) {
        const parts = inv.invoiceNumber.replace(prefix, '');
        const num = parseInt(parts, 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    });

    let candidateSeq = maxSeq + 1;
    let candidateNum = `${prefix}${candidateSeq}`;

    while (currentInvoices.some((i) => i.invoiceNumber === candidateNum)) {
      candidateSeq++;
      candidateNum = `${prefix}${candidateSeq}`;
    }

    return candidateNum;
  };

  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'> & { invoiceNumber?: string }) => {
    const type = invoiceData.invoiceType || 'Umrah Package Invoice';
    let invoiceNumber = invoiceData.invoiceNumber;
    if (!invoiceNumber || invoices.some((i) => i.invoiceNumber === invoiceNumber)) {
      invoiceNumber = getNextInvoiceNumber(type, invoices);
    }

    const subtotal = invoiceData.subtotal ?? (invoiceData.items || []).reduce((s, i) => s + (i.total || 0), 0);
    const taxAmount = invoiceData.taxAmount || 0;
    const discountAmount = invoiceData.discountAmount || 0;
    const totalAmount = Math.max(0, subtotal + taxAmount - discountAmount);
    const paidAmount = invoiceData.paidAmount || 0;
    const balanceDue = Math.max(0, totalAmount - paidAmount);
    const status: 'Paid' | 'Partially Paid' | 'Unpaid' =
      balanceDue === 0 ? 'Paid' : paidAmount > 0 ? 'Partially Paid' : 'Unpaid';

    const newInv: Invoice = {
      ...invoiceData,
      id: `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      invoiceNumber,
      invoiceType: type,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      paidAmount,
      balanceDue,
      status,
      items: invoiceData.items || [],
      paymentHistory: invoiceData.paymentHistory || [],
      createdAt: new Date().toISOString(),
    };

    setInvoices((prev) => [newInv, ...prev]);
    return newInv;
  };

  const updateInvoice = (updated: Invoice) => {
    const subtotal = (updated.items || []).reduce((s, i) => s + (i.total || 0), 0);
    const totalAmount = Math.max(0, subtotal + (updated.taxAmount || 0) - (updated.discountAmount || 0));
    const balanceDue = Math.max(0, totalAmount - (updated.paidAmount || 0));
    const status: 'Paid' | 'Partially Paid' | 'Unpaid' =
      balanceDue === 0 ? 'Paid' : updated.paidAmount > 0 ? 'Partially Paid' : 'Unpaid';

    const finalInvoice: Invoice = {
      ...updated,
      subtotal,
      totalAmount,
      balanceDue,
      status,
    };

    setInvoices((prev) => prev.map((i) => (i.id === finalInvoice.id ? finalInvoice : i)));
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  };

  const recordPaymentForInvoice = (
    invoiceId: string,
    amount: number,
    paymentMethod: PaymentMethod | string,
    referenceNumber?: string,
    notes?: string,
    bankAccountId?: string
  ) => {
    const targetInvoice = invoices.find((i) => i.id === invoiceId || i.invoiceNumber === invoiceId);
    if (!targetInvoice) return null;

    const dateStr = new Date().toISOString().split('T')[0];

    return addPayment({
      bookingId: targetInvoice.bookingId,
      bookingNumber: targetInvoice.bookingNumber,
      invoiceId: targetInvoice.id,
      invoiceNumber: targetInvoice.invoiceNumber,
      customerId: targetInvoice.customerId,
      customerName: targetInvoice.customerName,
      amount,
      paymentMethod: paymentMethod as PaymentMethod,
      referenceNumber: referenceNumber || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      bankAccountId,
      date: dateStr,
      status: 'Completed',
      notes: notes || `Payment recorded for ${targetInvoice.invoiceType} #${targetInvoice.invoiceNumber}`,
      recordedBy: 'Accounts Specialist',
    });
  };

  const generateServiceInvoicesForBooking = (bookingId: string) => {
    const b = bookings.find((bk) => bk.id === bookingId || bk.bookingNumber === bookingId);
    if (!b) return [];

    const existingForBooking = invoices.filter((i) => i.bookingId === b.id);
    const newGeneratedInvoices: Invoice[] = [];

    // 1. Umrah Package Invoice
    if (!existingForBooking.some((i) => i.invoiceType === 'Umrah Package Invoice')) {
      const umrahInv = addInvoice({
        invoiceType: 'Umrah Package Invoice',
        bookingId: b.id,
        bookingNumber: b.bookingNumber,
        customerId: b.customerId,
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: b.departureDate || new Date().toISOString().split('T')[0],
        subtotal: Math.round(b.totalAmount * 0.4),
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: Math.round(b.totalAmount * 0.4),
        paidAmount: Math.min(b.paidAmount, Math.round(b.totalAmount * 0.4)),
        balanceDue: Math.max(0, Math.round(b.totalAmount * 0.4) - b.paidAmount),
        status: b.paidAmount >= b.totalAmount * 0.4 ? 'Paid' : b.paidAmount > 0 ? 'Partially Paid' : 'Unpaid',
        items: [
          {
            description: `${b.packageName} (${b.paxAdults} Adult(s), ${b.paxChildren} Child(ren), ${b.paxInfants} Infant(s))`,
            qty: b.paxAdults + b.paxChildren,
            unitPrice: Math.round((b.totalAmount * 0.4) / Math.max(1, b.paxAdults + b.paxChildren)),
            total: Math.round(b.totalAmount * 0.4),
            serviceCategory: 'Package',
          },
        ],
        notes: 'Includes package stay, ground assistance, and group leader coordination.',
      });
      newGeneratedInvoices.push(umrahInv);
    }

    // 2. Hotel Invoice
    if (b.hotels && b.hotels.length > 0 && !existingForBooking.some((i) => i.invoiceType === 'Hotel Invoice')) {
      const hotelItems = b.hotels.map((h) => ({
        description: `${h.hotelName} (${h.city}) - ${h.roomType} Room, ${h.nights} Night(s)`,
        qty: h.nights,
        unitPrice: h.ratePerNight,
        total: h.totalRate,
        serviceCategory: 'Hotel' as const,
      }));
      const hotelTotal = hotelItems.reduce((sum, item) => sum + item.total, 0);

      const hotelInv = addInvoice({
        invoiceType: 'Hotel Invoice',
        bookingId: b.id,
        bookingNumber: b.bookingNumber,
        customerId: b.customerId,
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: b.departureDate || new Date().toISOString().split('T')[0],
        subtotal: hotelTotal,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: hotelTotal,
        paidAmount: 0,
        balanceDue: hotelTotal,
        status: 'Unpaid',
        items: hotelItems,
        notes: 'Hotel accommodations reserved with Haram proximity.',
      });
      newGeneratedInvoices.push(hotelInv);
    }

    // 3. Flight Invoice
    if (b.flight && b.flight.ticketPrice > 0 && !existingForBooking.some((i) => i.invoiceType === 'Flight Invoice')) {
      const fltInv = addInvoice({
        invoiceType: 'Flight Invoice',
        bookingId: b.id,
        bookingNumber: b.bookingNumber,
        customerId: b.customerId,
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: b.departureDate || new Date().toISOString().split('T')[0],
        subtotal: b.flight.ticketPrice,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: b.flight.ticketPrice,
        paidAmount: 0,
        balanceDue: b.flight.ticketPrice,
        status: 'Unpaid',
        items: [
          {
            description: `${b.flight.airline} (${b.flight.flightNumber}) - PNR: ${b.flight.pnr} (${b.flight.departureAirport} -> ${b.flight.arrivalAirport})`,
            qty: b.paxAdults + b.paxChildren,
            unitPrice: Math.round(b.flight.ticketPrice / Math.max(1, b.paxAdults + b.paxChildren)),
            total: b.flight.ticketPrice,
            serviceCategory: 'Flight',
          },
        ],
        notes: 'Flight tickets confirmed with baggage allowance.',
      });
      newGeneratedInvoices.push(fltInv);
    }

    // 4. Visa Invoice
    if (b.visa && b.visa.fee > 0 && !existingForBooking.some((i) => i.invoiceType === 'Visa Invoice')) {
      const visaInv = addInvoice({
        invoiceType: 'Visa Invoice',
        bookingId: b.id,
        bookingNumber: b.bookingNumber,
        customerId: b.customerId,
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: b.departureDate || new Date().toISOString().split('T')[0],
        subtotal: b.visa.fee,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: b.visa.fee,
        paidAmount: 0,
        balanceDue: b.visa.fee,
        status: 'Unpaid',
        items: [
          {
            description: `${b.visa.visaType} Processing & Nusuk Fee (${b.visa.nusukId || 'Processing'})`,
            qty: b.paxAdults + b.paxChildren,
            unitPrice: Math.round(b.visa.fee / Math.max(1, b.paxAdults + b.paxChildren)),
            total: b.visa.fee,
            serviceCategory: 'Visa',
          },
        ],
        notes: 'Saudi Ministry of Hajj & Umrah official visa issuing charges.',
      });
      newGeneratedInvoices.push(visaInv);
    }

    // 5. Transport Invoice
    if (b.transport && !existingForBooking.some((i) => i.invoiceType === 'Transport Invoice')) {
      const trnInv = addInvoice({
        invoiceType: 'Transport Invoice',
        bookingId: b.id,
        bookingNumber: b.bookingNumber,
        customerId: b.customerId,
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: b.departureDate || new Date().toISOString().split('T')[0],
        subtotal: 75000,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: 75000,
        paidAmount: 0,
        balanceDue: 75000,
        status: 'Unpaid',
        items: [
          {
            description: `${b.transport.transportType} Transfer - ${b.transport.route}`,
            qty: 1,
            unitPrice: 75000,
            total: 75000,
            serviceCategory: 'Transport',
          },
        ],
        notes: 'Ground transportation with dedicated driver.',
      });
      newGeneratedInvoices.push(trnInv);
    }

    // 6. Consolidated Total Invoice
    if (!existingForBooking.some((i) => i.invoiceType === 'Consolidated Total Invoice')) {
      const allBookingInvoices = [...invoices.filter((i) => i.bookingId === b.id), ...newGeneratedInvoices];
      const childNumbers = allBookingInvoices.map((i) => i.invoiceNumber);

      const totalSub = allBookingInvoices.reduce((s, i) => s + i.totalAmount, 0);
      const totalPaid = allBookingInvoices.reduce((s, i) => s + i.paidAmount, 0);
      const netBalance = Math.max(0, totalSub - totalPaid);

      const conInv = addInvoice({
        invoiceType: 'Consolidated Total Invoice',
        bookingId: b.id,
        bookingNumber: b.bookingNumber,
        customerId: b.customerId,
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: b.departureDate || new Date().toISOString().split('T')[0],
        subtotal: totalSub,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: totalSub,
        paidAmount: totalPaid,
        balanceDue: netBalance,
        status: netBalance === 0 ? 'Paid' : totalPaid > 0 ? 'Partially Paid' : 'Unpaid',
        items: [
          {
            description: `Consolidated Total Invoice combining all services for Booking #${b.bookingNumber}`,
            qty: 1,
            unitPrice: totalSub,
            total: totalSub,
          },
        ],
        consolidatedInvoices: childNumbers,
        notes: `Master Consolidated Invoice summarizing ${childNumbers.length} service invoices for ${b.customerName}.`,
      });
      newGeneratedInvoices.push(conInv);
    }

    return newGeneratedInvoices;
  };

  const addExpense = (expenseData: Omit<Expense, 'id' | 'expenseNumber'>) => {
    const expenseNumber = `EXP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newExp: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      expenseNumber,
    };
    setExpenses((prev) => [newExp, ...prev]);
    return newExp;
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const calculateSalaryTotals = (slip: any) => {
    const houseRent = slip.houseRent ?? slip.allowances?.houseRent ?? 0;
    const medical = slip.medicalAllowance ?? slip.allowances?.medical ?? 0;
    const transport = slip.transportAllowance ?? slip.allowances?.conveyance ?? 0;
    const bonus = slip.bonus ?? slip.allowances?.bonus ?? 0;
    const otherAllow = slip.otherAllowance ?? slip.allowances?.other ?? 0;
    const extraAllowances = (slip.allowances?.mobile || 0) + (slip.allowances?.hajjUmrahDuty || 0);

    const totalAllowances = houseRent + medical + transport + bonus + otherAllow + extraAllowances;

    const tax = slip.tax ?? slip.deductions?.tax ?? 0;
    const absence = slip.absenceDeduction ?? slip.deductions?.absenceDeduction ?? 0;
    const loan = slip.loanDeduction ?? slip.deductions?.loanDeduction ?? slip.deductions?.advanceSalary ?? 0;
    const otherDeduct = slip.otherDeduction ?? slip.deductions?.other ?? 0;
    const extraDeductions = slip.deductions?.providentFund || 0;

    const totalDeductions = tax + absence + loan + otherDeduct + extraDeductions;

    const netSalary = Math.max(0, (slip.basicSalary || 0) + totalAllowances - totalDeductions);

    return { totalAllowances, totalDeductions, netSalary };
  };

  const addSalarySlip = (slipData: any) => {
    const totals = calculateSalaryTotals(slipData);
    const slipNumber = slipData.slipNumber || `SAL-${slipData.year || new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newSlip: SalarySlip = {
      ...slipData,
      id: `sal-${Date.now()}`,
      slipNumber,
      houseRent: slipData.houseRent ?? slipData.allowances?.houseRent ?? 0,
      medicalAllowance: slipData.medicalAllowance ?? slipData.allowances?.medical ?? 0,
      transportAllowance: slipData.transportAllowance ?? slipData.allowances?.conveyance ?? 0,
      bonus: slipData.bonus ?? slipData.allowances?.bonus ?? 0,
      otherAllowance: slipData.otherAllowance ?? slipData.allowances?.other ?? 0,
      tax: slipData.tax ?? slipData.deductions?.tax ?? 0,
      absenceDeduction: slipData.absenceDeduction ?? slipData.deductions?.absenceDeduction ?? 0,
      loanDeduction: slipData.loanDeduction ?? slipData.deductions?.loanDeduction ?? slipData.deductions?.advanceSalary ?? 0,
      otherDeduction: slipData.otherDeduction ?? slipData.deductions?.other ?? 0,
      totalAllowances: totals.totalAllowances,
      totalDeductions: totals.totalDeductions,
      netSalary: totals.netSalary,
      status: slipData.status || (slipData.paymentStatus === 'Paid' ? 'Paid' : 'Issued'),
      createdAt: slipData.createdAt || new Date().toISOString().split('T')[0],
    };

    setSalarySlips((prev) => [newSlip, ...prev]);

    // Also record an expense if marked paid
    if (newSlip.status === 'Paid' || newSlip.paymentStatus === 'Paid') {
      addExpense({
        category: 'Staff Salary',
        title: `Salary Payout - ${newSlip.employeeName} (${newSlip.month} ${newSlip.year})`,
        amount: newSlip.netSalary,
        paymentMethod: (newSlip.paymentMethod as any) || 'Bank Transfer',
        date: newSlip.paymentDate || new Date().toISOString().split('T')[0],
        status: 'Paid',
        notes: `Auto-linked salary slip #${newSlip.slipNumber}`,
        recordedBy: 'System / Accounts',
      });
    }

    return newSlip;
  };

  const updateSalarySlip = (updatedSlip: SalarySlip) => {
    const totals = calculateSalaryTotals(updatedSlip);
    const slipWithTotals: SalarySlip = {
      ...updatedSlip,
      totalAllowances: totals.totalAllowances,
      totalDeductions: totals.totalDeductions,
      netSalary: totals.netSalary,
      status: updatedSlip.status || (updatedSlip.paymentStatus === 'Paid' ? 'Paid' : 'Issued'),
    };
    setSalarySlips((prev) => prev.map((s) => (s.id === updatedSlip.id ? slipWithTotals : s)));
  };

  const deleteSalarySlip = (id: string) => {
    setSalarySlips((prev) => prev.filter((s) => s.id !== id));
  };

  const addStaffReport = (reportData: Omit<StaffReport, 'id'>) => {
    const newRep: StaffReport = { ...reportData, id: `rep-${Date.now()}` };
    setStaffReports((prev) => [newRep, ...prev]);
    return newRep;
  };

  const updateStaffReport = (report: StaffReport) => {
    setStaffReports((prev) => prev.map((r) => (r.id === report.id ? report : r)));
  };

  const deleteStaffReport = (id: string) => {
    setStaffReports((prev) => prev.filter((r) => r.id !== id));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addNotification = (notif: Omit<NotificationItem, 'id' | 'date' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Bank Account Actions & Queries
  const addBankAccount = (accountData: Omit<BankAccount, 'id' | 'createdAt'>) => {
    const newAccount: BankAccount = {
      ...accountData,
      id: `bank-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setBankAccounts((prev) => [newAccount, ...prev]);
    addNotification({
      title: 'New Bank Account Created',
      message: `${newAccount.bankName} (${newAccount.accountNumber}) added successfully.`,
      type: 'system',
      linkTab: 'bank-accounts',
    });
    return newAccount;
  };

  const updateBankAccount = (updatedAccount: BankAccount) => {
    setBankAccounts((prev) => prev.map((a) => (a.id === updatedAccount.id ? updatedAccount : a)));
  };

  const deleteBankAccount = (id: string) => {
    setBankAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const addBankTransfer = (transferData: Omit<BankTransfer, 'id' | 'transferNumber'>) => {
    const transferNumber = `TRF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newTransfer: BankTransfer = {
      ...transferData,
      id: `trf-${Date.now()}`,
      transferNumber,
    };
    setBankTransfers((prev) => [newTransfer, ...prev]);
    addNotification({
      title: 'Fund Transfer Recorded',
      message: `Transfer #${transferNumber}: PKR ${newTransfer.amount.toLocaleString()} from ${newTransfer.fromAccountName} to ${newTransfer.toAccountName}.`,
      type: 'payment',
      linkTab: 'bank-accounts',
    });
    return newTransfer;
  };

  const deleteBankTransfer = (id: string) => {
    setBankTransfers((prev) => prev.filter((t) => t.id !== id));
  };

  const getBankAccountBalance = (accountId: string, beforeDate?: string): number => {
    const account = bankAccounts.find((a) => a.id === accountId);
    if (!account) return 0;

    let balance = account.openingBalance;

    payments.forEach((p) => {
      if (p.status === 'Completed' && p.bankAccountId === accountId) {
        if (!beforeDate || p.date <= beforeDate) {
          balance += p.amount;
        }
      }
    });

    bankTransfers.forEach((t) => {
      if (t.toAccountId === accountId) {
        if (!beforeDate || t.date <= beforeDate) {
          balance += t.amount;
        }
      }
    });

    expenses.forEach((e) => {
      if (e.status === 'Paid' && e.bankAccountId === accountId) {
        if (!beforeDate || e.date <= beforeDate) {
          balance -= e.amount;
        }
      }
    });

    salarySlips.forEach((s) => {
      if (s.paymentStatus === 'Paid' && s.bankAccountId === accountId) {
        const sDate = s.paymentDate || `${s.year}-08-01`;
        if (!beforeDate || sDate <= beforeDate) {
          balance -= s.netSalary;
        }
      }
    });

    bankTransfers.forEach((t) => {
      if (t.fromAccountId === accountId) {
        if (!beforeDate || t.date <= beforeDate) {
          balance -= t.amount;
        }
      }
    });

    return balance;
  };

  const getAccountTransactions = (
    accountId: string,
    startDate?: string,
    endDate?: string
  ) => {
    const account = bankAccounts.find((a) => a.id === accountId);
    if (!account) {
      return { openingBalance: 0, totalInflows: 0, totalOutflows: 0, closingBalance: 0, transactions: [] };
    }

    const getPreviousDay = (dateStr: string) => {
      const d = new Date(dateStr);
      d.setDate(d.getDate() - 1);
      return d.toISOString().split('T')[0];
    };

    const effectiveOpeningBalance = startDate
      ? getBankAccountBalance(accountId, getPreviousDay(startDate))
      : account.openingBalance;

    const rawTxList: Omit<BankTransaction, 'runningBalance'>[] = [];

    payments.forEach((p) => {
      if (p.status === 'Completed' && p.bankAccountId === accountId) {
        if ((!startDate || p.date >= startDate) && (!endDate || p.date <= endDate)) {
          rawTxList.push({
            id: `tx-pay-${p.id}`,
            bankAccountId: accountId,
            date: p.date,
            type: 'Receipt',
            referenceNo: p.receiptNumber,
            narration: `Customer Receipt: ${p.customerName} (${p.bookingNumber}) - ${p.paymentMethod}`,
            debit: p.amount,
            credit: 0,
          });
        }
      }
    });

    bankTransfers.forEach((t) => {
      if (t.toAccountId === accountId) {
        if ((!startDate || t.date >= startDate) && (!endDate || t.date <= endDate)) {
          rawTxList.push({
            id: `tx-trf-in-${t.id}`,
            bankAccountId: accountId,
            date: t.date,
            type: 'Transfer In',
            referenceNo: t.transferNumber,
            narration: `Transfer IN from ${t.fromAccountName}${t.description ? ` (${t.description})` : ''}`,
            debit: t.amount,
            credit: 0,
          });
        }
      }
    });

    expenses.forEach((e) => {
      if (e.status === 'Paid' && e.bankAccountId === accountId) {
        if ((!startDate || e.date >= startDate) && (!endDate || e.date <= endDate)) {
          rawTxList.push({
            id: `tx-exp-${e.id}`,
            bankAccountId: accountId,
            date: e.date,
            type: 'Expense',
            referenceNo: e.expenseNumber,
            narration: `Expense: ${e.title} (${e.category})${e.vendorName ? ` - Payee: ${e.vendorName}` : ''}`,
            debit: 0,
            credit: e.amount,
          });
        }
      }
    });

    salarySlips.forEach((s) => {
      if (s.paymentStatus === 'Paid' && s.bankAccountId === accountId) {
        const sDate = s.paymentDate || `${s.year}-08-01`;
        if ((!startDate || sDate >= startDate) && (!endDate || sDate <= endDate)) {
          rawTxList.push({
            id: `tx-sal-${s.id}`,
            bankAccountId: accountId,
            date: sDate,
            type: 'Salary',
            referenceNo: s.slipNumber,
            narration: `Payroll Salary: ${s.employeeName} (${s.month} ${s.year})`,
            debit: 0,
            credit: s.netSalary,
          });
        }
      }
    });

    bankTransfers.forEach((t) => {
      if (t.fromAccountId === accountId) {
        if ((!startDate || t.date >= startDate) && (!endDate || t.date <= endDate)) {
          rawTxList.push({
            id: `tx-trf-out-${t.id}`,
            bankAccountId: accountId,
            date: t.date,
            type: 'Transfer Out',
            referenceNo: t.transferNumber,
            narration: `Transfer OUT to ${t.toAccountName}${t.description ? ` (${t.description})` : ''}`,
            debit: 0,
            credit: t.amount,
          });
        }
      }
    });

    rawTxList.sort((a, b) => a.date.localeCompare(b.date));

    let running = effectiveOpeningBalance;
    let totalInflows = 0;
    let totalOutflows = 0;

    const transactions: BankTransaction[] = rawTxList.map((tx) => {
      totalInflows += tx.debit;
      totalOutflows += tx.credit;
      running = running + tx.debit - tx.credit;
      return {
        ...tx,
        runningBalance: running,
      };
    });

    return {
      openingBalance: effectiveOpeningBalance,
      totalInflows,
      totalOutflows,
      closingBalance: running,
      transactions,
    };
  };

  return (
    <DataContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeDocCategory,
        setActiveDocCategory,
        searchTerm,
        setSearchTerm,
        dateRange,
        setDateRange,
        customers,
        packages,
        hotels,
        bookings,
        payments,
        invoices,
        expenses,
        salarySlips,
        staffReports,
        dailyStaffReports: staffReports,
        notifications,
        bankAccounts,
        bankTransfers,
        companySettings,
        updateCompanySettings,
        uploadBrandingImage,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addBooking,
        updateBooking,
        deleteBooking,
        addPackage,
        updatePackage,
        deletePackage,
        addHotel,
        updateHotel,
        deleteHotel,
        addPayment,
        deletePayment,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        recordPaymentForInvoice,
        generateServiceInvoicesForBooking,
        addExpense,
        deleteExpense,
        addSalarySlip,
        updateSalarySlip,
        deleteSalarySlip,
        addStaffReport,
        addDailyStaffReport: addStaffReport,
        updateStaffReport,
        updateDailyStaffReport: updateStaffReport,
        deleteStaffReport,
        deleteDailyStaffReport: deleteStaffReport,
        addBankAccount,
        updateBankAccount,
        deleteBankAccount,
        addBankTransfer,
        deleteBankTransfer,
        getBankAccountBalance,
        getAccountTransactions,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        resetDemoData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
