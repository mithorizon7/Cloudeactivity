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
import { SectionCard, Token, StepCard, Bar } from './Part5/UIComponents';

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
    setTotalScore((p) => p + points);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 pb-28 md:pb-8">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-6 md:mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            <FormattedMessage id="part5.title" />
          </h1>
          <ol className="max-w-2xl mx-auto text-left space-y-2 mb-6">
            <li className="flex items-start gap-2 text-slate-300">
              <span className="font-bold text-[#8b959e]">1.</span>
              <FormattedMessage id="part5.steps.1" />
            </li>
            <li className="flex items-start gap-2 text-slate-300">
              <span className="font-bold text-[#8b959e]">2.</span>
              <FormattedMessage id="part5.steps.2" />
            </li>
            <li className="flex items-start gap-2 text-slate-300">
              <span className="font-bold text-[#8b959e]">3.</span>
              <FormattedMessage id="part5.steps.3" />
            </li>
            <li className="flex items-start gap-2 text-slate-300">
              <span className="font-bold text-[#8b959e]">4.</span>
              <FormattedMessage id="part5.steps.4" />
            </li>
          </ol>
        </header>

        <SectionCard className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-cyan-400">
              <FormattedMessage id="part5.scenario.label" values={{ current: scenarioIdx + 1, total: BASE_SCENARIOS.length }} />
            </p>
            <div className="flex flex-wrap gap-2">
              <Token>
                <FormattedMessage id="part5.scenario.pill.users" values={{ count: users }} />
              </Token>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-sm text-slate-400 mb-2">
              <FormattedMessage id="part5.matters.title" />
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'cost', weight: scenario.weights.cost },
                { key: 'perf', weight: scenario.weights.performance },
                { key: 'compliance', weight: scenario.weights.compliance },
                { key: 'effort', weight: scenario.weights.effort },
              ].map(({ key, weight }) => {
                const priority = weightToPriority(weight);
                const priorityColors = {
                  high: 'bg-emerald-600 text-white',
                  med: 'bg-blue-600 text-white',
                  low: 'bg-slate-600 text-slate-200',
                };
                return (
                  <div key={key} className="inline-flex items-center gap-1">
                    <InfoTooltip label={intl.formatMessage({ id: `part5.dim.${key}` })} id={`weight-${key}`}>
                      <FormattedMessage id={`part5.tooltip.${key}`} values={{ weight: Math.round(weight * 100) }} />
                    </InfoTooltip>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[priority]}`}>
                      <FormattedMessage id={`part5.matters.${priority}`} />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <h2 className="mt-2 text-2xl font-bold text-white">
            <FormattedMessage id={scenario.titleKey} />
          </h2>
          <p className="mt-1 text-slate-300">
            <FormattedMessage id={scenario.descriptionKey} />
          </p>

          <div className="mt-4 pt-4 border-t border-slate-700/40">
            <div className="mb-2 text-slate-300">
              <FormattedMessage id="part5.scale.users" values={{ count: users }} />
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
            <div className="mt-1 flex justify-between text-xs text-slate-400">
              <span>
                <FormattedNumber value={scenario.minUsers} />
              </span>
              <span>
                <FormattedNumber value={scenario.maxUsers} />
              </span>
            </div>
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
                className="min-w-[44px] min-h-[44px] px-3 py-2 text-xs text-slate-400 hover:text-white active:text-slate-200 motion-safe:transition touch-manipulation rounded-lg hover:bg-slate-700/50"
              >
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
            <div role="radiogroup" className="space-y-2">
              {(['iaas', 'paas', 'saas'] as ServiceModelKey[]).map((m) => {
                const meta = serviceMeta[m];
                const disabled = m === 'saas' && scenario.saasApplicable === false;
                const selectedState = service === m;
                return (
                  <button
                    key={m}
                    role="radio"
                    aria-checked={selectedState}
                    aria-disabled={disabled || undefined}
                    aria-describedby={disabled ? 'saas-note' : undefined}
                    onClick={() => !disabled && handleServiceSelect(m)}
                    className={`w-full text-left rounded-lg border-2 p-3 lg:p-4 xl:p-5 min-h-[60px] motion-safe:transition relative touch-manipulation
                      ${selectedState ? 'border-cyan-500 bg-slate-800 ring-2 ring-cyan-500/20' : 'border-slate-700 bg-slate-800/60 hover:bg-slate-800 hover:border-slate-600 active:bg-slate-700'}
                      ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    {selectedState && (
                      <div className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500 text-white font-bold text-sm">
                        ✓
                      </div>
                    )}
                    <div className="font-semibold text-slate-100">{meta.label}</div>
                    <div className="text-sm text-slate-400">{meta.blurb}</div>
                    <div className="mt-2 flex gap-2">
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
                  </button>
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
            <div role="radiogroup" className="space-y-2">
              {(['public', 'private', 'hybrid'] as DeploymentModelKey[]).map((m) => {
                const meta = deploymentMeta[m];
                const sel = deployment === m;
                return (
                  <button
                    key={m}
                    role="radio"
                    aria-checked={sel}
                    onClick={() => handleDeploymentSelect(m)}
                    className={`w-full text-left rounded-lg border-2 p-4 lg:p-5 xl:p-6 min-h-[80px] motion-safe:transition relative touch-manipulation
                      ${sel ? 'border-cyan-500 bg-slate-800 ring-2 ring-cyan-500/20' : 'border-slate-700 bg-slate-800/60 hover:bg-slate-800 hover:border-slate-600 active:bg-slate-700'}`}
                  >
                    {sel && (
                      <div className="absolute top-3 right-3 flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500 text-white font-bold text-sm">
                        ✓
                      </div>
                    )}
                    <div className="mb-1 font-semibold text-slate-100">{meta.label}</div>
                    <div className="mb-3 text-sm text-slate-400">{meta.blurb}</div>
                    <div className="flex items-center justify-around gap-3">
                      <div className="text-center">
                        <InfoTooltip label={intl.formatMessage({ id: 'part5.deployment.badge.fixed' })}>
                          <FormattedMessage id="part5.tooltip.fixed" />
                        </InfoTooltip>
                        <div className="text-lg font-bold text-cyan-300">{formatMonthlyCost(meta.fixedInfra, intl)}</div>
                      </div>
                      <div className="text-center">
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
                        <div className="text-lg font-bold text-cyan-300">
                          <FormattedNumber value={meta.variablePerKUsers} style="currency" currency="USD" minimumFractionDigits={0} />
                          /1k
                        </div>
                      </div>
                      <div className="text-center">
                        <InfoTooltip label={intl.formatMessage({ id: 'part5.deployment.badge.elasticity' })}>
                          <FormattedMessage id="part5.tooltip.elasticity" />
                        </InfoTooltip>
                        <div className="text-lg font-bold text-cyan-300">{meta.elasticity}/100</div>
                      </div>
                    </div>
                  </button>
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
                {!showTradeoffDetails && (
                  <div className="mb-4">
                    <p className="text-slate-200">
                      <FormattedMessage
                        id="part5.tradeoffs.summary"
                        values={{
                          service: serviceMeta[selected.service].label,
                          deployment: deploymentMeta[selected.deployment].label,
                          cost: formatMonthlyCost(selected.metrics.cost, intl),
                          score: Math.round(selected.metrics.fit),
                        }}
                      />
                    </p>
                    <button
                      onClick={() => setShowTradeoffDetails(true)}
                      className="mt-2 min-h-[44px] px-3 py-2 text-sm text-[#8b959e] hover:text-white underline motion-safe:transition touch-manipulation rounded-lg hover:bg-slate-700/30"
                    >
                      <FormattedMessage id="part5.tradeoffs.why" />
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
              <p className="text-slate-300">
                <FormattedMessage id="part5.tradeoffs.noselection" />
              </p>
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

        <div className="fixed bottom-20 sm:bottom-24 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-slate-700/50 p-4 z-40">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-slate-200 text-center sm:text-left">
              {selected ? (
                <FormattedMessage
                  id="part5.sticky.selected"
                  values={{
                    service: serviceMeta[selected.service].shortLabel,
                    deployment: deploymentMeta[selected.deployment].shortLabel,
                  }}
                />
              ) : (
                <FormattedMessage id="part5.sticky.none" />
              )}
            </div>
            {!evaluated ? (
              <button
                onClick={handleEvaluate}
                disabled={!selected}
                className="w-full sm:w-auto px-6 py-3 min-h-[48px] bg-gradient-to-r from-[#750014] via-[#973f4e] to-[#ba7f89] text-white font-bold rounded-full shadow-lg shadow-[#750014]/45 hover:scale-105 active:scale-95 transform transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-4 focus:ring-[#ba7f89]/60 touch-manipulation"
              >
                <FormattedMessage id="part5.button.evaluate" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full sm:w-auto px-6 py-3 min-h-[48px] bg-gradient-to-r from-[#750014] via-[#973f4e] to-[#ba7f89] text-white font-bold rounded-full shadow-lg shadow-[#750014]/45 hover:scale-105 active:scale-95 transform transition-transform focus:outline-none focus:ring-4 focus:ring-[#ba7f89]/60 touch-manipulation"
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
