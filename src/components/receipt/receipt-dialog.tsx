'use client';

import * as React from 'react';
import { Download, Printer } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Receipt, ReceiptProps } from './receipt';

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptData: ReceiptProps;
  onPrint?: () => void;
  onDownload?: () => void;
}

export function ReceiptDialog({
  open,
  onOpenChange,
  receiptData,
  onPrint,
  onDownload,
}: ReceiptDialogProps) {
  const receiptRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Basic implementation - can be enhanced with html2canvas or similar
      const printWindow = window.open('', '_blank');
      if (printWindow && receiptRef.current) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt - ${receiptData.receiptNumber}</title>
              <style>
                body { font-family: 'Courier New', monospace; margin: 0; padding: 20px; }
                .receipt { max-width: 300px; margin: 0 auto; }
                @media print {
                  body { padding: 0; }
                  .receipt { max-width: none; }
                }
              </style>
            </head>
            <body>
              <div class="receipt">
                ${receiptRef.current.innerHTML}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95vw] max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-4 border-b shrink-0">
          <DialogTitle className="pr-6">Payment Receipt</DialogTitle>
        </DialogHeader>

        <div className="overflow-auto flex-1 px-5 py-5">
          <div ref={receiptRef}>
            <Receipt {...receiptData} />
          </div>
        </div>

        <div className="border-t px-5 py-4 flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
