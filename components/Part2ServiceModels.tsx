import React, { useState } from 'react';
import { SERVICE_MODEL_EXAMPLES } from '../constants';
import { ServiceModel, ServiceExample } from '../types';
import { CheckCircleIcon, XCircleIcon } from './icons/Icons';
import { useIntl, FormattedMessage } from '../i18n';

interface FeedbackModalProps {
  type: 'correct' | 'incorrect';
  message: string;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ type, message, onClose }) => {
  const intl = useIntl();
  const isCorrect = type === 'correct';
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`p-6 rounded-t-2xl ${isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'} flex items-center gap-4`}>
          <div className={`flex-shrink-0 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? <CheckCircleIcon size={32} /> : <XCircleIcon size={32} />}
          </div>
          <div>
            <h3 className={`text-2xl font-bold ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
              <FormattedMessage id={isCorrect ? 'part2.feedback.correct.title' : 'part2.feedback.incorrect.title'} />
            </h3>
          </div>
        </div>
        <div className="p-6">
            <p className="text-slate-300 text-lg" dir="auto"><bdi>{message}</bdi></p>
        </div>
        <div className="p-4 bg-slate-900/50 rounded-b-2xl text-end">
             <button 
               onClick={onClose} 
               className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-cyan-300/50"
               aria-label={intl.formatMessage({ id: 'part2.feedback.button.gotit' })}
             >
                <FormattedMessage id="part2.feedback.button.gotit" />
             </button>
        </div>
      </div>
    </div>
  );
};


interface Part2ServiceModelsProps {
  onComplete: (score: number) => void;
}

const Part2ServiceModels: React.FC<Part2ServiceModelsProps> = ({ onComplete }) => {
  const intl = useIntl();
  const [examples, setExamples] = useState<ServiceExample[]>(SERVICE_MODEL_EXAMPLES);
  const [dropped, setDropped] = useState<Record<ServiceModel, ServiceExample[]>>({
    [ServiceModel.IaaS]: [],
    [ServiceModel.PaaS]: [],
    [ServiceModel.SaaS]: [],
  });
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect', message: string, messageKey: string } | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, example: ServiceExample) => {
    e.dataTransfer.setData('exampleId', example.id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetModel: ServiceModel) => {
    e.preventDefault();
    const exampleId = e.dataTransfer.getData('exampleId');
    const example = examples.find(ex => ex.id === exampleId);

    if (example) {
      if (example.model === targetModel) {
        setScore(s => s + (10 / SERVICE_MODEL_EXAMPLES.length));
        setFeedback({ type: 'correct', message: intl.formatMessage({ id: example.explanationKey }), messageKey: example.explanationKey });
      } else {
        const el = document.getElementById(example.id);
        if (el) {
          el.classList.add('animate-shake');
          setTimeout(() => el.classList.remove('animate-shake'), 500);
        }
        const hintKey = example.hintKeys[targetModel] || "part2.hint.default";
        setFeedback({ type: 'incorrect', message: intl.formatMessage({ id: hintKey }), messageKey: hintKey });
      }
    }
  };

  const handleCloseFeedback = () => {
    if (feedback?.type === 'correct') {
        const exampleId = SERVICE_MODEL_EXAMPLES.find(ex => ex.explanationKey === feedback.messageKey)?.id;
        if (exampleId) {
            const example = examples.find(ex => ex.id === exampleId);
            if (example) {
                setDropped(prev => ({
                    ...prev,
                    [example.model]: [...prev[example.model], example]
                }));
                setExamples(prev => prev.filter(ex => ex.id !== exampleId));
            }
        }
    }
    setFeedback(null);
  };
  
  const allCorrect = examples.length === 0;

  const getServiceModelKey = (model: ServiceModel): string => {
    switch(model) {
      case ServiceModel.IaaS: return 'servicemodel.iaas';
      case ServiceModel.PaaS: return 'servicemodel.paas';
      case ServiceModel.SaaS: return 'servicemodel.saas';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 md:p-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700 animate-fade-in">
       {feedback && (
        <FeedbackModal
          type={feedback.type}
          message={feedback.message}
          onClose={handleCloseFeedback}
        />
      )}
      <h2 className="text-2xl font-bold text-cyan-400 mb-2">
        <FormattedMessage id="part2.title" />
      </h2>
      <p className="text-slate-400 mb-6">
        <FormattedMessage id="part2.subtitle" />
      </p>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.values(ServiceModel) as ServiceModel[]).map(model => (
            <div
              key={model}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, model)}
              className="bg-slate-900/50 p-4 rounded-lg flex flex-col items-center min-h-[200px] border-2 border-dashed border-slate-600 transition-colors hover:border-cyan-400"
            >
              <h3 className="font-bold text-lg mb-4 text-center text-violet-400">
                <FormattedMessage id={getServiceModelKey(model)} />
              </h3>
              <div className="space-y-2 w-full">
                {dropped[model].map(ex => (
                  <div key={ex.id} className="bg-green-600/30 text-green-200 text-sm p-2 rounded flex items-center gap-2 animate-fade-in">
                    <CheckCircleIcon /> <FormattedMessage id={ex.textKey} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="w-full lg:w-1/3 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <h3 className="font-bold text-lg mb-4 text-center">
              <FormattedMessage id="part2.examples.title" />
            </h3>
            <div className="space-y-3">
              {examples.map(ex => (
                <div
                  key={ex.id}
                  id={ex.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, ex)}
                  className="bg-slate-700 p-3 rounded-md cursor-grab active:cursor-grabbing hover:bg-slate-600 transition-colors"
                >
                  <FormattedMessage id={ex.textKey} />
                </div>
              ))}
              {allCorrect && (
                  <div className="text-center text-green-400 p-4 animate-fade-in">
                    <FormattedMessage id="part2.allsorted.message" />
                  </div>
              )}
            </div>
        </div>
      </div>
       {allCorrect && (
          <button 
            onClick={() => onComplete(Math.round(score))} 
            className="mt-6 w-full max-w-xs mx-auto block bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-bold py-3 px-4 rounded-full hover:scale-105 transform transition-transform animate-fade-in"
            aria-label={intl.formatMessage({ id: 'part2.button.continue' })}
          >
            <FormattedMessage id="part2.button.continue" />
          </button>
        )}
        <style>{`
          .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; transform: translate3d(0, 0, 0); backface-visibility: hidden; perspective: 1000px; border: 2px solid #ef4444; }
          @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
          .animate-fade-in-up { animation: fadeInUp 0.3s ease-out both; }
          @keyframes fadeInUp { from { opacity: 0; transform: translate3d(0, 20px, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }
          .animate-fade-in { animation: fadeIn 0.5s ease-out both; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `}</style>
    </div>
  );
};

export default Part2ServiceModels;
