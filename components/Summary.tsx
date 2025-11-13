import React from 'react';
import { useIntl, FormattedMessage, FormattedNumber } from '../i18n';

interface SummaryProps {
  scores: Record<string, number>;
  onRestart: () => void;
}

const Summary: React.FC<SummaryProps> = ({ scores, onRestart }) => {
  const intl = useIntl();
  const maxScores = { part1: 5, part2: 10, part3: 10, part4: 5, part5: 20 };
  const totalScore = scores.part1 + scores.part2 + scores.part3 + scores.part4 + scores.part5;
  const maxScore = maxScores.part1 + maxScores.part2 + maxScores.part3 + maxScores.part4 + maxScores.part5;

  return (
    <div className="text-center bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-slate-700 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
        <FormattedMessage id="summary.title" />
      </h1>
      <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-6">
        <FormattedMessage id="summary.description" />
      </p>

       <div className="text-start max-w-2xl mx-auto space-y-4 mb-8 bg-slate-900/50 p-6 rounded-lg">
        <p className="text-slate-300">
          <strong className="text-[#ba7f89]"><FormattedMessage id="summary.recap.foundations.title" /></strong>{' '}
          <FormattedMessage id="summary.recap.foundations.text" />
        </p>
        <p className="text-slate-300">
          <strong className="text-[#ba7f89]"><FormattedMessage id="summary.recap.servicemodels.title" /></strong>
          <span className="block" style={{ marginInlineStart: '1rem' }}>
            <FormattedMessage id="summary.recap.iaas" />
          </span>
          <span className="block" style={{ marginInlineStart: '1rem' }}>
            <FormattedMessage id="summary.recap.paas" />
          </span>
          <span className="block" style={{ marginInlineStart: '1rem' }}>
            <FormattedMessage id="summary.recap.saas" />
          </span>
        </p>
         <p className="text-slate-300">
          <strong className="text-[#ba7f89]"><FormattedMessage id="summary.recap.deploymentmodels.title" /></strong>
          <span className="block" style={{ marginInlineStart: '1rem' }}>
            <FormattedMessage id="summary.recap.public" />
          </span>
          <span className="block" style={{ marginInlineStart: '1rem' }}>
            <FormattedMessage id="summary.recap.private" />
          </span>
          <span className="block" style={{ marginInlineStart: '1rem' }}>
            <FormattedMessage id="summary.recap.hybrid" />
          </span>
        </p>
        <p className="text-slate-300">
          <strong className="text-[#ba7f89]"><FormattedMessage id="summary.recap.perspective.title" /></strong>{' '}
          <FormattedMessage id="summary.recap.perspective.text" />
        </p>
        <p className="text-slate-300">
          <strong className="text-[#ba7f89]"><FormattedMessage id="summary.recap.application.title" /></strong>{' '}
          <FormattedMessage id="summary.recap.application.text" />
        </p>
      </div>

       <div className="mb-8">
        <p className="text-2xl font-bold text-white">
          <FormattedMessage 
            id="summary.score" 
            values={{ 
              totalScore: <FormattedNumber value={totalScore} />,
              maxScore: <FormattedNumber value={maxScore} />
            }} 
          />
        </p>
      </div>
      
      <button
        onClick={onRestart}
        className="px-8 py-3 bg-gradient-to-r from-[#750014] via-[#973f4e] to-[#ba7f89] text-white font-bold rounded-full shadow-lg shadow-[#750014]/45 hover:scale-105 transform transition-transform duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-[#ba7f89]/60"
        aria-label={intl.formatMessage({ id: 'summary.button.restart' })}
      >
        <FormattedMessage id="summary.button.restart" />
      </button>
    </div>
  );
};

export default Summary;
