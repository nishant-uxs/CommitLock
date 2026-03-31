/**
 * Formatting Utilities
 * 
 * Common formatting functions used across the CommitLock platform.
 */

import { STROOPS_PER_XLM, XLM_DECIMALS, ADDRESS_DISPLAY_CHARS } from '@/lib/constants';

/**
 * Convert stroops to XLM string with proper decimal formatting
 */
export function stroopsToXLM(stroops: bigint | number): string {
  const val = typeof stroops === 'bigint' ? Number(stroops) : stroops;
  return (val / STROOPS_PER_XLM).toFixed(XLM_DECIMALS);
}

/**
 * Convert XLM to stroops as BigInt
 */
export function xlmToStroops(xlm: number): bigint {
  return BigInt(Math.floor(xlm * STROOPS_PER_XLM));
}

/**
 * Truncate a Stellar address for display: GABCD...WXYZ
 */
export function truncateAddress(address: string, chars: number = ADDRESS_DISPLAY_CHARS): string {
  if (!address || address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format a date from Unix timestamp (seconds) to readable string
 */
export function formatTimestamp(timestamp: number | bigint): string {
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  return new Date(ts * 1000).toLocaleString();
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a number with comma separators
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Format percentage with optional decimal places
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format XLM amount for display with symbol
 */
export function formatXLM(xlm: number, decimals: number = 2): string {
  return `${xlm.toFixed(decimals)} XLM`;
}
