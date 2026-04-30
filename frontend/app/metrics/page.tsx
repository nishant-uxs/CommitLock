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
    <div className="glass-panel rounded-2xl border border-border/40 p-5 hover:shadow-lg hover:shadow-primary/5 transition-all group hover:-translate-y-1 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider relative z-10">{title}</p>
      <p className={`text-3xl font-extrabold mt-2 tracking-tight relative z-10 drop-shadow-sm ${color || 'text-foreground'}`}>{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground/80 mt-1 font-medium relative z-10">{subtitle}</p>}
    </div>
  );
}

function BarChart({ data, color = 'bg-primary' }: { data: { date: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-32 relative">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
          <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-bold px-2 py-1 rounded-md shadow-lg whitespace-nowrap transition-all duration-200 z-20 transform group-hover:-translate-y-1">
            {d.value}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-2 border-transparent border-t-foreground" />
          </div>
          <div className="relative w-full h-full flex items-end">
            <div
              className={`w-full ${color} rounded-t-sm min-h-[4px] transition-all duration-500 group-hover:opacity-100 opacity-60 group-hover:shadow-[0_0_12px_rgba(var(--primary),0.6)]`}
              style={{ height: `${Math.max((d.value / max) * 100, 2)}%` }}
            />
          </div>
          {i % 4 === 0 && (
            <span className="text-[10px] text-muted-foreground mt-2 font-medium">
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
      <div className="min-h-screen bg-background relative overflow-hidden">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10 mb-6 mx-auto" />
          </div>
          <p className="text-lg font-medium text-foreground tracking-wide">Crunching Data...</p>
        </div>
      </div>
    );
  }

  const dauData = metrics.dailyMetrics.map(d => ({ date: d.date, value: d.activeUsers.length }));
  const txData = metrics.dailyMetrics.map(d => ({ date: d.date, value: d.transactions }));
  const resData = metrics.dailyMetrics.map(d => ({ date: d.date, value: d.reservationsCreated }));
  const noShowData = metrics.dailyMetrics.map(d => ({ date: d.date, value: d.noShows }));

  return (
    <div className="min-h-screen bg-background relative overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Background Decorators */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.25]" />
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full animate-blob mix-blend-screen" />
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full animate-blob animation-delay-2000 mix-blend-screen" />
      </div>

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12 relative z-10">
        <div className="animate-fade-in flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-6 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-activity">
              <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight drop-shadow-sm mb-2">Platform Metrics</h1>
          <p className="text-lg text-muted-foreground">Real-time network analytics and performance indicators</p>
        </div>

        <div className="animate-fade-in-delay-1 space-y-4">
          <p className="text-sm font-bold text-foreground/80 uppercase tracking-widest pl-1 border-l-4 border-primary">User Activity</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <MetricCard title="Total" value={metrics.totalUsers} subtitle="Unique wallets" color="text-blue-500" />
            <MetricCard title="DAU" value={metrics.dau} subtitle="Today" color="text-emerald-500" />
            <MetricCard title="WAU" value={metrics.wau} subtitle="7 days" color="text-violet-500" />
            <MetricCard title="MAU" value={metrics.mau} subtitle="30 days" color="text-amber-500" />
          </div>
        </div>

        <div className="animate-fade-in-delay-2 space-y-4">
          <p className="text-sm font-bold text-foreground/80 uppercase tracking-widest pl-1 border-l-4 border-indigo-500">Transaction Volume</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <MetricCard title="Total Txns" value={metrics.totalTransactions} color="text-indigo-400" />
            <MetricCard title="Reservations" value={metrics.totalReservations} color="text-teal-400" />
            <MetricCard title="Bookings" value={metrics.totalBookings} color="text-cyan-400" />
            <MetricCard title="Fees Sponsored" value={metrics.totalFeesSponsored} subtitle="Gasless" color="text-rose-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 animate-fade-in-delay-3">
          <MetricCard title="Deposits Locked" value={formatXLM(metrics.totalDepositsLocked)} color="text-amber-500" />
          <MetricCard title="Deposits Refunded" value={formatXLM(metrics.totalDepositsRefunded)} color="text-emerald-500" />
          <MetricCard title="Avg Deposit" value={formatXLM(metrics.averageDeposit)} color="text-primary" />
        </div>

        <div className="grid grid-cols-3 gap-4 sm:gap-6 animate-fade-in-delay-3">
          <MetricCard title="Retention" value={`${metrics.retentionRate}%`} subtitle="Week-over-week" color="text-emerald-500" />
          <MetricCard title="No-Show Rate" value={`${metrics.noShowRate}%`} subtitle="Of completed" color="text-red-500" />
          <MetricCard title="Completion" value={`${(100 - metrics.noShowRate).toFixed(1)}%`} subtitle="Attended" color="text-emerald-500" />
        </div>

        <div className="animate-fade-in-delay-4 space-y-4">
          <p className="text-sm font-bold text-foreground/80 uppercase tracking-widest pl-1 border-l-4 border-teal-500">Trends — Last 15 Days</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-panel border-border/40 shadow-lg hover:shadow-primary/5 transition-all">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Daily Active Users</CardTitle>
              </CardHeader>
              <CardContent><BarChart data={dauData} color="bg-blue-500 shadow-blue-500/50" /></CardContent>
            </Card>
            <Card className="glass-panel border-border/40 shadow-lg hover:shadow-primary/5 transition-all">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Transactions</CardTitle>
              </CardHeader>
              <CardContent><BarChart data={txData} color="bg-indigo-500 shadow-indigo-500/50" /></CardContent>
            </Card>
            <Card className="glass-panel border-border/40 shadow-lg hover:shadow-primary/5 transition-all">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Reservations Created</CardTitle>
              </CardHeader>
              <CardContent><BarChart data={resData} color="bg-teal-500 shadow-teal-500/50" /></CardContent>
            </Card>
            <Card className="glass-panel border-border/40 shadow-lg hover:shadow-primary/5 transition-all">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">No-Shows</CardTitle>
              </CardHeader>
              <CardContent><BarChart data={noShowData} color="bg-red-500 shadow-red-500/50" /></CardContent>
            </Card>
          </div>
        </div>

        <div className="animate-fade-in-delay-4 space-y-4 pb-12">
          <p className="text-sm font-bold text-foreground/80 uppercase tracking-widest pl-1 border-l-4 border-purple-500">Daily Breakdown</p>
          <Card className="glass-panel border-border/40 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/40 border-b border-border/40">
                    <th className="py-4 pl-6 pr-4 whitespace-nowrap">Date</th>
                    <th className="py-4 pr-4">Users</th>
                    <th className="py-4 pr-4">Txns</th>
                    <th className="py-4 pr-4">Created</th>
                    <th className="py-4 pr-4">Booked</th>
                    <th className="py-4 pr-4 text-emerald-500/80">Attended</th>
                    <th className="py-4 pr-4 text-red-500/80">No-Show</th>
                    <th className="py-4 pr-6">Sponsored</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {metrics.dailyMetrics.slice().reverse().map((day, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors group">
                      <td className="py-4 pl-6 pr-4 font-mono text-xs text-muted-foreground font-medium group-hover:text-foreground transition-colors">{day.date}</td>
                      <td className="py-4 pr-4 font-bold text-foreground">{day.activeUsers.length}</td>
                      <td className="py-4 pr-4 font-medium text-foreground/80">{day.transactions}</td>
                      <td className="py-4 pr-4 font-medium text-foreground/80">{day.reservationsCreated}</td>
                      <td className="py-4 pr-4 font-medium text-foreground/80">{day.bookingsMade}</td>
                      <td className="py-4 pr-4 text-emerald-500 font-bold">{day.attendanceConfirmed}</td>
                      <td className="py-4 pr-4 text-red-500 font-bold">{day.noShows}</td>
                      <td className="py-4 pr-6 font-medium text-foreground/80">{day.feesSponsored}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
