import React, { useState } from 'react';
import {
  Banknote,
  Plus,
  Search,
  Edit2,
  Trash2,
  Printer,
  Eye,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  FileCheck,
  User,
  Building,
  Calendar,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { SalarySlip } from '../../types';
import { GoldBadge } from '../common/GoldBadge';
import { SalarySlipModal } from './SalarySlipModal';
import { Modal } from '../common/Modal';
import { openWhatsApp } from '../../utils/whatsapp';
import { generateSalarySlipPDF } from '../../utils/pdfGenerator';

export const SalarySlipsList: React.FC = () => {
  const { salarySlips, deleteSalarySlip } = useData();

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlip, setEditingSlip] = useState<SalarySlip | null>(null);
  const [viewingSlip, setViewingSlip] = useState<SalarySlip | null>(null);

  const handleOpenAdd = () => {
    setEditingSlip(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: SalarySlip) => {
    setEditingSlip(s);
    setIsModalOpen(true);
  };

  const handlePrint = () => {
    if (viewingSlip) {
      generateSalarySlipPDF(viewingSlip);
    }
  };

  // Filter Logic
  const filteredSlips = salarySlips.filter((s) => {
    const matchSearch =
      s.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.slipNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchMonth = monthFilter === 'all' || s.month.toLowerCase() === monthFilter.toLowerCase();
    const matchYear = yearFilter === 'all' || String(s.year) === yearFilter;
    const currentStatus = s.status || s.paymentStatus;
    const matchStatus = statusFilter === 'all' || currentStatus.toLowerCase() === statusFilter.toLowerCase();
    const matchDept = departmentFilter === 'all' || s.department.toLowerCase().includes(departmentFilter.toLowerCase());

    return matchSearch && matchMonth && matchYear && matchStatus && matchDept;
  });

  // Calculate Summary Analytics
  const totalNetPaid = salarySlips
    .filter((s) => (s.status || s.paymentStatus) === 'Paid')
    .reduce((sum, s) => sum + s.netSalary, 0);

  const totalIssuedPending = salarySlips
    .filter((s) => (s.status || s.paymentStatus) !== 'Paid')
    .reduce((sum, s) => sum + s.netSalary, 0);

  const totalDeductionsTax = salarySlips.reduce((sum, s) => sum + s.totalDeductions, 0);

  const handleWhatsAppShare = (s: SalarySlip) => {
    const msg = `Assalam-o-Alaikum ${s.employeeName},\n\nYour KMZ Travels Salary Pay Slip #${s.slipNumber} for ${s.month} ${s.year} has been generated.\n\n💼 Basic Salary: PKR ${s.basicSalary.toLocaleString()}\n➕ Total Allowances: PKR ${s.totalAllowances.toLocaleString()}\n➖ Total Deductions: PKR ${s.totalDeductions.toLocaleString()}\n💰 Net Payable Salary: PKR ${s.netSalary.toLocaleString()}\n📌 Status: ${s.status || s.paymentStatus}\n\nJazaakAllahu Khair! - KMZ Travels HR Dept`;
    openWhatsApp('', msg);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20 shadow-2xl">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white flex items-center gap-2.5">
            <Banknote className="w-7 h-7 text-amber-400" />
            <span>Staff Salary Slips & Payroll Management</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Official KMZ Travels HR Payroll system: basic salary, house rent, medical, transport allowances, tax/absence deductions, net salary auto-calculation & luxury printable slips.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Salary Slip</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
              Total Disbursed Payroll
            </span>
            <div className="text-xl font-extrabold text-white mt-0.5">
              PKR {totalNetPaid.toLocaleString()}
            </div>
            <div className="text-[10px] text-zinc-400 mt-1">Status: Fully Paid</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/90 border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">
              Issued / Pending Payroll
            </span>
            <div className="text-xl font-extrabold text-white mt-0.5">
              PKR {totalIssuedPending.toLocaleString()}
            </div>
            <div className="text-[10px] text-zinc-400 mt-1">Awaiting Disbursal</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
              Total Salary Records
            </span>
            <div className="text-xl font-extrabold text-white mt-0.5">
              {salarySlips.length} Slips
            </div>
            <div className="text-[10px] text-zinc-400 mt-1">Active HR Database</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-800 text-amber-400 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/90 border border-rose-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">
              Total Tax & Deductions
            </span>
            <div className="text-xl font-extrabold text-white mt-0.5">
              PKR {totalDeductionsTax.toLocaleString()}
            </div>
            <div className="text-[10px] text-zinc-400 mt-1">Withheld Tax & Returns</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search staff, designation, slip #..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-amber-500/20 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
            {/* Month Filter */}
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200"
            >
              <option value="all">All Months</option>
              {['August', 'July', 'June', 'May', 'April', 'March', 'February', 'January'].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Year Filter */}
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200"
            >
              <option value="all">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-zinc-950 border border-amber-500/30 rounded-lg text-amber-300 font-bold"
            >
              <option value="all">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Issued">Issued</option>
              <option value="Draft">Draft</option>
            </select>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200"
            >
              <option value="all">All Departments</option>
              <option value="Tour Operations">Tour Operations</option>
              <option value="Finance">Finance & Ticketing</option>
              <option value="Ground Operations">Ground Operations</option>
              <option value="Religious Guidance">Religious Guidance</option>
              <option value="Customer Service">Customer Support</option>
            </select>
          </div>
        </div>
      </div>

      {/* Salary Slips Table */}
      <div className="bg-zinc-900/90 rounded-2xl border border-amber-500/20 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="p-4">Slip #</th>
                <th className="p-4">Employee Details</th>
                <th className="p-4">Pay Period & Days</th>
                <th className="p-4">Basic Salary</th>
                <th className="p-4">Allowances (+)</th>
                <th className="p-4">Deductions (-)</th>
                <th className="p-4">Automatic Net Salary</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredSlips.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-zinc-500">
                    No salary slips match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSlips.map((s) => {
                  const currentStatus = s.status || (s.paymentStatus === 'Paid' ? 'Paid' : 'Issued');
                  const badgeVariant =
                    currentStatus === 'Paid'
                      ? 'emerald'
                      : currentStatus === 'Issued'
                      ? 'amber'
                      : 'zinc';

                  return (
                    <tr key={s.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-amber-300">{s.slipNumber}</td>
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{s.employeeName}</div>
                        <div className="text-[10px] text-zinc-400">{s.designation}</div>
                        <div className="text-[10px] text-amber-400/80 font-mono mt-0.5">{s.department}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-zinc-200">{s.month} {s.year}</div>
                        <div className="text-[10px] text-emerald-400 font-bold">
                          {s.paidDays || 30} / 30 Paid Days
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-zinc-200">
                        PKR {s.basicSalary.toLocaleString()}
                      </td>
                      <td className="p-4 font-semibold text-emerald-400">
                        +PKR {s.totalAllowances.toLocaleString()}
                      </td>
                      <td className="p-4 font-semibold text-rose-400">
                        -PKR {s.totalDeductions.toLocaleString()}
                      </td>
                      <td className="p-4 font-black text-amber-300 text-sm font-mono">
                        PKR {s.netSalary.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <GoldBadge variant={badgeVariant as any}>
                          {currentStatus}
                        </GoldBadge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingSlip(s)}
                            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-amber-400 hover:bg-zinc-700 transition-all"
                            title="Preview Luxury Salary Slip"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleWhatsAppShare(s)}
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
                            title="Share Slip via WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-amber-400 hover:bg-zinc-700 transition-all"
                            title="Edit Salary Slip"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete salary slip #${s.slipNumber}?`)) {
                                deleteSalarySlip(s.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-zinc-800 text-rose-400 hover:bg-rose-500/20 transition-all"
                            title="Delete Salary Slip"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Salary Slip Form Modal */}
      {isModalOpen && (
        <SalarySlipModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editingSlip={editingSlip}
        />
      )}

      {/* Luxury Gold Salary Slip Preview Modal */}
      {viewingSlip && (
        <Modal
          isOpen={true}
          onClose={() => setViewingSlip(null)}
          title={`Official Salary Slip: ${viewingSlip.employeeName}`}
          subtitle={`Pay Slip #${viewingSlip.slipNumber} • ${viewingSlip.month} ${viewingSlip.year}`}
          maxWidth="4xl"
        >
          <div className="space-y-6">
            {/* Top Modal Actions */}
            <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div className="text-xs text-zinc-400">
                Status: <span className="text-amber-400 font-bold uppercase">{viewingSlip.status || viewingSlip.paymentStatus}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleWhatsAppShare(viewingSlip)}
                  className="px-3 py-2 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-600/30 flex items-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" /> WhatsApp
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500"
                >
                  <Printer className="w-4 h-4" /> Print / Save as PDF
                </button>
              </div>
            </div>

            {/* Printable Gold-Bordered Salary Slip Component */}
            <div
              id="printable-salary-slip"
              className="p-8 bg-zinc-950 border-2 border-amber-500/50 rounded-2xl space-y-6 text-zinc-100 shadow-2xl relative"
            >
              {/* Slip Header */}
              <div className="flex items-center justify-between pb-6 border-b border-amber-500/40">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 p-0.5 shadow-lg">
                    <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center font-serif font-black text-amber-400 text-2xl">
                      KMZ
                    </div>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold font-serif text-white tracking-wide">
                      KMZ TRAVELS & TOURS (PVT) LTD
                    </h1>
                    <p className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest">
                      CONFIDENTIAL EMPLOYEE SALARY PAY SLIP
                    </p>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                      P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad • Reg: 0092182
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-mono font-black text-amber-300">
                    SLIP #{viewingSlip.slipNumber}
                  </div>
                  <div className="text-xs text-zinc-300 font-bold mt-0.5">
                    Period: {viewingSlip.month} {viewingSlip.year}
                  </div>
                  <div className="text-[10px] text-amber-400 font-bold mt-1">
                    Helpline: +92 301 8647596
                  </div>
                </div>
              </div>

              {/* Employee Bio Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                <div>
                  <span className="text-[10px] text-amber-400 uppercase font-bold">Employee Name</span>
                  <div className="font-bold text-white text-sm mt-0.5">{viewingSlip.employeeName}</div>
                </div>
                <div>
                  <span className="text-[10px] text-amber-400 uppercase font-bold">Designation</span>
                  <div className="font-semibold text-zinc-200 mt-0.5">{viewingSlip.designation}</div>
                </div>
                <div>
                  <span className="text-[10px] text-amber-400 uppercase font-bold">Department</span>
                  <div className="font-semibold text-zinc-200 mt-0.5">{viewingSlip.department}</div>
                </div>
                <div>
                  <span className="text-[10px] text-amber-400 uppercase font-bold">Paid Days / Status</span>
                  <div className="font-extrabold text-emerald-400 mt-0.5">
                    {viewingSlip.paidDays || 30} Days • {viewingSlip.status || viewingSlip.paymentStatus}
                  </div>
                </div>
              </div>

              {/* Earnings vs Deductions Breakdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Earnings */}
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <h4 className="font-bold text-emerald-400 uppercase text-[11px] pb-2 border-b border-zinc-800 flex justify-between">
                    <span>Earnings & Allowances</span>
                    <span>Amount (PKR)</span>
                  </h4>

                  <div className="flex justify-between py-1 border-b border-zinc-800/40">
                    <span className="text-zinc-200 font-semibold">Basic Salary</span>
                    <span className="font-bold text-white">PKR {viewingSlip.basicSalary.toLocaleString()}</span>
                  </div>

                  {viewingSlip.allowances.houseRent ? (
                    <div className="flex justify-between py-1 border-b border-zinc-800/40">
                      <span className="text-zinc-400">House Rent Allowance</span>
                      <span>PKR {viewingSlip.allowances.houseRent.toLocaleString()}</span>
                    </div>
                  ) : null}

                  <div className="flex justify-between py-1 border-b border-zinc-800/40">
                    <span className="text-zinc-400">Medical Allowance</span>
                    <span>PKR {(viewingSlip.allowances.medical || 0).toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-zinc-800/40">
                    <span className="text-zinc-400">Transport / Conveyance Allowance</span>
                    <span>PKR {(viewingSlip.allowances.conveyance || 0).toLocaleString()}</span>
                  </div>

                  {viewingSlip.allowances.bonus || viewingSlip.allowances.hajjUmrahDuty ? (
                    <div className="flex justify-between py-1 border-b border-zinc-800/40">
                      <span className="text-zinc-400">Hajj/Umrah Duty Bonus</span>
                      <span>PKR {(viewingSlip.allowances.bonus || viewingSlip.allowances.hajjUmrahDuty || 0).toLocaleString()}</span>
                    </div>
                  ) : null}

                  {viewingSlip.allowances.other ? (
                    <div className="flex justify-between py-1 border-b border-zinc-800/40">
                      <span className="text-zinc-400">Other Allowances</span>
                      <span>PKR {viewingSlip.allowances.other.toLocaleString()}</span>
                    </div>
                  ) : null}

                  <div className="flex justify-between py-1 font-bold text-emerald-400 pt-2 border-t border-zinc-700">
                    <span>Total Gross Earnings</span>
                    <span>PKR {(viewingSlip.basicSalary + viewingSlip.totalAllowances).toLocaleString()}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <h4 className="font-bold text-rose-400 uppercase text-[11px] pb-2 border-b border-zinc-800 flex justify-between">
                    <span>Deductions</span>
                    <span>Amount (PKR)</span>
                  </h4>

                  <div className="flex justify-between py-1 border-b border-zinc-800/40">
                    <span className="text-zinc-400">Income Tax (Federal Tax)</span>
                    <span>PKR {(viewingSlip.deductions.tax || 0).toLocaleString()}</span>
                  </div>

                  {viewingSlip.deductions.absenceDeduction ? (
                    <div className="flex justify-between py-1 border-b border-zinc-800/40">
                      <span className="text-zinc-400">Absence / Unpaid Leave Deduction</span>
                      <span className="text-rose-400">PKR {viewingSlip.deductions.absenceDeduction.toLocaleString()}</span>
                    </div>
                  ) : null}

                  {viewingSlip.deductions.loanDeduction || viewingSlip.deductions.advanceSalary ? (
                    <div className="flex justify-between py-1 border-b border-zinc-800/40">
                      <span className="text-zinc-400">Loan / Advance Return</span>
                      <span>PKR {(viewingSlip.deductions.loanDeduction || viewingSlip.deductions.advanceSalary || 0).toLocaleString()}</span>
                    </div>
                  ) : null}

                  {viewingSlip.deductions.providentFund ? (
                    <div className="flex justify-between py-1 border-b border-zinc-800/40">
                      <span className="text-zinc-400">Provident Fund (PF)</span>
                      <span>PKR {viewingSlip.deductions.providentFund.toLocaleString()}</span>
                    </div>
                  ) : null}

                  {viewingSlip.deductions.other ? (
                    <div className="flex justify-between py-1 border-b border-zinc-800/40">
                      <span className="text-zinc-400">Other Deductions</span>
                      <span>PKR {viewingSlip.deductions.other.toLocaleString()}</span>
                    </div>
                  ) : null}

                  <div className="flex justify-between py-1 font-bold text-rose-400 pt-2 border-t border-zinc-700">
                    <span>Total Deductions</span>
                    <span>PKR {viewingSlip.totalDeductions.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Automatic Net Salary Summary */}
              <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider block">
                    NET PAYABLE AMOUNT DISBURSED
                  </span>
                  <div className="text-2xl font-black text-white font-mono">
                    PKR {viewingSlip.netSalary.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    Payment Mode: {viewingSlip.paymentMethod || 'Bank Transfer'} • Date: {viewingSlip.paymentDate || 'N/A'}
                  </div>
                </div>

                <div className="text-right text-[11px] text-zinc-300 font-mono">
                  <span className="text-amber-400 font-bold block">Account / Deposit Details:</span>
                  <span>{viewingSlip.bankAccountDetails || 'Meezan Bank Limited'}</span>
                </div>
              </div>

              {/* Notes */}
              {viewingSlip.notes && (
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
                  <span className="font-bold text-amber-400 uppercase text-[10px] block mb-0.5">
                    Payroll & HR Notes:
                  </span>
                  {viewingSlip.notes}
                </div>
              )}

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-[11px] text-zinc-400 border-t border-amber-500/30">
                <div>
                  <p className="border-b border-zinc-700 pb-1 font-bold text-zinc-300">
                    Employee Acknowledgment Signature
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    I confirm receipt of full payment without any discrepancy.
                  </p>
                </div>

                <div className="text-right">
                  <p className="border-b border-zinc-700 pb-1 font-bold text-amber-300">
                    Toheed Asghar Shahid (Owner & Managing Director)
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-1">KMZ Travels & Tours Official Seal • Verified & Approved</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
