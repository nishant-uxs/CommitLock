/**
 * Application Constants
 * 
 * Centralized constants for the CommitLock platform.
 */

// Application metadata
export const APP_NAME = 'CommitLock';
export const APP_VERSION = '2.0.0';
export const APP_DESCRIPTION = 'Decentralized No-Show Protection Protocol';

// Deposit limits (in XLM)
export const MIN_DEPOSIT_XLM = 0.1;
export const MAX_DEPOSIT_XLM = 1000;
export const DEFAULT_DEPOSIT_XLM = 1;

// Transaction settings
export const TX_TIMEOUT_SECONDS = 300;
export const TX_POLL_INTERVAL_MS = 1000;
export const MAX_FEE_STROOPS = '100000';

// Fee sponsorship
export const FEE_SPONSOR_MAX_FEE = '100000'; // 0.01 XLM
export const FEE_SPONSOR_DAILY_LIMIT = 100; // max sponsored txns per day

// Metrics
export const METRICS_MAX_DAILY_RECORDS = 90; // 90 days retention
export const METRICS_REFRESH_INTERVAL_MS = 30000; // 30 seconds

// Monitoring
export const MAX_LOG_ENTRIES = 500;
export const HEALTH_CHECK_INTERVAL_MS = 60000; // 1 minute
export const HEALTH_CHECK_TIMEOUT_MS = 5000;

// UI
export const RESERVATION_PAGE_SIZE = 20;
export const ADDRESS_DISPLAY_CHARS = 6;
export const TOAST_DURATION_MS = 5000;

// Stellar Network
export const STROOPS_PER_XLM = 10_000_000;
export const XLM_DECIMALS = 7;

// Status labels
export const STATUS_LABELS: Record<number, string> = {
  0: 'Open',
  1: 'Booked',
  2: 'Completed',
  3: 'No-Show',
};

export const STATUS_COLORS: Record<number, string> = {
  0: 'text-blue-600 bg-blue-50',
  1: 'text-yellow-600 bg-yellow-50',
  2: 'text-green-600 bg-green-50',
  3: 'text-red-600 bg-red-50',
};
