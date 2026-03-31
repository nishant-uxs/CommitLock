'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getOverallMetrics, seedDemoMetrics, OverallMetrics } from '@/lib/metrics/tracker';
import Link from 'next/link';

function formatXLM(stroops: string): string {
  const val = BigInt(stroops || '0');
  const xlm = Number(val) / 10000000;
  return xlm.toFixed(2) + ' XLM';
}

function MetricCard({ title, value, subtitle, color }: { title: string; value: string | number; subtitle?: string; color?: string }) {
  return (
    <Card className="border border-gray-200">
      <CardContent className="pt-6">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className={`text-3xl font-bold mt-1 ${color || 'text-blue-600'}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function BarChart({ data, label }: { data: { date: string; value: number }[]; label: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div>
      <p className="text-sm font-medium text-gray-500 mb-3">{label}</p>
      <div className="flex items-end gap-1 h-32">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-blue-500 rounded-t min-h-[2px] transition-all"
              style={{ height: `${(d.value / max) * 100}%` }}
              title={`${d.date}: ${d.value}`}
            />
            {i % 3 === 0 && (
              <span className="text-[9px] text-gray-400 mt-1 rotate-[-45deg]">
                {d.date.slice(5)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<OverallMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedDemoMetrics();
    const data = getOverallMetrics();
    setMetrics(data);
    setLoading(false);
  }, []);

  if (loading || !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading metrics...</p>
      </div>
    );
  }

  const dauData = metrics.dailyMetrics.map(d => ({ date: d.date, value: d.activeUsers.length }));
  const txData = metrics.dailyMetrics.map(d => ({ date: d.date, value: d.transactions }));
  const resData = metrics.dailyMetrics.map(d => ({ date: d.date, value: d.reservationsCreated }));
  const noShowData = metrics.dailyMetrics.map(d => ({ date: d.date, value: d.noShows }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📊 Metrics Dashboard</h1>
            <p className="text-sm text-gray-500">CommitLock Platform Analytics</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">Dashboard</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">Home</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* KPI Cards Row */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Key Performance Indicators</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title="Total Users" value={metrics.totalUsers} subtitle="Unique wallet addresses" color="text-blue-600" />
            <MetricCard title="DAU (Today)" value={metrics.dau} subtitle="Daily Active Users" color="text-green-600" />
            <MetricCard title="WAU (7d)" value={metrics.wau} subtitle="Weekly Active Users" color="text-purple-600" />
            <MetricCard title="MAU (30d)" value={metrics.mau} subtitle="Monthly Active Users" color="text-orange-600" />
          </div>
        </div>

        {/* Transaction Metrics */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Transaction Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title="Total Transactions" value={metrics.totalTransactions} color="text-indigo-600" />
            <MetricCard title="Reservations Created" value={metrics.totalReservations} color="text-teal-600" />
            <MetricCard title="Bookings Made" value={metrics.totalBookings} color="text-cyan-600" />
            <MetricCard title="Fees Sponsored" value={metrics.totalFeesSponsored} subtitle="Gasless transactions" color="text-pink-600" />
          </div>
        </div>

        {/* Financial Metrics */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Financial Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard title="Total Deposits Locked" value={formatXLM(metrics.totalDepositsLocked)} color="text-yellow-600" />
            <MetricCard title="Total Deposits Refunded" value={formatXLM(metrics.totalDepositsRefunded)} color="text-green-600" />
            <MetricCard title="Avg Deposit per Reservation" value={formatXLM(metrics.averageDeposit)} color="text-blue-600" />
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Performance & Retention</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard title="Retention Rate" value={`${metrics.retentionRate}%`} subtitle="Week-over-week" color="text-green-600" />
            <MetricCard title="No-Show Rate" value={`${metrics.noShowRate}%`} subtitle="Of completed reservations" color="text-red-500" />
            <MetricCard title="Completion Rate" value={`${(100 - metrics.noShowRate).toFixed(1)}%`} subtitle="Guests who attended" color="text-emerald-600" />
          </div>
        </div>

        {/* Charts */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Trends (Last 15 Days)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Daily Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart data={dauData} label="" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Daily Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart data={txData} label="" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Reservations Created</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart data={resData} label="" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">No-Shows</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart data={noShowData} label="" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Daily Breakdown Table */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Daily Breakdown</h2>
          <Card>
            <CardContent className="pt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 pr-4">Date</th>
                    <th className="pb-2 pr-4">Users</th>
                    <th className="pb-2 pr-4">Txns</th>
                    <th className="pb-2 pr-4">Created</th>
                    <th className="pb-2 pr-4">Booked</th>
                    <th className="pb-2 pr-4">Attended</th>
                    <th className="pb-2 pr-4">No-Show</th>
                    <th className="pb-2">Sponsored</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.dailyMetrics.slice().reverse().map((day, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-mono text-xs">{day.date}</td>
                      <td className="py-2 pr-4">{day.activeUsers.length}</td>
                      <td className="py-2 pr-4">{day.transactions}</td>
                      <td className="py-2 pr-4">{day.reservationsCreated}</td>
                      <td className="py-2 pr-4">{day.bookingsMade}</td>
                      <td className="py-2 pr-4 text-green-600">{day.attendanceConfirmed}</td>
                      <td className="py-2 pr-4 text-red-500">{day.noShows}</td>
                      <td className="py-2">{day.feesSponsored}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
