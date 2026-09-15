'use client';

import { Download, Printer } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Receipt, ReceiptProps } from './receipt';
import { printReceipt } from './print-utils';

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
  // Both fall back to `printReceipt`, which opens a standalone, fully-styled (inline CSS, no
  // Tailwind dependency) print window — copying the dialog's own rendered HTML here would carry
  // Tailwind class names with no stylesheet to back them, rendering completely unstyled.
  const handlePrint = () => (onPrint ? onPrint() : printReceipt(receiptData));
  const handleDownload = () => (onDownload ? onDownload() : printReceipt(receiptData));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95vw] max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-4 border-b shrink-0">
          <DialogTitle className="pr-6">Payment Receipt</DialogTitle>
        </DialogHeader>

        <div className="overflow-auto flex-1 px-5 py-5">
          <Receipt {...receiptData} />
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
