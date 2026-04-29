'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { performHealthCheck, getRecentLogs, getLogStats, HealthStatus, LogEntry, LogLevel, seedDemoLogs } from '@/lib/monitoring/logger';
import { RefreshCw, Loader2 } from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; dot: string }> = {
    healthy: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    degraded: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    unhealthy: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  };
  const c = config[status] || { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function LogLevelBadge({ level }: { level: LogLevel }) {
  const colors: Record<LogLevel, string> = {
    debug: 'text-slate-500',
    info: 'text-blue-400',
    warn: 'text-amber-400',
    error: 'text-red-400',
    critical: 'text-red-500 font-bold',
  };
  return <span className={`text-xs font-mono ${colors[level]}`}>{level.toUpperCase().padEnd(8)}</span>;
}

export default function MonitoringPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logStats, setLogStats] = useState<Record<LogLevel, number>>({ debug: 0, info: 0, warn: 0, error: 0, critical: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LogLevel | 'all'>('all');

  const runHealthCheck = async () => {
    setLoading(true);
    const result = await performHealthCheck();
    setHealth(result);
    setLogs(getRecentLogs(undefined, 100));
    setLogStats(getLogStats());
    setLoading(false);
  };

  useEffect(() => {
    seedDemoLogs();
    runHealthCheck();
  }, []);

  const filteredLogs = filter === 'all' ? logs : logs.filter(l => l.level === filter);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Monitoring</h1>
            <p className="text-sm text-slate-500 mt-0.5">System health and log stream</p>
          </div>
          <Button onClick={runHealthCheck} size="sm" variant="outline" disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            {loading ? 'Checking...' : 'Refresh'}
          </Button>
        </div>

        {health && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-delay-1">
            <Card className="border-slate-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center justify-between">
                  Overall Status
                  <StatusBadge status={health.status} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500">Uptime: <span className="font-medium text-slate-700">{Math.floor(health.uptime / 60)}m {health.uptime % 60}s</span></p>
                <p className="text-xs text-slate-400 mt-1">Last checked: {new Date(health.lastChecked).toLocaleTimeString()}</p>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Service Checks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {Object.entries(health.checks).map(([service, ok]) => (
                    <div key={service} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 capitalize">{service.replace(/([A-Z])/g, ' $1')}</span>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${ok ? 'text-emerald-600' : 'text-red-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {ok ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="animate-fade-in-delay-2">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Log Statistics</p>
          <div className="grid grid-cols-5 gap-2">
            {(['debug', 'info', 'warn', 'error', 'critical'] as LogLevel[]).map(level => {
              const isActive = filter === level;
              const styles: Record<LogLevel, { active: string; idle: string }> = {
                debug: { active: 'border-slate-400 bg-slate-50', idle: 'border-slate-100 hover:border-slate-200' },
                info: { active: 'border-blue-400 bg-blue-50', idle: 'border-slate-100 hover:border-blue-200' },
                warn: { active: 'border-amber-400 bg-amber-50', idle: 'border-slate-100 hover:border-amber-200' },
                error: { active: 'border-red-400 bg-red-50', idle: 'border-slate-100 hover:border-red-200' },
                critical: { active: 'border-red-500 bg-red-50', idle: 'border-slate-100 hover:border-red-300' },
              };
              const colorText: Record<LogLevel, string> = {
                debug: 'text-slate-600', info: 'text-blue-600', warn: 'text-amber-600', error: 'text-red-600', critical: 'text-red-700',
              };
              return (
                <button
                  key={level}
                  className={`bg-white rounded-xl border-2 p-3 text-center cursor-pointer transition-all ${isActive ? styles[level].active : styles[level].idle}`}
                  onClick={() => setFilter(isActive ? 'all' : level)}
                >
                  <p className={`text-[10px] uppercase font-medium tracking-wider ${colorText[level]}`}>{level}</p>
                  <p className={`text-xl font-bold mt-0.5 ${colorText[level]}`}>{logStats[level]}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="animate-fade-in-delay-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Log Stream
              {filter !== 'all' && <span className="ml-2 normal-case tracking-normal text-slate-500">filtered: {filter}</span>}
            </p>
            {filter !== 'all' && (
              <button onClick={() => setFilter('all')} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                Clear filter
              </button>
            )}
          </div>
          <Card className="border-slate-100 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-slate-900 rounded-lg p-4 max-h-[420px] overflow-y-auto font-mono text-[11px] leading-relaxed">
                {filteredLogs.length === 0 ? (
                  <p className="text-slate-600 py-8 text-center">No logs to display.</p>
                ) : (
                  filteredLogs.slice().reverse().map((entry, i) => (
                    <div key={i} className="py-1 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 px-1 -mx-1 rounded">
                      <span className="text-slate-600">{new Date(entry.timestamp).toLocaleTimeString()} </span>
                      <LogLevelBadge level={entry.level} />
                      <span className="text-slate-500"> [{entry.source}] </span>
                      <span className="text-slate-300">{entry.message}</span>
                      {entry.context && Object.keys(entry.context).length > 0 && (
                        <span className="text-slate-600"> {JSON.stringify(entry.context)}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
