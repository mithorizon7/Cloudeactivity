import { useEffect, useMemo, useState } from "react";
import { FormattedMessage, useIntl, FormattedNumber, FormattedList } from "react-intl";

type ServiceModel = "iaas" | "paas" | "saas";
type DeploymentModel = "public" | "private" | "hybrid";

interface Part5CloudDesignerProps {
  onComplete: (score: number) => void;
}

interface Scenario {
  id: number;
  titleKey: string;
  descriptionKey: string;
  minUsers: number;
  maxUsers: number;
  defaultUsers: number;

  weights: {
    cost: number;
    performance: number;
    compliance: number;
    effort: number;
  };

  idealCombos: Array<{ service: ServiceModel; deployment: DeploymentModel }>;

  saasApplicable?: boolean;
}

const BASE_SCENARIOS: Scenario[] = [
  {
    id: 3,
    titleKey: "part5.scenario3.title",
    descriptionKey: "part5.scenario3.description",
    minUsers: 500,
    maxUsers: 10_000,
    defaultUsers: 3_000,
    weights: {
      cost: 0.30,
      performance: 0.20,
      compliance: 0.20,
      effort: 0.30,
    },
    idealCombos: [{ service: "saas", deployment: "public" }],
    saasApplicable: true,
  },
  {
    id: 1,
    titleKey: "part5.scenario1.title",
    descriptionKey: "part5.scenario1.description",
    minUsers: 1_000,
    maxUsers: 200_000,
    defaultUsers: 15_000,
    weights: {
      cost: 0.30,
      performance: 0.35,
      compliance: 0.10,
      effort: 0.25,
    },
    idealCombos: [
      { service: "paas", deployment: "public" },
      { service: "iaas", deployment: "public" },
    ],
    saasApplicable: false,
  },
  {
    id: 2,
    titleKey: "part5.scenario2.title",
    descriptionKey: "part5.scenario2.description",
    minUsers: 5_000,
    maxUsers: 100_000,
    defaultUsers: 25_000,
    weights: {
      cost: 0.15,
      performance: 0.25,
      compliance: 0.45,
      effort: 0.15,
    },
    idealCombos: [
      { service: "iaas", deployment: "hybrid" },
      { service: "iaas", deployment: "private" },
      { service: "paas", deployment: "hybrid" },
    ],
    saasApplicable: false,
  },
];

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function formatMonthlyCost(n: number, intl: any): string {
  return intl.formatMessage(
    { id: "part5.currency.monthly" },
    { amount: Math.round(n) }
  );
}

function normalizeTo0_100(values: number[], value: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (Math.abs(max - min) < 1e-6) return 50;
  return clamp(((max - value) / (max - min)) * 100, 0, 100);
}

type Metrics = {
  cost: number;
  performance: number;
  compliance: number;
  ease: number;
  fit: number;
  explain: string[];
};

function computeMetrics(
  service: ServiceModel,
  deployment: DeploymentModel,
  users: number,
  scenario: Scenario,
  serviceMeta: any,
  deploymentMeta: any,
  intl: any
): Metrics {
  const s = serviceMeta[service];
  const d = deploymentMeta[deployment];

  const infraCost = d.fixedInfra + (users / 1000) * d.variablePerKUsers;
  const platformOpsCost = s.monthlyOpsOverhead;
  const cost = infraCost + platformOpsCost;

  const loadFactor = clamp(users / scenario.maxUsers, 0, 1);
  let perf = d.elasticity - (deployment === "private" ? loadFactor * 25 : loadFactor * 8);
  if (service === "paas") perf += 5;
  perf = clamp(perf, 25, 98);

  let compliance = d.baseCompliance + s.controlBonus;
  if (service === "saas" && !scenario.saasApplicable) compliance -= 10;
  compliance = clamp(compliance, 40, 98);

  let ease = clamp(100 - s.effortScore - (deployment === "hybrid" ? 6 : 0), 10, 95);

  const explain: string[] = [
    intl.formatMessage(
      { id: "part5.explanation.cost" },
      {
        deploymentLabel: d.shortLabel,
        infraCost: formatMonthlyCost(infraCost, intl),
        serviceLabel: s.shortLabel,
        platformCost: formatMonthlyCost(platformOpsCost, intl),
      }
    ),
    intl.formatMessage(
      { id: deployment === "private" ? "part5.explanation.performance.private" : "part5.explanation.performance.public" },
      {
        deploymentLabel: d.label,
        elasticity: d.elasticity,
        loadPercent: Math.round(loadFactor * 100),
        perfScore: Math.round(perf),
      }
    ),
    intl.formatMessage(
      { id: "part5.explanation.compliance" },
      {
        deploymentLabel: d.label,
        baseCompliance: d.baseCompliance,
        serviceLabel: s.shortLabel,
        controlBonus: s.controlBonus,
      }
    ),
    intl.formatMessage(
      { id: deployment === "hybrid" ? "part5.explanation.effort.hybrid" : "part5.explanation.effort" },
      {
        serviceLabel: s.shortLabel,
        effortScore: 100 - ease,
      }
    ),
  ];

  return { cost, performance: perf, compliance, ease, fit: 0, explain };
}

function weightedFit(
  m: Metrics,
  peerCosts: number[],
  weights: Scenario["weights"]
): { fit: number; affordability: number } {
  const affordability = normalizeTo0_100(peerCosts, m.cost);
  const fit =
    weights.cost * affordability +
    weights.performance * m.performance +
    weights.compliance * m.compliance +
    weights.effort * m.ease;

  return { fit: Math.round(fit), affordability: Math.round(affordability) };
}

export default function Part5CloudDesigner({ onComplete }: Part5CloudDesignerProps) {
  const intl = useIntl();
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [service, setService] = useState<ServiceModel | null>(null);
  const [deployment, setDeployment] = useState<DeploymentModel | null>(null);
  const [users, setUsers] = useState(BASE_SCENARIOS[0].defaultUsers);
  const [evaluated, setEvaluated] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [showCompare, setShowCompare] = useState(false);
  const [showPrimer, setShowPrimer] = useState(true);

  const scenario = BASE_SCENARIOS[scenarioIdx];

  const serviceMeta = useMemo(() => ({
    iaas: {
      label: intl.formatMessage({ id: "part5.service.iaas.label" }),
      shortLabel: intl.formatMessage({ id: "part5.service.iaas.shortLabel" }),
      blurb: intl.formatMessage({ id: "part5.service.iaas.blurb" }),
      monthlyOpsOverhead: 6000,
      controlBonus: +8,
      lockInRisk: "low" as const,
      effortScore: 75,
    },
    paas: {
      label: intl.formatMessage({ id: "part5.service.paas.label" }),
      shortLabel: intl.formatMessage({ id: "part5.service.paas.shortLabel" }),
      blurb: intl.formatMessage({ id: "part5.service.paas.blurb" }),
      monthlyOpsOverhead: 2500,
      controlBonus: +2,
      lockInRisk: "med" as const,
      effortScore: 45,
    },
    saas: {
      label: intl.formatMessage({ id: "part5.service.saas.label" }),
      shortLabel: intl.formatMessage({ id: "part5.service.saas.shortLabel" }),
      blurb: intl.formatMessage({ id: "part5.service.saas.blurb" }),
      monthlyOpsOverhead: 800,
      controlBonus: -6,
      lockInRisk: "high" as const,
      effortScore: 20,
    },
  }), [intl]);

  const deploymentMeta = useMemo(() => ({
    public: {
      label: intl.formatMessage({ id: "part5.deployment.public.label" }),
      shortLabel: intl.formatMessage({ id: "part5.deployment.public.shortLabel" }),
      blurb: intl.formatMessage({ id: "part5.deployment.public.blurb" }),
      fixedInfra: 0,
      variablePerKUsers: 180,
      elasticity: 90,
      baseCompliance: 70,
    },
    private: {
      label: intl.formatMessage({ id: "part5.deployment.private.label" }),
      shortLabel: intl.formatMessage({ id: "part5.deployment.private.shortLabel" }),
      blurb: intl.formatMessage({ id: "part5.deployment.private.blurb" }),
      fixedInfra: 12000,
      variablePerKUsers: 60,
      elasticity: 55,
      baseCompliance: 90,
    },
    hybrid: {
      label: intl.formatMessage({ id: "part5.deployment.hybrid.label" }),
      shortLabel: intl.formatMessage({ id: "part5.deployment.hybrid.shortLabel" }),
      blurb: intl.formatMessage({ id: "part5.deployment.hybrid.blurb" }),
      fixedInfra: 4000,
      variablePerKUsers: 110,
      elasticity: 80,
      baseCompliance: 85,
    },
  }), [intl]);

  useEffect(() => {
    setService(null);
    setDeployment(null);
    setUsers(scenario.defaultUsers);
    setEvaluated(false);
    setShowCompare(false);
  }, [scenarioIdx, scenario.defaultUsers]);

  const allCombos = useMemo(() => {
    const services: ServiceModel[] = ["iaas", "paas", "saas"];
    const deployments: DeploymentModel[] = ["public", "private", "hybrid"];

    const combos = services.flatMap((s) =>
      deployments.map((d) => ({
        service: s,
        deployment: d,
        metrics: computeMetrics(s, d, users, scenario, serviceMeta, deploymentMeta, intl),
      }))
    );

    const peerCosts = combos.map((c) => c.metrics.cost);
    const withFit = combos.map((c) => {
      const { fit, affordability } = weightedFit(c.metrics, peerCosts, scenario.weights);
      return { ...c, metrics: { ...c.metrics, fit, explain: c.metrics.explain } as Metrics, affordability };
    });

    withFit.sort((a, b) => b.metrics.fit - a.metrics.fit);
    return withFit;
  }, [users, scenario, serviceMeta, deploymentMeta, intl]);

  const selected =
    service && deployment
      ? allCombos.find((c) => c.service === service && c.deployment === deployment)
      : null;

  const topFit = allCombos[0];

  const handleEvaluate = () => {
    if (!selected) return;
    setEvaluated(true);

    const rank = allCombos.findIndex(
      (c) => c.service === selected.service && c.deployment === selected.deployment
    );
    const basePoints = rank === 0 ? 7 : rank <= 2 ? 5 : 3;

    const matchesIdeal = scenario.idealCombos.some(
      (x) => x.service === selected.service && x.deployment === selected.deployment
    );
    const points = basePoints + (matchesIdeal ? 1 : 0);

    setTotalScore((p) => p + points);
  };

  const handleNext = () => {
    if (scenarioIdx < BASE_SCENARIOS.length - 1) {
      setScenarioIdx((i) => i + 1);
    } else {
      onComplete(totalScore);
    }
  };

  const Bar = ({ value, label }: { value: number; label: string }) => (
    <div className="mb-3">
      <div className="flex justify-between text-sm text-slate-300">
        <span>{label}</span>
        <span>
          <FormattedNumber value={Math.round(value)} />/100
        </span>
      </div>
      <div className="w-full h-2 bg-slate-700 rounded">
        <div className="h-2 rounded bg-[#22c55e]" style={{ width: `${clamp(value, 0, 100)}%` }} />
      </div>
    </div>
  );

  const Pill = ({ text }: { text: string }) => (
    <span className="text-xs bg-slate-700 text-slate-200 px-2 py-1 rounded-full border border-slate-600">{text}</span>
  );

  const getFeedback = () => {
    if (!selected) return null;
    
    const rank = allCombos.findIndex(
      (c) => c.service === selected.service && c.deployment === selected.deployment
    );

    let feedbackKey: string;
    if (rank === 0) {
      feedbackKey = "part5.feedback.excellent";
    } else if (rank <= 2) {
      feedbackKey = "part5.feedback.solid";
    } else {
      feedbackKey = "part5.feedback.reasonable";
    }

    const helping: string[] = [];
    const hurting: string[] = [];

    if (selected.metrics.performance >= 75) {
      helping.push(intl.formatMessage({ id: "part5.feedback.helping.performance" }));
    } else if (selected.metrics.performance < 60) {
      hurting.push(intl.formatMessage({ id: "part5.feedback.hurting.performance" }));
    }

    if (selected.metrics.compliance >= 80) {
      helping.push(intl.formatMessage({ id: "part5.feedback.helping.compliance" }));
    } else if (selected.metrics.compliance < 65) {
      hurting.push(intl.formatMessage({ id: "part5.feedback.hurting.compliance" }));
    }

    if (selected.metrics.ease >= 70) {
      helping.push(intl.formatMessage({ id: "part5.feedback.helping.effort" }));
    } else if (selected.metrics.ease < 50) {
      hurting.push(intl.formatMessage({ id: "part5.feedback.hurting.effort" }));
    }

    return (
      <div className="bg-slate-900/50 rounded-xl p-5 mb-4 border border-[#973f4e]/30">
        <div className="text-white font-semibold text-lg mb-2">
          <FormattedMessage id={feedbackKey} />
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
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-emerald-300 font-semibold mb-1">
              <FormattedMessage id="part5.feedback.helping.label" />
            </div>
            <div className="text-slate-300">
              {helping.length > 0 ? <FormattedList type="conjunction" value={helping} /> : intl.formatMessage({ id: "part5.feedback.helping.none" })}
            </div>
          </div>
          <div>
            <div className="text-orange-300 font-semibold mb-1">
              <FormattedMessage id="part5.feedback.hurting.label" />
            </div>
            <div className="text-slate-300">
              {hurting.length > 0 ? <FormattedList type="conjunction" value={hurting} /> : intl.formatMessage({ id: "part5.feedback.hurting.none" })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-start justify-center p-4 pt-8 pb-56 overflow-y-auto">
      <div className="max-w-6xl w-full bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-2xl border border-indigo-500/20 my-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-2">
          <FormattedMessage id="part5.title" />
        </h1>
        <p className="text-slate-300 text-center mb-6">
          <FormattedMessage id="part5.description" />
        </p>

        {showPrimer && (
          <div className="bg-gradient-to-br from-[#750014]/20 to-[#8b959e]/20 backdrop-blur-sm rounded-xl p-5 mb-6 border border-[#973f4e]/30">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-[#d5b2b8]">
                <FormattedMessage id="part5.primer.title" />
              </h2>
              <button
                onClick={() => setShowPrimer(false)}
                className="text-xs text-slate-400 hover:text-white transition"
              >
                <FormattedMessage id="part5.primer.hide" />
              </button>
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-[#ba7f89] mt-0.5">•</span>
                <FormattedMessage id="part5.primer.point1" />
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#ba7f89] mt-0.5">•</span>
                <FormattedMessage id="part5.primer.point2" />
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#ba7f89] mt-0.5">•</span>
                <FormattedMessage id="part5.primer.point3" />
              </li>
            </ul>
          </div>
        )}

        <div className="bg-slate-900/50 rounded-xl p-5 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <p className="text-cyan-400 font-semibold">
              <FormattedMessage
                id="part5.scenario.label"
                values={{
                  current: scenarioIdx + 1,
                  total: BASE_SCENARIOS.length,
                }}
              />
            </p>
            <div className="flex gap-2">
              <Pill
                text={intl.formatMessage(
                  { id: "part5.scenario.pill.users" },
                  { count: users }
                )}
              />
              <Pill
                text={intl.formatMessage(
                  { id: "part5.scenario.pill.weights" },
                  {
                    cost: Math.round(scenario.weights.cost * 100),
                    perf: Math.round(scenario.weights.performance * 100),
                    compliance: Math.round(scenario.weights.compliance * 100),
                    effort: Math.round(scenario.weights.effort * 100),
                  }
                )}
              />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">
            <FormattedMessage id={scenario.titleKey} />
          </h2>
          <p className="text-slate-300">
            <FormattedMessage id={scenario.descriptionKey} />
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-slate-900/50 rounded-xl p-5">
            <p className="text-white font-semibold mb-3">
              <FormattedMessage id="part5.service.heading" />
            </p>
            {(["iaas", "paas", "saas"] as ServiceModel[]).map((m) => {
              const meta = serviceMeta[m];
              const disabled = m === "saas" && scenario.saasApplicable === false;
              return (
                <button
                  key={m}
                  disabled={disabled}
                  onClick={() => setService(m)}
                  className={`w-full text-start p-3 rounded-lg mb-2 border transition
                    ${service === m ? "border-[#8b959e] bg-slate-800" : "border-slate-700 bg-slate-800/60 hover:bg-slate-800"}
                    ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  aria-pressed={service === m}
                  aria-label={meta.label}
                >
                  <div className="text-slate-100 font-semibold">{meta.label}</div>
                  <div className="text-slate-400 text-sm">{meta.blurb}</div>
                  <div className="flex gap-2 mt-2">
                    <Pill
                      text={intl.formatMessage(
                        { id: "part5.service.pill.ops" },
                        { cost: formatMonthlyCost(meta.monthlyOpsOverhead, intl) }
                      )}
                    />
                    <Pill
                      text={intl.formatMessage(
                        { id: "part5.service.pill.lockin" },
                        { risk: intl.formatMessage({ id: `part5.risk.${meta.lockInRisk}` }) }
                      )}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="bg-slate-900/50 rounded-xl p-5">
            <p className="text-white font-semibold mb-2">
              <FormattedMessage id="part5.deployment.heading" />
            </p>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              <FormattedMessage id="part5.deployment.sustainability" />
            </p>
            {(["public", "private", "hybrid"] as DeploymentModel[]).map((m) => {
              const meta = deploymentMeta[m];
              return (
                <button
                  key={m}
                  onClick={() => setDeployment(m)}
                  className={`w-full text-start p-3 rounded-lg mb-2 border transition
                    ${deployment === m ? "border-[#8b959e] bg-slate-800" : "border-slate-700 bg-slate-800/60 hover:bg-slate-800"}`}
                  aria-pressed={deployment === m}
                  aria-label={meta.label}
                >
                  <div className="text-slate-100 font-semibold">{meta.label}</div>
                  <div className="text-slate-400 text-sm">{meta.blurb}</div>
                  <div className="flex gap-2 mt-2">
                    <Pill
                      text={intl.formatMessage(
                        { id: "part5.deployment.pill.fixed" },
                        { cost: formatMonthlyCost(meta.fixedInfra, intl) }
                      )}
                    />
                    <Pill
                      text={intl.formatMessage(
                        { id: "part5.deployment.pill.variable" },
                        { cost: meta.variablePerKUsers }
                      )}
                    />
                    <Pill
                      text={intl.formatMessage(
                        { id: "part5.deployment.pill.elasticity" },
                        { score: meta.elasticity }
                      )}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="bg-slate-900/50 rounded-xl p-5">
            <p className="text-white font-semibold mb-3">
              <FormattedMessage id="part5.scale.heading" />
            </p>
            <div className="text-slate-300 mb-2">
              <FormattedMessage id="part5.scale.users" values={{ count: users }} />
            </div>
            <input
              type="range"
              min={scenario.minUsers}
              max={scenario.maxUsers}
              step={Math.max(100, Math.round((scenario.maxUsers - scenario.minUsers) / 100))}
              value={users}
              onChange={(e) => setUsers(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none accent-[#8b959e]"
              aria-label={intl.formatMessage({ id: "part5.scale.users" }, { count: users })}
            />
            <div className="flex justify-between text-slate-400 text-xs mt-1">
              <span>
                <FormattedNumber value={scenario.minUsers} />
              </span>
              <span>
                <FormattedNumber value={scenario.maxUsers} />
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <p className="text-white font-semibold">
              <FormattedMessage id="part5.tradeoffs.heading" />
            </p>
            <button
              className="text-xs px-3 py-1 rounded border border-slate-600 text-slate-200 hover:bg-slate-800"
              onClick={() => setShowCompare((s) => !s)}
            >
              <FormattedMessage id={showCompare ? "part5.tradeoffs.button.hide" : "part5.tradeoffs.button.show"} />
            </button>
          </div>

          {selected ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-slate-200 font-semibold mb-1">
                  <FormattedMessage id="part5.tradeoffs.selection.label" />{" "}
                  <span className="text-[#adb4bb]">{serviceMeta[selected.service].label}</span> +{" "}
                  <span className="text-[#d0d4d8]">{deploymentMeta[selected.deployment].label}</span>
                </div>
                <div className="text-slate-400 text-sm mb-2">
                  <FormattedMessage id="part5.tradeoffs.cost.label" />{" "}
                  <b className="text-[#adb4bb]">{formatMonthlyCost(selected.metrics.cost, intl)}</b>
                </div>
                <Bar
                  value={selected.metrics.performance}
                  label={intl.formatMessage({ id: "part5.tradeoffs.metric.performance" })}
                />
                <Bar
                  value={selected.metrics.compliance}
                  label={intl.formatMessage({ id: "part5.tradeoffs.metric.compliance" })}
                />
                <Bar
                  value={selected.metrics.ease}
                  label={intl.formatMessage({ id: "part5.tradeoffs.metric.ease" })}
                />

                <div className="mt-3 text-slate-300 text-sm">
                  <div className="font-semibold mb-1">
                    <FormattedMessage id="part5.tradeoffs.explain.heading" />
                  </div>
                  <ul className="list-disc ml-5 space-y-1">
                    {selected.metrics.explain.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 text-slate-200">
                  <FormattedMessage id="part5.tradeoffs.fit.label" />{" "}
                  <span className="text-xl font-bold text-emerald-400">
                    <FormattedNumber value={selected.metrics.fit} />/100
                  </span>
                </div>
              </div>

              <div className="bg-slate-800/40 rounded-lg p-4 border border-emerald-500/30">
                <div className="flex items-center justify-between">
                  <div className="text-slate-200 font-semibold">
                    <FormattedMessage id="part5.top.heading" />
                  </div>
                  <span className="text-xs text-emerald-300 bg-emerald-900/30 border border-emerald-700 px-2 py-0.5 rounded">
                    <FormattedMessage id="part5.top.badge" />
                  </span>
                </div>
                <div className="mt-2 text-slate-200">
                  <div>
                    <span className="text-emerald-300">{serviceMeta[topFit.service].label}</span> +{" "}
                    <span className="text-emerald-300">{deploymentMeta[topFit.deployment].label}</span>
                  </div>
                  <div className="text-slate-400 text-sm">
                    <FormattedMessage id="part5.top.cost.label" />{" "}
                    <b className="text-cyan-300">{formatMonthlyCost(topFit.metrics.cost, intl)}</b> ·{" "}
                    <FormattedMessage id="part5.top.fit.label" />{" "}
                    <b className="text-emerald-300">
                      <FormattedNumber value={topFit.metrics.fit} />/100
                    </b>
                  </div>
                  <div className="mt-2">
                    <Bar
                      value={topFit.metrics.performance}
                      label={intl.formatMessage({ id: "part5.tradeoffs.metric.performance" })}
                    />
                    <Bar
                      value={topFit.metrics.compliance}
                      label={intl.formatMessage({ id: "part5.tradeoffs.metric.compliance" })}
                    />
                    <Bar
                      value={topFit.metrics.ease}
                      label={intl.formatMessage({ id: "part5.tradeoffs.metric.ease" })}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-300">
              <FormattedMessage id="part5.tradeoffs.noselection" />
            </p>
          )}

          {showCompare && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-300">
                  <tr className="text-left">
                    <th className="py-2 pr-3">
                      <FormattedMessage id="part5.table.rank" />
                    </th>
                    <th className="py-2 pr-3">
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
                  {allCombos.map((c, i) => (
                    <tr
                      key={`${c.service}-${c.deployment}`}
                      className={`border-t border-slate-700/50 ${selected && c.service === selected.service && c.deployment === selected.deployment ? "bg-slate-800/60" : ""}`}
                    >
                      <td className="py-2 pr-3 text-slate-400">{i + 1}</td>
                      <td className="py-2 pr-3">
                        <div className="font-medium">{serviceMeta[c.service].label}</div>
                        <div className="text-slate-400 text-xs">{deploymentMeta[c.deployment].label}</div>
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
                  ))}
                </tbody>
              </table>
              <div className="text-xs text-slate-400 mt-2">
                <FormattedMessage id="part5.table.note" />
              </div>
            </div>
          )}
        </div>

        {evaluated && getFeedback()}

        <div className="flex justify-between items-center gap-4">
          <button
            onClick={handleEvaluate}
            disabled={!service || !deployment || evaluated}
            className={`px-6 py-3 rounded-lg font-semibold transition shadow-lg ${
              service && deployment && !evaluated
                ? "bg-gradient-to-r from-[#750014] via-[#973f4e] to-[#ba7f89] text-white hover:brightness-110 shadow-[#750014]/45"
                : "bg-slate-700 text-slate-400 cursor-not-allowed"
            }`}
          >
            <FormattedMessage id="part5.button.evaluate" />
          </button>

          <button
            onClick={handleNext}
            disabled={!evaluated}
            className={`px-6 py-3 rounded-lg font-semibold transition shadow-lg ${
              evaluated
                ? "bg-gradient-to-r from-[#750014] via-[#973f4e] to-[#ba7f89] text-white hover:brightness-110 shadow-[#750014]/45"
                : "bg-slate-700 text-slate-400 cursor-not-allowed"
            }`}
          >
            <FormattedMessage
              id={scenarioIdx < BASE_SCENARIOS.length - 1 ? "part5.button.next" : "part5.button.finish"}
            />
          </button>
        </div>

        <div className="mt-6 p-4 bg-slate-900/30 rounded-lg border border-slate-700">
          <p className="text-slate-400 text-sm italic">
            <FormattedMessage id="part5.tip" />
          </p>
        </div>
      </div>
    </div>
  );
}
