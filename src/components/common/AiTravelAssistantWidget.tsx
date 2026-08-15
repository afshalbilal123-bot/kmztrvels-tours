import React, { useState } from 'react';
import { Sparkles, Bot, Send, X, Compass, HelpCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

export const AiTravelAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'bot',
      text: 'Assalamu Alaikum. I am your KMZ Travels AI Pilgrimage & Travel Assistant. Ask me anything about Umrah rituals, Meeqat, Saudi Nusuk Visas, KMZ hotel distances, or flight baggage allowances!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const quickTopics = [
    'How to enter Ihram before Meeqat?',
    'What are the Hotel distances to Haram?',
    'Nusuk Umrah Visa documents required?',
    'Zamzam water flight allowance rules?',
    'How to book High-Speed Haramain Train?',
  ];

  const knowledgeBaseResponses: Record<string, string> = {
    ihram: `**Ihram & Meeqat Guidelines**:
1. For Pakistani pilgrims flying direct to Jeddah (JED), enter Ihram at your home departure airport (LHE/ISB/KHI) or on board before crossing Meeqat (Yalamlam/Qarn al-Manazil).
2. If flying direct to Madina (MED), you do NOT need Ihram on the flight. You will assume Ihram at Dhul Hulaifah (Abyar Ali) when leaving Madina for Makkah.
3. Perform Ghusl, wear two unstitched white sheets (for men), and recite Niyyah & Talbiyah: *"Labbayka Allāhumma 'Umratan"*.`,

    hotel: `**KMZ Partner Hotels & Distance to Haram**:
• **Fairmont Makkah Clock Tower**: Directly facing King Abdulaziz Gate (0 meters, integrated in Abraj Al Bait).
• **Swissôtel Makkah**: Adjacent to Clock Tower Mall entrance (50 meters to Haram courtyard).
• **Oberoi Madina**: Directly facing Prophet's Mosque Ladies Gate 25 (50 meters).
• **Pullman Zamzam Madina**: Facing Northern Courtyard Gate 17 (100 meters).
• **Kiswah Towers Makkah**: Kudai area with 24/7 free shuttle buses direct to Haram Clock Tower station (800 meters).`,

    visa: `**Saudi Nusuk Umrah Visa Requirements**:
1. Valid Pakistani Passport (minimum 6 months validity remaining).
2. Passport-sized photo with white background.
3. CNIC copy.
4. Passport processing time: 24 to 48 hours in KMZ Saudi MOFA portal. Includes mandatory Saudi SAR 100K Medical Health Insurance.`,

    zamzam: `**Zamzam & Flight Baggage Rules**:
• **PIA & Saudi Airlines**: Each pilgrim with an Umrah Visa is entitled to 1x 5 Litre official Saudi Nusuk wrapped Zamzam bottle free at King Abdulaziz Airport Jeddah (JED) or Madina Airport (MED).
• **Baggage Allowance**: Economy class usually includes 2 pieces of 23kg (total 46kg) plus 7kg hand carry.`,

    train: `**Haramain High-Speed Railway**:
• KMZ Travel arranges First Class VIP tickets for the Haramain bullet train connecting Jeddah Airport -> Makkah -> Madina.
• Journey time from Makkah to Madina: Only 2 hours and 20 minutes in climate-controlled luxury cars!`,
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let botAnswer = '';
      const lower = textToSend.toLowerCase();

      if (lower.includes('ihram') || lower.includes('meeqat')) {
        botAnswer = knowledgeBaseResponses.ihram;
      } else if (lower.includes('hotel') || lower.includes('distance') || lower.includes('fairmont') || lower.includes('oberoi')) {
        botAnswer = knowledgeBaseResponses.hotel;
      } else if (lower.includes('visa') || lower.includes('nusuk') || lower.includes('passport')) {
        botAnswer = knowledgeBaseResponses.visa;
      } else if (lower.includes('zamzam') || lower.includes('baggage') || lower.includes('flight')) {
        botAnswer = knowledgeBaseResponses.zamzam;
      } else if (lower.includes('train') || lower.includes('haramain') || lower.includes('transport')) {
        botAnswer = knowledgeBaseResponses.train;
      } else {
        botAnswer = `Thank you for asking! For "${textToSend}", KMZ Travels & Tours provides personalized guidance. Our owner Toheed Asghar Shahid and senior team ensure all pilgrims receive end-to-end support in Makkah & Madina. You can also message us directly on WhatsApp at 03018647596 for custom package customization!`;
      }

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: botAnswer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-24 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black rounded-full shadow-2xl shadow-amber-500/40 border border-amber-300 transition-all transform hover:scale-105"
        >
          <Sparkles className="w-4 h-4 text-zinc-950" />
          <span className="text-xs font-serif font-extrabold tracking-wide">KMZ Travels AI</span>
        </button>
      </div>

      {/* AI Assistant Modal Window */}
      {isOpen && (
        <div className="fixed bottom-36 right-6 z-50 w-80 sm:w-96 bg-zinc-950 border-2 border-amber-500/50 rounded-2xl shadow-2xl shadow-amber-500/30 overflow-hidden flex flex-col h-[500px]">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border-b border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-serif font-bold text-white flex items-center gap-1.5">
                  KMZ Travels AI Assistant
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 font-mono">
                    KMZ CRM
                  </span>
                </h3>
                <p className="text-[10px] text-zinc-400">Umrah, Hajj & Travel Intelligence</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Topics */}
          <div className="p-2 bg-zinc-900/60 border-b border-zinc-800 flex gap-1.5 overflow-x-auto custom-scrollbar">
            {quickTopics.map((topic, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(topic)}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-zinc-950 border border-amber-500/20 text-[10px] text-amber-300 hover:bg-amber-500/10 transition-colors whitespace-nowrap"
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-zinc-950/90 custom-scrollbar text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    m.sender === 'user'
                      ? 'bg-amber-500 text-zinc-950 font-medium rounded-br-none shadow-md'
                      : 'bg-zinc-900 text-zinc-200 border border-amber-500/20 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed text-[11px]">{m.text}</p>
                  <span
                    className={`block text-[9px] mt-1 font-mono ${
                      m.sender === 'user' ? 'text-zinc-900/80 text-right' : 'text-zinc-500'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-amber-400 text-[11px] font-mono">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>KMZ Travels AI is consulting pilgrimage records...</span>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-zinc-900 border-t border-amber-500/20 flex gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about Ihram, Nusuk visa, hotels, flights..."
              className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputQuery.trim()}
              className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 disabled:opacity-50 font-bold hover:from-amber-400 hover:to-amber-500"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
