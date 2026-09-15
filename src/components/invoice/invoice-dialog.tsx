'use client';

import { Download, Printer } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Invoice, InvoiceProps } from './invoice';
import { printInvoice } from '../receipt/print-utils';

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
  // Both fall back to `printInvoice`, which opens a standalone, fully-styled
  // (inline CSS, no Tailwind dependency) print window scoped to just the
  // invoice — printing the dialog itself via `window.print()` used to also
  // capture the dialog chrome/buttons and split across pages, and the old
  // download fallback copied `innerHTML` into a window with no styles at all.
  // The print dialog's own "Save as PDF" destination covers the download case.
  const handlePrint = () => (onPrint ? onPrint() : printInvoice(invoiceData));
  const handleDownload = () => (onDownload ? onDownload() : printInvoice(invoiceData));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="pr-6">Invoice - {invoiceData.invoiceNumber}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="overflow-auto flex-1">
          <div className="p-6">
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
