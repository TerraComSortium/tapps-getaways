import { useEffect, useState } from 'react';
import { getGetawaysByOwner } from '../services/getaways/getaways';
import type { Getaway } from '../types/getaway';

export const useOwnerGetaways = () => {
  const [data, setData] = useState<Getaway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getGetawaysByOwner();
      setData(Array.isArray(result) ? result : result?.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching owner getaways');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return { data, loading, error, refetch: fetchData };
};
