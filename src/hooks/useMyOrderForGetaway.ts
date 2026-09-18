import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/api';

export interface MyGetawayOrder {
  id: string;
  orderId: string;
  status: string;
  paymentStatus?: string;
  invoiceNumber?: string;
  paidAt?: string;
  createdAt?: string;
}

/**
 * Orden propia para un getaway, si existe. Permite ofrecer la factura en vez de
 * volver a cobrar algo que ya se pagó.
 */
export const useMyOrderForGetaway = (getawayId?: string, enabled = true) => {
  const [data, setData] = useState<MyGetawayOrder | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!getawayId || !enabled) return;
    setLoading(true);
    try {
      const response = await api.get(`/getaways/${getawayId}/my-order`);
      setData(response.data?.order ?? null);
    } catch {
      // Sin orden o sin permiso: simplemente no hay factura que ofrecer.
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [getawayId, enabled]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const isPaid = data?.status === 'paid' || data?.paymentStatus === 'succeeded';

  return { order: data, isPaid, loading, refetch: fetchOrder };
};
