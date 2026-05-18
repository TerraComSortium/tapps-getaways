import { useEffect, useState } from 'react';
import { getActiveGetaways } from '../services/getaways/getaways';
import type { Getaway } from '../types/getaway';

export const useActiveGetaways = () => {
  const [data, setData] = useState<Getaway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getActiveGetaways();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching active getaways');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return { data, loading, error, refetch: fetchData };
};
