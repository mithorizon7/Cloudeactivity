import { useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

interface Part5CloudDesignerProps {
  onComplete: (score: number) => void;
}

interface Scenario {
  id: number;
  titleKey: string;
  textKey: string;
  idealService: string;
  idealDeployment: string;
  minUsers: number;
  maxUsers: number;
  defaultUsers: number;
}

const scenarios: Scenario[] = [
  {
    id: 1,
    titleKey: 'part5.scenario1.title',
    textKey: 'part5.scenario1.text',
    idealService: 'paas',
    idealDeployment: 'public',
    minUsers: 1000,
    maxUsers: 100000,
    defaultUsers: 5000
  },
  {
    id: 2,
    titleKey: 'part5.scenario2.title',
    textKey: 'part5.scenario2.text',
    idealService: 'iaas',
    idealDeployment: 'private',
    minUsers: 5000,
    maxUsers: 10000,
    defaultUsers: 5000
  },
  {
    id: 3,
    titleKey: 'part5.scenario3.title',
    textKey: 'part5.scenario3.text',
    idealService: 'paas',
    idealDeployment: 'hybrid',
    minUsers: 10000,
    maxUsers: 100000,
    defaultUsers: 20000
  }
];

export default function Part5CloudDesigner({ onComplete }: Part5CloudDesignerProps) {
  const intl = useIntl();
  const [currentScenario, setCurrentScenario] = useState(0);
  const [serviceModel, setServiceModel] = useState<string>('');
  const [deploymentModel, setDeploymentModel] = useState<string>('');
  const [userCount, setUserCount] = useState(scenarios[0].defaultUsers);
  const [evaluated, setEvaluated] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [totalScore, setTotalScore] = useState(0);

  const scenario = scenarios[currentScenario];

  useEffect(() => {
    setServiceModel('');
    setDeploymentModel('');
    setUserCount(scenario.defaultUsers);
    setEvaluated(false);
    setFeedback('');
  }, [currentScenario, scenario.defaultUsers]);

  const calculateCost = () => {
    let baseCost = 0;
    
    if (deploymentModel === 'public') {
      baseCost = userCount * 0.05;
    } else if (deploymentModel === 'private') {
      baseCost = 5000 + (userCount * 0.02);
    } else if (deploymentModel === 'hybrid') {
      baseCost = 3000 + (userCount * 0.03);
    }

    if (serviceModel === 'iaas') {
      baseCost *= 0.8;
    } else if (serviceModel === 'paas') {
      baseCost *= 1.0;
    } else if (serviceModel === 'saas') {
      baseCost *= 1.3;
    }

    return Math.round(baseCost);
  };

  const getPerformance = () => {
    if (!serviceModel || !deploymentModel) return '';

    const userRatio = userCount / scenario.maxUsers;
    
    if (deploymentModel === 'public' && userRatio > 0.8) {
      return 'excellent';
    } else if (deploymentModel === 'private') {
      return userRatio < 0.5 ? 'excellent' : 'good';
    } else if (deploymentModel === 'hybrid') {
      return 'good';
    }
    
    return 'adequate';
  };

  const evaluateSolution = () => {
    if (!serviceModel || !deploymentModel) return;

    let feedbackKey = '';
    let isIdeal = false;

    if (scenario.id === 1) {
      if (serviceModel === 'paas' && deploymentModel === 'public') {
        feedbackKey = 'part5.feedback.scenario1.ideal';
        isIdeal = true;
      } else if (deploymentModel === 'private') {
        feedbackKey = 'part5.feedback.scenario1.expensive';
      } else if (deploymentModel === 'hybrid') {
        feedbackKey = 'part5.feedback.scenario1.complex';
      } else {
        feedbackKey = 'part5.feedback.default';
      }
    } else if (scenario.id === 2) {
      if (serviceModel === 'iaas' && deploymentModel === 'private') {
        feedbackKey = 'part5.feedback.scenario2.ideal';
        isIdeal = true;
      } else if (deploymentModel === 'public') {
        feedbackKey = 'part5.feedback.scenario2.security';
      } else {
        feedbackKey = 'part5.feedback.default';
      }
    } else if (scenario.id === 3) {
      if (serviceModel === 'paas' && deploymentModel === 'hybrid') {
        feedbackKey = 'part5.feedback.scenario3.ideal';
        isIdeal = true;
      } else if (deploymentModel === 'private') {
        feedbackKey = 'part5.feedback.scenario3.waste';
      } else if (deploymentModel === 'public') {
        feedbackKey = 'part5.feedback.scenario3.public';
      } else {
        feedbackKey = 'part5.feedback.default';
      }
    }

    setFeedback(feedbackKey);
    setEvaluated(true);
    
    if (isIdeal) {
      setTotalScore(prev => prev + 10);
    }
  };

  const handleNext = () => {
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(prev => prev + 1);
    } else {
      onComplete(totalScore);
    }
  };

  const performance = getPerformance();
  const cost = calculateCost();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-indigo-500/20">
        <h1 className="text-4xl font-bold text-white mb-4 text-center">
          <FormattedMessage id="part5.title" />
        </h1>
        <p className="text-xl text-slate-300 mb-8 text-center">
          <FormattedMessage id="part5.subtitle" />
        </p>

        <div className="bg-slate-900/50 rounded-xl p-6 mb-8">
          <p className="text-cyan-400 font-bold mb-2">
            <FormattedMessage id="part5.scenario.label" />
          </p>
          <h2 className="text-2xl font-bold text-white mb-3">
            <FormattedMessage id={scenario.titleKey} />
          </h2>
          <p className="text-slate-300 text-lg">
            <FormattedMessage id={scenario.textKey} />
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-white font-bold mb-4">
              <FormattedMessage id="part5.choose.service" />
            </p>
            <div className="space-y-3">
              {['iaas', 'paas', 'saas'].map(model => (
                <button
                  key={model}
                  onClick={() => setServiceModel(model)}
                  className={`w-full p-4 rounded-lg font-semibold text-start transition-all ${
                    serviceModel === model
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <FormattedMessage id={`servicemodel.${model}`} />
                </button>
              ))}
            </div>

            <p className="text-white font-bold mb-4 mt-6">
              <FormattedMessage id="part5.choose.deployment" />
            </p>
            <div className="space-y-3">
              {['public', 'private', 'hybrid'].map(model => (
                <button
                  key={model}
                  onClick={() => setDeploymentModel(model)}
                  className={`w-full p-4 rounded-lg font-semibold text-start transition-all ${
                    deploymentModel === model
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <FormattedMessage id={`deploymentmodel.${model}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-white font-bold mb-4">
              <FormattedMessage id="part5.adjust.scale" />
            </p>
            <div className="bg-slate-900/70 rounded-xl p-6">
              <p className="text-cyan-400 text-lg font-semibold mb-4">
                <FormattedMessage id="part5.users.current" values={{ count: userCount }} />
              </p>
              <input
                type="range"
                min={scenario.minUsers}
                max={scenario.maxUsers}
                step={1000}
                value={userCount}
                onChange={(e) => setUserCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-slate-400 text-sm mt-2">
                <span>{intl.formatNumber(scenario.minUsers)}</span>
                <span>{intl.formatNumber(scenario.maxUsers)}</span>
              </div>

              <div className="mt-8 space-y-4">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-white font-semibold mb-2">
                    <FormattedMessage id="part5.cost.title" />
                  </p>
                  <div className="flex items-center gap-2">
                    <div className={`h-3 rounded-full transition-all ${
                      !deploymentModel ? 'bg-slate-600 w-0' :
                      cost < 1000 ? 'bg-green-500 w-1/4' :
                      cost < 5000 ? 'bg-yellow-500 w-1/2' :
                      cost < 10000 ? 'bg-orange-500 w-3/4' :
                      'bg-red-500 w-full'
                    }`} style={{ minWidth: deploymentModel ? '10%' : '0' }} />
                  </div>
                  <p className="text-3xl font-bold text-cyan-400 mt-2">
                    {deploymentModel ? <FormattedMessage id="part5.cost.amount" values={{ amount: cost }} /> : '—'}
                  </p>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-white font-semibold mb-2">
                    <FormattedMessage id="part5.performance.title" />
                  </p>
                  <div className="flex items-center gap-2">
                    <div className={`h-3 rounded-full transition-all ${
                      !performance ? 'bg-slate-600 w-0' :
                      performance === 'excellent' ? 'bg-green-500 w-full' :
                      performance === 'good' ? 'bg-blue-500 w-3/4' :
                      performance === 'adequate' ? 'bg-yellow-500 w-1/2' :
                      'bg-red-500 w-1/4'
                    }`} style={{ minWidth: performance ? '10%' : '0' }} />
                  </div>
                  <p className={`text-2xl font-bold mt-2 ${
                    performance === 'excellent' ? 'text-green-400' :
                    performance === 'good' ? 'text-blue-400' :
                    performance === 'adequate' ? 'text-yellow-400' :
                    'text-slate-400'
                  }`}>
                    {performance ? <FormattedMessage id={`part5.performance.${performance}`} /> : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!evaluated && serviceModel && deploymentModel && (
          <div className="text-center mb-6">
            <button
              onClick={evaluateSolution}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FormattedMessage id="part5.button.evaluate" />
            </button>
          </div>
        )}

        {evaluated && feedback && (
          <div className={`rounded-xl p-6 mb-6 border-2 ${
            feedback.includes('ideal') 
              ? 'bg-green-900/30 border-green-500/50' 
              : 'bg-blue-900/30 border-blue-500/50'
          }`}>
            <p className="text-white text-lg">
              {feedback.includes('ideal') ? '✅ ' : '💡 '}
              <FormattedMessage id={feedback} />
            </p>
          </div>
        )}

        {evaluated && (
          <div className="text-center">
            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FormattedMessage id={currentScenario < scenarios.length - 1 ? 'part5.button.next' : 'part5.button.finish'} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
