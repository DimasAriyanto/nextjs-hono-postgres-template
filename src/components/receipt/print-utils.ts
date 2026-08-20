import { ReceiptProps } from './receipt';
import { InvoiceProps } from '../invoice';
import { formatCurrency } from '@/libs/currency';
import { formatTZ } from '@/libs/dayjs';

export function printReceipt(receiptData: ReceiptProps) {
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Pop-up blocked! Please allow pop-ups to print.');
    return;
  }

  // Pre-format all currency values
  const formattedItems = receiptData.items.map(item => ({
    ...item,
    formattedPrice: formatCurrency(item.price),
    formattedTotal: formatCurrency(item.total)
  }));
  
  const formattedExtras = receiptData.extras ? receiptData.extras.map(extra => ({
    ...extra,
    formattedAmount: formatCurrency(extra.amount)
  })) : [];

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt - ${receiptData.receiptNumber}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            margin: 0;
            padding: 10px;
            font-size: 12px;
            line-height: 1.4;
            max-width: 300px;
          }
          .header {
            text-align: center;
            border-bottom: 1px solid #000;
            padding-bottom: 8px;
            margin-bottom: 8px;
          }
          .business-name {
            font-weight: bold;
            font-size: 14px;
            text-transform: uppercase;
          }
          .business-info {
            font-size: 10px;
            margin-top: 4px;
          }
          .receipt-info {
            border-bottom: 1px solid #000;
            padding-bottom: 8px;
            margin-bottom: 8px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
          }
          .items {
            border-bottom: 1px solid #000;
            padding-bottom: 8px;
            margin-bottom: 8px;
          }
          .item {
            margin-bottom: 4px;
          }
          .item-name {
            font-weight: bold;
          }
          .item-detail {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
          }
          .extras {
            border-bottom: 1px solid #000;
            padding-bottom: 8px;
            margin-bottom: 8px;
          }
          .extras-title {
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 4px;
          }
          .extra-row {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
          }
          .totals {
            margin-bottom: 8px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
          }
          .total-final {
            border-top: 1px solid #000;
            padding-top: 4px;
            font-weight: bold;
            font-size: 14px;
          }
          .payment {
            border-top: 1px solid #000;
            padding-top: 8px;
            margin-top: 8px;
          }
          .footer {
            text-align: center;
            border-top: 1px solid #000;
            padding-top: 8px;
            margin-top: 8px;
            font-size: 10px;
          }
          .thank-you {
            text-align: center;
            margin-top: 12px;
            font-size: 10px;
          }
          @page {
            size: 58mm auto; /* Thermal receipt roll width — printed page shrinks to fit instead of defaulting to A4/Letter */
            margin: 0;
          }
          @media print {
            body {
              padding: 4px;
              max-width: none;
              width: 58mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="business-name">${receiptData.businessName}</div>
          ${receiptData.businessAddress ? `<div class="business-info">${receiptData.businessAddress}</div>` : ''}
          ${receiptData.businessPhone ? `<div class="business-info">${receiptData.businessPhone}</div>` : ''}
        </div>

        <div class="receipt-info">
          <div class="info-row">
            <span>Receipt No.:</span>
            <span><strong>${receiptData.receiptNumber}</strong></span>
          </div>
          <div class="info-row">
            <span>Date:</span>
            <span>${formatTZ(receiptData.date, 'DD MMM YYYY, HH:mm')}</span>
          </div>
          ${receiptData.cashierName ? `
          <div class="info-row">
            <span>Cashier:</span>
            <span>${receiptData.cashierName}</span>
          </div>` : ''}
          <div class="info-row">
            <span>Channel:</span>
            <span>${receiptData.channel.toUpperCase()}</span>
          </div>
        </div>

        <div class="items">
          ${formattedItems.map(item => `
            <div class="item">
              <div class="item-name">${item.name}</div>
              <div class="item-detail">
                <span>${item.quantity} x ${item.formattedPrice}</span>
                <span><strong>${item.formattedTotal}</strong></span>
              </div>
            </div>
          `).join('')}
        </div>

        ${formattedExtras.length > 0 ? `
        <div class="extras">
          <div class="extras-title">ADDITIONAL FEES:</div>
          ${formattedExtras.map(extra => `
            <div class="extra-row">
              <span>${extra.label}</span>
              <span><strong>+${extra.formattedAmount}</strong></span>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(receiptData.subtotal)}</span>
          </div>
          
          ${formattedExtras.length > 0 ? `
          <div class="total-row" style="color: green;">
            <span>+ Additional Fees:</span>
            <span>+${formatCurrency(receiptData.extras!.reduce((sum, e) => sum + e.amount, 0))}</span>
          </div>` : ''}
          
          ${receiptData.discount && receiptData.discount > 0 ? `
          <div class="total-row" style="color: red;">
            <span>- Discount:</span>
            <span>-${formatCurrency(receiptData.discount)}</span>
          </div>` : ''}
          
          ${receiptData.platformFee && receiptData.platformFee > 0 ? `
          <div class="total-row" style="color: red;">
            <span>- Platform Fee:</span>
            <span>-${formatCurrency(receiptData.platformFee)}</span>
          </div>` : ''}
          
          <div class="total-row total-final">
            <span>TOTAL:</span>
            <span>${formatCurrency(receiptData.total)}</span>
          </div>
        </div>

        ${receiptData.payment ? `
        <div class="payment">
          <div class="info-row">
            <span>Payment:</span>
            <span>${receiptData.payment.method.toUpperCase()}</span>
          </div>
          ${receiptData.payment.amount ? `
          <div class="info-row">
            <span>Paid:</span>
            <span>${formatCurrency(receiptData.payment.amount)}</span>
          </div>` : ''}
          ${receiptData.payment.change && receiptData.payment.change > 0 ? `
          <div class="info-row">
            <span><strong>Change:</strong></span>
            <span><strong>${formatCurrency(receiptData.payment.change)}</strong></span>
          </div>` : ''}
        </div>
        ` : ''}

        ${receiptData.footer ? `
        <div class="footer">
          ${receiptData.footer}
        </div>
        ` : ''}

        <div class="thank-you">
          *** THANK YOU ***
        </div>

        <script>
          // Auto print when page loads
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export function printInvoice(invoiceData: InvoiceProps) {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  if (!printWindow) {
    alert('Pop-up blocked! Please allow pop-ups to print.');
    return;
  }

  // Helper functions for formatting
  const formatCurrencyValue = (amount: number) => formatCurrency(amount);
  const formatDateValue = (date: string) => formatTZ(date, 'D MMMM YYYY');
  const getInvoiceTitle = (type: string) => {
    switch (type) {
      case 'consignment': return 'CONSIGNMENT INVOICE';
      case 'pickup': return 'PICKUP INVOICE';
      case 'settlement': return 'SETTLEMENT INVOICE';
      default: return 'INVOICE';
    }
  };

  // Pre-format invoice data
  const formattedInvoice = {
    ...invoiceData,
    formattedItems: invoiceData.items.map(item => ({
      ...item,
      formattedUnitPrice: formatCurrencyValue(item.unitPrice),
      formattedTotal: formatCurrencyValue(item.total)
    })),
    formattedSubtotal: formatCurrencyValue(invoiceData.subtotal),
    formattedTotal: formatCurrencyValue(invoiceData.total),
    formattedDiscount: invoiceData.discount ? formatCurrencyValue(invoiceData.discount) : null,
    formattedTax: invoiceData.tax ? formatCurrencyValue(invoiceData.tax) : null,
    invoiceTitle: getInvoiceTitle(invoiceData.type),
    formattedInvoiceDate: formatDateValue(invoiceData.invoiceDate),
    formattedDueDate: invoiceData.dueDate ? formatDateValue(invoiceData.dueDate) : null,
    formattedPickupDate: invoiceData.pickupDate ? formatDateValue(invoiceData.pickupDate) : null,
    formattedPaymentDate: invoiceData.paymentDate ? formatDateValue(invoiceData.paymentDate) : null
  };

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice - ${invoiceData.invoiceNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
            color: #333;
          }
          .invoice-header {
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .invoice-title {
            color: #2563eb;
            font-size: 32px;
            font-weight: bold;
            margin: 0;
          }
          .invoice-number {
            color: #6b7280;
            margin-top: 8px;
          }
          .invoice-date {
            text-align: right;
            font-size: 18px;
            font-weight: 600;
          }
          .due-date {
            color: #dc2626;
            font-weight: 500;
          }
          .parties {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .party {
            flex: 1;
            margin-right: 40px;
          }
          .party:last-child {
            margin-right: 0;
          }
          .party-title {
            font-size: 18px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
          }
          .party-info {
            background: #f9fafb;
            padding: 16px;
            border-radius: 8px;
          }
          .party-name {
            font-weight: bold;
            font-size: 18px;
            margin-bottom: 4px;
          }
          .party-details {
            color: #6b7280;
            font-size: 14px;
          }
          .details-section {
            background: #eff6ff;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .details-title {
            font-size: 18px;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 12px;
          }
          .details-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
          }
          .detail-item {
            flex: 1;
            min-width: 200px;
          }
          .detail-label {
            color: #1e40af;
            font-weight: 500;
            margin-right: 8px;
          }
          .detail-value {
            font-weight: bold;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            border: 1px solid #d1d5db;
          }
          .items-table th,
          .items-table td {
            border: 1px solid #d1d5db;
            padding: 12px;
            text-align: left;
          }
          .items-table th {
            background: #f3f4f6;
            font-weight: 600;
          }
          .items-table .qty-col,
          .items-table .price-col,
          .items-table .total-col {
            text-align: right;
            font-family: monospace;
          }
          .items-table .total-col {
            font-weight: bold;
          }
          .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 30px;
          }
          .totals-table {
            width: 400px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
          }
          .totals-final {
            border-top: 2px solid #374151;
            padding-top: 8px;
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
          }
          .status-section {
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .status-paid {
            background: #dcfce7;
            border: 1px solid #16a34a;
          }
          .status-unpaid {
            background: #fef2f2;
            border: 1px solid #dc2626;
          }
          .status-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          .status-paid .status-title {
            color: #15803d;
          }
          .status-unpaid .status-title {
            color: #dc2626;
          }
          .footer {
            border-top: 3px solid #374151;
            padding-top: 20px;
            margin-top: 40px;
            text-align: center;
            color: #6b7280;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div>
            <h1 class="invoice-title">${formattedInvoice.invoiceTitle}</h1>
            <p class="invoice-number">Invoice #${formattedInvoice.invoiceNumber}</p>
          </div>
          <div class="invoice-date">
            <p>Date: ${formattedInvoice.formattedInvoiceDate}</p>
            ${formattedInvoice.formattedDueDate ? `<p class="due-date">Due Date: ${formattedInvoice.formattedDueDate}</p>` : ''}
          </div>
        </div>

        <div class="parties">
          <div class="party">
            <h3 class="party-title">From:</h3>
            <div class="party-info">
              <div class="party-name">${formattedInvoice.from.name}</div>
              <div class="party-details">
                ${formattedInvoice.from.address ? `<div>${formattedInvoice.from.address}</div>` : ''}
                ${formattedInvoice.from.phone ? `<div>Phone: ${formattedInvoice.from.phone}</div>` : ''}
                ${formattedInvoice.from.email ? `<div>Email: ${formattedInvoice.from.email}</div>` : ''}
              </div>
            </div>
          </div>
          <div class="party">
            <h3 class="party-title">To:</h3>
            <div class="party-info">
              <div class="party-name">${formattedInvoice.to.name}</div>
              <div class="party-details">
                ${formattedInvoice.to.address ? `<div>${formattedInvoice.to.address}</div>` : ''}
                ${formattedInvoice.to.phone ? `<div>Phone: ${formattedInvoice.to.phone}</div>` : ''}
                ${formattedInvoice.to.email ? `<div>Email: ${formattedInvoice.to.email}</div>` : ''}
              </div>
            </div>
          </div>
        </div>

        ${formattedInvoice.type === 'pickup' && (formattedInvoice.formattedPickupDate || formattedInvoice.totalReturned || formattedInvoice.totalSold) ? `
        <div class="details-section">
          <h3 class="details-title">Pickup Details</h3>
          <div class="details-grid">
            ${formattedInvoice.formattedPickupDate ? `
            <div class="detail-item">
              <span class="detail-label">Pickup Date:</span>
              <span class="detail-value">${formattedInvoice.formattedPickupDate}</span>
            </div>` : ''}
            ${formattedInvoice.totalReturned ? `
            <div class="detail-item">
              <span class="detail-label">Items Returned:</span>
              <span class="detail-value">${formattedInvoice.totalReturned} item</span>
            </div>` : ''}
            ${formattedInvoice.totalSold ? `
            <div class="detail-item">
              <span class="detail-label">Items Sold:</span>
              <span class="detail-value">${formattedInvoice.totalSold} item</span>
            </div>` : ''}
          </div>
        </div>
        ` : ''}

        <table class="items-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th class="qty-col">Qty</th>
              <th class="price-col">Unit Price</th>
              <th class="total-col">Total</th>
            </tr>
          </thead>
          <tbody>
            ${formattedInvoice.formattedItems.map(item => `
              <tr>
                <td>
                  <div>${item.name}</div>
                  ${item.description ? `<div style="font-size: 12px; color: #6b7280;">${item.description}</div>` : ''}
                </td>
                <td class="qty-col">${item.quantity}</td>
                <td class="price-col">${item.formattedUnitPrice}</td>
                <td class="total-col">${item.formattedTotal}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals-section">
          <div class="totals-table">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>${formattedInvoice.formattedSubtotal}</span>
            </div>
            ${formattedInvoice.formattedDiscount ? `
            <div class="totals-row" style="color: #dc2626;">
              <span>Discount:</span>
              <span>-${formattedInvoice.formattedDiscount}</span>
            </div>` : ''}
            ${formattedInvoice.formattedTax ? `
            <div class="totals-row">
              <span>Tax:</span>
              <span>${formattedInvoice.formattedTax}</span>
            </div>` : ''}
            <div class="totals-row totals-final">
              <span>TOTAL:</span>
              <span>${formattedInvoice.formattedTotal}</span>
            </div>
          </div>
        </div>

        ${formattedInvoice.isPaid !== undefined ? `
        <div class="status-section ${formattedInvoice.isPaid ? 'status-paid' : 'status-unpaid'}">
          <div class="status-title">
            Payment Status: ${formattedInvoice.isPaid ? 'PAID' : 'UNPAID'}
          </div>
          ${formattedInvoice.isPaid && formattedInvoice.formattedPaymentDate ? `
          <div>Paid on: ${formattedInvoice.formattedPaymentDate}</div>` : ''}
          ${formattedInvoice.isPaid && formattedInvoice.paymentMethod ? `
          <div>Method: ${formattedInvoice.paymentMethod}</div>` : ''}
        </div>
        ` : ''}

        ${formattedInvoice.notes ? `
        <div style="margin-bottom: 30px;">
          <h3 style="color: #374151; margin-bottom: 8px;">Notes:</h3>
          <div style="background: #f9fafb; padding: 16px; border-radius: 8px;">${formattedInvoice.notes}</div>
        </div>
        ` : ''}

        <div class="footer">
          <p>Thank you for your good cooperation. This invoice is generated automatically.</p>
          <p style="font-size: 12px; margin-top: 8px;">
            Printed on: ${formatTZ(new Date().toISOString(), 'DD MMM YYYY, HH:mm')}
          </p>
        </div>

        <script>
          // Auto print when page loads
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
