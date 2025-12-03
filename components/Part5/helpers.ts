import { IntlShape } from 'react-intl';
import { ServiceModelKey, DeploymentModelKey } from '../../types';
import { Scenario, Metrics, ServiceMetaMap, DeploymentMetaMap } from './types';

export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export function normalizeTo0_100(vals: number[], v: number): number {
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  if (Math.abs(max - min) < 1e-6) return 50;
  return clamp(((max - v) / (max - min)) * 100, 0, 100);
}

export function formatMonthlyCost(n: number, intl: IntlShape): string {
  return intl.formatMessage({ id: 'part5.currency.monthly' }, { amount: Math.round(n) });
}

export function weightToPriority(weight: number): 'high' | 'med' | 'low' {
  if (weight >= 0.30) return 'high';
  if (weight >= 0.15) return 'med';
  return 'low';
}

export function computeMetrics(
  service: ServiceModelKey,
  deployment: DeploymentModelKey,
  users: number,
  scenario: Scenario,
  serviceMeta: ServiceMetaMap,
  deploymentMeta: DeploymentMetaMap,
  intl: IntlShape
): Metrics {
  const s = serviceMeta[service];
  const d = deploymentMeta[deployment];

  const infraCost = d.fixedInfra + (users / 1000) * d.variablePerKUsers;
  const platformOpsCost = s.monthlyOpsOverhead;
  const cost = infraCost + platformOpsCost;

  const loadFactor = clamp(users / scenario.maxUsers, 0, 1);
  let perf = d.elasticity - (deployment === 'private' ? loadFactor * 25 : loadFactor * 8);
  if (service === 'paas') perf += 5;
  perf = clamp(perf, 25, 98);

  let compliance = d.baseCompliance + s.controlBonus;
  if (service === 'saas' && !scenario.saasApplicable) compliance -= 10;
  compliance = clamp(compliance, 40, 98);

  const ease = clamp(100 - s.effortScore - (deployment === 'hybrid' ? 6 : 0), 10, 95);

  const explain = [
    intl.formatMessage(
      { id: 'part5.explanation.cost' },
      {
        deploymentLabel: d.shortLabel,
        infraCost: formatMonthlyCost(infraCost, intl),
        serviceLabel: s.shortLabel,
        platformCost: formatMonthlyCost(platformOpsCost, intl),
      }
    ),
    intl.formatMessage(
      {
        id:
          deployment === 'private'
            ? 'part5.explanation.performance.private'
            : 'part5.explanation.performance.public',
      },
      {
        deploymentLabel: d.label,
        elasticity: d.elasticity,
        loadPercent: Math.round(loadFactor * 100),
        perfScore: Math.round(perf),
      }
    ),
    intl.formatMessage(
      { id: 'part5.explanation.compliance' },
      {
        deploymentLabel: d.label,
        baseCompliance: d.baseCompliance,
        serviceLabel: s.shortLabel,
        controlBonus: s.controlBonus,
      }
    ),
    intl.formatMessage(
      {
        id: deployment === 'hybrid' ? 'part5.explanation.effort.hybrid' : 'part5.explanation.effort',
      },
      {
        serviceLabel: s.shortLabel,
        effortScore: 100 - ease,
      }
    ),
  ];

  return { cost, performance: perf, compliance, ease, fit: 0, explain };
}

export function weightedFit(
  m: Metrics,
  peerCosts: number[],
  weights: Scenario['weights']
): { fit: number; affordability: number } {
  const affordability = normalizeTo0_100(peerCosts, m.cost);
  const fit =
    weights.cost * affordability +
    weights.performance * m.performance +
    weights.compliance * m.compliance +
    weights.effort * m.ease;
  return { fit: Math.round(fit), affordability: Math.round(affordability) };
}
