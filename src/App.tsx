import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoginView } from './components/auth/LoginView';
import { Dashboard } from './components/dashboard/Dashboard';
import { CustomerList } from './components/customers/CustomerList';
import { BookingList } from './components/bookings/BookingList';
import { PackageList } from './components/packages/PackageList';
import { HotelList } from './components/hotels/HotelList';
import { VisaList } from './components/visas/VisaList';
import { VoucherList } from './components/vouchers/VoucherList';
import { GroupLeaderReports } from './components/reports/GroupLeaderReports';
import { PaymentsList } from './components/accounts/PaymentsList';
import { ReceivablesView } from './components/accounts/ReceivablesView';
import { InvoicesList } from './components/accounts/InvoicesList';
import { ExpensesList } from './components/accounts/ExpensesList';
import { BankAccountsView } from './components/accounts/BankAccountsView';
import { SalarySlipsList } from './components/payroll/SalarySlipsList';
import { DailyStaffReports } from './components/reports/DailyStaffReports';
import { ReportsView } from './components/reports/ReportsView';
import { NotificationsList } from './components/notifications/NotificationsList';
import { CustomerPortalView } from './components/portal/CustomerPortalView';
import { SettingsView } from './components/settings/SettingsView';
import { DocumentsCenterView } from './components/documents/DocumentsCenterView';
import { FloatingWhatsAppWidget } from './components/common/FloatingWhatsAppWidget';
import { AiTravelAssistantWidget } from './components/common/AiTravelAssistantWidget';

const MainContent: React.FC = () => {
  const { activeTab } = useData();
  const { currentUser } = useAuth();

  // If role is strictly customer, render the customer portal view directly with complete isolation
  if (currentUser?.role === 'customer') {
    return <CustomerPortalView />;
  }

  switch (activeTab) {
    case 'dashboard':
      return <Dashboard />;
    case 'customers':
      return <CustomerList />;
    case 'bookings':
      return <BookingList />;
    case 'packages':
      return <PackageList />;
    case 'hotels':
      return <HotelList />;
    case 'visas':
      return <VisaList />;
    case 'vouchers':
      return <VoucherList />;
    case 'group-leaders':
    case 'group-reports':
      return <GroupLeaderReports />;
    case 'customer-portal':
      return <CustomerPortalView />;
    case 'payments':
      return <PaymentsList />;
    case 'receivables':
      return <ReceivablesView />;
    case 'invoices':
      return <InvoicesList />;
    case 'documents-center':
      return <DocumentsCenterView />;
    case 'expenses':
      return <ExpensesList />;
    case 'bank-accounts':
      return <BankAccountsView />;
    case 'salaries':
    case 'salary-slips':
      return <SalarySlipsList />;
    case 'staff-reports':
      return <DailyStaffReports />;
    case 'reports':
    case 'analytics':
      return <ReportsView />;
    case 'settings':
      return <SettingsView />;
    case 'notifications':
      return <NotificationsList />;
    default:
      return <Dashboard />;
  }
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Route Protection: If not authenticated, force Login/Registration View
  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-[#021812] text-[#f5ecd0] font-sans flex flex-col selection:bg-[#d4af37] selection:text-[#021812] relative">
      {/* Ambient Royal Emerald & Champagne Light Gradients */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-[#047857]/15 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Section */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar bg-[#021812]">
          <Header />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
            <MainContent />
          </main>
        </div>
      </div>

      {/* Floating Widgets */}
      <div className="no-print relative z-50">
        <AiTravelAssistantWidget />
        <FloatingWhatsAppWidget />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
