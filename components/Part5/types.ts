import { ServiceModelKey, DeploymentModelKey } from '../../types';

export interface ServiceMetadata {
  label: string;
  shortLabel: string;
  blurb: string;
  monthlyOpsOverhead: number;
  controlBonus: number;
  lockInRisk: 'low' | 'med' | 'high';
  effortScore: number;
}

export interface DeploymentMetadata {
  label: string;
  shortLabel: string;
  blurb: string;
  fixedInfra: number;
  variablePerKUsers: number;
  elasticity: number;
  baseCompliance: number;
}

export type ServiceMetaMap = Record<ServiceModelKey, ServiceMetadata>;
export type DeploymentMetaMap = Record<DeploymentModelKey, DeploymentMetadata>;

export interface Scenario {
  id: number;
  titleKey: string;
  descriptionKey: string;
  minUsers: number;
  maxUsers: number;
  defaultUsers: number;
  weights: { cost: number; performance: number; compliance: number; effort: number };
  idealCombos: Array<{ service: ServiceModelKey; deployment: DeploymentModelKey }>;
  saasApplicable?: boolean;
}

export interface Metrics {
  cost: number;
  performance: number;
  compliance: number;
  ease: number;
  fit: number;
  explain: string[];
}

export type StepId = 'service' | 'deployment' | 'results';
export type StepStatus = 'notStarted' | 'inProgress' | 'done';

export interface StepState {
  status: StepStatus;
  expanded: boolean;
}

export interface StepperState {
  steps: Record<StepId, StepState>;
}

export type StepperAction =
  | { type: 'STEP_STARTED'; stepId: StepId }
  | { type: 'STEP_COMPLETED'; stepId: StepId }
  | { type: 'STEP_RESET' }
  | { type: 'SET_EXPANDED'; stepId: StepId; expanded: boolean };
