import React, { useState } from 'react';
import Introduction from './components/Introduction';
import Part1Foundations from './components/Part1Foundations';
import Part2ServiceModels from './components/Part2ServiceModels';
import Part3DeploymentModels from './components/Part3DeploymentModels';
import Summary from './components/Summary';
import ProgressBar from './components/ProgressBar';

export enum ActivityStep {
  Intro,
  Part1,
  Part2,
  Part3,
  Summary,
}

const App: React.FC = () => {
  const [step, setStep] = useState<ActivityStep>(ActivityStep.Intro);
  const [scores, setScores] = useState<Record<string, number>>({ part1: 0, part2: 0, part3: 0 });

  const totalSteps = Object.keys(ActivityStep).length / 2 - 1; // Subtract Intro

  const handleNext = (part: string, score: number) => {
    setScores(prev => ({ ...prev, [part]: score }));
    setStep(prev => prev + 1);
  };
  
  const handleStart = () => {
    setScores({ part1: 0, part2: 0, part3: 0 });
    setStep(ActivityStep.Part1);
  };

  const renderStep = () => {
    switch (step) {
      case ActivityStep.Intro:
        return <Introduction onStart={handleStart} />;
      case ActivityStep.Part1:
        return <Part1Foundations onComplete={(score) => handleNext('part1', score)} />;
      case ActivityStep.Part2:
        return <Part2ServiceModels onComplete={(score) => handleNext('part2', score)} />;
      case ActivityStep.Part3:
        return <Part3DeploymentModels onComplete={(score) => handleNext('part3', score)} />;
      case ActivityStep.Summary:
        return <Summary scores={scores} onRestart={handleStart} />;
      default:
        return <Introduction onStart={handleStart} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-700/[0.2] [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]"></div>
      <div className="w-full max-w-4xl mx-auto z-10">
        {step > ActivityStep.Intro && step < ActivityStep.Summary && (
          <ProgressBar currentStep={step} totalSteps={totalSteps} />
        )}
        <div className="mt-8">
           {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default App;