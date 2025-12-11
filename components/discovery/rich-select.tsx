'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface RichSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

/**
 * RichSelect - Premium select input with icons and descriptions.
 *
 * Features:
 * - Animated dropdown
 * - Icons for each option
 * - Optional descriptions
 * - Smooth hover/selection states
 *
 * @example
 * <RichSelect
 *   label="Industry"
 *   options={[
 *     { value: 'video', label: 'Video Production', icon: Video },
 *     { value: 'photo', label: 'Photography', icon: Camera },
 *   ]}
 *   value={industry}
 *   onChange={setIndustry}
 * />
 */
export function RichSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  className,
}: RichSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.99 }}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-4 py-3',
          'bg-white dark:bg-dark-surface rounded-xl',
          'border-2 border-gray-200 dark:border-dark-border',
          'text-left transition-colors',
          'hover:border-gray-300 dark:hover:border-dark-muted',
          'focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10',
          isOpen && 'border-gray-900 dark:border-white'
        )}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {selectedOption?.icon && (
            <selectedOption.icon className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          )}
          <span
            className={cn(
              'truncate',
              selectedOption
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </motion.div>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Options */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className={cn(
                'absolute z-20 w-full mt-2',
                'bg-white dark:bg-dark-surface rounded-xl',
                'border border-gray-200 dark:border-dark-border',
                'shadow-lg dark:shadow-2xl',
                'max-h-64 overflow-y-auto',
                'py-1'
              )}
            >
              {options.map((option) => {
                const isSelected = option.value === value;
                const Icon = option.icon;

                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 text-left',
                      'transition-colors',
                      isSelected && 'bg-gray-100 dark:bg-dark-elevated'
                    )}
                  >
                    {Icon && (
                      <Icon
                        className={cn(
                          'h-5 w-5 flex-shrink-0',
                          isSelected
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-400'
                        )}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div
                        className={cn(
                          'font-medium',
                          isSelected
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-700 dark:text-gray-300'
                        )}
                      >
                        {option.label}
                      </div>
                      {option.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {option.description}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="h-5 w-5 text-gray-900 dark:text-white flex-shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
