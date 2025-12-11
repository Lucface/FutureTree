'use client';

import { motion, Variants } from 'framer-motion';

interface BlurRevealTextProps {
  /** The text to animate */
  text: string;
  /** Additional CSS classes */
  className?: string;
  /** Delay before animation starts (in seconds) */
  delay?: number;
  /** Whether to animate as the element comes into view */
  animateOnView?: boolean;
  /** HTML tag to render (defaults to h1) */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (delay: number) => ({
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: delay,
    },
  }),
};

const wordVariants: Variants = {
  hidden: {
    opacity: 0,
    filter: 'blur(10px)',
    y: 20,
  },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

/**
 * BlurRevealText - Words that unblur as they appear.
 *
 * Used for hero headlines on the landing page.
 * Creates a premium, cinematic reveal effect.
 *
 * @example
 * <BlurRevealText
 *   text="Discover where your business could go"
 *   className="text-5xl md:text-7xl font-bold tracking-tight"
 * />
 */
export function BlurRevealText({
  text,
  className,
  delay = 0,
  animateOnView = false,
  as: Tag = 'h1',
}: BlurRevealTextProps) {
  const words = text.split(' ');

  // Use motion component based on tag
  const MotionTag = motion[Tag] as typeof motion.h1;

  return (
    <MotionTag
      variants={containerVariants}
      initial="hidden"
      animate={animateOnView ? undefined : 'visible'}
      whileInView={animateOnView ? 'visible' : undefined}
      viewport={animateOnView ? { once: true, margin: '-100px' } : undefined}
      custom={delay}
      className={className}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          variants={wordVariants}
          className="inline-block mr-[0.25em] last:mr-0"
        >
          {word}
        </motion.span>
      ))}
    </MotionTag>
  );
}
