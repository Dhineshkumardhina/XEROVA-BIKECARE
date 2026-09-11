import React from 'react';
import { Invoice } from '../types';
import { POSInvoicePreviewModal } from './pos/POSInvoicePreviewModal';

interface InvoiceModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  initialFormat?: 'A4' | 'A5' | 'Thermal' | '4-in-1';
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  invoice,
  onClose,
  initialFormat = 'A4'
}) => {
  return (
    <POSInvoicePreviewModal
      invoice={invoice}
      onClose={onClose}
      initialFormat={initialFormat}
    />
  );
};
