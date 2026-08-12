'use client';

import * as React from 'react';
import { formatCurrency } from '@/libs/currency';
import dayjs from '@/libs/dayjs';
import { cn } from '@/libs/utils';

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface ReceiptExtra {
  label: string;
  amount: number;
}

export interface ReceiptProps {
  businessName: string;
  businessAddress?: string;
  businessPhone?: string;
  receiptNumber: string;
  date: string;
  cashierName?: string;
  channel: string;
  items: ReceiptItem[];
  extras?: ReceiptExtra[];
  subtotal: number;
  discount?: number;
  platformFee?: number;
  total: number;
  payment?: {
    method: string;
    amount?: number;
    change?: number;
  };
  footer?: string;
  className?: string;
}

export function Receipt({
  businessName,
  businessAddress,
  businessPhone,
  receiptNumber,
  date,
  cashierName,
  channel,
  items,
  extras = [],
  subtotal,
  discount = 0,
  platformFee = 0,
  total,
  payment,
  footer,
  className,
}: ReceiptProps) {
  return (
    <div className={cn(
      "max-w-sm mx-auto bg-white text-black font-mono text-xs leading-relaxed p-4 border",
      className
    )}>
      {/* Header */}
      <div className="text-center border-b pb-2 mb-2">
        <h1 className="font-bold text-sm uppercase">{businessName}</h1>
        {businessAddress && (
          <p className="text-[10px] mt-1">{businessAddress}</p>
        )}
        {businessPhone && (
          <p className="text-[10px]">{businessPhone}</p>
        )}
      </div>

      {/* Receipt Info */}
      <div className="border-b pb-2 mb-2 space-y-1">
        <div className="flex justify-between">
          <span>Receipt No.:</span>
          <span className="font-bold">{receiptNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{dayjs(date).format('DD/MM/YYYY HH:mm')}</span>
        </div>
        {cashierName && (
          <div className="flex justify-between">
            <span>Cashier:</span>
            <span>{cashierName}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Channel:</span>
          <span className="uppercase">{channel}</span>
        </div>
      </div>

      {/* Items */}
      <div className="border-b pb-2 mb-2">
        {items.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between">
              <span className="font-semibold">{item.name}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span>{item.quantity} x {formatCurrency(item.price)}</span>
              <span className="font-bold">{formatCurrency(item.total)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Extras */}
      {extras.length > 0 && (
        <div className="border-b pb-2 mb-2">
          <div className="text-[10px] font-semibold mb-1">ADDITIONAL FEES:</div>
          {extras.map((extra, index) => (
            <div key={index} className="flex justify-between text-[10px]">
              <span>{extra.label}</span>
              <span className="font-bold">+{formatCurrency(extra.amount)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Totals */}
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        
        {extras.length > 0 && (
          <div className="flex justify-between text-green-600">
            <span>+ Additional Fees:</span>
            <span>+{formatCurrency(extras.reduce((sum, e) => sum + e.amount, 0))}</span>
          </div>
        )}
        
        {discount > 0 && (
          <div className="flex justify-between text-red-600">
            <span>- Discount:</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        
        {platformFee > 0 && (
          <div className="flex justify-between text-red-600">
            <span>- Platform Fee:</span>
            <span>-{formatCurrency(platformFee)}</span>
          </div>
        )}
        
        <div className="border-t pt-1 flex justify-between font-bold text-sm">
          <span>TOTAL:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Payment */}
      {payment && (
        <div className="border-t pt-2 mt-2 space-y-1">
          <div className="flex justify-between">
            <span>Payment:</span>
            <span className="uppercase">{payment.method}</span>
          </div>
          {payment.amount && (
            <div className="flex justify-between">
              <span>Paid:</span>
              <span>{formatCurrency(payment.amount)}</span>
            </div>
          )}
          {payment.change && payment.change > 0 && (
            <div className="flex justify-between font-bold">
              <span>Change:</span>
              <span>{formatCurrency(payment.change)}</span>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      {footer && (
        <div className="text-center border-t pt-2 mt-2 text-[10px]">
          {footer}
        </div>
      )}

      <div className="text-center mt-3 text-[10px]">
        *** THANK YOU ***
      </div>
    </div>
  );
}