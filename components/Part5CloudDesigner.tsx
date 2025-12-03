import { useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';
import { FormattedMessage, useIntl, FormattedNumber, FormattedList } from 'react-intl';
import { InfoTooltip } from './InfoTooltip';
import { ServiceModelKey, DeploymentModelKey } from '../types';
import {
  ServiceMetaMap,
  DeploymentMetaMap,
  Metrics,
  StepId,
} from './Part5/types';
import { clamp, formatMonthlyCost, weightToPriority, computeMetrics, weightedFit } from './Part5/helpers';
import { stepperReducer, initialStepperState } from './Part5/stepperReducer';
import { BASE_SCENARIOS } from './Part5/scenarios';
import { SectionCard, Token, StepCard, Bar, PriorityMeter, ScenarioIntro, PointsAnimation, ScoreIndicator, SliderMilestones } from './Part5/UIComponents';
import { ServerStackIcon, CubeIcon, CloudIcon, GlobeIcon, LockIcon, ArrowsIcon, ArchitectIcon, ChartBarIcon } from './Part5/Icons';

interface Part5CloudDesignerProps {
  onComplete: (score: number) => void;
}

export default function Part5CloudDesigner({ onComplete }: Part5CloudDesignerProps) {
  const intl = useIntl();
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [service, setService] = useState<ServiceModelKey | null>(null);
  const [deployment, setDeployment] = useState<DeploymentModelKey | null>(null);
  const [users, setUsers] = useState(BASE_SCENARIOS[0].defaultUsers);
  const [evaluated, setEvaluated] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [showCompare, setShowCompare] = useState(false);
  const [comparisonView, setComparisonView] = useState<'summary' | 'all'>('summary');
  const [showPrimer, setShowPrimer] = useState(true);
  const [showSustainability, setShowSustainability] = useState(false);
  const [showTradeoffDetails, setShowTradeoffDetails] = useState(true);
  const [topRevealed, setTopRevealed] = useState(false);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [lastPointsEarned, setLastPointsEarned] = useState(0);
  const liveRef = useRef<HTMLDivElement | null>(null);

  const [stepperState, dispatchStepper] = useReducer(stepperReducer, initialStepperState);
  const stepRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scenario = BASE_SCENARIOS[scenarioIdx];

  const serviceMeta: ServiceMetaMap = useMemo(
    () => ({
      iaas: {
        label: intl.formatMessage({ id: 'part5.service.iaas.label' }),
        shortLabel: intl.formatMessage({ id: 'part5.service.iaas.shortLabel' }),
        blurb: intl.formatMessage({ id: 'part5.service.iaas.blurb' }),
        monthlyOpsOverhead: 6000,
        controlBonus: +8,
        lockInRisk: 'low' as const,
        effortScore: 75,
      },
      paas: {
        label: intl.formatMessage({ id: 'part5.service.paas.label' }),
        shortLabel: intl.formatMessage({ id: 'part5.service.paas.shortLabel' }),
        blurb: intl.formatMessage({ id: 'part5.service.paas.blurb' }),
        monthlyOpsOverhead: 2500,
        controlBonus: +2,
        lockInRisk: 'med' as const,
        effortScore: 45,
      },
      saas: {
        label: intl.formatMessage({ id: 'part5.service.saas.label' }),
        shortLabel: intl.formatMessage({ id: 'part5.service.saas.shortLabel' }),
        blurb: intl.formatMessage({ id: 'part5.service.saas.blurb' }),
        monthlyOpsOverhead: 800,
        controlBonus: -6,
        lockInRisk: 'high' as const,
        effortScore: 20,
      },
    }),
    [intl]
  );

  const deploymentMeta: DeploymentMetaMap = useMemo(
    () => ({
      public: {
        label: intl.formatMessage({ id: 'part5.deployment.public.label' }),
        shortLabel: intl.formatMessage({ id: 'part5.deployment.public.shortLabel' }),
        blurb: intl.formatMessage({ id: 'part5.deployment.public.blurb' }),
        fixedInfra: 0,
        variablePerKUsers: 180,
        elasticity: 90,
        baseCompliance: 70,
      },
      private: {
        label: intl.formatMessage({ id: 'part5.deployment.private.label' }),
        shortLabel: intl.formatMessage({ id: 'part5.deployment.private.shortLabel' }),
        blurb: intl.formatMessage({ id: 'part5.deployment.private.blurb' }),
        fixedInfra: 12000,
        variablePerKUsers: 60,
        elasticity: 55,
        baseCompliance: 90,
      },
      hybrid: {
        label: intl.formatMessage({ id: 'part5.deployment.hybrid.label' }),
        shortLabel: intl.formatMessage({ id: 'part5.deployment.hybrid.shortLabel' }),
        blurb: intl.formatMessage({ id: 'part5.deployment.hybrid.blurb' }),
        fixedInfra: 4000,
        variablePerKUsers: 110,
        elasticity: 80,
        baseCompliance: 85,
      },
    }),
    [intl]
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowCompare(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setUsers(scenario.defaultUsers);
    setShowCompare(window.innerWidth >= 1024);
  }, [scenarioIdx, scenario.defaultUsers]);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

    Object.entries(stepperState.steps).forEach(([stepId, stepState]) => {
      if (stepState.expanded && stepRefs.current[stepId]) {
        stepRefs.current[stepId]?.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
      }
    });
  }, [stepperState.steps]);

  const allCombos = useMemo(() => {
    const services: ServiceModelKey[] = ['iaas', 'paas', 'saas'];
    const deployments: DeploymentModelKey[] = ['public', 'private', 'hybrid'];
    const combos = services.flatMap((s) =>
      deployments.map((d) => ({
        service: s,
        deployment: d,
        metrics: computeMetrics(s, d, users, scenario, serviceMeta, deploymentMeta, intl),
      }))
    );
    const peerCosts = combos.map((c) => c.metrics.cost);
    const withFit = combos.map((c) => {
      const { fit } = weightedFit(c.metrics, peerCosts, scenario.weights);
      return { ...c, metrics: { ...c.metrics, fit } as Metrics };
    });
    withFit.sort((a, b) => b.metrics.fit - a.metrics.fit);
    return withFit;
  }, [users, scenario, serviceMeta, deploymentMeta, intl]);

  const selected =
    service && deployment ? allCombos.find((c) => c.service === service && c.deployment === deployment) : null;
  const topFit = allCombos[0];

  const handleServiceSelect = (selectedService: ServiceModelKey) => {
    setService(selectedService);
    dispatchStepper({ type: 'STEP_COMPLETED', stepId: 'service' });
    dispatchStepper({ type: 'STEP_STARTED', stepId: 'deployment' });
  };

  const handleDeploymentSelect = (selectedDeployment: DeploymentModelKey) => {
    setDeployment(selectedDeployment);
    dispatchStepper({ type: 'STEP_COMPLETED', stepId: 'deployment' });
    dispatchStepper({ type: 'STEP_STARTED', stepId: 'results' });
  };

  const handleEvaluate = () => {
    if (!selected) return;
    setEvaluated(true);
    const rank = allCombos.findIndex((c) => c.service === selected.service && c.deployment === selected.deployment);
    const basePoints = rank === 0 ? 7 : rank <= 2 ? 5 : 3;
    const matchesIdeal = scenario.idealCombos.some(
      (x) => x.service === selected.service && x.deployment === selected.deployment
    );
    const points = basePoints + (matchesIdeal ? 1 : 0);
    setLastPointsEarned(points);
    setShowPointsAnimation(true);
    setTotalScore((p) => p + points);
    setTimeout(() => setShowPointsAnimation(false), 1500);
    requestAnimationFrame(() => {
      liveRef.current?.focus();
    });
  };

  const handleNext = () => {
    if (scenarioIdx < BASE_SCENARIOS.length - 1) {
      setService(null);
      setDeployment(null);
      setEvaluated(false);
      setTopRevealed(false);
      dispatchStepper({ type: 'STEP_RESET' });
      setScenarioIdx((i) => i + 1);
    } else {
      onComplete(totalScore);
    }
  };

  const getFeedback = () => {
    if (!selected) return null;
    const rank = allCombos.findIndex((c) => c.service === selected.service && c.deployment === selected.deployment);
    const key = rank === 0 ? 'part5.feedback.excellent' : rank <= 2 ? 'part5.feedback.solid' : 'part5.feedback.reasonable';

    const helping: string[] = [];
    const hurting: string[] = [];
    if (selected.metrics.performance >= 75) helping.push(intl.formatMessage({ id: 'part5.feedback.helping.performance' }));
    else if (selected.metrics.performance < 60) hurting.push(intl.formatMessage({ id: 'part5.feedback.hurting.performance' }));
    if (selected.metrics.compliance >= 80) helping.push(intl.formatMessage({ id: 'part5.feedback.helping.compliance' }));
    else if (selected.metrics.compliance < 65) hurting.push(intl.formatMessage({ id: 'part5.feedback.hurting.compliance' }));
    if (selected.metrics.ease >= 70) helping.push(intl.formatMessage({ id: 'part5.feedback.helping.effort' }));
    else if (selected.metrics.ease < 50) hurting.push(intl.formatMessage({ id: 'part5.feedback.hurting.effort' }));

    return (
      <SectionCard className="border-emerald-500/20 bg-slate-900/50">
        <div tabIndex={-1} ref={liveRef} className="outline-none">
          <div className="text-white font-semibold text-lg mb-2">
            <FormattedMessage id={key} />
          </div>
          <p className="text-slate-300 mb-3">
            <FormattedMessage
              id="part5.feedback.details"
              values={{
                yourFit: selected.metrics.fit,
                topService: serviceMeta[topFit.service].label,
                topDeployment: deploymentMeta[topFit.deployment].label,
                topFit: topFit.metrics.fit,
              }}
            />
          </p>
          <div className="grid md:grid-cols-2 lg:flex lg:gap-6 gap-4 text-sm">
            <div className="flex-1">
              <div className="mb-1 font-semibold text-emerald-300">
                <FormattedMessage id="part5.feedback.helping.label" />
              </div>
              <div className="text-slate-300">
                {helping.length ? <FormattedList type="conjunction" value={helping} /> : intl.formatMessage({ id: 'part5.feedback.helping.none' })}
              </div>
            </div>
            <div className="flex-1">
              <div className="mb-1 font-semibold text-orange-300">
                <FormattedMessage id="part5.feedback.hurting.label" />
              </div>
              <div className="text-slate-300">
                {hurting.length ? <FormattedList type="conjunction" value={hurting} /> : intl.formatMessage({ id: 'part5.feedback.hurting.none' })}
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    );
  };

  const estimatedCost = useMemo(() => {
    if (!service || !deployment) return null;
    const combo = allCombos.find((c) => c.service === service && c.deployment === deployment);
    return combo ? combo.metrics.cost : null;
  }, [service, deployment, allCombos]);

  const priorityData = useMemo(() => [
    { key: 'cost', label: intl.formatMessage({ id: 'part5.dim.cost' }), weight: scenario.weights.cost, priority: weightToPriority(scenario.weights.cost) },
    { key: 'perf', label: intl.formatMessage({ id: 'part5.dim.perf' }), weight: scenario.weights.performance, priority: weightToPriority(scenario.weights.performance) },
    { key: 'compliance', label: intl.formatMessage({ id: 'part5.dim.compliance' }), weight: scenario.weights.compliance, priority: weightToPriority(scenario.weights.compliance) },
    { key: 'effort', label: intl.formatMessage({ id: 'part5.dim.effort' }), weight: scenario.weights.effort, priority: weightToPriority(scenario.weights.effort) },
  ], [scenario.weights, intl]);

  const getScenarioIcon = () => {
    switch (scenario.id) {
      case 1: return <CubeIcon className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-400" />;
      case 2: return <LockIcon className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-400" />;
      case 3: return <CloudIcon className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-400" />;
      default: return <ArchitectIcon className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 pb-[180px] sm:pb-[200px]">
      <PointsAnimation points={lastPointsEarned} show={showPointsAnimation} />
      
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center sm:text-left">
              <FormattedMessage id="part5.title" />
            </h1>
            <ScoreIndicator 
              currentScore={totalScore} 
              maxScore={20} 
              scenarioNumber={scenarioIdx + 1} 
              totalScenarios={BASE_SCENARIOS.length} 
            />
          </div>
        </header>

        <ScenarioIntro
          scenarioNumber={scenarioIdx + 1}
          totalScenarios={BASE_SCENARIOS.length}
          icon={getScenarioIcon()}
          roleText={intl.formatMessage({ id: 'part5.role.text', defaultMessage: "You're the cloud architect. Design the best solution for this client." })}
          contextText={intl.formatMessage({ id: scenario.descriptionKey })}
        />

        <SectionCard className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              <FormattedMessage id={scenario.titleKey} />
            </h2>
            <div className="flex flex-wrap gap-2">
              <Token>
                <FormattedMessage id="part5.scenario.pill.users" values={{ count: users }} />
              </Token>
              {estimatedCost && (
                <Token>
                  <span className="text-cyan-300">{formatMonthlyCost(estimatedCost, intl)}</span>
                </Token>
              )}
            </div>
          </div>

          <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
            <PriorityMeter priorities={priorityData} />
          </div>

          <div className="pt-4 border-t border-slate-700/40">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <div className="text-slate-300 font-medium">
                <FormattedMessage id="part5.scale.users" values={{ count: users }} />
              </div>
              {estimatedCost && (
                <div className="text-sm text-cyan-300">
                  <FormattedMessage 
                    id="part5.cost.preview" 
                    defaultMessage="Est. monthly cost: {cost}"
                    values={{ cost: formatMonthlyCost(estimatedCost, intl) }}
                  />
                </div>
              )}
            </div>
            <input
              type="range"
              min={scenario.minUsers}
              max={scenario.maxUsers}
              step={Math.max(100, Math.round((scenario.maxUsers - scenario.minUsers) / 100))}
              value={users}
              onChange={(e) => setUsers(Number(e.target.value))}
              aria-label={intl.formatMessage({ id: 'part5.scale.users' }, { count: users })}
              className="w-full appearance-none rounded-lg bg-slate-700 accent-[#8b959e] h-12 cursor-pointer touch-manipulation [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-11 [&::-webkit-slider-thumb]:h-11 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-11 [&::-moz-range-thumb]:h-11 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cyan-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span><FormattedNumber value={scenario.minUsers} /></span>
              <span><FormattedNumber value={scenario.maxUsers} /></span>
            </div>
            <SliderMilestones min={scenario.minUsers} max={scenario.maxUsers} value={users} />
          </div>
        </SectionCard>

        {showPrimer && (
          <SectionCard className="mb-6 bg-gradient-to-br from-[#750014]/15 to-[#8b959e]/15 border-[#973f4e]/30">
            <div className="flex items-start justify-between">
              <h2 className="text-base lg:text-lg font-semibold text-[#d5b2b8]">
                <FormattedMessage id="part5.primer.title" />
              </h2>
              <button
                onClick={() => setShowPrimer(false)}
                className="min-w-[44px] min-h-[44px] px-3 py-2 text-xs text-slate-400 hover:text-white active:text-slate-200 motion-safe:transition touch-manipulation rounded-lg hover:bg-slate-700/50 flex items-center gap-1"
                aria-label={intl.formatMessage({ id: 'part5.primer.minimize', defaultMessage: 'Minimize refresher' })}
              >
                <span>↓</span>
                <FormattedMessage id="part5.primer.hide" />
              </button>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-slate-300 list-disc ml-5">
              <li>
                <FormattedMessage id="part5.primer.point1" />
              </li>
              <li>
                <FormattedMessage id="part5.primer.point2" />
              </li>
              <li>
                <FormattedMessage id="part5.primer.point3" />
              </li>
            </ul>
          </SectionCard>
        )}

        <div className="space-y-6">
          <StepCard
            stepNumber={1}
            title={intl.formatMessage({ id: 'part5.step1.title' })}
            subtitle={intl.formatMessage({ id: 'part5.step1.subtitle' })}
            status={stepperState.steps.service.status}
            expanded={stepperState.steps.service.expanded}
            onToggle={() =>
              dispatchStepper({ type: 'SET_EXPANDED', stepId: 'service', expanded: !stepperState.steps.service.expanded })
            }
            stepRef={(el) => (stepRefs.current['service'] = el)}
          >
            <div role="radiogroup" className="space-y-3">
              {(['iaas', 'paas', 'saas'] as ServiceModelKey[]).map((m) => {
                const meta = serviceMeta[m];
                const disabled = m === 'saas' && scenario.saasApplicable === false;
                const selectedState = service === m;
                const serviceIcons: Record<ServiceModelKey, React.ReactNode> = {
                  iaas: <ServerStackIcon className="w-8 h-8" />,
                  paas: <CubeIcon className="w-8 h-8" />,
                  saas: <CloudIcon className="w-8 h-8" />,
                };
                const serviceColors: Record<ServiceModelKey, string> = {
                  iaas: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
                  paas: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
                  saas: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
                };
                return (
                  <div
                    key={m}
                    className={`rounded-xl border-2 transition-all duration-300 relative
                      ${selectedState 
                        ? 'border-cyan-400 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 ring-2 ring-cyan-400/30 scale-[1.02] shadow-lg shadow-cyan-500/20' 
                        : `border-slate-600 bg-gradient-to-br ${serviceColors[m]}`}
                      ${disabled ? 'opacity-50' : ''}`}
                  >
                    <button
                      role="radio"
                      aria-checked={selectedState}
                      aria-disabled={disabled || undefined}
                      aria-describedby={disabled ? 'saas-note' : undefined}
                      onClick={() => !disabled && handleServiceSelect(m)}
                      className={`w-full text-left p-4 lg:p-5 min-h-[80px] touch-manipulation group rounded-t-xl
                        ${disabled ? 'cursor-not-allowed' : 'hover:bg-slate-800/20 active:bg-slate-800/30'}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 p-2 rounded-lg transition-colors duration-300 ${
                          selectedState ? 'bg-cyan-500/30 text-cyan-300' : 'bg-slate-700/50 text-slate-400 group-hover:text-slate-300'
                        }`}>
                          {serviceIcons[m]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-bold text-lg text-slate-100">{meta.label}</div>
                            {selectedState && (
                              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-cyan-500 text-white font-bold text-sm animate-pulse">
                                ✓
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-slate-400 mt-1">{meta.blurb}</div>
                        </div>
                      </div>
                    </button>
                    <div className="px-4 pb-4 lg:px-5 lg:pb-5 flex flex-wrap gap-2">
                      <Token>
                        <InfoTooltip
                          label={intl.formatMessage(
                            { id: 'part5.service.pill.ops' },
                            { cost: formatMonthlyCost(meta.monthlyOpsOverhead, intl) }
                          )}
                        >
                          <FormattedMessage id="part5.tooltip.ops" />
                        </InfoTooltip>
                      </Token>
                      <Token>
                        <InfoTooltip
                          label={intl.formatMessage(
                            { id: 'part5.service.pill.lockin' },
                            { risk: intl.formatMessage({ id: `part5.risk.${meta.lockInRisk}` }) }
                          )}
                        >
                          <FormattedMessage id="part5.tooltip.lockin" />
                        </InfoTooltip>
                      </Token>
                    </div>
                  </div>
                );
              })}
            </div>
            <p id="saas-note" className="sr-only">
              <FormattedMessage id="part5.saas.disabled" />
            </p>
          </StepCard>

          <StepCard
            stepNumber={2}
            title={intl.formatMessage({ id: 'part5.step2.title' })}
            subtitle={intl.formatMessage({ id: 'part5.step2.subtitle' })}
            status={stepperState.steps.deployment.status}
            expanded={stepperState.steps.deployment.expanded}
            onToggle={() =>
              dispatchStepper({
                type: 'SET_EXPANDED',
                stepId: 'deployment',
                expanded: !stepperState.steps.deployment.expanded,
              })
            }
            stepRef={(el) => (stepRefs.current['deployment'] = el)}
          >
            <div role="radiogroup" className="space-y-3">
              {(['public', 'private', 'hybrid'] as DeploymentModelKey[]).map((m) => {
                const meta = deploymentMeta[m];
                const sel = deployment === m;
                const deploymentIcons: Record<DeploymentModelKey, React.ReactNode> = {
                  public: <GlobeIcon className="w-8 h-8" />,
                  private: <LockIcon className="w-8 h-8" />,
                  hybrid: <ArrowsIcon className="w-8 h-8" />,
                };
                const deploymentColors: Record<DeploymentModelKey, string> = {
                  public: 'from-green-500/20 to-green-600/10 border-green-500/30',
                  private: 'from-red-500/20 to-red-600/10 border-red-500/30',
                  hybrid: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
                };
                return (
                  <div
                    key={m}
                    className={`rounded-xl border-2 transition-all duration-300 relative
                      ${sel 
                        ? 'border-cyan-400 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 ring-2 ring-cyan-400/30 scale-[1.02] shadow-lg shadow-cyan-500/20' 
                        : `border-slate-600 bg-gradient-to-br ${deploymentColors[m]}`}`}
                  >
                    <button
                      role="radio"
                      aria-checked={sel}
                      onClick={() => handleDeploymentSelect(m)}
                      className="w-full text-left p-4 lg:p-5 min-h-[80px] touch-manipulation group rounded-t-xl hover:bg-slate-800/20 active:bg-slate-800/30"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 p-2 rounded-lg transition-colors duration-300 ${
                          sel ? 'bg-cyan-500/30 text-cyan-300' : 'bg-slate-700/50 text-slate-400 group-hover:text-slate-300'
                        }`}>
                          {deploymentIcons[m]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="font-bold text-lg text-slate-100">{meta.label}</div>
                            {sel && (
                              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-cyan-500 text-white font-bold text-sm animate-pulse">
                                ✓
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-slate-400">{meta.blurb}</div>
                        </div>
                      </div>
                    </button>
                    <div className="px-4 pb-4 lg:px-5 lg:pb-5">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-slate-800/50 rounded-lg">
                          <InfoTooltip label={intl.formatMessage({ id: 'part5.deployment.badge.fixed' })}>
                            <FormattedMessage id="part5.tooltip.fixed" />
                          </InfoTooltip>
                          <div className="text-base sm:text-lg font-bold text-cyan-300">{formatMonthlyCost(meta.fixedInfra, intl)}</div>
                        </div>
                        <div className="p-2 bg-slate-800/50 rounded-lg">
                          <InfoTooltip
                            label={
                              intl.formatNumber(meta.variablePerKUsers, {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 0,
                              }) + '/1k'
                            }
                          >
                            <FormattedMessage id="part5.tooltip.variable" />
                          </InfoTooltip>
                          <div className="text-base sm:text-lg font-bold text-cyan-300">
                            <FormattedNumber value={meta.variablePerKUsers} style="currency" currency="USD" minimumFractionDigits={0} />
                            /1k
                          </div>
                        </div>
                        <div className="p-2 bg-slate-800/50 rounded-lg">
                          <InfoTooltip label={intl.formatMessage({ id: 'part5.deployment.badge.elasticity' })}>
                            <FormattedMessage id="part5.tooltip.elasticity" />
                          </InfoTooltip>
                          <div className="text-base sm:text-lg font-bold text-cyan-300">{meta.elasticity}/100</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setShowSustainability((s) => !s)}
              className="mt-3 min-h-[44px] px-3 py-2 text-xs text-slate-400 hover:text-slate-200 underline motion-safe:transition touch-manipulation rounded-lg hover:bg-slate-700/30"
            >
              <FormattedMessage id="part5.deployment.sustainability.learn" />
            </button>
            {showSustainability && (
              <p className="mt-2 text-xs leading-relaxed text-slate-300 bg-slate-800/40 p-3 rounded border border-slate-700/50">
                <FormattedMessage id="part5.deployment.sustainability" />
              </p>
            )}
          </StepCard>

          <StepCard
            stepNumber={3}
            title={intl.formatMessage({ id: 'part5.step3.title' })}
            subtitle={intl.formatMessage({ id: 'part5.step3.subtitle' })}
            status={stepperState.steps.results.status}
            expanded={stepperState.steps.results.expanded}
            onToggle={() =>
              dispatchStepper({ type: 'SET_EXPANDED', stepId: 'results', expanded: !stepperState.steps.results.expanded })
            }
            stepRef={(el) => (stepRefs.current['results'] = el)}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="font-semibold text-white">
                <FormattedMessage id="part5.tradeoffs.heading" />
              </p>
            </div>

            {selected ? (
              <>
                <div className="mb-4 p-4 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 rounded-xl border border-cyan-500/20">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <span className="text-slate-400 text-sm">Your Selection:</span>
                      <div className="text-lg font-bold text-white">
                        {serviceMeta[selected.service].label} + {deploymentMeta[selected.deployment].label}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-xs text-slate-400">Cost</div>
                        <div className="text-lg font-bold text-cyan-300">{formatMonthlyCost(selected.metrics.cost, intl)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-400">Fit Score</div>
                        <div className="text-2xl font-bold text-emerald-400">{selected.metrics.fit}/100</div>
                      </div>
                    </div>
                  </div>
                </div>

                {!showTradeoffDetails && (
                  <div className="mb-4">
                    <button
                      onClick={() => setShowTradeoffDetails(true)}
                      className="w-full min-h-[48px] px-4 py-3 text-sm font-medium text-cyan-300 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600 hover:border-cyan-500/50 rounded-lg motion-safe:transition touch-manipulation flex items-center justify-center gap-2"
                    >
                      <span>📊</span>
                      <FormattedMessage id="part5.tradeoffs.why" defaultMessage="Show detailed breakdown" />
                    </button>
                  </div>
                )}

                {showTradeoffDetails && (
                  <div className="grid gap-6 lg:grid-cols-2 xl:gap-8">
                    <div>
                      <div className="mb-1 font-semibold text-slate-200">
                        <FormattedMessage id="part5.tradeoffs.selection.label" />{' '}
                        <span className="text-[#adb4bb]">{serviceMeta[selected.service].label}</span> +{' '}
                        <span className="text-[#d0d4d8]">{deploymentMeta[selected.deployment].label}</span>
                      </div>
                      <div className="mb-2 text-sm text-slate-400">
                        <FormattedMessage id="part5.tradeoffs.cost.label" />{' '}
                        <b className="text-[#adb4bb]">{formatMonthlyCost(selected.metrics.cost, intl)}</b>
                      </div>
                      <Bar value={selected.metrics.performance} label={intl.formatMessage({ id: 'part5.tradeoffs.metric.performance' })} />
                      <Bar value={selected.metrics.compliance} label={intl.formatMessage({ id: 'part5.tradeoffs.metric.compliance' })} />
                      <Bar value={selected.metrics.ease} label={intl.formatMessage({ id: 'part5.tradeoffs.metric.ease' })} />
                      <div className="mt-3 text-sm text-slate-300">
                        <div className="mb-1 font-semibold">
                          <FormattedMessage id="part5.tradeoffs.explain.heading" />
                        </div>
                        <ul className="ml-5 list-disc space-y-1">
                          {selected.metrics.explain.map((x, i) => (
                            <li key={i}>{x}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-4 text-slate-200">
                        <FormattedMessage id="part5.tradeoffs.fit.label" />{' '}
                        <span className="text-xl font-bold text-emerald-400">
                          <FormattedNumber value={selected.metrics.fit} />/100
                        </span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-emerald-500/30 bg-slate-800/40 p-4 relative">
                      {!topRevealed && (
                        <div className="absolute inset-0 bg-slate-800/60 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                          <button
                            onClick={() => setTopRevealed(true)}
                            className="min-h-[48px] px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 touch-manipulation"
                            aria-live="polite"
                          >
                            <FormattedMessage id="part5.top.reveal" />
                          </button>
                        </div>
                      )}
                      <div className={topRevealed ? '' : 'pointer-events-none'} aria-hidden={!topRevealed}>
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-slate-200">
                            <FormattedMessage id="part5.top.heading" />
                          </div>
                          <span className="rounded px-2 py-0.5 text-xs text-emerald-300 border border-emerald-700 bg-emerald-900/30">
                            <FormattedMessage id="part5.top.badge" />
                          </span>
                        </div>
                        <div className="mt-2 text-slate-200">
                          <div>
                            <span className="text-emerald-300">{serviceMeta[topFit.service].label}</span> +{' '}
                            <span className="text-emerald-300">{deploymentMeta[topFit.deployment].label}</span>
                          </div>
                          <div className="text-sm text-slate-400">
                            <FormattedMessage id="part5.top.cost.label" />{' '}
                            <b className="text-cyan-300">{formatMonthlyCost(topFit.metrics.cost, intl)}</b> ·
                            <FormattedMessage id="part5.top.fit.label" />{' '}
                            <b className="text-emerald-300">
                              <FormattedNumber value={topFit.metrics.fit} />/100
                            </b>
                          </div>
                          <div className="mt-2">
                            <Bar value={topFit.metrics.performance} label={intl.formatMessage({ id: 'part5.tradeoffs.metric.performance' })} />
                            <Bar value={topFit.metrics.compliance} label={intl.formatMessage({ id: 'part5.tradeoffs.metric.compliance' })} />
                            <Bar value={topFit.metrics.ease} label={intl.formatMessage({ id: 'part5.tradeoffs.metric.ease' })} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-6 bg-slate-800/30 rounded-xl border-2 border-dashed border-slate-600/50">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700/50 rounded-full mb-4">
                      <ChartBarIcon className="w-8 h-8 text-slate-500" />
                    </div>
                    <p className="text-slate-400 mb-2">
                      <FormattedMessage id="part5.tradeoffs.noselection" defaultMessage="Your results will appear here" />
                    </p>
                    <p className="text-sm text-slate-500">
                      <FormattedMessage 
                        id="part5.tradeoffs.noselection.hint" 
                        defaultMessage="Complete Steps 1 and 2 above to see your metrics"
                      />
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 opacity-40">
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="h-2 bg-slate-700 rounded w-20 mb-2" />
                    <div className="h-4 bg-slate-700 rounded w-12" />
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="h-2 bg-slate-700 rounded w-16 mb-2" />
                    <div className="h-4 bg-slate-700 rounded w-10" />
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="h-2 bg-slate-700 rounded w-14 mb-2" />
                    <div className="h-4 bg-slate-700 rounded w-8" />
                  </div>
                </div>
              </div>
            )}

            {topRevealed && selected && (
              <div className="mt-6">
                <h3 className="mb-3 text-lg font-semibold text-white">
                  <FormattedMessage id="part5.compare.title" />
                </h3>

                <div className="mb-3 flex items-center gap-2">
                  <span className="text-sm text-slate-300">
                    <FormattedMessage id="part5.compare.show" />
                  </span>
                  <div className="inline-flex rounded-lg border border-slate-600 bg-slate-800/60 p-1">
                    <button
                      onClick={() => setComparisonView('summary')}
                      className={`min-h-[44px] px-4 py-2 text-sm rounded-md motion-safe:transition touch-manipulation ${
                        comparisonView === 'summary' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-300 hover:text-white active:bg-slate-700'
                      }`}
                    >
                      <FormattedMessage id="part5.compare.summary" />
                    </button>
                    <button
                      onClick={() => setComparisonView('all')}
                      className={`min-h-[44px] px-4 py-2 text-sm rounded-md motion-safe:transition touch-manipulation ${
                        comparisonView === 'all' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-300 hover:text-white active:bg-slate-700'
                      }`}
                    >
                      <FormattedMessage id="part5.compare.all" />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-slate-300">
                      <tr className="text-left">
                        <th className="sticky left-0 bg-slate-900/50 py-2 pr-3 backdrop-blur-sm">#</th>
                        <th className="sticky left-8 bg-slate-900/50 py-2 pr-3 backdrop-blur-sm">
                          <FormattedMessage id="part5.table.option" />
                        </th>
                        <th className="py-2 pr-3">
                          <FormattedMessage id="part5.table.cost" />
                        </th>
                        <th className="py-2 pr-3">
                          <FormattedMessage id="part5.table.perf" />
                        </th>
                        <th className="py-2 pr-3">
                          <FormattedMessage id="part5.table.compliance" />
                        </th>
                        <th className="py-2 pr-3">
                          <FormattedMessage id="part5.table.ease" />
                        </th>
                        <th className="py-2 pr-3">
                          <FormattedMessage id="part5.table.fit" />
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-200">
                      {(() => {
                        let displayedCombos = allCombos;
                        if (comparisonView === 'summary' && selected) {
                          const topRecommendation = allCombos[0];
                          const isTopSelected =
                            selected.service === topRecommendation.service && selected.deployment === topRecommendation.deployment;

                          if (isTopSelected) {
                            displayedCombos = allCombos.slice(0, 3);
                          } else {
                            const combosSet = new Set([topRecommendation, selected]);
                            for (let i = 1; i < allCombos.length && combosSet.size < 3; i++) {
                              const combo = allCombos[i];
                              if (combo.service !== selected.service || combo.deployment !== selected.deployment) {
                                combosSet.add(combo);
                              }
                            }
                            displayedCombos = Array.from(combosSet);
                          }
                        } else if (comparisonView === 'summary') {
                          displayedCombos = allCombos.slice(0, 3);
                        }

                        return displayedCombos.map((c) => {
                          const originalRank =
                            allCombos.findIndex((combo) => combo.service === c.service && combo.deployment === c.deployment) + 1;
                          const isCurrentSelection =
                            selected && c.service === selected.service && c.deployment === selected.deployment;

                          return (
                            <tr
                              key={`${c.service}-${c.deployment}`}
                              className={`border-t border-slate-700/50 ${isCurrentSelection ? 'bg-cyan-900/20 border-cyan-500/30' : ''}`}
                            >
                              <td className="py-2 pr-3 text-slate-400">
                                {originalRank}
                                {isCurrentSelection && <span className="ml-1 text-cyan-400">★</span>}
                              </td>
                              <td className="py-2 pr-3">
                                <div className={`font-medium ${isCurrentSelection ? 'text-cyan-300' : ''}`}>
                                  {serviceMeta[c.service].label}
                                </div>
                                <div className="text-xs text-slate-400">{deploymentMeta[c.deployment].label}</div>
                              </td>
                              <td className="py-2 pr-3">{formatMonthlyCost(c.metrics.cost, intl)}</td>
                              <td className="py-2 pr-3">
                                <FormattedNumber value={Math.round(c.metrics.performance)} />
                              </td>
                              <td className="py-2 pr-3">
                                <FormattedNumber value={Math.round(c.metrics.compliance)} />
                              </td>
                              <td className="py-2 pr-3">
                                <FormattedNumber value={Math.round(c.metrics.ease)} />
                              </td>
                              <td className="py-2 pr-3 font-semibold">
                                <FormattedNumber value={c.metrics.fit} />
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </StepCard>
        </div>

        {evaluated && getFeedback()}

        {!showPrimer && (
          <div className="mt-8 mb-6">
            <SectionCard className="bg-gradient-to-br from-[#750014]/10 to-[#8b959e]/10 border-[#973f4e]/20">
              <button
                onClick={() => setShowPrimer(true)}
                className="w-full flex items-center justify-between gap-3 min-h-[44px] text-left touch-manipulation group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 p-2 bg-[#750014]/20 rounded-lg group-hover:bg-[#750014]/30 transition-colors">
                    <svg className="w-5 h-5 text-[#d5b2b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-[#d5b2b8] group-hover:text-white transition-colors">
                    <FormattedMessage id="part5.primer.title" />
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 group-hover:text-white transition-colors">
                  <span className="text-xs">
                    <FormattedMessage id="part5.primer.expand" defaultMessage="Expand" />
                  </span>
                  <span>↑</span>
                </div>
              </button>
            </SectionCard>
          </div>
        )}

        <div className="fixed bottom-[100px] sm:bottom-[120px] left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/50 p-3 sm:p-4 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
            <div className="hidden sm:block text-slate-200 text-sm">
              {selected ? (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Selected:</span>
                  <span className="font-medium text-cyan-300">
                    {serviceMeta[selected.service].shortLabel} + {deploymentMeta[selected.deployment].shortLabel}
                  </span>
                  {evaluated && (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">
                      +{lastPointsEarned} pts
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-slate-400">
                  <FormattedMessage id="part5.sticky.none" defaultMessage="Make your selections above" />
                </span>
              )}
            </div>
            <div className="sm:hidden flex-1 text-center">
              {selected && !evaluated && (
                <span className="text-xs text-cyan-300 font-medium">
                  {serviceMeta[selected.service].shortLabel} + {deploymentMeta[selected.deployment].shortLabel}
                </span>
              )}
              {evaluated && (
                <span className="text-xs text-emerald-400 font-medium">+{lastPointsEarned} points earned!</span>
              )}
            </div>
            {!evaluated ? (
              <button
                onClick={handleEvaluate}
                disabled={!selected}
                className="flex-shrink-0 w-full sm:w-auto px-5 sm:px-6 py-3 min-h-[48px] bg-gradient-to-r from-[#750014] via-[#973f4e] to-[#ba7f89] text-white font-bold rounded-full shadow-lg shadow-[#750014]/45 hover:scale-105 active:scale-95 transform transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-4 focus:ring-[#ba7f89]/60 touch-manipulation text-sm sm:text-base"
              >
                <FormattedMessage id="part5.button.evaluate" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-shrink-0 w-full sm:w-auto px-5 sm:px-6 py-3 min-h-[48px] bg-gradient-to-r from-[#750014] via-[#973f4e] to-[#ba7f89] text-white font-bold rounded-full shadow-lg shadow-[#750014]/45 hover:scale-105 active:scale-95 transform transition-transform focus:outline-none focus:ring-4 focus:ring-[#ba7f89]/60 touch-manipulation text-sm sm:text-base"
              >
                <FormattedMessage
                  id={scenarioIdx < BASE_SCENARIOS.length - 1 ? 'part5.button.next' : 'part5.button.finish'}
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
