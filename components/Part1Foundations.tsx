import React, { useState } from 'react';
import { FOUNDATIONS_QUESTIONS } from '../constants';
import { useTranslation } from '../i18n';

interface Part1FoundationsProps {
  onComplete: (score: number) => void;
}

const Part1Foundations: React.FC<Part1FoundationsProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);

  const question = FOUNDATIONS_QUESTIONS[currentQuestionIndex];
  const isCorrect = selectedAnswer === question.isTrue;

  const handleAnswer = (answer: boolean) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
    setShowFeedback(true);
    if (answer === question.isTrue) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < FOUNDATIONS_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      onComplete(score);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700 animate-fade-in">
      <h2 className="text-2xl font-bold text-cyan-400 mb-2">{t('part1.title')}</h2>
      <p className="text-slate-400 mb-6">{t('part1.subtitle')}</p>
      
      <div className="bg-slate-900/50 p-6 rounded-lg min-h-[100px] flex items-center justify-center">
        <p className="text-xl text-center text-white">{t(question.statementKey)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <button
          onClick={() => handleAnswer(true)}
          disabled={showFeedback}
          className={`p-4 rounded-lg font-bold text-lg transition-all duration-300 disabled:opacity-70 ${
            showFeedback && question.isTrue ? 'bg-green-500 ring-2 ring-white' : 'bg-slate-700 hover:bg-slate-600'
          } ${ showFeedback && !question.isTrue && selectedAnswer === true ? 'bg-red-500' : ''}`}
        >
          {t('part1.factButton')}
        </button>
        <button
          onClick={() => handleAnswer(false)}
          disabled={showFeedback}
          className={`p-4 rounded-lg font-bold text-lg transition-all duration-300 disabled:opacity-70 ${
            showFeedback && !question.isTrue ? 'bg-green-500 ring-2 ring-white' : 'bg-slate-700 hover:bg-slate-600'
          } ${ showFeedback && question.isTrue && selectedAnswer === false ? 'bg-red-500' : ''}`}
        >
          {t('part1.mythButton')}
        </button>
      </div>

      {showFeedback && (
        <div className={`mt-6 p-4 rounded-lg text-white animate-fade-in ${isCorrect ? 'bg-green-500/20 border-green-500' : 'bg-red-500/20 border-red-500'} border`}>
          <h3 className="font-bold text-lg">{isCorrect ? t('part1.correctFeedbackTitle') : t('part1.incorrectFeedbackTitle')}</h3>
          <p>{t(question.explanationKey)}</p>
          <button onClick={handleNext} className="mt-4 w-full bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-bold py-2 px-4 rounded-full hover:scale-105 transform transition-transform">
            {currentQuestionIndex < FOUNDATIONS_QUESTIONS.length - 1 ? t('part1.nextButton') : t('part1.continueButton')}
          </button>
        </div>
      )}
    </div>
  );
};

export default Part1Foundations;