import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Send,
  CheckCircle2,
  User,
  Clock,
  AlertCircle,
  Filter,
  Search,
  Printer,
  Edit3,
  Trash2,
  Building,
  Calendar,
  DollarSign,
  Phone,
  Check,
  X,
  Sparkles,
  RefreshCw,
  Briefcase,
  ShieldCheck,
  MessageSquare,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { StaffReport } from '../../types';
import { Modal } from '../common/Modal';
import { GoldBadge } from '../common/GoldBadge';
import { STAFF_MEMBERS, StaffMember } from '../../data/staffMembers';

export const DailyStaffReports: React.FC = () => {
  const {
    dailyStaffReports = [],
    addDailyStaffReport,
    updateDailyStaffReport,
    deleteDailyStaffReport,
    bookings = [],
    payments = [],
    companySettings,
  } = useData();

  const { currentUser, users = [], isSuperAdmin } = useAuth();

  // Combine staff from STAFF_MEMBERS and Auth users for a comprehensive employee directory
  const allStaffDirectory = useMemo(() => {
    const map = new Map<string, { id: string; name: string; designation: string; department: string; employeeId?: string }>();

    STAFF_MEMBERS.forEach((s) => {
      map.set(s.name.toLowerCase(), {
        id: s.id,
        name: s.name,
        designation: s.designation,
        department: s.department,
        employeeId: s.employeeId,
      });
    });

    users
      .filter((u) => u.role === 'staff' || u.role === 'super_admin')
      .forEach((u) => {
        if (!map.has(u.name.toLowerCase())) {
          map.set(u.name.toLowerCase(), {
            id: u.id,
            name: u.name,
            designation: u.designation || (u.role === 'super_admin' ? 'Managing Director' : 'Operations Specialist'),
            department: u.role === 'super_admin' ? 'Executive Management' : 'Tour Operations',
            employeeId: u.id && u.id.startsWith('u-') ? `EMP-${u.id.replace('u-', '10')}` : 'EMP-100',
          });
        }
      });

    return Array.from(map.values());
  }, [users]);

  // Today's YYYY-MM-DD date string
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter States - Defaulting to Today
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [datePreset, setDatePreset] = useState<'today' | 'yesterday' | 'this-week' | 'all'>('today');
  const [selectedStaffName, setSelectedStaffName] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Submitted' | 'Reviewed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Active Edit/Review Report
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  
  const [editingReport, setEditingReport] = useState<StaffReport | null>(null);
  const [reviewingReport, setReviewingReport] = useState<StaffReport | null>(null);
  const [printingReport, setPrintingReport] = useState<StaffReport | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    staffId: currentUser?.id || 'u-2',
    staffName: currentUser?.name || 'Tariq Mehmood',
    employeeId: 'emp-101',
    designation: currentUser?.designation || 'Senior Tour Consultant & Visa Manager',
    department: 'Tour Operations & Visa Dept',
    date: todayStr,
    attendanceStatus: 'Present' as StaffReport['attendanceStatus'],
    checkInTime: '09:00 AM',
    checkOutTime: '06:00 PM',
    callsMade: 20,
    newInquiriesCount: 10,
    bookingsCreated: 2,
    paymentsCollected: 500000,
    visasProcessed: 3,
    passportsCollectedCount: 5,
    tasksCompleted: '',
    summaryNotes: '',
    challengesOrIssues: '',
    status: 'Submitted' as StaffReport['status'],
  });

  // Review Feedback Form State
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'Submitted' | 'Reviewed'>('Reviewed');

  // Quick Date Preset Switcher
  const handlePresetChange = (preset: 'today' | 'yesterday' | 'this-week' | 'all') => {
    setDatePreset(preset);
    if (preset === 'today') {
      setSelectedDate(todayStr);
    } else if (preset === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      setSelectedDate(y.toISOString().split('T')[0]);
    } else if (preset === 'all' || preset === 'this-week') {
      setSelectedDate('');
    }
  };

  // Filtered Reports Calculation
  const filteredReports = useMemo(() => {
    return dailyStaffReports.filter((r) => {
      // Date Filter
      if (datePreset === 'today' && r.date !== todayStr) return false;
      if (datePreset === 'yesterday') {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        const yStr = y.toISOString().split('T')[0];
        if (r.date !== yStr) return false;
      }
      if (datePreset === 'this-week') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        const weekAgoStr = d.toISOString().split('T')[0];
        if (r.date < weekAgoStr) return false;
      }
      if (selectedDate && datePreset === 'today' && r.date !== selectedDate) return false;
      if (selectedDate && datePreset !== 'today' && r.date !== selectedDate) return false;

      // Staff Name Filter
      if (selectedStaffName !== 'all' && r.staffName !== selectedStaffName && r.staffId !== selectedStaffName) {
        return false;
      }

      // Status Filter
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          r.staffName.toLowerCase().includes(q) ||
          (r.designation && r.designation.toLowerCase().includes(q)) ||
          r.tasksCompleted.toLowerCase().includes(q) ||
          (r.summaryNotes && r.summaryNotes.toLowerCase().includes(q)) ||
          (r.challengesOrIssues && r.challengesOrIssues.toLowerCase().includes(q)) ||
          (r.adminFeedback && r.adminFeedback.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [dailyStaffReports, datePreset, selectedDate, todayStr, selectedStaffName, statusFilter, searchQuery]);

  // Aggregate KPI metrics for filtered view
  const summaryKpis = useMemo(() => {
    return filteredReports.reduce(
      (acc, r) => {
        acc.totalReports += 1;
        acc.totalCalls += r.callsMade || r.newInquiriesCount || 0;
        acc.totalBookings += r.bookingsCreated || 0;
        acc.totalPayments += r.paymentsCollected || 0;
        acc.totalVisas += r.visasProcessed || r.passportsCollectedCount || 0;
        return acc;
      },
      { totalReports: 0, totalCalls: 0, totalBookings: 0, totalPayments: 0, totalVisas: 0 }
    );
  }, [filteredReports]);

  // Handle Staff Change in Form -> auto fill designation & department
  const handleStaffSelect = (staffName: string) => {
    const found = allStaffDirectory.find((s) => s.name === staffName);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        staffId: found.id,
        staffName: found.name,
        employeeId: found.employeeId || 'EMP-100',
        designation: found.designation,
        department: found.department,
      }));
    } else {
      setFormData((prev) => ({ ...prev, staffName }));
    }
  };

  // Auto-calculate stats from real CRM database for today
  const autoCalculateCrmStats = () => {
    const targetDate = formData.date || todayStr;
    const targetStaff = formData.staffName;

    // Filter real bookings created today
    const countBookings = bookings.filter((b) => {
      const bDate = b.createdAt ? b.createdAt.split('T')[0] : '';
      return bDate === targetDate;
    }).length;

    // Filter real payments collected today
    const sumPayments = payments
      .filter((p) => p.date === targetDate)
      .reduce((sum, p) => sum + p.amount, 0);

    setFormData((prev) => ({
      ...prev,
      bookingsCreated: countBookings || prev.bookingsCreated,
      paymentsCollected: sumPayments || prev.paymentsCollected,
      summaryNotes: `Auto-synced from CRM: ${countBookings} bookings created and PKR ${sumPayments.toLocaleString()} collected on ${targetDate}.`,
    }));
  };

  // Open Form to Create New Report
  const handleOpenCreateModal = () => {
    const defaultStaff = allStaffDirectory.find((s) => s.name === currentUser?.name) || allStaffDirectory[0];
    setEditingReport(null);
    setFormData({
      staffId: defaultStaff?.id || currentUser?.id || 'u-2',
      staffName: defaultStaff?.name || currentUser?.name || 'Tariq Mehmood',
      employeeId: defaultStaff?.employeeId || 'emp-101',
      designation: defaultStaff?.designation || 'Senior Tour Consultant',
      department: defaultStaff?.department || 'Operations',
      date: todayStr,
      attendanceStatus: 'Present',
      checkInTime: '09:00 AM',
      checkOutTime: '06:00 PM',
      callsMade: 22,
      newInquiriesCount: 12,
      bookingsCreated: 2,
      paymentsCollected: 500000,
      visasProcessed: 3,
      passportsCollectedCount: 5,
      tasksCompleted: 'Handled customer inquiries regarding August Umrah packages, issued 2 booking confirmations, and collected cash deposit payments.',
      summaryNotes: 'Completed daily visa portal processing and customer follow-ups.',
      challengesOrIssues: '',
      status: 'Submitted',
    });
    setIsSubmitModalOpen(true);
  };

  // Open Form to Edit Existing Report
  const handleOpenEditModal = (report: StaffReport) => {
    setEditingReport(report);
    setFormData({
      staffId: report.staffId || 'u-2',
      staffName: report.staffName,
      employeeId: report.employeeId || 'EMP-100',
      designation: report.designation || 'Tour Consultant',
      department: report.department || 'Operations',
      date: report.date,
      attendanceStatus: report.attendanceStatus || 'Present',
      checkInTime: report.checkInTime || '09:00 AM',
      checkOutTime: report.checkOutTime || '06:00 PM',
      callsMade: report.callsMade || report.newInquiriesCount || 0,
      newInquiriesCount: report.newInquiriesCount || report.callsMade || 0,
      bookingsCreated: report.bookingsCreated || 0,
      paymentsCollected: report.paymentsCollected || 0,
      visasProcessed: report.visasProcessed || 0,
      passportsCollectedCount: report.passportsCollectedCount || 0,
      tasksCompleted: report.tasksCompleted || '',
      summaryNotes: report.summaryNotes || '',
      challengesOrIssues: report.challengesOrIssues || '',
      status: report.status || 'Submitted',
    });
    setIsSubmitModalOpen(true);
  };

  // Save (Create/Update) Report
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReport) {
      updateDailyStaffReport({
        ...editingReport,
        ...formData,
      });
    } else {
      addDailyStaffReport({
        ...formData,
        createdAt: new Date().toISOString(),
      });
    }
    setIsSubmitModalOpen(false);
    setEditingReport(null);
  };

  // Admin Review Modal Trigger
  const handleOpenReviewModal = (report: StaffReport) => {
    setReviewingReport(report);
    setReviewFeedback(report.adminFeedback || 'Report verified. Excellent daily progress.');
    setReviewStatus('Reviewed');
    setIsReviewModalOpen(true);
  };

  // Save Admin Review
  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewingReport) {
      updateDailyStaffReport({
        ...reviewingReport,
        adminFeedback: reviewFeedback,
        status: reviewStatus,
      });
    }
    setIsReviewModalOpen(false);
    setReviewingReport(null);
  };

  // Delete Report
  const handleDeleteReport = (id: string, staffName: string) => {
    if (window.confirm(`Delete daily staff report for ${staffName}? This action cannot be undone.`)) {
      deleteDailyStaffReport(id);
    }
  };

  // Trigger Print View
  const handlePrint = (report?: StaffReport) => {
    if (report) {
      setPrintingReport(report);
    } else {
      setPrintingReport(null);
    }
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* ----------------------------------------------------------------- */}
      {/* TOP HEADER */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2">
            <GoldBadge variant="amber">KMZ CRM Operations</GoldBadge>
            <span className="text-xs text-zinc-400 font-mono">Live Employee Reports</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold font-serif text-white mt-1 flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-amber-400" />
            Daily Staff Activity & Operational Progress Reports
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-3xl">
            Real-time daily submissions tracking staff attendance, customer calls, Umrah/Hajj bookings created, cash/bank payments collected, and visa operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <button
            onClick={() => handlePrint()}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-amber-500/50 text-zinc-300 hover:text-amber-300 font-bold text-xs transition-all shadow-md"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Reports Sheet</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs shadow-xl shadow-amber-500/20 transition-all transform hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 text-zinc-950 stroke-[3]" />
            <span>Submit Daily Report</span>
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* FILTERS & SEARCH BAR */}
      {/* ----------------------------------------------------------------- */}
      <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Quick Date Presets */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-950 rounded-xl border border-zinc-800 text-xs overflow-x-auto">
            <button
              onClick={() => handlePresetChange('today')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                datePreset === 'today'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Today's Reports</span>
            </button>
            <button
              onClick={() => handlePresetChange('yesterday')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                datePreset === 'yesterday'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => handlePresetChange('this-week')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                datePreset === 'this-week'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => handlePresetChange('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                datePreset === 'all'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All Dates
            </button>
          </div>

          {/* Date Picker & Clear */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-zinc-400 whitespace-nowrap">Filter Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setDatePreset('all');
              }}
              className="px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-400"
            />
            {selectedDate && (
              <button
                onClick={() => {
                  setSelectedDate('');
                  setDatePreset('all');
                }}
                className="text-[11px] text-zinc-400 hover:text-amber-400 underline"
              >
                Clear Date
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-zinc-800">
          {/* Staff Filter Dropdown */}
          <div className="relative">
            <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
              Select Staff Member:
            </label>
            <select
              value={selectedStaffName}
              onChange={(e) => setSelectedStaffName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:border-amber-400"
            >
              <option value="all">All Staff & Employees ({allStaffDirectory.length})</option>
              {allStaffDirectory.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.designation})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
              Review Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:border-amber-400"
            >
              <option value="all">All Statuses</option>
              <option value="Submitted">Submitted (Pending Review)</option>
              <option value="Reviewed">Reviewed & Approved</option>
            </select>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
              Search Keywords:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search staff, tasks, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:border-amber-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* SUMMARY KPI CARDS */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-zinc-900 border border-amber-500/20 space-y-1">
          <div className="text-[10px] text-zinc-400 uppercase font-bold flex items-center justify-between">
            <span>Reports Found</span>
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono">{summaryKpis.totalReports}</div>
          <div className="text-[10px] text-zinc-500">Filtered Submissions</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-amber-500/20 space-y-1">
          <div className="text-[10px] text-zinc-400 uppercase font-bold flex items-center justify-between">
            <span>Inquiries / Calls</span>
            <Phone className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-amber-300 font-mono">{summaryKpis.totalCalls}</div>
          <div className="text-[10px] text-zinc-500">Customer Consultations</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-amber-500/20 space-y-1">
          <div className="text-[10px] text-zinc-400 uppercase font-bold flex items-center justify-between">
            <span>Bookings Created</span>
            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-400 font-mono">{summaryKpis.totalBookings}</div>
          <div className="text-[10px] text-zinc-500">Umrah & Hajj Packages</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-amber-500/20 space-y-1">
          <div className="text-[10px] text-zinc-400 uppercase font-bold flex items-center justify-between">
            <span>Payments Collected</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-extrabold text-emerald-400 font-mono">
            PKR {summaryKpis.totalPayments.toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-500">Cash & Bank Total</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-amber-500/20 space-y-1 col-span-2 sm:col-span-1">
          <div className="text-[10px] text-zinc-400 uppercase font-bold flex items-center justify-between">
            <span>Visas Processed</span>
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-amber-300 font-mono">{summaryKpis.totalVisas}</div>
          <div className="text-[10px] text-zinc-500">Nusuk & MOFA Visas</div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* REPORTS LIST / FEED */}
      {/* ----------------------------------------------------------------- */}
      {filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReports.map((r) => {
            const isTodayReport = r.date === todayStr;
            return (
              <div
                key={r.id}
                className={`p-6 rounded-2xl bg-zinc-900 border space-y-4 shadow-2xl relative transition-all ${
                  isTodayReport ? 'border-amber-500/40 ring-1 ring-amber-500/20' : 'border-zinc-800'
                }`}
              >
                {/* Header Info */}
                <div className="flex items-start justify-between border-b border-zinc-800 pb-3 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/30 flex items-center justify-center font-serif font-black text-amber-300 text-lg shadow-inner">
                      {r.staffName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base flex items-center gap-2">
                        <span>{r.staffName}</span>
                        {r.employeeId && (
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            {r.employeeId}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-zinc-400">{r.designation || 'Staff Member'}</p>
                      <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1 text-amber-400">
                          <Calendar className="w-3 h-3" /> {r.date} {isTodayReport ? '(Today)' : ''}
                        </span>
                        {r.attendanceStatus && (
                          <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">
                            {r.attendanceStatus}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <GoldBadge variant={r.status === 'Reviewed' ? 'emerald' : 'amber'}>
                      {r.status === 'Reviewed' ? '✓ Reviewed' : 'Pending Review'}
                    </GoldBadge>

                    {r.checkInTime && (
                      <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {r.checkInTime} - {r.checkOutTime || '06:00 PM'}
                      </span>
                    )}
                  </div>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-0.5">
                    <div className="text-[10px] text-zinc-400 uppercase">Inquiries</div>
                    <div className="font-extrabold text-amber-300 text-sm font-mono">
                      {r.callsMade || r.newInquiriesCount || 0}
                    </div>
                  </div>
                  <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-0.5">
                    <div className="text-[10px] text-zinc-400 uppercase">Bookings</div>
                    <div className="font-extrabold text-emerald-400 text-sm font-mono">
                      {r.bookingsCreated || 0}
                    </div>
                  </div>
                  <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-0.5">
                    <div className="text-[10px] text-zinc-400 uppercase">Visas/Passports</div>
                    <div className="font-extrabold text-amber-300 text-sm font-mono">
                      {r.visasProcessed || r.passportsCollectedCount || 0}
                    </div>
                  </div>
                  <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-0.5">
                    <div className="text-[10px] text-zinc-400 uppercase">Revenue</div>
                    <div className="font-extrabold text-emerald-400 text-xs font-mono truncate">
                      PKR {(r.paymentsCollected || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Tasks & Work Done */}
                <div className="p-3.5 bg-zinc-950/90 rounded-xl border border-zinc-800 text-xs space-y-1.5">
                  <div className="text-[10px] text-amber-400 font-extrabold uppercase flex items-center justify-between">
                    <span>Tasks & Activities Executed Today</span>
                    <FileText className="w-3.5 h-3.5 text-zinc-500" />
                  </div>
                  <p className="text-zinc-200 leading-relaxed whitespace-pre-line">{r.tasksCompleted}</p>

                  {r.summaryNotes && (
                    <div className="pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400 italic">
                      <span className="font-bold text-zinc-300 not-italic">Notes: </span>
                      {r.summaryNotes}
                    </div>
                  )}
                </div>

                {/* Challenges / Blockers */}
                {r.challengesOrIssues && (
                  <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl text-xs space-y-1">
                    <div className="text-[10px] text-rose-400 font-bold uppercase flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Blockers / Operational Issues
                    </div>
                    <p className="text-rose-200">{r.challengesOrIssues}</p>
                  </div>
                )}

                {/* Admin Feedback */}
                {r.adminFeedback ? (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs space-y-1">
                    <div className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Admin Feedback & Comments
                    </div>
                    <p className="text-emerald-200 italic">"{r.adminFeedback}"</p>
                  </div>
                ) : (
                  isSuperAdmin && (
                    <button
                      onClick={() => handleOpenReviewModal(r)}
                      className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Review & Add Admin Feedback</span>
                    </button>
                  )
                )}

                {/* Action Toolbar */}
                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-emerald-400 font-extrabold font-mono">
                    Total Revenue: PKR {(r.paymentsCollected || 0).toLocaleString()}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePrint(r)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-300 transition-all"
                      title="Print Report"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(r)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-300 transition-all"
                      title="Edit Report"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {isSuperAdmin && (
                      <button
                        onClick={() => handleDeleteReport(r.id, r.staffName)}
                        className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/30 transition-all"
                        title="Delete Report"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ----------------------------------------------------------------- */
        /* NO REPORT FOUND GENUINE EMPTY STATE */
        /* ----------------------------------------------------------------- */
        <div className="p-12 text-center rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 max-w-2xl mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-serif text-white">No Daily Staff Report Found</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              No staff activity report has been submitted for{' '}
              <span className="text-amber-300 font-bold font-mono">
                {selectedDate || datePreset}
              </span>
              {selectedStaffName !== 'all' ? ` matching staff "${selectedStaffName}"` : ''}.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSelectedDate('');
                setSelectedStaffName('all');
                setStatusFilter('all');
                setSearchQuery('');
                setDatePreset('all');
              }}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all"
            >
              Reset Filters
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 text-xs font-extrabold shadow-lg shadow-amber-500/20 transition-all"
            >
              Submit Daily Report
            </button>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* SUBMIT / EDIT REPORT MODAL */}
      {/* ----------------------------------------------------------------- */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => {
          setIsSubmitModalOpen(false);
          setEditingReport(null);
        }}
        title={editingReport ? 'Edit Daily Staff Progress Report' : 'Submit End-of-Day Progress Report'}
        subtitle="Mandatory for all tour consultants, visa handlers, and operational staff."
      >
        <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
          {/* Staff Member Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Select Staff / Employee *
              </label>
              <select
                required
                value={formData.staffName}
                onChange={(e) => handleStaffSelect(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:border-amber-400"
              >
                {allStaffDirectory.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.designation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Report Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-amber-300 font-mono"
              />
            </div>
          </div>

          {/* Designation & Attendance */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-zinc-400">Attendance Status</label>
              <select
                value={formData.attendanceStatus}
                onChange={(e) =>
                  setFormData({ ...formData, attendanceStatus: e.target.value as any })
                }
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white"
              >
                <option value="Present">Present</option>
                <option value="Late">Late Arrival</option>
                <option value="On Field">On Field / Airport Duty</option>
                <option value="Work From Home">Work From Home</option>
                <option value="Half Day">Half Day</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400">Check-In Time</label>
              <input
                type="text"
                placeholder="e.g. 09:00 AM"
                value={formData.checkInTime}
                onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400">Check-Out Time</label>
              <input
                type="text"
                placeholder="e.g. 06:00 PM"
                value={formData.checkOutTime}
                onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* CRM Quick Sync Button */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
            <div>
              <span className="font-bold text-amber-300 block text-xs">Sync Today's Real CRM Records</span>
              <span className="text-[10px] text-zinc-400">Auto-calculate bookings and revenue collected today</span>
            </div>
            <button
              type="button"
              onClick={autoCalculateCrmStats}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-xs flex items-center gap-1 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" /> Auto-Fill Stats
            </button>
          </div>

          {/* KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] text-zinc-400">Inquiries / Calls</label>
              <input
                type="number"
                min={0}
                value={formData.callsMade}
                onChange={(e) =>
                  setFormData({ ...formData, callsMade: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400">Bookings Created</label>
              <input
                type="number"
                min={0}
                value={formData.bookingsCreated}
                onChange={(e) =>
                  setFormData({ ...formData, bookingsCreated: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-emerald-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400">Visas / Passports</label>
              <input
                type="number"
                min={0}
                value={formData.visasProcessed}
                onChange={(e) =>
                  setFormData({ ...formData, visasProcessed: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-amber-300 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400">Payments Collected (PKR)</label>
              <input
                type="number"
                min={0}
                value={formData.paymentsCollected}
                onChange={(e) =>
                  setFormData({ ...formData, paymentsCollected: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-emerald-400 font-mono"
              />
            </div>
          </div>

          {/* Detailed Tasks Completed */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Detailed Tasks & Operational Activities Executed *
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Processed 5 Umrah visas on Nusuk portal, issued tickets via SV portal, collected cash deposits..."
              value={formData.tasksCompleted}
              onChange={(e) => setFormData({ ...formData, tasksCompleted: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500"
            />
          </div>

          {/* Summary Notes */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Work Summary & Additional Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Reconciled daily Meezan Bank statement with ledger"
              value={formData.summaryNotes}
              onChange={(e) => setFormData({ ...formData, summaryNotes: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white"
            />
          </div>

          {/* Blockers / Challenges */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Challenges or Blockers Encountered (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Nusuk portal maintenance downtime or flight delay"
              value={formData.challengesOrIssues}
              onChange={(e) => setFormData({ ...formData, challengesOrIssues: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsSubmitModalOpen(false);
                setEditingReport(null);
              }}
              className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 text-zinc-950 font-black rounded-xl text-xs hover:bg-amber-400 shadow-lg shadow-amber-500/20"
            >
              {editingReport ? 'Update Report' : 'Submit Report'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ----------------------------------------------------------------- */}
      {/* ADMIN REVIEW MODAL */}
      {/* ----------------------------------------------------------------- */}
      {reviewingReport && (
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          title={`Review Daily Report - ${reviewingReport.staffName}`}
          subtitle={`Submitted on ${reviewingReport.date}`}
        >
          <form onSubmit={handleSaveReview} className="space-y-4 text-xs">
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
              <div className="text-[10px] text-zinc-400">Staff Work Summary:</div>
              <p className="text-zinc-200">{reviewingReport.tasksCompleted}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Admin Review Status
              </label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white"
              >
                <option value="Reviewed">Approved & Reviewed</option>
                <option value="Submitted">Pending Revision</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Admin Comments & Feedback
              </label>
              <textarea
                rows={3}
                required
                placeholder="Enter review comments for the staff member..."
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white"
              />
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-500 text-zinc-950 font-black rounded-xl text-xs hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
              >
                Save Review
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* PRINT PREVIEW MODAL */}
      {/* ----------------------------------------------------------------- */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Printable Daily Staff Operations Report"
        subtitle="Formatted formal printout for audit & archives."
      >
        <div className="space-y-4">
          <div className="p-6 bg-white text-zinc-950 rounded-xl border border-zinc-300 space-y-4 print:p-0 print:border-none">
            {/* Header */}
            <div className="border-b border-zinc-300 pb-3 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold font-serif text-zinc-900">
                  {companySettings?.companyName || 'KMZ Travels & Tours (Pvt) Ltd'}
                </h2>
                <p className="text-[10px] text-zinc-600">
                  {companySettings?.address || 'P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad'}
                </p>
                <p className="text-[10px] text-zinc-600 font-mono">
                  DTS License: {companySettings?.dtsLicense} | NTN: {companySettings?.ntnNumber}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-extrabold uppercase text-amber-700 block">
                  DAILY STAFF REPORT
                </span>
                <span className="text-[11px] font-mono font-bold text-zinc-800">
                  Date: {printingReport ? printingReport.date : (selectedDate || todayStr)}
                </span>
              </div>
            </div>

            {/* Content Table or Details */}
            {printingReport ? (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 p-3 bg-zinc-100 rounded-lg border border-zinc-200">
                  <div>
                    <span className="font-bold text-zinc-700">Staff Name: </span>
                    <span>{printingReport.staffName}</span>
                  </div>
                  <div>
                    <span className="font-bold text-zinc-700">Designation: </span>
                    <span>{printingReport.designation}</span>
                  </div>
                  <div>
                    <span className="font-bold text-zinc-700">Attendance: </span>
                    <span>{printingReport.attendanceStatus || 'Present'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-zinc-700">Revenue Collected: </span>
                    <span className="font-bold text-emerald-700">
                      PKR {(printingReport.paymentsCollected || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-800 text-xs mb-1">Executed Tasks & Activities:</h4>
                  <p className="p-3 bg-zinc-50 rounded border border-zinc-200 leading-relaxed text-zinc-800 whitespace-pre-line">
                    {printingReport.tasksCompleted}
                  </p>
                </div>

                {printingReport.adminFeedback && (
                  <div>
                    <h4 className="font-bold text-emerald-800 text-xs mb-1">Admin Feedback:</h4>
                    <p className="p-3 bg-emerald-50 rounded border border-emerald-200 text-emerald-900 italic">
                      "{printingReport.adminFeedback}"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <h3 className="font-bold text-zinc-800 border-b pb-1">
                  Daily Reports Summary Sheet ({filteredReports.length} Staff Submissions)
                </h3>
                <table className="w-full text-left text-[11px] border-collapse border border-zinc-300">
                  <thead>
                    <tr className="bg-zinc-100 text-zinc-800">
                      <th className="border p-2">Staff Member</th>
                      <th className="border p-2">Date</th>
                      <th className="border p-2">Calls</th>
                      <th className="border p-2">Bookings</th>
                      <th className="border p-2">Payments</th>
                      <th className="border p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((r) => (
                      <tr key={r.id}>
                        <td className="border p-2 font-bold">{r.staffName}</td>
                        <td className="border p-2 font-mono">{r.date}</td>
                        <td className="border p-2">{r.callsMade || 0}</td>
                        <td className="border p-2 font-bold text-emerald-700">{r.bookingsCreated || 0}</td>
                        <td className="border p-2 font-mono font-bold text-emerald-700">
                          PKR {(r.paymentsCollected || 0).toLocaleString()}
                        </td>
                        <td className="border p-2">{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Signature Footer */}
            <div className="pt-8 grid grid-cols-2 gap-8 text-[11px]">
              <div className="border-t border-zinc-400 pt-1 text-center font-bold text-zinc-700">
                Staff Signature
              </div>
              <div className="border-t border-zinc-400 pt-1 text-center font-bold text-zinc-700">
                Operations Director / Admin Sign-off
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsPrintModalOpen(false)}
              className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold"
            >
              Close
            </button>
            <button
              onClick={() => window.print()}
              className="px-5 py-2 bg-amber-500 text-zinc-950 font-black rounded-xl text-xs hover:bg-amber-400 flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Print Document
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
