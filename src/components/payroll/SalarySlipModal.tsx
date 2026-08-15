import React, { useState, useEffect } from 'react';
import { Banknote, Calculator, UserCheck, Calendar, DollarSign, CreditCard, FileText } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { SalarySlip } from '../../types';
import { Modal } from '../common/Modal';
import { STAFF_MEMBERS, StaffMember } from '../../data/staffMembers';

interface SalarySlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSlip?: SalarySlip | null;
}

export const SalarySlipModal: React.FC<SalarySlipModalProps> = ({
  isOpen,
  onClose,
  editingSlip,
}) => {
  const { addSalarySlip, updateSalarySlip } = useData();

  // Employee Selection
  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    editingSlip?.employeeId || STAFF_MEMBERS[0].employeeId
  );
  const [employeeName, setEmployeeName] = useState(editingSlip?.employeeName || STAFF_MEMBERS[0].name);
  const [designation, setDesignation] = useState(editingSlip?.designation || STAFF_MEMBERS[0].designation);
  const [department, setDepartment] = useState(editingSlip?.department || STAFF_MEMBERS[0].department);

  // Period & Status
  const [slipNumber, setSlipNumber] = useState(
    editingSlip?.slipNumber || `SAL-2026-080${Math.floor(Math.random() * 90 + 10)}`
  );
  const [month, setMonth] = useState(editingSlip?.month || 'August');
  const [year, setYear] = useState(editingSlip?.year || 2026);
  const [paidDays, setPaidDays] = useState<number>(editingSlip?.paidDays ?? 30);
  const [status, setStatus] = useState<'Draft' | 'Issued' | 'Paid'>(
    editingSlip?.status || (editingSlip?.paymentStatus === 'Paid' ? 'Paid' : 'Issued')
  );

  // Basic & Allowances
  const [basicSalary, setBasicSalary] = useState<number>(editingSlip?.basicSalary || STAFF_MEMBERS[0].basicSalary);
  const [houseRent, setHouseRent] = useState<number>(editingSlip?.allowances.houseRent || STAFF_MEMBERS[0].houseRent);
  const [medical, setMedical] = useState<number>(editingSlip?.allowances.medical || STAFF_MEMBERS[0].medicalAllowance);
  const [conveyance, setConveyance] = useState<number>(editingSlip?.allowances.conveyance || STAFF_MEMBERS[0].transportAllowance);
  const [bonus, setBonus] = useState<number>(
    editingSlip?.allowances.bonus || editingSlip?.allowances.hajjUmrahDuty || 10000
  );
  const [otherAllowances, setOtherAllowances] = useState<number>(editingSlip?.allowances.other || 0);

  // Deductions
  const [tax, setTax] = useState<number>(editingSlip?.deductions.tax || 8000);
  const [absenceDeduction, setAbsenceDeduction] = useState<number>(editingSlip?.deductions.absenceDeduction || 0);
  const [loanDeduction, setLoanDeduction] = useState<number>(
    editingSlip?.deductions.loanDeduction || editingSlip?.deductions.advanceSalary || 0
  );
  const [otherDeductions, setOtherDeductions] = useState<number>(editingSlip?.deductions.other || 0);

  // Payment details
  const [paymentMethod, setPaymentMethod] = useState<string>(
    editingSlip?.paymentMethod || 'Bank Transfer'
  );
  const [paymentDate, setPaymentDate] = useState<string>(
    editingSlip?.paymentDate || new Date().toISOString().split('T')[0]
  );
  const [bankAccountDetails, setBankAccountDetails] = useState<string>(
    editingSlip?.bankAccountDetails || STAFF_MEMBERS[0].bankAccountDetails
  );
  const [notes, setNotes] = useState<string>(
    editingSlip?.notes || 'Monthly salary slip generated according to KMZ Travels HR policies.'
  );

  // Handle staff selection change & auto-fill
  const handleStaffSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedEmpId = e.target.value;
    setSelectedStaffId(selectedEmpId);

    const staff = STAFF_MEMBERS.find((s) => s.employeeId === selectedEmpId || s.id === selectedEmpId);
    if (staff) {
      setEmployeeName(staff.name);
      setDesignation(staff.designation);
      setDepartment(staff.department);
      setBasicSalary(staff.basicSalary);
      setHouseRent(staff.houseRent);
      setMedical(staff.medicalAllowance);
      setConveyance(staff.transportAllowance);
      setBankAccountDetails(staff.bankAccountDetails);
    }
  };

  // Automatic Calculation
  const totalAllowances = houseRent + medical + conveyance + bonus + otherAllowances;
  const totalDeductions = tax + absenceDeduction + loanDeduction + otherDeductions;
  const autoNetSalary = Math.max(0, basicSalary + totalAllowances - totalDeductions);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const slipData = {
      employeeId: selectedStaffId,
      employeeName,
      designation,
      department,
      month,
      year: Number(year),
      basicSalary: Number(basicSalary),
      paidDays: Number(paidDays),
      status,
      paymentStatus: (status === 'Paid' ? 'Paid' : status === 'Issued' ? 'Issued' : 'Draft') as any,
      allowances: {
        houseRent: Number(houseRent),
        medical: Number(medical),
        conveyance: Number(conveyance),
        bonus: Number(bonus),
        hajjUmrahDuty: Number(bonus),
        other: Number(otherAllowances),
      },
      deductions: {
        tax: Number(tax),
        absenceDeduction: Number(absenceDeduction),
        loanDeduction: Number(loanDeduction),
        advanceSalary: Number(loanDeduction),
        other: Number(otherDeductions),
      },
      paymentMethod,
      paymentDate,
      bankAccountDetails,
      notes,
    };

    if (editingSlip) {
      updateSalarySlip({
        ...editingSlip,
        slipNumber,
        ...slipData,
        totalAllowances,
        totalDeductions,
        netSalary: autoNetSalary,
      });
    } else {
      addSalarySlip(slipData);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingSlip ? `Edit Salary Slip #${editingSlip.slipNumber}` : 'Generate Staff Salary Slip'}
      subtitle="Complete payroll entry: auto-fills from staff directory with instant net salary auto-calculation."
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs text-zinc-100">
        {/* 1. Employee Selection & Auto-Fill */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" /> 1. Select Employee / Staff Member
            </h4>
            <span className="text-[10px] text-zinc-400">
              Select staff member to auto-fill designation, basic salary & bank info
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[10px] text-amber-400 uppercase font-bold mb-1">
                Select Staff Member *
              </label>
              <select
                value={selectedStaffId}
                onChange={handleStaffSelect}
                className="w-full px-3 py-2 bg-zinc-950 border border-amber-500/40 rounded-xl font-bold text-white focus:outline-none focus:border-amber-400"
              >
                {STAFF_MEMBERS.map((s) => (
                  <option key={s.employeeId} value={s.employeeId}>
                    {s.name} ({s.designation} - PKR {s.basicSalary.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">Designation</label>
              <input
                type="text"
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-200"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">Department</label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-200"
              />
            </div>
          </div>
        </div>

        {/* 2. Slip Number, Period & Status */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5 border-b border-zinc-800 pb-2">
            <Calendar className="w-4 h-4" /> 2. Slip Number, Pay Period & Status
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">Slip Number</label>
              <input
                type="text"
                value={slipNumber}
                onChange={(e) => setSlipNumber(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-xl font-mono font-bold text-amber-300"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white"
              >
                {[
                  'January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'
                ].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">Paid Days (Max 30)</label>
              <input
                type="number"
                min={1}
                max={31}
                value={paidDays}
                onChange={(e) => setPaidDays(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] text-amber-400 uppercase font-bold mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-amber-500/40 rounded-xl text-amber-300 font-extrabold"
              >
                <option value="Draft">Draft</option>
                <option value="Issued">Issued</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Allowances vs Deductions Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Allowances */}
          <div className="p-4 rounded-xl bg-zinc-900 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                <DollarSign className="w-4 h-4" /> Earnings & Allowances (+)
              </h4>
              <span className="text-xs font-black text-emerald-400">
                PKR {(basicSalary + totalAllowances).toLocaleString()}
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase">Basic Salary (PKR) *</label>
                <input
                  type="number"
                  required
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-xl font-black text-emerald-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase">House Rent Allowance</label>
                  <input
                    type="number"
                    value={houseRent}
                    onChange={(e) => setHouseRent(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase">Medical Allowance</label>
                  <input
                    type="number"
                    value={medical}
                    onChange={(e) => setMedical(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase">Transport Allowance</label>
                  <input
                    type="number"
                    value={conveyance}
                    onChange={(e) => setConveyance(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase">Bonus / Hajj Duty</label>
                  <input
                    type="number"
                    value={bonus}
                    onChange={(e) => setBonus(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase">Other Allowance</label>
                <input
                  type="number"
                  value={otherAllowances}
                  onChange={(e) => setOtherAllowances(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100"
                />
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="p-4 rounded-xl bg-zinc-900 border border-rose-500/30 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wide flex items-center gap-1">
                <CreditCard className="w-4 h-4" /> Salary Deductions (-)
              </h4>
              <span className="text-xs font-black text-rose-400">
                Total: PKR {totalDeductions.toLocaleString()}
              </span>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase">Income Tax</label>
                  <input
                    type="number"
                    value={tax}
                    onChange={(e) => setTax(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase">Absence Deduction</label>
                  <input
                    type="number"
                    value={absenceDeduction}
                    onChange={(e) => setAbsenceDeduction(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase">Loan / Advance Return</label>
                  <input
                    type="number"
                    value={loanDeduction}
                    onChange={(e) => setLoanDeduction(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase">Other Deduction</label>
                  <input
                    type="number"
                    value={otherDeductions}
                    onChange={(e) => setOtherDeductions(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Payment Details & Notes */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5 border-b border-zinc-800 pb-2">
            <FileText className="w-4 h-4" /> 4. Payment Method & Account Notes
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-semibold"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash Counter</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">Bank / Account Details</label>
              <input
                type="text"
                value={bankAccountDetails}
                onChange={(e) => setBankAccountDetails(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-zinc-400 uppercase mb-1">Payroll Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full p-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-200 placeholder-zinc-500"
              placeholder="Add any additional remarks or notes regarding this salary slip..."
            />
          </div>
        </div>

        {/* 5. Live Auto-Calculated Net Salary Summary Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-zinc-950 to-amber-500/10 border-2 border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-amber-400 font-black uppercase tracking-widest block">
                AUTOMATIC NET PAYABLE SALARY
              </span>
              <div className="text-2xl font-black text-white font-mono">
                PKR {autoNetSalary.toLocaleString()}
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                Formula: Basic ({basicSalary.toLocaleString()}) + Allowances ({totalAllowances.toLocaleString()}) - Deductions ({totalDeductions.toLocaleString()})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all"
            >
              {editingSlip ? 'Update Salary Slip' : 'Save & Issue Salary Slip'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
