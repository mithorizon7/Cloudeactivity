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
    <span className="relative inline-flex items-center gap-1">
      <span>{label}</span>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        aria-describedby={isOpen ? uniqueId : undefined}
        aria-expanded={isOpen}
        className="inline-flex items-center justify-center w-4 h-4 text-xs rounded-full bg-slate-600 text-white hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-[#8b959e]/70 transition-colors"
        aria-label={`More information about ${label}`}
      >
        ?
      </button>
      {isOpen && (
        <div
          ref={tooltipRef}
          id={uniqueId}
          role="tooltip"
          className="absolute z-50 left-0 top-full mt-2 w-64 p-3 text-xs leading-relaxed text-slate-200 bg-slate-800 border border-slate-600 rounded-lg shadow-xl animate-fade-in"
        >
          {children}
          <div className="absolute left-4 -top-1 w-2 h-2 bg-slate-800 border-l border-t border-slate-600 transform -translate-y-1/2 rotate-45" />
        </div>
      )}
    </span>
  );
}
