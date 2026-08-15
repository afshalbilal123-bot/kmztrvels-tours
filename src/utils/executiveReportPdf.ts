import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Booking, Payment, Expense, Customer, SalarySlip, Package, Hotel, CompanySettings } from '../types';

export interface ExecutiveReportData {
  reportTab: string;
  reportTabLabel: string;
  dateRangeText: string;
  customerFilterText: string;
  packageFilterText: string;
  searchFilterText: string;
  companySettings?: CompanySettings;
  financials: {
    grossSalesVolume: number;
    totalPaymentsCollected: number;
    totalReceivableBalance: number;
    totalHotelsCost: number;
    totalFlightsCost: number;
    totalVisasCost: number;
    directCostOfSales: number;
    grossProfit: number;
    totalCompanyExpenses: number;
    totalPayrollExpenses: number;
    totalOperatingAndAdminExpenses: number;
    netOperatingProfit: number;
    netProfitMarginPercent: number;
  };
  filteredBookings: Booking[];
  filteredPayments: Payment[];
  filteredExpenses: Expense[];
  filteredCustomers: Customer[];
  filteredSalarySlips: SalarySlip[];
  packages: Package[];
  hotels: Hotel[];
  monthlyData: { month: string; sales: number; expenses: number; profit: number }[];
  channelData: { name: string; value: number }[];
  packageSummaries: { id: string; title: string; type: string; bookingsCount: number; totalSales: number; totalPaid: number; totalBalance: number }[];
  staffSummaries: { name: string; role: string; inquiries: number; bookingsCount: number; totalSales: number; paymentsCollected: number }[];
}

export const downloadExecutiveReportPDF = (data: ExecutiveReportData) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
    const margin = 12;
    const contentWidth = pageWidth - margin * 2; // 186mm

    const companyName = data.companySettings?.companyName || 'KMZ Travels & Tours (Pvt) Ltd';
    const ownerName = data.companySettings?.ownerName || 'Toheed Asghar Shahid';
    const address = data.companySettings?.address || 'P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad';
    const phone = data.companySettings?.phone || '03147861122';
    const whatsapp = data.companySettings?.whatsappNumber || '03018647596';
    const dtsLicense = data.companySettings?.dtsLicense || 'DTS/FSD/2024/9912';
    const ntnNumber = data.companySettings?.ntnNumber || 'NTN-7492018-9';

    // 1. Royal Gold & Emerald Header Accent Bar
    doc.setFillColor(212, 175, 55); // Champagne Gold (#d4af37)
    doc.rect(0, 0, pageWidth, 3, 'F');
    doc.setFillColor(2, 45, 34); // Royal Emerald (#022d22)
    doc.rect(0, 3, pageWidth, 1.5, 'F');

    let currentY = 10;

    // 2. Company Brand Logo & Header
    doc.setFillColor(2, 45, 34); // Royal Emerald
    doc.roundedRect(margin, currentY, 15, 15, 2, 2, 'F');
    doc.setFillColor(212, 175, 55); // Gold Inner Border
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin + 0.7, currentY + 0.7, 13.6, 13.6, 1.5, 1.5, 'S');

    doc.setTextColor(245, 236, 208); // Champagne
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('KMZ', margin + 7.5, currentY + 9.5, { align: 'center' });

    // Company Information
    doc.setTextColor(2, 45, 34); // Deep Emerald
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(companyName.toUpperCase(), margin + 18, currentY + 4.5);

    doc.setFontSize(8);
    doc.setTextColor(180, 83, 9); // Amber / Gold tone
    doc.text('EXECUTIVE FINANCIAL & OPERATIONAL AUDIT REPORT', margin + 18, currentY + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(80, 95, 90);
    doc.text(`${address} • Lic: ${dtsLicense} • NTN: ${ntnNumber}`, margin + 18, currentY + 13);

    // Right-aligned Meta Box
    const metaX = pageWidth - margin;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(2, 45, 34);
    doc.text(`REPORT: ${data.reportTabLabel.toUpperCase()}`, metaX, currentY + 4.5, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const nowStr = new Date().toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    doc.text(`Generated: ${nowStr}`, metaX, currentY + 8.5, { align: 'right' });
    doc.text(`Tel: ${phone} • WA: ${whatsapp}`, metaX, currentY + 12.5, { align: 'right' });

    currentY += 18;

    // Divider with subtle gold accent
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.4);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    currentY += 3;

    // 3. Active Filters & Scope Container (Luxury Warm Ivory Container)
    doc.setFillColor(253, 251, 247);
    doc.setDrawColor(226, 215, 185);
    doc.roundedRect(margin, currentY, contentWidth, 13, 1.5, 1.5, 'FD');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9);

    const colW = contentWidth / 4;
    doc.text('DATE PERIOD', margin + 3, currentY + 4.5);
    doc.text('CUSTOMER FILTER', margin + colW + 3, currentY + 4.5);
    doc.text('PACKAGE FILTER', margin + colW * 2 + 3, currentY + 4.5);
    doc.text('SEARCH SCOPE', margin + colW * 3 + 3, currentY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(2, 45, 34);

    const truncate = (str: string, maxLen: number) => (str.length > maxLen ? str.substring(0, maxLen - 2) + '...' : str);
    doc.text(truncate(data.dateRangeText, 25), margin + 3, currentY + 9.5);
    doc.text(truncate(data.customerFilterText, 25), margin + colW + 3, currentY + 9.5);
    doc.text(truncate(data.packageFilterText, 25), margin + colW * 2 + 3, currentY + 9.5);
    doc.text(truncate(data.searchFilterText, 25), margin + colW * 3 + 3, currentY + 9.5);

    currentY += 16;

    // 4. Executive KPI Summary Cards / Matrix
    const {
      grossSalesVolume,
      totalPaymentsCollected,
      totalReceivableBalance,
      netOperatingProfit,
      netProfitMarginPercent,
      directCostOfSales,
      totalOperatingAndAdminExpenses,
      grossProfit,
    } = data.financials;

    const kpiCardW = (contentWidth - 6) / 4;
    const kpiCardH = 16;

    // Card 1: Gross Sales
    doc.setFillColor(254, 252, 246);
    doc.setDrawColor(212, 175, 55);
    doc.roundedRect(margin, currentY, kpiCardW, kpiCardH, 1.5, 1.5, 'FD');
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text('GROSS SALES VOLUME', margin + 3, currentY + 4);
    doc.setFontSize(9.5);
    doc.setTextColor(2, 45, 34);
    doc.text(`PKR ${grossSalesVolume.toLocaleString()}`, margin + 3, currentY + 9.5);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`${data.filteredBookings.length} Total Bookings`, margin + 3, currentY + 13.5);

    // Card 2: Payments Collected
    const card2X = margin + kpiCardW + 2;
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(card2X, currentY, kpiCardW, kpiCardH, 1.5, 1.5, 'FD');
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(21, 128, 61);
    doc.text('TOTAL RECOVERED / PAID', card2X + 3, currentY + 4);
    doc.setFontSize(9.5);
    doc.setTextColor(21, 128, 61);
    doc.text(`PKR ${totalPaymentsCollected.toLocaleString()}`, card2X + 3, currentY + 9.5);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Bank, Cash & Online Desks', card2X + 3, currentY + 13.5);

    // Card 3: Outstanding Receivables
    const card3X = card2X + kpiCardW + 2;
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(card3X, currentY, kpiCardW, kpiCardH, 1.5, 1.5, 'FD');
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(185, 28, 28);
    doc.text('PENDING RECEIVABLES', card3X + 3, currentY + 4);
    doc.setFontSize(9.5);
    doc.setTextColor(185, 28, 28);
    doc.text(`PKR ${totalReceivableBalance.toLocaleString()}`, card3X + 3, currentY + 9.5);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Uncollected Balance', card3X + 3, currentY + 13.5);

    // Card 4: Net Operating Profit
    const card4X = card3X + kpiCardW + 2;
    doc.setFillColor(242, 248, 245);
    doc.setDrawColor(110, 231, 183);
    doc.roundedRect(card4X, currentY, kpiCardW, kpiCardH, 1.5, 1.5, 'FD');
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(2, 45, 34);
    doc.text('NET OPERATING PROFIT', card4X + 3, currentY + 4);
    doc.setFontSize(9.5);
    doc.setTextColor(2, 45, 34);
    doc.text(`PKR ${netOperatingProfit.toLocaleString()}`, card4X + 3, currentY + 9.5);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(21, 128, 61);
    doc.text(`Net Margin: ${netProfitMarginPercent.toFixed(1)}%`, card4X + 3, currentY + 13.5);

    currentY += kpiCardH + 4;

    // 5. Default Table Styles (Royal Emerald + Champagne Gold)
    const defaultTableStyles = {
      theme: 'grid' as const,
      headStyles: {
        fillColor: [2, 45, 34] as [number, number, number], // Deep Royal Emerald
        textColor: [245, 236, 208] as [number, number, number], // Champagne Gold
        fontSize: 7.5,
        fontStyle: 'bold' as const,
        halign: 'left' as const,
        cellPadding: 2.2,
      },
      styles: {
        fontSize: 7,
        cellPadding: 2,
        textColor: [30, 41, 59] as [number, number, number],
        lineColor: [226, 232, 240] as [number, number, number],
        lineWidth: 0.2,
      },
      alternateRowStyles: {
        fillColor: [253, 251, 247] as [number, number, number], // Warm Ivory
      },
      margin: { left: margin, right: margin },
    };

    if (data.reportTab === 'pnl') {
      // P&L Statement Tables
      autoTable(doc, {
        ...defaultTableStyles,
        startY: currentY,
        head: [['P&L Financial Line Item', 'Category', 'Amount (PKR)', 'Revenue %']],
        body: [
          ['Gross Sales Volume (Booked Revenue)', 'Sales Revenue', `PKR ${grossSalesVolume.toLocaleString()}`, '100.0%'],
          ['Direct Hotel Accommodations Cost', 'Cost of Sales (COGS)', `PKR ${data.financials.totalHotelsCost.toLocaleString()}`, grossSalesVolume > 0 ? `${((data.financials.totalHotelsCost / grossSalesVolume) * 100).toFixed(1)}%` : '0%'],
          ['Direct Airline Flights & Reservations', 'Cost of Sales (COGS)', `PKR ${data.financials.totalFlightsCost.toLocaleString()}`, grossSalesVolume > 0 ? `${((data.financials.totalFlightsCost / grossSalesVolume) * 100).toFixed(1)}%` : '0%'],
          ['Direct Visa Processing & Nusuk Fees', 'Cost of Sales (COGS)', `PKR ${data.financials.totalVisasCost.toLocaleString()}`, grossSalesVolume > 0 ? `${((data.financials.totalVisasCost / grossSalesVolume) * 100).toFixed(1)}%` : '0%'],
          ['Total Direct Cost of Sales', 'Total Direct Costs', `PKR ${directCostOfSales.toLocaleString()}`, grossSalesVolume > 0 ? `${((directCostOfSales / grossSalesVolume) * 100).toFixed(1)}%` : '0%'],
          ['Gross Trading Profit', 'Gross Margin', `PKR ${grossProfit.toLocaleString()}`, grossSalesVolume > 0 ? `${((grossProfit / grossSalesVolume) * 100).toFixed(1)}%` : '0%'],
          ['Operating & Administrative Expenses', 'OPEX', `PKR ${data.financials.totalCompanyExpenses.toLocaleString()}`, grossSalesVolume > 0 ? `${((data.financials.totalCompanyExpenses / grossSalesVolume) * 100).toFixed(1)}%` : '0%'],
          ['Staff Payroll & Consultant Compensation', 'Payroll OPEX', `PKR ${data.financials.totalPayrollExpenses.toLocaleString()}`, grossSalesVolume > 0 ? `${((data.financials.totalPayrollExpenses / grossSalesVolume) * 100).toFixed(1)}%` : '0%'],
          ['Total Operating & Administrative Overhead', 'Total OPEX', `PKR ${totalOperatingAndAdminExpenses.toLocaleString()}`, grossSalesVolume > 0 ? `${((totalOperatingAndAdminExpenses / grossSalesVolume) * 100).toFixed(1)}%` : '0%'],
          ['Net Operating Profit (Before Tax)', 'Net Earnings', `PKR ${netOperatingProfit.toLocaleString()}`, `${netProfitMarginPercent.toFixed(1)}%`],
        ],
        didParseCell: (hookData) => {
          if (hookData.section === 'body') {
            if (hookData.row.index === 0 || hookData.row.index === 5 || hookData.row.index === 9) {
              hookData.cell.styles.fontStyle = 'bold';
              if (hookData.row.index === 9) {
                hookData.cell.styles.fillColor = [240, 253, 244];
                hookData.cell.styles.textColor = [2, 45, 34];
              } else if (hookData.row.index === 5) {
                hookData.cell.styles.fillColor = [254, 252, 246];
                hookData.cell.styles.textColor = [180, 83, 9];
              }
            }
          }
        },
      });

      const finalY = (doc as any).lastAutoTable?.finalY || currentY + 60;
      if (data.monthlyData.length > 0 && finalY < pageHeight - 50) {
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(2, 45, 34);
        doc.text('Monthly Financial Performance Trend', margin, finalY + 7);

        autoTable(doc, {
          ...defaultTableStyles,
          startY: finalY + 9,
          head: [['Month', 'Sales Revenue', 'Direct & OPEX Expenses', 'Net Profit', 'Profit Margin']],
          body: data.monthlyData.map((m) => [
            m.month,
            `PKR ${m.sales.toLocaleString()}`,
            `PKR ${m.expenses.toLocaleString()}`,
            `PKR ${m.profit.toLocaleString()}`,
            m.sales > 0 ? `${((m.profit / m.sales) * 100).toFixed(1)}%` : '0.0%',
          ]),
        });
      }
    } else if (data.reportTab === 'sales') {
      // Sales & Bookings Table
      autoTable(doc, {
        ...defaultTableStyles,
        startY: currentY,
        head: [['Booking Ref', 'Customer Name', 'Phone', 'Package Title', 'Departure', 'Total (PKR)', 'Paid (PKR)', 'Balance', 'Status']],
        body: data.filteredBookings.map((b) => [
          b.bookingNumber,
          b.customerName,
          b.customerPhone,
          b.packageName || 'Umrah Package',
          b.departureDate || 'N/A',
          b.totalAmount.toLocaleString(),
          b.paidAmount.toLocaleString(),
          b.balanceAmount.toLocaleString(),
          b.bookingStatus,
        ]),
      });
    } else if (data.reportTab === 'customers') {
      // Customers Directory Table
      autoTable(doc, {
        ...defaultTableStyles,
        startY: currentY,
        head: [['Customer Name', 'Phone Number', 'City / Region', 'Passport #', 'Total Bookings', 'Total Spent (PKR)', 'Balance Due']],
        body: data.filteredCustomers.map((c) => [
          c.fullName,
          c.phone,
          c.city || 'Pakistan',
          c.passportNumber || 'N/A',
          String(c.totalBookings || 1),
          (c.totalSpent || 0).toLocaleString(),
          data.filteredBookings
            .filter((b) => b.customerId === c.id)
            .reduce((sum, b) => sum + b.balanceAmount, 0)
            .toLocaleString(),
        ]),
      });
    } else if (data.reportTab === 'payments') {
      // Payment Receipts Table
      autoTable(doc, {
        ...defaultTableStyles,
        startY: currentY,
        head: [['Receipt #', 'Booking Ref', 'Customer Name', 'Method', 'Amount (PKR)', 'Date', 'Status', 'Reference / TXN']],
        body: data.filteredPayments.map((p) => [
          p.receiptNumber,
          p.bookingNumber,
          p.customerName,
          p.paymentMethod,
          p.amount.toLocaleString(),
          p.date,
          p.status,
          p.referenceNumber || p.transactionId || 'Direct Settlement',
        ]),
      });
    } else if (data.reportTab === 'channels') {
      // Payment Channels Breakdown Table
      autoTable(doc, {
        ...defaultTableStyles,
        startY: currentY,
        head: [['Payment Channel / Gateway', 'Total Collected (PKR)', 'Share of Collections', 'Operational Status']],
        body: data.channelData.map((c) => [
          c.name,
          `PKR ${c.value.toLocaleString()}`,
          totalPaymentsCollected > 0 ? `${((c.value / totalPaymentsCollected) * 100).toFixed(1)}%` : '0%',
          'Active & Verified',
        ]),
      });
    } else if (data.reportTab === 'expenses') {
      // Expense Reports Table
      autoTable(doc, {
        ...defaultTableStyles,
        startY: currentY,
        head: [['Expense #', 'Category', 'Expense Description / Title', 'Vendor / Payee', 'Method', 'Amount (PKR)', 'Date', 'Status']],
        body: data.filteredExpenses.map((e) => [
          e.expenseNumber,
          e.category,
          e.title,
          e.vendorName || 'General Payee',
          e.paymentMethod,
          e.amount.toLocaleString(),
          e.date,
          e.status,
        ]),
      });
    } else if (data.reportTab === 'packages') {
      // Packages Performance Table
      autoTable(doc, {
        ...defaultTableStyles,
        startY: currentY,
        head: [['Package Title', 'Type', 'Active Bookings', 'Gross Sales (PKR)', 'Paid Collections (PKR)', 'Pending Balance']],
        body: data.packageSummaries.map((p) => [
          p.title,
          p.type,
          String(p.bookingsCount),
          p.totalSales.toLocaleString(),
          p.totalPaid.toLocaleString(),
          p.totalBalance.toLocaleString(),
        ]),
      });
    } else if (data.reportTab === 'flights-hotels') {
      // Flight & Hotel Accommodations
      const rows: string[][] = [];
      data.filteredBookings.forEach((b) => {
        const hotelStr = b.hotels && b.hotels.length > 0 
          ? b.hotels.map(h => `${h.city}: ${h.hotelName} (${h.roomType})`).join('; ') 
          : 'Custom Hotel Accommodation';
        const flightStr = b.flight 
          ? `${b.flight.airline || 'Airline'} (${b.flight.flightNumber || 'Flight'}) PNR: ${b.flight.pnr || 'N/A'}`
          : 'Self Arranged / Group';
        rows.push([b.bookingNumber, b.customerName, hotelStr, flightStr, b.departureDate || 'N/A', b.returnDate || 'N/A']);
      });
      autoTable(doc, {
        ...defaultTableStyles,
        startY: currentY,
        head: [['Booking Ref', 'Pilgrim Name', 'Hotel Accommodations Booked', 'Flight Details & PNR', 'Check-In/Dep', 'Check-Out/Ret']],
        body: rows,
      });
    } else if (data.reportTab === 'visas') {
      // Visa Processing Reports Table
      autoTable(doc, {
        ...defaultTableStyles,
        startY: currentY,
        head: [['Booking Ref', 'Pilgrim Name', 'Contact Phone', 'Visa Type', 'Applicants (Pax)', 'Visa Status', 'Fee (PKR)']],
        body: data.filteredBookings.map((b) => [
          b.bookingNumber,
          b.customerName,
          b.customerPhone,
          b.visa?.visaType || 'Umrah E-Visa (Nusuk)',
          String(b.paxAdults + b.paxChildren + b.paxInfants),
          b.visa?.status || 'Approved',
          ((b.visa?.fee || 0) * (b.paxAdults + b.paxChildren)).toLocaleString(),
        ]),
      });
    } else if (data.reportTab === 'vouchers') {
      // Service Vouchers Reports Table
      autoTable(doc, {
        ...defaultTableStyles,
        startY: currentY,
        head: [['Voucher Ref', 'Customer Name', 'Contact', 'Package Booked', 'Travel Dates', 'Total Pax', 'Voucher Status']],
        body: data.filteredBookings.map((b) => [
          `VOUCH-${b.bookingNumber}`,
          b.customerName,
          b.customerPhone,
          b.packageName || 'Umrah Package',
          `${b.departureDate || ''} to ${b.returnDate || ''}`,
          String(b.paxAdults + b.paxChildren + b.paxInfants),
          'Verified & Issued',
        ]),
      });
    } else if (data.reportTab === 'staff') {
      // Staff Performance Table
      autoTable(doc, {
        ...defaultTableStyles,
        startY: currentY,
        head: [['Team Member / Consultant', 'Designation', 'New Inquiries', 'Bookings Closed', 'Total Sales (PKR)', 'Collected Amount']],
        body: data.staffSummaries.map((s) => [
          s.name,
          s.role,
          String(s.inquiries),
          String(s.bookingsCount),
          s.totalSales.toLocaleString(),
          s.paymentsCollected.toLocaleString(),
        ]),
      });
    } else if (data.reportTab === 'receivables') {
      // Receivables & Overdue Balances Table
      autoTable(doc, {
        ...defaultTableStyles,
        startY: currentY,
        head: [['Customer Name', 'Phone Number', 'Booking Ref', 'Package Title', 'Total (PKR)', 'Paid (PKR)', 'Balance Due (PKR)', 'Priority']],
        body: data.filteredBookings
          .filter((b) => b.balanceAmount > 0)
          .map((b) => [
            b.customerName,
            b.customerPhone,
            b.bookingNumber,
            b.packageName || 'Umrah Package',
            b.totalAmount.toLocaleString(),
            b.paidAmount.toLocaleString(),
            b.balanceAmount.toLocaleString(),
            b.balanceAmount > 200000 ? 'High Priority' : 'Normal',
          ]),
      });
    } else if (data.reportTab === 'manifest') {
      // Group Leader Manifest
      autoTable(doc, {
        ...defaultTableStyles,
        startY: currentY,
        head: [['Group Leader / Ref', 'Pilgrim Name', 'Contact Phone', 'Total Pax', 'Departure Date', 'Hotels Booked']],
        body: data.filteredBookings.map((b) => [
          b.groupLeaderName || b.bookingNumber,
          b.customerName,
          b.customerPhone,
          `${b.paxAdults} Ad, ${b.paxChildren} Ch, ${b.paxInfants} Inf`,
          b.departureDate || 'N/A',
          b.hotels.map(h => h.hotelName).join(', ') || 'Reserved Hotel',
        ]),
      });
    } else {
      // General Fallback
      autoTable(doc, {
        ...defaultTableStyles,
        startY: currentY,
        head: [['Reference #', 'Customer Name', 'Contact Phone', 'Package / Service', 'Total (PKR)', 'Paid (PKR)', 'Balance Due', 'Status']],
        body: data.filteredBookings.map((b) => [
          b.bookingNumber,
          b.customerName,
          b.customerPhone,
          b.packageName || 'Umrah Service',
          b.totalAmount.toLocaleString(),
          b.paidAmount.toLocaleString(),
          b.balanceAmount.toLocaleString(),
          b.bookingStatus,
        ]),
      });
    }

    // 6. Add Footer & Page Numbers to All Pages
    const totalPages = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(
        `${companyName} • Confidential Executive Report • Verified by ${ownerName}`,
        margin,
        pageHeight - 8
      );

      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
    }

    // 7. Save file as KMZ-Executive-Report.pdf with Blob fallback
    try {
      doc.save('KMZ-Executive-Report.pdf');
    } catch (saveErr) {
      console.warn('doc.save failed, executing Blob fallback trigger:', saveErr);
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = 'KMZ-Executive-Report.pdf';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    }
  } catch (error) {
    console.error('Error generating executive report PDF:', error);
    throw error;
  }
};
