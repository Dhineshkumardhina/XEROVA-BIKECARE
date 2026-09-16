import React, { useState } from 'react';
import { OutstandingReminderRecord, MessageTemplate } from '../../types';

interface PaymentRemindersViewProps {
  reminders: OutstandingReminderRecord[];
  templates: MessageTemplate[];
  onSendReminder: (record: OutstandingReminderRecord, channel: 'WhatsApp' | 'SMS', templateText?: string) => void;
  onBatchSendReminders: (records: OutstandingReminderRecord[], channel: 'WhatsApp' | 'SMS') => void;
  onViewLedger: (customerId: string) => void;
}

export const PaymentRemindersView: React.FC<PaymentRemindersViewProps> = ({
  reminders,
  templates,
  onSendReminder,
  onBatchSendReminders,
  onViewLedger
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('DEFAULT');
  const [activeChannel, setActiveChannel] = useState<'WhatsApp' | 'SMS'>('WhatsApp');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  // KPIs
  const totalOutstanding = reminders.reduce((sum, r) => sum + r.outstanding, 0);
  const overdueCount = reminders.filter(r => r.oldestDueDays > 15).length;
  const totalRemindedThisWeek = reminders.filter(r => r.lastReminderDate).length;

  const filteredReminders = reminders.filter(r => {
    const q = searchTerm.toLowerCase();
    return (
      !q ||
      r.customerName.toLowerCase().includes(q) ||
      r.mobile.includes(q) ||
      r.customerType.toLowerCase().includes(q)
    );
  });

  const toggleSelectAll = () => {
    if (selectedCustomerIds.length === filteredReminders.length) {
      setSelectedCustomerIds([]);
    } else {
      setSelectedCustomerIds(filteredReminders.map(r => r.customerId));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedCustomerIds.includes(id)) {
      setSelectedCustomerIds(selectedCustomerIds.filter(x => x !== id));
    } else {
      setSelectedCustomerIds([...selectedCustomerIds, id]);
    }
  };

  const handleSendSingle = (r: OutstandingReminderRecord, ch: 'WhatsApp' | 'SMS') => {
    onSendReminder(r, ch);
    setActionSuccessToast(`${ch} reminder sent to ${r.customerName} for ₹${r.outstanding.toLocaleString('en-IN')}`);
    setTimeout(() => setActionSuccessToast(null), 3000);
  };

  const handleSendBatch = () => {
    const selectedRecords = reminders.filter(r => selectedCustomerIds.includes(r.customerId));
    if (selectedRecords.length === 0) return;
    onBatchSendReminders(selectedRecords, activeChannel);
    setActionSuccessToast(`Batch ${activeChannel} reminders dispatched to ${selectedRecords.length} customers`);
    setSelectedCustomerIds([]);
    setTimeout(() => setActionSuccessToast(null), 3000);
  };

  return (
    <div className="flex flex-col w-full pb-12 space-y-gutter animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded border border-surface-container-high shadow-xs gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-[22px]">notifications_active</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Receivables &amp; Outstanding Payment Reminders</h1>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Automated WhatsApp &amp; SMS credit collection chasing with payment links and ledger ageing tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedCustomerIds.length > 0 && (
            <button
              onClick={handleSendBatch}
              className="px-3.5 py-1.5 bg-secondary text-on-secondary hover:bg-secondary-container rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>Send Batch ({selectedCustomerIds.length} Selected)</span>
            </button>
          )}
        </div>
      </div>

      {actionSuccessToast && (
        <div className="p-3 bg-tertiary-fixed text-on-tertiary-fixed rounded font-bold text-xs flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{actionSuccessToast}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm">
        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="font-label-caps text-label-caps text-outline uppercase">Total Outstanding</span>
          <div className="font-numeric-lg text-xl font-bold text-error mt-1">₹{totalOutstanding.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-outline">Across {reminders.length} accounts</span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="font-label-caps text-label-caps text-outline uppercase">Overdue Accounts (&gt;15 Days)</span>
          <div className="font-numeric-lg text-xl font-bold text-error mt-1">{overdueCount} Accounts</div>
          <span className="text-[11px] text-error font-semibold">Priority follow-up</span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="font-label-caps text-label-caps text-outline uppercase">Reminders Sent (7d)</span>
          <div className="font-numeric-lg text-xl font-bold text-secondary mt-1">{totalRemindedThisWeek} Notices</div>
          <span className="text-[11px] text-outline">WhatsApp &amp; SMS</span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="font-label-caps text-label-caps text-outline uppercase">Collection Efficiency</span>
          <div className="font-numeric-lg text-xl font-bold text-on-tertiary-container mt-1">94.8%</div>
          <span className="text-[11px] text-outline">15-day turnaround</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-surface-container-lowest rounded border border-surface-container-high shadow-xs overflow-hidden space-y-3 p-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 border-b border-surface-container-high pb-3">
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[18px] text-outline">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search customer, mobile, type..."
              className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-xs text-on-surface focus:outline-none focus:border-secondary"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-outline font-medium">Batch Channel:</span>
            <select
              value={activeChannel}
              onChange={e => setActiveChannel(e.target.value as any)}
              className="px-2 py-1 bg-surface-container-low border border-surface-container-high rounded font-semibold text-on-surface"
            >
              <option value="WhatsApp">WhatsApp</option>
              <option value="SMS">SMS</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-container font-label-caps text-on-surface-variant uppercase text-[10px]">
              <tr>
                <th className="p-2.5 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={selectedCustomerIds.length === filteredReminders.length && filteredReminders.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-surface-container-high"
                  />
                </th>
                <th className="py-2.5 px-3">Customer Name</th>
                <th className="py-2.5 px-3">Mobile</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3 text-right">Invoices Due</th>
                <th className="py-2.5 px-3 text-right">Outstanding (₹)</th>
                <th className="py-2.5 px-3">Oldest Due Date</th>
                <th className="py-2.5 px-3">Last Reminder</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-table-cell">
              {filteredReminders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-outline">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-4xl opacity-50">notifications_active</span>
                      <p className="font-semibold text-on-surface text-base">No payment reminders pending.</p>
                      <p className="text-xs">Customers with outstanding dues will appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReminders.map(r => {
                const isSelected = selectedCustomerIds.includes(r.customerId);
                return (
                  <tr key={r.customerId} className={`hover:bg-surface-container-low transition-colors ${isSelected ? 'bg-surface-container-low' : ''}`}>
                    <td className="p-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(r.customerId)}
                        className="rounded border-surface-container-high"
                      />
                    </td>

                    <td className="py-2.5 px-3">
                      <strong className="text-on-surface">{r.customerName}</strong>
                      {r.lastActionNote && (
                        <div className="text-[10px] text-outline italic line-clamp-1">{r.lastActionNote}</div>
                      )}
                    </td>

                    <td className="py-2.5 px-3 font-mono text-on-surface">{r.mobile}</td>

                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.2 rounded bg-surface-container text-on-surface text-[10px] font-semibold">
                        {r.customerType}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold text-on-surface">
                      {r.invoiceCount} bills
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold text-error">
                      ₹{r.outstanding.toLocaleString('en-IN')}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-mono text-on-surface">{r.oldestInvoiceDate}</div>
                      <div className={`text-[10px] font-bold ${r.oldestDueDays > 15 ? 'text-error' : 'text-outline'}`}>
                        {r.oldestDueDays} days ago
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-outline text-[11px]">
                      {r.lastReminderDate ? (
                        <span>{r.lastReminderDate} ({r.lastReminderChannel})</span>
                      ) : (
                        <span className="text-outline italic">Never sent</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                        r.reminderStatus === 'Delivered'
                          ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                          : r.reminderStatus === 'Sent'
                          ? 'bg-secondary-fixed text-on-secondary-fixed'
                          : r.reminderStatus === 'Paid'
                          ? 'bg-surface-container text-on-surface'
                          : 'bg-surface-container text-outline'
                      }`}>
                        {r.reminderStatus}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleSendSingle(r, 'WhatsApp')}
                          className="px-2 py-1 bg-tertiary-fixed text-on-tertiary-fixed rounded text-[10px] font-bold flex items-center gap-1 shadow-xs"
                          title="Send WhatsApp Payment Notice"
                        >
                          <span className="material-symbols-outlined text-[13px]">chat</span>
                          <span>WhatsApp</span>
                        </button>
                        <button
                          onClick={() => handleSendSingle(r, 'SMS')}
                          className="px-2 py-1 bg-surface-container text-on-surface hover:bg-surface-container-high rounded text-[10px] font-bold flex items-center gap-1"
                          title="Send SMS"
                        >
                          <span className="material-symbols-outlined text-[13px]">sms</span>
                          <span>SMS</span>
                        </button>
                        <button
                          onClick={() => onViewLedger(r.customerId)}
                          className="p-1 rounded text-secondary hover:bg-surface-container"
                          title="View Ledger Statement"
                        >
                          <span className="material-symbols-outlined text-[16px]">menu_book</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
