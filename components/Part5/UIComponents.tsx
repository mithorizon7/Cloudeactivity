import React from 'react';
import { FormattedMessage, useIntl } from '../../i18n';
import { StepStatus } from './types';

interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  children,
  className = '',
  ariaLabel,
}) => (
  <section
    aria-label={ariaLabel}
    className={`bg-slate-900/50 rounded-xl p-5 border border-slate-700/40 shadow-xl ${className}`}
  >
    {children}
  </section>
);

interface PriorityMeterProps {
  priorities: Array<{
    key: string;
    label: string;
    weight: number;
    priority: 'high' | 'med' | 'low';
  }>;
}

export const PriorityMeter: React.FC<PriorityMeterProps> = ({ priorities }) => {
  const intl = useIntl();
  const sortedPriorities = [...priorities].sort((a, b) => b.weight - a.weight);
  const priorityLabels = {
    high: intl.formatMessage({ id: 'part5.priority.high' }),
    med: intl.formatMessage({ id: 'part5.priority.med' }),
    low: intl.formatMessage({ id: 'part5.priority.low' }),
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-semibold text-white">
          <FormattedMessage id="part5.priority.focus" />
        </span>
      </div>
      <div className="grid gap-2">
        {sortedPriorities.map(({ key, label, weight, priority }) => {
          const widthPercent = Math.round(weight * 100);
          const colors = {
            high: { bar: 'bg-emerald-500', text: 'text-emerald-400', label: priorityLabels.high },
            med: { bar: 'bg-blue-500', text: 'text-blue-400', label: priorityLabels.med },
            low: { bar: 'bg-slate-500', text: 'text-slate-400', label: priorityLabels.low },
          };
          const color = colors[priority];

          return (
            <div key={key} className="flex items-center gap-3">
              <div className="w-24 sm:w-28 text-sm text-slate-300 truncate">{label}</div>
              <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color.bar} rounded-full transition-all duration-500`}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
              <div className={`w-20 text-xs font-medium ${color.text} text-right`}>
                {color.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface ScenarioIntroProps {
  scenarioNumber: number;
  totalScenarios: number;
  icon: React.ReactNode;
  roleText: string;
  contextText: string;
}

export const ScenarioIntro: React.FC<ScenarioIntroProps> = ({
  scenarioNumber,
  totalScenarios,
  icon,
  roleText,
  contextText,
}) => (
  <div className="mb-6 bg-gradient-to-br from-indigo-900/40 to-slate-900/60 rounded-2xl p-5 sm:p-6 border border-indigo-500/30 shadow-xl">
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
      <div className="flex-shrink-0 p-3 sm:p-4 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-3 py-1 bg-indigo-500/30 text-indigo-300 text-sm font-semibold rounded-full">
            <FormattedMessage
              id="part5.scenario.label"
              values={{ current: scenarioNumber, total: totalScenarios }}
            />
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-white mb-2">{roleText}</h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">{contextText}</p>
      </div>
    </div>
  </div>
);

interface PointsAnimationProps {
  points: number;
  show: boolean;
}

export const PointsAnimation: React.FC<PointsAnimationProps> = ({ points, show }) => {
  if (!show) return null;

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none animate-bounce">
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-500/50 flex items-center gap-3">
        <span className="text-3xl font-bold">+{points}</span>
        <span className="text-lg">
          <FormattedMessage id="part5.points.exclaim" />
        </span>
      </div>
    </div>
  );
};

interface ScoreIndicatorProps {
  currentScore: number;
  maxScore: number;
  scenarioNumber: number;
  totalScenarios: number;
}

export const ScoreIndicator: React.FC<ScoreIndicatorProps> = ({
  currentScore,
  scenarioNumber,
  totalScenarios,
}) => (
  <div className="flex items-center gap-4 px-4 py-2 bg-slate-800/60 backdrop-blur-sm rounded-lg border border-slate-700/50">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
        <span className="text-white text-sm font-bold">{currentScore}</span>
      </div>
      <span className="text-xs text-slate-400">
        <FormattedMessage id="part5.points.abbrev" />
      </span>
    </div>
    <div className="h-6 w-px bg-slate-600" />
    <div className="flex gap-1">
      {Array.from({ length: totalScenarios }).map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            i < scenarioNumber
              ? 'bg-emerald-500'
              : i === scenarioNumber - 1
                ? 'bg-cyan-500 animate-pulse'
                : 'bg-slate-600'
          }`}
        />
      ))}
    </div>
  </div>
);

interface SliderMilestoneProps {
  min: number;
  max: number;
  value: number;
}

export const SliderMilestones: React.FC<SliderMilestoneProps> = ({ value }) => {
  const intl = useIntl();
  const getCurrentStage = () => {
    if (value >= 100000)
      return {
        key: 'enterprise',
        color: 'from-purple-500/30 to-purple-600/20 border-purple-400/50 text-purple-300',
      };
    if (value >= 25000)
      return {
        key: 'growth',
        color: 'from-emerald-500/30 to-emerald-600/20 border-emerald-400/50 text-emerald-300',
      };
    if (value >= 5000)
      return {
        key: 'startup',
        color: 'from-cyan-500/30 to-cyan-600/20 border-cyan-400/50 text-cyan-300',
      };
    return {
      key: 'early',
      color: 'from-slate-500/30 to-slate-600/20 border-slate-400/50 text-slate-300',
    };
  };

  const stage = getCurrentStage();
  const stageName = intl.formatMessage({ id: `part5.stage.${stage.key}` });

  return (
    <div className="mt-4 text-center">
      <span
        className={`inline-block px-4 py-1.5 bg-gradient-to-r ${stage.color} text-xs font-semibold rounded-full border`}
      >
        <FormattedMessage id="part5.stage.label" values={{ stage: stageName }} />
      </span>
    </div>
  );
};

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
        className={`w-full text-left p-5 min-h-[56px] flex items-center gap-4 hover:bg-slate-800/30 active:bg-slate-800/50 motion-safe:transition-colors rounded-t-xl touch-manipulation ${
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
