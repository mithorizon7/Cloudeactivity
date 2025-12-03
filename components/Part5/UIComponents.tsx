import React from 'react';
import { StepStatus } from './types';

interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({ children, className = '', ariaLabel }) => (
  <section
    aria-label={ariaLabel}
    className={`bg-slate-900/50 rounded-xl p-5 border border-slate-700/40 shadow-xl ${className}`}
  >
    {children}
  </section>
);

interface TokenProps {
  children: React.ReactNode;
}

export const Token: React.FC<TokenProps> = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-slate-600 bg-slate-800/70 px-2.5 py-1 text-xs text-slate-200">
    {children}
  </span>
);

interface StepCardProps {
  stepNumber: number;
  title: string;
  subtitle: string;
  status: StepStatus;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  stepRef?: (el: HTMLDivElement | null) => void;
}

export const StepCard: React.FC<StepCardProps> = ({
  stepNumber,
  title,
  subtitle,
  status,
  expanded,
  onToggle,
  children,
  stepRef,
}) => {
  const statusColors = {
    notStarted: 'bg-slate-600 text-slate-300',
    inProgress: 'bg-cyan-500 text-white',
    done: 'bg-emerald-500 text-white',
  };

  return (
    <div
      ref={stepRef}
      className={`bg-slate-900/50 rounded-xl border shadow-xl motion-safe:transition-all ${
        expanded ? 'border-cyan-500/60' : 'border-slate-700/40'
      }`}
    >
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className={`w-full text-left p-5 flex items-center gap-4 hover:bg-slate-800/30 motion-safe:transition-colors rounded-t-xl ${
          expanded ? '' : 'rounded-b-xl'
        }`}
      >
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${statusColors[status]}`}
        >
          {status === 'done' ? '✓' : stepNumber}
        </div>
        <div className="flex-1">
          <div className="text-lg font-semibold text-white">{title}</div>
          <div className="text-sm text-slate-400">{subtitle}</div>
        </div>
        <div className="text-slate-400 text-xl">{expanded ? '−' : '+'}</div>
      </button>
      {expanded && <div className="p-5 pt-0 motion-safe:animate-fadeIn">{children}</div>}
    </div>
  );
};

interface BarProps {
  value: number;
  label: string;
}

export const Bar: React.FC<BarProps> = ({ value, label }) => (
  <div className="mb-3">
    <div className="flex justify-between text-sm text-slate-300">
      <span>{label}</span>
      <span>{Math.round(value)}/100</span>
    </div>
    <div className="h-2 w-full rounded bg-slate-700">
      <div
        className="h-2 rounded bg-emerald-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  </div>
);
