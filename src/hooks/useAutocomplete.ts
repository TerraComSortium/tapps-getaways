import { useState } from 'react';
import { searchAutocomplete } from '../services/search/search';

export const useAutocomplete = () => {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await searchAutocomplete(q);
      setData(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching autocomplete');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
};
