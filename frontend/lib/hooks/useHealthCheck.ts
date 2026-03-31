'use client';

import { useState, useEffect, useCallback } from 'react';
import { performHealthCheck, HealthStatus } from '@/lib/monitoring/logger';
import { HEALTH_CHECK_INTERVAL_MS } from '@/lib/constants';

/**
 * Custom hook for monitoring system health with periodic checks
 */
export function useHealthCheck(autoCheck: boolean = false) {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    setLoading(true);
    const result = await performHealthCheck();
    setHealth(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    check();

    if (autoCheck) {
      const interval = setInterval(check, HEALTH_CHECK_INTERVAL_MS);
      return () => clearInterval(interval);
    }
  }, [check, autoCheck]);

  return { health, loading, check };
}
