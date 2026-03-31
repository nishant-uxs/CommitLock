'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { performHealthCheck, getRecentLogs, getLogStats, HealthStatus, LogEntry, LogLevel } from '@/lib/monitoring/logger';
import Link from 'next/link';

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    healthy: 'bg-green-100 text-green-800',
    degraded: 'bg-yellow-100 text-yellow-800',
    unhealthy: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
      {status.toUpperCase()}
    </span>
  );
}

function LogLevelBadge({ level }: { level: LogLevel }) {
  const colors: Record<LogLevel, string> = {
    debug: 'text-gray-400',
    info: 'text-blue-500',
    warn: 'text-yellow-500',
    error: 'text-red-500',
    critical: 'text-red-700 font-bold',
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
    runHealthCheck();
  }, []);

  const filteredLogs = filter === 'all' ? logs : logs.filter(l => l.level === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🖥️ Monitoring Dashboard</h1>
            <p className="text-sm text-gray-500">System Health & Logs</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={runHealthCheck} size="sm" disabled={loading}>
              {loading ? 'Checking...' : 'Refresh'}
            </Button>
            <Link href="/metrics"><Button variant="outline" size="sm">Metrics</Button></Link>
            <Link href="/"><Button variant="outline" size="sm">Home</Button></Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Health Status */}
        {health && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">System Health</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    Overall Status
                    <StatusBadge status={health.status} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">Uptime: {Math.floor(health.uptime / 60)}m {health.uptime % 60}s</p>
                  <p className="text-xs text-gray-400 mt-1">Last checked: {new Date(health.lastChecked).toLocaleTimeString()}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Service Checks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(health.checks).map(([service, ok]) => (
                      <div key={service} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{service.replace(/([A-Z])/g, ' $1')}</span>
                        <span className={`text-xs font-medium ${ok ? 'text-green-600' : 'text-red-500'}`}>
                          {ok ? '● Online' : '● Offline'}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Log Statistics */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Log Statistics</h2>
          <div className="grid grid-cols-5 gap-3">
            {(['debug', 'info', 'warn', 'error', 'critical'] as LogLevel[]).map(level => {
              const colors: Record<LogLevel, string> = {
                debug: 'text-gray-600 border-gray-200',
                info: 'text-blue-600 border-blue-200',
                warn: 'text-yellow-600 border-yellow-200',
                error: 'text-red-600 border-red-200',
                critical: 'text-red-800 border-red-300',
              };
              return (
                <Card
                  key={level}
                  className={`cursor-pointer border-2 ${filter === level ? 'border-blue-500' : ''} ${colors[level]}`}
                  onClick={() => setFilter(filter === level ? 'all' : level)}
                >
                  <CardContent className="pt-4 text-center">
                    <p className="text-xs uppercase font-medium">{level}</p>
                    <p className="text-2xl font-bold">{logStats[level]}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Log Stream */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Log Stream {filter !== 'all' && <span className="text-sm font-normal text-gray-500">(filtered: {filter})</span>}
          </h2>
          <Card>
            <CardContent className="pt-4">
              <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-xs">
                {filteredLogs.length === 0 ? (
                  <p className="text-gray-500">No logs to display. Interact with the app to generate logs.</p>
                ) : (
                  filteredLogs.slice().reverse().map((entry, i) => (
                    <div key={i} className="py-0.5 border-b border-gray-800 last:border-0">
                      <span className="text-gray-500">{new Date(entry.timestamp).toLocaleTimeString()} </span>
                      <LogLevelBadge level={entry.level} />
                      <span className="text-gray-400"> [{entry.source}] </span>
                      <span className="text-gray-200">{entry.message}</span>
                      {entry.context && Object.keys(entry.context).length > 0 && (
                        <span className="text-gray-600"> {JSON.stringify(entry.context)}</span>
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
