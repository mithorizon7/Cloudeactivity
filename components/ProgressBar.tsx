import React from 'react';
import { useIntl, FormattedMessage } from 'react-intl';

type Stage = 'introduction' | 'part1' | 'part2' | 'part3' | 'part4' | 'part5' | 'summary';

interface ProgressBarProps {
  currentStage: Stage;
  completedStages: Set<Stage>;
  onNavigate: (stage: Stage) => void;
}

const CheckIcon = () => (
  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const STAGES: Stage[] = ['introduction', 'part1', 'part2', 'part3', 'part4', 'part5', 'summary'];

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStage, completedStages, onNavigate }) => {
  const intl = useIntl();
  
  const currentIndex = STAGES.indexOf(currentStage);
  
  const getStageStatus = (stage: Stage, index: number): 'completed' | 'current' | 'upcoming' => {
    if (stage === currentStage) return 'current';
    if (completedStages.has(stage)) return 'completed';
    return 'upcoming';
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/50 shadow-2xl z-50 overflow-visible"
      role="navigation"
      aria-label={intl.formatMessage({ id: 'progress.label' })}
    >
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 overflow-x-auto overflow-y-visible min-h-[52px] sm:min-h-[60px]">
          {STAGES.map((stage, index) => {
            const status = getStageStatus(stage, index);
            const isCompleted = status === 'completed';
            const isCurrent = status === 'current';
            const isUpcoming = status === 'upcoming';
            
            return (
              <React.Fragment key={stage}>
                <div className="flex flex-col items-center gap-1 sm:gap-2 flex-shrink-0 relative z-10">
                  <button
                    onClick={() => onNavigate(stage)}
                    className={`
                      relative rounded-full transition-all duration-300 transform
                      focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-slate-900
                      ${isCurrent 
                        ? 'w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-[#750014] to-[#973f4e] shadow-lg shadow-[#750014]/50 scale-105 focus:ring-[#ba7f89]/60' 
                        : isCompleted
                        ? 'w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-[#22c55e] to-[#15803d] shadow-md hover:scale-105 focus:ring-[#22c55e]/50'
                        : 'w-10 h-10 sm:w-11 sm:h-11 border-2 border-slate-600 hover:border-slate-500 hover:scale-105 focus:ring-slate-500/50'
                      }
                    `}
                    aria-label={intl.formatMessage({ id: `progress.${stage}.label` })}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    <div className="relative w-full h-full flex items-center justify-center">
                      {isCompleted ? (
                        <CheckIcon />
                      ) : (
                        <span className={`text-xs sm:text-sm font-bold ${isCurrent ? 'text-white' : 'text-slate-500'}`}>
                          {index + 1}
                        </span>
                      )}
                    </div>
                  </button>
                  
                  <div className="flex flex-col items-center gap-0.5 text-center max-w-[80px] sm:max-w-[100px]">
                    <span 
                      className={`
                        text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-200
                        ${isCurrent 
                          ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#ba7f89] to-[#d5b2b8]' 
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
                        text-[10px] sm:text-xs font-normal transition-colors duration-200 leading-tight
                        ${isCurrent 
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
                      h-0.5 flex-1 min-w-[20px] sm:min-w-[40px] transition-all duration-500 relative z-0
                      ${index < currentIndex
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
  );
};

export default ProgressBar;
