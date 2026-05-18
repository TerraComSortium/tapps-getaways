import { useEffect, useState } from 'react';
import { getAllGetaways } from '../services/getaways/getaways';
import type { Getaway } from '../types/getaway';

export const useGetAllGetaways = () => {
  const [data, setData] = useState<Getaway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllGetaways();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching getaways');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return { data, loading, error, refetch: fetchData };
};
