import React, { useState } from 'react';
import Introduction from './components/Introduction';
import Part1Foundations from './components/Part1Foundations';
import Part2ServiceModels from './components/Part2ServiceModels';
import Part3DeploymentModels from './components/Part3DeploymentModels';
import Part4Netflix from './components/Part4Netflix';
import Part5CloudDesigner from './components/Part5CloudDesigner';
import Summary from './components/Summary';
import ProgressBar from './components/ProgressBar';
import { Stage, STAGES } from './types';

const App: React.FC = () => {
  const [currentStage, setCurrentStage] = useState<Stage>('introduction');
  const [furthestStage, setFurthestStage] = useState<Stage>('introduction');
  const [scores, setScores] = useState<Record<string, number>>({ part1: 0, part2: 0, part3: 0, part4: 0, part5: 0 });

  const getCompletedStages = (): Set<Stage> => {
    const currentIndex = STAGES.indexOf(currentStage);
    const completed = new Set<Stage>();
    for (let i = 0; i < currentIndex; i++) {
      completed.add(STAGES[i]);
    }
    return completed;
  };

  const handleNext = (part: string, score: number) => {
    setScores(prev => ({ ...prev, [part]: score }));
    
    const currentIndex = STAGES.indexOf(currentStage);
    if (currentIndex < STAGES.length - 1) {
      const nextStage = STAGES[currentIndex + 1];
      setCurrentStage(nextStage);
      
      const nextIndex = STAGES.indexOf(nextStage);
      const furthestIndex = STAGES.indexOf(furthestStage);
      if (nextIndex > furthestIndex) {
        setFurthestStage(nextStage);
      }
    }
  };
  
  const handleStart = () => {
    setScores({ part1: 0, part2: 0, part3: 0, part4: 0, part5: 0 });
    setCurrentStage('part1');
    setFurthestStage('part1');
  };

  const handleNavigate = (stage: Stage) => {
    setCurrentStage(stage);
    const stageIndex = STAGES.indexOf(stage);
    const furthestIndex = STAGES.indexOf(furthestStage);
    if (stageIndex > furthestIndex) {
      setFurthestStage(stage);
    }
  };

  const handleRestart = () => {
    setScores({ part1: 0, part2: 0, part3: 0, part4: 0, part5: 0 });
    setCurrentStage('introduction');
    setFurthestStage('introduction');
  };

  const renderStage = () => {
    switch (currentStage) {
      case 'introduction':
        return <Introduction onStart={handleStart} />;
      case 'part1':
        return <Part1Foundations onComplete={(score) => handleNext('part1', score)} />;
      case 'part2':
        return <Part2ServiceModels onComplete={(score) => handleNext('part2', score)} />;
      case 'part3':
        return <Part3DeploymentModels onComplete={(score) => handleNext('part3', score)} />;
      case 'part4':
        return <Part4Netflix onComplete={(score) => handleNext('part4', score)} />;
      case 'part5':
        return <Part5CloudDesigner onComplete={(score) => handleNext('part5', score)} />;
      case 'summary':
        return <Summary scores={scores} onRestart={handleRestart} />;
      default:
        return <Introduction onStart={handleStart} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#19020b] to-slate-900 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden pb-24 sm:pb-28">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-700/[0.2] [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]"></div>
      <div className="w-full max-w-4xl mx-auto z-10">
        <div className="mt-8">
           {renderStage()}
        </div>
      </div>
      <ProgressBar 
        currentStage={currentStage} 
        completedStages={getCompletedStages()}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default App;
