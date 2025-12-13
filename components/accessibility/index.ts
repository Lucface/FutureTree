/**
 * FutureTree Accessibility Components
 *
 * Utilities and components for building accessible experiences.
 * These components help ensure WCAG compliance and better UX for all users.
 *
 * @example
 * ```tsx
 * import {
 *   SkipLink,
 *   VisuallyHidden,
 *   LiveRegion,
 * } from '@/components/accessibility';
 *
 * // In layout
 * <SkipLink />
 *
 * // Hidden button text
 * <button>
 *   <Icon />
 *   <VisuallyHidden>Close</VisuallyHidden>
 * </button>
 *
 * // Dynamic announcements
 * <LiveRegion>{message}</LiveRegion>
 * ```
 */

export { SkipLink, VisuallyHidden, LiveRegion } from './SkipLink';
