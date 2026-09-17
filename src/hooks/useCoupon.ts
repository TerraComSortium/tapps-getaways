import { useQuery } from '@tanstack/react-query';
import { getCouponById, getCouponForGetaway, getCoupons, getCouponsForGetaways } from '../services/coupons/coupons';

// Hook (modo edit)
export function useCouponById(id?: string) { 
  const { data, isLoading, error } = useQuery({
    queryKey: ['coupon', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await getCouponById(id);
      return res;
    },
    enabled: !!id,
  });

  return { data, loading: isLoading, error };
}

export function useCouponForGetaway(couponId?: string, getawayId?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['coupon', couponId, getawayId],
    queryFn: async () => {
      if (!couponId || !getawayId) return null;
      return getCouponForGetaway(couponId, getawayId);
    },
    enabled: !!couponId && !!getawayId,
  });

  return { data, loading: isLoading, error };
}

export function useCouponsForGetaways(getawayIds: string[], enabled = true) {
  const idsKey = getawayIds.join(',');
  const { data, isLoading, error } = useQuery({
    queryKey: ['coupons-for-getaways', idsKey],
    queryFn: async () => getCouponsForGetaways(getawayIds),
    enabled: enabled && getawayIds.length > 0,
  });

  return {
    data: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  };
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
