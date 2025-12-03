export interface TrueFalseQuestion {
  statementKey: string;
  isTrue: boolean;
  explanationKey: string;
}

export enum ServiceModel {
  IaaS = 'Infrastructure as a Service (IaaS)',
  PaaS = 'Platform as a Service (PaaS)',
  SaaS = 'Software as a Service (SaaS)',
}

export type ServiceModelKey = 'iaas' | 'paas' | 'saas';

export interface ServiceExample {
  id: string;
  textKey: string;
  model: ServiceModel;
  explanationKey: string;
  hintKeys: {
    [key in ServiceModel]?: string;
  };
}

export interface ScenarioQuestion {
  scenarioKey: string;
  options: DeploymentModel[];
  correctAnswer: number;
  explanationKey: string;
}

export enum DeploymentModel {
  Public = 'Public Cloud',
  Private = 'Private Cloud',
  Hybrid = 'Hybrid Cloud'
}

export type DeploymentModelKey = 'public' | 'private' | 'hybrid';

export type Stage = 'introduction' | 'part1' | 'part2' | 'part3' | 'part4' | 'part5' | 'summary';

export const STAGES: Stage[] = ['introduction', 'part1', 'part2', 'part3', 'part4', 'part5', 'summary'];
