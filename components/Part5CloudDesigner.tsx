// Part5CloudDesigner (uplifted)
// Mobile-first; 12-col desktop grid; radio-card semantics; sticky action bar;
// Top-3 on mobile; full table optional; live region + motion-safe transitions.

import { useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from "react";
import { FormattedMessage, useIntl, FormattedNumber, FormattedList } from "react-intl";
import { InfoTooltip } from "./InfoTooltip";

// --- types & helpers (unchanged) ---
type ServiceModel = "iaas" | "paas" | "saas";
type DeploymentModel = "public" | "private" | "hybrid";

interface Part5CloudDesignerProps { onComplete: (score: number) => void; }
interface Scenario {
  id: number; titleKey: string; descriptionKey: string;
  minUsers: number; maxUsers: number; defaultUsers: number;
  weights: { cost: number; performance: number; compliance: number; effort: number; };
  idealCombos: Array<{ service: ServiceModel; deployment: DeploymentModel }>;
  saasApplicable?: boolean;
}

function clamp(n:number, lo:number, hi:number){ return Math.max(lo, Math.min(hi,n)); }
function normalizeTo0_100(vals:number[], v:number){
  const min = Math.min(...vals), max = Math.max(...vals);
  if (Math.abs(max-min) < 1e-6) return 50;
  return clamp(((max - v)/(max - min))*100, 0, 100);
}
function formatMonthlyCost(n:number, intl:any){ 
  return intl.formatMessage({ id: "part5.currency.monthly" }, { amount: Math.round(n) });
}
function weightToPriority(weight: number): 'high' | 'med' | 'low' {
  if (weight >= 0.30) return 'high';
  if (weight >= 0.15) return 'med';
  return 'low';
}

// --- scenarios (same ordering you use in (2).tsx) ---
const BASE_SCENARIOS: Scenario[] = [
  {
    id: 3, titleKey: "part5.scenario3.title", descriptionKey: "part5.scenario3.description",
    minUsers: 500, maxUsers: 10_000, defaultUsers: 3_000,
    weights: { cost: 0.30, performance: 0.20, compliance: 0.20, effort: 0.30 },
    idealCombos: [{ service: "saas", deployment: "public" }], saasApplicable: true,
  },
  {
    id: 1, titleKey: "part5.scenario1.title", descriptionKey: "part5.scenario1.description",
    minUsers: 1_000, maxUsers: 200_000, defaultUsers: 15_000,
    weights: { cost: 0.30, performance: 0.35, compliance: 0.10, effort: 0.25 },
    idealCombos: [{ service: "paas", deployment: "public" }, { service: "iaas", deployment: "public" }],
    saasApplicable: false,
  },
  {
    id: 2, titleKey: "part5.scenario2.title", descriptionKey: "part5.scenario2.description",
    minUsers: 5_000, maxUsers: 100_000, defaultUsers: 25_000,
    weights: { cost: 0.15, performance: 0.25, compliance: 0.45, effort: 0.15 },
    idealCombos: [{ service: "iaas", deployment: "hybrid" }, { service: "iaas", deployment: "private" }, { service: "paas", deployment: "hybrid" }],
    saasApplicable: false,
  },
];

// --- metrics (unchanged from your current file) ---
type Metrics = { cost:number; performance:number; compliance:number; ease:number; fit:number; explain:string[]; };

function computeMetrics(
  service: ServiceModel, deployment: DeploymentModel, users:number, scenario: Scenario,
  serviceMeta:any, deploymentMeta:any, intl:any
): Metrics {
  const s = serviceMeta[service];
  const d = deploymentMeta[deployment];

  const infraCost = d.fixedInfra + (users/1000)*d.variablePerKUsers;
  const platformOpsCost = s.monthlyOpsOverhead;
  const cost = infraCost + platformOpsCost;

  const loadFactor = clamp(users/scenario.maxUsers, 0, 1);
  let perf = d.elasticity - (deployment === "private" ? loadFactor*25 : loadFactor*8);
  if (service === "paas") perf += 5;
  perf = clamp(perf, 25, 98);

  let compliance = d.baseCompliance + s.controlBonus;
  if (service === "saas" && !scenario.saasApplicable) compliance -= 10;
  compliance = clamp(compliance, 40, 98);

  let ease = clamp(100 - s.effortScore - (deployment === "hybrid" ? 6 : 0), 10, 95);

  const explain = [
    intl.formatMessage({ id: "part5.explanation.cost" }, {
      deploymentLabel: d.shortLabel, infraCost: formatMonthlyCost(infraCost, intl),
      serviceLabel: s.shortLabel, platformCost: formatMonthlyCost(platformOpsCost, intl),
    }),
    intl.formatMessage({ id: deployment==="private" ? "part5.explanation.performance.private" : "part5.explanation.performance.public" }, {
      deploymentLabel: d.label, elasticity: d.elasticity, loadPercent: Math.round(loadFactor*100), perfScore: Math.round(perf),
    }),
    intl.formatMessage({ id: "part5.explanation.compliance" }, {
      deploymentLabel: d.label, baseCompliance: d.baseCompliance, serviceLabel: s.shortLabel, controlBonus: s.controlBonus,
    }),
    intl.formatMessage({ id: deployment==="hybrid" ? "part5.explanation.effort.hybrid" : "part5.explanation.effort" }, {
      serviceLabel: s.shortLabel, effortScore: 100 - ease,
    }),
  ];

  return { cost, performance: perf, compliance, ease, fit: 0, explain };
}

function weightedFit(m:Metrics, peerCosts:number[], weights:Scenario["weights"]){
  const affordability = normalizeTo0_100(peerCosts, m.cost);
  const fit = weights.cost*affordability + weights.performance*m.performance + weights.compliance*m.compliance + weights.effort*m.ease;
  return { fit: Math.round(fit), affordability: Math.round(affordability) };
}

// --- stepper state management ---
type StepId = 'service' | 'deployment' | 'results';
type StepStatus = 'notStarted' | 'inProgress' | 'done';

interface StepState {
  status: StepStatus;
  expanded: boolean;
}

interface StepperState {
  steps: Record<StepId, StepState>;
}

type StepperAction =
  | { type: 'STEP_STARTED'; stepId: StepId }
  | { type: 'STEP_COMPLETED'; stepId: StepId }
  | { type: 'STEP_RESET' }
  | { type: 'SET_EXPANDED'; stepId: StepId; expanded: boolean };

function stepperReducer(state: StepperState, action: StepperAction): StepperState {
  switch (action.type) {
    case 'STEP_STARTED':
      return {
        ...state,
        steps: {
          ...state.steps,
          [action.stepId]: { ...state.steps[action.stepId], status: 'inProgress', expanded: true },
        },
      };
    case 'STEP_COMPLETED':
      return {
        ...state,
        steps: {
          ...state.steps,
          [action.stepId]: { ...state.steps[action.stepId], status: 'done' },
        },
      };
    case 'STEP_RESET':
      return {
        steps: {
          service: { status: 'inProgress', expanded: true },
          deployment: { status: 'notStarted', expanded: false },
          results: { status: 'notStarted', expanded: false },
        },
      };
    case 'SET_EXPANDED':
      return {
        ...state,
        steps: {
          ...state.steps,
          [action.stepId]: { ...state.steps[action.stepId], expanded: action.expanded },
        },
      };
    default:
      return state;
  }
}

const initialStepperState: StepperState = {
  steps: {
    service: { status: 'inProgress', expanded: true },
    deployment: { status: 'notStarted', expanded: false },
    results: { status: 'notStarted', expanded: false },
  },
};

// --- small presentational helpers ---
const SectionCard: React.FC<{children: React.ReactNode; className?: string; ariaLabel?: string}> = ({ children, className="", ariaLabel }) => (
  <section
    aria-label={ariaLabel}
    className={`bg-slate-900/50 rounded-xl p-5 border border-slate-700/40 shadow-xl ${className}`}
  >
    {children}
  </section>
);

const Token: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-slate-600 bg-slate-800/70 px-2.5 py-1 text-xs text-slate-200">
    {children}
  </span>
);

interface StepCardProps {
  stepNumber: number;
  title: string;
  subtitle: string;
  status: 'notStarted' | 'inProgress' | 'done';
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  stepRef?: (el: HTMLDivElement | null) => void;
}

const StepCard: React.FC<StepCardProps> = ({
  stepNumber,
  title,
  subtitle,
  status,
  expanded,
  onToggle,
  children,
  stepRef,
}) => {
  const statusColors = {
    notStarted: 'bg-slate-600 text-slate-300',
    inProgress: 'bg-cyan-500 text-white',
    done: 'bg-emerald-500 text-white',
  };

  return (
    <div
      ref={stepRef}
      className={`bg-slate-900/50 rounded-xl border shadow-xl motion-safe:transition-all ${
        expanded ? 'border-cyan-500/60' : 'border-slate-700/40'
      }`}
    >
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className={`w-full text-left p-5 flex items-center gap-4 hover:bg-slate-800/30 motion-safe:transition-colors rounded-t-xl ${
          expanded ? '' : 'rounded-b-xl'
        }`}
      >
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${statusColors[status]}`}
        >
          {status === 'done' ? '✓' : stepNumber}
        </div>
        <div className="flex-1">
          <div className="text-lg font-semibold text-white">{title}</div>
          <div className="text-sm text-slate-400">{subtitle}</div>
        </div>
        <div className="text-slate-400 text-xl">
          {expanded ? '−' : '+'}
        </div>
      </button>
      {expanded && (
        <div className="p-5 pt-0 motion-safe:animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
};

export default function Part5CloudDesigner({ onComplete }: Part5CloudDesignerProps) {
  const intl = useIntl();
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [service, setService] = useState<ServiceModel | null>(null);
  const [deployment, setDeployment] = useState<DeploymentModel | null>(null);
  const [users, setUsers] = useState(BASE_SCENARIOS[0].defaultUsers);
  const [evaluated, setEvaluated] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [showCompare, setShowCompare] = useState(false); // collapsed by default for mobile
  const [showPrimer, setShowPrimer] = useState(true);
  const [showSustainability, setShowSustainability] = useState(false); // optional environmental disclosure
  const [showTradeoffDetails, setShowTradeoffDetails] = useState(false); // collapsed trade-offs by default
  const [topRevealed, setTopRevealed] = useState(false); // blur top recommendation until user reveals it
  const liveRef = useRef<HTMLDivElement | null>(null);
  
  const [stepperState, dispatchStepper] = useReducer(stepperReducer, initialStepperState);
  const stepRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scenario = BASE_SCENARIOS[scenarioIdx];

  // service & deployment metadata (unchanged text)
  const serviceMeta = useMemo(() => ({
    iaas: {
      label: intl.formatMessage({ id: "part5.service.iaas.label" }),
      shortLabel: intl.formatMessage({ id: "part5.service.iaas.shortLabel" }),
      blurb: intl.formatMessage({ id: "part5.service.iaas.blurb" }),
      monthlyOpsOverhead: 6000, controlBonus: +8, lockInRisk: "low" as const, effortScore: 75,
    },
    paas: {
      label: intl.formatMessage({ id: "part5.service.paas.label" }),
      shortLabel: intl.formatMessage({ id: "part5.service.paas.shortLabel" }),
      blurb: intl.formatMessage({ id: "part5.service.paas.blurb" }),
      monthlyOpsOverhead: 2500, controlBonus: +2, lockInRisk: "med" as const, effortScore: 45,
    },
    saas: {
      label: intl.formatMessage({ id: "part5.service.saas.label" }),
      shortLabel: intl.formatMessage({ id: "part5.service.saas.shortLabel" }),
      blurb: intl.formatMessage({ id: "part5.service.saas.blurb" }),
      monthlyOpsOverhead: 800, controlBonus: -6, lockInRisk: "high" as const, effortScore: 20,
    },
  }), [intl]);

  const deploymentMeta = useMemo(() => ({
    public: {
      label: intl.formatMessage({ id: "part5.deployment.public.label" }),
      shortLabel: intl.formatMessage({ id: "part5.deployment.public.shortLabel" }),
      blurb: intl.formatMessage({ id: "part5.deployment.public.blurb" }),
      fixedInfra: 0, variablePerKUsers: 180, elasticity: 90, baseCompliance: 70,
    },
    private: {
      label: intl.formatMessage({ id: "part5.deployment.private.label" }),
      shortLabel: intl.formatMessage({ id: "part5.deployment.private.shortLabel" }),
      blurb: intl.formatMessage({ id: "part5.deployment.private.blurb" }),
      fixedInfra: 12000, variablePerKUsers: 60, elasticity: 55, baseCompliance: 90,
    },
    hybrid: {
      label: intl.formatMessage({ id: "part5.deployment.hybrid.label" }),
      shortLabel: intl.formatMessage({ id: "part5.deployment.hybrid.shortLabel" }),
      blurb: intl.formatMessage({ id: "part5.deployment.hybrid.blurb" }),
      fixedInfra: 4000, variablePerKUsers: 110, elasticity: 80, baseCompliance: 85,
    },
  }), [intl]);

  // Auto-expand comparison table on desktop (lg+ breakpoint = 1024px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowCompare(true);
      }
    };
    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // reset on scenario change
  useEffect(() => {
    setService(null); setDeployment(null);
    setUsers(scenario.defaultUsers);
    setEvaluated(false);
    setTopRevealed(false); // reset top recommendation blur
    // Auto-expand comparison table on desktop, collapse on mobile
    setShowCompare(window.innerWidth >= 1024);
    dispatchStepper({ type: 'STEP_RESET' });
  }, [scenarioIdx, scenario.defaultUsers]);

  // Auto-scroll to newly expanded steps
  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

    Object.entries(stepperState.steps).forEach(([stepId, stepState]) => {
      if (stepState.expanded && stepRefs.current[stepId]) {
        stepRefs.current[stepId]?.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
      }
    });
  }, [stepperState.steps]);

  // compute all combos
  const allCombos = useMemo(() => {
    const services: ServiceModel[] = ["iaas", "paas", "saas"];
    const deployments: DeploymentModel[] = ["public", "private", "hybrid"];
    const combos = services.flatMap((s) => deployments.map((d) => ({
      service: s, deployment: d, metrics: computeMetrics(s, d, users, scenario, serviceMeta, deploymentMeta, intl),
    })));
    const peerCosts = combos.map((c) => c.metrics.cost);
    const withFit = combos.map((c) => {
      const { fit } = weightedFit(c.metrics, peerCosts, scenario.weights);
      return { ...c, metrics: { ...c.metrics, fit } as Metrics };
    });
    withFit.sort((a,b) => b.metrics.fit - a.metrics.fit);
    return withFit;
  }, [users, scenario, serviceMeta, deploymentMeta, intl]);

  const selected = service && deployment ? allCombos.find(c => c.service===service && c.deployment===deployment) : null;
  const topFit = allCombos[0];

  const handleServiceSelect = (selectedService: ServiceModel) => {
    setService(selectedService);
    dispatchStepper({ type: 'STEP_COMPLETED', stepId: 'service' });
    dispatchStepper({ type: 'STEP_STARTED', stepId: 'deployment' });
  };

  const handleDeploymentSelect = (selectedDeployment: DeploymentModel) => {
    setDeployment(selectedDeployment);
    dispatchStepper({ type: 'STEP_COMPLETED', stepId: 'deployment' });
    dispatchStepper({ type: 'STEP_STARTED', stepId: 'results' });
  };

  // evaluation
  const handleEvaluate = () => {
    if (!selected) return;
    setEvaluated(true);
    const rank = allCombos.findIndex(c => c.service===selected.service && c.deployment===selected.deployment);
    const basePoints = rank===0 ? 7 : rank<=2 ? 5 : 3;
    const matchesIdeal = scenario.idealCombos.some(x => x.service===selected.service && x.deployment===selected.deployment);
    const points = basePoints + (matchesIdeal ? 1 : 0);
    setTotalScore(p => p + points);
    // announce result
    requestAnimationFrame(() => {
      liveRef.current?.focus();
    });
  };

  const handleNext = () => {
    if (scenarioIdx < BASE_SCENARIOS.length - 1) setScenarioIdx(i => i+1);
    else onComplete(totalScore);
  };

  // tiny bar component
  const Bar = ({ value, label }: { value:number; label:string }) => (
    <div className="mb-3">
      <div className="flex justify-between text-sm text-slate-300">
        <span>{label}</span>
        <span><FormattedNumber value={Math.round(value)} />/100</span>
      </div>
      <div className="h-2 w-full rounded bg-slate-700">
        <div className="h-2 rounded bg-emerald-500" style={{ width: `${clamp(value,0,100)}%` }} />
      </div>
    </div>
  );

  // feedback (unchanged logic; trimmed copy surface)
  const getFeedback = () => {
    if (!selected) return null;
    const rank = allCombos.findIndex(c => c.service===selected.service && c.deployment===selected.deployment);
    const key = rank===0 ? "part5.feedback.excellent" : rank<=2 ? "part5.feedback.solid" : "part5.feedback.reasonable";

    const helping:string[] = [], hurting:string[] = [];
    if (selected.metrics.performance >= 75) helping.push(intl.formatMessage({ id:"part5.feedback.helping.performance" })); 
    else if (selected.metrics.performance < 60) hurting.push(intl.formatMessage({ id:"part5.feedback.hurting.performance" }));
    if (selected.metrics.compliance >= 80) helping.push(intl.formatMessage({ id:"part5.feedback.helping.compliance" })); 
    else if (selected.metrics.compliance < 65) hurting.push(intl.formatMessage({ id:"part5.feedback.hurting.compliance" }));
    if (selected.metrics.ease >= 70) helping.push(intl.formatMessage({ id:"part5.feedback.helping.effort" })); 
    else if (selected.metrics.ease < 50) hurting.push(intl.formatMessage({ id:"part5.feedback.hurting.effort" }));

    return (
      <SectionCard className="border-emerald-500/20 bg-slate-900/50">
        <div tabIndex={-1} ref={liveRef} className="outline-none">
          <div className="text-white font-semibold text-lg mb-2"><FormattedMessage id={key} /></div>
          <p className="text-slate-300 mb-3">
            <FormattedMessage id="part5.feedback.details" values={{
              yourFit: selected.metrics.fit, topService: serviceMeta[topFit.service].label,
              topDeployment: deploymentMeta[topFit.deployment].label, topFit: topFit.metrics.fit,
            }}/>
          </p>
          <div className="grid md:grid-cols-2 lg:flex lg:gap-6 gap-4 text-sm">
            <div className="flex-1">
              <div className="mb-1 font-semibold text-emerald-300"><FormattedMessage id="part5.feedback.helping.label" /></div>
              <div className="text-slate-300">{helping.length ? <FormattedList type="conjunction" value={helping} /> : intl.formatMessage({ id:"part5.feedback.helping.none" })}</div>
            </div>
            <div className="flex-1">
              <div className="mb-1 font-semibold text-orange-300"><FormattedMessage id="part5.feedback.hurting.label" /></div>
              <div className="text-slate-300">{hurting.length ? <FormattedList type="conjunction" value={hurting} /> : intl.formatMessage({ id:"part5.feedback.hurting.none" })}</div>
            </div>
          </div>
        </div>
      </SectionCard>
    );
  };

  // --- UI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 pb-28 md:pb-8">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-6 md:mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4"><FormattedMessage id="part5.title" /></h1>
          {/* 4-step instructions for clarity */}
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

        {/* Scenario card spans full width */}
        <SectionCard className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-cyan-400">
              <FormattedMessage id="part5.scenario.label" values={{ current: scenarioIdx+1, total: BASE_SCENARIOS.length }}/>
            </p>
            <div className="flex flex-wrap gap-2">
              <Token><FormattedMessage id="part5.scenario.pill.users" values={{ count: users }} /></Token>
            </div>
          </div>
          {/* What matters most - High/Med/Low chips with tooltips */}
          <div className="mt-3">
            <p className="text-sm text-slate-400 mb-2"><FormattedMessage id="part5.matters.title" /></p>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'cost', weight: scenario.weights.cost },
                { key: 'perf', weight: scenario.weights.performance },
                { key: 'compliance', weight: scenario.weights.compliance },
                { key: 'effort', weight: scenario.weights.effort },
              ].map(({ key, weight }) => {
                const priority = weightToPriority(weight);
                const priorityColors = { high: 'bg-emerald-600 text-white', med: 'bg-blue-600 text-white', low: 'bg-slate-600 text-slate-200' };
                return (
                  <div key={key} className="inline-flex items-center gap-1">
                    <InfoTooltip
                      label={intl.formatMessage({ id: `part5.dim.${key}` })}
                      id={`weight-${key}`}
                    >
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
          <h2 className="mt-2 text-2xl font-bold text-white"><FormattedMessage id={scenario.titleKey} /></h2>
          <p className="mt-1 text-slate-300"><FormattedMessage id={scenario.descriptionKey} /></p>
          
          {/* Users slider - moved from separate section */}
          <div className="mt-4 pt-4 border-t border-slate-700/40">
            <div className="mb-2 text-slate-300"><FormattedMessage id="part5.scale.users" values={{ count: users }} /></div>
            <input
              type="range"
              min={scenario.minUsers}
              max={scenario.maxUsers}
              step={Math.max(100, Math.round((scenario.maxUsers - scenario.minUsers)/100))}
              value={users}
              onChange={(e)=>setUsers(Number(e.target.value))}
              aria-label={intl.formatMessage({ id:"part5.scale.users" }, { count: users })}
              className="w-full appearance-none rounded-lg bg-slate-700 accent-[#8b959e] h-2"
            />
            <div className="mt-1 flex justify-between text-xs text-slate-400">
              <span><FormattedNumber value={scenario.minUsers}/></span>
              <span><FormattedNumber value={scenario.maxUsers}/></span>
            </div>
          </div>
        </SectionCard>

        {/* Primer section - shown above step cards */}
        {showPrimer && (
          <SectionCard className="mb-6 bg-gradient-to-br from-[#750014]/15 to-[#8b959e]/15 border-[#973f4e]/30">
            <div className="flex items-start justify-between">
              <h2 className="text-base lg:text-lg font-semibold text-[#d5b2b8]"><FormattedMessage id="part5.primer.title" /></h2>
              <button onClick={() => setShowPrimer(false)} className="text-xs text-slate-400 hover:text-white motion-safe:transition">
                <FormattedMessage id="part5.primer.hide" />
              </button>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-slate-300 list-disc ml-5">
              <li><FormattedMessage id="part5.primer.point1" /></li>
              <li><FormattedMessage id="part5.primer.point2" /></li>
              <li><FormattedMessage id="part5.primer.point3" /></li>
            </ul>
          </SectionCard>
        )}

        {/* Step cards - vertical stack */}
        <div className="space-y-6">
          {/* Step 1: Service Model */}
          <StepCard
            stepNumber={1}
            title="Choose a Service Model"
            subtitle="What you buy"
            status={stepperState.steps.service.status}
            expanded={stepperState.steps.service.expanded}
            onToggle={() => dispatchStepper({ type: 'SET_EXPANDED', stepId: 'service', expanded: !stepperState.steps.service.expanded })}
            stepRef={(el) => stepRefs.current['service'] = el}
          >
            <div role="radiogroup" className="space-y-2">
                {(["iaas","paas","saas"] as ServiceModel[]).map(m => {
                  const meta = serviceMeta[m];
                  const disabled = m==="saas" && scenario.saasApplicable===false;
                  const selectedState = service === m;
                  return (
                    <button
                      key={m}
                      role="radio"
                      aria-checked={selectedState}
                      aria-disabled={disabled || undefined}
                      aria-describedby={disabled ? "saas-note" : undefined}
                      onClick={() => !disabled && handleServiceSelect(m)}
                      className={`w-full text-left rounded-lg border p-3 lg:p-4 xl:p-5 motion-safe:transition
                        ${selectedState ? "border-[#8b959e] bg-slate-800" : "border-slate-700 bg-slate-800/60 hover:bg-slate-800"}
                        ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      <div className="font-semibold text-slate-100">{meta.label}</div>
                      <div className="text-sm text-slate-400">{meta.blurb}</div>
                      <div className="mt-2 flex gap-2">
                        <Token>
                          <InfoTooltip label={intl.formatMessage({ id: "part5.service.pill.ops" }, { cost: formatMonthlyCost(meta.monthlyOpsOverhead, intl) })}>
                            <FormattedMessage id="part5.tooltip.ops" />
                          </InfoTooltip>
                        </Token>
                        <Token>
                          <InfoTooltip label={intl.formatMessage({ id: "part5.service.pill.lockin" }, { risk: intl.formatMessage({ id:`part5.risk.${meta.lockInRisk}` }) })}>
                            <FormattedMessage id="part5.tooltip.lockin" />
                          </InfoTooltip>
                        </Token>
                      </div>
                    </button>
                  );
                })}
              </div>
            {/* Explain why SaaS is disabled when it is */}
            <p id="saas-note" className="sr-only">
              <FormattedMessage id="part5.saas.disabled" />
            </p>
          </StepCard>

          {/* Step 2: Deployment Model */}
          <StepCard
            stepNumber={2}
            title="Choose a Deployment Model"
            subtitle="Where it runs"
            status={stepperState.steps.deployment.status}
            expanded={stepperState.steps.deployment.expanded}
            onToggle={() => dispatchStepper({ type: 'SET_EXPANDED', stepId: 'deployment', expanded: !stepperState.steps.deployment.expanded })}
            stepRef={(el) => stepRefs.current['deployment'] = el}
          >
            <div role="radiogroup" className="space-y-2">
                {(["public","private","hybrid"] as DeploymentModel[]).map(m => {
                  const meta = deploymentMeta[m];
                  const sel = deployment===m;
                  return (
                    <button
                      key={m} role="radio" aria-checked={sel}
                      onClick={() => handleDeploymentSelect(m)}
                      className={`w-full text-left rounded-lg border p-4 lg:p-5 xl:p-6 motion-safe:transition
                        ${sel ? "border-[#8b959e] bg-slate-800" : "border-slate-700 bg-slate-800/60 hover:bg-slate-800"}`}
                    >
                      <div className="mb-1 font-semibold text-slate-100">{meta.label}</div>
                      <div className="mb-3 text-sm text-slate-400">{meta.blurb}</div>
                      <div className="flex items-center justify-around gap-3">
                        <div className="text-center">
                          <InfoTooltip label={intl.formatMessage({ id: "part5.deployment.badge.fixed" })}>
                            <FormattedMessage id="part5.tooltip.fixed" />
                          </InfoTooltip>
                          <div className="text-lg font-bold text-cyan-300">{formatMonthlyCost(meta.fixedInfra, intl)}</div>
                        </div>
                        <div className="text-center">
                          <InfoTooltip label={`$${meta.variablePerKUsers}/1k`}>
                            <FormattedMessage id="part5.tooltip.variable" />
                          </InfoTooltip>
                          <div className="text-lg font-bold text-cyan-300">${meta.variablePerKUsers}/1k</div>
                        </div>
                        <div className="text-center">
                          <InfoTooltip label={intl.formatMessage({ id: "part5.deployment.badge.elasticity" })}>
                            <FormattedMessage id="part5.tooltip.elasticity" />
                          </InfoTooltip>
                          <div className="text-lg font-bold text-cyan-300">{meta.elasticity}/100</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
            {/* Optional sustainability disclosure */}
            <button
              onClick={() => setShowSustainability(s => !s)}
              className="mt-3 text-xs text-slate-400 hover:text-slate-200 underline motion-safe:transition"
            >
              <FormattedMessage id="part5.deployment.sustainability.learn" />
            </button>
            {showSustainability && (
              <p className="mt-2 text-xs leading-relaxed text-slate-300 bg-slate-800/40 p-3 rounded border border-slate-700/50">
                <FormattedMessage id="part5.deployment.sustainability" />
              </p>
            )}
          </StepCard>

          {/* Step 3: Results */}
          <StepCard
            stepNumber={3}
            title="See Trade-offs & Evaluate"
            subtitle="Review your design"
            status={stepperState.steps.results.status}
            expanded={stepperState.steps.results.expanded}
            onToggle={() => dispatchStepper({ type: 'SET_EXPANDED', stepId: 'results', expanded: !stepperState.steps.results.expanded })}
            stepRef={(el) => stepRefs.current['results'] = el}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="font-semibold text-white"><FormattedMessage id="part5.tradeoffs.heading" /></p>
              {/* Toggle button: mobile only (desktop always shows table) */}
              <button
                className="lg:hidden rounded border border-slate-600 px-3 py-1 text-xs text-slate-200 hover:bg-slate-800 motion-safe:transition"
                onClick={()=>setShowCompare(s=>!s)}
              >
                <FormattedMessage id={showCompare ? "part5.tradeoffs.button.hide" : "part5.tradeoffs.button.show"} />
              </button>
            </div>

              {selected ? (
                <>
                  {/* Collapsed summary */}
                  {!showTradeoffDetails && (
                    <div className="mb-4">
                      <p className="text-slate-200">
                        <FormattedMessage id="part5.tradeoffs.summary" values={{
                          service: serviceMeta[selected.service].label,
                          deployment: deploymentMeta[selected.deployment].label,
                          cost: formatMonthlyCost(selected.metrics.cost, intl),
                          score: Math.round(selected.metrics.fit),
                        }} />
                      </p>
                      <button
                        onClick={() => setShowTradeoffDetails(true)}
                        className="mt-2 text-sm text-[#8b959e] hover:text-white underline motion-safe:transition"
                      >
                        <FormattedMessage id="part5.tradeoffs.why" />
                      </button>
                    </div>
                  )}
                  
                  {/* Detailed view */}
                  {showTradeoffDetails && (
                    <div className="grid gap-6 lg:grid-cols-2 xl:gap-8">
                      {/* Your selection */}
                      <div>
                        <div className="mb-1 font-semibold text-slate-200">
                          <FormattedMessage id="part5.tradeoffs.selection.label" />{" "}
                          <span className="text-[#adb4bb]">{serviceMeta[selected.service].label}</span> +{" "}
                          <span className="text-[#d0d4d8]">{deploymentMeta[selected.deployment].label}</span>
                        </div>
                        <div className="mb-2 text-sm text-slate-400">
                          <FormattedMessage id="part5.tradeoffs.cost.label" />{" "}
                          <b className="text-[#adb4bb]">{formatMonthlyCost(selected.metrics.cost, intl)}</b>
                        </div>
                        <Bar value={selected.metrics.performance} label={intl.formatMessage({ id:"part5.tradeoffs.metric.performance" })}/>
                        <Bar value={selected.metrics.compliance} label={intl.formatMessage({ id:"part5.tradeoffs.metric.compliance" })}/>
                        <Bar value={selected.metrics.ease}        label={intl.formatMessage({ id:"part5.tradeoffs.metric.ease" })}/>
                        <div className="mt-3 text-sm text-slate-300">
                          <div className="mb-1 font-semibold"><FormattedMessage id="part5.tradeoffs.explain.heading" /></div>
                          <ul className="ml-5 list-disc space-y-1">{selected.metrics.explain.map((x,i)=><li key={i}>{x}</li>)}</ul>
                        </div>
                        <div className="mt-4 text-slate-200">
                          <FormattedMessage id="part5.tradeoffs.fit.label" />{" "}
                          <span className="text-xl font-bold text-emerald-400"><FormattedNumber value={selected.metrics.fit} />/100</span>
                        </div>
                      </div>

                      {/* Top fit - blurred until revealed */}
                      <div className="rounded-lg border border-emerald-500/30 bg-slate-800/40 p-4 relative">
                        {!topRevealed && (
                          <div className="absolute inset-0 bg-slate-800/60 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                            <button
                              onClick={() => setTopRevealed(true)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
                              aria-live="polite"
                            >
                              <FormattedMessage id="part5.top.reveal" />
                            </button>
                          </div>
                        )}
                        <div className={topRevealed ? '' : 'pointer-events-none'} aria-hidden={!topRevealed}>
                          <div className="flex items-center justify-between">
                            <div className="font-semibold text-slate-200"><FormattedMessage id="part5.top.heading" /></div>
                            <span className="rounded px-2 py-0.5 text-xs text-emerald-300 border border-emerald-700 bg-emerald-900/30">
                              <FormattedMessage id="part5.top.badge" />
                            </span>
                          </div>
                          <div className="mt-2 text-slate-200">
                            <div><span className="text-emerald-300">{serviceMeta[topFit.service].label}</span> + <span className="text-emerald-300">{deploymentMeta[topFit.deployment].label}</span></div>
                            <div className="text-sm text-slate-400">
                              <FormattedMessage id="part5.top.cost.label" /> <b className="text-cyan-300">{formatMonthlyCost(topFit.metrics.cost, intl)}</b> ·
                              <FormattedMessage id="part5.top.fit.label" />{" "}
                              <b className="text-emerald-300"><FormattedNumber value={topFit.metrics.fit} />/100</b>
                            </div>
                            <div className="mt-2">
                              <Bar value={topFit.metrics.performance} label={intl.formatMessage({ id:"part5.tradeoffs.metric.performance" })}/>
                              <Bar value={topFit.metrics.compliance} label={intl.formatMessage({ id:"part5.tradeoffs.metric.compliance" })}/>
                              <Bar value={topFit.metrics.ease}        label={intl.formatMessage({ id:"part5.tradeoffs.metric.ease" })}/>
                            </div>
                          </div>
                        </div>
                      </div>
                  </div>
                )}
                </>
              ) : (
                <p className="text-slate-300"><FormattedMessage id="part5.tradeoffs.noselection" /></p>
              )}

              {/* Mobile: Top 3 list for quick scanning */}
              {!showCompare && (
                <div className="mt-6 md:hidden">
                  <div className="mb-2 text-slate-300 font-semibold"><FormattedMessage id="part5.top3.heading" /></div>
                  <ul className="space-y-2">
                    {allCombos.slice(0,3).map((c,i)=>(
                      <li key={`${c.service}-${c.deployment}`} className="rounded-lg border border-slate-700/50 bg-slate-800/60 p-3">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-slate-200">{serviceMeta[c.service].label} · {deploymentMeta[c.deployment].label}</div>
                          <div className="text-slate-400 text-sm">#{i+1}</div>
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          <FormattedMessage id="part5.table.cost" />: {formatMonthlyCost(c.metrics.cost, intl)} · <FormattedMessage id="part5.table.fit" />: <b><FormattedNumber value={c.metrics.fit}/></b>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Full table (desktop always available; mobile behind toggle) */}
              {showCompare && (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-slate-300">
                      <tr className="text-left">
                        <th className="sticky left-0 bg-slate-900/50 py-2 pr-3 backdrop-blur-sm">#</th>
                        <th className="sticky left-8 bg-slate-900/50 py-2 pr-3 backdrop-blur-sm"><FormattedMessage id="part5.table.option" /></th>
                        <th className="py-2 pr-3"><FormattedMessage id="part5.table.cost" /></th>
                        <th className="py-2 pr-3"><FormattedMessage id="part5.table.perf" /></th>
                        <th className="py-2 pr-3"><FormattedMessage id="part5.table.compliance" /></th>
                        <th className="py-2 pr-3"><FormattedMessage id="part5.table.ease" /></th>
                        <th className="py-2 pr-3"><FormattedMessage id="part5.table.fit" /></th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-200">
                      {allCombos.map((c,i)=>(
                        <tr key={`${c.service}-${c.deployment}`} className={`border-t border-slate-700/50 ${selected && c.service===selected.service && c.deployment===selected.deployment ? "bg-slate-800/60" : ""}`}>
                          <td className="py-2 pr-3 text-slate-400">{i+1}</td>
                          <td className="py-2 pr-3">
                            <div className="font-medium">{serviceMeta[c.service].label}</div>
                            <div className="text-xs text-slate-400">{deploymentMeta[c.deployment].label}</div>
                          </td>
                          <td className="py-2 pr-3">{formatMonthlyCost(c.metrics.cost, intl)}</td>
                          <td className="py-2 pr-3"><FormattedNumber value={Math.round(c.metrics.performance)} /></td>
                          <td className="py-2 pr-3"><FormattedNumber value={Math.round(c.metrics.compliance)} /></td>
                          <td className="py-2 pr-3"><FormattedNumber value={Math.round(c.metrics.ease)} /></td>
                          <td className="py-2 pr-3 font-semibold"><FormattedNumber value={c.metrics.fit} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-2 text-xs text-slate-400"><FormattedMessage id="part5.table.note" /></div>
                </div>
              )}
          </StepCard>
        </div>

        {/* Feedback section - shown after evaluation */}
        {evaluated && getFeedback()}

        {/* Primary actions: sticky on mobile, inline right-aligned on desktop */}
        <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-7xl border-t border-slate-700/50 bg-slate-900/80 p-3 backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:mt-6">
          <div className="flex items-center justify-between lg:justify-end gap-3">
            <button
              onClick={handleEvaluate}
              disabled={!service || !deployment || evaluated}
              className={`px-6 py-3 rounded-lg font-semibold shadow-lg motion-safe:transition
                ${service && deployment && !evaluated ? "bg-gradient-to-r from-[#750014] via-[#973f4e] to-[#ba7f89] text-white hover:brightness-110"
                                                     : "cursor-not-allowed bg-slate-700 text-slate-400"}`}
            >
              <FormattedMessage id="part5.button.evaluate" />
            </button>
            <button
              onClick={handleNext}
              disabled={!evaluated}
              className={`px-6 py-3 rounded-lg font-semibold shadow-lg motion-safe:transition
                ${evaluated ? "bg-gradient-to-r from-[#750014] via-[#973f4e] to-[#ba7f89] text-white hover:brightness-110"
                            : "cursor-not-allowed bg-slate-700 text-slate-400"}`}
            >
              <FormattedMessage id={scenarioIdx < BASE_SCENARIOS.length - 1 ? "part5.button.next" : "part5.button.finish"} />
            </button>
          </div>
        </div>

        {/* Live region for screen readers */}
        <div aria-live="polite" className="sr-only">
          {evaluated && selected && intl.formatMessage(
            { id: "part5.aria.result" },
            { fit: selected.metrics.fit, cost: formatMonthlyCost(selected.metrics.cost, intl) }
          )}
        </div>

        {/* Tip */}
        <SectionCard className="mt-6 border-slate-700">
          <p className="text-sm italic text-slate-400"><FormattedMessage id="part5.tip" /></p>
        </SectionCard>
      </div>
    </div>
  );
}
