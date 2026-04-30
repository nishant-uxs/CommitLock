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
    <div className="min-h-screen bg-background relative overflow-hidden selection:bg-primary selection:text-primary-foreground text-foreground">
      {/* Background Decorators */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.25]" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full animate-blob mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full animate-blob animation-delay-2000 mix-blend-screen" />
      </div>

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 animate-fade-in">
          <div>
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-4 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-server">
                <rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>
              </svg>
            </div>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight drop-shadow-sm mb-2">System Monitoring</h1>
            <p className="text-lg text-muted-foreground">Track health status and analyze real-time live logs.</p>
          </div>
          <Button onClick={runHealthCheck} size="lg" variant="outline" disabled={loading} className="gap-2 h-14 rounded-2xl border-border/60 hover:bg-muted/50 transition-all font-semibold shadow-sm">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
            {loading ? 'Running Diagnostics...' : 'Refresh Status'}
          </Button>
        </div>

        {health && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-delay-1">
            <Card className="glass-panel border-border/40 shadow-lg hover:shadow-primary/5 transition-all">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                  Overall Status
                  <StatusBadge status={health.status} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-1">
                  <p className="text-3xl font-extrabold tracking-tight text-foreground">{Math.floor(health.uptime / 60)}m {health.uptime % 60}s <span className="text-lg text-muted-foreground font-semibold">uptime</span></p>
                  <p className="text-sm text-muted-foreground font-medium">Last heartbeat: {new Date(health.lastChecked).toLocaleTimeString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel border-border/40 shadow-lg hover:shadow-primary/5 transition-all">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Service Checks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(health.checks).map(([service, ok]) => (
                    <div key={service} className="flex items-center justify-between bg-muted/30 p-3 rounded-xl border border-border/30">
                      <span className="text-sm font-semibold text-foreground tracking-wide capitalize">{service.replace(/([A-Z])/g, ' $1')}</span>
                      <span className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${ok ? 'text-emerald-500' : 'text-red-500'}`}>
                        <span className={`w-2 h-2 rounded-full ${ok ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`} />
                        {ok ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="animate-fade-in-delay-2 space-y-4">
          <p className="text-sm font-bold text-foreground/80 uppercase tracking-widest pl-1 border-l-4 border-primary">Log Distribution</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {(['debug', 'info', 'warn', 'error', 'critical'] as LogLevel[]).map(level => {
              const isActive = filter === level;
              const styles: Record<LogLevel, { active: string; idle: string }> = {
                debug: { active: 'border-slate-500 shadow-slate-500/20 shadow-lg scale-105', idle: 'border-border/40 hover:border-slate-500/50' },
                info: { active: 'border-blue-500 shadow-blue-500/20 shadow-lg scale-105', idle: 'border-border/40 hover:border-blue-500/50' },
                warn: { active: 'border-amber-500 shadow-amber-500/20 shadow-lg scale-105', idle: 'border-border/40 hover:border-amber-500/50' },
                error: { active: 'border-red-500 shadow-red-500/20 shadow-lg scale-105', idle: 'border-border/40 hover:border-red-500/50' },
                critical: { active: 'border-rose-600 shadow-rose-600/20 shadow-lg scale-105 bg-rose-500/10', idle: 'border-border/40 hover:border-rose-500/50' },
              };
              const colorText: Record<LogLevel, string> = {
                debug: 'text-slate-400', info: 'text-blue-500', warn: 'text-amber-500', error: 'text-red-500', critical: 'text-rose-500',
              };
              return (
                <button
                  key={level}
                  className={`glass-panel rounded-2xl border-2 p-5 text-center cursor-pointer transition-all duration-300 group ${isActive ? styles[level].active : styles[level].idle}`}
                  onClick={() => setFilter(isActive ? 'all' : level)}
                >
                  <p className={`text-xs uppercase font-bold tracking-widest mb-1 ${colorText[level]}`}>{level}</p>
                  <p className={`text-3xl font-extrabold tracking-tight ${colorText[level]} drop-shadow-sm`}>{logStats[level]}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="animate-fade-in-delay-3 space-y-4 pb-12">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-foreground/80 uppercase tracking-widest pl-1 border-l-4 border-purple-500">
              Diagnostic Log Stream
              {filter !== 'all' && <span className="ml-3 text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md lowercase tracking-normal">filtered: {filter}</span>}
            </p>
            {filter !== 'all' && (
              <Button onClick={() => setFilter('all')} variant="ghost" size="sm" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                Clear Filters
              </Button>
            )}
          </div>
          <Card className="glass-panel border-border/40 shadow-2xl overflow-hidden rounded-3xl">
            <CardContent className="p-0 bg-[#0f172a] shadow-inner relative">
              <div className="p-6 max-h-[500px] overflow-y-auto font-mono text-[13px] leading-relaxed custom-scrollbar">
                {filteredLogs.length === 0 ? (
                  <p className="text-slate-500 py-12 text-center text-sm">No diagnostic logs found matching current filters.</p>
                ) : (
                  filteredLogs.slice().reverse().map((entry, i) => (
                    <div key={i} className="py-2 px-3 border-b border-slate-800/80 last:border-0 hover:bg-slate-800/50 rounded-lg transition-colors group flex items-start gap-4">
                      <span className="text-slate-500 min-w-[70px] whitespace-nowrap mt-0.5">{new Date(entry.timestamp).toLocaleTimeString([], { hour12: false })}</span>
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                        <LogLevelBadge level={entry.level} />
                        <span className="text-slate-400 font-medium min-w-[120px] shrink-0">[{entry.source}]</span>
                        <div className="flex-1 flex flex-col pr-2">
                          <span className="text-slate-200 group-hover:text-white transition-colors">{entry.message}</span>
                          {entry.context && Object.keys(entry.context).length > 0 && (
                            <span className="text-slate-500 mt-1 text-[11px] break-all bg-slate-900/50 p-2 rounded-md border border-slate-700/30">
                              {JSON.stringify(entry.context)}
                            </span>
                          )}
                        </div>
                      </div>
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
