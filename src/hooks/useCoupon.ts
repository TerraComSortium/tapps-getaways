import { useQuery } from '@tanstack/react-query';
import { getCoupon, getCoupons } from '../services/coupons/coupons';

// Hook (modo edit)
export function useCoupon(id?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['coupon', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await getCoupon(id);
      return res;
    },
    enabled: !!id,
  });

  return { data, loading: isLoading, error };
}

// Hook:list coupons (/coupons)
export function useCoupons() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const res = await getCoupons();
      return res.coupons ?? [];
    },
  });

  return {
    data: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  };
}