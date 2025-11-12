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
      className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/50 shadow-2xl z-50"
      role="navigation"
      aria-label={intl.formatMessage({ id: 'progress.label' })}
    >
      <div className="max-w-7xl mx-auto px-4 pb-4 sm:pb-5 pt-12 sm:pt-14">
        <div className="flex items-center justify-between gap-2 sm:gap-4 overflow-x-auto">
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
                        ? 'w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500 to-purple-600 shadow-lg shadow-purple-500/50 scale-110 focus:ring-purple-500/50' 
                        : isCompleted
                        ? 'w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-md hover:scale-110 focus:ring-cyan-500/50'
                        : 'w-8 h-8 sm:w-10 sm:h-10 border-2 border-slate-600 hover:border-slate-500 hover:scale-105 focus:ring-slate-500/50'
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
                  
                  <span 
                    className={`
                      text-xs sm:text-sm font-medium text-center whitespace-nowrap transition-colors duration-200
                      ${isCurrent 
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400' 
                        : isCompleted
                        ? 'text-cyan-400'
                        : 'text-slate-500'
                      }
                    `}
                  >
                    <FormattedMessage id={`progress.${stage}.title`} />
                  </span>
                </div>
                
                {index < STAGES.length - 1 && (
                  <div 
                    className={`
                      h-0.5 flex-1 min-w-[20px] sm:min-w-[40px] transition-all duration-500 relative z-0
                      ${index < currentIndex
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600'
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
