import { useQuery } from '@tanstack/react-query';
import { getGetawaysByOwner } from '../services/getaways/getaways';
import { normalizeGetawayData } from '../utils/getawayHelpers';
import type { Getaway } from '../types/getaway';

export const useOwnerGetaways = (enabled: boolean) => {
  const { data, isLoading, error, refetch } = useQuery<Getaway[]>({
    queryKey: ['getaways', 'owner'],
    queryFn: async () => {
      const rawResponse = await getGetawaysByOwner() as any;
      const first = Array.isArray(rawResponse) ? rawResponse[0] : rawResponse?.offers?.[0];

      if (first) {
        console.table({
          startDate: first.startDate,
          endDate: first.endDate,
          price: first.price,
          typeStart: typeof first.startDate,
          typePrice: typeof first.price,
        });
      }
      console.log("hook's raw response:", rawResponse);
      let cleanArray: any[] = [];
      if(Array.isArray(rawResponse)){
        cleanArray = rawResponse;
      }else if(rawResponse && typeof rawResponse === 'object' ){
        cleanArray = rawResponse.offers || rawResponse.data || rawResponse.data?.offers || [];
      }
      return cleanArray.map(normalizeGetawayData);
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