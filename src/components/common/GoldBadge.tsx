import React from 'react';

interface GoldBadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'emerald' | 'amber' | 'rose' | 'slate' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GoldBadge: React.FC<GoldBadgeProps> = ({
  children,
  variant = 'gold',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  };

  const variantClasses = {
    gold: 'bg-[#d4af37]/15 text-[#f5ecd0] border border-[#d4af37]/40 shadow-sm shadow-[#d4af37]/10 font-bold',
    emerald: 'bg-[#047857]/20 text-emerald-300 border border-[#10b981]/40 font-bold',
    amber: 'bg-[#b89047]/20 text-[#f3e5ab] border border-[#d4af37]/40 font-bold',
    rose: 'bg-rose-500/15 text-rose-300 border border-rose-500/35 font-bold',
    slate: 'bg-[#022c22] text-emerald-100/70 border border-[#064e3b] font-medium',
    blue: 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/35 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full tracking-wide transition-all ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
