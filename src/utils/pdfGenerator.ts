import { Invoice, Payment, Booking, Package, SalarySlip } from '../types';

/**
 * Utility helper to get clean badge title for service invoices
 */
const getInvoiceBadgeTitle = (type: string) => {
  switch (type) {
    case 'Hotel Invoice':
      return 'HOTEL ACCOMMODATION INVOICE';
    case 'Flight Invoice':
      return 'FLIGHT TICKET RESERVATION INVOICE';
    case 'Visa Invoice':
      return 'VISA PROCESSING & NUSUK INVOICE';
    case 'Transport Invoice':
      return 'GROUND TRANSPORTATION INVOICE';
    case 'Extra Services Invoice':
      return 'EXTRA TRAVEL SERVICES INVOICE';
    case 'Umrah Package Invoice':
      return 'UMRAH PACKAGE SERVICE INVOICE';
    case 'Consolidated Total Invoice':
      return 'CONSOLIDATED MASTER SERVICE INVOICE';
    default:
      return type.toUpperCase();
  }
};

/**
 * GENERATE STANDALONE INVOICE PDF / PRINT
 * Suitable for: Umrah, Hotel, Flight, Visa, Transport, Extra Services & Consolidated Invoices
 */
export const generateInvoicePDF = (
  targetInv: Invoice,
  allInvoices: Invoice[] = []
) => {
  const origTitle = document.title;
  const sanitizedCustomer = (targetInv.customerName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `${targetInv.invoiceNumber}_${sanitizedCustomer}_Invoice`;
  document.title = fileName;

  const childInvoices = targetInv.invoiceType === 'Consolidated Total Invoice'
    ? allInvoices.filter(
        (i) => i.bookingId === targetInv.bookingId && i.invoiceType !== 'Consolidated Total Invoice'
      )
    : [];

  const printWindow = window.open('', '_blank', 'width=880,height=1100');
  if (!printWindow) {
    alert('Please allow popup windows in your browser to print or download invoice PDFs.');
    return;
  }

  const badgeTitle = getInvoiceBadgeTitle(targetInv.invoiceType);
  const isCompactMode = (targetInv.items && targetInv.items.length > 3) || childInvoices.length > 0 || (targetInv.paymentHistory && targetInv.paymentHistory.length > 2);

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${fileName}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4 portrait; margin: 8mm; }
          * { box-sizing: border-box; page-break-inside: avoid; break-inside: avoid; }
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #0f172a;
            background: #ffffff;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .page-container {
            width: 100%;
            max-width: 210mm;
            height: 275mm;
            max-height: 275mm;
            margin: 0 auto;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 2px;
            overflow: hidden;
          }

          .content-body {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #d97706; padding-bottom: 6px; margin-bottom: 8px; }
          .brand-box { display: flex; align-items: center; gap: 8px; }
          .logo { width: 36px; height: 36px; background: #d97706; color: #ffffff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px; font-family: Georgia, serif; }
          .company-title { font-size: 17px; font-weight: 900; color: #0f172a; margin: 0; font-family: Georgia, serif; letter-spacing: 0.3px; line-height: 1.1; }
          .type-badge { display: inline-block; font-size: 8.5px; font-weight: 800; color: #b45309; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 4px; padding: 1px 6px; text-transform: uppercase; letter-spacing: 0.4px; margin-top: 2px; }
          .address { font-size: 8.5px; color: #64748b; margin-top: 2px; font-weight: 500; }
          
          .meta-box { text-align: right; }
          .inv-no { font-size: 14px; font-weight: 900; color: #b45309; font-family: monospace; letter-spacing: -0.5px; }
          .meta-item { font-size: 8.5px; color: #475569; margin-top: 1px; }
          
          .grid-details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; margin-bottom: 8px; font-size: 9.5px; }
          .label { font-size: 8px; font-weight: 800; text-transform: uppercase; color: #b45309; margin-bottom: 2px; letter-spacing: 0.4px; }
          .val-bold { font-size: 11px; font-weight: 800; color: #0f172a; }
          
          table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 9.5px; }
          th { background: #0f172a; color: #fbbf24; text-align: left; padding: 4px 6px; font-weight: 800; text-transform: uppercase; font-size: 8px; letter-spacing: 0.4px; }
          td { padding: 4px 6px; border-bottom: 1px solid #e2e8f0; color: #334155; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-mono { font-family: monospace; font-weight: 700; }
          
          .child-inv-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 6px 8px; margin-bottom: 8px; }
          
          .finance-row { display: flex; justify-content: space-between; align-items: flex-start; margin-top: auto; padding-top: 6px; border-top: 1px solid #e2e8f0; }
          .terms-box { max-width: 320px; font-size: 8.5px; color: #64748b; line-height: 1.25; }
          .summary-card { width: 220px; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 6px 8px; font-size: 9.5px; }
          .s-row { display: flex; justify-content: space-between; margin-bottom: 2px; color: #475569; }
          .s-row.grand { border-top: 1px solid #e2e8f0; padding-top: 3px; margin-top: 3px; font-size: 11px; font-weight: 900; color: #b45309; }
          .s-row.paid { color: #16a34a; font-weight: 800; }
          .s-row.due { border-top: 1px solid #fcd34d; padding-top: 3px; margin-top: 3px; font-size: 11px; font-weight: 900; color: #dc2626; }
          
          .stamp-footer { margin-top: 6px; padding-top: 6px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 8.5px; color: #64748b; }
          .seal-box { border: 1.5px dashed #d97706; color: #d97706; padding: 4px 10px; font-weight: 900; text-transform: uppercase; border-radius: 4px; letter-spacing: 0.5px; text-align: center; background: #fffbeb; font-size: 8px; }
          
          @media print {
            body { padding: 0; margin: 0; }
            .page-container { height: 275mm; max-height: 275mm; overflow: hidden; }
          }
        </style>
      </head>
      <body>
        <div class="page-container">
          <div class="content-body">
            <div class="header">
              <div class="brand-box">
                <div class="logo">KMZ</div>
                <div>
                  <h1 class="company-title">KMZ TRAVELS & TOURS</h1>
                  <div class="type-badge">${badgeTitle}</div>
                  <div class="address">P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad • DTS Lic # 8820</div>
                </div>
              </div>
              <div class="meta-box">
                <div class="inv-no">INVOICE #${targetInv.invoiceNumber}</div>
                <div class="meta-item">Issue Date: ${targetInv.issueDate}</div>
                <div class="meta-item">Due Date: ${targetInv.dueDate}</div>
                <div class="meta-item" style="color: #b45309; font-weight: 800;">WhatsApp: 03018647596</div>
              </div>
            </div>

            <div class="grid-details">
              <div>
                <div class="label">Billed To (Customer / Pilgrim)</div>
                <div class="val-bold">${targetInv.customerName}</div>
                <div>Phone: ${targetInv.customerPhone}</div>
                ${targetInv.customerEmail ? `<div>Email: ${targetInv.customerEmail}</div>` : ''}
                ${targetInv.customerAddress ? `<div>Address: ${targetInv.customerAddress}</div>` : ''}
                ${targetInv.passportNumber ? `<div style="font-family: monospace; font-weight: 700; color: #b45309; margin-top: 1px;">Passport #: ${targetInv.passportNumber}</div>` : ''}
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
                <div class="label" style="margin-bottom: 2px;">Consolidated Service Breakdown for Booking #${targetInv.bookingNumber}</div>
                <table style="font-size: 8.5px; margin-bottom: 0;">
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
              <div style="margin-bottom: 6px;">
                <div class="label" style="margin-bottom: 3px;">Linked Payment Receipts History</div>
                <table style="font-size: 8.5px; margin-bottom: 0;">
                  <thead>
                    <tr style="background: #334155; color: #fff;">
                      <th>Receipt #</th>
                      <th>Date</th>
                      <th>Payment Method</th>
                      <th>Reference / Txn #</th>
                      <th class="text-right">Amount Paid</th>
                      <th class="text-right">Remaining Balance</th>
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
                        <td class="text-right font-mono" style="color: #475569;">PKR ${(ph.balanceRemaining !== undefined ? ph.balanceRemaining : targetInv.balanceDue).toLocaleString()}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : ''}

            <div class="finance-row">
              <div class="terms-box">
                <div class="label">Notes & Terms</div>
                <p style="margin: 1px 0;">${targetInv.notes || 'All travel services operated under KMZ Travels & Tours license.'}</p>
                <p style="margin: 1px 0; font-style: italic;">Thank you for trusting KMZ Travels & Tours for your sacred pilgrimage.</p>
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
          </div>

          <div class="stamp-footer">
            <div>
              <div style="font-weight: 800; color: #0f172a;">Toheed Asghar Shahid (Owner)</div>
              <div>Managing Director, KMZ Travels & Tours</div>
              <div style="font-size: 8px; color: #94a3b8; margin-top: 1px;">P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad</div>
            </div>
            <div class="seal-box">
              KMZ OFFICIAL SEAL & STAMP
            </div>
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

/**
 * GENERATE STANDALONE PAYMENT RECEIPT PDF / PRINT
 * Suitable for: Proof of money received (Cash, Bank, JazzCash, EasyPaisa)
 */
export const generatePaymentReceiptPDF = (
  payment: Payment,
  linkedInvoice?: Invoice | null
) => {
  const origTitle = document.title;
  const sanitizedCustomer = (payment.customerName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `${payment.receiptNumber}_${sanitizedCustomer}_Payment_Receipt`;
  document.title = fileName;

  const printWindow = window.open('', '_blank', 'width=880,height=1100');
  if (!printWindow) {
    alert('Please allow popup windows in your browser to print or download payment receipt PDFs.');
    return;
  }

  const isWallet = payment.paymentMethod === 'JazzCash' || payment.paymentMethod === 'EasyPaisa';
  const remainingBal = payment.balanceRemaining !== undefined 
    ? payment.balanceRemaining 
    : linkedInvoice 
    ? linkedInvoice.balanceDue 
    : 0;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${fileName}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4 portrait; margin: 8mm; }
          * { box-sizing: border-box; page-break-inside: avoid; break-inside: avoid; }
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #0f172a;
            background: #ffffff;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .page-container {
            width: 100%;
            max-width: 210mm;
            height: 275mm;
            max-height: 275mm;
            margin: 0 auto;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 2px;
            overflow: hidden;
          }

          .content-body {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #16a34a; padding-bottom: 6px; margin-bottom: 8px; }
          .brand-box { display: flex; align-items: center; gap: 8px; }
          .logo { width: 36px; height: 36px; background: #16a34a; color: #ffffff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px; font-family: Georgia, serif; }
          .company-title { font-size: 17px; font-weight: 900; color: #0f172a; margin: 0; font-family: Georgia, serif; letter-spacing: 0.3px; line-height: 1.1; }
          .type-badge { display: inline-block; font-size: 8.5px; font-weight: 800; color: #15803d; background: #dcfce7; border: 1px solid #86efac; border-radius: 4px; padding: 1px 6px; text-transform: uppercase; letter-spacing: 0.4px; margin-top: 2px; }
          .address { font-size: 8.5px; color: #64748b; margin-top: 2px; font-weight: 500; }
          
          .meta-box { text-align: right; }
          .rec-no { font-size: 14px; font-weight: 900; color: #15803d; font-family: monospace; letter-spacing: -0.5px; }
          .meta-item { font-size: 8.5px; color: #475569; margin-top: 1px; }
          
          .grid-details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; margin-bottom: 8px; font-size: 9.5px; }
          .label { font-size: 8px; font-weight: 800; text-transform: uppercase; color: #16a34a; margin-bottom: 2px; letter-spacing: 0.4px; }
          .val-bold { font-size: 11px; font-weight: 800; color: #0f172a; }
          
          .amount-banner { background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 8px 10px; text-align: center; margin-bottom: 8px; }
          .amount-title { font-size: 8.5px; font-weight: 800; text-transform: uppercase; color: #15803d; letter-spacing: 0.4px; }
          .amount-val { font-size: 20px; font-weight: 900; color: #16a34a; font-family: monospace; margin: 1px 0; }
          .amount-method { font-size: 9.5px; font-weight: 700; color: #334155; }

          .txn-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 9.5px; }
          .txn-table th { background: #0f172a; color: #86efac; text-align: left; padding: 4px 6px; font-weight: 800; text-transform: uppercase; font-size: 8px; }
          .txn-table td { padding: 4px 6px; border-bottom: 1px solid #e2e8f0; color: #334155; }

          .balance-card { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 6px 10px; margin-bottom: 8px; }
          .b-row { display: flex; justify-content: space-between; font-size: 9.5px; margin-bottom: 2px; color: #475569; }
          .b-row.final { border-top: 1px solid #fcd34d; padding-top: 3px; margin-top: 3px; font-size: 11px; font-weight: 900; color: #b45309; }

          .stamp-footer { margin-top: auto; padding-top: 6px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 8.5px; color: #64748b; }
          .seal-box { border: 1.5px dashed #16a34a; color: #15803d; padding: 4px 10px; font-weight: 900; text-transform: uppercase; border-radius: 4px; letter-spacing: 0.5px; text-align: center; background: #f0fdf4; font-size: 8px; }
          
          @media print {
            body { padding: 0; margin: 0; }
            .page-container { height: 275mm; max-height: 275mm; overflow: hidden; }
          }
        </style>
      </head>
      <body>
        <div class="page-container">
          <div class="content-body">
            <div class="header">
              <div class="brand-box">
                <div class="logo">KMZ</div>
                <div>
                  <h1 class="company-title">KMZ TRAVELS & TOURS</h1>
                  <div class="type-badge">Official Payment Receipt</div>
                  <div class="address">P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad • DTS Lic # 8820</div>
                </div>
              </div>
              <div class="meta-box">
                <div class="rec-no">RECEIPT #${payment.receiptNumber}</div>
                <div class="meta-item">Payment Date: ${payment.date}</div>
                <div class="meta-item">Status: <strong style="color: #16a34a;">${payment.status || 'Completed'}</strong></div>
                <div class="meta-item" style="color: #15803d; font-weight: 800;">WhatsApp: 03018647596</div>
              </div>
            </div>

            <div class="grid-details">
              <div>
                <div class="label">Received From (Customer / Pilgrim)</div>
                <div class="val-bold">${payment.customerName}</div>
                <div>Booking Ref #: <strong style="font-family: monospace; color: #15803d;">${payment.bookingNumber}</strong></div>
              </div>
              <div style="text-align: right;">
                <div class="label">Linked Invoice Reference</div>
                <div style="font-family: monospace; font-weight: 800; font-size: 11px; color: #15803d;">
                  ${payment.invoiceNumber || linkedInvoice?.invoiceNumber || 'Linked Service Invoice'}
                </div>
                ${linkedInvoice ? `<div>Service Type: ${linkedInvoice.invoiceType}</div>` : ''}
              </div>
            </div>

            <div class="amount-banner">
              <div class="amount-title">Official Amount Received</div>
              <div class="amount-val">PKR ${payment.amount.toLocaleString()}</div>
              <div class="amount-method">Payment Method: ${payment.paymentMethod}</div>
            </div>

            <table class="txn-table">
              <thead>
                <tr>
                  <th>Transaction Parameter</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Payment Method</strong></td>
                  <td>${payment.paymentMethod}</td>
                </tr>
                ${isWallet ? `
                  <tr>
                    <td><strong>Wallet Title</strong></td>
                    <td>${payment.walletTitle || payment.customerName}</td>
                  </tr>
                  <tr>
                    <td><strong>Mobile Wallet Number</strong></td>
                    <td style="font-family: monospace;">${payment.walletNumber || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Transaction ID (Txn ID)</strong></td>
                    <td style="font-family: monospace; font-weight: 800; color: #15803d;">${payment.transactionId || payment.referenceNumber}</td>
                  </tr>
                ` : `
                  <tr>
                    <td><strong>Transaction Reference #</strong></td>
                    <td style="font-family: monospace; font-weight: 800; color: #15803d;">${payment.referenceNumber}</td>
                  </tr>
                `}
                ${payment.bankAccountName ? `
                  <tr>
                    <td><strong>Deposit Ledger Account</strong></td>
                    <td>${payment.bankAccountName}</td>
                  </tr>
                ` : ''}
                ${payment.notes ? `
                  <tr>
                    <td><strong>Payment Notes / Remarks</strong></td>
                    <td>${payment.notes}</td>
                  </tr>
                ` : ''}
                <tr>
                  <td><strong>Recorded By</strong></td>
                  <td>${payment.recordedBy || 'KMZ Accounts Department'}</td>
                </tr>
              </tbody>
            </table>

            <div class="balance-card">
              ${linkedInvoice ? `
                <div class="b-row">
                  <span>Linked Invoice Total Charge (${linkedInvoice.invoiceNumber}):</span>
                  <span style="font-family: monospace; font-weight: 700;">PKR ${linkedInvoice.totalAmount.toLocaleString()}</span>
                </div>
                <div class="b-row">
                  <span>Total Paid Prior + This Receipt:</span>
                  <span style="font-family: monospace; font-weight: 700; color: #16a34a;">PKR ${linkedInvoice.paidAmount.toLocaleString()}</span>
                </div>
              ` : ''}
              <div class="b-row final">
                <span>Remaining Invoice Balance Due:</span>
                <span style="font-family: monospace;">PKR ${remainingBal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div class="stamp-footer">
            <div>
              <div style="font-weight: 800; color: #0f172a;">Toheed Asghar Shahid (Owner)</div>
              <div>Managing Director, KMZ Travels & Tours</div>
              <div style="font-size: 8px; color: #94a3b8; margin-top: 1px;">P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad</div>
            </div>
            <div class="seal-box">
              KMZ OFFICIAL PAYMENT RECEIVED STAMP
            </div>
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

/**
 * GENERATE STANDALONE PILGRIMAGE SERVICE VOUCHER PDF / PRINT
 * Suitable for: Hotel Accommodations, Flight Reservations, Private Transport & Visa Vouchers
 */
export const generateVoucherPDF = (
  booking: Booking,
  packages: Package[] = []
) => {
  const origTitle = document.title;
  const sanitizedCustomer = (booking.customerName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `${booking.bookingNumber}_${sanitizedCustomer}_Service_Voucher`;
  document.title = fileName;

  const printWindow = window.open('', '_blank', 'width=880,height=1100');
  if (!printWindow) {
    alert('Please allow popup windows in your browser to print or download voucher PDFs.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${fileName}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4 portrait; margin: 8mm; }
          * { box-sizing: border-box; page-break-inside: avoid; break-inside: avoid; }
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #0f172a;
            background: #ffffff;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .page-container {
            width: 100%;
            max-width: 210mm;
            height: 275mm;
            max-height: 275mm;
            margin: 0 auto;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 2px;
            overflow: hidden;
          }

          .content-body {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #d97706; padding-bottom: 6px; margin-bottom: 8px; }
          .brand-box { display: flex; align-items: center; gap: 8px; }
          .logo { width: 36px; height: 36px; background: #d97706; color: #ffffff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px; font-family: Georgia, serif; }
          .company-title { font-size: 17px; font-weight: 900; color: #0f172a; margin: 0; font-family: Georgia, serif; letter-spacing: 0.3px; line-height: 1.1; }
          .type-badge { display: inline-block; font-size: 8.5px; font-weight: 800; color: #b45309; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 4px; padding: 1px 6px; text-transform: uppercase; letter-spacing: 0.4px; margin-top: 2px; }
          .address { font-size: 8.5px; color: #64748b; margin-top: 2px; font-weight: 500; }
          
          .meta-box { text-align: right; }
          .vouch-no { font-size: 14px; font-weight: 900; color: #b45309; font-family: monospace; letter-spacing: -0.5px; }
          .meta-item { font-size: 8.5px; color: #475569; margin-top: 1px; }

          .grid-details { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; margin-bottom: 8px; font-size: 9.5px; }
          .label { font-size: 8px; font-weight: 800; text-transform: uppercase; color: #b45309; margin-bottom: 2px; letter-spacing: 0.4px; }
          .val-bold { font-size: 11px; font-weight: 800; color: #0f172a; }

          .section-title { font-size: 9.5px; font-weight: 900; color: #b45309; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 4px; margin-top: 6px; border-bottom: 1px solid #fcd34d; padding-bottom: 2px; }

          table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 9.5px; }
          th { background: #0f172a; color: #fbbf24; text-align: left; padding: 4px 6px; font-weight: 800; text-transform: uppercase; font-size: 8px; }
          td { padding: 4px 6px; border-bottom: 1px solid #e2e8f0; color: #334155; }
          .text-right { text-align: right; }
          .font-mono { font-family: monospace; font-weight: 700; }

          .box-card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 8px; margin-bottom: 6px; font-size: 9.5px; }

          .stamp-footer { margin-top: auto; padding-top: 6px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 8.5px; color: #64748b; }
          .seal-box { border: 1.5px dashed #d97706; color: #d97706; padding: 4px 10px; font-weight: 900; text-transform: uppercase; border-radius: 4px; letter-spacing: 0.5px; text-align: center; background: #fffbeb; font-size: 8px; }
          
          @media print {
            body { padding: 0; margin: 0; }
            .page-container { height: 275mm; max-height: 275mm; overflow: hidden; }
          }
        </style>
      </head>
      <body>
        <div class="page-container">
          <div class="content-body">
            <div class="header">
              <div class="brand-box">
                <div class="logo">KMZ</div>
                <div>
                  <h1 class="company-title">KMZ TRAVELS & TOURS</h1>
                  <div class="type-badge">Official Pilgrimage Service Voucher</div>
                  <div class="address">P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad • DTS Lic # 8820</div>
                </div>
              </div>
              <div class="meta-box">
                <div class="vouch-no">VOUCHER #${booking.bookingNumber}</div>
                <div class="meta-item">Issue Date: ${new Date().toISOString().split('T')[0]}</div>
                <div class="meta-item" style="color: #b45309; font-weight: 800;">WhatsApp: 03018647596</div>
              </div>
            </div>

            <div class="grid-details">
              <div>
                <div class="label">Pilgrim Name</div>
                <div class="val-bold">${booking.customerName}</div>
                <div>Phone: ${booking.customerPhone}</div>
              </div>
              <div>
                <div class="label">Package Name</div>
                <div class="val-bold">${booking.packageName}</div>
                <div>Pax: ${booking.paxAdults} Adult(s), ${booking.paxChildren} Child(ren), ${booking.paxInfants} Infant(s)</div>
              </div>
              <div style="text-align: right;">
                <div class="label">Saudi Visa & Nusuk</div>
                <div style="font-family: monospace; font-weight: 800; color: #16a34a;">Nusuk ID: ${booking.visa?.nusukId || 'Verified'}</div>
                <div>Visa Type: ${booking.visa?.visaType || 'Umrah Visa'}</div>
              </div>
            </div>

            <div class="section-title">Saudi Hotel Accommodations</div>
            <table>
              <thead>
                <tr>
                  <th>City & Hotel Name</th>
                  <th>Room Type</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th class="text-right">Nights</th>
                  <th class="text-right">Rate / Night</th>
                  <th class="text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                ${booking.hotels && booking.hotels.length > 0 ?
                  booking.hotels.map((h) => `
                    <tr>
                      <td><strong>${h.city}: ${h.hotelName}</strong></td>
                      <td>${h.roomType}</td>
                      <td>${h.checkIn}</td>
                      <td>${h.checkOut}</td>
                      <td class="text-right font-mono">${h.nights}</td>
                      <td class="text-right font-mono">PKR ${(h.ratePerNight || 0).toLocaleString()}</td>
                      <td class="text-right font-mono" style="color: #b45309;">PKR ${(h.totalRate || h.totalHotelCost || h.nights * h.ratePerNight).toLocaleString()}</td>
                    </tr>
                  `).join('')
                 :
                  `<tr><td colspan="7" style="text-align: center; color: #64748b;">No hotel accommodation listed</td></tr>`
                }
              </tbody>
            </table>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 4px;">
              <div>
                <div class="section-title">Flight Ticket Reservation</div>
                <div class="box-card">
                  <div>Airline: <strong>${booking.flight?.airline || 'N/A'}</strong></div>
                  <div>Flight #: <strong class="font-mono">${booking.flight?.flightNumber || 'N/A'}</strong></div>
                  <div>PNR Code: <strong class="font-mono" style="color: #b45309; font-size: 11px;">${booking.flight?.pnr || 'N/A'}</strong></div>
                  <div>Route: ${booking.flight?.departureAirport || ''} &rrarr; ${booking.flight?.arrivalAirport || ''}</div>
                  <div>Departure Date: ${booking.departureDate || 'As per itinerary'}</div>
                </div>
              </div>

              <div>
                <div class="section-title">Private Transport & Ziyarat</div>
                <div class="box-card">
                  <div>Vehicle Type: <strong>${booking.transport?.transportType || 'Private GMC / Coaster'}</strong></div>
                  <div>Route: <strong>${booking.transport?.route || 'Jeddah - Makkah - Madina'}</strong></div>
                  <div>Driver Contact: <strong class="font-mono">${booking.transport?.driverContact || 'Assigned on arrival'}</strong></div>
                  <div>Special Notes: Includes Makkah & Madina Ziyarat.</div>
                </div>
              </div>
            </div>
          </div>

          <div class="stamp-footer">
            <div>
              <div style="font-weight: 800; color: #0f172a;">Toheed Asghar Shahid (Owner)</div>
              <div>Managing Director, KMZ Travels & Tours (Pvt) Ltd</div>
              <div style="font-size: 8px; color: #94a3b8; margin-top: 1px;">P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad</div>
            </div>
            <div class="seal-box">
              KMZ OFFICIAL SERVICE VOUCHER
            </div>
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

/**
 * GENERATE STANDALONE SALARY SLIP PDF / PRINT
 * Suitable for: HR Payroll Slips
 */
export const generateSalarySlipPDF = (
  salarySlip: SalarySlip
) => {
  const origTitle = document.title;
  const sanitizedEmployee = (salarySlip.employeeName || 'Employee').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `${salarySlip.slipNumber}_${sanitizedEmployee}_Salary_Slip`;
  document.title = fileName;

  const printWindow = window.open('', '_blank', 'width=880,height=1100');
  if (!printWindow) {
    alert('Please allow popup windows in your browser to print or download salary slip PDFs.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${fileName}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4 portrait; margin: 8mm; }
          * { box-sizing: border-box; page-break-inside: avoid; break-inside: avoid; }
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #0f172a;
            background: #ffffff;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .page-container {
            width: 100%;
            max-width: 210mm;
            height: 275mm;
            max-height: 275mm;
            margin: 0 auto;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 2px;
            overflow: hidden;
          }

          .content-body {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #d97706; padding-bottom: 6px; margin-bottom: 8px; }
          .brand-box { display: flex; align-items: center; gap: 8px; }
          .logo { width: 36px; height: 36px; background: #d97706; color: #ffffff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px; font-family: Georgia, serif; }
          .company-title { font-size: 17px; font-weight: 900; color: #0f172a; margin: 0; font-family: Georgia, serif; letter-spacing: 0.3px; line-height: 1.1; }
          .type-badge { display: inline-block; font-size: 8.5px; font-weight: 800; color: #b45309; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 4px; padding: 1px 6px; text-transform: uppercase; margin-top: 2px; }
          
          .meta-box { text-align: right; }
          .slip-no { font-size: 14px; font-weight: 900; color: #b45309; font-family: monospace; }
          .meta-item { font-size: 8.5px; color: #475569; margin-top: 1px; }

          .grid-details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; margin-bottom: 8px; font-size: 9.5px; }
          .label { font-size: 8px; font-weight: 800; text-transform: uppercase; color: #b45309; margin-bottom: 2px; }

          table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 9.5px; }
          th { background: #0f172a; color: #fbbf24; text-align: left; padding: 4px 6px; font-weight: 800; text-transform: uppercase; font-size: 8px; }
          td { padding: 4px 6px; border-bottom: 1px solid #e2e8f0; color: #334155; }
          .text-right { text-align: right; }
          .font-mono { font-family: monospace; font-weight: 700; }

          .net-box { background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 8px 10px; text-align: center; margin-bottom: 8px; }
          .net-val { font-size: 20px; font-weight: 900; color: #16a34a; font-family: monospace; }

          .stamp-footer { margin-top: auto; padding-top: 6px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 8.5px; color: #64748b; }
          .seal-box { border: 1.5px dashed #d97706; color: #d97706; padding: 4px 10px; font-weight: 900; text-transform: uppercase; border-radius: 4px; background: #fffbeb; font-size: 8px; }
          
          @media print {
            body { padding: 0; margin: 0; }
            .page-container { height: 275mm; max-height: 275mm; overflow: hidden; }
          }
        </style>
      </head>
      <body>
        <div class="page-container">
          <div class="content-body">
            <div class="header">
              <div class="brand-box">
                <div class="logo">KMZ</div>
                <div>
                  <h1 class="company-title">KMZ TRAVELS & TOURS</h1>
                  <div class="type-badge">Official HR Payroll Salary Slip</div>
                  <div style="font-size: 8.5px; color: #64748b; margin-top: 2px;">P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad</div>
                </div>
              </div>
              <div class="meta-box">
                <div class="slip-no">SLIP #${salarySlip.slipNumber}</div>
                <div class="meta-item">Pay Period: <strong>${salarySlip.month} ${salarySlip.year}</strong></div>
                <div class="meta-item">Payment Date: ${salarySlip.paymentDate || new Date().toISOString().split('T')[0]}</div>
              </div>
            </div>

            <div class="grid-details">
              <div>
                <div class="label">Employee Information</div>
                <div style="font-size: 11px; font-weight: 800; color: #0f172a;">${salarySlip.employeeName}</div>
                <div>Designation: ${salarySlip.designation}</div>
                <div>Department: ${salarySlip.department}</div>
              </div>
              <div style="text-align: right;">
                <div class="label">Payment Channel & Status</div>
                <div style="font-family: monospace; font-weight: 800; color: #16a34a; font-size: 11px;">${salarySlip.status || salarySlip.paymentStatus || 'Paid'}</div>
                <div>Method: ${salarySlip.paymentMethod || 'Bank Transfer'}</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Earnings & Allowances</th>
                  <th class="text-right">Amount (PKR)</th>
                  <th>Deductions</th>
                  <th class="text-right">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Basic Salary</td>
                  <td class="text-right font-mono">PKR ${salarySlip.basicSalary.toLocaleString()}</td>
                  <td>Absence Deductions</td>
                  <td class="text-right font-mono" style="color: #dc2626;">- PKR ${(salarySlip.absenceDeduction || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>House Rent Allowance</td>
                  <td class="text-right font-mono">PKR ${(salarySlip.houseRent || 0).toLocaleString()}</td>
                  <td>Tax Deductions</td>
                  <td class="text-right font-mono" style="color: #dc2626;">- PKR ${(salarySlip.tax || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Medical Allowance</td>
                  <td class="text-right font-mono">PKR ${(salarySlip.medicalAllowance || 0).toLocaleString()}</td>
                  <td>Other Deductions</td>
                  <td class="text-right font-mono" style="color: #dc2626;">- PKR ${(salarySlip.otherDeduction || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Transport Allowance</td>
                  <td class="text-right font-mono">PKR ${(salarySlip.transportAllowance || 0).toLocaleString()}</td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td>Bonus / Performance</td>
                  <td class="text-right font-mono">PKR ${(salarySlip.bonus || 0).toLocaleString()}</td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>

            <div class="net-box">
              <div style="font-size: 8.5px; font-weight: 800; text-transform: uppercase; color: #15803d;">Net Payable Salary</div>
              <div class="net-val">PKR ${salarySlip.netSalary.toLocaleString()}</div>
            </div>
          </div>

          <div class="stamp-footer">
            <div>
              <div style="font-weight: 800; color: #0f172a;">Toheed Asghar Shahid (Owner)</div>
              <div>Managing Director, KMZ Travels & Tours</div>
              <div style="font-size: 8px; color: #94a3b8; margin-top: 1px;">P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad</div>
            </div>
            <div class="seal-box">
              KMZ HR PAYROLL VERIFIED
            </div>
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

/**
 * GENERATE STANDALONE BANK STATEMENT PDF / PRINT
 */
export const generateBankStatementPDF = (
  account: { bankName: string; accountTitle: string; accountNumber: string; iban?: string; branch?: string },
  statementData: {
    openingBalance: number;
    totalInflows: number;
    totalOutflows: number;
    closingBalance: number;
    transactions: Array<{ date: string; referenceNo: string; type: string; narration: string; debit: number; credit: number; runningBalance: number }>;
  },
  startDate: string,
  endDate: string
) => {
  const origTitle = document.title;
  const fileName = `${account?.bankName || 'Bank'}_Statement_${startDate}_to_${endDate}`.replace(/[^a-zA-Z0-9]/g, '_');
  document.title = fileName;

  const printWindow = window.open('', '_blank', 'width=880,height=1100');
  if (!printWindow) {
    alert('Please allow popup windows in your browser to print or download bank statements.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${fileName}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4; margin: 10mm; }
          * { box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 16px; background: #ffffff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2.5px solid #d97706; padding-bottom: 12px; margin-bottom: 16px; }
          .brand-box { display: flex; align-items: center; gap: 12px; }
          .logo { width: 48px; height: 48px; background: #d97706; color: #ffffff; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 20px; font-family: Georgia, serif; box-shadow: 0 4px 6px -1px rgba(217,119,6,0.3); }
          .company-title { font-size: 20px; font-weight: 900; color: #0f172a; margin: 0; font-family: Georgia, serif; letter-spacing: 0.5px; }
          .type-badge { display: inline-block; font-size: 10px; font-weight: 800; color: #b45309; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 5px; padding: 2px 8px; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 3px; }
          
          .grid-details { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; margin-bottom: 16px; font-size: 11px; }
          .label { font-size: 9px; font-weight: 800; text-transform: uppercase; color: #b45309; margin-bottom: 3px; letter-spacing: 0.5px; }
          .val-bold { font-size: 12px; font-weight: 800; color: #0f172a; }

          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
          .s-card { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 10px; text-align: center; }
          .s-title { font-size: 9px; font-weight: 800; text-transform: uppercase; color: #b45309; }
          .s-val { font-size: 13px; font-weight: 900; font-family: monospace; color: #0f172a; margin-top: 2px; }

          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 10px; }
          th { background: #0f172a; color: #fbbf24; text-align: left; padding: 8px 10px; font-weight: 800; text-transform: uppercase; font-size: 9px; }
          td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; color: #334155; }
          .text-right { text-align: right; }
          .font-mono { font-family: monospace; font-weight: 700; }

          .stamp-footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748b; }
          .seal-box { border: 2px dashed #d97706; color: #d97706; padding: 6px 14px; font-weight: 900; text-transform: uppercase; border-radius: 6px; letter-spacing: 1px; text-align: center; background: #fffbeb; font-size: 9px; }
          
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand-box">
            <div class="logo">KMZ</div>
            <div>
              <h1 class="company-title">KMZ TRAVELS & TOURS</h1>
              <div class="type-badge">Official Bank Account Statement</div>
              <div style="font-size: 10px; color: #64748b; margin-top: 3px;">P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad • DTS Lic # 8820</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 14px; font-weight: 900; color: #b45309;">${account.bankName}</div>
            <div style="font-size: 10px; color: #475569;">Statement Period: ${startDate} to ${endDate}</div>
            <div style="font-size: 10px; color: #b45309; font-weight: 800; margin-top: 2px;">WhatsApp: 03018647596</div>
          </div>
        </div>

        <div class="grid-details">
          <div>
            <div class="label">Bank & Account Details</div>
            <div class="val-bold">${account.bankName}</div>
            <div>Title: <strong>${account.accountTitle}</strong></div>
            <div>Account #: <strong style="font-family: monospace; color: #b45309;">${account.accountNumber}</strong></div>
            ${account.iban ? `<div>IBAN: <span style="font-family: monospace;">${account.iban}</span></div>` : ''}
            ${account.branch ? `<div>Branch: ${account.branch}</div>` : ''}
          </div>
          <div style="text-align: right;">
            <div class="label">Statement Parameters</div>
            <div>From: <strong>${startDate}</strong></div>
            <div>To: <strong>${endDate}</strong></div>
            <div>Total Transactions Recorded: <strong>${statementData.transactions.length}</strong></div>
          </div>
        </div>

        <div class="summary-grid">
          <div class="s-card">
            <div class="s-title">Opening Balance</div>
            <div class="s-val">PKR ${statementData.openingBalance.toLocaleString()}</div>
          </div>
          <div class="s-card" style="background: #f0fdf4; border-color: #86efac;">
            <div class="s-title" style="color: #15803d;">Total Inflows (+)</div>
            <div class="s-val" style="color: #16a34a;">PKR ${statementData.totalInflows.toLocaleString()}</div>
          </div>
          <div class="s-card" style="background: #fef2f2; border-color: #fca5a5;">
            <div class="s-title" style="color: #b91c1c;">Total Outflows (-)</div>
            <div class="s-val" style="color: #dc2626;">PKR ${statementData.totalOutflows.toLocaleString()}</div>
          </div>
          <div class="s-card" style="background: #eff6ff; border-color: #93c5fd;">
            <div class="s-title" style="color: #1d4ed8;">Closing Balance</div>
            <div class="s-val" style="color: #2563eb;">PKR ${statementData.closingBalance.toLocaleString()}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Reference No</th>
              <th>Type</th>
              <th>Narration / Particulars</th>
              <th class="text-right">Debit (PKR)</th>
              <th class="text-right">Credit (PKR)</th>
              <th class="text-right">Running Balance (PKR)</th>
            </tr>
          </thead>
          <tbody>
            ${statementData.transactions.length > 0 ? statementData.transactions.map((tx) => `
              <tr>
                <td class="font-mono">${tx.date}</td>
                <td class="font-mono" style="color: #b45309; font-weight: 800;">${tx.referenceNo}</td>
                <td><strong>${tx.type}</strong></td>
                <td>${tx.narration}</td>
                <td class="text-right font-mono" style="color: ${tx.debit > 0 ? '#dc2626' : '#94a3b8'};">${tx.debit > 0 ? `PKR ${tx.debit.toLocaleString()}` : '-'}</td>
                <td class="text-right font-mono" style="color: ${tx.credit > 0 ? '#16a34a' : '#94a3b8'};">${tx.credit > 0 ? `PKR ${tx.credit.toLocaleString()}` : '-'}</td>
                <td class="text-right font-mono" style="font-weight: 800;">PKR ${tx.runningBalance.toLocaleString()}</td>
              </tr>
            `).join('') : `<tr><td colspan="7" style="text-align: center; color: #64748b;">No transactions recorded for this period.</td></tr>`}
          </tbody>
        </table>

        <div class="stamp-footer">
          <div>
            <div style="font-weight: 800; color: #0f172a;">Toheed Asghar Shahid (Owner)</div>
            <div>Managing Director, KMZ Travels & Tours</div>
            <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad</div>
          </div>
          <div class="seal-box">
            KMZ BANK LEDGER AUDITED
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

/**
 * GENERATE STANDALONE GROUP MANIFEST PDF / PRINT
 */
export const generateGroupManifestPDF = (
  groupLeaderName: string,
  groupBookings: Booking[]
) => {
  const origTitle = document.title;
  const fileName = `Group_Manifest_${groupLeaderName || 'Group'}`.replace(/[^a-zA-Z0-9]/g, '_');
  document.title = fileName;

  const printWindow = window.open('', '_blank', 'width=880,height=1100');
  if (!printWindow) {
    alert('Please allow popup windows in your browser to print group manifests.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${fileName}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4; margin: 10mm; }
          * { box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 16px; background: #ffffff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2.5px solid #d97706; padding-bottom: 12px; margin-bottom: 16px; }
          .brand-box { display: flex; align-items: center; gap: 12px; }
          .logo { width: 48px; height: 48px; background: #d97706; color: #ffffff; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 20px; font-family: Georgia, serif; box-shadow: 0 4px 6px -1px rgba(217,119,6,0.3); }
          .company-title { font-size: 20px; font-weight: 900; color: #0f172a; margin: 0; font-family: Georgia, serif; letter-spacing: 0.5px; }
          .type-badge { display: inline-block; font-size: 10px; font-weight: 800; color: #b45309; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 5px; padding: 2px 8px; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 3px; }

          .grid-details { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; margin-bottom: 16px; font-size: 11px; }
          .label { font-size: 9px; font-weight: 800; text-transform: uppercase; color: #b45309; margin-bottom: 3px; letter-spacing: 0.5px; }
          .val-bold { font-size: 12px; font-weight: 800; color: #0f172a; }

          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 10px; }
          th { background: #0f172a; color: #fbbf24; text-align: left; padding: 8px 10px; font-weight: 800; text-transform: uppercase; font-size: 9px; }
          td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; color: #334155; }
          .text-right { text-align: right; }
          .font-mono { font-family: monospace; font-weight: 700; }

          .stamp-footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748b; }
          .seal-box { border: 2px dashed #d97706; color: #d97706; padding: 6px 14px; font-weight: 900; text-transform: uppercase; border-radius: 6px; letter-spacing: 1px; text-align: center; background: #fffbeb; font-size: 9px; }
          
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand-box">
            <div class="logo">KMZ</div>
            <div>
              <h1 class="company-title">KMZ TRAVELS & TOURS</h1>
              <div class="type-badge">Group Passenger Manifest & Rooming List</div>
              <div style="font-size: 10px; color: #64748b; margin-top: 3px;">P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad • DTS Lic # 8820</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 14px; font-weight: 900; color: #b45309;">Leader: ${groupLeaderName}</div>
            <div style="font-size: 10px; color: #475569;">Date Generated: ${new Date().toISOString().split('T')[0]}</div>
            <div style="font-size: 10px; color: #b45309; font-weight: 800; margin-top: 2px;">WhatsApp: 03018647596</div>
          </div>
        </div>

        <div class="grid-details">
          <div>
            <div class="label">Assigned Mutawwif / Leader</div>
            <div class="val-bold">${groupLeaderName}</div>
            <div>Total Pilgrims Managed: <strong>${groupBookings.reduce((sum, b) => sum + b.paxAdults + b.paxChildren, 0)} Passengers</strong></div>
          </div>
          <div style="text-align: right;">
            <div class="label">Group Operational Summary</div>
            <div>Bookings Linked: <strong>${groupBookings.length}</strong></div>
            <div>Status: <strong style="color: #16a34a;">Group In Transit / Confirmed</strong></div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Booking #</th>
              <th>Passenger Name</th>
              <th>Phone</th>
              <th>Pax Breakdown</th>
              <th>Package Title</th>
              <th>Hotels & Rooming</th>
              <th>Flight PNR</th>
            </tr>
          </thead>
          <tbody>
            ${groupBookings.map((b) => `
              <tr>
                <td class="font-mono" style="font-weight: 800; color: #b45309;">${b.bookingNumber}</td>
                <td><strong>${b.customerName}</strong></td>
                <td>${b.customerPhone}</td>
                <td>${b.paxAdults} A / ${b.paxChildren} C</td>
                <td>${b.packageName}</td>
                <td>${b.hotels.map(h => `${h.city}: ${h.hotelName} (${h.roomType})`).join('<br/>')}</td>
                <td class="font-mono" style="font-weight: 800;">${b.flight?.pnr || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="stamp-footer">
          <div>
            <div style="font-weight: 800; color: #0f172a;">Toheed Asghar Shahid (Owner)</div>
            <div>Managing Director, KMZ Travels & Tours</div>
            <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">P-41 First Floor, Street 6/8, Jhung Bazar, Faisalabad</div>
          </div>
          <div class="seal-box">
            KMZ GROUP LEADER MANIFEST AUTHORIZED
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

export { downloadExecutiveReportPDF } from './executiveReportPdf';

