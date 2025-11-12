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

export interface ServiceExample {
  id: string;
  textKey: string;
  model: ServiceModel;
  explanationKey: string; // Explanation for the correct answer
  hintKeys: {
    // Hints for why it might not belong in other categories
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
