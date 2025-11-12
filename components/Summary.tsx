import React from 'react';
import { useIntl, FormattedMessage, FormattedNumber } from '../i18n';

interface SummaryProps {
  scores: Record<string, number>;
  onRestart: () => void;
}

const Summary: React.FC<SummaryProps> = ({ scores, onRestart }) => {
  const intl = useIntl();
  const totalQuestions = { part1: 2, part2: 6, part3: 3, part5: 30 };
  const totalScore = scores.part1 + scores.part2 + scores.part3 + scores.part5;
  const maxScore = totalQuestions.part1 + totalQuestions.part2 + totalQuestions.part3 + totalQuestions.part5;

  return (
    <div className="text-center bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-slate-700 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500 mb-4">
        <FormattedMessage id="summary.title" />
      </h1>
      <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-6">
        <FormattedMessage id="summary.description" />
      </p>

       <div className="text-start max-w-2xl mx-auto space-y-4 mb-8 bg-slate-900/50 p-6 rounded-lg">
        <p className="text-slate-300">
          <strong className="text-cyan-400"><FormattedMessage id="summary.recap.foundations.title" /></strong>{' '}
          <FormattedMessage id="summary.recap.foundations.text" />
        </p>
        <p className="text-slate-300">
          <strong className="text-cyan-400"><FormattedMessage id="summary.recap.servicemodels.title" /></strong>
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
          <strong className="text-cyan-400"><FormattedMessage id="summary.recap.deploymentmodels.title" /></strong>
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
          <strong className="text-cyan-400"><FormattedMessage id="summary.recap.perspective.title" /></strong>{' '}
          <FormattedMessage id="summary.recap.perspective.text" />
        </p>
        <p className="text-slate-300">
          <strong className="text-cyan-400"><FormattedMessage id="summary.recap.application.title" /></strong>{' '}
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
        className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-cyan-300/50"
        aria-label={intl.formatMessage({ id: 'summary.button.restart' })}
      >
        <FormattedMessage id="summary.button.restart" />
      </button>
    </div>
  );
};

export default Summary;
