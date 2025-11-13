import React from 'react';
import { useIntl, FormattedMessage } from '../i18n';

interface IntroductionProps {
  onStart: () => void;
}

const Introduction: React.FC<IntroductionProps> = ({ onStart }) => {
  const intl = useIntl();

  return (
    <div className="text-center bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-slate-700 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
        <FormattedMessage id="introduction.title" />
      </h1>
      <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
        <FormattedMessage id="introduction.description" />
      </p>
      <div className="text-start max-w-xl mx-auto space-y-4 mb-10">
        <div className="flex items-start gap-3">
          <div className="text-[#8b959e] mt-1" aria-hidden="true">✓</div>
          <p className="text-slate-300">
            <strong className="text-white"><FormattedMessage id="introduction.part1.title" /></strong>{' '}
            <FormattedMessage id="introduction.part1.description" />
          </p>
        </div>
        <div className="flex items-start gap-3">
          <div className="text-[#8b959e] mt-1" aria-hidden="true">✓</div>
          <p className="text-slate-300">
            <strong className="text-white"><FormattedMessage id="introduction.part2.title" /></strong>{' '}
            <FormattedMessage id="introduction.part2.description" />
          </p>
        </div>
        <div className="flex items-start gap-3">
          <div className="text-[#8b959e] mt-1" aria-hidden="true">✓</div>
          <p className="text-slate-300">
            <strong className="text-white"><FormattedMessage id="introduction.part3.title" /></strong>{' '}
            <FormattedMessage id="introduction.part3.description" />
          </p>
        </div>
      </div>
      <button
        onClick={onStart}
        className="px-8 py-3 bg-gradient-to-r from-[#750014] via-[#973f4e] to-[#ba7f89] text-white font-bold rounded-full shadow-lg shadow-[#750014]/45 hover:scale-105 transform transition-transform duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-[#ba7f89]/60"
        aria-label={intl.formatMessage({ id: 'introduction.button.start' })}
      >
        <FormattedMessage id="introduction.button.start" />
      </button>
    </div>
  );
};

export default Introduction;
