'use client';

import * as React from 'react';
import { Download, Eye, Printer, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Invoice, InvoiceProps } from './invoice';

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceData: InvoiceProps;
  onPrint?: () => void;
  onDownload?: () => void;
}

export function InvoiceDialog({
  open,
  onOpenChange,
  invoiceData,
  onPrint,
  onDownload,
}: InvoiceDialogProps) {
  const invoiceRef = React.useRef<HTMLDivElement>(null);

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
      if (printWindow && invoiceRef.current) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice - ${invoiceData.invoiceNumber}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                .invoice { max-width: 800px; margin: 0 auto; }
                @media print {
                  body { padding: 0; }
                  .invoice { max-width: none; }
                }
              </style>
            </head>
            <body>
              <div class="invoice">
                ${invoiceRef.current.innerHTML}
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
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Invoice - {invoiceData.invoiceNumber}
            </div>
            <div className="flex items-center gap-2">
              {onPrint !== undefined && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={handlePrint}
                  title="Print"
                >
                  <Printer className="h-4 w-4" />
                </Button>
              )}
              {onDownload !== undefined && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={handleDownload}
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="overflow-auto flex-1">
          <div ref={invoiceRef}>
            <Invoice {...invoiceData} />
          </div>
        </ScrollArea>

        <div className="border-t px-6 py-4 flex gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Invoice
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}