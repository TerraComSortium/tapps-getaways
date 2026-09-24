import { useQuery } from '@tanstack/react-query';
import { getCouponById, getCouponForGetaway, getCoupons, getCouponsForGetaways } from '../services/coupons/coupons';

/**
 * Todas las queries de cupones ('coupon', 'coupons', 'coupons-for-getaways').
 * Tras crear/editar/borrar hay que invalidarlas TODAS: invalidar solo ['coupons']
 * dejaba al formulario de edición y a las tarjetas de getaways con la copia vieja
 * (p.ej. seguían en "$X Off" después de cambiar el cupón a porcentaje).
 */
export const isCouponQuery = (query: { queryKey: readonly unknown[] }) =>
  typeof query.queryKey[0] === 'string' && query.queryKey[0].startsWith('coupon');

// Hook (modo edit)
export function useCouponById(id?: string) { 
  const { data, isLoading, isFetching, isFetchedAfterMount, error } = useQuery({
    queryKey: ['coupon', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await getCouponById(id);
      return res;
    },
    enabled: !!id,
  });

  // Se espera la PRIMERA respuesta tras montar, no solo `isLoading`: con una copia
  // en caché isLoading es false y el formulario se montaba con los valores VIEJOS
  // (useForm los toma una sola vez). Solo la primera: si se esperaran también los
  // refetch, el que dispara el propio guardado desmontaría el formulario y
  // cancelaría la redirección a /coupons.
  return { data, loading: isLoading || (isFetching && !isFetchedAfterMount), error };
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
