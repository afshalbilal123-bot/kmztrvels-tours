import React, { useState } from 'react';
import { Bell, MessageSquare, Send, CheckCheck, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const NotificationsList: React.FC = () => {
  const { notifications, sendWhatsAppMessage } = useData();
  const [filterType, setFilterType] = useState('all');

  const filtered = notifications.filter(
    (n) => filterType === 'all' || n.type === filterType || n.status === filterType
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/20">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-400" />
            WhatsApp Automated Notifications & Reminders
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Automated WhatsApp Business API triggers for visa approvals, flight itinerary changes, payment receipts, and voucher deliveries.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
        {['all', 'WhatsApp', 'Payment Due', 'Visa Issued', 'Delivered'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              filterType === t
                ? 'bg-amber-500 text-zinc-950 font-bold'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Grid of Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((n) => (
          <div
            key={n.id}
            className="p-5 rounded-2xl bg-zinc-900 border border-amber-500/20 flex flex-col justify-between space-y-3 shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xs">{n.recipientName}</h3>
                    <div className="text-[10px] text-zinc-400">{n.recipientPhone}</div>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-zinc-500">{n.timestamp}</span>
              </div>

              <div className="mt-3 text-xs text-zinc-200 bg-zinc-950 p-3 rounded-xl border border-zinc-800 leading-relaxed font-sans">
                {n.message}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                <CheckCheck className="w-3.5 h-3.5" /> WhatsApp Delivered
              </span>

              <button
                onClick={() => sendWhatsAppMessage(n.recipientPhone, n.message)}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-bold text-[11px] border border-emerald-500/30 flex items-center gap-1.5"
              >
                <Send className="w-3 h-3" /> Resend via WhatsApp
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
