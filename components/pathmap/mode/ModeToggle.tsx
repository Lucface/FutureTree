'use client';

import { usePathMapModeStore, type PathMapMode } from '@/lib/stores/pathmap-mode';
import { Users, User, HelpCircle } from 'lucide-react';

interface ModeToggleProps {
  className?: string;
}

/**
 * Mode Toggle Component
 *
 * Allows switching between presenter and self-serve modes
 */
export function ModeToggle({ className }: ModeToggleProps) {
  const { mode, setMode, showHints, toggleHints } = usePathMapModeStore();

  const modes: { value: PathMapMode; label: string; icon: typeof Users }[] = [
    { value: 'presenter', label: 'Presenter', icon: Users },
    { value: 'self-serve', label: 'Self-Serve', icon: User },
  ];

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      {/* Mode Toggle */}
      <div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
        {modes.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setMode(value)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
              transition-all duration-200
              ${
                mode === value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Hints Toggle (only in self-serve mode) */}
      {mode === 'self-serve' && (
        <button
          onClick={toggleHints}
          className={`
            p-2 rounded-lg border transition-colors
            ${
              showHints
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-muted/30 text-muted-foreground hover:text-foreground'
            }
          `}
          title={showHints ? 'Hide hints' : 'Show hints'}
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default ModeToggle;
