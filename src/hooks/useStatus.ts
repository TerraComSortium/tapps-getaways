import { useEffect, useState } from 'react';
import { getStatus } from '../services/authentication/status';

export const useStatus = () => {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getStatus();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return { data, loading, error, refetch: fetchData };
};
