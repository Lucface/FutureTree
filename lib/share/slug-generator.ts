/**
 * Share Link Slug Generator
 *
 * Generates short, URL-safe slugs for shared path links.
 * Uses nanoid with a custom alphabet for readability.
 */

import { customAlphabet } from 'nanoid';

// URL-safe alphabet without confusing characters (0/O, 1/l/I)
const SLUG_ALPHABET = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ';

// Generate 10-character slugs (62^10 = ~839 quadrillion combinations)
const generateSlug = customAlphabet(SLUG_ALPHABET, 10);

/**
 * Generate a unique slug for a share link
 */
export function createShareSlug(): string {
  return generateSlug();
}

/**
 * Validate a slug format
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') return false;
  if (slug.length < 8 || slug.length > 12) return false;

  // Check all characters are in our alphabet
  return slug.split('').every((char) => SLUG_ALPHABET.includes(char));
}

/**
 * Generate a share link URL
 */
export function createShareUrl(slug: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${base}/pathmap/shared/${slug}`;
}

/**
 * Calculate expiration date
 */
export function calculateExpirationDate(daysFromNow: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
}

/**
 * Check if a link has expired
 */
export function isExpired(expiresAt: Date | string): boolean {
  const expiration = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  return expiration < new Date();
}

/**
 * Check if view limit has been reached
 */
export function hasReachedViewLimit(viewCount: number, maxViews?: number | null): boolean {
  if (maxViews === null || maxViews === undefined) return false;
  return viewCount >= maxViews;
}
