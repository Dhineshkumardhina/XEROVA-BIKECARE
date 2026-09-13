import React, { useState, useMemo } from 'react';
import { CustomerProfileData, MessageTemplate } from '../../types';

interface BulkMessagingViewProps {
  customers: CustomerProfileData[];
  templates: MessageTemplate[];
  onSendBulkCampaign: (audienceFilter: string, messageText: string, channel: 'WhatsApp' | 'SMS' | 'Both', recipientCount: number) => void;
  onNavigateBack: () => void;
}

export const BulkMessagingView: React.FC<BulkMessagingViewProps> = ({
  customers,
  templates,
  onSendBulkCampaign,
  onNavigateBack
}) => {
  const [selectedAudience, setSelectedAudience] = useState<string>('ALL');
  const [selectedVehicleMake, setSelectedVehicleMake] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [channel, setChannel] = useState<'WhatsApp' | 'SMS' | 'Both'>('WhatsApp');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('CUSTOM');
  const [messageText, setMessageText] = useState<string>(
    'Dear {{customer_name}}, special festival discount on genuine bike spares at BIKE ERP Spares! Show this message at counter for 10% off.'
  );
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isDispatchedSuccess, setIsDispatchedSuccess] = useState(false);

  // Audience filtering logic
  const targetRecipients = useMemo(() => {
    return customers.filter(c => {
      // Base Audience filter
      if (selectedAudience === 'RETAIL' && c.customerType !== 'Retail') return false;
      if (selectedAudience === 'WHOLESALE' && c.customerType !== 'Wholesale' && c.customerType !== 'Dealer') return false;
      if (selectedAudience === 'MECHANICS' && c.customerType !== 'Mechanic' && c.customerType !== 'Workshop') return false;
      if (selectedAudience === 'OUTSTANDING' && c.outstanding <= 0) return false;
      if (selectedAudience === 'LOYALTY' && c.loyaltyPoints <= 0) return false;
      if (selectedAudience === 'INACTIVE' && c.status !== 'Inactive') return false;

      // Vehicle make filter
      if (selectedVehicleMake !== 'ALL') {
        const hasMake = c.vehicles.some(v => v.manufacturer.toLowerCase() === selectedVehicleMake.toLowerCase());
        if (!hasMake) return false;
      }

      // City filter
      if (selectedCity !== 'ALL' && c.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [customers, selectedAudience, selectedVehicleMake, selectedCity]);

  // Handle template selection
  const handleTemplateChange = (tplId: string) => {
    setSelectedTemplateId(tplId);
    if (tplId === 'CUSTOM') {
      setMessageText('');
    } else {
      const found = templates.find(t => t.id === tplId);
      if (found) {
        setMessageText(found.content);
        if (found.channel !== 'Both') setChannel(found.channel as any);
      }
    }
  };

  // Sample recipient for live preview
  const previewSampleCustomer = targetRecipients.length > 0 ? targetRecipients[0] : customers[0];

  const renderedPreviewText = useMemo(() => {
    if (!previewSampleCustomer) return messageText;
    let txt = messageText;
    txt = txt.replace(/\{\{customer_name\}\}/g, previewSampleCustomer.name);
    txt = txt.replace(/\{\{outstanding\}\}/g, previewSampleCustomer.outstanding.toString());
    txt = txt.replace(/\{\{points\}\}/g, previewSampleCustomer.loyaltyPoints.toString());
    txt = txt.replace(/\{\{invoice_number\}\}/g, 'INV-2026-0891');
    txt = txt.replace(/\{\{amount\}\}/g, '4,820');
    txt = txt.replace(/\{\{due_date\}\}/g, '15-Aug-2026');
    txt = txt.replace(/\{\{vehicle_model\}\}/g, previewSampleCustomer.vehicles[0]?.model || 'Hero Splendor');
    txt = txt.replace(/\{\{reg_no\}\}/g, previewSampleCustomer.vehicles[0]?.regNo || 'TN-01-AB-1234');
    txt = txt.replace(/\{\{bill_link\}\}/g, 'https://bill.bike-erp.in/b/891');
    return txt;
  }, [messageText, previewSampleCustomer]);

  const handleConfirmSend = () => {
    onSendBulkCampaign(selectedAudience, messageText, channel, targetRecipients.length);
    setIsConfirmationOpen(false);
    setIsDispatchedSuccess(true);
    setTimeout(() => {
      setIsDispatchedSuccess(false);
      onNavigateBack();
    }, 2500);
  };

  // Cities extracted
  const uniqueCities = Array.from(new Set(customers.map(c => c.city).filter(Boolean)));

  return (
    <div className="flex flex-col w-full pb-12 space-y-gutter animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onNavigateBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded text-xs font-semibold transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Messaging Hub</span>
        </button>

        <span className="text-xs text-outline">Bulk Messaging Campaign Engine</span>
      </div>

      <div className="bg-surface-container-lowest p-gutter rounded border border-surface-container-high shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">campaign</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Bulk Campaign Broadcast Composer</h1>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Filter audience segment, customize dynamic notification variables, preview live rendered message, and broadcast with confirmation
          </p>
        </div>

        {isDispatchedSuccess && (
          <div className="p-3 bg-tertiary-fixed text-on-tertiary-fixed rounded font-bold text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>Broadcast queued successfully to {targetRecipients.length} recipients. Redirecting...</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-sm">
          {/* Left Column: Audience & Composer (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* 1. Audience Selector */}
            <div className="p-4 rounded bg-surface-container-low border border-surface-container-high space-y-3">
              <span className="font-headline-md text-xs font-bold text-on-surface uppercase tracking-wider block">
                1. Select Target Audience Segment
              </span>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { id: 'ALL', label: 'All Customers', icon: 'groups' },
                  { id: 'RETAIL', label: 'Retail Counter', icon: 'person' },
                  { id: 'WHOLESALE', label: 'Wholesale / Dealers', icon: 'store' },
                  { id: 'MECHANICS', label: 'Mechanics & Garages', icon: 'handyman' },
                  { id: 'OUTSTANDING', label: 'With Outstanding', icon: 'pending_actions' },
                  { id: 'LOYALTY', label: 'Loyalty Members', icon: 'stars' },
                  { id: 'INACTIVE', label: 'Inactive (>45 Days)', icon: 'bedtime' }
                ].map(aud => (
                  <button
                    key={aud.id}
                    type="button"
                    onClick={() => setSelectedAudience(aud.id)}
                    className={`p-2.5 rounded text-left text-xs font-semibold flex items-center gap-2 border transition-colors ${
                      selectedAudience === aud.id
                        ? 'bg-secondary text-on-secondary border-secondary shadow-xs'
                        : 'bg-surface-container-lowest text-on-surface border-surface-container-high hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{aud.icon}</span>
                    <span className="truncate">{aud.label}</span>
                  </button>
                ))}
              </div>

              {/* Secondary criteria: Vehicle and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-surface-container-high text-xs">
                <div>
                  <label className="text-outline block mb-1 font-medium">Filter by Bike Make:</label>
                  <select
                    value={selectedVehicleMake}
                    onChange={e => setSelectedVehicleMake(e.target.value)}
                    className="w-full px-2 py-1.5 bg-surface-container-lowest border border-surface-container-high rounded text-on-surface"
                  >
                    <option value="ALL">All Bike Manufacturers</option>
                    <option value="Bajaj">Bajaj</option>
                    <option value="Hero">Hero</option>
                    <option value="TVS">TVS</option>
                    <option value="Royal Enfield">Royal Enfield</option>
                    <option value="Honda">Honda</option>
                    <option value="Yamaha">Yamaha</option>
                  </select>
                </div>

                <div>
                  <label className="text-outline block mb-1 font-medium">Filter by City / Area:</label>
                  <select
                    value={selectedCity}
                    onChange={e => setSelectedCity(e.target.value)}
                    className="w-full px-2 py-1.5 bg-surface-container-lowest border border-surface-container-high rounded text-on-surface"
                  >
                    <option value="ALL">All Locations</option>
                    {uniqueCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Channel & Template Selector */}
            <div className="p-4 rounded bg-surface-container-low border border-surface-container-high space-y-3">
              <span className="font-headline-md text-xs font-bold text-on-surface uppercase tracking-wider block">
                2. Gateway Channel &amp; Template
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-outline block mb-1 font-medium">Channel Mode:</label>
                  <div className="flex gap-2">
                    {(['WhatsApp', 'SMS', 'Both'] as const).map(ch => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setChannel(ch)}
                        className={`flex-1 py-1.5 px-2 rounded font-semibold text-center border transition-colors ${
                          channel === ch
                            ? 'bg-secondary text-on-secondary border-secondary shadow-xs'
                            : 'bg-surface-container-lowest text-on-surface border-surface-container-high'
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-outline block mb-1 font-medium">Use Saved Template:</label>
                  <select
                    value={selectedTemplateId}
                    onChange={e => handleTemplateChange(e.target.value)}
                    className="w-full px-2 py-1.5 bg-surface-container-lowest border border-surface-container-high rounded text-on-surface font-medium"
                  >
                    <option value="CUSTOM">Custom Manual Message</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-outline block mb-1 font-medium text-xs">Message Text:</label>
                <textarea
                  rows={4}
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="Type message with template placeholders..."
                  className="w-full p-2.5 bg-surface-container-lowest border border-surface-container-high rounded text-xs font-mono text-on-surface focus:outline-none focus:border-secondary"
                />
                <div className="flex justify-between text-[11px] text-outline mt-1 font-mono">
                  <span>{messageText.length} characters • ~{Math.ceil(messageText.length / 160)} SMS units</span>
                  <span>Supports: {'{{customer_name}}'}, {'{{outstanding}}'}, {'{{points}}'}, {'{{vehicle_model}}'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Recipient Preview & Dispatch Stats (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Live Message Preview Card */}
            <div className="bg-surface-container-lowest p-4 rounded border border-surface-container-high shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-headline-md text-xs font-bold text-on-surface uppercase tracking-wider">
                  Live Message Preview
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  channel === 'WhatsApp' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-secondary-fixed text-on-secondary-fixed'
                }`}>
                  {channel}
                </span>
              </div>

              <div className="p-3.5 rounded bg-surface-container-low border border-surface-container-high space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
                  <span className="material-symbols-outlined text-[16px] text-secondary">smartphone</span>
                  <span>Recipient: {previewSampleCustomer?.name || 'Customer Name'} ({previewSampleCustomer?.mobile || '98765 43210'})</span>
                </div>
                <div className="p-3 rounded bg-surface-container-lowest border border-surface-container-high text-xs font-mono text-on-surface whitespace-pre-wrap leading-relaxed shadow-xs">
                  {renderedPreviewText || 'Message content will be displayed here...'}
                </div>
                <div className="text-[10px] text-outline text-right">
                  Estimated Delivery: ~1-3 seconds per recipient
                </div>
              </div>

              {/* Recipient Count & Delivery Estimation */}
              <div className="p-3 rounded bg-surface-container text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-outline">Target Recipient Count:</span>
                  <span className="font-mono font-bold text-secondary text-sm">{targetRecipients.length} Customers</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Estimated Dispatch Time:</span>
                  <span className="font-bold text-on-surface">~{Math.max(1, Math.ceil(targetRecipients.length * 0.2))} seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Estimated Cost:</span>
                  <span className="font-mono font-bold text-on-tertiary-container">
                    {channel === 'WhatsApp' ? `₹${(targetRecipients.length * 0.40).toFixed(2)} (WABA)` : `₹${(targetRecipients.length * 0.15).toFixed(2)} (SMS)`}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={targetRecipients.length === 0 || !messageText.trim()}
                onClick={() => setIsConfirmationOpen(true)}
                className="w-full py-2.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span>Review &amp; Broadcast to {targetRecipients.length} Recipients</span>
              </button>
            </div>

            {/* Recipient List Peek Table */}
            <div className="bg-surface-container-lowest rounded border border-surface-container-high shadow-xs overflow-hidden">
              <div className="p-2.5 bg-surface-container border-b border-surface-container-high flex justify-between items-center text-xs">
                <span className="font-bold text-on-surface">Recipient Audience Peek</span>
                <span className="text-outline font-mono">{targetRecipients.length} total</span>
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-surface-container-high text-xs">
                {targetRecipients.map(c => (
                  <div key={c.id} className="p-2 flex items-center justify-between hover:bg-surface-container-low">
                    <div>
                      <div className="font-bold text-on-surface">{c.name}</div>
                      <div className="text-[10px] text-outline font-mono">{c.mobile} • {c.customerType}</div>
                    </div>
                    {c.outstanding > 0 && (
                      <span className="text-[10px] text-error font-mono font-bold">₹{c.outstanding} due</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Confirmation Modal */}
      {isConfirmationOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-md w-full rounded border border-surface-container-high shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-secondary">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <div>
                <h3 className="font-headline-md text-base font-bold text-on-surface">Confirm Bulk Dispatch</h3>
                <p className="text-xs text-outline">Verify campaign details before broadcasting</p>
              </div>
            </div>

            <div className="p-3.5 rounded bg-surface-container-low border border-surface-container-high text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-outline">Total Recipients:</span>
                <span className="font-bold text-secondary font-mono">{targetRecipients.length} Customers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Channel Gateway:</span>
                <span className="font-bold text-on-surface">{channel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Audience Target:</span>
                <span className="font-bold text-on-surface">{selectedAudience}</span>
              </div>
              <div className="pt-2 border-t border-surface-container-high">
                <span className="text-outline block mb-1">Message Preview:</span>
                <p className="p-2 rounded bg-surface-container-lowest text-[11px] font-mono text-on-surface line-clamp-3">
                  {renderedPreviewText}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-outline">
              This action will send automated {channel} messages to all selected recipients immediately.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-surface-container-high">
              <button
                onClick={() => setIsConfirmationOpen(false)}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSend}
                className="px-5 py-2 bg-secondary hover:bg-secondary-container text-on-secondary rounded font-bold text-xs shadow-xs"
              >
                Yes, Send Broadcast Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
