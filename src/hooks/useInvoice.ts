import { useState } from 'react';
import { getInvoice } from '../services/invoice/invoice';

export const useInvoice = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = async (orderId: string) => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const blob = await getInvoice(orderId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${orderId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error downloading invoice');
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, download };
};
