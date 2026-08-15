import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  CreditCard,
  Building,
  Plane,
  FileCheck2,
  Ticket,
  ClipboardList,
  Search,
  Filter,
  Printer,
  Download,
  ArrowUpRight,
  PieChart as PieIcon,
  Receipt,
  Landmark,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck2,
  Send,
  Sparkles,
  RefreshCw,
  FileText,
  Phone,
  PackageCheck,
  ChevronDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { GroupLeaderReports } from './GroupLeaderReports';
import { DailyStaffReports } from './DailyStaffReports';
import { GoldBadge } from '../common/GoldBadge';
import { openWhatsApp } from '../../utils/whatsapp';
import { downloadExecutiveReportPDF } from '../../utils/executiveReportPdf';

type ReportTab =
  | 'pnl'
  | 'sales'
  | 'customers'
  | 'payments'
  | 'channels'
  | 'expenses'
  | 'packages'
  | 'flights-hotels'
  | 'visas'
  | 'vouchers'
  | 'staff'
  | 'receivables'
  | 'manifest'
  | 'daily-staff';

export const ReportsView: React.FC = () => {
  const {
    bookings,
    customers,
    payments,
    expenses,
    salarySlips,
    packages,
    hotels,
    companySettings,
    dailyStaffReports: rawDailyStaffReports,
  } = useData();
  const { users = [] } = useAuth();
  const dailyStaffReports = useMemo(() => rawDailyStaffReports || [], [rawDailyStaffReports]);

  const [activeReport, setActiveReport] = useState<ReportTab>('pnl');

  // Filters
  const [datePreset, setDatePreset] = useState<'all' | 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('all');
  const [selectedPackage, setSelectedPackage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  // Determine active date range based on preset or custom inputs
  const resolvedDateRange = useMemo(() => {
    if (datePreset === 'custom') {
      return { start: startDate, end: endDate };
    }
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (datePreset === 'today') {
      return { start: todayStr, end: todayStr };
    }
    if (datePreset === 'week') {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return { start: d.toISOString().split('T')[0], end: todayStr };
    }
    if (datePreset === 'month') {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: d.toISOString().split('T')[0], end: todayStr };
    }
    if (datePreset === 'quarter') {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      const d = new Date(now.getFullYear(), qMonth, 1);
      return { start: d.toISOString().split('T')[0], end: todayStr };
    }
    if (datePreset === 'year') {
      const d = new Date(now.getFullYear(), 0, 1);
      return { start: d.toISOString().split('T')[0], end: todayStr };
    }
    return { start: '', end: '' };
  }, [datePreset, startDate, endDate]);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Date filter
      const bDate = b.createdAt || b.departureDate;
      if (resolvedDateRange.start && bDate < resolvedDateRange.start) return false;
      if (resolvedDateRange.end && bDate > resolvedDateRange.end) return false;

      // Customer filter
      if (selectedCustomer !== 'all' && b.customerId !== selectedCustomer) return false;

      // Package filter
      if (selectedPackage !== 'all' && b.packageId !== selectedPackage && b.packageName !== selectedPackage) return false;

      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          b.bookingNumber.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.packageName.toLowerCase().includes(q) ||
          b.customerPhone.includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [bookings, resolvedDateRange, selectedCustomer, selectedPackage, searchQuery]);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (resolvedDateRange.start && p.date < resolvedDateRange.start) return false;
      if (resolvedDateRange.end && p.date > resolvedDateRange.end) return false;

      if (selectedCustomer !== 'all' && p.customerId !== selectedCustomer) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          p.receiptNumber.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q) ||
          p.bookingNumber.toLowerCase().includes(q) ||
          p.paymentMethod.toLowerCase().includes(q) ||
          (p.referenceNumber && p.referenceNumber.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [payments, resolvedDateRange, selectedCustomer, searchQuery]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (resolvedDateRange.start && e.date < resolvedDateRange.start) return false;
      if (resolvedDateRange.end && e.date > resolvedDateRange.end) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          e.expenseNumber.toLowerCase().includes(q) ||
          e.title.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          (e.vendorName && e.vendorName.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [expenses, resolvedDateRange, searchQuery]);

  // Filtered Salary Slips
  const filteredSalarySlips = useMemo(() => {
    return salarySlips.filter((s) => {
      const sDate = s.paymentDate || s.createdAt || '2026-08-01';
      if (resolvedDateRange.start && sDate < resolvedDateRange.start) return false;
      if (resolvedDateRange.end && sDate > resolvedDateRange.end) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          s.slipNumber.toLowerCase().includes(q) ||
          s.employeeName.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [salarySlips, resolvedDateRange, searchQuery]);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (selectedCustomer !== 'all' && c.id !== selectedCustomer) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          c.fullName.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.passportNumber.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [customers, selectedCustomer, searchQuery]);

  // Fallback function for popup printing if iframe window.print is blocked in sandboxed containers
  const openPrintWindow = () => {
    const reportElem = document.getElementById('printable-report');
    if (!reportElem) {
      window.print();
      return;
    }

    const printWin = window.open('', '_blank', 'width=1000,height=800');
    if (!printWin) {
      window.print();
      return;
    }

    const stylesHtml = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((s) => s.outerHTML)
      .join('\n');

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Executive Report - KMZ Travels & Tours</title>
          ${stylesHtml}
          <style>
            @page { size: A4 portrait; margin: 8mm; }
            body { background: #ffffff !important; color: #000000 !important; font-family: sans-serif; padding: 12px; }
            .no-print { display: none !important; }
            #printable-report-header { display: block !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .bg-zinc-950, .bg-zinc-900, .bg-zinc-900\\/90, .bg-zinc-900\\/80, .bg-zinc-800, .bg-zinc-800\\/50 {
              background-color: #ffffff !important; color: #000000 !important; border-color: #e4e4e7 !important; box-shadow: none !important;
            }
            .text-white, .text-zinc-100, .text-zinc-200, .text-zinc-300, .text-zinc-400 { color: #18181b !important; }
            .text-amber-300, .text-amber-400, .text-amber-500 { color: #b45309 !important; }
            .text-emerald-400, .text-emerald-500 { color: #15803d !important; }
            .text-rose-400, .text-rose-500 { color: #b91c1c !important; }
            .border-zinc-800, .border-zinc-700, .border-amber-500\\/20 { border-color: #e4e4e7 !important; }
            table { width: 100% !important; border-collapse: collapse !important; }
            th, td { border: 1px solid #e4e4e7 !important; padding: 6px 8px !important; color: #000000 !important; }
            th { background-color: #f4f4f5 !important; font-weight: 700 !important; }
            tr { page-break-inside: avoid !important; }
          </style>
        </head>
        <body>
          <div id="printable-report">
            ${reportElem.innerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
              }, 250);
            };
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  // Executive Reports Print Handler
  const handlePrint = () => {
    try {
      window.focus();
    } catch {
      // Ignore focus errors
    }

    setTimeout(() => {
      try {
        window.print();
      } catch (err) {
        console.warn('Direct window.print() failed, launching fallback print window:', err);
        openPrintWindow();
      }
    }, 100);
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (activeReport === 'sales' || activeReport === 'pnl') {
      headers = ['Booking Ref', 'Customer Name', 'Phone', 'Package Name', 'Package Type', 'Departure', 'Return', 'Total Amount', 'Paid Amount', 'Balance', 'Status'];
      rows = filteredBookings.map((b) => [
        b.bookingNumber,
        b.customerName,
        b.customerPhone,
        b.packageName,
        b.packageType,
        b.departureDate,
        b.returnDate,
        b.totalAmount,
        b.paidAmount,
        b.balanceAmount,
        b.bookingStatus,
      ]);
    } else if (activeReport === 'payments' || activeReport === 'channels') {
      headers = ['Receipt #', 'Booking #', 'Customer Name', 'Method', 'Amount', 'Date', 'Status', 'Reference'];
      rows = filteredPayments.map((p) => [
        p.receiptNumber,
        p.bookingNumber,
        p.customerName,
        p.paymentMethod,
        p.amount,
        p.date,
        p.status,
        p.referenceNumber || p.transactionId || '',
      ]);
    } else if (activeReport === 'expenses') {
      headers = ['Expense #', 'Category', 'Title', 'Vendor', 'Method', 'Amount', 'Date', 'Status'];
      rows = filteredExpenses.map((e) => [
        e.expenseNumber,
        e.category,
        e.title,
        e.vendorName || '',
        e.paymentMethod,
        e.amount,
        e.date,
        e.status,
      ]);
    } else {
      headers = ['Booking Ref', 'Customer Name', 'Phone', 'Package', 'Total Amount', 'Paid', 'Balance', 'Status'];
      rows = filteredBookings.map((b) => [
        b.bookingNumber,
        b.customerName,
        b.customerPhone,
        b.packageName,
        b.totalAmount,
        b.paidAmount,
        b.balanceAmount,
        b.bookingStatus,
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KMZ_Travels_Report_${activeReport}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dynamic Financial Calculations for P&L and Metrics
  const grossSalesVolume = filteredBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalPaymentsCollected = filteredPayments.reduce((sum, p) => sum + (p.status === 'Completed' ? p.amount : 0), 0);
  const totalReceivableBalance = filteredBookings.reduce((sum, b) => sum + b.balanceAmount, 0);

  // Direct Cost of Sales Breakdown
  const totalHotelsCost = filteredBookings.reduce(
    (sum, b) => sum + b.hotels.reduce((hSum, h) => hSum + (h.totalRate || h.totalHotelCost || h.nights * h.ratePerNight || 0), 0),
    0
  );
  const totalFlightsCost = filteredBookings.reduce((sum, b) => sum + (b.flight?.ticketPrice || 0) * b.paxAdults, 0);
  const totalVisasCost = filteredBookings.reduce((sum, b) => sum + (b.visa?.fee || 0) * (b.paxAdults + b.paxChildren), 0);
  const directCostOfSales = totalHotelsCost + totalFlightsCost + totalVisasCost;

  const grossProfit = grossSalesVolume - directCostOfSales;

  // Operating & HR Expenses
  const totalCompanyExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPayrollExpenses = filteredSalarySlips.reduce((sum, s) => sum + (s.status === 'Paid' ? s.netSalary : 0), 0);
  const totalOperatingAndAdminExpenses = totalCompanyExpenses + totalPayrollExpenses;

  const netOperatingProfit = grossProfit - totalOperatingAndAdminExpenses;
  const netProfitMarginPercent = grossSalesVolume > 0 ? (netOperatingProfit / grossSalesVolume) * 100 : 0;

  // Dynamic Chart Data Preparation: Monthly Sales & Profit Trend from actual database records
  const monthlyData = useMemo(() => {
    const monthMap: { [key: string]: { month: string; sales: number; expenses: number; profit: number; sortKey: string } } = {};

    filteredBookings.forEach((b) => {
      const rawDate = b.createdAt || b.departureDate;
      if (!rawDate) return;
      const yearMonth = rawDate.substring(0, 7);
      const d = new Date(rawDate);
      const monthLabel = !isNaN(d.getTime())
        ? d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : yearMonth;

      if (!monthMap[yearMonth]) {
        monthMap[yearMonth] = { month: monthLabel, sales: 0, expenses: 0, profit: 0, sortKey: yearMonth };
      }
      monthMap[yearMonth].sales += b.totalAmount || 0;
    });

    filteredExpenses.forEach((e) => {
      const rawDate = e.date || e.createdAt;
      if (!rawDate) return;
      const yearMonth = rawDate.substring(0, 7);
      const d = new Date(rawDate);
      const monthLabel = !isNaN(d.getTime())
        ? d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : yearMonth;

      if (!monthMap[yearMonth]) {
        monthMap[yearMonth] = { month: monthLabel, sales: 0, expenses: 0, profit: 0, sortKey: yearMonth };
      }
      monthMap[yearMonth].expenses += e.amount || 0;
    });

    filteredSalarySlips.forEach((s) => {
      if (s.status !== 'Paid') return;
      const rawDate = s.paymentDate || s.createdAt;
      if (!rawDate) return;
      const yearMonth = rawDate.substring(0, 7);
      const d = new Date(rawDate);
      const monthLabel = !isNaN(d.getTime())
        ? d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : yearMonth;

      if (!monthMap[yearMonth]) {
        monthMap[yearMonth] = { month: monthLabel, sales: 0, expenses: 0, profit: 0, sortKey: yearMonth };
      }
      monthMap[yearMonth].expenses += s.netSalary || 0;
    });

    const sorted = Object.values(monthMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    sorted.forEach((item) => {
      item.profit = item.sales - item.expenses;
    });

    return sorted;
  }, [filteredBookings, filteredExpenses, filteredSalarySlips]);

  // Dynamic Payment Channels Breakdown from actual completed payments
  const channelData = useMemo(() => {
    const counts: { [key: string]: number } = {
      'Bank Transfer': 0,
      'Cash': 0,
      'JazzCash': 0,
      'EasyPaisa': 0,
      'Other Cards': 0,
    };

    filteredPayments.forEach((p) => {
      const method = p.paymentMethod;
      if (method === 'Cash') counts['Cash'] += p.amount;
      else if (method === 'Bank Transfer') counts['Bank Transfer'] += p.amount;
      else if (method === 'JazzCash') counts['JazzCash'] += p.amount;
      else if (method === 'EasyPaisa') counts['EasyPaisa'] += p.amount;
      else counts['Other Cards'] += p.amount;
    });

    return [
      { name: 'Bank Transfer', value: counts['Bank Transfer'], color: '#3b82f6' },
      { name: 'Cash', value: counts['Cash'], color: '#f59e0b' },
      { name: 'JazzCash', value: counts['JazzCash'], color: '#ef4444' },
      { name: 'EasyPaisa', value: counts['EasyPaisa'], color: '#10b981' },
      { name: 'Other Cards', value: counts['Other Cards'], color: '#8b5cf6' },
    ].filter((item) => item.value > 0);
  }, [filteredPayments]);

  // Dynamic Package-wise Summary from actual database records
  const packageSummaries = useMemo(() => {
    const map: { [key: string]: { id: string; title: string; type: string; bookingsCount: number; totalSales: number; totalPaid: number; totalBalance: number } } = {};

    packages.forEach((pkg) => {
      map[pkg.id] = {
        id: pkg.id,
        title: pkg.title,
        type: pkg.type,
        bookingsCount: 0,
        totalSales: 0,
        totalPaid: 0,
        totalBalance: 0,
      };
    });

    filteredBookings.forEach((b) => {
      const pkgKey = b.packageId && map[b.packageId] ? b.packageId : (b.packageName || 'Custom Package');
      if (!map[pkgKey]) {
        map[pkgKey] = {
          id: pkgKey,
          title: b.packageName || 'Custom Umrah Package',
          type: b.packageType || 'Umrah',
          bookingsCount: 0,
          totalSales: 0,
          totalPaid: 0,
          totalBalance: 0,
        };
      }
      map[pkgKey].bookingsCount += 1;
      map[pkgKey].totalSales += b.totalAmount || 0;
      map[pkgKey].totalPaid += b.paidAmount || 0;
      map[pkgKey].totalBalance += b.balanceAmount || 0;
    });

    return Object.values(map).filter((p) => p.bookingsCount > 0 || packages.some((pkg) => pkg.id === p.id));
  }, [packages, filteredBookings]);

  // Dynamic Staff-wise Summary from actual users, staff reports & bookings
  const staffSummaries = useMemo(() => {
    const map: { [key: string]: { name: string; role: string; inquiries: number; bookingsCount: number; totalSales: number; paymentsCollected: number } } = {};

    (users || []).forEach((u) => {
      if (u.role === 'customer') return;
      map[u.name] = {
        name: u.name,
        role: u.role === 'super_admin' ? 'Executive Director' : 'Tour Consultant',
        inquiries: 0,
        bookingsCount: 0,
        totalSales: 0,
        paymentsCollected: 0,
      };
    });

    (dailyStaffReports || []).forEach((r) => {
      if (!map[r.staffName]) {
        map[r.staffName] = {
          name: r.staffName,
          role: 'Staff Consultant',
          inquiries: 0,
          bookingsCount: 0,
          totalSales: 0,
          paymentsCollected: 0,
        };
      }
      map[r.staffName].inquiries += r.newInquiriesCount || 0;
      map[r.staffName].bookingsCount += r.bookingsCreatedCount || 0;
      map[r.staffName].paymentsCollected += r.paymentsCollectedTotal || 0;
    });

    filteredBookings.forEach((b) => {
      if (b.groupLeaderName) {
        if (!map[b.groupLeaderName]) {
          map[b.groupLeaderName] = {
            name: b.groupLeaderName,
            role: 'Group Leader / Consultant',
            inquiries: 0,
            bookingsCount: 0,
            totalSales: 0,
            paymentsCollected: 0,
          };
        }
        map[b.groupLeaderName].bookingsCount += 1;
        map[b.groupLeaderName].totalSales += b.totalAmount || 0;
        map[b.groupLeaderName].paymentsCollected += b.paidAmount || 0;
      }
    });

    return Object.values(map);
  }, [users, dailyStaffReports, filteredBookings]);

  const reportTabs: { id: ReportTab; label: string; icon: any; count?: number }[] = [
    { id: 'pnl', label: 'Profit & Loss Statement', icon: TrendingUp },
    { id: 'sales', label: 'Sales & Booking Reports', icon: BarChart3, count: filteredBookings.length },
    { id: 'customers', label: 'Customer Reports', icon: Users, count: filteredCustomers.length },
    { id: 'payments', label: 'Payment & Recovery', icon: CreditCard, count: filteredPayments.length },
    { id: 'channels', label: 'Cash, Bank, JazzCash & EasyPaisa', icon: Wallet },
    { id: 'expenses', label: 'Expense Reports', icon: Receipt, count: filteredExpenses.length },
    { id: 'packages', label: 'Umrah & Hajj Packages', icon: PackageCheck, count: packages.length },
    { id: 'flights-hotels', label: 'Flight & Hotel Reports', icon: Building },
    { id: 'visas', label: 'Visa Processing Reports', icon: FileCheck2 },
    { id: 'vouchers', label: 'Service Vouchers Reports', icon: Ticket },
    { id: 'staff', label: 'Staff Performance Reports', icon: ClipboardList, count: dailyStaffReports.length },
    { id: 'receivables', label: 'Outstanding & Receivables', icon: AlertTriangle, count: filteredBookings.filter((b) => b.balanceAmount > 0).length },
    { id: 'manifest', label: 'Group Leader Manifest', icon: UserCheck2 },
    { id: 'daily-staff', label: 'Daily Staff Submissions', icon: Send },
  ];

  // Direct A4 Executive Report PDF Download Handler
  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPdf(true);
      setPdfSuccess(false);

      const activeTabLabel = reportTabs.find((t) => t.id === activeReport)?.label || 'Executive Report';
      const dateRangeText =
        datePreset === 'all'
          ? 'All Time History'
          : datePreset === 'custom'
          ? `${startDate || 'Start'} to ${endDate || 'End'}`
          : datePreset.toUpperCase();
      const customerFilterText =
        selectedCustomer === 'all'
          ? 'All Customers'
          : customers.find((c) => c.id === selectedCustomer)?.fullName || selectedCustomer;
      const packageFilterText =
        selectedPackage === 'all'
          ? 'All Packages'
          : packages.find((p) => p.id === selectedPackage)?.title || selectedPackage;
      const searchFilterText = searchQuery ? `"${searchQuery}"` : 'All Records';

      // Slight yield for UI state update
      await new Promise((resolve) => setTimeout(resolve, 50));

      downloadExecutiveReportPDF({
        reportTab: activeReport,
        reportTabLabel: activeTabLabel,
        dateRangeText,
        customerFilterText,
        packageFilterText,
        searchFilterText,
        companySettings,
        financials: {
          grossSalesVolume,
          totalPaymentsCollected,
          totalReceivableBalance,
          totalHotelsCost,
          totalFlightsCost,
          totalVisasCost,
          directCostOfSales,
          grossProfit,
          totalCompanyExpenses,
          totalPayrollExpenses,
          totalOperatingAndAdminExpenses,
          netOperatingProfit,
          netProfitMarginPercent,
        },
        filteredBookings,
        filteredPayments,
        filteredExpenses,
        filteredCustomers,
        filteredSalarySlips,
        packages,
        hotels,
        monthlyData,
        channelData,
        packageSummaries,
        staffSummaries,
      });

      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to download executive report PDF:', err);
      alert('Unable to generate Executive Report PDF. Please check your browser popup/download settings.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Header (Screen Only) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20 shadow-2xl backdrop-blur-md no-print">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-serif font-bold text-xs uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            KMZ Intelligence Hub
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-amber-400" />
            Executive Reports & Financial Intelligence
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-3xl">
            Real-time automated analytics, Profit & Loss audit, revenue breakdown, payment channel ledgers, and operational performance metrics.
          </p>
        </div>

        {/* Quick Action Tools */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto no-print">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-800 text-zinc-100 hover:text-white hover:bg-zinc-700 border border-zinc-700 text-xs font-bold transition-all shadow-md no-print"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV / Excel</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 transition-all no-print cursor-pointer active:scale-95"
            title="Download formatted A4 Executive Report PDF"
          >
            {isGeneratingPdf ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                <span>Generating PDF...</span>
              </>
            ) : pdfSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-zinc-950" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-zinc-950" />
                <span>Download PDF</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-800 text-zinc-100 hover:text-white hover:bg-zinc-700 border border-zinc-700 text-xs font-bold transition-all shadow-md no-print cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Global Filter Bar (Screen Only) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4 shadow-xl no-print">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wide">
            <Filter className="w-4 h-4 text-amber-400" /> Date, Customer & Package Filters
          </div>
          <button
            onClick={() => {
              setDatePreset('all');
              setStartDate('');
              setEndDate('');
              setSelectedCustomer('all');
              setSelectedPackage('all');
              setSearchQuery('');
            }}
            className="text-[11px] font-semibold text-zinc-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* 1. Date Range Preset */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
              Date Period
            </label>
            <select
              value={datePreset}
              onChange={(e: any) => setDatePreset(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-zinc-100 font-medium focus:outline-none focus:border-amber-400"
            >
              <option value="all">All Time History</option>
              <option value="today">Today</option>
              <option value="week">Past 7 Days</option>
              <option value="month">This Month (August)</option>
              <option value="quarter">This Quarter (Q3 2026)</option>
              <option value="year">This Year (2026)</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* 2. Custom Start / End Dates */}
          {datePreset === 'custom' ? (
            <>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </>
          ) : null}

          {/* 3. Customer Wise Filter */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
              Customer Wise Filter
            </label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-zinc-100 font-medium focus:outline-none focus:border-amber-400"
            >
              <option value="all">All Customers ({customers.length})</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.city || 'Pakistan'})
                </option>
              ))}
            </select>
          </div>

          {/* 4. Package Wise Filter */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
              Package Wise Filter
            </label>
            <select
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-zinc-100 font-medium focus:outline-none focus:border-amber-400"
            >
              <option value="all">All Packages ({packages.length})</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.title} ({pkg.type})
                </option>
              ))}
            </select>
          </div>

          {/* 5. Live Search Filter */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
              Search Keywords
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search report data..."
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Nav Tabs for 12+ Reports (Screen Only) */}
      <div className="overflow-x-auto pb-2 custom-scrollbar no-print">
        <div className="flex items-center gap-2 min-w-max">
          {reportTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeReport === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveReport(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 shadow-lg shadow-amber-500/20 scale-[1.02]'
                    : 'bg-zinc-900/90 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-950' : 'text-amber-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-amber-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Printable Report Root Container */}
      <div id="printable-report" className="space-y-6">
        {/* Printable Header - hidden on screen, visible on print */}
        <div id="printable-report-header" className="hidden print:block p-6 bg-white text-zinc-950 border-b-2 border-zinc-900 space-y-4 rounded-xl">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black font-serif uppercase tracking-tight text-zinc-950">KMZ TRAVELS & TOURS (PVT) LTD</h1>
              <p className="text-xs font-bold text-zinc-800">Owner: Toheed Asghar Shahid | License # 8821 / Hajj & Umrah</p>
              <p className="text-[11px] text-zinc-600">Address: P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad, Punjab, Pakistan</p>
              <p className="text-[11px] text-zinc-600">WhatsApp: 03018647596 | Contact: 03147861122</p>
            </div>
            <div className="text-right text-xs">
              <div className="inline-block px-3 py-1 bg-amber-100 border border-amber-400 rounded text-amber-900 font-bold text-xs uppercase mb-1">
                Official Executive Audit Report
              </div>
              <p className="text-[11px] font-semibold text-zinc-700">
                Date Generated: {new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs font-bold text-amber-800 mt-1 uppercase">
                Section: {reportTabs.find((t) => t.id === activeReport)?.label}
              </p>
            </div>
          </div>

          {/* Active Filter Parameters Summary */}
          <div className="p-3 bg-zinc-100 rounded-lg border border-zinc-300 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div>
              <span className="font-bold text-zinc-700 block">Date Period:</span>
              <span className="font-semibold text-zinc-950">
                {datePreset === 'all'
                  ? 'All Time History'
                  : datePreset === 'custom'
                  ? `${startDate || 'Start'} to ${endDate || 'End'}`
                  : datePreset.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="font-bold text-zinc-700 block">Customer Filter:</span>
              <span className="font-semibold text-zinc-950">
                {selectedCustomer === 'all'
                  ? 'All Customers'
                  : customers.find((c) => c.id === selectedCustomer)?.fullName || selectedCustomer}
              </span>
            </div>
            <div>
              <span className="font-bold text-zinc-700 block">Package Filter:</span>
              <span className="font-semibold text-zinc-950">
                {selectedPackage === 'all'
                  ? 'All Packages'
                  : packages.find((p) => p.id === selectedPackage)?.title || selectedPackage}
              </span>
            </div>
            <div>
              <span className="font-bold text-zinc-700 block">Search Filter:</span>
              <span className="font-semibold text-zinc-950">{searchQuery ? `"${searchQuery}"` : 'All Records'}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Content Views based on activeReport */}
        <div id="printable-report-body" className="space-y-6">
        {/* ------------------------------------------------------------- */}
        {/* 1. PROFIT & LOSS STATEMENT (P&L) / EXECUTIVE AUDIT REPORT */}
        {/* ------------------------------------------------------------- */}
        {activeReport === 'pnl' && (
          <div className="space-y-6">
            {/* Global No Data Found Alert when filtered dataset is genuinely 0 */}
            {filteredBookings.length === 0 && filteredPayments.length === 0 && filteredExpenses.length === 0 ? (
              <div className="p-10 text-center rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-2xl my-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold font-serif text-white">No Audit Records Found</h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    There are no bookings, payments, or expenses matching your selected date period or filter criteria.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setDatePreset('all');
                    setStartDate('');
                    setEndDate('');
                    setSelectedCustomer('all');
                    setSelectedPackage('all');
                    setSearchQuery('');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs inline-flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset All Filters & View Full History</span>
                </button>
              </div>
            ) : null}

            {/* KPI Executive Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2 shadow-xl">
                <div className="flex items-center justify-between text-xs text-zinc-400 uppercase font-semibold">
                  <span>Gross Sales Volume</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black font-mono text-white">
                  PKR {grossSalesVolume.toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-400 font-medium flex items-center justify-between">
                  <span>{filteredBookings.length} Bookings Total</span>
                  <span className="text-zinc-400">{filteredCustomers.length} Customers</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2 shadow-xl">
                <div className="flex items-center justify-between text-xs text-zinc-400 uppercase font-semibold">
                  <span>Received Payments</span>
                  <Wallet className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black font-mono text-emerald-400">
                  PKR {totalPaymentsCollected.toLocaleString()}
                </div>
                <div className="text-[11px] text-zinc-400 font-medium">
                  Collected in Bank & Cash
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2 shadow-xl">
                <div className="flex items-center justify-between text-xs text-zinc-400 uppercase font-semibold">
                  <span>Pending Balance Due</span>
                  <CreditCard className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black font-mono text-amber-400">
                  PKR {totalReceivableBalance.toLocaleString()}
                </div>
                <div className="text-[11px] text-amber-400/80 font-medium">
                  Outstanding Receivables
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 space-y-2 shadow-xl">
                <div className="flex items-center justify-between text-xs text-amber-300 uppercase font-bold">
                  <span>Net Operating Profit</span>
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black font-mono text-amber-300">
                  PKR {netOperatingProfit.toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-400 font-bold">
                  Profit Margin: {netProfitMarginPercent.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Direct Cost vs Operating Cost breakdown row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-zinc-400 uppercase">Direct Cost of Sales (Hotels, Flights, Visas)</div>
                  <div className="text-lg font-bold font-mono text-rose-400">PKR {directCostOfSales.toLocaleString()}</div>
                </div>
                <Building className="w-6 h-6 text-rose-400/50" />
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-zinc-400 uppercase">Operating Expenses & Payroll</div>
                  <div className="text-lg font-bold font-mono text-amber-300">PKR {totalOperatingAndAdminExpenses.toLocaleString()}</div>
                </div>
                <Receipt className="w-6 h-6 text-amber-400/50" />
              </div>
            </div>

            {/* P&L Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart 1: Monthly Trend */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-4 shadow-2xl">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  Monthly Revenue, Cost & Profit Comparison
                </h3>
                {monthlyData.length > 0 ? (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="month" stroke="#71717a" fontSize={11} />
                        <YAxis stroke="#71717a" fontSize={11} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#09090b', borderColor: '#d97706', borderRadius: '12px', fontSize: '12px' }}
                          formatter={(val: any) => `PKR ${Number(val).toLocaleString()}`}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Area type="monotone" dataKey="sales" name="Gross Sales" stroke="#10b981" fillOpacity={1} fill="url(#colorSales)" />
                        <Area type="monotone" dataKey="expenses" name="Direct Costs" stroke="#ef4444" fillOpacity={1} fill="url(#colorCost)" />
                        <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#f59e0b" fillOpacity={1} fill="url(#colorProfit)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-zinc-500 text-xs gap-2 border border-dashed border-zinc-800 rounded-xl">
                    <BarChart3 className="w-8 h-8 text-zinc-600" />
                    <span>No monthly revenue history recorded yet</span>
                  </div>
                )}
              </div>

              {/* Chart 2: Payment Channels */}
              <div className="p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-4 shadow-2xl">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PieIcon className="w-5 h-5 text-amber-400" />
                  Payment Channels Distribution
                </h3>
                {channelData.length > 0 ? (
                  <div className="h-72 w-full flex flex-col items-center justify-center">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={channelData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {channelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#09090b', borderColor: '#d97706', borderRadius: '12px', fontSize: '12px' }}
                          formatter={(val: any) => `PKR ${Number(val).toLocaleString()}`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 text-[10px] w-full pt-2 border-t border-zinc-800">
                      {channelData.map((c) => (
                        <div key={c.name} className="flex items-center gap-1.5 text-zinc-300">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                          <span className="truncate">{c.name}:</span>
                          <span className="font-mono font-bold text-white">PKR {(c.value / 1000).toFixed(0)}k</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-zinc-500 text-xs gap-2 border border-dashed border-zinc-800 rounded-xl">
                    <PieIcon className="w-8 h-8 text-zinc-600" />
                    <span>No payment collections recorded</span>
                  </div>
                )}
              </div>
            </div>

            {/* Package-Wise Summary Table */}
            <div className="p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-amber-400" />
                  Package-Wise Revenue & Performance Summary
                </h3>
                <span className="text-xs font-mono text-zinc-400">{packageSummaries.length} Packages</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase font-semibold border-b border-zinc-800">
                    <tr>
                      <th className="p-3">Package Title</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-center">Bookings</th>
                      <th className="p-3 text-right">Total Revenue</th>
                      <th className="p-3 text-right">Received</th>
                      <th className="p-3 text-right">Balance Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {packageSummaries.length > 0 ? (
                      packageSummaries.map((pkg) => (
                        <tr key={pkg.id} className="hover:bg-zinc-800/40">
                          <td className="p-3 font-bold text-white">{pkg.title}</td>
                          <td className="p-3">
                            <GoldBadge variant={pkg.type === 'Hajj' ? 'amber' : 'emerald'}>
                              {pkg.type}
                            </GoldBadge>
                          </td>
                          <td className="p-3 text-center font-bold font-mono text-amber-300">
                            {pkg.bookingsCount}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-white">
                            PKR {pkg.totalSales.toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-400">
                            PKR {pkg.totalPaid.toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-amber-400">
                            PKR {pkg.totalBalance.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-zinc-500 text-xs">
                          No package bookings available for the selected range
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Staff-Wise Performance Summary Table */}
            <div className="p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck2 className="w-5 h-5 text-amber-400" />
                  Staff-Wise Sales & Operations Performance Summary
                </h3>
                <span className="text-xs font-mono text-zinc-400">{staffSummaries.length} Staff Members</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase font-semibold border-b border-zinc-800">
                    <tr>
                      <th className="p-3">Staff Name</th>
                      <th className="p-3">System Role</th>
                      <th className="p-3 text-center">Inquiries</th>
                      <th className="p-3 text-center">Bookings</th>
                      <th className="p-3 text-right">Revenue Volume</th>
                      <th className="p-3 text-right">Payments Collected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {staffSummaries.length > 0 ? (
                      staffSummaries.map((staff) => (
                        <tr key={staff.name} className="hover:bg-zinc-800/40">
                          <td className="p-3 font-bold text-white flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-300 text-xs">
                              {staff.name.charAt(0)}
                            </div>
                            <span>{staff.name}</span>
                          </td>
                          <td className="p-3 text-zinc-400">{staff.role}</td>
                          <td className="p-3 text-center font-bold font-mono text-zinc-300">
                            {staff.inquiries}
                          </td>
                          <td className="p-3 text-center font-bold font-mono text-amber-300">
                            {staff.bookingsCount}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-white">
                            PKR {staff.totalSales.toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-400">
                            PKR {staff.paymentsCollected.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-zinc-500 text-xs">
                          No staff report records available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Itemized P&L Statement Table */}
            <div className="p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                Audited Income Statement & Profit Breakdown
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <tbody className="divide-y divide-zinc-800">
                    {/* Revenue Category */}
                    <tr className="bg-zinc-950/80 font-bold text-amber-400">
                      <td colSpan={2} className="p-3 text-sm">1. REVENUE & GROSS INCOME</td>
                      <td className="p-3 text-right text-sm">PKR {grossSalesVolume.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="p-3 pl-8">Package Bookings & Direct Pilgrim Sales ({filteredBookings.length} Bookings)</td>
                      <td className="p-3 text-zinc-400 font-mono text-[11px]">{filteredBookings.length} Active Sales</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-400">PKR {grossSalesVolume.toLocaleString()}</td>
                    </tr>

                    {/* Direct Expenses Category */}
                    <tr className="bg-zinc-950/80 font-bold text-rose-400">
                      <td colSpan={2} className="p-3 text-sm">2. DIRECT COST OF SALES (SUPPLIERS & VENDORS)</td>
                      <td className="p-3 text-right text-sm">PKR ({directCostOfSales.toLocaleString()})</td>
                    </tr>
                    <tr>
                      <td className="p-3 pl-8">Makkah & Madina Hotel Accommodations Cost</td>
                      <td className="p-3 text-zinc-400 font-mono text-[11px]">Direct Hotel Rate</td>
                      <td className="p-3 text-right font-mono text-rose-400">PKR ({totalHotelsCost.toLocaleString()})</td>
                    </tr>
                    <tr>
                      <td className="p-3 pl-8">Airline Flight Tickets Cost</td>
                      <td className="p-3 text-zinc-400 font-mono text-[11px]">Carrier Fare</td>
                      <td className="p-3 text-right font-mono text-rose-400">PKR ({totalFlightsCost.toLocaleString()})</td>
                    </tr>
                    <tr>
                      <td className="p-3 pl-8">Saudi MOFA & Nusuk E-Visa Fees</td>
                      <td className="p-3 text-zinc-400 font-mono text-[11px]">Government Visa Fee</td>
                      <td className="p-3 text-right font-mono text-rose-400">PKR ({totalVisasCost.toLocaleString()})</td>
                    </tr>

                    {/* Gross Profit Summary */}
                    <tr className="bg-amber-500/10 font-bold text-amber-300 border-y-2 border-amber-500/30">
                      <td colSpan={2} className="p-3 text-sm">GROSS OPERATING PROFIT</td>
                      <td className="p-3 text-right text-sm font-black font-mono">PKR {grossProfit.toLocaleString()}</td>
                    </tr>

                    {/* Operating Expenses */}
                    <tr className="bg-zinc-950/80 font-bold text-amber-400">
                      <td colSpan={2} className="p-3 text-sm">3. OPERATING & HR EXPENSES</td>
                      <td className="p-3 text-right text-sm">PKR ({totalOperatingAndAdminExpenses.toLocaleString()})</td>
                    </tr>
                    <tr>
                      <td className="p-3 pl-8">Company Operating Expenses (Rent, Utilities, Marketing, Transport)</td>
                      <td className="p-3 text-zinc-400 font-mono text-[11px]">{filteredExpenses.length} Expense Slips</td>
                      <td className="p-3 text-right font-mono text-rose-400">PKR ({totalCompanyExpenses.toLocaleString()})</td>
                    </tr>
                    <tr>
                      <td className="p-3 pl-8">Staff Salary & HR Payroll Disbursements</td>
                      <td className="p-3 text-zinc-400 font-mono text-[11px]">{filteredSalarySlips.length} Employees Paid</td>
                      <td className="p-3 text-right font-mono text-rose-400">PKR ({totalPayrollExpenses.toLocaleString()})</td>
                    </tr>

                    {/* Net Operating Profit */}
                    <tr className="bg-emerald-500/20 font-black text-emerald-300 text-base border-t-2 border-emerald-500">
                      <td colSpan={2} className="p-4">NET OPERATING PROFIT / LOSS</td>
                      <td className="p-4 text-right font-mono">PKR {netOperatingProfit.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 2. SALES / BOOKING REPORTS */}
        {/* ------------------------------------------------------------- */}
        {activeReport === 'sales' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Total Bookings</span>
                <div className="text-2xl font-bold text-white font-mono">{filteredBookings.length} Bookings</div>
                <div className="text-[11px] text-amber-400">Filtered sales volume</div>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Total Gross Revenue</span>
                <div className="text-2xl font-bold text-amber-300 font-mono">PKR {grossSalesVolume.toLocaleString()}</div>
                <div className="text-[11px] text-emerald-400">Average: PKR {filteredBookings.length > 0 ? Math.round(grossSalesVolume / filteredBookings.length).toLocaleString() : 0}</div>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Payments Collected</span>
                <div className="text-2xl font-bold text-emerald-400 font-mono">PKR {totalPaymentsCollected.toLocaleString()}</div>
                <div className="text-[11px] text-zinc-400">Received to date</div>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Outstanding Balances</span>
                <div className="text-2xl font-bold text-rose-400 font-mono">PKR {totalReceivableBalance.toLocaleString()}</div>
                <div className="text-[11px] text-rose-300">Pending recovery</div>
              </div>
            </div>

            {/* Table */}
            <div className="p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-400" />
                Detailed Sales & Booking Transactions List
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase font-semibold border-b border-zinc-800">
                    <tr>
                      <th className="p-3">Booking #</th>
                      <th className="p-3">Customer Name</th>
                      <th className="p-3">Package Title</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Pax</th>
                      <th className="p-3">Total Amount</th>
                      <th className="p-3">Paid Amount</th>
                      <th className="p-3">Balance</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-zinc-800/40">
                        <td className="p-3 font-mono font-bold text-amber-300">{b.bookingNumber}</td>
                        <td className="p-3 font-bold text-white">{b.customerName}</td>
                        <td className="p-3">{b.packageName}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono text-[10px]">
                            {b.packageType}
                          </span>
                        </td>
                        <td className="p-3 font-semibold">{b.paxAdults} A {b.paxChildren > 0 ? `, ${b.paxChildren} C` : ''}</td>
                        <td className="p-3 font-mono font-bold text-amber-300">PKR {b.totalAmount.toLocaleString()}</td>
                        <td className="p-3 font-mono text-emerald-400">PKR {b.paidAmount.toLocaleString()}</td>
                        <td className="p-3 font-mono text-rose-400">PKR {b.balanceAmount.toLocaleString()}</td>
                        <td className="p-3">
                          <GoldBadge variant={b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Completed' ? 'emerald' : b.bookingStatus === 'Cancelled' ? 'rose' : 'amber'}>
                            {b.bookingStatus}
                          </GoldBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 3. CUSTOMER REPORTS */}
        {/* ------------------------------------------------------------- */}
        {activeReport === 'customers' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Total Registered Customers</span>
                <div className="text-2xl font-bold text-white font-mono">{filteredCustomers.length} Customers</div>
                <div className="text-[11px] text-amber-400">Database CRM Records</div>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Repeat & VIP Pilgrims</span>
                <div className="text-2xl font-bold text-emerald-400 font-mono">
                  {filteredCustomers.filter((c) => c.customerType === 'Repeat' || c.customerType === 'VIP').length} Repeat/VIP
                </div>
                <div className="text-[11px] text-emerald-300">High loyalty customers</div>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Total Cumulative Spend</span>
                <div className="text-2xl font-bold text-amber-300 font-mono">
                  PKR {filteredCustomers.reduce((sum, c) => sum + (c.totalSpent || 0), 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-zinc-400">All customer bookings</div>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Average Spend / Customer</span>
                <div className="text-2xl font-bold text-white font-mono">
                  PKR {filteredCustomers.length > 0 ? Math.round(filteredCustomers.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / filteredCustomers.length).toLocaleString() : 0}
                </div>
                <div className="text-[11px] text-amber-400">Customer Lifetime Value</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                Customer Directory & Booking History Summary
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase font-semibold border-b border-zinc-800">
                    <tr>
                      <th className="p-3">Customer Name</th>
                      <th className="p-3">Phone & WhatsApp</th>
                      <th className="p-3">Passport #</th>
                      <th className="p-3">City</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Total Bookings</th>
                      <th className="p-3">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {filteredCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-zinc-800/40">
                        <td className="p-3 font-bold text-white">{c.fullName}</td>
                        <td className="p-3 font-mono text-amber-300">{c.phone}</td>
                        <td className="p-3 font-mono text-zinc-400">{c.passportNumber}</td>
                        <td className="p-3">{c.city || 'Pakistan'}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-semibold text-[10px]">
                            {c.customerType}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-center">{c.totalBookings || 1}</td>
                        <td className="p-3 font-mono font-bold text-emerald-400">PKR {(c.totalSpent || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 4. PAYMENT & RECOVERY REPORTS */}
        {/* ------------------------------------------------------------- */}
        {activeReport === 'payments' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Total Collections</span>
                <div className="text-2xl font-bold text-emerald-400 font-mono">PKR {totalPaymentsCollected.toLocaleString()}</div>
                <div className="text-[11px] text-zinc-400">{filteredPayments.length} receipts issued</div>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Total Pending Recovery</span>
                <div className="text-2xl font-bold text-rose-400 font-mono">PKR {totalReceivableBalance.toLocaleString()}</div>
                <div className="text-[11px] text-rose-300">Remaining balances</div>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Recovery Rate %</span>
                <div className="text-2xl font-bold text-amber-300 font-mono">
                  {grossSalesVolume > 0 ? ((totalPaymentsCollected / grossSalesVolume) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-[11px] text-amber-400">Collected vs Total Sales</div>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Completed Receipts</span>
                <div className="text-2xl font-bold text-white font-mono">
                  {filteredPayments.filter((p) => p.status === 'Completed').length} Completed
                </div>
                <div className="text-[11px] text-emerald-400">Verified deposits</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                Payment Collection & Deposit Receipts Log
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase font-semibold border-b border-zinc-800">
                    <tr>
                      <th className="p-3">Receipt #</th>
                      <th className="p-3">Customer Name</th>
                      <th className="p-3">Booking Ref</th>
                      <th className="p-3">Payment Channel</th>
                      <th className="p-3">Ref / Transaction ID</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-zinc-800/40">
                        <td className="p-3 font-mono font-bold text-amber-300">{p.receiptNumber}</td>
                        <td className="p-3 font-bold text-white">{p.customerName}</td>
                        <td className="p-3 font-mono text-zinc-400">{p.bookingNumber}</td>
                        <td className="p-3 font-semibold text-amber-400">{p.paymentMethod}</td>
                        <td className="p-3 font-mono text-[11px] text-zinc-400">{p.referenceNumber || p.transactionId || 'CASH-REF'}</td>
                        <td className="p-3 font-mono text-[11px]">{p.date}</td>
                        <td className="p-3 font-mono font-bold text-emerald-400">PKR {p.amount.toLocaleString()}</td>
                        <td className="p-3">
                          <GoldBadge variant={p.status === 'Completed' ? 'emerald' : 'amber'}>
                            {p.status}
                          </GoldBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 5. CASH, BANK, JAZZCASH & EASYPAISA REPORTS */}
        {/* ------------------------------------------------------------- */}
        {activeReport === 'channels' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment Method Distribution Pie Chart */}
              <div className="p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-4 shadow-2xl">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-amber-400" />
                  Collections Share by Payment Channel
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={channelData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {channelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#d97706', borderRadius: '12px', fontSize: '12px' }}
                        formatter={(val: any) => `PKR ${Number(val).toLocaleString()}`}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Channel Totals Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-zinc-900 border border-blue-500/30 space-y-1">
                  <div className="text-xs font-bold text-blue-400 uppercase">Bank Accounts Deposit</div>
                  <div className="text-lg font-black font-mono text-white">
                    PKR {(channelData.find((c) => c.name === 'Bank Transfer')?.value || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-zinc-400">Meezan / HBL Accounts</div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900 border border-amber-500/30 space-y-1">
                  <div className="text-xs font-bold text-amber-400 uppercase">Cash Counter Collections</div>
                  <div className="text-lg font-black font-mono text-white">
                    PKR {(channelData.find((c) => c.name === 'Cash')?.value || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-zinc-400">Office Cash Vault</div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900 border border-rose-500/30 space-y-1">
                  <div className="text-xs font-bold text-rose-400 uppercase">JazzCash Mobile Wallet</div>
                  <div className="text-lg font-black font-mono text-white">
                    PKR {(channelData.find((c) => c.name === 'JazzCash')?.value || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-zinc-400">0301-8647596</div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900 border border-emerald-500/30 space-y-1">
                  <div className="text-xs font-bold text-emerald-400 uppercase">EasyPaisa Mobile Wallet</div>
                  <div className="text-lg font-black font-mono text-white">
                    PKR {(channelData.find((c) => c.name === 'EasyPaisa')?.value || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-zinc-400">0314-7861122</div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Landmark className="w-5 h-5 text-amber-400" />
                Payment Channels Audit Log
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase font-semibold border-b border-zinc-800">
                    <tr>
                      <th className="p-3">Payment Method</th>
                      <th className="p-3">Wallet / Account Title</th>
                      <th className="p-3">TXN Ref #</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Booking Ref</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-zinc-800/40">
                        <td className="p-3 font-bold text-amber-300">{p.paymentMethod}</td>
                        <td className="p-3 text-zinc-300">{p.walletTitle || p.bankAccountName || 'KMZ Official Account'}</td>
                        <td className="p-3 font-mono text-zinc-400">{p.transactionId || p.referenceNumber || 'TXN-001'}</td>
                        <td className="p-3 font-bold text-white">{p.customerName}</td>
                        <td className="p-3 font-mono text-amber-400">{p.bookingNumber}</td>
                        <td className="p-3 font-mono text-[11px]">{p.date}</td>
                        <td className="p-3 font-mono font-bold text-emerald-400">PKR {p.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 6. EXPENSE REPORTS */}
        {/* ------------------------------------------------------------- */}
        {activeReport === 'expenses' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Total Company Expenses</span>
                <div className="text-2xl font-bold text-rose-400 font-mono">PKR {totalCompanyExpenses.toLocaleString()}</div>
                <div className="text-[11px] text-zinc-400">{filteredExpenses.length} expense slips</div>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Hotel & Supplier Expenses</span>
                <div className="text-2xl font-bold text-amber-300 font-mono">
                  PKR {filteredExpenses.filter((e) => e.category === 'Hotel Supplier').reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-zinc-400">Makkah & Madina hotel vendors</div>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Airline & Flight Spend</span>
                <div className="text-2xl font-bold text-blue-400 font-mono">
                  PKR {filteredExpenses.filter((e) => e.category === 'Airline Tickets').reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-zinc-400">Ticket inventory cost</div>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Staff Salary Payroll</span>
                <div className="text-2xl font-bold text-emerald-400 font-mono">PKR {totalPayrollExpenses.toLocaleString()}</div>
                <div className="text-[11px] text-emerald-300">Monthly HR disbursements</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                Itemized Company Expenses Ledger
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase font-semibold border-b border-zinc-800">
                    <tr>
                      <th className="p-3">Expense #</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Expense Title</th>
                      <th className="p-3">Vendor / Recipient</th>
                      <th className="p-3">Payment Method</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {filteredExpenses.map((e) => (
                      <tr key={e.id} className="hover:bg-zinc-800/40">
                        <td className="p-3 font-mono font-bold text-amber-300">{e.expenseNumber}</td>
                        <td className="p-3 font-semibold text-zinc-200">{e.category}</td>
                        <td className="p-3 text-white font-medium">{e.title}</td>
                        <td className="p-3 text-zinc-400">{e.vendorName || 'General Office'}</td>
                        <td className="p-3 font-mono text-zinc-300">{e.paymentMethod}</td>
                        <td className="p-3 font-mono text-[11px]">{e.date}</td>
                        <td className="p-3 font-mono font-bold text-rose-400">PKR {e.amount.toLocaleString()}</td>
                        <td className="p-3">
                          <GoldBadge variant={e.status === 'Paid' ? 'emerald' : 'amber'}>{e.status}</GoldBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 7. UMRAH / HAJJ PACKAGE REPORTS */}
        {/* ------------------------------------------------------------- */}
        {activeReport === 'packages' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-amber-400" />
                Package Popularity & Revenue Breakdown
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase font-semibold border-b border-zinc-800">
                    <tr>
                      <th className="p-3">Package Title</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Quad Rate</th>
                      <th className="p-3">Double Rate</th>
                      <th className="p-3">Bookings Count</th>
                      <th className="p-3">Total Package Sales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {packages.map((pkg) => {
                      const pkgBookings = filteredBookings.filter((b) => b.packageId === pkg.id || b.packageName === pkg.title);
                      const pkgRevenue = pkgBookings.reduce((sum, b) => sum + b.totalAmount, 0);
                      return (
                        <tr key={pkg.id} className="hover:bg-zinc-800/40">
                          <td className="p-3 font-bold text-white">{pkg.title}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono text-[10px]">
                              {pkg.type}
                            </span>
                          </td>
                          <td className="p-3">{pkg.durationDays} Days ({pkg.makkahNights}M / {pkg.madinaNights}M)</td>
                          <td className="p-3 font-mono">PKR {pkg.quadPrice.toLocaleString()}</td>
                          <td className="p-3 font-mono">PKR {pkg.doublePrice.toLocaleString()}</td>
                          <td className="p-3 font-mono font-bold text-amber-300 text-center">{pkgBookings.length}</td>
                          <td className="p-3 font-mono font-bold text-emerald-400">PKR {pkgRevenue.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 8. FLIGHT & HOTEL REPORTS */}
        {/* ------------------------------------------------------------- */}
        {activeReport === 'flights-hotels' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Total Hotel Spend</span>
                <div className="text-2xl font-bold text-amber-300 font-mono">PKR {totalHotelsCost.toLocaleString()}</div>
                <div className="text-[11px] text-zinc-400">All Makkah & Madina hotel stays</div>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Total Flight Tickets Cost</span>
                <div className="text-2xl font-bold text-blue-400 font-mono">PKR {totalFlightsCost.toLocaleString()}</div>
                <div className="text-[11px] text-zinc-400">Airline ticket inventory</div>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Partner Hotels Registered</span>
                <div className="text-2xl font-bold text-white font-mono">{hotels.length} Hotels</div>
                <div className="text-[11px] text-amber-400">Makkah, Madina & Jeddah</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-amber-400" />
                Hotel Accommodations & Flight Manifest Audit
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase font-semibold border-b border-zinc-800">
                    <tr>
                      <th className="p-3">Booking Ref</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Airline & PNR</th>
                      <th className="p-3">Makkah Stay</th>
                      <th className="p-3">Madina Stay</th>
                      <th className="p-3">Flight Cost</th>
                      <th className="p-3">Hotel Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {filteredBookings.map((b) => {
                      const makkahHotel = b.hotels.find((h) => h.city === 'Makkah') || b.hotels[0];
                      const madinaHotel = b.hotels.find((h) => h.city === 'Madina') || b.hotels[1];
                      const flightCost = (b.flight?.ticketPrice || 0) * b.paxAdults;
                      const hCost = b.hotels.reduce((sum, h) => sum + (h.totalRate || h.totalHotelCost || h.nights * h.ratePerNight || 0), 0);
                      return (
                        <tr key={b.id} className="hover:bg-zinc-800/40">
                          <td className="p-3 font-mono font-bold text-amber-300">{b.bookingNumber}</td>
                          <td className="p-3 font-bold text-white">{b.customerName}</td>
                          <td className="p-3 font-mono text-[11px]">
                            {b.flight?.airline} ({b.flight?.pnr || 'PNR-8821'})
                          </td>
                          <td className="p-3 text-[11px]">
                            {makkahHotel ? `${makkahHotel.hotelName} (${makkahHotel.nights}N @ ${makkahHotel.ratePerNight}/N)` : 'N/A'}
                          </td>
                          <td className="p-3 text-[11px]">
                            {madinaHotel ? `${madinaHotel.hotelName} (${madinaHotel.nights}N @ ${madinaHotel.ratePerNight}/N)` : 'N/A'}
                          </td>
                          <td className="p-3 font-mono text-blue-400">PKR {flightCost.toLocaleString()}</td>
                          <td className="p-3 font-mono text-amber-300 font-bold">PKR {hCost.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 9. VISA REPORTS */}
        {/* ------------------------------------------------------------- */}
        {activeReport === 'visas' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Total Visas Processed</span>
                <div className="text-2xl font-bold text-white font-mono">{filteredBookings.length} Visas</div>
                <div className="text-[11px] text-amber-400">Nusuk & MOFA submissions</div>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Approved & Issued Visas</span>
                <div className="text-2xl font-bold text-emerald-400 font-mono">
                  {filteredBookings.filter((b) => b.visa?.status === 'Issued' || b.visa?.status === 'Approved').length} Issued
                </div>
                <div className="text-[11px] text-emerald-300">Barcode ready</div>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Total MOFA Visa Fees</span>
                <div className="text-2xl font-bold text-amber-300 font-mono">PKR {totalVisasCost.toLocaleString()}</div>
                <div className="text-[11px] text-zinc-400">Saudi Ministry of Foreign Affairs</div>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Approval Success Rate</span>
                <div className="text-2xl font-bold text-emerald-400 font-mono">98.5%</div>
                <div className="text-[11px] text-emerald-300">Verified Nusuk status</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-400" />
                Visa Application & Nusuk Status Directory
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase font-semibold border-b border-zinc-800">
                    <tr>
                      <th className="p-3">Customer Name</th>
                      <th className="p-3">Booking Ref</th>
                      <th className="p-3">Visa Category</th>
                      <th className="p-3">Nusuk ID / Visa #</th>
                      <th className="p-3">Application Date</th>
                      <th className="p-3">Fee (PKR)</th>
                      <th className="p-3">Processing Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-zinc-800/40">
                        <td className="p-3 font-bold text-white">{b.customerName}</td>
                        <td className="p-3 font-mono text-amber-300">{b.bookingNumber}</td>
                        <td className="p-3">{b.visa?.visaType || 'Umrah Visa'}</td>
                        <td className="p-3 font-mono text-zinc-400">{b.visa?.nusukId || b.visa?.visaNumber || 'NSK-99821'}</td>
                        <td className="p-3 font-mono text-[11px]">{b.visa?.applicationDate || b.createdAt}</td>
                        <td className="p-3 font-mono font-bold text-amber-300">PKR {((b.visa?.fee || 65000) * b.paxAdults).toLocaleString()}</td>
                        <td className="p-3">
                          <GoldBadge variant={b.visa?.status === 'Issued' ? 'emerald' : b.visa?.status === 'Submitted' ? 'blue' : 'amber'}>
                            {b.visa?.status || 'Issued'}
                          </GoldBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 10. VOUCHER REPORTS */}
        {/* ------------------------------------------------------------- */}
        {activeReport === 'vouchers' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-amber-400" />
                Service Vouchers Issuance Summary
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase font-semibold border-b border-zinc-800">
                    <tr>
                      <th className="p-3">Booking #</th>
                      <th className="p-3">Customer Name</th>
                      <th className="p-3">Makkah Hotel Voucher</th>
                      <th className="p-3">Madina Hotel Voucher</th>
                      <th className="p-3">Transport Voucher</th>
                      <th className="p-3">Voucher Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-zinc-800/40">
                        <td className="p-3 font-mono font-bold text-amber-300">{b.bookingNumber}</td>
                        <td className="p-3 font-bold text-white">{b.customerName}</td>
                        <td className="p-3 text-[11px]">{b.hotels[0]?.hotelName || 'Fairmont Clock Tower'} ({b.hotels[0]?.nights || 5}N)</td>
                        <td className="p-3 text-[11px]">{b.hotels[1]?.hotelName || 'Pullman Zamzam'} ({b.hotels[1]?.nights || 5}N)</td>
                        <td className="p-3 font-semibold">{b.transport?.transportType || 'Private GMC'}</td>
                        <td className="p-3">
                          <GoldBadge variant="emerald">Confirmed & Issued</GoldBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 11. STAFF PERFORMANCE REPORTS */}
        {/* ------------------------------------------------------------- */}
        {activeReport === 'staff' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-amber-400" />
                Staff Activity & Operational Performance Directory
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase font-semibold border-b border-zinc-800">
                    <tr>
                      <th className="p-3">Staff Name</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Inquiries Handled</th>
                      <th className="p-3">Bookings Created</th>
                      <th className="p-3">Passports Collected</th>
                      <th className="p-3">Payments Collected</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {dailyStaffReports.map((r) => (
                      <tr key={r.id} className="hover:bg-zinc-800/40">
                        <td className="p-3 font-bold text-white">{r.staffName}</td>
                        <td className="p-3 font-mono text-[11px]">{r.date}</td>
                        <td className="p-3 font-bold text-amber-300 font-mono text-center">{r.newInquiriesCount}</td>
                        <td className="p-3 font-bold text-emerald-400 font-mono text-center">{r.bookingsCreatedCount}</td>
                        <td className="p-3 font-bold text-amber-300 font-mono text-center">{r.passportsCollectedCount}</td>
                        <td className="p-3 font-mono font-bold text-emerald-400">PKR {r.paymentsCollectedTotal.toLocaleString()}</td>
                        <td className="p-3">
                          <GoldBadge variant={r.status === 'Reviewed' ? 'emerald' : 'amber'}>{r.status}</GoldBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 12. OUTSTANDING / RECEIVABLES REPORTS */}
        {/* ------------------------------------------------------------- */}
        {activeReport === 'receivables' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Total Pending Receivables</span>
                <div className="text-2xl font-bold text-rose-400 font-mono">PKR {totalReceivableBalance.toLocaleString()}</div>
                <div className="text-[11px] text-rose-300">Uncollected balances</div>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Customers with Overdue Balance</span>
                <div className="text-2xl font-bold text-amber-300 font-mono">
                  {filteredBookings.filter((b) => b.balanceAmount > 0).length} Customers
                </div>
                <div className="text-[11px] text-amber-400">Actionable reminders needed</div>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-2">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Critical Overdue (&gt;30 Days)</span>
                <div className="text-2xl font-bold text-rose-500 font-mono">
                  PKR {filteredBookings.filter((b) => b.paymentStatus === 'Overdue').reduce((sum, b) => sum + b.balanceAmount, 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-rose-400">High priority recovery</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Customer Outstanding Balances & WhatsApp Reminder Action
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase font-semibold border-b border-zinc-800">
                    <tr>
                      <th className="p-3">Customer Name</th>
                      <th className="p-3">Phone Number</th>
                      <th className="p-3">Booking Ref</th>
                      <th className="p-3">Total Sales</th>
                      <th className="p-3">Paid Amount</th>
                      <th className="p-3">Balance Due</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {filteredBookings
                      .filter((b) => b.balanceAmount > 0)
                      .map((b) => (
                        <tr key={b.id} className="hover:bg-zinc-800/40">
                          <td className="p-3 font-bold text-white">{b.customerName}</td>
                          <td className="p-3 font-mono text-amber-300">{b.customerPhone}</td>
                          <td className="p-3 font-mono text-zinc-400">{b.bookingNumber}</td>
                          <td className="p-3 font-mono text-zinc-300">PKR {b.totalAmount.toLocaleString()}</td>
                          <td className="p-3 font-mono text-emerald-400">PKR {b.paidAmount.toLocaleString()}</td>
                          <td className="p-3 font-mono font-bold text-rose-400">PKR {b.balanceAmount.toLocaleString()}</td>
                          <td className="p-3">
                            <button
                              onClick={() => {
                                const msg = `Assalam-o-Alaikum ${b.customerName},\nThis is a friendly reminder from KMZ Travels & Tours regarding your booking (${b.bookingNumber}).\nRemaining Balance: PKR ${b.balanceAmount.toLocaleString()}.\nPlease complete your payment at your earliest convenience.\nJazakAllah.`;
                                openWhatsApp(b.customerPhone, msg);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 font-bold text-[11px] flex items-center gap-1.5 transition-all"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Send WhatsApp Reminder</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 13. EMBEDDED GROUP LEADER MANIFEST */}
        {/* ------------------------------------------------------------- */}
        {activeReport === 'manifest' && <GroupLeaderReports />}

        {/* ------------------------------------------------------------- */}
        {/* 14. EMBEDDED DAILY STAFF SUBMISSIONS */}
        {/* ------------------------------------------------------------- */}
        {activeReport === 'daily-staff' && <DailyStaffReports />}
      </div>
    </div>
  </div>
);
};
