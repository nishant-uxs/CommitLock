/**
 * Metrics Export Module
 * 
 * Provides functions to export metrics data in CSV and JSON formats
 * for reporting, analysis, and compliance purposes.
 */

import { getOverallMetrics, DailyMetrics } from './tracker';

export function exportMetricsAsCSV(): string {
  const metrics = getOverallMetrics();
  const headers = ['Date', 'Active Users', 'Transactions', 'Reservations Created', 'Bookings Made', 'Attendance Confirmed', 'No Shows', 'Deposits Locked (stroops)', 'Deposits Refunded (stroops)', 'Fees Sponsored'];
  
  const rows = metrics.dailyMetrics.map((d: DailyMetrics) => [
    d.date,
    d.activeUsers.length,
    d.transactions,
    d.reservationsCreated,
    d.bookingsMade,
    d.attendanceConfirmed,
    d.noShows,
    d.totalDepositLocked,
    d.totalDepositRefunded,
    d.feesSponsored,
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

export function exportMetricsAsJSON(): string {
  const metrics = getOverallMetrics();
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    summary: {
      totalUsers: metrics.totalUsers,
      totalTransactions: metrics.totalTransactions,
      dau: metrics.dau,
      wau: metrics.wau,
      mau: metrics.mau,
      retentionRate: metrics.retentionRate,
      noShowRate: metrics.noShowRate,
    },
    daily: metrics.dailyMetrics,
  }, null, 2);
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadMetricsCSV(): void {
  const csv = exportMetricsAsCSV();
  downloadFile(csv, `commitlock-metrics-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
}

export function downloadMetricsJSON(): void {
  const json = exportMetricsAsJSON();
  downloadFile(json, `commitlock-metrics-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
}
