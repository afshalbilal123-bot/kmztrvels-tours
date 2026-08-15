import React, { useState } from 'react';
import {
  Search,
  Bell,
  UserCheck,
  Calendar,
  Sparkles,
  ChevronDown,
  CheckCheck,
  ShieldAlert,
  LogOut,
  Building2,
  ExternalLink,
  Info,
  Phone,
  MapPin,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Modal } from '../common/Modal';
import { UserAvatar } from '../common/UserAvatar';

export const Header: React.FC = () => {
  const { currentUser, users, switchUserRole, isCustomer, resetUsers, logout, openAdminLogin } = useAuth();

  if (!currentUser) return null;
  const {
    searchTerm,
    setSearchTerm,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActiveTab,
    companySettings,
  } = useData();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);

  // Filter notifications based on role/customer
  const filteredNotifications = notifications.filter((n) => {
    if (isCustomer) {
      return n.targetCustomerId === currentUser.customerId || !n.targetCustomerId;
    }
    return true;
  });

  const unreadCount = filteredNotifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-[#021d15]/95 backdrop-blur-md border-b border-[#d4af37]/25 px-4 sm:px-6 py-3 transition-all shadow-xl shadow-black/40">
      <div className="flex items-center justify-between gap-4">
        {/* Left Brand Identity */}
        <div className="flex items-center gap-3">
          {isCustomer && companySettings?.customerPortalLogoUrl ? (
            <div className="w-10 h-10 rounded-xl bg-[#022c22] border border-[#d4af37]/35 p-1 flex items-center justify-center shadow-lg overflow-hidden shrink-0">
              <img
                src={companySettings.customerPortalLogoUrl}
                alt="Customer Portal Logo"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#064e3b] via-[#047857] to-[#d4af37] p-0.5 shadow-lg shadow-[#064e3b]/40">
              <div className="w-full h-full bg-[#021812] rounded-[10px] flex items-center justify-center font-serif font-black text-[#d4af37] text-lg tracking-widest">
                KMZ
              </div>
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold font-serif tracking-wide text-[#fdfbf7]">
                KMZ Travels & Tours
              </h1>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-[#d4af37]/15 text-[#f5ecd0] border border-[#d4af37]/35 shadow-xs font-serif">
                {isCustomer ? 'ROYAL PILGRIM PORTAL' : 'EXECUTIVE CRM'}
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/60 font-medium">
              {isCustomer
                ? 'Personal Umrah & Hajj Pilgrim Concierge'
                : 'Premier Umrah & Hajj Operations'}
            </p>
          </div>
        </div>

        {/* Center Search Input (Admin/Staff only) */}
        {!isCustomer && (
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]/80" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Pilgrim name, Passport #, Booking Ref or Phone..."
                className="w-full pl-10 pr-4 py-2 bg-[#02281e]/90 border border-[#d4af37]/25 rounded-xl text-xs text-[#fdfbf7] placeholder-emerald-200/40 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50 transition-all shadow-inner"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#d4af37]/70 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Login Button for Customer View */}
          {isCustomer && (
            <button
              onClick={openAdminLogin}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b89047] hover:from-[#e6ca65] hover:to-[#d4af37] text-[#022c22] text-xs font-black transition-all shadow-md shadow-[#d4af37]/30 cursor-pointer hover:scale-105 active:scale-95"
              title="Switch to Admin & Staff CRM Login"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#022c22]" />
              <span>Admin Login</span>
            </button>
          )}

          {/* Company Profile Info Button */}
          <button
            onClick={() => setShowCompanyModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#064e3b]/40 border border-[#d4af37]/35 text-[#f5ecd0] hover:bg-[#d4af37]/20 hover:text-[#d4af37] text-xs font-bold transition-all cursor-pointer"
            title="KMZ Company Profile & Contacts"
          >
            <Building2 className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="hidden sm:inline">KMZ Info</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl bg-[#064e3b]/30 border border-[#d4af37]/25 text-[#f5ecd0] hover:text-[#d4af37] hover:border-[#d4af37]/60 hover:bg-[#064e3b]/60 transition-all cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-[#d4af37] to-[#e6ca65] text-[#022c22] font-black text-[10px] flex items-center justify-center animate-bounce shadow-md shadow-[#d4af37]/50">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#022018] border border-[#d4af37]/35 rounded-2xl shadow-2xl shadow-black/90 z-50 overflow-hidden">
                <div className="p-4 border-b border-[#d4af37]/20 bg-[#021812] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#d4af37]" />
                    <span className="text-xs font-bold text-[#fdfbf7] tracking-wide uppercase font-serif">
                      Notifications ({unreadCount} new)
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[11px] text-[#d4af37] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <CheckCheck className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#064e3b]/30 custom-scrollbar">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-emerald-200/50">
                      No notifications found.
                    </div>
                  ) : (
                    filteredNotifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          if (n.linkTab && !isCustomer) setActiveTab(n.linkTab);
                          setShowNotifications(false);
                        }}
                        className={`p-3.5 hover:bg-[#064e3b]/30 cursor-pointer transition-colors ${
                          !n.read ? 'bg-[#d4af37]/10' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-[#fdfbf7] flex items-center gap-1.5">
                            {!n.read && <span className="w-2 h-2 rounded-full bg-[#d4af37]" />}
                            {n.title}
                          </h4>
                          <span className="text-[10px] text-emerald-200/60">{n.date}</span>
                        </div>
                        <p className="text-xs text-emerald-100/70 mt-1 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Logout Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-gradient-to-r from-[#02281e] to-[#021812] border border-[#d4af37]/35 hover:border-[#d4af37] transition-all text-left group cursor-pointer"
            >
              <UserAvatar user={currentUser} className="w-8 h-8 rounded-lg border border-[#d4af37]/40" showStatus={true} />
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-[#fdfbf7] flex items-center gap-1">
                  <span>{currentUser.name}</span>
                  <ChevronDown className="w-3 h-3 text-[#d4af37] group-hover:translate-y-0.5 transition-transform" />
                </div>
                <div className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider">
                  {(currentUser?.role || 'admin').replace('_', ' ')}
                </div>
              </div>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-[#022018] border border-[#d4af37]/35 rounded-2xl shadow-2xl shadow-black z-50 p-3 space-y-2">
                <div className="px-2 py-1.5 border-b border-[#064e3b]/50 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#d4af37]">Signed in as {currentUser.name}</div>
                    <div className="text-[10px] text-emerald-200/70 font-mono">{currentUser.email}</div>
                  </div>
                </div>

                {/* Switch Account (Only for Staff / Super Admin) */}
                {!isCustomer && (
                  <>
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl bg-[#064e3b]/40 border border-[#d4af37]/30 text-[#f5ecd0] hover:bg-[#d4af37]/20 hover:text-[#d4af37] text-xs font-bold transition-all cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-[#d4af37]" />
                      <span>Edit Profile & Avatar</span>
                    </button>

                    <div className="px-2 pt-1 border-t border-[#064e3b]/50">
                      <div className="text-[10px] font-bold text-[#d4af37]/80 uppercase tracking-wider mb-1 font-serif">
                        Switch Admin Account
                      </div>
                    </div>

                    <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                      {users
                        .filter((u) => u.role !== 'customer')
                        .map((u) => (
                          <button
                            key={u.id}
                            onClick={() => {
                              switchUserRole(u.id);
                              setShowUserDropdown(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                              u.id === currentUser.id
                                ? 'bg-[#d4af37]/20 text-[#fdfbf7] border border-[#d4af37]/40'
                                : 'text-emerald-100/80 hover:bg-[#064e3b]/40'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <UserAvatar user={u} className="w-6 h-6 rounded-md" />
                              <div>
                                <div className="font-semibold text-[#fdfbf7] line-clamp-1">{u.name}</div>
                                <div className="text-[10px] text-emerald-200/60 line-clamp-1">{u.designation || u.role}</div>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold uppercase text-[#d4af37] shrink-0">
                              {u.role === 'super_admin' ? 'ADMIN' : (u.role || '').toUpperCase()}
                            </span>
                          </button>
                        ))}
                    </div>
                  </>
                )}

                {/* Logout Button */}
                <div className="pt-2 border-t border-[#064e3b]/50">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Sign Out / Lock Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Company Profile Modal */}
      <Modal
        isOpen={showCompanyModal}
        onClose={() => setShowCompanyModal(false)}
        title="KMZ Travels & Tours — Corporate Profile"
        subtitle="Licensed Hajj & Umrah Tour Operator Information"
      >
        <div className="space-y-6 text-xs text-[#f5ecd0]">
          <div className="p-5 rounded-2xl bg-[#022c22]/90 border border-[#d4af37]/35 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 pb-4 border-b border-[#064e3b]/60">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#064e3b] via-[#047857] to-[#d4af37] p-0.5 shadow-md">
                <div className="w-full h-full bg-[#021812] rounded-[10px] flex items-center justify-center font-serif font-black text-[#d4af37] text-xl">
                  KMZ
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold font-serif text-[#fdfbf7]">KMZ Travels & Tours</h3>
                <p className="text-[10px] text-[#d4af37] font-bold uppercase tracking-widest font-serif">
                  Premier Hajj & Umrah Operations
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <UserIcon className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <span className="text-emerald-200/60 text-[10px] uppercase font-bold block">Company Owner & Director</span>
                  <span className="text-[#fdfbf7] font-bold text-sm">Toheed Asghar Shahid</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <span className="text-emerald-200/60 text-[10px] uppercase font-bold block">Head Office Address</span>
                  <span className="text-emerald-100 font-medium">P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-emerald-200/60 text-[10px] uppercase font-bold block">WhatsApp & Official Phone</span>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <span className="font-mono font-bold text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
                      WhatsApp: 03018647596
                    </span>
                    <span className="font-mono font-bold text-[#d4af37] bg-[#d4af37]/15 px-2.5 py-0.5 rounded-lg border border-[#d4af37]/30">
                      Contact: 03147861122
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#021d15] border border-[#d4af37]/25 text-[11px] text-emerald-200/70 space-y-1">
            <div className="font-bold text-[#d4af37] font-serif">Official Certification Note:</div>
            <p>
              All official receipts, salary slips, hotel vouchers, and pilgrim travel manifests generated through this CRM carry the legal authorization of Toheed Asghar Shahid, KMZ Travels & Tours Faisalabad.
            </p>
          </div>
        </div>
      </Modal>
    </header>
  );
};
