import React, { useState, useRef, useCallback } from 'react';
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
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md max-h-[85vh] overflow-y-auto animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`p-4 sm:p-6 rounded-t-2xl ${isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'} flex items-center gap-3 sm:gap-4`}
        >
          <div className={`flex-shrink-0 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? <CheckCircleIcon size={32} /> : <XCircleIcon size={32} />}
          </div>
          <div>
            <h3
              className={`text-xl sm:text-2xl font-bold ${isCorrect ? 'text-green-300' : 'text-red-300'}`}
            >
              <FormattedMessage
                id={isCorrect ? 'part2.feedback.correct.title' : 'part2.feedback.incorrect.title'}
              />
            </h3>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <p className="text-slate-300 text-base sm:text-lg" dir="auto">
            <bdi>{message}</bdi>
          </p>
        </div>
        <div className="p-4 bg-slate-900/50 rounded-b-2xl text-end">
          <button
            onClick={onClose}
            className="px-6 py-3 min-h-[44px] bg-gradient-to-r from-[#750014] via-[#973f4e] to-[#ba7f89] text-white font-bold rounded-full shadow-lg shadow-[#750014]/45 hover:scale-105 active:scale-95 transform transition-transform duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-[#ba7f89]/60 touch-manipulation"
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
  const [feedback, setFeedback] = useState<{
    type: 'correct' | 'incorrect';
    message: string;
    messageKey: string;
  } | null>(null);
  const [selectedExample, setSelectedExample] = useState<ServiceExample | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const setCardRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      if (el) {
        cardRefs.current.set(id, el);
      } else {
        cardRefs.current.delete(id);
      }
    },
    []
  );

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, example: ServiceExample) => {
    e.dataTransfer.setData('exampleId', example.id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetModel: ServiceModel) => {
    e.preventDefault();
    const exampleId = e.dataTransfer.getData('exampleId');
    const example = examples.find((ex) => ex.id === exampleId);

    if (example) {
      if (selectedExample?.id === example.id) {
        setSelectedExample(null);
      }

      if (example.model === targetModel) {
        setScore((s) => s + 10 / SERVICE_MODEL_EXAMPLES.length);
        setFeedback({
          type: 'correct',
          message: intl.formatMessage({ id: example.explanationKey }),
          messageKey: example.explanationKey,
        });
      } else {
        const el = cardRefs.current.get(example.id);
        if (el) {
          el.classList.add('animate-shake');
          setTimeout(() => el.classList.remove('animate-shake'), 500);
        }
        const hintKey = example.hintKeys[targetModel] || 'part2.hint.default';
        setFeedback({
          type: 'incorrect',
          message: intl.formatMessage({ id: hintKey }),
          messageKey: hintKey,
        });
      }
    }
  };

  const handleCardClick = (example: ServiceExample) => {
    setSelectedExample(selectedExample?.id === example.id ? null : example);
  };

  const handleCategoryClick = (targetModel: ServiceModel) => {
    if (!selectedExample) return;

    if (selectedExample.model === targetModel) {
      setScore((s) => s + 10 / SERVICE_MODEL_EXAMPLES.length);
      setFeedback({
        type: 'correct',
        message: intl.formatMessage({ id: selectedExample.explanationKey }),
        messageKey: selectedExample.explanationKey,
      });
      setSelectedExample(null);
    } else {
      const el = cardRefs.current.get(selectedExample.id);
      if (el) {
        el.classList.add('animate-shake');
        setTimeout(() => el.classList.remove('animate-shake'), 500);
      }
      const hintKey = selectedExample.hintKeys[targetModel] || 'part2.hint.default';
      setFeedback({
        type: 'incorrect',
        message: intl.formatMessage({ id: hintKey }),
        messageKey: hintKey,
      });
      setSelectedExample(null);
    }
  };

  const handleCloseFeedback = () => {
    if (feedback?.type === 'correct') {
      const exampleId = SERVICE_MODEL_EXAMPLES.find(
        (ex) => ex.explanationKey === feedback.messageKey
      )?.id;
      if (exampleId) {
        const example = examples.find((ex) => ex.id === exampleId);
        if (example) {
          setDropped((prev) => ({
            ...prev,
            [example.model]: [...prev[example.model], example],
          }));
          setExamples((prev) => prev.filter((ex) => ex.id !== exampleId));
        }
      }
    }
    setFeedback(null);
  };

  const allCorrect = examples.length === 0;

  const getServiceModelKey = (model: ServiceModel): string => {
    switch (model) {
      case ServiceModel.IaaS:
        return 'servicemodel.iaas';
      case ServiceModel.PaaS:
        return 'servicemodel.paas';
      case ServiceModel.SaaS:
        return 'servicemodel.saas';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700 animate-fade-in">
      {feedback && (
        <FeedbackModal
          type={feedback.type}
          message={feedback.message}
          onClose={handleCloseFeedback}
        />
      )}
      <h2 className="text-2xl font-bold text-white mb-2">
        <FormattedMessage id="part2.title" />
      </h2>
      <p className="text-slate-400 mb-6">
        <FormattedMessage id="part2.subtitle" />
      </p>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.values(ServiceModel) as ServiceModel[]).map((model) => (
            <div
              key={model}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, model)}
              onClick={() => handleCategoryClick(model)}
              className={`bg-slate-900/50 p-3 sm:p-4 rounded-lg flex flex-col items-center min-h-[180px] sm:min-h-[200px] border-2 border-dashed transition-all touch-manipulation ${
                selectedExample
                  ? 'border-[#8b959e] cursor-pointer hover:bg-slate-800/50 active:bg-slate-700/50 sm:hover:scale-105'
                  : 'border-slate-600 hover:border-[#8b959e]'
              }`}
            >
              <h3 className="font-bold text-lg mb-4 text-center text-[#8b959e]">
                <FormattedMessage id={getServiceModelKey(model)} />
              </h3>
              {selectedExample && (
                <p className="text-xs text-[#adb4bb] mb-2 text-center">
                  <FormattedMessage id="part2.tap.place" />
                </p>
              )}
              <div className="space-y-2 w-full">
                {dropped[model].map((ex) => (
                  <div
                    key={ex.id}
                    className="bg-green-600/30 text-green-200 text-sm p-2 rounded flex items-center gap-2 animate-fade-in"
                  >
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
            {examples.map((ex) => (
              <div
                key={ex.id}
                ref={setCardRef(ex.id)}
                draggable
                onDragStart={(e) => handleDragStart(e, ex)}
                onClick={() => handleCardClick(ex)}
                className={`p-3 sm:p-4 min-h-[44px] rounded-md cursor-pointer transition-all touch-manipulation select-none ${
                  selectedExample?.id === ex.id
                    ? 'bg-[#750014] ring-2 ring-[#973f4e] sm:scale-105 shadow-lg'
                    : 'bg-slate-700 hover:bg-slate-600 active:bg-slate-500 md:cursor-grab md:active:cursor-grabbing'
                }`}
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
          className="mt-6 w-full max-w-xs mx-auto block bg-gradient-to-r from-[#750014] via-[#973f4e] to-[#ba7f89] text-white font-bold py-3 px-4 min-h-[48px] rounded-full shadow-lg shadow-[#750014]/45 hover:scale-105 active:scale-95 transform transition-transform animate-fade-in focus:outline-none focus:ring-4 focus:ring-[#ba7f89]/60 touch-manipulation"
          aria-label={intl.formatMessage({ id: 'part2.button.continue' })}
        >
          <FormattedMessage id="part2.button.continue" />
        </button>
      )}
    </div>
  );
};

export default Part2ServiceModels;
