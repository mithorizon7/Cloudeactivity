import { useState } from 'react';
import { FormattedMessage, FormattedNumber, useIntl } from 'react-intl';

interface Part4NetflixProps {
  onComplete: (score: number) => void;
}

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ServerIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
  </svg>
);

const CloudIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LightBulbIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

export default function Part4Netflix({ onComplete }: Part4NetflixProps) {
  const intl = useIntl();
  const [view, setView] = useState<'netflix' | 'subscriber'>('netflix');
  const [viewedNetflix, setViewedNetflix] = useState(true);
  const [viewedSubscriber, setViewedSubscriber] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleViewChange = (newView: 'netflix' | 'subscriber') => {
    if (newView === view) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setView(newView);
      if (newView === 'netflix') setViewedNetflix(true);
      if (newView === 'subscriber') setViewedSubscriber(true);
      setIsTransitioning(false);
    }, 150);
  };

  const viewedCount = (viewedNetflix ? 1 : 0) + (viewedSubscriber ? 1 : 0);
  const allViewed = viewedNetflix && viewedSubscriber;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#19020b] to-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight leading-tight">
            <FormattedMessage id="part4.title" />
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            <FormattedMessage id="part4.subtitle" />
          </p>
        </div>

        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div 
            role="tablist" 
            aria-label={intl.formatMessage({ id: 'part4.instructions' })}
            className="inline-flex bg-slate-800/60 backdrop-blur-sm rounded-xl p-1.5 border border-slate-700/50 shadow-lg w-full sm:w-auto"
          >
            <button
              role="tab"
              aria-selected={view === 'netflix'}
              aria-controls="perspective-content"
              onClick={() => handleViewChange('netflix')}
              className={`
                relative px-6 py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 flex-1 sm:flex-initial
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-[#973f4e]/50
                ${view === 'netflix'
                  ? 'bg-gradient-to-br from-[#750014] to-[#973f4e] text-white shadow-lg shadow-[#750014]/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }
              `}
            >
              {viewedNetflix && view !== 'netflix' && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                  <CheckIcon />
                </span>
              )}
              <FormattedMessage id="part4.button.netflix" />
            </button>
            <button
              role="tab"
              aria-selected={view === 'subscriber'}
              aria-controls="perspective-content"
              onClick={() => handleViewChange('subscriber')}
              className={`
                relative px-6 py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 flex-1 sm:flex-initial
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-[#8b959e]/50
                ${view === 'subscriber'
                  ? 'bg-gradient-to-br from-slate-900 via-[#1f2937] to-[#8b959e] text-white shadow-lg shadow-slate-900/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }
              `}
            >
              {viewedSubscriber && view !== 'subscriber' && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                  <CheckIcon />
                </span>
              )}
              <FormattedMessage id="part4.button.subscriber" />
            </button>
          </div>

          <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-800/40 backdrop-blur-sm rounded-lg border border-slate-700/30">
            <span className="text-sm text-slate-400">
              <FormattedMessage id="part4.progress.label" />
            </span>
            <div className="flex gap-1.5">
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${viewedNetflix ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-slate-600'}`} />
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${viewedSubscriber ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-slate-600'}`} />
            </div>
            <span className="text-xs font-mono text-slate-300 tabular-nums">
              <FormattedMessage 
                id="part4.progress.viewed" 
                values={{ count: <FormattedNumber value={viewedCount} /> }} 
              />
            </span>
          </div>
        </div>

        <div 
          id="perspective-content"
          role="tabpanel"
          aria-live="polite"
          className={`
            bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-2xl
            transition-all duration-300
            ${isTransitioning ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}
          `}
        >
          {view === 'netflix' ? (
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-6 sm:mb-8 border-b border-slate-700/50">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <ServerIcon />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      <FormattedMessage id="part4.netflix.role" />
                    </h2>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#53595e]/20 border border-[#8b959e]/30 rounded-full">
                    <div className="w-2 h-2 bg-[#8b959e] rounded-full animate-pulse" />
                    <span className="text-sm font-semibold text-[#adb4bb]">
                      <FormattedMessage id="part4.netflix.service" />
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:gap-8">
                <div className="bg-slate-900/50 rounded-xl p-5 sm:p-6 border border-slate-700/30">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2.5">
                    <CloudIcon />
                    <FormattedMessage id="part4.netflix.pays" />
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-slate-300 leading-relaxed">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-400 mt-2" />
                      <FormattedMessage id="part4.netflix.pay1" />
                    </li>
                    <li className="flex items-start gap-3 text-slate-300 leading-relaxed">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-400 mt-2" />
                      <FormattedMessage id="part4.netflix.pay2" />
                    </li>
                    <li className="flex items-start gap-3 text-slate-300 leading-relaxed">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-400 mt-2" />
                      <FormattedMessage id="part4.netflix.pay3" />
                    </li>
                  </ul>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-slate-900/50 rounded-xl p-5 sm:p-6 border border-slate-700/30">
                    <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2.5">
                      <PlayIcon />
                      <FormattedMessage id="part4.netflix.manages" />
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-slate-300 leading-relaxed">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-400 mt-2" />
                        <FormattedMessage id="part4.netflix.manage1" />
                      </li>
                      <li className="flex items-start gap-3 text-slate-300 leading-relaxed">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-400 mt-2" />
                        <FormattedMessage id="part4.netflix.manage2" />
                      </li>
                      <li className="flex items-start gap-3 text-slate-300 leading-relaxed">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-400 mt-2" />
                        <FormattedMessage id="part4.netflix.manage3" />
                      </li>
                    </ul>
                  </div>

                  <div className="bg-slate-900/50 rounded-xl p-5 sm:p-6 border border-slate-700/30">
                    <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2.5">
                      <LockIcon />
                      <FormattedMessage id="part4.netflix.provider" />
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-slate-300 leading-relaxed">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-400 mt-2" />
                        <FormattedMessage id="part4.netflix.provider1" />
                      </li>
                      <li className="flex items-start gap-3 text-slate-300 leading-relaxed">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-400 mt-2" />
                        <FormattedMessage id="part4.netflix.provider2" />
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-6 sm:mb-8 border-b border-slate-700/50">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <UserIcon />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      <FormattedMessage id="part4.subscriber.role" />
                    </h2>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#d0d4d8]/20 border border-[#d0d4d8]/30 rounded-full">
                    <div className="w-2 h-2 bg-[#d0d4d8] rounded-full animate-pulse" />
                    <span className="text-sm font-semibold text-[#d0d4d8]">
                      <FormattedMessage id="part4.subscriber.service" />
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:gap-8">
                <div className="bg-slate-900/50 rounded-xl p-5 sm:p-6 border border-slate-700/30">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2.5">
                    <CloudIcon />
                    <FormattedMessage id="part4.subscriber.pays" />
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-slate-300 leading-relaxed">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 mt-2" />
                      <FormattedMessage id="part4.subscriber.pay1" />
                    </li>
                  </ul>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-slate-900/50 rounded-xl p-5 sm:p-6 border border-slate-700/30">
                    <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2.5">
                      <PlayIcon />
                      <FormattedMessage id="part4.subscriber.gets" />
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-slate-300 leading-relaxed">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 mt-2" />
                        <FormattedMessage id="part4.subscriber.get1" />
                      </li>
                      <li className="flex items-start gap-3 text-slate-300 leading-relaxed">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 mt-2" />
                        <FormattedMessage id="part4.subscriber.get2" />
                      </li>
                      <li className="flex items-start gap-3 text-slate-300 leading-relaxed">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 mt-2" />
                        <FormattedMessage id="part4.subscriber.get3" />
                      </li>
                    </ul>
                  </div>

                  <div className="bg-slate-900/50 rounded-xl p-5 sm:p-6 border border-slate-700/30">
                    <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2.5">
                      <LockIcon />
                      <FormattedMessage id="part4.subscriber.notneed" />
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-slate-300 leading-relaxed">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 mt-2" />
                        <FormattedMessage id="part4.subscriber.notneed1" />
                      </li>
                      <li className="flex items-start gap-3 text-slate-300 leading-relaxed">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 mt-2" />
                        <FormattedMessage id="part4.subscriber.notneed2" />
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 sm:mt-8 bg-gradient-to-br from-[#750014]/40 to-[#8b959e]/40 backdrop-blur-sm rounded-xl p-5 sm:p-6 border border-[#973f4e]/20 shadow-lg">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0 p-2 bg-[#973f4e]/20 rounded-lg">
              <LightBulbIcon />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#d5b2b8] mb-2">
                <FormattedMessage id="part4.insight.label" />
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                <FormattedMessage id="part4.insight" />
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mt-10 text-center">
          <button
            onClick={() => {
              const score = allViewed ? 5 : 0;
              onComplete(score);
            }}
            disabled={!allViewed}
            className={`
              px-8 py-4 rounded-xl font-bold text-base sm:text-lg shadow-2xl
              transition-all duration-300 transform
              focus:outline-none focus:ring-4 focus:ring-[#ba7f89]/60 focus:ring-offset-2 focus:ring-offset-slate-900
              ${allViewed
                ? 'bg-gradient-to-r from-[#750014] via-[#973f4e] to-[#ba7f89] text-white hover:brightness-110 hover:scale-105 hover:shadow-[#750014]/50 cursor-pointer'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
              }
            `}
            aria-disabled={!allViewed}
          >
            <FormattedMessage id="part4.button.continue" />
          </button>
          {!allViewed && (
            <p className="mt-3 text-sm text-slate-400">
              <FormattedMessage id="part4.progress.label" />
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
