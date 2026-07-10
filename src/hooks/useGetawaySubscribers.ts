import { useEffect, useState } from 'react';
import { getGetawaySubscribers } from '../services/getaways/getaways';

export const useGetawaySubscribers = (id: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getGetawaySubscribers(id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching subscribers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  return { data, loading, error, refetch: fetchData };
};
