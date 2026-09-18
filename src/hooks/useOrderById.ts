import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/api';

/**
 * Trae una orden por su id. Es la fuente de verdad de la vista de pago: el
 * `location.state` y el localStorage solo sirven para pintar algo al instante,
 * pero pueden ser de OTRA orden o no existir (recarga, otro dispositivo).
 */
export const useOrderById = (orderId?: string) => {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(!!orderId);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/order/${orderId}`);
      setData(response.data?.order ?? null);
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setError(status === 404 ? 'not_found' : status === 403 ? 'forbidden' : 'error');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  return { data, loading, error, refetch: fetchOrder };
};
