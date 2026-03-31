'use client';

import { useState, useEffect, useCallback } from 'react';
import { getOverallMetrics, OverallMetrics, seedDemoMetrics } from '@/lib/metrics/tracker';
import { METRICS_REFRESH_INTERVAL_MS } from '@/lib/constants';

/**
 * Custom hook for accessing metrics data with auto-refresh
 */
export function useMetrics(autoRefresh: boolean = false) {
  const [metrics, setMetrics] = useState<OverallMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    seedDemoMetrics();
    const data = getOverallMetrics();
    setMetrics(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();

    if (autoRefresh) {
      const interval = setInterval(refresh, METRICS_REFRESH_INTERVAL_MS);
      return () => clearInterval(interval);
    }
  }, [refresh, autoRefresh]);

  return { metrics, loading, refresh };
}
