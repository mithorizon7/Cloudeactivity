import { Scenario } from './types';

export const BASE_SCENARIOS: Scenario[] = [
  {
    id: 3,
    titleKey: 'part5.scenario3.title',
    descriptionKey: 'part5.scenario3.description',
    minUsers: 500,
    maxUsers: 10_000,
    defaultUsers: 3_000,
    weights: { cost: 0.3, performance: 0.2, compliance: 0.2, effort: 0.3 },
    idealCombos: [{ service: 'saas', deployment: 'public' }],
    saasApplicable: true,
  },
  {
    id: 1,
    titleKey: 'part5.scenario1.title',
    descriptionKey: 'part5.scenario1.description',
    minUsers: 1_000,
    maxUsers: 200_000,
    defaultUsers: 15_000,
    weights: { cost: 0.3, performance: 0.35, compliance: 0.1, effort: 0.25 },
    idealCombos: [
      { service: 'paas', deployment: 'public' },
      { service: 'iaas', deployment: 'public' },
    ],
    saasApplicable: false,
  },
  {
    id: 2,
    titleKey: 'part5.scenario2.title',
    descriptionKey: 'part5.scenario2.description',
    minUsers: 5_000,
    maxUsers: 100_000,
    defaultUsers: 25_000,
    weights: { cost: 0.15, performance: 0.25, compliance: 0.45, effort: 0.15 },
    idealCombos: [
      { service: 'iaas', deployment: 'hybrid' },
      { service: 'iaas', deployment: 'private' },
      { service: 'paas', deployment: 'hybrid' },
    ],
    saasApplicable: false,
  },
];
