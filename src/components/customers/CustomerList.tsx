import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  MessageSquare,
  Phone,
  Mail,
  FileText,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Sparkles,
  Award,
  CheckCircle,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Customer } from '../../types';
import { Modal } from '../common/Modal';
import { GoldBadge } from '../common/GoldBadge';
import { openWhatsApp, createCustomerEnquiryMessage } from '../../utils/whatsapp';

export const CustomerList: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, bookings, setActiveTab } =
    useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    whatsapp: '',
    passportNumber: '',
    passportExpiry: '',
    cnic: '',
    city: 'Lahore',
    country: 'Pakistan',
    emergencyContact: '',
    customerType: 'Umrah' as Customer['customerType'],
    passportCopyUrl: '',
    notes: '',
  });

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      whatsapp: '',
      passportNumber: '',
      passportExpiry: '',
      cnic: '',
      city: 'Lahore',
      country: 'Pakistan',
      emergencyContact: '',
      customerType: 'Umrah',
      passportCopyUrl:
        'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      whatsapp: customer.whatsapp,
      passportNumber: customer.passportNumber,
      passportExpiry: customer.passportExpiry,
      cnic: customer.cnic,
      city: customer.city,
      country: customer.country,
      emergencyContact: customer.emergencyContact,
      customerType: customer.customerType,
      passportCopyUrl: customer.passportCopyUrl || '',
      notes: customer.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      updateCustomer({
        ...editingCustomer,
        ...formData,
      });
    } else {
      addCustomer(formData);
    }
    setIsModalOpen(false);
  };

  // WhatsApp helper
  const handleCustomerEnquiryWhatsApp = (customer: Customer) => {
    const msg = createCustomerEnquiryMessage(customer.fullName, customer.customerType);
    openWhatsApp(customer.whatsapp || customer.phone, msg);
  };

  const filteredCustomers = customers.filter((c) => {
    const matchSearch =
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.passportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.cnic.includes(searchTerm) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchType = typeFilter === 'all' || c.customerType === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            Customer CRM & Pilgrims Directory
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Manage pilgrim profiles, passport details, emergency contacts, and direct WhatsApp alerts.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Pilgrim</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/80" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, passport #, CNIC, city..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-amber-500/20 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-zinc-400 uppercase">Type:</span>
          {['all', 'Umrah', 'Hajj', 'VIP', 'Corporate', 'Repeat'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === type
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {type === 'all' ? 'All Customers' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table / Grid */}
      <div className="bg-zinc-900/90 rounded-2xl border border-amber-500/20 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="p-4">Pilgrim Details</th>
                <th className="p-4">Passport & CNIC</th>
                <th className="p-4">Contact / WhatsApp</th>
                <th className="p-4">City / Emergency</th>
                <th className="p-4">Type</th>
                <th className="p-4">Spent / Bookings</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    No customers found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{c.fullName}</div>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-amber-400/70" />
                        {c.email}
                      </div>
                    </td>
                    <td className="p-4 font-mono">
                      <div className="font-bold text-amber-300">{c.passportNumber}</div>
                      <div className="text-[10px] text-zinc-400">Exp: {c.passportExpiry}</div>
                      <div className="text-[10px] text-zinc-500">CNIC: {c.cnic}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-zinc-200">{c.phone}</div>
                      <button
                        onClick={() => handleCustomerEnquiryWhatsApp(c)}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/20 mt-1 transition-all"
                        title="Send Customer Enquiry via WhatsApp"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Enquiry WhatsApp</span>
                      </button>
                    </td>
                    <td className="p-4 text-[11px]">
                      <div className="font-semibold text-zinc-200">
                        {c.city}, {c.country}
                      </div>
                      <div className="text-zinc-500 text-[10px]">
                        Emg: {c.emergencyContact}
                      </div>
                    </td>
                    <td className="p-4">
                      <GoldBadge
                        variant={
                          c.customerType === 'VIP'
                            ? 'gold'
                            : c.customerType === 'Hajj'
                            ? 'emerald'
                            : 'slate'
                        }
                      >
                        {c.customerType}
                      </GoldBadge>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white">
                        PKR {c.totalSpent.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-amber-400/80 font-semibold">
                        {c.totalBookings} Booking(s)
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingCustomer(c)}
                          className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-amber-400 hover:bg-zinc-700"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(c)}
                          className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-amber-400 hover:bg-zinc-700"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteCustomer(c.id)}
                          className="p-1.5 rounded-lg bg-zinc-800 text-rose-400 hover:bg-rose-500/20"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Pilgrim Details' : 'Register New Pilgrim'}
        subtitle="Ensure passport number and expiry match official travel documents."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Full Name (as in Passport) *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                placeholder="e.g. Muhammad Ali Khan"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                placeholder="m.ali@gmail.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                placeholder="+92 300 1234567"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                WhatsApp Number
              </label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                placeholder="923001234567"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Passport Number *
              </label>
              <input
                type="text"
                required
                value={formData.passportNumber}
                onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 font-mono focus:outline-none focus:border-amber-400 uppercase"
                placeholder="PK8829104"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Passport Expiry Date *
              </label>
              <input
                type="date"
                required
                value={formData.passportExpiry}
                onChange={(e) => setFormData({ ...formData, passportExpiry: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                CNIC / National ID *
              </label>
              <input
                type="text"
                required
                value={formData.cnic}
                onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                placeholder="35202-1234567-1"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                City / Country
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-1/2 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100"
                  placeholder="City"
                />
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-1/2 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100"
                  placeholder="Country"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Emergency Contact Name & Phone
              </label>
              <input
                type="text"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                placeholder="Usman Ali (+92 300 0000000)"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Customer Type
              </label>
              <select
                value={formData.customerType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customerType: e.target.value as Customer['customerType'],
                  })
                }
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
              >
                <option value="Umrah">Umrah</option>
                <option value="Hajj">Hajj</option>
                <option value="VIP">VIP</option>
                <option value="Corporate">Corporate</option>
                <option value="Repeat">Repeat</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Internal Notes & Special Requirements
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
              placeholder="Wheelchair requirements, dietary preferences, hotel room proximity requests..."
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
              {editingCustomer ? 'Update Pilgrim' : 'Save Pilgrim Profile'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Details Drawer/Modal */}
      {viewingCustomer && (
        <Modal
          isOpen={true}
          onClose={() => setViewingCustomer(null)}
          title={`Pilgrim Profile: ${viewingCustomer.fullName}`}
          subtitle={`Passport: ${viewingCustomer.passportNumber} • CNIC: ${viewingCustomer.cnic}`}
          maxWidth="4xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-zinc-900 border border-amber-500/20">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Contact</span>
                <div className="text-xs text-white font-medium mt-0.5">{viewingCustomer.phone}</div>
                <div className="text-xs text-zinc-400">{viewingCustomer.email}</div>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Location & Emg</span>
                <div className="text-xs text-white font-medium mt-0.5">
                  {viewingCustomer.city}, {viewingCustomer.country}
                </div>
                <div className="text-xs text-zinc-400">{viewingCustomer.emergencyContact}</div>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold">
                  Total Investment
                </span>
                <div className="text-sm font-extrabold text-amber-300 mt-0.5">
                  PKR {viewingCustomer.totalSpent.toLocaleString()}
                </div>
                <div className="text-xs text-zinc-400">
                  {viewingCustomer.totalBookings} Completed / Active Booking(s)
                </div>
              </div>
            </div>

            {/* Passport Document Preview */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide mb-2">
                Passport Copy Preview
              </h4>
              <img
                src={
                  viewingCustomer.passportCopyUrl ||
                  'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'
                }
                alt="Passport Document"
                className="w-full max-h-60 object-cover rounded-xl border border-zinc-700"
              />
            </div>

            {/* Associated Bookings */}
            <div>
              <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wide mb-3">
                Associated Pilgrim Bookings
              </h4>
              <div className="space-y-2">
                {bookings
                  .filter((b) => b.customerId === viewingCustomer.id)
                  .map((b) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-amber-400">{b.bookingNumber}</span>
                        <div className="text-white font-medium">{b.packageName}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">
                          PKR {b.totalAmount.toLocaleString()}
                        </div>
                        <GoldBadge
                          variant={b.paymentStatus === 'Paid' ? 'emerald' : 'amber'}
                          size="sm"
                        >
                          {b.paymentStatus}
                        </GoldBadge>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
