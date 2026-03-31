/**
 * Rate Limiter for Fee Sponsorship
 * 
 * Prevents abuse of the fee sponsorship endpoint by limiting
 * the number of sponsored transactions per wallet per time window.
 */

import { FEE_SPONSOR_DAILY_LIMIT } from '@/lib/constants';

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const rateLimitMap = new Map<string, RateLimitEntry>();

/**
 * Check if a wallet address has exceeded the fee sponsorship rate limit
 */
export function isRateLimited(walletAddress: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(walletAddress);

  if (!entry) return false;

  // Reset if window has expired
  if (now - entry.windowStart > WINDOW_MS) {
    rateLimitMap.delete(walletAddress);
    return false;
  }

  return entry.count >= FEE_SPONSOR_DAILY_LIMIT;
}

/**
 * Record a fee sponsorship usage for a wallet address
 */
export function recordUsage(walletAddress: string): void {
  const now = Date.now();
  const entry = rateLimitMap.get(walletAddress);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateLimitMap.set(walletAddress, { count: 1, windowStart: now });
  } else {
    entry.count += 1;
  }
}

/**
 * Get remaining sponsored transactions for a wallet
 */
export function getRemainingQuota(walletAddress: string): number {
  const now = Date.now();
  const entry = rateLimitMap.get(walletAddress);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    return FEE_SPONSOR_DAILY_LIMIT;
  }

  return Math.max(0, FEE_SPONSOR_DAILY_LIMIT - entry.count);
}

/**
 * Clean up expired rate limit entries (call periodically)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now - entry.windowStart > WINDOW_MS) {
      rateLimitMap.delete(key);
    }
  }
}
