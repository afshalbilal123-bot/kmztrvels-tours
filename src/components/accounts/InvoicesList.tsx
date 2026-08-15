import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  Eye,
  Plus,
  Search,
  Filter,
  DollarSign,
  Building2,
  Plane,
  Bus,
  Receipt,
  Layers,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Sparkles,
  ShieldCheck,
  Tag,
  CreditCard,
  Download,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Invoice, InvoiceType, InvoiceItem, PaymentMethod, Payment } from '../../types';
import { GoldBadge } from '../common/GoldBadge';
import { generateInvoicePDF, generatePaymentReceiptPDF } from '../../utils/pdfGenerator';

export const InvoicesList: React.FC = () => {
  const {
    invoices,
    bookings,
    customers,
    bankAccounts,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    recordPaymentForInvoice,
    generateServiceInvoicesForBooking,
  } = useData();

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(invoices[0]?.id || null);

  const selectedInvoice = useMemo(() => {
    if (selectedInvoiceId) {
      const found = invoices.find((inv) => inv.id === selectedInvoiceId);
      if (found) return found;
    }
    return invoices[0] || null;
  }, [invoices, selectedInvoiceId]);

  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('All');
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isAutoGenerateModalOpen, setIsAutoGenerateModalOpen] = useState<boolean>(false);

  // Form State for Create/Edit Invoice
  const [formType, setFormType] = useState<InvoiceType>('Umrah Package Invoice');
  const [formBookingId, setFormBookingId] = useState<string>('');
  const [formCustomerId, setFormCustomerId] = useState<string>('');
  const [formCustomerName, setFormCustomerName] = useState<string>('');
  const [formCustomerPhone, setFormCustomerPhone] = useState<string>('');
  const [formCustomerEmail, setFormCustomerEmail] = useState<string>('');
  const [formCustomerAddress, setFormCustomerAddress] = useState<string>('');
  const [formPassportNumber, setFormPassportNumber] = useState<string>('');
  const [formIssueDate, setFormIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formDueDate, setFormDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formNotes, setFormNotes] = useState<string>('');
  const [formTerms, setFormTerms] = useState<string>('Payment is due within 14 days of issue date. All rates subject to KMZ terms & Saudi Hajj/Umrah regulations.');
  const [formTax, setFormTax] = useState<number>(0);
  const [formDiscount, setFormDiscount] = useState<number>(0);
  const [formItems, setFormItems] = useState<InvoiceItem[]>([
    { description: 'Umrah Service Package', qty: 1, unitPrice: 150000, discount: 0, total: 150000 },
  ]);

  // Payment Form State
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Bank Transfer');
  const [payBankAccountId, setPayBankAccountId] = useState<string>('');
  const [payRefNo, setPayRefNo] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');

  // Auto Generate Booking selector state
  const [selectedBookingForAuto, setSelectedBookingForAuto] = useState<string>('');

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Type filter
      if (activeTypeFilter !== 'All' && inv.invoiceType !== activeTypeFilter) {
        return false;
      }
      // Status filter
      if (activeStatusFilter !== 'All' && inv.status !== activeStatusFilter) {
        return false;
      }
      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchNum = inv.invoiceNumber.toLowerCase().includes(query);
        const matchName = inv.customerName.toLowerCase().includes(query);
        const matchBooking = inv.bookingNumber.toLowerCase().includes(query);
        const matchPhone = inv.customerPhone.toLowerCase().includes(query);
        const matchPassport = inv.passportNumber?.toLowerCase().includes(query);
        return matchNum || matchName || matchBooking || matchPhone || matchPassport;
      }
      return true;
    });
  }, [invoices, activeTypeFilter, activeStatusFilter, searchTerm]);

  // Current linked booking details for preview
  const currentBooking = selectedInvoice
    ? bookings.find((b) => b.id === selectedInvoice.bookingId || b.bookingNumber === selectedInvoice.bookingNumber)
    : null;

  // Resolve target invoice dynamically from DB/Context to eliminate stale references
  const resolveInvoice = (invInput?: Invoice | string | null): Invoice | null => {
    if (!invInput) {
      if (selectedInvoiceId) {
        return invoices.find((i) => i.id === selectedInvoiceId) || invoices[0] || null;
      }
      return invoices[0] || null;
    }
    const id = typeof invInput === 'string' ? invInput : invInput.id;
    const found = invoices.find((i) => i.id === id);
    if (found) return found;
    return typeof invInput === 'object' ? invInput : null;
  };

  // Dedicated A4 Print & PDF Document Generator
  const generatePrintDocument = (invInput?: Invoice | string | null) => {
    const targetInv = resolveInvoice(invInput);
    if (!targetInv) {
      alert('Selected invoice could not be found in the database.');
      return;
    }

    // Keep active preview state aligned
    setSelectedInvoiceId(targetInv.id);

    const origTitle = document.title;
    const sanitizedCustomer = (targetInv.customerName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${targetInv.invoiceNumber}_${sanitizedCustomer}`;
    document.title = `${fileName}_Invoice`;

    // Find child invoices if this is a Consolidated Total Invoice
    const childInvoices = targetInv.invoiceType === 'Consolidated Total Invoice'
      ? invoices.filter(
          (i) => i.bookingId === targetInv.bookingId && i.invoiceType !== 'Consolidated Total Invoice'
        )
      : [];

    const printWindow = window.open('', '_blank', 'width=880,height=1100');
    if (!printWindow) {
      alert('Please allow popup windows in your browser to print/download invoice PDFs.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${fileName}_Invoice</title>
          <meta charset="utf-8" />
          <style>
            @page { size: A4; margin: 12mm; }
            * { box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 24px; background: #ffffff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2.5px solid #d97706; padding-bottom: 16px; margin-bottom: 20px; }
            .brand-box { display: flex; align-items: center; gap: 14px; }
            .logo { width: 54px; height: 54px; background: #d97706; color: #ffffff; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 22px; font-family: Georgia, serif; box-shadow: 0 4px 6px -1px rgba(217,119,6,0.3); }
            .company-title { font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; font-family: Georgia, serif; letter-spacing: 0.5px; }
            .type-badge { display: inline-block; font-size: 11px; font-weight: 800; color: #b45309; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 6px; padding: 2px 8px; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
            .address { font-size: 10px; color: #64748b; margin-top: 4px; font-weight: 500; }
            
            .meta-box { text-align: right; }
            .inv-no { font-size: 18px; font-weight: 900; color: #b45309; font-family: monospace; letter-spacing: -0.5px; }
            .meta-item { font-size: 11px; color: #475569; margin-top: 2px; }
            
            .grid-details { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px; font-size: 11px; }
            .label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #b45309; margin-bottom: 4px; letter-spacing: 0.5px; }
            .val-bold { font-size: 13px; font-weight: 800; color: #0f172a; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
            th { background: #0f172a; color: #fbbf24; text-align: left; padding: 10px 12px; font-weight: 800; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
            td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #334155; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-mono { font-family: monospace; font-weight: 700; }
            
            .child-inv-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; }
            
            .finance-row { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
            .terms-box { max-width: 380px; font-size: 10px; color: #64748b; line-height: 1.5; }
            .summary-card { width: 270px; background: #fffbeb; border: 1.5px solid #fcd34d; border-radius: 12px; padding: 14px; font-size: 11px; }
            .s-row { display: flex; justify-content: space-between; margin-bottom: 5px; color: #475569; }
            .s-row.grand { border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 8px; font-size: 14px; font-weight: 900; color: #b45309; }
            .s-row.paid { color: #16a34a; font-weight: 800; }
            .s-row.due { border-top: 1.5px solid #fcd34d; padding-top: 8px; margin-top: 8px; font-size: 14px; font-weight: 900; color: #dc2626; }
            
            .stamp-footer { margin-top: 36px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748b; }
            .seal-box { border: 2px dashed #d97706; color: #d97706; padding: 8px 16px; font-weight: 900; text-transform: uppercase; border-radius: 8px; letter-spacing: 1.5px; text-align: center; background: #fffbeb; }
            
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand-box">
              <div class="logo">KMZ</div>
              <div>
                <h1 class="company-title">KMZ TRAVELS & TOURS</h1>
                <div class="type-badge">${targetInv.invoiceType}</div>
                <div class="address">P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad • DTS Lic # 8820</div>
              </div>
            </div>
            <div class="meta-box">
              <div class="inv-no">INVOICE #${targetInv.invoiceNumber}</div>
              <div class="meta-item">Issue Date: ${targetInv.issueDate}</div>
              <div class="meta-item">Due Date: ${targetInv.dueDate}</div>
              <div class="meta-item" style="color: #b45309; font-weight: 800; margin-top: 4px;">WhatsApp: 03018647596</div>
            </div>
          </div>

          <div class="grid-details">
            <div>
              <div class="label">Billed To (Customer / Pilgrim)</div>
              <div class="val-bold">${targetInv.customerName}</div>
              <div>Phone: ${targetInv.customerPhone}</div>
              ${targetInv.customerEmail ? `<div>Email: ${targetInv.customerEmail}</div>` : ''}
              ${targetInv.customerAddress ? `<div>Address: ${targetInv.customerAddress}</div>` : ''}
              ${targetInv.passportNumber ? `<div style="font-family: monospace; font-weight: 700; color: #b45309; margin-top: 2px;">Passport #: ${targetInv.passportNumber}</div>` : ''}
            </div>
            <div style="text-align: right;">
              <div class="label">Booking & Service Details</div>
              <div style="font-family: monospace; font-weight: 800; color: #b45309;">Booking #${targetInv.bookingNumber}</div>
              <div>Payment Status: <strong style="color: ${targetInv.status === 'Paid' ? '#16a34a' : targetInv.status === 'Partially Paid' ? '#d97706' : '#dc2626'}">${targetInv.status}</strong></div>
              <div>Service Category: ${targetInv.invoiceType}</div>
            </div>
          </div>

          ${childInvoices.length > 0 ? `
            <div class="child-inv-box">
              <div class="label" style="margin-bottom: 6px;">Consolidated Service Breakdown for Booking #${targetInv.bookingNumber}</div>
              <table style="font-size: 10px; margin-bottom: 0;">
                <thead>
                  <tr style="background: #334155; color: #fff;">
                    <th>Service Invoice #</th>
                    <th>Invoice Type</th>
                    <th class="text-right">Total Amount</th>
                    <th class="text-right">Paid</th>
                    <th class="text-right">Balance Due</th>
                    <th class="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${childInvoices.map((ci) => `
                    <tr>
                      <td class="font-mono" style="font-weight: 800; color: #b45309;">${ci.invoiceNumber}</td>
                      <td>${ci.invoiceType}</td>
                      <td class="text-right font-mono">PKR ${ci.totalAmount.toLocaleString()}</td>
                      <td class="text-right font-mono" style="color: #16a34a;">PKR ${ci.paidAmount.toLocaleString()}</td>
                      <td class="text-right font-mono" style="color: ${ci.balanceDue > 0 ? '#dc2626' : '#16a34a'};">PKR ${ci.balanceDue.toLocaleString()}</td>
                      <td class="text-center"><strong>${ci.status}</strong></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          <table>
            <thead>
              <tr>
                <th>Service Description</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Rate (PKR)</th>
                <th class="text-right">Discount (PKR)</th>
                <th class="text-right">Total Amount (PKR)</th>
              </tr>
            </thead>
            <tbody>
              ${targetInv.items.map(item => `
                <tr>
                  <td><strong>${item.description}</strong></td>
                  <td class="text-center font-mono">${item.qty}</td>
                  <td class="text-right font-mono">PKR ${item.unitPrice.toLocaleString()}</td>
                  <td class="text-right font-mono" style="color: #16a34a;">${item.discount ? `- PKR ${item.discount.toLocaleString()}` : '-'}</td>
                  <td class="text-right font-mono" style="color: #b45309;">PKR ${item.total.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          ${targetInv.paymentHistory && targetInv.paymentHistory.length > 0 ? `
            <div style="margin-bottom: 20px;">
              <div class="label" style="margin-bottom: 8px;">Dedicated Payment History & Receipts</div>
              <table style="font-size: 10px;">
                <thead>
                  <tr style="background: #334155; color: #fff;">
                    <th>Receipt Number</th>
                    <th>Date</th>
                    <th>Payment Method</th>
                    <th>Reference / Txn #</th>
                    <th class="text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody>
                  ${targetInv.paymentHistory.map(ph => `
                    <tr>
                      <td class="font-mono" style="font-weight: 800; color: #b45309;">${ph.receiptNumber}</td>
                      <td>${ph.date}</td>
                      <td>${ph.paymentMethod}</td>
                      <td>${ph.referenceNumber || '-'}</td>
                      <td class="text-right font-mono" style="font-weight: 800; color: #16a34a;">PKR ${ph.amount.toLocaleString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          <div class="finance-row">
            <div class="terms-box">
              <div class="label">Notes & Terms</div>
              <p style="margin: 4px 0;">${targetInv.notes || 'All travel services operated under KMZ Travels & Tours license.'}</p>
              <p style="margin: 4px 0; font-style: italic;">Thank you for trusting KMZ Travels & Tours for your sacred pilgrimage.</p>
            </div>
            <div class="summary-card">
              <div class="s-row">
                <span>Subtotal:</span>
                <span class="font-mono">PKR ${targetInv.subtotal.toLocaleString()}</span>
              </div>
              ${targetInv.taxAmount > 0 ? `<div class="s-row"><span>Tax / Fee:</span><span class="font-mono">PKR ${targetInv.taxAmount.toLocaleString()}</span></div>` : ''}
              ${targetInv.discountAmount > 0 ? `<div class="s-row" style="color: #16a34a;"><span>Discount:</span><span class="font-mono">- PKR ${targetInv.discountAmount.toLocaleString()}</span></div>` : ''}
              <div class="s-row grand">
                <span>Grand Total:</span>
                <span class="font-mono">PKR ${targetInv.totalAmount.toLocaleString()}</span>
              </div>
              <div class="s-row paid">
                <span>Total Paid:</span>
                <span class="font-mono">PKR ${targetInv.paidAmount.toLocaleString()}</span>
              </div>
              <div class="s-row due">
                <span>Remaining Balance:</span>
                <span class="font-mono">PKR ${targetInv.balanceDue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div class="stamp-footer">
            <div>
              <div style="font-weight: 800; color: #0f172a;">Toheed Asghar Shahid (Owner)</div>
              <div>Managing Director, KMZ Travels & Tours</div>
              <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad</div>
            </div>
            <div class="seal-box">
              KMZ OFFICIAL SEAL & STAMP
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 250);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();

    setTimeout(() => {
      document.title = origTitle;
    }, 1000);
  };

  const handlePrintForInvoice = (invInput?: Invoice | string | null) => {
    const targetInv = resolveInvoice(invInput);
    if (targetInv) {
      setSelectedInvoiceId(targetInv.id);
      generateInvoicePDF(targetInv, invoices);
    }
  };

  const handleDownloadPDF = (invInput?: Invoice | string | null) => {
    const targetInv = resolveInvoice(invInput);
    if (targetInv) {
      setSelectedInvoiceId(targetInv.id);
      generateInvoicePDF(targetInv, invoices);
    }
  };

  // Populate booking info on selection in Invoice Form
  const handleBookingChange = (bId: string) => {
    setFormBookingId(bId);
    const bk = bookings.find((b) => b.id === bId);
    if (bk) {
      setFormCustomerId(bk.customerId);
      setFormCustomerName(bk.customerName);
      setFormCustomerPhone(bk.customerPhone);
      const cust = customers.find((c) => c.id === bk.customerId);
      if (cust) {
        setFormCustomerEmail(cust.email || '');
        setFormCustomerAddress(cust.address || '');
        setFormPassportNumber(cust.passportNumber || '');
      }
      
      // Auto populate items based on invoice type
      if (formType === 'Umrah Package Invoice') {
        setFormItems([
          {
            description: `${bk.packageName} (${bk.paxAdults} Adults, ${bk.paxChildren} Children)`,
            qty: bk.paxAdults + bk.paxChildren,
            unitPrice: Math.round(bk.totalAmount / Math.max(1, bk.paxAdults + bk.paxChildren)),
            discount: 0,
            total: bk.totalAmount,
            serviceCategory: 'Package',
          },
        ]);
      } else if (formType === 'Hotel Invoice' && bk.hotels && bk.hotels.length > 0) {
        setFormItems(
          bk.hotels.map((h) => ({
            description: `${h.hotelName} (${h.city}) - ${h.roomType} Room, ${h.nights} Nights`,
            qty: h.nights,
            unitPrice: h.ratePerNight,
            discount: 0,
            total: h.totalRate,
            serviceCategory: 'Hotel',
          }))
        );
      } else if (formType === 'Flight Invoice' && bk.flight) {
        setFormItems([
          {
            description: `${bk.flight.airline} (${bk.flight.flightNumber}) - PNR: ${bk.flight.pnr}`,
            qty: bk.paxAdults + bk.paxChildren,
            unitPrice: Math.round(bk.flight.ticketPrice / Math.max(1, bk.paxAdults + bk.paxChildren)),
            discount: 0,
            total: bk.flight.ticketPrice,
            serviceCategory: 'Flight',
          },
        ]);
      } else if (formType === 'Visa Invoice' && bk.visa) {
        setFormItems([
          {
            description: `${bk.visa.visaType} Processing & Nusuk Fee (${bk.visa.nusukId || 'Portal'})`,
            qty: bk.paxAdults + bk.paxChildren,
            unitPrice: Math.round(bk.visa.fee / Math.max(1, bk.paxAdults + bk.paxChildren)),
            discount: 0,
            total: bk.visa.fee,
            serviceCategory: 'Visa',
          },
        ]);
      } else if (formType === 'Transport Invoice' && bk.transport) {
        setFormItems([
          {
            description: `${bk.transport.transportType} - ${bk.transport.route}`,
            qty: 1,
            unitPrice: 75000,
            discount: 0,
            total: 75000,
            serviceCategory: 'Transport',
          },
        ]);
      }
    }
  };

  // Item lines management
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...formItems];
    const item = { ...updated[index], [field]: value };
    if (field === 'qty' || field === 'unitPrice' || field === 'discount') {
      const qty = Number(item.qty) || 0;
      const rate = Number(item.unitPrice) || 0;
      const disc = Number(item.discount) || 0;
      item.total = Math.max(0, qty * rate - disc);
    }
    updated[index] = item;
    setFormItems(updated);
  };

  const handleAddItem = () => {
    setFormItems([
      ...formItems,
      { description: 'Additional Service Item', qty: 1, unitPrice: 10000, discount: 0, total: 10000 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (formItems.length > 1) {
      setFormItems(formItems.filter((_, i) => i !== index));
    }
  };

  // Form Totals Calculation
  const formSubtotal = formItems.reduce((sum, item) => sum + (item.total || 0), 0);
  const formGrandTotal = Math.max(0, formSubtotal + Number(formTax || 0) - Number(formDiscount || 0));

  // Open Create Modal
  const openCreateModal = () => {
    setFormType('Umrah Package Invoice');
    setFormBookingId('');
    setFormCustomerId('');
    setFormCustomerName('');
    setFormCustomerPhone('');
    setFormCustomerEmail('');
    setFormCustomerAddress('');
    setFormPassportNumber('');
    setFormIssueDate(new Date().toISOString().split('T')[0]);
    setFormDueDate(new Date().toISOString().split('T')[0]);
    setFormNotes('');
    setFormTax(0);
    setFormDiscount(0);
    setFormItems([
      { description: 'Umrah Service Package', qty: 1, unitPrice: 200000, discount: 0, total: 200000 },
    ]);
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (inv: Invoice) => {
    setSelectedInvoiceId(inv.id);
    setFormType(inv.invoiceType);
    setFormBookingId(inv.bookingId);
    setFormCustomerId(inv.customerId);
    setFormCustomerName(inv.customerName);
    setFormCustomerPhone(inv.customerPhone);
    setFormCustomerEmail(inv.customerEmail || '');
    setFormCustomerAddress(inv.customerAddress || '');
    setFormPassportNumber(inv.passportNumber || '');
    setFormIssueDate(inv.issueDate);
    setFormDueDate(inv.dueDate);
    setFormNotes(inv.notes || '');
    setFormTerms(inv.terms || 'Payment due within 14 days.');
    setFormTax(inv.taxAmount || 0);
    setFormDiscount(inv.discountAmount || 0);
    setFormItems(inv.items.map((i) => ({ ...i })));
    setIsEditModalOpen(true);
  };

  // Open Payment Modal
  const openPaymentModal = (inv: Invoice) => {
    setSelectedInvoiceId(inv.id);
    setPayAmount(inv.balanceDue > 0 ? inv.balanceDue : inv.totalAmount);
    setPayMethod('Bank Transfer');
    setPayBankAccountId(bankAccounts[0]?.id || '');
    setPayRefNo('');
    setPayNotes(`Payment against ${inv.invoiceType} #${inv.invoiceNumber}`);
    setIsPaymentModalOpen(true);
  };

  // Save Created Invoice
  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerName.trim()) {
      alert('Please enter or select a customer.');
      return;
    }

    const created = addInvoice({
      invoiceType: formType,
      bookingId: formBookingId || `b-${Date.now()}`,
      bookingNumber: formBookingId ? (bookings.find((b) => b.id === formBookingId)?.bookingNumber || 'KMZ-MANUAL') : 'KMZ-DIRECT',
      customerId: formCustomerId || `c-${Date.now()}`,
      customerName: formCustomerName,
      customerPhone: formCustomerPhone,
      customerEmail: formCustomerEmail,
      customerAddress: formCustomerAddress,
      passportNumber: formPassportNumber,
      issueDate: formIssueDate,
      dueDate: formDueDate,
      subtotal: formSubtotal,
      taxAmount: Number(formTax || 0),
      discountAmount: Number(formDiscount || 0),
      totalAmount: formGrandTotal,
      paidAmount: 0,
      balanceDue: formGrandTotal,
      status: 'Unpaid',
      items: formItems,
      notes: formNotes,
      terms: formTerms,
    });

    setSelectedInvoiceId(created.id);
    setIsCreateModalOpen(false);
  };

  // Save Edit Invoice
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    const updatedInv: Invoice = {
      ...selectedInvoice,
      invoiceType: formType,
      customerName: formCustomerName,
      customerPhone: formCustomerPhone,
      customerEmail: formCustomerEmail,
      customerAddress: formCustomerAddress,
      passportNumber: formPassportNumber,
      issueDate: formIssueDate,
      dueDate: formDueDate,
      taxAmount: Number(formTax || 0),
      discountAmount: Number(formDiscount || 0),
      notes: formNotes,
      terms: formTerms,
      items: formItems,
    };

    updateInvoice(updatedInv);
    setSelectedInvoiceId(updatedInv.id);
    setIsEditModalOpen(false);
  };

  // Submit Payment Record
  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || payAmount <= 0) return;

    recordPaymentForInvoice(
      selectedInvoice.id,
      payAmount,
      payMethod,
      payRefNo,
      payNotes,
      payBankAccountId
    );

    setSelectedInvoiceId(selectedInvoice.id);
    setIsPaymentModalOpen(false);
  };

  // Auto Generate Service Invoices for Booking
  const handleAutoGenerate = () => {
    if (!selectedBookingForAuto) return;
    const generated = generateServiceInvoicesForBooking(selectedBookingForAuto);
    if (generated.length > 0) {
      setSelectedInvoiceId(generated[0].id);
    }
    setIsAutoGenerateModalOpen(false);
  };

  // Get Invoice Type Badge Styling
  const getTypeBadgeColor = (type: InvoiceType) => {
    switch (type) {
      case 'Umrah Package Invoice':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Hotel Invoice':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Flight Invoice':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'Visa Invoice':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Transport Invoice':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Extra Services Invoice':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/40';
      case 'Payment Receipt':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      case 'Consolidated Total Invoice':
        return 'bg-gradient-to-r from-amber-500/30 to-amber-700/30 text-amber-200 border-amber-400/60 font-bold';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  // Service Type Icons
  const getTypeIcon = (type: InvoiceType) => {
    switch (type) {
      case 'Hotel Invoice':
        return <Building2 className="w-3.5 h-3.5" />;
      case 'Flight Invoice':
        return <Plane className="w-3.5 h-3.5" />;
      case 'Visa Invoice':
        return <ShieldCheck className="w-3.5 h-3.5" />;
      case 'Transport Invoice':
        return <Bus className="w-3.5 h-3.5" />;
      case 'Payment Receipt':
        return <Receipt className="w-3.5 h-3.5" />;
      case 'Consolidated Total Invoice':
        return <Layers className="w-3.5 h-3.5" />;
      default:
        return <Tag className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Printable CSS block for clean A4 printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background-color: white !important;
            color: black !important;
            padding: 20px !important;
            border: none !important;
            box-shadow: none !important;
          }
          #printable-invoice .text-white,
          #printable-invoice .text-zinc-100,
          #printable-invoice .text-zinc-200,
          #printable-invoice .text-zinc-300 {
            color: #111827 !important;
          }
          #printable-invoice .text-zinc-400,
          #printable-invoice .text-zinc-500 {
            color: #4b5563 !important;
          }
          #printable-invoice .text-amber-300,
          #printable-invoice .text-amber-400 {
            color: #b45309 !important;
          }
          #printable-invoice .bg-zinc-950,
          #printable-invoice .bg-zinc-900 {
            background-color: #f9fafb !important;
            border-color: #e5e7eb !important;
          }
          #printable-invoice .border-zinc-800,
          #printable-invoice .border-amber-500\\/30 {
            border-color: #d1d5db !important;
          }
        }
      `}</style>

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20 shadow-xl">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-amber-400" />
            Service-Wise Invoice Management System
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Generate, track, and print Umrah, Hotel, Flight, Visa, Transport, Extra Services, Payment Receipts & Consolidated Master Invoices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAutoGenerateModalOpen(true)}
            className="px-4 py-2 bg-zinc-800 border border-amber-500/30 text-amber-300 hover:bg-zinc-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow"
          >
            <Sparkles className="w-4 h-4 text-amber-400" /> Auto-Generate for Booking
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all"
          >
            <Plus className="w-4 h-4" /> Create Service Invoice
          </button>
        </div>
      </div>

      {/* Filtering & Search Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
        {/* Search & Status Filter row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Invoice #, Customer, Booking #, Passport..."
              className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-amber-400" /> Status:
            </span>
            <select
              value={activeStatusFilter}
              onChange={(e) => setActiveStatusFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        {/* Invoice Type Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-thin">
          {[
            'All',
            'Umrah Package Invoice',
            'Hotel Invoice',
            'Flight Invoice',
            'Visa Invoice',
            'Transport Invoice',
            'Extra Services Invoice',
            'Payment Receipt',
            'Consolidated Total Invoice',
          ].map((type) => (
            <button
              key={type}
              onClick={() => setActiveTypeFilter(type)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all border ${
                activeTypeFilter === type
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              {type === 'All' ? 'All Invoices' : type.replace(' Invoice', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left List - Right Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice List Panel */}
        <div className="bg-zinc-900 p-4 rounded-2xl border border-amber-500/20 space-y-2.5 max-h-[750px] overflow-y-auto scrollbar-thin">
          <div className="flex justify-between items-center px-1 pb-1 border-b border-zinc-800 text-xs font-bold text-zinc-400">
            <span>Invoices ({filteredInvoices.length})</span>
            <span className="text-[10px] text-amber-400">Real Database Records</span>
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500 space-y-2">
              <FileText className="w-8 h-8 text-zinc-600 mx-auto" />
              <p>No invoices match your search filters.</p>
            </div>
          ) : (
            filteredInvoices.map((inv) => {
              const isSelected = selectedInvoice?.id === inv.id;
              return (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvoiceId(inv.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-2.5 ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-amber-200 shadow-lg shadow-amber-500/10'
                      : 'bg-zinc-950 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800/60 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="font-mono font-bold text-xs text-amber-400 block">{inv.invoiceNumber}</span>
                      <span
                        className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-md border font-semibold mt-1 ${getTypeBadgeColor(
                          inv.invoiceType
                        )}`}
                      >
                        {getTypeIcon(inv.invoiceType)}
                        {inv.invoiceType}
                      </span>
                    </div>

                    <GoldBadge
                      variant={
                        inv.status === 'Paid'
                          ? 'emerald'
                          : inv.status === 'Partially Paid'
                          ? 'amber'
                          : 'rose'
                      }
                      size="sm"
                    >
                      {inv.status}
                    </GoldBadge>
                  </div>

                  <div className="font-bold text-white text-xs">{inv.customerName}</div>

                  <div className="flex justify-between items-center text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/60 font-mono">
                    <span>Total: PKR {inv.totalAmount.toLocaleString()}</span>
                    <span className={inv.balanceDue > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      Bal: PKR {inv.balanceDue.toLocaleString()}
                    </span>
                  </div>

                  {/* Explicit Action Buttons for Each Service Invoice */}
                  <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-zinc-800/40">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInvoiceId(inv.id);
                      }}
                      className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-amber-400 text-[10px] font-bold flex items-center gap-1 transition-all"
                      title="View Invoice Details"
                    >
                      <Eye className="w-3 h-3 text-amber-400" />
                      <span>View</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrintForInvoice(inv);
                      }}
                      className="px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center gap-1 transition-all"
                      title="Print Service Invoice"
                    >
                      <Printer className="w-3 h-3 text-amber-400" />
                      <span>Print</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadPDF(inv);
                      }}
                      className="px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 text-blue-300 text-[10px] font-bold flex items-center gap-1 transition-all"
                      title="Download PDF for this Service Invoice"
                    >
                      <Download className="w-3 h-3 text-blue-400" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Invoice Preview & Printable Details */}
        <div className="lg:col-span-2">
          {selectedInvoice ? (
            <div className="bg-zinc-900 rounded-2xl border border-amber-500/30 p-6 space-y-5 shadow-2xl">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-mono">
                    Viewing Invoice: <strong className="text-amber-400">{selectedInvoice.invoiceNumber}</strong> ({selectedInvoice.invoiceType})
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => openPaymentModal(selectedInvoice)}
                    className="px-3 py-1.5 bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <DollarSign className="w-3.5 h-3.5" /> Record Payment
                  </button>

                  <button
                    onClick={() => openEditModal(selectedInvoice)}
                    className="px-3 py-1.5 bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <Edit className="w-3.5 h-3.5 text-amber-400" /> Edit
                  </button>

                  <button
                    onClick={() => handlePrintForInvoice(selectedInvoice)}
                    className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-amber-500/30 transition-all"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" /> Print
                  </button>

                  <button
                    onClick={() => handleDownloadPDF(selectedInvoice)}
                    className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all"
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                </div>
              </div>

              {/* Printable Invoice Container */}
              <div id="printable-invoice" className="p-8 bg-zinc-950 border-2 border-amber-500/40 rounded-2xl space-y-6 text-zinc-100 shadow-inner">
                {/* Printable Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-amber-500/30 gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 p-0.5 shadow-lg shadow-amber-500/20">
                      <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center font-serif font-black text-amber-400 text-2xl">
                        KMZ
                      </div>
                    </div>
                    <div>
                      <h1 className="text-2xl font-black font-serif text-white tracking-wide">KMZ TRAVELS & TOURS</h1>
                      <p className="text-[11px] text-amber-400 font-extrabold uppercase tracking-widest mt-0.5">
                        {selectedInvoice.invoiceType}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad • DTS Lic # 8820
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-base font-mono font-black text-amber-300">
                      INVOICE #{selectedInvoice.invoiceNumber}
                    </div>
                    <div className="text-[11px] text-zinc-400">Issue Date: {selectedInvoice.issueDate}</div>
                    <div className="text-[11px] text-zinc-400">Due Date: {selectedInvoice.dueDate}</div>
                    <div className="text-[10px] text-amber-400 font-bold mt-1">
                      WhatsApp: 03018647596 | Phone: 03147861122
                    </div>
                  </div>
                </div>

                {/* Billed To & Booking Ref */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Billed To (Customer / Pilgrim)</span>
                    <div className="font-bold text-white text-sm">{selectedInvoice.customerName}</div>
                    <div className="text-zinc-400">Phone: {selectedInvoice.customerPhone}</div>
                    {selectedInvoice.customerEmail && <div className="text-zinc-400">Email: {selectedInvoice.customerEmail}</div>}
                    {selectedInvoice.customerAddress && <div className="text-zinc-400">Address: {selectedInvoice.customerAddress}</div>}
                    {selectedInvoice.passportNumber && <div className="text-amber-300 font-mono font-semibold">Passport #: {selectedInvoice.passportNumber}</div>}
                  </div>

                  <div className="space-y-1 text-left sm:text-right">
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Booking & Service Details</span>
                    <div className="font-mono font-bold text-amber-300 text-sm">Booking #{selectedInvoice.bookingNumber}</div>
                    {currentBooking && (
                      <>
                        <div className="text-zinc-300 font-semibold">{currentBooking.packageName}</div>
                        <div className="text-zinc-400 text-[11px]">
                          Passengers: {currentBooking.paxAdults} Adults, {currentBooking.paxChildren} Children
                        </div>
                        <div className="text-zinc-400 text-[11px]">
                          Dates: {currentBooking.departureDate} to {currentBooking.returnDate}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Service Line Items Table */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Service Item Breakdown</span>
                    <span className="text-[10px] text-zinc-400 font-normal">Currency: PKR (Pakistani Rupee)</span>
                  </div>

                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-zinc-900 text-amber-300 uppercase font-bold border-y border-zinc-800">
                      <tr>
                        <th className="p-3">Service Description</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Rate (PKR)</th>
                        <th className="p-3 text-right">Discount</th>
                        <th className="p-3 text-right">Total (PKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {selectedInvoice.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-zinc-900/40">
                          <td className="p-3 font-medium text-white leading-relaxed">{item.description}</td>
                          <td className="p-3 text-center font-mono">{item.qty}</td>
                          <td className="p-3 text-right font-mono">PKR {item.unitPrice.toLocaleString()}</td>
                          <td className="p-3 text-right font-mono text-emerald-400">
                            {item.discount && item.discount > 0 ? `PKR ${item.discount.toLocaleString()}` : '-'}
                          </td>
                          <td className="p-3 text-right font-bold font-mono text-amber-300">
                            PKR {item.total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* If Consolidated Total Invoice: List Included Service Invoices */}
                {selectedInvoice.invoiceType === 'Consolidated Total Invoice' && (
                  <div className="p-4 rounded-xl bg-zinc-900 border border-amber-500/30 space-y-3">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex justify-between items-center">
                      <span>Consolidated Service Invoices Summary</span>
                      <span className="text-[10px] text-zinc-400">
                        {selectedInvoice.consolidatedInvoices?.length || 0} Individual Invoices
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {invoices
                        .filter((i) => i.bookingId === selectedInvoice.bookingId && i.invoiceType !== 'Consolidated Total Invoice')
                        .map((childInv) => (
                          <div key={childInv.id} className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex justify-between items-center">
                            <div>
                              <span className="font-mono font-bold text-amber-300 text-xs block">{childInv.invoiceNumber}</span>
                              <span className="text-[10px] text-zinc-400">{childInv.invoiceType}</span>
                            </div>
                            <div className="text-right font-mono text-xs">
                              <div className="font-bold text-white">PKR {childInv.totalAmount.toLocaleString()}</div>
                              <span className={`text-[9px] font-bold ${childInv.balanceDue === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {childInv.balanceDue === 0 ? 'Paid' : `Bal: ${childInv.balanceDue.toLocaleString()}`}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Separate Payment History Section for this invoice */}
                {selectedInvoice.paymentHistory && selectedInvoice.paymentHistory.length > 0 && (
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex justify-between items-center">
                      <span>Invoice Payment History & Receipts</span>
                      <span className="text-[10px] text-zinc-400">{selectedInvoice.paymentHistory.length} Payments Recorded</span>
                    </div>

                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-zinc-950 text-zinc-400 uppercase font-bold border-b border-zinc-800">
                        <tr>
                          <th className="p-2">Receipt #</th>
                          <th className="p-2">Date</th>
                          <th className="p-2">Method</th>
                          <th className="p-2">Reference</th>
                          <th className="p-2 text-right">Amount Paid</th>
                          <th className="p-2 text-right">Receipt PDF</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800 font-mono text-[11px]">
                        {selectedInvoice.paymentHistory.map((ph) => {
                          const paymentObj: Payment = {
                            id: ph.paymentId || ph.id,
                            receiptNumber: ph.receiptNumber,
                            bookingId: selectedInvoice.bookingId,
                            bookingNumber: selectedInvoice.bookingNumber,
                            invoiceId: selectedInvoice.id,
                            invoiceNumber: selectedInvoice.invoiceNumber,
                            customerId: selectedInvoice.customerId,
                            customerName: selectedInvoice.customerName,
                            amount: ph.amount,
                            paymentMethod: ph.paymentMethod as PaymentMethod,
                            referenceNumber: ph.referenceNumber || '',
                            date: ph.date,
                            status: 'Completed',
                            recordedBy: ph.recordedBy || 'Accounts Specialist',
                            balanceRemaining: ph.balanceRemaining !== undefined ? ph.balanceRemaining : selectedInvoice.balanceDue,
                          };

                          return (
                            <tr key={ph.id}>
                              <td className="p-2 font-bold text-amber-300">{ph.receiptNumber}</td>
                              <td className="p-2 text-zinc-300">{ph.date}</td>
                              <td className="p-2 text-zinc-300">{ph.paymentMethod}</td>
                              <td className="p-2 text-zinc-400">{ph.referenceNumber || '-'}</td>
                              <td className="p-2 text-right font-bold text-emerald-400">PKR {ph.amount.toLocaleString()}</td>
                              <td className="p-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => generatePaymentReceiptPDF(paymentObj, selectedInvoice)}
                                  className="px-2 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold flex items-center gap-1 ml-auto cursor-pointer"
                                >
                                  <Printer className="w-3 h-3 text-emerald-400" />
                                  <span>Receipt PDF</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Financial Summary Box */}
                <div className="flex flex-col sm:flex-row justify-between items-start pt-4 border-t border-zinc-800 text-xs gap-4">
                  <div className="space-y-1.5 max-w-md text-zinc-400 text-[11px]">
                    <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] block">Notes & Important Terms</span>
                    <p>{selectedInvoice.notes || 'All travel services operated by KMZ Travels & Tours.'}</p>
                    <p className="italic text-[10px] text-zinc-500">{selectedInvoice.terms}</p>
                  </div>

                  <div className="w-full sm:w-72 space-y-2 p-3 rounded-xl bg-zinc-900 border border-amber-500/30">
                    <div className="flex justify-between text-zinc-400">
                      <span>Subtotal:</span>
                      <span className="text-white font-mono font-bold">PKR {selectedInvoice.subtotal.toLocaleString()}</span>
                    </div>
                    {selectedInvoice.taxAmount > 0 && (
                      <div className="flex justify-between text-zinc-400">
                        <span>Aviation Tax / Fees:</span>
                        <span className="text-white font-mono">PKR {selectedInvoice.taxAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedInvoice.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Special Discount:</span>
                        <span className="font-mono font-bold">- PKR {selectedInvoice.discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-amber-300 font-bold text-sm pt-2 border-t border-zinc-800">
                      <span>Grand Total:</span>
                      <span className="font-mono">PKR {selectedInvoice.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-bold pt-1">
                      <span>Total Paid:</span>
                      <span className="font-mono">PKR {selectedInvoice.paidAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-rose-400 font-black text-sm pt-2 border-t border-amber-500/30">
                      <span>Remaining Balance:</span>
                      <span className="font-mono">PKR {selectedInvoice.balanceDue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Official Sign & Stamp */}
                <div className="pt-8 flex items-center justify-between text-[10px] text-zinc-400 border-t border-amber-500/20">
                  <div>
                    <p className="font-bold text-amber-300">Toheed Asghar Shahid (Owner)</p>
                    <p className="text-zinc-400 font-medium">Managing Director, KMZ Travels & Tours</p>
                    <p className="text-zinc-500 text-[9px] mt-0.5">P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad</p>
                  </div>
                  <div className="border-2 border-amber-500/40 px-5 py-2.5 rounded-xl text-center font-mono text-amber-400 font-bold uppercase tracking-widest shadow">
                    KMZ OFFICIAL SEAL & STAMP
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* CREATE INVOICE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl w-full max-w-3xl p-6 space-y-5 my-8">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
              <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" /> Create New Service-Wise Invoice
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Invoice Type *</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as InvoiceType)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white font-medium focus:border-amber-500"
                  >
                    <option value="Umrah Package Invoice">Umrah Package Invoice</option>
                    <option value="Hotel Invoice">Hotel Invoice</option>
                    <option value="Flight Invoice">Flight Invoice</option>
                    <option value="Visa Invoice">Visa Invoice</option>
                    <option value="Transport Invoice">Transport Invoice</option>
                    <option value="Extra Services Invoice">Extra Services Invoice</option>
                    <option value="Payment Receipt">Payment Receipt</option>
                    <option value="Consolidated Total Invoice">Consolidated Total Invoice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Link to Booking (Auto-Fills Details)</label>
                  <select
                    value={formBookingId}
                    onChange={(e) => handleBookingChange(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white font-medium focus:border-amber-500"
                  >
                    <option value="">-- Direct Invoice / No Booking --</option>
                    {bookings.map((b) => (
                      <option key={b.id} value={b.id}>
                        #{b.bookingNumber} - {b.customerName} ({b.packageName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer Info */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="font-bold text-amber-400">Customer Details</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      value={formCustomerName}
                      onChange={(e) => setFormCustomerName(e.target.value)}
                      required
                      placeholder="e.g. Muhammad Ali Khan"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      value={formCustomerPhone}
                      onChange={(e) => setFormCustomerPhone(e.target.value)}
                      required
                      placeholder="+92 301 5551234"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Passport Number</label>
                    <input
                      type="text"
                      value={formPassportNumber}
                      onChange={(e) => setFormPassportNumber(e.target.value)}
                      placeholder="e.g. PK8829104"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={formIssueDate}
                    onChange={(e) => setFormIssueDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Itemized Lines */}
              <div className="space-y-2">
                <div className="flex justify-between items-center font-bold text-amber-400">
                  <span>Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Line Item
                  </button>
                </div>

                <div className="space-y-2">
                  {formItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        placeholder="Description"
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white text-xs"
                      />
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                        placeholder="Qty"
                        className="w-16 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white text-xs font-mono text-center"
                      />
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        placeholder="Rate"
                        className="w-28 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white text-xs font-mono text-right"
                      />
                      <span className="w-28 text-right font-mono font-bold text-amber-400 text-xs">
                        PKR {item.total?.toLocaleString()}
                      </span>
                      {formItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-amber-500/20 space-y-2 text-right">
                <div className="text-zinc-400">
                  Subtotal: <strong className="text-white font-mono">PKR {formSubtotal.toLocaleString()}</strong>
                </div>
                <div className="flex justify-end items-center gap-3">
                  <span className="text-zinc-400">Tax / Fee:</span>
                  <input
                    type="number"
                    value={formTax}
                    onChange={(e) => setFormTax(Number(e.target.value))}
                    className="w-28 bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-white font-mono text-right"
                  />
                  <span className="text-zinc-400">Discount:</span>
                  <input
                    type="number"
                    value={formDiscount}
                    onChange={(e) => setFormDiscount(Number(e.target.value))}
                    className="w-28 bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-white font-mono text-right"
                  />
                </div>
                <div className="text-amber-300 font-extrabold text-sm pt-1 border-t border-zinc-800">
                  Grand Total: PKR {formGrandTotal.toLocaleString()}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl font-bold hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-zinc-950 rounded-xl font-extrabold hover:bg-amber-400 shadow-lg shadow-amber-500/20"
                >
                  Save & Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT INVOICE MODAL */}
      {isEditModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl w-full max-w-3xl p-6 space-y-5 my-8">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
              <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-amber-400" /> Edit Invoice #{selectedInvoice.invoiceNumber}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={formCustomerName}
                    onChange={(e) => setFormCustomerName(e.target.value)}
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Customer Phone</label>
                  <input
                    type="text"
                    value={formCustomerPhone}
                    onChange={(e) => setFormCustomerPhone(e.target.value)}
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Line items editor */}
              <div className="space-y-2">
                <div className="flex justify-between items-center font-bold text-amber-400">
                  <span>Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>

                {formItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white text-xs"
                    />
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                      className="w-16 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white text-xs font-mono text-center"
                    />
                    <input
                      type="number"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                      className="w-28 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white text-xs font-mono text-right"
                    />
                    <span className="w-28 text-right font-mono font-bold text-amber-400 text-xs">
                      PKR {item.total?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-zinc-950 rounded-xl font-extrabold hover:bg-amber-400"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
              <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" /> Record Payment against Invoice #{selectedInvoice.invoiceNumber}
              </h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <div className="text-zinc-400">Customer: <strong className="text-white">{selectedInvoice.customerName}</strong></div>
                <div className="text-zinc-400">Total Invoice Amount: <strong className="text-amber-300 font-mono">PKR {selectedInvoice.totalAmount.toLocaleString()}</strong></div>
                <div className="text-zinc-400">Current Balance Due: <strong className="text-rose-400 font-mono">PKR {selectedInvoice.balanceDue.toLocaleString()}</strong></div>
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Payment Amount (PKR) *</label>
                <input
                  type="number"
                  min="1"
                  max={selectedInvoice.balanceDue || selectedInvoice.totalAmount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-emerald-400 font-mono font-bold text-sm focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Payment Method *</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white font-medium"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash in Hand</option>
                  <option value="Credit Card">Credit Card / POS</option>
                  <option value="JazzCash">JazzCash Wallet</option>
                  <option value="EasyPaisa">EasyPaisa Wallet</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Bank Account / Treasury Destination</label>
                <select
                  value={payBankAccountId}
                  onChange={(e) => setPayBankAccountId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} ({b.accountTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Reference / Transaction ID</label>
                <input
                  type="text"
                  value={payRefNo}
                  onChange={(e) => setPayRefNo(e.target.value)}
                  placeholder="e.g. HBL-992019"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 text-zinc-950 rounded-xl font-extrabold hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
                >
                  Post Payment & Update Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AUTO GENERATE INVOICES MODAL */}
      {isAutoGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
              <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> Auto-Generate Service-Wise Invoices
              </h3>
              <button
                onClick={() => setIsAutoGenerateModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-zinc-300">
                Select a booking to automatically generate individual service invoices (Umrah Package, Hotel, Flight, Visa, Transport) and a Consolidated Total Invoice.
              </p>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Select Booking *</label>
                <select
                  value={selectedBookingForAuto}
                  onChange={(e) => setSelectedBookingForAuto(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white font-medium focus:border-amber-500"
                >
                  <option value="">-- Choose Booking --</option>
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      #{b.bookingNumber} - {b.customerName} ({b.packageName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                💡 This will create unique service invoices with distinct invoice numbers and combine them into a Master Consolidated Invoice.
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAutoGenerateModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedBookingForAuto}
                  onClick={handleAutoGenerate}
                  className="px-5 py-2 bg-amber-500 text-zinc-950 rounded-xl font-extrabold hover:bg-amber-400 disabled:opacity-50"
                >
                  Auto-Generate Invoices
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
