'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';

interface AnalysisStage {
  id: string;
  label: string;
  duration: number; // ms
}

const stages: AnalysisStage[] = [
  { id: 'profile', label: 'Building your profile...', duration: 1500 },
  { id: 'matching', label: 'Matching case studies...', duration: 2000 },
  { id: 'analyzing', label: 'Analyzing 700+ transformations...', duration: 2500 },
  { id: 'patterns', label: 'Identifying success patterns...', duration: 1500 },
  { id: 'calculating', label: 'Calculating probabilities...', duration: 1000 },
];

interface AnalysisLoadingProps {
  /** Callback when analysis is complete */
  onComplete: () => void;
  /** Optional custom stages */
  customStages?: AnalysisStage[];
  /** Whether to auto-start the analysis */
  autoStart?: boolean;
}

/**
 * AnalysisLoading - The anticipation builder before the big reveal.
 *
 * Features:
 * - AI avatar with thinking dots animation
 * - Staged progress labels that crossfade
 * - Smooth progress bar
 * - Stage indicators
 *
 * @example
 * <AnalysisLoading onComplete={() => router.push('/potentiality')} />
 */
export function AnalysisLoading({
  onComplete,
  customStages,
  autoStart = true,
}: AnalysisLoadingProps) {
  const analysisStages = customStages || stages;
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const totalDuration = analysisStages.reduce((sum, s) => sum + s.duration, 0);

  const handleComplete = useCallback(() => {
    setIsComplete(true);
    // Small delay before calling onComplete for the completion animation
    setTimeout(onComplete, 500);
  }, [onComplete]);

  useEffect(() => {
    if (!autoStart) return;

    let totalElapsed = 0;

    const interval = setInterval(() => {
      totalElapsed += 50;
      setProgress((totalElapsed / totalDuration) * 100);

      // Determine current stage
      let elapsed = 0;
      for (let i = 0; i < analysisStages.length; i++) {
        elapsed += analysisStages[i].duration;
        if (totalElapsed < elapsed) {
          setCurrentStage(i);
          break;
        }
      }

      if (totalElapsed >= totalDuration) {
        clearInterval(interval);
        handleComplete();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [autoStart, totalDuration, analysisStages, handleComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* AI Avatar with Thinking Animation */}
      <motion.div
        className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-800 to-gray-900
                   dark:from-gray-100 dark:to-gray-200
                   flex items-center justify-center mb-8 shadow-2xl"
        animate={isComplete ? { scale: [1, 1.1, 1] } : { scale: [1, 1.05, 1] }}
        transition={{ duration: isComplete ? 0.3 : 2, repeat: isComplete ? 0 : Infinity }}
      >
        {isComplete ? (
          <motion.svg
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-10 h-10 text-white dark:text-gray-900"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3 }}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </motion.svg>
        ) : (
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-white dark:bg-gray-900 rounded-full"
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Stage Label */}
      <div className="h-8 mb-6">
        <AnimatePresence mode="wait">
          <motion.p
            key={isComplete ? 'complete' : analysisStages[currentStage].id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="text-xl font-medium text-gray-900 dark:text-white text-center"
          >
            {isComplete ? 'Analysis complete!' : analysisStages[currentStage].label}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="w-80 max-w-full h-1.5 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gray-900 dark:bg-white rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Stage Indicators */}
      <div className="flex gap-3 mt-6">
        {analysisStages.map((stage, i) => (
          <motion.div
            key={stage.id}
            className={`w-2 h-2 rounded-full transition-colors duration-300
              ${i <= currentStage || isComplete
                ? 'bg-gray-900 dark:bg-white'
                : 'bg-gray-200 dark:bg-dark-muted'}`}
            animate={i === currentStage && !isComplete ? { scale: [1, 1.3, 1] } : {}}
            transition={{
              duration: 0.5,
              repeat: i === currentStage && !isComplete ? Infinity : 0,
            }}
          />
        ))}
      </div>

      {/* Subtle supporting text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 text-sm text-gray-500 dark:text-gray-400 text-center"
      >
        Finding businesses similar to yours...
      </motion.p>
    </div>
  );
}
