import { useEffect, useState } from 'react';
import { getClubData } from '../services/club/club';

export const useClubData = () => {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getClubData();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching club data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return { data, loading, error, refetch: fetchData };
};
