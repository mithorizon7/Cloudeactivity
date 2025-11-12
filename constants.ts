import { TrueFalseQuestion, ServiceModel, ServiceExample, ScenarioQuestion, DeploymentModel } from './types';

export const FOUNDATIONS_QUESTIONS: TrueFalseQuestion[] = [
  {
    statementKey: "part1.question1.statement",
    isTrue: true,
    explanationKey: "part1.question1.explanation"
  },
  {
    statementKey: "part1.question2.statement",
    isTrue: false,
    explanationKey: "part1.question2.explanation"
  }
];

export const SERVICE_MODEL_EXAMPLES: ServiceExample[] = [
    { 
        id: 'ex1', 
        textKey: 'part2.example1.text', 
        model: ServiceModel.IaaS,
        explanationKey: "part2.example1.correct",
        hintKeys: {
            [ServiceModel.PaaS]: "part2.example1.hint.paas",
            [ServiceModel.SaaS]: "part2.example1.hint.saas"
        }
    },
    { 
        id: 'ex2', 
        textKey: 'part2.example2.text', 
        model: ServiceModel.SaaS,
        explanationKey: "part2.example2.correct",
        hintKeys: {
            [ServiceModel.IaaS]: "part2.example2.hint.iaas",
            [ServiceModel.PaaS]: "part2.example2.hint.paas"
        }
    },
    { 
        id: 'ex3', 
        textKey: 'part2.example3.text', 
        model: ServiceModel.PaaS,
        explanationKey: "part2.example3.correct",
        hintKeys: {
            [ServiceModel.IaaS]: "part2.example3.hint.iaas",
            [ServiceModel.SaaS]: "part2.example3.hint.saas"
        }
    },
    { 
        id: 'ex4', 
        textKey: 'part2.example4.text', 
        model: ServiceModel.SaaS,
        explanationKey: "part2.example4.correct",
        hintKeys: {
            [ServiceModel.IaaS]: "part2.example4.hint.iaas",
            [ServiceModel.PaaS]: "part2.example4.hint.paas"
        }
    },
    { 
        id: 'ex5', 
        textKey: 'part2.example5.text', 
        model: ServiceModel.IaaS,
        explanationKey: "part2.example5.correct",
        hintKeys: {
            [ServiceModel.PaaS]: "part2.example5.hint.paas",
            [ServiceModel.SaaS]: "part2.example5.hint.saas"
        }
    },
    {
        id: 'ex6', 
        textKey: 'part2.example6.text', 
        model: ServiceModel.PaaS,
        explanationKey: "part2.example6.correct",
        hintKeys: {
            [ServiceModel.IaaS]: "part2.example6.hint.iaas",
            [ServiceModel.SaaS]: "part2.example6.hint.saas"
        }
    }
];

export const DEPLOYMENT_MODEL_QUESTIONS: ScenarioQuestion[] = [
    {
        scenarioKey: "part3.scenario1.text",
        options: [DeploymentModel.Public, DeploymentModel.Private, DeploymentModel.Hybrid],
        correctAnswer: 1,
        explanationKey: "part3.scenario1.explanation"
    },
    {
        scenarioKey: "part3.scenario2.text",
        options: [DeploymentModel.Public, DeploymentModel.Private, DeploymentModel.Hybrid],
        correctAnswer: 0,
        explanationKey: "part3.scenario2.explanation"
    },
    {
        scenarioKey: "part3.scenario3.text",
        options: [DeploymentModel.Public, DeploymentModel.Private, DeploymentModel.Hybrid],
        correctAnswer: 2,
        explanationKey: "part3.scenario3.explanation"
    }
];
