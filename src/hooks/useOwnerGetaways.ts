import { useQuery } from '@tanstack/react-query';
import { getGetawaysByOwner } from '../services/getaways/getaways';
import { normalizeGetawayData } from '../utils/getawayHelpers';
import type { Getaway } from '../types/getaway';

export const useOwnerGetaways = (enabled: boolean) => {
  const { data, isLoading, error, refetch } = useQuery<Getaway[]>({
    queryKey: ['getaways', 'owner'],
    queryFn: async () => {
      const rawData = await getGetawaysByOwner() as any;
      const dataArray = Array.isArray(rawData)
        ? rawData
        : (rawData.data || rawData.offers || []);
      return dataArray.map(normalizeGetawayData);
    },
    enabled: enabled,
    staleTime: 1000 * 60 * 5,
  });

  //return clean data
  return {
    data: data || [],
    isLoading,
    error,
    refetch
  };
};