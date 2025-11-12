import React from 'react';
import { useTranslation } from '../i18n';

interface IntroductionProps {
  onStart: () => void;
}

const Introduction: React.FC<IntroductionProps> = ({ onStart }) => {
  const { t } = useTranslation();

  return (
    <div className="text-center bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-slate-700 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500 mb-4">
        {t('introduction.title')}
      </h1>
      <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
        {t('introduction.description')}
      </p>
      <div className="text-left max-w-xl mx-auto space-y-4 mb-10">
        <div className="flex items-start space-x-3">
          <div className="text-cyan-400 mt-1">✓</div>
          <p className="text-slate-300"><strong className="text-white">{t('introduction.part1Title')}</strong> {t('introduction.part1Desc')}</p>
        </div>
        <div className="flex items-start space-x-3">
          <div className="text-cyan-400 mt-1">✓</div>
          <p className="text-slate-300"><strong className="text-white">{t('introduction.part2Title')}</strong> {t('introduction.part2Desc')}</p>
        </div>
        <div className="flex items-start space-x-3">
          <div className="text-cyan-400 mt-1">✓</div>
          <p className="text-slate-300"><strong className="text-white">{t('introduction.part3Title')}</strong> {t('introduction.part3Desc')}</p>
        </div>
      </div>
      <button
        onClick={onStart}
        className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-cyan-300/50"
      >
        {t('introduction.startButton')}
      </button>
    </div>
  );
};

export default Introduction;
