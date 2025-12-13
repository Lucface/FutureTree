'use client';

import { useEffect, useRef, useCallback, RefObject } from 'react';

/**
 * useFocusTrap - Traps focus within a container element
 *
 * Essential for modal dialogs and overlay menus to ensure
 * keyboard users can navigate without accidentally exiting.
 *
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose, children }) {
 *   const modalRef = useFocusTrap<HTMLDivElement>(isOpen);
 *
 *   return (
 *     <div ref={modalRef} role="dialog" aria-modal="true">
 *       {children}
 *     </div>
 *   );
 * }
 * ```
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  isActive: boolean = true
): RefObject<T | null> {
  const containerRef = useRef<T>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Get all focusable elements within the container
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const elements = containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors);
    return Array.from(elements).filter(
      (el) => el.offsetParent !== null // Filter out hidden elements
    );
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isActive || event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // If shift+tab from first element, go to last
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
      // If tab from last element, go to first
      else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    },
    [isActive, getFocusableElements]
  );

  useEffect(() => {
    if (!isActive) return;

    // Store currently focused element to restore later
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus first focusable element in container
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      // Small delay to ensure DOM is ready
      requestAnimationFrame(() => {
        focusableElements[0].focus();
      });
    }

    // Add keydown listener
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus to previous element
      if (previousFocusRef.current && 'focus' in previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive, getFocusableElements, handleKeyDown]);

  return containerRef;
}

/**
 * useEscapeKey - Listen for escape key to close modals
 *
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   useEscapeKey(onClose, isOpen);
 *   // ...
 * }
 * ```
 */
export function useEscapeKey(onEscape: () => void, isActive: boolean = true): void {
  useEffect(() => {
    if (!isActive) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onEscape();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, isActive]);
}
