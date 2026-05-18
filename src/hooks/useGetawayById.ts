import { useEffect, useState } from 'react';
import { getGetawayById } from '../services/getaways/getaways';
import type { Getaway } from '../types/getaway';

export const useGetawayById = (id: string) => {
  const [data, setData] = useState<Getaway | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getGetawayById(id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching getaway');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  return { data, loading, error, refetch: fetchData };
};
