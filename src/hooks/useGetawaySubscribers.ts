import { useCallback, useEffect, useState } from 'react';
import { getGetawaySubscribers } from '../services/getaways/getaways';
import type { GetawayOrder } from '../types/getaway';

/** Todas las órdenes (pagadas o no) de un getaway. */
export const useGetawaySubscribers = (id: string) => {
  const [data, setData] = useState<GetawayOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getGetawaySubscribers(id);
      // El endpoint devuelve un array; si algún día cambia, no se rompe el .map
      setData(Array.isArray(result) ? result : result?.orders ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching subscribers');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
