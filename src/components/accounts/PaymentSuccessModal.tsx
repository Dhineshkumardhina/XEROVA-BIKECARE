import React from 'react';
import { PaymentVoucher } from '../../types';

interface PaymentSuccessModalProps {
  payment: PaymentVoucher | null;
  isOpen: boolean;
  onClose: () => void;
  onPrint: (p: PaymentVoucher) => void;
  onNewPayment: () => void;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  payment,
  isOpen,
  onClose,
  onPrint,
  onNewPayment
}) => {
  if (!isOpen || !payment) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest rounded-lg shadow-2xl border border-surface-container-high w-full max-w-md overflow-hidden text-xs">
        {/* Header */}
        <div className="bg-primary text-on-primary p-5 text-center space-y-1">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="material-symbols-outlined text-3xl text-white">check</span>
          </div>
          <h2 className="text-base font-bold tracking-wide uppercase">✓ PAYMENT RECORDED</h2>
          <p className="text-white/80 text-[11px]">Supplier disbursement voucher issued and posted</p>
        </div>

        {/* Details matching prompt: PV-00181, TVS Motors, ₹25,000, Bank Transfer, Remaining ₹27,000 */}
        <div className="p-5 space-y-3.5 bg-surface-container-lowest">
          <div className="p-3 rounded bg-surface-container-low border border-surface-container-high space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-outline">Payment Voucher</span>
              <span className="font-mono font-bold text-primary text-sm">{payment.paymentNo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-outline">Supplier</span>
              <span className="font-bold text-on-surface">{payment.supplierName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-outline">Disbursed Amount</span>
              <span className="font-mono font-bold text-base text-error">
                ₹{payment.amount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-outline">Payment Mode</span>
              <span className="font-mono font-semibold text-on-surface">
                {payment.paymentMode} {payment.refNo ? `(${payment.refNo})` : ''}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-surface-container">
              <span className="text-outline font-bold text-on-surface">Remaining Payable</span>
              <span className="font-mono font-bold text-on-surface text-sm">
                ₹{payment.remainingPayable.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-outline text-center">
            Date: <strong>{payment.date} {payment.time}</strong> • Approved by <strong>{payment.approvedBy || payment.createdBy}</strong>
          </div>
        </div>

        {/* Actions: [ Print ] [ PDF ] [ Share ] [ New Payment ] */}
        <div className="p-4 bg-surface-container border-t border-surface-container-high grid grid-cols-2 gap-2">
          <button
            onClick={() => onPrint(payment)}
            className="py-2 px-3 bg-primary hover:bg-primary/90 text-on-primary rounded font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print Voucher</span>
          </button>

          <button
            onClick={() => alert(`Downloaded PDF voucher for ${payment.paymentNo}`)}
            className="py-2 px-3 bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-on-surface rounded font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
            <span>Download PDF</span>
          </button>

          <button
            onClick={() => alert(`Payment advice sent via email to ${payment.supplierName}`)}
            className="py-2 px-3 bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-on-surface rounded font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">send</span>
            <span>Share / Advise</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onNewPayment();
            }}
            className="py-2 px-3 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>+ New Payment</span>
          </button>
        </div>
      </div>
    </div>
  );
};
