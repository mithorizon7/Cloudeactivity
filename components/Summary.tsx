import React from 'react';
import { useTranslation } from '../i18n';

interface SummaryProps {
  scores: Record<string, number>;
  onRestart: () => void;
}

const Summary: React.FC<SummaryProps> = ({ scores, onRestart }) => {
  const { t } = useTranslation();
  const totalQuestions = { part1: 2, part2: 6, part3: 3 };
  const totalScore = scores.part1 + scores.part2 + scores.part3;
  const maxScore = totalQuestions.part1 + totalQuestions.part2 + totalQuestions.part3;

  return (
    <div className="text-center bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-slate-700 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500 mb-4">
        {t('summary.title')}
      </h1>
      <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-6">
        {t('summary.description')}
      </p>

       <div className="text-left max-w-2xl mx-auto space-y-4 mb-8 bg-slate-900/50 p-6 rounded-lg">
        <p className="text-slate-300"><strong className="text-cyan-400">{t('summary.recapFoundationsTitle')}</strong> {t('summary.recapFoundationsDesc')}</p>
        <p className="text-slate-300"><strong className="text-cyan-400">{t('summary.recapServiceModelsTitle')}</strong>
            <span className="block ml-4">- <strong className="text-white">IaaS</strong> {t('summary.recapIaaS')}</span>
            <span className="block ml-4">- <strong className="text-white">PaaS</strong> {t('summary.recapPaaS')}</span>
            <span className="block ml-4">- <strong className="text-white">SaaS</strong> {t('summary.recapSaaS')}</span>
        </p>
         <p className="text-slate-300"><strong className="text-cyan-400">{t('summary.recapDeploymentModelsTitle')}</strong>
            <span className="block ml-4">- <strong className="text-white">Public</strong> {t('summary.recapPublic')}</span>
            <span className="block ml-4">- <strong className="text-white">Private</strong> {t('summary.recapPrivate')}</span>
            <span className="block ml-4">- <strong className="text-white">Hybrid</strong> {t('summary.recapHybrid')}</span>
        </p>
      </div>

       <div className="mb-8">
        <p className="text-2xl font-bold text-white">{t('summary.score', { totalScore, maxScore })}</p>
      </div>
      
      <button
        onClick={onRestart}
        className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-cyan-300/50"
      >
        {t('summary.restartButton')}
      </button>
    </div>
  );
};

export default Summary;