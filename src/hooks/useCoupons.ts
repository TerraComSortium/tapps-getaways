import { useEffect, useState } from 'react';
import { getCoupons } from '../services/coupons/coupons';
import type { Discount } from '../types/getaway';

export const useCoupons = () => {
  const [data, setData] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCoupons();
      setData(Array.isArray(result) ? result : result?.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return { data, loading, error, refetch: fetchData };
};
