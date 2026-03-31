import { NextResponse } from 'next/server';

/**
 * API Route: Health Check Endpoint
 * 
 * GET /api/health
 * Returns system health status for external monitoring tools.
 */

export async function GET() {
  const checks: Record<string, boolean> = {
    frontend: true,
    sorobanRpc: false,
    horizon: false,
  };

  // Check Soroban RPC
  try {
    const res = await fetch('https://soroban-testnet.stellar.org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'getHealth', id: 1 }),
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    checks.sorobanRpc = data.result?.status === 'healthy';
  } catch {
    checks.sorobanRpc = false;
  }

  // Check Horizon
  try {
    const res = await fetch('https://horizon-testnet.stellar.org/', {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    checks.horizon = res.ok;
  } catch {
    checks.horizon = false;
  }

  const allHealthy = Object.values(checks).every(v => v);
  const someHealthy = Object.values(checks).some(v => v);

  return NextResponse.json({
    status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks,
    version: '2.0.0-blackbelt',
    contractId: 'CANEW3ZQL7QVB7ZAH5R6XXEUZX3TGO5CONSPXBAFSPWSEK2ITBZJ7WT5',
  }, { status: allHealthy ? 200 : 503 });
}
