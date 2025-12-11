'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * PageTransition - Wraps page content with enter/exit animations.
 *
 * Use this at the root of each page for consistent transitions.
 *
 * @example
 * // In a page component:
 * export default function MyPage() {
 *   return (
 *     <PageTransition>
 *       <MyContent />
 *     </PageTransition>
 *   );
 * }
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface FadeTransitionProps {
  children: ReactNode;
  show?: boolean;
  className?: string;
}

/**
 * FadeTransition - Simple fade in/out for conditional content.
 *
 * @example
 * <FadeTransition show={isVisible}>
 *   <Content />
 * </FadeTransition>
 */
export function FadeTransition({ children, show = true, className }: FadeTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface SlideTransitionProps {
  children: ReactNode;
  show?: boolean;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

const slideVariants = {
  up: { initial: { y: 20 }, exit: { y: -20 } },
  down: { initial: { y: -20 }, exit: { y: 20 } },
  left: { initial: { x: 20 }, exit: { x: -20 } },
  right: { initial: { x: -20 }, exit: { x: 20 } },
};

/**
 * SlideTransition - Slide in/out with direction.
 *
 * @example
 * <SlideTransition show={isVisible} direction="left">
 *   <Panel />
 * </SlideTransition>
 */
export function SlideTransition({
  children,
  show = true,
  direction = 'up',
  className,
}: SlideTransitionProps) {
  const variant = slideVariants[direction];

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={{ opacity: 0, ...variant.initial }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, ...variant.exit }}
          transition={{
            duration: 0.3,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ScaleTransitionProps {
  children: ReactNode;
  show?: boolean;
  className?: string;
}

/**
 * ScaleTransition - Scale in/out for modals and dialogs.
 *
 * @example
 * <ScaleTransition show={isOpen}>
 *   <Modal />
 * </ScaleTransition>
 */
export function ScaleTransition({ children, show = true, className }: ScaleTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{
            duration: 0.2,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
