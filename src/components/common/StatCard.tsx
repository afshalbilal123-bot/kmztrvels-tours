import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  subtitle?: string;
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  subtitle,
  badge,
}) => {
  return (
    <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-b from-[#032d22]/90 to-[#021f17]/95 border border-[#d4af37]/25 p-5 hover:border-[#d4af37]/60 hover:shadow-2xl hover:shadow-[#064e3b]/30 transition-all duration-300 shadow-xl shadow-black/50">
      {/* Subtle royal gold & emerald decorative gradient halo */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[#d4af37]/15 to-[#047857]/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <span className="text-xs font-bold text-[#d4af37] uppercase tracking-wider font-serif">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#fdfbf7] tracking-tight">
            {value}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-gradient-to-br from-[#064e3b]/80 to-[#022c22] border border-[#d4af37]/35 text-[#d4af37] group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#d4af37]/20 transition-all duration-300">
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {(change || subtitle || badge) && (
        <div className="mt-4 pt-3 border-t border-[#064e3b]/60 flex items-center justify-between text-xs relative z-10">
          {change && (
            <span
              className={`font-bold flex items-center gap-1 ${
                isPositive ? 'text-emerald-300' : 'text-rose-400'
              }`}
            >
              {isPositive ? '↑' : '↓'} {change}
            </span>
          )}
          {subtitle && <span className="text-emerald-200/60 font-medium">{subtitle}</span>}
          {badge && (
            <span className="px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#f5ecd0] text-[10px] font-bold border border-[#d4af37]/30">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
