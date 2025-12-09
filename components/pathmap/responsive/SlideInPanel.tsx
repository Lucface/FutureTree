'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion';
import { X, GripHorizontal } from 'lucide-react';

interface SlideInPanelProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Initial height as percentage of viewport (0-100) */
  initialHeight?: number;
  /** Maximum height as percentage of viewport (0-100) */
  maxHeight?: number;
  /** Minimum height in pixels */
  minHeight?: number;
  className?: string;
}

/**
 * Slide-In Panel (Bottom Sheet)
 *
 * Mobile-friendly bottom sheet with drag-to-resize and drag-to-close.
 * Used for showing node details on mobile devices.
 */
export function SlideInPanel({
  open,
  onClose,
  title,
  children,
  initialHeight = 50,
  maxHeight = 90,
  minHeight = 100,
  className,
}: SlideInPanelProps) {
  const [height, setHeight] = useState(initialHeight);
  const dragControls = useDragControls();
  const containerRef = useRef<HTMLDivElement>(null);
  const startHeightRef = useRef(initialHeight);

  // Reset height when panel opens
  useEffect(() => {
    if (open) {
      setHeight(initialHeight);
    }
  }, [open, initialHeight]);

  // Handle drag
  const handleDrag = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const viewportHeight = window.innerHeight;
      const dragDistance = -info.offset.y; // Negative because dragging up should increase height
      const newHeightPx = (startHeightRef.current / 100) * viewportHeight + dragDistance;
      const newHeightPercent = (newHeightPx / viewportHeight) * 100;

      // Clamp between min and max
      const minPercent = (minHeight / viewportHeight) * 100;
      const clampedHeight = Math.max(minPercent, Math.min(maxHeight, newHeightPercent));

      setHeight(clampedHeight);
    },
    [maxHeight, minHeight]
  );

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      // Close if dragged down significantly
      if (info.velocity.y > 500 || (info.offset.y > 100 && height < 30)) {
        onClose();
        return;
      }

      // Snap to nearest position
      if (height < 35) {
        setHeight(initialHeight);
      } else if (height > 75) {
        setHeight(maxHeight);
      }
    },
    [height, initialHeight, maxHeight, onClose]
  );

  const handleDragStart = useCallback(() => {
    startHeightRef.current = height;
  }, [height]);

  // Handle escape key
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 touch-none"
          />

          {/* Panel */}
          <motion.div
            ref={containerRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`
              fixed bottom-0 left-0 right-0 z-50
              bg-background border-t rounded-t-2xl shadow-lg
              flex flex-col
              ${className || ''}
            `}
            style={{ height: `${height}vh` }}
          >
            {/* Drag Handle */}
            <motion.div
              drag="y"
              dragControls={dragControls}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0}
              onDragStart={handleDragStart}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              className="flex-shrink-0 flex items-center justify-center py-3 cursor-grab active:cursor-grabbing touch-none"
            >
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </motion.div>

            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 pb-3 border-b">
              <div className="flex items-center gap-2">
                <GripHorizontal className="h-4 w-4 text-muted-foreground" />
                {title && <h3 className="font-semibold">{title}</h3>}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted transition-colors touch-manipulation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default SlideInPanel;
