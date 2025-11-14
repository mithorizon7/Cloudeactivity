import { useState, useRef, useEffect } from 'react';

interface InfoTooltipProps {
  label: string;
  children: React.ReactNode;
  id?: string;
}

export function InfoTooltip({ label, children, id }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const uniqueId = id || `tooltip-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        tooltipRef.current &&
        buttonRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <span className="relative inline-flex items-center gap-0.5">
      <span>{label}</span>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
          }
        }}
        aria-describedby={isOpen ? uniqueId : undefined}
        aria-expanded={isOpen}
        className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] p-2 touch-manipulation text-xs rounded-full bg-slate-600 text-white hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-[#8b959e]/70 transition-colors -my-2"
        aria-label={`More information about ${label}`}
      >
        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-700 border border-slate-500">?</span>
      </button>
      {isOpen && (
        <div
          ref={tooltipRef}
          id={uniqueId}
          role="tooltip"
          className="absolute z-50 left-0 top-full mt-2 max-w-[calc(100vw-2rem)] w-64 p-3 text-xs leading-relaxed text-slate-200 bg-slate-800 border border-slate-600 rounded-lg shadow-xl animate-fade-in"
        >
          {children}
          <div className="absolute left-4 -top-1 w-2 h-2 bg-slate-800 border-l border-t border-slate-600 transform -translate-y-1/2 rotate-45" />
        </div>
      )}
    </span>
  );
}
