'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, ReactNode } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right';

interface ScrollRevealProps {
  children: ReactNode;
  /** Delay before animation starts (in seconds) */
  delay?: number;
  /** Direction the element animates from */
  direction?: Direction;
  /** Additional CSS classes */
  className?: string;
  /** Distance to animate from (in pixels) */
  distance?: number;
  /** Duration of the animation (in seconds) */
  duration?: number;
  /** Whether animation should only play once */
  once?: boolean;
}

/**
 * ScrollReveal - Elements animate in as they enter viewport.
 *
 * Used for landing page sections, content reveals, etc.
 *
 * @example
 * <ScrollReveal direction="up" delay={0.2}>
 *   <Card>Content that reveals on scroll</Card>
 * </ScrollReveal>
 */
export function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  className,
  distance = 40,
  duration = 0.6,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: '-100px' });

  // Custom distance support
  const offset = {
    x: direction === 'left' ? distance : direction === 'right' ? -distance : 0,
    y: direction === 'up' ? distance : direction === 'down' ? -distance : 0,
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: offset.x, y: offset.y }}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98], // Custom easing for premium feel
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
