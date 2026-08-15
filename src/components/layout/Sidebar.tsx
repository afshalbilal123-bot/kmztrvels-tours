import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  PackageCheck,
  Building,
  FileCheck2,
  Ticket,
  UserCheck2,
  CreditCard,
  FileText,
  Receipt,
  Banknote,
  ClipboardList,
  MessageSquare,
  Compass,
  Landmark,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Sparkles,
  BarChart3,
  Printer,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { UserAvatar } from '../common/UserAvatar';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
  roles: ('super_admin' | 'staff' | 'customer')[];
  category?: string;
}

export const Sidebar: React.FC = () => {
  const { isSuperAdmin, isStaff, isCustomer, currentUser } = useAuth();
  const { activeTab, setActiveTab } = useData();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['super_admin', 'staff'],
      category: 'MAIN',
    },
    {
      id: 'customer-portal',
      label: 'Customer Portal',
      icon: Compass,
      badge: isCustomer ? 'MY PORTAL' : 'PREVIEW',
      roles: ['super_admin', 'staff', 'customer'],
      category: 'CUSTOMER',
    },
    {
      id: 'customers',
      label: 'Customer CRM',
      icon: Users,
      roles: ['super_admin', 'staff'],
      category: 'OPERATIONS',
    },
    {
      id: 'bookings',
      label: 'Umrah & Hajj Bookings',
      icon: CalendarDays,
      roles: ['super_admin', 'staff'],
      category: 'OPERATIONS',
    },
    {
      id: 'packages',
      label: 'Packages & Images',
      icon: PackageCheck,
      roles: ['super_admin', 'staff'],
      category: 'OPERATIONS',
    },
    {
      id: 'hotels',
      label: 'Hotels Database',
      icon: Building,
      roles: ['super_admin', 'staff'],
      category: 'OPERATIONS',
    },
    {
      id: 'visas',
      label: 'Visa Management',
      icon: FileCheck2,
      roles: ['super_admin', 'staff'],
      category: 'OPERATIONS',
    },
    {
      id: 'vouchers',
      label: 'Service Vouchers',
      icon: Ticket,
      roles: ['super_admin', 'staff'],
      category: 'OPERATIONS',
    },
    {
      id: 'group-reports',
      label: 'Group Leader Manifest',
      icon: UserCheck2,
      roles: ['super_admin', 'staff'],
      category: 'OPERATIONS',
    },
    {
      id: 'invoices',
      label: 'Service Invoices',
      icon: FileText,
      roles: ['super_admin', 'staff'],
      category: 'FINANCE',
    },
    {
      id: 'documents-center',
      label: 'Documents & Print Center',
      icon: Printer,
      badge: 'PRINT HUB',
      roles: ['super_admin', 'staff'],
      category: 'FINANCE',
    },
    {
      id: 'payments',
      label: 'Payment Receipts',
      icon: CreditCard,
      badge: 'RECEIPTS',
      roles: ['super_admin', 'staff'],
      category: 'FINANCE',
    },
    {
      id: 'bank-accounts',
      label: 'Bank Accounts & Cash',
      icon: Landmark,
      badge: 'BANKING',
      roles: ['super_admin', 'staff'],
      category: 'FINANCE',
    },
    {
      id: 'receivables',
      label: 'Payment Recovery',
      icon: CreditCard,
      badge: 'RECOVERY',
      roles: ['super_admin', 'staff'],
      category: 'FINANCE',
    },
    {
      id: 'expenses',
      label: 'Company Expenses',
      icon: Receipt,
      roles: ['super_admin', 'staff'],
      category: 'FINANCE',
    },
    {
      id: 'salary-slips',
      label: 'Salary Slips (Payroll)',
      icon: Banknote,
      badge: 'HR',
      roles: ['super_admin'], // Salary Slips visible to Super Admin
      category: 'FINANCE',
    },
    {
      id: 'reports',
      label: 'Executive Reports Hub',
      icon: BarChart3,
      badge: 'REPORTS',
      roles: ['super_admin', 'staff'],
      category: 'MANAGEMENT',
    },
    {
      id: 'staff-reports',
      label: 'Daily Staff Reports',
      icon: ClipboardList,
      roles: ['super_admin', 'staff'],
      category: 'MANAGEMENT',
    },
    {
      id: 'settings',
      label: 'CRM System Settings',
      icon: Compass,
      roles: ['super_admin'],
      category: 'MANAGEMENT',
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp Reminders',
      icon: MessageSquare,
      badge: 'API',
      roles: ['super_admin', 'staff'],
      category: 'MANAGEMENT',
    },
  ];

  // Filter items based on user role
  const visibleItems = navItems.filter((item) => {
    if (isCustomer) {
      return item.id === 'customer-portal';
    }
    if (item.id === 'salary-slips') {
      return isSuperAdmin;
    }
    return true;
  });

  const categories = Array.from(new Set(visibleItems.map((i) => i.category)));

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed bottom-5 right-5 z-50 p-3.5 bg-gradient-to-r from-[#d4af37] to-[#b89047] text-[#022c22] font-black rounded-full shadow-2xl shadow-[#d4af37]/40 focus:outline-none cursor-pointer hover:scale-105 active:scale-95 transition-transform"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/85 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen bg-[#022018] border-r border-[#d4af37]/25 flex flex-col transition-all duration-300 shadow-2xl shadow-black/80 ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen
            ? 'translate-x-0 w-64'
            : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top collapse toggle for desktop */}
        <div className="hidden md:flex items-center justify-between p-4 border-b border-[#d4af37]/20 bg-[#021812]/70">
          {!collapsed && (
            <div className="text-xs font-bold text-[#d4af37] uppercase tracking-widest flex items-center gap-1.5 font-serif">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" /> Royal Navigation
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-xl bg-[#064e3b]/50 border border-[#d4af37]/25 text-[#f5ecd0] hover:text-[#d4af37] hover:bg-[#d4af37]/20 transition-all mx-auto cursor-pointer"
            title={collapsed ? 'Expand Menu' : 'Collapse Menu'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {categories.map((cat) => {
            const items = visibleItems.filter((i) => i.category === cat);
            return (
              <div key={cat} className="space-y-1">
                {!collapsed && (
                  <h3 className="px-3 text-[10px] font-black text-[#d4af37]/75 uppercase tracking-widest font-serif">
                    {cat}
                  </h3>
                )}
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group relative cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-[#d4af37]/25 via-[#064e3b]/40 to-transparent text-[#fdfbf7] font-bold border-l-4 border-[#d4af37] shadow-lg shadow-[#064e3b]/40'
                          : 'text-emerald-100/70 hover:text-[#fdfbf7] hover:bg-[#064e3b]/35'
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-[#d4af37]' : 'text-emerald-300/60 group-hover:text-[#d4af37]'
                        }`}
                      />
                      {!collapsed && (
                        <span className="truncate flex-1 text-left">{item.label}</span>
                      )}
                      {!collapsed && item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-[#d4af37]/20 text-[#f5ecd0] border border-[#d4af37]/40 shadow-xs">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* User Footer Profile Summary */}
        <div className="p-3 border-t border-[#d4af37]/20 bg-[#021812]/80">
          <div className="flex items-center gap-2.5">
            <UserAvatar user={currentUser} className="w-8 h-8 rounded-lg border border-[#d4af37]/40" showStatus={true} />
            {!collapsed && (
              <div className="overflow-hidden flex-1">
                <div className="text-xs font-bold text-[#fdfbf7] truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-[#d4af37] uppercase font-bold tracking-wider">
                  {(currentUser?.role || 'admin').replace('_', ' ')}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
