import { useState } from 'react';
import { searchFilter } from '../services/search/search';

interface FilterParams {
  sport?: string;
  startDate?: string;
  endDate?: string;
}

export const useFilter = () => {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (params: FilterParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await searchFilter(params);
      setData(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error filtering getaways');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
};
