import React from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { Stage, STAGES } from '../types';

interface ProgressBarProps {
  currentStage: Stage;
  completedStages: Set<Stage>;
  onNavigate: (stage: Stage) => void;
  actionBar?: React.ReactNode;
}

const CheckIcon = () => (
  <svg
    className="w-3 h-3 sm:w-4 sm:h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={3}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStage,
  completedStages,
  onNavigate,
  actionBar,
}) => {
  const intl = useIntl();

  const getStageStatus = (stage: Stage): 'completed' | 'current' | 'upcoming' => {
    if (stage === currentStage) return 'current';
    if (completedStages.has(stage)) return 'completed';
    return 'upcoming';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {actionBar && (
        <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-700/50 p-3 sm:p-4">
          <div className="max-w-7xl mx-auto">{actionBar}</div>
        </div>
      )}
      <nav
        className="bg-slate-900/95 backdrop-blur-md border-t border-slate-700/50 shadow-2xl overflow-visible pb-[env(safe-area-inset-bottom)]"
        role="navigation"
        aria-label={intl.formatMessage({ id: 'progress.label' })}
      >
        <div className="max-w-7xl mx-auto px-1 sm:px-4 py-3 sm:py-6">
          <div className="flex items-start justify-between gap-0 min-h-[56px] sm:min-h-[60px]">
            {STAGES.map((stage, index) => {
              const status = getStageStatus(stage);
              const isCompleted = status === 'completed';
              const isCurrent = status === 'current';

              return (
                <React.Fragment key={stage}>
                  <div className="flex flex-col items-center gap-0.5 sm:gap-2 flex-1 min-w-0 relative z-10">
                    <button
                      onClick={() => onNavigate(stage)}
                      className={`
                      relative rounded-full transition-all duration-300 transform
                      focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-slate-900
                      min-w-[36px] min-h-[36px] w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12
                      ${
                        isCurrent
                          ? 'bg-gradient-to-br from-[#750014] to-[#973f4e] shadow-lg shadow-[#750014]/50 scale-105 focus:ring-[#ba7f89]/60'
                          : isCompleted
                            ? 'bg-gradient-to-br from-[#22c55e] to-[#15803d] shadow-md hover:scale-105 focus:ring-[#22c55e]/50'
                            : 'border-2 border-slate-600 hover:border-slate-500 hover:scale-105 focus:ring-slate-500/50'
                      }
                    `}
                      aria-label={intl.formatMessage({ id: `progress.${stage}.label` })}
                      aria-current={isCurrent ? 'step' : undefined}
                    >
                      <div className="relative w-full h-full flex items-center justify-center">
                        {isCompleted ? (
                          <CheckIcon />
                        ) : stage.startsWith('part') ? (
                          <span
                            className={`text-[10px] sm:text-xs md:text-sm font-bold ${isCurrent ? 'text-white' : 'text-slate-500'}`}
                          >
                            {stage.replace('part', '')}
                          </span>
                        ) : (
                          <span
                            className={`text-[10px] sm:text-xs md:text-sm font-bold ${isCurrent ? 'text-white' : 'text-slate-500'}`}
                          >
                            {index === 0 ? '→' : '✓'}
                          </span>
                        )}
                      </div>
                    </button>

                    <div className="flex flex-col items-center gap-0 text-center w-full px-0.5">
                      <span
                        className={`
                        text-[10px] sm:text-xs md:text-sm font-medium transition-colors duration-200 truncate w-full
                        ${
                          isCurrent
                            ? 'text-white'
                            : isCompleted
                              ? 'text-[#22c55e]'
                              : 'text-slate-500'
                        }
                      `}
                      >
                        <FormattedMessage id={`progress.${stage}.title`} />
                      </span>
                      <span
                        className={`
                        hidden sm:block text-[10px] md:text-xs font-normal transition-colors duration-200 leading-tight truncate w-full
                        ${
                          isCurrent
                            ? 'text-[#adb4bb]'
                            : isCompleted
                              ? 'text-[#22c55e]/70'
                              : 'text-slate-600'
                        }
                      `}
                      >
                        <FormattedMessage id={`progress.${stage}.subtitle`} />
                      </span>
                    </div>
                  </div>

                  {index < STAGES.length - 1 && (
                    <div
                      className={`
                      h-0.5 flex-shrink min-w-[4px] w-2 sm:w-6 md:w-10 transition-all duration-500 relative z-0 mt-[18px] sm:mt-[22px] md:mt-6
                      ${
                        completedStages.has(stage)
                          ? 'bg-gradient-to-r from-[#22c55e] to-[#15803d]'
                          : 'bg-slate-700'
                      }
                    `}
                      aria-hidden="true"
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default ProgressBar;
