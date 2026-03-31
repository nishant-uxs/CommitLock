import { NextResponse } from 'next/server';

/**
 * API Route: Metrics Endpoint
 * 
 * GET /api/metrics
 * Returns platform metrics including DAU, transactions, retention, etc.
 * 
 * In production, this would query a database or indexer.
 * For the MVP, metrics are tracked client-side and this endpoint
 * provides the schema and description.
 */

export async function GET() {
  return NextResponse.json({
    description: 'CommitLock Metrics API',
    version: '1.0.0',
    endpoints: {
      '/api/metrics': 'Platform metrics overview (this endpoint)',
      '/api/metrics/indexer': 'Stellar event indexing data',
      '/metrics': 'Visual metrics dashboard (frontend page)',
    },
    schema: {
      totalUsers: 'number - Total unique wallet addresses',
      totalTransactions: 'number - Total on-chain transactions',
      totalReservations: 'number - Total reservations created',
      totalBookings: 'number - Total bookings made',
      dau: 'number - Daily Active Users',
      wau: 'number - Weekly Active Users (7d)',
      mau: 'number - Monthly Active Users (30d)',
      retentionRate: 'number - Week-over-week retention percentage',
      noShowRate: 'number - Percentage of completed reservations with no-shows',
      totalDepositsLocked: 'string - Total XLM locked in deposits (stroops)',
      totalDepositsRefunded: 'string - Total XLM refunded (stroops)',
      totalFeesSponsored: 'number - Total gasless transactions via fee sponsorship',
    },
    note: 'Client-side metrics are available at /metrics dashboard. For production, connect to a PostgreSQL database or Stellar Horizon indexer.',
  });
}
