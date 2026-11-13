import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Card, Button, Input, Select, Badge, useToast, Tabs } from '@campusone/ui';
import { MessageSquare, Send, Bell, CheckCircle } from 'lucide-react';

export const CommunicationsView: React.FC = () => {
  const { recordAudit } = useApp();
  const { showToast } = useToast();

  const [audience, setAudience] = useState('ALL_STUDENTS');
  const [channel, setChannel] = useState('SMS_AND_INAPP');
  const [messageText, setMessageText] = useState(
    'Bethsaida CHT: Notice to all CHEW 200L students. Harmattan semester clinical posting allocations at designated PHCs and state hospitals commence Monday 24 Nov 2026. Ensure full fee clearance before reporting. Registrar.'
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    recordAudit('BULK_NOTIFICATION_DISPATCHED', 'COM_BROADCAST', audience, { channel, length: messageText.length });
    showToast({
      type: 'success',
      title: 'Broadcast Dispatched',
      message: `Message sent via ${channel} to ${audience}. Delivery reports queued.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Communication & Notifications (COM)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bulk SMS (Termii SPI) • Transactional Email • In-App Announcements • Sponsor Feeds
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card
            header={
              <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Compose Targeted Broadcast
              </span>
            }
          >
            <form onSubmit={handleSendMessage} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Target Audience"
                  value={audience}
                  onChange={(v) => setAudience(v)}
                  options={[
                    { value: 'ALL_STUDENTS', label: 'All Registered Students (1,248)' },
                    { value: 'CHEW_200L', label: 'CHEW 200 Level Trainees (124)' },
                    { value: 'DEBTORS_ONLY', label: 'Fee Defaulters & Debtors (142)' },
                    { value: 'ALL_FACULTY', label: 'All Faculty & Academic Staff (86)' },
                    { value: 'SPONSORS', label: 'Registered Parents & Sponsors (640)' },
                  ]}
                />
                <Select
                  label="Delivery Channel"
                  value={channel}
                  onChange={(v) => setChannel(v)}
                  options={[
                    { value: 'SMS_AND_INAPP', label: 'SMS (Termii Gateway) + In-App Notice' },
                    { value: 'SMS_ONLY', label: 'SMS Only' },
                    { value: 'EMAIL_ONLY', label: 'Official Transactional Email' },
                    { value: 'INAPP_ONLY', label: 'In-App Portal Notice Only' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Message Content (No Emojis • Max 320 Characters)
                </label>
                <textarea
                  rows={4}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full rounded-[4px] border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0A77FE]"
                />
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                  <span>Standard Nigerian SMS Billing Unit: 160 Chars</span>
                  <span className="font-semibold text-slate-600">{messageText.length} / 320 characters</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button size="sm" type="submit" leftIcon={<Send className="w-3.5 h-3.5" />}>
                  Dispatch Notification
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div>
          <Card
            header={
              <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                SMS Provider Quota & Health
              </span>
            }
          >
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-[4px] bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block uppercase text-[10px]">Termii Wallet Balance</span>
                <span className="text-lg font-bold text-slate-900">₦142,500.00</span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">Route: DND Priority Tier 1</span>
              </div>
              <div className="space-y-1.5 text-slate-600 text-[11px]">
                <div className="flex justify-between">
                  <span>Delivery Success Rate:</span>
                  <span className="font-bold text-[#13A348]">99.4%</span>
                </div>
                <div className="flex justify-between">
                  <span>Registered Sender ID:</span>
                  <span className="font-bold text-slate-800">BETHSAIDA</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
