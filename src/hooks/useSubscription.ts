'use client';

import { useState, useEffect, useCallback } from 'react';
import { wordaiAuth } from '@/lib/wordai-firebase';

export interface PointsBalance {
  points_remaining: number;
  points_total: number;
  points_used: number;
}

export function usePointsBalance(options?: { autoRefresh?: boolean; refreshInterval?: number }) {
  const [data, setData] = useState<PointsBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPointsBalance = useCallback(async () => {
    try {
      setIsLoading(true);
      const user = wordaiAuth?.currentUser;
      const token = user ? await user.getIdToken() : null;
      const res = await fetch('https://ai.wordai.pro/api/subscription/points/balance', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        } else if (typeof json.points_remaining === 'number') {
          setData(json);
        }
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPointsBalance();
  }, [fetchPointsBalance]);

  useEffect(() => {
    if (!options?.autoRefresh) return;
    const iv = setInterval(fetchPointsBalance, options?.refreshInterval || 20000);
    return () => clearInterval(iv);
  }, [fetchPointsBalance, options?.autoRefresh, options?.refreshInterval]);

  return { data, isLoading, error, refetch: fetchPointsBalance };
}
