import { StepperState, StepperAction } from './types';

export const initialStepperState: StepperState = {
  steps: {
    service: { status: 'inProgress', expanded: true },
    deployment: { status: 'notStarted', expanded: false },
    results: { status: 'notStarted', expanded: false },
  },
};

export function stepperReducer(state: StepperState, action: StepperAction): StepperState {
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
