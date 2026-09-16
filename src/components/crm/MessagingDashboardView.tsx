import React, { useState } from 'react';
import { MessageTemplate, CommunicationLogRecord } from '../../types';

interface MessagingDashboardViewProps {
  templates: MessageTemplate[];
  communicationLogs: CommunicationLogRecord[];
  onSaveTemplate: (template: MessageTemplate) => void;
  onNavigateBulk: () => void;
  onOpenTestMessage: (template?: MessageTemplate) => void;
}

export const MessagingDashboardView: React.FC<MessagingDashboardViewProps> = ({
  templates,
  communicationLogs,
  onSaveTemplate,
  onNavigateBulk,
  onOpenTestMessage
}) => {
  const [activeTab, setActiveTab] = useState<'channels' | 'templates' | 'logs'>('channels');
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [newTplName, setNewTplName] = useState('');
  const [newTplChannel, setNewTplChannel] = useState<'WhatsApp' | 'SMS' | 'Both'>('WhatsApp');
  const [newTplCategory, setNewTplCategory] = useState<'Invoice' | 'Payment Reminder' | 'Loyalty' | 'Marketing' | 'Welcome' | 'Service'>('Invoice');
  const [newTplContent, setNewTplContent] = useState('');

  // Delivery metrics
  const totalSent = communicationLogs.length;
  const delivered = communicationLogs.filter(l => l.status === 'Delivered').length;
  const failed = communicationLogs.filter(l => l.status === 'Failed').length;
  const pending = communicationLogs.filter(l => l.status === 'Pending' || l.status === 'Sent').length;

  const whatsAppCount = communicationLogs.filter(l => l.channel === 'WhatsApp').length;
  const smsCount = communicationLogs.filter(l => l.channel === 'SMS').length;

  const handleCreateOrUpdateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTplName.trim() || !newTplContent.trim()) return;

    // extract variables like {{variable_name}}
    const regex = /\{\{([^}]+)\}\}/g;
    const extractedVars: string[] = [];
    let match;
    while ((match = regex.exec(newTplContent)) !== null) {
      if (!extractedVars.includes(match[1].trim())) {
        extractedVars.push(match[1].trim());
      }
    }

    const tpl: MessageTemplate = {
      id: editingTemplate ? editingTemplate.id : 'tpl-' + Date.now(),
      name: newTplName,
      channel: newTplChannel,
      category: newTplCategory,
      content: newTplContent,
      variables: extractedVars
    };

    onSaveTemplate(tpl);
    setEditingTemplate(null);
    setNewTplName('');
    setNewTplContent('');
  };

  const handleEdit = (tpl: MessageTemplate) => {
    setEditingTemplate(tpl);
    setNewTplName(tpl.name);
    setNewTplChannel(tpl.channel);
    setNewTplCategory(tpl.category);
    setNewTplContent(tpl.content);
  };

  return (
    <div className="flex flex-col w-full pb-12 space-y-gutter animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded border border-surface-container-high shadow-xs gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">chat</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">WhatsApp &amp; SMS Messaging Communications Hub</h1>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Configure dynamic notification templates, track delivery status, and launch targeted counter campaigns
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenTestMessage()}
            className="px-3 py-1.5 bg-surface-container text-on-surface hover:bg-surface-container-high rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">send</span>
            <span>Send Test Message</span>
          </button>
          <button
            onClick={onNavigateBulk}
            className="px-3.5 py-1.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">campaign</span>
            <span>Launch Bulk Campaign</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm">
        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="font-label-caps text-label-caps text-outline uppercase">Total Messages Dispatched</span>
          <div className="font-numeric-lg text-xl font-bold text-on-surface mt-1">{totalSent}</div>
          <span className="text-[11px] text-outline">WhatsApp: {whatsAppCount} • SMS: {smsCount}</span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="font-label-caps text-label-caps text-outline uppercase">Delivered Successfully</span>
          <div className="font-numeric-lg text-xl font-bold text-on-tertiary-container mt-1">{delivered}</div>
          <span className="text-[11px] text-on-tertiary-container font-medium">{((delivered / (totalSent || 1)) * 100).toFixed(1)}% delivery success</span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="font-label-caps text-label-caps text-outline uppercase">Pending / In Transit</span>
          <div className="font-numeric-lg text-xl font-bold text-secondary mt-1">{pending}</div>
          <span className="text-[11px] text-outline">Carrier queuing</span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="font-label-caps text-label-caps text-outline uppercase">Failed Dispatches</span>
          <div className="font-numeric-lg text-xl font-bold text-error mt-1">{failed}</div>
          <span className="text-[11px] text-outline">Invalid phone numbers</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-surface-container-high bg-surface-container-lowest rounded-t">
        <button
          onClick={() => setActiveTab('channels')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'channels'
              ? 'border-secondary text-secondary bg-surface-container-low'
              : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">settings_input_antenna</span>
          <span>Gateway Channels</span>
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'templates'
              ? 'border-secondary text-secondary bg-surface-container-low'
              : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">content_copy</span>
          <span>Templates Library ({templates.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'logs'
              ? 'border-secondary text-secondary bg-surface-container-low'
              : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">history</span>
          <span>Communication History Logs</span>
        </button>
      </div>

      {/* Tab 1: Channels */}
      {activeTab === 'channels' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
          {/* WhatsApp Gateway Card */}
          <div className="bg-surface-container-lowest p-5 rounded border border-surface-container-high shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-2xl text-on-tertiary-container">chat</span>
                <div>
                  <h3 className="font-bold text-on-surface text-base">WhatsApp Cloud API Gateway</h3>
                  <div className="text-[11px] text-on-tertiary-container font-semibold">● Connected &amp; Verified</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-bold text-[10px]">
                OFFICIAL WABA
              </span>
            </div>

            <p className="text-xs text-outline">
              Sends automated digital bills with PDF attachments, outstanding payment payment links, and mechanic loyalty notifications.
            </p>

            <div className="p-3 rounded bg-surface-container-low border border-surface-container-high text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-outline">Business Phone:</span>
                <span className="font-mono font-bold text-on-surface">+91 98401 11223</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Tier:</span>
                <span className="font-bold text-on-surface">1,000 Conversations / Day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Latency:</span>
                <span className="font-mono text-on-tertiary-container font-bold">~1.2s Delivery</span>
              </div>
            </div>
          </div>

          {/* SMS Carrier Gateway Card */}
          <div className="bg-surface-container-lowest p-5 rounded border border-surface-container-high shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-2xl text-secondary">sms</span>
                <div>
                  <h3 className="font-bold text-on-surface text-base">DLT-Approved SMS Gateway</h3>
                  <div className="text-[11px] text-on-tertiary-container font-semibold">● Active (Sender ID: BKSPAR)</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-bold text-[10px]">
                DLT COMPLIANT
              </span>
            </div>

            <p className="text-xs text-outline">
              Fallback transmission for offline counter buyers, transactional OTPs, and overdue collection reminders.
            </p>

            <div className="p-3 rounded bg-surface-container-low border border-surface-container-high text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-outline">Sender Header:</span>
                <span className="font-mono font-bold text-on-surface">BKSPAR-IN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">DLT Entity ID:</span>
                <span className="font-mono text-on-surface">14015528990123</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Balance Credits:</span>
                <span className="font-mono font-bold text-secondary">4,820 Credits</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Templates Library & Creator */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-sm">
          {/* Templates List */}
          <div className="lg:col-span-2 space-y-3">
            {templates.map(tpl => (
              <div key={tpl.id} className="bg-surface-container-lowest p-4 rounded border border-surface-container-high shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-on-surface text-sm">{tpl.name}</span>
                    <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface text-[10px] font-bold uppercase">
                      {tpl.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                      tpl.channel === 'WhatsApp' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-secondary-fixed text-on-secondary-fixed'
                    }`}>
                      {tpl.channel}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenTestMessage(tpl)}
                      className="px-2 py-1 bg-surface-container hover:bg-surface-container-high rounded text-[11px] font-semibold flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[13px]">send</span>
                      <span>Test</span>
                    </button>
                    <button
                      onClick={() => handleEdit(tpl)}
                      className="p-1 rounded text-outline hover:text-secondary hover:bg-surface-container"
                      title="Edit Template"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded bg-surface-container-low border border-surface-container-high font-mono text-xs text-on-surface whitespace-pre-wrap">
                  {tpl.content}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-outline">
                  <span>Variables:</span>
                  {tpl.variables.map(v => (
                    <span key={v} className="px-1.5 py-0.2 rounded bg-surface-container text-secondary font-mono text-[10px]">
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Create / Edit Template Form */}
          <div className="bg-surface-container-lowest p-4 rounded border border-surface-container-high shadow-xs space-y-3">
            <h3 className="font-headline-md text-sm font-bold text-on-surface">
              {editingTemplate ? 'Edit Message Template' : '+ Create Message Template'}
            </h3>

            <form onSubmit={handleCreateOrUpdateTemplate} className="space-y-3 text-xs">
              <div>
                <label className="block text-outline font-medium mb-1">Template Name</label>
                <input
                  type="text"
                  required
                  value={newTplName}
                  onChange={e => setNewTplName(e.target.value)}
                  placeholder="e.g. Counter Payment Thank You"
                  className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface focus:outline-none focus:border-secondary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-outline font-medium mb-1">Channel</label>
                  <select
                    value={newTplChannel}
                    onChange={e => setNewTplChannel(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="SMS">SMS</option>
                    <option value="Both">Both (WhatsApp + SMS)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-outline font-medium mb-1">Category</label>
                  <select
                    value={newTplCategory}
                    onChange={e => setNewTplCategory(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface"
                  >
                    <option value="Invoice">Invoice</option>
                    <option value="Payment Reminder">Payment Reminder</option>
                    <option value="Loyalty">Loyalty</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Welcome">Welcome</option>
                    <option value="Service">Service</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-outline font-medium mb-1">Template Content</label>
                <textarea
                  required
                  rows={4}
                  value={newTplContent}
                  onChange={e => setNewTplContent(e.target.value)}
                  placeholder="Type message with variables like {{customer_name}}, {{invoice_number}}, {{amount}}, {{outstanding}}, {{points}}..."
                  className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface font-mono text-xs focus:outline-none focus:border-secondary"
                />
              </div>

              <div className="p-2 rounded bg-surface-container text-[11px] text-outline space-y-1">
                <span className="font-bold text-on-surface block">Available Variables:</span>
                <div className="flex flex-wrap gap-1">
                  {['customer_name', 'invoice_number', 'amount', 'outstanding', 'points', 'due_date', 'vehicle_model', 'reg_no'].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setNewTplContent(prev => prev + ` {{${v}}}`)}
                      className="px-1 py-0.2 rounded bg-surface-container-lowest text-secondary font-mono text-[10px] hover:underline"
                    >
                      {`+ {{${v}}}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-surface-container-high">
                {editingTemplate && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTemplate(null);
                      setNewTplName('');
                      setNewTplContent('');
                    }}
                    className="px-3 py-1.5 bg-surface-container text-on-surface rounded font-semibold"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-secondary text-on-secondary rounded font-bold shadow-xs"
                >
                  {editingTemplate ? 'Update Template' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: History Logs */}
      {activeTab === 'logs' && (
        <div className="bg-surface-container-lowest rounded border border-surface-container-high shadow-xs overflow-hidden">
          <div className="p-3 bg-surface-container border-b border-surface-container-high flex items-center justify-between">
            <span className="font-headline-md text-sm font-bold text-on-surface">Chronological Dispatch &amp; Delivery Log</span>
            <span className="text-xs text-outline">{communicationLogs.length} Records</span>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-container-low font-label-caps text-on-surface-variant uppercase text-[10px]">
              <tr>
                <th className="p-2.5">Date / Time</th>
                <th className="p-2.5">Channel</th>
                <th className="p-2.5">Customer</th>
                <th className="p-2.5">Mobile</th>
                <th className="p-2.5">Message Content</th>
                <th className="p-2.5">Category</th>
                <th className="p-2.5 text-center">Status</th>
                <th className="p-2.5">Sender</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-table-cell">
              {communicationLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-outline">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-4xl opacity-50">chat</span>
                      <p className="font-semibold text-on-surface text-base">No communications logged.</p>
                      <p className="text-xs">WhatsApp and SMS message logs will appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                communicationLogs.map(log => (
                <tr key={log.id} className="hover:bg-surface-container-low">
                  <td className="p-2.5 text-outline font-mono">{log.date} {log.time}</td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                      log.channel === 'WhatsApp' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-secondary-fixed text-on-secondary-fixed'
                    }`}>
                      {log.channel}
                    </span>
                  </td>
                  <td className="p-2.5 font-bold text-on-surface">{log.customerName}</td>
                  <td className="p-2.5 font-mono text-outline">{log.mobile}</td>
                  <td className="p-2.5 max-w-xs truncate text-on-surface-variant font-mono text-[11px]" title={log.message}>
                    {log.message}
                  </td>
                  <td className="p-2.5 text-outline">{log.category}</td>
                  <td className="p-2.5 text-center">
                    <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-bold text-[10px] uppercase">
                      {log.status}
                    </span>
                  </td>
                  <td className="p-2.5 text-outline text-[11px]">{log.user}</td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
