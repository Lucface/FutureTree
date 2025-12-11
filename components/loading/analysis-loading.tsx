'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

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
  onComplete?: () => void;
  className?: string;
}

/**
 * AnalysisLoading - The anticipation builder animation.
 *
 * Shows a multi-stage loading sequence that builds excitement
 * before revealing potentiality results. Features a thinking
 * avatar, progressive stage labels, and smooth progress.
 *
 * @example
 * <AnalysisLoading onComplete={() => setShowResults(true)} />
 */
export function AnalysisLoading({ onComplete, className }: AnalysisLoadingProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let totalElapsed = 0;
    const totalDuration = stages.reduce((sum, s) => sum + s.duration, 0);

    const interval = setInterval(() => {
      totalElapsed += 50;
      setProgress((totalElapsed / totalDuration) * 100);

      // Determine current stage
      let elapsed = 0;
      for (let i = 0; i < stages.length; i++) {
        elapsed += stages[i].duration;
        if (totalElapsed < elapsed) {
          setCurrentStage(i);
          break;
        }
      }

      if (totalElapsed >= totalDuration) {
        clearInterval(interval);
        setTimeout(() => onComplete?.(), 500);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className={cn('flex flex-col items-center justify-center min-h-[60vh]', className)}>
      {/* AI Avatar with Thinking Animation */}
      <motion.div
        className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-800 to-gray-900
                   dark:from-gray-100 dark:to-gray-200
                   flex items-center justify-center mb-8 shadow-2xl"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
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
      </motion.div>

      {/* Stage Label */}
      <AnimatePresence mode="wait">
        <motion.p
          key={stages[currentStage].id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-xl font-medium text-gray-900 dark:text-white mb-6"
        >
          {stages[currentStage].label}
        </motion.p>
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="w-80 h-1.5 bg-gray-100 dark:bg-dark-elevated rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gray-900 dark:bg-white rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Stage Indicators */}
      <div className="flex gap-3 mt-6">
        {stages.map((stage, i) => (
          <motion.div
            key={stage.id}
            className={cn(
              'w-2 h-2 rounded-full transition-colors duration-300',
              i <= currentStage
                ? 'bg-gray-900 dark:bg-white'
                : 'bg-gray-200 dark:bg-dark-muted'
            )}
            animate={i === currentStage ? { scale: [1, 1.3, 1] } : {}}
            transition={{
              duration: 0.5,
              repeat: i === currentStage ? Infinity : 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
