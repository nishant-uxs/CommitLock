/**
 * Production Monitoring & Logging Module
 * 
 * Provides structured logging, error tracking, and health monitoring
 * for the CommitLock platform. In production, logs can be forwarded
 * to external services like Sentry, BetterStack, or Datadog.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  source?: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  checks: {
    frontend: boolean;
    sorobanRpc: boolean;
    horizon: boolean;
    contract: boolean;
  };
  lastChecked: string;
}

const LOG_KEY = 'commitlock_logs';
const MAX_LOGS = 500;
const startTime = Date.now();

function getStoredLogs(): LogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLogs(logs: LogEntry[]): void {
  if (typeof window === 'undefined') return;
  // Keep only the latest MAX_LOGS entries
  const trimmed = logs.slice(-MAX_LOGS);
  localStorage.setItem(LOG_KEY, JSON.stringify(trimmed));
}

/**
 * Log a message with structured context
 */
export function log(level: LogLevel, message: string, context?: Record<string, any>, source?: string): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    source: source || 'app',
  };

  // Console output with color coding
  const prefix = `[${entry.timestamp}] [${level.toUpperCase()}] [${entry.source}]`;
  switch (level) {
    case 'debug':
      console.debug(prefix, message, context || '');
      break;
    case 'info':
      console.info(prefix, message, context || '');
      break;
    case 'warn':
      console.warn(prefix, message, context || '');
      break;
    case 'error':
    case 'critical':
      console.error(prefix, message, context || '');
      break;
  }

  // Persist to localStorage
  const logs = getStoredLogs();
  logs.push(entry);
  saveLogs(logs);
}

// Convenience methods
export const logger = {
  debug: (msg: string, ctx?: Record<string, any>, src?: string) => log('debug', msg, ctx, src),
  info: (msg: string, ctx?: Record<string, any>, src?: string) => log('info', msg, ctx, src),
  warn: (msg: string, ctx?: Record<string, any>, src?: string) => log('warn', msg, ctx, src),
  error: (msg: string, ctx?: Record<string, any>, src?: string) => log('error', msg, ctx, src),
  critical: (msg: string, ctx?: Record<string, any>, src?: string) => log('critical', msg, ctx, src),
};

/**
 * Track a wallet connection event
 */
export function logWalletConnect(address: string): void {
  logger.info('Wallet connected', { address: address.slice(0, 10) + '...' }, 'wallet');
}

/**
 * Track a wallet disconnection event
 */
export function logWalletDisconnect(): void {
  logger.info('Wallet disconnected', {}, 'wallet');
}

/**
 * Track a transaction event
 */
export function logTransaction(type: string, hash?: string, error?: string): void {
  if (error) {
    logger.error(`Transaction failed: ${type}`, { hash, error }, 'transaction');
  } else {
    logger.info(`Transaction success: ${type}`, { hash }, 'transaction');
  }
}

/**
 * Track a contract interaction
 */
export function logContractCall(method: string, params?: Record<string, any>, error?: string): void {
  if (error) {
    logger.error(`Contract call failed: ${method}`, { ...params, error }, 'contract');
  } else {
    logger.info(`Contract call: ${method}`, params, 'contract');
  }
}

/**
 * Track a fee sponsorship event
 */
export function logFeeSponsor(sponsored: boolean, hash?: string, error?: string): void {
  if (error) {
    logger.warn('Fee sponsorship failed', { error }, 'fee-sponsor');
  } else {
    logger.info('Fee sponsored transaction', { hash, sponsored }, 'fee-sponsor');
  }
}

/**
 * Perform health checks on all services
 */
export async function performHealthCheck(): Promise<HealthStatus> {
  const checks = {
    frontend: true,
    sorobanRpc: false,
    horizon: false,
    contract: false,
  };

  // Check Soroban RPC
  try {
    const res = await fetch('https://soroban-testnet.stellar.org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'getHealth', id: 1 }),
    });
    const data = await res.json();
    checks.sorobanRpc = data.result?.status === 'healthy';
  } catch {
    checks.sorobanRpc = false;
  }

  // Check Horizon
  try {
    const res = await fetch('https://horizon-testnet.stellar.org/', { method: 'GET' });
    checks.horizon = res.ok;
  } catch {
    checks.horizon = false;
  }

  // Check contract (via Soroban)
  checks.contract = checks.sorobanRpc; // If RPC is up, contract is accessible

  const allHealthy = Object.values(checks).every(v => v);
  const someHealthy = Object.values(checks).some(v => v);

  const status: HealthStatus = {
    status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks,
    lastChecked: new Date().toISOString(),
  };

  logger.info('Health check completed', { status: status.status, checks }, 'monitoring');
  return status;
}

/**
 * Get recent logs filtered by level
 */
export function getRecentLogs(level?: LogLevel, limit: number = 100): LogEntry[] {
  const logs = getStoredLogs();
  const filtered = level ? logs.filter(l => l.level === level) : logs;
  return filtered.slice(-limit);
}

/**
 * Get log statistics
 */
export function getLogStats(): Record<LogLevel, number> {
  const logs = getStoredLogs();
  const stats: Record<LogLevel, number> = { debug: 0, info: 0, warn: 0, error: 0, critical: 0 };
  for (const entry of logs) {
    stats[entry.level] = (stats[entry.level] || 0) + 1;
  }
  return stats;
}

/**
 * Seed a realistic log history for demonstration
 */
const LOG_SEED_VERSION_KEY = 'commitlock_logs_seed_version';
const CURRENT_LOG_SEED_VERSION = '1';

export function seedDemoLogs(): void {
  if (typeof window === 'undefined') return;
  const existingVersion = localStorage.getItem(LOG_SEED_VERSION_KEY);
  if (existingVersion === CURRENT_LOG_SEED_VERSION && getStoredLogs().length > 50) return;

  const sources = ['wallet', 'contract', 'transaction', 'fee-sponsor', 'monitoring', 'api', 'indexer'];
  const infoMessages: Array<{ msg: string; src: string; ctx?: Record<string, any> }> = [
    { msg: 'Wallet connected', src: 'wallet', ctx: { address: 'GCHL5OZX...' } },
    { msg: 'Contract call: create_reservation', src: 'contract', ctx: { title: 'Dinner at The Grand', depositXLM: 1.0 } },
    { msg: 'Transaction success: submitted', src: 'transaction', ctx: { hash: '7e4b9f2c...' } },
    { msg: 'Fee sponsored transaction', src: 'fee-sponsor', ctx: { sponsored: true } },
    { msg: 'Contract call: book_reservation', src: 'contract', ctx: { reservationId: 12 } },
    { msg: 'Health check completed', src: 'monitoring', ctx: { status: 'healthy' } },
    { msg: 'Indexer cycle complete', src: 'indexer', ctx: { eventsProcessed: 24 } },
    { msg: 'Contract call: confirm_attendance', src: 'contract', ctx: { reservationId: 9, attended: true } },
    { msg: 'Transaction success: signed', src: 'transaction' },
    { msg: 'Wallet disconnected', src: 'wallet' },
    { msg: 'API request served', src: 'api', ctx: { endpoint: '/api/metrics', ms: 42 } },
    { msg: 'API request served', src: 'api', ctx: { endpoint: '/api/health', ms: 38 } },
  ];
  const warnMessages = [
    { msg: 'Soroban RPC slow response', src: 'monitoring', ctx: { ms: 2850 } },
    { msg: 'Fee sponsorship failed', src: 'fee-sponsor', ctx: { error: 'Daily quota exceeded' } },
    { msg: 'Rate limit approaching', src: 'api', ctx: { wallet: 'GDHQWLKF...', usage: '92%' } },
  ];
  const errorMessages = [
    { msg: 'Transaction failed: sign_failed', src: 'transaction', ctx: { error: 'User rejected signature' } },
    { msg: 'Contract call failed: book_reservation', src: 'contract', ctx: { error: 'Reservation already booked' } },
  ];

  const logs: LogEntry[] = [];
  const now = Date.now();
  // Seed last 24 hours of activity with decreasing frequency
  for (let i = 0; i < 180; i++) {
    // Offset: spread over last 24 hours, weighted toward recent
    const minutesAgo = Math.floor(Math.pow(Math.random(), 2) * 24 * 60);
    const ts = new Date(now - minutesAgo * 60 * 1000).toISOString();

    const rand = Math.random();
    let entry: LogEntry;
    if (rand < 0.05) {
      const pick = errorMessages[Math.floor(Math.random() * errorMessages.length)];
      entry = { timestamp: ts, level: 'error', message: pick.msg, source: pick.src, context: pick.ctx };
    } else if (rand < 0.15) {
      const pick = warnMessages[Math.floor(Math.random() * warnMessages.length)];
      entry = { timestamp: ts, level: 'warn', message: pick.msg, source: pick.src, context: pick.ctx };
    } else {
      const pick = infoMessages[Math.floor(Math.random() * infoMessages.length)];
      entry = { timestamp: ts, level: 'info', message: pick.msg, source: pick.src, context: pick.ctx };
    }
    logs.push(entry);
  }

  // Sort by timestamp ascending
  logs.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  saveLogs(logs);
  localStorage.setItem(LOG_SEED_VERSION_KEY, CURRENT_LOG_SEED_VERSION);
}
