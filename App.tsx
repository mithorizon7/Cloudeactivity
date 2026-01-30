import React, { useEffect, useState, Suspense, lazy } from 'react';
import Introduction from './components/Introduction';
import ProgressBar from './components/ProgressBar';
import LanguageSwitcher from './components/LanguageSwitcher';
import { Stage, STAGES } from './types';
import { useIntl } from './i18n';

const Part1Foundations = lazy(() => import('./components/Part1Foundations'));
const Part2ServiceModels = lazy(() => import('./components/Part2ServiceModels'));
const Part3DeploymentModels = lazy(() => import('./components/Part3DeploymentModels'));
const Part4Netflix = lazy(() => import('./components/Part4Netflix'));
const Part5CloudDesigner = lazy(() => import('./components/Part5CloudDesigner'));
const Summary = lazy(() => import('./components/Summary'));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="w-8 h-8 border-4 border-slate-600 border-t-[#973f4e] rounded-full animate-spin" />
  </div>
);

const App: React.FC = () => {
  const intl = useIntl();
  const [currentStage, setCurrentStage] = useState<Stage>('introduction');
  const [furthestStage, setFurthestStage] = useState<Stage>('introduction');
  const [scores, setScores] = useState<Record<string, number>>({
    part1: 0,
    part2: 0,
    part3: 0,
    part4: 0,
    part5: 0,
  });
  const [actionBar, setActionBar] = useState<React.ReactNode>(null);
  const [completedStages, setCompletedStages] = useState<Set<Stage>>(new Set());

  const handleNext = (part: Stage, score: number) => {
    setScores((prev) => ({ ...prev, [part]: score }));
    setCompletedStages((prev) => {
      const next = new Set(prev);
      next.add(part);
      return next;
    });

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
    setCompletedStages(new Set<Stage>(['introduction']));
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
    setCompletedStages(new Set());
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
        return (
          <Part5CloudDesigner
            onComplete={(score) => handleNext('part5', score)}
            setActionBar={setActionBar}
          />
        );
      case 'summary':
        return <Summary scores={scores} onRestart={handleRestart} />;
      default:
        return <Introduction onStart={handleStart} />;
    }
  };

  useEffect(() => {
    document.title = intl.formatMessage({ id: 'app.title' });
  }, [intl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#19020b] to-slate-900 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden pb-24 sm:pb-28">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-700/[0.2] [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]"></div>
      <div className="fixed top-4 right-4 z-50 pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)]">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-4xl mx-auto z-10">
        <div className="mt-8 sm:mt-10">
          <Suspense fallback={<LoadingSpinner />}>{renderStage()}</Suspense>
        </div>
      </div>
      <ProgressBar
        currentStage={currentStage}
        completedStages={completedStages}
        onNavigate={handleNavigate}
        actionBar={actionBar}
      />
    </div>
  );
};

export default App;
