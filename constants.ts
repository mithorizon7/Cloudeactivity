import { TrueFalseQuestion, ServiceModel, ServiceExample, ScenarioQuestion, DeploymentModel } from './types';

export const FOUNDATIONS_QUESTIONS: TrueFalseQuestion[] = [
  {
    statementKey: "part1.questions.q1_statement",
    isTrue: true,
    explanationKey: "part1.questions.q1_explanation"
  },
  {
    statementKey: "part1.questions.q2_statement",
    isTrue: false,
    explanationKey: "part1.questions.q2_explanation"
  }
];

export const SERVICE_MODEL_EXAMPLES: ServiceExample[] = [
    { 
        id: 'ex1', 
        textKey: 'part2.examples.ex1_text', 
        model: ServiceModel.IaaS,
        explanationKey: "part2.examples.ex1_explanation",
        hintKeys: {
            [ServiceModel.PaaS]: "part2.examples.ex1_hint_paas",
            [ServiceModel.SaaS]: "part2.examples.ex1_hint_saas"
        }
    },
    { 
        id: 'ex2', 
        textKey: 'part2.examples.ex2_text', 
        model: ServiceModel.SaaS,
        explanationKey: "part2.examples.ex2_explanation",
        hintKeys: {
            [ServiceModel.IaaS]: "part2.examples.ex2_hint_iaas",
            [ServiceModel.PaaS]: "part2.examples.ex2_hint_paas"
        }
    },
    { 
        id: 'ex3', 
        textKey: 'part2.examples.ex3_text', 
        model: ServiceModel.PaaS,
        explanationKey: "part2.examples.ex3_explanation",
        hintKeys: {
            [ServiceModel.IaaS]: "part2.examples.ex3_hint_iaas",
            [ServiceModel.SaaS]: "part2.examples.ex3_hint_saas"
        }
    },
    { 
        id: 'ex4', 
        textKey: 'part2.examples.ex4_text', 
        model: ServiceModel.SaaS,
        explanationKey: "part2.examples.ex4_explanation",
        hintKeys: {
            [ServiceModel.IaaS]: "part2.examples.ex4_hint_iaas",
            [ServiceModel.PaaS]: "part2.examples.ex4_hint_paas"
        }
    },
    { 
        id: 'ex5', 
        textKey: 'part2.examples.ex5_text', 
        model: ServiceModel.IaaS,
        explanationKey: "part2.examples.ex5_explanation",
        hintKeys: {
            [ServiceModel.PaaS]: "part2.examples.ex5_hint_paas",
            [ServiceModel.SaaS]: "part2.examples.ex5_hint_saas"
        }
    },
    {
        id: 'ex6', 
        textKey: 'part2.examples.ex6_text', 
        model: ServiceModel.PaaS,
        explanationKey: "part2.examples.ex6_explanation",
        hintKeys: {
            [ServiceModel.IaaS]: "part2.examples.ex6_hint_iaas",
            [ServiceModel.SaaS]: "part2.examples.ex6_hint_saas"
        }
    }
];

export const DEPLOYMENT_MODEL_QUESTIONS: ScenarioQuestion[] = [
    {
        scenarioKey: "part3.scenarios.q1_scenario",
        options: [DeploymentModel.Public, DeploymentModel.Private, DeploymentModel.Hybrid],
        correctAnswer: 1,
        explanationKey: "part3.scenarios.q1_explanation"
    },
    {
        scenarioKey: "part3.scenarios.q2_scenario",
        options: [DeploymentModel.Public, DeploymentModel.Private, DeploymentModel.Hybrid],
        correctAnswer: 0,
        explanationKey: "part3.scenarios.q2_explanation"
    },
    {
        scenarioKey: "part3.scenarios.q3_scenario",
        options: [DeploymentModel.Public, DeploymentModel.Private, DeploymentModel.Hybrid],
        correctAnswer: 2,
        explanationKey: "part3.scenarios.q3_explanation"
    }
];