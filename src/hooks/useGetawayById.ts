import { useEffect, useState, useCallback } from 'react';
import { getGetawayById } from '../services/getaways/getaways';
import type { Getaway } from '../types/getaway';
import { normalizeGetawayData } from '../utils/getawayHelpers';
export const useGetawayById = (id: string) => {
  const [data, setData] = useState<Getaway | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getGetawayById(id);
      const cleanData = normalizeGetawayData(result);
      setData(cleanData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching getaway');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);
  return { data, loading, error, refetch: fetchData };
};