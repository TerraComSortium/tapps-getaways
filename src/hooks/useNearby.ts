import { useState } from 'react';
import { searchNearby } from '../services/search/search';

interface NearbyParams {
  lat: string;
  lng: string;
  min?: string;
  max?: string;
}

export const useNearby = () => {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (params: NearbyParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await searchNearby(params);
      setData(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching nearby getaways');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
};
