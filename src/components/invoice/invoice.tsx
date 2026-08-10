'use client';

import * as React from 'react';
import { formatCurrency } from '@/libs/currency';
import dayjs from '@/libs/dayjs';
import { cn } from '@/libs/utils';

export interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  description?: string;
}

export interface InvoiceParty {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface InvoiceProps {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  type: 'consignment' | 'pickup' | 'settlement';
  
  // Parties
  from: InvoiceParty;
  to: InvoiceParty;
  
  // Items
  items: InvoiceItem[];
  
  // Amounts
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  
  // Consignment specific
  consignmentDate?: string;
  pickupDate?: string;
  totalSent?: number;
  totalReturned?: number;
  totalSold?: number;
  supplierPortion?: number;
  ownerMargin?: number;
  markupPercentage?: number;
  
  // Payment
  isPaid?: boolean;
  paymentMethod?: string;
  paymentDate?: string;
  
  // Notes
  notes?: string;
  terms?: string;
  footer?: string;
  
  className?: string;
}

export function Invoice({
  invoiceNumber,
  invoiceDate,
  dueDate,
  type,
  from,
  to,
  items,
  subtotal,
  discount = 0,
  tax = 0,
  total,
  consignmentDate,
  pickupDate,
  totalSent,
  totalReturned,
  totalSold,
  supplierPortion,
  ownerMargin,
  markupPercentage,
  isPaid,
  paymentMethod,
  paymentDate,
  notes,
  terms,
  footer,
  className,
}: InvoiceProps) {
  const getInvoiceTitle = () => {
    switch (type) {
      case 'consignment':
        return 'INVOICE KONSINYASI';
      case 'pickup':
        return 'INVOICE PICKUP';
      case 'settlement':
        return 'INVOICE SETTLEMENT';
      default:
        return 'INVOICE';
    }
  };

  return (
    <div className={cn(
      "max-w-4xl mx-auto bg-white text-black p-8 border",
      className
    )}>
      {/* Header */}
      <div className="border-b-2 border-gray-900 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">{getInvoiceTitle()}</h1>
            <p className="text-gray-600 mt-2">Invoice #{invoiceNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">Tanggal: {dayjs(invoiceDate).format('DD MMMM YYYY')}</p>
            {dueDate && (
              <p className="text-red-600 font-medium">Jatuh Tempo: {dayjs(dueDate).format('DD MMMM YYYY')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Parties */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Dari:</h3>
          <div className="bg-gray-50 p-4 rounded">
            <p className="font-bold text-lg">{from.name}</p>
            {from.address && <p className="text-gray-600">{from.address}</p>}
            {from.phone && <p className="text-gray-600">Telp: {from.phone}</p>}
            {from.email && <p className="text-gray-600">Email: {from.email}</p>}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Kepada:</h3>
          <div className="bg-gray-50 p-4 rounded">
            <p className="font-bold text-lg">{to.name}</p>
            {to.address && <p className="text-gray-600">{to.address}</p>}
            {to.phone && <p className="text-gray-600">Telp: {to.phone}</p>}
            {to.email && <p className="text-gray-600">Email: {to.email}</p>}
          </div>
        </div>
      </div>

      {/* Consignment Details */}
      {type === 'consignment' && (consignmentDate || totalSent) && (
        <div className="bg-blue-50 p-4 rounded mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Detail Konsinyasi</h3>
          <div className="grid grid-cols-2 gap-4">
            {consignmentDate && (
              <div>
                <span className="text-blue-700 font-medium">Tanggal Konsinyasi:</span>
                <span className="ml-2">{dayjs(consignmentDate).format('DD MMMM YYYY')}</span>
              </div>
            )}
            {totalSent && (
              <div>
                <span className="text-blue-700 font-medium">Total Barang Dikirim:</span>
                <span className="ml-2 font-bold">{totalSent} item</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pickup Details */}
      {type === 'pickup' && (pickupDate || totalReturned || totalSold) && (
        <div className="bg-green-50 p-4 rounded mb-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">Detail Pickup</h3>
          <div className="grid grid-cols-3 gap-4">
            {pickupDate && (
              <div>
                <span className="text-green-700 font-medium">Tanggal Pickup:</span>
                <span className="ml-2">{dayjs(pickupDate).format('DD MMMM YYYY')}</span>
              </div>
            )}
            {totalReturned && (
              <div>
                <span className="text-green-700 font-medium">Barang Dikembalikan:</span>
                <span className="ml-2 font-bold">{totalReturned} item</span>
              </div>
            )}
            {totalSold && (
              <div>
                <span className="text-green-700 font-medium">Barang Terjual:</span>
                <span className="ml-2 font-bold">{totalSold} item</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="mb-6">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-3 text-left">Nama Produk</th>
              <th className="border border-gray-300 p-3 text-center">Qty</th>
              <th className="border border-gray-300 p-3 text-right">Harga Satuan</th>
              <th className="border border-gray-300 p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-3">
                  <div className="font-medium">{item.name}</div>
                  {item.description && (
                    <div className="text-sm text-gray-600">{item.description}</div>
                  )}
                </td>
                <td className="border border-gray-300 p-3 text-center font-mono">
                  {item.quantity}
                </td>
                <td className="border border-gray-300 p-3 text-right font-mono">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="border border-gray-300 p-3 text-right font-mono font-bold">
                  {formatCurrency(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-80">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono">{formatCurrency(subtotal)}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Diskon:</span>
                <span className="font-mono">-{formatCurrency(discount)}</span>
              </div>
            )}
            
            {tax > 0 && (
              <div className="flex justify-between">
                <span>Pajak:</span>
                <span className="font-mono">{formatCurrency(tax)}</span>
              </div>
            )}
            
            <div className="border-t pt-2 flex justify-between text-lg font-bold">
              <span>TOTAL:</span>
              <span className="font-mono text-blue-600">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settlement Details */}
      {type === 'settlement' && (supplierPortion || ownerMargin || markupPercentage) && (
        <div className="bg-yellow-50 p-4 rounded mb-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">Detail Settlement</h3>
          <div className="grid grid-cols-2 gap-4">
            {markupPercentage && (
              <div>
                <span className="text-yellow-700 font-medium">Markup:</span>
                <span className="ml-2 font-bold">{markupPercentage}%</span>
              </div>
            )}
            {supplierPortion && (
              <div>
                <span className="text-yellow-700 font-medium">Bagian Supplier:</span>
                <span className="ml-2 font-bold">{formatCurrency(supplierPortion)}</span>
              </div>
            )}
            {ownerMargin && (
              <div>
                <span className="text-yellow-700 font-medium">Margin Owner:</span>
                <span className="ml-2 font-bold">{formatCurrency(ownerMargin)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Status */}
      {isPaid !== undefined && (
        <div className={`p-4 rounded mb-6 ${isPaid ? 'bg-green-100' : 'bg-red-100'}`}>
          <div className="flex items-center justify-between">
            <div>
              <span className={`font-bold text-lg ${isPaid ? 'text-green-800' : 'text-red-800'}`}>
                Status Pembayaran: {isPaid ? 'LUNAS' : 'BELUM LUNAS'}
              </span>
              {isPaid && paymentDate && (
                <p className="text-green-700">
                  Dibayar pada: {dayjs(paymentDate).format('DD MMMM YYYY')}
                </p>
              )}
              {isPaid && paymentMethod && (
                <p className="text-green-700">
                  Metode: {paymentMethod}
                </p>
              )}
            </div>
            <div className={`px-4 py-2 rounded font-bold text-white ${isPaid ? 'bg-green-600' : 'bg-red-600'}`}>
              {isPaid ? 'PAID' : 'UNPAID'}
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Catatan:</h3>
          <p className="text-gray-700 bg-gray-50 p-4 rounded">{notes}</p>
        </div>
      )}

      {/* Terms */}
      {terms && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Syarat & Ketentuan:</h3>
          <p className="text-sm text-gray-600">{terms}</p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t-2 border-gray-900 pt-4 mt-8">
        {footer ? (
          <p className="text-center text-gray-600">{footer}</p>
        ) : (
          <p className="text-center text-gray-600">
            Terima kasih atas kerjasama yang baik. Invoice ini dibuat secara otomatis.
          </p>
        )}
        <p className="text-center text-xs text-gray-500 mt-2">
          Dicetak pada: {dayjs().format('DD MMMM YYYY HH:mm')}
        </p>
      </div>
    </div>
  );
}