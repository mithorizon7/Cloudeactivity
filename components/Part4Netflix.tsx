import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

interface Part4NetflixProps {
  onComplete: (score: number) => void;
}

export default function Part4Netflix({ onComplete }: Part4NetflixProps) {
  const [view, setView] = useState<'netflix' | 'subscriber'>('netflix');
  const [viewedNetflix, setViewedNetflix] = useState(true);
  const [viewedSubscriber, setViewedSubscriber] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-purple-500/20">
        <h1 className="text-4xl font-bold text-white mb-4 text-center">
          <FormattedMessage id="part4.title" />
        </h1>
        <p className="text-xl text-slate-300 mb-6 text-center">
          <FormattedMessage id="part4.subtitle" />
        </p>
        
        <p className="text-slate-300 mb-6 text-center">
          <FormattedMessage id="part4.instructions" />
        </p>

        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => {
              setView('netflix');
              setViewedNetflix(true);
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all transform ${
              view === 'netflix'
                ? 'bg-red-600 text-white scale-105 shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
            aria-pressed={view === 'netflix'}
          >
            <FormattedMessage id="part4.button.netflix" />
          </button>
          <button
            onClick={() => {
              setView('subscriber');
              setViewedSubscriber(true);
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all transform ${
              view === 'subscriber'
                ? 'bg-blue-600 text-white scale-105 shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
            aria-pressed={view === 'subscriber'}
          >
            <FormattedMessage id="part4.button.subscriber" />
          </button>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-8 mb-6 min-h-[400px] transition-all duration-300">
          {view === 'netflix' ? (
            <div className="space-y-6">
              <div>
                <p className="text-red-400 font-bold text-xl mb-2">
                  <FormattedMessage id="part4.netflix.role" />
                </p>
                <p className="text-purple-400 font-semibold text-lg">
                  <FormattedMessage id="part4.netflix.service" />
                </p>
              </div>

              <div>
                <p className="text-white font-bold mb-3">
                  <FormattedMessage id="part4.netflix.pays" />
                </p>
                <ul className="list-none space-y-2 text-slate-300" style={{ marginInlineStart: '1rem' }}>
                  <li>• <FormattedMessage id="part4.netflix.pay1" /></li>
                  <li>• <FormattedMessage id="part4.netflix.pay2" /></li>
                  <li>• <FormattedMessage id="part4.netflix.pay3" /></li>
                </ul>
              </div>

              <div>
                <p className="text-white font-bold mb-3">
                  <FormattedMessage id="part4.netflix.manages" />
                </p>
                <ul className="list-none space-y-2 text-slate-300" style={{ marginInlineStart: '1rem' }}>
                  <li>• <FormattedMessage id="part4.netflix.manage1" /></li>
                  <li>• <FormattedMessage id="part4.netflix.manage2" /></li>
                  <li>• <FormattedMessage id="part4.netflix.manage3" /></li>
                </ul>
              </div>

              <div>
                <p className="text-white font-bold mb-3">
                  <FormattedMessage id="part4.netflix.provider" />
                </p>
                <ul className="list-none space-y-2 text-slate-300" style={{ marginInlineStart: '1rem' }}>
                  <li>• <FormattedMessage id="part4.netflix.provider1" /></li>
                  <li>• <FormattedMessage id="part4.netflix.provider2" /></li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <p className="text-blue-400 font-bold text-xl mb-2">
                  <FormattedMessage id="part4.subscriber.role" />
                </p>
                <p className="text-cyan-400 font-semibold text-lg">
                  <FormattedMessage id="part4.subscriber.service" />
                </p>
              </div>

              <div>
                <p className="text-white font-bold mb-3">
                  <FormattedMessage id="part4.subscriber.pays" />
                </p>
                <ul className="list-none space-y-2 text-slate-300" style={{ marginInlineStart: '1rem' }}>
                  <li>• <FormattedMessage id="part4.subscriber.pay1" /></li>
                </ul>
              </div>

              <div>
                <p className="text-white font-bold mb-3">
                  <FormattedMessage id="part4.subscriber.gets" />
                </p>
                <ul className="list-none space-y-2 text-slate-300" style={{ marginInlineStart: '1rem' }}>
                  <li>• <FormattedMessage id="part4.subscriber.get1" /></li>
                  <li>• <FormattedMessage id="part4.subscriber.get2" /></li>
                  <li>• <FormattedMessage id="part4.subscriber.get3" /></li>
                </ul>
              </div>

              <div>
                <p className="text-white font-bold mb-3">
                  <FormattedMessage id="part4.subscriber.notneed" />
                </p>
                <ul className="list-none space-y-2 text-slate-300" style={{ marginInlineStart: '1rem' }}>
                  <li>• <FormattedMessage id="part4.subscriber.notneed1" /></li>
                  <li>• <FormattedMessage id="part4.subscriber.notneed2" /></li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-xl p-6 mb-8 border-2 border-purple-400/30">
          <p className="text-white text-lg font-semibold">
            💡 <FormattedMessage id="part4.insight" />
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={() => {
              const score = viewedNetflix && viewedSubscriber ? 5 : 0;
              onComplete(score);
            }}
            className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FormattedMessage id="part4.button.continue" />
          </button>
        </div>
      </div>
    </div>
  );
}
