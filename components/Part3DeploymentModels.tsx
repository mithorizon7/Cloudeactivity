import React, { useState } from 'react';
import { DEPLOYMENT_MODEL_QUESTIONS } from '../constants';
import { useIntl, FormattedMessage } from '../i18n';

interface Part3DeploymentModelsProps {
  onComplete: (score: number) => void;
}

const Part3DeploymentModels: React.FC<Part3DeploymentModelsProps> = ({ onComplete }) => {
  const intl = useIntl();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);

  const question = DEPLOYMENT_MODEL_QUESTIONS[currentQuestionIndex];
  const isCorrect = selectedAnswer === question.correctAnswer;

  const handleAnswer = (answerIndex: number) => {
    if (showFeedback) return;
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);
    if (answerIndex === question.correctAnswer) {
      const points = currentQuestionIndex === 2 ? 4 : 3;
      setScore(s => s + points);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < DEPLOYMENT_MODEL_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      onComplete(score);
    }
  };

  const getDeploymentModelKey = (model: string): string => {
    switch(model) {
      case 'Public Cloud': return 'deploymentmodel.public';
      case 'Private Cloud': return 'deploymentmodel.private';
      case 'Hybrid Cloud': return 'deploymentmodel.hybrid';
      default: return 'deploymentmodel.public';
    }
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700 animate-fade-in">
      <h2 className="text-2xl font-bold text-white mb-2">
        <FormattedMessage id="part3.title" />
      </h2>
      <p className="text-slate-400 mb-6">
        <FormattedMessage id="part3.subtitle" />
      </p>
      
      <div className="bg-slate-900/50 p-6 rounded-lg mb-6">
        <p className="text-lg text-slate-300 italic" dir="auto">
          "<bdi><FormattedMessage id={question.scenarioKey} /></bdi>"
        </p>
      </div>

      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            disabled={showFeedback}
            className={`w-full text-start p-4 rounded-lg font-semibold transition-all duration-200 disabled:opacity-80 ${
              showFeedback && index === question.correctAnswer 
                ? 'bg-green-500 ring-2 ring-white' 
                : showFeedback && index === selectedAnswer
                ? 'bg-red-500'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
            aria-label={intl.formatMessage({ id: getDeploymentModelKey(option) })}
          >
            <FormattedMessage id={getDeploymentModelKey(option)} />
          </button>
        ))}
      </div>

      {showFeedback && (
        <div className={`mt-6 p-4 rounded-lg text-white animate-fade-in ${isCorrect ? 'bg-green-500/20 border-green-500' : 'bg-red-500/20 border-red-500'} border`}>
          <h3 className="font-bold text-lg">
            <FormattedMessage id={isCorrect ? 'part3.feedback.correct.title' : 'part3.feedback.incorrect.title'} />
          </h3>
          <p dir="auto"><bdi><FormattedMessage id={question.explanationKey} /></bdi></p>
          <button 
            onClick={handleNext} 
            className="mt-4 w-full bg-gradient-to-r from-[#750014] via-[#973f4e] to-[#ba7f89] text-white font-bold py-2 px-4 rounded-full shadow-lg shadow-[#750014]/45 hover:scale-105 transform transition-transform focus:outline-none focus:ring-4 focus:ring-[#ba7f89]/60"
            aria-label={intl.formatMessage({ 
              id: currentQuestionIndex < DEPLOYMENT_MODEL_QUESTIONS.length - 1 ? 'part3.button.next' : 'part3.button.finish' 
            })}
          >
            <FormattedMessage id={currentQuestionIndex < DEPLOYMENT_MODEL_QUESTIONS.length - 1 ? 'part3.button.next' : 'part3.button.finish'} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Part3DeploymentModels;
