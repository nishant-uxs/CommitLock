'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import { getOverallMetrics, seedDemoMetrics, OverallMetrics } from '@/lib/metrics/tracker';
import { Loader2 } from 'lucide-react';

function formatXLM(stroops: string): string {
  const val = BigInt(stroops || '0');
  const xlm = Number(val) / 10000000;
  return xlm.toFixed(2) + ' XLM';
}

function MetricCard({ title, value, subtitle, color }: { title: string; value: string | number; subtitle?: string; color?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-sm transition-shadow">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
      <p className={`text-2xl font-bold mt-1.5 ${color || 'text-slate-900'}`}>{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function BarChart({ data, color = 'bg-blue-500' }: { data: { date: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-[3px] h-28">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center group">
          <div className="relative w-full">
            <div className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap transition-opacity z-10">
              {d.value}
            </div>
            <div
              className={`w-full ${color} rounded-sm min-h-[2px] transition-all group-hover:opacity-80`}
              style={{ height: `${(d.value / max) * 100}%` }}
            />
          </div>
          {i % 4 === 0 && (
            <span className="text-[9px] text-slate-300 mt-1.5">
              {d.date.slice(5)}
            </span>
          )}
        </div>
      ))}
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
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
          <p className="text-sm text-slate-400">Loading metrics...</p>
        </div>
      </div>
    );
  }

  const dauData = metrics.dailyMetrics.map(d => ({ date: d.date, value: d.activeUsers.length }));
  const txData = metrics.dailyMetrics.map(d => ({ date: d.date, value: d.transactions }));
  const resData = metrics.dailyMetrics.map(d => ({ date: d.date, value: d.reservationsCreated }));
  const noShowData = metrics.dailyMetrics.map(d => ({ date: d.date, value: d.noShows }));

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-slate-900">Metrics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Platform analytics and performance indicators</p>
        </div>

        <div className="animate-fade-in-delay-1">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Users</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard title="Total" value={metrics.totalUsers} subtitle="Unique wallets" color="text-blue-600" />
            <MetricCard title="DAU" value={metrics.dau} subtitle="Today" color="text-emerald-600" />
            <MetricCard title="WAU" value={metrics.wau} subtitle="7 days" color="text-violet-600" />
            <MetricCard title="MAU" value={metrics.mau} subtitle="30 days" color="text-amber-600" />
          </div>
        </div>

        <div className="animate-fade-in-delay-2">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Transactions</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard title="Total Txns" value={metrics.totalTransactions} color="text-indigo-600" />
            <MetricCard title="Reservations" value={metrics.totalReservations} color="text-teal-600" />
            <MetricCard title="Bookings" value={metrics.totalBookings} color="text-cyan-600" />
            <MetricCard title="Fees Sponsored" value={metrics.totalFeesSponsored} subtitle="Gasless" color="text-rose-600" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-fade-in-delay-3">
          <MetricCard title="Deposits Locked" value={formatXLM(metrics.totalDepositsLocked)} color="text-amber-600" />
          <MetricCard title="Deposits Refunded" value={formatXLM(metrics.totalDepositsRefunded)} color="text-emerald-600" />
          <MetricCard title="Avg Deposit" value={formatXLM(metrics.averageDeposit)} color="text-blue-600" />
        </div>

        <div className="grid grid-cols-3 gap-3 animate-fade-in-delay-3">
          <MetricCard title="Retention" value={`${metrics.retentionRate}%`} subtitle="Week-over-week" color="text-emerald-600" />
          <MetricCard title="No-Show Rate" value={`${metrics.noShowRate}%`} subtitle="Of completed" color="text-red-500" />
          <MetricCard title="Completion" value={`${(100 - metrics.noShowRate).toFixed(1)}%`} subtitle="Attended" color="text-emerald-600" />
        </div>

        <div className="animate-fade-in-delay-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Trends — Last 15 Days</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-slate-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Daily Active Users</CardTitle>
              </CardHeader>
              <CardContent><BarChart data={dauData} color="bg-blue-500" /></CardContent>
            </Card>
            <Card className="border-slate-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Transactions</CardTitle>
              </CardHeader>
              <CardContent><BarChart data={txData} color="bg-indigo-500" /></CardContent>
            </Card>
            <Card className="border-slate-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Reservations Created</CardTitle>
              </CardHeader>
              <CardContent><BarChart data={resData} color="bg-teal-500" /></CardContent>
            </Card>
            <Card className="border-slate-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">No-Shows</CardTitle>
              </CardHeader>
              <CardContent><BarChart data={noShowData} color="bg-red-400" /></CardContent>
            </Card>
          </div>
        </div>

        <div className="animate-fade-in-delay-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Daily Breakdown</p>
          <Card className="border-slate-100 shadow-sm">
            <CardContent className="pt-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pr-4 font-medium">Date</th>
                    <th className="pb-3 pr-4 font-medium">Users</th>
                    <th className="pb-3 pr-4 font-medium">Txns</th>
                    <th className="pb-3 pr-4 font-medium">Created</th>
                    <th className="pb-3 pr-4 font-medium">Booked</th>
                    <th className="pb-3 pr-4 font-medium">Attended</th>
                    <th className="pb-3 pr-4 font-medium">No-Show</th>
                    <th className="pb-3 font-medium">Sponsored</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.dailyMetrics.slice().reverse().map((day, i) => (
                    <tr key={i} className="border-t border-slate-50 hover:bg-slate-25">
                      <td className="py-2.5 pr-4 font-mono text-xs text-slate-500">{day.date}</td>
                      <td className="py-2.5 pr-4 font-medium">{day.activeUsers.length}</td>
                      <td className="py-2.5 pr-4">{day.transactions}</td>
                      <td className="py-2.5 pr-4">{day.reservationsCreated}</td>
                      <td className="py-2.5 pr-4">{day.bookingsMade}</td>
                      <td className="py-2.5 pr-4 text-emerald-600 font-medium">{day.attendanceConfirmed}</td>
                      <td className="py-2.5 pr-4 text-red-500 font-medium">{day.noShows}</td>
                      <td className="py-2.5">{day.feesSponsored}</td>
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
