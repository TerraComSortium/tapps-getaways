import { useEffect, useState } from 'react';
import { getSubscribedGetaways } from '../services/getaways/getaways';

export const useSubscribedGetaways = () => {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSubscribedGetaways();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching subscribed getaways');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return { data, loading, error, refetch: fetchData };
};
