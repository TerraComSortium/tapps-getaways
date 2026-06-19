import { useQuery } from '@tanstack/react-query';
import { getMyOrders, type Order } from '../services/orders/orders';

export const useMyOrders = (enabled: boolean) => {
  const { data, isLoading, error, refetch } = useQuery<Order[]>({
    queryKey: ['orders', 'mine'],
    queryFn: getMyOrders,
    enabled,
    staleTime: 1000 * 60 * 5,
  });

  return {
    data: data || [],
    isLoading,
    error,
    refetch,
  };
};
