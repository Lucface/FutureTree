'use client';

import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface PremiumButtonProps extends Omit<HTMLMotionProps<'button'>, 'size' | 'children'> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Loading state */
  isLoading?: boolean;
  /** Icon to display before text */
  leftIcon?: React.ReactNode;
  /** Icon to display after text */
  rightIcon?: React.ReactNode;
  /** Button content */
  children?: React.ReactNode;
}

/**
 * PremiumButton - Buttons that feel tactile and premium.
 *
 * Features:
 * - Complex layered shadows for depth
 * - Smooth hover transitions
 * - Active scale animation
 * - Full-rounded (pill) shape
 *
 * @example
 * <PremiumButton>Start Your Discovery</PremiumButton>
 * <PremiumButton variant="secondary" size="lg">View Case Studies</PremiumButton>
 */
export function PremiumButton({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}: PremiumButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
          // Base styles
          'relative inline-flex items-center justify-center font-medium rounded-full',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',

          // Size variants
          size === 'sm' && 'h-9 px-4 text-sm gap-1.5',
          size === 'md' && 'h-11 px-6 text-base gap-2',
          size === 'lg' && 'h-14 px-8 text-lg gap-2.5',

          // Primary - the hero CTA (dark button, white text)
          variant === 'primary' && [
            'bg-gray-900 text-white',
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_1px_3px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.15)]',
            'hover:bg-gray-800 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_6px_rgba(0,0,0,0.15),0_8px_24px_rgba(0,0,0,0.2)]',
            'border border-gray-800',
            'dark:bg-white dark:text-gray-900 dark:border-white/20',
            'dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_1px_3px_rgba(0,0,0,0.3),0_4px_12px_rgba(0,0,0,0.4)]',
            'dark:hover:bg-gray-100',
          ],

          // Secondary - outline/ghost style
          variant === 'secondary' && [
            'bg-white text-gray-900',
            'shadow-[0_1px_3px_rgba(0,0,0,0.08)]',
            'hover:bg-gray-50 hover:shadow-[0_2px_8px_rgba(0,0,0,0.12)]',
            'border border-gray-200',
            'dark:bg-dark-surface dark:text-white dark:border-dark-border',
            'dark:hover:bg-dark-elevated',
          ],

          // Ghost - minimal, text-only feel
          variant === 'ghost' && [
            'text-gray-600 hover:text-gray-900',
            'hover:bg-gray-100/80',
            'dark:text-gray-400 dark:hover:text-white',
            'dark:hover:bg-white/10',
          ],

          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="absolute inset-0 flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </span>
            <span className="invisible">{children}</span>
          </>
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </motion.button>
    );
}
