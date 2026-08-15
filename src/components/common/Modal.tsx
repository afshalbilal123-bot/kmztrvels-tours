import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '2xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full ${maxWidthClasses[maxWidth]} my-auto bg-gradient-to-b from-[#032d22] to-[#021812] border border-[#d4af37]/35 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden text-[#f5ecd0] transform transition-all duration-200 z-10`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#d4af37]/25 bg-gradient-to-r from-[#021d15] via-[#032d22] to-[#021d15]">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[#fdfbf7] flex items-center gap-2 font-serif">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37] animate-pulse" />
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-emerald-200/70 mt-0.5 tracking-wide">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-emerald-200/60 hover:text-[#d4af37] hover:bg-[#d4af37]/15 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};
