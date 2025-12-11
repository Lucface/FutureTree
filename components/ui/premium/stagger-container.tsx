'use client';

import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

interface StaggerContainerProps {
  children: ReactNode;
  /** Delay between each child animation (in seconds) */
  staggerDelay?: number;
  /** Initial delay before first child animates (in seconds) */
  delayChildren?: number;
  /** Additional CSS classes */
  className?: string;
}

interface StaggerItemProps {
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (custom: { staggerDelay: number; delayChildren: number }) => ({
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: custom.staggerDelay,
      delayChildren: custom.delayChildren,
    },
  }),
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 100,
    },
  },
};

/**
 * StaggerContainer - Parent that controls children with cascading delays.
 *
 * Used for the Potentiality reveal: path cards appearing one by one.
 *
 * @example
 * <StaggerContainer staggerDelay={0.15}>
 *   <StaggerItem><PathCard path="vertical" /></StaggerItem>
 *   <StaggerItem><PathCard path="content-led" /></StaggerItem>
 *   <StaggerItem><PathCard path="partnership" /></StaggerItem>
 * </StaggerContainer>
 */
export function StaggerContainer({
  children,
  staggerDelay = 0.15,
  delayChildren = 0.2,
  className,
}: StaggerContainerProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      custom={{ staggerDelay, delayChildren }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem - Child component that animates within a StaggerContainer.
 */
export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
