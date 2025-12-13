'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { X, PanelRightOpen, PanelRightClose } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * SplitView - Responsive split panel layout
 *
 * Main content area with collapsible side panel. Used for path detail
 * pages where the tree is on the left and evidence panel is on the right.
 *
 * @example
 * ```tsx
 * <SplitView
 *   main={<DecisionTree />}
 *   panel={<EvidencePanel />}
 *   panelTitle="Evidence"
 * />
 * ```
 */

const splitViewVariants = cva('relative flex h-full', {
  variants: {
    layout: {
      default: 'flex-row',
      reversed: 'flex-row-reverse',
    },
  },
  defaultVariants: {
    layout: 'default',
  },
});

interface SplitViewProps extends VariantProps<typeof splitViewVariants> {
  /** Main content area */
  main: React.ReactNode;
  /** Side panel content */
  panel: React.ReactNode;
  /** Panel title (shown in header) */
  panelTitle?: string;
  /** Panel width (default: '400px') */
  panelWidth?: string;
  /** Whether panel is initially open (default: true) */
  defaultOpen?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether panel can be resized (default: false) */
  resizable?: boolean;
  /** Minimum panel width when resizing (default: '280px') */
  minWidth?: string;
  /** Maximum panel width when resizing (default: '600px') */
  maxWidth?: string;
  /** Whether panel is collapsible (default: true) */
  collapsible?: boolean;
  /** Overlay mode on mobile (default: true) */
  mobileOverlay?: boolean;
  /** Additional class names */
  className?: string;
}

export function SplitView({
  main,
  panel,
  panelTitle,
  panelWidth = '400px',
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
  resizable = false,
  minWidth = '280px',
  maxWidth = '600px',
  collapsible = true,
  mobileOverlay = true,
  layout,
  className,
}: SplitViewProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const [width, setWidth] = React.useState(panelWidth);
  const [isResizing, setIsResizing] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(value);
      }
      onOpenChange?.(value);
    },
    [controlledOpen, onOpenChange]
  );

  // Handle resize
  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      if (!resizable) return;

      e.preventDefault();
      setIsResizing(true);

      const startX = e.clientX;
      const startWidth = panelRef.current?.offsetWidth || parseInt(panelWidth);

      const handleMouseMove = (e: MouseEvent) => {
        const delta = layout === 'reversed' ? e.clientX - startX : startX - e.clientX;
        const newWidth = Math.max(
          parseInt(minWidth),
          Math.min(parseInt(maxWidth), startWidth + delta)
        );
        setWidth(`${newWidth}px`);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [resizable, layout, minWidth, maxWidth, panelWidth]
  );

  return (
    <div className={cn(splitViewVariants({ layout }), className)}>
      {/* Main Content */}
      <div className="flex-1 overflow-auto">{main}</div>

      {/* Toggle Button (when panel is closed) */}
      {collapsible && !isOpen && (
        <motion.div
          initial={{ opacity: 0, x: layout === 'reversed' ? -10 : 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className={cn(
            'absolute top-4 z-20',
            layout === 'reversed' ? 'left-4' : 'right-4'
          )}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={() => setOpen(true)}
            className="h-10 w-10 rounded-lg bg-background/80 backdrop-blur-sm border-border/50 shadow-lg"
          >
            {layout === 'reversed' ? (
              <PanelRightClose className="h-5 w-5" />
            ) : (
              <PanelRightOpen className="h-5 w-5" />
            )}
          </Button>
        </motion.div>
      )}

      {/* Side Panel */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <>
            {/* Mobile Overlay Backdrop */}
            {mobileOverlay && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
                onClick={() => setOpen(false)}
              />
            )}

            {/* Panel */}
            <motion.div
              ref={panelRef}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ width }}
              className={cn(
                'relative flex flex-col border-border bg-background',
                layout === 'reversed' ? 'border-r' : 'border-l',
                mobileOverlay && 'fixed inset-y-0 z-40 lg:relative lg:inset-auto',
                mobileOverlay && (layout === 'reversed' ? 'left-0' : 'right-0')
              )}
            >
              {/* Resize Handle */}
              {resizable && (
                <div
                  className={cn(
                    'absolute top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 transition-colors',
                    layout === 'reversed' ? 'right-0' : 'left-0',
                    isResizing && 'bg-primary/30'
                  )}
                  onMouseDown={handleMouseDown}
                />
              )}

              {/* Panel Header */}
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                {panelTitle && (
                  <h3 className="font-semibold text-foreground">{panelTitle}</h3>
                )}
                {collapsible && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpen(false)}
                    className="h-8 w-8 rounded-md"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-auto">{panel}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * SplitViewSkeleton - Loading state for split view
 */
export function SplitViewSkeleton({
  layout = 'default',
  panelWidth = '400px',
  className,
}: {
  layout?: 'default' | 'reversed';
  panelWidth?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex h-full',
        layout === 'reversed' ? 'flex-row-reverse' : 'flex-row',
        className
      )}
    >
      {/* Main skeleton */}
      <div className="flex-1 p-6">
        <div className="h-full w-full rounded-xl bg-muted animate-pulse" />
      </div>

      {/* Panel skeleton */}
      <div
        style={{ width: panelWidth }}
        className={cn(
          'border-border bg-background',
          layout === 'reversed' ? 'border-r' : 'border-l'
        )}
      >
        <div className="border-b border-border px-4 py-3">
          <div className="h-6 w-24 rounded bg-muted animate-pulse" />
        </div>
        <div className="p-4 space-y-4">
          <div className="h-20 rounded-lg bg-muted animate-pulse" />
          <div className="h-32 rounded-lg bg-muted animate-pulse" />
          <div className="h-24 rounded-lg bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export type { SplitViewProps };
