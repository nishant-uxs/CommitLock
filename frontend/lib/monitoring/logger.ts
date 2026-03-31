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
