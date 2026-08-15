import React, { useState } from 'react';
import { MessageSquare, X, Send, CheckCircle2, ExternalLink, Sparkles, PhoneCall } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  openWhatsApp,
  formatDisplayPhone,
  getContextualWhatsAppMessage,
} from '../../utils/whatsapp';

export const FloatingWhatsAppWidget: React.FC = () => {
  const { companySettings, activeTab } = useData();
  const { currentUser } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const targetNumber = companySettings?.whatsappNumber || '03018647596';
  const displayPhone = formatDisplayPhone(targetNumber);
  const contextualDefaultMsg = getContextualWhatsAppMessage(activeTab, currentUser?.name);

  // Quick topics tailored dynamically to current section
  const getContextualQuickTopics = () => {
    switch (activeTab) {
      case 'packages':
        return [
          'Assalam-o-Alaikum, please send full brochure & quad/double rates for 15-Days Executive Umrah Package.',
          'Assalam-o-Alaikum, can I get a customized group discount quote for 10 Pax?',
          'Assalam-o-Alaikum, what are the upcoming group departure dates for Makkah & Madinah?',
        ];
      case 'hotels':
        return [
          'Assalam-o-Alaikum, please share nightly room rates for Fairmont Makkah Clock Tower.',
          'Assalam-o-Alaikum, is Pullman Zamzam Madina available near Ladies Gate for next month?',
          'Assalam-o-Alaikum, I want to book a Haram View Suite with Breakfast.',
        ];
      case 'visas':
        return [
          'Assalam-o-Alaikum, what is the current processing time for Saudi Nusuk Umrah Visa?',
          'Assalam-o-Alaikum, please check my passport & photo upload status for Saudi MOFA.',
        ];
      case 'bookings':
      case 'vouchers':
        return [
          'Assalam-o-Alaikum, please send my updated Hotel Voucher & Saudi Flight PNR status.',
          'Assalam-o-Alaikum, I want to request Haramain Bullet Train ticket reservation.',
        ];
      case 'invoices':
      case 'payments':
      case 'receivables':
        return [
          'Assalam-o-Alaikum, please send Meezan Bank official account details for invoice payment.',
          'Assalam-o-Alaikum, I have submitted payment receipt, please verify my balance.',
        ];
      case 'customer-portal':
        return [
          'Assalam-o-Alaikum, I am logged into my KMZ Customer Portal and need pilgrim helpdesk support.',
          'Assalam-o-Alaikum, please verify my Saudi Nusuk E-Visa status.',
        ];
      default:
        return [
          'Assalam-o-Alaikum, please share available Umrah 5-Star packages for Makkah & Madinah.',
          'Assalam-o-Alaikum, I need an update on Saudi Nusuk Visa & Flight PNR details.',
          'Assalam-o-Alaikum, please send me the hotel voucher & booking confirmation details.',
        ];
    }
  };

  const quickMessages = getContextualQuickTopics();

  const handleSendWhatsApp = (msgToSend: string) => {
    openWhatsApp(targetNumber, msgToSend);
  };

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end pointer-events-auto">
      {/* Expanded WhatsApp Quick Chat Drawer */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-zinc-950 border-2 border-emerald-500/50 rounded-2xl shadow-2xl shadow-emerald-500/30 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-zinc-950 p-4 border-b border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/40 relative">
                {/* Official WhatsApp SVG Logo */}
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full border-2 border-zinc-950 animate-ping" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-serif">KMZ WhatsApp Support</h3>
                <p className="text-[10px] text-emerald-300 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Official WhatsApp • {displayPhone}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg bg-zinc-900/60 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 bg-zinc-900/95 space-y-3.5 text-xs">
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-300 space-y-1">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>KMZ Travels & Tours (Pvt) Ltd</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Connect directly with our Faisalabad HQ & Saudi Tour Consultants on WhatsApp for instant assistance.
              </p>
            </div>

            {/* Contextual Instant Enquiry Button */}
            <button
              onClick={() => handleSendWhatsApp(contextualDefaultMsg)}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-black text-xs rounded-xl flex items-center justify-between shadow-lg shadow-emerald-500/25 transition-all transform hover:scale-[1.01]"
            >
              <span className="flex items-center gap-2 pr-2 text-left">
                <Sparkles className="w-4 h-4 text-zinc-950 shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
                <span className="line-clamp-1">Send Instant Context Message</span>
              </span>
              <ExternalLink className="w-4 h-4 shrink-0" />
            </button>

            {/* Contextual Quick Messages List */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block">
                Quick Options ({(activeTab || 'overview').replace('-', ' ')}):
              </label>
              {quickMessages.map((msg, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendWhatsApp(msg)}
                  className="w-full text-left p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 text-[11px] text-zinc-300 hover:text-emerald-300 transition-all flex items-center justify-between group"
                >
                  <span className="line-clamp-2 pr-2 leading-tight">{msg}</span>
                  <Send className="w-3.5 h-3.5 text-emerald-400 opacity-60 group-hover:opacity-100 shrink-0" />
                </button>
              ))}
            </div>

            {/* Custom Message Textarea */}
            <div className="pt-2 border-t border-zinc-800 space-y-2">
              <textarea
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Type your custom query here..."
                rows={2}
                className="w-full p-2.5 bg-zinc-950 border border-emerald-500/30 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 custom-scrollbar"
              />
              <button
                onClick={() => {
                  if (customMsg.trim()) {
                    handleSendWhatsApp(customMsg);
                    setCustomMsg('');
                  }
                }}
                disabled={!customMsg.trim()}
                className="w-full py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Start WhatsApp Chat</span>
              </button>
            </div>
          </div>

          {/* Footer Contact */}
          <div className="px-4 py-2.5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400">
            <span className="flex items-center gap-1 font-mono">
              <PhoneCall className="w-3 h-3 text-emerald-400" />
              {displayPhone}
            </span>
            <span className="text-amber-400 font-bold">KMZ Official Chat</span>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-black rounded-full shadow-2xl shadow-emerald-500/50 border-2 border-amber-400/80 transition-all transform hover:scale-105 active:scale-95 group relative"
        title={`Chat on WhatsApp (${displayPhone})`}
      >
        <div className="relative flex items-center justify-center">
          {/* WhatsApp Icon */}
          <svg className="w-5 h-5 fill-current text-zinc-950" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
        </div>
        <span className="text-xs font-black tracking-wide hidden sm:inline">WhatsApp Chat</span>
        <span className="text-xs font-black tracking-wide sm:hidden">WhatsApp</span>
      </button>
    </div>
  );
};
