'use client';

import { Lock, Unlock, Eye, Focus, RotateCcw } from 'lucide-react';
import { usePathMapModeStore } from '@/lib/stores/pathmap-mode';

interface PresenterControlsProps {
  onResetView?: () => void;
  className?: string;
}

/**
 * Presenter Controls Component
 *
 * Controls for presenter mode:
 * - Lock/unlock audience controls
 * - Set disclosure level for all
 * - Focus on specific node
 * - Reset view
 */
export function PresenterControls({
  onResetView,
  className,
}: PresenterControlsProps) {
  const {
    mode,
    isLocked,
    setLocked,
    presenterDisclosureLevel,
    setPresenterDisclosureLevel,
    presenterFocusNodeId,
    setPresenterFocusNodeId,
  } = usePathMapModeStore();

  // Only render in presenter mode
  if (mode !== 'presenter') {
    return null;
  }

  return (
    <div
      className={`flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg ${className || ''}`}
    >
      {/* Presenter Mode Label */}
      <div className="flex items-center gap-2 pr-3 border-r border-amber-200 dark:border-amber-900">
        <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
          Presenter Mode
        </span>
      </div>

      {/* Lock Toggle */}
      <button
        onClick={() => setLocked(!isLocked)}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
          transition-colors
          ${
            isLocked
              ? 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400'
              : 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400'
          }
        `}
        title={
          isLocked
            ? 'Audience controls are locked'
            : 'Audience can interact freely'
        }
      >
        {isLocked ? (
          <>
            <Lock className="h-4 w-4" />
            Locked
          </>
        ) : (
          <>
            <Unlock className="h-4 w-4" />
            Unlocked
          </>
        )}
      </button>

      {/* Disclosure Level */}
      <div className="flex items-center gap-1">
        <Eye className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <div className="flex items-center rounded-lg border border-amber-200 dark:border-amber-800 overflow-hidden">
          {([1, 2, 3] as const).map((level) => (
            <button
              key={level}
              onClick={() => setPresenterDisclosureLevel(level)}
              className={`
                px-2.5 py-1 text-sm font-medium transition-colors
                ${
                  presenterDisclosureLevel === level
                    ? 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200'
                    : 'text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900'
                }
              `}
              title={`Disclosure Level ${level}`}
            >
              L{level}
            </button>
          ))}
        </div>
      </div>

      {/* Focus Indicator */}
      {presenterFocusNodeId && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 rounded-lg">
          <Focus className="h-4 w-4" />
          <span className="text-sm font-medium">Focusing</span>
          <button
            onClick={() => setPresenterFocusNodeId(null)}
            className="ml-1 p-0.5 rounded hover:bg-blue-200 dark:hover:bg-blue-900"
            title="Clear focus"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Reset View */}
      {onResetView && (
        <button
          onClick={onResetView}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-lg transition-colors"
          title="Reset view to default"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      )}
    </div>
  );
}

export default PresenterControls;
